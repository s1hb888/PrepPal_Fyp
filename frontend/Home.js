
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Image, FlatList, Dimensions } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const Home = ({ navigation }) => {
  // Data for the slider with image URLs
  const sliderData = [
    { id: '1', imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TIKdHnFEil8tdXKLi5idMDG_Zg2hhiwl4_3IDhalZfA_sGCi2SnSbA823L69hMX-6zI&usqp=CAU' },
    { id: '2',  imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TIKdHnFEil8tdXKLi5idMDG_Zg2hhiwl4_3IDhalZfA_sGCi2SnSbA823L69hMX-6zI&usqp=CAU' },
    { id: '3',  imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1TIKdHnFEil8tdXKLi5idMDG_Zg2hhiwl4_3IDhalZfA_sGCi2SnSbA823L69hMX-6zI&usqp=CAU' },
  ];

  // Data for the grid cards
  const cardData = [
    { id: '1', title: 'Academic Learning', icon: 'book', color: '#4CAF50', screen: 'AcademicLearning' },
    { id: '2', title: 'Assessments', icon: 'pencil', color: '#FFA500', screen: 'Assessments' },
    { id: '3', title: 'Profile', icon: 'user', color: '#007BFF', screen: 'Profile' },
    { id: '4', title: 'Settings', icon: 'cog', color: '#FF4500', screen: 'Settings' },
    { id: '5', title: 'Account Management', icon: 'lock', color: '#800080', screen: 'Registration' },
  ];

  // Render item for slider
  const renderSliderItem = ({ item }) => (
    <View style={styles.sliderItem}>
      <Image source={{ uri: item.imageUrl }} style={styles.sliderImage} />
      <View style={styles.sliderOverlay}>
        <Text style={styles.sliderText}>{item.text}</Text>
      </View>
    </View>
  );

  // Render item for grid cards
// Render item for grid cards
const renderCardItem = ({ item }) => (
  <TouchableOpacity 
    style={[styles.card, { backgroundColor: '#FFDF6D', borderLeftColor: item.color }]} // Changed background color to red
    onPress={() => navigation.navigate(item.screen)}
  >
    <FontAwesome name={item.icon} size={40} color={item.color} />
    <Text style={styles.cardText}>{item.title}</Text>
  </TouchableOpacity>
);


  return (
    <SafeAreaView style={styles.safeArea}>
      {/* App Bar */}
      {/* <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Welcome To PrepPal</Text>
      </View> */}
       <View style={styles.appBar}>
      <Text style={styles.appBarTitle}>Welcome To PrepPal</Text>
    </View>

      <ScrollView style={styles.container}>
        {/* Slider */}
        <View style={styles.sliderContainer}>
          <FlatList
            data={sliderData}
            renderItem={renderSliderItem}
            keyExtractor={item => item.id}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Grid Cards */}
        <Text style={styles.sectionTitle}>Features</Text>
        <FlatList
          data={cardData}
          renderItem={renderCardItem}
          keyExtractor={item => item.id}
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
    backgroundColor: '#007AFF', // Change to preferred color
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4, // Shadow effect for Android
    shadowColor: '#000', // Shadow effect for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  appBarTitle: {
    
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
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
});

export default Home;
