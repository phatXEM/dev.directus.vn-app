import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import AppNavigator from '@navigation/AppNavigator';
import { AuthProvider } from '@context/AuthContext';

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  // ...existing code...
});

export default App;
