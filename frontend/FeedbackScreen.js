import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbackScreen() {
  // Form state
  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Dropdown state
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);

  const difficultyLevels = [
    { id: 1, level: 'Easy', color: '#000000' },
    { id: 2, level: 'Moderate', color: '#000000' },
    { id: 3, level: 'Challenging', color: '#000000' },
  ];

  useEffect(() => {
    const checkFeedback = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const email = await AsyncStorage.getItem('email'); // assuming you stored email
        const exists = res.data.some((f) => f.email === email);
        if (exists) setAlreadySubmitted(true);
      } catch (err) {
        console.error('Error checking feedback:', err);
      }
    };
    checkFeedback();
  }, []);

  const handleStarPress = (starRating) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (!rating || !difficulty || suggestions.trim() === '') {
      Alert.alert('Error', 'Rating, difficulty, and suggestions are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'User not authenticated.');
        setIsSubmitting(false);
        return;
      }

      const feedbackData = {
        rating,
        difficulty,
        suggestions: suggestions.trim(),
      };

      const response = await axios.post(`${API_BASE_URL}/api/feedback`, feedbackData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setShowSuccess(true);
        setAlreadySubmitted(true); // disable form after submission
      }
    } catch (error) {
      console.error('Error submitting feedback:', error.response?.data || error);
      Alert.alert('Failed', error.response?.data?.message || 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setDifficulty('');
    setSuggestions('');
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  const isFormValid = rating > 0 && difficulty && suggestions.trim() !== '' && !alreadySubmitted;

  const Dropdown = ({ label, value, setValue, options, isOpen, setIsOpen, isRequired }) => (
    <View style={{ marginTop: 8 }}>
      <View style={styles.iconTitleRow}>
        <Text style={styles.dropdownTitle}>{label}</Text>
        {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setIsOpen(!isOpen)}
        disabled={alreadySubmitted}
      >
        <Text style={styles.dropdownLabel}>{value || `Select ${label}`}</Text>
        <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={20} />
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.dropdownList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.dropdownItem}
              onPress={() => {
                setValue(opt.level);
                setIsOpen(false);
              }}
              disabled={alreadySubmitted}
            >
              <Text style={{ color: '#000000' }}>{opt.level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.fullContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#555" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <FontAwesome name="star" size={24} color="white" />
          </View>
          <Text style={styles.headerTitle}>Feedback</Text>
          <Text style={styles.headerSubtitle}>Help us make learning even better!</Text>
        </View>
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {alreadySubmitted && (
          <Text style={{ textAlign: 'center', color: 'green', marginBottom: 12 }}>
            You have already submitted your feedback. Thank you!
          </Text>
        )}

        {/* Rating */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={styles.iconTitleRow}>
            <FontAwesome name="star" size={24} color="#EF3349" />
            <Text style={styles.dropdownTitle}>Overall Rating</Text>
            <Text style={styles.requiredAsterisk}>*</Text>
          </View>
          <Text style={styles.ratingSubtitle}>Rate your overall experience</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => handleStarPress(star)} disabled={alreadySubmitted}>
                <FontAwesome
                  name="star"
                  size={32}
                  color={star <= rating ? '#FFD700' : '#ccc'}
                  style={{ marginHorizontal: 4 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <View style={styles.ratingLabelContainer}>
              <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
            </View>
          )}
        </View>

        {/* Difficulty */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={styles.iconTitleRow}>
            <MaterialIcons name="trending-up" size={24} color="#EF3349" />
            <Text style={styles.dropdownTitle}>Difficulty</Text>
            <Text style={styles.requiredAsterisk}>*</Text>
          </View>
          <Dropdown
            label="Difficulty"
            value={difficulty}
            setValue={setDifficulty}
            options={difficultyLevels}
            isOpen={difficultyDropdownOpen}
            setIsOpen={setDifficultyDropdownOpen}
            isRequired={true}
          />
        </View>

        {/* Suggestions */}
        <View style={[styles.card, { marginTop: 12 }]}>
          <View style={styles.iconTitleRow}>
            <MaterialIcons name="lightbulb-outline" size={24} color="#EF3349" />
            <Text style={styles.dropdownTitle}>Suggestions</Text>
            <Text style={styles.requiredAsterisk}>*</Text>
          </View>
          <TextInput
            style={styles.textArea}
            multiline
            placeholder="Any ideas on how we can improve?"
            placeholderTextColor="#999"
            value={suggestions}
            onChangeText={setSuggestions}
            editable={!alreadySubmitted}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          style={[styles.submitButton, { opacity: !isFormValid || isSubmitting ? 0.5 : 1 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccess}
        onRequestClose={() => {
          setShowSuccess(false);
          resetForm();
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <MaterialIcons name="check-circle" size={60} color="#2BCB9A" />
            <Text style={styles.modalTitle}>Thank You!</Text>
            <Text style={styles.modalText}>Your feedback has been submitted successfully.</Text>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: '#2BCB9A' }]} // Mint close button
              onPress={() => {
                setShowSuccess(false);
                resetForm();
              }}
            >
              <Text style={styles.textStyle}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    padding: 12,
    backgroundColor: 'rgb(160,240,220)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 40,
  },
  backButton: { padding: 6, backgroundColor: '#fff', borderRadius: 12, alignSelf: 'flex-start', marginBottom: 6 },
  headerContent: { alignItems: 'center', marginTop: -4 },
  headerIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#EF3349', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  headerTitle: { fontSize: 25, fontWeight: 'bold', color: '#000' },
  headerSubtitle: { color: '#000', fontSize: 13 },
  contentContainer: { flex: 1, padding: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginVertical: 6, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  iconTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dropdownTitle: { fontSize: 15, fontWeight: 'bold', color: '#000', marginLeft: 6 },
  requiredAsterisk: { color: '#EF3349', fontSize: 14, fontWeight: 'bold', marginLeft: 2 },
  ratingSubtitle: { color: '#999', fontSize: 13, marginTop: -2, marginBottom: 6 },
  dropdownHeader: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  dropdownLabel: { fontSize: 13, color: '#000' },
  dropdownList: { marginTop: 3, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, backgroundColor: '#fff' },
  dropdownItem: { padding: 10 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 6 },
  ratingLabelContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  ratingLabel: { textAlign: 'center', color: '#000', fontSize: 13, fontWeight: 'bold' },
  textArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 10, backgroundColor: '#fff', textAlignVertical: 'top', minHeight: 70, marginTop: 2 },
  submitButton: { backgroundColor: '#EF3349', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalView: { margin: 20, backgroundColor: 'white', borderRadius: 20, padding: 30, alignItems: 'center', elevation: 5 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalText: { fontSize: 15, marginBottom: 20, textAlign: 'center' },
  button: { borderRadius: 10, padding: 10, elevation: 2 },
  textStyle: { color: 'white', fontWeight: 'bold', textAlign: 'center', fontSize: 15 },
});
