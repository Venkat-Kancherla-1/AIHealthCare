// src/pages/SignIn.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/SignIn.css';

function SignIn() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setError(null); // Reset any previous errors

    try {
      const response = await fetch('http://localhost:5000/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      setSuccess(data.message);
      localStorage.setItem('token', data.token);

      // Check user's completed status
      const userInfoResponse = await fetch('http://localhost:5000/api/auth/info', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });

      const userInfo = await userInfoResponse.json();
      console.log(userInfo);

      if (userInfo.completed === 0) {
        navigate('/complete-profile');
      } else {
        console.log(userInfo);
        navigate('/');
      }
      
      window.location.reload();
    } catch (error) {
      console.log(error);
      setError(error.message);
    }
  };

  return (
    <div className="signin-container">
      <h2>Sign In</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form className="signin-form" onSubmit={handleSubmit}>
        <input
          type="name"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default SignIn;
