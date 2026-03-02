const { MessageFlags } = require('discord.js');

/**
 * Zentrale Funktion für Slash Commands
 * 
 * Fängt ALLE Fehler ab und lässt NIEMALS einen Fehler zum Bot durchdringen.
 * Der Bot bleibt immer stabil, egal was passiert.
 *
 * @param {CommandInteraction} interaction
 * @param {Object} db
 * @param {Object|null} transactionLog
 * @param {Function} callback  async (interaction, db, transactionLog) => result
 *
 * result = {
 *   embeds?: [],
 *   content?: string,
 *   components?: [],
 *   ephemeral?: boolean
 * }
 */
async function handleInteraction(interaction, db, transactionLog, callback) {
  try {
    // 🛡️ Harte Absicherung
    if (typeof callback !== 'function') {
      console.error(`❌ handleInteraction: callback ist keine Funktion (${typeof callback})`);
      return safeErrorReply(interaction, '❌ Interner Fehler: Command konnte nicht ausgeführt werden.');
    }

    // ⏳ Nur EINMAL deferReply – mit Timeout-Schutz
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.deferReply();
      } catch (deferErr) {
        console.error('⚠️ deferReply fehlgeschlagen:', deferErr.message);
        // Interaction ist möglicherweise abgelaufen – nichts mehr tun
        return;
      }
    }

    // ▶️ Command ausführen mit Timeout-Schutz (3 Minuten max)
    let result;
    try {
      result = await Promise.race([
        callback(interaction, db, transactionLog),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Command Timeout (3min)')), 180_000)
        ),
      ]);
    } catch (cmdErr) {
      console.error(`❌ Command-Fehler (${interaction.commandName}):`, cmdErr.message || cmdErr);
      return safeErrorReply(interaction, `❌ Fehler beim Ausführen von \`/${interaction.commandName}\`: ${cmdErr.message || 'Unbekannter Fehler'}`);
    }

    // Command hat selbst geantwortet
    if (!result) return;

    const options = {};

    if (result.content) options.content = result.content;
    if (result.embeds) options.embeds = result.embeds;
    if (result.components) options.components = result.components;

    // ✅ Ephemeral-Flag setzen (nach deferReply nur eingeschränkt möglich)
    if (result.ephemeral === true) {
      options.flags = MessageFlags.Ephemeral;
    }

    // ✏️ Antwort bearbeiten
    try {
      await interaction.editReply(options);
    } catch (editErr) {
      console.error('⚠️ editReply fehlgeschlagen:', editErr.message);
    }

  } catch (err) {
    // 🛡️ Äußerer Catch – Letzte Verteidigung, verhindert Bot-Crash
    console.error('❌ Schwerer Interaktionsfehler (gefangen, Bot läuft weiter):', err);
    await safeErrorReply(interaction, '❌ Ein unerwarteter Fehler ist aufgetreten.');
  }
}

/**
 * Sicher eine Fehlermeldung an den User senden.
 * Fängt alle möglichen Fehler ab und lässt NIE etwas durchdringen.
 */
async function safeErrorReply(interaction, message) {
  try {
    const errorMessage = {
      content: message,
      flags: MessageFlags.Ephemeral,
    };

    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply(errorMessage);
    } else if (interaction.deferred && !interaction.replied) {
      await interaction.editReply(errorMessage);
    } else {
      await interaction.followUp(errorMessage);
    }
  } catch (sendErr) {
    // Letzter Catch – nur loggen, NIEMALS werfen
    console.error('⚠️ Konnte Fehlermeldung nicht senden (Interaction abgelaufen?):', sendErr.message);
  }
}

module.exports = { handleInteraction };
