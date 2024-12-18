const WebSocket = require("ws");
const shortid = require("shortid");
const clients = new Map(); // Создаём Map для хранения активных подключений
const messageHistory = []; // Создаём массив для хранения истории сообщений
const MAX_HISTORY = 100; // Максимальное количество сообщений в истории
const PORT = 3000; // Переменная для хранения номера порта для подключения
const server = new WebSocket.Server({port: PORT}); // Создаем сервер на порту = PORT

// Обрабатываем новое подключение
server.on("connection", (socket) => {
    const clientId = shortid();
    console.log(`Новое подключение к серверу c ID: ${clientId}`);

    // Отправляем список активных пользователей новому клиенту
    const activeUsers = Array.from(clients.values());
    socket.send(JSON.stringify({
        type: "userList",
        users: activeUsers
    }));

    // Отправляем историю сообщений
    socket.send(JSON.stringify({
        type: "messageHistory",
        message: messageHistory
    }));

    // Оповещаем участников чата о новом подключение
    socket.on("message", (message) => {
        try {
            const data = JSON.parse(message);
            if (data.type === "setUsername") {
                clients.set(socket, data.username);

                // Оповещаем всех о новом пользователе
                const systemMessage = {
                    type: "system",
                    content: `${data.username} присоединился к чату`
                };
                broadcastMessage(systemMessage);
                broadcastUserList(); // Обновляем список пользователей всех клиентов
                addToHistory(systemMessage) // Добовляем системное сообщение в историю
            } else if (data.type === "message") {
                const messageData = {
                    type: "message",
                    username: clients.get(socket),
                    content: data.content
                }
                broadcastMessage(messageData);
                addToHistory(messageData);
            }
        } catch (error) {
            console.error(`Ошибка обработки сообщения: ${error}`);
        }
    });

    socket.on("close", () => {
        const username = clients.get(socket);
        if (username) {
            const systemMessage = {
                type: "system",
                content: `${username} покинул чат`
            }
            broadcastMessage(systemMessage);
            addToHistory(systemMessage);
        }
        clients.delete(socket);
        broadcastUserList();
        console.log(`Клиент c ID ${clientId} отлючился`);
    })
});

// Определяем функцию для отправки сообщений всем подключенным клиентам
const broadcastMessage = (message) => {
    const messageStr = JSON.stringify(message);
    server.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(messageStr);
        }
    });
}

const broadcastUserList = () => {
    const users = Array.from(clients.values());
    const userListMessage = JSON.stringify({
        type: "userList",
        users: users
    });

    server.clients.forEach((client) => {
        if(client.readyState === WebSocket.OPEN) {
            client.send(userListMessage);
        }
    });
}

const addToHistory = (message) => {
    messageHistory.push(message);
    if (messageHistory.length > MAX_HISTORY) {
        messageHistory.shift(); // Удаляем самое старое сообщение
    }
}

console.log(`Сервер запущен на порту ${PORT}`);

