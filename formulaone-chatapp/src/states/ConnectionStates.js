/**
 * Connection State Enum
 */
export const ConnectionStateType = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error'
};

/**
 * Base Connection State class
 * Implements State Pattern for managing connection states
 */
export class ConnectionState {
  constructor(context) {
    this.context = context;
  }

  /**
   * Get the state type
   */
  getStateType() {
    throw new Error('getStateType() must be implemented');
  }

  /**
   * Handle connection attempt
   */
  async connect() {
    throw new Error('connect() must be implemented');
  }

  /**
   * Handle disconnection
   */
  async disconnect() {
    throw new Error('disconnect() must be implemented');
  }

  /**
   * Handle sending message
   */
  async sendMessage(message) {
    throw new Error('sendMessage() must be implemented');
  }

  /**
   * Check if can send messages
   */
  canSendMessages() {
    return false;
  }

  /**
   * Get status message for UI
   */
  getStatusMessage() {
    return '';
  }

  /**
   * Handle reconnection attempt
   */
  async reconnect() {
    throw new Error('reconnect() must be implemented');
  }
}

/**
 * Disconnected State
 */
export class DisconnectedState extends ConnectionState {
  getStateType() {
    return ConnectionStateType.DISCONNECTED;
  }

  async connect() {
    console.log('[State] Transitioning from Disconnected to Connecting');
    this.context.setState(new ConnectingState(this.context));
    return await this.context.state.connect();
  }

  async disconnect() {
    console.log('[State] Already disconnected');
    return true;
  }

  async sendMessage(message) {
    console.error('[State] Cannot send message: Not connected');
    throw new Error('Cannot send message: Not connected');
  }

  canSendMessages() {
    return false;
  }

  getStatusMessage() {
    return 'Disconnected';
  }

  async reconnect() {
    return await this.connect();
  }
}

/**
 * Connecting State
 */
export class ConnectingState extends ConnectionState {
  getStateType() {
    return ConnectionStateType.CONNECTING;
  }

  async connect() {
    console.log('[State] Attempting to connect...');
    
    try {
      // Actual connection logic will be handled by the context
      const success = await this.context.performConnection();
      
      if (success) {
        console.log('[State] Connection successful, transitioning to Connected');
        this.context.setState(new ConnectedState(this.context));
        return true;
      } else {
        console.log('[State] Connection failed, transitioning to Error');
        this.context.setState(new ErrorState(this.context, 'Connection failed'));
        return false;
      }
    } catch (error) {
      console.error('[State] Connection error:', error);
      this.context.setState(new ErrorState(this.context, error.message));
      return false;
    }
  }

  async disconnect() {
    console.log('[State] Canceling connection attempt');
    this.context.setState(new DisconnectedState(this.context));
    return true;
  }

  async sendMessage(message) {
    console.error('[State] Cannot send message: Still connecting');
    throw new Error('Cannot send message: Still connecting');
  }

  canSendMessages() {
    return false;
  }

  getStatusMessage() {
    return 'Connecting...';
  }

  async reconnect() {
    console.log('[State] Already in connecting state');
    return await this.connect();
  }
}

/**
 * Connected State
 */
export class ConnectedState extends ConnectionState {
  getStateType() {
    return ConnectionStateType.CONNECTED;
  }

  async connect() {
    console.log('[State] Already connected');
    return true;
  }

  async disconnect() {
    console.log('[State] Disconnecting from Connected state');
    
    try {
      await this.context.performDisconnection();
      this.context.setState(new DisconnectedState(this.context));
      return true;
    } catch (error) {
      console.error('[State] Error during disconnection:', error);
      this.context.setState(new ErrorState(this.context, error.message));
      return false;
    }
  }

  async sendMessage(message) {
    console.log('[State] Sending message in Connected state');
    return await this.context.performSendMessage(message);
  }

  canSendMessages() {
    return true;
  }

  getStatusMessage() {
    return 'Connected';
  }

  async reconnect() {
    console.log('[State] Already connected, no need to reconnect');
    return true;
  }
}

/**
 * Reconnecting State
 */
export class ReconnectingState extends ConnectionState {
  constructor(context, attemptNumber = 1, maxAttempts = 5) {
    super(context);
    this.attemptNumber = attemptNumber;
    this.maxAttempts = maxAttempts;
  }

  getStateType() {
    return ConnectionStateType.RECONNECTING;
  }

  async connect() {
    console.log(`[State] Reconnection attempt ${this.attemptNumber}/${this.maxAttempts}`);
    
    try {
      const success = await this.context.performConnection();
      
      if (success) {
        console.log('[State] Reconnection successful');
        this.context.setState(new ConnectedState(this.context));
        return true;
      } else {
        if (this.attemptNumber >= this.maxAttempts) {
          console.log('[State] Max reconnection attempts reached');
          this.context.setState(new ErrorState(this.context, 'Max reconnection attempts reached'));
          return false;
        } else {
          // Try again with incremented attempt number
          this.attemptNumber++;
          
          // Wait before next attempt (exponential backoff)
          const delay = Math.min(1000 * Math.pow(2, this.attemptNumber - 1), 10000);
          console.log(`[State] Waiting ${delay}ms before next attempt...`);
          
          await new Promise(resolve => setTimeout(resolve, delay));
          return await this.connect();
        }
      }
    } catch (error) {
      console.error('[State] Reconnection error:', error);
      
      if (this.attemptNumber >= this.maxAttempts) {
        this.context.setState(new ErrorState(this.context, error.message));
        return false;
      } else {
        this.attemptNumber++;
        const delay = Math.min(1000 * Math.pow(2, this.attemptNumber - 1), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
        return await this.connect();
      }
    }
  }

  async disconnect() {
    console.log('[State] Canceling reconnection attempts');
    this.context.setState(new DisconnectedState(this.context));
    return true;
  }

  async sendMessage(message) {
    console.error('[State] Cannot send message: Reconnecting');
    throw new Error('Cannot send message: Reconnecting');
  }

  canSendMessages() {
    return false;
  }

  getStatusMessage() {
    return `Reconnecting (${this.attemptNumber}/${this.maxAttempts})...`;
  }

  async reconnect() {
    return await this.connect();
  }
}

/**
 * Error State
 */
export class ErrorState extends ConnectionState {
  constructor(context, errorMessage = 'Unknown error') {
    super(context);
    this.errorMessage = errorMessage;
  }

  getStateType() {
    return ConnectionStateType.ERROR;
  }

  async connect() {
    console.log('[State] Attempting to recover from error state');
    this.context.setState(new ConnectingState(this.context));
    return await this.context.state.connect();
  }

  async disconnect() {
    console.log('[State] Disconnecting from Error state');
    this.context.setState(new DisconnectedState(this.context));
    return true;
  }

  async sendMessage(message) {
    console.error('[State] Cannot send message: Connection error');
    throw new Error(`Cannot send message: ${this.errorMessage}`);
  }

  canSendMessages() {
    return false;
  }

  getStatusMessage() {
    return `Error: ${this.errorMessage}`;
  }

  async reconnect() {
    console.log('[State] Attempting reconnection from error state');
    this.context.setState(new ReconnectingState(this.context));
    return await this.context.state.connect();
  }

  getErrorMessage() {
    return this.errorMessage;
  }
}

export default {
  ConnectionStateType,
  ConnectionState,
  DisconnectedState,
  ConnectingState,
  ConnectedState,
  ReconnectingState,
  ErrorState
};
