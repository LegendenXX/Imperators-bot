const sqlite3 = require('better-sqlite3');
const db = sqlite3('botdata.sqlite', { readonly: true });

console.log('=== SQLite Datenbank Analyse ===\n');

// Tabellen auflisten
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Gefundene Tabellen:', tables.length);

tables.forEach(table => {
  console.log(`\n📋 Tabelle: ${table.name}`);
  
  // Schema anzeigen
  const schema = db.prepare('PRAGMA table_info(' + table.name + ')').all();
  console.log('Schema:');
  schema.forEach(col => {
    console.log(`  - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
  });
  
  // Datensätze zählen
  const count = db.prepare('SELECT COUNT(*) as count FROM ' + table.name).get();
  console.log(`📊 Datensätze: ${count.count}`);
  
  // Beispieldaten anzeigen (max 3)
  if (count.count > 0) {
    const sample = db.prepare('SELECT * FROM ' + table.name + ' LIMIT 3').all();
    console.log('📝 Beispieldaten:');
    console.log(JSON.stringify(sample, null, 2));
  }
});

db.close();
console.log('\n=== Analyse beendet ===');
