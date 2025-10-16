document.addEventListener("DOMContentLoaded", () => {
  const inputUsername = document.getElementById("username");
  const inputName = document.getElementById("name");
  const inputLastname = document.getElementById("lastname");
  const inputEmail = document.getElementById("email");
  const inputPhone = document.getElementById("phone");

  const btnSave = document.getElementById("saveProfile");
  const btnChangeAvatar = document.getElementById("btnAvatarChange");
  const btnResetAvatar = document.getElementById("btnAvatarReset");

  const currentAvatarImg = document.getElementById("currentAvatarImg");

  const avatarModal = document.getElementById("avatarModal");
  const closeAvatarModal = document.getElementById("closeAvatarModal");

  let session = JSON.parse(localStorage.getItem("session")) || {};

  // Mostrar datos del perfil en el formulario
  inputUsername.value = session.username || "";
  inputName.value = session.name || "";
  inputLastname.value = session.lastname || "";
  inputEmail.value = session.email || "";
  inputPhone.value = session.phone || "";

  const defaultAvatar = "img/avatars/avatar0.png";
  currentAvatarImg.src = session.avatar || defaultAvatar;

  // Guardar cambios en el perfil
  const form = document.getElementById("profileData");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const usernameValue = inputUsername.value.trim();

    if (/\s/.test(usernameValue)) {
      alert("El nombre de usuario no puede contener espacios.");
      return;
    }

    session.username = usernameValue;
    session.name = inputName.value.trim();
    session.lastname = inputLastname.value.trim();
    session.email = inputEmail.value.trim();
    session.phone = inputPhone.value.trim();

    localStorage.setItem("session", JSON.stringify(session));

    const userNameDisplay = document.getElementById("userNameDisplay");
    if (userNameDisplay) userNameDisplay.textContent = session.username;

    alert("Perfil actualizado correctamente.");
  });

  inputPhone.addEventListener("input", () => {
    inputPhone.value = inputPhone.value.replace(/\D/g, "");
  });

  btnChangeAvatar.addEventListener("click", () => {
    avatarModal.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  });

  const closeModal = () => {
    avatarModal.classList.add("hidden");
    document.body.style.overflow = "auto";
  };

  closeAvatarModal.addEventListener("click", closeModal);

  avatarModal.addEventListener("click", (e) => {
    if (e.target === avatarModal) closeModal();
  });

  // Selección de avatar
  const avatarOptions = document.querySelectorAll(".avatar-option");
  avatarOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const selectedAvatar = option.dataset.avatar;

      currentAvatarImg.src = selectedAvatar;
      session.avatar = selectedAvatar;
      localStorage.setItem("session", JSON.stringify(session));

      const userAvatarMini = document.getElementById("userAvatarMini");
      if (userAvatarMini) userAvatarMini.src = selectedAvatar;

      avatarOptions.forEach((opt) => opt.classList.remove("selected"));
      option.classList.add("selected");

      closeModal();
    });
  });

  btnResetAvatar.addEventListener("click", () => {
    currentAvatarImg.src = defaultAvatar;
    session.avatar = defaultAvatar;
    localStorage.setItem("session", JSON.stringify(session));

    const userAvatarMini = document.getElementById("userAvatarMini");
    if (userAvatarMini) userAvatarMini.src = defaultAvatar;

    alert("Avatar restablecido al predeterminado.");
  });
});
