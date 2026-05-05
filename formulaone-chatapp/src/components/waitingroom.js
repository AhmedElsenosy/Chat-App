import { useState } from "react";
import { Button, Col, Row, Form } from "react-bootstrap";

const WaitingRoom = ({ joinChatRoom }) => {
  const [username, setUsername] = useState("");
  const [chatroom, setChatroom] = useState("");

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        joinChatRoom(username, chatroom);
      }}
    >
      <Row className="px-5 py-5">
        <Col sm={12}>
          <Form.Group className="mb-3">
            <Form.Control
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Control
              placeholder="Enter chatroom name"
              value={chatroom}
              onChange={(e) => setChatroom(e.target.value)}
            />
          </Form.Group>
        </Col>
        <Col sm={12}>
          <hr />
          <Button type="submit">Join Chat</Button>
        </Col>
      </Row>
    </Form>
  );
};

export default WaitingRoom;
