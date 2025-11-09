import { View, Text, TextInput, TouchableOpacity, Alert, Image, StyleSheet, Modal } from 'react-native';
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
  // Trim inputs to avoid spaces counting
  const trimmedKidName = kidName.trim();
  const kidAgeNumber = parseInt(kidAge, 10);

  // Validate kid's name
  if (!trimmedKidName || trimmedKidName.length < 3 || trimmedKidName.length > 30) {
    Alert.alert(
      'Error',
      "Kid's name must be between 3 and 30 characters."
    );
    return;
  }

  // Validate kid's age
  if (isNaN(kidAgeNumber) || kidAgeNumber < 3 || kidAgeNumber > 6) {
    Alert.alert(
      'Error',
      "Kid's age must be a number between 3 and 6."
    );
    return;
  }

  // Validate password if entered
  if (password && !validatePassword(password)) {
    Alert.alert(
      'Error',
      'Weak password. Must include uppercase, number & special character.'
    );
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
      body: JSON.stringify({ password, kidName: trimmedKidName, kidAge: kidAgeNumber }),
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
              await AsyncStorage.removeItem('token');
              Alert.alert('Deleted', 'Account deleted successfully.');
              navigation.replace('Registration');
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
    <View style={styles.container}>
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
              style={[styles.modalButton, { marginBottom: 10 }]}
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
              style={[styles.modalButton, { marginBottom: 20 }]}
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
  style={[styles.modalButton, { backgroundColor: '#FFCF25' }]}
  onPress={() => setShowImageOptions(false)}
>
  <Text style={styles.modalButtonText}>Cancel</Text>
</TouchableOpacity>

          </View>
        </View>
      </Modal>

{imagePreview && isModalVisible && (
  <Modal
    animationType="slide"
    transparent={true}
    visible={isModalVisible}
    onRequestClose={() => setModalVisible(false)}
  >
    <View style={styles.previewModalContainer}>
      <View style={styles.previewModalContent}>
        <Text style={styles.modalHeader}>Preview</Text>

        <Image
          source={{ uri: imagePreview }}
          style={{
            width: 200,
            height: 200,
            borderRadius: 100,
            alignSelf: 'center',
            marginBottom: 20,
          }}
        />

        <TouchableOpacity onPress={rotateImage} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Rotate</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={flipImageHorizontal} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Flip Horizontal</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={flipImageVertical} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Flip Vertical</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setImage(imagePreview);
            handleUploadImage(imagePreview);
            setModalVisible(false);
          }}
          style={styles.doneButton}
        >
          <Text style={styles.modalButtonText}>✓ Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
)}


      {/* Form */}
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} editable={false} style={styles.input} />

        <View style={{ position: 'relative', marginBottom: 15 }}>
  <Text style={styles.label}>Password</Text>
  <TextInput
    placeholder="Enter new password (optional)"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
    style={[styles.input, { paddingRight: 40 }]} // extra space for icon
  />
  <TouchableOpacity
    style={{ position: 'absolute', right: 10, top: 37 }}
    onPress={() => setShowPassword(!showPassword)}
  >
    <Feather
      name={showPassword ? 'eye' : 'eye-off'}
      size={20}
      color="#888"
    />
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
          <Feather name="save" size={20} style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleDeleteAccount} style={styles.deleteButton}>
          <MaterialIcons name="delete" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 35,
    marginBottom: 15,
  },
  imageWrapper: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgb(160,240,220)', 
    backgroundColor: '#ddd',
  },
  editIconWrapper: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#EF3349',
    borderRadius: 12,
    padding: 5,
    borderWidth: 2,
    borderColor: '#fff',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  label: {
    color: '#000',
    marginBottom: 6,
    fontWeight: '600',
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    marginTop:-2,
    paddingHorizontal: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
saveButton: {
  backgroundColor: 'rgb(160,240,220)', // Mint
  padding: 15,
  borderRadius: 12,
  marginBottom: 15,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
},
 deleteButton: {
  backgroundColor: '#EF3349', // Red
  padding: 15,
  borderRadius: 12,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: -6,
},
buttonText: {
  fontWeight: 'bold',
  fontSize: 18,
  color: '#000', // Black text for mint button
},
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
modalButton: {
  backgroundColor: 'rgb(160,240,220)',
  padding: 12,
  marginVertical: 6,
  borderRadius: 8,
  width: '100%',
  alignItems: 'center',
},
modalButtonText: {
  fontWeight: 'bold',
  fontSize: 16,
},
previewModalContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.4)',
},
deleteButtonText: {
  fontWeight: 'bold',
  fontSize: 18,
  color: '#fff', 
},
previewModalContent: {
  backgroundColor: '#fff',
  width: '85%',
  padding: 20,
  borderRadius: 20,
  alignItems: 'center',
},


doneButton: {
  backgroundColor: 'rgb(160,240,220)',
  paddingVertical: 12,
  paddingHorizontal: 30,
  borderRadius: 50,
  alignSelf: 'center',
  marginTop: 15,
},

});


export default ProfileScreen;