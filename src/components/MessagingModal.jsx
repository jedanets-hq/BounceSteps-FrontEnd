import React, { useState, useEffect, useRef } from 'react';
import Icon from './AppIcon';
import Button from './ui/Button';
import { API_URL } from '../utils/api';

const MessagingModal = ({ isOpen, onClose, providerId, providerName, serviceId, serviceName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
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
    if (isOpen && providerId && user) {
      console.log('📥 [MessagingModal] Opening with:', {
        providerId,
        providerName,
        serviceId,
        serviceName,
        userId: user?.id,
        userToken: user?.token ? 'present' : 'missing'
      });
      
      if (!providerId || providerId === 'undefined') {
        console.error('❌ [MessagingModal] providerId is missing or invalid!');
        alert('Error: Cannot open chat. Provider ID is missing.');
        onClose();
        return;
      }
      
      fetchMessages();
    }
  }, [isOpen, providerId, serviceId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = user?.token;
      
      if (!token) {
        console.error('❌ [MessagingModal] No token found');
        alert('Authentication error. Please login again.');
        return;
      }

      if (!providerId || providerId === 'undefined') {
        console.error('❌ [MessagingModal] Invalid providerId:', providerId);
        alert('Error: Invalid provider ID');
        return;
      }

      // Backend expects: /messages/conversation/:otherUserId
      const url = `${API_URL}/messages/conversation/${providerId}`;
      console.log('📡 [MessagingModal] Fetching from:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 [MessagingModal] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [MessagingModal] HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      console.log('📥 [MessagingModal] Fetched data:', {
        success: data.success,
        messageCount: data.messages?.length || 0,
        messages: data.messages?.slice(0, 2) // Log first 2 messages for debugging
      });
      
      if (data.success) {
        setMessages(data.messages || []);
      } else {
        console.error('❌ [MessagingModal] API returned error:', data.message);
        alert('Failed to load messages: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ [MessagingModal] Error fetching messages:', error);
      alert('Error loading messages. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !user) return;

    try {
      setSending(true);
      const token = user?.token;
      
      if (!token) {
        console.error('❌ [MessagingModal] No token for sending');
        alert('Authentication error. Please login again.');
        return;
      }

      if (!providerId || providerId === 'undefined') {
        console.error('❌ [MessagingModal] Invalid providerId for sending:', providerId);
        alert('Error: Invalid provider ID');
        return;
      }
      
      const payload = {
        otherUserId: providerId,
        serviceId: serviceId || null,
        messageText: newMessage.trim()
      };
      
      console.log('📨 [MessagingModal] Sending message:', {
        payload,
        providerId,
        serviceId,
        messageLength: newMessage.trim().length,
        hasToken: !!token
      });

      const response = await fetch(`${API_URL}/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('📨 [MessagingModal] Send response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [MessagingModal] Send HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      
      console.log('📨 [MessagingModal] Send response:', data);
      
      if (data.success) {
        setNewMessage('');
        await fetchMessages(); // Refresh messages
        console.log('✅ [MessagingModal] Messages refreshed');
      } else {
        console.error('❌ [MessagingModal] Send failed:', data.message);
        alert('Failed to send message: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      console.error('❌ [MessagingModal] Error sending message:', error);
      alert('Error sending message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-xl max-w-2xl w-full h-[600px] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="User" size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{providerName || 'Service Provider'}</h3>
              {serviceName && (
                <p className="text-xs text-muted-foreground">About: {serviceName}</p>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Icon name="Loader2" size={32} className="animate-spin text-primary" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Icon name="MessageCircle" size={48} className="text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground/70">Start a conversation with the provider</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMyMessage = message.isMe || message.senderType === 'traveller';
              return (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isMyMessage
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.text || message.message_text || 'Invalid Data'}</p>
                    <p className={`text-xs mt-1 ${
                      isMyMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {new Date(message.timestamp || message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={sending}
            />
            <Button 
              type="submit" 
              disabled={!newMessage.trim() || sending}
              className="px-6"
            >
              {sending ? (
                <Icon name="Loader2" size={16} className="animate-spin" />
              ) : (
                <Icon name="Send" size={16} />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MessagingModal;
