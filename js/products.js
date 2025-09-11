// Función que obtiene el parámetro de búsqueda de la URL  (QueryParam "search") 
function getSearchQueryParam() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("search");
}

// Función que obtiene los productos de una categoría por su ID
async function fetchProductsByCatID(id) {
    const jsonData = await getJSONData(PRODUCTS_URL + id + EXT_TYPE);
    if (jsonData.status === "error") {
        console.error("fetchProductsByCatID() - error: ", jsonData.data);
        return null;
    }
    return jsonData?.data?.products ?? [];
}

// Función que obtiene la información de una categoría por su ID
async function fetchCategoryByID(id) {
    const jsonData = await getJSONData(CATEGORIES_URL);
    if (jsonData.status === "error") {
        console.error("fetchCategoryByID() - error: ", jsonData.data);
        return null;
    }
    return jsonData?.data?.find(cat => cat.id === parseInt(id)) ?? null;
}

// Función que obtiene todos los productos de todas las categorías
async function fetchAllProducts() {
    const allCategoriesData = await getJSONData(CATEGORIES_URL);
    if (allCategoriesData.status === "error") {
        console.error("fetchAllProducts() - error: ", allCategoriesData.data);
        return [];
    }
    const allCategories = allCategoriesData?.data ?? [];
   
    const productsArrays = await Promise.all(
        allCategories.map(category => fetchProductsByCatID(category.id))
    );

    return productsArrays.flat();
}

// Función que filtra y muestra los productos según el término de búsqueda (searchTerm -> QueryParam "search")
async function displaySearchProducts(searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const searchProducts = await fetchAllProducts().then(products => {
        return products.filter(product => {
            return lowerSearchTerm.length === 0 ||
                (product.name.toLowerCase().includes(lowerSearchTerm)) ||
                (product.description.toLowerCase().includes(lowerSearchTerm));
        });
    });
    displayProducts(searchProducts);
}


// Función que muestra los productos de una categoría específica (catID -> localStorage "catID")
async function displayCategoryProducts() {

    const catID = localStorage.getItem("catID");
    if (!catID) {
        console.error("displayProducts() - error: no category ID found");
        document.getElementById("category").textContent = "Categoría no encontrada";
        document.getElementById("categoryDescription").textContent = "";
        return;
    }

    const category = await fetchCategoryByID(catID);
    if (!category) {
        document.getElementById("category").textContent = "Categoría no encontrada";
        document.getElementById("categoryDescription").textContent = "";
        return;
    }

    document.getElementById("category").textContent = category.name;
    document.getElementById("categoryDescription").textContent = category.description;

    const products = await fetchProductsByCatID(catID);
    if (products === null) {
        console.error("displayProducts() - error: error loading products for category ID", catID);
        let msg = document.createElement("p");
        msg.textContent = "Error al cargar los productos de la categoría.";
        container.appendChild(msg);
        return;
    }

    displayProducts(products);

}

// Función que muestra los productos seleccionados (productos por categoría o por búsqueda) 
// en el contenedor HTML
async function displayProducts(products) {
    try {
        const container = document.getElementById("products");
        container.innerHTML = "";


        if (products.length === 0) {
            let msg = document.createElement("p");
            msg.textContent = "No se encontraron productos.";
            container.appendChild(msg);
            return;
        }

        products.forEach((product) => {
            const productDiv = document.createElement("div");
            productDiv.id = product.id;
            productDiv.className = "product";
            productDiv.onclick = () => {
                localStorage.setItem("productID", product.id);
                window.location.href = `product-info.html?id=${product.id}`;
            };

            const name = product.name ?? "";
            const image = product.image ?? "";
            const description = product.description ?? "";
            const cost = product.cost ?? 0;
            const currency = product.currency ?? "$";
            const soldCount = product.soldCount ?? 0;

            const imgElement = document.createElement("img");
            imgElement.src = image;
            imgElement.alt = name;

            const productInfoDiv = document.createElement("div");
            productInfoDiv.className = "product-info";

            const nameElement = document.createElement("h4");
            nameElement.textContent = name;

            const descElement = document.createElement("p");
            descElement.textContent = description;

            const costElement = document.createElement("p");
            costElement.textContent = `${currency} ${cost}`;

            const soldCountElement = document.createElement("span");
            soldCountElement.textContent = `${soldCount} ${(soldCount === 1) ? ' Vendido' : ' Vendidos'}`;

            const nameDescriptionInfoDiv = document.createElement("div");
            nameDescriptionInfoDiv.className = "product-name-description";

            const soldPriceInfoDiv = document.createElement("div");
            soldPriceInfoDiv.className = "product-sold-price";

            nameDescriptionInfoDiv.appendChild(nameElement);
            nameDescriptionInfoDiv.appendChild(descElement);
            soldPriceInfoDiv.appendChild(soldCountElement);
            soldPriceInfoDiv.appendChild(costElement);

            productInfoDiv.appendChild(nameDescriptionInfoDiv);
            productInfoDiv.appendChild(soldPriceInfoDiv);

            productDiv.appendChild(imgElement);
            productDiv.appendChild(productInfoDiv);

            container.appendChild(productDiv);
        });
    } catch (error) {
        console.error("displayProducts() - error: ", error);
    }
}

// Al cargar la página, verifico si hay un parámetro de búsqueda en la URL
// Si lo hay, muestro los productos que coinciden con la búsqueda (QueryParam "search")
// Si no lo hay, muestro los productos de la categoría seleccionada (localStorage "catID")
document.addEventListener("DOMContentLoaded", async () => {

    const searchQuery = getSearchQueryParam();
    if (searchQuery !== null) {
        document.getElementById("search").value = searchQuery;
        document.getElementById("category-info").style.display = "none";
        await displaySearchProducts(searchQuery);
        return;
    }

    await displayCategoryProducts();
});


// CAMBIAR ENTRE MODO LISTA Y GRID
const checkbox = document.getElementById('list-grid');
const icon = document.getElementById('icon-list-grid');
const products = document.getElementById('products');

function updateIcon() {
    products.classList.remove('list-view');
    products.classList.remove('grid-view');

    products.classList.add(checkbox.checked ? 'list-view' : 'grid-view');

    icon.textContent = checkbox.checked ? 'grid_view' : 'view_list';
}

checkbox.addEventListener('change', updateIcon);

updateIcon();
