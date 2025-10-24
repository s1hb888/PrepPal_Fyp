import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import { LinearGradient } from 'expo-linear-gradient';

import Profile from './Profile';
import Settings from './Settings';
import AboutUs from './AboutUs';
import FeedbackScreen from './FeedbackScreen';
import Drawer from './components/Drawer';

import API_BASE_URL from './config';


const Home = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const progressPercent = 0.68;

  // Animation values
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardAnims = useRef([...Array(3)].map(() => new Animated.Value(0))).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate progress wheel on mount
    const progressInterval = setInterval(() => {
      setAnimatedProgress(prev => {
        if (prev >= progressPercent) {
          clearInterval(progressInterval);
          return progressPercent;
        }
        return prev + 0.01;
      });
    }, 15);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ),
    ]).start();

    // Stagger card animations
    Animated.stagger(
      150,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      )
    ).start();

    return () => clearInterval(progressInterval);
  }, [progressPercent, scaleAnim, fadeAnim, rotateAnim, cardAnims]);

  useEffect(() => {
    if (selectedTab === 'Notifications') {
      const timeout = setTimeout(() => {
        fetchNotificationsAndMarkRead();
      }, 100);

      return () => clearTimeout(timeout);
    }
  }, [selectedTab]);

  const fetchNotificationsAndMarkRead = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      const { _id, role } = JSON.parse(userData);
      if (role !== 'parent') return;

      const res = await fetch(`${API_BASE_URL}/api/notifications/${_id}`);
      const json = await res.json();
      if (json.success) {
        setNotifications(json.data);
      }

      await fetch(`${API_BASE_URL}/api/notifications/mark-all-read/${_id}`, {
        method: 'PATCH',
      });

      const resUpdated = await fetch(`${API_BASE_URL}/api/notifications/${_id}`);
      const updatedJson = await resUpdated.json();
      if (updatedJson.success) {
        setNotifications(updatedJson.data);
      }

    } catch (err) {
      console.error('Error loading/marking notifications:', err);
    }
  };

  const handleLogout = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      await AsyncStorage.multiRemove([
        'token',
        'user',
        'isLocked',
        'sessionStartTime',
        'usedToday',
      ]);

      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to logout. Please try again.');
    }
  };

  const fetchNotifications = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      const { _id, role } = JSON.parse(userData);
      if (role !== 'parent') return;

      const res = await fetch(`${API_BASE_URL}/api/notifications/${_id}`);
      const json = await res.json();
      if (json.success) setNotifications(json.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const openNotification = async note => {
    setActiveNote(note);
    setModalVisible(true);

    if (!note.seen) {
      try {
        await fetch(`${API_BASE_URL}/api/notifications/mark-read/${note._id}`, { method: 'PATCH' });
        setNotifications(prev =>
          prev.map(n => n._id === note._id ? { ...n, seen: true } : n)
        );
        await fetchNotifications();
      } catch (err) {
        console.error('Error marking as seen:', err);
      }
    }
  };

  const clearAll = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;
      const { _id } = JSON.parse(userData);

      const res = await fetch(`${API_BASE_URL}/api/notifications/clear/${_id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) throw new Error('Failed to clear notifications');

      const updatedRes = await fetch(`${API_BASE_URL}/api/notifications/${_id}`);
      const updatedJson = await updatedRes.json();
      if (updatedJson.success) {
        setNotifications(updatedJson.data);
      } else {
        setNotifications([]);
      }

      setModalVisible(false);
    } catch (err) {
      console.error('Error clearing notifications:', err);
      alert('Failed to clear notifications. Try again.');
    }
  };

  const deleteNotification = async (id) => {
    await fetch(`${API_BASE_URL}/api/notifications/delete/${id}`, { method: 'DELETE' });
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const renderTabContent = () => {
    if (selectedTab !== 'Home') {
      switch (selectedTab) {
        case 'Profile': return <Profile />;
        case 'Settings': return <Settings />;
        case 'AboutUs': return <AboutUs />;
        case 'Notifications':
          return (
            <View style={styles.tabScreen}>
              <Text style={styles.tabHeading}>Notifications</Text>
              {notifications.length === 0 ? (
                <Text style={styles.tabSubText}>No notifications yet.</Text>
              ) : (
                <ScrollView style={{ width: '100%' }}>
                  {notifications.map(note => (
                    <TouchableOpacity
                      key={note._id}
                      onPress={() => openNotification(note)}
                      style={[styles.noteCardNew, note.seen ? styles.read : styles.unread]}
                    >
                      <View style={styles.noteStripeNew} />
                      <View style={styles.noteContentNew}>
                        <Text style={styles.noteMsgNew}>{note.message}</Text>
                      </View>
                      <TouchableOpacity style={styles.noteCloseBtnNew} onPress={() => deleteNotification(note._id)}>
                        <Feather name="minus-circle" size={16} color="#EF3349" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          );
        default: return null;
      }
    }

    return (
      <ScrollView style={styles.container}>
        <LinearGradient
          colors={['#A0F0DC', '#7BE7CE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topCard}
        >
          {/* Bubbles matching your design system */}
          <View style={styles.topCardBubble1} />
          <View style={styles.topCardBubble2} />
          <View style={styles.topCardBubble3} />

          {/* Menu Button integrated into the card */}
          <View style={styles.cardHeader}>
            <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuButton}>
              <Feather name="menu" size={22} color="#EF3349" />
            </TouchableOpacity>
          </View>

          <Animated.Text style={[styles.topTitle, { opacity: fadeAnim }]}>
            Kid's Progress
          </Animated.Text>
          
          <Animated.View style={{ 
            transform: [{ scale: scaleAnim }],
          }}>
            <Progress.Circle
              progress={animatedProgress}
              size={130}
              thickness={10}
              showsText
              formatText={() => `${Math.round(animatedProgress * 100)}%`}
              color="#EF3349"
              unfilledColor="#fff"
              borderWidth={0}
            />
          </Animated.View>

          <Animated.View style={[styles.statContainer, { opacity: fadeAnim }]}>
            <View style={styles.statItem}>
              <Feather name="edit-3" size={18} color="#EF3349" />
              <Text style={styles.statLabel}><Text style={styles.statBold}>12</Text> Attempted</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Feather name="check-circle" size={18} color="#4CAF50" />
              <Text style={styles.statLabel}><Text style={styles.statBold}>8</Text> Passed</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Feather name="x-circle" size={18} color="#EF3349" />
              <Text style={styles.statLabel}><Text style={styles.statBold}>4</Text> Failed</Text>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: fadeAnim }}>
            <TouchableOpacity onPress={() => navigation.navigate('Assessm')} style={styles.progressButton}>
              <LinearGradient
                colors={['#EF3349', '#D12A3D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.progressButtonGradient}
              >
                <Text style={styles.progressButtonText}>View Detailed Report</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>

        <View style={styles.whiteCard}>
          {/* Bubbles in white card */}
          <View style={styles.whiteCardBubble1} />
          <View style={styles.whiteCardBubble2} />
          
          {[
            { id: '1', title: 'Manage Courses', icon: 'book-open', screen: 'AccessManagement' },
            { id: '2', title: 'Limit Screen Time', icon: 'clock', screen: 'ScreenTimeControl' },
            { id: '3', title: 'View Results & Rewards', icon: 'award', screen: 'ResultsRewards' },
          ].map((item, index) => {
            const cardScale = cardAnims[index].interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            });

            return (
              <Animated.View
                key={item.id}
                style={{
                  opacity: cardAnims[index],
                  transform: [{ scale: cardScale }],
                }}
              >
                <TouchableOpacity 
                  style={styles.featureCard} 
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.featureIconContainer}>
                    <Feather name={item.icon} size={28} color="#EF3349" />
                  </View>
                  <Text style={styles.featureText}>{item.title}</Text>
                  <Feather name="chevron-right" size={20} color="#999" />
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Main Content */}
      {renderTabContent()}

      {/* Bottom Navigation Bar */}
      <LinearGradient
        colors={['#A0F0DC', '#7BE7CE']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bottomBar}
      >
        {[
          { tab: 'Home', icon: 'home' },
          { tab: 'Profile', icon: 'user' },
          { tab: 'Settings', icon: 'settings' },
          { tab: 'Notifications', icon: 'bell' }
        ].map(({ tab, icon }) => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)} style={styles.bottomTab}>
            <Feather
              name={icon}
              size={24}
              color={selectedTab === tab ? '#EF3349' : '#000'}
            />
            <Text style={[styles.bottomTabText, selectedTab === tab && styles.bottomTabTextActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </LinearGradient>

      {/* Notification Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notification</Text>
            <Text style={styles.modalMessage}>{activeNote?.message}</Text>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
              <LinearGradient
                colors={['#EF3349', '#D12A3D']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalBtnGradient}
              >
                <Text style={styles.modalBtnText}>Close</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Drawer */}
      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
        setSelectedTab={setSelectedTab}
        handleLogout={handleLogout}
        selectedTab={selectedTab}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#e9ecef', // Screen background from your design
  },
  topCard: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 30,
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  // Top Card Bubbles - matching your bubble design system
  topCardBubble1: {
    position: 'absolute',
    top: -20,
    right: -10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)', // Transparent white
  },
  topCardBubble2: {
    position: 'absolute',
    bottom: -10,
    left: 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)', // Transparent white
  },
  topCardBubble3: {
    position: 'absolute',
    top: '50%',
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)', // Transparent white
  },
  cardHeader: {
    width: '100%',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  menuButton: {
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  topTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12, 
    marginTop: -10,
  },
  statContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginTop: 15,
    width: '90%',
    alignSelf: 'center',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  statBold: {
    fontWeight: 'bold',
    color: '#000',
  },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  progressButton: {
    marginTop: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#EF3349',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  progressButtonGradient: {
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  progressButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  whiteCard: {
    backgroundColor: '#f8f9fa', // Card background from your design
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    position: 'relative',
    overflow: 'hidden',
  },
  // White Card Bubbles - matching your bubble design system
  whiteCardBubble1: {
    position: 'absolute',
    top: '70%',
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)', // Same transparent white
  },
  whiteCardBubble2: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.15)', // Same transparent white
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#fff', // Pure white for feature cards
    padding: 15,
    borderRadius: 14,
    marginBottom: 8, 
    alignItems: 'center',
    shadowOpacity: 0.05,
    elevation: 2,
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  featureText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bottomTab: {
    alignItems: 'center',
  },
  bottomTabText: {
    color: '#000',
    fontSize: 12,
    marginTop: 2,
  },
  bottomTabTextActive: {
    color: '#EF3349',
    fontWeight: '600',
  },
  tabScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: '#fff',
    padding: 20,
  },
  tabHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    marginTop: 30, 
  },
  tabSubText: {
    fontSize: 14,
    color: '#666',
  },
  
  noteCardNew: {
    width: '100%',
    backgroundColor: '#A0F0DC',
    borderRadius: 10,
    paddingVertical: 16,
    paddingLeft: 20,
    paddingRight: 45,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 12,
    elevation: 2,
  },
  noteStripeNew: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 4,
    backgroundColor: '#EF3349',
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  noteContentNew: {
    flex: 1,
    paddingLeft: 12,
  },
  noteMsgNew: {
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  noteCloseBtnNew: {
    position: 'absolute',
    top: 20,
    right: 10,
  },
  unread: {
    borderLeftWidth: 4,
    borderLeftColor: '#2BCB9A',
  },
  read: {
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalBtn: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 3,
  },
  modalBtnGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  modalBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Home;