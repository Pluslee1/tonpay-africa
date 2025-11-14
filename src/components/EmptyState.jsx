export default function EmptyState({ 
  icon = '📭', 
  title = 'No data', 
  message = 'There\'s nothing here yet.',
  action,
  actionLabel 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-sm opacity-70 mb-6 max-w-sm">{message}</p>
      {action && actionLabel && (
        <button onClick={action} className="tp-btn tp-button-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

