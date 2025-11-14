import { TonConnectUIProvider } from '@tonconnect/ui-react';

export default function TonConnectProvider({ children }) {
  return (
    <TonConnectUIProvider
      manifestUrl={window.location.origin + '/tonconnect-manifest.json'}
    >
      {children}
    </TonConnectUIProvider>
  );
}






