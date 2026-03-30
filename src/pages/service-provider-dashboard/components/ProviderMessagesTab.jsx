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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Icon name="Loader2" size={48} className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex" style={{ height: '70vh', minHeight: '500px' }}>
      {/* Conversations List */}
      <div className="w-80 border-r border-border flex flex-col bg-background">
        <div className="p-4 border-b border-border bg-card">
          <h2 className="text-xl font-semibold text-foreground">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Icon name="MessageCircle" size={32} className="text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium mb-1">No messages yet</p>
              <p className="text-sm text-muted-foreground">Travelers will message you about your services</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={`${conv.traveller_id}-${conv.service_id || 'general'}`}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 text-left transition-colors border-b border-border/50 ${
                  selectedConversation?.traveller_id === conv.traveller_id && 
                  selectedConversation?.service_id === conv.service_id
                    ? 'bg-primary/5 border-l-4 border-l-primary'
                    : 'hover:bg-muted/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon name="User" size={20} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold text-foreground truncate">
                        {conv.traveller_name || 'Traveler'}
                      </p>
                      {conv.unread_count > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs font-medium rounded-full px-2 py-0.5 ml-2">
                          {conv.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {conv.last_message}
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {new Date(conv.last_message_time).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                  <Icon name="User" size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {selectedConversation.traveller_name || 'Traveler'}
                  </h3>
                  {selectedConversation.service_title && (
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.service_title}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/20">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4">
                    <Icon name="MessageCircle" size={32} className="text-muted-foreground" />
                  </div>
                  <p className="text-foreground font-medium mb-1">No messages yet</p>
                  <p className="text-sm text-muted-foreground">Send a message to start the conversation</p>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isMyMessage = message.sender_type === 'provider';
                  const showDate = index === 0 || 
                    new Date(messages[index - 1].created_at).toDateString() !== new Date(message.created_at).toDateString();
                  
                  return (
                    <React.Fragment key={message.id}>
                      {showDate && (
                        <div className="flex justify-center my-4">
                          <span className="text-xs text-muted-foreground bg-card px-3 py-1 rounded-full">
                            {new Date(message.created_at).toLocaleDateString('en-US', { 
                              weekday: 'short',
                              month: 'short', 
                              day: 'numeric',
                              year: new Date(message.created_at).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                            })}
                          </span>
                        </div>
                      )}
                      <div className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] ${isMyMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              isMyMessage
                                ? 'bg-primary text-primary-foreground rounded-br-sm'
                                : 'bg-card text-foreground rounded-bl-sm shadow-sm'
                            }`}
                          >
                            <p className="text-sm leading-relaxed break-words">{message.message_text}</p>
                          </div>
                          <p className={`text-xs mt-1 px-2 ${
                            isMyMessage ? 'text-muted-foreground' : 'text-muted-foreground'
                          }`}>
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
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
              <div className="flex gap-3 items-end">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 pr-12 border border-border rounded-full focus:ring-2 focus:ring-primary focus:border-transparent bg-background text-foreground placeholder:text-muted-foreground"
                    disabled={sending}
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim() || sending}
                  className="rounded-full w-12 h-12 p-0 flex items-center justify-center"
                  size="lg"
                >
                  {sending ? (
                    <Icon name="Loader2" size={20} className="animate-spin" />
                  ) : (
                    <Icon name="Send" size={20} />
                  )}
                </Button>
              </div>
            </form>
          </>
        ) : (
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

export default ProviderMessagesTab;
