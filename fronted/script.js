// ======================================
// GET HTML ELEMENTS
// ======================================

const userName = document.getElementById("userName");
const profileImage = document.getElementById("profileImage");
const userList = document.getElementById("userList");
const searchInput = document.getElementById("searchInput");

const chatProfileImage = document.getElementById("chatProfileImage");
const chatUserName = document.getElementById("chatUserName");
const chatStatus = document.getElementById("chatStatus");
const chatMessages = document.getElementById("chatMessages");

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const logoutButton = document.getElementById("logoutButton");

const groupNameInput = document.getElementById("groupNameInput");
const createGroupButton = document.getElementById("createGroupButton");
const groupList = document.getElementById("groupList");

const aiSuggestions = document.getElementById("aiSuggestions");
const smartReplies = document.getElementById("smartReplies");

// ======================================
// CONFIGURATION
// ======================================

const API_URL = "http://localhost:3000";

let token = localStorage.getItem("token");
let myUserId = Number(localStorage.getItem("userId"));

let selectedUserId = null;
let selectedUserName = null;

let selectedGroupId = null;
let selectedGroupName = null;

let selectedChatType = null;

let socket = null;
let aiTimer = null;
let aiRequestNumber = 0;
let chatRequestNumber = 0;

// ======================================
// COMMON API FUNCTION
// ======================================

