import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
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
      const res = await axios.get(`${API_BASE_URL}/api/videos`);
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
    const regex =
      /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

const cardData = [
  { 
    id: '1', 
    title: 'Academic Learning', 
    icon: 'book', 
    screen: 'Courses', 
    subtitle: 'Master core subjects', 
    color: '#FFC1CC' // Updated pink
  },
  {
    id: '2',
    title: 'Learn GK',
    icon: 'lightbulb-o',
    screen: 'GeneralKnowledge',
    subtitle: 'Explore the world',
    color: '#A0F0DC', // Mint (same as WatchVideoScreen gradient start)
  },
  { 
    id: '3', 
    title: 'Assessment', 
    icon: 'pencil-square-o', 
    screen: 'Assessments', 
    subtitle: 'Test your knowledge', 
    color: '#FFE680' // Yellow (same as WatchVideoScreen card)
  },
  { 
    id: '4', 
    title: 'Rewards', 
    icon: 'gift', 
    screen: 'Rewards', 
    subtitle: 'Earn achievements', 
    color: '#FFC1CC' // Updated pink
  },
];


  const renderCardItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => navigation.navigate(item.screen)} style={styles.cardWrapper}>
      <View style={[styles.card, { backgroundColor: item.color }]}>
        <View style={styles.cardBubble1} />
        <View style={styles.cardBubble2} />
        <View style={styles.cardBubble3} />
        <View style={styles.iconBackground}>
          <FontAwesome name={item.icon} size={24} color="#EF3349" />
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
      </View>
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
      <View style={styles.container}>
        {/* Top Header */}
        <LinearGradient colors={['#FFC1CC', '#FFB6C1']} style={styles.topHeader}>
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.bubble3} />

          <View style={styles.headerContent}>
            <Image
              source={{
                uri: 'https://cdn.creazilla.com/cliparts/7769836/child-girl-reading-book-clipart-xl.png',
              }}
              style={styles.kidImage}
            />
            <View style={styles.greetingContainer}>
              <Text style={styles.helloText}>Hello,</Text>
              <Text style={styles.kidNameText}>{kidName || 'Kiddo'}!</Text>
            </View>
          </View>
        </LinearGradient>

        {/* White Curve Section */}
        <View style={styles.whiteCurve}>
          {/* Lower bubbles */}
          <View style={styles.bubble4} />
          <View style={styles.bubble5} />

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
      </View>
    </SafeAreaView>
  );
};

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 48) / 2;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { backgroundColor: '#fff', flex: 1 },
  topHeader: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'flex-start',
    overflow: 'hidden',
  },
  whiteCurve: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: -20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  kidImage: { width: 90, height: 110, marginRight: 12 },
  greetingContainer: { flexDirection: 'row', alignItems: 'center' },
  helloText: { fontSize: 28, fontWeight: 'bold', color: '#000' },
  kidNameText: { fontSize: 28, fontWeight: 'bold', color: '#EF3349', fontStyle: 'italic', marginLeft: 6 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 4,
    color: 'black',
  },
  videoGradientBorder: { borderRadius: 14, padding: 2, marginBottom: 16 },
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
  cardRow: { justifyContent: 'space-between', marginBottom: 10 },
  cardWrapper: {
    width: cardWidth,
    height: 120, // Adjusted height to accommodate the subtitle
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    marginBottom: 10,
  },
  card: {
    flex: 1,
    padding: 14,
    justifyContent: 'flex-start', // Changed to flex-start
    alignItems: 'flex-start', // Changed to flex-start
  },
  iconBackground: {
    backgroundColor: 'white',
    borderRadius: 10, // Changed to a rectangle
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: { marginTop: 4, color: '#000', fontWeight: 'bold', fontSize: 14, textAlign: 'left' }, // Changed to left
  cardSubtitle: { color: '#000', fontSize: 12, textAlign: 'left', opacity: 0.6 }, // Changed to left
  bubble1: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.15)' },
  bubble2: { position: 'absolute', top: 40, left: -30, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.1)' },
  bubble3: { position: 'absolute', bottom: -25, right: 50, width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.08)' },
  bubble4: { position: 'absolute', top: 10, left: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,200,200,0.15)' },
  bubble5: { position: 'absolute', bottom: 10, right: 30, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(160,240,220,0.1)' },
  // Bubbles inside the cards
  cardBubble1: { position: 'absolute', top: -5, right: 10, width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  cardBubble2: { position: 'absolute', bottom: 5, left: 30, width: 15, height: 15, borderRadius: 7.5, backgroundColor: 'rgba(255,255,255,0.08)' },
  cardBubble3: { position: 'absolute', bottom: 20, right: 20, width: 25, height: 25, borderRadius: 12.5, backgroundColor: 'rgba(255,255,255,0.12)' },
});

export default KidHome;
