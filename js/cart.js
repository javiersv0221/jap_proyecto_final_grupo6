document.addEventListener("DOMContentLoaded", () => {
    const cartContainer = document.getElementById("cart-container");

// Obtenemos productos guardados en localStorage
  const productosEnCarrito = JSON.parse(localStorage.getItem("carrito")) || [];

  if (productosEnCarrito.length === 0) {
    
    // No hay productos → mostrar mensaje
    cartContainer.innerHTML = `
      <div class="alert alert-warning text-center mt-4">
        No hay productos en el carrito.
      </div>
    `;
  } else {
    // Hay productos → mostrar tabla con datos
    mostrarProductos(productosEnCarrito);
  }
});

// Función para mostrar los productos
function mostrarProductos(productos) {
  const cartContainer = document.getElementById("cartContainer");

  let html = `
    <table class="table table-bordered align-middle text-center">
      <thead class="table-dark">
        <tr>
          <th>Producto</th>
          <th>Precio unitario</th>
          <th>Cantidad</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
  `;

  productos.forEach((producto, i) => {
    html += `
      <tr>
        <td>${producto.nombre}</td>
        <td>$${producto.precio}</td>
        <td>
          <input type="number" 
                 value="${producto.cantidad}" 
                 min="1" 
                 class="form-control cantidad" 
                 data-index="${i}">
        </td>
        <td class="subtotal">$${producto.precio * producto.cantidad}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>

    <div class="text-end mt-3">
      <h4 id="totalGeneral">Total: $${calcularTotal(productos)}</h4>
    </div>
  `;

  cartContainer.innerHTML = html;

  // Activar la lógica del punto 4 (actualizar subtotales y total)
  activarActualizacionSubtotales(productos);
}

// Calcula el total general
function calcularTotal(productos) {
  return productos.reduce((acum, p) => acum + p.precio * p.cantidad, 0);
}

// Función para actualizar subtotales cuando cambia la cantidad
function activarActualizacionSubtotales(productos) {
  const inputsCantidad = document.querySelectorAll(".cantidad");

  inputsCantidad.forEach((input) => {
    input.addEventListener("input", (e) => {
      const index = e.target.dataset.index;
      const nuevaCantidad = parseInt(e.target.value);

      // Evita valores menores a 1
      if (nuevaCantidad < 1) {
        e.target.value = 1;
        return;
      }

      // Actualizar subtotal visualmente
      const precio = productos[index].precio;
      const subtotalElemento = e.target.closest("tr").querySelector(".subtotal");
      subtotalElemento.textContent = `$${precio * nuevaCantidad}`;

      // Actualizar cantidad en el localStorage
      productos[index].cantidad = nuevaCantidad;
      localStorage.setItem("carrito", JSON.stringify(productos));

      // Actualizar total general
      const totalElemento = document.getElementById("totalGeneral");
      totalElemento.textContent = `Total: $${calcularTotal(productos)}`;
    });
  });
}