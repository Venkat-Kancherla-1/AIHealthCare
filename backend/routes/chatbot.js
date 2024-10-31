const express = require('express');
const router = express.Router();
const { CohereClientV2 } = require('cohere-ai');

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

router.post('/aichat', async (req, res) => {
    const { messages, userMessage } = req.body; 
    const apiMessages = [
      { role: "system", content: "You are a helpful health assistant that answers health-related questions. Your response have to be straight forward and always less than 150 tokens. If user asks for medication suggest him some medicines and ask him to consult a doctor." },
      ...messages.map(msg => ({ role: msg.sender === 'user' ? "user" : "assistant", content: msg.text }))
    ];
  
    try {
      const completion = await cohere.chat({
        model: "command-r-plus",
        messages: apiMessages,
        max_tokens: 200,
        temperature: 0.7
      });
      
      const botResponse = completion.message.content[0].text;
      res.json({ response: botResponse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'API error' });
    }
});

router.post('/diseaseprediction', async (req, res) => {
    const { messages, userMessage } = req.body; 
    const apiMessages = [
      { role: "system", content: "You are a doctor, you ask different questions from the user to know about different symptoms they have and predict what disease they have. Done ask multiple questions at once, only ask one question at a time. You can ask upto 10 questions or less. Start the conversation with a how are you doing." },
      ...messages.map(msg => ({ role: msg.sender === 'user' ? "user" : "assistant", content: msg.text }))
    ];
  
    try {
      const completion = await cohere.chat({
        model: "command-r-plus",
        messages: apiMessages,
        temperature: 0.9
      });
      
      const botResponse = completion.message.content[0].text;
      res.json({ response: botResponse });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'API error' });
    }
});

module.exports = router;
