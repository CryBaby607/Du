// MENU RESPONSIVE (hamburguesa)
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
  navMenu.classList.toggle('active');
  menuToggle.classList.toggle('active');
});

// BUSCADOR EXPANDIBLE
const searchIcon = document.getElementById('searchIcon');
const searchBox = document.getElementById('searchBox');

searchIcon.addEventListener('click', () => {
  searchBox.classList.toggle('active');
  searchIcon.classList.toggle('active');
  const input = searchBox.querySelector('input');
  
  if (searchBox.classList.contains('active')) {
    input.focus();
  } else {
    input.blur();
  }
});

// ==================================
// CARRITO DE COMPRAS
// ==================================

class ShoppingCart {
  constructor() {
    this.cart = [];
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadCart();
    this.updateCartUI();
  }

  bindEvents() {
    // Abrir/cerrar carrito
    document.getElementById('cartIcon').addEventListener('click', () => this.openCart());
    document.getElementById('closeCart').addEventListener('click', () => this.closeCart());
    document.getElementById('continueShopping').addEventListener('click', () => this.closeCart());
    document.getElementById('cartOverlay').addEventListener('click', () => this.closeCart());

    // Botón de checkout
    document.getElementById('checkoutBtn').addEventListener('click', () => this.checkout());

    // Agregar productos al carrito
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', (e) => {
        const productCard = e.target.closest('.product-card');
        this.addToCart({
          id: productCard.dataset.id,
          name: productCard.dataset.name,
          price: parseInt(productCard.dataset.price),
          image: productCard.querySelector('img').src
        });
      });
    });
  }

  addToCart(product) {
    const existingItem = this.cart.find(item => item.id === product.id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      this.cart.push({
        ...product,
        quantity: 1
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.showNotification(`${product.name} agregado al carrito`);
  }

  removeFromCart(productId) {
    this.cart = this.cart.filter(item => item.id !== productId);
    this.saveCart();
    this.updateCartUI();
  }

  updateQuantity(productId, change) {
    const item = this.cart.find(item => item.id === productId);
    if (item) {
      item.quantity += change;
      
      if (item.quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        this.saveCart();
        this.updateCartUI();
      }
    }
  }

  getTotalItems() {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }

  getTotalPrice() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  openCart() {
    document.getElementById('cartSidebar').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeCart() {
    document.getElementById('cartSidebar').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
  }

  updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalAmount = document.getElementById('totalAmount');

    // Actualizar contador
    cartCount.textContent = this.getTotalItems();

    // Actualizar items del carrito
    if (this.cart.length === 0) {
      cartItems.innerHTML = `
        <div class="empty-cart-message">
          <i class="fas fa-shopping-bag"></i>
          <p>Tu carrito está vacío</p>
        </div>
      `;
    } else {
      cartItems.innerHTML = this.cart.map(item => `
        <div class="cart-item">
          <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
          </div>
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">$${item.price} MXN</div>
          </div>
          <div class="cart-item-controls">
            <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', -1)">-</button>
            <span class="cart-item-quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', 1)">+</button>
            <button class="remove-item" onclick="cart.removeFromCart('${item.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      `).join('');
    }

    // Actualizar total
    totalAmount.textContent = `$${this.getTotalPrice()} MXN`;
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification active';
    notification.innerHTML = `
      <i class="fas fa-check-circle"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  checkout() {
    if (this.cart.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    // Aquí integrarías con tu sistema de pago
    alert(`¡Gracias por tu compra! Total: $${this.getTotalPrice()} MXN\n\nEsta es una simulación. En un sitio real, aquí se integraría con Stripe, PayPal, etc.`);
    this.cart = [];
    this.saveCart();
    this.updateCartUI();
    this.closeCart();
  }

  saveCart() {
    localStorage.setItem('dukicks-cart', JSON.stringify(this.cart));
  }

  loadCart() {
    const savedCart = localStorage.getItem('dukicks-cart');
    if (savedCart) {
      this.cart = JSON.parse(savedCart);
    }
  }
}

// Inicializar el carrito cuando se carga la página
let cart;
document.addEventListener('DOMContentLoaded', () => {
  cart = new ShoppingCart();
});