// screens/NumberAccessScreen.js

import axios from 'axios';
import API_BASE_URL from './config';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NumberAccessScreen = () => {
  const [numbers, setNumbers] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNumbers();
  }, []);

  const fetchNumbers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/numbers`);
      setNumbers(response.data);
    } catch (error) {
      console.error('Error fetching numbers:', error);
      Alert.alert('Error', 'Could not load numbers');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (itemId) => {
    setSelectedIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const saveAccess = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Token not found. Please log in again.');
        return;
      }

      await axios.put(
        `${API_BASE_URL}/api/update/numbers/access`,
        { numbers: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Access updated successfully!');
    } catch (error) {
      console.error('Error saving access:', error);
      Alert.alert('Error', 'Failed to update access');
    }
  };

  const renderItem = ({ item }) => {
    const selected = selectedIds.includes(item._id);
    return (
      <TouchableOpacity
        style={[styles.card, selected && styles.cardSelected]}
        onPress={() => toggleSelect(item._id)}
      >
        <Image
          source={{ uri: item.image_url }}
          style={styles.image}
          resizeMode="contain"
        />
        <Text style={styles.numberText}>{item.number}</Text>
        <Text style={styles.wordText}>{item.word}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2BCB9A" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Manage Access: Numbers</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          If you want to show only selected numbers, tap on them and press the "Update Access" button below.
        </Text>
      </View>

      <FlatList
        data={numbers}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveAccess}>
        <Text style={styles.saveButtonText}>Update Access</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  infoBox: {
    backgroundColor: '#e6f7f3',
    borderLeftWidth: 5,
    borderLeftColor: '#2BCB9A',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
  },
  grid: {
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#2BCB9A',
    backgroundColor: '#e1f8f2',
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  numberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  wordText: {
    fontSize: 14,
    color: '#555',
  },
  saveButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#2BCB9A',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 30,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NumberAccessScreen;
