(function () {
  // =============================
  // Helpers de almacenamiento
  // =============================
  const loadUserCart =
    typeof window.loadUserCart === "function"
      ? window.loadUserCart
      : () => JSON.parse(localStorage.getItem("cart") || "[]");

  const saveUserCart =
    typeof window.saveUserCart === "function"
      ? window.saveUserCart
      : (cart) => localStorage.setItem("cart", JSON.stringify(cart));

  // =============================
  // Cache de nodos (UI)
  // =============================
  const elEmpty = document.getElementById("empty");
  const elList = document.getElementById("cart-list");
  const elTotals = document.getElementById("totals");
  const btnClear = document.getElementById("clear-cart");
  // Checkout DOM nodes (pueden no existir en todas las vistas)
  const btnCheckout = document.getElementById("checkout-btn");
  const checkoutPanel = document.getElementById("checkout-inline");
  const inlineSummary = document.getElementById("inline-summary-body");
  const inlineForm = document.getElementById("inline-form");
  const inlinePay = document.getElementById("inline-pay");
  const inlineSuccess = document.getElementById("inline-success");
  const inlineOk = document.getElementById("inline-ok");

  // COSTOS / ENVÍO (elementos opcionales en el DOM)
  const elCostSubtotal = document.getElementById("cost-subtotal");
  const elCostShipping = document.getElementById("cost-shipping");
  const elCostTotal = document.getElementById("cost-total");

  // Radios de envío (pueden no existir si el HTML no los tiene)
  const elShippingRadios = document.querySelectorAll("input[name='shipping']");

  // =============================
  // Utilidades
  // =============================
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  const num = (v) => Number(v) || 0;
  const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });

  function setHidden(el, hidden = true) {
    if (!el) return;
    el.hidden = !!hidden;
  }

  function groupTotals(cart) {
    return cart.reduce((acc, it) => {
      const cur = it.currency || "USD";
      const line = num(it.price) * clamp(num(it.quantity), 1, 99);
      acc[cur] = (acc[cur] || 0) + line;
      return acc;
    }, {});
  }

  // =============================
  // Render: totales y lista
  // =============================
  function renderTotals() {
    const cart = loadUserCart();
    if (!elTotals) return;
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

  function renderList() {
    const cart = loadUserCart();
    if (!elList) return;
    elList.innerHTML = "";

    if (!Array.isArray(cart) || cart.length === 0) {
      setHidden(elEmpty, false);
      setHidden(btnClear, true);
      if (btnCheckout) btnCheckout.disabled = true;
      return;
    }

    setHidden(elEmpty, true);
    setHidden(btnClear, false);
    if (btnCheckout) btnCheckout.disabled = false;

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
        <input type="number" min="1" max="99" step="1" value="${clamp(num(it.quantity), 1, 99)}" aria-label="Cantidad">
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
        if (typeof window.renderCartBadge === "function") window.renderCartBadge();
      });

      right.appendChild(sub);
      right.appendChild(del);

      item.appendChild(img);
      item.appendChild(mid);
      item.appendChild(right);

      elList.appendChild(item);
    });
  }

  // =============================
  // Checkout: abrir panel y resumen
  // =============================
  function openCheckout() {
    const cart = loadUserCart();
    if (!cart || !cart.length) return;

    if (inlineSummary) inlineSummary.innerHTML = "";

    cart.forEach((it) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      const left = document.createElement("div");
      left.textContent = `${it.name} × ${clamp(num(it.quantity), 1, 99)}`;
      const right = document.createElement("div");
      right.textContent = `${it.currency || "USD"} ${fmt(num(it.price) * clamp(num(it.quantity), 1, 99))}`;
      row.appendChild(left);
      row.appendChild(right);
      if (inlineSummary) inlineSummary.appendChild(row);
    });

    const hr = document.createElement("hr");
    hr.style.border = "none";
    hr.style.borderTop = "1px solid #2a2a2e";
    hr.style.margin = "10px 0";
    if (inlineSummary) inlineSummary.appendChild(hr);

    const groups = groupTotals(cart);
    Object.entries(groups).forEach(([cur, total]) => {
      const row = document.createElement("div");
      row.className = "summary-row";
      row.innerHTML = `<strong>Total (${cur})</strong><strong>${cur} ${fmt(total)}</strong>`;
      if (inlineSummary) inlineSummary.appendChild(row);
    });

    if (checkoutPanel) {
      setHidden(checkoutPanel, false);
      checkoutPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // =============================
  // Checkout: enviar compra (POST)
  // =============================
  async function submitCheckout(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!inlinePay) return;

    inlinePay.disabled = true;
    const prevText = inlinePay.textContent;
    inlinePay.textContent = "Procesando...";

    try {
      const cart = loadUserCart();
      if (!cart || !cart.length) throw new Error("Carrito vacío");

      // Recolectar datos del formulario
      const shippingRadio = document.querySelector("input[name='shipping']:checked");
      const paymentRadio = document.querySelector("input[name='payment']:checked");
      const address = {
        dept: (document.getElementById("dept") || {}).value || "",
        city: (document.getElementById("city") || {}).value || "",
        street: (document.getElementById("street") || {}).value || "",
        number: (document.getElementById("number") || {}).value || "",
        corner: (document.getElementById("corner") || {}).value || "",
      };

      function shippingEnumFromValue(val) {
        switch (String(val)) {
          case '0.15':
            return 'PREMIUM';
          case '0.07':
            return 'EXPRESS';
          case '0.05':
            return 'STANDARD';
          default:
            return null;
        }
      }

      const shippingEnum = shippingRadio ? shippingEnumFromValue(shippingRadio.value) : null;

      const payload = {
        userId: (typeof window.getSessionId === 'function') ? window.getSessionId() : null,
        articles: cart.map((it) => ({
          id: it.id,
          name: it.name,
          unitCost: it.price,
          currency: it.currency || 'USD',
          count: clamp(num(it.quantity), 1, 99),
        })),
        shipping: {
          type: shippingEnum,
          // mantengo el percent por compatibilidad interna si el servidor lo necesita
          percent: shippingRadio ? Number(shippingRadio.value) : null,
          address,
        },
        payment: {
          method: paymentRadio ? paymentRadio.value : null,
        },
      };

      // Si el método es tarjeta, añadir los datos de tarjeta al payload
      if (paymentRadio && paymentRadio.value === 'credit') {
        const cardInput = inlineForm ? inlineForm.querySelector("input[name='card']") : null;
        const expInput = inlineForm ? inlineForm.querySelector("input[name='exp']") : null;
        const cvcInput = inlineForm ? inlineForm.querySelector("input[name='cvc']") : null;
        const cardNumber = cardInput ? (cardInput.value || '') : '';
        const exp = expInput ? (expInput.value || '') : '';
        const cvc = cvcInput ? (cvcInput.value || '') : '';
        payload.payment.card = { number: cardNumber, exp, cvc };
      }

      // Mostrar en consola el payload que se enviará al servidor (sin enmascarar)
      try {
        console.log('Checkout payload:', payload);
      } catch (e) {
        console.log('Checkout payload (raw):', payload);
      }

      const url = (typeof window.CART_BUY_URL === 'string') ? window.CART_BUY_URL : (window.CART_BUY_URL || '/');

      // Mostrar spinner global si existe
      if (typeof window.showSpinner === 'function') window.showSpinner();

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (typeof window.hideSpinner === 'function') window.hideSpinner();

      if (!res.ok) throw new Error(`Error ${res.status}`);

      // respuesta simulada
      const data = await res.json().catch(() => ({}));

      // Éxito: limpiar carrito y mostrar mensaje
      saveUserCart([]);
      renderCartBadge && window.renderCartBadge && window.renderCartBadge();
      if (inlineForm) inlineForm.reset();
      setHidden(inlineForm, true);
      setHidden(inlineSuccess, false);
      refresh();
    } catch (err) {
      console.error('Error al procesar compra:', err);
      alert('No se pudo procesar la compra. Intenta nuevamente.');
    } finally {
      if (inlinePay) {
        inlinePay.disabled = false;
        inlinePay.textContent = prevText;
      }
    }
  }

  function closeCheckoutAndReset() {
    if (inlineForm) {
      inlineForm.reset();
      setHidden(inlineForm, false);
    }
    setHidden(inlineSuccess, true);
    if (checkoutPanel) setHidden(checkoutPanel, true);
  }

  // Listeners relacionados al checkout
  if (btnCheckout) btnCheckout.addEventListener('click', openCheckout);
  if (inlineForm) inlineForm.addEventListener('submit', submitCheckout);
  if (inlineOk) inlineOk.addEventListener('click', () => {
    saveUserCart([]);
    closeCheckoutAndReset();
    refresh();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // =============================
  // UI: método de pago — mostrar inputs de tarjeta o aviso bancario
  // =============================
  function updatePaymentUI() {
    const cardDetails = document.getElementById('card-payment-details');
    const bankNotice = document.getElementById('bank-notice');
    const selected = document.querySelector("input[name='payment']:checked");

    if (selected && selected.value === 'credit') {
      if (cardDetails) cardDetails.hidden = false;
      if (bankNotice) bankNotice.hidden = true;
    } else if (selected && selected.value === 'bank') {
      if (cardDetails) cardDetails.hidden = true;
      if (bankNotice) bankNotice.hidden = false;
    } else {
      // Ninguna opción seleccionada: ocultar ambos
      if (cardDetails) cardDetails.hidden = true;
      if (bankNotice) bankNotice.hidden = true;
    }
  }

  // Vincular cambios en radios de pago
  const paymentRadios = document.querySelectorAll("input[name='payment']");
  if (paymentRadios && paymentRadios.length) {
    paymentRadios.forEach(r => r.addEventListener('change', updatePaymentUI));
  }
  // Ejecutar al inicio para reflejar estado actual
  updatePaymentUI();

  // =============================
  // Eventos (globales)
  // =============================
  if (btnClear) {
    btnClear.addEventListener("click", () => {
      if (!confirm("¿Vaciar el carrito?")) return;
      saveUserCart([]);
      refresh();
    });
  }

  // =============================
  // Envío / costos
  // =============================
  function getSubtotalUSD() {
    const cart = loadUserCart();
    return cart.reduce((acc, it) => {
      if (it.currency === "USD") acc += num(it.price) * clamp(num(it.quantity), 1, 99);
      return acc;
    }, 0);
  }

  function updateCostSection() {
    if (!elCostSubtotal || !elCostShipping || !elCostTotal) return;

    const subtotal = getSubtotalUSD();
    elCostSubtotal.textContent = `USD ${fmt(subtotal)}`;

    const checked = document.querySelector("input[name='shipping']:checked");
    if (!checked) {
      elCostShipping.textContent = "-";
      elCostTotal.textContent = "-";
      return;
    }

    const percent = Number(checked.value);
    const shippingCost = subtotal * percent;
    const total = subtotal + shippingCost;

    elCostShipping.textContent = `USD ${fmt(shippingCost)}`;
    elCostTotal.textContent = `USD ${fmt(total)}`;
  }

  if (elShippingRadios && elShippingRadios.length) {
    elShippingRadios.forEach((radio) => {
      radio.addEventListener("change", updateCostSection);
    });
  }

  // =============================
  // Ciclo de render y hook
  // =============================
  function refresh() {
    renderList();
    renderTotals();
    if (typeof window.renderCartBadge === "function") window.renderCartBadge();
  }

  // Hook: recalcular costos cada vez que se refresca la UI
  const originalRefresh = refresh;
  refresh = function () {
    originalRefresh();
    updateCostSection();
  };

  // Init
  refresh();
})();
