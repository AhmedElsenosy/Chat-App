# 🏎️ FormulaOne Real-Time Chat App

A real-time chat application built with **ASP.NET Core SignalR** for the backend and **React.js** for the frontend. Users can join different chat rooms, send messages in real-time, and see live notifications when users join or leave.

## 📸 Features

- 🔐 User login with username and chat room selection
- 💬 Real-time messaging using SignalR WebSockets
- 🏠 Multiple chat rooms (General, Technology, Sports, Music, Gaming, Movies)
- 👥 Online users list with status indicators
- 🔔 System notifications (user joined / user left)
- 😀 Emoji support
- 🔄 Auto-reconnection with exponential backoff
- 📱 Responsive design with Bootstrap

## 🛠️ Tech Stack

| Layer    | Technology                     |
|----------|--------------------------------|
| Frontend | React.js, React-Bootstrap      |
| Backend  | ASP.NET Core, SignalR          |
| Protocol | WebSocket (SignalR)            |
| Styling  | Bootstrap 5, Bootstrap Icons   |

## 📁 Project Structure

```
Real-Time-Chat-App-using-SignalR/
├── FormulaOne.ChatService/          # ASP.NET Backend
│   ├── Hubs/
│   │   └── ChatHub.cs               # SignalR Hub
│   ├── Models/
│   │   ├── ChatMessage.cs           # Message model
│   │   ├── MessageType.cs           # Message type enum
│   │   └── UserConnection.cs        # User connection model
│   ├── Factories/
│   │   └── ChatMessageFactory.cs    # Factory Pattern
│   ├── Repositories/
│   │   ├── IUserConnectionRepository.cs          # Repository interface
│   │   └── InMemoryUserConnectionRepository.cs   # Repository implementation
│   ├── DataService/
│   │   └── SharedDb.cs              # Shared database service
│   └── Program.cs                   # App entry point & DI configuration
│
├── formulaone-chatapp/              # React Frontend
│   └── src/
│       ├── components/
│       │   ├── ChatApp.js           # Main app component
│       │   ├── ChatRoom.js          # Chat room layout
│       │   ├── Login.js             # Login form
│       │   ├── MessageList.js       # Message display
│       │   ├── MessageInput.js      # Message input with emojis
│       │   └── UserList.js          # Online users sidebar
│       ├── factories/
│       │   └── MessageFactory.js    # Factory Pattern
│       ├── services/
│       │   └── signalRService.js    # SignalR connection service
│       └── states/
│           └── ConnectionStates.js  # State Pattern
│
└── Real Time Chat App.sln           # Solution file
```

---

## 🎨 Design Patterns

This project implements **5 design patterns** across the backend and frontend:

### 1. Factory Pattern (Creational)

The Factory Pattern centralizes message creation logic, ensuring all chat messages are created with proper validation, timestamps, and correct types.

**Backend** — `ChatMessageFactory.cs`:

```csharp
// Creates different types of messages with validation
var message = ChatMessageFactory.CreateUserJoinedNotification(username, chatRoom);
var chatMessage = ChatMessageFactory.CreateUserMessage(username, content, chatRoom);
var notification = ChatMessageFactory.CreateUserLeftNotification(username, chatRoom);
```

**Frontend** — `MessageFactory.js`:

```javascript
// Mirrors backend factory - creates message objects from SignalR responses
const chatMessage = MessageFactory.createFromSignalR(user, message, chatRoom);
const userMsg = MessageFactory.createUserMessage(username, content, chatRoom);
```

**What it does:** Instead of creating message objects manually with `new ChatMessage(...)` everywhere, the factory handles all the details — validation, trimming, setting message type, adding timestamps and metadata. This keeps the code consistent and avoids duplication.

---

### 2. Repository Pattern (Structural)

The Repository Pattern abstracts data access behind an interface, decoupling the business logic from the data storage implementation.

**Interface** — `IUserConnectionRepository.cs`:

```csharp
public interface IUserConnectionRepository
{
    bool AddConnection(string connectionId, UserConnection userConnection);
    bool RemoveConnection(string connectionId, out UserConnection? removedConnection);
    bool TryGetConnection(string connectionId, out UserConnection? userConnection);
    IEnumerable<UserConnection> GetConnectionsByRoom(string chatRoom);
    int GetRoomUserCount(string chatRoom);
}
```

**Implementation** — `InMemoryUserConnectionRepository.cs`:

```csharp
// Uses ConcurrentDictionary for thread-safe in-memory storage
public class InMemoryUserConnectionRepository : IUserConnectionRepository
{
    private readonly ConcurrentDictionary<string, UserConnection> _connections;
    
    public bool AddConnection(string connectionId, UserConnection userConnection)
    {
        return _connections.TryAdd(connectionId, userConnection);
    }
}
```

**What it does:** The `ChatHub` depends on the `IUserConnectionRepository` interface, not the concrete implementation. This means we can swap `InMemoryUserConnectionRepository` with a database-backed implementation (e.g., Redis, SQL Server) without changing any code in the Hub.

---

### 3. Singleton Pattern (Creational)

The Singleton Pattern ensures only one instance of a class exists throughout the application lifetime.

