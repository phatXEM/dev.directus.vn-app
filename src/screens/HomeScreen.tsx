import React, { useState, useEffect } from 'react';
import { StyleSheet, useColorScheme, View, Image, Linking } from 'react-native';
import { Button, Text, Divider } from 'react-native-elements';
import type { HomeScreenNavigationProp } from '@/types/navigation';
import { useAuth } from '@context/AuthContext';
import { API_URL, STRAVA_REDIRECT_URI } from '@env';
import { exchangeStravaCode, getStravaAuthUrl } from '@/services/stravaAuth';
import { authService } from '@/services/auth';

const HomeScreen = () => {
  const isDarkMode = useColorScheme() === 'dark';
  const { user, updateUser, logout, isLoading } = useAuth(); // Include setUser from useAuth to update user state
  const [error, setError] = useState<string | null>(null); // Add state for error handling

  // Handle deep link redirect from Strava
  useEffect(() => {
    const handleUrl = async ({ url }: { url: string }) => {
      if (url.startsWith(STRAVA_REDIRECT_URI)) {
        const code = new URL(url).searchParams.get('code');
        if (code) {
          try {
            const exchange = await exchangeStravaCode(code);
            console.log('Strava exchange response:', exchange);
            if (updateUser) {
              // await updateUser({
              //   id: user?.id,
              // });
            }
            // const updatedUser = await authService.getCurrentUser();
            // setUser(updatedUser); // Update the user in the auth context
          } catch (err) {
            setError('Failed to connect Strava');
            console.error('Error connecting to Strava:', err);
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => subscription.remove();
  }, [updateUser, user?.id]);

  const handleConnectToStrava = async () => {
    try {
      const url = await getStravaAuthUrl();
      await Linking.openURL(url); // Open the Strava auth URL in the browser
    } catch (err) {
      setError('Failed to open Strava authorization page');
      console.error('Error generating Strava URL:', err);
    }
  };

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
      {!!user?.avatar && getAvatarUrl() && (
        <Image source={{ uri: getAvatarUrl() || undefined }} style={styles.avatar} />
      )}

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

      {/* {!user?.strava_athlete_id ? (
        <Button
          title="Connect to Strava"
          onPress={handleConnectToStrava}
          buttonStyle={styles.button}
        />
      ) : (
        <Text
          style={[
            styles.description,
            isDarkMode ? styles.darkText : styles.lightText,
          ]}
        >
          Strava Connected (Athlete ID: {user.strava_athlete_id})
        </Text>
      )} */}

      <Button
        title="Logout"
        onPress={handleLogout}
        loading={isLoading}
        buttonStyle={[styles.button, styles.logoutButton]}
        type="outline"
      />

      {error && <Text style={styles.error}>{error}</Text>}
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
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default HomeScreen;
