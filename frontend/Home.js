import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Modal,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Profile from './Profile';
import Settings from './Settings';
import AboutUs from './AboutUs';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2 - 10;

const Home = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');

  const cardData = [
    { id: '1', title: 'Manage courses', icon: 'book', color: '#2BCB9A', screen: 'AccessManagement' },
    { id: '2', title: 'Progress tracking', icon: 'pencil', color: '#2BCB9A', screen: 'Assessm' },
    { id: '3', title: 'Profile', icon: 'user', color: '#2BCB9A', screen: 'Profile' },
    { id: '4', title: 'Settings', icon: 'cog', color: '#2BCB9A', screen: 'Settings' },
  ];

  const renderCardItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: '#e6f7f3', borderLeftColor: item.color }]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <FontAwesome name={item.icon} size={36} color={item.color} />
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );
  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Home':
        return (
          <ScrollView style={styles.container}>
            <View style={styles.animationContainer}>
              <LottieView
                source={require('../assets/animations/Animation.json')}
                autoPlay
                loop
                style={{ height: 200, width: 200, color:'#2BCB9A'}}
              />
            </View>

            <Text style={styles.sectionTitle}>Manage & Track</Text>
            <FlatList
              data={cardData}
              renderItem={renderCardItem}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
            />
          </ScrollView>
        );
      case 'Profile':
        return <Profile />;
      case 'Settings':
        return <Settings />;
      case 'AboutUs':
        return <AboutUs />;
      case 'Notifications':
        return (
          <View style={styles.tabScreen}>
            <Text style={styles.tabText}>You have no new notifications</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Welcome To PrepPal</Text>
      </View>

      <Modal visible={drawerVisible} animationType="slide" transparent>
        <TouchableOpacity style={styles.drawerOverlay} onPress={() => setDrawerVisible(false)} />
        <View style={styles.drawer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/219/219983.png' }}
            style={styles.drawerIcon}
          />
          <Text style={styles.drawerTitle}>PrepPal</Text>

          {['Home', 'Profile', 'Settings', 'Notifications', 'AboutUs'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={styles.drawerItem}
              onPress={() => {
                setSelectedTab(tab);
                setDrawerVisible(false);
              }}
            >
              <FontAwesome name={
                tab === 'Home' ? 'home' :
                tab === 'Profile' ? 'user' :
                tab === 'Settings' ? 'cog' :
                tab === 'Notifications' ? 'bell' : 'info-circle'} size={20} />
              <Text style={styles.drawerItemText}>
                {tab === 'AboutUs' ? 'About Us' : tab}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity style={styles.drawerItem}>
            <FontAwesome name="sign-out" size={20} />
            <Text style={styles.drawerItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {renderTabContent()}

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => setSelectedTab('Home')} style={styles.bottomTab}>
          <FontAwesome name="home" size={24} color={selectedTab === 'Home' ? '#ffffff' : '#666'} />
          <Text style={{ color: selectedTab === 'Home' ? '#ffffff' : '#666' }}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Profile')} style={styles.bottomTab}>
          <FontAwesome name="user" size={24} color={selectedTab === 'Profile' ? '#ffffff' : '#666'} />
          <Text style={{ color: selectedTab === 'Profile' ? '#ffffff' : '#666' }}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Settings')} style={styles.bottomTab}>
          <FontAwesome name="cog" size={24} color={selectedTab === 'Settings' ? '#ffffff' : '#666'} />
          <Text style={{ color: selectedTab === 'Settings' ? '#ffffff' : '#666' }}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Notifications')} style={styles.bottomTab}>
          <FontAwesome name="bell" size={24} color={selectedTab === 'Notifications' ? '#ffffff' : '#666'} />
          <Text style={{ color: selectedTab === 'Notifications' ? '#ffffff' : '#666' }}>Alerts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  appBar: {
    backgroundColor: '#2BCB9A',
    paddingVertical: 45,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    position: 'absolute',
    left: 0,
    right: 0,
  },
  
  menuButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffffff',
  },
  animationContainer: {
    alignItems: 'center',
    backgroundColor: '#e6f7f3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  card: {
    width: cardWidth,
    height: cardWidth,
    borderRadius: 10,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 5,
    backgroundColor: '#e6f7f3',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    backgroundColor: '#2BCB9A',
  },
  bottomTab: {
    alignItems: 'center',
  },
  drawerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 1000,
  },
  drawerIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginBottom: 10,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2BCB9A',
    marginBottom: 30,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  drawerItemText: {
    fontSize: 18,
    marginLeft: 10,
    color: '#333',
  },
  tabScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 18,
    color: '#333',
  },
});

export default Home;
