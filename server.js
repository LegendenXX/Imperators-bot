const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const PORT = 3000;

// Status-Tracking
let botStatus = {
  running: false,
  startTime: null,
  logs: [],
  process: null
};

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Startseite
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Discord Bot Control Panel</title>
        <meta charset="utf-8">
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { text-align: center; color: #7289da; margin-bottom: 30px; }
            .status { padding: 15px; border-radius: 5px; margin: 10px 0; }
            .status.running { background: #2ecc71; color: white; }
            .status.stopped { background: #e74c3c; color: white; }
            .logs { background: #2c3e50; color: #ecf0f1; padding: 15px; border-radius: 5px; height: 300px; overflow-y: auto; font-family: monospace; font-size: 12px; margin: 10px 0; }
            .btn { padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; margin: 5px; font-size: 16px; }
            .btn.start { background: #2ecc71; color: white; }
            .btn.stop { background: #e74c3c; color: white; }
            .btn.restart { background: #f39c12; color: white; }
            .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🤖 Discord Bot Control Panel</h1>
                <p>Bot Management Interface</p>
            </div>
            
            <div id="status" class="status ${botStatus.running ? 'running' : 'stopped'}">
                <strong>Status:</strong> ${botStatus.running ? '🟢 RUNNING' : '🔴 STOPPED'}
                ${botStatus.startTime ? `<br><strong>Startzeit:</strong> ${new Date(botStatus.startTime).toLocaleString('de-DE')}` : ''}
            </div>
            
            <div class="controls">
                <button id="startBtn" class="btn start" onclick="startBot()" ${botStatus.running ? 'disabled' : ''}>🚀 Start Bot</button>
                <button id="stopBtn" class="btn stop" onclick="stopBot()" ${!botStatus.running ? 'disabled' : ''}>⏹️ Stop Bot</button>
                <button id="restartBtn" class="btn restart" onclick="restartBot()" ${!botStatus.running ? 'disabled' : ''}>🔄 Restart Bot</button>
            </div>
            
            <h3>📋 Bot Logs:</h3>
            <div id="logs" class="logs">
                ${botStatus.logs.length > 0 ? botStatus.logs.join('<br>') : 'Noch keine Logs verfügbar...'}
            </div>
            
            <div style="margin-top: 20px; text-align: center; color: #7f8c8d;">
                <small>Server läuft auf Port ${PORT} | Auto-Refresh alle 2 Sekunden</small>
            </div>
        </div>
        
        <script>
            function startBot() {
                fetch('/start', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.message);
                        setTimeout(() => location.reload(), 1000);
                    });
            }
            
            function stopBot() {
                fetch('/stop', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.message);
                        setTimeout(() => location.reload(), 1000);
                    });
            }
            
            function restartBot() {
                fetch('/restart', { method: 'POST' })
                    .then(response => response.json())
                    .then(data => {
                        console.log(data.message);
                        setTimeout(() => location.reload(), 1000);
                    });
            }
            
            // Auto-Refresh
            setInterval(() => {
                fetch('/status')
                    .then(response => response.json())
                    .then(data => {
                        document.getElementById('status').innerHTML = data.statusHtml;
                        document.getElementById('logs').innerHTML = data.logsHtml;
                        
                        // Update buttons
                        document.getElementById('startBtn').disabled = data.running;
                        document.getElementById('stopBtn').disabled = !data.running;
                        document.getElementById('restartBtn').disabled = !data.running;
                    });
            }, 2000);
        </script>
    </body>
    </html>
  `);
});

// API Endpoints
app.get('/status', (req, res) => {
  const statusHtml = `<strong>Status:</strong> ${botStatus.running ? '🟢 RUNNING' : '🔴 STOPPED'}${botStatus.startTime ? `<br><strong>Startzeit:</strong> ${new Date(botStatus.startTime).toLocaleString('de-DE')}` : ''}`;
  const logsHtml = botStatus.logs.length > 0 ? botStatus.logs.join('<br>') : 'Noch keine Logs verfügbar...';
  
  res.json({
    running: botStatus.running,
    statusHtml,
    logsHtml
  });
});

app.post('/start', (req, res) => {
  if (botStatus.running) {
    return res.json({ message: 'Bot läuft bereits!' });
  }
  
  console.log('🚀 Starte Discord Bot...');
  botStatus.running = true;
  botStatus.startTime = Date.now();
  botStatus.logs = ['[' + new Date().toLocaleTimeString('de-DE') + '] 🚀 Bot wird gestartet...'];
  
  // Bot als Child Process starten
  botStatus.process = spawn('node', ['index.js'], {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname
  });
  
  // Logs sammeln
  botStatus.process.stdout.on('data', (data) => {
    const output = data.toString().trim();
    output.split('\n').forEach(line => {
      if (line.trim()) {
        botStatus.logs.push('[' + new Date().toLocaleTimeString('de-DE') + '] ' + line);
        if (botStatus.logs.length > 100) botStatus.logs.shift(); // Max 100 Logs
        console.log('[BOT]', line);
      }
    });
  });
  
  botStatus.process.stderr.on('data', (data) => {
    const output = data.toString().trim();
    output.split('\n').forEach(line => {
      if (line.trim()) {
        botStatus.logs.push('[' + new Date().toLocaleTimeString('de-DE') + '] ❌ ' + line);
        if (botStatus.logs.length > 100) botStatus.logs.shift();
        console.error('[BOT ERROR]', line);
      }
    });
  });
  
  botStatus.process.on('close', (code) => {
    botStatus.running = false;
    botStatus.process = null;
    botStatus.logs.push('[' + new Date().toLocaleTimeString('de-DE') + '] ⚠️ Bot beendet (Code: ' + code + ')');
    console.log('⚠️ Bot beendet mit Code:', code);
  });
  
  botStatus.process.on('error', (err) => {
    botStatus.running = false;
    botStatus.process = null;
    botStatus.logs.push('[' + new Date().toLocaleTimeString('de-DE') + '] ❌ Fehler: ' + err.message);
    console.error('❌ Bot Fehler:', err);
  });
  
  res.json({ message: 'Bot wird gestartet!' });
});

app.post('/stop', (req, res) => {
  if (!botStatus.running || !botStatus.process) {
    return res.json({ message: 'Bot läuft nicht!' });
  }
  
  console.log('⏹️ Stoppe Discord Bot...');
  botStatus.logs.push('[' + new Date().toLocaleTimeString('de-DE') + '] ⏹️ Bot wird gestoppt...');
  
  botStatus.process.kill('SIGTERM');
  setTimeout(() => {
    if (botStatus.process) {
      botStatus.process.kill('SIGKILL');
    }
  }, 5000);
  
  res.json({ message: 'Bot wird gestoppt!' });
});

app.post('/restart', (req, res) => {
  if (!botStatus.running) {
    return res.json({ message: 'Bot läuft nicht - starte neu...' });
  }
  
  console.log('🔄 Restarte Discord Bot...');
  botStatus.logs.push('[' + new Date().toLocaleTimeString('de-DE') + '] 🔄 Bot wird neu gestartet...');
  
  // Stoppen
  if (botStatus.process) {
    botStatus.process.kill('SIGTERM');
  }
  
  // Kurz warten und neu starten
  setTimeout(() => {
    // Starte automatisch über /start endpoint
    fetch('http://localhost:' + PORT + '/start', { method: 'POST' });
  }, 2000);
  
  res.json({ message: 'Bot wird neu gestartet!' });
});

// Server starten
app.listen(PORT, () => {
  console.log(`🌐 Bot Control Panel läuft auf http://localhost:${PORT}`);
  console.log('📋 Öffne die URL im Browser um den Bot zu steuern!');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('⏹️ Server wird beendet...');
  if (botStatus.process) {
    botStatus.process.kill('SIGTERM');
  }
  process.exit(0);
});
