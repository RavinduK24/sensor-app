import React, { useState } from 'react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm VisionHomes' AI assistant. How can I help you find your perfect home?",
      sender: 'bot'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (input.trim()) {
      // Add user message
      const userMessage = {
        id: messages.length + 1,
        text: input,
        sender: 'user'
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Simulate bot response
      setTimeout(() => {
        const botResponses = [
          "That's a great question! Let me find the perfect property for you.",
          "I found some amazing properties that match your criteria!",
          "Would you like me to show you properties with high comfort scores?",
          "Let me connect you with one of our agents for more details.",
          "You can also try using our advanced search filters for more options."
        ];
        const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
        setMessages(prev => [...prev, {
          id: prev.length + 1,
          text: randomResponse,
          sender: 'bot'
        }]);
      }, 500);
    }
  };

  return (
    <>
      {/* Assistant Button */}
      <button
        className={`ai-assistant-btn ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Assistant"
      >
        <span className="assistant-icon">🤖</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="ai-assistant-window">
          <div className="assistant-header">
            <h3>🤖 VisionHomes Assistant</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="assistant-messages">
            {messages.map(msg => (
              <div key={msg.id} className={`message ${msg.sender}`}>
                {msg.sender === 'bot' && <span className="bot-icon">🤖</span>}
                <p>{msg.text}</p>
              </div>
            ))}
          </div>

          <div className="assistant-input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              className="assistant-input"
            />
            <button
              onClick={handleSendMessage}
              className="btn-send-message"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
