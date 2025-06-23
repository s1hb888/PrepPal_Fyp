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

const AlphabetAccessScreen = () => {
  const [alphabets, setAlphabets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAlphabets();
  }, []);

  const fetchAlphabets = async () => {
  try {
    setLoading(true);
    
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Token Missing', 'Please log in again.');
      setLoading(false);
      return;
    }

    const response = await axios.get(`${API_BASE_URL}/api/access/alphabets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setAlphabets(response.data);
  } catch (error) {
    console.error('Error fetching alphabets:', error.response?.data || error.message);
    Alert.alert('Error', 'Could not load alphabets');
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
        `${API_BASE_URL}/api/update/alphabets/access`,
        { alphabets: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', 'Alphabet access updated successfully!');
    } catch (error) {
      console.error('Error saving alphabet access:', error);
      Alert.alert('Error', 'Failed to update alphabet access');
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
        <Text style={styles.alphabetText}>{item.alphabet}</Text>
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
      <Text style={styles.title}>Manage Access: Alphabets</Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoText}>
          Tap on letters to select or deselect them, then press "Update Access" to save changes.
        </Text>
      </View>

      <FlatList
        data={alphabets}
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
  container: { flex: 1, padding: 16, backgroundColor: '#FFFFFF' },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop:30,
    marginBottom: 15,
    color: '#000', // black
  },

  infoBox: {
    backgroundColor: '#A0F0DC', // mint
    borderLeftWidth: 5,
    borderLeftColor: '#EF3349', // red
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },

  infoText: {
    fontSize: 14,
    color: '#000', // black
  },

  grid: {
    paddingBottom: 100,
  },

  card: {
    flex: 1,
    margin: 8,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    elevation: 2,
  },

  cardSelected: {
    borderColor: '#EF3349', // red
    backgroundColor: '#A0F0DC', // mint
  },

  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },

  alphabetText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000', // black
  },

  wordText: {
    fontSize: 14,
    color: '#000', // black
  },

  saveButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    backgroundColor: '#EF3349', // red
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

export default AlphabetAccessScreen;
