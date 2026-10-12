
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { TeamProvider } from './src/context/TeamContext';

export default function App() {
  return (
    <TeamProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </TeamProvider>
  );
}
