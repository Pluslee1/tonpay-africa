// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

// Initialize app
function initApp() {
  console.log('🚀 TONPay Africa starting...');
  
  // Initialize Telegram
  tg.ready();
  tg.expand();
  
  // Apply Telegram theme
  applyTelegramTheme();
  
  // Setup event listeners
  setupEventListeners();
  
  console.log('✅ App initialized!');
}

// Apply Telegram theme colors
function applyTelegramTheme() {
  if (tg.themeParams) {
    const root = document.documentElement;
    
    if (tg.themeParams.bg_color) {
      root.style.setProperty('--bg-primary', tg.themeParams.bg_color);
    }
    
    if (tg.themeParams.text_color) {
      root.style.setProperty('--text-primary', tg.themeParams.text_color);
    }
    
    console.log('🎨 Theme applied:', tg.themeParams);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Wallet button
  const walletBtn = document.getElementById('walletBtn');
  walletBtn.addEventListener('click', handleWalletConnect);
  
  // Action cards (for now just log)
  const actionCards = document.querySelectorAll('.action-card');
  actionCards.forEach(card => {
    card.addEventListener('click', () => {
      const feature = card.querySelector('h3').textContent;
      showToast(`${feature} - Coming soon!`);
    });
  });
}

// Handle wallet connection
function handleWalletConnect() {
  showToast('Wallet connection coming in next phase!');
  console.log('💰 Wallet button clicked');
}

// Show toast notification
function showToast(message) {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 2rem;
    left: 50%;
    transform: translateX(-50%);
    background: #111827;
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 0.75rem;
    font-size: 0.9375rem;
    box-shadow: 0 10px 15px rgba(0, 0, 0, 0.3);
    z-index: 1001;
    animation: slideUp 0.3s ease;
  `;
  
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.animation = 'slideDown 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
  }
  
  @keyframes slideDown {
    from {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
    to {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
  }
`;
document.head.appendChild(style);

// Start the app when page loads
window.addEventListener('DOMContentLoaded', initApp);

console.log('📱 TONPay Africa loaded!');