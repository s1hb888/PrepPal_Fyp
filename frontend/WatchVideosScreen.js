import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import axios from 'axios';
import { API_BASE_URL } from './config';
import { LinearGradient } from 'expo-linear-gradient';

const WatchVideoScreen = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [category, setCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [fullscreen, setFullscreen] = useState(false);
  const playerRef = useRef();

  useEffect(() => {
    fetchVideos();
  }, []);

  useEffect(() => {
    filterAndSortVideos();
  }, [videos, category, searchTerm, sortOrder]);

  const fetchVideos = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/videos`);
      const fetchedVideos = res.data.map((vid) => {
        const videoId = extractYouTubeVideoID(vid.url);
        const thumbnail = videoId
          ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
          : 'https://via.placeholder.com/150';
        return {
          ...vid,
          videoId,
          thumbnail,
        };
      });
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

  const filterAndSortVideos = () => {
    let filtered = [...videos];
    if (category !== 'All') {
      filtered = filtered.filter((video) => video.category === category);
    }
    if (searchTerm) {
      filtered = filtered.filter((video) =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      const titleA = a.title.toLowerCase();
      const titleB = b.title.toLowerCase();
      return sortOrder === 'asc'
        ? titleA.localeCompare(titleB)
        : titleB.localeCompare(titleA);
    });
    setFilteredVideos(filtered);
  };

  const handleNext = () => {
    if (selectedIndex < filteredVideos.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handlePrev = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const selectedVideoId = selectedIndex !== null ? filteredVideos[selectedIndex]?.videoId : null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.heading}>Explore Videos</Text>

          <LinearGradient
            colors={['#FFC1CC', '#FFB6C1']}
            style={styles.searchInputWrapper}
          >
            <View style={styles.searchInputInner}>
              <TextInput
                placeholder="Search by title..."
                style={styles.searchInput}
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholderTextColor="#555"
              />
            </View>
          </LinearGradient>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.buttonRow}>
            {['All', 'Academic Learning', 'General Knowledge'].map((cat) => {
              const isSelected = category === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.outlinedButton,
                    isSelected && styles.selectedButton,
                  ]}
                >
                  <Text style={isSelected ? styles.selectedButtonText : styles.outlinedText}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {['asc', 'desc'].map((order) => {
              const isSelected = sortOrder === order;
              return (
                <TouchableOpacity
                  key={order}
                  onPress={() => setSortOrder(order)}
                  style={[
                    styles.outlinedButton,
                    isSelected && styles.selectedButton,
                  ]}
                >
                  <Text style={isSelected ? styles.selectedButtonText : styles.outlinedText}>
                    {order === 'asc' ? 'Title A-Z' : 'Title Z-A'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <ScrollView 
            style={styles.videoList}
            contentContainerStyle={styles.videoListContent}
            keyboardShouldPersistTaps="handled"
          >
            {loading ? (
              <ActivityIndicator size="large" color="#2BCB9A" />
            ) : (
              filteredVideos.map((item, index) => (
                <TouchableOpacity
                  key={item._id || index}
                  onPress={() => setSelectedIndex(index)}
                  activeOpacity={0.9}
                  style={styles.cardWrapper}
                >
                  <LinearGradient colors={getCardGradient(index)} style={styles.card}>
                    <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                    <LinearGradient
                      colors={['#FFC1CC', '#FFB6C1']}
                      style={styles.playIconGradient}
                    >
                      <FontAwesome name="play" size={24} color="#fff" />
                    </LinearGradient>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.videoTitle}>{item.title}</Text>
                      <Text style={styles.tapToPlay}>Tap to play</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>

          {selectedIndex !== null && (
            <Modal visible animationType="fade" transparent>
              <View style={styles.overlay}>
                <View style={[styles.videoWrapper, fullscreen && { width: '100%', height: '100%' }]}>
                  <TouchableOpacity
                    onPress={() => setSelectedIndex(null)}
                    style={styles.closeBtn}
                  >
                    <FontAwesome name="close" size={24} color="#EF3349" />
                  </TouchableOpacity>

                  {selectedVideoId && (
                    <>
                      <View style={styles.playerContainer}>
                        <YoutubePlayer
                          ref={playerRef}
                          height={Dimensions.get('window').width * 0.56}
                          play
                          videoId={selectedVideoId}
                          onFullScreenChange={setFullscreen}
                          initialPlayerParams={{
                            cc_lang_pref: 'en',
                            showClosedCaptions: true,
                            controls: 1,
                            modestbranding: 1,
                            rel: 0,
                          }}
                        />
                      </View>
                      <View style={styles.controlRow}>
                        <TouchableOpacity
                          onPress={handlePrev}
                          disabled={selectedIndex === 0}
                          style={[styles.navButton, selectedIndex === 0 && { opacity: 0.3 }]}
                        >
                          <FontAwesome name="arrow-left" size={20} color="#fff" />
                          <Text style={styles.navText}>Previous</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={handleNext}
                          disabled={selectedIndex === filteredVideos.length - 1}
                          style={[
                            styles.navButton,
                            selectedIndex === filteredVideos.length - 1 && { opacity: 0.3 },
                          ]}
                        >
                          <Text style={styles.navText}>Next</Text>
                          <FontAwesome name="arrow-right" size={20} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </Modal>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const getCardGradient = (index) => {
  const gradients = [
    ['#FFC1CC', '#FFB6C1'], // Pink
    ['#A0F0DC', '#7BE7CE'], // Mint
    ['#FFE680', '#FFD54F'], // Yellow
  ];
  return gradients[index % gradients.length];
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111010',
    marginBottom: 10,
    marginTop: 30,
    textAlign: 'center',
  },
  searchInputWrapper: {
    borderRadius: 12,
    padding: 2,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: '#000',
  },
  buttonRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxHeight: 40,
  },
  outlinedButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFE680',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  outlinedText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  selectedButton: {
    backgroundColor: '#FFE680',
    borderColor: '#FFE680',
  },
  selectedButtonText: {
    fontSize: 12,
    color: '#000',
    fontWeight: 'bold',
  },
  videoList: {
    flex: 1,
  },
  videoListContent: {
    paddingBottom: 16,
  },
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    alignItems: 'center',
  },
  thumbnail: {
    width: 100,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  playIconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 15,
    left: 40,
    zIndex: 1,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  tapToPlay: {
    fontSize: 12,
    color: '#000',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  videoWrapper: {
    backgroundColor: '#000',
    borderRadius: 12,
    padding: 10,
    width: '95%',
    alignItems: 'center',
  },
  playerContainer: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
    backgroundColor: '#fff',
    padding: 5,
    borderRadius: 20,
    elevation: 3,
  },
  controlRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 20,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2BCB9A',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
  },
  navText: {
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 6,
  },
});

export default WatchVideoScreen;