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
                    ephemeral: true
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

            // ❗ Update Menü, ephemeral geht hier nicht, daher reply
            await interaction.update({
                embeds: [embed],
                components: [] // Dropdown entfernen
            });

        } catch (err) {
            console.error('Job Select Fehler:', err);

            // ❗ Reply nur, wenn noch keine Antwort erfolgt ist
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: '❌ Fehler beim Verarbeiten der Auswahl.',
                    ephemeral: true
                });
            }
        }

    });

};