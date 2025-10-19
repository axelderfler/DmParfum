// Dm Parfum - Funcionalidad del Carrito de Compras

// Clave para almacenar el carrito en localStorage
const CART_STORAGE_KEY = 'dm_parfum_cart';

// Inicialización del carrito
document.addEventListener('DOMContentLoaded', function() {
  initializeCart();
});

// Inicializar carrito
function initializeCart() {
  // Verificar si existe un carrito en localStorage
  if (!localStorage.getItem(CART_STORAGE_KEY)) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
  }
  
  // Actualizar contador del carrito en todas las páginas
  updateCartCount();
  
  // Agregar event listeners para el carrito
  setupCartEventListeners();
}

// Configurar event listeners del carrito
function setupCartEventListeners() {
  // Event listener para el icono del carrito
  const cartIcon = document.querySelector('.cart-icon');
  if (cartIcon) {
    cartIcon.addEventListener('click', function(e) {
      e.preventDefault();
      toggleCart();
    });
  }
}

// Obtener carrito desde localStorage
function getCart() {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    return [];
  }
}

// Guardar carrito en localStorage
function saveCart(cart) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
    return true;
  } catch (error) {
    console.error('Error al guardar carrito:', error);
    return false;
  }
}

// Agregar producto al carrito
function addProductToCart(product) {
  const cart = getCart();
  
  // Verificar si el producto ya está en el carrito
  const existingItemIndex = cart.findIndex(item => item.id === product.id);
  
  if (existingItemIndex !== -1) {
    // Si ya existe, incrementar la cantidad
    cart[existingItemIndex].quantity += 1;
  } else {
    // Si no existe, agregarlo al carrito
    const cartItem = {
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.image,
      category: product.category,
      quantity: 1,
      addedAt: new Date().toISOString()
    };
    cart.push(cartItem);
  }
  
  // Guardar carrito actualizado
  if (saveCart(cart)) {
    showCartNotification('Producto agregado al carrito', 'success');
    return true;
  } else {
    showCartNotification('Error al agregar producto', 'error');
    return false;
  }
}

// Remover producto del carrito
function removeCartItem(index) {
  const cart = getCart();
  
  if (index >= 0 && index < cart.length) {
    const removedItem = cart.splice(index, 1)[0];
    saveCart(cart);
    showCartNotification(`${removedItem.name} eliminado del carrito`, 'info');
    return true;
  }
  
  return false;
}

// Actualizar cantidad de un producto en el carrito
function updateCartItemQuantity(index, newQuantity) {
  const cart = getCart();
  
  if (index >= 0 && index < cart.length && newQuantity > 0) {
    cart[index].quantity = newQuantity;
    saveCart(cart);
    return true;
  }
  
  return false;
}

// Limpiar todo el carrito
function clearCartItems() {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
  updateCartCount();
}

// Obtener cantidad total de productos en el carrito
function getCartCount() {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
}

