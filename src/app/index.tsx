// src/app/index.tsx
import React from 'react';
import { ActivityIndicator } from 'react-native';
import { useSession } from '../session/useSession';
import { TokenScreen } from '../screens/Token';
import { WalletScreen } from '../screens/Wallet';
const IndexRoute: React.FC = () => {
  const session = useSession();
  if (!session.ready) return <ActivityIndicator accessibilityLabel="Restoring browser session" />;
  return session.session
    ? <WalletScreen key={session.session.scope} token={session.session.token} scope={session.session.scope} disconnect={session.disconnect} />
    : <TokenScreen connect={session.connect} error={session.error} />;
};
export default IndexRoute;
