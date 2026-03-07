const fs = require('fs');
const path = require('path');

const logPath = path.join(__dirname, 'transactionLog.json');

let transactionLog = { guilds: {} };

// === Log laden ===
function loadTransactionLog() {
  if (fs.existsSync(logPath)) {
    try {
      const raw = fs.readFileSync(logPath, 'utf8');
      transactionLog = JSON.parse(raw);

      if (!transactionLog.guilds) {
        transactionLog.guilds = {};
      }

    } catch (err) {
      console.error('❌ Fehler beim Laden des TransactionLogs:', err);
      transactionLog = { guilds: {} };
    }
  }

  console.log('✅ TransactionLog erfolgreich geladen');
}

/**
 * Log speichern
 */
function saveTransactionLog() {
  try {
    fs.writeFileSync(logPath, JSON.stringify(transactionLog, null, 2));
  } catch (err) {
    console.error('❌ Fehler beim Speichern des TransactionLogs:', err);
  }
}

/**
 * Guild sicherstellen
 */
function ensureGuild(guildId) {
  if (!transactionLog.guilds[guildId]) {
    transactionLog.guilds[guildId] = {};
  }
}

/**
 * User sicherstellen
 */
function ensureUser(guildId, userId) {
  ensureGuild(guildId);

  if (!Array.isArray(transactionLog.guilds[guildId][userId])) {
    transactionLog.guilds[guildId][userId] = [];
  }
}

/**
 * Neue Transaktion hinzufügen
 */
function addTransaction(guildId, userId, type, amount, balance, bank) {

  ensureUser(guildId, userId);

  transactionLog.guilds[guildId][userId].push({
    type,
    amount,
    balance,
    bank,
    date: Date.now(),
  });

  saveTransactionLog();
}

/**
 * Letzte Transaktion holen
 */
function getLastTransaction(guildId, userId) {

  ensureUser(guildId, userId);

  const txList = transactionLog.guilds[guildId][userId];

  if (!Array.isArray(txList) || txList.length === 0) {
    return null;
  }

  return txList[txList.length - 1];
}

module.exports = {
  loadTransactionLog,
  saveTransactionLog,
  addTransaction,
  getLastTransaction,
};