let productData = [];
let currentProductId = null;
const productsContainer = document.getElementById('productsContainer');
const finishBtn = document.getElementById("finish");


fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        productData = Object.values(data);

        productData.forEach((product, index) => {
            const productCard = document.createElement('div');
            productCard.className = 'card m-2';
            productCard.style.width = '18rem';
            productCard.innerHTML = `
                <img src="${product.images[0]}" class="card-img-top" alt="${product.title}">
                <div class="card-body">
                    <h5 class="card-title">${product.title}</h5>
                    <p class="card-text">$${product.price}</p>
                    <button class="btn btn-primary view-details-btn" data-product-id="${index}">Ver Detalles</button>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });

        // Event listeners para abrir modal
        document.querySelectorAll('.view-details-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = e.target.getAttribute('data-product-id');
                openProductModal(productId);
            });
        });
    })
    .catch(error => console.error("Error cargando el JSON:", error));

function fillProductModal(productId) {
    const product = productData[productId];
    if (!product) return;
    currentProductId = productId;

    // Título y precio del producto principal
    document.getElementById('productTitle').textContent = product.title;
    document.getElementById('productPrice').textContent = `$${product.price}`;

    // Carrusel
    const carouselInner = document.getElementById('productCarouselInner');
    carouselInner.innerHTML = '';
    product.images.forEach((imgSrc, i) => {
        const div = document.createElement('div');
        div.className = `carousel-item ${i === 0 ? 'active' : ''}`;
        div.innerHTML = `<img src="${imgSrc}" class="d-block w-100" alt="${product.title}">`;
        carouselInner.appendChild(div);
    });

    // Productos relacionados
    const relatedProductsContainer = document.getElementById('relatedProducts');
    relatedProductsContainer.innerHTML = '';

    product.related.forEach(related => {
        const relatedProduct = productData.find(p => p.title === related.title);

        const relatedDiv = document.createElement('div');
        relatedDiv.className = 'col-4 text-center related-product-card mb-3';
        relatedDiv.style.cursor = 'pointer';
        relatedDiv.innerHTML = `
            <img src="${related.image}" alt="${related.title}" class="img-fluid rounded mb-2 related-product-img">
            <p class="fw-bold mb-0" style="font-size: 0.9rem;">${related.title}</p>
            <p class="text-muted" style="font-size: 0.85rem;">$${related.price}</p>
        `;

        // Cambiar modal al producto clickeado
        relatedDiv.addEventListener('click', () => {
            if (relatedProduct) {
                fillProductModal(productData.indexOf(relatedProduct));
            } else {
                console.warn(`Producto relacionado no encontrado: ${related.title}`);
            }
        });

        relatedProductsContainer.appendChild(relatedDiv);
    });

    // Controlar estado del botón "Añadir al carrito"
    const addToCartBtn = document.getElementById('addToCartBtn');
    const prodIdNum = parseInt(productId);

    const yaEnCarrito = carrito.some(item => parseInt(item.productId) === prodIdNum);

    if (yaEnCarrito) {
        addToCartBtn.textContent = "Ya en el carrito";
        addToCartBtn.disabled = true;
        addToCartBtn.classList.add("btn-secondary");
        addToCartBtn.classList.remove("btn-success");
    } else {
        addToCartBtn.textContent = "Añadir al Carrito";
        addToCartBtn.disabled = false;
        addToCartBtn.classList.add("btn-success");
        addToCartBtn.classList.remove("btn-secondary");
    }


}

function openProductModal(productId) {
    fillProductModal(productId);
    const modalElement = document.getElementById('productModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
}





// Funcionalidades del Carrito

let carrito = [];

// Obtener carrito del localStorage (si hay)
if (JSON.parse(localStorage.getItem("storedCart"))) {
    carrito = JSON.parse(localStorage.getItem("storedCart"))

    carrito.forEach(elemento => {
        mostrarEnCarrito(elemento.productId)
    })

    actualizarSpansCarrito();
}


// Actualizar los spans de la cantidad de productos y del precio total
function actualizarSpansCarrito() {
    const itemsEnCarritoSpan = document.getElementById("itemsEnCarritoSpan");
    const spanPrecioTotal = document.getElementById("spanPrecioTotal");

    itemsEnCarritoSpan.textContent = carrito.length > 0 ? carrito.length : "";

    const precioTotal = carrito.reduce((acc, elem) => acc + (parseInt(elem.price) || 0), 0);
    spanPrecioTotal.textContent = precioTotal;

    // Actualizar estado del botón "Finalizar Compra"
    if (carrito.length === 0) {
        finishBtn.disabled = true;
        finishBtn.classList.add("btn-secondary");
        finishBtn.classList.remove("btn-success");

    } else {
        finishBtn.disabled = false;
        finishBtn.classList.add("btn-success");
        finishBtn.classList.remove("btn-secondary");
    }
}


// Agregar al Carrito
function agregarAlCarrito(productId) {
    const agregado = productData[productId];
    if (!agregado) return;

    // Verifica si ya está en el carrito usando productId
    if (carrito.some(elemento => elemento.productId === productId)) {
        Toastify({
            text: "El producto ya está en el carrito",
            duration: 2500,
            gravity: "bottom",
            position: "right",
            className: "toast-error",
        }).showToast();
    } else {

        carrito.push({ ...agregado, productId });
        mostrarEnCarrito(productId);
        localStorage.setItem("storedCart", JSON.stringify(carrito));

        Toastify({
            text: "Se agregó al carrito",
            duration: 2500,
            gravity: "bottom",
            position: "right",
            className: "toast-success",
        }).showToast();
    }

    actualizarSpansCarrito();

    // Actualizar botón si el modal está abierto en el mismo producto
    if (currentProductId !== null) {
        fillProductModal(currentProductId);
    }

}

// Mostrar en carrito usando productId
function mostrarEnCarrito(productId) {
    const item = carrito.find(p => p.productId === productId);
    if (!item) return;

    const cartBody = document.getElementById("cart-body");

    const div = document.createElement("div");
    div.className = "cart-item d-flex justify-content-between align-items-center mb-2";
    div.setAttribute("data-prod-id", item.productId);

    div.innerHTML = `
        <span>${item.title} - $${parseInt(item.price)}</span>
        <button class="btn btn-sm btn-danger btn-eliminar">Eliminar</button>
    `;

    cartBody.appendChild(div);

    div.querySelector(".btn-eliminar").addEventListener("click", () => {
        eliminarDelCarrito(item.productId);
    });
}

// Eliminar del carrito usando productId
function eliminarDelCarrito(productId) {
    carrito = carrito.filter(item => item.productId !== productId);

    const cartItem = document.querySelector(`.cart-item[data-prod-id="${productId}"]`);
    if (cartItem) cartItem.remove();

    localStorage.setItem("storedCart", JSON.stringify(carrito));

    actualizarSpansCarrito();

    Toastify({
        text: "Producto eliminado del carrito",
        duration: 2000,
        gravity: "bottom",
        position: "right",
        className: "toast-error",
    }).showToast();
}

// Vaciar carrito completo
document.getElementById("clearCartBtn").addEventListener("click", () => {
    carrito = [];
    document.getElementById("cart-body").innerHTML = "";
    localStorage.removeItem("storedCart");
    actualizarSpansCarrito();

    Toastify({
        text: "Se vació el carrito",
        duration: 2000,
        gravity: "bottom",
        position: "right",
        className: "toast-error",
    }).showToast();
});

// Evento para el botón de añadir al carrito
document.getElementById('addToCartBtn').addEventListener('click', () => {
    if (currentProductId !== null) {
        agregarAlCarrito(currentProductId);

        const modalElement = document.getElementById('productModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal.hide();
    }

    else {
        console.error("No hay un producto seleccionado para agregar al carrito.");
    }
});


finishBtn.addEventListener("click", () => {
    if (carrito.length === 0) return;

    // Cerrar el modal del carrito antes de abrir el de checkout
    const cartModalElement = document.getElementById("cartModal");
    const cartModal = bootstrap.Modal.getInstance(cartModalElement);
    if (cartModal) cartModal.hide();

    // Llenar el contenido del modal de checkout
    const checkoutBody = document.getElementById("checkout-body");
    checkoutBody.innerHTML = "";

    let total = 0;

    carrito.forEach(item => {
        const row = document.createElement("div");
        row.className = "d-flex justify-content-between align-items-center border-bottom py-2";
        row.innerHTML = `
            <span>${item.title}</span>
            <span>$${item.price}</span>
        `;
        checkoutBody.appendChild(row);
        total += parseInt(item.price);
    });

    const totalEl = document.createElement("p");
    totalEl.className = "fw-bold text-end mt-3";
    totalEl.textContent = `Total: $${total}`;
    checkoutBody.appendChild(totalEl);

    // Abrir el modal de checkout
    const checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
    checkoutModal.show();
});


document.getElementById("paymentMethodsBtn").addEventListener("click", () => {
    if (carrito.length === 0) return;

    // Cerrar el modal de checkout antes de abrir el de pagos
    const checkoutModalEl = document.getElementById("checkoutModal");
    const checkoutModal = bootstrap.Modal.getInstance(checkoutModalEl);
    if (checkoutModal) checkoutModal.hide();

    // Abrir el modal de medios de pago
    const paymentModal = new bootstrap.Modal(document.getElementById("paymentModal"));
    paymentModal.show();
});

document.getElementById("backToCheckoutBtn").addEventListener("click", () => {
    const paymentModalEl = document.getElementById("paymentModal");
    const paymentModal = bootstrap.Modal.getInstance(paymentModalEl);
    if (paymentModal) paymentModal.hide();

    const checkoutModal = new bootstrap.Modal(document.getElementById("checkoutModal"));
    checkoutModal.show();
});