async function apiRequest(path, options = {}) {
  token = localStorage.getItem("token");

  const headers = {
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(API_URL + path, {
    ...options,
    headers,
  });

  let result = {};

  try {
    result = await response.json();
  } catch (error) {
    result = {};
  }

  if (response.status === 401) {
    logout();
    throw new Error("Session expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(result.message || "Request failed");
  }

  return result;
}

// ======================================
// LOGOUT
// ======================================

function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("userName");

  if (socket) {
    socket.disconnect();
    socket = null;
  }

  window.location.href = "/fronted/login/login.html";
}

logoutButton.addEventListener("click", function () {
  logout();
});

// ======================================
// LOGIN CHECK
// ======================================

function checkLogin() {
  token = localStorage.getItem("token");

  if (!token) {
    logoutButton.textContent = "Login";
    return false;
  }

  logoutButton.textContent = "Logout";
  return true;
}

// ======================================
// LOAD PROFILE
// ======================================

async function loadProfile() {
  token = localStorage.getItem("token");

  if (!token) {
    userName.textContent = "Guest";
    profileImage.textContent = "G";
    logoutButton.textContent = "Login";
    return false;
  }

  try {
    const result = await apiRequest("/user/profile");
    const user = result.data || result.user || result;

    if (!user || user.id == null || !user.name) {
      throw new Error("Invalid profile response");
    }

    myUserId = Number(user.id);

    userName.textContent = user.name;
    profileImage.textContent = user.name.charAt(0).toUpperCase();

    localStorage.setItem("userId", user.id);
    localStorage.setItem("userName", user.name);

    logoutButton.textContent = "Logout";

    return true;
  } catch (error) {
    console.error("Profile error:", error.message);
    return false;
  }
}

// ======================================
// LOAD USERS
// ======================================

async function loadUsers() {
  try {
    const result = await apiRequest("/user/users");
    const users = result.data || result.users || [];

    displayUsers(users);
  } catch (error) {
    console.error("Load users error:", error.message);
  }
}

// ======================================
// DISPLAY USERS
// ======================================

function displayUsers(users) {
  userList.replaceChildren();

  const filteredUsers = users.filter(function (user) {
    return Number(user.id) !== Number(myUserId);
  });

  if (filteredUsers.length === 0) {
    userList.textContent = "No other users found.";
    return;
  }

  filteredUsers.forEach(function (user) {
    const userElement = document.createElement("div");

    userElement.className = "user";
    userElement.dataset.userId = user.id;

    const avatar = document.createElement("div");
    avatar.className = "user-avatar";
    avatar.textContent = (user.name || "U").charAt(0).toUpperCase();

    const info = document.createElement("div");
    info.className = "user-info";

    const name = document.createElement("h4");
    name.textContent = user.name || "Unknown User";

    const status = document.createElement("p");
    status.textContent = "Start chatting";

    info.appendChild(name);
    info.appendChild(status);

    userElement.appendChild(avatar);
    userElement.appendChild(info);

    userElement.addEventListener("click", function () {
      selectUser(user.id, user.name || "Unknown User");
    });

    userList.appendChild(userElement);
  });

  filterUsers();
}

// ======================================
// SEARCH USERS
// ======================================

searchInput.addEventListener("input", filterUsers);

function filterUsers() {
  const searchText = searchInput.value.toLowerCase().trim();

  document.querySelectorAll(".user").forEach(function (element) {
    const name = element.querySelector("h4").textContent.toLowerCase();

    element.style.display = name.includes(searchText) ? "flex" : "none";
  });
}

// ======================================
// CLEAR CHAT SELECTION
// ======================================

function clearChatSelection() {
  document.querySelectorAll(".user, .group-item").forEach(function (element) {
    element.classList.remove("active");
  });
}

// ======================================
// SHOW LOADING MESSAGE
// ======================================

function showLoadingMessage() {
  chatMessages.replaceChildren();

  const message = document.createElement("p");
  message.className = "empty-message";
  message.textContent = "Loading messages...";

  chatMessages.appendChild(message);
}

// ======================================
// SHOW EMPTY MESSAGE
// ======================================

function showEmptyMessage(text) {
  chatMessages.replaceChildren();

  const message = document.createElement("p");
  message.className = "empty-message";
  message.textContent = text;

  chatMessages.appendChild(message);
}

// ======================================
// SELECT PERSONAL CHAT
// ======================================

async function selectUser(userId, name) {
  selectedChatType = "personal";

  selectedUserId = Number(userId);
  selectedUserName = name;

  selectedGroupId = null;
  selectedGroupName = null;

  const requestNumber = ++chatRequestNumber;

  clearChatSelection();

  const userElement = document.querySelector(`.user[data-user-id="${userId}"]`);

  if (userElement) {
    userElement.classList.add("active");
  }

  chatUserName.textContent = name;
  chatProfileImage.textContent = name.charAt(0).toUpperCase();
  chatStatus.textContent = "Personal chat";

  messageInput.disabled = false;
  sendButton.disabled = false;
  messageInput.placeholder = "Type a message...";

  messageInput.value = "";
  clearSuggestions();
  showLoadingMessage();

  if (socket && socket.connected) {
    socket.emit("join_room", {
      userId: selectedUserId,
    });
  }

  await loadPersonalMessages(selectedUserId, requestNumber);
}

// ======================================
// LOAD PERSONAL MESSAGE HISTORY
// ======================================

async function loadPersonalMessages(userId, requestNumber) {
  try {
    const result = await apiRequest(
      `/message?receiverId=${encodeURIComponent(userId)}`,
    );

    // Do not display messages from a previously selected chat.
    if (
      requestNumber !== chatRequestNumber ||
      selectedChatType !== "personal" ||
      Number(selectedUserId) !== Number(userId)
    ) {
      return;
    }

    const messages = result.data || result.messages || [];

    chatMessages.replaceChildren();

    if (messages.length === 0) {
      showEmptyMessage("No messages yet. Say hello!");
      return;
    }

    messages.forEach(function (message) {
      addMessage(
        message.message ?? message.text ?? "",
        message.senderId ?? message.sender?.id,
        message.senderName || message.sender?.name || "User",
        message.createdAt,
      );
    });

    scrollToBottom();
  } catch (error) {
    if (requestNumber === chatRequestNumber) {
      console.error("Load personal messages:", error.message);
      showEmptyMessage("Could not load messages.");
    }
  }
}

// ======================================
// SEND BUTTON AND ENTER KEY
// ======================================

sendButton.addEventListener("click", sendCurrentMessage);

messageInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendCurrentMessage();
  }
});

// ======================================
// SEND CURRENT MESSAGE
// ======================================

function sendCurrentMessage() {
  if (selectedChatType === "personal") {
    sendPersonalMessage();
  } else if (selectedChatType === "group") {
    sendGroupMessage();
  } else {
    alert("Please select a user or group first.");
  }
}

// ======================================
// SEND PERSONAL MESSAGE
// ======================================

function sendPersonalMessage() {
  const messageText = messageInput.value.trim();

  if (!messageText) {
    return;
  }

  if (!selectedUserId) {
    alert("Please select a user.");
    return;
  }

  if (!socket || !socket.connected) {
    alert("Socket is not connected. Please wait or refresh.");
    return;
  }

  socket.emit("new_message", {
    receiverId: selectedUserId,
    message: messageText,
  });

  messageInput.value = "";
  clearSuggestions();
}

