const express = require('express');
const User = require('../models/User');
const Info = require('../models/Info');
const ChatSummary = require('../models/ChatSummary');
const Medicine = require('../models/Medicine');
const router = express.Router();
const { CohereClientV2 } = require('cohere-ai');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const Task = require('../models/Task');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

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

async function updateChatSummary(username, diseasesArray, symptomsArray) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let chatSummary = await ChatSummary.findOne({ username, date: today });

    if (chatSummary) {
      chatSummary.diseases = Array.from(new Set([...chatSummary.diseases, ...diseasesArray]));
      chatSummary.symptoms = Array.from(new Set([...chatSummary.symptoms, ...symptomsArray]));
      await chatSummary.save();
    } else {
      chatSummary = new ChatSummary({
        username,
        date: today,
        diseases: Array.from(new Set(diseasesArray)),
        symptoms: Array.from(new Set(symptomsArray)),
      });
      await chatSummary.save();
    }

    console.log('Chat summary updated or created successfully');
  } catch (error) {
    console.error('Error updating or creating chat summary:', error);
  }
}

router.post('/aichat', authenticateToken, async (req, res) => {
  const { messages, userMessage } = req.body;
  const lastUserMessage = messages
  .filter(msg => msg.sender === 'user')
  .pop()?.text || 'No user message found';


  try {
    const user = await Info.findOne({ username: req.user.username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const today = new Date();
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 5);
    
    const chatSummaries = await ChatSummary.find({
      username: user.username,
      date: {
        $gte: fiveDaysAgo,
        $lt: today
      }
    });

    const summaryDetails = chatSummaries.map(summary => `
      Date: ${summary.date.toDateString()},
      Symptoms: [${summary.symptoms.join(', ') || 'None'}],
      Diseases: [${summary.diseases.join(', ') || 'None'}]
    `).join('\n');

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
      AlcoholHabit: ${user.drinks || 'Not specified'},
      DietType: ${user.diet || 'Not specified'},
      FoodToAvoid: ${user.foodTOAvoid || 'Not specified'},
      PhysicalLimitations: ${user.physicalLimitations || 'Not specified'},
      FitnessGoal: ${user.fitnessGoal || 'Not specified'},
      Recent Activity (Last 5 Days): \n${summaryDetails}
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

    const diseaseDetectionMessage = [
      { 
        role: "user", 
        content: `Identify only the diseases mentioned in the following text without providing extra information: "${lastUserMessage}". Just give the diseases mentioned in an array format. ` 
      }
    ];

    const diseaseCompletion = await cohere.chat({
      model: "command-r-plus",
      messages: diseaseDetectionMessage,
      temperature: 0.2
    });

    const detectedDiseases = diseaseCompletion.message.content;
    const symptomsDetectionMessage = [
      { 
        role: "user", 
        content: `Identify only the symptoms mentioned in the following text without providing extra information: "${lastUserMessage}". If there are no symptoms metioned in msg then give an empty array. Just give the symptoms mentioned in an array format. ` 
      }
    ];

    const symptomsCompletion = await cohere.chat({
      model: "command-r-plus",
      messages: symptomsDetectionMessage,
      temperature: 0.2
    });

    const detectedSymptoms = symptomsCompletion.message.content;

    let diseasesArray;
    let symptomsArray;

    try{
      let diseasesText = detectedDiseases[0].text;
      let symptomsText = detectedSymptoms[0].text;

      try {
          diseasesArray = JSON.parse(diseasesText);
      } catch {
          diseasesArray = eval(diseasesText);
      }

      try {
          symptomsArray = JSON.parse(symptomsText);
      } catch {
          symptomsArray = eval(symptomsText);
      }
    }
    catch{

    }
    updateChatSummary(user.username, diseasesArray, symptomsArray);

    console.log(diseasesArray);
    console.log(symptomsArray);
    res.json({ response: botResponse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'API error' });
  }
});


router.post('/diseaseprediction', authenticateToken, async (req, res) => {
  const { messages, userMessage } = req.body;
  const lastUserMessage = messages
  .filter(msg => msg.sender === 'user')
  .pop()?.text || 'No user message found';
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

    const diseaseDetectionMessage = [
      { 
        role: "user", 
        content: `Identify only the diseases mentioned in the following text without providing extra information: "${lastUserMessage}". Just give the diseases mentioned in an array format. ` 
      }
    ];

    const diseaseCompletion = await cohere.chat({
      model: "command-r-plus",
      messages: diseaseDetectionMessage,
      temperature: 0.2
    });

    const detectedDiseases = diseaseCompletion.message.content;
    const symptomsDetectionMessage = [
      { 
        role: "user", 
        content: `Identify only the symptoms mentioned in the following text without providing extra information: "${lastUserMessage}". If there are no symptoms metioned in msg then give an empty array. Just give the symptoms mentioned in an array format. ` 
      }
    ];

    const symptomsCompletion = await cohere.chat({
      model: "command-r-plus",
      messages: symptomsDetectionMessage,
      temperature: 0.2
    });

    const detectedSymptoms = symptomsCompletion.message.content;

    let diseasesArray;
    let symptomsArray;

    try{
      let diseasesText = detectedDiseases[0].text;
      let symptomsText = detectedSymptoms[0].text;

      try {
          diseasesArray = JSON.parse(diseasesText);
      } catch {
          diseasesArray = eval(diseasesText);
      }

      try {
          symptomsArray = JSON.parse(symptomsText);
      } catch {
          symptomsArray = eval(symptomsText);
      }
    }
    catch{

    }
    updateChatSummary(user.username, diseasesArray, symptomsArray);

    res.json({ response: botResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'API error' });
  }
});

