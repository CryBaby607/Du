// Datos de productos para la tienda
const productsData = [
  {
    id: 1,
    name: "Playera Urban Black",
    price: 499,
    category: "urbanas",
    sizes: ["S", "M", "L", "XL"],
    colors: ["negro"],
    image: "https://via.placeholder.com/300x300/333333/FFFFFF?text=URBAN+BLACK",
    description: "Diseño urbano en negro clásico",
    featured: true,
    new: false
  },
  {
    id: 2,
    name: "Playera Street Gold",
    price: 549,
    category: "urbanas",
    sizes: ["S", "M", "L"],
    colors: ["amarillo"],
    image: "https://via.placeholder.com/300x300/FFD700/000000?text=STREET+GOLD",
    description: "Amarillo vibrante con estilo callejero",
    featured: true,
    new: true
  },
  {
    id: 3,
    name: "Playera Premium White",
    price: 599,
    category: "premium",
    sizes: ["M", "L", "XL"],
    colors: ["blanco"],
    image: "https://via.placeholder.com/300x300/FFFFFF/333333?text=PREMIUM+WHITE",
    description: "Blanco puro con acabado premium",
    featured: true,
    new: false
  },
  {
    id: 4,
    name: "Playera Red Velvet",
    price: 579,
    category: "premium",
    sizes: ["S", "M", "L", "XL"],
    colors: ["rojo"],
    image: "https://via.placeholder.com/300x300/800020/FFFFFF?text=RED+VELVET",
    description: "Rojo intenso con textura premium",
    featured: false,
    new: true
  },
  {
    id: 5,
    name: "Playera Navy Blue",
    price: 529,
    category: "basicas",
    sizes: ["S", "M", "L"],
    colors: ["azul"],
    image: "https://via.placeholder.com/300x300/000080/FFFFFF?text=NAVY+BLUE",
    description: "Azul marino clásico y versátil",
    featured: false,
    new: false
  },
  {
    id: 6,
    name: "Playera Forest Green",
    price: 539,
    category: "basicas",
    sizes: ["M", "L", "XL"],
    colors: ["verde"],
    image: "https://via.placeholder.com/300x300/228B22/FFFFFF?text=FOREST+GREEN",
    description: "Verde bosque para looks naturales",
    featured: false,
    new: true
  },
  {
    id: 7,
    name: "Playera Sunset Orange",
    price: 559,
    category: "urbanas",
    sizes: ["S", "M", "L", "XL"],
    colors: ["naranja"],
    image: "https://via.placeholder.com/300x300/FF8C00/FFFFFF?text=SUNSET+ORANGE",
    description: "Naranja atardecer con estilo urbano",
    featured: true,
    new: true
  },
  {
    id: 8,
    name: "Playera Graphite Gray",
    price: 519,
    category: "basicas",
    sizes: ["S", "M", "L"],
    colors: ["gris"],
    image: "https://via.placeholder.com/300x300/696969/FFFFFF?text=GRAPHITE+GRAY",
    description: "Gris grafito para looks minimalistas",
    featured: false,
    new: false
  }
];

class Shop {
  constructor() {
    this.products = productsData;
    this.filteredProducts = [...this.products];
    this.currentFilters = {
      categories: ['urbanas', 'premium', 'basicas'],
      priceRange: [0, 1000],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['negro', 'amarillo', 'blanco', 'rojo', 'azul', 'verde', 'naranja', 'gris']
    };
    this.sortBy = 'featured';
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderProducts();
    this.updateProductsCount();
  }

  bindEvents() {
    // Filtros
    document.getElementById('applyFilters').addEventListener('click', () => {
      this.applyFilters();
    });

    document.getElementById('resetFilters').addEventListener('click', () => {
      this.resetFilters();
    });

    document.getElementById('applyPriceFilter').addEventListener('click', () => {
      this.applyPriceFilter();
    });

    // Ordenamiento
    document.getElementById('sortSelect').addEventListener('change', (e) => {
      this.sortBy = e.target.value;
      this.applySorting();
    });

    // Búsqueda
    document.getElementById('searchInput').addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });
  }

  applyFilters() {
    this.updateCurrentFilters();
    this.filterProducts();
    this.renderProducts();
    this.updateProductsCount();
  }

  resetFilters() {
    // Resetear checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      checkbox.checked = true;
    });

    // Resetear precios
    document.getElementById('minPrice').value = 0;
    document.getElementById('maxPrice').value = 1000;

    // Resetear filtros actuales
    this.currentFilters = {
      categories: ['urbanas', 'premium', 'basicas'],
      priceRange: [0, 1000],
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['negro', 'amarillo', 'blanco', 'rojo', 'azul', 'verde', 'naranja', 'gris']
    };

    this.filteredProducts = [...this.products];
    this.applySorting();
    this.updateProductsCount();
  }

  updateCurrentFilters() {
    // Categorías
    this.currentFilters.categories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
      .map(checkbox => checkbox.value);

    // Tallas
    this.currentFilters.sizes = Array.from(document.querySelectorAll('input[name="size"]:checked'))
      .map(checkbox => checkbox.value);

    // Colores
    this.currentFilters.colors = Array.from(document.querySelectorAll('input[name="color"]:checked'))
      .map(checkbox => checkbox.value);
  }

  applyPriceFilter() {
    const minPrice = parseInt(document.getElementById('minPrice').value) || 0;
    const maxPrice = parseInt(document.getElementById('maxPrice').value) || 1000;
    
    this.currentFilters.priceRange = [minPrice, maxPrice];
    this.filterProducts();
    this.renderProducts();
    this.updateProductsCount();
  }

  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      // Filtrar por categoría
      const categoryMatch = this.currentFilters.categories.includes(product.category);
      
      // Filtrar por precio
      const priceMatch = product.price >= this.currentFilters.priceRange[0] && 
                        product.price <= this.currentFilters.priceRange[1];
      
      // Filtrar por tallas (al menos una talla en común)
      const sizeMatch = product.sizes.some(size => this.currentFilters.sizes.includes(size));
      
      // Filtrar por colores
      const colorMatch = product.colors.some(color => this.currentFilters.colors.includes(color));
      
      return categoryMatch && priceMatch && sizeMatch && colorMatch;
    });

    this.applySorting();
  }

  applySorting() {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        this.filteredProducts.sort((a, b) => (b.new === a.new) ? 0 : b.new ? -1 : 1);
        break;
      case 'featured':
      default:
        this.filteredProducts.sort((a, b) => (b.featured === a.featured) ? 0 : b.featured ? -1 : 1);
        break;
    }
  }

  handleSearch(searchTerm) {
    if (searchTerm.trim() === '') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    this.applySorting();
    this.renderProducts();
    this.updateProductsCount();
  }

  renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    
    if (this.filteredProducts.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <i class="fas fa-search"></i>
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
        </div>
      `;
      return;
    }

    productsGrid.innerHTML = this.filteredProducts.map(product => `
      <div class="product-card" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}">
        ${product.new ? '<span class="product-badge new">NUEVO</span>' : ''}
        ${product.featured ? '<span class="product-badge featured">DESTACADO</span>' : ''}
        <div class="product-image">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-description">${product.description}</p>
          <p class="product-price">$${product.price} MXN</p>
          <a href="producto${product.id === 1 ? '' : '-' + product.name.toLowerCase().replace(/\s+/g, '-')}.html" class="btn-secondary">VER DETALLES</a>
        </div>
      </div>
    `).join('');
  }

  updateProductsCount() {
    document.getElementById('productsCount').textContent = this.filteredProducts.length;
  }
}

// Inicializar tienda cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new Shop();
});