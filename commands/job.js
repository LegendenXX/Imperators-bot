const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const jobsConfig = require('../jobsConfig.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jobs')
        .setDescription('Übersicht aller Berufe'),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setTitle('💼 Job-Zentrum')
            .setColor(0x3498db)
            .setDescription('Wähle einen Job aus dem Menü unten.');

        const menu = new StringSelectMenuBuilder()
            .setCustomId('select-job')
            .setPlaceholder('💼 Wähle deinen Job');

        for (const [id, data] of Object.entries(jobsConfig)) {

            embed.addFields({
                name: data.name,
                value: `💰 ${data.lohn}€ | 📈 Level ${data.req}`,
                inline: true
            });

            menu.addOptions({
                label: data.name,
                description: `Lohn: ${data.lohn}€ | Level: ${data.req}`,
                value: id
            });
        }

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: true
        });
    }
};