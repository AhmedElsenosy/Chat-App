import React, { useState, useEffect } from 'react';
import { Alert, Container } from 'react-bootstrap';
import Login from './Login';
import ChatRoom from './ChatRoom';
import signalRService from '../services/signalRService';

const ChatApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [currentRoom, setCurrentRoom] = useState('General');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  useEffect(() => {
    // Check if user was previously logged in (optional: implement localStorage persistence)
    const savedUser = localStorage.getItem('chatUser');
    const savedRoom = localStorage.getItem('chatRoom');
    
    if (savedUser && savedRoom) {
      setCurrentUser(savedUser);
      setCurrentRoom(savedRoom);
      // Auto-reconnect could be implemented here
    }

    // Cleanup on component unmount
    return () => {
      if (signalRService.getConnectionStatus().isConnected) {
        signalRService.disconnect();
      }
    };
  }, []);

  const handleLogin = async (username, chatRoom) => {
    setIsConnecting(true);
    setConnectionError('');

    try {
      // Connect to SignalR hub (using State Pattern)
      const connected = await signalRService.connectToHub(username, chatRoom);
      
      if (connected) {
        setCurrentUser(username);
        setCurrentRoom(chatRoom);
        setIsLoggedIn(true);
        
        // Save to localStorage for persistence (optional)
        localStorage.setItem('chatUser', username);
        localStorage.setItem('chatRoom', chatRoom);
        
        console.log(`Successfully connected as ${username} to ${chatRoom}`);
      } else {
        const status = signalRService.getConnectionStatus();
        setConnectionError(`Failed to connect: ${status.statusMessage}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      setConnectionError('Connection error. Please check your internet connection and try again.');
    } finally {
      setIsConnecting(false);
    }
  };
  useEffect(() => {
    const handleBeforeUnload = async () => {
      try {
        await signalRService.leaveSpecificChatRoom({ Username: currentUser, ChatRoom: currentRoom });
      } catch (error) {
        console.error("Error leaving specific chat room on page unload:", error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentUser, currentRoom]);



  const handleLogout = async () => {
    try {
      // Disconnect from SignalR
      await signalRService.disconnect();
      
      // Clear state
      setIsLoggedIn(false);
      setCurrentUser('');
      setCurrentRoom('General');
      setConnectionError('');
      
      // Clear localStorage
      localStorage.removeItem('chatUser');
      localStorage.removeItem('chatRoom');
      
      console.log('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      setIsLoggedIn(false);
      setCurrentUser('');
      setCurrentRoom('General');
    }
  };

  const handleConnectionLost = () => {
    setConnectionError('Connection lost. Please refresh the page to reconnect.');
  };

  // Set up connection lost handler
  useEffect(() => {
    signalRService.setOnConnectionClosed(handleConnectionLost);
    
    return () => {
      signalRService.setOnConnectionClosed(null);
    };
  }, []);

  if (isConnecting) {
    return (
      <Container fluid className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5>Connecting to chat...</h5>
          <p className="text-muted">Please wait while we connect you to the chat server.</p>
        </div>
      </Container>
    );
  }

  return (
    <div className="chat-app">
      {/* Connection Error Alert */}
      {connectionError && (
        <Alert 
          variant="danger" 
          className="mb-0 rounded-0 text-center"
          dismissible
          onClose={() => setConnectionError('')}
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {connectionError}
        </Alert>
      )}

      {/* Main App Content */}
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <ChatRoom 
          currentUser={currentUser}
          currentRoom={currentRoom}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default ChatApp;
