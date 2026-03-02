const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jobs')
        .setDescription('Übersicht aller Berufe'),
    async execute(interaction) {
        const jobs = JSON.parse(fs.readFileSync('./jobdb.json', 'utf8'));
        const embed = new EmbedBuilder()
            .setTitle('💼 Job-Zentrum')
            .setColor(0x3498db);

        for (const [id, data] of Object.entries(jobs)) {
            embed.addFields({ name: data.name, value: `Lohn: ${data.lohn}€ | ID: \`${id}\`` });
        }

        await interaction.reply({ embeds: [embed] });
    }
};