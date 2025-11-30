const URL_BASE = "http://localhost:3000/";

const LOGIN_URL = URL_BASE + "users/login";
const REGISTER_URL = URL_BASE + "users/register";
const USERS_URL = URL_BASE + "users";
const CATEGORIES_URL = URL_BASE + "categories";
const PRODUCTS_URL = URL_BASE + "products";
const PRODUCT_INFO_URL = URL_BASE + "products/";
const PRODUCT_INFO_COMMENTS_URL = URL_BASE + "comments/";
const CART_INFO_URL = URL_BASE + "cart";
const CART_BUY_URL = URL_BASE + "purchases";

const searchInput = document.getElementById("search");
const searchButton = document.getElementById("search-button");

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
    const spinner = document.getElementById("spinner-wrapper");
    if (spinner) spinner.style.display = "block";
}

let hideSpinner = function () {
    const spinner = document.getElementById("spinner-wrapper");
    if (spinner) spinner.style.display = "none";
}

let getJSONData = async function (url, method = 'GET', data = null) {
    let result = {};
    showSpinner();

    let headers = { 'Content-Type': 'application/json' };
    const token = localStorage.getItem("token");
    if (token) headers['Authorization'] = `Bearer ${token}`;

    let options = {
        method: method,
        headers: headers
    };

    if (data) options.body = JSON.stringify(data);

    try {
        const response = await fetch(url, options);
        let responseData;
        try {
            responseData = await response.json();
        } catch (e) {
            responseData = null;
        }

        if (response.ok) {
            result.status = 'ok';
            result.data = responseData;
        } else {
            result.status = 'error';
            result.data = responseData || { message: response.statusText };
        }
    } catch (error) {
        result.status = 'error';
        result.data = { message: error.message };
    }

    hideSpinner();
    return result;
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
        if(toggleIcon) toggleIcon.textContent = "light_mode";
    }

    function toggleTheme() {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");
        localStorage.setItem("theme", isDark ? "dark" : "light");
        if(toggleIcon) toggleIcon.textContent = isDark ? "light_mode" : "dark_mode";
    }

    if(toggleIcon) toggleIcon.textContent = body.classList.contains("dark-mode") ? "light_mode" : "dark_mode";
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

// Verificación de Sesión y Usuario
document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");
    const path = window.location.pathname;
    const isLoginPage = path.includes("login.html") || path.includes("register.html");

    if (!token && !isLoginPage) {
        window.location.href = "login.html";
    } else if (token && isLoginPage) {
        window.location.href = "index.html";
    }

    // Mostrar usuario
    const userNameDisplay = document.getElementById("userNameDisplay");
    const logoutBtn = document.getElementById("logoutBtn");
    const storedUsername = localStorage.getItem("username");

    if (userNameDisplay && storedUsername) {
        userNameDisplay.textContent = storedUsername;
    }

    const userMenuBtn = document.getElementById("userMenuBtn");
    const dropdown = document.getElementById("userDropdown");

    if (userMenuBtn && dropdown) {
        userMenuBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("hidden");
        });
        document.addEventListener("click", (e) => {
            if (!userMenuBtn.contains(e.target)) {
                dropdown.classList.add("hidden");
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.clear();
            window.location.href = "login.html";
        });
    }
});