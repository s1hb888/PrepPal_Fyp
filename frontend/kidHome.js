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

const KidHome = ({ navigation }) => {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const sliderData = [
    { id: '1', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi6uCBD3asZ4S89k62ggZ6rty1QculLefW9A&s' },
    { id: '2', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi6uCBD3asZ4S89k62ggZ6rty1QculLefW9A&s' },
    { id: '3', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi6uCBD3asZ4S89k62ggZ6rty1QculLefW9A&s' },
  ];

  const cardData = [
    { id: '1', title: 'Academic Learning', icon: 'book', color: '#4CAF50', screen: 'Courses' },
    { id: '2', title: 'Learn GK', icon: 'lightbulb-o', color: '#FFA500', screen: 'GeneralKnowledge' },
    { id: '3', title: 'Assessment', icon: 'edit', color: '#007BFF', screen: 'Assessments' },
    { id: '4', title: 'Videos', icon: 'video-camera', color: '#FF4500', screen: 'PersonsScreen' },
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* AppBar */}
      <View style={styles.appBar}>
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
          <TouchableOpacity style={styles.drawerItem}>
            <FontAwesome name="home" size={20} />
            <Text style={styles.drawerItemText}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem}>
            <FontAwesome name="info-circle" size={20} />
            <Text style={styles.drawerItemText}>About Us</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.drawerItem}>
            <FontAwesome name="sign-out" size={20} />
            <Text style={styles.drawerItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* Main Content */}
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
    paddingVertical: 30, // Increased padding to make the app bar taller
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center', // Centers the content horizontally
    alignItems: 'center', // Centers the content vertically
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center', // Ensures the text is centered
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
  drawerOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  drawer: {
    width: 250,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
    position: 'absolute',
    left: 0,
    top: 0,
    elevation: 5,
  },
  drawerIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 15,
    backgroundColor: '#EF3349',
    alignSelf: 'center',
  },
  drawerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 15,
  },
});

export default KidHome;
