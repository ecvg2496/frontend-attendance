import Pusher from 'pusher-js';

// Development mode logging
Pusher.logToConsole = process.env.NODE_ENV === 'development';

const pusherConfig = {
  cluster: process.env.REACT_APP_PUSHER_CLUSTER,
  forceTLS: true,
  channelAuthorization: {
    endpoint: process.env.REACT_APP_PUSHER_AUTH_ENDPOINT || '/api/attendance/pusher/auth/',
    transport: 'ajax',
    headers: {
      'Content-Type': 'application/json',
    }
  }
};
 
// Helper function to get CSRF token
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

if (!process.env.REACT_APP_PUSHER_KEY) {
  console.error('Missing Pusher app key in environment variables');
}

const pusherClient = new Pusher(process.env.REACT_APP_PUSHER_KEY, pusherConfig);

// Connection state monitoring
pusherClient.connection.bind('state_change', (states) => {
  console.log('Pusher connection state changed:', states.current);
});

export const subscribeToChannel = (channelName, eventName, callback) => {
  try {
    const channel = pusherClient.subscribe(channelName);
    channel.bind(eventName, callback);
    console.log(`Subscribed to channel: ${channelName}`);
    return channel;
  } catch (error) {
    console.error('Error subscribing to channel:', error);
    throw error;
  }
};

export const unsubscribeFromChannel = (channelName) => {
  try {
    pusherClient.unsubscribe(channelName);
    console.log(`Unsubscribed from channel: ${channelName}`);
  } catch (error) {
    console.error('Error unsubscribing from channel:', error);
  }
};

export const disconnectPusher = () => {
  pusherClient.disconnect();
  console.log('Pusher disconnected');
};

export const getPusherConnectionState = () => {
  return pusherClient.connection.state;
};

export default pusherClient;