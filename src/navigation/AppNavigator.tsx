import React from 'react';
import {
  useColorScheme,
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Import screens with aliases
import HomeScreen from '@screens/HomeScreen';
import DetailsScreen from '@screens/DetailsScreen';
import LoginScreen from '@screens/LoginScreen';
import { useAuth } from '@context/AuthContext';
import { RootStackParamList } from '@/types/navigation';

// Create the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = (): React.JSX.Element => {
  const isDarkMode = useColorScheme() === 'dark';
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={isDarkMode ? '#FFFFFF' : '#f4511e'}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkMode ? '#000000' : '#f4511e',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {isAuthenticated ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'Home' }}
            />
            <Stack.Screen
              name="Details"
              component={DetailsScreen}
              options={{ title: 'Details' }}
            />
          </>
        ) : (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerShown: false,
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
