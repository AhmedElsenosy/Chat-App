/**
 * Message types enum for chat messages
 */
export const MessageType = {
  USER_MESSAGE: 'user_message',
  SYSTEM_NOTIFICATION: 'system_notification',
  ADMIN_MESSAGE: 'admin_message',
  ERROR_MESSAGE: 'error_message',
  INFO_MESSAGE: 'info_message'
};

/**
 * Chat Message class representing a message in the system
 */
export class ChatMessage {
  constructor({
    id = null,
    user,
    message,
    chatRoom = null,
    messageType = MessageType.USER_MESSAGE,
    timestamp = new Date(),
    metadata = {}
  }) {
    this.id = id || Date.now() + Math.random();
    this.user = user;
    this.message = message;
    this.chatRoom = chatRoom;
    this.messageType = messageType;
    this.timestamp = timestamp;
    this.metadata = metadata;
  }

  isSystemMessage() {
    return (
      this.messageType === MessageType.SYSTEM_NOTIFICATION ||
      this.messageType === MessageType.ADMIN_MESSAGE
    );
  }

  isErrorMessage() {
    return this.messageType === MessageType.ERROR_MESSAGE;
  }

  isUserMessage() {
    return this.messageType === MessageType.USER_MESSAGE;
  }
}

/**
 * Factory Pattern implementation for creating chat messages
 * Centralizes message creation logic
 */
export class MessageFactory {
  /**
   * Create a user message
   */
  static createUserMessage(username, content, chatRoom = null) {
    if (!username || !content) {
      throw new Error('Username and content are required');
    }

    return new ChatMessage({
      user: username.trim(),
      message: content.trim(),
      chatRoom,
      messageType: MessageType.USER_MESSAGE,
      timestamp: new Date()
    });
  }

  /**
   * Create a system notification message
   */
  static createSystemNotification(content, username = 'system', chatRoom = null) {
    if (!content) {
      throw new Error('Content is required');
    }

    return new ChatMessage({
      user: username,
      message: content.trim(),
      chatRoom,
      messageType: MessageType.SYSTEM_NOTIFICATION,
      timestamp: new Date()
    });
  }

  /**
   * Create an admin message
   */
  static createAdminMessage(content, chatRoom = null) {
    if (!content) {
      throw new Error('Content is required');
    }

    return new ChatMessage({
      user: 'admin',
      message: content.trim(),
      chatRoom,
      messageType: MessageType.ADMIN_MESSAGE,
      timestamp: new Date()
    });
  }

  /**
   * Create a user joined notification
   */
  static createUserJoinedNotification(username, chatRoom = null) {
    if (!username) {
      throw new Error('Username is required');
    }

    return new ChatMessage({
      user: 'admin',
      message: `${username} has joined the chat`,
      chatRoom,
      messageType: MessageType.SYSTEM_NOTIFICATION,
      timestamp: new Date(),
      metadata: {
        action: 'user_joined',
        targetUser: username
      }
    });
  }

  /**
   * Create a user left notification
   */
  static createUserLeftNotification(username, chatRoom = null) {
    if (!username) {
      throw new Error('Username is required');
    }

    return new ChatMessage({
      user: 'admin',
      message: `${username} has left the chat`,
      chatRoom,
      messageType: MessageType.SYSTEM_NOTIFICATION,
      timestamp: new Date(),
      metadata: {
        action: 'user_left',
        targetUser: username
      }
    });
  }

  /**
   * Create an error message
   */
  static createErrorMessage(errorContent, username = 'system', chatRoom = null) {
    return new ChatMessage({
      user: username,
      message: errorContent,
      chatRoom,
      messageType: MessageType.ERROR_MESSAGE,
      timestamp: new Date()
    });
  }

  /**
   * Create an info message
   */
  static createInfoMessage(content, chatRoom = null) {
    return new ChatMessage({
      user: 'system',
      message: content,
      chatRoom,
      messageType: MessageType.INFO_MESSAGE,
      timestamp: new Date()
    });
  }

  /**
   * Create message from SignalR response
   */
  static createFromSignalR(user, message, chatRoom = null) {
    // Determine message type based on user
    let messageType = MessageType.USER_MESSAGE;
    
    if (user === 'admin' || user === 'system') {
      messageType = MessageType.SYSTEM_NOTIFICATION;
    }

    return new ChatMessage({
      user,
      message,
      chatRoom,
      messageType,
      timestamp: new Date()
    });
  }
}

export default MessageFactory;
