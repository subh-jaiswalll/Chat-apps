const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");


sendButton.addEventListener("click", sendMessage);


messageInput.addEventListener("keypress", function(event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});


function sendMessage() {

    const messageText = messageInput.value.trim();

    if (messageText === "") {
        return;
    }


    const message = document.createElement("div");

    message.classList.add("message", "sent");


    const currentTime = new Date();

    const time = currentTime.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });


    message.innerHTML = `
        <p>${messageText}</p>
        <span>${time}</span>
    `;


    chatMessages.appendChild(message);


    messageInput.value = "";


    chatMessages.scrollTop = chatMessages.scrollHeight;

}