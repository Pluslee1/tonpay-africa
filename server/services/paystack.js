import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

const paystackClient = axios.create({
  baseURL: PAYSTACK_BASE_URL,
  headers: {
    'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

export const verifyBankAccount = async (accountNumber, bankCode) => {
  try {
    const response = await paystackClient.get(
      `/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`
    );
    
    if (response.data.status) {
      return {
        success: true,
        accountName: response.data.data.account_name,
        accountNumber: response.data.data.account_number
      };
    }
    
    return { success: false, error: 'Account verification failed' };
  } catch (error) {
    console.error('Paystack verify account error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Account verification failed'
    };
  }
};

export const getBanks = async () => {
  try {
    const response = await paystackClient.get('/bank?country=nigeria');
    
    if (response.data.status) {
      return {
        success: true,
        banks: response.data.data.map(bank => ({
          name: bank.name,
          code: bank.code,
          slug: bank.slug
        }))
      };
    }
    
    return { success: false, error: 'Failed to fetch banks' };
  } catch (error) {
    console.error('Paystack get banks error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Failed to fetch banks'
    };
  }
};

export const createTransferRecipient = async (accountNumber, bankCode, accountName) => {
  try {
    const response = await paystackClient.post('/transferrecipient', {
      type: 'nuban',
      name: accountName,
      account_number: accountNumber,
      bank_code: bankCode,
      currency: 'NGN'
    });
    
    if (response.data.status) {
      return {
        success: true,
        recipientCode: response.data.data.recipient_code
      };
    }
    
    return { success: false, error: 'Failed to create recipient' };
  } catch (error) {
    console.error('Paystack create recipient error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create recipient'
    };
  }
};

export const initiateTransfer = async (amount, recipientCode, reference, reason = 'Payout from TonPay Africa') => {
  try {
    const amountInKobo = Math.round(amount * 100);
    
    const response = await paystackClient.post('/transfer', {
      source: 'balance',
      amount: amountInKobo,
      recipient: recipientCode,
      reference,
      reason
    });
    
    if (response.data.status) {
      return {
        success: true,
        transferCode: response.data.data.transfer_code,
        reference: response.data.data.reference,
        status: response.data.data.status
      };
    }
    
    return { success: false, error: 'Transfer initiation failed' };
  } catch (error) {
    console.error('Paystack transfer error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Transfer failed'
    };
  }
};

export const verifyTransfer = async (reference) => {
  try {
    const response = await paystackClient.get(`/transfer/verify/${reference}`);
    
    if (response.data.status) {
      const transfer = response.data.data;
      return {
        success: true,
        status: transfer.status,
        amount: transfer.amount / 100,
        recipient: transfer.recipient,
        createdAt: transfer.createdAt
      };
    }
    
    return { success: false, error: 'Transfer verification failed' };
  } catch (error) {
    console.error('Paystack verify transfer error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Transfer verification failed'
    };
  }
};

export const getBalance = async () => {
  try {
    const response = await paystackClient.get('/balance');
    
    if (response.data.status) {
      return {
        success: true,
        balance: response.data.data[0].balance / 100,
        currency: response.data.data[0].currency
      };
    }
    
    return { success: false, error: 'Failed to fetch balance' };
  } catch (error) {
    console.error('Paystack balance error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Failed to fetch balance'
    };
  }
};

export const handlePaystackWebhook = (event) => {
  const { event: eventType, data } = event;
  
  switch (eventType) {
    case 'transfer.success':
      return {
        type: 'transfer_success',
        reference: data.reference,
        amount: data.amount / 100,
        recipient: data.recipient
      };
      
    case 'transfer.failed':
      return {
        type: 'transfer_failed',
        reference: data.reference,
        reason: data.reason
      };
      
    case 'transfer.reversed':
      return {
        type: 'transfer_reversed',
        reference: data.reference
      };
      
    default:
      return null;
  }
};

export default {
  verifyBankAccount,
  getBanks,
  createTransferRecipient,
  initiateTransfer,
  verifyTransfer,
  getBalance,
  handlePaystackWebhook
};
