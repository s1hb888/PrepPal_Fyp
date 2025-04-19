
import React from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet } from 'react-native';

const Courses = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Text style={styles.title}>Academic Learning</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.8}
          >
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} />
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardSubtitle}>Tap to start learning</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const menuItems = [
  { label: 'English', image: require('../assets/alphabets.png'), screen: 'EnglishAlphaBetsScreen' },
  { label: 'Urdu', image: require('../assets/urdu.png'), screen: 'Urdu' },
  { label: 'Numbers', image: require('../assets/numbers.png'), screen: 'Numbers' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topArea: {
    paddingVertical: 30,
    backgroundColor: '#EF3349',
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFCF25',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#EF3349',
    
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
  },
});

export default Courses;
