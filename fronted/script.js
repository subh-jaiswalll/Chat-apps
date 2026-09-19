const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const chatMessages = document.getElementById("chatMessages");

const userName = document.getElementById("userName");
const profileImage = document.getElementById("profileImage");
const logoutButton = document.getElementById("logoutButton");


// Check login status

const token = localStorage.getItem("token");


// Change button according to login status

if (token) {

    logoutButton.textContent = "Logout";

} else {

    logoutButton.textContent = "Login";
}


// Button click

logoutButton.addEventListener("click", function () {

    const token = localStorage.getItem("token");


    if (token) {

        // User is logged in
        // So logout

        localStorage.removeItem("token");

        window.location.href = "/fronted/login/login.html";

    } else {

        // User is not logged in
        // So go to login

        window.location.href = "/fronted/login/login.html";
    }

});


// Send message when button is clicked

sendButton.addEventListener("click", sendMessage);


// Send message when Enter is pressed

messageInput.addEventListener("keypress", function (event) {

    if (event.key === "Enter") {
        sendMessage();
    }

});


// Load user profile

async function loadUserProfile() {

    const token = localStorage.getItem("token");


    // No token

    if (!token) {

        userName.textContent = "Guest";

        profileImage.textContent = "G";

        return;
    }


    // Token exists

    const response = await fetch(
        "http://localhost:3000/user/profile",
        {
            method: "GET",

            headers: {
                "Authorization": `Bearer ${token}`
            }
        }
    );


    const data = await response.json();


    if (response.ok) {

        userName.textContent = data.name;

        profileImage.textContent =
            data.name.charAt(0).toUpperCase();


        // User is logged in

        logoutButton.textContent = "Logout";

    } else {

        // Invalid or expired token

        localStorage.removeItem("token");

        userName.textContent = "Guest";

        profileImage.textContent = "G";

        logoutButton.textContent = "Login";
    }
}


// Send message

async function sendMessage() {

    const messageText = messageInput.value.trim();


    if (messageText === "") {
        return;
    }


    const token = localStorage.getItem("token");


    // Login required for sending message

    if (!token) {

        window.location.href = "/fronted/login/login.html";

        return;
    }


    const response = await fetch(
        "http://localhost:3000/message/send",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json",

                "Authorization": `Bearer ${token}`
            },

            body: JSON.stringify({
                message: messageText
            })
        }
    );


    const data = await response.json();


    if (response.ok) {

        addMessage(messageText);

        messageInput.value = "";

    } else {

        alert(data.message);
    }
}


// Add message to chat

function addMessage(messageText) {

    const message = document.createElement("div");

    message.classList.add(
        "message",
        "sent"
    );


    const messageTextElement =
        document.createElement("p");

    messageTextElement.textContent =
        messageText;


    const timeElement =
        document.createElement("span");


    const currentTime = new Date();


    timeElement.textContent =
        currentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });


    message.appendChild(messageTextElement);

    message.appendChild(timeElement);


    chatMessages.appendChild(message);


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// Load profile when page opens

loadUserProfile();