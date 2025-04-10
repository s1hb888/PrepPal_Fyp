import React, { useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const Splash = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);
  }, []);

  return (
    <View style={styles.container}> 
      <Image source={require('../assets/splash-icon.png')} style={styles.logo} />
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
  logo: {
    width: 250,   
    height: 250,  
    resizeMode: 'contain',  
  },
});

export default Splash;

