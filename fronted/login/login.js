const loginForm = document.getElementById("loginForm");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const identifier =
        document.getElementById("identifier").value;

    const password =
        document.getElementById("password").value;

    const response = await fetch(
        "http://localhost:3000/user/login",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                identifier: identifier,
                password: password
            })
        }
    );

    const data = await response.json();

    if (response.ok) {

        // Save JWT token
        localStorage.setItem("token", data.token);

        alert("Login successful");

        window.location.href = "/fronted/index.html";

    } else {

        alert(data.message);
    }
});