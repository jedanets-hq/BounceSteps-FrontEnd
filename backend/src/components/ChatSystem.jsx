import React, { useState, useEffect, useRef } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { useAuth } from '../contexts/AuthContext';

const ChatSystem = ({ isOpen, onClose, chatType = 'ai', recipientId = null, recipientName = '' }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Mock AI responses for different service categories
  const aiResponses = {
    accommodation: [
      "I can help you find the perfect accommodation! What type of stay are you looking for - luxury hotels, budget hostels, or unique local experiences?",
      "Based on your preferences, I recommend checking out our safari lodges in Serengeti or beachfront resorts in Zanzibar.",
      "For accommodation, consider factors like location, amenities, and your budget. Would you like me to show you some options?"
    ],
    transportation: [
      "For transportation in Tanzania, we offer various options including private transfers, group shuttles, and domestic flights.",
      "I recommend booking transportation in advance, especially during peak season. What's your destination and travel dates?",
      "Our transportation partners provide safe and reliable services. Would you like to see available options for your route?"
    ],
    tours: [
      "Tanzania offers incredible tour experiences! Are you interested in wildlife safaris, cultural tours, or adventure activities?",
      "Popular tours include Serengeti safari, Kilimanjaro trekking, and Stone Town cultural walks. What interests you most?",
      "I can help you plan a custom tour based on your interests and duration. What would you like to explore?"
    ],
    general: [
      "Welcome to iSafari Global! I'm here to help you plan your perfect Tanzanian adventure.",
      "I can assist you with accommodation, transportation, tours, and local experiences. What would you like to know?",
      "Feel free to ask me anything about our services, destinations, or travel tips for Tanzania!"
    ]
  };

  // Initialize with welcome message for AI chat
  useEffect(() => {
    if (chatType === 'ai' && messages.length === 0) {
      setMessages([{
        id: 1,
        sender: 'ai',
        content: "Hello! I'm your iSafari AI assistant. I can help you with questions about our services, destinations, and travel planning. What would you like to know?",
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  }, [chatType, messages.length]);

  // Mock customer messages for service providers
  useEffect(() => {
    if (chatType === 'customer' && messages.length === 0) {
      const mockCustomerMessages = [
        {
          id: 1,
          sender: 'customer',
          content: `Hi! I'm interested in your ${recipientName} service. Could you provide more details about availability and pricing?`,
          timestamp: new Date(Date.now() - 3600000),
          type: 'text'
        },
        {
          id: 2,
          sender: 'provider',
          content: "Hello! Thank you for your interest. I'd be happy to help you with details about our service.",
          timestamp: new Date(Date.now() - 3000000),
          type: 'text'
        }
      ];
      setMessages(mockCustomerMessages);
    }
  }, [chatType, recipientName, messages.length]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getAIResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    let category = 'general';
    
    if (message.includes('hotel') || message.includes('accommodation') || message.includes('lodge')) {
      category = 'accommodation';
    } else if (message.includes('transport') || message.includes('flight') || message.includes('car')) {
      category = 'transportation';
    } else if (message.includes('tour') || message.includes('safari') || message.includes('kilimanjaro')) {
      category = 'tours';
    }

    const responses = aiResponses[category];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      sender: chatType === 'ai' ? 'user' : 'provider',
      content: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate AI response or customer response
    if (chatType === 'ai') {
      setIsTyping(true);
      setTimeout(() => {
        const aiMessage = {
          id: messages.length + 2,
          sender: 'ai',
          content: getAIResponse(newMessage),
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
      }, 1500);
    } else {
      // Simulate customer response
      setTimeout(() => {
        const customerResponse = {
          id: messages.length + 2,
          sender: 'customer',
          content: "Thank you for the information! That sounds great. When would be the best time to book?",
          timestamp: new Date(),
          type: 'text'
        };
        setMessages(prev => [...prev, customerResponse]);
      }, 2000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <Icon 
              name={chatType === 'ai' ? 'Bot' : 'MessageCircle'} 
              size={24} 
              className="text-primary" 
            />
            <div>
              <h3 className="font-semibold text-foreground">
                {chatType === 'ai' ? 'AI Assistant' : `Chat with ${recipientName}`}
              </h3>
              <p className="text-sm text-muted-foreground">
                {chatType === 'ai' ? 'Ask me anything about our services' : 'Customer Support Chat'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === 'user' || message.sender === 'provider' 
                  ? 'justify-end' 
                  : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === 'user' || message.sender === 'provider'
                    ? 'bg-primary text-primary-foreground'
                    : message.sender === 'ai'
                    ? 'bg-muted text-foreground'
                    : 'bg-blue-100 text-blue-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                chatType === 'ai' 
                  ? "Ask me about services, destinations, or travel tips..." 
                  : "Type your message..."
              }
              className="flex-1 resize-none border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              rows="2"
            />
            <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
              <Icon name="Send" size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSystem;