router.post('/tasks', authenticateToken, async (req, res) => {
  const user = await Info.findOne({ username: req.user.username });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of the day

  // Check if tasks are already created for today
  const existingTasks = await Task.findOne({
    username: user.username,
    date: today
  });

  if (existingTasks) {
    console.log(existingTasks)
    return res.json({ tasks: existingTasks });
  }

  const fiveDaysAgo = new Date(today);
  fiveDaysAgo.setDate(today.getDate() - 5);

  const chatSummaries = await ChatSummary.find({
    username: user.username,
    date: {
      $gte: fiveDaysAgo,
      $lt: today
    }
  });

  const summaryDetails = chatSummaries.map(summary => `
    Date: ${summary.date.toDateString()},
    Symptoms: [${summary.symptoms.join(', ') || 'None'}],
    Diseases: [${summary.diseases.join(', ') || 'None'}]
  `).join('\n');

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
    AlcoholHabit: ${user.drinks || false},
    DietType: ${user.diet || 'Not specified'},
    FoodToAvoid: ${user.foodTOAvoid || 'Not specified'},
    PhysicalLimitations: ${user.physicalLimitations || 'Not specified'},
    FitnessGoal: ${user.fitnessGoal || 'Not specified'},
    Recent Activity (Last 5 Days): \n${summaryDetails}
  `;

  const taskGenerationMessage = [
    { 
      role: "user", 
      content: `Using the following user details, detected symptoms, diseases, and previous tasks, generate a JSON object with daily tasks for a day categorized as follows:
      1. Fitness and exercise
      2. Diet and nutrition
      3. Mental wellness (based on age, gender, and medical history)
      4. Symptom-based suggestions
      5. Disease management tasks
      6. Daily routine synchronization
      7. Habit adjustment

      User Details: ${userDetails}

      Please respond with the task list in JSON format, structured according to the above categories without any extra messages, only the JSON.
      Be more specific in case of the tasks. Avoid tasks like join a gym and stick to home tasks and mention breifly and precisely what to for example 10minutes of yoga like this.
      And in the json the names are fitness, diet, mental, symptom, disease, daily, habit with case sensitive and only give the json object without any other content`
    }
  ];

  try {
    const taskCompletion = await cohere.chat({
      model: "command-r-plus",
      messages: taskGenerationMessage,
      temperature: 0.5
    });
    // console.log(taskCompletion.message.content[0].text)
    generatedTasks = JSON.parse(taskCompletion.message.content[0].text);
    // console.log(generatedTasks);

    const taskEntry = new Task({
      username: user.username,
      date: today,
      FitnessAndExercise: (generatedTasks['fitness'] || []).map(task => ({ name: task, completed: false })),
      DietAndNutrition: (generatedTasks['diet'] || []).map(task => ({ name: task, completed: false })),
      MentalWellness: (generatedTasks['mental'] || []).map(task => ({ name: task, completed: false })),
      SymptomManagement: (generatedTasks['symptom'] || []).map(task => ({ name: task, completed: false })),
      DiseaseManagement: (generatedTasks['disease'] || []).map(task => ({ name: task, completed: false })),
      DailyRoutineSync: (generatedTasks['daily'] || []).map(task => ({ name: task, completed: false })),
      HabitAdjustment: (generatedTasks['habit'] || []).map(task => ({ name: task, completed: false }))
    });
    

    await taskEntry.save();


    const existingTasks = await Task.findOne({
      username: user.username,
      date: today
    });
    return res.json({ tasks: existingTasks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Task generation or database error' });
  }
});

router.post('/update', authenticateToken, async (req, res) => {
  const { date, category, taskName, completed } = req.body;
  const username = req.user.username;
  const dateOnly = new Date();
  dateOnly.setHours(0, 0, 0, 0);

  try {
    const task = await Task.findOne({ username, date: dateOnly });

    if (task && task[category]) {
      const taskItem = task[category].find(item => item.name === taskName);
      if (taskItem) {
        taskItem.completed = completed;
        await task.save();
        return res.json({ success: true });
      }
    }
    res.status(404).json({ success: false, message: 'Task not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/set-medicine-reminder', authenticateToken, async (req, res) => {
  const { medicineName, time } = req.body;
  console.log(req.user.username);

  const user = await User.findOne({ username: req.user.username });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const email = user.email;
  const number = user.number;

  const reminder = new Medicine({
    username: user.username,
    email: email,
    number: number,
    medicineName,
    time,
  });

  try {
    await reminder.save();
    res.status(200).json({ message: 'Medicine reminder set successfully', reminder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error setting reminder' });
  }
});


router.get('/get-medicine-reminders', authenticateToken, async (req, res) => {
  const user = await User.findOne({ username: req.user.username });

  if (!user) return res.status(404).json({ message: 'User not found' });

  try {
    const reminders = await Medicine.find({ username: user.username });
    res.status(200).json({ reminders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error retrieving reminders' });
  }
});

router.delete('/remove-medicine/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await Medicine.findByIdAndDelete(req.params.id);
    if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
    res.status(200).json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error deleting reminder' });
  }
});


cron.schedule('* * * * *', async () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${hours}:${minutes}`;

  const reminders = await Medicine.find({
    time: currentTime,
  });

  reminders.forEach(async (reminder) => {
    console.log(`Reminder for ${reminder.username}: Take your ${reminder.medicineName} now.`);

    // Ensure the phone number has the +91 prefix
    const phoneNumber = `+91${reminder.number}`;

    console.log(`Sending SMS to: ${phoneNumber}`);

    // Send SMS using Twilio
    client.messages
      .create({
        body: `Dear ${reminder.username}, Please take your medicine ${reminder.medicineName} now.`,
        messagingServiceSid: 'MGf1e74899c13523414661c3a538b09737',
        to: phoneNumber,
      })
      .then((message) => console.log(`SMS sent successfully: ${message.sid}`))
      .catch((error) => console.error(`Failed to send SMS: ${error.message}`));

    console.log(reminder.email);

    // Sending email using nodemailer
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // use TLS
      auth: {
        user: process.env.gmail,
        pass: process.env.password,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const mailOptions = {
      from: process.env.mail,
      to: reminder.email,
      subject: 'Reminder',
      text: `Dear ${reminder.username}, Please take your medicine ${reminder.medicineName} at ${currentTime}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent successfully:', info.response);
      }
    });
  });
});



module.exports = router;
