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
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FontAwesome, Feather, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import API_BASE_URL from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function FeedbackScreen() {
  const [ratings, setRatings] = useState({
    appEaseOfUse: 0,
    performanceRating: 0,
    designSatisfaction: 0,
    featureUsefulness: 0,
  });
  const [bugOrIssueExperience, setBugOrIssueExperience] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [completionProgress, setCompletionProgress] = useState(0);

  // Animation values
  const [scaleAnimations] = useState({
    appEaseOfUse: new Animated.Value(1),
    performanceRating: new Animated.Value(1),
    designSatisfaction: new Animated.Value(1),
    featureUsefulness: new Animated.Value(1),
  });

  useEffect(() => {
    const checkFeedback = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;
      try {
        const res = await axios.get(`${API_BASE_URL}/api/feedback`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const email = await AsyncStorage.getItem('email');
        const exists = res.data.some((f) => f.email === email);
        if (exists) setAlreadySubmitted(true);
      } catch (err) {
        console.error('Error checking feedback:', err);
      }
    };
    checkFeedback();
  }, []);

  // Calculate completion progress
  useEffect(() => {
    const ratingCount = Object.values(ratings).filter(r => r > 0).length;
    const progress = (ratingCount / 4) * 100;
    setCompletionProgress(progress);
  }, [ratings]);

  const handleStarPress = (field, starRating) => {
    setRatings((prev) => ({ ...prev, [field]: starRating }));
    
    // Animate the card
    Animated.sequence([
      Animated.timing(scaleAnimations[field], {
        toValue: 1.02,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimations[field], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    const { appEaseOfUse, performanceRating, designSatisfaction, featureUsefulness } = ratings;

    if (!appEaseOfUse || !performanceRating || !designSatisfaction || !featureUsefulness) {
      Alert.alert('Incomplete Feedback', 'Please rate all required fields to help us serve you better.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to submit feedback.');
        setIsSubmitting(false);
        return;
      }

      const feedbackData = {
        appEaseOfUse,
        performanceRating,
        designSatisfaction,
        featureUsefulness,
        bugOrIssueExperience: bugOrIssueExperience.trim(),
        suggestions: suggestions.trim(),
      };

      const response = await axios.post(`${API_BASE_URL}/api/feedback`, feedbackData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 201) {
        setShowSuccess(true);
        setAlreadySubmitted(true);
      }
    } catch (error) {
      console.error('Error submitting feedback:', error.response?.data || error);
      Alert.alert('Submission Failed', error.response?.data?.message || 'Unable to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRatings({
      appEaseOfUse: 0,
      performanceRating: 0,
      designSatisfaction: 0,
      featureUsefulness: 0,
    });
    setBugOrIssueExperience('');
    setSuggestions('');
  };

  const getRatingLabel = (rating) => {
    switch (rating) {
      case 1: return 'Needs Improvement';
      case 2: return 'Below Average';
      case 3: return 'Satisfactory';
      case 4: return 'Very Good';
      case 5: return 'Outstanding';
      default: return '';
    }
  };

  const getRatingIcon = (rating) => {
    switch (rating) {
      case 1:
        return <MaterialIcons name="sentiment-very-dissatisfied" size={22} color="#EF3349" />;
      case 2:
        return <MaterialIcons name="sentiment-dissatisfied" size={22} color="#FFB300" />;
      case 3:
        return <MaterialIcons name="sentiment-satisfied" size={22} color="#FDD835" />;
      case 4:
        return <MaterialIcons name="sentiment-very-satisfied" size={22} color="#2BCB9A" />;
      case 5:
        return <MaterialIcons name="sentiment-very-satisfied" size={22} color="#2BCB9A" />;
      default:
        return null;
    }
  };

  const isFormValid =
    Object.values(ratings).every((r) => r > 0) &&
    !alreadySubmitted;

  const ratingCategories = [
    { 
      field: 'appEaseOfUse', 
      title: 'Ease of Use', 
      desc: 'How intuitive and user-friendly is the navigation?',
      icon: 'touch-app'
    },
    { 
      field: 'performanceRating', 
      title: 'Performance & Reliability', 
      desc: 'Speed, responsiveness, and stability of the app',
      icon: 'speed'
    },
    { 
      field: 'designSatisfaction', 
      title: 'Visual Design & Appeal', 
      desc: 'Child-friendly interface and overall aesthetics',
      icon: 'color-lens'
    },
    { 
      field: 'featureUsefulness', 
      title: 'Feature Value', 
      desc: 'Effectiveness of tools in supporting your child learning',
      icon: 'extension'
    },
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.fullContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}} style={styles.backButton}>
          <Feather name="arrow-left" size={20} color="#555" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <FontAwesome name="star" size={24} color="white" />
          </View>
          <Text style={styles.headerTitle}>Parent Feedback Center</Text>
          <Text style={styles.headerSubtitle}>Your insights shape PrepPal's future</Text>
        </View>
        
        {/* Progress Indicator */}
        {!alreadySubmitted && (
          <View style={styles.progressContainer}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressText}>Completion Progress</Text>
              <Text style={styles.progressPercentage}>{Math.round(completionProgress)}%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${completionProgress}%` }]} />
            </View>
          </View>
        )}
      </View>

      <ScrollView 
        style={styles.contentContainer} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContentContainer}
      >
        {alreadySubmitted && (
          <View style={styles.submittedBanner}>
            <MaterialIcons name="check-circle" size={20} color="#2BCB9A" />
            <Text style={styles.submittedText}>
              Feedback received! We appreciate your time and input.
            </Text>
          </View>
        )}

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rate Your Experience</Text>
          <Text style={styles.sectionSubtitle}>
            Help us understand what's working and what needs improvement
          </Text>
        </View>

        {/* Rating Categories */}
        {ratingCategories.map(({ field, title, desc, icon }, index) => (
          <Animated.View
            key={field}
            style={[
              styles.card,
              { 
                marginTop: index === 0 ? 8 : 12,
                transform: [{ scale: scaleAnimations[field] }],
                borderColor: ratings[field] > 0 ? '#2BCB9A' : '#E0E0E0',
                borderWidth: ratings[field] > 0 ? 1.5 : 1,
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={styles.iconTitleRow}>
                <View style={[styles.categoryIcon, { backgroundColor: ratings[field] > 0 ? '#EF3349' : '#F0F0F0' }]}>
                  <MaterialIcons 
                    name={icon} 
                    size={20} 
                    color={ratings[field] > 0 ? 'white' : '#999'} 
                  />
                </View>
                <View style={styles.titleContainer}>
                  <View style={styles.titleRow}>
                    <Text style={styles.dropdownTitle}>{title}</Text>
                    <Text style={styles.requiredAsterisk}>*</Text>
                  </View>
                  <Text style={styles.ratingSubtitle}>{desc}</Text>
                </View>
              </View>
              {ratings[field] > 0 && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingBadgeText}>{ratings[field]}/5</Text>
                </View>
              )}
            </View>
            
            <View style={styles.starsContainer}>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => handleStarPress(field, star)}
                    disabled={alreadySubmitted}
                    style={styles.starButton}
                  >
                    <FontAwesome
                      name={star <= ratings[field] ? "star" : "star-o"}
                      size={32}
                      color={star <= ratings[field] ? '#FFD700' : '#D0D0D0'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              {ratings[field] > 0 && (
                <View style={styles.ratingLabelContainer}>
                  {getRatingIcon(ratings[field])}
                  <Text style={styles.ratingLabel}>{getRatingLabel(ratings[field])}</Text>
                </View>
              )}
            </View>
          </Animated.View>
        ))}

        {/* Detailed Feedback Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Additional Insights</Text>
          <Text style={styles.sectionSubtitle}>
            Optional but invaluable for continuous improvement
          </Text>
        </View>

        {/* Bug/Issue Field */}
        <View style={[
          styles.card, 
          { 
            marginTop: 8,
            borderColor: focusedField === 'bugs' ? '#EF3349' : '#E0E0E0',
            borderWidth: focusedField === 'bugs' ? 1.5 : 1,
          }
        ]}>
          <View style={styles.iconTitleRow}>
            <View style={styles.categoryIcon}>
              <MaterialIcons name="bug-report" size={20} color="white" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.dropdownTitle}>Technical Issues</Text>
              <Text style={styles.optionalLabel}>Optional</Text>
            </View>
          </View>
          <TextInput
            style={[styles.textArea, { borderColor: focusedField === 'bugs' ? '#EF3349' : '#E0E0E0' }]}
            multiline
            placeholder="Report any bugs, crashes, or technical difficulties encountered..."
            placeholderTextColor="#999"
            value={bugOrIssueExperience}
            onChangeText={setBugOrIssueExperience}
            editable={!alreadySubmitted}
            onFocus={() => setFocusedField('bugs')}
            onBlur={() => setFocusedField(null)}
          />
          <Text style={styles.charCount}>{bugOrIssueExperience.length} characters</Text>
        </View>

        {/* Suggestions */}
        <View style={[
          styles.card, 
          { 
            marginTop: 12,
            borderColor: focusedField === 'suggestions' ? '#EF3349' : '#E0E0E0',
            borderWidth: focusedField === 'suggestions' ? 1.5 : 1,
          }
        ]}>
          <View style={styles.iconTitleRow}>
            <View style={styles.categoryIcon}>
              <MaterialIcons name="lightbulb-outline" size={20} color="white" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.dropdownTitle}>Feature Requests & Ideas</Text>
              <Text style={styles.optionalLabel}>Optional</Text>
            </View>
          </View>
          <TextInput
            style={[styles.textArea, { borderColor: focusedField === 'suggestions' ? '#EF3349' : '#E0E0E0' }]}
            multiline
            placeholder="Share your ideas for new features or improvements..."
            placeholderTextColor="#999"
            value={suggestions}
            onChangeText={setSuggestions}
            editable={!alreadySubmitted}
            onFocus={() => setFocusedField('suggestions')}
            onBlur={() => setFocusedField(null)}
          />
          <Text style={styles.charCount}>{suggestions.length} characters</Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
          style={[
            styles.submitButton, 
            { 
              opacity: !isFormValid || isSubmitting ? 0.5 : 1,
              backgroundColor: isFormValid && !isSubmitting ? '#EF3349' : '#CCC'
            }
          ]}
        >
          {isSubmitting ? (
            <View style={styles.submitContent}>
              <ActivityIndicator color="white" size="small" />
              <Text style={styles.submitText}>Submitting...</Text>
            </View>
          ) : (
            <View style={styles.submitContent}>
              <MaterialIcons name="send" size={20} color="white" />
              <Text style={styles.submitText}>Submit Feedback</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.privacyNote}>
          Your feedback is confidential and used solely to enhance PrepPal
        </Text>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Success Modal */}
      <Modal animationType="fade" transparent={true} visible={showSuccess}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <View style={styles.successIconContainer}>
              <MaterialIcons name="check-circle" size={70} color="#2BCB9A" />
            </View>
            <Text style={styles.modalTitle}>Feedback Received!</Text>
            <Text style={styles.modalText}>
              Thank you for taking the time to share your thoughts. Your insights are instrumental in making PrepPal the best learning companion for your child.
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowSuccess(false);
                resetForm();
              }}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fullContainer: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    padding: 16,
    backgroundColor: 'rgb(160,240,220)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    paddingTop: 40,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: { alignItems: 'center', marginTop: 4 },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#EF3349',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#000', marginBottom: 4 },
  headerSubtitle: { color: '#2C3E50', fontSize: 14, fontWeight: '500' },
  progressContainer: {
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: { fontSize: 13, fontWeight: '600', color: '#2C3E50' },
  progressPercentage: { fontSize: 13, fontWeight: 'bold', color: '#EF3349' },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2BCB9A',
    borderRadius: 3,
  },
  contentContainer: { flex: 1, padding: 16 },
  scrollContentContainer: { 
    paddingBottom: 20,
  },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2BCB9A',
  },
  submittedText: {
    flex: 1,
    marginLeft: 10,
    color: '#147D64',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#7F8C8D',
    lineHeight: 18,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconTitleRow: { 
    flexDirection: 'row', 
    alignItems: 'flex-start',
    flex: 1,
  },
  categoryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EF3349',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#2C3E50',
  },
  requiredAsterisk: { 
    color: '#EF3349', 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginLeft: 4,
  },
  ratingSubtitle: { 
    color: '#7F8C8D', 
    fontSize: 13, 
    marginTop: 4,
    lineHeight: 18,
  },
  optionalLabel: {
    fontSize: 12,
    color: '#95A5A6',
    fontStyle: 'italic',
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: '#2BCB9A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  starsContainer: {
    alignItems: 'center',
  },
  starsRow: { 
    flexDirection: 'row', 
    justifyContent: 'center',
    marginVertical: 8,
  },
  starButton: {
    marginHorizontal: 4,
    padding: 4,
  },
  ratingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ratingLabel: { 
    color: '#2C3E50', 
    fontSize: 14, 
    fontWeight: '600',
    marginLeft: 8,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FAFAFA',
    textAlignVertical: 'top',
    minHeight: 100,
    marginTop: 10,
    fontSize: 14,
    color: '#2C3E50',
  },
  charCount: {
    fontSize: 11,
    color: '#95A5A6',
    textAlign: 'right',
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: '#EF3349',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#EF3349',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16,
    marginLeft: 8,
  },
  privacyNote: {
    textAlign: 'center',
    color: '#95A5A6',
    fontSize: 12,
    marginTop: 16,
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  centeredView: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.6)' 
  },
  modalView: { 
    margin: 20, 
    backgroundColor: 'white', 
    borderRadius: 24, 
    padding: 32, 
    alignItems: 'center', 
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    maxWidth: 340,
  },
  successIconContainer: {
    marginBottom: 16,
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 14, 
    textAlign: 'center',
    color: '#2C3E50',
  },
  modalText: { 
    fontSize: 15, 
    marginBottom: 24, 
    textAlign: 'center',
    color: '#5D6D7E',
    lineHeight: 22,
  },
  modalButton: { 
    backgroundColor: '#2BCB9A',
    borderRadius: 12, 
    paddingVertical: 14,
    paddingHorizontal: 32,
    elevation: 2,
    minWidth: 140,
  },
  modalButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    textAlign: 'center', 
    fontSize: 16,
  },
});