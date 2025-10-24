// Funcionalidades específicas para página de producto
class ProductPage {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.initImageGallery();
    this.initTabs();
    this.initQuantitySelector();
  }

  bindEvents() {
    // Agregar al carrito desde página de producto
    document.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
      this.addToCartFromProductPage(e);
    });

    // Comprar ahora
    document.querySelector('.buy-now-btn').addEventListener('click', () => {
      this.buyNow();
    });
  }

  initImageGallery() {
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('mainImage');

    thumbnails.forEach(thumbnail => {
      thumbnail.addEventListener('click', () => {
        // Remover clase active de todas las thumbnails
        thumbnails.forEach(t => t.classList.remove('active'));
        
        // Agregar clase active a la thumbnail clickeada
        thumbnail.classList.add('active');
        
        // Cambiar imagen principal
        const newImageSrc = thumbnail.getAttribute('data-image');
        mainImage.src = newImageSrc;
        mainImage.alt = thumbnail.querySelector('img').alt;
      });
    });
  }

  initTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabId = button.getAttribute('data-tab');
        
        // Remover clase active de todos los botones y paneles
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Agregar clase active al botón y panel correspondiente
        button.classList.add('active');
        document.getElementById(tabId).classList.add('active');
      });
    });
  }

  initQuantitySelector() {
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const quantityInput = document.querySelector('.quantity-input');

    minusBtn.addEventListener('click', () => {
      let currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
      }
    });

    plusBtn.addEventListener('click', () => {
      let currentValue = parseInt(quantityInput.value);
      if (currentValue < 10) {
        quantityInput.value = currentValue + 1;
      }
    });

    quantityInput.addEventListener('change', () => {
      let value = parseInt(quantityInput.value);
      if (value < 1) quantityInput.value = 1;
      if (value > 10) quantityInput.value = 10;
    });
  }

  addToCartFromProductPage(e) {
    const button = e.target.closest('.add-to-cart-btn');
    const productId = button.getAttribute('data-product-id');
    const productName = button.getAttribute('data-product-name');
    const productPrice = parseInt(button.getAttribute('data-product-price'));
    const selectedSize = document.querySelector('input[name="size"]:checked').value;
    const quantity = parseInt(document.querySelector('.quantity-input').value);
    
    const product = {
      id: `${productId}-${selectedSize}`, // ID único con talla
      name: `${productName} - Talla ${selectedSize}`,
      price: productPrice,
      image: document.querySelector('.main-image img').src,
      size: selectedSize,
      quantity: quantity
    };

    // Agregar al carrito (usando la misma instancia del carrito)
    if (typeof cart !== 'undefined') {
      for (let i = 0; i < quantity; i++) {
        cart.addToCart(product);
      }
    } else {
      console.error('Carrito no inicializado');
    }
  }

  buyNow() {
    // Primero agregar al carrito
    this.addToCartFromProductPage({ target: document.querySelector('.add-to-cart-btn') });
    
    // Luego abrir el carrito
    setTimeout(() => {
      if (typeof cart !== 'undefined') {
        cart.openCart();
      }
    }, 500);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ProductPage();
});