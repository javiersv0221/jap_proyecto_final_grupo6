async function fetchProductByID(id) {
    const jsonData = await getJSONData(PRODUCT_INFO_URL + id + EXT_TYPE);
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

    const apiComments = jsonData?.data ?? [];
    const localComments = JSON.parse(localStorage.getItem("comments")) || {};
    const prodComments = Array.isArray(localComments[id])
        ? localComments[id]
        : [];
    return apiComments.concat(prodComments);
}

/**
 * Formatea una fecha en formato "DD-MM-YYYY HH:mm:ss".
 */
function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);

    // Si la fecha no es válida, se devuelve la cadena original
    if (isNaN(date.getTime())) return dateString;

    // Extraer los componentes de la fecha y hora
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

async function addProductComment(id, comment) {
    const localComments = JSON.parse(localStorage.getItem("comments")) || {};
    const prodComments = Array.isArray(localComments[id])
        ? localComments[id]
        : [];
    comment.dateTime = new Date().toISOString();
    comment.user = getCurrentUserData().username;
    prodComments.push(comment);
    localComments[id] = prodComments;
    localStorage.setItem("comments", JSON.stringify(localComments));
}

// Funciones utilitarias
function clearElement(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
}

function createGallery(images, productName) {
    const strip = document.getElementById("h-strip");
    clearElement(strip);

    const list = Array.isArray(images) && images.length ? images : [];

    list.forEach((src, i) => {
        const fig = document.createElement("figure");
        fig.className = "h-item";
        const img = document.createElement("img");
        img.src = src;
        img.alt = `${productName || "Producto"} - Imagen ${i + 1}`;
        img.onerror = function () {
            this.src =
                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="450" height="340"><rect width="450" height="340" fill="%23f5f5f5"/><text x="225" y="170" text-anchor="middle" dy=".35em" fill="%23666" font-family="Arial" font-size="14">IMAGEN NO DISPONIBLE</text></svg>';
        };
        fig.appendChild(img);
        strip.appendChild(fig);
    });
}

const MAX_QTY_PER_PURCHASE = 5;

function createPurchaseCard(product) {
    const purchase = document.createElement("div");
    purchase.className = "purchase-card";

    const row = document.createElement("div");
    row.className = "purchase-row";

    const label = document.createElement("span");
    label.className = "purchase-label";
    label.textContent = "Cantidad:";

    //MENU DESPLEGABLE DE CANTIDAD
    const qtySelect = document.createElement("select");
    qtySelect.id = "qty-select";
    qtySelect.className = "purchase-qty-select";
    for (let i = 1; i <= MAX_QTY_PER_PURCHASE; i++) {
        const opt = document.createElement("option");
        opt.value = String(i);
        opt.textContent = i === 1 ? "1 unidad" : `${i} unidades`;
        qtySelect.appendChild(opt);
    }
    row.append(label, qtySelect);

    const actions = document.createElement("div");
    actions.className = "purchase-actions";

    const buyNow = document.createElement("button");
    buyNow.type = "button";
    buyNow.id = "buy-now-btn";
    buyNow.className = "btn-secondary";
    buyNow.innerHTML = `<span class="material-icons">shopping_cart_checkout</span>
    Comprar ahora`;

    //BOTON AGREGAR AL CARRITO
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.id = "buy-btn";
    addBtn.className = "btn-primary";
    addBtn.innerHTML = `<span class="material-icons">add_shopping_cart</span>
    Agregar al carrito`;

    actions.append(buyNow, addBtn);

    purchase.append(row, actions);
    return purchase;
}

// Renderizado del producto
function renderProductInfo(product) {
    const container = document.getElementById("product-info");
    if (!container || !product) return;
    clearElement(container);

    const title = document.getElementById("product-title");
    title.textContent = product.name ?? "Nombre del producto no disponible";

    // Galería de imágenes (estructura simple)
    const gallery = document.createElement("div");
    gallery.id = "product-gallery";
    gallery.innerHTML = `
    <div class="h-gallery"><div id="h-strip" class="h-strip"></div></div>
  `;

    // Panel derecha
    const details = document.createElement("div");
    details.className = "product-details";

    const sold = document.createElement("p");
    sold.className = "product-sold-count";
    sold.textContent = `${product.soldCount ?? "000"} vendidos`;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = `${product.currency} ${product.cost}`;

    const descTitle = document.createElement("h3");
    descTitle.className = "product-description-title";
    descTitle.textContent = "Descripción del producto";

    const desc = document.createElement("p");
    desc.id = "product-description-text";
    desc.textContent = product.description ?? "";

    details.append(sold, price, descTitle, desc, createPurchaseCard(product));
    container.append(gallery, details);

    createGallery(product.images, product.name);
}

