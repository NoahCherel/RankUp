import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation';
import { StripeContainer } from './src/components/StripeContainer';

export default function App() {
  return (
    <StripeContainer>
      <StatusBar style="light" />
      <AppNavigator />
    </StripeContainer>
  );
}
