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


// ========================================
// CHECK LOGIN STATUS
// ========================================

const token =
    localStorage.getItem("token");


if (token) {

    logoutButton.textContent =
        "Logout";

} else {

    logoutButton.textContent =
        "Login";
}


// ========================================
// LOGIN / LOGOUT BUTTON
// ========================================

logoutButton.addEventListener(
    "click",
    function () {

        const token =
            localStorage.getItem("token");


        if (token) {

            // Logout

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "userId"
            );


            window.location.href =
                "../login/login.html";

        } else {

            // Go to login page

            window.location.href =
                "../login/login.html";

        }

    }
);


// ========================================
// LOAD USER PROFILE
// ========================================

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


// ========================================
// GET OLD MESSAGES FROM DATABASE
// ========================================

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


// Get JWT token

const socketToken =
    localStorage.getItem("token");


// Create Socket.IO connection

const socket =
    io("http://localhost:3000", {

        auth: {

            token: socketToken

        }

    });


// ========================================
// SOCKET CONNECTED
// ========================================

socket.on(
    "connect",
    function () {

        console.log(
            "Socket.IO connected"
        );

        console.log(
            "Socket ID:",
            socket.id
        );

    }
);


// ========================================
// SOCKET AUTHENTICATION ERROR
// ========================================

socket.on(
    "connect_error",
    function (error) {

        console.log(
            "Socket authentication failed:",
            error.message
        );

    }
);


// ========================================
// RECEIVE NEW MESSAGE
// ========================================

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


// ========================================
// SOCKET DISCONNECTED
// ========================================

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


// ========================================
// SEND MESSAGE FUNCTION
// ========================================

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


    // Check Socket.IO connection

    if (!socket.connected) {

        alert(
            "Socket is not connected"
        );

        return;
    }


    // Send only message

    // We DO NOT send userId here.
    // Backend will identify the user
    // using the JWT token.

    socket.emit(
        "sendMessage",
        {
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


    // ========================================
    // MESSAGE TEXT
    // ========================================

    const messageTextElement =
        document.createElement("p");


    messageTextElement.textContent =
        messageText;


    // ========================================
    // MESSAGE TIME
    // ========================================

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


    // ========================================
    // ADD TEXT TO MESSAGE
    // ========================================

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