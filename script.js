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
let searchQuery = '';
// Debounce para el buscador
let searchDebounce = null;

// Variables del carrusel
let currentCarouselIndex = 0;
let carouselItems = [];
let itemsPerView = 3;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeContactForm();
  initializeScrollEffects();
  initializeMobileMenu();
  initializeHeroButtons();
  initializeScroll();
  initializeMobileFilters();
  initializeTouchOptimizations();
  // Cargar productos desde Google Sheets y luego inicializar filtros (para que existan las marcas)
  loadProductsFromGoogleSheets().then(() => {
    initializeFilters();
  });
});

// Menú hamburguesa (mobile)
function initializeMobileMenu() {
  const containers = document.querySelectorAll('.nav-container');
  if (!containers.length) return;

  containers.forEach(container => {
    const hamburger = container.querySelector('.hamburger');
    const navMenu = container.querySelector('.nav-menu');
    if (!hamburger || !navMenu) return;

    if (hamburger._dmBound) return; // evitar doble binding por contenedor
    hamburger._dmBound = true;

    const toggleMenu = () => {
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
    };

    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      toggleMenu();
    });

    // Cerrar al hacer clic en un link del menú
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  });

  // Cerrar al hacer clic fuera (global)
  document.addEventListener('click', function(e) {
    document.querySelectorAll('.nav-container').forEach(container => {
      const hamburger = container.querySelector('.hamburger');
      const navMenu = container.querySelector('.nav-menu');
      if (!hamburger || !navMenu) return;
      const isClickInside = navMenu.contains(e.target) || hamburger.contains(e.target);
      if (!isClickInside) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      }
    });
  });

  // Reset en resize (evita estados trabados)
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      document.querySelectorAll('.nav-container').forEach(container => {
        const hamburger = container.querySelector('.hamburger');
        const navMenu = container.querySelector('.nav-menu');
        if (!hamburger || !navMenu) return;
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
      });
    }
  });
}

// Inicializar menú móvil si el DOM ya está listo
if (document.readyState !== 'loading') {
  try { initializeMobileMenu(); } catch (_) {}
}

// Fallback: delegación global para asegurar toggle en cualquier página
document.addEventListener('click', function(e) {
  const hb = e.target.closest('.hamburger');
  if (hb) {
    const container = hb.closest('.nav-container') || document;
    const navMenu = container.querySelector('.nav-menu');
    if (navMenu) {
      e.stopPropagation();
      hb.classList.toggle('active');
      navMenu.classList.toggle('active');
    }
  }

  const navLink = e.target.closest('.nav-menu a');
  if (navLink) {
    const container = navLink.closest('.nav-container');
    const hb2 = container?.querySelector('.hamburger');
    const menu2 = container?.querySelector('.nav-menu');
    hb2 && hb2.classList.remove('active');
    menu2 && menu2.classList.remove('active');
  }
});

// Navegación suave
function initializeNavigation() {
  const navLinks = document.querySelectorAll('.nav-link, .scroll');

  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href') || '';
      if (!href) return;

      // Caso 1: ancla en la misma página (#seccion)
      if (href.startsWith('#')) {
        e.preventDefault();
        const targetId = href.substring(1);
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
          const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
          const targetPosition = targetSection.offsetTop - headerHeight;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
        return;
      }

      // Caso 2: enlace con ruta + ancla (ej: index.html#contacto)
      if (href.includes('#')) {
        const [path, hash] = href.split('#');
        const currentPage = (window.location.pathname.split('/').pop() || 'index.html');
        // Si el path apunta a la página actual, hacer scroll suave sin recargar
        if (path === '' || path === currentPage) {
          e.preventDefault();
          const targetId = hash;
          const targetSection = document.getElementById(targetId);
          if (targetSection) {
            const headerHeight = document.querySelector('.header')?.offsetHeight || 0;
            const targetPosition = targetSection.offsetTop - headerHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
          }
          return;
        }
        // Si el path es otra página, permitir navegación normal (no prevenir)
        return; // no hacemos preventDefault
      }

      // Otros enlaces (a otra página) navegan normalmente
    });
  });
}

