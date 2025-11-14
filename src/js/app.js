// TON Connect SDK
import { TonConnectUI } from '@tonconnect/ui';

let tonConnectUI = null;

// Initialize TON Connect
try {
  tonConnectUI = new TonConnectUI({
    manifestUrl: window.location.origin + '/tonconnect-manifest.json'
  });
} catch (err) {
  console.warn('TON Connect initialization failed, using mock mode:', err);
}

// App state
let walletState = {
  connected: false,
  address: null,
  balance: 0
};

const TON_TO_NGN_RATE = 2000; // 1 TON = ₦2,000
const API_BASE = 'http://localhost:3001/api';

// Initialize Telegram WebApp
const tg = window.Telegram?.WebApp || {
  ready: () => {},
  expand: () => {},
  themeParams: {}
};

// Initialize app
function initApp() {
  // Show home screen by default
  showScreen('home');
  
  if (window.Telegram?.WebApp) {
    tg.ready();
    tg.expand();
  }
  applyTelegramTheme();
  setupEventListeners();
  
  // Check connection after a delay to allow TON Connect to initialize
  setTimeout(() => {
    checkWalletConnection();
  }, 500);
}

// Apply Telegram theme
function applyTelegramTheme() {
  if (tg.themeParams) {
    const root = document.documentElement;
    if (tg.themeParams.bg_color) {
      root.style.setProperty('--bg-primary', tg.themeParams.bg_color);
    }
    if (tg.themeParams.text_color) {
      root.style.setProperty('--text-primary', tg.themeParams.text_color);
    }
  }
}

// Setup event listeners
function setupEventListeners() {
  // Wallet button
  const walletBtn = document.getElementById('walletBtn');
  if (walletBtn) {
    walletBtn.addEventListener('click', handleWalletConnect);
  }

  // Send to Bank button
  const sendToBankBtn = document.getElementById('sendToBankBtn');
  if (sendToBankBtn) {
    sendToBankBtn.addEventListener('click', () => showScreen('send-to-bank'));
  }

  // Back buttons
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.addEventListener('click', () => showScreen('home'));
  });

  // Send to Bank form
  const sendForm = document.getElementById('sendToBankForm');
  if (sendForm) {
    sendForm.addEventListener('submit', handleSendToBank);
  }

  // Amount input - update conversion
  const amountInput = document.getElementById('amountTON');
  if (amountInput) {
    amountInput.addEventListener('input', updateNGNConversion);
  }

  // Account number input - auto verify
  const accountNumberInput = document.getElementById('accountNumber');
  if (accountNumberInput) {
    accountNumberInput.addEventListener('blur', verifyAccount);
  }

  // Confirm button
  const confirmBtn = document.getElementById('confirmPayoutBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', submitPayoutRequest);
  }
}

// Check wallet connection
async function checkWalletConnection() {
  if (tonConnectUI && tonConnectUI.connected) {
    const account = tonConnectUI.account;
    walletState.connected = true;
    walletState.address = account.address;
    await loadBalance(account.address);
    updateWalletUI();
  }
}

// Handle wallet connection
async function handleWalletConnect() {
  try {
    if (walletState.connected) {
      // Disconnect
      if (tonConnectUI) {
        await tonConnectUI.disconnect();
      }
      walletState.connected = false;
      walletState.address = null;
      walletState.balance = 0;
      updateWalletUI();
      showScreen('home');
    } else {
      // Connect
      if (tonConnectUI) {
        // Real TON Connect
        const account = await tonConnectUI.connectWallet();
        walletState.connected = true;
        walletState.address = account.address;
        await loadBalance(account.address);
        updateWalletUI();
      } else {
        // Mock connection for demo
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) loadingOverlay.classList.remove('hidden');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate mock wallet
        const chars = '0123456789ABCDEF';
        let address = 'EQ';
        for (let i = 0; i < 46; i++) {
          address += chars[Math.floor(Math.random() * chars.length)];
        }
        
        walletState.connected = true;
        walletState.address = address;
        walletState.balance = 10.5; // Mock balance
        
        if (loadingOverlay) loadingOverlay.classList.add('hidden');
        updateWalletUI();
        showToast('Wallet connected (Demo Mode)');
      }
    }
  } catch (error) {
    console.error('Wallet connection error:', error);
    showToast('Failed to connect wallet. Using demo mode.');
    
    // Fallback to mock
    const chars = '0123456789ABCDEF';
    let address = 'EQ';
    for (let i = 0; i < 46; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    walletState.connected = true;
    walletState.address = address;
    walletState.balance = 10.5;
    updateWalletUI();
  }
}

// Load TON balance (read-only)
async function loadBalance(address) {
  try {
    // Mock balance - replace with real API:
    // const response = await fetch(`https://tonapi.io/v2/accounts/${address}`);
    // const data = await response.json();
    // walletState.balance = parseFloat(data.balance) / 1e9;
    
    walletState.balance = 10.5; // Mock
  } catch (error) {
    console.error('Balance load error:', error);
    walletState.balance = 0;
  }
}

