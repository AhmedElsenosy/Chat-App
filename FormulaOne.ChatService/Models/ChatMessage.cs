namespace FormulaOne.ChatService.Models
{
    /// <summary>
    /// Represents a chat message in the system
    /// </summary>
    public class ChatMessage
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public string Username { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public string ChatRoom { get; set; } = string.Empty;
        public MessageType MessageType { get; set; } = MessageType.UserMessage;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
        public bool IsSystemMessage => MessageType == MessageType.SystemNotification || MessageType == MessageType.AdminMessage;

        // Additional metadata
        public Dictionary<string, object> Metadata { get; set; } = new Dictionary<string, object>();

        public ChatMessage()
        {
        }

        public ChatMessage(string username, string content, string chatRoom, MessageType messageType = MessageType.UserMessage)
        {
            Username = username;
            Content = content;
            ChatRoom = chatRoom;
            MessageType = messageType;
        }
    }
}
