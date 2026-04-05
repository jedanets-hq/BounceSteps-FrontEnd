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
        console.log('📦 [PROVIDER MESSAGES] Conversations received:', data.conversations);
        // Map the conversations to match expected format
        const mappedConversations = (data.conversations || []).map(conv => ({
          traveller_id: conv.otherUserId || conv.other_user_id,
          traveller_name: `${conv.first_name || ''} ${conv.last_name || ''}`.trim() || 'Traveler',
          service_id: conv.service_id || null,
          service_title: conv.service_title || null,
          last_message: conv.last_message || 'No messages yet',
          last_message_time: conv.last_message_time || new Date().toISOString(),
          unread_count: conv.unread_count || 0
        }));
        
        console.log('📋 [PROVIDER MESSAGES] Mapped conversations:', mappedConversations);
        setConversations(mappedConversations);
      } else {
        console.error('Failed to fetch conversations:', data.message);
        setConversations([]);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedConversation || !selectedConversation.traveller_id) {
      console.log('❌ [PROVIDER MESSAGES] No valid conversation selected');
      setMessages([]);
      return;
    }
    
    try {
      console.log('📥 [PROVIDER MESSAGES] Fetching messages for:', selectedConversation);
      
      const data = await messagesAPI.getMessages(
        selectedConversation.traveller_id,
        selectedConversation.service_id || null
      );
      
      if (data.success) {
        console.log('📦 [PROVIDER MESSAGES] Messages received:', data.messages);
        // Map messages to expected format
        const mappedMessages = (data.messages || []).map(msg => ({
          id: msg.id,
          message_text: msg.text || msg.message_text,
          sender_type: msg.senderType || msg.sender_type,
          created_at: msg.timestamp || msg.created_at
        }));
        
        console.log('📋 [PROVIDER MESSAGES] Mapped messages:', mappedMessages);
        setMessages(mappedMessages);
      } else {
        console.error('Failed to fetch messages:', data.message);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation || !selectedConversation.traveller_id) {
      console.log('❌ [PROVIDER MESSAGES] Cannot send message - missing data');
      return;
    }

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
    <div className="h-[80vh] min-h-[600px] bg-gray-100 dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden flex">
      {/* Left Sidebar - Conversations List */}
      <div className={`${
        isMobileView && selectedConversation ? 'hidden' : 'flex'
      } ${isMobileView ? 'w-full' : 'w-80'} border-r border-white/20 dark:border-gray-700 flex-col bg-white dark:bg-gray-800`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 dark:border-gray-700 bg-primary text-white">
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
        <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <Icon name="MessageCircle" size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">No messages yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Travelers will message you about your services</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={`${conv.traveller_id}-${conv.service_id || 'general'}`}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 text-left transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 ${
                  selectedConversation?.traveller_id === conv.traveller_id && 
                  selectedConversation?.service_id === conv.service_id
                    ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-l-primary'
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
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-sm">
                        {conv.traveller_name || 'Traveler'}
                      </p>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(conv.last_message_time).toLocaleTimeString('en-US', { 
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-600 dark:text-gray-400 truncate pr-2">
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
      } flex-1 flex-col bg-gray-50 dark:bg-gray-900`}>
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
            <div className={`flex-1 overflow-y-auto py-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 ${isMobileView ? 'px-3' : 'px-3'}`}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Icon name="MessageCircle" size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">No messages yet</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Send a message to start the conversation</p>
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
                            <span className="text-[10px] text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-700/80 px-3 py-1 rounded-full shadow-sm">
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
                        <div 
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                          style={{ width: isMobileView ? '100%' : 'auto' }}
                        >
                          <div 
                            className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}
                            style={{ 
                              width: isMobileView ? 'fit-content' : 'auto',
                              maxWidth: isMobileView ? '90%' : '75%'
                            }}
                          >
                            <div
                              className={`shadow-sm ${
                                isMyMessage
                                  ? 'bg-primary text-white'
                                  : 'bg-white/90 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                              }`}
                              style={{ 
                                padding: isMobileView ? '10px 14px' : '0.75rem 0.75rem',
                                borderRadius: isMobileView ? '12px' : '1rem',
                                width: isMobileView ? 'fit-content' : 'auto',
                                maxWidth: isMobileView ? '100%' : 'none',
                                overflow: 'visible',
                                boxSizing: 'border-box'
                              }}
                            >
                              <p 
                                className={`${isMobileView ? 'text-sm' : 'text-sm'} leading-relaxed`}
                                style={{ 
                                  wordWrap: 'break-word', 
                                  overflowWrap: 'break-word',
                                  whiteSpace: 'normal',
                                  margin: 0,
                                  padding: 0
                                }}
                              >
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
            <div className="flex items-center gap-2 px-3 py-2 border-t border-white/10 dark:border-gray-700 bg-white dark:bg-gray-800 sticky bottom-0">
              {/* Optional emoji/attachment buttons */}
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200">
                <Icon name="Smile" size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-all duration-200">
                <Icon name="Paperclip" size={18} className="text-gray-600 dark:text-gray-400" />
              </button>
              
              {/* Input field */}
              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200"
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
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 dark:bg-gray-900">
            <div className="w-24 h-24 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <Icon name="MessageCircle" size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Select a conversation</h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm">Choose a conversation from the list to view messages and start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderMessagesTab;
