import React, { useEffect, useState } from 'react';
import './styles/DailyActivityPlanner.css';
import Icon1 from '../assets/1.jpg';
import Icon2 from '../assets/2.jpg';
import Icon3 from '../assets/3.jpg'; 
import Icon4 from '../assets/4.jpg';
import Icon5 from '../assets/5.jpg';
import Icon6 from '../assets/6.jpg'; 
import Icon7 from '../assets/7.jpg';

const icons = [Icon1, Icon2, Icon3, Icon4, Icon5, Icon6, Icon7];

function DailyActivityPlanner() {
  const [tasks, setTasks] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [hiddenCategories, setHiddenCategories] = useState([]);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/chat/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };
    fetchTasks();
  }, []);

  const handleTaskCompletion = async (category, taskName, completed) => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/chat/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: new Date().toISOString().split('T')[0],
          category,
          taskName,
          completed,
        }),
      });
      setTasks(prevTasks => ({
        ...prevTasks,
        [category]: prevTasks[category].map(item =>
          item.name === taskName ? { ...item, completed } : item
        )
      }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const toggleCategory = (category) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
      setHiddenCategories([]); // Show all categories when collapsed
    } else {
      setExpandedCategory(category);
      setHiddenCategories(Object.keys(tasks).filter(c => c !== category)); // Hide other categories when expanded
    }
  };

  const closeCategory = () => {
    setExpandedCategory(null);
    setHiddenCategories([]); // Reset hidden categories when closing the expanded category
  };

  if (!tasks) {
    return <div className="loading">Loading tasks...</div>;
  }

  const taskCategories = Object.keys(tasks).slice(3, -1);

  return (
    <div className="planner-container">
      <div className="task-list">
        {taskCategories.map((category, index) => (
          <div
            className={`task-category ${expandedCategory === category ? 'expanded' : ''} ${hiddenCategories.includes(category) ? 'hidden' : ''}`}
            key={category}
          >
            <div onClick={() => toggleCategory(category)} className="category-div">
              <img src={icons[index % icons.length]} alt="Category Icon" className="category-image" />
              <div className="task-heading">
                {category.replace(/([A-Z])/g, ' $1')}
              </div>
            </div>
            {expandedCategory === category && (<div className="close">
              <div className="Xbutton"> 
              <button onClick={closeCategory} className="close-btn">X</button>
              </div>
              <div className="task-items">
                {/* <button onClick={closeCategory} className="close-btn">X</button> */}
                {Array.isArray(tasks[category]) ? (
                  tasks[category].map((task, idx) => (
                    <div key={idx} className="task-item">
                      <label>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) =>
                            handleTaskCompletion(category, task.name, e.target.checked)
                          }
                        />
                        <span className={`task-name ${task.completed ? 'completed' : ''}`}>{task.name}</span>
                      </label>
                    </div>
                  ))
                ) : (
                  <div className="task-item">No tasks available</div>
                )}
              </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DailyActivityPlanner;
