import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from 'react-native';
import { Ionicons, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import axios from 'axios';
import API_BASE_URL from './config';

// City -> Areas Map
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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

  const handleRegister = async () => {
  setErrors({});
  setSuccessMsg('');
  const newErrors = {};

  // ----- Frontend Validations -----
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

  // ----- API Call -----
  try {
    const response = await axios.post(`${API_BASE_URL}/api/register`, {
      email,
      password,
      kidName,
      kidAge: parseInt(kidAge),
      city,
      area,
    });

    console.log('Backend response:', response.data); // ✅ Now response is defined

    // Show success modal
    setSuccessMsg("Verification link sent to your email. Please check your inbox.");
    setShowSuccessModal(true);

  } catch (error) {
    console.error('Axios error:', error.response || error); // ✅ See full error in console
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
            <Ionicons name={passwordVisible ? 'eye' : 'eye-off'} size={20} color="#EF3349" style={styles.eye} />
          </TouchableOpacity>
        )}
      </View>
      {errors[fieldKey] && <Text style={styles.errorText}>{errors[fieldKey]}</Text>}
    </View>
  );

// Replace the previous Dropdown component with this:
const Dropdown = ({ label, value, setValue, options, fieldKey, icon }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}<Text style={{ color: 'red' }}> *</Text></Text>
    <TouchableOpacity
      style={[styles.inputWrapper, errors[fieldKey] && { borderColor: 'red', borderWidth: 1 }]}
      onPress={() => {
        if (label === 'City') {
          setCityDropdownOpen(!cityDropdownOpen);
          setAreaDropdownOpen(false);
        } else {
          setAreaDropdownOpen(!areaDropdownOpen);
          setCityDropdownOpen(false);
        }
      }}
    >
      <FontAwesome5 name={icon} size={20} color="#EF3349" style={styles.icon} />
      <Text style={[styles.input, { color: value ? '#000' : '#888' }]}>{value || `Select ${label}`}</Text>
      <Ionicons
        name={(label === 'City' ? cityDropdownOpen : areaDropdownOpen) ? 'chevron-up' : 'chevron-down'}
        size={18}
        color="#EF3349"
      />
    </TouchableOpacity>
    {(label === 'City' ? cityDropdownOpen : areaDropdownOpen) && (
      <View style={styles.dropdownList}>
        {options.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.dropdownItem}
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
            <Text style={{ color: '#000' }}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
    {errors[fieldKey] && <Text style={styles.errorText}>{errors[fieldKey]}</Text>}
  </View>
);


  return (
    <LinearGradient colors={['rgb(160,240,220)', 'rgb(160,240,220)']} style={styles.gradientBackground}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to PrepPal</Text>

          {renderInput("Kid's Name", 'user', kidName, setKidName, "Enter kid's name", 'default', false, 'kidName')}
          {renderInput("Email", 'envelope', email, setEmail, 'Enter email address', 'email-address', false, 'email')}
          {renderInput("Password", 'lock', password, setPassword, 'Enter password', 'default', true, 'password')}
          {renderInput("Kid's Age", 'calendar', kidAge, setKidAge, "Enter kid's age", 'numeric', false, 'kidAge')}

          <Dropdown label="City" value={city} setValue={setCity} options={Object.keys(cityAreas)} fieldKey="city" icon="city" />
          {city ? <Dropdown label="Area" value={area} setValue={setArea} options={cityAreas[city]} fieldKey="area" icon="map-marker-alt" /> : null}

          {/* Terms */}
          <TouchableOpacity style={styles.checkboxRow} onPress={() => setAgree(!agree)}>
            <View style={[styles.checkbox, agree && styles.checked]}>
              {agree && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.agreeText}>
              I agree to the{' '}
              <Text style={styles.termsLink} onPress={() => setShowTermsModal(true)}>Terms & Conditions</Text>
            </Text>
          </TouchableOpacity>
          {errors.agree && <Text style={styles.errorText}>{errors.agree}</Text>}
          {errors.server && <Text style={styles.errorText}>{errors.server}</Text>}

          <LinearGradient colors={['#A0F0DC', '#2BCB9A']} style={styles.button}>
            <TouchableOpacity onPress={handleRegister} style={{ width: '100%', alignItems: 'center' }}>
              <Text style={styles.buttonText}>SIGN UP</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.footer}>
            Already have an account? <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Login</Text>
          </Text>
        </View>

        {/* Terms & Conditions Modal */}
        {showTermsModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.successModal}>
              <Text style={[styles.successTitle, { color: '#000', textAlign: 'center', marginBottom: 15 }]}>Terms & Conditions</Text>
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

        {showSuccessModal && (
  <View style={styles.modalOverlay}>
    <View style={styles.successModal}>
      <Text style={[styles.successTitle, { textAlign: 'center', marginBottom: 15 }]}>
        {successMsg}
      </Text>
      <TouchableOpacity
        onPress={() => {
          setShowSuccessModal(false);
          navigation.navigate('Login');
        }}
        style={styles.closeButton}
      >
        <Text style={styles.closeButtonText}>OK</Text>
      </TouchableOpacity>
    </View>
  </View>
)}

      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientBackground: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, elevation: 4 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 14, color: '#000', marginBottom: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 8, paddingHorizontal: 10, height: 50, justifyContent: 'space-between' },
  input: { flex: 1, fontSize: 16, color: '#000' },
  icon: { marginRight: 8 },
  eye: { paddingLeft: 10 },
  dropdownList: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, maxHeight: 150, marginTop: 4 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginTop: 15, marginBottom: 10 },
  checkbox: { width: 20, height: 20, borderWidth: 2, borderColor: '#EF3349', borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  checked: { backgroundColor: '#EF3349' },
  agreeText: { marginLeft: 10, fontSize: 14, color: '#000' },
  termsLink: { color: '#EF3349', fontWeight: 'bold' },
  button: { borderRadius: 8, paddingVertical: 14, marginTop: 15, marginBottom: 18 },
  buttonText: { fontWeight: 'bold', fontSize: 16, color: '#000' },
  footer: { textAlign: 'center', fontSize: 14, color: '#000' },
  loginLink: { color: '#EF3349', fontWeight: 'bold' },
  errorText: { color: 'red', fontSize: 12, marginTop: 2 },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successModal: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: '90%', alignItems: 'center' },
  closeButton: { marginTop: 20, backgroundColor: '#EF3349', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  closeButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  termItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  termIcon: { marginRight: 10, marginTop: 3 },
  termText: { flex: 1, fontSize: 14, color: '#000' },
});

export default Registration;