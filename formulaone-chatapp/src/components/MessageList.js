import React, { useEffect, useRef } from 'react';
import { Card } from 'react-bootstrap';

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const isSystemMessage = (message) => {
    return message.user === 'admin' || message.user === 'system';
  };

  const isOwnMessage = (message) => {
    return message.user === currentUser;
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();
    
    return currentDate !== previousDate;
  };

  const shouldShowUserInfo = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    if (isSystemMessage(currentMessage)) return false;
    
    return (
      currentMessage.user !== previousMessage.user ||
      shouldShowDateSeparator(currentMessage, previousMessage)
    );
  };

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Header className="bg-white border-bottom">
        <div className="d-flex align-items-center">
          <i className="bi bi-chat-left-text-fill text-primary me-2"></i>
          <h6 className="mb-0 fw-semibold">Messages</h6>
        </div>
      </Card.Header>
      
      <Card.Body className="p-0 overflow-auto" style={{ height: '400px' }}>
        <div className="messages-container p-3">
          {messages.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-chat-square-dots" style={{ fontSize: '3rem' }}></i>
              <p className="mt-3 mb-0">No messages yet</p>
              <small>Start the conversation!</small>
            </div>
          ) : (
            messages.map((message, index) => {
              const previousMessage = index > 0 ? messages[index - 1] : null;
              const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
              const showUserInfo = shouldShowUserInfo(message, previousMessage);
              const isOwn = isOwnMessage(message);
              const isSystem = isSystemMessage(message);

              return (
                <div key={message.id || index}>
                  {/* Date separator */}
                  {showDateSeparator && (
                    <div className="text-center my-3">
                      <small className="bg-light px-3 py-1 rounded-pill text-muted">
                        {formatDate(message.timestamp)}
                      </small>
                    </div>
                  )}

                  {/* System message */}
                  {isSystem ? (
                    <div className="text-center my-2">
                      <small className="text-muted bg-light px-3 py-1 rounded-pill">
                        <i className="bi bi-info-circle me-1"></i>
                        {message.message}
                      </small>
                    </div>
                  ) : (
                    /* Regular message */
                    <div className={`mb-3 ${isOwn ? 'text-end' : 'text-start'}`}>
                      <div className={`d-inline-block ${isOwn ? 'ms-auto' : 'me-auto'}`} style={{ maxWidth: '75%' }}>
                        {/* User info */}
                        {showUserInfo && !isOwn && (
                          <div className="mb-1">
                            <small className="text-muted fw-semibold">
                              <i className="bi bi-person-circle me-1"></i>
                              {message.user}
                            </small>
                          </div>
                        )}

                        {/* Message bubble */}
                        <div
                          className={`p-3 rounded-3 ${
                            isOwn
                              ? 'bg-primary text-white'
                              : 'bg-light text-dark'
                          }`}
                          style={{
                            borderBottomRightRadius: isOwn ? '0.5rem' : '1rem',
                            borderBottomLeftRadius: isOwn ? '1rem' : '0.5rem'
                          }}
                        >
                          <p className="mb-1">{message.message}</p>
                          <small 
                            className={`${
                              isOwn ? 'text-white-50' : 'text-muted'
                            }`}
                          >
                            {formatTime(message.timestamp)}
                            {isOwn && (
                              <i className="bi bi-check2-all ms-1"></i>
                            )}
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default MessageList;
