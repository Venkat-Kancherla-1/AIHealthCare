import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/CompleteProfile.css';

function CompleteProfile() {
  const [formData, setFormData] = useState({
    age: '',
    height: '',
    weight: '',
    gender: '',
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

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/auth/info', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user info');

        const data = await response.json();
        setFormData(data);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchUserInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleGenderChange = (e) => {
    const { value } = e.target;
    handleChange(e);
    setFormData({
      ...formData,
      gender: value,
      pregnant: value === 'male' ? false : formData.pregnant,
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
      <label htmlFor="age">Age</label>
      <input type="number" id="age" name="age" value={formData.age || ''} onChange={handleChange} required />
      
      <label htmlFor="height">Height (cm)</label>
      <input type="number" id="height" name="height" value={formData.height || ''} onChange={handleChange} required />
      
      <label htmlFor="gender">Gender</label>
      <select id="gender" name="gender" value={formData.gender || ''} onChange={handleGenderChange} required>
        <option value="" disabled>Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
        <option value="prefer_not_to_say">Prefer not to say</option>
      </select>
      
      <label htmlFor="weight">Weight (kg)</label>
      <input type="number" id="weight" name="weight" value={formData.weight || ''} onChange={handleChange} required />
      
      <label htmlFor="medicalConditions">Medical Conditions</label>
      <input type="text" id="medicalConditions" name="medicalConditions" value={formData.medicalConditions || ''} onChange={handleChange} />
      
      <label htmlFor="allergies">Allergies</label>
      <input type="text" id="allergies" name="allergies" value={formData.allergies || ''} onChange={handleChange} />
      
      <div className="lifestyle-options">
        <label htmlFor="pregnant" className="pregnant-label">
          <input
            type="checkbox"
            id="pregnant"
            name="pregnant"
            checked={formData.pregnant}
            onChange={handleChange}
            disabled={formData.gender === 'male' || formData.gender === ''}
          /> Pregnant
        </label>
      </div>
      
      <label htmlFor="wakeup">Wakeup Time</label>
      <input type="time" id="wakeup" name="wakeup" value={formData.wakeup || ''} onChange={handleChange} />
      
      <label htmlFor="sleep">Sleep Time</label>
      <input type="time" id="sleep" name="sleep" value={formData.sleep || ''} onChange={handleChange} />
      
      <div className="lifestyle-options">
        <label htmlFor="smoke">
          <input type="checkbox" id="smoke" name="smoke" checked={formData.smoke} onChange={handleChange} /> Smoke
        </label>
        <label htmlFor="drinks">
          <input type="checkbox" id="drinks" name="drinks" checked={formData.drinks} onChange={handleChange} /> Drinks
        </label>
      </div>
      
      <label htmlFor="diet">Diet Type</label>
      <input type="text" id="diet" name="diet" value={formData.diet || ''} onChange={handleChange} />
      
      <label htmlFor="foodToAvoid">Food to Avoid</label>
      <input type="text" id="foodToAvoid" name="foodToAvoid" value={formData.foodToAvoid || ''} onChange={handleChange} />
      
      <label htmlFor="physicalLimitations">Physical Limitations</label>
      <input type="text" id="physicalLimitations" name="physicalLimitations" value={formData.physicalLimitations || ''} onChange={handleChange} />
      
      <label htmlFor="fitnessGoal">Fitness Goal</label>
      <input type="text" id="fitnessGoal" name="fitnessGoal" value={formData.fitnessGoal || ''} onChange={handleChange} />
      
      <button type="submit">Submit</button>
    </form>
        
    </div>
  );
}

export default CompleteProfile;
