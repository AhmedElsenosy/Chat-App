using FormulaOne.ChatService.Models;
using System.Collections.Concurrent;

namespace FormulaOne.ChatService.Repositories
{
    /// <summary>
    /// In-memory implementation of IUserConnectionRepository using ConcurrentDictionary
    /// Thread-safe for concurrent access from multiple SignalR connections
    /// </summary>
    public class InMemoryUserConnectionRepository : IUserConnectionRepository
    {
        private readonly ConcurrentDictionary<string, UserConnection> _connections;

        public InMemoryUserConnectionRepository()
        {
            _connections = new ConcurrentDictionary<string, UserConnection>();
        }

        public bool AddConnection(string connectionId, UserConnection userConnection)
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                throw new ArgumentNullException(nameof(connectionId));

            if (userConnection == null)
                throw new ArgumentNullException(nameof(userConnection));

            return _connections.TryAdd(connectionId, userConnection);
        }

        public bool RemoveConnection(string connectionId, out UserConnection? removedConnection)
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                throw new ArgumentNullException(nameof(connectionId));

            return _connections.TryRemove(connectionId, out removedConnection);
        }

        public bool TryGetConnection(string connectionId, out UserConnection? userConnection)
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                throw new ArgumentNullException(nameof(connectionId));

            return _connections.TryGetValue(connectionId, out userConnection);
        }

        public IEnumerable<UserConnection> GetConnectionsByRoom(string chatRoom)
        {
            if (string.IsNullOrWhiteSpace(chatRoom))
                return Enumerable.Empty<UserConnection>();

            return _connections.Values
                .Where(c => c.ChatRoom.Equals(chatRoom, StringComparison.OrdinalIgnoreCase))
                .ToList();
        }

        public IEnumerable<UserConnection> GetAllConnections()
        {
            return _connections.Values.ToList();
        }

        public int GetRoomUserCount(string chatRoom)
        {
            if (string.IsNullOrWhiteSpace(chatRoom))
                return 0;

            return _connections.Values
                .Count(c => c.ChatRoom.Equals(chatRoom, StringComparison.OrdinalIgnoreCase));
        }

        public bool ConnectionExists(string connectionId)
        {
            if (string.IsNullOrWhiteSpace(connectionId))
                return false;

            return _connections.ContainsKey(connectionId);
        }

        public void ClearAllConnections()
        {
            _connections.Clear();
        }
    }
}
