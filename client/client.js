let socket;
let username;
const PORT = 3000;

const usersContainer = document.getElementById("usersContainer");
const usernameContainer = document.getElementById("usernameContainer");
const chatWindow = document.getElementById("chatWindow");
const usernameInput = document.getElementById("usernameInput");
const usernameButton = document.getElementById("usernameButton");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messagesDiv = document.getElementById("messages")

// Функция подключения к серверу
const contentWebSocket = () => {
    socket = new WebSocket(`ws://localhost:${PORT}`);
    console.log("Клиент подключился");

    socket.onmessage = (message) => {
        const data = JSON.parse(message.data);

        if (data.type === "userList") {
            updateUsersList(data.users);
        } else if (data.type === "messageHistory") {
            //Отображаем историю сообщений
            data.message.forEach((message) => {
                displayMessage(message);
            });
        } else {
            displayMessage(data);
        }
    };

    socket.onclose = () => {
        console.log("Соединение закрыто");
        setTimeout(contentWebSocket, 1000);
    };

    socket.onerror = (error) => {
        displayMessage("Ошибка подключения");
        console.error("Ошибка WebSocket:", error);
    };
}

// Функция для вывода сообщения
const displayMessage = (data) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${data.type}`;

    if (data.type === "system") {
        messageDiv.textContent = data.content;
    } else {
        const usernameSpan = document.createElement("span");
        usernameSpan.className = "username";
        usernameSpan.textContent = data.username + ": ";

        const contentSpan = document.createElement("span");
        contentSpan.textContent = data.content;

        messageDiv.appendChild(usernameSpan);
        messageDiv.appendChild(contentSpan);
    }

    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messageDiv.scrollHeight;
}
const setUserName = () => {
    username = usernameInput.value.trim();
    if (username) {
        contentWebSocket();
        usernameContainer.classList.add("hidden");
        chatWindow.classList.remove("hidden");

        socket.onopen = () => {
            socket.send(
                JSON.stringify({
                    type: "setUsername",
                    username: username
                })
            );
        };
    }
}
usernameInput.addEventListener("keypress", (event) => {
    if(event.key === "Enter") {
        setUserName();
    }
})
usernameButton.addEventListener("click", () => {
    setUserName();
});

const sendMessage = () => {
    const content = messageInput.value.trim();
    if (content && socket.readyState === WebSocket.OPEN) {
        socket.send(
            JSON.stringify({
                type: "message",
                content: content
            })
        );
        messageInput.value = "";
    }
}
sendButton.addEventListener("click", sendMessage);
messageInput    .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// Функция для обновления списка пользователей
const updateUsersList = (users) => {
    usersContainer.innerHTML = "";
    users.forEach((user) => {
        const userDiv = document.createElement("div");
        userDiv.className = "user-item";
        userDiv.textContent = user;
        usersContainer.appendChild(userDiv);
    });
}

