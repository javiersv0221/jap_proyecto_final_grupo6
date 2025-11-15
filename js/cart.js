// js/cart.js
(() => {
  // ===== Helpers de almacenamiento (compat con tus funciones globales) =====
  const loadUserCart = (typeof window.loadUserCart === "function")
    ? window.loadUserCart
    : () => JSON.parse(localStorage.getItem("cart") || "[]");

  const saveUserCart = (typeof window.saveUserCart === "function")
    ? window.saveUserCart
    : (cart) => localStorage.setItem("cart", JSON.stringify(cart));

  // ===== Cache de nodos =====
  const elEmpty        = document.getElementById("empty");
  const elList         = document.getElementById("cart-list");
  const elTotals       = document.getElementById("totals");
  const btnClear       = document.getElementById("clear-cart");
  const btnCheckout    = document.getElementById("checkout-btn");
  const checkoutPanel  = document.getElementById("checkout-inline");
  const inlineSummary  = document.getElementById("inline-summary-body");
  const inlineForm     = document.getElementById("inline-form");
  const inlinePay      = document.getElementById("inline-pay");
  const inlineSuccess  = document.getElementById("inline-success");
  const inlineOk       = document.getElementById("inline-ok");

  // ===== Utilidades =====
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const num = (v) => Number(v) || 0;
  const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

  function groupTotals(cart) {
    // { USD: number, UYU: number, ... }
    return cart.reduce((acc, it) => {
      const cur = it.currency || "USD";
      const line = num(it.price) * clamp(num(it.quantity), 1, 99);
      acc[cur] = (acc[cur] || 0) + line;
      return acc;
    }, {});
  }

  function setHidden(el, hidden = true) {
    if (!el) return;
    el.hidden = !!hidden;
  }

  // ===== Render de totales =====
  function renderTotals() {
    const cart = loadUserCart();
    elTotals.innerHTML = "";
    if (!cart.length) return;

    const groups = groupTotals(cart);
    Object.entries(groups).forEach(([cur, total]) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      row.innerHTML = `<span>Total (${cur})</span><span class="total">${cur} ${fmt(total)}</span>`;
      elTotals.appendChild(row);
    });

    if (Object.keys(groups).length > 1) {
      const note = document.createElement("p");
      note.style.opacity = ".8";
      note.style.marginTop = "8px";
      note.innerHTML = `<span class="material-icons" style="font-size:18px;vertical-align:middle;margin-right:6px;">info</span>
      Tenés artículos en distintas monedas; se muestran totales por moneda.`;
      elTotals.appendChild(note);
    }
  }

  // ===== Render de lista =====
  function renderList() {
    const cart = loadUserCart();
    elList.innerHTML = "";

    if (!Array.isArray(cart) || cart.length === 0) {
      setHidden(elEmpty, false);
      setHidden(btnClear, true);
      btnCheckout.disabled = true;
      return;
    }

    setHidden(elEmpty, true);
    setHidden(btnClear, false);
    btnCheckout.disabled = false;

    cart.forEach((it, idx) => {
      const item = document.createElement("div");
      item.className = "item";
      item.dataset.index = String(idx);

      const img = document.createElement("img");
      img.className = "thumb";
      img.src = it.image || "";
      img.alt = it.name || "Producto";

      const mid = document.createElement("div");

      const name = document.createElement("p");
      name.className = "name";
      name.textContent = it.name || "Producto";

      const price = document.createElement("div");
      price.className = "price";
      price.textContent = `${it.currency || "USD"} ${fmt(num(it.price))}`;

      const qty = document.createElement("div");
      qty.className = "qty";
      qty.innerHTML = `
        <span>Cantidad:</span>
        <input type="number" min="1" max="99" step="1" value="${clamp(num(it.quantity),1,99)}" aria-label="Cantidad">
      `;

      mid.appendChild(name);
      mid.appendChild(price);
      mid.appendChild(qty);

      const right = document.createElement("div");
      right.className = "actions";

      const sub = document.createElement("div");
      sub.style.minWidth = "140px";
      sub.style.textAlign = "right";
      const lineTotal = num(it.price) * clamp(num(it.quantity), 1, 99);
      sub.textContent = `${it.currency || "USD"} ${fmt(lineTotal)}`;
      sub.className = "line-subtotal";

      const del = document.createElement("button");
      del.className = "btn btn-danger";
      del.type = "button";
      del.innerHTML = `<span class="material-icons">delete</span>Quitar`;
      del.addEventListener("click", () => {
        const next = loadUserCart().filter((_, i) => i !== idx);
        saveUserCart(next);
        refresh();
      });

      // Vincular cambio de cantidad
      const qtyInput = qty.querySelector("input");
      qtyInput.addEventListener("change", () => {
        const v = clamp(num(qtyInput.value), 1, 99);
        qtyInput.value = v;
        const next = loadUserCart();
        next[idx].quantity = v;
        saveUserCart(next);
        // Actualizo subtotal de la fila y totales
        sub.textContent = `${it.currency || "USD"} ${fmt(v * num(it.price))}`;
        renderTotals();
        // Aseguro que el badge también se actualice al cambiar cantidades (si existe la función global)
        if (typeof window.renderCartBadge === 'function') window.renderCartBadge();
      });

      right.appendChild(sub);
      right.appendChild(del);

      item.appendChild(img);
      item.appendChild(mid);
      item.appendChild(right);

      elList.appendChild(item);
    });
  }

  // ===== Checkout ficticio =====
  function openCheckout() {
    const cart = loadUserCart();
    if (!cart.length) return;

    inlineSummary.innerHTML = "";

    cart.forEach((it) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      const left = document.createElement("div");
      left.textContent = `${it.name} × ${clamp(num(it.quantity), 1, 99)}`;
      const right = document.createElement("div");
      right.textContent = `${it.currency || "USD"} ${fmt(num(it.price) * clamp(num(it.quantity), 1, 99))}`;
      row.appendChild(left);
      row.appendChild(right);
      inlineSummary.appendChild(row);
    });

    // Separador y totales por moneda
    const hr = document.createElement("hr");
    hr.style.border = "none";
    hr.style.borderTop = "1px solid #2a2a2e";
    hr.style.margin = "10px 0";
    inlineSummary.appendChild(hr);

    const groups = groupTotals(cart);
    Object.entries(groups).forEach(([cur, total]) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      row.innerHTML = `<strong>Total (${cur})</strong><strong>${cur} ${fmt(total)}</strong>`;
      inlineSummary.appendChild(row);
    });

    setHidden(checkoutPanel, false);
    checkoutPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function closeCheckoutAndReset() {
    if (inlineForm) {
      inlineForm.reset();
      setHidden(inlineForm, false);
    }
    setHidden(inlineSuccess, true);
    setHidden(checkoutPanel, true);
  }

  // ===== Eventos globales =====
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (!confirm("¿Vaciar el carrito?")) return;
      saveUserCart([]);
      refresh();
    });
  }

  if (btnCheckout) {
    btnCheckout.addEventListener("click", openCheckout);
  }

  if (inlineForm) {
    inlineForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!inlinePay) return;

      inlinePay.disabled = true;
      const prevText = inlinePay.textContent;
      inlinePay.textContent = "Procesando...";

      // Simulación de pago
      setTimeout(() => {
        inlinePay.disabled = false;
        inlinePay.textContent = prevText;
        setHidden(inlineForm, true);
        setHidden(inlineSuccess, false);
        saveUserCart([]);
        refresh();
      }, 900);
    });
  }

  if (inlineOk) {
    inlineOk.addEventListener("click", () => {
      // Al “pagar”, limpiamos el carrito y cerramos checkout
      saveUserCart([]);
      closeCheckoutAndReset();
      refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // ===== Ciclo de render =====
  function refresh() {
    renderList();
    renderTotals();
    if (typeof window.renderCartBadge === 'function') window.renderCartBadge();
  }

  // Init (el script está con defer, el DOM ya está listo)
  refresh();
})();
