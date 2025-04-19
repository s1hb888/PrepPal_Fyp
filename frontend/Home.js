import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  FlatList,
  Dimensions,
  Modal,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import Profile from './Profile';
import Settings from './Settings';
import AboutUs from './AboutUs';



const Home = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Home');

  const sliderData = [
    { id: '1', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi6uCBD3asZ4S89k62ggZ6rty1QculLefW9A&s' },
    { id: '2', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi6uCBD3asZ4S89k62ggZ6rty1QculLefW9A&s' },
    { id: '3', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi6uCBD3asZ4S89k62ggZ6rty1QculLefW9A&s' },
  ];

  const cardData = [
    { id: '1', title: 'Manage courses', icon: 'book', color: '#4CAF50', screen: '' },
    { id: '2', title: 'Progress tracking', icon: 'pencil', color: '#FFA500', screen: 'Assessm' },
    { id: '3', title: 'Profile', icon: 'user', color: '#007BFF', screen: 'Profile' },
    { id: '4', title: 'Settings', icon: 'cog', color: '#FF4500', screen: 'Settings' },
  ];

  const renderSliderItem = ({ item }) => (
    <View style={styles.sliderItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.sliderImage} />
      <View style={styles.sliderOverlay}>
        <Text style={styles.sliderText}>{item.text}</Text>
      </View>
    </View>
  );

  const renderCardItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: '#FFDF6D', borderLeftColor: item.color }]}
      onPress={() => navigation.navigate(item.screen)}
    >
      <FontAwesome name={item.icon} size={40} color={item.color} />
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    switch (selectedTab) {
      case 'Home':
        return (
          <ScrollView style={styles.container}>
            <View style={styles.sliderContainer}>
              <FlatList
                data={sliderData}
                renderItem={renderSliderItem}
                keyExtractor={(item) => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
              />
            </View>
            <Text style={styles.sectionTitle}>Features</Text>
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
        return Profile ? <Profile /> : <Text>Profile not found</Text>;
      case 'Settings':
        return Settings ? <Settings /> : <Text>Settings not found</Text>;
      case 'AboutUs':
        return AboutUs ? <AboutUs /> : <Text>AboutUs not found</Text>;
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
      {/* AppBar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuButton}>
          <FontAwesome name="bars" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.appBarTitle}>Welcome To PrepPal</Text>
      </View>

      {/* Drawer */}
      <Modal visible={drawerVisible} animationType="slide" transparent>
        <TouchableOpacity style={styles.drawerOverlay} onPress={() => setDrawerVisible(false)} />
        <View style={styles.drawer}>
          <Image
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/219/219983.png' }}
            style={styles.drawerIcon}
          />
          <Text style={styles.drawerTitle}>PrepPal</Text>

          {/* Drawer Items */}
          <TouchableOpacity style={styles.drawerItem}
          onPress={() => {
            setSelectedTab('Home');
            setDrawerVisible(false);
          }}
          >
            <FontAwesome name="home" size={20} />
            <Text style={styles.drawerItemText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              setSelectedTab('Profile');
              setDrawerVisible(false);
            }}
          >
            <FontAwesome name="user" size={20} />
            <Text style={styles.drawerItemText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              setSelectedTab('Settings');
              setDrawerVisible(false);
            }}
          >
            <FontAwesome name="cog" size={20} />
            <Text style={styles.drawerItemText}>Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.drawerItem}
            onPress={() => {
              setSelectedTab('Notifications');
              setDrawerVisible(false);
            }}
          >
            <FontAwesome name="bell" size={20} />
            <Text style={styles.drawerItemText}>Notifications</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem}
           onPress={() => {
            setSelectedTab('AboutUs');
            setDrawerVisible(false);
          }}
          >
            <FontAwesome name="info-circle" size={20} />
            <Text style={styles.drawerItemText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem}>
            <FontAwesome name="sign-out" size={20} />
            <Text style={styles.drawerItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={() => setSelectedTab('Home')} style={styles.bottomTab}>
          <FontAwesome name="home" size={24} color={selectedTab === 'Home' ? '#EF3349' : '#666'} />
          <Text style={{ color: selectedTab === 'Home' ? '#EF3349' : '#666' }}>Kid Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Profile')} style={styles.bottomTab}>
          <FontAwesome name="user" size={24} color={selectedTab === 'Profile' ? '#EF3349' : '#666'} />
          <Text style={{ color: selectedTab === 'Profile' ? '#EF3349' : '#666' }}>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Settings')} style={styles.bottomTab}>
          <FontAwesome name="cog" size={24} color={selectedTab === 'Settings' ? '#EF3349' : '#666'} />
          <Text style={{ color: selectedTab === 'Settings' ? '#EF3349' : '#666' }}>Settings</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTab('Notifications')} style={styles.bottomTab}>
          <FontAwesome name="bell" size={24} color={selectedTab === 'Notifications' ? '#EF3349' : '#666'} />
          <Text style={{ color: selectedTab === 'Notifications' ? '#EF3349' : '#666' }}>Alerts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 40) / 2 - 10;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  appBar: {
    backgroundColor: '#EF3349',
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
    backgroundColor: '#f9f9f9',
  },
  sliderContainer: {
    height: 150,
    marginBottom: 20,
  },
  sliderItem: {
    width: windowWidth - 40,
    height: 150,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  sliderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  sliderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000000',
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
    color: '#EF3349',
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
