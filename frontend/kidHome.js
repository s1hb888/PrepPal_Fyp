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
  Animated,
  Easing,
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

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const headerBounce = useRef(new Animated.Value(0)).current;
  const videoScale = useRef(new Animated.Value(0.9)).current;
  const cardAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    fetchLatestVideo();
    fetchProfile();
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Header bounce animation
    Animated.spring(headerBounce, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // Fade in and slide up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();

    // Video card scale animation
    Animated.spring(videoScale, {
      toValue: 1,
      tension: 50,
      friction: 7,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Stagger card animations
    Animated.stagger(
      100,
      cardAnims.map((anim) =>
        Animated.spring(anim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        })
      )
    ).start();

    // Continuous floating animation for bubbles
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Pulse animation for watch button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

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
      color: '#FFC1CC'
    },
    {
      id: '2',
      title: 'Learn GK',
      icon: 'lightbulb-o',
      screen: 'GeneralKnowledge',
      subtitle: 'Explore the world',
      color: '#A0F0DC',
    },
    { 
      id: '3', 
      title: 'Assessment', 
      icon: 'pencil-square-o', 
      screen: 'Assessments', 
      subtitle: 'Test your knowledge', 
      color: '#FFE680'
    },
    { 
      id: '4', 
      title: 'Rewards', 
      icon: 'gift', 
      screen: 'Rewards', 
      subtitle: 'Earn achievements', 
      color: '#FFC1CC'
    },
  ];

  const renderCardItem = ({ item, index }) => {
    const cardScale = cardAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    const cardTranslateY = cardAnims[index].interpolate({
      inputRange: [0, 1],
      outputRange: [50, 0],
    });

    return (
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: cardAnims[index],
            transform: [
              { scale: cardScale },
              { translateY: cardTranslateY },
            ],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.navigate(item.screen)}
          activeOpacity={0.8}
          style={{ flex: 1 }}
        >
          <View style={[styles.card, { backgroundColor: item.color }]}>
            {/* Animated floating bubbles */}
            <Animated.View
              style={[
                styles.cardBubble1,
                {
                  transform: [
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -10],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.cardBubble2,
                {
                  transform: [
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 8],
                      }),
                    },
                  ],
                },
              ]}
            />
            <Animated.View
              style={[
                styles.cardBubble3,
                {
                  transform: [
                    {
                      translateY: floatAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -6],
                      }),
                    },
                  ],
                },
              ]}
            />

            <View style={styles.iconBackground}>
              <FontAwesome name={item.icon} size={24} color="#EF3349" />
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

            {/* Shine effect overlay */}
            <View style={styles.cardShine} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const latestVideo = videos.length > 0 ? videos[0] : null;

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#EF3349" />
        <Text style={{ marginTop: 10, color: '#666', fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Top Header with Animation */}
        <LinearGradient colors={['#FFC1CC', '#FFB6C1']} style={styles.topHeader}>
          {/* Animated floating bubbles */}
          <Animated.View
            style={[
              styles.bubble1,
              {
                transform: [
                  { translateY: floatTranslate },
                  {
                    scale: headerBounce.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.bubble2,
              {
                transform: [
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 12],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.bubble3,
              {
                transform: [
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -8],
                    }),
                  },
                ],
              },
            ]}
          />

          <Animated.View
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  {
                    scale: headerBounce.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1],
                    }),
                  },
                ],
              },
            ]}
          >
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
          </Animated.View>
        </LinearGradient>

        {/* White Curve Section */}
        <View style={styles.whiteCurve}>
          {/* Lower bubbles with animation */}
          <Animated.View
            style={[
              styles.bubble4,
              {
                transform: [
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -10],
                    }),
                  },
                ],
              },
            ]}
          />
          <Animated.View
            style={[
              styles.bubble5,
              {
                transform: [
                  {
                    translateY: floatAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 8],
                    }),
                  },
                ],
              },
            ]}
          />

          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            <View style={styles.sectionTitleContainer}>
              <FontAwesome name="play-circle" size={22} color="#EF3349" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Start Learning</Text>
            </View>

            <Animated.View
              style={{
                transform: [{ scale: videoScale }],
              }}
            >
              <LinearGradient
                colors={['#A0F0DC', '#7BE7CE']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.videoGradientBorder}
              >
                <View style={styles.videoWrapper}>
                  <View style={styles.videoContainer}>
                    {latestVideo ? (
                      <YoutubePlayer ref={playerRef} height={200} play={false} videoId={latestVideo.videoId} />
                    ) : (
                      <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color="#2BCB9A" />
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    onPress={() => navigation.navigate('WatchVideoScreen')}
                    activeOpacity={0.8}
                  >
                    <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                      <LinearGradient
                        colors={['rgb(255, 230, 128)', 'rgb(255, 213, 79)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.watchMoreButton}
                      >
                        <FontAwesome name="video-camera" size={16} color="#EF3349" style={{ marginRight: 6 }} />
                        <Text style={styles.watchMoreText}>WATCH MORE</Text>
                      </LinearGradient>
                    </Animated.View>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </Animated.View>

            <View style={styles.sectionTitleContainer}>
              <FontAwesome name="compass" size={22} color="#EF3349" style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Explore</Text>
            </View>
          </Animated.View>

          <FlatList
            data={cardData}
            renderItem={renderCardItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            numColumns={2}
            columnWrapperStyle={styles.cardRow}
            contentContainerStyle={{ paddingBottom: 20 }}
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
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 35,
    paddingVertical: 35,
    paddingHorizontal: 19,
    alignItems: 'flex-start',
    overflow: 'hidden',
    shadowColor: '#EF3349',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  whiteCurve: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -25,
    paddingHorizontal: 15,
    paddingTop: 20,
    paddingBottom: 9,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  kidImage: { width: 80, height: 100, marginRight: 13 },
  greetingContainer: { flexDirection: 'row', alignItems: 'center' },
  helloText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#000',
    textShadowColor: 'rgba(255, 255, 255, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  kidNameText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#EF3349',
    fontStyle: 'italic',
    marginLeft: 7,
    textShadowColor: 'rgba(239, 51, 73, 0.15)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 11, marginTop: 0 },
  sectionTitle: { fontSize: 21, fontWeight: 'bold', color: '#000' },
  videoWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  videoContainer: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  watchMoreButton: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoGradientBorder: {
    borderRadius: 18,
    padding: 5,
    marginBottom: 0,
    shadowColor: '#2BCB9A',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.28,
    shadowRadius: 9,
    elevation: 7,
  },
  watchMoreText: { color: '#000', fontWeight: '700', fontSize: 16, letterSpacing: 0.4 },
  cardRow: { justifyContent: 'space-between', marginBottom: 11 },
  cardWrapper: {
    width: cardWidth,
    height: 130,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 9,
    elevation: 7,
  },
  card: { flex: 1, padding: 18, justifyContent: 'flex-start', alignItems: 'flex-start', position: 'relative' },
  iconBackground: { backgroundColor: 'white', borderRadius: 11, width: 41, height: 41, justifyContent: 'center', alignItems: 'center', marginBottom: 9, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  cardTitle: { marginTop: 0, color: '#000', fontWeight: 'bold', fontSize: 14, textAlign: 'left', letterSpacing: 0.3 },
  cardSubtitle: { color: '#000', fontSize: 11, textAlign: 'left', opacity: 0.6, marginTop: 3 },
  cardShine: { position: 'absolute', top: 0, left: 0, right: 0, height: '48%', backgroundColor: 'rgba(255, 255, 255, 0.12)', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  bubble1: { position: 'absolute', top: -12, right: -12, width: 65, height: 65, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.15)' },
  bubble2: { position: 'absolute', top: 33, left: -17, width: 43, height: 43, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.12)' },
  bubble3: { position: 'absolute', bottom: -17, right: 43, width: 53, height: 53, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.1)' },
  bubble4: { position: 'absolute', top: 8, left: 18, width: 43, height: 43, borderRadius: 21, backgroundColor: 'rgba(255,200,200,0.18)' },
  bubble5: { position: 'absolute', bottom: 8, right: 23, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(160,240,220,0.15)' },
  cardBubble1: { position: 'absolute', top: -3, right: 10, width: 21, height: 21, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)' },
  cardBubble2: { position: 'absolute', bottom: 9, left: 27, width: 17, height: 17, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)' },
  cardBubble3: { position: 'absolute', bottom: 21, right: 19, width: 23, height: 23, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.18)' },
});

export default KidHome;