**Backend** — `Program.cs`:

```csharp
// Registered as singleton in DI container - one instance for all requests
builder.Services.AddSingleton<IUserConnectionRepository, InMemoryUserConnectionRepository>();
builder.Services.AddSingleton<SharedDb>();
```

**Frontend** — `signalRService.js`:

```javascript
// Module-level singleton - one shared instance across all React components
const signalRService = new SignalRService();
export default signalRService;
```

**What it does:** On the backend, the repository is a singleton so all SignalR connections share the same user connection dictionary. On the frontend, the SignalR service is a singleton so all React components use the same WebSocket connection — preventing multiple connections to the server.

---

### 4. State Pattern (Behavioral)

The State Pattern allows the SignalR connection to change its behavior based on its current state. Each state is a separate class that handles actions differently.

**States** — `ConnectionStates.js`:

```
┌──────────────┐     connect()     ┌──────────────┐     success     ┌──────────────┐
│ Disconnected │ ───────────────► │  Connecting  │ ──────────────► │  Connected   │
└──────────────┘                   └──────────────┘                 └──────────────┘
       ▲                                  │                              │    │
       │                              failure                     disconnect  │
       │                                  ▼                              │    │
       │                          ┌──────────────┐                       │    │
       └────── disconnect() ───── │    Error     │ ◄─── max attempts ────┘    │
                                  └──────────────┘                            │
                                         ▲                                    │
                                         │                           connection lost
                                    max attempts                              │
                                         │                                    ▼
                                  ┌──────────────┐                   ┌──────────────┐
                                  │ Reconnecting │ ◄──────────────── │ Reconnecting │
                                  └──────────────┘                   └──────────────┘
```

| State | Can Send Messages? | Status |
|-------|-------------------|--------|
| `DisconnectedState` | ❌ No | "Disconnected" |
| `ConnectingState` | ❌ No | "Connecting..." |
| `ConnectedState` | ✅ Yes | "Connected" |
| `ReconnectingState` | ❌ No | "Reconnecting (n/5)..." |
| `ErrorState` | ❌ No | "Error: {message}" |

```javascript
// signalRService.js delegates all actions to current state
async sendMessage(message) {
    return await this.state.sendMessage(message); // State decides what happens
}

async disconnect() {
    return await this.state.disconnect(); // State decides what happens
}
```

**What it does:** Instead of using `if/else` chains to check connection status everywhere, each state class knows how to handle `connect()`, `sendMessage()`, and `disconnect()` on its own. For example, calling `sendMessage()` while in `DisconnectedState` throws an error, while in `ConnectedState` it sends the message normally. The `ReconnectingState` even implements exponential backoff with max 5 retry attempts.

---

### 5. Observer Pattern (Behavioral)

The Observer Pattern defines a one-to-many relationship where one object (subject) notifies multiple observers when its state changes.

**Backend (SignalR Hub)** — `ChatHub.cs`:

```csharp
// Hub broadcasts events to all clients in a group (observers)
await Clients.Group(roomname).SendAsync("ReceiveMessage", message.Username, message.Content);
await Clients.Group(userConnection.ChatRoom).SendAsync("ReceiveSpecificMessage", ...);
```

**Frontend (Callback System)** — `signalRService.js`:

```javascript
// Service acts as subject with observer callbacks
this.onMessageReceived = null;   // Observer: new message arrived
this.onConnectionClosed = null;  // Observer: connection closed
this.onStateChanged = null;      // Observer: state changed
```

**Components subscribe as observers** — `ChatRoom.js`:

```javascript
// ChatRoom subscribes to message events
signalRService.setOnMessageReceived((chatMessage) => {
    setMessages(prev => [...prev, { ...chatMessage }]);
});

// ChatRoom subscribes to state change events
signalRService.setOnStateChanged((newState, statusMessage) => {
    setIsConnected(signalRService.canSendMessages());
});
```

**What it does:** SignalR itself is an Observer Pattern — the Hub broadcasts messages and all connected clients in a group receive them automatically. On the frontend, the `signalRService` notifies React components about new messages, connection state changes, and disconnections through callbacks. Components register themselves as observers and react to events without the service knowing anything about them.

---

## ⚡ Installation & Setup

### Prerequisites

- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0) (or your version)
- [Node.js](https://nodejs.org/) (v16 or higher)
- npm (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Real-Time-Chat-App-using-SignalR.git
cd Real-Time-Chat-App-using-SignalR
```

### 2. Setup Backend (ASP.NET Core)

```bash
cd FormulaOne.ChatService
dotnet restore
dotnet run
```

The backend will start on `http://localhost:5205`

### 3. Setup Frontend (React)

Open a new terminal:

```bash
cd formulaone-chatapp
npm install
npm start
```

The frontend will start on `http://localhost:3000`

### 4. Use the App

1. Open your browser and go to `http://localhost:3000`
2. Enter your username and select a chat room
3. Click **Join Chat**
4. Start chatting in real-time!

> **Note:** Make sure the backend is running before starting the frontend. The React app connects to the SignalR hub at `http://localhost:5205/chathub`.
