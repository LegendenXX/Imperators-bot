// commands/work.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const jobsConfig = require('../helpers/jobsConfig.js');

const dbPath = path.join(__dirname, '../database.json');
const marketPath = path.join(__dirname, '../market.json');
const COOLDOWN = 8 * 60 * 60 * 1000; // 8 Stunden

// Random Nachrichten für Jobs
const randomMessages = {
  Baecker: ["Du hast ein frisches Brot gebacken 🍞", "Die Brötchen sind goldbraun 🥐", "Frisches Gebäck liegt bereit 😋"],
  Programmierer: ["Du hast einen Bug gefixt 💻", "Code läuft fehlerfrei 🚀", "Ein neues Feature deployed 🎉"],
  Lehrer: ["Du hast Mathe unterrichtet 📚", "Die Schüler lernen viel ✏️", "Spannende Unterrichtsstunde 🎓"],
  Arzt: ["Patient erfolgreich behandelt 🩺", "Operation erfolgreich 🏥", "Leben gerettet ❤️"],
  Künstler: ["Kunstwerk erschaffen 🎨", "Ausstellung erfolgreich 🖌️", "Inspiration gefunden 🌟"],
  Mechaniker: ["Auto repariert 🔧", "Motor läuft perfekt 🚗", "Getriebe instand gesetzt 🛠️"],
  Koch: ["Köstliches Gericht zubereitet 🍲", "Gäste sind begeistert 😋", "Küche perfekt organisiert 👨‍🍳"],
  Elektriker: ["Stromversorgung repariert ⚡", "Verkabelung sicher 🔌", "Elektrisches Problem gelöst 💡"]
};

function getRandomMessage(jobKey) {
  const msgs = randomMessages[jobKey] || ["Du hast deine Arbeit erledigt ✅"];
  return msgs[Math.floor(Math.random() * msgs.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Schicht beginnen und Gehalt verdienen'),

  async execute(interaction, db, transactionLog) {
    const database = db || JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const market = JSON.parse(fs.readFileSync(marketPath, 'utf8'));
    const userId = interaction.user.id;
    const user = database[userId];

    if (!user?.job || !jobsConfig.jobExists(user.job)) {
      return { content: "Wähle erst einen Job mit `/jobs`!", ephemeral: true };
    }

    // Cooldown prüfen
    const now = Date.now();
    const lastWork = user.lastWork || 0;
    if (now - lastWork < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastWork);
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      return { content: `⏱ Du bist zu müde! Warte ${h}h ${m}m`, ephemeral: true };
    }

    const jobData = jobsConfig.getJob(user.job);
    let multiplier = market.index || 1;
    if (jobData.type === 'legal' && multiplier < 0.7) multiplier = 0.7;

    // Streak berechnen
    let streak = user.workStreak || 0;
    if (now - lastWork > COOLDOWN * 2) streak = 1;
    else streak += 1;

    // Bonus
    let bonus = 1;
    if (streak >= 5) bonus += 0.5;
    if (streak >= 10) bonus += 0.5;
    if (streak >= 20) bonus += 0.5;
    if (streak >= 40) bonus += 0.5;
    if (bonus > 3) bonus = 3;

    const earnings = Math.floor(jobData.lohn * multiplier * bonus);
    const xpGained = jobData.xp;

    // Bank & XP aktualisieren
    user.bank = (user.bank || 0) + earnings;
    user.xp = (user.xp || 0) + xpGained;
    const oldLevel = user.level || 1;
    user.level = Math.floor(user.xp / 1500) + 1;
    user.lastWork = now;
    user.workStreak = streak;

    fs.writeFileSync(dbPath, JSON.stringify(database, null, 2));

    // Embed erstellen
    const embed = new EmbedBuilder()
      .setTitle(`🏢 Einsatzbericht: ${jobData.name}`)
      .setDescription(`${getRandomMessage(jobData.name)}\n\n🧰 Job: ${jobData.name}`)
      .setColor(jobData.type === 'legal' ? 0x3498db : 0xe74c3c)
      .addFields(
        { name: '💰 Bank', value: `${user.bank.toLocaleString('de-DE')} € (+${earnings.toLocaleString('de-DE')} €)`, inline: true },
        { name: '⭐ Erfahrung', value: `+${xpGained} XP`, inline: true },
        { name: '📈 Streak-Bonus', value: `x${bonus}`, inline: true },
        { name: '📊 Level', value: `${user.level}`, inline: true }
      )
      .setFooter({ text: `Streak: ${streak} | Gesamt-XP: ${user.xp}` });

    const content = user.level > oldLevel ? `🎉 Du bist Level ${user.level} aufgestiegen!` : null;

    return { embeds: [embed], content, ephemeral: false };
  }
};