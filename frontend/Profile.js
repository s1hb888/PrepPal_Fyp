import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from './config';


const ProfileScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showImageOptions, setShowImageOptions] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok) {
        if (result.profileImage) {
          setImage(`${API_BASE_URL}${result.profileImage}`);
        }
        setEmail(result.email);
        setKidName(result.kidName);
        setKidAge(result.kidAge.toString());
      } else {
        Alert.alert('Error', result.message || 'Failed to fetch profile');
      }
    } catch (error) {
      console.error('Fetch Profile Error:', error);
    }
  };

  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleUploadImage = async (imageUri) => {
    const formData = new FormData();
    formData.append('profileImage', {
      uri: imageUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
    });

    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.put(`${API_BASE_URL}/api/profile/photo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setImage(`${response.data.imageUrl}?t=${Date.now()}`); 
        fetchProfile(); 
        Alert.alert('Success', 'Profile image updated successfully');
      }
      
    } catch (error) {
      console.error('Upload error:', error.response?.data || error.message);
      Alert.alert('Error', 'Image upload failed');
    }
  };
  const handleSave = async () => {
    if (!kidName || !kidAge) {
      Alert.alert('Error', "Please enter your kid’s name and age.");
      return;
    }
  
    // Kid Age Validation
    if (kidAge < 3 || kidAge > 5) {
      Alert.alert('Error', 'Kid’s age must be between 3 and 5 years.');
      return;
    }
  
    if (password && !validatePassword(password)) {
      Alert.alert('Error', 'Weak password. Must include uppercase, number & special char.');
      return;
    }
  
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password, kidName, kidAge }),
      });
  
      const result = await response.json();
      if (response.ok) {
        Alert.alert('Success', result.message);
      } else {
        Alert.alert('Error', result.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert('Error', 'Server error. Try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    Alert.alert('Confirm Deletion', 'Are you sure you want to delete your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/api/delete`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
  
            const result = await response.json();
  
            if (response.ok) {
              // Remove token from AsyncStorage to expire it
              await AsyncStorage.removeItem('token');
              Alert.alert('Deleted', 'Account deleted successfully.');
              navigation.replace('Registration');  // Navigate to Registration screen
            } else {
              Alert.alert('Error', result.message || 'Failed to delete account');
            }
          } catch (error) {
            console.error('Delete Error:', error);
            Alert.alert('Error', 'Server error. Try again.');
          }
        },
      },
    ]);
  };
  

  const rotateImage = async () => {
    const editedImage = await ImageManipulator.manipulateAsync(
      imagePreview,
      [{ rotate: 90 }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImagePreview(editedImage.uri);
  };

  const flipImageHorizontal = async () => {
    const editedImage = await ImageManipulator.manipulateAsync(
      imagePreview,
      [{ flip: ImageManipulator.FlipType.Horizontal }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImagePreview(editedImage.uri);
  };

  const flipImageVertical = async () => {
    const editedImage = await ImageManipulator.manipulateAsync(
      imagePreview,
      [{ flip: ImageManipulator.FlipType.Vertical }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    setImagePreview(editedImage.uri);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.profileInfo}>
        <TouchableOpacity onPress={() => setShowImageOptions(true)} style={styles.imageWrapper}>
          {image ? (
            <Image source={{ uri: image }} style={styles.profileImage} />
          ) : (
            <View style={styles.profileImage} />
          )}
          <View style={styles.editIconWrapper}>
            <Feather name="edit-2" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Image Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showImageOptions}
        onRequestClose={() => setShowImageOptions(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Choose Image</Text>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#2BCB9A', marginBottom: 10 }]}
              onPress={async () => {
                const result = await ImagePicker.launchImageLibraryAsync({
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.5,
                });
                if (!result.canceled) {
                  setImagePreview(result.assets[0].uri);
                  setShowImageOptions(false);
                  setModalVisible(true);
                }
              }}
            >
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#2BCB9A', marginBottom: 20 }]}
              onPress={async () => {
                const result = await ImagePicker.launchCameraAsync({
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.5,
                });
                if (!result.canceled) {
                  setImagePreview(result.assets[0].uri);
                  setShowImageOptions(false);
                  setModalVisible(true);
                }
              }}
            >
              <Text style={styles.buttonText}>Take Picture</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: '#EF3349' }]}
              onPress={() => setShowImageOptions(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Preview Modal */}
      {imagePreview && isModalVisible && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={isModalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalHeader}>Preview</Text>
              <Image
                source={{ uri: imagePreview }}
                style={{ width: 200, height: 200, borderRadius: 100, alignSelf: 'center', marginBottom: 20 }}
              />

              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                <TouchableOpacity onPress={rotateImage} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Rotate</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={flipImageHorizontal} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Flip H</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={flipImageVertical} style={styles.modalButton}>
                  <Text style={styles.buttonText}>Flip V</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setImage(imagePreview);
                  handleUploadImage(imagePreview);
                  setModalVisible(false);
                }}
                style={{
                  backgroundColor: '#2BCB9A',
                  paddingVertical: 12,
                  paddingHorizontal: 30,
                  borderRadius: 50,
                  alignSelf: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>✓ Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} editable={false} style={styles.input} />

        <View style={styles.passwordContainer}>
  <TextInput
    placeholder="Enter new password (optional)"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
    style={styles.passwordInput}
  />
  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
    <Feather name={showPassword ? 'eye' : 'eye-off'} size={20} color="#999" />
  </TouchableOpacity>
</View>


        <Text style={styles.label}>Kid's Name</Text>
        <TextInput
          placeholder="Enter kid's name"
          value={kidName}
          onChangeText={setKidName}
          style={styles.input}
        />

        <Text style={styles.label}>Kid's Age</Text>
        <TextInput
          placeholder="Enter kid's age"
          value={kidAge}
          onChangeText={setKidAge}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
          <Feather name="save" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 90,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#EF3349',
    backgroundColor: '#ddd',
  },
  formContainer: {
    padding: 20,
  },
  label: {
    color: '#EF3349',
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#2BCB9A',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#EF3349',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  imageWrapper: {
    position: 'relative',
    backgroundColor: '#E6F7F2',
    borderRadius: 60,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFCF25',
    borderRadius: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#EF3349',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#FFCF25',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 10,
  },
});

export default ProfileScreen;
