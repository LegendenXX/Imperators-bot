// === Discord.js & System Imports ===
const {
  Client,
  Collection,
  GatewayIntentBits,
  REST,
  Routes,
} = require('discord.js');

const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const db = require('./db.js');
const transactionLog = require('./transactionLog.js');

// 👉 ZENTRALER BUTTON / MODAL HANDLER
const {
  handleButtonInteraction,
  handleModalSubmit,
} = require('./helpers/button.js');

// 👉 ZENTRALER INTERACTION HANDLER
const { handleInteraction } = require('./helpers/interactionHandler.js');

// === Datenbank & TransactionLog laden ===
db.load();
console.log('✅ Datenbank erfolgreich geladen');
transactionLog.loadTransactionLog();

// === Discord Client Setup ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
  ],
});

client.commands = new Collection();

// === Job Dropdown Listener ===
require('./helpers/interactionCreate.js')(client);

// === Commands laden ===
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const cmd = require(path.join(commandsPath, file));
    if ('data' in cmd && 'execute' in cmd) {
      client.commands.set(cmd.data.name, cmd);
    }
  });

// === Ready Event ===
client.once('clientReady', () => {
  console.log(`✅ Eingeloggt als ${client.user.tag}`);
});

// === Slash Commands GLOBAL registrieren ===
(async () => {
  const rest = new REST({ version: '10' }).setToken(config.token);
  try {
    const commandsJSON = client.commands.map(cmd => cmd.data.toJSON());
    await rest.put(
      Routes.applicationCommands(config.clientId),
      { body: commandsJSON }
    );
    console.log('✅ Global Slash Commands registriert!');
  } catch (err) {
    console.error('❌ Fehler beim Registrieren der Slash Commands:', err);
  }
})();

// === Interaction Handling ===
client.on('interactionCreate', async interaction => {
  try {
    if (interaction.user?.bot) return;

    // --- Slash Commands ---
    if (interaction.isChatInputCommand()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd) return;
      await handleInteraction(interaction, db, transactionLog, cmd.execute);
    }

    // --- Autocomplete ---
    else if (interaction.isAutocomplete()) {
      const cmd = client.commands.get(interaction.commandName);
      if (!cmd?.autocomplete) return;

      const focused = interaction.options.getFocused(true);
      const members = await interaction.guild.members.fetch();

      const filtered = members
        .filter(m =>
          !m.user.bot &&
          m.user.username.toLowerCase().includes(focused.value.toLowerCase())
        )
        .map(m => ({
          name: m.user.username,
          value: m.id,
        }))
        .slice(0, 25);

      await interaction.respond(filtered);
    }

    // --- Button ---
    else if (interaction.isButton()) {
      await handleButtonInteraction(interaction, db, transactionLog);

      for (const cmd of client.commands.values()) {
        if (typeof cmd.button === 'function') {
          try {
            await cmd.button(interaction, db, transactionLog);
          } catch (btnErr) {
            console.error(`❌ Button-Handler Fehler (${cmd.data.name}):`, btnErr);
          }
        }
      }
    }

    // --- Modal ---
    else if (interaction.isModalSubmit()) {
      await handleModalSubmit(interaction, db, transactionLog);

      for (const cmd of client.commands.values()) {
        if (typeof cmd.modal === 'function') {
          try {
            await cmd.modal(interaction, db, transactionLog);
          } catch (modalErr) {
            console.error(`❌ Modal-Handler Fehler (${cmd.data.name}):`, modalErr);
          }
        }
      }
    }

  } catch (err) {
    console.error('❌ Schwerer Interaktionsfehler:', err);
  }
});

// === Auto-Save ===
setInterval(() => {
  try {
    db.save();
    console.log('💾 Datenbank automatisch gespeichert.');
  } catch (err) {
    console.error('❌ Fehler beim DB-Autosave:', err);
  }
}, 300_000);

setInterval(() => {
  try {
    transactionLog.saveTransactionLog();
    console.log('💾 TransaktionsLog automatisch gespeichert.');
  } catch (err) {
    console.error('❌ Fehler beim TransactionLog-Autosave:', err);
  }
}, 360_000);

// =====================================================
// 🔁 AUTO-RESTART / CRASH / GATEWAY SICHERHEIT
// =====================================================

// ❌ Unhandled Promise Rejections – NUR loggen, NICHT beenden
process.on('unhandledRejection', err => {
  console.error('❌ UnhandledRejection (gefangen, Bot läuft weiter):', err);
});

// ❌ Uncaught Exceptions – NUR loggen, NICHT beenden
process.on('uncaughtException', err => {
  console.error('❌ UncaughtException (gefangen, Bot läuft weiter):', err);
});

// ❌ Discord Gateway Fehler – NUR loggen
client.on('shardError', err => {
  console.error('❌ Shard Error (Bot läuft weiter):', err);
});

client.on('error', err => {
  console.error('❌ Discord Client Error (Bot läuft weiter):', err);
});

client.on('disconnect', () => {
  console.warn('⚠️ Discord Disconnect – Versuche Reconnect...');
});

// 🔁 Automatischer Reconnect bei Verbindungsverlust
client.on('shardDisconnect', (event, shardId) => {
  console.warn(`⚠️ Shard ${shardId} disconnected (Code: ${event.code}). Reconnect wird versucht...`);
});

client.on('shardReconnecting', (shardId) => {
  console.log(`� Shard ${shardId} reconnecting...`);
});

client.on('shardResume', (shardId, replayedEvents) => {
  console.log(`✅ Shard ${shardId} resumed (${replayedEvents} events replayed)`);
});

// === Sicher speichern beim Beenden ===
process.on('exit', () => {
  db.save();
  transactionLog.saveTransactionLog();
});
process.on('SIGINT', () => process.exit());
process.on('SIGTERM', () => process.exit());

// === Login ===
client.login(config.token);