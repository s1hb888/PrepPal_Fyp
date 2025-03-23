import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import SplashScreen from 'react-native-splash-screen';

const PrepPalSplashScreen = () => {
  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome</Text>
      <Text style={styles.milestoneText}>A milestone to reach your dream</Text>
      {/* Add your logo or any other elements here */}
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