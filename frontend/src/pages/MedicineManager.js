import React, { useState, useEffect } from 'react';
import './styles/MedicineManager.css';

function MedicineManager({ token }) {
  const [medicines, setMedicines] = useState([]);
  const [medicineName, setMedicineName] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch medicines on load
  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/get-medicine-reminders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setMedicines(data.reminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const addMedicine = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chat/set-medicine-reminder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ medicineName, time }),
      });
      const data = await response.json();
      setMedicines((prev) => [...prev, data.reminder]);
      setMedicineName('');
      setTime('');
    } catch (error) {
      console.error('Error adding medicine:', error);
    }
    setLoading(false);
  };

  const removeMedicine = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/chat/remove-medicine/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMedicines(medicines.filter((med) => med._id !== id));
    } catch (error) {
      console.error('Error removing medicine:', error);
    }
  };

  return (
    <div className="medicine-manager">
      <h1>Medicine Manager</h1>
      
      <div className="add-medicine-form">
        <input
          type="text"
          placeholder="Medicine Name"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        <button onClick={addMedicine} disabled={loading || !medicineName || !time}>+</button>
      </div>

      <ul className="medicine-list">
        {medicines.map((medicine) => (
          <li key={medicine._id} className="medicine-item">
            <span>{medicine.medicineName} at {medicine.time}</span> {/* Display time directly */}
            <input type="checkbox" checked={medicine.completed} readOnly />
            <button onClick={() => removeMedicine(medicine._id)}>Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MedicineManager;
