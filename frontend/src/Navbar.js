import './Navbar.css';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';


function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
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

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  return (
    <nav className="navbar">
      <h1>Health Mate</h1>
      <div className="menu-toggle" onClick={toggleNav}>
        ☰
      </div>
      <ul className={`nav-links ${isNavOpen ? 'nav-links-open' : ''}`}>
  <li><Link to="/">Home</Link></li>
  {isAuthenticated ? (
    <>
      <li>
        <Link to="/complete-profile"> Profile
          {/* <img src="path/to/profile-image.jpg" alt="Profile" className="profile-image" /> */}
        </Link>
      </li>
      <li><button onClick={handleLogout}>Logout</button></li>
    </>
  ) : (
    <li><button onClick={() => navigate('/signin')}>Sign In</button></li>
  )}
</ul>

    </nav>
  );
}

export default Navbar;
