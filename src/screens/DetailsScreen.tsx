import React from 'react';
import { StyleSheet, useColorScheme, View } from 'react-native';
import { Button, Text } from 'react-native-elements';
import { DetailsScreenNavigationProp } from '@navigation/AppNavigator';

type DetailsScreenProps = {
  navigation: DetailsScreenNavigationProp;
};

const DetailsScreen = ({ navigation }: DetailsScreenProps) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View style={styles.screenContainer}>
      <Text h1 style={isDarkMode ? styles.darkText : styles.lightText}>
        Details Screen
      </Text>
      <Text
        style={[
          styles.description,
          isDarkMode ? styles.darkText : styles.lightText,
        ]}
      >
        This is the details page with React Native Elements styling
      </Text>
      <Button
        title="Go Back"
        onPress={() => navigation.goBack()}
        buttonStyle={styles.button}
        type="outline"
      />
      <Button
        title="Go to Home"
        onPress={() => navigation.navigate('Home')}
        buttonStyle={[styles.button, styles.secondButton]}
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
  button: {
    width: 200,
    borderRadius: 8,
  },
  secondButton: {
    marginTop: 10,
  },
  description: {
    marginBottom: 20,
  },
  darkText: {
    // color: '#FFFFFF',
  },
  lightText: {
    // color: '#000000',
  },
});

export default DetailsScreen;
