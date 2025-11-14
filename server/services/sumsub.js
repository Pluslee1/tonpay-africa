import axios from 'axios';
import crypto from 'crypto';

const SUMSUB_APP_TOKEN = process.env.SUMSUB_APP_TOKEN;
const SUMSUB_SECRET_KEY = process.env.SUMSUB_SECRET_KEY;
const SUMSUB_BASE_URL = process.env.SUMSUB_BASE_URL || 'https://api.sumsub.com';

/**
 * Generate Sumsub access token for user
 * @param {string} userId - User ID
 * @param {number} levelName - KYC level (default: 'basic-kyc-level')
 * @returns {Promise<{success: boolean, token?: string, error?: string}>}
 */
export const createAccessToken = async (userId, levelName = 'basic-kyc-level') => {
  try {
    if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
      return { success: false, error: 'Sumsub credentials not configured' };
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', SUMSUB_SECRET_KEY)
      .update(timestamp + 'POST' + '/resources/accessTokens')
      .digest('hex');

    const response = await axios.post(
      `${SUMSUB_BASE_URL}/resources/accessTokens`,
      {
        userId: userId.toString(),
        levelName: levelName,
        ttlInSecs: 3600 // 1 hour
      },
      {
        headers: {
          'X-App-Token': SUMSUB_APP_TOKEN,
          'X-App-Access-Ts': timestamp.toString(),
          'X-App-Access-Sig': signature
        }
      }
    );

    return {
      success: true,
      token: response.data.token,
      applicantId: response.data.userId
    };
  } catch (error) {
    console.error('Sumsub access token error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.description || error.message || 'Failed to create access token'
    };
  }
};

/**
 * Get applicant status
 * @param {string} applicantId - Sumsub applicant ID
 * @returns {Promise<{success: boolean, status?: string, error?: string}>}
 */
export const getApplicantStatus = async (applicantId) => {
  try {
    if (!SUMSUB_APP_TOKEN || !SUMSUB_SECRET_KEY) {
      return { success: false, error: 'Sumsub credentials not configured' };
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signature = crypto
      .createHmac('sha256', SUMSUB_SECRET_KEY)
      .update(timestamp + 'GET' + `/resources/applicants/${applicantId}/one`)
      .digest('hex');

    const response = await axios.get(
      `${SUMSUB_BASE_URL}/resources/applicants/${applicantId}/one`,
      {
        headers: {
          'X-App-Token': SUMSUB_APP_TOKEN,
          'X-App-Access-Ts': timestamp.toString(),
          'X-App-Access-Sig': signature
        }
      }
    );

    return {
      success: true,
      status: response.data.reviewResult?.reviewStatus || 'pending',
      reviewResult: response.data.reviewResult
    };
  } catch (error) {
    console.error('Sumsub applicant status error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.description || error.message || 'Failed to get applicant status'
    };
  }
};

/**
 * Verify webhook signature
 * @param {string} payload - Raw request body
 * @param {string} signature - X-Payload-Digest header
 * @returns {boolean}
 */
export const verifyWebhookSignature = (payload, signature) => {
  if (!SUMSUB_SECRET_KEY || !signature) return false;
  
  const expectedSignature = crypto
    .createHmac('sha256', SUMSUB_SECRET_KEY)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
};

