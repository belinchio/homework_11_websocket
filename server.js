const WebSocket = require("ws");

const wsServer = new WebSocket.Server({port: 8080});

wsServer.on("connection", (socket) => {
    console.log("Установленно новое соединение!");
    socket.on("message", (message) => {
        console.log(`Получено новое сообщение: ${message}`);
        socket.send(`Эхо: ${message}`);
    });
    socket.on("close", () => {
        console.log("Соединение закрыто!");
    });
});

console.log("WebSocket-сервер запущен на порту 8080");
