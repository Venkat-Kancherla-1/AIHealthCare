const bcrypt = require('bcrypt');
const User = require('../models/User');
const Info = require('../models/Info');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { username, email, number, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, number, password: hashedPassword });
    const newInfo = new Info({username, completed:0, age:0, height:0, weight:0, medicalConditions:" ", allergies:" ", pregnant:false, 
      wakeup:" ", sleep:" ", smoke:false, drinks:false, diet:" ", foodTOAvoid:" ", physicalLimitations:" ", fitnessGoal:" "
    });
    await newInfo.save();
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error });
  }
};

exports.signin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const userInfo = await Info.findOne({ username: user.username });
    const token = jwt.sign({username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({
      message: 'Sign in successful',
      token,
      needsCompletion: userInfo ? userInfo.completed === 0 : true
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const id  = req.user.username;
  console.log(id);
  console.log(req.user);
  try {
    const updatedInfo = await Info.findOneAndUpdate(
      { username: id },
      { ...req.body },
      { new: true }
    );
    res.json({ message: 'Profile updated', updatedInfo });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error });
  }
};

exports.getUserInfo = async (req, res) => {
  try {
    const userInfo = await Info.findOne({ username: req.user.username });
    if (!userInfo) {
      return res.status(404).json({ message: 'User info not found' });
    }
    res.json(userInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// exports.getUserInfo = async (req, res) => {
//   try {
//     const userInfo = await Info.findOne({ username: req.user.username });
//     if (!userInfo) {
//       return res.json({
//         age: '',
//         height: '',
//         weight: '',
//         gender: '',
//         medicalConditions: '',
//         allergies: '',
//         pregnant: false,
//         wakeup: '',
//         sleep: '',
//         smoke: false,
//         drinks: false,
//         diet: '',
//         foodToAvoid: '',
//         physicalLimitations: '',
//         fitnessGoal: '',
//       });
//     }
//     res.json(userInfo);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