// Renderizado de productos relacionados
function renderRelatedProducts(related) {
    const container = document.getElementById("related-products");
    if (!container) return;
    clearElement(container);

    if (!Array.isArray(related) || related.length === 0) return;

    const title = document.createElement("h3");
    title.className = "related-products-title";
    title.textContent = "Productos relacionados";
    container.appendChild(title);

    const list = document.createElement("div");
    list.className = "related-products-container";
    related.forEach((p) => {
        const item = document.createElement("div");
        item.className = "related-product-item";
        const img = document.createElement("img");
        img.className = "related-product-image";
        img.src = p.image;
        img.alt = p.name;
        const info = document.createElement("div");
        info.className = "related-product-info";
        const name = document.createElement("h5");
        name.className = "related-product-name";
        name.textContent = p.name;
        info.appendChild(name);
        item.append(img, info);
        list.appendChild(item);

        // evento para cambiar producto relacionado con url params
        item.addEventListener("click", () => {
            if (p && p.id !== undefined) {
                window.location.href = `product-info.html?id=${p.id}`;
            }
        });
    });

    container.appendChild(list);
}

// Manejar envío del formulario de comentarios
function setupCommentForm(productId) {
    const form = document.getElementById("comment-form");
    if (!form) return;

    const stars = form.querySelectorAll(".star");
    let selectedScore = 0;

    stars.forEach((star) => {
        star.addEventListener("mouseenter", () => {
            stars.forEach((s) => {
                s.classList.toggle(
                    "hovered",
                    parseInt(s.dataset.value) <= parseInt(star.dataset.value)
                );
            });
        });

        star.addEventListener("mouseleave", () => {
            stars.forEach((s) => s.classList.remove("hovered"));
        });

        star.addEventListener("click", () => {
            selectedScore = parseInt(star.dataset.value);
            stars.forEach((s) => {
                s.classList.toggle(
                    "selected",
                    parseInt(s.dataset.value) <= selectedScore
                );
            });
        });
    });

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const text = document.getElementById("comment-text").value.trim();
        if (!text || selectedScore === 0) {
            alert("Por favor completa el comentario y selecciona una puntuación.");
            return;
        }

        const newComment = {
            description: text,
            score: selectedScore,
        };

        await addProductComment(productId, newComment);

        form.reset();
        stars.forEach((s) => s.classList.remove("selected"));
        selectedScore = 0;

        const comments = await fetchProductCommentsByProductID(productId);
        renderProductComments(comments ?? []);
    });
}

// Renderizado de comentarios
function renderProductComments(comments) {
    const listContainer = document.getElementById("comment");
    if (!listContainer) return;

    clearElement(listContainer);

    listContainer.classList.add("comments-container");

    if (!Array.isArray(comments) || comments.length === 0) {
        const noCom = document.createElement("p");
        noCom.textContent = "No hay comentarios para este producto.";
        listContainer.appendChild(noCom);
        return;
    }

    comments
        .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
        .forEach((c) => {
            const item = document.createElement("div");

            const header = document.createElement("div");
            const userStrong = document.createElement("strong");
            userStrong.textContent = c.user ?? "Anónimo";
            header.appendChild(userStrong);

            const dateSpan = document.createElement("span");
            dateSpan.textContent = " — " + formatDate(c.dateTime);
            header.appendChild(dateSpan);

            const scoreP = document.createElement("p");
            const scoreStrong = document.createElement("strong");
            scoreStrong.textContent = "Calificación: ";
            scoreP.appendChild(scoreStrong);

            const stars = document.createElement("span");
            const scoreNum = Number.isFinite(c.score)
                ? Math.max(0, Math.min(5, c.score))
                : 0;
            stars.textContent = "★".repeat(scoreNum) + "☆".repeat(5 - scoreNum);
            scoreP.appendChild(stars);

            const descP = document.createElement("p");
            descP.textContent = c.description ?? "";

            item.appendChild(header);
            item.appendChild(scoreP);
            item.appendChild(descP);

            listContainer.appendChild(item);
        });
}

function setupPurchaseControls(product) {
  const buyBtn = document.getElementById("buy-btn");
  const qtySelect = document.getElementById("qty-select");
  if (!buyBtn || !product) return;

  buyBtn.addEventListener("click", () => {
    const quantity = Math.max(1, Number(qtySelect?.value || 1));
    const item = {
      id: product.id,
      name: product.name,
      price: Number(product.cost || 0),
      currency: product.currency || "USD",
      image: Array.isArray(product.images) && product.images[0] ? product.images[0] : "",
      quantity
    };

    const cart = (typeof loadUserCart === "function")
      ? loadUserCart()
      : JSON.parse(localStorage.getItem("cart") || "[]");

    const idx = cart.findIndex(p => String(p.id) === String(item.id));
    if (idx !== -1) {
      cart[idx].quantity = (Number(cart[idx].quantity) || 1) + item.quantity;
    } else {
      cart.push(item);
    }

    if (typeof saveUserCart === "function") saveUserCart(cart);
    else localStorage.setItem("cart", JSON.stringify(cart));
  });
}


// Inicialización: obtener id y renderizar usando appendChild
(async function initProductPage() {
    const id = URLSearchParams
        ? new URLSearchParams(window.location.search).get("id")
        : null;
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
    setupPurchaseControls(product); 
    renderRelatedProducts(product.relatedProducts ?? []);

    const comments = await fetchProductCommentsByProductID(id);
    renderProductComments(comments ?? []);
    
    setupCommentForm(id);
})();


