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
  Collapse,
  Menu,
  MenuItem
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ReplyIcon from '@mui/icons-material/Reply';

// Import your image assets
import userAvatar from '../../../../assets/images/user_icon.png';
import remiAvatar from '../../../../assets/images/remi_icon.jpg';
import adminAvatar from '../../../../assets/images/admin_icon.png';
import chatbotIcon from '../../../../assets/images/chatbot_icon.png';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [showAllQuickQuestions, setShowAllQuickQuestions] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const open = Boolean(anchorEl);

  // Generate or retrieve user ID
  const [userId] = useState(() => {
    let id = localStorage.getItem('chatbot_user_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chatbot_user_id', id);
    }
    return id;
  });

  const conversationKey = `chatbot_conversation_${userId}`;

  const basicQuickQuestions = [
    'Where are you located, and how can I contact you?',
    'Are you currently hiring?',
    'What job positions are available?',
  ];

  const allQuickQuestions = [
    'What are your service hours?',
    'Where are you located, and how can I contact you?',
    'Are you currently hiring?',
    'What job positions are available?',
    'What services do you offer?'
  ];

  // Enhanced refreshMessages with optimization
  const refreshMessages = useCallback(() => {
    const savedConversation = localStorage.getItem(conversationKey);
    if (savedConversation) {
      const parsedMessages = JSON.parse(savedConversation);
      // Only update if messages actually changed
      if (JSON.stringify(parsedMessages) !== JSON.stringify(messages)) {
        setMessages(parsedMessages);
      }
    }
  }, [conversationKey, messages]);

  // Polling effect - checks for new messages every 2 seconds when chat is open
  useEffect(() => {
    let interval;
    if (isOpen) {
      interval = setInterval(refreshMessages, 2000); // Check every 2 seconds
    }
    return () => clearInterval(interval);
  }, [isOpen, refreshMessages]);

  // Load conversation from localStorage on mount
  useEffect(() => {
    refreshMessages();
    setShowQuickQuestions(messages.filter(m => m.sender === 'user').length === 0);
  }, [conversationKey]);

  // Save conversation to localStorage whenever it changes
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(conversationKey, JSON.stringify(messages));
    }
  }, [messages, conversationKey]);

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
      if (messages.length === 0) {
        showWelcomeMessage();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, showQuickQuestions, showAllQuickQuestions, isOpen]);

  // Show welcome message
  const showWelcomeMessage = () => {
    const welcomeMessage = {
      sender: 'bot',
      text: `
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 8px 0; font-weight: 500;">Hello! I'm <span style="color: #1976D2; font-weight: 600;">Remi</span>, your virtual assistant.</p>
          <p style="margin: 8px 0;">How can I help you today?</p>
        </div>
      `,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showQuickQuestions, showAllQuickQuestions]);

  // Handle menu open
  const handleMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  // Handle reply action
  const handleReply = () => {
    if (selectedMessage) {
      setInput(`Replying to "${selectedMessage.text.substring(0, 30)}...": `);
      handleMenuClose();
      // Focus the input field
      setTimeout(() => {
        document.querySelector('input[type="text"]')?.focus();
      }, 100);
    }
  };

  const sendMessage = async (message = input) => {
    if (!message.trim()) return;

    const userMessage = {
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false, // Mark as unread for admin
      status: 'sending' // Add status tracking
    };

    // Optimistically update local state
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    localStorage.setItem(conversationKey, JSON.stringify(newMessages));
    
    setInput('');
    setShowQuickQuestions(false);
    setShowAllQuickQuestions(false);
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:8000/api/chatbot/chat/', { 
        message,
        conversation_history: messages
          .filter(msg => msg.sender === 'user')
          .map(msg => msg.text),
        user_id: userId
      });

      const botMessage = {
        sender: 'bot',
        text: response.data.text || "Sorry, I didn't understand that.",
        type: response.data.type || 'text',
        intent: response.data.intent,        
        quickReplies: response.data.quick_replies || [],  
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // Update both state and localStorage
      const updatedMessages = [...newMessages, botMessage];
      setMessages(updatedMessages);
      localStorage.setItem(conversationKey, JSON.stringify(updatedMessages));
      setApiStatus(true);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update message status to failed
      const failedMessages = [...newMessages];
      if (failedMessages.length > 0) {
        failedMessages[failedMessages.length - 1].status = 'failed';
      }
      
      setMessages([...failedMessages, {
        sender: 'bot',
        text: error.response?.data?.error || "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      
      localStorage.setItem(conversationKey, JSON.stringify([...failedMessages, {
        sender: 'bot',
        text: error.response?.data?.error || "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]));
      
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

  const handleQuickQuestionClick = (question) => {
    sendMessage(question);
  };

  const handleGetStarted = () => {
    setShowQuickQuestions(true);
  };

  const toggleAllQuickQuestions = () => {
    setShowAllQuickQuestions(!showAllQuickQuestions);
  };

  const renderMessage = (msg, index) => {
  const isAdmin = msg.sender === 'admin';
  const isUser = msg.sender === 'user';
  const isBot = msg.sender === 'bot';

  return (
    <Box
      key={index}
      sx={{
        display: 'flex',
        gap: '8px',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '80%',
        position: 'relative'
      }}
    >
      {(isBot || isAdmin) && (
        <Avatar 
          src={isAdmin ? adminAvatar : remiAvatar} 
          alt={isAdmin ? "Admin Avatar" : "Remi Avatar"}
          sx={{ width: 32, height: 32 }}
        />
      )}
      
      <Box sx={{ position: 'relative' }}>
        {isAdmin && (
          <IconButton
            size="small"
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              backgroundColor: 'background.paper',
              '&:hover': {
                backgroundColor: 'action.hover'
              }
            }}
            onClick={(e) => handleMenuOpen(e, msg)}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        )}
        
        {isBot ? (
          <Typography
            variant="body2"
            sx={{
              backgroundColor: '#f1f3f4',
              color: 'black',
              padding: '8px 12px',
              borderRadius: '18px',
              borderBottomLeftRadius: '4px',
              wordBreak: 'break-word',
              boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
            }}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        ) : (
          <Typography
            variant="body2"
            sx={{
              backgroundColor: isUser ? 'primary.main' : '#e3f2fd',
              color: isUser ? 'white' : 'black',
              padding: '8px 12px',
              borderRadius: '18px',
              borderBottomRightRadius: isUser ? '4px' : '18px',
              borderBottomLeftRadius: isAdmin ? '4px' : '18px',
              wordBreak: 'break-word',
              boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
              transition: 'transform 0.1s ease',
              '&:hover': {
                transform: isAdmin ? 'scale(1.02)' : 'none'
              },
              opacity: msg.status === 'sending' ? 0.7 : 1
            }}
          >
            {msg.text}
            {isUser && msg.status === 'sending' && (
              <Box component="span" sx={{ ml: 1, fontSize: '0.75rem' }}>🕒</Box>
            )}
            {isUser && msg.status === 'failed' && (
              <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', color: 'error.main' }}>❌</Box>
            )}
          </Typography>
        )}
        
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            textAlign: isUser ? 'right' : 'left',
            color: '#70757a',
            marginTop: '4px',
            marginLeft: (isBot || isAdmin) ? '8px' : 0,
            marginRight: isUser ? '8px' : 0
          }}
        >
          {msg.timestamp}
        </Typography>
      </Box>
      
      {isUser && (
        <Avatar 
          src={userAvatar} 
          alt="User Avatar"
          sx={{ width: 32, height: 32 }}
        />
      )}
    </Box>
  );
};

  return (
    <>
      {/* Floating button */}
      <Box
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
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
          zIndex: 9999
        }}
      >
        <img 
          src={chatbotIcon}
          alt="Chatbot" 
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
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
              <Box sx={{ position: 'relative' }}>
                <Avatar 
                  src={remiAvatar} 
                  alt="Remi Avatar"
                  sx={{ width: 32, height: 32 }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: apiStatus === true ? '#4CAF50' : apiStatus === false ? '#F44336' : '#FFC107',
                    border: '2px solid white'
                  }}
                />
              </Box>
              <Typography variant="h6" sx={{ color: 'white !important' }}>
                Remi
              </Typography>
            </Box>
            <IconButton 
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white !important' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1,
              padding: '12px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: '#f9f9f9'
            }}
          >
            {messages.map((msg, index) => renderMessage(msg, index))}
            
            {/* Get Started button - shown when no conversation yet */}
            {messages.length === 1 && !showQuickQuestions && !isTyping && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleGetStarted}
                  sx={{
                    borderRadius: '20px',
                    padding: '8px 24px',
                    textTransform: 'none',
                    fontWeight: 'bold',
                    color: 'white !important'
                  }}
                >
                  Get Started
                </Button>
              </Box>
            )}
            
            {/* Quick questions - shown after Get Started is clicked */}
            {showQuickQuestions && !isTyping && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ color: "text.secondary", ml: 1 }}>
                  Quick questions:
                </Typography>
                <List dense sx={{ p: 0 }}>
                  {basicQuickQuestions.map((question, index) => (
                    <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                      <ListItemButton
                        onClick={() => handleQuickQuestionClick(question)}
                        sx={{
                          backgroundColor: '#f1f3f4',
                          borderRadius: '18px',
                          borderBottomLeftRadius: '4px',
                          padding: '8px 12px',
                          '&:hover': {
                            backgroundColor: '#e0e0e0'
                          }
                        }}
                      >
                        <Typography variant="body2">{question}</Typography>
                      </ListItemButton>
                    </ListItem>
                  ))}
                  
                  {/* Expand/collapse for additional questions */}
                  <Collapse in={showAllQuickQuestions}>
                    {allQuickQuestions
                      .filter(q => !basicQuickQuestions.includes(q))
                      .map((question, index) => (
                        <ListItem key={`extra-${index}`} disablePadding sx={{ mb: 1 }}>
                          <ListItemButton
                            onClick={() => handleQuickQuestionClick(question)}
                            sx={{
                              backgroundColor: '#f1f3f4',
                              borderRadius: '18px',
                              borderBottomLeftRadius: '4px',
                              padding: '8px 12px',
                              '&:hover': {
                                backgroundColor: '#e0e0e0'
                              }
                            }}
                          >
                            <Typography variant="body2">{question}</Typography>
                          </ListItemButton>
                        </ListItem>
                      ))}
                  </Collapse>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <IconButton
                      onClick={toggleAllQuickQuestions}
                      size="small"
                      sx={{
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'rgba(25, 118, 210, 0.08)'
                        }
                      }}
                    >
                      {showAllQuickQuestions ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                      <Typography variant="caption" sx={{ ml: 0.5 }}>
                        {showAllQuickQuestions ? 'Show less' : 'Show more'}
                      </Typography>
                    </IconButton>
                  </Box>
                </List>
              </Box>
            )}
            
            {isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: 'flex-start'
                }}
              >
                <Avatar 
                  src={remiAvatar} 
                  alt="Remi Avatar"
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

          {/* Input */}
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
              onClick={() => sendMessage()}
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

          {/* Message options menu */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
          >
            <MenuItem onClick={handleReply}>
              <ReplyIcon fontSize="small" sx={{ mr: 1 }} />
              Reply
            </MenuItem>
          </Menu>
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

export default Chatbot;