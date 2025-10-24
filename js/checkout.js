class CheckoutProcess {
  constructor() {
    this.currentStep = 1;
    this.orderData = {
      customer: {},
      shipping: {},
      payment: {},
      cart: [],
      totals: {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        total: 0
      }
    };
    this.init();
  }

  init() {
    this.loadCartData();
    this.bindEvents();
    this.updateOrderSummary();
    this.showStep(1);
  }

  loadCartData() {
    const savedCart = localStorage.getItem('dukicks-cart');
    if (savedCart) {
      this.orderData.cart = JSON.parse(savedCart);
      this.calculateTotals();
    } else {
      // Redirigir al carrito si está vacío
      window.location.href = 'tienda.html';
    }
  }

  bindEvents() {
    // Navegación entre pasos
    document.querySelectorAll('.btn-continue').forEach(button => {
      button.addEventListener('click', (e) => {
        const nextStep = parseInt(e.target.getAttribute('data-next-step'));
        if (this.validateStep(this.currentStep)) {
          this.saveStepData(this.currentStep);
          this.showStep(nextStep);
        }
      });
    });

    document.querySelectorAll('.btn-back').forEach(button => {
      button.addEventListener('click', (e) => {
        const prevStep = parseInt(e.target.getAttribute('data-prev-step'));
        this.showStep(prevStep);
      });
    });

    // Métodos de envío
    document.querySelectorAll('input[name="shippingMethod"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.updateShippingCost(e.target.value);
      });
    });

    // Métodos de pago
    document.querySelectorAll('.payment-tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchPaymentMethod(e.target.getAttribute('data-method'));
      });
    });

    // Formulario de pago
    document.getElementById('paymentForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.completeOrder();
    });

    // Formatear inputs
    this.formatInputs();
  }

  formatInputs() {
    // Formatear número de tarjeta
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        let formattedValue = value.match(/.{1,4}/g)?.join(' ') || '';
        e.target.value = formattedValue.substring(0, 19);
      });
    }

    // Formatear fecha de expiración
    const cardExpiryInput = document.getElementById('cardExpiry');
    if (cardExpiryInput) {
      cardExpiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        if (value.length >= 2) {
          value = value.substring(0, 2) + '/' + value.substring(2, 4);
        }
        e.target.value = value.substring(0, 5);
      });
    }

    // Solo números para CVV
    const cardCvvInput = document.getElementById('cardCvv');
    if (cardCvvInput) {
      cardCvvInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/gi, '');
      });
    }
  }

  showStep(stepNumber) {
    // Ocultar todos los pasos
    document.querySelectorAll('.checkout-form').forEach(form => {
      form.classList.remove('active');
    });

    // Mostrar paso actual
    document.getElementById(this.getStepFormId(stepNumber)).classList.add('active');

    // Actualizar indicadores de pasos
    document.querySelectorAll('.step').forEach(step => {
      step.classList.remove('active');
    });
    document.querySelector(`.step[data-step="${stepNumber}"]`).classList.add('active');

    this.currentStep = stepNumber;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStepFormId(stepNumber) {
    const stepForms = {
      1: 'customerInfoForm',
      2: 'shippingForm',
      3: 'paymentForm',
      4: 'confirmationStep'
    };
    return stepForms[stepNumber];
  }

  validateStep(stepNumber) {
    const form = document.getElementById(this.getStepFormId(stepNumber));
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    let isValid = true;
    
    inputs.forEach(input => {
      if (!input.value.trim()) {
        isValid = false;
        this.showError(input, 'Este campo es obligatorio');
      } else {
        this.clearError(input);
      }

      // Validaciones específicas
      if (input.type === 'email' && input.value) {
        if (!this.isValidEmail(input.value)) {
          isValid = false;
          this.showError(input, 'Ingresa un email válido');
        }
      }

      if (input.id === 'phone' && input.value) {
        if (!this.isValidPhone(input.value)) {
          isValid = false;
          this.showError(input, 'Ingresa un teléfono válido');
        }
      }
    });

    return isValid;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  }

  showError(input, message) {
    this.clearError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff4444';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.3rem';
    
    input.style.borderColor = '#ff4444';
    input.parentNode.appendChild(errorDiv);
  }

  clearError(input) {
    input.style.borderColor = '';
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
  }

  saveStepData(stepNumber) {
    const form = document.getElementById(this.getStepFormId(stepNumber));
    const formData = new FormData(form);
    
    switch (stepNumber) {
      case 1:
        this.orderData.customer = Object.fromEntries(formData);
        break;
      case 2:
        this.orderData.shipping = Object.fromEntries(formData);
        break;
      case 3:
        this.orderData.payment = Object.fromEntries(formData);
        break;
    }
  }

  updateShippingCost(method) {
    const shippingCosts = {
      'standard': 99,
      'express': 199,
      'free': 0
    };

    this.orderData.totals.shipping = shippingCosts[method] || 0;
    this.calculateTotals();
    this.updateOrderSummary();
  }

  calculateTotals() {
    // Subtotal
    this.orderData.totals.subtotal = this.orderData.cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    // Descuento (ejemplo: 10% en compras mayores a $1000)
    this.orderData.totals.discount = this.orderData.totals.subtotal > 1000 ? 
      this.orderData.totals.subtotal * 0.1 : 0;

    // Total
    this.orderData.totals.total = this.orderData.totals.subtotal + 
                                 this.orderData.totals.shipping - 
                                 this.orderData.totals.discount;
  }

  updateOrderSummary() {
    // Actualizar items
    const orderItems = document.getElementById('orderItems');
    orderItems.innerHTML = this.orderData.cart.map(item => `
      <div class="order-item">
        <div class="order-item-image">
          <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="order-item-details">
          <div class="order-item-name">${item.name}</div>
          <div class="order-item-price">$${item.price} MXN</div>
          <div class="order-item-quantity">Cantidad: ${item.quantity}</div>
        </div>
      </div>
    `).join('');

    // Actualizar totales
    document.getElementById('subtotal').textContent = `$${this.orderData.totals.subtotal} MXN`;
    document.getElementById('shippingCost').textContent = `$${this.orderData.totals.shipping} MXN`;
    document.getElementById('discount').textContent = `-$${this.orderData.totals.discount} MXN`;
    document.getElementById('grandTotal').textContent = `$${this.orderData.totals.total} MXN`;
  }

  switchPaymentMethod(method) {
    // Actualizar pestañas
    document.querySelectorAll('.payment-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`.payment-tab[data-method="${method}"]`).classList.add('active');

    // Actualizar contenido
    document.querySelectorAll('.payment-content').forEach(content => {
      content.classList.remove('active');
    });
    document.getElementById(`${method}Content`).classList.add('active');
  }

  completeOrder() {
    if (this.validateStep(3)) {
      this.saveStepData(3);
      
      // Simular procesamiento de pago
      this.showLoading();

      setTimeout(() => {
        // Guardar orden
        this.saveOrder();
        
        // Limpiar carrito
        localStorage.removeItem('dukicks-cart');
        
        // Mostrar confirmación
        this.showStep(4);
        this.updateConfirmation();
        
        this.hideLoading();
      }, 2000);
    }
  }

  showLoading() {
    const submitBtn = document.querySelector('.btn-complete-order');
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> PROCESANDO...';
    submitBtn.disabled = true;
  }

  hideLoading() {
    const submitBtn = document.querySelector('.btn-complete-order');
    submitBtn.innerHTML = 'COMPLETAR PEDIDO';
    submitBtn.disabled = false;
  }

  saveOrder() {
    const order = {
      id: 'DK' + Date.now(),
      date: new Date().toISOString(),
      ...this.orderData
    };
    
    // Guardar en localStorage (en un caso real, enviarías a un servidor)
    const orders = JSON.parse(localStorage.getItem('dukicks-orders') || '[]');
    orders.push(order);
    localStorage.setItem('dukicks-orders', JSON.stringify(orders));
  }

  updateConfirmation() {
    document.getElementById('confirmationEmail').textContent = this.orderData.customer.email;
    
    const orderSummary = document.getElementById('orderSummaryConfirm');
    orderSummary.innerHTML = `
      <div class="total-row">
        <span>Subtotal:</span>
        <span>$${this.orderData.totals.subtotal} MXN</span>
      </div>
      <div class="total-row">
        <span>Envío:</span>
        <span>$${this.orderData.totals.shipping} MXN</span>
      </div>
      <div class="total-row discount">
        <span>Descuento:</span>
        <span>-$${this.orderData.totals.discount} MXN</span>
      </div>
      <div class="total-row grand-total">
        <span>Total:</span>
        <span>$${this.orderData.totals.total} MXN</span>
      </div>
    `;
  }
}

// Inicializar checkout cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new CheckoutProcess();
});