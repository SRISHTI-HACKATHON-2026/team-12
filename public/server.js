import express from 'express';
import Database from 'better-sqlite3';
import cors from 'cors';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { mkdirSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3456;

// Ensure uploads directory exists
const uploadsDir = join(__dirname, 'uploads');
if (!existsSync(uploadsDir)) mkdirSync(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));
app.use('/uploads', express.static(uploadsDir));

// Multer for audio/photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// ═══ DATABASE SETUP ═══
const db = new Database(join(__dirname, 'ecovoice.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT DEFAULT 'Anonymous',
    village TEXT NOT NULL,
    category TEXT NOT NULL,
    method TEXT DEFAULT 'text',
    message TEXT,
    audio_file TEXT,
    photo_file TEXT,
    is_anonymous INTEGER DEFAULT 1,
    language TEXT DEFAULT 'en',
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS villages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    district TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    score INTEGER DEFAULT 500,
    water_score INTEGER DEFAULT 50,
    waste_score INTEGER DEFAULT 50,
    energy_score INTEGER DEFAULT 50,
    green_score INTEGER DEFAULT 50,
    community_score INTEGER DEFAULT 50,
    health_score INTEGER DEFAULT 50,
    badge TEXT DEFAULT 'NONE',
    total_reports INTEGER DEFAULT 0,
    resolved_reports INTEGER DEFAULT 0
  );
`);

// Seed villages if empty
const count = db.prepare('SELECT COUNT(*) as c FROM villages').get();
if (count.c === 0) {
  const villages = [
    { name:'Rampur', state:'Maharashtra', district:'Pune', lat:18.52, lng:73.86, score:742, water:78, waste:61, energy:89, green:70, community:82, health:62, badge:'SILVER' },
    { name:'Sundarpur', state:'Maharashtra', district:'Nashik', lat:20.00, lng:73.78, score:891, water:92, waste:85, energy:95, green:88, community:90, health:87, badge:'GOLD' },
    { name:'Nandgaon', state:'Maharashtra', district:'Nashik', lat:20.31, lng:74.65, score:698, water:72, waste:58, energy:80, green:65, community:75, health:55, badge:'BRONZE' },
    { name:'Khedgaon', state:'Maharashtra', district:'Ahmednagar', lat:19.09, lng:74.73, score:543, water:55, waste:45, energy:60, green:50, community:55, health:48, badge:'NONE' },
    { name:'Kalyanpur', state:'Rajasthan', district:'Jaipur', lat:26.92, lng:75.79, score:887, water:95, waste:88, energy:90, green:85, community:88, health:82, badge:'GOLD' },
    { name:'Govindpur', state:'Bihar', district:'Patna', lat:25.61, lng:85.14, score:756, water:85, waste:65, energy:78, green:72, community:80, health:70, badge:'SILVER' },
    { name:'Anantapur', state:'Andhra Pradesh', district:'Anantapur', lat:14.68, lng:77.60, score:834, water:82, waste:80, energy:92, green:85, community:82, health:78, badge:'SILVER' },
    { name:'Palakkad', state:'Kerala', district:'Palakkad', lat:10.78, lng:76.65, score:912, water:95, waste:92, energy:93, green:90, community:92, health:88, badge:'GOLD' },
    { name:'Mandya', state:'Karnataka', district:'Mandya', lat:12.52, lng:76.90, score:678, water:70, waste:60, energy:72, green:68, community:65, health:58, badge:'BRONZE' },
    { name:'Warangal', state:'Telangana', district:'Warangal', lat:17.98, lng:79.60, score:723, water:75, waste:63, energy:82, green:70, community:78, health:60, badge:'SILVER' },
    { name:'Dindigul', state:'Tamil Nadu', district:'Dindigul', lat:10.37, lng:77.97, score:801, water:85, waste:75, energy:88, green:78, community:82, health:72, badge:'SILVER' },
    { name:'Moga', state:'Punjab', district:'Moga', lat:30.80, lng:75.17, score:645, water:65, waste:55, energy:70, green:62, community:60, health:55, badge:'BRONZE' },
    { name:'Jhunjhunu', state:'Rajasthan', district:'Jhunjhunu', lat:28.13, lng:75.40, score:567, water:58, waste:48, energy:62, green:55, community:58, health:50, badge:'NONE' },
    { name:'Chitradurga', state:'Karnataka', district:'Chitradurga', lat:14.23, lng:76.40, score:710, water:72, waste:62, energy:78, green:70, community:72, health:62, badge:'SILVER' },
    { name:'Barabanki', state:'Uttar Pradesh', district:'Barabanki', lat:26.93, lng:81.18, score:489, water:50, waste:40, energy:55, green:48, community:50, health:42, badge:'NONE' }
  ];
  const insert = db.prepare(`INSERT INTO villages (name,state,district,lat,lng,score,water_score,waste_score,energy_score,green_score,community_score,health_score,badge) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  for (const v of villages) {
    insert.run(v.name, v.state, v.district, v.lat, v.lng, v.score, v.water, v.waste, v.energy, v.green, v.community, v.health, v.badge);
  }
  console.log('✅ Seeded 15 real Indian villages');
}

// ═══ API ROUTES ═══

// Get all villages
app.get('/api/villages', (req, res) => {
  const villages = db.prepare('SELECT * FROM villages ORDER BY score DESC').all();
  res.json(villages);
});

// Search villages
app.get('/api/villages/search', (req, res) => {
  const q = req.query.q || '';
  const villages = db.prepare("SELECT * FROM villages WHERE name LIKE ? OR state LIKE ? OR district LIKE ? ORDER BY score DESC LIMIT 10")
    .all(`%${q}%`, `%${q}%`, `%${q}%`);
  res.json(villages);
});

// Get village by id
app.get('/api/villages/:id', (req, res) => {
  const village = db.prepare('SELECT * FROM villages WHERE id = ?').get(req.params.id);
  if (!village) return res.status(404).json({ error: 'Village not found' });
  res.json(village);
});

// Submit report
app.post('/api/reports', upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'photo', maxCount: 1 }
]), (req, res) => {
  try {
    const { username, village, category, method, message, is_anonymous, language } = req.body;
    const audio_file = req.files?.audio?.[0]?.filename || null;
    const photo_file = req.files?.photo?.[0]?.filename || null;

    const result = db.prepare(`
      INSERT INTO reports (username, village, category, method, message, audio_file, photo_file, is_anonymous, language)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      is_anonymous === '1' ? 'Anonymous' : (username || 'Anonymous'),
      village || 'Unknown',
      category || 'other',
      method || 'text',
      message || '',
      audio_file,
      photo_file,
      is_anonymous === '1' ? 1 : 0,
      language || 'en'
    );

    // Update village report count
    db.prepare("UPDATE villages SET total_reports = total_reports + 1 WHERE name LIKE ?").run(`%${village}%`);

    res.json({ success: true, id: result.lastInsertRowid, message: 'Report submitted successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// Get reports
app.get('/api/reports', (req, res) => {
  const reports = db.prepare('SELECT * FROM reports ORDER BY created_at DESC LIMIT 50').all();
  res.json(reports);
});

app.listen(PORT, () => {
  console.log(`🌱 EcoVoice server running at http://localhost:${PORT}`);
});
