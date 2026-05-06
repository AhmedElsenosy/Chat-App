import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Navbar, Nav, Button, Dropdown } from 'react-bootstrap';
import UserList from './UserList';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import signalRService from '../services/signalRService';

const ChatRoom = ({ currentUser, currentRoom, onLogout }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [showUserList, setShowUserList] = useState(true);

  useEffect(() => {
    // Set up message received callback
    signalRService.setOnMessageReceived((chatMessage) => {
      setMessages(prev => [...prev, {
        id: chatMessage.id,
        user: chatMessage.user,
        message: chatMessage.message,
        timestamp: chatMessage.timestamp,
        messageType: chatMessage.messageType
      }]);
    });
    

    // Set up connection closed callback
    signalRService.setOnConnectionClosed(() => {
      setIsConnected(false);
    });

    // Set up state changed callback
    signalRService.setOnStateChanged((newState, statusMessage) => {
      console.log('Connection state changed:', newState, statusMessage);
      setIsConnected(signalRService.canSendMessages());
    });

    // Check initial connection status
    const status = signalRService.getConnectionStatus();
    setIsConnected(status.isConnected);

    // Set up user list callback
    signalRService.setOnUserListReceived((userList) => {
      const formattedUsers = userList.map((username, index) => ({
        id: index + 1,
        username: username,
        status: 'online'
      }));
      setUsers(formattedUsers);
    });

    return () => {
      // Cleanup callbacks
      signalRService.setOnMessageReceived(null);
      signalRService.setOnConnectionClosed(null);
      signalRService.setOnStateChanged(null);
      signalRService.setOnUserListReceived(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSendMessage = async (messageText) => {
    try {
      // Send message via SignalR
      const success = await signalRService.sendMessage(messageText);
      
      if (!success) {
        console.error('Failed to send message');
        // In a real app, you might want to show an error indicator
        // or remove the optimistically added message
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleLogout = async () => {
  try {
    // اعمل leave من الروم الحالي
    await signalRService.leaveSpecificChatRoom({
      Username: currentUser,
      ChatRoom: currentRoom
    });

    // بعدين اقفل الكونكشن
    await signalRService.disconnect();

    onLogout();
  } catch (error) {
    console.error('Error during logout:', error);
    onLogout(); // Logout anyway
  }
};

  const toggleUserList = () => {
    setShowUserList(!showUserList);
  };

  return (
    <div className="chat-room-container d-flex flex-column vh-100">
      {/* Top Navigation */}
      <Navbar bg="primary" variant="dark" className="px-3 shadow-sm">
        <Navbar.Brand>
          <i className="bi bi-chat-dots-fill me-2"></i>
          FormulaOne Chat
        </Navbar.Brand>
        
        <Nav className="me-auto">
          <Nav.Item>
            <span className="navbar-text">
              <i className="bi bi-door-open me-1"></i>
              {currentRoom}
            </span>
          </Nav.Item>
        </Nav>

        <Nav className="d-flex align-items-center">
          {/* Connection status */}
          <Nav.Item className="me-3">
            <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
              <i className={`bi ${isConnected ? 'bi-wifi' : 'bi-wifi-off'} me-1`}></i>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </Nav.Item>

          {/* Toggle user list button (mobile) */}
          <Button
            variant="outline-light"
            size="sm"
            className="me-2 d-lg-none"
            onClick={toggleUserList}
          >
            <i className="bi bi-people-fill"></i>
          </Button>

          {/* User dropdown */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-light" size="sm" id="user-dropdown">
              <i className="bi bi-person-circle me-1"></i>
              {currentUser}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              <Dropdown.Item disabled>
                <i className="bi bi-person me-2"></i>
                {currentUser}
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleLogout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Logout
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </Nav>
      </Navbar>

      {/* Main Chat Area */}
      <Container fluid className="flex-grow-1 p-3">
        <Row className="h-100">
          {/* User List Sidebar */}
          <Col 
            lg={3} 
            className={`${showUserList ? 'd-block' : 'd-none'} d-lg-block mb-3 mb-lg-0`}
          >
            <UserList 
              users={users} 
              currentUser={currentUser} 
              currentRoom={currentRoom}
            />
          </Col>

          {/* Chat Area */}
          <Col lg={showUserList ? 9 : 12} className="d-flex flex-column">
            <Row className="flex-grow-1 mb-3">
              <Col>
                <MessageList 
                  messages={messages} 
                  currentUser={currentUser}
                />
              </Col>
            </Row>
            
            <Row>
              <Col>
                <MessageInput 
                  onSendMessage={handleSendMessage}
                  disabled={!isConnected}
                  currentUser={currentUser}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ChatRoom;
