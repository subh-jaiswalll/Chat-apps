const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const chatMessages =
    document.getElementById("chatMessages");

const userName =
    document.getElementById("userName");

const profileImage =
    document.getElementById("profileImage");

const logoutButton =
    document.getElementById("logoutButton");


// Check login status

const token =
    localStorage.getItem("token");


if (token) {

    logoutButton.textContent = "Logout";

} else {

    logoutButton.textContent = "Login";
}


// Login / Logout button

logoutButton.addEventListener(
    "click",
    function () {

        const token =
            localStorage.getItem("token");


        if (token) {

            localStorage.removeItem("token");

            localStorage.removeItem("userId");

            window.location.href =
                "../login/login.html";

        } else {

            window.location.href =
                "../login/login.html";
        }

    }
);


// Load profile

async function loadUserProfile() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        userName.textContent = "Guest";

        profileImage.textContent = "G";

        logoutButton.textContent = "Login";

        return;
    }


    const response = await fetch(
        "http://localhost:3000/user/profile",
        {
            method: "GET",

            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );


    const data =
        await response.json();


    if (response.ok) {

        userName.textContent =
            data.name;

        profileImage.textContent =
            data.name
                .charAt(0)
                .toUpperCase();

        localStorage.setItem(
            "userId",
            data.id
        );

        logoutButton.textContent =
            "Logout";

    } else {

        localStorage.removeItem("token");

        localStorage.removeItem("userId");

        userName.textContent =
            "Guest";

        profileImage.textContent =
            "G";

        logoutButton.textContent =
            "Login";
    }
}


// Get old messages from database

async function loadMessages() {

    const token =
        localStorage.getItem("token");


    if (!token) {

        return;
    }


    const response = await fetch(
        "http://localhost:3000/message",
        {
            method: "GET",

            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );


    const data =
        await response.json();


    if (response.ok) {

        chatMessages.innerHTML = "";


        data.data.forEach(
            function (message) {

                addMessage(
                    message.message,
                    message.userId,
                    message.createdAt
                );

            }
        );
    }
}


// Create WebSocket connection

const socket =
    new WebSocket(
        "ws://localhost:3000"
    );


// WebSocket connected

socket.addEventListener(
    "open",
    function () {

        console.log(
            "WebSocket connected"
        );

    }
);


// Receive new message

socket.addEventListener(
    "message",
    function (event) {

        const message =
            JSON.parse(event.data);


        addMessage(
            message.message,
            message.userId,
            message.createdAt
        );

    }
);


// WebSocket closed

socket.addEventListener(
    "close",
    function () {

        console.log(
            "WebSocket disconnected"
        );

    }
);


// Send message

sendButton.addEventListener(
    "click",
    sendMessage
);


messageInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


// Send message through WebSocket

function sendMessage() {

    const messageText =
        messageInput.value.trim();


    if (messageText === "") {

        return;
    }


    const token =
        localStorage.getItem("token");


    // Login required

    if (!token) {

        window.location.href =
            "../login/login.html";

        return;
    }


    const userId =
        localStorage.getItem("userId");


    // Send message to server

    socket.send(
        JSON.stringify({
            userId: userId,
            message: messageText
        })
    );


    messageInput.value = "";
}


// Add message to UI

function addMessage(
    messageText,
    messageUserId,
    messageTime
) {

    const message =
        document.createElement("div");


    message.classList.add(
        "message"
    );


    const currentUserId =
        localStorage.getItem("userId");


    if (
        Number(messageUserId) ===
        Number(currentUserId)
    ) {

        message.classList.add(
            "sent"
        );

    } else {

        message.classList.add(
            "received"
        );
    }


    const messageTextElement =
        document.createElement("p");


    messageTextElement.textContent =
        messageText;


    const timeElement =
        document.createElement("span");


    const time =
        new Date(messageTime);


    timeElement.textContent =
        time.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    message.appendChild(
        messageTextElement
    );

    message.appendChild(
        timeElement
    );


    chatMessages.appendChild(
        message
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// Start chat

async function startChat() {

    await loadUserProfile();

    await loadMessages();

}


startChat();