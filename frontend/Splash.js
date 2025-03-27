import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const Splash = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Home');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}>
      {/* Display the splash-icon.png */}
      <Image source={require('../assets/splash-icon.png')} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff', // White background
  },
  logo: {
    width: 150,  // Adjust size as needed
    height: 150, // Adjust size as needed
    resizeMode: 'contain', // Ensures proper scaling
  },
});

export default Splash;