// Scroll suave
function initializeScroll() {
  const scrollLinks = document.querySelectorAll('.scroll');
  
  scrollLinks.forEach(link => {
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
  const filtroStock = document.getElementById('filtro-stock');
  const precioMin = document.getElementById('precio-min');
  const precioMax = document.getElementById('precio-max');
  const filtroMarca = document.getElementById('filtro-marca');
  const ordenarSelect = document.getElementById('ordenar-select');
  const searchInput = document.getElementById('search-input');
  const clearSearchBtn = document.getElementById('clear-search');
  const searchbarEl = document.getElementById('searchbar');

  // --- Rellenar marcas dinámicamente SIEMPRE que cambian los datos ---
  if (filtroMarca) {
    const marcas = [...new Set(productsData.map(p => p.brand).filter(Boolean))].sort();
    const brandFilters = document.getElementById('brand-filters');
    if (brandFilters) {
      brandFilters.innerHTML = marcas.map(marca => `
        <div class="brand-filter-item">
          <input type="checkbox" class="marca-checkbox" value="${marca}" id="marca-${marca.replace(/\s+/g, '-')}">
          <label for="marca-${marca.replace(/\s+/g, '-')}">${marca}</label>
        </div>
      `).join('');
      // Volver a agregar evento después de regenerar el HTML
      brandFilters.querySelectorAll('.marca-checkbox').forEach(cb => {
        cb.addEventListener('change', filterProducts);
      });
    }
  }

  // Eventos de filtro de categoría
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.getAttribute('data-filter');
      filterProducts();
    });
  });

  // Evento filtro stock
  if (filtroStock) {
    filtroStock.addEventListener('change', filterProducts);
  }
  // Evento filtro precio
  if (precioMin) precioMin.addEventListener('input', filterProducts);
  if (precioMax) precioMax.addEventListener('input', filterProducts);
  // Evento filtro marca
  filtroMarca && filtroMarca.addEventListener('change', filterProducts);
  // Evento ordenar
  if (ordenarSelect) ordenarSelect.addEventListener('change', filterProducts);

  // Buscador por nombre
  if (searchInput) {
    // Estado inicial de la UI del buscador
    searchbarEl && searchbarEl.classList.toggle('has-value', searchInput.value.trim().length > 0);
    searchQuery = (searchInput.value || '').trim().toLowerCase();

    searchInput.addEventListener('input', function() {
      const val = this.value.trim();
      if (searchbarEl) searchbarEl.classList.toggle('has-value', val.length > 0);
      searchQuery = val.toLowerCase();
      if (searchDebounce) clearTimeout(searchDebounce);
      searchDebounce = setTimeout(() => {
        filterProducts();
      }, 200);
    });
  }
  if (clearSearchBtn && searchInput) {
    clearSearchBtn.addEventListener('click', function(e) {
      e.preventDefault();
      searchInput.value = '';
      searchQuery = '';
      searchbarEl && searchbarEl.classList.remove('has-value');
      filterProducts();
    });
  }
}

// Filtrar productos
function filterProducts() {
  let result = productsData;

  // Filtro de categoría
  if (currentFilter !== 'all') {
    result = result.filter(product => product.category === currentFilter);
  }

  // Filtro de marcas
  const marcaChecks = document.querySelectorAll('.marca-checkbox:checked');
  if (marcaChecks.length > 0) {
    const marcasSel = Array.from(marcaChecks).map(cb => cb.value);
    result = result.filter(product => marcasSel.includes(product.brand));
  }

  // Filtro de stock
  const filtroStock = document.getElementById('filtro-stock');
  if (filtroStock && filtroStock.checked) {
    result = result.filter(product => typeof product.stock === 'number' && product.stock > 0);
  }

  // Filtro de precio
  const precioMin = parseFloat(document.getElementById('precio-min')?.value) || null;
  const precioMax = parseFloat(document.getElementById('precio-max')?.value) || null;
  if (precioMin !== null) {
    result = result.filter(product => product.price >= precioMin);
  }
  if (precioMax !== null) {
    result = result.filter(product => product.price <= precioMax);
  }

  // Filtro por nombre (buscador)
  {
    const inputVal = document.getElementById('search-input')?.value || '';
    const q = (inputVal ? inputVal : (typeof searchQuery === 'string' ? searchQuery : '')).trim().toLowerCase();
    if (q) {
      result = result.filter(product => (product.name || '').toLowerCase().includes(q));
    }
  }

  // Ordenamiento
  const ordenar = document.getElementById('ordenar-select')?.value;
  if (ordenar === 'precio-desc') {
    result = result.slice().sort((a, b) => b.price - a.price);
  } else if (ordenar === 'precio-asc') {
    result = result.slice().sort((a, b) => a.price - b.price);
  } else if (ordenar === 'nombre-az') {
    result = result.slice().sort((a, b) => a.name.localeCompare(b.name));
  } else if (ordenar === 'nombre-za') {
    result = result.slice().sort((a, b) => b.name.localeCompare(a.name));
  } // 'Más relevantes' mantiene el orden original del Excel/Google Sheets

  filteredProducts = result;
  // Recargar productos con animación
  loadProducts(true);
  
  // Actualizar contador después de filtrar
  setTimeout(() => {
    if (typeof updateProductsCount === 'function') {
      updateProductsCount(result.length);
    }
    // Actualizar contador de filtros activos
    updateFilterCount();
  }, 100);
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
  
  // Si no existe el products-grid, no hacer nada (estamos en otra página)
  if (!productsGrid) {
    console.log('products-grid no encontrado, saltando loadProducts');
    return;
  }
  
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
  
  const isOutOfStock = (typeof product.stock === 'number' && product.stock <= 0) || product.stock === 'Sin stock';
  const stockStatus = isOutOfStock ?
    `<span class="stock-unavailable">Sin stock</span>` :
    `<span class="stock-available">Disponible (${product.stock})</span>`;
  const actionsHtml = isOutOfStock
    ? `<div class="product-actions">
         <a href="productos.html?id=${product.id}" class="btn btn-secondary btn-info btn-info-wide" onclick="event.stopPropagation()">
           <i class="fas fa-info-circle"></i>
         </a>
       </div>`
    : `<div class="product-actions">
         <button class="btn btn-primary btn-add-cart" onclick="event.stopPropagation(); addToCart(${product.id})">
           <i class="fas fa-shopping-cart"></i> <span class="btn-text">Agregar</span>
         </button>
         <a href="productos.html?id=${product.id}" class="btn btn-secondary btn-info" onclick="event.stopPropagation()">
           <i class="fas fa-info-circle"></i>
         </a>
       </div>`;
  
  card.innerHTML = `
    <div class="product-image" onclick="window.location.href='productos.html?id=${product.id}'" style="cursor: pointer;">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
      ${(typeof product.stock === 'number' && product.stock <= 2 && product.stock > 0) ? '<div class="stock-warning">¡Últimas unidades!</div>' : ''}
    </div>
    <div class="product-info" onclick="window.location.href='productos.html?id=${product.id}'" style="cursor: pointer;">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-brand">${product.brand}</p>
      <p class="product-price">${formattedPrice}</p>
      <div class="product-stock">${stockStatus}</div>
    </div>
    ${actionsHtml}
  `;
  // Hacer toda la tarjeta clickeable para ir al detalle
  card.style.cursor = 'pointer';
  card.addEventListener('click', function() {
    window.location.href = `productos.html?id=${product.id}`;
  });
  
  return card;
}