// ======================================
// SOCKET CONNECTION
// ======================================

function connectSocket() {
  token = localStorage.getItem("token");

  if (!token) {
    return;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(API_URL, {
    auth: {
      token: token,
    },
  });

  socket.on("connect", function () {
    console.log("Socket connected:", socket.id);

    // Rejoin the selected personal chat after reconnecting.
    if (selectedChatType === "personal" && selectedUserId) {
      socket.emit("join_room", {
        userId: selectedUserId,
      });
    }

    // Rejoin the selected group after reconnecting.
    if (selectedChatType === "group" && selectedGroupId) {
      socket.emit("join_group", {
        groupId: selectedGroupId,
      });
    }
  });

  socket.on("connect_error", function (error) {
    console.error("Socket connection error:", error.message);
  });

  // --------------------------------------
  // PERSONAL CHAT EVENT
  // --------------------------------------

  socket.on("new_message", function (data) {
    if (selectedChatType !== "personal") {
      return;
    }

    const senderId = Number(data.senderId);
    const receiverId = Number(data.receiverId);

    const belongsToCurrentChat =
      (senderId === Number(myUserId) &&
        receiverId === Number(selectedUserId)) ||
      (senderId === Number(selectedUserId) && receiverId === Number(myUserId));

    if (!belongsToCurrentChat) {
      return;
    }

    // Do not render an event without a message.
    const text = data.message ?? data.text;

    if (text == null) {
      return;
    }

    addMessage(text, senderId, data.senderName || "User", data.createdAt);

    scrollToBottom();

    if (senderId !== Number(myUserId)) {
      requestAISuggestions(text, "replies");
    }
  });

  // --------------------------------------
  // GROUP CHAT EVENT
  // --------------------------------------

  socket.on("new_group_message", function (data) {
    if (selectedChatType !== "group") {
      return;
    }

    if (Number(data.groupId) !== Number(selectedGroupId)) {
      return;
    }

    const text = data.message ?? data.text;

    if (text == null) {
      return;
    }

    addMessage(text, data.senderId, data.senderName || "User", data.createdAt);

    scrollToBottom();

    if (Number(data.senderId) !== Number(myUserId)) {
      requestAISuggestions(text, "replies");
    }
  });

  socket.on("disconnect", function (reason) {
    console.log("Socket disconnected:", reason);
  });
}

// ======================================
// ADD MESSAGE TO CHAT
// ======================================

function addMessage(
  messageText,
  messageSenderId,
  messageSenderName,
  messageTime,
) {
  const messageElement = document.createElement("div");

  const senderId = Number(messageSenderId);

  messageElement.className =
    senderId === Number(myUserId) ? "message sent" : "message received";

  const senderElement = document.createElement("div");
  senderElement.className = "sender-name";
  senderElement.textContent = messageSenderName || "User";

  if (senderId !== Number(myUserId)) {
    senderElement.style.color = getUserColor(senderId);
  }

  const textElement = document.createElement("div");
  textElement.className = "message-text";
  textElement.textContent = String(messageText);

  const timeElement = document.createElement("div");
  timeElement.className = "message-time";

  const date = messageTime ? new Date(messageTime) : null;

  timeElement.textContent =
    date && !Number.isNaN(date.getTime())
      ? date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

  messageElement.appendChild(senderElement);
  messageElement.appendChild(textElement);
  messageElement.appendChild(timeElement);

  chatMessages.appendChild(messageElement);
}

// ======================================
// USER COLORS
// ======================================

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
    "#8e44ad",
  ];

  const index = Math.abs(Number(userId) || 0) % colors.length;

  return colors[index];
}

// ======================================
// SCROLL TO BOTTOM
// ======================================

function scrollToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// ======================================
// CREATE GROUP
// ======================================

createGroupButton.addEventListener("click", createGroup);

groupNameInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    createGroup();
  }
});

async function createGroup() {
  const name = groupNameInput.value.trim();

  if (!name) {
    alert("Please enter a group name.");
    return;
  }

  createGroupButton.disabled = true;

  try {
    const result = await apiRequest("/group", {
      method: "POST",
      body: JSON.stringify({
        name: name,
      }),
    });

    const group = result.data || result.group || result;

    if (group.id == null) {
      throw new Error("Group created, but the API did not return its ID.");
    }

    groupNameInput.value = "";

    await loadGroups();

    // Pass the ID and name separately.
    await selectGroup(group.id, group.name || name);

    console.log("Group created:", group);
  } catch (error) {
    console.error("Create group error:", error.message);
    alert(error.message);
  } finally {
    createGroupButton.disabled = false;
  }
}

