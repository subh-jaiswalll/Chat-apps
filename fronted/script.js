// ======================================
// GET HTML ELEMENTS
// ======================================

const userName =
    document.getElementById("userName");

const profileImage =
    document.getElementById("profileImage");

const userList =
    document.getElementById("userList");

const searchInput =
    document.getElementById("searchInput");

const chatProfileImage =
    document.getElementById("chatProfileImage");

const chatUserName =
    document.getElementById("chatUserName");

const chatStatus =
    document.getElementById("chatStatus");

const chatMessages =
    document.getElementById("chatMessages");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const logoutButton =
    document.getElementById("logoutButton");


// ======================================
// TOKEN
// ======================================

let token =
    localStorage.getItem("token");


// ======================================
// CURRENT USER
// ======================================

let myUserId =
    Number(
        localStorage.getItem("userId")
    );


// ======================================
// SELECTED USER
// ======================================

let selectedUserId = null;

let selectedUserName = null;


// ======================================
// SOCKET
// ======================================

let socket = null;


// ======================================
// CHECK LOGIN
// ======================================

function checkLogin() {

    token =
        localStorage.getItem("token");


    if (token) {

        logoutButton.textContent =
            "Logout";

        return true;

    }


    logoutButton.textContent =
        "Login";

    return false;

}


// ======================================
// LOGIN / LOGOUT
// ======================================

logoutButton.addEventListener(
    "click",
    function () {

        const loggedIn =
            localStorage.getItem("token");


        // ==========================
        // USER IS LOGGED IN
        // ==========================

        if (loggedIn) {

            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "userName"
            );


            if (socket) {

                socket.disconnect();

            }


            window.location.href =
                "/fronted/login/login.html";

            return;

        }


        // ==========================
        // USER IS NOT LOGGED IN
        // ==========================

        window.location.href =
            "/fronted/login/login.html";

    }
);


// ======================================
// LOAD PROFILE
// ======================================

