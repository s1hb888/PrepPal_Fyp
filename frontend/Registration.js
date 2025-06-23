
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons, FontAwesome, Entypo } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import API_BASE_URL from './config';

const Registration = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleRegister = async () => {
    const newErrors = {};

    if (!kidName.trim()) newErrors.kidName = "Kid's name is required.";
    if (!email.trim()) newErrors.email = 'Email is required.';
    if (!password.trim()) newErrors.password = 'Password is required.';
    if (!kidAge.trim()) newErrors.kidAge = "Kid's age is required.";
    if (!agree) newErrors.agree = 'You must agree to the terms.';

    if (email && !validateEmail(email)) newErrors.email = 'Invalid email format. Please enter a valid email address.';
    if (password && !validatePassword(password))
      newErrors.password = 'Password must be at least 8 characters long and contain an uppercase letter, a digit, and a special character.';
    if (kidName && !/^[A-Za-z ]+$/.test(kidName.trim()))
  newErrors.kidName = 'Kid name must contain only alphabets and spaces.';

    if (kidAge && (parseInt(kidAge) < 3 || parseInt(kidAge) > 5))
      newErrors.kidAge = "Kid's age should be between 3 and 5.";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await axios.post(`${API_BASE_URL}/api/register`, {
        email,
        password,
        kidName,
        kidAge,
      });
      if (response.status === 201) {
        setSuccessModalVisible(true);
        setTimeout(() => {
          setSuccessModalVisible(false);
          navigation.navigate('Login');
        }, 2000);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Registration failed.';
      setErrors({ server: msg });
    }
  };

  const renderInput = (label, icon, value, setValue, placeholder, keyboardType = 'default', secure = false, fieldKey) => (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}<Text style={{ color: 'red' }}> *</Text></Text>

      <View style={[styles.inputWrapper, errors[fieldKey] && { borderColor: 'red', borderWidth: 1 }]}>
        <FontAwesome name={icon} size={20} color="#EF3349" style={styles.icon} />
        <TextInput
          value={value}
          onChangeText={setValue}
          style={styles.input}
          placeholder={placeholder}
          keyboardType={keyboardType}
          placeholderTextColor="#888"
          secureTextEntry={secure && !passwordVisible}
        />
        {secure && (
          <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
            <Ionicons
              name={passwordVisible ? 'eye' : 'eye-off'}
              size={20}
              color="#EF3349"
              style={styles.eye}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[fieldKey] && <Text style={{ color: 'red', fontSize: 12, marginLeft: 5 }}>{errors[fieldKey]}</Text>}
    </View>
  );

  return (
    <LinearGradient colors={['rgb(160,240,220)', 'rgb(160,240,220)']} style={styles.gradientBackground}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={[styles.title, { fontFamily: 'sans-serif-condensed' }]}>Welcome to PrepPal</Text>

          {renderInput("Kid's Name", 'user', kidName, setKidName, "Enter kid's name", 'default', false, 'kidName')}
          {renderInput("Email", 'envelope', email, setEmail, 'Enter email address', 'email-address', false, 'email')}
          {renderInput("Password", 'lock', password, setPassword, 'Enter password', 'default', true, 'password')}
          {renderInput("Kid's Age", 'calendar', kidAge, setKidAge, "Enter kid's age", 'numeric', false, 'kidAge')}

          <TouchableOpacity style={[styles.checkboxRow, { marginBottom: 10 }]} onPress={() => setAgree(!agree)}>
            <View style={[styles.checkbox, agree && styles.checked, errors.agree && { borderColor: 'red' }]}>
              {agree && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.agreeText}>
              I agree to the{' '}
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>
                Terms & Conditions
              </Text>
            </Text>
          </TouchableOpacity>
          {errors.agree && <Text style={{ color: 'red', fontSize: 12, marginLeft: 5 }}>{errors.agree}</Text>}

          {errors.server && (
            <Text style={{ color: 'red', fontSize: 14, marginBottom: 10, textAlign: 'center' }}>{errors.server}</Text>
          )}

          <LinearGradient colors={['#A0F0DC', '#2BCB9A']} style={styles.button}>
  <TouchableOpacity onPress={handleRegister} style={{ width: '100%', alignItems: 'center' }}>
    <Text style={styles.buttonText}>SIGN UP</Text>
  </TouchableOpacity>
</LinearGradient>


          <Text style={styles.footer}>
            Already have an account?{' '}
            <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>
              Login
            </Text>
          </Text>
        </View>

        {successModalVisible && (
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <Ionicons name="checkmark-circle" size={60} color="#2BCB9A" style={{ alignSelf: 'center' }} />
              <Text style={styles.successTitle}>Registration Successful!</Text>
              <Text style={styles.successText}>Redirecting to login...</Text>
            </View>
          </View>
        )}
{showTermsModal && (
  <View style={styles.modalOverlay}>
    <View style={styles.successModal}>
      <Text style={[styles.successTitle, { color: '#000', textAlign: 'center', marginBottom: 15 }]}>
        Terms & Conditions
      </Text>

      <View style={{ alignSelf: 'stretch' }}>
        <View style={styles.termItem}>
          <Ionicons name="eye-outline" size={20} color="#EF3349" style={styles.termIcon} />
          <Text style={styles.termText}>You must supervise your child while using PrepPal.</Text>
        </View>
        <View style={styles.termItem}>
          <Ionicons name="lock-closed-outline" size={20} color="#EF3349" style={styles.termIcon} />
          <Text style={styles.termText}>We respect your privacy and do not share data with third parties.</Text>
        </View>
        <View style={styles.termItem}>
          <Ionicons name="document-text-outline" size={20} color="#EF3349" style={styles.termIcon} />
          <Text style={styles.termText}>You confirm all information entered is accurate and true.</Text>
        </View>
        <View style={styles.termItem}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#EF3349" style={styles.termIcon} />
          <Text style={styles.termText}>All passwords must be strong and kept confidential.</Text>
        </View>
        <View style={styles.termItem}>
          <Ionicons name="school-outline" size={20} color="#EF3349" style={styles.termIcon} />
          <Text style={styles.termText}>PrepPal is for educational use only and not a substitute for parenting.</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => setShowTermsModal(false)} style={styles.closeButton}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    width: '95%',
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 5,
    marginLeft: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 8,
    height: 50,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#000',
    fontSize: 16,
  },
  eye: {
    paddingLeft: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#EF3349',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checked: {
    backgroundColor: '#EF3349',
  },
  agreeText: {
    marginLeft: 10,
    fontSize: 14,
    color: '#000',
  },
 termsLink: {
  color: '#EF3349', // red from your PrepPal theme (icon color)
  fontWeight: 'bold',
},

  button: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    marginTop:15,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    textAlign: 'center',
    fontSize: 14,
    color: '#000',
  },
  loginLink: {
    color: '#EF3349',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  successModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 15,
    textAlign: 'center',
  },
  successText: {
    fontSize: 14,
    color: '#333',
    marginTop: 5,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: '#EF3349',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
termItem: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginBottom: 10,
},
termIcon: {
  marginRight: 10,
  marginTop: 3,
},
termText: {
  flex: 1,
  fontSize: 14,
  color: '#000',
},

});

export default Registration;
