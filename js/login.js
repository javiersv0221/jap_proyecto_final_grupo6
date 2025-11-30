document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector("form");
    if (!form) return;

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

        const usernameInput = document.getElementById("email").value;
        const passwordInput = document.getElementById("password").value;

        const result = await getJSONData(LOGIN_URL, 'POST', {
            username: usernameInput,
            password: passwordInput
        });

        if (result.status === 'ok') {
            localStorage.setItem("session", "active");
            localStorage.setItem("token", result.data.token);
            localStorage.setItem("username", result.data.user.username);
            localStorage.setItem("userID", result.data.user.id);
            window.location.href = "index.html";
        } else {
            alert(result.data.messageForUser || "Usuario o contraseña incorrectos");
        }
    });

    // Ojito password (Original)
    const password = document.getElementById("password");
    const btn = document.getElementById("togglePassword");
    if(btn && password){
        btn.addEventListener("click", () => {
            const show = password.type === "password";
            password.type = show ? "text" : "password";
            btn.classList.toggle("showing", show);
            btn.setAttribute("aria-pressed", String(show));
        });
    }
});