async function loadProfile() {

    token =
        localStorage.getItem("token");


    // ==========================
    // NOT LOGGED IN
    // ==========================

    if (!token) {

        userName.textContent =
            "Guest";

        profileImage.textContent =
            "G";

        logoutButton.textContent =
            "Login";

        return;

    }


    // ==========================
    // GET PROFILE
    // ==========================

    try {

        const response =
            await fetch(
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


        // ==========================
        // TOKEN INVALID
        // ==========================

        if (!response.ok) {

            console.log(
                "Profile error:",
                data.message
            );


            localStorage.removeItem(
                "token"
            );

            localStorage.removeItem(
                "userId"
            );

            localStorage.removeItem(
                "userName"
            );


            userName.textContent =
                "Guest";

            profileImage.textContent =
                "G";

            logoutButton.textContent =
                "Login";


            return;

        }


        // ==========================
        // SHOW PROFILE
        // ==========================

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


        localStorage.setItem(
            "userName",
            data.name
        );


        myUserId =
            Number(data.id);


        logoutButton.textContent =
            "Logout";


    } catch (error) {

        console.log(
            "Profile error:",
            error
        );

    }

}


// ======================================
// LOAD USERS
// ======================================

async function loadUsers() {

    token =
        localStorage.getItem("token");


    // ==========================
    // NOT LOGGED IN
    // ==========================

    if (!token) {

        userList.innerHTML =
            `
            <p style="padding:15px;color:#777;">
                Please login to see users.
            </p>
            `;

        return;

    }


    // ==========================
    // GET USERS
    // ==========================

    try {

        const response =
            await fetch(
                "http://localhost:3000/user/users",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        console.log(
            "Users API status:",
            response.status
        );


        console.log(
            "Users API response:",
            result
        );


        if (!response.ok) {

            console.log(
                "Users API error:",
                result.message
            );

            return;

        }


        displayUsers(
            result.data
        );


    } catch (error) {

        console.log(
            "Error loading users:",
            error
        );

    }

}


// ======================================
// DISPLAY USERS
// ======================================

function displayUsers(users) {

    userList.innerHTML = "";


    if (!users || users.length === 0) {

        userList.innerHTML =
            `
            <p style="padding:15px;color:#777;">
                No other users found.
            </p>
            `;

        return;

    }


    users.forEach(
        function (user) {

            // ==========================
            // USER CONTAINER
            // ==========================

            const userElement =
                document.createElement("div");


            userElement.className =
                "user";


            userElement.dataset.userId =
                user.id;


            // ==========================
            // AVATAR
            // ==========================

            const avatar =
                document.createElement("div");


            avatar.className =
                "user-avatar";


            avatar.textContent =
                user.name
                    .charAt(0)
                    .toUpperCase();


            // ==========================
            // USER INFO
            // ==========================

            const userInfo =
                document.createElement("div");


            userInfo.className =
                "user-info";


            // Name

            const name =
                document.createElement("h4");


            name.textContent =
                user.name;


            // Status

            const status =
                document.createElement("p");


            status.textContent =
                "Start chatting";


            userInfo.appendChild(
                name
            );


            userInfo.appendChild(
                status
            );


            // ==========================
            // ADD ELEMENTS
            // ==========================

            userElement.appendChild(
                avatar
            );


            userElement.appendChild(
                userInfo
            );


            // ==========================
            // CLICK USER
            // ==========================

            userElement.addEventListener(
                "click",
                function () {

                    selectUser(
                        user.id,
                        user.name,
                        userElement
                    );

                }
            );


            userList.appendChild(
                userElement
            );

        }
    );

}


// ======================================
// SELECT USER
// ======================================

function selectUser(
    userId,
    userNameValue,
    userElement
) {

    selectedUserId =
        userId;


    selectedUserName =
        userNameValue;


    console.log(
        "Selected user:",
        selectedUserName
    );


    // ==========================
    // REMOVE ACTIVE
    // ==========================

    const allUsers =
        document.querySelectorAll(
            ".user"
        );


    allUsers.forEach(
        function (user) {

            user.classList.remove(
                "active"
            );

        }
    );


    // ==========================
    // ADD ACTIVE
    // ==========================

    userElement.classList.add(
        "active"
    );


    // ==========================
    // UPDATE CHAT HEADER
    // ==========================

    chatUserName.textContent =
        selectedUserName;


    chatProfileImage.textContent =
        selectedUserName
            .charAt(0)
            .toUpperCase();


    chatStatus.textContent =
        "Online";


    // ==========================
    // ENABLE INPUT
    // ==========================

    messageInput.disabled =
        false;


    sendButton.disabled =
        false;


    messageInput.placeholder =
        "Type a message...";


    // ==========================
    // CLEAR OLD SCREEN
    // ==========================

    chatMessages.innerHTML = "";


    // ==========================
    // JOIN ROOM
    // ==========================

    joinRoom(
        userId
    );


    // ==========================
    // LOAD OLD MESSAGES
    // ==========================

    loadMessages(
        userId
    );

}


// ======================================
// JOIN PERSONAL ROOM
// ======================================

function joinRoom(userId) {

    if (!socket) {

        return;

    }


    socket.emit(
        "join_room",
        {
            userId: userId
        }
    );


    console.log(
        "Joining room with user:",
        userId
    );

}


// ======================================
// LOAD OLD MESSAGES
// ======================================

async function loadMessages(userId) {

    token =
        localStorage.getItem("token");


    if (!token) {

        return;

    }


    try {

        const response =
            await fetch(
                `http://localhost:3000/message?receiverId=${userId}`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const result =
            await response.json();


        if (!response.ok) {

            console.log(
                result.message
            );

            return;

        }


        chatMessages.innerHTML = "";


        result.data.forEach(
            function (message) {

                addMessage(
                    message.message,
                    message.senderId,
                    message.senderName,
                    message.createdAt
                );

            }
        );


        scrollToBottom();


    } catch (error) {

        console.log(
            "Message loading error:",
            error
        );

    }

}


// ======================================
// SEND MESSAGE
// ======================================

function sendPersonalMessage() {

    const messageText =
        messageInput.value.trim();


    if (!messageText) {

        return;

    }


    if (!selectedUserId) {

        alert(
            "Please select a user"
        );

        return;

    }


    if (!socket) {

        alert(
            "Socket is not connected"
        );

        return;

    }


    if (!socket.connected) {

        alert(
            "Socket is not connected"
        );

        return;

    }


    socket.emit(
        "new_message",
        {
            receiverId:
                selectedUserId,

            message:
                messageText
        }
    );


    messageInput.value = "";

}


// ======================================
// SEND BUTTON
// ======================================

sendButton.addEventListener(
    "click",
    function () {

        sendPersonalMessage();

    }
);


// ======================================
// ENTER KEY
// ======================================

messageInput.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            sendPersonalMessage();

        }

    }
);


