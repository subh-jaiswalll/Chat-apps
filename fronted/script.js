const messageInput = document.getElementById("messageInput");

const sendButton = document.getElementById("sendButton");

const chatMessages = document.getElementById("chatMessages");

const userName = document.getElementById("userName");

const profileImage = document.getElementById("profileImage");

const logoutButton = document.getElementById("logoutButton");

// Check login status

const token = localStorage.getItem("token");

// Change Login / Logout button

if (token) {
  logoutButton.textContent = "Logout";
} else {
  logoutButton.textContent = "Login";
}

// Login / Logout button

logoutButton.addEventListener("click", function () {
  const token = localStorage.getItem("token");

  if (token) {
    // User is logged in
    // Logout

    localStorage.removeItem("token");

    localStorage.removeItem("userId");

    window.location.href = "/fronted/login/login.html";
  } else {
    // User is not logged in
    // Go to login page

    window.location.href = "/fronted/login/login.html";
  }
});

// Send message button

sendButton.addEventListener("click", sendMessage);

// Send message with Enter

messageInput.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

// Load user profile

async function loadUserProfile() {
  const token = localStorage.getItem("token");

  // User is not logged in

  if (!token) {
    userName.textContent = "Guest";

    profileImage.textContent = "G";

    logoutButton.textContent = "Login";

    return;
  }

  // User is logged in

  const response = await fetch("http://localhost:3000/user/profile", {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    // Show user name

    userName.textContent = data.name;

    // Show first letter

    profileImage.textContent = data.name.charAt(0).toUpperCase();

    // Save user ID

    localStorage.setItem("userId", data.id);

    // Change button

    logoutButton.textContent = "Logout";
  } else {
    // Token is invalid or expired

    localStorage.removeItem("token");

    localStorage.removeItem("userId");

    userName.textContent = "Guest";

    profileImage.textContent = "G";

    logoutButton.textContent = "Login";
  }
}

// Get messages from database

async function loadMessages() {
  const token = localStorage.getItem("token");

  // If user is not logged in,
  // don't load messages

  if (!token) {
    return;
  }

  const response = await fetch("http://localhost:3000/message", {
    method: "GET",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (response.ok) {
    // Remove old messages
    // before loading database messages

    chatMessages.innerHTML = "";

    // Display every message

    data.data.forEach(function (message) {
      addMessage(message.message, message.userId, message.createdAt);
    });
  } else {
    alert(data.message);
  }
}

// Send message

async function sendMessage() {
  const messageText = messageInput.value.trim();

  // Don't send empty message

  if (messageText === "") {
    return;
  }

  const token = localStorage.getItem("token");

  // Login required

  if (!token) {
    window.location.href = "/fronted/login/login.html";

    return;
  }

  const response = await fetch("http://localhost:3000/message/send", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify({
      message: messageText,
    }),
  });

  const data = await response.json();

  if (response.ok) {
    // Show newly sent message

    addMessage(messageText, localStorage.getItem("userId"), new Date());

    // Clear input

    messageInput.value = "";
  } else {
    alert(data.message);
  }
}

// Add message to chat

function addMessage(messageText, messageUserId, messageTime) {
  const message = document.createElement("div");

  message.classList.add("message");

  // Get current user ID

  const currentUserId = localStorage.getItem("userId");

  // Check sender

  if (Number(messageUserId) === Number(currentUserId)) {
    // Current user's message

    message.classList.add("sent");
  } else {
    // Other user's message

    message.classList.add("received");
  }

  // Message text

  const messageTextElement = document.createElement("p");

  messageTextElement.textContent = messageText;

  // Message time

  const timeElement = document.createElement("span");

  const time = new Date(messageTime);

  timeElement.textContent = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  message.appendChild(messageTextElement);

  message.appendChild(timeElement);

  chatMessages.appendChild(message);

  // Scroll to latest message

  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Start chat

async function startChat() {
  // First load user

  await loadUserProfile();

  // Then load messages

  await loadMessages();
}

// Start

startChat();
