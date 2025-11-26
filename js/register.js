// register.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const nameInput = document.getElementById("name");
  const lastNameInput = document.getElementById("lastName");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const password2Input = document.getElementById("password2");
  const errorBox = document.getElementById("registerError");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorBox.textContent = "";

    const name = nameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    const password2 = password2Input.value;

    if (!name || !lastName || !email || !username || !password || !password2) {
      errorBox.textContent = "Todos los campos obligatorios deben completarse.";
      return;
    }

    if (password.length < 6) {
      errorBox.textContent = "La contraseña debe tener al menos 6 caracteres.";
      return;
    }

    if (password !== password2) {
      errorBox.textContent = "Las contraseñas no coinciden.";
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const exists = users.some(
      (u) => u.email === email || u.username === username
    );
    if (exists) {
      errorBox.textContent = "Ya existe una cuenta con ese correo o usuario.";
      return;
    }

    const newId = users.length
      ? Math.max(...users.map((u) => Number(u.id) || 0)) + 1
      : 1;

    const newUser = {
      id: newId,
      username,
      password,
      name,
      lastName,
      email,
      phone,
      avatar: "img/avatars/avatar0.png",
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    localStorage.setItem("session", JSON.stringify({ id: newUser.id }));

    window.location.href = "index.html";
  });
  const password = document.getElementById("password");
  const btn = document.getElementById("togglePassword");

  btn.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    btn.classList.toggle("showing", show);
    btn.setAttribute("aria-pressed", String(show));
  });
});
