import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Image, StyleSheet, Modal } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Feather, MaterialIcons } from '@expo/vector-icons';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from './config';

const Profile = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [kidName, setKidName] = useState('');
  const [kidAge, setKidAge] = useState('');
  const [image, setImage] = useState(null); // local image state
const [isModalVisible, setModalVisible] = useState(false); // For editing options modal
const [showImageOptions, setShowImageOptions] = useState(false); // For choosing image source


  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pwd);
  };

  const handleSave = async () => {
    if (!kidName || !kidAge) {
      Alert.alert('Error', "Please enter your kid’s name and age.");
      return;
    }

    if (password && !validatePassword(password)) {
      Alert.alert(
        'Error',
        'Password must be at least 8 characters long and include one uppercase letter, one digit, and one special character.'
      );
      return;
    }

    try {
      const token = await AsyncStorage.getItem('token'); 

      const payload = {
        email,
        ...(kidName && { kidName }),
        ...(kidAge && { kidAge }),
        ...(password && { password }),
        ...(image && { profileImage: image }), // send image URI (optional)
      };

      const response = await axios.put(`${API_BASE_URL}/api/update`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Profile updated successfully.');
      } else {
        Alert.alert('Error', 'Failed to update profile.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Server error, please try again later.');
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
            if (!token) {
              Alert.alert('Error', 'No authentication token found.');
              return;
            }

            const response = await axios.delete(`${API_BASE_URL}/api/delete`, {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              data: {
                email: email,  
              },
            });

            if (response.status === 200) {
              Alert.alert('Deleted', 'Your account has been deleted.');
            } else {
              Alert.alert('Error', 'Failed to delete account.');
            }
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Server error, please try again later.');
          }
        },
      },
    ]);
  };

// Pick Image from Gallery or Camera
const pickImage = async () => {
  let result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.5,
  });

  if (!result.canceled) {
    setImage(result.assets[0].uri);
    setModalVisible(true); // Show modal for image editing
  }
};

// Rotate Image
const rotateImage = async () => {
  const editedImage = await ImageManipulator.manipulateAsync(
    image,
    [{ rotate: 90 }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  setImage(editedImage.uri);
};

// Flip Image Horizontally
const flipImageHorizontal = async () => {
  const editedImage = await ImageManipulator.manipulateAsync(
    image,
    [{ flip: ImageManipulator.FlipType.Horizontal }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  setImage(editedImage.uri);
};

// Flip Image Vertically
const flipImageVertical = async () => {
  const editedImage = await ImageManipulator.manipulateAsync(
    image,
    [{ flip: ImageManipulator.FlipType.Vertical }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );
  setImage(editedImage.uri);
};

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.profileInfo}>
        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
          <Image
            source={image ? { uri: image } : require('../assets/family.png')}
            style={styles.profileImage}
          />
          <View style={styles.editIconWrapper}>
            <Feather name="edit-2" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>Your Name</Text>
        <Text style={styles.location}>Your Location</Text>
      </View>

      {/* Custom Image Picker Options */}
<Modal
  animationType="slide"
  transparent={true}
  visible={showImageOptions}
  onRequestClose={() => setShowImageOptions(false)}>
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      <Text style={styles.modalHeader}>Select Image From</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: '#2BCB9A' }]}
          onPress={async () => {
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
              setShowImageOptions(false);
              setModalVisible(true);
            }
          }}>
          <Text style={styles.buttonText}>Camera</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: '#2BCB9A' }]}
          onPress={async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });
            if (!result.canceled) {
              setImage(result.assets[0].uri);
              setShowImageOptions(false);
              setModalVisible(true);
            }
          }}>
          <Text style={styles.buttonText}>Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: '#EF3349' }]}
          onPress={() => setShowImageOptions(false)}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          placeholder="Enter new password (optional)"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

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
    borderColor: '#fff',
    backgroundColor: '#ddd',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  location: {
    fontSize: 16,
    color: '#777',
    marginTop: 5,
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
  },
  buttonContainer: {
    flexDirection: 'column',
  },
  modalButton: {
    backgroundColor: '#FFCF25',
    padding: 10,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
});

export default Profile;
