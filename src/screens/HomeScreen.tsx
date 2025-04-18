import React from 'react';
import { StyleSheet, useColorScheme, View, Image } from 'react-native';
import { Button, Text, Divider } from 'react-native-elements';
import { HomeScreenNavigationProp } from '@navigation/AppNavigator';
import { useAuth } from '@context/AuthContext';
import { API_URL } from '@env';

type HomeScreenProps = {
  navigation: HomeScreenNavigationProp;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';
  const { user, logout, isLoading } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    } else if (user?.first_name) {
      return user.first_name;
    } else if (user?.email) {
      return user.email.split('@')[0]; // Just the part before @ in email
    } else {
      return 'User';
    }
  };

  // Get avatar URL
  const getAvatarUrl = () => {
    if (user?.avatar) {
      // Check if avatar is a full URL or just an ID
      if (user.avatar.startsWith('http')) {
        return user.avatar;
      } else {
        // Construct URL based on Directus file ID
        return `${API_URL}/assets/${user.avatar}`;
      }
    }
    return null;
  };

  return (
    <View style={styles.screenContainer}>
      {/* {user?.avatar && getAvatarUrl() && (
        <Image source={{ uri: getAvatarUrl() }} style={styles.avatar} />
      )} */}

      <Text h1 style={isDarkMode ? styles.darkText : styles.lightText}>
        Welcome
      </Text>

      <Text
        style={[
          styles.description,
          isDarkMode ? styles.darkText : styles.lightText,
        ]}
      >
        {getUserDisplayName()}
      </Text>

      {user?.email && (
        <Text
          style={[
            styles.email,
            isDarkMode ? styles.darkText : styles.lightText,
          ]}
        >
          {user.email}
        </Text>
      )}

      <Divider style={styles.divider} />

      <Button
        title="Go to Details"
        onPress={() => navigation.navigate('Details')}
        buttonStyle={styles.button}
      />

      <Button
        title="Logout"
        onPress={handleLogout}
        loading={isLoading}
        buttonStyle={[styles.button, styles.logoutButton]}
        type="outline"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  button: {
    width: 200,
    borderRadius: 8,
    marginVertical: 10,
  },
  logoutButton: {
    marginTop: 10,
  },
  description: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
  },
  divider: {
    width: '80%',
    margin: 20,
  },
  darkText: {
    // color: '#FFFFFF',
  },
  lightText: {
    // color: '#000000',
  },
});

export default HomeScreen;
