import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';

const KidHome = ({ navigation }) => {
  const cardData = [
    { id: '1', title: 'Academic Learning', icon: 'book', screen: 'Courses' },
    { id: '2', title: 'Learn GK', icon: 'lightbulb-o', screen: 'GeneralKnowledge' },
    { id: '3', title: 'Assessment', icon: 'edit', screen: 'Assessments' },
    { id: '4', title: 'Videos', icon: 'video-camera', screen: 'PersonsScreen' },
  ];

  const renderCardItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate(item.screen)}
    >
      <FontAwesome name={item.icon} size={40} color="#EF3349" />
      <Text style={styles.cardText}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Welcome To PrepPal</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.animatedCard}>
          <LottieView
            source={require('../assets/animations/Kid.json')}
            autoPlay
            loop
            style={styles.KidAnimation}
          />
        </View>

        <Text style={styles.sectionTitle}>Explore and Learn</Text>
        <FlatList
          data={cardData}
          renderItem={renderCardItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          scrollEnabled={false}
        />

        <LottieView
          source={require('../assets/animations/animation1.json')}
          autoPlay
          loop
          style={styles.bottomAnimation}
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
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appBarTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  animatedCard: {
    backgroundColor: '#2BCB9A',
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    height: 160,
  },
  KidAnimation: {
    width: windowWidth - 120,
    height: 180,
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
    backgroundColor: '#FFCF25',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    borderLeftWidth: 6,
    borderLeftColor: '#2BCB9A',
  },
  cardText: {
    fontSize: 16,
    marginTop: 10,
    color: '#333',
    textAlign: 'center',
  },
  bottomAnimation: {
    width: windowWidth - 40,
    height: 130,
    alignSelf: 'center',
    marginTop: 10,
  },
});

export default KidHome;
