import { useState, useEffect, useRef, useCallback } from 'react';
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
  Collapse
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ReplyIcon from '@mui/icons-material/Reply';
import { dataService } from "global/function";
import Pusher from 'pusher-js';

Pusher.logToConsole = process.env.NODE_ENV === 'development';

const pusherConfig = {
  cluster: process.env.REACT_APP_PUSHER_CLUSTER || 'ap1',
  forceTLS: true,
  channelAuthorization: {
    endpoint: process.env.REACT_APP_PUSHER_AUTH_ENDPOINT || '/api/chatbot/pusher/auth/',
    transport: 'ajax',
  }
};

const pusherClient = new Pusher(process.env.REACT_APP_PUSHER_KEY, pusherConfig);

import userAvatar from '../../../../assets/images/user_icon.png';
import remiAvatar from '../../../../assets/images/remi_icon.jpg';
import adminAvatar from '../../../../assets/images/admin_icon.png';
import chatbotIcon from '../../../../assets/images/chatbot_icon.png';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showGetStarted, setShowGetStarted] = useState(true);
  const [showFAQTitle, setShowFAQTitle] = useState(false);
  const [showQuickQuestions, setShowQuickQuestions] = useState(false);
  const [showAllQuickQuestions, setShowAllQuickQuestions] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [conversationId, setConversationId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const pusherChannelRef = useRef(null);
  const processedMessageIds = useRef(new Set());

  const [userId] = useState(() => {
    let id = localStorage.getItem('chatbot_user_id');
    if (!id) {
      id = Math.random().toString(36).substring(2, 9);
      localStorage.setItem('chatbot_user_id', id);
    }
    return id;
  });

  const conversationKey = `chatbot_conversation_${userId}`;

  const locationInfo = `
    <div style="margin-bottom: 12px;">
      <p style="margin: 0 0 8px 0; font-weight: 500;">We are located at:</p>
      <p style="margin: 8px 0;">
        <a href="https://www.google.com/maps/place/Fiend+Coffee+Club/@7.0611527,125.593298,17z/data=!3m1!4b1!4m6!3m5!1s0x32f96d7debe00243:0xdab487d34da1a845!8m2!3d7.0611527!4d125.593298!16s%2Fg%2F11xctycl99?entry=ttu" 
           target="_blank" 
           rel="noopener noreferrer" 
           style="color: #1976D2; text-decoration: none;">
          Juna Subdivision, Davao City
        </a>
      </p>
      <p style="margin: 16px 0 8px 0; font-weight: 500;">Contact Options:</p>
      <p style="margin: 8px 0;">Email: careers@eighty20virtual.com</p>
      <p style="margin: 8px 0;">Contact Number: +639171535351</p>
      <p style="margin: 8px 0;">Official Website: <a href="https://eighty20virtual-recruit.onrender.com/" target="_blank" rel="noopener noreferrer" style="color: #1976D2; text-decoration: none;">eighty20virtual-recruit.onrender.com</a></p>
      <p style="margin: 16px 0 8px 0;">Once you have applied for a position please check your email at least twice per day.</p>
      <p style="margin: 16px 0 8px 0;">If you have any questions, please leave a message, and we'll respond as soon as possible. Thank you!</p>
    </div>
  `;

  const basicQuickQuestions = [
    'Where are you located, and how can I contact you?',
    'Are you currently hiring?',
    'What job positions are available?',
  ];

  const allQuickQuestions = [
    ...basicQuickQuestions,
    'What are your service hours?',
    'What services do you offer?'
  ];

  useEffect(() => {
    const savedConversation = localStorage.getItem(conversationKey);
    if (savedConversation) {
      const parsedMessages = JSON.parse(savedConversation);
      setMessages(parsedMessages);
      setShowGetStarted(parsedMessages.length <= 1);
      
      parsedMessages.forEach(msg => {
        if (msg.tempId) {
          processedMessageIds.current.add(msg.tempId);
        }
      });
    }
  }, [conversationKey]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, showFAQTitle, showQuickQuestions, showAllQuickQuestions]);

  const handleMessagesScroll = (e) => {
    e.stopPropagation();
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollHeight - scrollTop === clientHeight;

    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
      if (typeof e.cancelable !== 'boolean' || e.cancelable) {
        e.preventDefault();
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && conversationId) {
      const channelName = `private-conversation-${conversationId}`;
      
      if (pusherChannelRef.current) {
        pusherClient.unsubscribe(pusherChannelRef.current);
        pusherChannelRef.current = null;
      }

      const channel = pusherClient.subscribe(channelName);
      pusherChannelRef.current = channelName;

      channel.unbind('new-message');
      
      channel.bind('new-message', handleNewMessage);

      const connectionStateHandler = (states) => {
        setApiStatus(states.current === 'connected');
      };
      
      pusherClient.connection.bind('state_change', connectionStateHandler);

      return () => {
        channel.unbind('new-message', handleNewMessage);
        pusherClient.connection.unbind('state_change', connectionStateHandler);
        if (pusherChannelRef.current) {
          pusherClient.unsubscribe(pusherChannelRef.current);
        }
      };
    }
  }, [isOpen, conversationId]);

  useEffect(() => {
    return () => {
      if (pusherChannelRef.current) {
        pusherClient.unsubscribe(pusherChannelRef.current);
      }
      pusherClient.disconnect();
    };
  }, []);

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        setApiStatus(null);
        await dataService('GET', 'chatbot/health/');
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

  const showWelcomeMessage = () => {
    const welcomeMessage = {
      sender: 'bot',
      text: `
        <div style="margin-bottom: 12px;">
          <p style="margin: 0 0 8px 0; font-weight: 500;">Hello! I'm <span style="color: #1976D2; font-weight: 600;">Remi</span>, your virtual assistant.</p>
          <p style="margin: 8px 0;">How can I help you today?</p>
        </div>
      `,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tempId: 'welcome-message'
    };
    setMessages([welcomeMessage]);
    localStorage.setItem(conversationKey, JSON.stringify([welcomeMessage]));
    processedMessageIds.current.add('welcome-message');
  };

  const handleNewMessage = useCallback((data) => {
    const { sender_type, content, timestamp, id } = data;
    console.log('New message received:', data);

    if (processedMessageIds.current.has(id)) {
      console.log('Skipping duplicate message:', id);
      return;
    }

    processedMessageIds.current.add(id);

    setMessages(prev => {
      const filtered = prev.filter(msg => 
        !(msg.tempId && msg.text === content && msg.sender === sender_type)
      );
      
      const newMessage = {
        sender: sender_type,
        text: content,
        timestamp: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        id: id
      };

      const updated = [...filtered, newMessage];
      localStorage.setItem(conversationKey, JSON.stringify(updated));
      return updated;
    });

    scrollToBottom();
  }, [conversationKey]);

  const handleReplyClick = (message) => {
    setReplyingTo(message);
    setInput(`Replying to "${message.text.substring(0, 30)}...": `);
    setTimeout(() => {
      document.querySelector('input[type="text"]')?.focus();
    }, 100);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setInput('');
  };

  const sendMessage = async (message = input) => {
    if (!message.trim()) return;

    if (showGetStarted || showFAQTitle) {
      setShowGetStarted(false);
      setShowFAQTitle(false);
      setShowQuickQuestions(false);
    }

    const tempMessageId = Date.now().toString();
    processedMessageIds.current.add(tempMessageId);

    const userMessage = {
      sender: 'user',
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tempId: tempMessageId,
      replyTo: replyingTo ? {
        id: replyingTo.id || replyingTo.tempId,
        text: replyingTo.text,
        sender: replyingTo.sender
      } : null
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    localStorage.setItem(conversationKey, JSON.stringify(newMessages));
      
    setInput('');
    setIsTyping(true);
    setReplyingTo(null);

    try {
      let response;
      if (message.toLowerCase().includes('location') || 
          message.toLowerCase().includes('contact') || 
          message.toLowerCase().includes('where')) {
        // Handle local response for location questions
        const botMessage = {
          sender: 'bot',
          text: locationInfo,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text',
          intent: 'location_info',
          tempId: `bot-${tempMessageId}`
        };
        processedMessageIds.current.add(`bot-${tempMessageId}`);
        setMessages(prev => [...prev, botMessage]);
        localStorage.setItem(conversationKey, JSON.stringify([...newMessages, botMessage]));
      } else {
        // Send to backend for processing
        response = await dataService('POST', 'chatbot/chat/', { 
          message,
          user_id: userId,
          conversation_id: conversationId,
          temp_message_id: tempMessageId,
          reply_to: replyingTo ? {
            message_id: replyingTo.id || replyingTo.tempId,
            sender_type: replyingTo.sender
          } : null
        });

        if (response.data?.conversation_id && !conversationId) {
          setConversationId(response.data.conversation_id);
        }
      }

      setApiStatus(true);
    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        sender: 'bot',
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tempId: `error-${tempMessageId}`
      };

      setMessages(prev => [...prev, errorMessage]);
      setApiStatus(false);
    } finally {
      setIsTyping(false);
      scrollToBottom();
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
    setShowGetStarted(false);
    setShowFAQTitle(true);
    setShowQuickQuestions(false);
  };

  const handleQuickQuestionsButtonClick = () => {
    if (messages.length > 1) {
      setShowFAQTitle(true);
      setTimeout(() => {
        setShowQuickQuestions(!showQuickQuestions);
      }, 100);
    }
  };

  const handleFAQClick = () => {
    setShowQuickQuestions(!showQuickQuestions);
  };

  const toggleAllQuickQuestions = (e) => {
    e.stopPropagation();
    setShowAllQuickQuestions(!showAllQuickQuestions);
  };

  const renderMessage = (msg, index) => {
    const isAdmin = msg.sender === 'admin';
    const isUser = msg.sender === 'user';
    const isBot = msg.sender === 'bot';
    const isReply = msg.replyTo;

    return (
      <Box
        key={index}
        sx={{
          display: 'flex',
          gap: '8px',
          alignSelf: isUser ? 'flex-end' : 'flex-start',
          maxWidth: '80%',
          position: 'relative',
          animation: msg.sender === 'user' ? 'slideInRight 0.3s ease' : 'slideInLeft 0.3s ease',
          marginBottom: '4px'
        }}
      >
        {(isBot || isAdmin) && (
          <Avatar 
            src={isAdmin ? adminAvatar : remiAvatar} 
            alt={isAdmin ? "Admin Avatar" : "Remi Avatar"}
            sx={{ width: 32, height: 32 }}
          />
        )}
        
        <Box sx={{ position: 'relative', width: '100%' }}>
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
              onClick={() => handleReplyClick(msg)}
            >
              <ReplyIcon fontSize="small" />
            </IconButton>
          )}
          
          {isReply && (
            <Box sx={{
              backgroundColor: '#f0f0f0',
              borderRadius: '8px 8px 0 0',
              padding: '4px 8px',
              fontSize: '0.75rem',
              color: '#555',
              borderLeft: '2px solid #1976D2',
              marginBottom: '4px'
            }}>
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                Replying to {msg.replyTo.sender === 'admin' ? 'admin' : 'you'}: {msg.replyTo.text.substring(0, 30)}...
              </Typography>
            </Box>
          )}
          
          {isBot ? (
            <Typography
              variant="body2"
              sx={{
                backgroundColor: '#f1f3f4',
                color: 'black',
                padding: '6px 12px',
                borderRadius: isReply ? '0 0 18px 18px' : '18px',
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
                borderRadius: isReply ? '0 0 18px 18px' : '18px',
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
      </Box>
    );
  };

  const renderFAQSection = () => {
    if (!showFAQTitle || isTyping) return null;

    const questionsToShow = showAllQuickQuestions ? allQuickQuestions : basicQuickQuestions;

    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center',
          width: '100%',
          mt: 'auto',
          mb: 2,
          animation: 'fadeIn 0.3s ease'
        }}
      >
        <Box sx={{ maxWidth: '90%', width: 'fit-content' }}>
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            onClick={handleFAQClick}
          >
            <Typography
              variant="body2"
              color="primary"
              sx={{ 
                fontWeight: 'bold',
                textAlign: 'center',
                mb: showQuickQuestions ? 1 : 0,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              FAQ
            </Typography>
            
            <Collapse in={showQuickQuestions} sx={{ width: '100%' }}>
              <List dense sx={{ 
                p: 0,
                width: '100%',
                maxWidth: '360px',
                borderRadius: '18px',
                padding: '8px'
              }}>
                {questionsToShow.map((question, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemButton
                      onClick={() => handleQuickQuestionClick(question)}
                      sx={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        '&:hover': {
                          backgroundColor: '#f5f6f7'
                        },
                        transition: 'all 0.2s ease',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {question}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                ))}
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                  <Button
                    onClick={toggleAllQuickQuestions}
                    size="small"
                    sx={{
                      color: '#65676B',
                      textTransform: 'none',
                      fontSize: '0.8125rem',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {showAllQuickQuestions ? 'Show less' : 'Show more'}
                  </Button>
                </Box>
              </List>
            </Collapse>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <>
      {!isOpen && (
        <Box
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: { xs: '60px', sm: '70px' },
            height: { xs: '60px', sm: '70px' },
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
      )}

      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: { xs: '16px', sm: '24px' }, 
            right: { xs: '16px', sm: '24px' }, 
            width: '400px',
            height: { xs: 'calc(100vh - 120px)', sm: '500px', md: '650px' },
            maxWidth: '600px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: '12px',
            zIndex: 9998
          }}
        >
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

          <Box
            ref={messagesContainerRef}
            onWheel={handleMessagesScroll}
            sx={{
              flex: 1,
              padding: '16px 12px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              backgroundColor: '#f9f9f9',
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1'
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '3px'
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555'
              }
            }}
          >
            {messages.map((msg, index) => renderMessage(msg, index))}
            
            {showGetStarted && !isTyping && (
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
                    color: 'white !important',
                    animation: 'fadeIn 0.5s ease'
                  }}
                >
                  Get Started
                </Button>
              </Box>
            )}
            
            {renderFAQSection()}

            {isTyping && (
              <Box
                sx={{
                  display: 'flex',
                  gap: '8px',
                  alignSelf: 'flex-start',
                  animation: 'fadeIn 0.3s ease'
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

          {replyingTo && (
            <Box sx={{
              padding: '8px 12px',
              backgroundColor: '#f5f5f5',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                Replying to: {replyingTo.text.substring(0, 50)}...
              </Typography>
              <IconButton size="small" onClick={cancelReply}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

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
              placeholder={replyingTo ? 'Type your reply...' : 'Type a message...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isTyping}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '24px',
                }
              }}
            />
            
            {messages.length > 1 && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleQuickQuestionsButtonClick}
                disabled={isTyping}
                sx={{ 
                  minWidth: '40px',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  color: 'white !important'
                }}
                title="Quick Questions"
              >
                <MenuIcon sx={{ fontSize: '18px' }} />
              </Button>
            )}
            
            <Button
              variant="contained"
              color="primary"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              sx={{ 
                minWidth: '40px',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                color: 'white !important'
              }}
              title="Send your message"
            >
              <SendIcon sx={{ fontSize: '18px' }} />
            </Button>
          </Box>
        </Paper>
      )}

      <style jsx global>{`
        @keyframes typingAnimation {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .MuiCollapse-root {
          transition: height 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms !important;
        }
        .MuiCollapse-entered {
          overflow: visible !important;
        }
        .MuiListItem-root {
          transition: all 0.2s ease;
        }
      `}</style>
    </>
  );
};

export default Chatbot;