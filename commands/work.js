// commands/work.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const jobs = require('../jobsConfig.js');

module.exports = {
    data: new SlashCommandBuilder().setName('work').setDescription('Schicht beginnen'),

    async execute(interaction) {
        try {
            const dbPath = path.join(__dirname, '../database.json');
            const marketPath = path.join(__dirname, '../market.json');

            let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
            const market = JSON.parse(fs.readFileSync(marketPath, 'utf8'));
            const user = db[interaction.user.id];

            if (!user?.aktuellerJob) {
                return interaction.reply({ content: "Wähle erst einen Job mit `/jobs`!", ephemeral: true });
            }

            const COOLDOWN = 8 * 60 * 60 * 1000;
            if (Date.now() - (user.lastWork || 0) < COOLDOWN) {
                return interaction.reply({ content: "Du bist zu müde!", ephemeral: true });
            }

            const job = jobs[user.aktuellerJob];
            let multiplier = market.index;
            if (job.type === 'legal' && multiplier < 0.7) multiplier = 0.7;

            const verdienst = Math.floor(job.lohn * multiplier);
            const xpGewinn = job.xp;

            // User-Daten aktualisieren
            user.balance += verdienst;
            user.xp = (user.xp || 0) + xpGewinn;
            user.level = Math.floor(user.xp / 1500);
            user.lastWork = Date.now();

            fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

            const embed = new EmbedBuilder()
                .setTitle(`🏢 Einsatzbericht: ${job.name}`)
                .setColor(job.type === 'legal' ? 0x3498db : 0xe74c3c)
                .addFields(
                    { name: 'Einkommen', value: `\`${verdienst} Credits\``, inline: true },
                    { name: 'Erfahrung', value: `\`+${xpGewinn} XP\``, inline: true },
                    { name: 'Wirtschaftslage', value: `\`${multiplier}x\``, inline: true }
                )
                .setFooter({ text: `Level: ${user.level} | Gesamt-XP: ${user.xp}` });

            await interaction.reply({ embeds: [embed] });

        } catch (err) {
            console.error('Work Command Fehler:', err);
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({ content: '❌ Fehler beim Ausführen des Jobs.', ephemeral: true });
            } else {
                await interaction.followUp({ content: '❌ Fehler beim Ausführen des Jobs.', ephemeral: true });
            }
        }
    }
};