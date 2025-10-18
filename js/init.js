const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

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
    const isLoggedIn = localStorage.getItem("session") !== null;
    if (!window.location.pathname.includes("login.html") && !isLoggedIn) {
        window.location.href = "login.html";
    } else if (window.location.pathname.includes("login.html") && isLoggedIn) {
        window.location.href = "index.html";
    }
});
// MUESTRO NOMBRE DE USUARIO EN EL ICONO DE USUARIO
document.addEventListener("DOMContentLoaded", () => {
    const username = getSessionUsername();
    if (username) {
        const userAccountBtn = document.getElementById("userAccount");

        if (userAccountBtn) {
            userAccountBtn.innerHTML = `
          <span class="material-icons header-span">account_circle</span>
          <p>${username}</p>
        `;
        }
    }
});

function getSessionUsername() {
    const sessionData = localStorage.getItem("session");
    if (sessionData) {
        try {
            const session = JSON.parse(sessionData);
            return session.username ?? "-";
        } catch (e) {
            console.error("Error parsing session data:", e);
            return null;
        }
    }
    return null;
}