// src/pages/HomePage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/HomePage.css';
import HealthCareCenterIcon from '../assets/health-care.jpg';
import MedicalRemaniderIcon from '../assets/medical-remainder.jpg';
import DiseasePredictionIcon from '../assets/disease-prediction.jpg';
import DailyActivityIcon from '../assets/daily-activity.jpg';


function HomePage() {
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="home-page-container">
      <div className="button-grid">
        <div className="button-item" onClick={() => handleNavigation('/healthcare-center')}>
          <img src={HealthCareCenterIcon} alt="Health Care Center" />
          <p>Health Care Center</p>
        </div>
        <div className="button-item" onClick={() => handleNavigation('/daily-activity-planner')}>
          <img src={DailyActivityIcon} alt="Daily Activity Planner" />
          <p>Daily Activity Planner</p>
        </div>
        <div className="button-item" onClick={() => handleNavigation('/disease-prediction')}>
          <img src={DiseasePredictionIcon} alt="Disease Prediction" />
          <p>Disease Prediction</p>
        </div>
        {/* <div className="button-item" onClick={() => handleNavigation('/todays-meal')}>
          <img src={MealPlannerIcon} alt="Today's Meal" />
          <p>Today's Meal</p>
        </div> */}
        <div className="button-item" onClick={() => handleNavigation('/medicine-manager')}>
          <img src={MedicalRemaniderIcon} alt="Medicine Manager" />
          <p>Medicine Manager</p>
        </div>
        {/* <div className="button-item" onClick={() => handleNavigation('/calory-intake-calculator')}>
          <img src={CaloryIcon} alt="Calory Intake Calculator" />
          <p>Calory Intake Calculator</p>
        </div> */}
      </div>
    </div>
  );
}

export default HomePage;