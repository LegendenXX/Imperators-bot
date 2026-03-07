// interactionCreate.js
const { jobs, jobChangeCost } = require('./jobsConfig.js');
const db = require('../db.js');
const { EmbedBuilder } = require('discord.js');

const careerStartLevels = {
  Bäcker: 'Bäcker Lehrling',
  Arzt: 'Studierender Arzt',
  Programmierer: 'Studierender Programmierer',
  Lehrer: 'Studierender Lehrer',
  Künstler: 'Studierender Künstler',
  Mechaniker: 'Mechaniker Lehrling',
  Koch: 'Koch Lehrling',
  Elektriker: 'Elektriker Lehrling',
  Sanitär: 'Sanitär Lehrling',
  Schreiner: 'Schreiner Lehrling',
  Metalbau: 'Metalbau Lehrling'
};

module.exports = (client) => {
  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith('select-job')) return;

    try {
      const guildId = String(interaction.guild.id);
      const userId = String(interaction.user.id);
      const userData = db.getUser(guildId, userId, interaction.user.bot, interaction.user.username);

      const selectedJobName = interaction.values[0];
      const selectedJob = Object.values(jobs).find(j => j.name === selectedJobName);

      if (!selectedJob) {
        return interaction.reply({ content: "❌ Job existiert nicht.", ephemeral: true });
      }

      if ((userData.xp || 0) < selectedJob.req) {
        return interaction.reply({ content: `❌ Du brauchst ${selectedJob.req} XP für diesen Job.`, ephemeral: true });
      }

      const isFirstJob = userData.job === "Arbeitslos";
      if (!isFirstJob && userData.bank < jobChangeCost) {
        return interaction.reply({ content: `❌ Jobwechsel kostet ${jobChangeCost}€ (Bank)`, ephemeral: true });
      }

      if (!isFirstJob) userData.bank -= jobChangeCost;

      if (isFirstJob || userData.jobLevelReset) {
        const careerBaseName = selectedJob.name.split(' ')[0];
        userData.job = careerStartLevels[careerBaseName] || selectedJob.name;
      } else {
        userData.job = selectedJob.name;
      }

      db.save();

      const embed = new EmbedBuilder()
        .setTitle("💼 Jobwechsel erfolgreich")
        .setDescription(`Du arbeitest jetzt als **${userData.job}**`)
        .addFields(
          { name: "💰 Lohn", value: `${selectedJob.lohn}€`, inline: true },
          { name: "⭐ XP benötigt", value: `${selectedJob.req}`, inline: true },
          { name: "📊 Level", value: `${userData.level || 1}`, inline: true },
          { name: "🏦 Bank", value: `${userData.bank}€`, inline: true }
        )
        .setColor("#2ecc71");

      // ✅ Wichtig: Interaction antworten oder bearbeiten
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed] });
      } else {
        await interaction.reply({ embeds: [embed] });
      }

    } catch (err) {
      console.error("❌ Job-Auswahl Fehler:", err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ content: "❌ Fehler beim Jobwechsel.", ephemeral: true });
        } else {
          await interaction.editReply({ content: "❌ Fehler beim Jobwechsel." });
        }
      } catch {}
    }
  });
};