// Obtener total del carrito
function getCartTotal() {
  const cart = getCart();
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Verificar si un producto está en el carrito
function isProductInCart(productId) {
  const cart = getCart();
  return cart.some(item => item.id === productId);
}

// Obtener cantidad de un producto específico en el carrito
function getProductQuantityInCart(productId) {
  const cart = getCart();
  const item = cart.find(item => item.id === productId);
  return item ? item.quantity : 0;
}

// Toggle del carrito (mostrar/ocultar)
function toggleCart() {
  // Si estamos en la página del carrito, no hacer nada
  if (window.location.pathname.includes('carrito.html')) {
    return;
  }
  
  // Si no estamos en la página del carrito, redirigir
  window.location.href = 'carrito.html';
}

// Mostrar notificación del carrito
function showCartNotification(message, type = 'info') {
  // Crear elemento de notificación
  const notification = document.createElement('div');
  notification.className = `cart-notification cart-notification-${type}`;
  
  // Iconos según el tipo
  const icons = {
    success: 'fas fa-check-circle',
    error: 'fas fa-exclamation-circle',
    info: 'fas fa-info-circle',
    warning: 'fas fa-exclamation-triangle'
  };
  
  notification.innerHTML = `
    <div class="cart-notification-content">
      <i class="${icons[type] || icons.info}"></i>
      <span>${message}</span>
    </div>
  `;
  
  // Estilos para la notificación
  notification.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    background: ${getNotificationColor(type)};
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 10px;
  `;
  
  // Agregar al DOM
  document.body.appendChild(notification);
  
  // Animar entrada
  setTimeout(() => {
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  // Remover después de 3 segundos
  setTimeout(() => {
    notification.style.transform = 'translateX(400px)';
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// Obtener color de notificación según el tipo
function getNotificationColor(type) {
  const colors = {
    success: '#4CAF50',
    error: '#F44336',
    info: '#2196F3',
    warning: '#FF9800'
  };
  return colors[type] || colors.info;
}

// Actualizar contador del carrito en el header
function updateCartCount() {
  const cartCountElements = document.querySelectorAll('.cart-count');
  const count = getCartCount();
  
  cartCountElements.forEach(element => {
    element.textContent = count;
    
    // Mostrar/ocultar el contador según si hay productos
    if (count > 0) {
      element.style.display = 'block';
      element.style.animation = 'cartBounce 0.5s ease';
    } else {
      element.style.display = 'none';
    }
  });
  
  // Remover animación después de que termine
  setTimeout(() => {
    cartCountElements.forEach(element => {
      element.style.animation = '';
    });
  }, 500);
}

// Crear mensaje para WhatsApp con el carrito
function createWhatsAppCartMessage() {
  const cart = getCart();
  
  if (cart.length === 0) {
    return 'Tu carrito está vacío';
  }
  
  const total = getCartTotal();
  const formattedTotal = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(total);

  let message = `🛍️ *PEDIDO DM PARFUM*\n\n`;
  message += `Hola! Me gustaría realizar el siguiente pedido:\n\n`;
  
  cart.forEach((item, index) => {
    const itemTotal = new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(item.price * item.quantity);
    
    message += `${index + 1}. *${item.name}* - ${item.brand}\n`;
    message += `   Cantidad: ${item.quantity}\n`;
    message += `   Precio unitario: $${item.price.toLocaleString()}\n`;
    message += `   Subtotal: ${itemTotal}\n\n`;
  });
  
  message += `💰 *TOTAL: ${formattedTotal}*\n\n`;
  message += `📦 Envío: Gratis\n`;
  message += `📍 Dirección de entrega: [Por confirmar]\n\n`;
  message += `¡Gracias por elegir Dm Parfum! 🌟`;

  return message;
}

// Enviar carrito por WhatsApp
function sendCartToWhatsApp() {
  const message = createWhatsAppCartMessage();
  const whatsappUrl = `https://wa.me/541162634332?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank');
}

// Función para sincronizar carrito entre pestañas
function syncCartBetweenTabs() {
  window.addEventListener('storage', function(e) {
    if (e.key === CART_STORAGE_KEY) {
      updateCartCount();
      
      // Si estamos en la página del carrito, recargar
      if (window.location.pathname.includes('carrito.html')) {
        if (typeof loadCart === 'function') {
          loadCart();
        }
      }
    }
  });
}

// Función para limpiar carrito después de un tiempo (opcional)
function setupCartAutoCleanup() {
  // Limpiar carrito después de 7 días de inactividad
  const lastActivity = localStorage.getItem('cart_last_activity');
  const now = new Date().getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
  
  if (!lastActivity || (now - parseInt(lastActivity)) > sevenDays) {
    clearCartItems();
  }
  
  // Actualizar timestamp de actividad
  localStorage.setItem('cart_last_activity', now.toString());
}

// Función para exportar carrito (para debugging)
function exportCart() {
  const cart = getCart();
  const cartData = {
    items: cart,
    total: getCartTotal(),
    count: getCartCount(),
    exportedAt: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(cartData, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(dataBlob);
  link.download = `dm_parfum_cart_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
}

// Función para importar carrito (para debugging)
function importCart(file) {
  const reader = new FileReader();
  
  reader.onload = function(e) {
    try {
      const cartData = JSON.parse(e.target.result);
      
      if (cartData.items && Array.isArray(cartData.items)) {
        saveCart(cartData.items);
        showCartNotification('Carrito importado correctamente', 'success');
        
        // Recargar página del carrito si estamos en ella
        if (window.location.pathname.includes('carrito.html')) {
          if (typeof loadCart === 'function') {
            loadCart();
          }
        }
      } else {
        showCartNotification('Formato de archivo inválido', 'error');
      }
    } catch (error) {
      showCartNotification('Error al importar carrito', 'error');
      console.error('Error importing cart:', error);
    }
  };
  
  reader.readAsText(file);
}

// Inicializar funcionalidades adicionales
function initializeCartFeatures() {
  // Sincronizar entre pestañas
  syncCartBetweenTabs();
  
  // Configurar limpieza automática
  setupCartAutoCleanup();
  
  // Agregar estilos CSS para las notificaciones
  addCartNotificationStyles();
}

// Agregar estilos CSS para las notificaciones del carrito
function addCartNotificationStyles() {
  if (document.getElementById('cart-notification-styles')) {
    return; // Ya existen los estilos
  }
  
  const style = document.createElement('style');
  style.id = 'cart-notification-styles';
  style.textContent = `
    @keyframes cartBounce {
      0% { transform: scale(1); }
      50% { transform: scale(1.2); }
      100% { transform: scale(1); }
    }
    
    .cart-notification {
      font-family: 'Inter', sans-serif;
    }
    
    .cart-notification-content {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .cart-notification i {
      font-size: 16px;
    }
    
    .cart-notification span {
      font-weight: 500;
    }
  `;
  
  document.head.appendChild(style);
}

// Exportar funciones para uso global
window.Cart = {
  addProductToCart,
  removeCartItem,
  updateCartItemQuantity,
  clearCartItems,
  getCart,
  getCartCount,
  getCartTotal,
  isProductInCart,
  getProductQuantityInCart,
  toggleCart,
  sendCartToWhatsApp,
  createWhatsAppCartMessage,
  exportCart,
  importCart,
  showCartNotification,
  updateCartCount
};

// Inicializar funcionalidades del carrito
initializeCartFeatures();
