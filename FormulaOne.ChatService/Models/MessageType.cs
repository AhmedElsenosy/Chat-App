namespace FormulaOne.ChatService.Models
{
    /// <summary>
    /// Enum for different types of messages in the chat system
    /// </summary>
    public enum MessageType
    {
        /// <summary>
        /// Regular user message
        /// </summary>
        UserMessage,

        /// <summary>
        /// System notification (join, leave, etc.)
        /// </summary>
        SystemNotification,

        /// <summary>
        /// Admin message
        /// </summary>
        AdminMessage,

        /// <summary>
        /// Error message
        /// </summary>
        ErrorMessage,

        /// <summary>
        /// Info message
        /// </summary>
        InfoMessage
    }
}
