// helpers/interactionHandler.js
const { MessageFlags } = require('discord.js');

/**
 * Zentrale Funktion für Slash Commands
 */
async function handleInteraction(interaction, db, transactionLog, callback) {
  try {
    if (typeof callback !== 'function') {
      console.error(`❌ handleInteraction: callback ist keine Funktion`);
      return safeErrorReply(interaction, '❌ Interner Fehler: Command konnte nicht ausgeführt werden.');
    }

    // ▶️ Command ausführen mit Timeout (3 Minuten max)
    let result;
    try {
      result = await Promise.race([
        callback(interaction, db, transactionLog),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Command Timeout (3min)')), 180_000)
        ),
      ]);
    } catch (cmdErr) {
      console.error(`❌ Command-Fehler (${interaction.commandName}):`, cmdErr);
      return safeErrorReply(
        interaction,
        `❌ Fehler beim Ausführen von \`/${interaction.commandName}\`: ${cmdErr.message || 'Unbekannter Fehler'}`
      );
    }

    if (!result) return;

    const ephemeral = result.ephemeral || false; // ✅ Hier wird nun korrekt gelesen

    // ⏳ DeferReply nur, wenn noch nicht gesendet
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.deferReply({ ephemeral });
      } catch (deferErr) {
        console.error('⚠️ deferReply fehlgeschlagen:', deferErr.message);
        return;
      }
    }

    const options = {};
    if (result.content) options.content = result.content;
    if (result.embeds) options.embeds = result.embeds;
    if (result.components) options.components = result.components;

    // ✅ Ephemeral Flag korrekt setzen
    if (ephemeral) options.flags = MessageFlags.Ephemeral;

    // ✏️ Antwort senden oder bearbeiten
    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply(options);
      } else {
        await interaction.reply(options);
      }
    } catch (editErr) {
      console.error('⚠️ editReply fehlgeschlagen:', editErr.message);
      try {
        await interaction.followUp({ content: '⚠️ Fehler beim Senden der Antwort.', ephemeral: true });
      } catch {}
    }

  } catch (err) {
    console.error('❌ Schwerer Interaktionsfehler (gefangen, Bot läuft weiter):', err);
    await safeErrorReply(interaction, '❌ Ein unerwarteter Fehler ist aufgetreten.');
  }
}

/**
 * Sicher eine Fehlermeldung an den User senden.
 */
async function safeErrorReply(interaction, message) {
  try {
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: message, ephemeral: true });
    } else if (interaction.deferred && !interaction.replied) {
      await interaction.editReply({ content: message, ephemeral: true });
    } else {
      await interaction.followUp({ content: message, ephemeral: true });
    }
  } catch (sendErr) {
    console.error('⚠️ Konnte Fehlermeldung nicht senden (Interaction abgelaufen?):', sendErr.message);
  }
}

module.exports = { handleInteraction };