// Formulario de contacto
function initializeContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const name = formData.get('name');
    const message = formData.get('message');
    
    // Crear mensaje para WhatsApp
    const whatsappMessage = `Hola! Soy ${name} ${message}`;
    const whatsappUrl = `https://wa.me/541162634332?text=${encodeURIComponent(whatsappMessage)}`;
    
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
  let lastScrollTop = 0;
  let scrollTimeout;
  
  let lastKnownScrollY = 0;
  let tickingRAF = false;

  function onScroll() {
    lastKnownScrollY = window.pageYOffset || document.documentElement.scrollTop;
    requestTick();
  }

  function requestTick() {
    if (tickingRAF) return;
    tickingRAF = true;
    requestAnimationFrame(updateHeaderOnScroll);
  }

  function updateHeaderOnScroll() {
    const scrollTop = lastKnownScrollY;
    if (window.innerWidth <= 768) {
      if (scrollTop > lastScrollTop && scrollTop > 80) {
        header.style.transform = 'translateY(-100%)';
        document.body.classList.add('header-hidden');
      } else {
        header.style.transform = 'translateY(0)';
        document.body.classList.remove('header-hidden');
      }
    } else {
      header.style.transform = 'translateY(0)';
      document.body.classList.remove('header-hidden');
    }

    if (scrollTop > 100) {
      header.style.background = 'rgba(255, 255, 255, 0.98)';
      header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.background = 'rgba(255, 255, 255, 0.95)';
      header.style.boxShadow = 'none';
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    tickingRAF = false;
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  function onResize() {
    if (window.innerWidth > 768) {
      header.style.transform = 'translateY(0)';
      document.body.classList.remove('header-hidden');
    } else {
      // Reaplicar estado en móvil según posición actual
      lastKnownScrollY = window.pageYOffset || document.documentElement.scrollTop;
      updateHeaderOnScroll();
    }
  }
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  // Fijar estado inicial
  updateHeaderOnScroll();
  
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
  
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      const isActive = navMenu.classList.toggle('active');
      hamburger.classList.toggle('active');
      
      // Lock/unlock body scroll
      if (isActive) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
    
    // Cerrar menú al hacer click en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', function() {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
    
    // Cerrar menú al hacer click fuera
    document.addEventListener('click', function(e) {
      if (navMenu.classList.contains('active') && 
          !navMenu.contains(e.target) && 
          !hamburger.contains(e.target)) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
    
    // Cerrar menú con tecla ESC
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }
}

// Variables globales para el modal de filtros móviles
let mobileFiltersModal = null;
let mobileFiltersBtn = null;

// Función para abrir el modal - global para debugging
// Definida antes de DOMContentLoaded para que esté disponible en onclick inline
window.openMobileFilters = function openMobileFilters() {
  console.log('🔵 [DEBUG] openMobileFilters llamada');
  
  if (!mobileFiltersModal) {
    mobileFiltersModal = document.getElementById('mobile-filters-modal');
  }
  
  if (!mobileFiltersModal) {
    console.error('❌ Modal no encontrado');
    return;
  }
  
  console.log('🔵 Abriendo modal de filtros móviles');
  
  // Forzar todas las propiedades necesarias directamente
  mobileFiltersModal.style.display = 'block';
  mobileFiltersModal.style.opacity = '1';
  mobileFiltersModal.style.visibility = 'visible';
  mobileFiltersModal.style.pointerEvents = 'auto';
  
  // Copiar filtros
  copyFiltersToMobile();
  
  // Agregar clase active después de un pequeño delay para la animación
  setTimeout(() => {
    mobileFiltersModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Verificar que se aplicó correctamente
    const computed = window.getComputedStyle(mobileFiltersModal);
    console.log('✅ Modal abierto:', {
      display: computed.display,
      opacity: computed.opacity,
      visibility: computed.visibility,
      classList: mobileFiltersModal.classList.toString()
    });
  }, 50);
}

// Función para cerrar el modal - global para debugging
window.closeMobileFilters = function closeMobileFilters() {
  console.log('🔴 Cerrando modal de filtros móviles');
  
  if (!mobileFiltersModal) {
    mobileFiltersModal = document.getElementById('mobile-filters-modal');
  }
  
  if (!mobileFiltersModal) return;
  
  mobileFiltersModal.classList.remove('active');
  document.body.style.overflow = '';
  
  setTimeout(() => {
    if (!mobileFiltersModal.classList.contains('active')) {
      mobileFiltersModal.style.display = 'none';
    }
  }, 300);
}

// Filtros móviles
function initializeMobileFilters() {
  console.log('🚀 Inicializando filtros móviles...');
  
  // Usar variables globales
  mobileFiltersBtn = document.getElementById('mobile-filters-btn');
  mobileFiltersModal = document.getElementById('mobile-filters-modal');
  const closeMobileFiltersBtn = document.getElementById('close-mobile-filters');
  const applyMobileFilters = document.getElementById('apply-mobile-filters');
  
  console.log('Elementos encontrados:', {
    boton: !!mobileFiltersBtn,
    modal: !!mobileFiltersModal,
    cerrar: !!closeMobileFiltersBtn,
    aplicar: !!applyMobileFilters
  });
  
  if (!mobileFiltersBtn) {
    console.error('❌ Botón de filtros móviles no encontrado');
    return;
  }
  
  if (!mobileFiltersModal) {
    console.error('❌ Modal de filtros móviles no encontrado');
    return;
  }

  // Asegurar que el modal esté cerrado al inicio
  mobileFiltersModal.classList.remove('active');
  mobileFiltersModal.style.display = 'none';
  document.body.style.overflow = '';
  
  console.log('✅ Filtros móviles inicializados correctamente');

  // EVENTO CLICK - método más simple y directo
  mobileFiltersBtn.onclick = function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ [ONCLICK] Click detectado en botón de filtros');
    openMobileFilters();
    return false;
  };
  
  // También usar addEventListener como respaldo
  mobileFiltersBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    console.log('🖱️ [ADD EVENT LISTENER] Click detectado en botón de filtros');
    openMobileFilters();
    return false;
  }, false);
  
  // Evento touch para móviles
  let touchHandled = false;
  mobileFiltersBtn.addEventListener('touchstart', function(e) {
    touchHandled = false;
  }, { passive: true });
  
  mobileFiltersBtn.addEventListener('touchend', function(e) {
    if (!touchHandled) {
      e.preventDefault();
      e.stopPropagation();
      console.log('👆 Touch end en botón de filtros');
      touchHandled = true;
      openMobileFilters();
      return false;
    }
  }, false);
  
  // Eventos para el botón de cerrar
  if (closeMobileFiltersBtn) {
    closeMobileFiltersBtn.onclick = function(e) {
      e.preventDefault();
      closeMobileFilters();
    };
  }
  
  // Evento para aplicar filtros
  if (applyMobileFilters) {
    applyMobileFilters.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Aplicando filtros móviles');
      copyFiltersFromMobile();
      filterProducts();
      updateFilterCount();
      closeMobileFilters();
    };
  }

  // Cierra al hacer click en el fondo gris oscuro
  mobileFiltersModal.onclick = function(e) {
    if (e.target === mobileFiltersModal) {
      closeMobileFilters();
    }
  };
  
  // Evita el cierre si el click es dentro del contenido
  const modalContent = mobileFiltersModal.querySelector('.mobile-filters-content');
  if (modalContent) {
    modalContent.onclick = function(e) { 
      e.stopPropagation(); 
    };
  }
  
  // Escape key para cerrar
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mobileFiltersModal.classList.contains('active')) {
      closeMobileFilters();
    }
  });
  
  // Las funciones ya están expuestas globalmente arriba
  console.log('✅ Eventos registrados. Prueba: window.openMobileFilters()');
  
  // Verificar que todo esté conectado
  setTimeout(() => {
    console.log('🔍 Verificación final:', {
      boton: !!mobileFiltersBtn,
      modal: !!mobileFiltersModal,
      funcionAbierta: typeof window.openMobileFilters === 'function',
      funcionCerrada: typeof window.closeMobileFilters === 'function'
    });
  }, 1000);
}

