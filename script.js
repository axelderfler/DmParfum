// Dm Parfum - JavaScript para funcionalidad dinámica

// Configuración de Google Sheets
const GOOGLE_SHEETS_CONFIG = {
  // URL de tu Google Sheet (debes cambiar esto por tu URL real)
  sheetUrl: 'https://docs.google.com/spreadsheets/d/148b-GN5OsSWdBTv7_r-M8jBVqHdGE2Wxu98IvB74L4c/edit?gid=0#gid=0',
  // ID de la hoja (se extrae automáticamente de la URL)
  sheetId: '148b-GN5OsSWdBTv7_r-M8jBVqHdGE2Wxu98IvB74L4c',
  // Nombre de la hoja dentro del spreadsheet
  sheetName: 'web',
  // Columnas esperadas en tu Google Sheet
  columns: {
    id: 'A',           // ID único
    name: 'B',         // Nombre del perfume
    brand: 'C',        // Marca
    price: 'D',        // Precio
    category: 'E',     // Categoría (masculino/femenino/unisex)
    description: 'F',  // Descripción
    image: 'G',        // URL de la imagen
    stock: 'H',        // Stock disponible
    whatsapp: 'I',     // Número de WhatsApp
    instagram: 'J'     // Usuario de Instagram
  }
};

// Datos de productos (se cargarán desde Google Sheets)
let productsData = [];

// Datos de respaldo en caso de que falle la carga (vacío para mostrar solo datos reales)
const fallbackProducts = [];

// Variables globales
let currentFilter = 'all';
let filteredProducts = [];

// Variables del carrusel
let currentCarouselIndex = 0;
let carouselItems = [];
let itemsPerView = 3;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeFilters();
  initializeContactForm();
  initializeScrollEffects();
  initializeMobileMenu();
  initializeHeroButtons();
  
  // Cargar productos desde Google Sheets
  loadProductsFromGoogleSheets();
});

// Navegación suave
function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href').substring(1);
      const targetSection = document.getElementById(targetId);
      
      if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Filtros del catálogo
function initializeFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Remover clase active de todos los botones
      filterButtons.forEach(btn => btn.classList.remove('active'));
      
      // Agregar clase active al botón clickeado
      this.classList.add('active');
      
      // Obtener el filtro seleccionado
      currentFilter = this.getAttribute('data-filter');
      
      // Filtrar productos
      filterProducts();
    });
  });
}

// Filtrar productos
function filterProducts() {
  if (currentFilter === 'all') {
    filteredProducts = productsData;
  } else {
    filteredProducts = productsData.filter(product => product.category === currentFilter);
  }
  
  // Recargar productos con animación
  loadProducts(true);
}

// Función para aplicar filtro inicial (mostrar todos por defecto)
function applyInitialFilter() {
  currentFilter = 'all';
  filteredProducts = productsData;
  
  // Marcar el botón "Todos" como activo
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => btn.classList.remove('active'));
  const allButton = document.querySelector('[data-filter="all"]');
  if (allButton) {
    allButton.classList.add('active');
  }
  
  console.log('Filtro inicial aplicado:', { currentFilter, filteredProducts: filteredProducts.length });
}

