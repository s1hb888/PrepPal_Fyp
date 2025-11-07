import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated, Image, Easing, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config';// Assuming config is available or you define the base URL

const { width, height } = Dimensions.get('window');

const Drawer = ({ visible, onClose, navigation, setSelectedTab, handleLogout, selectedTab }) => {
  const [userEmail, setUserEmail] = useState('');
  const [profileImageUri, setProfileImageUri] = useState(null); 
  const drawerWidth = width * 0.80;
  const slideAnim = useRef(new Animated.Value(-drawerWidth)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef([...Array(6)].map(() => new Animated.Value(0))).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Function to fetch user data and profile image
  const fetchUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const { email } = JSON.parse(userData);
        setUserEmail(email);
      }

      const token = await AsyncStorage.getItem('token');
      // Use the same API endpoint as ProfileScreen to fetch profile details including the image URL
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();

      if (response.ok && result.profileImage) {
        // Construct the full image URL and bust cache if necessary
        setProfileImageUri(`${API_BASE_URL}${result.profileImage}?t=${Date.now()}`); 
      } else {
        // Fallback to avatar if no image or fetch failed
        setProfileImageUri(null);
      }
    } catch (error) {
      console.error('Fetch User Data Error:', error);
      setProfileImageUri(null); // Ensure fallback on error
    }
  };

  useEffect(() => {
    fetchUserData();
    // Re-fetch data when drawer becomes visible to ensure fresh content
    if (visible) {
        fetchUserData();
    }
  }, [visible]);


  // --- Existing animation logic ---

  useEffect(() => {
    if (visible) {
      // Opening animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger item animations
      Animated.stagger(
        60,
        itemAnims.map((anim) =>
          Animated.spring(anim, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          })
        )
      ).start();

      // Rotate animation
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      // Closing animations
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -drawerWidth,
          duration: 300,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset animations
      itemAnims.forEach((anim) => anim.setValue(0));
      scaleAnim.setValue(0.9);
      rotateAnim.setValue(0);
    }
  }, [visible, drawerWidth]);

  const drawerItems = [
    { tab: 'Home', icon: 'home' },
    { tab: 'Profile', icon: 'user' },
    { tab: 'Notifications', icon: 'bell' },
    { tab: 'AboutUs', icon: 'info' },
    { tab: 'Feedback', icon: 'star' },
  ];

  if (!visible) return null;

  const profileRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Determine the image source: fetched URI or fallback avatar
  const avatarSource = profileImageUri 
    ? { uri: profileImageUri } 
    : { uri: 'https://ui-avatars.com/api/?name=User&background=EF3349&color=fff&size=160' };

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.drawerContent,
          {
            width: drawerWidth,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Animated Background Bubbles - Mint Color */}
        <View style={styles.bubble1} />
        <View style={styles.bubble2} />
        <View style={styles.bubble3} />

        {/* Drawer Header with Gradient - Mint */}
        <LinearGradient
          colors={['#A0F0DC', '#7BE7CE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerBubble1} />
          <View style={styles.headerBubble2} />

          <Animated.View
            style={[
              styles.profileImageContainer,
              {
                transform: [{ scale: scaleAnim }, { rotate: profileRotate }],
              },
            ]}
          >
            {/* Using dynamic avatarSource */}
            <Image
              source={avatarSource}
              style={styles.profileImage}
            />
            <View style={styles.onlineIndicator} />
          </Animated.View>

          <Animated.View
            style={[
              styles.userInfoContainer,
              {
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.userName}>Welcome Back!</Text>
            <Text style={styles.userEmail} numberOfLines={1}>
              {userEmail || 'user@preppal.com'}
            </Text>
          </Animated.View>
        </LinearGradient>

        {/* Drawer Items */}
        <View style={styles.itemsContainer}>
          <Text style={styles.sectionTitle}>Navigation</Text>

          {drawerItems.map(({ tab, icon }, index) => {
            const isActive = selectedTab === tab;

            const itemScale = itemAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            });

            const itemTranslateX = itemAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [-50, 0],
            });

            return (
              <Animated.View
                key={tab}
                style={{
                  opacity: itemAnims[index],
                  transform: [{ scale: itemScale }, { translateX: itemTranslateX }],
                }}
              >
                <TouchableOpacity
                  style={[
                    styles.drawerItem,
                    isActive && styles.activeDrawerItem,
                  ]}
                  onPress={() => {
                    onClose();
                    if (tab === 'Feedback') {
                      setTimeout(() => navigation.navigate('Feedback'), 300);
                    } else {
                      setSelectedTab(tab);
                    }
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconContainer, isActive && styles.activeIconContainer]}>
                    <Feather name={icon} size={22} color="#EF3349" />
                  </View>
                  <Text style={[styles.drawerItemText, isActive && styles.activeItemText]}>
                    {tab === 'AboutUs' ? 'About Us' : tab}
                  </Text>
                  {isActive && (
                    <View style={styles.activeIndicator}>
                      <Feather name="chevron-right" size={18} color="#EF3349" />
                    </View>
                  )}
                </TouchableOpacity>
              </Animated.View>
            );
          })}

          <View style={styles.separator} />

          {/* Logout with Animation - Red Gradient */}
          <Animated.View
            style={{
              opacity: itemAnims[5],
              transform: [
                {
                  scale: itemAnims[5].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            }}
          >
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.7}>
              <LinearGradient
                colors={['#EF3349', '#D12A3D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.logoutGradient}
              >
                <Feather name="log-out" size={20} color="#fff" style={{ marginRight: 12 }} />
                <Text style={styles.logoutText}>Logout</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Footer Version Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 PrepPal</Text>
          <Text style={styles.footerVersion}>Version 1.0.0</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.drawerOverlay, { opacity: fadeAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>
    </View>
  );
};

// --------------------------------------------------------------------------------
//                                FINAL MODIFIED STYLES
// --------------------------------------------------------------------------------

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    flexDirection: 'row',
  },
  drawerContent: {
    backgroundColor: '#fff',
    height: '100%',
    borderTopRightRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 4, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  header: {
    // REDUCED FOR STATUS BAR/SAFE AREA
    paddingTop: Platform.OS === 'ios' ? 30 : 25, // Safely reduce for iOS and Android
    paddingBottom: 20, 
    paddingHorizontal: 25,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    overflow: 'hidden',
    position: 'relative',
  },
  headerBubble1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  headerBubble2: {
    position: 'absolute',
    bottom: -20,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileImageContainer: {
    position: 'relative',
    marginTop:17,
    // REDUCED SPACE ABOVE PROFILE IMAGE
    marginBottom: 5, // Was 10
  },
  profileImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#fff',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  userInfoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  userName: {
    color: '#000 ',
    fontSize: 22,
    fontWeight: '700',
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    marginBottom: 4,
  },
  userEmail: {
    color: '#000',
    fontSize: 14,
    opacity: 0.95,
    textAlign: 'center',
  },
  itemsContainer: {
    flex: 1,
    paddingTop: 10, 
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    marginBottom: 10, 
    marginLeft: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10, 
    paddingHorizontal: 18,
    borderRadius: 15,
    marginVertical: 5, 
    position: 'relative',
    backgroundColor: '#f9f9f9',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeDrawerItem: {
    backgroundColor: '#A0F0DC',
    ...Platform.select({
      ios: {
        shadowColor: '#A0F0DC',
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  iconContainer: {
    width: 40, 
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activeIconContainer: {
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#EF3349',
        shadowOpacity: 0.3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  drawerItemText: {
    fontSize: 17,
    color: '#000',
    fontWeight: '600',
    flex: 1,
  },
  activeItemText: {
    color: '#000',
    fontWeight: '700',
  },
  activeIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#EF3349',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8, 
    marginHorizontal: 15,
  },
  logoutButton: {
    marginTop: 5, 
    marginBottom: 5,
    borderRadius: 15,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#EF3349',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12, 
    paddingHorizontal: 20,
  },
  logoutText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    // REDUCED FOOTER SPACE
    paddingVertical: 8, // Was 10
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  footerVersion: {
    fontSize: 11,
    color: '#999',
    marginTop: 2, // Was 3
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  bubble1: {
    position: 'absolute',
    top: 140,
    right: -20,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(160,240,220,0.15)',
  },
  bubble2: {
    position: 'absolute',
    top: 350,
    left: -30,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(160,240,220,0.1)',
  },
  bubble3: {
    position: 'absolute',
    bottom: 180,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(160,240,220,0.12)',
  },
});

export default Drawer;