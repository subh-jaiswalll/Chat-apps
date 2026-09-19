const signupForm = document.getElementById("signupForm");

signupForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const name = document.getElementById("inpName").value;
    const email = document.getElementById("inpEmail").value;
    const number = document.getElementById("inpNumber").value;
    const password = document.getElementById("inpPassword").value;

    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Number:", number);
    console.log("Password:", password);

    const response = await fetch("http://localhost:3000/user/signup", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name: name,
            email: email,
            number: number,
            password: password
        })
    });

    const data = await response.json();

    console.log(data);
});