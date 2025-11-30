// register.js
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("registerForm");
    const errorBox = document.getElementById("registerError");

    if (!form) return;

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (errorBox) errorBox.textContent = "";

        const nameInput = document.getElementById("name");
        const lastNameInput = document.getElementById("lastName");
        const emailInput = document.getElementById("email");
        const phoneInput = document.getElementById("phone");
        const usernameInput = document.getElementById("username");
        const passwordInput = document.getElementById("password");
        const password2Input = document.getElementById("password2");
        const errorBox = document.getElementById("registerError");


        if (!name || !lastName || !email || !username || !password || !password2) {
            errorBox.textContent = "Todos los campos obligatorios deben completarse.";
            return;
        }

        if (password.length < 6) {
            errorBox.textContent = "La contraseña debe tener al menos 6 caracteres.";
            return;
        }

        if (password !== password2Input) {
            if (errorBox) errorBox.textContent = "Las contraseñas no coinciden.";
            return;
        }

        // Preparar objeto para el backend
        const newUser = {
            username,
            password,
            name,
            last_name: lastName,
            phone,
            email
        };

        const result = await getJSONData(REGISTER_URL, 'POST', newUser);

        if (result.status === 'ok') {
            alert("Usuario registrado con éxito. Por favor inicia sesión.");
            window.location.href = "login.html";
        } else {
            if (errorBox) errorBox.textContent = result.data.messageForUser || result.data.message || "Error en el registro";
        }
    });
});