// ======================================
// SOCKET CONNECTION
// ======================================

function connectSocket() {

    token =
        localStorage.getItem("token");


    // No token = don't connect

    if (!token) {

        return;

    }


    socket =
        io(
            "http://localhost:3000",
            {
                auth: {
                    token: token
                }
            }
        );


    socket.on(
        "connect",
        function () {

            console.log(
                "Socket connected:",
                socket.id
            );

        }
    );


    socket.on(
        "connect_error",
        function (error) {

            console.log(
                "Socket connection error:",
                error.message
            );

        }
    );


    socket.on(
        "new_message",
        function (data) {

            console.log(
                "New message:",
                data
            );


            if (
                Number(data.senderId) !==
                Number(selectedUserId)
                &&
                Number(data.receiverId) !==
                Number(selectedUserId)
            ) {

                return;

            }


            addMessage(
                data.message,
                data.senderId,
                data.senderName,
                data.createdAt
            );


            scrollToBottom();

        }
    );


    socket.on(
        "disconnect",
        function () {

            console.log(
                "Socket disconnected"
            );

        }
    );

}


// ======================================
// ADD MESSAGE
// ======================================

function addMessage(
    messageText,
    messageSenderId,
    messageSenderName,
    messageTime
) {

    const messageElement =
        document.createElement("div");


    const senderId =
        Number(messageSenderId);


    // ==========================
    // SENT / RECEIVED
    // ==========================

    if (
        senderId ===
        Number(myUserId)
    ) {

        messageElement.className =
            "message sent";

    } else {

        messageElement.className =
            "message received";

    }


    // ==========================
    // SENDER NAME
    // ==========================

    const senderElement =
        document.createElement("div");


    senderElement.className =
        "sender-name";


    senderElement.textContent =
        messageSenderName;


    if (
        senderId !==
        Number(myUserId)
    ) {

        senderElement.style.color =
            getUserColor(
                senderId
            );

    }


    // ==========================
    // MESSAGE TEXT
    // ==========================

    const textElement =
        document.createElement("div");


    textElement.className =
        "message-text";


    textElement.textContent =
        messageText;


    // ==========================
    // TIME
    // ==========================

    const timeElement =
        document.createElement("div");


    timeElement.className =
        "message-time";


    const date =
        new Date(
            messageTime
        );


    timeElement.textContent =
        date.toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit"
            }
        );


    // ==========================
    // APPEND
    // ==========================

    messageElement.appendChild(
        senderElement
    );


    messageElement.appendChild(
        textElement
    );


    messageElement.appendChild(
        timeElement
    );


    chatMessages.appendChild(
        messageElement
    );

}


// ======================================
// USER COLOR
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
        "#8e44ad"

    ];


    const index =
        Number(userId) %
        colors.length;


    return colors[index];

}


// ======================================
// SCROLL
// ======================================

function scrollToBottom() {

    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// ======================================
// SEARCH USERS
// ======================================

searchInput.addEventListener(
    "input",
    function () {

        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        const users =
            document.querySelectorAll(
                ".user"
            );


        users.forEach(
            function (user) {

                const name =
                    user
                        .querySelector(
                            ".user-info h4"
                        )
                        .textContent
                        .toLowerCase();


                if (
                    name.includes(
                        searchText
                    )
                ) {

                    user.style.display =
                        "flex";

                } else {

                    user.style.display =
                        "none";

                }

            }
        );

    }
);


// ======================================
// START APPLICATION
// ======================================

async function startApp() {

    const loggedIn =
        checkLogin();


    // ==========================
    // NOT LOGGED IN
    // ==========================

    if (!loggedIn) {

        await loadProfile();

        return;

    }


    // ==========================
    // LOGGED IN
    // ==========================

    await loadProfile();

    await loadUsers();

    connectSocket();

}


startApp();