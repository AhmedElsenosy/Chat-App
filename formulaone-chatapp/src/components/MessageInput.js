import React, { useState, useRef } from 'react';
import { Card, Form, Button, InputGroup } from 'react-bootstrap';

const MessageInput = ({ onSendMessage, disabled = false, currentUser }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim() || disabled || isSending) {
      return;
    }

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      // Restore message on error
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicator (placeholder for future implementation)
    if (!isTyping && e.target.value.length > 0) {
      setIsTyping(true);
      // Here you could emit typing status to other users
    } else if (isTyping && e.target.value.length === 0) {
      setIsTyping(false);
      // Here you could stop typing status
    }
  };

  const handleEmojiClick = (emoji) => {
    setMessage(prev => prev + emoji);
    inputRef.current?.focus();
  };

  const commonEmojis = ['😀', '😂', '❤️', '👍', '👎', '😢', '😮', '😡'];

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body className="p-3">
        {/* Emoji bar */}
        <div className="mb-2">
          <div className="d-flex gap-1 flex-wrap">
            {commonEmojis.map((emoji, index) => (
              <Button
                key={index}
                variant="outline-light"
                size="sm"
                className="p-1 border-0"
                style={{ fontSize: '1.2rem', lineHeight: 1 }}
                onClick={() => handleEmojiClick(emoji)}
                disabled={disabled}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>

        {/* Message input form */}
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Form.Control
              ref={inputRef}
              as="textarea"
              rows={1}
              placeholder={disabled ? "Connecting..." : "Type your message..."}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={disabled || isSending}
              className="border-0 bg-light resize-none"
              style={{ 
                minHeight: '45px',
                maxHeight: '120px',
                resize: 'none'
              }}
              maxLength={1000}
            />
            
            <Button
              type="submit"
              variant="primary"
              disabled={!message.trim() || disabled || isSending}
              className="px-4"
            >
              {isSending ? (
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              ) : (
                <i className="bi bi-send-fill"></i>
              )}
            </Button>
          </InputGroup>
        </Form>

        {/* Message info */}
        <div className="d-flex justify-content-between align-items-center mt-2">
          <small className="text-muted">
            {isTyping && message.length > 0 && (
              <>
                <i className="bi bi-three-dots me-1"></i>
                Typing...
              </>
            )}
          </small>
          
          <small className="text-muted">
            {message.length}/1000
            {message.length > 900 && (
              <span className="text-warning ms-1">
                <i className="bi bi-exclamation-triangle-fill"></i>
              </span>
            )}
          </small>
        </div>

        {/* Connection status */}
        {disabled && (
          <div className="text-center mt-2">
            <small className="text-muted">
              <i className="bi bi-wifi-off me-1"></i>
              Connecting to chat...
            </small>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default MessageInput;
