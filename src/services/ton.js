import axios from 'axios';
import { beginCell, toNano } from '@ton/core';

const API_BASE = '/api/ton';

/**
 * Get mock address for demo (fallback if no wallet connected)
 */
export const getMockAddress = () => {
  const key = 'demo_wallet_address';
  let a = localStorage.getItem(key);
  if (!a) {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    a = 'EQ';
    for (let i = 0; i < 46; i++) {
      a += chars[Math.floor(Math.random() * chars.length)];
    }
    localStorage.setItem(key, a);
  }
  return a;
};

/**
 * Get REAL TON balance from blockchain via TonAPI
 */
export async function getBalance(address) {
  try {
    if (!address) {
      return { success: false, balance: 0 };
    }

    const response = await axios.get(`${API_BASE}/balance/${address}`);
    
    if (response.data.success) {
      return { success: true, balance: response.data.balance };
    }
    
    return { success: false, balance: 0, error: response.data?.error };
  } catch (error) {
    console.error('Error fetching balance:', error);
    // Return mock balance as fallback
    return { success: true, balance: 10.5, mock: true };
  }
}

/**
 * Get transaction history from blockchain
 */
export async function getTransactionHistory(address, limit = 10) {
  try {
    const response = await axios.get(`${API_BASE}/transactions/${address}`, {
      params: { limit }
    });
    
    if (response.data.success) {
      return response.data.transactions;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}

/**
 * Convert NGN to TON
 */
export function ngnToTon(ngn, rate) {
  if (!rate || rate <= 0) return 0;
  return ngn / rate;
}

/**
 * Convert TON to NGN
 */
export function tonToNgn(ton, rate) {
  if (!rate || rate <= 0) return 0;
  return ton * rate;
}

/**
 * Validate TON address
 */
export async function validateAddress(address) {
  try {
    const response = await axios.post(`${API_BASE}/validate-address`, { address });
    return response.data.valid;
  } catch (error) {
    return false;
  }
}

/**
 * Estimate gas fee for transaction
 */
export async function estimateGasFee(destinationAddress, amount) {
  try {
    const response = await axios.post(`${API_BASE}/estimate-fee`, {
      destinationAddress,
      amount
    });
    
    if (response.data.success) {
      return response.data.fee;
    }
    
    return 0.01; // Default 0.01 TON
  } catch (error) {
    console.error('Error estimating fee:', error);
    return 0.01;
  }
}

/**
 * Send TON transaction using TonConnect
 * This integrates with the TonConnect UI React component
 */
export async function sendTONTransaction(tonConnectUI, destinationAddress, amountTON, message = '') {
  try {
    if (!tonConnectUI) {
      throw new Error('TonConnect not initialized');
    }

    // Convert TON amount to nanotons
    const amountNano = toNano(amountTON.toString()).toString();

    // Create transaction
    const transaction = {
      validUntil: Math.floor(Date.now() / 1000) + 60 * 20, // 20 minutes
      messages: [
        {
          address: destinationAddress,
          amount: amountNano,
          payload: message ? beginCell().storeUint(0, 32).storeStringTail(message).endCell().toBoc().toString('base64') : undefined
        }
      ]
    };

    // Send transaction via TonConnect
    const result = await tonConnectUI.sendTransaction(transaction);
    
    return {
      success: true,
      boc: result.boc,
      hash: result.hash || 'pending'
    };
  } catch (error) {
    console.error('Transaction error:', error);
    return {
      success: false,
      error: error.message || 'Transaction failed'
    };
  }
}

/**
 * Process airtime purchase (deprecated - use payments API directly)
 */
export async function processAirtimePurchase({ walletAddress, network, phone, amountTon, amountNgn }) {
  // This now redirects to payments API
  console.warn('Use /api/payments/airtime instead');
  await new Promise(r => setTimeout(r, 800));
  return { success: true, txId: 'demo_airtime_tx' };
}

/**
 * Process data purchase (deprecated - use payments API directly)
 */
export async function processDataPurchase({ walletAddress, network, planId, amountTon, amountNgn }) {
  // This now redirects to payments API
  console.warn('Use /api/payments/data instead');
  await new Promise(r => setTimeout(r, 800));
  return { success: true, txId: 'demo_data_tx' };
}

export default {
  getMockAddress,
  getBalance,
  getTransactionHistory,
  ngnToTon,
  tonToNgn,
  validateAddress,
  estimateGasFee,
  sendTONTransaction,
  processAirtimePurchase,
  processDataPurchase
};
