export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+?234|0)[789]\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePassword = (password) => {
  return password && password.length >= 6;
};

export const validateAmount = (amount) => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 1000);
};

export const validateRegistration = (req, res, next) => {
  const { email, phone, password, firstName, lastName } = req.body;

  const errors = [];

  if (!email && !phone) {
    errors.push('Email or phone number is required');
  }

  if (email && !validateEmail(email)) {
    errors.push('Invalid email format');
  }

  if (phone && !validatePhone(phone)) {
    errors.push('Invalid phone number format (Nigerian numbers only)');
  }

  if (!validatePassword(password)) {
    errors.push('Password must be at least 6 characters');
  }

  if (!firstName || firstName.trim().length < 2) {
    errors.push('First name is required (minimum 2 characters)');
  }

  if (!lastName || lastName.trim().length < 2) {
    errors.push('Last name is required (minimum 2 characters)');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', '), errors });
  }

  req.body.email = email ? sanitizeInput(email.toLowerCase()) : undefined;
  req.body.phone = phone ? sanitizeInput(phone) : undefined;
  req.body.firstName = sanitizeInput(firstName);
  req.body.lastName = sanitizeInput(lastName);

  next();
};

export const validateTransaction = (req, res, next) => {
  const { amountTON, amountNGN } = req.body;

  const errors = [];

  if (amountTON && !validateAmount(amountTON)) {
    errors.push('Invalid TON amount');
  }

  if (amountNGN && !validateAmount(amountNGN)) {
    errors.push('Invalid NGN amount');
  }

  if (!amountTON && !amountNGN) {
    errors.push('Amount is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', '), errors });
  }

  next();
};

export const validateBankAccount = (req, res, next) => {
  const { bankCode, accountNumber, accountName } = req.body;

  const errors = [];

  if (!bankCode || bankCode.length < 3) {
    errors.push('Bank code is required');
  }

  if (!accountNumber || !/^\d{10}$/.test(accountNumber)) {
    errors.push('Account number must be 10 digits');
  }

  if (!accountName || accountName.trim().length < 3) {
    errors.push('Account name is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', '), errors });
  }

  req.body.bankCode = sanitizeInput(bankCode);
  req.body.accountNumber = sanitizeInput(accountNumber);
  req.body.accountName = sanitizeInput(accountName);

  next();
};

export const validateKYC = (req, res, next) => {
  const { bvn, nin } = req.body;

  const errors = [];

  if (!bvn && !nin) {
    errors.push('BVN or NIN is required');
  }

  if (bvn && !/^\d{11}$/.test(bvn)) {
    errors.push('BVN must be 11 digits');
  }

  if (nin && !/^\d{11}$/.test(nin)) {
    errors.push('NIN must be 11 digits');
  }

  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(', '), errors });
  }

  req.body.bvn = bvn ? sanitizeInput(bvn) : undefined;
  req.body.nin = nin ? sanitizeInput(nin) : undefined;

  next();
};

export const sanitizeRequestBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  next();
};
