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
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;
const cardWidth = (windowWidth - 48) / 2;

const cardData = [
  { id: '1', title: 'Academic Learning', icon: 'book', screen: 'Courses', subtitle: 'Master core subjects', color: '#FFC1CC' },
  { id: '2', title: 'Learn GK', icon: 'lightbulb-o', screen: 'GeneralKnowledge', subtitle: 'Explore the world', color: '#A0F0DC' },
  { id: '3', title: 'Assessment', icon: 'pencil-square-o', screen: 'Assessments', subtitle: 'Test your knowledge', color: '#FFE680' },
];

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
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderCardItem = ({ item, index }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate(item.screen)} 
      style={[
        styles.cardWrapper,
        index === cardData.length - 1 && cardData.length % 2 !== 0 && styles.lastCardFull
      ]}
      activeOpacity={0.85}
    >
      <View style={[styles.card, { backgroundColor: item.color }]}>
        <View style={styles.cardBubble1} />
        <View style={styles.cardBubble2} />
        <View style={styles.cardBubble3} />
        
        <View style={styles.iconBackground}>
          <FontAwesome name={item.icon} size={28} color="#EF3349" />
        </View>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        
        <View style={styles.cardArrow}>
          <FontAwesome name="arrow-right" size={16} color="#000" style={{ opacity: 0.4 }} />
        </View>
      </View>
    </TouchableOpacity>
  );

  const latestVideo = videos.length > 0 ? videos[0] : null;

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#EF3349" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Top Header with Gradient */}
          <LinearGradient colors={['#FFC1CC', '#FFB6C1']} style={styles.topHeader}>
            <View style={styles.bubble1} />
            <View style={styles.bubble2} />
            <View style={styles.bubble3} />

            <View style={styles.headerContent}>
              <View style={styles.textSection}>
                <Text style={styles.helloText}>Hello,</Text>
                <View style={styles.nameRow}>
                  <Text style={styles.kidNameText}>{kidName || 'Kiddo'}</Text>
                  <Text style={styles.waveEmoji}>👋</Text>
                </View>
                <Text style={styles.subHeaderText}>Ready to learn something new?</Text>
              </View>
              <Image
                source={{ uri: 'https://cdn.creazilla.com/cliparts/7769836/child-girl-reading-book-clipart-xl.png' }}
                style={styles.kidImage}
              />
            </View>
          </LinearGradient>

          {/* Main Content Area */}
          <View style={styles.contentArea}>
            <View style={styles.bubble4} />
            <View style={styles.bubble5} />

            {/* Featured Video Section */}
            <View style={styles.videoSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured Video</Text>
                <TouchableOpacity 
                  onPress={() => navigation.navigate('WatchVideoScreen')}
                  style={styles.seeAllButton}
                >
                  <Text style={styles.seeAllText}>See All</Text>
                  <FontAwesome name="chevron-right" size={12} color="#EF3349" style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              </View>

              <View style={styles.videoCard}>
                <View style={styles.videoPlayerContainer}>
                  {latestVideo ? (
                    <YoutubePlayer ref={playerRef} height={200} play={false} videoId={latestVideo.videoId} />
                  ) : (
                    <View style={styles.videoPlaceholder}>
                      <ActivityIndicator size="large" color="#2BCB9A" />
                    </View>
                  )}
                </View>
                
                <TouchableOpacity 
                  onPress={() => navigation.navigate('WatchVideoScreen')}
                  activeOpacity={0.7}
                  style={styles.watchMoreButtonContainer}
                >
                  <LinearGradient
                    colors={['#FFE680', '#FFD54F']}
                    style={styles.watchMoreButton}
                  >
                    <FontAwesome name="video-camera" size={14} color="#EF3349" style={{ marginRight: 6 }} />
                    <Text style={styles.watchMoreText}>WATCH MORE</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>

            {/* Explore Section */}
            <View style={styles.exploreSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Explore Topics</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{cardData.length}</Text>
                </View>
              </View>

              <FlatList
                data={cardData}
                renderItem={renderCardItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                numColumns={2}
                columnWrapperStyle={styles.cardRow}
                contentContainerStyle={styles.cardsContainer}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#FFC1CC' 
  },
  container: { 
    flex: 1,
    backgroundColor: '#fff',
  },
  topHeader: { 
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  headerContent: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
  },
  textSection: {
    flex: 1,
  },
  helloText: { 
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
    opacity: 0.7,
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  kidNameText: { 
    fontSize: 32,
    fontWeight: '800',
    color: '#EF3349',
    letterSpacing: 0.5,
  },
  waveEmoji: {
    fontSize: 28,
    marginLeft: 8,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#000',
    opacity: 0.6,
  },
  kidImage: { 
    width: 100,
    height: 120,
    marginLeft: 12,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -24,
    paddingTop: 20,
    paddingHorizontal: 18,
    paddingBottom: 20,
    position: 'relative',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { 
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    letterSpacing: 0.3,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(239, 51, 73, 0.1)',
    borderRadius: 20,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#EF3349',
  },
  countBadge: {
    backgroundColor: '#EF3349',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 28,
    alignItems: 'center',
  },
  countText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  videoSection: {
    marginBottom: 5,
  },
  videoCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  videoPlayerContainer: {
    backgroundColor: '#fefefeff',
  },
  videoPlaceholder: {
    height: 209,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watchMoreButtonContainer: {
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  watchMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  watchMoreText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  exploreSection: {
    flex: 1,
  },
  cardsContainer: {
    paddingBottom: 16,
  },
  cardRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardWrapper: {
    width: cardWidth,
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  lastCardFull: {
    width: '100%',
  },
  card: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
    position: 'relative',
  },
  cardContent: {
    flexDirection: 'column',
    flex: 1,
  },
  iconBackground: { 
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: { 
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  cardSubtitle: { 
    color: '#000',
    fontSize: 12,
    opacity: 0.65,
    letterSpacing: 0.1,
    lineHeight: 16,
  },
  cardArrow: {
    position: 'absolute',
    bottom: 14,
    right: 14,
  },
  bubble1: { 
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  bubble2: { 
    position: 'absolute',
    top: 60,
    left: -40,
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  bubble3: { 
    position: 'absolute',
    bottom: -20,
    right: 70,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  bubble4: { 
    position: 'absolute',
    top: 50,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,200,200,0.1)',
  },
  bubble5: { 
    position: 'absolute',
    bottom: 100,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(160,240,220,0.08)',
  },
  cardBubble1: { 
    position: 'absolute',
    top: 10,
    right: 10,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  cardBubble2: { 
    position: 'absolute',
    bottom: 10,
    left: 40,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  cardBubble3: { 
    position: 'absolute',
    top: 50,
    right: 30,
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});

export default KidHome;