const { EmbedBuilder, MessageFlags } = require('discord.js');
const jobs = require('../jobsConfig.json');

module.exports = (client) => {

    client.on('interactionCreate', async (interaction) => {

        // ❗ Nur Select-Menüs behandeln
        if (!interaction.isStringSelectMenu()) return;

        // ❗ Nur unser Job-Menü
        if (interaction.customId !== 'select-job') return;

        try {
            const selectedJob = interaction.values[0];
            const jobData = jobs[selectedJob];

            if (!jobData) {
                // Ephemeral Nachricht bei Fehler
                return interaction.reply({
                    content: '❌ Job nicht gefunden.',
                    flags: MessageFlags.Ephemeral
                });
            }

            const embed = new EmbedBuilder()
                .setTitle(`💼 ${jobData.name}`)
                .setColor(0x2ecc71)
                .addFields(
                    { name: '💰 Lohn', value: `${jobData.lohn}€`, inline: true },
                    { name: '⭐ XP', value: `${jobData.xp}`, inline: true },
                    { name: '📈 Benötigtes Level', value: `${jobData.req}`, inline: true },
                    { name: '⚖️ Typ', value: jobData.type, inline: true }
                );

            // ❗ Reply statt update, damit ephemeral funktioniert
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    embeds: [embed],
                    components: [], // Menü entfernen
                    flags: MessageFlags.Ephemeral
                });
            } else {
                // Falls schon geupdatet, nutze followUp
                await interaction.followUp({
                    embeds: [embed],
                    components: [],
                    flags: MessageFlags.Ephemeral
                });
            }

        } catch (err) {
            console.error('Job Select Fehler:', err);

            // ❗ Reply nur, wenn noch keine Antwort erfolgt ist
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Fehler beim Verarbeiten der Auswahl.',
                    flags: MessageFlags.Ephemeral
                });
            } else {
                await interaction.followUp({
                    content: '❌ Fehler beim Verarbeiten der Auswahl.',
                    flags: MessageFlags.Ephemeral
                });
            }
        }

    });

};