// Cargar productos en el grid
function loadProducts(animate = false) {
  const productsGrid = document.getElementById('products-grid');
  
  console.log('loadProducts llamado:', { 
    animate, 
    filteredProducts: filteredProducts.length, 
    productsData: productsData.length,
    currentFilter 
  });
  
  if (animate) {
    productsGrid.style.opacity = '0';
    productsGrid.style.transform = 'translateY(20px)';
  }
  
  setTimeout(() => {
    productsGrid.innerHTML = '';
    
    // Si no hay productos filtrados, mostrar mensaje
    if (filteredProducts.length === 0) {
      if (productsData.length === 0) {
        showNoProductsMessage();
      } else {
        // Hay productos pero no coinciden con el filtro
        productsGrid.innerHTML = `
          <div class="no-products-container" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
            <div style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;">
              <i class="fas fa-filter"></i>
            </div>
            <h3 style="color: var(--text-dark); margin-bottom: 1rem;">No hay productos en esta categoría</h3>
            <p style="color: var(--text-light); margin-bottom: 2rem;">
              Prueba con otra categoría o selecciona "Todos".
            </p>
          </div>
        `;
      }
      return;
    }
    
    filteredProducts.forEach((product, index) => {
      const productCard = createProductCard(product);
      productsGrid.appendChild(productCard);
      
      // Animación de entrada escalonada
      if (animate) {
        setTimeout(() => {
          productCard.style.opacity = '0';
          productCard.style.transform = 'translateY(30px)';
          productCard.style.transition = 'all 0.5s ease';
          
          setTimeout(() => {
            productCard.style.opacity = '1';
            productCard.style.transform = 'translateY(0)';
          }, 100);
        }, index * 100);
      }
    });
    
    if (animate) {
      productsGrid.style.opacity = '1';
      productsGrid.style.transform = 'translateY(0)';
      productsGrid.style.transition = 'all 0.3s ease';
    }
  }, animate ? 200 : 0);
}

// Crear tarjeta de producto
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-category', product.category);
  
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(product.price);
  
  // Determinar estado del stock
  const stockStatus = product.stock > 0 ? 
    `<span class="stock-available">Disponible (${product.stock})</span>` : 
    `<span class="stock-unavailable">Sin stock</span>`;
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      ${(typeof product.stock === 'number' && product.stock <= 3 && product.stock > 0) ? '<div class="stock-warning">¡Últimas unidades!</div>' : ''}
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-brand">${product.brand}</p>
      <p class="product-price">${formattedPrice}</p>
      <p class="product-description">${product.description}</p>
      <div class="product-stock">${stockStatus}</div>
      <div class="product-actions">
        <a href="https://wa.me/${product.whatsapp.replace(/[^0-9]/g, '')}?text=Hola, me interesa el perfume ${product.name}" 
           class="btn-whatsapp ${(typeof product.stock === 'number' && product.stock <= 0) || product.stock === 'Sin stock' ? 'disabled' : ''}" 
           target="_blank"
           ${(typeof product.stock === 'number' && product.stock <= 0) || product.stock === 'Sin stock' ? 'onclick="return false;"' : ''}>
          <i class="fab fa-whatsapp"></i> WhatsApp
        </a>
        <a href="https://instagram.com/${product.instagram.replace('@', '')}" 
           class="btn-instagram" target="_blank">
          <i class="fab fa-instagram"></i> Instagram
        </a>
      </div>
    </div>
  `;
  
  return card;
}

// Formulario de contacto
function initializeContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Crear mensaje para WhatsApp
    const whatsappMessage = `Hola! Soy ${name} (${email}). ${message}`;
    const whatsappUrl = `https://wa.me/573001234567?text=${encodeURIComponent(whatsappMessage)}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    // Mostrar mensaje de confirmación
    showNotification('¡Mensaje enviado! Te contactaremos pronto por WhatsApp.', 'success');
    
    // Limpiar formulario
    this.reset();
  });
}

// Efectos de scroll
function initializeScrollEffects() {
  const header = document.querySelector('.header');
  
  window.addEventListener('scroll', function() {
    if (window.scrollY > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = 'none';
    }
  });
  
  // Animaciones de entrada para elementos
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);
  
  // Observar elementos para animaciones
  const animatedElements = document.querySelectorAll('.feature, .stat, .contact-item');
  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
  });
}

// Menú móvil
function initializeMobileMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  
  hamburger.addEventListener('click', function() {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
  });
  
  // Cerrar menú al hacer click en un enlace
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('active');
      hamburger.classList.remove('active');
    });
  });
}

