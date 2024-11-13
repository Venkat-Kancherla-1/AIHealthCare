import './Navbar.css';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

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

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setIsAuthenticated(false);
    navigate('/signin');
  };

  return (
    <nav>
      <h1>Health Mate</h1>
      <Link to="/">Home</Link>
      
      {isAuthenticated ? (
        <>
          <button onClick={() => navigate('/complete-profile')}>
            <img src="path/to/profile-image.jpg" alt="Profile" className="profile-image" />
          </button>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <button onClick={() => navigate('/signin')}>Sign In</button>
      )}
    </nav>
  );
}

export default Navbar;
