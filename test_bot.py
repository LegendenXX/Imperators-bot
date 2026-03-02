#!/usr/bin/env python3
import os
import json
import subprocess
import sys
from pathlib import Path

def check_file_exists(filepath, description):
    """Prüft, ob eine Datei existiert"""
    if Path(filepath).exists():
        print(f"Hauptdatei: {filepath}")
        return True
    else:
        print(f"FEHLT: {description}: {filepath}")
        return False

def check_json_file(filepath, description):
    """Prüft und validiert eine JSON-Datei"""
    if not check_file_exists(filepath, description):
        return False
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        print(f"{description} - JSON gültig")
        return True
    except json.JSONDecodeError as e:
        print(f"{description} - JSON Fehler: {e}")
        return False
    except Exception as e:
        print(f"{description} - Fehler: {e}")
        return False

def check_node_modules():
    """Prüft, ob node_modules existiert und Discord.js installiert ist"""
    node_modules_path = Path("node_modules")
    discordjs_path = node_modules_path / "discord.js"
    
    if node_modules_path.exists():
        print("node_modules Ordner vorhanden")
        if discordjs_path.exists():
            print("discord.js installiert")
            return True
        else:
            print("discord.js nicht installiert")
            return False
    else:
        print("node_modules Ordner fehlt")
        return False

def check_package_json():
    """Prüft package.json und zeigt Abhängigkeiten"""
    if not check_json_file("package.json", "package.json"):
        return False
    
    try:
        with open("package.json", 'r', encoding='utf-8') as f:
            package = json.load(f)
        
        deps = package.get("dependencies", {})
        print(f"Gefundene Abhaengigkeiten ({len(deps)}):")
        for name, version in deps.items():
            print(f"   - {name}: {version}")
        return True
    except Exception as e:
        print(f"Fehler beim Lesen der Abhaengigkeiten: {e}")
        return False

def test_node_syntax():
    """Testet die Syntax aller JS-Dateien"""
    js_files = [
        "index.js",
        "db.js", 
        "transactionLog.js",
        "helpers/interactionHandler.js",
        "helpers/button.js",
        "helpers/auctionPhases.js",
        "helpers/aliases.js",
        "commands/bank.js",
        "commands/kaufen.js",
        "commands/ping.js",
        "commands/hierachie.js",
        "commands/hierachielist.js"
    ]
    
    print("\nJavaScript Syntax-Check:")
    all_good = True
    
    for js_file in js_files:
        if Path(js_file).exists():
            try:
                result = subprocess.run(
                    ["node", "-c", js_file], 
                    capture_output=True, 
                    text=True, 
                    timeout=5
                )
                if result.returncode == 0:
                    print(f"{js_file}")
                else:
                    print(f"{js_file} - Syntax Fehler")
                    if result.stderr:
                        print(f"   Fehler: {result.stderr.strip()}")
                    all_good = False
            except subprocess.TimeoutExpired:
                print(f"{js_file} - Timeout")
                all_good = False
            except FileNotFoundError:
                print("Node.js nicht gefunden")
                all_good = False
                break
        else:
            print(f"{js_file} - Datei nicht gefunden")
            all_good = False
    
    return all_good

def main():
    print("Discord Bot - System-Check mit Python")
    print("=" * 50)
    
    # Wechsel zum Bot-Verzeichnis
    bot_dir = Path(__file__).parent
    os.chdir(bot_dir)
    print(f"Arbeitsverzeichnis: {bot_dir}")
    
    checks_passed = 0
    total_checks = 0
    
    # Wichtige Dateien prüfen
    total_checks += 1
    if check_file_exists("index.js", "Hauptdatei"):
        checks_passed += 1
    
    total_checks += 1
    if check_json_file("package.json", "Package-Konfiguration"):
        checks_passed += 1
    
    total_checks += 1
    if check_json_file("config.json", "Bot-Konfiguration"):
        checks_passed += 1
    
    total_checks += 1
    if check_json_file("database.json", "Datenbank"):
        checks_passed += 1
    
    total_checks += 1
    if check_json_file("transactionLog.json", "Transaktions-Log"):
        checks_passed += 1
    
    total_checks += 1
    if check_node_modules():
        checks_passed += 1
    
    total_checks += 1
    if check_package_json():
        checks_passed += 1
    
    # Syntax-Check
    total_checks += 1
    if test_node_syntax():
        checks_passed += 1
    
    print("\n" + "=" * 50)
    print(f"Ergebnis: {checks_passed}/{total_checks} Checks bestanden")
    
    if checks_passed == total_checks:
        print("Alle Checks bestanden! Bot sollte starten koennen.")
        print("Naechste Schritte:")
        print("   1. Stelle sicher, dass config.json deinen Bot-Token enthält")
        print("   2. Führe 'npm install' aus, falls node_modules fehlt")
        print("   3. Starte mit 'start.bat' oder 'node index.js'")
    else:
        print("Einige Checks fehlgeschlagen. Bitte behebe die Probleme oben.")
    
    return checks_passed == total_checks

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
