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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';

import Profile from './Profile';

import AboutUs from './AboutUs';
import FeedbackScreen from './FeedbackScreen';
import API_BASE_URL from './config';
import Drawer from './components/Drawer'; // Import from components folder

const Home = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeNote, setActiveNote] = useState(null);
  const [quizSummary, setQuizSummary] = useState({
    totalQuizzes: 0,
    passed: 0,
    failed: 0,
  });

  // Animation ref for progress
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [displayProgress, setDisplayProgress] = useState(0);

  const fetchQuizSummary = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await fetch(`${API_BASE_URL}/api/summary`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const json = await res.json();
      if (json.success) {
        setQuizSummary({
          totalQuizzes: json.totalQuizzes,
          passed: json.passed,
          failed: json.failed,
        });

        // Animate progress from 0 to actual value
        const targetProgress = json.totalQuizzes > 0 ? json.passed / json.totalQuizzes : 0;
        
        // Remove any existing listeners
        progressAnim.removeAllListeners();
        
        // Reset to 0
        progressAnim.setValue(0);
        setDisplayProgress(0);
        
        // Add listener to update display progress
        const listenerId = progressAnim.addListener(({ value }) => {
          setDisplayProgress(value);
        });
        
        // Start animation
        Animated.timing(progressAnim, {
          toValue: targetProgress,
          duration: 2000,
          useNativeDriver: false,
        }).start();
      }
    } catch (err) {
      console.error('Error fetching quiz summary:', err);
    }
  };

  useEffect(() => {
    fetchQuizSummary();
    if (selectedTab === 'Notifications') {
      const timeout = setTimeout(() => {
        fetchNotificationsAndMarkRead();
      }, 100);

      return () => clearTimeout(timeout);
    }
    
    // Cleanup listener on unmount
    return () => {
      progressAnim.removeAllListeners();
    };
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

  const openNotification = async (note) => {
    setActiveNote(note);
    setModalVisible(true);

    if (!note.seen) {
      try {
        await fetch(`${API_BASE_URL}/api/notifications/mark-read/${note._id}`, {
          method: 'PATCH',
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === note._id ? { ...n, seen: true } : n))
        );
        await fetchNotifications();
      } catch (err) {
        console.error('Error marking as seen:', err);
      }
    }
  };

  const clearAll = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (!userData) return;
    const { _id } = JSON.parse(userData);
    await fetch(`${API_BASE_URL}/api/notifications/clear/${_id}`, {
      method: 'DELETE',
    });
    setNotifications([]);
    setModalVisible(false);
  };

  const deleteNotification = async (id) => {
    await fetch(`${API_BASE_URL}/api/notifications/delete/${id}`, {
      method: 'DELETE',
    });
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const renderTabContent = () => {
    if (selectedTab !== 'Home') {
      switch (selectedTab) {
        case 'Profile':
          return <Profile />;
       
        case 'AboutUs':
          return <AboutUs />;
        case 'Notifications':
          return (
            <View style={styles.tabScreen}>
              <Text style={styles.tabHeading}>Notifications</Text>
              {notifications.length === 0 ? (
                <Text style={styles.tabSubText}>No notifications yet.</Text>
              ) : (
                <ScrollView style={{ width: '100%' }}>
                  {notifications.map((note) => (
                    <TouchableOpacity
                      key={note._id}
                      onPress={() => openNotification(note)}
                      style={[
                        styles.noteCardNew,
                        note.seen ? styles.read : styles.unread,
                      ]}
                    >
                      <View style={styles.noteStripeNew} />
                      <View style={styles.noteContentNew}>
                        <Text style={styles.noteMsgNew}>{note.message}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.noteCloseBtnNew}
                        onPress={() => deleteNotification(note._id)}
                      >
                        <Feather name="minus-circle" size={16} color="#EF3349" />
                      </TouchableOpacity>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          );
        default:
          return null;
      }
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.topCard}>
          {/* Decorative Bubbles */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.bubble3} />

          <Text style={styles.topTitle}>Kid's Progress</Text>

          {/* Animated Progress Circle */}
          <View style={styles.progressWrapper}>
            <Progress.Circle
              progress={displayProgress}
              size={130}
              thickness={10}
              showsText
              formatText={() => `${Math.round(displayProgress * 100)}%`}
              color={displayProgress > 0.8 ? '#2BCB9A' : '#EF3349'} 
              unfilledColor="#fff"
              borderWidth={0}
              textStyle={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}
            />
          </View>

          <View style={styles.statContainer}>
            <View style={styles.statItem}>
              <Feather name="edit-3" size={18} color="#EF3349" />
              <Text style={styles.statLabel}>
                <Text style={styles.statBold}>{quizSummary.totalQuizzes}</Text>{' '}
                Attempted
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Feather name="check-circle" size={18} color="rgb(160,240,220)" />
              <Text style={styles.statLabel}>
                <Text style={styles.statBold}>{quizSummary.passed}</Text> Passed
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <Feather name="x-circle" size={18} color="#EF3349" />
              <Text style={styles.statLabel}>
                <Text style={styles.statBold}>{quizSummary.failed}</Text> Failed
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Performance')}
            style={styles.progressButton}
          >
            <Text style={styles.progressButtonText}>View Detailed Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.whiteCard}>
          {/* Decorative Bubbles for White Card */}
          <View style={styles.whiteCardBubble1} />
          <View style={styles.whiteCardBubble2} />

          {[
            {
              id: '1',
              title: 'Manage Courses',
              icon: 'book-open',
              screen: 'AccessManagement',
            },
            {
              id: '2',
              title: 'Limit Screen Time',
              icon: 'clock',
              screen: 'ScreenTimeControl',
            },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featureCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Feather
                name={item.icon}
                size={28}
                color="#EF3349"
                style={{ marginRight: 15 }}
              />
              <Text style={styles.featureText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => setDrawerVisible(true)}
          style={styles.menuButton}
        >
          <Feather name="menu" size={20} color="#EF3349" />
        </TouchableOpacity>
      </View>

      {/* Professional Drawer Component */}
      <Drawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        navigation={navigation}
        setSelectedTab={setSelectedTab}
        handleLogout={handleLogout}
        selectedTab={selectedTab}
      />

      {renderTabContent()}

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
            <TouchableOpacity
              style={styles.modalBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.bottomBar}>
        {[
          { tab: 'Home', icon: 'home' },
          { tab: 'Profile', icon: 'user' },
         
          { tab: 'Notifications', icon: 'bell' },
        ].map(({ tab, icon }) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setSelectedTab(tab)}
            style={styles.bottomTab}
          >
            <Feather
              name={icon}
              size={24}
              color={selectedTab === tab ? '#EF3349' : '#000'}
            />
            <Text style={{ color: selectedTab === tab ? '#EF3349' : '#000' }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  appBar: {
    backgroundColor: 'rgb(160,240,220)',
    paddingHorizontal: 20,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    elevation: 4,
  },
  menuButton: {
    marginTop: 32,
    padding: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 3,
  },
  container: { flex: 1 },
  topCard: {
    backgroundColor: 'rgb(160,240,220)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 30,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  topTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    zIndex: 10,
  },
  progressWrapper: {
    zIndex: 10,
    marginVertical: 10,
  },
  // Bubbles for top card
  bubble1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  bubble2: {
    position: 'absolute',
    top: 120,
    left: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  bubble3: {
    position: 'absolute',
    bottom: 40,
    right: 30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
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
    zIndex: 10,
  },
  statItem: { alignItems: 'center' },
  statLabel: {
    fontSize: 13,
    color: '#000',
    marginTop: 4,
    textAlign: 'center',
  },
  statBold: { fontWeight: 'bold', color: '#000' },
  divider: {
    width: 1,
    height: 35,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  progressButton: {
    marginTop: 15,
    backgroundColor: '#EF3349',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
    zIndex: 10,
  },
  progressButtonText: { color: '#fff', fontWeight: '600' },
  whiteCard: {
    backgroundColor: '#fff',
    marginTop: -20,
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  // Bubbles for white card
  whiteCardBubble1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(160, 240, 220, 0.08)',
  },
  whiteCardBubble2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(160, 240, 220, 0.06)',
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 14,
    marginBottom: 15,
    alignItems: 'center',
    shadowOpacity: 0.05,
    elevation: 2,
    zIndex: 10,
  },
  featureText: { fontSize: 16, color: '#000', fontWeight: '500' },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'rgb(160,240,220)',
  },
  bottomTab: { alignItems: 'center' },
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
  },
  tabSubText: { fontSize: 14, color: '#666' },
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
  noteContentNew: { flex: 1, paddingLeft: 12 },
  noteMsgNew: { fontSize: 14, color: '#000', fontWeight: '500' },
  noteCloseBtnNew: { position: 'absolute', top: 10, right: 10 },
  unread: { borderLeftWidth: 4, borderLeftColor: '#2BCB9A' },
  read: { borderLeftWidth: 4, borderLeftColor: '#ccc' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  modalMessage: { fontSize: 16, marginBottom: 20 },
  modalBtn: {
    backgroundColor: '#EF3349',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  modalBtnText: { color: '#fff' },
});

export default Home;