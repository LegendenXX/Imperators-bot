// commands/jobs.js
const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');

const db = require('../db.js');
const { jobs, jobChangeCost } = require('../helpers/jobsConfig.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('jobs')
    .setDescription('Alle verfügbaren Hauptjobs anzeigen und auswählen'),

  async execute(interaction) {

    const guildId = String(interaction.guildId);
    const userId = String(interaction.user.id);
    const username = interaction.user.username;

    if (!guildId) {
      return { content: '❌ Fehler: `/jobs` kann nur auf Servern verwendet werden.', ephemeral: true };
    }

    // User laden
    const userData = db.getUser(guildId, userId, interaction.user.bot, username);

    const currentJob = userData.job || 'Arbeitslos';
    const userXP = userData.xp || 0;

    // Nur Startjobs anzeigen (Lehrling / Studierender)
    const mainJobs = Object.entries(jobs).filter(([key, job]) =>
      job.name.includes("Lehrling") || job.name.includes("Studierender")
    );

    if (mainJobs.length === 0) {
      return { content: '⚠️ Es sind keine Hauptjobs verfügbar.', ephemeral: true };
    }

    // Dropdown Optionen
    const options = mainJobs.map(([key, job]) => ({
      label: job.name,
      value: key, // WICHTIG: Key statt Name
      description: `Lohn: ${job.lohn}€ | ${
        userXP >= job.req ? `Job verfügbar` : `Benötigt ${job.req} XP`
      }`.slice(0, 100),
    }));

    const menu = new StringSelectMenuBuilder()
      .setCustomId('select-job')
      .setPlaceholder('Wähle einen Job aus...')
      .addOptions(options);

    const row = new ActionRowBuilder().addComponents(menu);

    const embed = new EmbedBuilder()
      .setTitle(']———————💼 Verfügbare Hauptjobs———————[')
      .setDescription(
        `⋘—————⊣📌 Wähle einen Job aus dem Menü!⊢—————⋙\n\n` +
        `⁛⁝⁛⁝⁛⁝⁛⁝⁛⁝⁛⁝🧰» Dein aktueller Job: ${currentJob}⁝⁛⁝⁛⁝⁛⁝⁛⁝⁛⁝\n\n` +
        `⁝⁛⁝⁛⁝⁛⁝⁛⁝⁛⁝⁛⁝⁛⁝⭐ XP: ${userXP}⁝⁛⁝⁝⁛⁝⁝⁛⁝⁛⁝|⁝⁛⁝⁛⁝⁝⁛⁝⁝⁛⁝Level: ${userData.level || 1}⁝⁛⁝⁛⁝⁛⁝⁛⁝⁛⁝⁛⁝`
      )
      .setColor('#5865F2');

    return {
      embeds: [embed],
      components: [row],
      ephemeral: false,
    };
  },
};