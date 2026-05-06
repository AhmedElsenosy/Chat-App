import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { MessageFactory } from '../factories/MessageFactory';
import { DisconnectedState, ConnectingState, ConnectedState, ReconnectingState, ErrorState } from '../states/ConnectionStates';

/**
 * SignalR Service implementing State Pattern for connection management
 * Context class for State Pattern
 */
class SignalRService {
  constructor() {
    this.connection = null;
    this.currentUser = null;
    this.currentRoom = 'General';
    
    // State Pattern: Start with Disconnected state
    this.state = new DisconnectedState(this);
    
    // Callbacks
    this.onMessageReceived = null;
    this.onConnectionClosed = null;
    this.onStateChanged = null;
    this.onUserListReceived = null;

    // Store latest user list for late subscribers
    this.lastUserList = null;
  }

  /**
   * Set the current state (State Pattern)
   */
  setState(newState) {
    const oldStateType = this.state.getStateType();
    this.state = newState;
    const newStateType = this.state.getStateType();
    
    console.log(`[SignalR] State changed: ${oldStateType} -> ${newStateType}`);
    
    // Notify listeners of state change
    if (this.onStateChanged) {
      this.onStateChanged(newStateType, this.state.getStatusMessage());
    }
  }

  /**
   * Get current state type
   */
  getCurrentState() {
    return this.state.getStateType();
  }

  /**
   * Check if can send messages
   */
  canSendMessages() {
    return this.state.canSendMessages();
  }

  /**
   * Get status message
   */
  getStatusMessage() {
    return this.state.getStatusMessage();
  }

  // Initialize connection to SignalR hub
  async connectToHub(username, chatRoom = 'General') {
    this.currentUser = username;
    this.currentRoom = chatRoom;

    // Use State Pattern to handle connection
    return await this.state.connect();
  }

  /**
   * Actual connection logic (called by state)
   * This is separated from connect() to allow state to control the flow
   */
  async performConnection() {
    try {
      // Create connection to your ASP.NET SignalR hub
      this.connection = new HubConnectionBuilder()
        .withUrl('http://localhost:5205/chathub') // Your backend URL
        .configureLogging(LogLevel.Information)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: () => {
            // Transition to reconnecting state
            this.setState(new ReconnectingState(this));
            return 2000;
          }
        })
        .build();

      // Set up event listeners before starting connection
      this.setupEventListeners();

      // Start the connection
      await this.connection.start();

      console.log('Connected to SignalR hub');

      // Join specific chat room (matches your backend JoinSpecificChatRoom method)
      await this.joinSpecificChatRoom({ Username: this.currentUser, ChatRoom: this.currentRoom });

      return true;

    } catch (error) {
      console.error('Error connecting to SignalR hub:', error);
      return false;
    }
  }

  // Set up event listeners for receiving messages
  setupEventListeners() {
    if (!this.connection) return;

    // Listen for general messages (admin notifications)
    this.connection.on('ReceiveMessage', (user, message) => {
      console.log('Received message:', { user, message });
      
      // Using Factory Pattern to create message object
      const chatMessage = MessageFactory.createFromSignalR(user, message, this.currentRoom);
      
      // This will be handled by the component that calls this service
      if (this.onMessageReceived) {
        this.onMessageReceived(chatMessage);
      }
    });

    // Listen for specific chat room messages (matches your backend SendMessage method)
    this.connection.on('ReceiveSpecificMessage', (user, message) => {
      console.log('Received specific message:', { user, message });
      
      // Using Factory Pattern to create user message
      const chatMessage = MessageFactory.createUserMessage(user, message, this.currentRoom);
      
      if (this.onMessageReceived) {
        this.onMessageReceived(chatMessage);
      }
    });

    // Listen for user list updates from the server
    this.connection.on('ReceiveUserList', (userList) => {
      console.log('Received user list:', userList);
      
      // Store latest user list for late subscribers
      this.lastUserList = userList;

      if (this.onUserListReceived) {
        this.onUserListReceived(userList);
      }
    });

    // Handle connection closed
    this.connection.onclose((error) => {
      console.log('Connection closed:', error);
      
      // Transition to error state
      if (error) {
        this.setState(new ErrorState(this, error.message || 'Connection closed unexpectedly'));
      } else {
        this.setState(new DisconnectedState(this));
      }
      
      if (this.onConnectionClosed) {
        this.onConnectionClosed();
      }
    });

    // Handle reconnecting
    this.connection.onreconnecting((error) => {
      console.log('Reconnecting...', error);
      this.setState(new ReconnectingState(this));
    });

    // Handle reconnected
    this.connection.onreconnected((connectionId) => {
      console.log('Reconnected with ID:', connectionId);
      this.setState(new ConnectedState(this));
    });
  }

  // Join specific chat room (matches your backend method)
  async joinSpecificChatRoom(userConnection) {
    if (!this.connection) {
      console.error('Not connected to hub');
      return false;
    }

    try {
      await this.connection.invoke('JoinSpecificChatRoom', userConnection);
      return true;
    } catch (error) {
      console.error('Error joining chat room:', error);
      return false;
    }
  }

  async leaveSpecificChatRoom(userConnection) {
    if (!this.connection) {
      console.error('Not connected to hub');
      return false;
    }

    try {
      await this.connection.invoke("LeaveSpecificChatRoom", userConnection);
      return true;
    } catch (error) {
      console.error("Error leaving specific chat room:", error);
      return false;
    }
  }

  // Send message using State Pattern
  async sendMessage(message) {
    return await this.state.sendMessage(message);
  }

  /**
   * Actual send message logic (called by state)
   */
  async performSendMessage(message) {
    if (!this.connection) {
      console.error('Not connected to hub');
      return false;
    }

    try {
      await this.connection.invoke('SendMessage', message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Transition to error state if send fails
      this.setState(new ErrorState(this, 'Failed to send message'));
      return false;
    }
  }

  // Disconnect using State Pattern
  async disconnect() {
    return await this.state.disconnect();
  }

  /**
   * Actual disconnection logic (called by state)
   */
  async performDisconnection() {
    if (this.connection) {
      try {
        // Leave the current room first
        if (this.currentUser && this.currentRoom) {
          await this.leaveSpecificChatRoom({
            Username: this.currentUser,
            ChatRoom: this.currentRoom
          });
        }

        await this.connection.stop();
        this.currentUser = null;
        console.log('Disconnected from SignalR hub');
      } catch (error) {
        console.error('Error disconnecting:', error);
        throw error;
      }
    }
  }

  // Reconnect using State Pattern
  async reconnect() {
    return await this.state.reconnect();
  }

  // Set callback for when messages are received
  setOnMessageReceived(callback) {
    this.onMessageReceived = callback;
  }

  // Set callback for when connection is closed
  setOnConnectionClosed(callback) {
    this.onConnectionClosed = callback;
  }

  // Set callback for when state changes
  setOnStateChanged(callback) {
    this.onStateChanged = callback;
  }

  // Set callback for when user list is received
  setOnUserListReceived(callback) {
    this.onUserListReceived = callback;

    // If we already have a user list, send it immediately to the new subscriber
    if (callback && this.lastUserList) {
      callback(this.lastUserList);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.state.canSendMessages(),
      currentState: this.state.getStateType(),
      statusMessage: this.state.getStatusMessage(),
      currentUser: this.currentUser,
      currentRoom: this.currentRoom
    };
  }
}

// Export singleton instance
const signalRService = new SignalRService();
export default signalRService;
