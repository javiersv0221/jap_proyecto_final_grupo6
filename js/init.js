const URL_BASE = "http://localhost:3000/";

const CATEGORIES_URL = URL_BASE + "categories/";
const PRODUCTS_URL = URL_BASE + "products/";
const PRODUCT_INFO_URL = URL_BASE + "products/";
const PRODUCT_INFO_COMMENTS_URL = URL_BASE + "comments/";
const CART_INFO_URL = URL_BASE + "cart/";

const PUBLISH_PRODUCT_URL = URL_BASE + "emercado-api/sell/publish.json";
const CART_BUY_URL = URL_BASE + "emercado-api/cart/buy.json";

const searchInput = document.getElementById("search");
const searchButton = document.getElementById("search-button");
const defaultUser = {
    id: 1,
    username: "vero",
    password: "vero123",
    name: "Vero",
    lastName: "Alvez",
    email: "vero@gmail.com",
    phone: "092345678",
    avatar: "img/avatars/avatar0.png",
}

if (searchButton) {
    function handleSearch() {
        const query = searchInput.value.trim();
        window.location.href = `products.html?search=${query ? encodeURIComponent(query) : ""}`;
    }

    searchButton.addEventListener("click", handleSearch);
    searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            handleSearch();
        }
    });

}

let showSpinner = function () {
    document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function () {
    document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function (url) {
    let result = {};
    showSpinner();
    return fetch(url)
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw Error(response.statusText);
            }
        })
        .then(function (response) {
            result.status = 'ok';
            result.data = response;
            hideSpinner();
            return result;
        })
        .catch(function (error) {
            result.status = 'error';
            result.data = error;
            hideSpinner();
            return result;
        });
}

// MODO CLARO/OSCURO
const body = document.body;
const toggleBtn = document.getElementById("toggle-theme");
if (toggleBtn) {
    const toggleIcon = toggleBtn.querySelector(".material-icons");

    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        body.classList.add("dark-mode");
        toggleIcon.textContent = "light_mode";
    }

    function toggleTheme() {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        toggleIcon.textContent = isDark ? "light_mode" : "dark_mode";
    }

    toggleIcon.textContent = body.classList.contains("dark-mode")
        ? "light_mode"
        : "dark_mode";

    toggleBtn.addEventListener("click", toggleTheme);
}

// MENU HAMBURGUESA
const navBtn = document.querySelector(".navbar-toggle");
if (navBtn) {
    const nav = document.querySelector("nav");

    navBtn.addEventListener("click", () => {
        nav.classList.toggle("show");
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const usersStr = localStorage.getItem("users");
    if (!usersStr || JSON.parse(usersStr).length === 0) {
        localStorage.setItem("users", JSON.stringify([defaultUser]));
    }
    const isLoggedIn = localStorage.getItem("session") !== null;
    const path = window.location.pathname;
    const isLoginPage = path.includes("login.html");
    const isRegisterPage = path.includes("register.html");
    if (!isLoginPage && !isRegisterPage && !isLoggedIn) {
        window.location.href = "login.html";
    }else if ((isLoginPage || isRegisterPage) && isLoggedIn) {
        window.location.href = "index.html";
    }
});
document.addEventListener("DOMContentLoaded", () => {
    const sessionData = JSON.parse(localStorage.getItem("session")) || {};
    const userMenuBtn = document.getElementById("userMenuBtn");
    const dropdown = document.getElementById("userDropdown");
    const userAvatarMini = document.getElementById("userAvatarMini");
    const userNameDisplay = document.getElementById("userNameDisplay");
    const logoutBtn = document.getElementById("logoutBtn");

    if (!sessionData.id) return;

    const userData = getCurrentUserData(sessionData.id);


    userNameDisplay.textContent = userData.username;
    if (userData.avatar) userAvatarMini.src = userData.avatar;


    userMenuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        dropdown.classList.toggle("hidden");
    });

    // Cerrar sesión
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("session");
        window.location.href = "login.html";
    });

    // Cerrar menú si se hace clic fuera
    document.addEventListener("click", (e) => {
        if (!userMenuBtn.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });
});

function getSessionId() {
    const sessionData = localStorage.getItem("session");

    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            return session.id;
        } catch (e) {
            console.error("Error parsing session data:", e);
            return null;
        }
    }
}

function getUserData(idUser) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.id === idUser);
    return user || null;
}

function getCurrentUserData() {
    const id = getSessionId();
    if (id === null) return null;
    return getUserData(id);
}

function updateUserData(idUser, newData) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const userIndex = users.findIndex(u => u.id === idUser);
    if (userIndex !== -1) {
        users[userIndex] = {...users[userIndex], ...newData};
        localStorage.setItem("users", JSON.stringify(users));
    }
}

function getCartKey() {
  const sessionId = getSessionId();
  return sessionId ? `cart_${sessionId}` : "cart_guest";
}

function loadUserCart() {
  try {
    return JSON.parse(localStorage.getItem(getCartKey()) || "[]");
  } catch {
    return [];
  }
}

function saveUserCart(cart) {
  localStorage.setItem(getCartKey(), JSON.stringify(cart));
}

// Actualiza el <span id="cart-badge"> con la suma de cantidades del carrito.
window.renderCartBadge = function renderCartBadge() {
    try {
        const el = document.getElementById("cart-badge");
        if (!el) return;
        const cart = loadUserCart();
        const count = Array.isArray(cart) ? cart.length : 0;
        el.textContent = String(count);
    } catch (e) {
        const el = document.getElementById("cart-badge");
        if (el) el.textContent = "0";
    }
};

// Actualizo el badge al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.renderCartBadge === 'function') window.renderCartBadge();
});

// Si el carrito se modifica en otra pestaña, actualizar aquí también
window.addEventListener('storage', (e) => {
    // actualizar sólo si cambia la clave del carrito del usuario o cualquier cart_ clave
    const key = e.key;
    if (!key) return;
    if (key.startsWith('cart_') || key === 'cart_guest') {
        if (typeof window.renderCartBadge === 'function') window.renderCartBadge();
    }
});