// Copiar filtros del sidebar al modal móvil
function copyFiltersToMobile() {
  const sidebarFilters = document.querySelector('.sidebar-filtros');
  const mobileFiltersContent = document.getElementById('mobile-filters-content');
  
  if (!sidebarFilters) {
    console.warn('⚠️ Sidebar de filtros no encontrado');
    if (mobileFiltersContent) {
      mobileFiltersContent.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-medium);">Los filtros se están cargando...</div>';
    }
    return;
  }
  
  if (!mobileFiltersContent) {
    console.warn('⚠️ Contenedor móvil de filtros no encontrado');
    return;
  }
  
  console.log('📋 Copiando filtros al modal móvil...');
  console.log('Sidebar encontrado:', !!sidebarFilters);
  console.log('Contenido del sidebar:', sidebarFilters.innerHTML.substring(0, 200));
  
  try {
    // Clonar el contenido del sidebar con todos sus hijos
    const clonedFilters = sidebarFilters.cloneNode(true);
    
    // Remover el header del sidebar clonado
    const clonedHeader = clonedFilters.querySelector('.filters-header');
    if (clonedHeader) {
      clonedHeader.remove();
    }
    
    // Cambiar IDs duplicados para evitar conflictos
    clonedFilters.querySelectorAll('[id]').forEach(el => {
      const originalId = el.id;
      if (originalId) {
        el.id = 'mobile-' + originalId;
        // Actualizar el atributo 'for' de los labels que apuntan a estos IDs
        const label = clonedFilters.querySelector(`label[for="${originalId}"]`);
        if (label) {
          label.setAttribute('for', 'mobile-' + originalId);
        }
      }
    });
    
    // Limpiar y agregar el contenido clonado
    mobileFiltersContent.innerHTML = '';
    mobileFiltersContent.appendChild(clonedFilters);
    
    console.log('✅ Contenido agregado al modal');
    console.log('Contenido del modal:', mobileFiltersContent.innerHTML.substring(0, 300));
    
    // Verificar que se copiaron los elementos
    const filterButtons = mobileFiltersContent.querySelectorAll('.filter-btn');
    const brandFilters = mobileFiltersContent.querySelectorAll('.marca-checkbox, .brand-filter-item');
    const stockCheckbox = mobileFiltersContent.querySelector('[id*="filtro-stock"]');
    const priceInputs = mobileFiltersContent.querySelectorAll('[id*="precio"]');
    
    console.log('📊 Filtros copiados:', {
      botonesCategoria: filterButtons.length,
      marcas: brandFilters.length,
      stock: !!stockCheckbox,
      precio: priceInputs.length
    });
    
    // Reagregar eventos a los elementos clonados
    reattachFilterEvents(mobileFiltersContent);
    
    console.log('✅ Filtros copiados al modal móvil exitosamente');
  } catch (error) {
    console.error('❌ Error al copiar filtros al modal móvil:', error);
    console.error('Stack:', error.stack);
    if (mobileFiltersContent) {
      mobileFiltersContent.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-medium);">
          <p>Error al cargar los filtros.</p>
          <p style="font-size: 0.8rem; margin-top: 0.5rem;">Intenta recargar la página.</p>
        </div>
      `;
    }
  }
}

// Copiar filtros del modal móvil al sidebar
function copyFiltersFromMobile() {
  const mobileFiltersContent = document.getElementById('mobile-filters-content');
  const sidebarFilters = document.querySelector('.sidebar-filtros');
  
  if (!mobileFiltersContent || !sidebarFilters) {
    console.log('⚠️ Contenido móvil o sidebar no encontrado');
    return;
  }
  
  console.log('📋 Copiando filtros desde modal móvil al sidebar');
  
  // Obtener valores de los filtros móviles (usando selectores que funcionan con IDs con prefijo mobile-)
  const mobileFilterButtons = mobileFiltersContent.querySelectorAll('.filter-btn');
  const mobileBrandCheckboxes = mobileFiltersContent.querySelectorAll('.marca-checkbox, input[type="checkbox"][id*="marca"]');
  const mobileStockCheckbox = mobileFiltersContent.querySelector('[id*="filtro-stock"]');
  const mobilePriceMin = mobileFiltersContent.querySelector('[id*="precio-min"]');
  const mobilePriceMax = mobileFiltersContent.querySelector('[id*="precio-max"]');
  
  // Aplicar valores al sidebar
  mobileFilterButtons.forEach(mobileBtn => {
    const filterValue = mobileBtn.getAttribute('data-filter');
    const sidebarBtn = sidebarFilters.querySelector(`[data-filter="${filterValue}"]`);
    if (sidebarBtn) {
      sidebarBtn.classList.toggle('active', mobileBtn.classList.contains('active'));
      // Actualizar currentFilter si es necesario
      if (mobileBtn.classList.contains('active')) {
        currentFilter = filterValue;
      }
    }
  });
  
  mobileBrandCheckboxes.forEach(mobileCheckbox => {
    const brandValue = mobileCheckbox.value;
    const sidebarCheckbox = sidebarFilters.querySelector(`input[value="${brandValue}"]`);
    if (sidebarCheckbox) {
      sidebarCheckbox.checked = mobileCheckbox.checked;
    }
  });
  
  if (mobileStockCheckbox) {
    const sidebarStockCheckbox = sidebarFilters.querySelector('#filtro-stock');
    if (sidebarStockCheckbox) {
      sidebarStockCheckbox.checked = mobileStockCheckbox.checked;
    }
  }
  
  if (mobilePriceMin) {
    const sidebarPriceMin = sidebarFilters.querySelector('#precio-min');
    if (sidebarPriceMin) {
      sidebarPriceMin.value = mobilePriceMin.value;
    }
  }
  
  if (mobilePriceMax) {
    const sidebarPriceMax = sidebarFilters.querySelector('#precio-max');
    if (sidebarPriceMax) {
      sidebarPriceMax.value = mobilePriceMax.value;
    }
  }
  
  console.log('Filtros copiados desde modal móvil al sidebar');
}

// Reagregar eventos a los filtros clonados
function reattachFilterEvents(container) {
  console.log('🔗 Reagregando eventos a filtros móviles...');
  
  // Eventos para botones de filtro
  const filterButtons = container.querySelectorAll('.filter-btn');
  console.log('Botones de filtro encontrados:', filterButtons.length);
  
  filterButtons.forEach(button => {
    // Remover listeners anteriores clonando el botón
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);
    
    newButton.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      filterButtons.forEach(btn => {
        if (btn !== newButton) btn.classList.remove('active');
      });
      newButton.classList.add('active');
      console.log('Botón de filtro activado:', newButton.getAttribute('data-filter'));
    });
    
    // Soporte para touch
    newButton.addEventListener('touchend', function(e) {
      e.preventDefault();
      e.stopPropagation();
      filterButtons.forEach(btn => {
        if (btn !== newButton) btn.classList.remove('active');
      });
      newButton.classList.add('active');
      console.log('Botón de filtro activado (touch):', newButton.getAttribute('data-filter'));
    });
  });
  
  // Eventos para checkboxes de marca
  const brandCheckboxes = container.querySelectorAll('.marca-checkbox, input[type="checkbox"][id*="marca"]');
  console.log('Checkboxes de marca encontrados:', brandCheckboxes.length);
  
  brandCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function(e) {
      e.stopPropagation();
      console.log('Checkbox de marca cambiado:', checkbox.value, checkbox.checked);
      // No hacer nada aquí, se aplicará cuando se presione "Aplicar Filtros"
    });
  });
  
  // Eventos para checkbox de stock (usar selector flexible para IDs con prefijo mobile-)
  const stockCheckbox = container.querySelector('[id*="filtro-stock"]');
  console.log('Checkbox de stock encontrado:', !!stockCheckbox);
  
  if (stockCheckbox) {
    stockCheckbox.addEventListener('change', function(e) {
      e.stopPropagation();
      console.log('Checkbox de stock cambiado:', stockCheckbox.checked);
      // No hacer nada aquí, se aplicará cuando se presione "Aplicar Filtros"
    });
  }
  
  // Eventos para los inputs de precio (usar selectores flexibles)
  const priceMin = container.querySelector('[id*="precio-min"]');
  const priceMax = container.querySelector('[id*="precio-max"]');
  console.log('Inputs de precio encontrados:', !!priceMin, !!priceMax);
  
  if (priceMin) {
    priceMin.addEventListener('input', function(e) {
      e.stopPropagation();
    });
  }
  if (priceMax) {
    priceMax.addEventListener('input', function(e) {
      e.stopPropagation();
    });
  }
  
  console.log('✅ Eventos reagregados correctamente');
}

// Actualizar contador de filtros activos
function updateFilterCount() {
  const filterCount = document.getElementById('filter-count');
  if (!filterCount) return;
  
  let activeFilters = 0;
  
  // Contar filtros de categoría activos (excluyendo "all")
  const activeCategoryFilter = document.querySelector('.filter-btn.active:not([data-filter="all"])');
  if (activeCategoryFilter) activeFilters++;
  
  // Contar marcas seleccionadas
  const selectedBrands = document.querySelectorAll('.marca-checkbox:checked');
  activeFilters += selectedBrands.length;
  
  // Contar filtro de stock
  const stockFilter = document.getElementById('filtro-stock');
  if (stockFilter && stockFilter.checked) activeFilters++;
  
  // Contar filtros de precio
  const priceMin = document.getElementById('precio-min');
  const priceMax = document.getElementById('precio-max');
  if (priceMin && priceMin.value) activeFilters++;
  if (priceMax && priceMax.value) activeFilters++;
  
  filterCount.textContent = activeFilters;
  filterCount.style.display = activeFilters > 0 ? 'flex' : 'none';
}

// Optimizaciones táctiles para móviles
function initializeTouchOptimizations() {
  // Prevenir zoom en inputs en iOS
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      if (window.innerWidth <= 768) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }
    });
    
    input.addEventListener('blur', function() {
      if (window.innerWidth <= 768) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        }
      }
    });
  });
  
  // Mejorar la experiencia de scroll en móviles
  let isScrolling = false;
  window.addEventListener('scroll', function() {
    if (!isScrolling) {
      window.requestAnimationFrame(function() {
        // Aquí se pueden agregar efectos de scroll optimizados
        isScrolling = false;
      });
      isScrolling = true;
    }
  });
  
  // Prevenir el comportamiento de pull-to-refresh en móviles
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });
  
  let lastTouchEnd = 0;
  document.addEventListener('touchend', function(e) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, false);
  
  // Optimizar el carrusel para touch
  const carouselTrack = document.getElementById('carousel-track');
  if (carouselTrack) {
    let startX = 0;
    let currentX = 0;
    let moved = false;
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    carouselTrack.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      currentX = startX;
      currentY = startY;
      moved = false;
      isDragging = true;
    }, { passive: true });
    
    carouselTrack.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      if (Math.abs(currentX - startX) > 5 || Math.abs(currentY - startY) > 5) moved = true;
    }, { passive: true });
    
    carouselTrack.addEventListener('touchend', function(e) {
      if (!isDragging) return;
      isDragging = false;
      
      const diffX = startX - currentX;
      const diffY = startY - currentY;
      const threshold = 70; // umbral mayor para evitar falsos positivos
      const isHorizontal = Math.abs(diffX) > Math.abs(diffY);
      
      if (moved && isHorizontal && Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swipe left - next
          moveCarousel(1);
        } else {
          // Swipe right - previous
          moveCarousel(-1);
        }
      }
    }, { passive: true });
  }
  
  // Listener para redimensionar ventana
  window.addEventListener('resize', function() {
    if (typeof updateCarouselItemsPerView === 'function') {
      updateCarouselItemsPerView();
      if (typeof updateCarouselPosition === 'function') {
        updateCarouselPosition();
      }
    }
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
      // Solo mostrar mensaje de no productos si estamos en la página del catálogo
      if (document.getElementById('products-grid')) {
        showNoProductsMessage();
      }
    } else {
      showNotification('Usando datos de respaldo. Verifica la configuración de Google Sheets.', 'info');
    }
  } finally {
    hideLoadingState();
    // Inicializar carrusel con productos destacados
    initializeCarousel();
    // FIX: Aplicar filtro inicial y recargar productos cuando se refresca
    applyInitialFilter();
    // Solo cargar productos si estamos en la página del catálogo
    if (document.getElementById('products-grid')) {
      loadProducts(true);
    }
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
        whatsapp: fields[8] || '+54 11 2712-0295',
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
  } else {
    console.log('products-grid no encontrado, saltando showLoadingState');
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
  } else {
    console.log('products-grid no encontrado, saltando showNoProductsMessage');
  }
}

// Funciones del carrusel
function initializeCarousel() {
  // Filtrar productos con stock > 0 para el carrusel
  carouselItems = productsData.filter(product => 
    typeof product.stock === 'number' && product.stock > 0
  );
  
  // Limitar a 9 productos para el carrusel
  carouselItems = carouselItems.slice(0, 12);
  
  // Ajustar itemsPerView según el tamaño de pantalla
  updateCarouselItemsPerView();
  
  loadCarouselItems();
  createCarouselDots();
  // Recalcular al redimensionar para evitar cortes y páginas en blanco
  window.addEventListener('resize', handleCarouselResize, { passive: true });
}

// Función para actualizar itemsPerView según el tamaño de pantalla
function updateCarouselItemsPerView() {
  if (window.innerWidth <= 480) {
    itemsPerView = 1;
  } else if (window.innerWidth <= 768) {
    itemsPerView = 2;
  } else {
    itemsPerView = 3;
  }
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
      ${(typeof product.stock === 'number' && product.stock <= 2 && product.stock > 0) ? 
        '<div class="stock-warning">¡Últimas unidades!</div>' : ''}
    </div>
    <div class="carousel-item-info">
      <h3 class="carousel-item-name">${product.name}</h3>
      <p class="carousel-item-brand">${product.brand}</p>
      <p class="carousel-item-price">${formattedPrice}</p>
      <div class="carousel-item-stock">${stockStatus}</div>
      <div class="carousel-item-actions">
        <a href="productos.html?id=${product.id}" class="btn btn-secondary">
          <i class="fas fa-info-circle"></i>
        </a>
        <button class="btn btn-primary ${(typeof product.stock === 'number' && product.stock <= 0) || product.stock === 'Sin stock' ? 'disabled' : ''}" 
                onclick="addToCart(${product.id})"
                ${(typeof product.stock === 'number' && product.stock <= 0) || product.stock === 'Sin stock' ? 'disabled' : ''}>
          <i class="fas fa-shopping-cart"></i>
        </button>
      </div>
    </div>
  `;
  // Hacer clickeable toda la tarjeta para ir al detalle del producto
  item.style.cursor = 'pointer';
  item.addEventListener('click', function () {
    window.location.href = `productos.html?id=${product.id}`;
  });
  // Evitar que el clic en los controles internos burbujee y dispare la navegación del item
  const infoLink = item.querySelector('.carousel-item-actions a');
  if (infoLink) {
    infoLink.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  const addBtn = item.querySelector('.carousel-item-actions button');
  if (addBtn) {
    addBtn.addEventListener('click', function (e) { e.stopPropagation(); });
  }
  
  return item;
}

function createCarouselDots() {
  const dotsContainer = document.getElementById('carousel-dots');
  if (!dotsContainer) return;
  
  dotsContainer.innerHTML = '';
  const totalSlides = getTotalSlides();
  
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
    dot.onclick = () => goToSlide(i);
    dotsContainer.appendChild(dot);
  }
}

