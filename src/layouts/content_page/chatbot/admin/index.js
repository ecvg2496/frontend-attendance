import { useState, useEffect, useRef } from 'react';
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
  CircularProgress,
  Chip,
  Tooltip,
  Menu,
  MenuItem,
  InputAdornment
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  AccessTime as TimeIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { dataService } from "global/function";

// Avatar images
const userAvatar = '/static/images/avatar/user.png';
const adminAvatar = '/static/images/avatar/admin.png';
const botAvatar = '/static/images/avatar/bot.png';

const AdminChat = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const messagesEndRef = useRef(null);

  // Fetch all conversations
  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dataService('GET', 'chatbot/conversations/');
      setConversations(response.data);
    } catch (err) {
      console.error('Failed to fetch conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch single conversation
  const fetchConversation = async (id) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await dataService('GET', `chatbot/conversations/${id}/`);
      setSelectedConversation(response.data);
      scrollToBottom();
    } catch (err) {
      console.error('Failed to fetch conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  };

  // Send message as admin
  const sendMessage = async () => {
    if (!input.trim() || !selectedConversation) return;

    const tempId = Date.now();
    const tempMessage = {
      id: tempId,
      sender_type: 'admin',
      content: input,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    // Optimistic update
    setSelectedConversation(prev => ({
      ...prev,
      messages: [...prev.messages, tempMessage]
    }));
    setInput('');
    scrollToBottom();

    try {
      await dataService('POST', 'chatbot/admin/messages/', {
        conversation_id: selectedConversation.id,
        content: input
      });
      
      // Refresh to get actual message from server
      await fetchConversation(selectedConversation.id);
    } catch (err) {
      console.error('Failed to send message:', err);
      // Update status to failed
      setSelectedConversation(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === tempId ? { ...msg, status: 'failed' } : msg
        )
      }));
    }
  };

  // Delete message
  const deleteMessage = async () => {
    if (!selectedMessage || !selectedConversation) return;
    
    try {
      await dataService('DELETE', `chatbot/messages/${selectedMessage.id}/`);
      await fetchConversation(selectedConversation.id);
    } catch (err) {
      console.error('Failed to delete message:', err);
    } finally {
      handleMessageMenuClose();
    }
  };

  // Helper functions
  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    fetchConversation(conversation.id);
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    fetchConversations();
  };

  const refreshData = () => {
    if (selectedConversation) {
      fetchConversation(selectedConversation.id);
    } else {
      fetchConversations();
    }
  };

  const getUnreadCount = (conversation) => {
    return conversation.messages.filter(
      msg => msg.sender_type === 'user' && !msg.read
    ).length;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sending': return <TimeIcon fontSize="small" />;
      case 'delivered': return <CheckIcon fontSize="small" color="success" />;
      case 'failed': return <ErrorIcon fontSize="small" color="error" />;
      default: return null;
    }
  };

  const handleMessageMenuOpen = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMessageMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  // Filter conversations based on search query
  const filteredConversations = conversations
    .filter(conv => 
      activeTab === 0 ? getUnreadCount(conv) > 0 : 
      activeTab === 1 ? true :
      getUnreadCount(conv) > 0
    )
    .filter(conv => 
      searchQuery === '' ||
      conv.user.user_id.toString().includes(searchQuery) ||
      conv.messages.some(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

  // Effects
  useEffect(() => {
    if (isOpen) {
      fetchConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    const interval = setInterval(refreshData, 10000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  return (
    <>
      {/* Floating chat button */}
      {!isOpen && (
        <Badge 
          badgeContent={conversations.reduce((sum, conv) => sum + getUnreadCount(conv), 0)} 
          color="error"
          overlap="circular"
        >
          <Box
            onClick={() => setIsOpen(true)}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              width: 60,
              height: 60,
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: 3,
              zIndex: 9999,
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ChatIcon fontSize="large" />
          </Box>
        </Badge>
      )}

      {/* Chat window */}
      {isOpen && (
        <Paper
          elevation={3}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 400,
            height: 600,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            zIndex: 9998
          }}
        >
          {/* Header */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedConversation && (
                <IconButton onClick={handleBackToList} sx={{ color: 'white' }}>
                  <ArrowBackIcon />
                </IconButton>
              )}
              <Typography variant="h6" noWrap sx={{ maxWidth: 200 }}>
                {selectedConversation 
                  ? `User #${selectedConversation.user.user_id}` 
                  : 'Admin Chat'}
              </Typography>
            </Box>
            <Box>
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={refreshData} 
                  sx={{ color: 'white', mr: 1 }}
                  disabled={isLoading}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <IconButton onClick={() => setIsOpen(false)} sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {/* Search bar */}
          {!selectedConversation && (
            <Box sx={{ p: 1, bgcolor: 'background.paper' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search users or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                  }
                }}
              />
            </Box>
          )}

          {/* Tabs */}
          {!selectedConversation && (
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newVal) => setActiveTab(newVal)}
                variant="fullWidth"
              >
                <Tab label="Active" />
                <Tab label="All" />
                <Tab label="Unread" />
              </Tabs>
            </Box>
          )}

          {/* Content area */}
          <Box sx={{ 
            flex: 1, 
            overflow: 'auto', 
            bgcolor: 'background.default',
            position: 'relative'
          }}>
            {isLoading && !selectedConversation ? (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100%' 
              }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="error">{error}</Typography>
                <Button 
                  onClick={refreshData} 
                  variant="outlined" 
                  sx={{ mt: 2 }}
                >
                  Retry
                </Button>
              </Box>
            ) : selectedConversation ? (
              <>
                {/* Messages */}
                <Box sx={{ p: 1 }}>
                  {selectedConversation.messages.map((msg) => (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        gap: 1,
                        mb: 1.5,
                        flexDirection: msg.sender_type === 'admin' ? 'row-reverse' : 'row'
                      }}
                    >
                      <Avatar 
                        src={msg.sender_type === 'user' ? userAvatar : 
                             msg.sender_type === 'admin' ? adminAvatar : botAvatar}
                        sx={{ width: 32, height: 32, alignSelf: 'flex-end' }}
                      />
                      <Box sx={{ maxWidth: '80%' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: msg.sender_type === 'admin' ? 'row-reverse' : 'row',
                            alignItems: 'flex-end',
                            gap: 0.5
                          }}
                        >
                          <Box
                            sx={{
                              p: 1.5,
                              borderRadius: 4,
                              bgcolor: msg.sender_type === 'admin' 
                                ? 'primary.main' 
                                : msg.sender_type === 'bot'
                                  ? 'grey.100'
                                  : 'grey.200',
                              color: msg.sender_type === 'admin' ? 'white' : 'text.primary',
                              borderTopLeftRadius: msg.sender_type !== 'admin' ? 0 : undefined,
                              borderTopRightRadius: msg.sender_type === 'admin' ? 0 : undefined,
                              position: 'relative',
                              wordBreak: 'break-word'
                            }}
                          >
                            <Typography variant="body2">{msg.content}</Typography>
                            {msg.status && (
                              <Box sx={{ 
                                position: 'absolute',
                                right: 4,
                                bottom: 4,
                                display: 'flex'
                              }}>
                                {getStatusIcon(msg.status)}
                              </Box>
                            )}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMessageMenuOpen(e, msg)}
                            sx={{
                              visibility: 'hidden',
                              'div:hover &': { visibility: 'visible' }
                            }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            display: 'block',
                            textAlign: msg.sender_type === 'admin' ? 'right' : 'left',
                            color: 'text.secondary',
                            mt: 0.5,
                            px: 1
                          }}
                        >
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>
              </>
            ) : (
              /* Conversation list */
              <List disablePadding>
                {filteredConversations.length > 0 ? (
                  filteredConversations.map(conv => (
                    <ListItem key={conv.id} disablePadding>
                      <ListItemButton 
                        onClick={() => handleConversationSelect(conv)}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          width: '100%',
                          py: 1.5,
                          px: 2
                        }}>
                          <Badge
                            badgeContent={getUnreadCount(conv)}
                            color="error"
                            overlap="circular"
                            sx={{ mr: 2 }}
                          >
                            <Avatar src={userAvatar} sx={{ width: 40, height: 40 }} />
                          </Badge>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography fontWeight="medium" noWrap>
                              User #{conv.user.user_id}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              noWrap
                              sx={{ fontSize: '0.75rem' }}
                            >
                              {conv.messages[conv.messages.length - 1]?.content || 'No messages'}
                            </Typography>
                          </Box>
                          <Typography 
                            variant="caption" 
                            sx={{ 
                              color: 'text.secondary',
                              fontSize: '0.7rem',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {new Date(conv.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))
                ) : (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No conversations found
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Box>

          {/* Input area (only when conversation is selected) */}
          {selectedConversation && (
            <Box
              sx={{
                p: 1.5,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                gap: 1
              }}
            >
              <TextField
                fullWidth
                multiline
                maxRows={4}
                size="small"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                disabled={isLoading}
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
                disabled={!input.trim() || isLoading}
                sx={{ 
                  minWidth: 40, 
                  width: 40, 
                  height: 40,
                  borderRadius: '50%'
                }}
              >
                <SendIcon fontSize="small" />
              </Button>
            </Box>
          )}

          {/* Message context menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMessageMenuClose}
          >
            <MenuItem onClick={deleteMessage}>
              <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
              Delete Message
            </MenuItem>
            <MenuItem onClick={handleMessageMenuClose}>
              <InfoIcon fontSize="small" sx={{ mr: 1 }} />
              Message Details
            </MenuItem>
          </Menu>
        </Paper>
      )}
    </>
  );
};

export default AdminChat;