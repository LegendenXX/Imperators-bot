// commands/jobs.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const jobs = require('../jobsConfig.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('jobs')
        .setDescription('Zeige alle verfügbaren Jobs'),

    async execute(interaction) {
        try {
            const menu = new StringSelectMenuBuilder()
                .setCustomId('select-job')
                .setPlaceholder('Wähle einen Job aus...')
                .addOptions(
                    Object.keys(jobs).map(jobKey => ({
                        label: jobs[jobKey].name,
                        value: jobKey,
                        description: `Lohn: ${jobs[jobKey].lohn}€ | Typ: ${jobs[jobKey].type}`
                    }))
                );

            const row = new ActionRowBuilder().addComponents(menu);

            await interaction.reply({
                content: 'Bitte wähle einen Job aus:',
                components: [row],
                flags: MessageFlags.Ephemeral
            });

        } catch (err) {
            console.error('Jobs Command Fehler:', err);

            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Fehler beim Laden der Jobs.',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.followUp({
                    content: '❌ Fehler beim Laden der Jobs.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }
    }
};