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
        lastTx ? `${lastTx.type.toUpperCase()} ${lastTx.amount.toLocaleString('de-DE')} €` : 'Keine Transaktion'
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
    const user = db.getUser(guildId, interaction.user.id, false, interaction.user.username);
    const lastTx = transactionLog.getLastTransaction(guildId, user.id);

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

    await interaction.editReply({ embeds: [embed], components: [row] });
  },

};
