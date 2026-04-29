const express = require('express');
const { twiml } = require('twilio');
const router = express.Router();

// Endpoint for initial Twilio Voice webhook
router.post('/', (req, res) => {
  const voiceResponse = new twiml.VoiceResponse();
  
  // Ask the user to speak
  const gather = voiceResponse.gather({
    input: ['speech'],
    action: '/api/voice/process-speech',
    timeout: 3,
    language: 'en-US'
  });
  
  gather.say('Welcome to Ecovoice. Please state your report after the tone.');
  
  // Fallback if they don't say anything
  voiceResponse.say('We didn\'t receive any input. Goodbye!');
  
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(voiceResponse.toString());
});

// Endpoint that Twilio calls after the user speaks
router.post('/process-speech', (req, res) => {
  const speechResult = req.body.SpeechResult;
  console.log(`Received Voice Speech from Twilio: ${speechResult}`);
  
  const voiceResponse = new twiml.VoiceResponse();
  
  if (speechResult) {
    voiceResponse.say(`We have recorded your report: ${speechResult}. Thank you for helping your community.`);
  } else {
    voiceResponse.say('Sorry, we could not understand that. Please try calling again.');
  }
  
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(voiceResponse.toString());
});

module.exports = router;
