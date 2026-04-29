const express = require('express');
const { twiml } = require('twilio');
const router = express.Router();

// Endpoint for Twilio WhatsApp webhook
router.post('/', (req, res) => {
  const incomingMsg = req.body.Body ? req.body.Body.toLowerCase() : '';
  const sender = req.body.From;
  
  console.log(`Received WhatsApp message from ${sender}: ${incomingMsg}`);
  
  const messagingResponse = new twiml.MessagingResponse();
  
  // Basic Chatbot logic
  if (incomingMsg.includes('report water')) {
    messagingResponse.message('Thank you for reporting the water issue. We have logged it on the Ecovoice dashboard and a local agent will review it shortly. 💧');
  } else if (incomingMsg.includes('report energy') || incomingMsg.includes('report power')) {
    messagingResponse.message('Your energy issue has been reported. Thank you for keeping the grid safe! ⚡');
  } else if (incomingMsg.includes('report waste')) {
    messagingResponse.message('Waste collection delay reported. We will dispatch the community team soon. ♻️');
  } else if (incomingMsg.includes('score')) {
    messagingResponse.message('Your current community score is looking great! Keep completing nudges to earn more points! 🤩');
  } else {
    messagingResponse.message('Welcome to Ecovoice! Reply with:\n- "Report water"\n- "Report energy"\n- "Report waste"\n- "Score"\nto interact with our system.');
  }
  
  res.writeHead(200, { 'Content-Type': 'text/xml' });
  res.end(messagingResponse.toString());
});

module.exports = router;
