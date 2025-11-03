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
  TextInput,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UrduAlphabetAccessScreen = () => {
  const [alphabets, setAlphabets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessData, setAccessData] = useState([]);

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

      const response = await axios.get(`${API_BASE_URL}/api/access/urdu`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = response.data || [];
      setAlphabets(data);

      const formatted = data.map(item => ({
        item_id: item._id,
        min_attempts: item.min_attempts ?? 3,
        min_time_avg: item.min_time_avg ?? 2,
        min_correct_avg: item.min_correct_avg ?? 80,
        active: item.active ?? true,
      }));
      setAccessData(formatted);
    } catch (error) {
      console.error('Error fetching Urdu alphabets:', error.response?.data || error.message);
      Alert.alert('Error', 'Could not load Urdu alphabets');
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (id, field, value) => {
    setAccessData(prev =>
      prev.map(a => (a.item_id === id ? { ...a, [field]: value } : a))
    );
  };

  const toggleActive = (id) => {
    setAccessData(prev =>
      prev.map(a =>
        a.item_id === id ? { ...a, active: !a.active } : a
      )
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
        `${API_BASE_URL}/api/update/urdu/access`,
        { alphabets: accessData },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('✅ Success', 'Urdu alphabet access updated successfully!');
    } catch (error) {
      console.error('Error saving Urdu alphabet access:', error);
      Alert.alert('❌ Error', 'Failed to update Urdu alphabet access');
    }
  };

  const renderItem = ({ item }) => {
    const data = accessData.find(a => a.item_id === item._id);
    if (!data) return null;

    const disabled = !data.active;

    return (
      <View
        style={[
          styles.card,
          disabled && styles.inactiveCard,
        ]}
      >
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        <Text style={styles.alphabetText}>{item.alphabet || '—'}</Text>
        <Text style={styles.wordText}>{item.word || '—'}</Text>

        <View style={styles.separator} />

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Attempts</Text>
          <TextInput
            editable={!disabled}
            style={[styles.input, disabled && styles.disabledInput]}
            keyboardType="numeric"
            value={data.min_attempts.toString()}
            onChangeText={(t) => handleFieldChange(item._id, 'min_attempts', t)}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Time Avg</Text>
          <TextInput
            editable={!disabled}
            style={[styles.input, disabled && styles.disabledInput]}
            keyboardType="numeric"
            value={data.min_time_avg.toString()}
            onChangeText={(t) => handleFieldChange(item._id, 'min_time_avg', t)}
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.label}>Correct %</Text>
          <TextInput
            editable={!disabled}
            style={[styles.input, disabled && styles.disabledInput]}
            keyboardType="numeric"
            value={data.min_correct_avg.toString()}
            onChangeText={(t) => handleFieldChange(item._id, 'min_correct_avg', t)}
          />
        </View>

        <View style={styles.switchRow}>
          <Text style={[styles.switchLabel, !data.active && styles.inactiveText]}>
            {data.active ? 'Active' : 'Inactive'}
          </Text>
          <Switch
            value={data.active}
            onValueChange={() => toggleActive(item._id)}
            thumbColor={data.active ? '#2BCB9A' : '#ccc'}
            trackColor={{ true: '#A0F0DC', false: '#ddd' }}
          />
        </View>
      </View>
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
      <Text style={styles.title}>Manage Access: Urdu Alphabets (اردو حروف)</Text>

      <FlatList
        data={alphabets}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.grid}
      />

      <TouchableOpacity style={styles.saveButton} onPress={saveAccess}>
        <Text style={styles.saveButtonText}>💾 Save Changes</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#F9FAFB' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginVertical: 16,
    color: '#111827',
  },
  grid: { paddingBottom: 120 },
  card: {
    flex: 1,
    margin: 8,
    padding: 14,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    alignItems: 'center',
  },
  inactiveCard: {
    backgroundColor: '#FDECEC',
    borderColor: '#FCA5A5',
  },
  image: { width: 80, height: 80, marginBottom: 8 },
  placeholder: { justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: '#9CA3AF', fontSize: 12 },
  alphabetText: { fontSize: 26, fontWeight: 'bold', color: '#111', textAlign: 'center' },
  wordText: { fontSize: 16, color: '#6B7280', textAlign: 'center' },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    width: '100%',
    marginVertical: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
    justifyContent: 'space-between',
    width: '90%',
  },
  label: { fontSize: 13, color: '#111827', fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 6,
    width: 60,
    textAlign: 'center',
    fontSize: 13,
    backgroundColor: '#F9FAFB',
  },
  disabledInput: {
    backgroundColor: '#F3F4F6',
    color: '#9CA3AF',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
    marginTop: 8,
  },
  switchLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  inactiveText: { color: '#DC2626' },
  saveButton: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    backgroundColor: '#EF3349',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 50,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default UrduAlphabetAccessScreen;
