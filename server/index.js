const express = require('express');
const cors = require('cors');
const whatsappRoute = require('./routes/whatsapp');
const voiceRoute = require('./routes/voice');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
// Twilio sends webhooks as application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.use('/api/whatsapp', whatsappRoute);
app.use('/api/voice', voiceRoute);

// Basic health check
app.get('/', (req, res) => {
  res.json({ status: 'Ecovoice Backend API is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Ecovoice Server running on port ${PORT}`);
  console.log(`Webhook URL for WhatsApp: http://localhost:${PORT}/api/whatsapp`);
  console.log(`Webhook URL for Voice: http://localhost:${PORT}/api/voice`);
});
