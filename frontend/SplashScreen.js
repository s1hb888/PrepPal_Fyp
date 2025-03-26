import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Register');  // Automatically go to Register screen
    }, 3000);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to PrepPal</Text>
      <Text style={styles.milestoneText}>A milestone to reach your dream</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  milestoneText: {
    fontSize: 16,
    marginTop: 10,
  },
});

export default PrepPalSplashScreen;
