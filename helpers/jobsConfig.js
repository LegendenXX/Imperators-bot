// === Jobs Konfiguration ===
module.exports = {
  // Job-Liste mit Gehalt
  jobs: [
    {
      name: 'Arbeitslos',
      salary: 0,
      description: 'Kein Job, kein Einkommen'
    },
    {
      name: 'Bäcker',
      salary: 500,
      description: 'Backe leckeres Brot'
    },
    {
      name: 'Programmierer',
      salary: 1500,
      description: 'Schreibe Code für die Zukunft'
    },
    {
      name: 'Lehrer',
      salary: 800,
      description: 'Bild die nächste Generation'
    },
    {
      name: 'Arzt',
      salary: 2000,
      description: 'Hilfe den Menschen gesund zu bleiben'
    },
    {
      name: 'Künstler',
      salary: 600,
      description: 'Schöne Kunstwerke erschaffen'
    },
    {
      name: 'Mechaniker',
      salary: 900,
      description: 'Repariere alles was kaputt ist'
    },
    {
      name: 'Koch',
      salary: 700,
      description: 'Koch leckere Gerichte'
    }
  ],

  // Job-Wechsel Kosten
  jobChangeCost: 100,

  // Job-Tägliche Auszahlung
  dailyPayout: true,

  // Hole Job-Info
  getJob(jobName) {
    return this.jobs.find(job => job.name === jobName) || this.jobs[0];
  },

  // Hole alle Job-Namen
  getJobNames() {
    return this.jobs.map(job => job.name);
  },

  // Prüfe ob Job existiert
  jobExists(jobName) {
    return this.jobs.some(job => job.name === jobName);
  }
};