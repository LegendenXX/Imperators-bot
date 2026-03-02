const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder().setName('boerse').setDescription('Aktuelle Kurse einsehen'),
    async execute(interaction) {
        const market = JSON.parse(fs.readFileSync('./market.json', 'utf8'));
        
        const embed = new EmbedBuilder()
            .setTitle('🏛️ Finanzzentrum der Unterwelt')
            .setColor(0x2f3136)
            .setDescription(`Der aktuelle Markt-Index bestimmt deine Löhne.\n\n**Index:** \`${market.index}x\`\n**Trend:** ${market.trend}`)
            .addFields({ name: 'Verlauf (letzte 5h)', value: market.historie.map(v => `\`${v}\``).join(' → ') })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};