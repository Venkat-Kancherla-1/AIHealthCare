import React, { useState, useEffect, useRef } from 'react';
import './styles/HealthCareCenter.css';

const HealthCareCenter = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const chatBoxRef = useRef(null); // Create a ref for the chat box

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    // Add the user message to the messages array
    const newMessages = [...messages, { sender: 'user', text: userInput }];
    setMessages(newMessages);
    setUserInput('');

    try {
      // Send the entire conversation history to the backend
      const response = await fetch('http://localhost:5000/api/chat/aichat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages, // Send all messages to the backend
          userMessage: userInput // Also send the new user message
        }),
      });
      
      const data = await response.json();
      // Update messages with the bot response
      setMessages([...newMessages, { sender: 'bot', text: data.response }]);
    } catch (error) {
      console.error('Chatbot error:', error);
    }
  };

  // Effect to scroll to the bottom of the chat box when messages change
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight; // Scroll to the bottom
    }
  }, [messages]); // Run this effect whenever messages change

  return (
    <div className="chat-container">
      <h2>AI Health Assistant</h2>
      <div className="chat-box" ref={chatBoxRef}> {/* Attach the ref to the chat box */}
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask a health-related question..."
          required
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default HealthCareCenter;
