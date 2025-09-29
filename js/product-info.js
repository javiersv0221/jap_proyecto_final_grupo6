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
  const prodComments = Array.isArray(localComments[id]) ? localComments[id] : [];
  return apiComments.concat(prodComments);
}

async function addProductComment(id, comment) {
  const localComments = JSON.parse(localStorage.getItem("comments")) || {};
  const prodComments = Array.isArray(localComments[id]) ? localComments[id] : [];
  comment.dateTime = new Date().toISOString();
  comment.user = getSessionUsername();
  prodComments.push(comment);
  localComments[id] = prodComments;
  localStorage.setItem("comments", JSON.stringify(localComments));
}


//   UTILIDADES

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

//   RENDER PRODUCTO

function renderProductInfo(product) {
  const container = document.getElementById("product-info");
  if (!container || !product) return;
  clearElement(container);

  const title = document.getElementById("product-title");
  title.textContent = product.name ?? "Nombre del producto no disponible";

  // Galería
  const gallery = document.createElement("div");
  gallery.id = "product-gallery";
  gallery.innerHTML = `
        <div class="h-gallery"><div id="h-strip" class="h-strip"></div></div>
    `;

  // Detalles
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

  details.append(sold, price, descTitle, desc);
  container.append(gallery, details);

  createGallery(product.images, product.name);
}


//   RENDER RELACIONADOS

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

    // evento: cambiar producto relacionado
    item.addEventListener("click", () => {
      if (p && p.id !== undefined) {
        window.location.href = `product-info.html?id=${p.id}`;
      }
    });
  });

  container.appendChild(list);
}


//   RENDER COMENTARIOS

function renderProductComments(comments) {
  comments = comments.sort(
    (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
  );

  const container = document.getElementById("comment");
  if (!container) return;
  clearElement(container);

  if (!Array.isArray(comments) || comments.length === 0) {
    const noCom = document.createElement("p");
    noCom.textContent = "No hay comentarios para este producto.";
    container.appendChild(noCom);
    return;
  }

  const list = document.createElement("div");
  list.className = "comments-container";

  comments.forEach((c) => {
    const item = document.createElement("div");

    // Header
    const header = document.createElement("div");
    const userStrong = document.createElement("strong");
    userStrong.textContent = c.user ?? "Anónimo";
    header.appendChild(userStrong);

    const dateSpan = document.createElement("span");
    dateSpan.textContent = " — " + (c.dateTime ?? "");
    header.appendChild(dateSpan);

    // Score
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

    // Texto
    const descP = document.createElement("p");
    descP.textContent = c.description ?? "";

    item.appendChild(header);
    item.appendChild(scoreP);
    item.appendChild(descP);

    list.appendChild(item);
  });

  container.appendChild(list);
}


//   INICIALIZACIÓN

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
  renderRelatedProducts(product.relatedProducts ?? []);

  // Obtener y renderizar comentarios iniciales
  const comments = await fetchProductCommentsByProductID(id);
  renderProductComments(comments ?? []);
})();


//   FORMULARIO DE COMENTARIOS

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("comment-form");
  if (!form) return;

  let selectedScore = 0;
  const stars = form.querySelectorAll(".star");

  // Hover progresivo
  stars.forEach((star, index) => {
    star.addEventListener("mouseover", () => {
      stars.forEach((s, i) => {
        s.classList.toggle("hovered", i <= index);
      });
    });

    star.addEventListener("mouseout", () => {
      stars.forEach((s, i) => {
        s.classList.toggle("hovered", i < selectedScore);
      });
    });

    // Click (selección fija)
    star.addEventListener("click", () => {
      selectedScore = index + 1;
      stars.forEach((s, i) => {
        s.classList.toggle("selected", i < selectedScore);
      });
    });
  });

  // Submit del form
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = new URLSearchParams(window.location.search).get("id");
    const text = document.getElementById("comment-text").value.trim();

    if (!text || selectedScore === 0) {
      alert("Debes escribir un comentario y elegir una puntuación");
      return;
    }

    const newComment = {
      description: text,
      score: selectedScore,
    };

    await addProductComment(id, newComment);

    // Refrescar comentarios
    const updated = await fetchProductCommentsByProductID(id);
    renderProductComments(updated);

    // Reset
    form.reset();
    selectedScore = 0;
    stars.forEach((s) => s.classList.remove("selected", "hovered"));
  });
});
