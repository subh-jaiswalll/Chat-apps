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

            // Logout

            localStorage.removeItem("token");

            localStorage.removeItem("userId");


            window.location.href =
                "../login/login.html";

        } else {

            // Go to login page

            window.location.href =
                "../login/login.html";
        }

    }
);


// Load user profile

async function loadUserProfile() {

    const token =
        localStorage.getItem("token");


    // User is not logged in

    if (!token) {

        userName.textContent =
            "Guest";

        profileImage.textContent =
            "G";

        logoutButton.textContent =
            "Login";

        return;
    }


    // Get profile from backend

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

        // Show user name

        userName.textContent =
            data.name;


        // Show first letter

        profileImage.textContent =
            data.name
                .charAt(0)
                .toUpperCase();


        // Save user ID

        localStorage.setItem(
            "userId",
            data.id
        );


        logoutButton.textContent =
            "Logout";

    } else {

        // Token is invalid

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "userId"
        );


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


    // No login

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

        // Clear chat

        chatMessages.innerHTML = "";


        // Display old messages

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


// ========================================
// SOCKET.IO
// ========================================


// Create Socket.IO connection

const socket =
    io("http://localhost:3000");


// Socket connected

socket.on(
    "connect",
    function () {

        console.log(
            "Socket.IO connected"
        );

    }
);


// Receive new message

socket.on(
    "newMessage",
    function (message) {

        console.log(
            "New message:",
            message
        );


        addMessage(
            message.message,
            message.userId,
            message.createdAt
        );

    }
);


// Socket disconnected

socket.on(
    "disconnect",
    function () {

        console.log(
            "Socket.IO disconnected"
        );

    }
);


// ========================================
// SEND MESSAGE
// ========================================


// Send button

sendButton.addEventListener(
    "click",
    sendMessage
);


// Press Enter

messageInput.addEventListener(
    "keypress",
    function (event) {

        if (event.key === "Enter") {

            sendMessage();

        }

    }
);


// Send message

function sendMessage() {

    const messageText =
        messageInput.value.trim();


    // Empty message

    if (messageText === "") {

        return;
    }


    // Check login

    const token =
        localStorage.getItem("token");


    if (!token) {

        window.location.href =
            "../login/login.html";

        return;
    }


    // Get current user ID

    const userId =
        localStorage.getItem("userId");


    // Send message to server

    socket.emit(
        "sendMessage",
        {
            userId: userId,
            message: messageText
        }
    );


    // Clear input

    messageInput.value = "";
}


// ========================================
// DISPLAY MESSAGE
// ========================================


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


    // Current logged-in user

    const currentUserId =
        localStorage.getItem("userId");


    // Check sender

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


    // Message text

    const messageTextElement =
        document.createElement("p");


    messageTextElement.textContent =
        messageText;


    // Message time

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


    // Add text

    message.appendChild(
        messageTextElement
    );


    // Add time

    message.appendChild(
        timeElement
    );


    // Add message to chat

    chatMessages.appendChild(
        message
    );


    // Scroll to bottom

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// ========================================
// START CHAT
// ========================================


async function startChat() {

    // Load user

    await loadUserProfile();


    // Load old messages

    await loadMessages();

}


// Start chat

startChat();