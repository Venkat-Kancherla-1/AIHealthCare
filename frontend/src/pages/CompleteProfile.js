import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/CompleteProfile.css';

function CompleteProfile() {
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    medicalConditions: '',
    allergies: '',
    pregnant: false,
    wakeup: '',
    sleep: '',
    smoke: false,
    drinks: false,
    diet: '',
    foodToAvoid: '',
    physicalLimitations: '',
    fitnessGoal: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...formData, completed: 1 }),
      });

      if (!response.ok) throw new Error('Failed to complete profile');

      navigate('/');
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="complete-profile-container">
      <h2>Complete Your Profile</h2>
      <form className="complete-profile-form" onSubmit={handleSubmit}>
        <input type="number" name="age" placeholder="Age" onChange={handleChange} required />
        <input type="number" name="height" placeholder="Height (cm)" onChange={handleChange} required />
        <input type="number" name="weight" placeholder="Weight (kg)" onChange={handleChange} required />
        <input type="text" name="medicalConditions" placeholder="Medical Conditions" onChange={handleChange} />
        <input type="text" name="allergies" placeholder="Allergies" onChange={handleChange} />
        <label>
          <input type="checkbox" name="pregnant" onChange={handleChange} /> Pregnant
        </label>
        <input type="time" name="wakeup" placeholder="Wakeup Time" onChange={handleChange} />
        <input type="time" name="sleep" placeholder="Sleep Time" onChange={handleChange} />
        <label>
          <input type="checkbox" name="smoke" onChange={handleChange} /> Smoke
        </label>
        <label>
          <input type="checkbox" name="drinks" onChange={handleChange} /> Drinks
        </label>
        <input type="text" name="diet" placeholder="Diet Type" onChange={handleChange} />
        <input type="text" name="foodToAvoid" placeholder="Food to Avoid" onChange={handleChange} />
        <input type="text" name="physicalLimitations" placeholder="Physical Limitations" onChange={handleChange} />
        <input type="text" name="fitnessGoal" placeholder="Fitness Goal" onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CompleteProfile;