// Update wallet UI
function updateWalletUI() {
  const walletBtn = document.getElementById('walletBtn');
  const walletInfo = document.getElementById('walletInfo');
  const balanceEl = document.getElementById('tonBalance');
  const ngnBalanceEl = document.getElementById('ngnBalance');
  const addressEl = document.getElementById('walletAddress');

  if (walletState.connected) {
    if (walletBtn) walletBtn.textContent = 'Disconnect';
    if (walletInfo) walletInfo.classList.remove('hidden');
    if (balanceEl) balanceEl.textContent = `${walletState.balance.toFixed(2)} TON`;
    if (ngnBalanceEl) ngnBalanceEl.textContent = `≈ ₦${(walletState.balance * TON_TO_NGN_RATE).toLocaleString()}`;
    if (addressEl) addressEl.textContent = formatAddress(walletState.address);
  } else {
    if (walletBtn) walletBtn.textContent = 'Connect Wallet';
    if (walletInfo) walletInfo.classList.add('hidden');
  }
}

// Show screen
function showScreen(screenName) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
  });
  
  // Show target screen
  const targetScreen = document.getElementById(screenName);
  if (targetScreen) {
    targetScreen.classList.remove('hidden');
  } else {
    console.warn('Screen not found:', screenName);
  }
}

// Update NGN conversion
function updateNGNConversion() {
  const amountInput = document.getElementById('amountTON');
  const ngnDisplay = document.getElementById('ngnEquivalent');
  
  if (amountInput && ngnDisplay) {
    const tonAmount = parseFloat(amountInput.value) || 0;
    const ngnAmount = tonAmount * TON_TO_NGN_RATE;
    ngnDisplay.textContent = `≈ ₦${ngnAmount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  }
}

// Verify bank account
async function verifyAccount() {
  const bankSelect = document.getElementById('bankName');
  const accountNumberInput = document.getElementById('accountNumber');
  const accountNameDisplay = document.getElementById('accountNameDisplay');
  const verifyStatus = document.getElementById('verifyStatus');

  if (!bankSelect || !accountNumberInput || !accountNumberInput.value) return;

  const bankCode = bankSelect.value;
  const accountNumber = accountNumberInput.value;

  if (accountNumber.length < 10) return;

  try {
    if (verifyStatus) verifyStatus.textContent = 'Verifying...';
    
    const response = await fetch(`${API_BASE}/verify-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankCode, accountNumber })
    });

    const result = await response.json();

    if (result.success && result.data.accountName) {
      if (accountNameDisplay) {
        accountNameDisplay.textContent = result.data.accountName;
        accountNameDisplay.classList.remove('hidden');
      }
      if (verifyStatus) {
        verifyStatus.textContent = '✓ Verified';
        verifyStatus.className = 'verify-status success';
      }
    } else {
      if (verifyStatus) {
        verifyStatus.textContent = 'Verification failed';
        verifyStatus.className = 'verify-status error';
      }
    }
  } catch (error) {
    console.error('Verification error:', error);
    if (verifyStatus) {
      verifyStatus.textContent = 'Verification error';
      verifyStatus.className = 'verify-status error';
    }
  }
}

// Handle send to bank form
function handleSendToBank(e) {
  e.preventDefault();
  
  if (!walletState.connected) {
    showToast('Please connect your wallet first');
    return;
  }

  const amountInput = document.getElementById('amountTON');
  const bankSelect = document.getElementById('bankName');
  const accountNumberInput = document.getElementById('accountNumber');
  const accountNameDisplay = document.getElementById('accountNameDisplay');

  const amountTON = parseFloat(amountInput.value);
  const bankName = bankSelect.options[bankSelect.selectedIndex].text;
  const bankCode = bankSelect.value;
  const accountNumber = accountNumberInput.value;
  const accountName = accountNameDisplay.textContent;

  // Validation
  if (amountTON <= 0) {
    showToast('Amount must be greater than 0');
    return;
  }

  if (amountTON > walletState.balance) {
    showToast('Insufficient balance');
    return;
  }

  if (!accountName || accountNameDisplay.classList.contains('hidden')) {
    showToast('Please verify account number first');
    return;
  }

  // Store for confirmation
  window.pendingPayout = {
    amountTON,
    amountNGN: amountTON * TON_TO_NGN_RATE,
    bankName,
    bankCode,
    accountNumber,
    accountName
  };

  updateConfirmationScreen();
  showScreen('confirmation');
}

// Update confirmation screen
function updateConfirmationScreen() {
  const payout = window.pendingPayout;
  if (!payout) return;

  document.getElementById('confirmAmountTON').textContent = `${payout.amountTON} TON`;
  document.getElementById('confirmAmountNGN').textContent = `₦${payout.amountNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  document.getElementById('confirmBankName').textContent = payout.bankName;
  document.getElementById('confirmAccountNumber').textContent = payout.accountNumber;
  document.getElementById('confirmAccountName').textContent = payout.accountName;
}

// Submit payout request
async function submitPayoutRequest() {
  const payout = window.pendingPayout;
  if (!payout) return;

  try {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.classList.remove('hidden');

    const response = await fetch(`${API_BASE}/payout-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: walletState.address,
        walletAddress: walletState.address,
        amountTON: payout.amountTON,
        amountNGN: payout.amountNGN,
        bankName: payout.bankName,
        bankCode: payout.bankCode,
        accountNumber: payout.accountNumber,
        accountName: payout.accountName
      })
    });

    const result = await response.json();

    if (loadingOverlay) loadingOverlay.classList.add('hidden');

    if (result.success) {
      showScreen('success');
      window.pendingPayout = null;
    } else {
      showToast(result.error || 'Request failed');
    }
  } catch (error) {
    console.error('Payout request error:', error);
    showToast('Network error. Please try again.');
  }
}

// Format address
function formatAddress(address) {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Show toast
function showToast(message) {
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
    z-index: 1001;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initApp);
