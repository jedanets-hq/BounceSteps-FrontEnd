import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { API_URL } from '../../../utils/api';

const MessagesTab = () => {
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
      const token = user?.token;
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const response = await fetch(`${API_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setConversations(data.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = user?.token;
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const url = selectedConversation.service_id 
        ? `${API_URL}/messages/conversation/${selectedConversation.provider_id}/${selectedConversation.service_id}`
        : `${API_URL}/messages/conversation/${selectedConversation.provider_id}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      const token = user?.token;

      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          otherUserId: selectedConversation.provider_id,
          serviceId: selectedConversation.service_id || null,
          messageText: newMessage.trim()
        })
      });

      const data = await response.json();
      
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
    <div className="h-[80vh] min-h-[600px] bg-background rounded-xl border border-border overflow-hidden flex">
      {/* Left Sidebar - Conversations List */}
      <div className={`${
        isMobileView && selectedConversation ? 'hidden' : 'flex'
      } ${isMobileView ? 'w-full' : 'w-80'} border-r border-border flex-col bg-background`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <h2 className="text-lg font-semibold text-foreground">Messages</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <Icon name="Search" size={18} className="text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-full transition-colors">
              <Icon name="MoreVertical" size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>
        
        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Icon name="MessageCircle" size={32} className="text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start chatting with providers</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={`${conv.provider_id}-${conv.service_id || 'general'}`}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 text-left transition-colors hover:bg-muted/50 ${
                  selectedConversation?.provider_id === conv.provider_id && 
                  selectedConversation?.service_id === conv.service_id
                    ? 'bg-primary/10'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name="User" size={20} className="text-primary" />
                    </div>
                    {/* Online status indicator (optional) */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-foreground truncate text-sm">
                        {conv.business_name || conv.provider_name || 'Service Provider'}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(conv.last_message_time).toLocaleTimeString('en-US', { 
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground truncate pr-2">
                        {conv.last_message}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-0.5 min-w-[20px] text-center">
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
      } flex-1 flex-col bg-background`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {/* Mobile back button */}
                {isMobileView && (
                  <button 
                    onClick={handleBackToConversations}
                    className="p-2 hover:bg-muted rounded-full transition-colors -ml-2"
                  >
                    <Icon name="ArrowLeft" size={20} className="text-foreground" />
                  </button>
                )}
                
                {/* User avatar and info */}
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-sm">
                    {selectedConversation.business_name || selectedConversation.provider_name || 'Service Provider'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {selectedConversation.service_title ? selectedConversation.service_title : 'Online'}
                  </p>
                </div>
              </div>
              
              {/* Action icons */}
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Icon name="Phone" size={18} className="text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Icon name="Video" size={18} className="text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded-full transition-colors">
                  <Icon name="MoreVertical" size={18} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Chat Body - Messages */}
            <div className="flex-1 overflow-y-auto px-3 py-4 bg-gradient-to-b from-muted/5 to-muted/10">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 shadow-sm">
                    <Icon name="MessageCircle" size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {messages.map((message, index) => {
                    const isMyMessage = message.sender_type === 'traveller';
                    const showDate = index === 0 || 
                      new Date(messages[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString();
                    
                    return (
                      <React.Fragment key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="text-[10px] text-muted-foreground bg-card px-3 py-1 rounded-full shadow-sm">
                              {new Date(message.created_at).toLocaleDateString('en-US', { 
                                weekday: 'short',
                                month: 'short', 
                                day: 'numeric',
                                year: new Date(message.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                              })}
                            </span>
                          </div>
                        )}
                        
                        {/* Message Bubble */}
                        <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`${isMobileView ? 'max-w-[85%]' : 'max-w-[75%]'} flex flex-col ${isMyMessage ? 'items-end' : 'items-start'}`}>
                            <div
                              className={`${isMobileView ? 'px-2 py-1.5' : 'px-3 py-2'} rounded-2xl shadow-sm ${
                                isMyMessage
                                  ? 'bg-primary text-primary-foreground rounded-br-md'
                                  : 'bg-card text-foreground rounded-bl-md border border-border/50'
                              }`}
                            >
                              <p className={`${isMobileView ? 'text-xs' : 'text-sm'} leading-relaxed break-words`}>
                                {message.message_text}
                              </p>
                            </div>
                            {/* Timestamp */}
                            <p className="text-[10px] text-muted-foreground mt-1 px-1">
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

            {/* Input Area - Bottom Bar */}
            <div className="flex items-center gap-2 px-3 py-2 border-t border-border bg-card sticky bottom-0">
              {/* Optional emoji/attachment buttons */}
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <Icon name="Smile" size={18} className="text-muted-foreground" />
              </button>
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <Icon name="Paperclip" size={18} className="text-muted-foreground" />
              </button>
              
              {/* Input field */}
              <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted/50 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-background transition-colors"
                  disabled={sending}
                />
                
                {/* Send button */}
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="rounded-full px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[40px]"
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
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Icon name="MessageCircle" size={48} className="text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h3>
            <p className="text-muted-foreground max-w-sm">Choose a conversation from the list to view messages and start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesTab;
