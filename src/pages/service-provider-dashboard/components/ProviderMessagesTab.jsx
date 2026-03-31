import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { messagesAPI } from '../../../utils/api';

const ProviderMessagesTab = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const messagesEndRef = useRef(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('isafari_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages();
    }
  }, [selectedConversation]);

  // Handle mobile view detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      
      const data = await messagesAPI.getConversations();
      
      if (data.success) {
        setConversations(data.conversations || []);
      } else {
        console.error('Failed to fetch conversations:', data.message);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const data = await messagesAPI.getMessages(
        selectedConversation.traveller_id,
        selectedConversation.service_id || null
      );
      
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        console.error('Failed to fetch messages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      
      const data = await messagesAPI.sendMessage(
        selectedConversation.traveller_id,
        newMessage.trim(),
        selectedConversation.service_id || null
      );
      
      if (data.success) {
        setNewMessage('');
        fetchMessages(); // Refresh messages
        fetchConversations(); // Refresh conversations list
      } else {
        alert('Failed to send message: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[80vh] min-h-[600px] bg-gray-100 rounded-2xl shadow-lg overflow-hidden flex">
      {/* Left Sidebar - Conversations List */}
      <div className={`${
        isMobileView && selectedConversation ? 'hidden' : 'flex'
      } ${isMobileView ? 'w-full' : 'w-80'} border-r border-white/20 flex-col bg-white`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-primary text-white">
          <h2 className="text-lg font-semibold">Messages</h2>
          <div className="flex items-center gap-1">
            <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
              <Icon name="Search" size={18} className="text-white" />
            </button>
            <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
              <Icon name="MoreVertical" size={18} className="text-white" />
            </button>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto bg-white">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="MessageCircle" size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 font-medium mb-1">No messages yet</p>
              <p className="text-sm text-gray-500">Travelers will message you about your services</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={`${conv.traveller_id}-${conv.service_id || 'general'}`}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 text-left transition-all duration-200 hover:bg-gray-50 border-b border-gray-100 ${
                  selectedConversation?.traveller_id === conv.traveller_id && 
                  selectedConversation?.service_id === conv.service_id
                    ? 'bg-primary/5 border-l-4 border-l-primary'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-semibold text-sm">
                        {(conv.traveller_name || 'T').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Online status indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 truncate text-sm">
                        {conv.traveller_name || 'Traveler'}
                      </p>
                      <span className="text-xs text-gray-500">
                        {new Date(conv.last_message_time).toLocaleTimeString('en-US', { 
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 truncate pr-2">
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-white text-xs font-medium rounded-full px-2 py-0.5 min-w-[20px] text-center">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Active Chat View */}
      <div className={`${
        isMobileView && !selectedConversation ? 'hidden' : 'flex'
      } flex-1 flex-col bg-gray-50`}>
        {selectedConversation ? (
          <>
            {/* Chat Header - Sticky Top */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-primary text-white sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                {isMobileView && (
                  <button 
                    onClick={handleBackToConversations}
                    className="p-2 hover:bg-white/10 rounded-full transition-all duration-200 -ml-1"
                  >
                    <Icon name="ArrowLeft" size={20} className="text-white" />
                  </button>
                )}
                
                {/* User avatar and info */}
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {(selectedConversation.traveller_name || 'T').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white text-sm">
                    {selectedConversation.traveller_name || 'Traveler'}
                  </h3>
                  <p className="text-xs text-white/80">
                    {selectedConversation.service_title ? selectedConversation.service_title : 'Online'}
                  </p>
                </div>
              </div>
              
              {/* Action icons */}
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
                  <Icon name="Phone" size={18} className="text-white" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
                  <Icon name="Video" size={18} className="text-white" />
                </button>
                <button className="p-2 hover:bg-white/10 rounded-full transition-all duration-200">
                  <Icon name="MoreVertical" size={18} className="text-white" />
                </button>
              </div>
            </div>

            {/* Chat Body - Messages with WhatsApp-style bubbles */}
            <div className="flex-1 overflow-y-auto px-3 py-4 bg-gradient-to-b from-gray-50 to-gray-100">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Icon name="MessageCircle" size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-900 font-medium mb-1">No messages yet</p>
                  <p className="text-sm text-gray-500">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message, index) => {
                    const isMyMessage = message.sender_type === 'provider';
                    const showDate = index === 0 || 
                      new Date(messages[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString();
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="text-[10px] text-gray-500 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                              {new Date(message.created_at).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric',
                                year: new Date(message.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                              })}
                            </span>
                          </div>
                        )}
                        
                        {/* WhatsApp-style Message Bubble */}
                        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${isMobileView ? 'max-w-[85%]' : 'max-w-[75%]'} flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`${isMobileView ? 'px-2 py-1.5' : 'px-3 py-2'} rounded-2xl shadow-sm ${
                                isMyMessage
                                  ? 'bg-primary text-white rounded-br-md'
                                  : 'bg-white/90 text-gray-900 rounded-bl-md'
                              }`}
                            >
                              <p className={`${isMobileView ? 'text-xs' : 'text-sm'} leading-relaxed break-words`}>
                                {message.message_text}
                              </p>
                            </div>
                            {/* Timestamp */}
                            <p className="text-[10px] text-gray-400 mt-1 px-1">
                              {new Date(message.created_at).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area - WhatsApp-style Bottom Bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-t border-white/10 bg-white sticky bottom-0">
              {/* Optional emoji/attachment buttons */}
              <button className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
                <Icon name="Smile" size={18} className="text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
                <Icon name="Paperclip" size={18} className="text-gray-600" />
              </button>
              
              {/* Input field */}
              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all duration-200"
                  disabled={sending}
                />
                
                {/* Send button */}
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="rounded-full px-4 py-2 bg-primary text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[40px]"
                >
                  {sending ? (
                    <Icon name="Loader2" size={16} className="animate-spin" />
                  ) : (
                    <Icon name="Send" size={16} />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          /* No conversation selected */
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Icon name="MessageCircle" size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a conversation</h3>
            <p className="text-gray-500 max-w-sm">Choose a conversation from the list to view messages and start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderMessagesTab;
