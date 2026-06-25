const Database = require('better-sqlite3')
const path = require('path')

const DB_PATH = process.env.DB_PATH
  ? path.resolve(process.env.DB_PATH)
  : path.join(__dirname, 'ziimo.db')

const db = new Database(DB_PATH)

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')

// ── Tabeller ───────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS brukere (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    navn          TEXT    NOT NULL,
    epost         TEXT    UNIQUE NOT NULL,
    passord_hash  TEXT    NOT NULL,
    rolle         TEXT    NOT NULL DEFAULT 'forelder',
    opprettet     DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS oppdrag (
    id            INTEGER PRIMARY KEY,
    tittel        TEXT    NOT NULL,
    poeng         INTEGER NOT NULL,
    ikon          TEXT,
    varighet      TEXT,
    sted          TEXT,
    kategori      TEXT,
    beskrivelse   TEXT
  );
`)

// ── Seed – INSERT OR IGNORE kjører trygt ved hver restart ─
const seed = db.prepare(`
  INSERT OR IGNORE INTO oppdrag (id, tittel, poeng, ikon, varighet, sted, kategori, beskrivelse)
  VALUES (@id, @tittel, @poeng, @ikon, @varighet, @sted, @kategori, @beskrivelse)
`)

const startOppdrag = [
  { id: 1, tittel: 'Rydd rommet ditt',       poeng: 10, ikon: '🧹', varighet: 'Medium', sted: 'Inne', kategori: 'fysisk',      beskrivelse: 'Rydd og rens rommet ditt slik at det ser fint og ryddig ut. Legg alt på plass!' },
  { id: 2, tittel: 'Hjelp til med middagen', poeng: 15, ikon: '🍳', varighet: 'Medium', sted: 'Inne', kategori: 'sosial',      beskrivelse: 'Hjelp de voksne med å lage middag eller dekke bordet. En ekte lagspiller!' },
  { id: 3, tittel: 'Les en bok',             poeng: 20, ikon: '📚', varighet: 'Lang',   sted: 'Inne', kategori: 'kreativitet', beskrivelse: 'Sett deg ned og les en bok i minst 15 minutter. Hva handler den om?' },
  { id: 4, tittel: 'Gå en tur ute',          poeng: 10, ikon: '🌳', varighet: 'Rask',   sted: 'Ute',  kategori: 'natur',       beskrivelse: 'Ta en liten tur utenfor og legg merke til alt du ser rundt deg i naturen.' },
  { id: 5, tittel: 'Tegn noe kreativt',      poeng: 15, ikon: '🎨', varighet: 'Medium', sted: 'Inne', kategori: 'kreativitet', beskrivelse: 'Tegn eller mal noe du synes er fint. La fantasien fly helt fritt!' },
]

const seedAll = db.transaction(() => startOppdrag.forEach(o => seed.run(o)))
seedAll()

module.exports = db
