import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import * as Progress from 'react-native-progress';
import Profile from './Profile';
import Settings from './Settings';
import AboutUs from './AboutUs';

const Home = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');
  const progressPercent = 0.68;

  const cardData = [
    { id: '1', title: 'Manage Courses', icon: 'book', screen: 'AccessManagement' },
    { id: '2', title: 'Limit Screen Time', icon: 'clock-o', screen: 'ScreenTime' },
    { id: '3', title: 'View Results & Rewards', icon: 'trophy', screen: 'ResultsRewards' },
  ];

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
              <Text style={styles.tabSubText}>No notifications yet.</Text>
            </View>
          );
        default: return null;
      }
    }

    return (
      <ScrollView style={styles.container}>
        <View style={styles.topCard}>
          <Text style={styles.topTitle}>Kid's Progress</Text>
          <Progress.Circle
            progress={progressPercent}
            size={130}
            thickness={10}
            showsText
            formatText={() => `${Math.round(progressPercent * 100)}%`}
            color="#EF3349"
            unfilledColor="#fff"
            borderWidth={0}
          />

          <View style={styles.statContainer}>
            <View style={styles.statItem}>
              <FontAwesome name="edit" size={18} color="#EF3349" />
              <Text style={styles.statLabel}><Text style={styles.statBold}>12</Text> Attempted</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <FontAwesome name="check" size={18} color="rgb(160,240,220)" />
              <Text style={styles.statLabel}><Text style={styles.statBold}>8</Text> Passed</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.statItem}>
              <FontAwesome name="times" size={18} color="#EF3349" />
              <Text style={styles.statLabel}><Text style={styles.statBold}>4</Text> Failed</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('Assessm')}
            style={styles.progressButton}
          >
            <Text style={styles.progressButtonText}>View Detailed Report</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.whiteCard}>
          {cardData.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.featureCard}
              onPress={() => navigation.navigate(item.screen)}
            >
              <FontAwesome name={item.icon} size={28} color="#EF3349" style={{ marginRight: 15 }} />
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
        <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuButton}>
          <FontAwesome name="bars" size={20} color="#EF3349" />
        </TouchableOpacity>
      </View>

      {/* Full White Sidebar Drawer */}
      {/* Sidebar Drawer */}
<Modal visible={drawerVisible} animationType="slide" transparent>
  <View style={styles.fullDrawerWrapper}>
    <View style={styles.drawerContent}>
      {['Home', 'Profile', 'Settings', 'Notifications', 'AboutUs'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={styles.drawerItem}
          onPress={() => {
            setSelectedTab(tab);
            setDrawerVisible(false);
          }}
        >
          <FontAwesome
            name={
              tab === 'Home'
                ? 'home'
                : tab === 'Profile'
                ? 'user'
                : tab === 'Settings'
                ? 'cog'
                : tab === 'Notifications'
                ? 'bell'
                : 'info-circle'
            }
            size={20}
            color="#EF3349"
            style={{ width: 26 }}
          />
          <Text style={styles.drawerItemText}>
            {tab === 'AboutUs' ? 'About Us' : tab}
          </Text>
        </TouchableOpacity>
      ))}

      {/* Logout */}
      <TouchableOpacity style={styles.drawerItem}>
        <FontAwesome name="sign-out" size={20} color="#EF3349" style={{ width: 26 }} />
        <Text style={styles.drawerItemText}>Logout</Text>
      </TouchableOpacity>
    </View>

    {/* Touchable transparent area to close */}
    <TouchableOpacity
      style={styles.drawerOverlay}
      activeOpacity={1}
      onPress={() => setDrawerVisible(false)}
    />
  </View>
</Modal>


      {renderTabContent()}

      <View style={styles.bottomBar}>
        {['Home', 'Profile', 'Settings', 'Notifications'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setSelectedTab(tab)} style={styles.bottomTab}>
            <FontAwesome
              name={
                tab === 'Home'
                  ? 'home'
                  : tab === 'Profile'
                  ? 'user'
                  : tab === 'Settings'
                  ? 'cog'
                  : 'bell'
              }
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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // App Bar with Menu Icon
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
  marginTop: 32, // 👈 pushes button downward a bit
  padding: 6,   // 👈 smaller padding for smaller size
  backgroundColor: '#fff',
  borderRadius: 8,
  elevation: 3,
},


  // Main Container ScrollView
  container: {
    flex: 1,
  },

  // Top Section (Progress Card)
  topCard: {
    backgroundColor: 'rgb(160,240,220)',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    padding: 30,
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
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
    backgroundColor: '#EF3349',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  progressButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  // Feature Card Section
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
  },
  featureText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },

  // Bottom Navigation
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: 'rgb(160,240,220)',
  },
  bottomTab: {
    alignItems: 'center',
  },

fullDrawerWrapper: {
  flexDirection: 'row',
  height: '90%', // 👈 grey shadow also ends where drawer ends
  marginTop: '10%', // 👈 to push the whole thing downward slightly (optional)
  backgroundColor: 'rgba(0,0,0,0.3)',
},

drawerContent: {
  width: 250,
  backgroundColor: '#fff',
  paddingTop: 60,
  paddingHorizontal: 20,
  borderTopRightRadius: 25,
  borderBottomRightRadius: 25,
  height: '100%', // 👈 drawer is now a bit shorter vertically
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 5,
},

  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#000',
    fontWeight: '500',
  },
  drawerOverlay: {
    flex: 1,
  },

  // Screens for tabs (like Notifications)
  tabScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  tabHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  tabSubText: {
    fontSize: 14,
    color: '#666',
  },
});


export default Home;

