using FormulaOne.ChatService.DataService;
using FormulaOne.ChatService.Models;
using FormulaOne.ChatService.Repositories;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.ObjectPool;


namespace FormulaOne.ChatService.Hubs
{

    public class ChatHub : Hub
    {
        // Using Repository Pattern for data access abstraction
        private readonly IUserConnectionRepository _userConnectionRepository;

        public ChatHub(IUserConnectionRepository userConnectionRepository)
        {
            _userConnectionRepository = userConnectionRepository;
        }

        public async Task JoinChat(UserConnection userConnection)
        {
            // Using Factory Pattern to create system notification
            var message = ChatMessageFactory.CreateUserJoinedNotification(
                userConnection.Username,
                userConnection.ChatRoom
            );

            await Clients.All.SendAsync("ReceiveMessage", message.Username, message.Content);
        }

        public async Task JoinSpecificChatRoom(UserConnection userConnection)
        {
            var userid = Context.ConnectionId;
            var roomname = userConnection.ChatRoom;

            await Groups.AddToGroupAsync(userid, roomname);

            // Using Repository to add connection
            _userConnectionRepository.AddConnection(userid, userConnection);

            // Using Factory Pattern to create notification
            var message = ChatMessageFactory.CreateUserJoinedNotification(
                userConnection.Username,
                roomname
            );

            await Clients.Group(roomname).SendAsync("ReceiveMessage", message.Username, message.Content);

            // Send updated user list to all clients in the room
            await SendUserListToRoom(roomname);
        }

        public async Task LeaveSpecificChatRoom(UserConnection userConnection)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, userConnection.ChatRoom);

            // Using Repository to remove connection
            if (_userConnectionRepository.RemoveConnection(Context.ConnectionId, out UserConnection? removedConnection))
            {
                // Send a message to all users in the chat room that the user has left
                Console.WriteLine($"{removedConnection.Username} left the chat");

                // Using Factory Pattern to create leave notification
                var message = ChatMessageFactory.CreateUserLeftNotification(
                    removedConnection.Username,
                    userConnection.ChatRoom
                );

                await Clients.Group(userConnection.ChatRoom)
                    .SendAsync("ReceiveMessage", message.Username, message.Content);

                // Send updated user list to all clients in the room
                await SendUserListToRoom(userConnection.ChatRoom);
            }
        }

        public async Task SendMessage(string message)
        {
            // Using Repository to get connection
            if (_userConnectionRepository.TryGetConnection(Context.ConnectionId, out UserConnection? userConnection))
            {
                // Using Factory Pattern to create user message
                var chatMessage = ChatMessageFactory.CreateUserMessage(
                    userConnection.Username,
                    message,
                    userConnection.ChatRoom
                );

                await Clients.Group(userConnection.ChatRoom)
                    .SendAsync("ReceiveSpecificMessage", chatMessage.Username, chatMessage.Content);
            }
        }

        /// <summary>
        /// Helper method to send the current user list to all clients in a room
        /// </summary>
        private async Task SendUserListToRoom(string roomName)
        {
            var usersInRoom = _userConnectionRepository.GetConnectionsByRoom(roomName)
                .Select(c => c.Username)
                .Distinct()
                .ToList();

            await Clients.Group(roomName).SendAsync("ReceiveUserList", usersInRoom);
        }
    }

}