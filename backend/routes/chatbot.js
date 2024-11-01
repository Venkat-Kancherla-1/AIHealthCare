const express = require('express');
const User = require('../models/User');
const Info = require('../models/Info');
const router = express.Router();
const { CohereClientV2 } = require('cohere-ai');
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token is invalid' });

    req.user = user;
    next();
  });
};

const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

router.post('/aichat', authenticateToken, async (req, res) => {
  const { messages, userMessage } = req.body;

  try {
    // Retrieve user details by username from the database
    const user = await Info.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userDetails = `
      Name: ${user.username || 'User'},
      Age: ${user.age || 'Not specified'},
      Height: ${user.height || 'Not specified'},
      Gender: ${user.gender || 'Not specified'},
      Weight: ${user.weight || 'Not specified'},
      KnownMedicalConditions: ${user.medicalConditions || 'Not specified'},
      Allergies: ${user.allergies || 'Not specified'},
      IsPregnant: ${user.pregnant || 'Not specified'},
      WakesUpAt: ${user.wakeup || 'Not specified'},
      SleepsAt: ${user.sleep || 'Not specified'},
      SmokingHabit: ${user.smoke || 'Not specified'},
      AlocholHabit: ${user.drinks || 'Not specified'},
      DietType: ${user.diet || 'Not specified'},
      FoodToAvoid: ${user.foodTOAvoid || 'Not specified'},
      PhysicalLimitations: ${user.physicalLimitations || 'Not specified'},
      FitnessGoal:${user.fitnessGoal || 'Not specified'},
    `;

    const apiMessages = [
      { 
        role: "system", 
        content: `You are a helpful health assistant for ${user.username || 'the user'}. Use the following details to personalize your responses:\n${userDetails}\nAnswer health-related questions, give straightforward advice, and suggest they consult a doctor if they ask for medication.` 
      },
      ...messages.map(msg => ({
        role: msg.sender === 'user' ? "user" : "assistant",
        content: msg.text
      }))
    ];

    // Send the user details with apiMessages to the Cohere API
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


router.post('/diseaseprediction', authenticateToken, async (req, res) => {
  const { messages, userMessage } = req.body;
  const user = await Info.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const userDetails = `
      Name: ${user.username || 'User'},
      Age: ${user.age || 'Not specified'},
      Height: ${user.height || 'Not specified'},
      Gender: ${user.gender || 'Not specified'},
      Weight: ${user.weight || 'Not specified'},
      KnownMedicalConditions: ${user.medicalConditions || 'Not specified'},
      Allergies: ${user.allergies || 'Not specified'},
      IsPregnant: ${user.pregnant || 'Not specified'},
      WakesUpAt: ${user.wakeup || 'Not specified'},
      SleepsAt: ${user.sleep || 'Not specified'},
      SmokingHabit: ${user.smoke || false},
      AlocholHabit: ${user.drinks || false},
      DietType: ${user.diet || 'Not specified'},
      FoodToAvoid: ${user.foodTOAvoid || 'Not specified'},
      PhysicalLimitations: ${user.physicalLimitations || 'Not specified'},
      FitnessGoal:${user.fitnessGoal || 'Not specified'},
    `;

  const apiMessages = [
    { role: "system", content: `You are a doctor for ${user.username || 'the user'}. Use the following details to personalize your responses:\n${userDetails}\n. Ask different questions from the user to learn about their symptoms and predict what disease they might have. Don't ask multiple questions at once; ask only one question at a time. You can ask up to 10 questions or fewer, starting with 'How are you doing?'` },
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