// ======================================
// LOAD GROUPS
// ======================================

async function loadGroups() {
  try {
    const result = await apiRequest("/group");

    console.log("Full groups response:", result);
    console.log("Groups data:", result.data);
    console.log("Groups array:", result.groups);

    const groups = result.data || result.groups || [];

    displayGroups(groups);
  } catch (error) {
    console.error("Load groups error:", error.message);
  }
}

// ======================================
// DISPLAY GROUPS
// ======================================

function displayGroups(groups) {
  groupList.replaceChildren();

  if (!groups.length) {
    const empty = document.createElement("p");
    empty.textContent = "No groups yet.";
    groupList.appendChild(empty);
    return;
  }

  groups.forEach(function (group) {
    const groupElement = document.createElement("div");

    groupElement.className = "group-item";
    groupElement.dataset.groupId = group.id;
    groupElement.textContent = group.name || "Unnamed Group";

    groupElement.addEventListener("click", function () {
      selectGroup(group.id, group.name || "Unnamed Group");
    });

    groupList.appendChild(groupElement);
  });
}

// ======================================
// SELECT GROUP
// ======================================

async function selectGroup(groupId, groupName) {
  // Also support selectGroup(groupObject).
  if (typeof groupId === "object" && groupId !== null) {
    groupName = groupId.name;
    groupId = groupId.id;
  }

  if (groupId == null) {
    alert("Invalid group ID.");
    return;
  }

  selectedChatType = "group";

  selectedGroupId = Number(groupId);
  selectedGroupName = groupName || "Group";

  selectedUserId = null;
  selectedUserName = null;

  const requestNumber = ++chatRequestNumber;

  clearChatSelection();

  const groupElement = document.querySelector(
    `.group-item[data-group-id="${selectedGroupId}"]`,
  );

  if (groupElement) {
    groupElement.classList.add("active");
  }

  chatUserName.textContent = selectedGroupName;
  chatProfileImage.textContent = selectedGroupName.charAt(0).toUpperCase();

  chatStatus.textContent = "Group chat";

  messageInput.disabled = false;
  sendButton.disabled = false;
  messageInput.placeholder = "Message the group...";

  messageInput.value = "";

  clearSuggestions();
  showLoadingMessage();

  if (socket && socket.connected) {
    socket.emit("join_group", {
      groupId: selectedGroupId,
    });
  }

  await loadGroupMessages(selectedGroupId, requestNumber);
}

// ======================================
// LOAD GROUP MESSAGE HISTORY
// ======================================

async function loadGroupMessages(groupId, requestNumber) {
  try {
    const result = await apiRequest(
      `/group/${encodeURIComponent(groupId)}/messages`,
    );

    if (
      requestNumber !== chatRequestNumber ||
      selectedChatType !== "group" ||
      Number(selectedGroupId) !== Number(groupId)
    ) {
      return;
    }

    const messages = result.data || result.messages || [];

    chatMessages.replaceChildren();

    if (messages.length === 0) {
      showEmptyMessage("No group messages yet. Say hello!");
      return;
    }

    messages.forEach(function (message) {
      addMessage(
        message.message ?? message.text ?? "",
        message.senderId ?? message.sender?.id,
        message.senderName || message.sender?.name || "User",
        message.createdAt,
      );
    });

    scrollToBottom();
  } catch (error) {
    if (requestNumber === chatRequestNumber) {
      console.error("Load group messages:", error.message);
      showEmptyMessage("Could not load group messages.");
    }
  }
}

// ======================================
// SEND GROUP MESSAGE
// ======================================

function sendGroupMessage() {
  const messageText = messageInput.value.trim();

  if (!messageText) {
    return;
  }

  if (!selectedGroupId) {
    alert("Please select a group.");
    return;
  }

  if (!socket || !socket.connected) {
    alert("Socket is not connected. Please wait or refresh.");
    return;
  }

  socket.emit("group_message", {
    groupId: selectedGroupId,
    message: messageText,
  });

  messageInput.value = "";
  clearSuggestions();
}

// ======================================
// AI TYPING SUGGESTIONS
// ======================================

