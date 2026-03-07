const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

function buildBankEmbed(user, lastTx, footerText = null) {

  const embed = new EmbedBuilder()
    .setTitle('🏦 Bankkonto')
    .setColor(0x00ffcc)
    .setDescription(
      `💵 **Bar:** ${user.balance.toLocaleString('de-DE')} €\n` +
      `🏦 **Bank:** ${user.bank.toLocaleString('de-DE')} €\n\n` +
      `📌 **Letzte Transaktion:**\n${
        lastTx
          ? `${lastTx.type.toUpperCase()} ${lastTx.amount.toLocaleString('de-DE')} €`
          : 'Keine Transaktion'
      }\n\n` +
      `🧰 **Job:** ${user.job || 'Arbeitslos'}`
    );

  if (footerText) embed.setFooter({ text: footerText });

  return embed;
}

module.exports = {

  data: new SlashCommandBuilder()
    .setName('bank')
    .setDescription('Zeigt dein Bankkonto'),

  async execute(interaction, db, transactionLog) {

    const guildId = interaction.guildId;
    const userId = interaction.user.id;

    const user = db.getUser(guildId, userId, false, interaction.user.username);

    const lastTx = transactionLog.getLastTransaction(guildId, userId);

    const embed = buildBankEmbed(user, lastTx);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('bank_deposit')
        .setLabel('💰 Einzahlen')
        .setStyle(ButtonStyle.Success),

      new ButtonBuilder()
        .setCustomId('bank_withdraw')
        .setLabel('🏧 Abheben')
        .setStyle(ButtonStyle.Primary)
    );

    return {
      embeds: [embed],
      components: [row]
      
    };

  },

};