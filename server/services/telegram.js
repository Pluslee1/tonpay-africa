import axios from 'axios';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_API_URL = 'https://api.telegram.org/bot';

/**
 * Send a message to a Telegram user
 */
export const sendTelegramMessage = async (chatId, message, options = {}) => {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('⚠️  Telegram Bot Token not configured. Skipping message.');
    return { success: false, error: 'Telegram Bot Token not configured' };
  }

  try {
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: options.parseMode || 'HTML',
      disable_web_page_preview: options.disablePreview || false,
      ...options
    };

    const response = await axios.post(
      `${TELEGRAM_API_URL}${TELEGRAM_BOT_TOKEN}/sendMessage`,
      payload,
      { timeout: 10000 }
    );

    return { success: true, messageId: response.data.result?.message_id };
  } catch (error) {
    console.error('Telegram API error:', error.response?.data || error.message);
    return { 
      success: false, 
      error: error.response?.data?.description || error.message 
    };
  }
};

/**
 * Send a gift notification to recipient
 * Note: Recipient must have interacted with the bot first (started a chat)
 * If they haven't, the gift will still be created with a claim link
 */
export const sendGiftNotification = async (recipientTelegramId, giftData) => {
  if (!recipientTelegramId) {
    return { success: false, error: 'Recipient Telegram ID required' };
  }
  
  // Note: Telegram Bot API requires user to have started chat with bot first
  // If they haven't, we'll get an error but gift is still created with claim link

  const {
    amountTON,
    amountNGN,
    message,
    claimLink,
    senderUsername,
    expiresInDays = 30
  } = giftData;

  const giftMessage = `
🎁 <b>You've Received a Gift!</b>

💰 <b>Amount:</b> ${amountTON} TON
💵 <b>Value:</b> ≈ ₦${amountNGN?.toLocaleString('en-NG') || 'N/A'}

${message ? `💌 <b>Message:</b> "${message}"\n` : ''}
👤 <b>From:</b> ${senderUsername || 'Anonymous'}

⏰ <b>Expires in:</b> ${expiresInDays} days

🎯 <b>Claim your gift now:</b>
${claimLink}

<i>Click the link above to claim your gift on TONPay Africa!</i>
  `.trim();

  const keyboard = {
    inline_keyboard: [[
      {
        text: '🎁 Claim Gift Now',
        url: claimLink
      }
    ]]
  };

  return await sendTelegramMessage(recipientTelegramId, giftMessage, {
    reply_markup: JSON.stringify(keyboard)
  });
};

/**
 * Send gift sent confirmation to sender
 */
export const sendGiftSentConfirmation = async (senderTelegramId, giftData) => {
  if (!senderTelegramId) {
    return { success: false, error: 'Sender Telegram ID required' };
  }

  const {
    amountTON,
    recipientUsername,
    claimLink
  } = giftData;

  const confirmationMessage = `
✅ <b>Gift Sent Successfully!</b>

💰 <b>Amount:</b> ${amountTON} TON
👤 <b>To:</b> ${recipientUsername || 'Recipient'}

🎁 Your gift has been sent! The recipient will receive a notification to claim it.

🔗 <b>Gift Link:</b>
${claimLink}

<i>Share this link if the recipient didn't receive the notification.</i>
  `.trim();

  return await sendTelegramMessage(senderTelegramId, confirmationMessage);
};

/**
 * Get Telegram user info by username
 */
export const getTelegramUserByUsername = async (username) => {
  if (!TELEGRAM_BOT_TOKEN) {
    return { success: false, error: 'Telegram Bot Token not configured' };
  }

  try {
    // Note: Telegram Bot API doesn't directly allow getting user by username
    // This would require the user to interact with the bot first
    // For now, we'll return a placeholder
    return { 
      success: false, 
      error: 'Telegram username lookup requires user interaction with bot' 
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Format Telegram username (add @ if missing)
 */
export const formatTelegramUsername = (username) => {
  if (!username) return null;
  return username.startsWith('@') ? username : `@${username}`;
};

export default {
  sendTelegramMessage,
  sendGiftNotification,
  sendGiftSentConfirmation,
  getTelegramUserByUsername,
  formatTelegramUsername
};

