import axios from 'axios';

const VTPASS_API_KEY = process.env.VTPASS_API_KEY;
const VTPASS_PUBLIC_KEY = process.env.VTPASS_PUBLIC_KEY;
const VTPASS_BASE_URL = 'https://api-service.vtpass.com/api';

const vtpassClient = axios.create({
  baseURL: VTPASS_BASE_URL,
  headers: {
    'api-key': VTPASS_API_KEY,
    'public-key': VTPASS_PUBLIC_KEY,
    'Content-Type': 'application/json'
  }
});

const NETWORK_CODES = {
  'MTN': 'mtn',
  'Airtel': 'airtel',
  'Glo': 'glo',
  '9mobile': 'etisalat'
};

export const buyAirtime = async (network, phone, amount, requestId) => {
  try {
    const serviceID = `${NETWORK_CODES[network]}`;
    
    const response = await vtpassClient.post('/pay', {
      request_id: requestId,
      serviceID,
      amount,
      phone
    });
    
    if (response.data.code === '000' || response.data.response_description === 'TRANSACTION SUCCESSFUL') {
      return {
        success: true,
        transactionId: response.data.requestId,
        status: response.data.content?.transactions?.status || 'delivered',
        message: response.data.response_description
      };
    }
    
    return {
      success: false,
      error: response.data.response_description || 'Airtime purchase failed'
    };
  } catch (error) {
    console.error('VTPass airtime error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.response_description || 'Airtime purchase failed'
    };
  }
};

export const buyData = async (network, phone, planId, requestId) => {
  try {
    const serviceID = `${NETWORK_CODES[network]}-data`;
    
    const response = await vtpassClient.post('/pay', {
      request_id: requestId,
      serviceID,
      billersCode: phone,
      variation_code: planId,
      phone
    });
    
    if (response.data.code === '000' || response.data.response_description === 'TRANSACTION SUCCESSFUL') {
      return {
        success: true,
        transactionId: response.data.requestId,
        status: response.data.content?.transactions?.status || 'delivered',
        message: response.data.response_description
      };
    }
    
    return {
      success: false,
      error: response.data.response_description || 'Data purchase failed'
    };
  } catch (error) {
    console.error('VTPass data error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.response_description || 'Data purchase failed'
    };
  }
};

export const getDataPlans = async (network) => {
  try {
    const serviceID = `${NETWORK_CODES[network]}-data`;
    
    const response = await vtpassClient.get(`/service-variations?serviceID=${serviceID}`);
    
    if (response.data.response_description === '000') {
      return {
        success: true,
        plans: response.data.content.varations.map(plan => ({
          id: plan.variation_code,
          name: plan.name,
          amount: parseFloat(plan.variation_amount),
          validity: plan.fixedPrice_description || ''
        }))
      };
    }
    
    return {
      success: false,
      error: 'Failed to fetch data plans'
    };
  } catch (error) {
    console.error('VTPass data plans error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Failed to fetch data plans',
      plans: []
    };
  }
};

export const verifyTransaction = async (requestId) => {
  try {
    const response = await vtpassClient.post('/requery', {
      request_id: requestId
    });
    
    if (response.data.code === '000') {
      return {
        success: true,
        status: response.data.content?.transactions?.status,
        transactionId: response.data.content?.transactions?.transactionId,
        message: response.data.response_description
      };
    }
    
    return {
      success: false,
      error: 'Transaction verification failed'
    };
  } catch (error) {
    console.error('VTPass verify transaction error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Transaction verification failed'
    };
  }
};

export const verifySmartCardNumber = async (serviceID, smartCardNumber) => {
  try {
    const response = await vtpassClient.post('/merchant-verify', {
      serviceID,
      billersCode: smartCardNumber
    });
    
    if (response.data.code === '000') {
      return {
        success: true,
        customerName: response.data.content.Customer_Name,
        status: response.data.content.Status
      };
    }
    
    return {
      success: false,
      error: 'Smart card verification failed'
    };
  } catch (error) {
    console.error('VTPass verify smart card error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Smart card verification failed'
    };
  }
};

export const getBalance = async () => {
  try {
    const response = await vtpassClient.get('/balance');
    
    if (response.data.response_description === '000') {
      return {
        success: true,
        balance: parseFloat(response.data.contents.balance)
      };
    }
    
    return {
      success: false,
      error: 'Failed to fetch balance'
    };
  } catch (error) {
    console.error('VTPass balance error:', error.response?.data || error.message);
    return {
      success: false,
      error: 'Failed to fetch balance'
    };
  }
};

export default {
  buyAirtime,
  buyData,
  getDataPlans,
  verifyTransaction,
  verifySmartCardNumber,
  getBalance
};
