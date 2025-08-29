import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RatingScreen() {
  // Form state
  const [rating, setRating] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Dropdown state
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);

  const kidName = 'Student';

  const courses = [
    { id: 1, name: 'Academic Learning', color: '#000000' },
    { id: 2, name: 'General Knowledge', color: '#000000' },
  ];

  const difficultyLevels = [
    { id: 1, level: 'Easy', color: '#000000' },
    { id: 2, level: 'Moderate', color: '#000000' },
    { id: 3, level: 'Challenging', color: '#000000' },
  ];

  const handleStarPress = (starRating) => {
    setRating(starRating);
  };

  const handleSubmit = async () => {
    if (!rating || !selectedCourse || !difficulty) {
      Alert.alert('Error', 'Course, difficulty, and rating are required.');
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

      const ratingData = {
        course: selectedCourse,
        rating,
        difficulty,
        suggestions: suggestions.trim(),
      };

      const response = await axios.post(`${API_BASE_URL}/api/feedback`, ratingData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setShowSuccess(true);
      }
    } catch (error) {
      console.error('Error submitting rating:', error.response?.data || error);
      Alert.alert('Failed', error.response?.data?.message || 'Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRating(0);
    setSelectedCourse('');
    setDifficulty('');
    setSuggestions('');
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1:
        return 'Poor';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Very Good';
      case 5:
        return 'Excellent';
      default:
        return '';
    }
  };

  const isFormValid = rating > 0 && selectedCourse && difficulty;

  const Dropdown = ({ label, value, setValue, options, isOpen, setIsOpen, isRequired }) => (
    <View style={{ marginTop: 8 }}>
      <View style={styles.iconTitleRow}>
        <Text style={styles.dropdownTitle}>{label}</Text>
        {isRequired && <Text style={styles.requiredAsterisk}>*</Text>}
      </View>
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={() => setIsOpen(!isOpen)}
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
                setValue(opt.name || opt.level);
                setIsOpen(false);
              }}
            >
              <Text style={{ color: '#000000' }}>{opt.name || opt.level}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.fullContainer}>
      {/* Header View - This will be static */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#555" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <FontAwesome name="star" size={24} color="white" />
          </View>
          <Text style={styles.headerTitle}>Course Rating</Text>
          <Text style={styles.headerSubtitle}>Help us make learning even better!</Text>
        </View>
      </View>

      {/* Scrollable Content */}
      <ScrollView style={styles.scrollViewContent}>
        <View style={{ padding: 16 }}>
          {/* Course Dropdown */}
          <View style={styles.card}>
            <View style={styles.iconTitleRow}>
              <MaterialIcons name="school" size={24} color="#EF3349" />
              <Text style={styles.dropdownTitle}>Select Course</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </View>
            <Dropdown
              label="Course"
              value={selectedCourse}
              setValue={setSelectedCourse}
              options={courses}
              isOpen={courseDropdownOpen}
              setIsOpen={setCourseDropdownOpen}
              isRequired={true}
            />
          </View>

          {/* Rating */}
          <View style={styles.card}>
            <View style={styles.iconTitleRow}>
              <FontAwesome name="star" size={24} color="#EF3349" />
              <Text style={styles.dropdownTitle}>Overall Rating</Text>
              <Text style={styles.requiredAsterisk}>*</Text>
            </View>
            <Text style={styles.ratingSubtitle}>Rate your overall experience</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => handleStarPress(star)}>
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
                {/* Removed green dot */}
                <Text style={styles.ratingLabel}>{getRatingLabel(rating)}</Text>
              </View>
            )}
          </View>

          {/* Difficulty Dropdown */}
          <View style={styles.card}>
            <View style={styles.iconTitleRow}>
              <MaterialIcons name="trending-up" size={24} color="#EF3349" />
              <Text style={styles.dropdownTitle}>Course Difficulty</Text>
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
          <View style={styles.card}>
            <View style={styles.iconTitleRow}>
              <MaterialIcons name="lightbulb-outline" size={24} color="#EF3349" />
              <Text style={styles.dropdownTitle}>Improvement Suggestions</Text>
            </View>
            <Text style={styles.ratingSubtitle}>Help us enhance your learning experience</Text>
            <TextInput
              style={styles.textArea}
              multiline
              placeholder="Any ideas on how we can make this course better?"
              placeholderTextColor="#999"
              value={suggestions}
              onChangeText={setSuggestions}
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
              <Text style={styles.submitText}>Submit Rating</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

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
            <Text style={styles.modalText}>
              Your rating has been submitted successfully.
            </Text>
            <TouchableOpacity
              style={[styles.button, styles.buttonClose]}
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

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: 'rgb(160,240,220)', // Mint green
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 50, // Added padding to push content down from the status bar
  },
  scrollViewContent: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  headerContent: { alignItems: 'center' },
  headerIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EF3349', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  headerSubtitle: { color: '#000', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginVertical: 8, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  iconTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dropdownTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', marginLeft: 8 },
  requiredAsterisk: { color: '#EF3349', fontSize: 16, fontWeight: 'bold', marginLeft: 4 },
  ratingSubtitle: { color: '#999', fontSize: 14, marginTop: -4, marginBottom: 8 },
  dropdownHeader: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff' },
  dropdownLabel: { fontSize: 14, color: '#000' },
  dropdownList: { marginTop: 4, borderWidth: 1, borderColor: '#ccc', borderRadius: 12, backgroundColor: '#fff' },
  dropdownItem: { padding: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 8 },
  ratingLabelContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  ratingLabel: { textAlign: 'center', color: '#000', fontSize: 14, fontWeight: 'bold' },
  textArea: { borderWidth: 1, borderColor: '#ccc', borderRadius: 12, padding: 12, backgroundColor: '#fff', textAlignVertical: 'top', minHeight: 80, marginTop: 8 },
  submitButton: { backgroundColor: '#EF3349', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 16 },
  submitText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  // Modal styles
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 25,
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#EF3349',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});