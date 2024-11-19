// src/App.js
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from './pages/HomePage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import Navbar from './Navbar';
import {jwtDecode} from 'jwt-decode';
import CompleteProfile from './pages/CompleteProfile';
import HealthCareCenter from './pages/HealthCareCenter';
import DailyActivityPlanner from './pages/DailyActivityPlanner';
import DiseasePrediction from './pages/DiseasePrediction';
import MedicineManager from './pages/MedicineManager';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isTokenExpired = decoded.exp * 1000 < Date.now();
        setIsAuthenticated(!isTokenExpired);

        if (isTokenExpired) {
          localStorage.removeItem('token');
        }
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem('token'); 
      }
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/healthcare-center" element={isAuthenticated ? <HealthCareCenter /> : <SignUp />} />
        <Route path="/daily-activity-planner" element={isAuthenticated ? <DailyActivityPlanner /> : <SignUp />} />
        <Route path="/disease-prediction" element={isAuthenticated ? <DiseasePrediction /> : <SignUp />} />
        <Route path="/medicine-manager" element={isAuthenticated ? <MedicineManager /> : <SignUp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
