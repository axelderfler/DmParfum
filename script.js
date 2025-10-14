// Dm Parfum - JavaScript para funcionalidad dinámica

// Datos de productos (esto se puede cambiar por una API más adelante)
const productsData = [
  {
    id: 1,
    name: "Oud Royal",
    brand: "Arabian Oud",
    price: 450000,
    category: "masculino",
    description: "Fragancia masculina con notas de oud auténtico, sándalo y especias orientales.",
    image: "https://via.placeholder.com/300x400/8B4513/FFFFFF?text=Oud+Royal",
    whatsapp: "+573001234567",
    instagram: "@dmparfum"
  },
  {
    id: 2,
    name: "Rose Gold",
    brand: "Arabian Rose",
    price: 380000,
    category: "femenino",
    description: "Elegante fragancia femenina con rosas de Damasco y notas de oro.",
    image: "https://via.placeholder.com/300x400/D4AF37/FFFFFF?text=Rose+Gold",
    whatsapp: "+573001234567",
    instagram: "@dmparfum"
  },
  {
    id: 3,
    name: "Amber Noir",
    brand: "Desert Sands",
    price: 520000,
    category: "unisex",
    description: "Fragancia unisex con ámbar negro, incienso y notas de cuero.",
    image: "https://via.placeholder.com/300x400/2C1810/FFFFFF?text=Amber+Noir",
    whatsapp: "+573001234567",
    instagram: "@dmparfum"
  },
  {
    id: 4,
    name: "Sandalwood Supreme",
    brand: "Oriental Woods",
    price: 420000,
    category: "masculino",
    description: "Fragancia masculina con sándalo de la India y notas de tabaco.",
    image: "https://via.placeholder.com/300x400/8B4513/FFFFFF?text=Sandalwood",
    whatsapp: "+573001234567",
    instagram: "@dmparfum"
  },
  {
    id: 5,
    name: "Jasmine Dreams",
    brand: "Arabian Nights",
    price: 350000,
    category: "femenino",
    description: "Fragancia femenina con jazmín de Arabia y notas de vainilla.",
    image: "https://via.placeholder.com/300x400/D4AF37/FFFFFF?text=Jasmine",
    whatsapp: "+573001234567",
    instagram: "@dmparfum"
  },
  {
    id: 6,
    name: "Mystic Oud",
    brand: "Desert Mystique",
    price: 480000,
    category: "unisex",
    description: "Fragancia unisex con oud misterioso y notas de especias exóticas.",
    image: "https://via.placeholder.com/300x400/2C1810/FFFFFF?text=Mystic+Oud",
    whatsapp: "+573001234567",
    instagram: "@dmparfum"
  }
];

// Variables globales
let currentFilter = 'all';
let filteredProducts = productsData;

// Inicialización cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
  initializeNavigation();
  initializeFilters();
  loadProducts();
  initializeContactForm();
  initializeScrollEffects();
  initializeMobileMenu();
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

// Cargar productos en el grid
function loadProducts(animate = false) {
  const productsGrid = document.getElementById('products-grid');
  
  if (animate) {
    productsGrid.style.opacity = '0';
    productsGrid.style.transform = 'translateY(20px)';
  }
  
  setTimeout(() => {
    productsGrid.innerHTML = '';
    
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
  
  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}" loading="lazy">
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-brand">${product.brand}</p>
      <p class="product-price">${formattedPrice}</p>
      <p class="product-description">${product.description}</p>
      <div class="product-actions">
        <a href="https://wa.me/${product.whatsapp.replace(/[^0-9]/g, '')}?text=Hola, me interesa el perfume ${product.name}" 
           class="btn-whatsapp" target="_blank">
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

// Exportar funciones para uso global (si es necesario)
window.DmParfum = {
  addProduct,
  updateProduct,
  removeProduct,
  showNotification
};
