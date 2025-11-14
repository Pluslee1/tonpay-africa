import { useNavigate } from 'react-router-dom';

export default function SuccessScreen({ 
  icon = '✅',
  title = 'Success!',
  message,
  transactionId,
  amountTON,
  amountNGN,
  details = {},
  primaryAction,
  primaryLabel = 'Done',
  secondaryAction,
  secondaryLabel = 'View Details'
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4 app-gradient">
      <div className="w-full max-w-md tp-card p-8 text-center">
        <div className="text-6xl mb-4 animate-bounce">{icon}</div>
        <h2 className="text-2xl font-bold mb-2">{title}</h2>
        {message && <p className="text-gray-600 mb-6">{message}</p>}

        {(amountTON || amountNGN) && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            {amountTON && (
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {amountTON.toFixed(4)} TON
              </div>
            )}
            {amountNGN && (
              <div className="text-lg text-blue-800">
                ≈ ₦{amountNGN.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </div>
            )}
          </div>
        )}

        {Object.keys(details).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            {Object.entries(details).map(([key, value]) => (
              <div key={key} className="flex justify-between py-2 border-b last:border-0">
                <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                <span className="text-sm font-semibold">{String(value)}</span>
              </div>
            ))}
          </div>
        )}

        {transactionId && (
          <div className="text-xs text-gray-500 mb-6 font-mono">
            ID: {transactionId}
          </div>
        )}

        <div className="flex gap-3">
          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="flex-1 tp-btn tp-button-muted"
            >
              {secondaryLabel}
            </button>
          )}
          <button
            onClick={primaryAction || (() => navigate('/'))}
            className="flex-1 tp-btn tp-button-primary"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

