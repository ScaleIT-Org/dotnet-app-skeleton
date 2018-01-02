using System.IO;
using System.Net.WebSockets;
using System.Text;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Xml;
using WebSocketManager;

namespace DataCommunication
{
    public class DataCommunicationHandler : WebSocketHandler
    {
        private string dataPath = "";
        public DataCommunicationHandler(WebSocketConnectionManager webSocketConnectionManager) : base(webSocketConnectionManager)
        {
            //CONSTRUCTOR
        }

        public override async Task OnConnected(WebSocket socket)
        {
            //CLIENT CONNECTED
            await base.OnConnected(socket);
            var socketId = WebSocketConnectionManager.GetId(socket);

            Console.WriteLine($"Client connected: {socketId}");
            await SendMessageToAllAsync("Client connected ");
        }

        public override async Task ReceiveAsync(WebSocket socket, WebSocketReceiveResult result, byte[] buffer)
        {
            var socketId = WebSocketConnectionManager.GetId(socket);
            var message = $"{socketId} said: {Encoding.UTF8.GetString(buffer, 0, result.Count)}";


            await SendMessageToAllAsync(message);
        }
    }
}