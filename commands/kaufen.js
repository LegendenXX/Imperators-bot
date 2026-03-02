const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

const {
  ALIASES,
  PAIRS,
  getBundleDisplay,
  getMentionWithAlias
} = require('../helpers/aliases');

const {
  sendStageState
} = require('../helpers/auctionPhases');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kaufen')
    .setDescription('Starte einen Kauf um einen Nutzer zu kaufen.')
    .addUserOption(option =>
      option.setName('ziel')
            .setDescription('Der zu kaufende Nutzer')
            .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('preis')
            .setDescription('Startpreis des Kaufs')
            .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('als')
            .setDescription('Als was du den Nutzer kaufst')
            .setRequired(true)
    ),

  async execute(interaction, db) {
    return new Promise(async resolve => {
      const guildId = interaction.guildId;

      const initiator = db.getUser(guildId, interaction.user.id, false, interaction.user.username);
      const targetUser = interaction.options.getUser('ziel');
      const startPrice = interaction.options.getInteger('preis');
      const role = interaction.options.getString('als');

      if (!initiator)
        return resolve({ content: '❌ Fehler: Dein Benutzer konnte nicht geladen werden.', flags: MessageFlags.Ephemeral });
      if (!targetUser)
        return resolve({ content: '❌ Zielbenutzer nicht gefunden.', flags: MessageFlags.Ephemeral });
      if (targetUser.bot)
        return resolve({ content: '❌ Bots können nicht gekauft werden.', flags: MessageFlags.Ephemeral });
      if (interaction.user.id === targetUser.id)
        return resolve({ content: '❌ Du kannst dich nicht selbst kaufen!', flags: MessageFlags.Ephemeral });
      if (startPrice > initiator.balance)
        return resolve({ content: '❌ Du hast nicht genug Geld!', flags: MessageFlags.Ephemeral });

      const displayName = getBundleDisplay(targetUser, interaction.client);

      let currentPrice = startPrice;
      let currentStage = 1;
      let currentWinner = interaction.user.id;
      let auctionEnded = false;
      let countdownInterval;

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('bieten').setLabel('💸 Bieten').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('abbrechen').setLabel('❌ Abbrechen').setStyle(ButtonStyle.Danger)
      );

      const embed = new EmbedBuilder()
        .setTitle(`🏦 Kauf gestartet: ${interaction.user.username}`)
        .setDescription(
          `🏛 **Kauft** ${displayName}\n` +
          `🧾 **Als:** ${role}\n` +
          `💰 **Startpreis:** ${startPrice} 💰\n` +
          `📈 **Aktuelles Gebot:** ${currentPrice} 💰\n` +
          `👑 **Führend:** ${getMentionWithAlias(currentWinner)}`
        )
        .setColor('Gold');

      const message = await interaction.editReply({ embeds: [embed], components: [row], fetchReply: true });

      function getDuration(stage) {
        return stage < 4 ? 30 : 15;
      }

      async function loopStage() {
        if (auctionEnded) return;
        let seconds = getDuration(currentStage);

        await sendStageState({ message, role, currentPrice, currentWinner, getMentionWithAlias, row, stage: currentStage, seconds });

        countdownInterval = setInterval(async () => {
          if (auctionEnded) return clearInterval(countdownInterval);

          seconds--;
          if (seconds <= 0) {
            clearInterval(countdownInterval);
            if (currentStage < 4) {
              currentStage++;
              return loopStage();
            }
            return endAuction();
          }

          await sendStageState({ message, role, currentPrice, currentWinner, getMentionWithAlias, row, stage: currentStage, seconds });
        }, 1000);
      }

      async function endAuction() {
        if (auctionEnded) return;
        auctionEnded = true;
        clearInterval(countdownInterval);

        const winner = db.getUser(guildId, currentWinner);

        if (!winner || winner.balance < currentPrice) {
          const failEmbed = new EmbedBuilder()
            .setTitle('❌ Auktion ungültig')
            .setDescription(`${getMentionWithAlias(currentWinner)} hat nicht genug Geld.`)
            .setColor('Red');
          try {
            await message.edit({ embeds: [failEmbed], components: [] });
          } catch (e) {
            console.warn('⚠️ Konnte Auktions-Embed nicht editieren:', e.message);
          }
          resolve();
          return;
        }

        // addOwnership zieht bereits den Preis ab – KEIN zusätzliches updateBalance!
        const success = db.addOwnership(guildId, currentWinner, targetUser.id, currentPrice, role);

        if (!success) {
          const failEmbed = new EmbedBuilder()
            .setTitle('❌ Kauf fehlgeschlagen')
            .setDescription('Der Kauf konnte nicht abgeschlossen werden.')
            .setColor('Red');
          try {
            await message.edit({ embeds: [failEmbed], components: [] });
          } catch (e) {
            console.warn('⚠️ Konnte Auktions-Embed nicht editieren:', e.message);
          }
          resolve();
          return;
        }

        // Pair-Nutzer nur Besitz setzen, NICHT nochmal Geld abziehen
        if (PAIRS[targetUser.id]) {
          db.setOwner(guildId, currentWinner, PAIRS[targetUser.id], role);
        }

        const finalEmbed = new EmbedBuilder()
          .setTitle('🏁 Auktion beendet!')
          .setDescription(`🎉 **${getMentionWithAlias(currentWinner)}** hat **${targetUser}** als **${role}** gekauft!\n💰 **Preis:** ${currentPrice} 💰`)
          .setColor('Green');

        try {
          await message.edit({ embeds: [finalEmbed], components: [] });
        } catch (e) {
          console.warn('⚠️ Konnte Auktions-Embed nicht editieren:', e.message);
        }
        resolve();
      }

      loopStage();

      const collector = message.createMessageComponentCollector({});

      collector.on('collect', async i => {
        if (auctionEnded) {
          try { await i.deferUpdate(); } catch (_) {}
          return;
        }

        if (i.customId === 'bieten') {
          const bidder = db.getUser(guildId, i.user.id, false, i.user.username);
          const bidAmount = currentPrice + 100;

          if (!bidder || bidAmount > bidder.balance) {
            return i.reply({ content: '❌ Du hast nicht genug Geld!', flags: MessageFlags.Ephemeral });
          }

          currentPrice = bidAmount;
          currentWinner = i.user.id;
          currentStage = 1;
          clearInterval(countdownInterval);
          await i.deferUpdate();
          // Phasen neu starten nach Gebot
          loopStage();
        }

        if (i.customId === 'abbrechen' && i.user.id === interaction.user.id) {
          auctionEnded = true;
          clearInterval(countdownInterval);
          await i.deferUpdate();
          collector.stop('abgebrochen');
        }
      });

      collector.on('end', async (_, reason) => {
        if (reason === 'abgebrochen') {
          const cancelEmbed = new EmbedBuilder()
            .setTitle('❌ Auktion abgebrochen')
            .setDescription('Die Auktion wurde vom Verkäufer abgebrochen.')
            .setColor('Red');
          try {
            await message.edit({ embeds: [cancelEmbed], components: [] });
          } catch (e) {
            console.warn('⚠️ Konnte Abbruch-Embed nicht editieren:', e.message);
          }
          resolve();
          return;
        }

        if (!auctionEnded) return endAuction();
      });
    });
  }
};
