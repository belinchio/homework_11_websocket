const socket = new WebSocket("ws://localhost:8080");

socket.onopen = () => {
    console.log("Соединение установленно!");
};

socket.onmessage = (event) => {
    const messageDiv = document.getElementById("message");
    const newMessage = document.createElement("div");
    newMessage.textContent = event.data;
    messageDiv.appendChild(newMessage);
};

socket.onclose = () => {
    console.log("Соединение закрыто!");
};

const sendButton = document.getElementById("sendButton");
sendButton.addEventListener("click", () => {
    const messageInput = document.getElementById("messageInput");
    const message = messageInput.value;
    socket.send(message);
    messageInput.value = "";
});
