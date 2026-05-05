using FormulaOne.ChatService.Models;

namespace FormulaOne.ChatService.Repositories
{
    /// <summary>
    /// Repository interface for managing user connections
    /// Implements Repository Pattern to abstract data access logic
    /// </summary>
    public interface IUserConnectionRepository
    {
        /// <summary>
        /// Add a new user connection
        /// </summary>
        bool AddConnection(string connectionId, UserConnection userConnection);

        /// <summary>
        /// Remove a user connection
        /// </summary>
        bool RemoveConnection(string connectionId, out UserConnection? removedConnection);

        /// <summary>
        /// Get a user connection by connection ID
        /// </summary>
        bool TryGetConnection(string connectionId, out UserConnection? userConnection);

        /// <summary>
        /// Get all connections in a specific chat room
        /// </summary>
        IEnumerable<UserConnection> GetConnectionsByRoom(string chatRoom);

        /// <summary>
        /// Get all active connections
        /// </summary>
        IEnumerable<UserConnection> GetAllConnections();

        /// <summary>
        /// Get count of users in a specific room
        /// </summary>
        int GetRoomUserCount(string chatRoom);

        /// <summary>
        /// Check if a user exists in the system
        /// </summary>
        bool ConnectionExists(string connectionId);

        /// <summary>
        /// Clear all connections (for testing/admin purposes)
        /// </summary>
        void ClearAllConnections();
    }
}
