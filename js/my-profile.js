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

    const userData = getCurrentUserData();

    // Mostrar datos del perfil en el formulario
    inputUsername.value = userData.username ?? "";
    inputName.value = userData.name ?? "";
    inputLastname.value = userData.lastName ?? "";
    inputEmail.value = userData.email ?? "";
    inputPhone.value = userData.phone ?? "";

    const defaultAvatar = "img/avatars/avatar0.png";
    currentAvatarImg.src = userData.avatar ?? defaultAvatar;

    // Guardar cambios en el perfil
    const form = document.getElementById("profileData");

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const usernameValue = inputUsername.value.trim();

        if (/\s/.test(usernameValue)) {
            alert("El nombre de usuario no puede contener espacios.");
            return;
        }

        userData.username = usernameValue;
        userData.name = inputName.value.trim();
        userData.lastName = inputLastname.value.trim();
        userData.email = inputEmail.value.trim();
        userData.phone = inputPhone.value.trim();

        updateUserData(userData.id, userData);

        const userNameDisplay = document.getElementById("userNameDisplay");
        if (userNameDisplay) userNameDisplay.textContent = userData.username;

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
            userData.avatar = selectedAvatar;
            updateUserData(userData.id, userData);

            const userAvatarMini = document.getElementById("userAvatarMini");
            if (userAvatarMini) userAvatarMini.src = selectedAvatar;

            avatarOptions.forEach((opt) => opt.classList.remove("selected"));
            option.classList.add("selected");

            closeModal();
        });
    });

    btnResetAvatar.addEventListener("click", () => {
        currentAvatarImg.src = defaultAvatar;
        userData.avatar = defaultAvatar;
        updateUserData(userData.id, userData);

        const userAvatarMini = document.getElementById("userAvatarMini");
        if (userAvatarMini) userAvatarMini.src = defaultAvatar;

        alert("Avatar restablecido al predeterminado.");
    });
});
