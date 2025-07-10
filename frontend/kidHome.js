import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';


const KidHome = ({ navigation }) => {
  const [videos, setVideos] = useState([]);
  const playerRef = useRef();
  const [loading, setLoading] = useState(true);
  const [kidName, setKidName] = useState('');


  useEffect(() => {
    fetchLatestVideo();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(`${API_BASE_URL}/api/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setKidName(res.data.kidName || '');
  } catch (err) {
    console.error('Fetch profile error:', err);
  }
};

  const fetchLatestVideo = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/videos/get-videos`);
      const fetchedVideos = res.data.map((vid) => ({
        ...vid,
        videoId: extractYouTubeVideoID(vid.url),
      }));
      setVideos(fetchedVideos);
    } catch (err) {
      console.error('Fetch video error:', err);
    } finally {
      setLoading(false);
    }
  };

  const extractYouTubeVideoID = (url) => {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const cardData = [
    { id: '1', title: 'Academic Learning', icon: 'book', screen: 'Courses' },
    { id: '2', title: 'Learn GK', icon: 'lightbulb-o', screen: 'GeneralKnowledge' },
    { id: '3', title: 'Assessment', icon: 'pencil-square-o', screen: 'Assessments' },
    { id: '4', title: 'Rewards', icon: 'gift', screen: 'Rewards' },
  ];

  const getCardGradient = (index) => {
    const gradients = [
      ['#FFC1CC', '#FFB6C1'],
      ['#A0F0DC', '#7BE7CE'],
      ['#FFE680', '#FFD54F'],
    ];
    return gradients[index % gradients.length];
  };

  const renderCardItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => navigation.navigate(item.screen)}>
      <LinearGradient
        colors={getCardGradient(index)}
        style={styles.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <FontAwesome name={item.icon} size={28} color="#EF3349" />
        <Text style={styles.cardText}>{item.title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const latestVideo = videos.length > 0 ? videos[0] : null;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#EF3349" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <LinearGradient colors={['#FFC1CC', '#FFB6C1']} style={styles.topHeader}>
            <View style={styles.headerContent}>
              <Image
                source={{
                  uri: 'https://cdn.creazilla.com/cliparts/7769836/child-girl-reading-book-clipart-xl.png',
                }}
                style={styles.kidImage}
              />
              <Text style={styles.helloKiddo}>
  Hello, <Text style={styles.kiddo}>{kidName || 'Kiddo'}!</Text>
</Text>

            </View>
          </LinearGradient>

          <View style={styles.whiteCurve}>
            <View style={styles.searchWrapper}>
              <TextInput
                placeholder="Search here..."
                placeholderTextColor="black"
                style={styles.searchInput}
              />
              <FontAwesome name="search" size={18} color="#EF3349" style={styles.searchIcon} />
            </View>

            <Text style={styles.sectionTitle}>Start Learning</Text>

            <LinearGradient
              colors={['#A0F0DC', '#7BE7CE']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.videoGradientBorder}
            >
              <View style={styles.videoContainer}>
                {latestVideo ? (
                  <YoutubePlayer ref={playerRef} height={200} play={false} videoId={latestVideo.videoId} />
                ) : (
                  <ActivityIndicator size="large" color="#2BCB9A" />
                )}

                <TouchableOpacity onPress={() => navigation.navigate('WatchVideoScreen')}>
                  <LinearGradient
                    colors={['rgb(255, 230, 128)', 'rgb(255, 213, 79)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.watchMoreButton}
                  >
                    <FontAwesome name="video-camera" size={16} color="#EF3349" style={{ marginRight: 6 }} />
                    <Text style={styles.watchMoreText}>WATCH MORE</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Explore</Text>

            <FlatList
              data={cardData}
              renderItem={renderCardItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.cardRow}
              contentContainerStyle={{ paddingBottom: 50 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 48) / 2;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { backgroundColor: '#fff' },
  topHeader: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  whiteCurve: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -40,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  kidImage: { width: 90, height: 110, marginRight: 12 },
  helloKiddo: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  kiddo: { fontStyle: 'italic', fontWeight: 'bold', color: '#EF3349' },
  searchWrapper: { position: 'relative', marginBottom: 10 },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 40,
    paddingVertical: 10,
    fontSize: 14,
    borderWidth: 1.5,
    borderColor: 'rgb(160,240,220)',
    color: 'black',
  },
  searchIcon: { position: 'absolute', top: 12, left: 15 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 4,
    color: 'black',
  },
  videoGradientBorder: { borderRadius: 14, padding: 2, marginBottom: 10 },
  videoContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: 'rgb(160,240,220)',
  },
  watchMoreButton: {
    flexDirection: 'row',
    padding: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchMoreText: { color: '#000', fontWeight: '600' },
  cardRow: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: cardWidth,
    height: 100,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardText: {
    marginTop: 10,
    color: '#000',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorModal: {
    backgroundColor: '#fff',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    width: '80%',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    color: '#EF3349',
  },
  errorTextModal: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    marginVertical: 10,
  },
  dismissButton: {
    backgroundColor: '#EF3349',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 10,
  },
  dismissText: { color: '#fff', fontWeight: 'bold' },
});

export default KidHome;
