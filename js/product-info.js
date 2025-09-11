async function fetchProductByID(id) {
    const jsonData = await getJSONData(PRODUCT_INFO_URL + id + EXT_TYPE);
    console.log(jsonData);
    if (jsonData.status === "error") {
        console.error("fetchProductByID() - error: ", jsonData.data);
        return null;
    }

    return jsonData?.data ?? null;
}

async function fetchProductCommentsByProductID(id) {
    const jsonData = await getJSONData(PRODUCT_INFO_COMMENTS_URL + id + EXT_TYPE);
    if (jsonData.status === "error") {
        console.error("fetchProductCommentsByProductID() - error: ", jsonData.data);
        return null;
    }

    return jsonData?.data ?? [];
}

// Funciones utilitarias
function clearElement(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
}

// Renderizado del producto (sin clases de diseño, solo estructura e ids relevantes)
function renderProductInfo(product) {
    const container = document.getElementById('product-info');
    if (!container || !product) return;
    clearElement(container);

    const card = document.createElement('div');
    const cardBody = document.createElement('div');

    const title = document.createElement('h2');
    title.textContent = product.name;

    const priceP = document.createElement('p');
    const priceStrong = document.createElement('strong');
    priceStrong.textContent = 'Precio: ';
    priceP.appendChild(priceStrong);
    priceP.appendChild(document.createTextNode(`${product.currency} ${product.cost}`));

    const catP = document.createElement('p');
    const catStrong = document.createElement('strong');
    catStrong.textContent = 'Categoría: ';
    catP.appendChild(catStrong);
    catP.appendChild(document.createTextNode(product.category + ' '));

    const soldStrong = document.createElement('strong');
    soldStrong.textContent = 'Vendidos: ';
    catP.appendChild(soldStrong);
    catP.appendChild(document.createTextNode(String(product.soldCount)));

    const descP = document.createElement('p');
    descP.textContent = product.description;

    cardBody.appendChild(title);
    cardBody.appendChild(priceP);
    cardBody.appendChild(catP);
    cardBody.appendChild(descP);
    card.appendChild(cardBody);
    container.appendChild(card);

    // Galería de imágenes (estructura simple)
    if (Array.isArray(product.images) && product.images.length) {
        const gallery = document.createElement('div');

        product.images.forEach(src => {
            const item = document.createElement('div');

            const link = document.createElement('a');
            link.href = src;
            link.target = '_blank';
            link.rel = 'noopener';

            const img = document.createElement('img');
            img.src = src;
            img.alt = product.name;

            link.appendChild(img);
            item.appendChild(link);
            gallery.appendChild(item);
        });

        container.appendChild(gallery);
    }
}

// Renderizado de productos relacionados (solo estructura, sin clases de diseño)
function renderRelatedProducts(related) {
    const container = document.getElementById('related-products');
    if (!container) return;
    clearElement(container);

    if (!Array.isArray(related) || related.length === 0) return;

    const title = document.createElement('h3');
    title.textContent = 'Productos relacionados';
    container.appendChild(title);

    const list = document.createElement('div');

    related.forEach((p) => {
        const item = document.createElement('div');

        const card = document.createElement('div');

        const img = document.createElement('img');
        img.src = p.image;
        img.alt = p.name;

        const cardBody = document.createElement('div');

        const h5 = document.createElement('h5');
        h5.textContent = p.name;

        cardBody.appendChild(h5);
        card.appendChild(img);
        card.appendChild(cardBody);
        item.appendChild(card);
        list.appendChild(item);

        // evento para cambiar producto relacionado con url params
        card.addEventListener('click', () => {
            if (p && p.id !== undefined) {
                window.location.href = `product-info.html?id=${p.id}`;
            }

        });

    });

    container.appendChild(list);
}

// Renderizado de comentarios (usa appendChild y textContent para seguridad)
function renderProductComments(comments) {
    const container = document.getElementById('comments');
    if (!container) return;
    clearElement(container);

    if (!Array.isArray(comments) || comments.length === 0) {
        // Si no hay comentarios, no mostrar nada (o mostrar un mensaje opcional)
        const noCom = document.createElement('p');
        noCom.textContent = 'No hay comentarios para este producto.';
        container.appendChild(noCom);
        return;
    }

    const title = document.createElement('h3');
    title.textContent = 'Comentarios';
    container.appendChild(title);

    const list = document.createElement('div');

    comments.forEach((c) => {
        const item = document.createElement('div');

        // Encabezado del comentario: usuario y fecha
        const header = document.createElement('div');
        const userStrong = document.createElement('strong');
        userStrong.textContent = c.user ?? 'Anónimo';
        header.appendChild(userStrong);

        const dateSpan = document.createElement('span');
        dateSpan.textContent = ' — ' + (c.dateTime ?? '');
        header.appendChild(dateSpan);

        // Puntuación (representada con estrellas de texto)
        const scoreP = document.createElement('p');
        const scoreStrong = document.createElement('strong');
        scoreStrong.textContent = 'Calificación: ';
        scoreP.appendChild(scoreStrong);

        const stars = document.createElement('span');
        const scoreNum = Number.isFinite(c.score) ? Math.max(0, Math.min(5, c.score)) : 0;
        stars.textContent = '★'.repeat(scoreNum) + '☆'.repeat(5 - scoreNum);
        scoreP.appendChild(stars);

        // Descripción del comentario
        const descP = document.createElement('p');
        descP.textContent = c.description ?? '';

        item.appendChild(header);
        item.appendChild(scoreP);
        item.appendChild(descP);

        list.appendChild(item);
    });

    container.appendChild(list);
}

// Inicialización: obtener id y renderizar usando appendChild
(async function initProductPage() {
    const id = URLSearchParams ? (new URLSearchParams(window.location.search)).get('id') : null;
    if (!id) {
        console.warn("No hay productID");
        return;
    }

    const product = await fetchProductByID(id);
    if (!product) {
        console.error("No se pudo obtener la información del producto.");
        return;
    }

    renderProductInfo(product);
    renderRelatedProducts(product.relatedProducts ?? []);

    // Obtener y renderizar comentarios
    const comments = await fetchProductCommentsByProductID(id);
    renderProductComments(comments ?? []);
})();