// Botones del hero
function initializeHeroButtons() {
  const heroButtons = document.querySelectorAll('.hero-content-overlay .btn');
  
  heroButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const filter = this.getAttribute('data-filter');
      
      if (filter) {
        // Cambiar filtro
        currentFilter = filter;
        
        // Actualizar botones de filtro
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        const activeButton = document.querySelector(`[data-filter="${filter}"]`);
        if (activeButton) {
          activeButton.classList.add('active');
        }
        
        // Filtrar productos
        filterProducts();
        
        // Scroll suave al catálogo
        const catalogSection = document.getElementById('catalogo');
        if (catalogSection) {
          const headerHeight = document.querySelector('.header').offsetHeight;
          const targetPosition = catalogSection.offsetTop - headerHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });
}

// Sistema de notificaciones
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Estilos para la notificación
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${type === 'success' ? '#4CAF50' : '#2196F3'};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
  `;
  
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remover después de 4 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 4000);
}

// Función para agregar productos dinámicamente (para uso futuro)
function addProduct(product) {
  productsData.push(product);
  if (currentFilter === 'all' || product.category === currentFilter) {
    loadProducts(true);
  }
}

// Función para actualizar productos (para uso futuro)
function updateProduct(id, updatedProduct) {
  const index = productsData.findIndex(product => product.id === id);
  if (index !== -1) {
    productsData[index] = { ...productsData[index], ...updatedProduct };
    loadProducts(true);
  }
}

// Función para eliminar productos (para uso futuro)
function removeProduct(id) {
  const index = productsData.findIndex(product => product.id === id);
  if (index !== -1) {
    productsData.splice(index, 1);
    loadProducts(true);
  }
}

// Función para cargar productos desde Google Sheets
async function loadProductsFromGoogleSheets() {
  try {
    showLoadingState();
    // Intentar cargar desde Google Sheets
    const sheetData = await fetchGoogleSheetsData();
    if (sheetData && sheetData.length > 0) {
      productsData = sheetData;
      console.log('Productos cargados desde Google Sheets:', productsData.length);
      showNotification(`Se cargaron ${productsData.length} productos desde Google Sheets`, 'success');
    } else {
      throw new Error('No se encontraron datos en Google Sheets');
    }
  } catch (error) {
    console.warn('Error cargando desde Google Sheets, usando datos de respaldo:', error);
    productsData = fallbackProducts;
    if (fallbackProducts.length === 0) {
      showNotification('No se pudieron cargar los productos. Verifica la configuración de Google Sheets.', 'info');
      showNoProductsMessage();
    } else {
      showNotification('Usando datos de respaldo. Verifica la configuración de Google Sheets.', 'info');
    }
  } finally {
    hideLoadingState();
    // Inicializar carrusel con productos destacados
    initializeCarousel();
    // FIX: Aplicar filtro inicial y recargar productos cuando se refresca
    applyInitialFilter();
    loadProducts(true);
  }
}

// Función para obtener datos de Google Sheets
async function fetchGoogleSheetsData() {
  const { sheetId, sheetName } = GOOGLE_SHEETS_CONFIG;
  
  // Construir URL para obtener datos como CSV
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
  
  try {
    const response = await fetch(csvUrl);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const csvText = await response.text();
    return parseCSVToProducts(csvText);
    
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

// Función para convertir CSV a array de productos
function parseCSVToProducts(csvText) {
  const lines = csvText.split('\n');
  const products = [];
  
  console.log('CSV recibido:', csvText.substring(0, 500)); // Debug
  
  // Saltar la primera línea (encabezados)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parsear línea CSV (maneja comillas y comas dentro de campos)
    const fields = parseCSVLine(line);
    
    console.log('Línea parseada:', fields); // Debug
    
    if (fields.length >= 6) { // Mínimo campos requeridos
      // Limpiar precio (remover $ y comas, manejar puntos como separadores de miles)
      let cleanPrice = fields[3] ? fields[3].replace(/[$]/g, '').replace(/,/g, '') : '0';
      
      // Si tiene punto y no es decimal (más de 2 dígitos después del punto), es separador de miles
      if (cleanPrice.includes('.')) {
        const parts = cleanPrice.split('.');
        if (parts.length === 2 && parts[1].length > 2) {
          // Es separador de miles, remover el punto
          cleanPrice = parts.join('');
        }
      }
      
      const finalPrice = parseFloat(cleanPrice) || 0;
      console.log(`Precio original: ${fields[3]}, Limpiado: ${cleanPrice}, Final: ${finalPrice}`); // Debug
      
      const product = {
        id: parseInt(fields[0]) || i,
        name: fields[1] || 'Sin nombre',
        brand: fields[2] || 'Sin marca',
        price: finalPrice,
        category: fields[4] ? fields[4].toLowerCase().trim() : 'unisex',
        description: fields[5] || 'Sin descripción',
        image: fields[6] || 'https://via.placeholder.com/300x400/8B4513/FFFFFF?text=Sin+Imagen',
        stock: parseInt(fields[7]) || 'Sin stock', // Cambiar default a 1 en lugar de 0
        whatsapp: fields[8] || '+573001234567',
        instagram: fields[9] || 'https://www.instagram.com/dm.parfum_/'
      };
      
      console.log('Producto creado:', product); // Debug
      
      // Solo agregar productos con stock > 0
      if (product.stock > 0 || product.stock === 'Sin stock') {
        products.push(product);
      }
    }
  }
  
  console.log('Productos finales:', products); // Debug
  return products;
}

// Función para parsear una línea CSV correctamente
function parseCSVLine(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  fields.push(current.trim());
  return fields;
}

// Función para mostrar estado de carga
function showLoadingState() {
  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    productsGrid.innerHTML = `
      <div class="loading-container" style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
        <div class="loading-spinner" style="
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        "></div>
        <p style="color: var(--text-light);">Cargando productos desde Google Sheets...</p>
      </div>
    `;
    
    // Agregar animación CSS si no existe
    if (!document.querySelector('#loading-styles')) {
      const style = document.createElement('style');
      style.id = 'loading-styles';
      style.textContent = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
  }
}

// Función para ocultar estado de carga
function hideLoadingState() {
  const loadingContainer = document.querySelector('.loading-container');
  if (loadingContainer) {
    loadingContainer.remove();
  }
}

// Función para mostrar mensaje cuando no hay productos
function showNoProductsMessage() {
  const productsGrid = document.getElementById('products-grid');
  if (productsGrid) {
    productsGrid.innerHTML = `
      <div class="no-products-container" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
        <div style="font-size: 4rem; color: var(--text-light); margin-bottom: 1rem;">
          <i class="fas fa-box-open"></i>
        </div>
        <h3 style="color: var(--text-dark); margin-bottom: 1rem;">No hay productos disponibles</h3>
        <p style="color: var(--text-light); margin-bottom: 2rem;">
          Los productos se cargan desde Google Sheets. Verifica la configuración.
        </p>
        <button onclick="DmParfum.refreshProducts()" class="btn btn-primary">
          <i class="fas fa-sync-alt"></i> Intentar de nuevo
        </button>
      </div>
    `;
  }
}

// Funciones del carrusel
function initializeCarousel() {
  // Filtrar productos con stock > 0 para el carrusel
  carouselItems = productsData.filter(product => 
    (typeof product.stock === 'number' && product.stock > 0) || 
    product.stock === 'Sin stock'
  );
  
  // Limitar a 6 productos para el carrusel
  carouselItems = carouselItems.slice(0, 6);
  
  loadCarouselItems();
  createCarouselDots();
}

function loadCarouselItems() {
  const carouselTrack = document.getElementById('carousel-track');
  if (!carouselTrack) return;
  
  carouselTrack.innerHTML = '';
  
  carouselItems.forEach(product => {
    const carouselItem = createCarouselItem(product);
    carouselTrack.appendChild(carouselItem);
  });
  
  updateCarouselPosition();
}

function createCarouselItem(product) {
  const item = document.createElement('div');
  item.className = 'carousel-item';
  
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(product.price);
  
  const stockStatus = (typeof product.stock === 'number' && product.stock > 0) ? 
    `<span class="stock-available">Disponible (${product.stock})</span>` : 
    `<span class="stock-unavailable">Sin stock</span>`;
  
  item.innerHTML = `
    <div class="carousel-item-image" style="background-image: url('${product.image}')">
      ${(typeof product.stock === 'number' && product.stock <= 3 && product.stock > 0) ? 
        '<div class="stock-warning">¡Últimas unidades!</div>' : ''}
    </div>
    <div class="carousel-item-info">
      <h3 class="carousel-item-name">${product.name}</h3>
      <p class="carousel-item-brand">${product.brand}</p>
      <p class="carousel-item-price">${formattedPrice}</p>
      <div class="carousel-item-stock">${stockStatus}</div>
      <div class="carousel-item-actions">
        <a href="https://wa.me/${product.whatsapp.replace(/[^0-9]/g, '')}?text=Hola, me interesa el perfume ${product.name}" 
           class="btn btn-whatsapp ${(typeof product.stock === 'number' && product.stock <= 0) || product.stock === 'Sin stock' ? 'disabled' : ''}" 
           target="_blank"
           ${(typeof product.stock === 'number' && product.stock <= 0) || product.stock === 'Sin stock' ? 'onclick="return false;"' : ''}>
          <i class="fab fa-whatsapp"></i>
        </a>
        <a href="${product.instagram}" 
           class="btn btn-instagram" target="_blank">
          <i class="fab fa-instagram"></i>
        </a>
      </div>
    </div>
  `;
  
  return item;
}

function createCarouselDots() {
  const dotsContainer = document.getElementById('carousel-dots');
  if (!dotsContainer) return;
  
  dotsContainer.innerHTML = '';
  const totalSlides = Math.ceil(carouselItems.length / itemsPerView);
  
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }
}

function moveCarousel(direction) {
  const totalSlides = Math.ceil(carouselItems.length / itemsPerView);
  currentCarouselIndex += direction;
  
  if (currentCarouselIndex < 0) {
    currentCarouselIndex = totalSlides - 1;
  } else if (currentCarouselIndex >= totalSlides) {
    currentCarouselIndex = 0;
  }
  
  updateCarouselPosition();
  updateCarouselDots();
}

function goToSlide(slideIndex) {
  currentCarouselIndex = slideIndex;
  updateCarouselPosition();
  updateCarouselDots();
}

function updateCarouselPosition() {
  const carouselTrack = document.getElementById('carousel-track');
  if (!carouselTrack) return;
  
  const itemWidth = 300 + 32; // 300px + 32px gap
  const translateX = -currentCarouselIndex * itemWidth * itemsPerView;
  carouselTrack.style.transform = `translateX(${translateX}px)`;
}

function updateCarouselDots() {
  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentCarouselIndex);
  });
}

// Función para actualizar configuración de Google Sheets
function updateGoogleSheetsConfig(newConfig) {
  Object.assign(GOOGLE_SHEETS_CONFIG, newConfig);
  console.log('Configuración de Google Sheets actualizada:', GOOGLE_SHEETS_CONFIG);
}

// Función para recargar productos manualmente
function refreshProducts() {
  loadProductsFromGoogleSheets();
}

// Exportar funciones para uso global
window.DmParfum = {
  addProduct,
  updateProduct,
  removeProduct,
  showNotification,
  loadProductsFromGoogleSheets,
  updateGoogleSheetsConfig,
  refreshProducts,
  initializeCarousel,
  moveCarousel,
  GOOGLE_SHEETS_CONFIG
};
