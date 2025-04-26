import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
const Alphabets = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Choose a Language</Text>
      <TouchableOpacity
  style={[styles.card, { backgroundColor: '#2BCB9A' }]}
  onPress={() => navigation.navigate('EnglishAlphaBetsScreen')}>
  <Text style={styles.cardText}>English</Text>
</TouchableOpacity> 
            <TouchableOpacity
  style={[styles.card, { backgroundColor: '#2BCB9A' }]}
  onPress={() => navigation.navigate('UrduAlphabetScreen')}>
  <Text style={styles.cardText}>Urdu</Text>
  
</TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>⬅ Back</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 16,
    backgroundColor: '#fefefe',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    alignSelf: 'center',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    marginBottom: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    justifyContent: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backText: {
    marginTop: 20,
    textAlign: 'center',
    color: '#888',
    fontSize: 18,
  },
});

export default Alphabets;
