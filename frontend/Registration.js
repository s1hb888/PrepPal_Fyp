import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  // Removed TouchableWithoutFeedback from imports and use
} from 'react-native';
import { Ionicons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import API_BASE_URL from './config';

const cityAreas = {
  Islamabad: ['F-6', 'F-7', 'F-8', 'G-6', 'G-7', 'G-8', 'Blue Area', 'I-8', 'Bahria Enclave', 'DHA Phase 2'],
  Rawalpindi: ['Saddar', 'Peshawar Road', 'Scheme 3', 'Satellite Town', 'Murree Road', 'Chaklala', 'Lalazar', 'Adiala Road', 'Airport Housing', 'Bahria Town Phase 8'],
  Lahore: ['DHA Phase 5', 'DHA Phase 6', 'Johar Town', 'Model Town', 'Garden Town', 'Gulberg', 'Faisal Town', 'Cantt', 'Wapda Town', 'Bahria Town'],
  AzadKashmir: ['Muzaffarabad', 'Rawalakot', 'Bagh', 'Kotli', 'Mirpur', 'Neelum Valley', 'Athmuqam', 'Hattian Bala', 'Chakothi', 'Sudhanoti'],
};

const Registration = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [areaDropdownOpen, setAreaDropdownOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const handleRegister = async () => {
    setErrors({});
    setSuccessMsg('');
    const newErrors = {};

    // Frontend Validations
    if (!kidName.trim()) newErrors.kidName = "Kid's name is required.";
    if (!email.trim()) newErrors.email = 'Email is required.';
    if (!password.trim()) newErrors.password = 'Password is required.';
    if (!kidAge.trim()) newErrors.kidAge = "Kid's age is required.";
    if (!city) newErrors.city = 'City is required.';
    if (!area) newErrors.area = 'Area is required.';
    if (!agree) newErrors.agree = 'You must agree to the terms.';

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Invalid email format.';
    if (password && !/^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password))
      newErrors.password = 'Password must have 8+ chars, uppercase, digit & special char.';
    if (kidName && !/^[A-Za-z ]+$/.test(kidName.trim()))
      newErrors.kidName = 'Kid name must contain only alphabets and spaces.';
    if (kidAge && (parseInt(kidAge) < 3 || parseInt(kidAge) > 5))
      newErrors.kidAge = "Kid's age should be between 3 and 5.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API Call
    try {
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        email,
        password,
        kidName,
        kidAge: parseInt(kidAge),
        city,
        area,
      });

      console.log('Backend response:', response.data);

      setSuccessMsg("Verification link sent to your email. Please check your inbox.");
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Axios error:', error.response || error);
      const msg = error.response?.data?.message || 'Registration failed.';
      setErrors({ server: msg });
    }
  };

  const closeAllDropdowns = () => {
    setCityDropdownOpen(false);
    setAreaDropdownOpen(false);
  };

  const renderInput = (label, icon, value, setValue, placeholder, keyboardType = 'default', secure = false, fieldKey) => (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.modernInput,
        errors[fieldKey] && styles.inputError,
        focusedField === fieldKey && styles.inputFocused
      ]}>
        <View style={styles.iconContainer}>
          <FontAwesome name={icon} size={18} color="#EF3349" /> 
        </View>
        <TextInput
          value={value}
          onChangeText={(text) => {
            setValue(text);
            closeAllDropdowns();
          }}
          style={styles.textInput}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor="#999"
          secureTextEntry={secure && !passwordVisible}
          onFocus={() => {
            setFocusedField(fieldKey);
            closeAllDropdowns();
          }}
          onBlur={() => setFocusedField(null)}
        />
        {secure && (
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)} style={styles.eyeButton}>
            <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={20} color="#EF3349" />
          </TouchableOpacity>
        )}
      </View>
      {errors[fieldKey] && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={14} color="#EF3349" /> 
          <Text style={styles.errorText}>{errors[fieldKey]}</Text>
        </View>
      )}
    </View>
  );

  const Dropdown = ({ label, value, setValue, options, fieldKey, icon }) => {
    const isOpen = label === 'City' ? cityDropdownOpen : areaDropdownOpen;
    
    return (
      <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        <TouchableOpacity
          style={[
            styles.modernInput,
            errors[fieldKey] && styles.inputError,
            isOpen && styles.inputFocused
          ]}
          onPress={() => {
            if (label === 'City') {
              setCityDropdownOpen(!cityDropdownOpen);
              setAreaDropdownOpen(false);
            } else {
              setAreaDropdownOpen(!areaDropdownOpen);
              setCityDropdownOpen(false);
            }
          }}
          activeOpacity={0.7}
        >
          <View style={styles.iconContainer}>
            <FontAwesome5 name={icon} size={16} color="#EF3349" />
          </View>
          <Text style={[styles.dropdownText, { color: value ? '#000' : '#999' }]}>
            {value || `Select ${label}`}
          </Text>
          <Ionicons
            name={isOpen ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#EF3349"
            style={{ marginRight: 8 }}
          />
        </TouchableOpacity>
        {isOpen && (
          <View style={styles.modernDropdown}>
            <ScrollView style={{ maxHeight: 200 }} nestedScrollEnabled>
              {options.map((item, index) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownOption,
                    index === options.length - 1 && { borderBottomWidth: 0 }
                  ]}
                  onPress={() => {
                    setValue(item);
                    if (label === 'City') {
                      setCityDropdownOpen(false);
                      setArea('');
                    } else {
                      setAreaDropdownOpen(false);
                    }
                  }}
                >
                  <Text style={styles.dropdownOptionText}>{item}</Text>
                  {value === item && <Ionicons name="checkmark" size={20} color="#A0F0DC" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        {errors[fieldKey] && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={14} color="#EF3349" />
            <Text style={styles.errorText}>{errors[fieldKey]}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Removed TouchableWithoutFeedback wrapper */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section (Top Card) */}
        <LinearGradient colors={['#A0F0DC', '#7BE7CE']} style={styles.header}>
          {/* Bubbles added here */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.bubble3} />

          <View style={styles.logoContainer}>
            <LinearGradient
              colors={['#EF3349', '#D12A3D']}
              style={styles.logoCircle}
            >
              <FontAwesome5 name="child" size={32} color="#fff" />
            </LinearGradient>
          </View>
          <Text style={styles.welcomeTitle}>Create Account</Text>
          <Text style={styles.welcomeSubtitle}>Join PrepPal and start your child's learning journey</Text>
        </LinearGradient>

        {/* Form Card - Overlaps Header Card */}
        <View style={styles.formCard}>
          {/* Child Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="person" size={20} color="#EF3349" />
              </View>
              <Text style={styles.sectionTitle}>Child Information</Text>
            </View>
            {renderInput("Child's Name", 'user', kidName, setKidName, "Enter child's name", 'default', false, 'kidName')}
            {renderInput("Child's Age", 'calendar', kidAge, setKidAge, "Enter age (3-5)", 'numeric', false, 'kidAge')}
          </View>

          {/* Account Details Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="lock-closed" size={20} color="#EF3349" />
              </View>
              <Text style={styles.sectionTitle}>Account Details</Text>
            </View>
            {renderInput("Email Address", 'envelope', email, setEmail, 'Enter your email', 'email-address', false, 'email')}
            {renderInput("Password", 'lock', password, setPassword, 'Create a strong password', 'default', true, 'password')}
          </View>

          {/* Location Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="location" size={20} color="#EF3349" />
              </View>
              <Text style={styles.sectionTitle}>Location</Text>
            </View>
            <Dropdown label="City" value={city} setValue={setCity} options={Object.keys(cityAreas)} fieldKey="city" icon="city" />
            {city && <Dropdown label="Area" value={area} setValue={setArea} options={cityAreas[city]} fieldKey="area" icon="map-marker-alt" />}
          </View>

          {/* Terms & Conditions */}
          <TouchableOpacity 
            style={styles.checkboxContainer} 
            onPress={() => setAgree(!agree)}
            activeOpacity={0.7}
          >
            <View style={[styles.modernCheckbox, agree && styles.checkboxChecked]}>
              {agree && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text 
                style={styles.termsLink} 
                onPress={(e) => {
                  e.stopPropagation();
                  setShowTermsModal(true);
                }}
              >
                Terms & Conditions
              </Text>
            </Text>
          </TouchableOpacity>
          {errors.agree && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={14} color="#EF3349" />
              <Text style={styles.errorText}>{errors.agree}</Text>
            </View>
          )}

          {/* Server Error */}
          {errors.server && (
            <View style={[styles.errorContainer, { backgroundColor: '#FFE5E5', padding: 12, borderRadius: 8, marginTop: 12 }]}>
              <Ionicons name="alert-circle" size={18} color="#EF3349" />
              <Text style={[styles.errorText, { marginLeft: 8 }]}>{errors.server}</Text>
            </View>
          )}

          {/* Sign Up Button - Mint Color */}
          <LinearGradient 
            colors={['#A0F0DC', '#7BE7CE']}
            style={styles.signUpButton}
          >
            <TouchableOpacity onPress={handleRegister} style={styles.buttonTouchable} activeOpacity={0.8}>
              <Text style={styles.signUpButtonText}>Create Account</Text>
              <Ionicons name="person-add" size={20} color="#EF3349" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          </LinearGradient>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation?.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Terms Modal */}
        <Modal
          transparent
          visible={showTermsModal}
          animationType="fade"
          onRequestClose={() => setShowTermsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modernModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Terms & Conditions</Text>
                <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                  <Ionicons name="close" size={24} color="#EF3349" /> 
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                <View style={styles.termCard}>
                  <View style={styles.termIconCircle}>
                    <Ionicons name="eye-outline" size={22} color="#EF3349" />
                  </View>
                  <View style={styles.termTextContainer}>
                    <Text style={styles.termTitle}>Parental Supervision</Text>
                    <Text style={styles.termDescription}>You must supervise your child while using PrepPal.</Text>
                  </View>
                </View>

                <View style={styles.termCard}>
                  <View style={styles.termIconCircle}>
                    <Ionicons name="lock-closed-outline" size={22} color="#EF3349" />
                  </View>
                  <View style={styles.termTextContainer}>
                    <Text style={styles.termTitle}>Privacy Protection</Text>
                    <Text style={styles.termDescription}>We respect your privacy and do not share data with third parties.</Text>
                  </View>
                </View>

                <View style={styles.termCard}>
                  <View style={styles.termIconCircle}>
                    <Ionicons name="document-text-outline" size={22} color="#EF3349" />
                  </View>
                  <View style={styles.termTextContainer}>
                    <Text style={styles.termTitle}>Accurate Information</Text>
                    <Text style={styles.termDescription}>You confirm all information entered is accurate and true.</Text>
                  </View>
                </View>

                <View style={styles.termCard}>
                  <View style={styles.termIconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={22} color="#EF3349" />
                  </View>
                  <View style={styles.termTextContainer}>
                    <Text style={styles.termTitle}>Security</Text>
                    <Text style={styles.termDescription}>All passwords must be strong and kept confidential.</Text>
                  </View>
                </View>

                <View style={[styles.termCard, { marginBottom: 0 }]}>
                  <View style={styles.termIconCircle}>
                    <Ionicons name="school-outline" size={22} color="#EF3349" />
                  </View>
                  <View style={styles.termTextContainer}>
                    <Text style={styles.termTitle}>Educational Purpose</Text>
                    <Text style={styles.termDescription}>PrepPal is for educational use only and not a substitute for parenting.</Text>
                  </View>
                </View>
              </ScrollView>

              {/* Got It Button - Mint Color */}
              <LinearGradient
                colors={['#A0F0DC', '#7BE7CE']}
                style={styles.modalCloseButton}
              >
                <TouchableOpacity onPress={() => setShowTermsModal(false)} style={{width: '100%', alignItems: 'center'}}>
                  <Text style={styles.modalCloseText}>Got It</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Success Modal */}
        <Modal
          transparent
          visible={showSuccessModal}
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modernModal}>
              <View style={styles.successIconContainer}>
                <LinearGradient
                  colors={['#A0F0DC', '#7BE7CE']}
                  style={styles.successIconCircle}
                >
                  <Ionicons name="checkmark" size={40} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={styles.successTitle}>Account Created!</Text>
              <Text style={styles.successMessage}>{successMsg}</Text>
              <LinearGradient
                colors={['#A0F0DC', '#7BE7CE']}
                style={styles.successButton}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowSuccessModal(false);
                    navigation?.navigate('Login');
                  }}
                >
                  <Text style={styles.successButtonText}>Continue to Login</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

// ... (styles remain the same)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
      },
      scrollContent: {
        flexGrow: 1,
        paddingBottom: 20, 
      },
      header: {
        alignItems: 'center',
        paddingTop: 60,
        paddingBottom: 60,
        paddingHorizontal: 20,
        overflow: 'hidden', 
      },
      bubble1: {
        position: 'absolute',
        top: 20,
        left: -30,
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        zIndex: 0,
      },
      bubble2: {
        position: 'absolute',
        bottom: -50,
        right: 50,
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        zIndex: 0,
      },
      bubble3: {
        position: 'absolute',
        top: 80,
        right: -20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        zIndex: 0,
      },
      logoContainer: {
        marginBottom: 20,
        zIndex: 1,
      },
      logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      welcomeTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
        zIndex: 1,
      },
      welcomeSubtitle: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        textAlign: 'center',
        paddingHorizontal: 20,
        zIndex: 1,
      },
      formCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        paddingBottom: 40,
        elevation: 10, 
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 }, 
        shadowOpacity: 0.15,
        shadowRadius: 10,
        marginTop: -30, 
        zIndex: 2, 
      },
      section: {
        marginBottom: 20,
      },
      sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
      },
      sectionIconContainer: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#A0F0DC', 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
      },
      sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
      },
      fieldContainer: {
        marginBottom: 16,
      },
      fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
      },
      modernInput: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: 'transparent',
        height: 56,
      },
      inputFocused: {
        borderColor: '#A0F0DC', 
        backgroundColor: '#fff',
      },
      inputError: {
        borderColor: '#EF3349',
      },
      iconContainer: {
        width: 48,
        justifyContent: 'center',
        alignItems: 'center',
      },
      textInput: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        paddingRight: 12,
      },
      dropdownText: {
        flex: 1,
        fontSize: 16,
        paddingRight: 12,
      },
      eyeButton: {
        padding: 12,
      },
      modernDropdown: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginTop: 8,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        borderWidth: 1,
        borderColor: '#E0E0E0',
      },
      dropdownOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
      },
      dropdownOptionText: {
        fontSize: 16,
        color: '#000',
      },
      checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 8,
      },
      modernCheckbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#A0F0DC', 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
      checkboxChecked: {
        backgroundColor: '#A0F0DC', 
      },
      checkboxText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
      },
      termsLink: {
        color: '#A0F0DC', 
        fontWeight: '600',
      },
      errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 6,
      },
      errorText: {
        color: '#EF3349',
        fontSize: 13,
        marginLeft: 4,
      },
      signUpButton: {
        borderRadius: 12,
        marginTop: 24,
        elevation: 4,
        shadowColor: '#A0F0DC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      buttonTouchable: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 16,
      },
      signUpButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
      },
      loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 24,
      },
      loginText: {
        fontSize: 15,
        color: '#666',
      },
      loginLink: {
        fontSize: 15,
        color: '#A0F0DC', 
        fontWeight: '600',
      },
      modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      },
      modernModal: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        width: '100%',
        maxWidth: 400,
        maxHeight: '80%',
      },
      modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
      },
      modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#000',
      },
      modalContent: {
        maxHeight: 400,
      },
      termCard: {
        flexDirection: 'row',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
      },
      termIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#A0F0DC', 
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
      },
      termTextContainer: {
        flex: 1,
      },
      termTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#000',
        marginBottom: 4,
      },
      termDescription: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
      },
      modalCloseButton: {
        borderRadius: 12,
        marginTop: 20,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#A0F0DC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      modalCloseText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 14,
      },
      successIconContainer: {
        alignItems: 'center',
        marginBottom: 20,
      },
      successIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#A0F0DC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      successTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 12,
      },
      successMessage: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 24,
      },
      successButton: {
        borderRadius: 12,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#A0F0DC',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      successButtonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: '600',
        paddingVertical: 14,
      },
});

export default Registration;