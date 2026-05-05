import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [chatRoom, setChatRoom] = useState('General');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    if (username.trim().length < 2) {
      setError('Username must be at least 2 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call the parent component's login handler
      await onLogin(username.trim(), chatRoom);
    } catch (err) {
      setError('Failed to join chat. Please try again.');
      setIsLoading(false);
    }
  };

  const predefinedRooms = [
    'General',
    'Technology',
    'Sports',
    'Music',
    'Gaming',
    'Movies'
  ];

  return (
    <Container fluid className="login-container d-flex align-items-center justify-content-center min-vh-100">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4} xl={3}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <i className="bi bi-chat-dots-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h2 className="mt-3 mb-1 fw-bold text-dark">FormulaOne Chat</h2>
                <p className="text-muted">Join the conversation</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-person-fill me-2"></i>
                    Username
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={isLoading}
                    className="rounded-3"
                    maxLength={50}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <i className="bi bi-door-open-fill me-2"></i>
                    Chat Room
                  </Form.Label>
                  <Form.Select
                    value={chatRoom}
                    onChange={(e) => setChatRoom(e.target.value)}
                    disabled={isLoading}
                    className="rounded-3"
                  >
                    {predefinedRooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-100 rounded-3 fw-semibold"
                  disabled={isLoading || !username.trim()}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Joining...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Join Chat
                    </>
                  )}
                </Button>
              </Form>

              <div className="text-center mt-4">
                <small className="text-muted">
                  <i className="bi bi-shield-check me-1"></i>
                  Your messages are secure and private
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Login;
