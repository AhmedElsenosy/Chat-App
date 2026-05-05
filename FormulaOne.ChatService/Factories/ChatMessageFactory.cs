namespace FormulaOne.ChatService.Models
{
    /// <summary>
    /// Factory Pattern implementation for creating chat messages
    /// Centralizes message creation logic and ensures consistency
    /// </summary>
    public class ChatMessageFactory
    {
        /// <summary>
        /// Create a user message
        /// </summary>
        public static ChatMessage CreateUserMessage(string username, string content, string chatRoom)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentNullException(nameof(username));

            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentNullException(nameof(content));

            if (string.IsNullOrWhiteSpace(chatRoom))
                throw new ArgumentNullException(nameof(chatRoom));

            return new ChatMessage
            {
                Username = username.Trim(),
                Content = content.Trim(),
                ChatRoom = chatRoom.Trim(),
                MessageType = MessageType.UserMessage,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Create a system notification message (e.g., user joined/left)
        /// </summary>
        public static ChatMessage CreateSystemNotification(string content, string chatRoom, string? username = null)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentNullException(nameof(content));

            if (string.IsNullOrWhiteSpace(chatRoom))
                throw new ArgumentNullException(nameof(chatRoom));

            return new ChatMessage
            {
                Username = username ?? "system",
                Content = content.Trim(),
                ChatRoom = chatRoom.Trim(),
                MessageType = MessageType.SystemNotification,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Create an admin message
        /// </summary>
        public static ChatMessage CreateAdminMessage(string content, string chatRoom)
        {
            if (string.IsNullOrWhiteSpace(content))
                throw new ArgumentNullException(nameof(content));

            if (string.IsNullOrWhiteSpace(chatRoom))
                throw new ArgumentNullException(nameof(chatRoom));

            return new ChatMessage
            {
                Username = "admin",
                Content = content.Trim(),
                ChatRoom = chatRoom.Trim(),
                MessageType = MessageType.AdminMessage,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Create a user joined notification
        /// </summary>
        public static ChatMessage CreateUserJoinedNotification(string username, string chatRoom)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentNullException(nameof(username));

            if (string.IsNullOrWhiteSpace(chatRoom))
                throw new ArgumentNullException(nameof(chatRoom));

            return new ChatMessage
            {
                Username = "admin",
                Content = $"{username} has joined the chat",
                ChatRoom = chatRoom.Trim(),
                MessageType = MessageType.SystemNotification,
                Timestamp = DateTime.UtcNow,
                Metadata = new Dictionary<string, object>
                {
                    { "action", "user_joined" },
                    { "targetUser", username }
                }
            };
        }

        /// <summary>
        /// Create a user left notification
        /// </summary>
        public static ChatMessage CreateUserLeftNotification(string username, string chatRoom)
        {
            if (string.IsNullOrWhiteSpace(username))
                throw new ArgumentNullException(nameof(username));

            if (string.IsNullOrWhiteSpace(chatRoom))
                throw new ArgumentNullException(nameof(chatRoom));

            return new ChatMessage
            {
                Username = "admin",
                Content = $"{username} has left the chat",
                ChatRoom = chatRoom.Trim(),
                MessageType = MessageType.SystemNotification,
                Timestamp = DateTime.UtcNow,
                Metadata = new Dictionary<string, object>
                {
                    { "action", "user_left" },
                    { "targetUser", username }
                }
            };
        }

        /// <summary>
        /// Create an error message
        /// </summary>
        public static ChatMessage CreateErrorMessage(string errorContent, string chatRoom, string? username = null)
        {
            return new ChatMessage
            {
                Username = username ?? "system",
                Content = errorContent,
                ChatRoom = chatRoom,
                MessageType = MessageType.ErrorMessage,
                Timestamp = DateTime.UtcNow
            };
        }

        /// <summary>
        /// Create an info message
        /// </summary>
        public static ChatMessage CreateInfoMessage(string content, string chatRoom)
        {
            return new ChatMessage
            {
                Username = "system",
                Content = content,
                ChatRoom = chatRoom,
                MessageType = MessageType.InfoMessage,
                Timestamp = DateTime.UtcNow
            };
        }
    }
}
