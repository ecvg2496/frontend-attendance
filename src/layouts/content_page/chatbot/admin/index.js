import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemButton,
  Avatar,
  IconButton,
  Tabs,
  Tab,
  Badge,
  Divider
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import your image assets
import adminAvatar from '../../../../assets/images/admin_chatbot.jpg';
import userAvatar from '../../../../assets/images/user_icon.png';
import chatbotIcon from '../../../../assets/images/chatbot_icon.png';

const AdminChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [showAllQuickQuestions, setShowAllQuickQuestions] = useState(false);
  
  // Get all user conversations from localStorage
  const getAllUserConversations = useCallback(() => {
    const conversations = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('chatbot_conversation_')) {
        try {
          const userId = key.replace('chatbot_conversation_', '');
          const messages = JSON.parse(localStorage.getItem(key));
          conversations.push({ userId, messages });
        } catch (error) {
          console.error('Error parsing conversation:', error);
        }
      }
    }
    return conversations;
  }, []);

  const [userConversations, setUserConversations] = useState(getAllUserConversations());

  // Enhanced refresh conversations with optimization
  const refreshConversations = useCallback(() => {
    const newConversations = getAllUserConversations();
    
    // Only update state if conversations actually changed
    if (JSON.stringify(newConversations) !== JSON.stringify(userConversations)) {
      setUserConversations(newConversations);
      
      // If we're viewing a specific chat, update its messages
      if (selectedUser) {
        const updatedUser = newConversations.find(c => c.userId === selectedUser.userId);
        if (updatedUser) {
          setSelectedUser(updatedUser);
        }
      }
    }
  }, [getAllUserConversations, userConversations, selectedUser]);

  // Cross-window synchronization
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key && e.key.startsWith('chatbot_conversation_')) {
        refreshConversations();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshConversations]);

  // Polling effect - more frequent when chat is open
  useEffect(() => {
    let interval;
    
    if (isOpen && selectedUser) {
      // Poll every second when a specific chat is open
      interval = setInterval(refreshConversations, 1000);
    } else if (isOpen) {
      // Poll every 3 seconds for the conversation list
      interval = setInterval(refreshConversations, 3000);
    }
    
    return () => clearInterval(interval);
  }, [isOpen, selectedUser, refreshConversations]);

  // Check API status when chat opens
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiStatus(null);
        await axios.get('http://localhost:8000/api/chatbot/health/');
        setApiStatus(true);
      } catch (error) {
        setApiStatus(false);
      }
    };

    if (isOpen) {
      checkApiStatus();
      refreshConversations();
    }
  }, [isOpen, refreshConversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedUser, isTyping, messages]);

  const sendMessage = async () => {
    if (!input.trim() || !selectedUser) return;

    const tempId = Date.now(); // Create a temporary ID for the message
    const adminMessage = {
      sender: 'admin',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tempId,
      status: 'sending'
    };

    // Optimistically update the UI
    setSelectedUser(prev => ({
      ...prev,
      messages: [...prev.messages, adminMessage]
    }));

    // Update the conversation in localStorage
    const conversationKey = `chatbot_conversation_${selectedUser.userId}`;
    const currentConversation = JSON.parse(localStorage.getItem(conversationKey)) || [];
    const updatedConversation = [...currentConversation, adminMessage];
    localStorage.setItem(conversationKey, JSON.stringify(updatedConversation));

    // Trigger storage event for other windows
    window.dispatchEvent(new Event('storage'));

    setInput('');
    setIsTyping(true);

    try {
      // Here you would typically send the message to your backend
      // For this example, we'll just simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update message status to 'delivered'
      const finalConversation = JSON.parse(localStorage.getItem(conversationKey)) || [];
      const updatedMessages = finalConversation.map(msg => 
        msg.tempId === tempId ? { ...msg, status: 'delivered' } : msg
      );
      
      localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
      window.dispatchEvent(new Event('storage'));
      setApiStatus(true);
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to 'failed'
      const finalConversation = JSON.parse(localStorage.getItem(conversationKey)) || [];
      const updatedMessages = finalConversation.map(msg => 
        msg.tempId === tempId ? { ...msg, status: 'failed' } : msg
      );
      
      localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
      window.dispatchEvent(new Event('storage'));
      setApiStatus(false);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      sendMessage();
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedUser(null);
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    markAsRead(user.userId);
  };

  const handleBackToUsers = () => {
    setSelectedUser(null);
  };

  const getUnreadCount = (userId) => {
    const conversation = userConversations.find(c => c.userId === userId)?.messages || [];
    return conversation.filter(msg => msg.sender === 'user' && !msg.read).length;
  };

  const markAsRead = (userId) => {
    const conversationKey = `chatbot_conversation_${userId}`;
    const currentConversation = JSON.parse(localStorage.getItem(conversationKey)) || [];
    const updatedConversation = currentConversation.map(msg => {
      if (msg.sender === 'user') {
        return { ...msg, read: true };
      }
      return msg;
    });
    localStorage.setItem(conversationKey, JSON.stringify(updatedConversation));
    window.dispatchEvent(new Event('storage'));
  };

  const formatMessage = (text) => {
    return text
      .replace(/<a\s+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?span[^>]*>/gi, '');
  };

  return (
    <>
      {/* Floating button */}
      <Box
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: '24px',
          right: '10px', 
          width: '70px',
          height: '70px',
          cursor: 'pointer',
          borderRadius: '50%',
          overflow: 'hidden',
          boxShadow: 3,
          '&:hover': {
            boxShadow: 6,
            transform: 'scale(1.05)'
          },
          transition: 'all 0.2s ease-in-out',
          zIndex: 9999,
          backgroundColor: '#1976D2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img 
          src={chatbotIcon}
          alt="Admin Chat" 
          style={{
            width: '60%',
            height: '60%',
            objectFit: 'cover',
            filter: 'brightness(0) invert(1)'
          }}
        />
      </Box>

      {/* Chat window */}
      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '400px',
            height: '500px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '12px',
            zIndex: 9998
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: 'primary.main',
              color: 'white',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectedUser ? (
                <IconButton 
                  onClick={handleBackToUsers}
                  sx={{ color: 'white !important', mr: 1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
              ) : null}
              <Typography variant="h6" sx={{ color: 'white !important' }}>
                {selectedUser ? `User #${selectedUser.userId}` : 'Admin Chat'}
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white !important' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Tabs */}
          {!selectedUser && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange}
                variant="fullWidth"
              >
                <Tab label="Active Chats" />
                <Tab label="All Conversations" />
              </Tabs>
            </Box>
          )}

          {/* Content */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              backgroundColor: '#f9f9f9'
            }}
          >
            {selectedUser ? (
              // Chat view for selected user
              <>
                <Box
                  sx={{
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}
                >
                  {selectedUser.messages.map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        gap: '8px',
                        alignSelf: msg.sender === 'admin' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%'
                      }}
                    >
                      {msg.sender === 'user' && (
                        <Avatar 
                          src={userAvatar} 
                          alt="User Avatar"
                          sx={{ width: 32, height: 32 }}
                        />
                      )}
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            backgroundColor: msg.sender === 'admin' ? 'primary.main' : '#f1f3f4',
                            color: msg.sender === 'admin' ? 'white' : 'black',
                            padding: '8px 12px',
                            borderRadius: '18px',
                            borderBottomRightRadius: msg.sender === 'admin' ? '4px' : '18px',
                            borderBottomLeftRadius: msg.sender === 'user' ? '4px' : '18px',
                            wordBreak: 'break-word',
                            opacity: msg.status === 'sending' ? 0.7 : 1
                          }}
                        >
                          {formatMessage(msg.text)}
                          {msg.sender === 'admin' && msg.status === 'sending' && (
                            <Box component="span" sx={{ ml: 1, fontSize: '0.75rem' }}>🕒</Box>
                          )}
                          {msg.sender === 'admin' && msg.status === 'failed' && (
                            <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'error.main' }}>❌</Box>
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            textAlign: msg.sender === 'admin' ? 'right' : 'left',
                            color: '#70757a',
                            marginTop: '4px',
                            marginLeft: msg.sender === 'user' ? '8px' : 0,
                            marginRight: msg.sender === 'admin' ? '8px' : 0
                          }}
                        >
                          {msg.timestamp}
                        </Typography>
                      </Box>
                      {msg.sender === 'admin' && (
                        <Avatar 
                          src={adminAvatar} 
                          alt="Admin Avatar"
                          sx={{ width: 32, height: 32 }}
                        />
                      )}
                    </Box>
                  ))}
                  {isTyping && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: '8px',
                        alignSelf: 'flex-start'
                      }}
                    >
                      <Avatar 
                        src={adminAvatar} 
                        alt="Admin Avatar"
                        sx={{ width: 32, height: 32 }}
                      />
                      <Box
                        sx={{
                          backgroundColor: '#f1f3f4',
                          padding: '8px 12px',
                          borderRadius: '18px',
                          borderBottomLeftRadius: '4px'
                        }}
                      >
                        <Box sx={{ display: 'flex', gap: '4px' }}>
                          {[0, 1, 2].map((dot) => (
                            <Box
                              key={dot}
                              sx={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: '#70757a',
                                animation: 'typingAnimation 1.4s infinite ease-in-out',
                                animationDelay: `${dot * 0.2}s`
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}
                  <div ref={messagesEndRef} />
                </Box>
              </>
            ) : (
              // User list view
              <List dense sx={{ p: 0 }}>
                {userConversations
                  .filter(conv => 
                    activeTab === 0 
                      ? conv.messages.some(msg => msg.sender === 'user' && !msg.read) || 
                        conv.messages[conv.messages.length - 1]?.sender === 'user'
                      : true
                  )
                  .sort((a, b) => {
                    // Sort by most recent message first
                    const aLastMsg = new Date(a.messages[a.messages.length - 1]?.timestamp || 0);
                    const bLastMsg = new Date(b.messages[b.messages.length - 1]?.timestamp || 0);
                    return bLastMsg - aLastMsg;
                  })
                  .map((conv) => (
                    <ListItem key={conv.userId} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          handleUserSelect(conv);
                          markAsRead(conv.userId);
                        }}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <Badge
                            badgeContent={getUnreadCount(conv.userId)}
                            color="error"
                            overlap="circular"
                            sx={{ mr: 2 }}
                          >
                            <Avatar 
                              src={userAvatar} 
                              alt="User Avatar"
                              sx={{ width: 40, height: 40 }}
                            />
                          </Badge>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2">
                              User #{conv.userId}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: 'text.secondary',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '200px'
                              }}
                            >
                              {conv.messages[conv.messages.length - 1]?.text || 'No messages yet'}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {conv.messages[conv.messages.length - 1]?.timestamp || ''}
                          </Typography>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}
                {userConversations.length === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No conversations yet
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>

          {/* Input (only shown when a user is selected) */}
          {selectedUser && (
            <Box
              sx={{
                padding: '12px',
                borderTop: '1px solid #eee',
                display: 'flex',
                gap: '8px',
                backgroundColor: 'white'
              }}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isTyping || apiStatus === false}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '24px',
                  }
                }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={sendMessage}
                disabled={!input.trim() || isTyping || apiStatus === false}
                sx={{ 
                  minWidth: '40px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: 'white !important'
                }}
              >
                <SendIcon sx={{ fontSize: '18px' }} />
              </Button>
            </Box>
          )}
        </Paper>
      )}

      {/* Animation styles */}
      <style>
        {`
          @keyframes typingAnimation {
            0%, 60%, 100% { transform: translateY(0); }
            30% { transform: translateY(-5px); }
          }
        `}
      </style>
    </>
  );
};

export default AdminChat;