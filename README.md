# e-Mercado (Frontend) - Proyecto Final JAP

Este repositorio contiene la interfaz de usuario (Frontend) para el proyecto final de e-commerce desarrollado en el marco del programa **Jóvenes a Programar (Ceibal)**. Es una aplicación web responsiva que simula un flujo de compras completo, integrándose con una API RESTful personalizada.

🔗 **Repositorio del Backend:** [Ir al Backend (jap_backend_grupo_6)](https://github.com/javiersv0221/jap_backend_grupo_6)

## 👥 Equipo de Desarrollo
**Grupo: 314 | Subgrupo: 6**

| Integrante | Rol / Especialidad | GitHub |
| :--- | :--- | :--- |
| **Javier Salvatierra** | Lógica Backend, BD & Autenticación | [@javiersv0221](https://github.com/javiersv0221) |
| **Jonathan Gomez** | Lógica Carrito & Integración Frontend-Backend | [@devJonathanGomez](https://github.com/devJonathanGomez) |
| **Verónica Alvez** | Diseño UI/UX (Index, Sell) & Filtros | [@VeronicaAlvez](https://github.com/VeronicaAlvez) |
| **Leandro Chevalier** | Registro de Usuarios & Diseño Categorías | [@leeachevalier](https://github.com/leeachevalier) |

---

## 🚀 Características y Evolución del Proyecto

El desarrollo se realizó de manera incremental a través de 8 entregas, evolucionando desde un prototipo estático hasta una aplicación dinámica conectada a una base de datos real.

### 📦 Hitos del Desarrollo

#### **Entrega 1: Prototipado e Inicios**
* Diseño y maquetación de **Login** y **Listado de Productos**.
* Consumo de datos inicial mediante archivos JSON estáticos (`fetch`).
* Validaciones básicas de formularios (HTML5 nativo).

#### **Entrega 2: Diseño Responsivo**
* Adaptación completa de la interfaz para dispositivos:
    * 📱 Móvil (320px)
    * Tablet (768px)
    * 🖥️ Escritorio (1366px)
* Mejoras en la barra de navegación para mostrar el usuario activo.

#### **Entrega 3: Búsqueda y Filtrado**
* Implementación de **filtros avanzados** (precio, relevancia, alfabético).
* **Buscador en tiempo real** en el listado de productos.
* Página de detalle de producto (`product-info`) con galería e identificación por ID.

#### **Entrega 4: Interacción Social**
* Sistema de **Comentarios y Calificaciones** (estrellas).
* Sección de productos relacionados dinámica.
* Persistencia local de nuevos comentarios (simulación inicial).

#### **Entrega 5: Personalización (Mi Perfil)**
* **Modo Oscuro / Claro** global con persistencia en `localStorage`.
* Página de perfil de usuario editable.
* Gestión de **Avatar**: selección desde galería o carga de imagen propia.

#### **Entrega 6: Gestión del Carrito**
* Lógica completa de carrito de compras (agregar, modificar cantidad, eliminar).
* Cálculo de subtotales en tiempo real.
* **Badges de notificación** en el menú con la cantidad de ítems.
* Persistencia del carrito por usuario (multi-sesión en el mismo navegador).

#### **Entrega 7: Checkout**
* Proceso de compra en pasos: Dirección de envío, Tipo de envío (con cálculo de costos) y Forma de pago.
* Validaciones cruzadas antes de finalizar la compra.
* Resumen de costos dinámico (Subtotal + Envío = Total).

#### **Entrega 8: Integración Full Stack 🔌**
* **Conexión con Backend Real:** Migración de JSON estáticos a endpoints de la API (Node.js/Express).
* **Autenticación JWT:** Login y Registro real contra base de datos MariaDB.
* **Persistencia Real:** El carrito y las compras se guardan en la base de datos del servidor.
* Rediseño estético final de la página de inicio (`index.html`) y ventas (`sell.html`).

---

## 🛠️ Tecnologías Utilizadas

* **HTML5 & CSS3** (Bootstrap 5 + Custom CSS)
* **JavaScript** (ES6+, Fetch API, Async/Await)
* **Figma** (Prototipado UI/UX)
* **Git & GitHub Pages** (Control de versiones y despliegue)

---

## ⚙️ Instalación y Ejecución

Este proyecto es una aplicación web estática que consume una API externa.

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/javiersv0221/jap_proyecto_final_grupo6.git](https://github.com/javiersv0221/jap_proyecto_final_grupo6.git)
    ```
2.  **Configurar el Backend:**
    Asegúrate de tener el [Backend](https://github.com/javiersv0221/jap_backend_grupo_6) ejecutándose localmente en el puerto `3000` para que el Login y el Carrito funcionen correctamente.
3.  **Ejecutar:**
    Puedes abrir el archivo `index.html` directamente en tu navegador o usar una extensión como *Live Server* en VS Code.
