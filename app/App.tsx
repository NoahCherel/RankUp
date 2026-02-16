import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation';
import { StripeContainer } from './src/components/StripeContainer';
import WebLayout from './src/components/ui/WebLayout';

export default function App() {
  return (
    <StripeContainer>
      <WebLayout>
        <StatusBar style="light" />
        <AppNavigator />
      </WebLayout>
    </StripeContainer>
  );
}
