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
        <input type="number" name="age" value={formData.age || ''} placeholder="Age" onChange={handleChange} required />
        <input type="number" name="height" value={formData.height || ''} placeholder="Height (cm)" onChange={handleChange} required />
        <select name="gender" value={formData.gender || ''} onChange={handleGenderChange} required>
          <option value="" disabled>Gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        <input type="number" name="weight" value={formData.weight || ''} placeholder="Weight (kg)" onChange={handleChange} required />
        <input type="text" name="medicalConditions" value={formData.medicalConditions || ''} placeholder="Medical Conditions" onChange={handleChange} />
        <input type="text" name="allergies" value={formData.allergies || ''} placeholder="Allergies" onChange={handleChange} />
        <div className="lifestyle-options">
          <label className="pregnant-label">
            <input
              type="checkbox"
              name="pregnant"
              checked={formData.pregnant}
              onChange={handleChange}
              disabled={formData.gender === 'male' || formData.gender === ''}
            /> Pregnant
          </label>
        </div>
        <input type="time" name="wakeup" value={formData.wakeup || ''} placeholder="Wakeup Time" onChange={handleChange} />
        <input type="time" name="sleep" value={formData.sleep || ''} placeholder="Sleep Time" onChange={handleChange} />
        <div className="lifestyle-options">
          <label>
            <input type="checkbox" name="smoke" checked={formData.smoke} onChange={handleChange} /> Smoke
          </label>
          <label>
            <input type="checkbox" name="drinks" checked={formData.drinks} onChange={handleChange} /> Drinks
          </label>
        </div>
        <input type="text" name="diet" value={formData.diet || ''} placeholder="Diet Type" onChange={handleChange} />
        <input type="text" name="foodToAvoid" value={formData.foodToAvoid || ''} placeholder="Food to Avoid" onChange={handleChange} />
        <input type="text" name="physicalLimitations" value={formData.physicalLimitations || ''} placeholder="Physical Limitations" onChange={handleChange} />
        <input type="text" name="fitnessGoal" value={formData.fitnessGoal || ''} placeholder="Fitness Goal" onChange={handleChange} />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default CompleteProfile;