function ensureInlineCheckoutPanel() {
  if (document.getElementById("checkout-inline")) return;

  const panel = document.createElement("section");
  panel.id = "checkout-inline";
  panel.className = "checkout-inline hidden";
  panel.innerHTML = `
    <h2>Finalizar compra</h2>
    <div id="inline-summary" class="inline-summary"></div>

    <form id="inline-form" class="inline-form">
      <fieldset>
        <legend>Datos de envío (ficticios)</legend>
        <label>Nombre y apellido
          <input type="text" name="fullname" required />
        </label>
        <label>Email
          <input type="email" name="email" required />
        </label>
        <label>Dirección
          <input type="text" name="address" required />
        </label>
        <div class="grid-2">
          <label>Ciudad
            <input type="text" name="city" required />
          </label>
          <label>Código Postal
            <input type="text" name="zip" required />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Pago (ficticio)</legend>
        <label>Número de tarjeta
          <input type="text" name="card" inputmode="numeric" maxlength="19" placeholder="0000 0000 0000 0000" required />
        </label>
        <div class="grid-2">
          <label>Vencimiento
            <input type="text" name="exp" placeholder="MM/AA" required />
          </label>
          <label>CVC
            <input type="text" name="cvc" inputmode="numeric" maxlength="4" required />
          </label>
        </div>
      </fieldset>

      <button type="submit" class="btn-primary" id="inline-pay">Pagar</button>
    </form>

    <div id="inline-success" class="inline-success hidden">
      <h3>¡Gracias por tu compra!</h3>
      <p>Esta operación es una simulación con fines educativos.</p>
      <button id="inline-ok" class="btn-secondary">Aceptar</button>
    </div>
  `;

  const details = document.querySelector(".product-details, #product-details");
  if (details) details.appendChild(panel);

  const form = panel.querySelector("#inline-form");
  const success = panel.querySelector("#inline-success");
  const payBtn = panel.querySelector("#inline-pay");
  const okBtn = panel.querySelector("#inline-ok");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    payBtn.disabled = true;
    payBtn.textContent = "Procesando...";
    setTimeout(() => {
      payBtn.disabled = false;
      payBtn.textContent = "Pagar";
      form.classList.add("hidden");
      success.classList.remove("hidden");
    }, 900);
  });

  okBtn.addEventListener("click", () => {
    panel.classList.add("hidden");
    form.reset();
    form.classList.remove("hidden");
    success.classList.add("hidden");
  });
}

function openInlineCheckout({ name, price, currency, image, quantity }) {
  ensureInlineCheckoutPanel();
  const panel = document.getElementById("checkout-inline");
  const summary = document.getElementById("inline-summary");
  const total = (Number(price) || 0) * (Number(quantity) || 1);

   // Limpiar el contenido anterior
  summary.innerHTML = "";
  // Crear el contenedor principal
  const rowDiv = document.createElement("div");
  rowDiv.className = "summary-row";
  // Crear la imagen de forma segura
  const img = document.createElement("img");
  img.src = image || "";
  img.alt = name;
  rowDiv.appendChild(img);
  // Crear el contenedor de texto
  const textDiv = document.createElement("div");
  // Nombre del producto
  const nameStrong = document.createElement("strong");
  nameStrong.textContent = name;
  textDiv.appendChild(nameStrong);
  // Precio y cantidad
  const priceDiv = document.createElement("div");
  priceDiv.textContent = `${currency} ${Number(price).toLocaleString()} × ${quantity}`;
  textDiv.appendChild(priceDiv);
  // Total
  const totalDiv = document.createElement("div");
  const totalStrong = document.createElement("strong");
  totalStrong.textContent = `Total: ${currency} ${total.toLocaleString()}`;
  totalDiv.appendChild(totalStrong);
  textDiv.appendChild(totalDiv);
  rowDiv.appendChild(textDiv);
  summary.appendChild(rowDiv);

  panel.classList.remove("hidden");
}


document.addEventListener("click", function(ev){
  const btn = ev.target && (ev.target.id === "buy-now-btn" ? ev.target : (ev.target.closest && ev.target.closest("#buy-now-btn")));
  if (!btn) return;

  const qtySel = document.getElementById("qty-select");
  const quantity = Math.max(1, Number((qtySel && qtySel.value) || 1));
  const titleEl = document.getElementById("product-title");
  const priceEl = document.querySelector(".product-price");
  const imgEl = document.querySelector("#h-strip img");

  const name = titleEl ? titleEl.textContent.trim() : "Producto";
  let currency = "USD";
  let price = 0;

  if (priceEl && priceEl.textContent) {
    const parts = priceEl.textContent.trim().split(/\s+/);
    if (parts.length >= 2) {
      currency = parts[0];
      const num = parts.slice(1).join("").replace(/\./g,"").replace(/,/g,"");
      price = Number(num) || Number(parts[1]) || 0;
    }
  }

  openInlineCheckout({
    name: name,
    price: price,
    currency: currency,
    image: imgEl ? imgEl.src : "",
    quantity: quantity
  });
});
