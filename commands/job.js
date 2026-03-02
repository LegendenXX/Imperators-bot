// commands/jobs.js
const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, MessageFlags } = require('discord.js');
const jobs = require('../jobsConfig.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('Jobs')
        .setDescription('alle verfügbaren Jobs'),

    async execute(interaction) {
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
    }
};