function moveCarousel(direction) {
  const totalSlides = getTotalSlides();
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
  const items = carouselTrack.querySelectorAll('.carousel-item');
  if (!items.length) return;
  const startIndex = Math.min(currentCarouselIndex * itemsPerView, Math.max(0, items.length - itemsPerView));
  const targetItem = items[startIndex];
  const translateX = -Math.round(targetItem.offsetLeft);
  carouselTrack.style.transform = `translate3d(${translateX}px, 0, 0)`;
}

function updateCarouselDots() {
  const dots = document.querySelectorAll('.carousel-dot');
  dots.forEach((dot, index) => {
    dot.classList.toggle('active', index === currentCarouselIndex);
  });
}

// Manejo de redimensionamiento para mantener el carrusel alineado a página completa
function handleCarouselResize() {
  const previousItemsPerView = itemsPerView;
  updateCarouselItemsPerView();
  const totalSlides = getTotalSlides() || 1;
  // Asegurar que el índice no quede fuera de rango al cambiar itemsPerView
  if (currentCarouselIndex > totalSlides - 1) {
    currentCarouselIndex = totalSlides - 1;
  }
  // Regenerar puntos si cambia la cantidad de páginas
  if (previousItemsPerView !== itemsPerView) {
    createCarouselDots();
  }
  updateCarouselPosition();
}

// Cálculo consistente del total de páginas usando el ancho de página (itemWidth * itemsPerView + gaps)
function getTotalSlides() {
  const carouselTrack = document.getElementById('carousel-track');
  if (!carouselTrack) return 1;
  const count = carouselTrack.querySelectorAll('.carousel-item').length;
  return Math.max(1, Math.ceil(count / Math.max(1, itemsPerView)));
}

// Obtiene el ancho exacto de una "página" del carrusel usando el ancho del ítem y el gap
function getCarouselPageWidth() {
  const wrapper = document.querySelector('.carousel-wrapper');
  if (!wrapper) return 0;
  // Usar el ancho visible del wrapper elimina errores de redondeo acumulados
  return wrapper.clientWidth;
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

// Función para agregar producto al carrito desde el catálogo
function addToCart(productId) {
  const product = productsData.find(p => p.id === productId);
  if (product && typeof addProductToCart === 'function') {
    addProductToCart(product);
    showNotification('Producto agregado al carrito', 'success');
  } else {
    showNotification('Error al agregar producto al carrito', 'error');
  }
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
  addToCart,
  GOOGLE_SHEETS_CONFIG
};
