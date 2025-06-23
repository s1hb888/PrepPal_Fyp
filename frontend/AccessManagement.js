import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AccessManagement = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.topArea}>
        <Text style={styles.title}>Access Management</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.8}
          >
            <View style={styles.card}>
              <Icon name={item.icon} size={60} color="#EF3349" style={styles.icon} />
              <View style={styles.textContainer}>
                <Text style={styles.cardTitle}>{item.label}</Text>
                <Text style={styles.cardSubtitle}>Tap to manage</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const menuItems = [
  { label: 'English', icon: 'alphabetical', screen: 'AlphabetsAccessScreen' },
  { label: 'Urdu', icon: 'alphabetical-variant', screen: 'UrduAccessScreen' },
  { label: 'Numbers', icon: 'numeric', screen: 'NumberAccessScreen' },
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topArea: {
    paddingVertical: 30,
    backgroundColor: '#A0F0DC', // Mint
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000', // Black text
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#A0F0DC', // MINT background
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
  icon: {
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000', // Black text
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#000', // Black text
    marginTop: 4,
  },
});

export default AccessManagement;