messageInput.addEventListener("input", function () {
    const text = messageInput.value.trim();

    clearTimeout(aiTimer);
    clearElement(aiSuggestions);

    if (!text || !selectedChatType) {
        return;
    }

    aiTimer = setTimeout(function () {
        requestAISuggestions(text, "typing");
    }, 700);
});

async function loadAllGroups() {
  try {
    const result = await apiRequest("/group/all");
    const groups = result.data || [];

    console.log("All groups response:", result);
    console.log("All groups array:", result.data);

    const groupList = document.getElementById("groupList");

    if (!groupList) {
      console.error("Group list element not found");
      return;
    }

    groupList.innerHTML = "";

    groups.forEach(function (group) {
      const item = document.createElement("div");
      item.className = "group-item";

      const name = document.createElement("span");
      name.textContent = group.name;

      item.appendChild(name);

      if (group.isMember) {
        const joinedLabel = document.createElement("span");
        joinedLabel.className = "joined-label";
        joinedLabel.textContent = "Joined";
        item.appendChild(joinedLabel);
        item.addEventListener("click", function () {
          selectGroup(group.id, group.name);
        });
      } else {
        const joinButton = document.createElement("button");
        joinButton.textContent = "Join Group";

        joinButton.addEventListener("click", async function (event) {
          event.stopPropagation();

          try {
            await apiRequest("/group/" + group.id + "/join", {
              method: "POST",
            });

            alert("Group joined successfully!");

            await loadAllGroups();
            await loadGroups();
          } catch (error) {
            console.error("Join group error:", error);
            alert("Could not join group.");
          }
        });

        item.appendChild(joinButton);
      }

      groupList.appendChild(item);
    });
  } catch (error) {
    console.error("Load all groups error:", error);
  }
}

// ======================================
// REQUEST AI SUGGESTIONS
// ======================================


// Add this variable with your other configuration variables:
let typingRequestNumber = 0;

// ======================================
// REQUEST AI SUGGESTIONS
// ======================================

async function requestAISuggestions(text, mode) {
    if (!text || !selectedChatType) {
        return;
    }

    const chatType = selectedChatType;
    const userId = selectedUserId;
    const groupId = selectedGroupId;

    let requestNumber;

    if (mode === "typing") {
        requestNumber = ++typingRequestNumber;
    }

    const container =
        mode === "typing" ? aiSuggestions : smartReplies;

    clearElement(container);

    try {
        const result = await apiRequest("/ai/suggestions", {
            method: "POST",
            body: JSON.stringify({
                text: text,
                mode: mode,
                style: "casual"
            })
        });

        console.log("AI response:", result);

        if (
            chatType !== selectedChatType ||
            userId !== selectedUserId ||
            groupId !== selectedGroupId
        ) {
            return;
        }

        if (mode === "typing") {
            if (requestNumber !== typingRequestNumber) {
                return;
            }

            if (messageInput.value.trim() !== text) {
                return;
            }
        }

        const suggestions = result.suggestions || [];

        console.log("Suggestions to display:", suggestions);

        displayAISuggestions(suggestions, container);

    } catch (error) {
        console.error("AI suggestions error:", error);
    }
}


// ======================================
// DISPLAY AI SUGGESTIONS
// ======================================

function displayAISuggestions(suggestions, container) {
  if (!container) {
    return;
  }

  clearElement(container);

  suggestions.slice(0, 3).forEach(function (suggestion) {
    if (typeof suggestion !== "string") {
      return;
    }

    const button = document.createElement("button");

    button.type = "button";
    button.textContent = suggestion;

    button.addEventListener("click", function () {
      messageInput.value = suggestion;
      messageInput.focus();

      clearSuggestions();
    });

    container.appendChild(button);
  });
}

// ======================================
// CLEAR AI SUGGESTIONS
// ======================================

function clearElement(element) {
  if (element) {
    element.replaceChildren();
  }
}

function clearSuggestions() {
  clearElement(aiSuggestions);
  clearElement(smartReplies);

  clearTimeout(aiTimer);
  aiRequestNumber++;
}

// ======================================
// START APPLICATION
// ======================================

async function startApp() {
  if (!checkLogin()) {
    await loadProfile();
    return;
  }

  const profileLoaded = await loadProfile();

  if (!profileLoaded || !localStorage.getItem("token")) {
    return;
  }

  await loadUsers();
  await loadGroups();
  await loadAllGroups();

  connectSocket();
}

startApp();
