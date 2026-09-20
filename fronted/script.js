// ========================================
// GET HTML ELEMENTS
// ========================================

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
                "/fronted/login/login.html";

        } else {

            // Go to login page

            window.location.href =
                "/fronted/login/login.html";

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


        // Show first letter of name

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
// GET OLD MESSAGES
// ========================================

async function loadMessages() {

    const token =
        localStorage.getItem("token");


    // No login

    if (!token) {

        return;

    }


    // Get messages from backend

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

        // Clear existing messages

        chatMessages.innerHTML = "";


        // Display old messages

        data.data.forEach(
            function (message) {

                addMessage(

                    message.message,

                    message.userId,

                    message.userName,

                    message.createdAt

                );

            }
        );

    }

}


// ========================================
// SOCKET.IO CONNECTION
// ========================================


// Get JWT token

const socketToken =
    localStorage.getItem("token");


// Create Socket.IO connection

const socket =
    io(
        "http://localhost:3000",
        {

            auth: {

                token:
                    socketToken

            }

        }
    );


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

            message.userName,

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
            "/fronted/login/login.html";

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

    // DO NOT send userId.
    // Backend identifies the user
    // using the JWT token.

    socket.emit(
        "sendMessage",
        {

            message:
                messageText

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

    messageUserName,

    messageTime

) {

    // Create message container

    const message =
        document.createElement("div");


    message.classList.add(
        "message"
    );


    // Get current logged-in user

    const currentUserId =
        localStorage.getItem("userId");


    // ========================================
    // CHECK WHO SENT THE MESSAGE
    // ========================================

    if (
        Number(messageUserId) ===
        Number(currentUserId)
    ) {

        // ========================================
        // MY MESSAGE
        // ========================================

        message.classList.add(
            "sent"
        );

    } else {

        // ========================================
        // OTHER USER'S MESSAGE
        // ========================================

        message.classList.add(
            "received"
        );


        // ========================================
        // SENDER NAME
        // ========================================

        const senderElement =
            document.createElement(
                "strong"
            );


        // Show sender name

        senderElement.textContent =
            messageUserName;


        // Give each user a fixed color

        senderElement.style.color =
            getUserColor(messageUserId);


        // Add sender name

        message.appendChild(
            senderElement
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
    // ADD MESSAGE TEXT
    // ========================================

    message.appendChild(
        messageTextElement
    );


    // ========================================
    // ADD MESSAGE TIME
    // ========================================

    message.appendChild(
        timeElement
    );


    // ========================================
    // ADD MESSAGE TO CHAT
    // ========================================

    chatMessages.appendChild(
        message
    );


    // ========================================
    // SCROLL TO BOTTOM
    // ========================================

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ========================================
// GET USER COLOR
// ========================================

function getUserColor(userId) {

    const colors = [

        "#e74c3c",

        "#3498db",

        "#2ecc71",

        "#9b59b6",

        "#f39c12",

        "#1abc9c",

        "#e67e22",

        "#e84393",

        "#16a085",

        "#8e44ad"

    ];


    // Convert user ID into number

    const index =
        Number(userId) %
        colors.length;


    // Return user's color

    return colors[index];

}


// ========================================
// START CHAT
// ========================================

async function startChat() {

    // Load logged-in user

    await loadUserProfile();


    // Load old messages

    await loadMessages();

}


// ========================================
// START APPLICATION
// ========================================

startChat();