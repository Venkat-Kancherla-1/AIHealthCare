// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Navbar from './Navbar';
import CompleteProfile from './pages/CompleteProfile';
import HealthCareCenter from './pages/HealthCareCenter';
import DailyActivityPlanner from './pages/DailyActivityPlanner';
import DiseasePrediction from './pages/DiseasePrediction';
import TodaysMeal from './pages/TodaysMeal';
import MedicineManager from './pages/MedicineManager';
import CaloryIntakeCalculator from './pages/CaloryIntakeCalculator';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/healthcare-center" element={<HealthCareCenter />} />
        <Route path="/daily-activity-planner" element={<DailyActivityPlanner />} />
        <Route path="/disease-prediction" element={<DiseasePrediction />} />
        <Route path="/todays-meal" element={<TodaysMeal />} />
        <Route path="/medicine-manager" element={<MedicineManager />} />
        <Route path="/calory-intake-calculator" element={<CaloryIntakeCalculator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
