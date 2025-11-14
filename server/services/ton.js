import axios from 'axios';
import { Address } from '@ton/core';

const TONAPI_KEY = process.env.TONAPI_KEY;
const TONCENTER_API_KEY = process.env.TONCENTER_API_KEY;

// TonAPI v2 endpoints (best for balance and account info)
const TONAPI_BASE = 'https://tonapi.io/v2';

// TONCenter endpoints (backup/alternative)
const TONCENTER_BASE = 'https://toncenter.com/api/v2';

/**
 * Get TON balance for a wallet address
 * Uses TonAPI for accurate, fast balance checking
 */
export const getBalance = async (address) => {
  try {
    if (!address) {
      return { success: false, balance: 0, error: 'No address provided' };
    }

    // Validate and format address
    let formattedAddress;
    try {
      const addr = Address.parse(address);
      formattedAddress = addr.toString({ bounceable: false, urlSafe: true });
    } catch (e) {
      return { success: false, balance: 0, error: 'Invalid TON address' };
    }

    // Try TonAPI first (most reliable)
    if (TONAPI_KEY) {
      try {
        const response = await axios.get(
          `${TONAPI_BASE}/accounts/${formattedAddress}`,
          {
            headers: {
              'Authorization': `Bearer ${TONAPI_KEY}`
            }
          }
        );

        const balanceNano = response.data.balance;
        const balanceTON = balanceNano / 1e9; // Convert nanotons to TON

        return {
          success: true,
          balance: balanceTON,
          balanceNano,
          address: formattedAddress,
          status: response.data.status // active, frozen, or uninitialized
        };
      } catch (error) {
        console.error('TonAPI error:', error.response?.data || error.message);
      }
    }

    // Fallback to TONCenter
    try {
      const response = await axios.get(
        `${TONCENTER_BASE}/getAddressBalance`,
        {
          params: { address: formattedAddress },
          headers: TONCENTER_API_KEY ? {
            'X-API-Key': TONCENTER_API_KEY
          } : {}
        }
      );

      const balanceNano = parseInt(response.data.result);
      const balanceTON = balanceNano / 1e9;

      return {
        success: true,
        balance: balanceTON,
        balanceNano,
        address: formattedAddress
      };
    } catch (error) {
      console.error('TONCenter error:', error.response?.data || error.message);
      return {
        success: false,
        balance: 0,
        error: 'Failed to fetch balance from blockchain'
      };
    }
  } catch (error) {
    console.error('Get balance error:', error.message);
    return {
      success: false,
      balance: 0,
      error: error.message
    };
  }
};

/**
 * Get transaction history for an address
 */
export const getTransactionHistory = async (address, limit = 10) => {
  try {
    if (!address) {
      return { success: false, transactions: [], error: 'No address provided' };
    }

    const formattedAddress = Address.parse(address).toString({ 
      bounceable: false, 
      urlSafe: true 
    });

    if (TONAPI_KEY) {
      const response = await axios.get(
        `${TONAPI_BASE}/accounts/${formattedAddress}/events`,
        {
          params: { limit },
          headers: {
            'Authorization': `Bearer ${TONAPI_KEY}`
          }
        }
      );

      const transactions = response.data.events.map(event => ({
        hash: event.event_id,
        timestamp: event.timestamp,
        fee: event.fee?.total ? event.fee.total / 1e9 : 0,
        success: event.actions[0]?.status === 'ok',
        type: event.actions[0]?.type || 'unknown',
        amount: event.actions[0]?.TonTransfer?.amount 
          ? event.actions[0].TonTransfer.amount / 1e9 
          : 0
      }));

      return {
        success: true,
        transactions
      };
    }

    // Fallback: return empty for now
    return {
      success: true,
      transactions: []
    };
  } catch (error) {
    console.error('Get transaction history error:', error.message);
    return {
      success: false,
      transactions: [],
      error: error.message
    };
  }
};

/**
 * Verify a transaction by hash
 */
export const verifyTransaction = async (txHash) => {
  try {
    if (TONAPI_KEY) {
      const response = await axios.get(
        `${TONAPI_BASE}/events/${txHash}`,
        {
          headers: {
            'Authorization': `Bearer ${TONAPI_KEY}`
          }
        }
      );

      return {
        success: true,
        confirmed: response.data.actions[0]?.status === 'ok',
        fee: response.data.fee?.total ? response.data.fee.total / 1e9 : 0,
        timestamp: response.data.timestamp
      };
    }

    return {
      success: false,
      error: 'TonAPI key not configured'
    };
  } catch (error) {
    console.error('Verify transaction error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get current exchange rate TON to NGN
 * Uses CoinGecko API
 */
export const getTONtoNGNRate = async () => {
  try {
    const response = await axios.get(
      'https://api.coingecko.com/api/v3/simple/price',
      {
        params: {
          ids: 'the-open-network',
          vs_currencies: 'ngn'
        }
      }
    );

    const rate = response.data['the-open-network']?.ngn || 2000;

    return {
      success: true,
      rate,
      timestamp: Date.now()
    };
  } catch (error) {
    console.error('Get TON rate error:', error.message);
    // Fallback rate
    return {
      success: false,
      rate: 2000,
      error: 'Using fallback rate'
    };
  }
};

/**
 * Estimate gas fee for a transaction
 */
export const estimateGasFee = async (destinationAddress, amount) => {
  try {
    // TON transactions typically cost 0.005-0.01 TON in gas
    // This is a reasonable estimate
    const estimatedFee = 0.008; // 0.008 TON (~$0.02)

    return {
      success: true,
      fee: estimatedFee,
      feeNano: Math.floor(estimatedFee * 1e9)
    };
  } catch (error) {
    return {
      success: false,
      fee: 0.01,
      error: error.message
    };
  }
};

/**
 * Validate TON address
 */
export const validateAddress = (address) => {
  try {
    Address.parse(address);
    return { success: true, valid: true };
  } catch (error) {
    return { 
      success: false, 
      valid: false, 
      error: 'Invalid TON address format' 
    };
  }
};

export default {
  getBalance,
  getTransactionHistory,
  verifyTransaction,
  getTONtoNGNRate,
  estimateGasFee,
  validateAddress
};
