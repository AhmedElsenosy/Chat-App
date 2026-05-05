import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';

const UserList = ({ users, currentUser, currentRoom }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'away':
        return 'warning';
      case 'busy':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online':
        return 'bi-circle-fill';
      case 'away':
        return 'bi-clock-fill';
      case 'busy':
        return 'bi-dash-circle-fill';
      default:
        return 'bi-circle';
    }
  };

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Header className="bg-primary text-white border-0">
        <div className="d-flex align-items-center justify-content-between">
          <h6 className="mb-0 fw-semibold">
            <i className="bi bi-people-fill me-2"></i>
            Online Users
          </h6>
          <Badge bg="light" text="primary" className="rounded-pill">
            {users.length}
          </Badge>
        </div>
        <small className="opacity-75">
          <i className="bi bi-door-open me-1"></i>
          {currentRoom}
        </small>
      </Card.Header>
      
      <Card.Body className="p-0">
        {users.length === 0 ? (
          <div className="text-center py-4 text-muted">
            <i className="bi bi-person-x" style={{ fontSize: '2rem' }}></i>
            <p className="mt-2 mb-0">No users online</p>
          </div>
        ) : (
          <ListGroup variant="flush" className="user-list">
            {users.map((user, index) => (
              <ListGroup.Item
                key={user.id || index}
                className={`border-0 py-3 px-3 ${user.username === currentUser ? 'bg-light' : ''}`}
              >
                <div className="d-flex align-items-center">
                  <div className="position-relative me-3">
                    <div 
                      className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                      style={{ width: '40px', height: '40px', fontSize: '14px' }}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span 
                      className={`position-absolute bottom-0 end-0 rounded-circle border border-2 border-white ${getStatusIcon(user.status || 'online')}`}
                      style={{ 
                        width: '12px', 
                        height: '12px',
                        fontSize: '8px'
                      }}
                    >
                      <i className={`bi ${getStatusIcon(user.status || 'online')} text-${getStatusColor(user.status || 'online')}`}></i>
                    </span>
                  </div>
                  
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center justify-content-between">
                      <span className="fw-semibold text-dark">
                        {user.username}
                        {user.username === currentUser && (
                          <small className="text-muted ms-1">(You)</small>
                        )}
                      </span>
                      {user.isTyping && (
                        <small className="text-primary">
                          <i className="bi bi-three-dots"></i>
                        </small>
                      )}
                    </div>
                    
                    <small className="text-muted">
                      <i className={`bi ${getStatusIcon(user.status || 'online')} me-1`}></i>
                      {user.status || 'Online'}
                      {user.lastSeen && user.status !== 'online' && (
                        <span className="ms-1">
                          • {new Date(user.lastSeen).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      )}
                    </small>
                  </div>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Card.Body>
      
      <Card.Footer className="bg-light border-0 text-center py-2">
        <small className="text-muted">
          <i className="bi bi-wifi me-1"></i>
          Connected to chat
        </small>
      </Card.Footer>
    </Card>
  );
};

export default UserList;
