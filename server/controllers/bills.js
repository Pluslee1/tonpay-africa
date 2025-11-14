const Bill = require('../models/Bill');
const User = require('../models/User');

exports.createBill = async (req, res) => {
  try {
    const { description, totalAmount, recipient, members } = req.body;
    
    // Validate recipient address
    if (!/^EQ[0-9a-zA-Z]{48}$/.test(recipient)) {
      return res.status(400).json({ message: 'Invalid recipient TON address' });
    }
    
    // Validate members
    const totalShares = members.reduce((acc, m) => acc + m.share, 0);
    if (totalShares !== totalAmount) {
      return res.status(400).json({ message: 'Total shares must equal total amount' });
    }
    
    const bill = new Bill({
      description,
      totalAmount,
      recipient,
      members,
      creator: req.user.id
    });
    
    await bill.save();
    
    // Deploy smart contract (pseudo-code)
    // const contractAddress = await deployContract(recipient, totalAmount);
    // bill.contractAddress = contractAddress;
    // await bill.save();
    
    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.find({ creator: req.user.id });
    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
