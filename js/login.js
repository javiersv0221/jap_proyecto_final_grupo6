// Agrega un event listener al formulario para el evento submit
document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
    const username = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === username || u.username === username);
    if (user && user.password === password) {
        //Guarda los datos en localStorage
        localStorage.setItem("session", JSON.stringify({id: user.id}));

        //Redirecciona a index.html
        window.location.href = "index.html";
        return;
    }

    alert("Credenciales incorrectas");
});

//Ojito del password
const password = document.getElementById("password");
const btn = document.getElementById("togglePassword");

btn.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    btn.classList.toggle("showing", show);
    btn.setAttribute("aria-pressed", String(show));
});
