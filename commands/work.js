const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const jobs = require('../jobsConfig.json');

module.exports = {
    data: new SlashCommandBuilder().setName('work').setDescription('Schicht beginnen'),
    async execute(interaction) {
        let db = JSON.parse(fs.readFileSync('./database.json', 'utf8'));
        const market = JSON.parse(fs.readFileSync('./market.json', 'utf8'));
        const user = db[interaction.user.id];

        if (!user?.aktuellerJob) return interaction.reply({ content: "Wähle erst einen Job mit `/job`!", ephemeral: true });

        // 8h Cooldown Logik
        const COOLDOWN = 8 * 60 * 60 * 1000;
        if (Date.now() - (user.lastWork || 0) < COOLDOWN) return interaction.reply("Du bist zu müde!");

        const job = jobs[user.aktuellerJob];
        
        // Berechnung: Legale Jobs sind stabiler (min 0.7x), illegale Jobs riskant.
        let multiplier = market.index;
        if (job.type === 'legal' && multiplier < 0.7) multiplier = 0.7;

        const verdienst = Math.floor(job.lohn * multiplier);
        const xpGewinn = job.xp;

        // Daten speichern
        user.balance += verdienst;
        user.xp = (user.xp || 0) + xpGewinn;
        user.level = Math.floor(user.xp / 1500); // Alle 1500 XP ein Level
        user.lastWork = Date.now();

        fs.writeFileSync('./database.json', JSON.stringify(db, null, 2));

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
    }
};