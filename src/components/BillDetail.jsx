import React, { useEffect } from 'react';
import { WalletIcon } from '@heroicons/react/outline';

const BillDetail = ({ bill }) => {
  useEffect(() => {
    console.log('BillDetail component mounted with bill:', bill);
  }, [bill]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{bill.description}</h2>
      
      <div className="tp-card">
        <h3 className="font-bold">Total Amount</h3>
        <div className="text-2xl font-bold mt-2">{bill.totalAmount} TON</div>
      </div>
      
      <div className="tp-card mt-4">
        <h3 className="font-bold flex items-center">
          <WalletIcon className="w-5 h-5 mr-2" />
          Recipient Address
        </h3>
        <div className="mt-2 flex items-center">
          <span className="font-mono bg-gray-100 p-2 rounded text-sm">
            {bill.recipient.slice(0, 8)}...{bill.recipient.slice(-8)}
          </span>
          <button 
            onClick={() => navigator.clipboard.writeText(bill.recipient)}
            className="tp-btn tp-button-secondary ml-2 text-sm"
          >
            Copy
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Collected funds will be sent to this address
        </p>
      </div>
      
      <div className="tp-card mt-4">
        <h3 className="font-bold mb-2">Members</h3>
        <ul className="space-y-2">
          {bill.members.map((member, index) => (
            <li key={index} className="flex justify-between">
              <span>{member.address.slice(0, 6)}...{member.address.slice(-4)}</span>
              <span>{member.share} TON</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BillDetail;
