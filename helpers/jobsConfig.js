// helpers/jobsConfig.js

module.exports = {
  jobs: {
    // Arbeitslos
    Arbeitslos: {
      name: 'Arbeitslos',
      lohn: 0,
      type: 'Job',
      description: 'Kein Job, kein Einkommen',
      req: 0,
      xp: 0,
      career: ['Arbeitslos']
    },

    // Bäcker Karriereleiter
    BaeckerLehrling: { name: 'Bäcker Lehrling', lohn: 200, type: 'Job', description: 'Lerne das Backen', req: 0, xp: 50, career: ['Bäcker Lehrling', 'Bäcker', 'Bäcker Meister', 'Leitender Bäckermeister'] },
    Baecker: { name: 'Bäcker', lohn: 500, type: 'Job', description: 'Backe leckeres Brot', req: 100, xp: 100, career: ['Bäcker Lehrling', 'Bäcker', 'Bäcker Meister', 'Leitender Bäckermeister'] },
    BaeckerMeister: { name: 'Bäcker Meister', lohn: 800, type: 'Job', description: 'Meister im Backen', req: 300, xp: 150, career: ['Bäcker Lehrling', 'Bäcker', 'Bäcker Meister', 'Leitender Bäckermeister'] },
    LeitenderBaeckermeister: { name: 'Leitender Bäckermeister', lohn: 1200, type: 'Job', description: 'Leite die Bäckerei', req: 600, xp: 200, career: ['Bäcker Lehrling', 'Bäcker', 'Bäcker Meister', 'Leitender Bäckermeister'] },

    // Programmierer Karriereleiter
    StudierenderProgrammierer: { name: 'Studierender Programmierer', lohn: 300, type: 'Job', description: 'Lerne Programmieren', req: 0, xp: 60, career: ['Studierender Programmierer', 'Programmierer', 'Chef Programmierer'] },
    Programmierer: { name: 'Programmierer', lohn: 1500, type: 'Job', description: 'Schreibe Code für die Zukunft', req: 100, xp: 120, career: ['Studierender Programmierer', 'Programmierer', 'Chef Programmierer'] },
    ChefProgrammierer: { name: 'Chef Programmierer', lohn: 2500, type: 'Job', description: 'Leite das Entwicklerteam', req: 400, xp: 200, career: ['Studierender Programmierer', 'Programmierer', 'Chef Programmierer'] },

    // Lehrer Karriereleiter
    StudierenderLehrer: { name: 'Studierender Lehrer', lohn: 400, type: 'Job', description: 'Lerne unterrichten', req: 0, xp: 50, career: ['Studierender Lehrer', 'Lehrer', 'Schuldirektor'] },
    Lehrer: { name: 'Lehrer', lohn: 800, type: 'Job', description: 'Bild die nächste Generation', req: 150, xp: 100, career: ['Studierender Lehrer', 'Lehrer', 'Schuldirektor'] },
    Schuldirektor: { name: 'Schuldirektor', lohn: 2000, type: 'Job', description: 'Leite die Schule', req: 500, xp: 200, career: ['Studierender Lehrer', 'Lehrer', 'Schuldirektor'] },

    // Arzt Karriereleiter
    StudierenderArzt: { name: 'Studierender Arzt', lohn: 500, type: 'Job', description: 'Lerne Medizin', req: 0, xp: 80, career: ['Studierender Arzt', 'Arzt', 'Chefarzt', 'Leitender Chefarzt'] },
    Arzt: { name: 'Arzt', lohn: 2000, type: 'Job', description: 'Hilfe den Menschen gesund zu bleiben', req: 200, xp: 150, career: ['Studierender Arzt', 'Arzt', 'Chefarzt', 'Leitender Chefarzt'] },
    Chefarzt: { name: 'Chefarzt', lohn: 3500, type: 'Job', description: 'Leite die Klinik', req: 500, xp: 250, career: ['Studierender Arzt', 'Arzt', 'Chefarzt', 'Leitender Chefarzt'] },
    LeitenderChefarzt: { name: 'Leitender Chefarzt', lohn: 5000, type: 'Job', description: 'Verantwortlich für die gesamte Klinik', req: 1000, xp: 400, career: ['Studierender Arzt', 'Arzt', 'Chefarzt', 'Leitender Chefarzt'] },

    // Künstler Karriereleiter
    StudierenderKuenstler: { name: 'Studierender Künstler', lohn: 300, type: 'Job', description: 'Lerne Kunst', req: 0, xp: 60, career: ['Studierender Künstler', 'Künstler', 'Museumsdirektor'] },
    Künstler: { name: 'Künstler', lohn: 600, type: 'Job', description: 'Schöne Kunstwerke erschaffen', req: 70, xp: 100, career: ['Studierender Künstler', 'Künstler', 'Museumsdirektor'] },
    Museumsdirektor: { name: 'Museumsdirektor', lohn: 1500, type: 'Job', description: 'Leite das Museum', req: 300, xp: 200, career: ['Studierender Künstler', 'Künstler', 'Museumsdirektor'] },

    // Mechaniker Karriereleiter
    MechanikerLehrling: { name: 'Mechaniker Lehrling', lohn: 300, type: 'Job', description: 'Lerne Fahrzeuge reparieren', req: 0, xp: 50, career: ['Mechaniker Lehrling', 'Mechaniker', 'Chef Mechaniker'] },
    Mechaniker: { name: 'Mechaniker', lohn: 900, type: 'Job', description: 'Repariert kaputte Fahrzeuge', req: 120, xp: 120, career: ['Mechaniker Lehrling', 'Mechaniker', 'Chef Mechaniker'] },
    ChefMechaniker: { name: 'Chef Mechaniker', lohn: 1500, type: 'Job', description: 'Leite die Werkstatt', req: 400, xp: 200, career: ['Mechaniker Lehrling', 'Mechaniker', 'Chef Mechaniker'] },

    // Koch Karriereleiter
    KochLehrling: { name: 'Koch Lehrling', lohn: 250, type: 'Job', description: 'Lerne kochen', req: 0, xp: 50, career: ['Koch Lehrling', 'Koch', 'Leitender Chef Koch'] },
    Koch: { name: 'Koch', lohn: 700, type: 'Job', description: 'Koch leckere Gerichte', req: 140, xp: 120, career: ['Koch Lehrling', 'Koch', 'Leitender Chef Koch'] },
    LeitenderChefKoch: { name: 'Leitender Chef Koch', lohn: 1200, type: 'Job', description: 'Leite die Küche', req: 400, xp: 200, career: ['Koch Lehrling', 'Koch', 'Leitender Chef Koch'] },

    // Elektriker Karriereleiter
    ElektrikerLehrling: { name: 'Elektriker Lehrling', lohn: 250, type: 'Job', description: 'Lerne Elektrik', req: 0, xp: 50, career: ['Elektriker Lehrling', 'Elektriker', 'Elektriker Meister', 'Chef Elektriker', 'Leitender Chef Elektriker'] },
    Elektriker: { name: 'Elektriker', lohn: 600, type: 'Job', description: 'Installiere Elektrik', req: 100, xp: 120, career: ['Elektriker Lehrling', 'Elektriker', 'Elektriker Meister', 'Chef Elektriker', 'Leitender Chef Elektriker'] },
    ElektrikerMeister: { name: 'Elektriker Meister', lohn: 900, type: 'Job', description: 'Führe Projekte durch', req: 250, xp: 150, career: ['Elektriker Lehrling', 'Elektriker', 'Elektriker Meister', 'Chef Elektriker', 'Leitender Chef Elektriker'] },
    ChefElektriker: { name: 'Chef Elektriker', lohn: 1500, type: 'Job', description: 'Leite das Team', req: 400, xp: 200, career: ['Elektriker Lehrling', 'Elektriker', 'Elektriker Meister', 'Chef Elektriker', 'Leitender Chef Elektriker'] },
    LeitenderChefElektriker: { name: 'Leitender Chef Elektriker', lohn: 2500, type: 'Job', description: 'Verantwortlich für die gesamte Abteilung', req: 700, xp: 300, career: ['Elektriker Lehrling', 'Elektriker', 'Elektriker Meister', 'Chef Elektriker', 'Leitender Chef Elektriker'] },
  },

  jobChangeCost: 100,

  // Hole Jobdaten
  getJob(jobName) {
    return this.jobs[jobName] || this.jobs['Arbeitslos'];
  },

  // Alle Job-Namen
  getJobNames() {
    return Object.keys(this.jobs);
  },

  // Prüfe, ob Job existiert
  jobExists(jobName) {
    return !!this.jobs[jobName];
  }
};