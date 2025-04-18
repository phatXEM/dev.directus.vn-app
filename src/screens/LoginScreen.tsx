import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button, Input, Text, Icon, Divider } from 'react-native-elements';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@context/AuthContext';
import { loginSchema, LoginFormData } from '@validation/auth';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const LoginScreen = () => {
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const {
    login,
    loginWithApple,
    loginWithFacebook,
    isLoading,
    isAppleAuthAvailable,
  } = useAuth();
  const isDarkMode = useColorScheme() === 'dark';

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const success = await login(data.email, data.password);
      if (!success) {
        Alert.alert(
          'Login Failed',
          'Invalid email or password. Please try again.',
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please try again later.',
      );
      console.error(error);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const result = await loginWithApple();

      if (!result.success) {
        const errorMessage = result.error
          ? `Could not sign in with Apple: ${result.error}`
          : 'Could not sign in with Apple. Please try again.';

        Alert.alert('Sign in Failed', errorMessage);
      }
    } catch (error) {
      console.error('Apple sign in error in component:', error);

      let errorMessage =
        'An unexpected error occurred. Please try again later.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const result = await loginWithFacebook();

      if (!result.success) {
        const errorMessage = result.error
          ? `Could not sign in with Facebook: ${result.error}`
          : 'Could not sign in with Facebook. Please try again.';

        Alert.alert('Sign in Failed', errorMessage);
      }
    } catch (error) {
      console.error('Facebook sign in error in component:', error);

      let errorMessage =
        'An unexpected error occurred. Please try again later.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text
          h1
          style={[
            styles.title,
            isDarkMode ? styles.darkText : styles.lightText,
          ]}
        >
          Login
        </Text>
        <Text
          style={[
            styles.subtitle,
            isDarkMode ? styles.darkText : styles.lightText,
          ]}
        >
          Sign in to your account
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Email"
              leftIcon={<Icon name="email" type="material" />}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              containerStyle={styles.inputContainer}
              disabled={isLoading}
              placeholderTextColor={isDarkMode ? '#86939e' : undefined}
              inputStyle={isDarkMode ? styles.darkText : undefined}
              errorStyle={styles.errorText}
              errorMessage={errors.email?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              placeholder="Password"
              leftIcon={<Icon name="lock" type="material" />}
              rightIcon={
                <Icon
                  name={secureTextEntry ? 'eye-off' : 'eye'}
                  type="ionicon"
                  onPress={toggleSecureEntry}
                />
              }
              secureTextEntry={secureTextEntry}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              containerStyle={styles.inputContainer}
              disabled={isLoading}
              placeholderTextColor={isDarkMode ? '#86939e' : undefined}
              inputStyle={isDarkMode ? styles.darkText : undefined}
              errorStyle={styles.errorText}
              errorMessage={errors.password?.message}
            />
          )}
        />

        <Button
          title="Sign In"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          containerStyle={styles.buttonContainer}
          buttonStyle={styles.button}
          disabled={isLoading}
        />

        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Text
            style={[
              styles.dividerText,
              isDarkMode ? styles.darkText : styles.lightText,
            ]}
          >
            or
          </Text>
          <Divider style={styles.divider} />
        </View>

        {/* Facebook Login Button */}
        <TouchableOpacity
          style={[styles.socialButton, styles.facebookButton]}
          onPress={handleFacebookSignIn}
          disabled={isLoading}
        >
          <FontAwesome
            name="facebook-official"
            size={22}
            color="#FFFFFF"
            style={styles.socialIcon}
          />
          <Text style={styles.facebookButtonText}>Sign in with Facebook</Text>
        </TouchableOpacity>

        {/* Apple Login Button */}
        {isAppleAuthAvailable && (
          <TouchableOpacity
            style={[
              styles.socialButton,
              styles.appleButton,
              {
                backgroundColor: isDarkMode ? '#FFFFFF' : '#000000',
              },
            ]}
            onPress={handleAppleSignIn}
            disabled={isLoading}
          >
            <FontAwesome
              name="apple"
              size={22}
              color={isDarkMode ? '#000000' : '#FFFFFF'}
              style={styles.socialIcon}
            />
            <Text
              style={[
                styles.appleButtonText,
                {
                  color: isDarkMode ? '#000000' : '#FFFFFF',
                },
              ]}
            >
              Sign in with Apple
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 20,
  },
  button: {
    borderRadius: 25,
    padding: 15,
  },
  darkText: {},
  lightText: {
    color: '#000000',
  },
  errorText: {
    color: '#ff3b30',
    fontWeight: '500',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
    width: '80%',
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
  },
  socialButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    padding: 15,
    width: '80%',
    marginBottom: 15,
  },
  socialIcon: {
    marginRight: 10,
  },
  facebookButton: {
    backgroundColor: '#1877F2',
  },
  facebookButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  appleButton: {
    backgroundColor: '#000000',
  },
  appleButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default LoginScreen;
