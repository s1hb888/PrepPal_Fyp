import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { API_BASE_URL } from './config';

const { width } = Dimensions.get('window');

const DuaScreen = () => {
  const [duas, setDuas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDua, setSelectedDua] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/duas`)
      .then((res) => res.json())
      .then((data) => {
        setDuas(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching duas:', err);
        setLoading(false);
      });
  }, []);

  const playSpeech = (text, lang = 'en') => {
    try {
      Speech.stop();
      Speech.speak(text, {
        language: lang === 'ar' ? 'ar-SA' : 'en-US',
        pitch: 1.0,
        rate: 0.7,
      });
    } catch (error) {
      console.error('Speech error:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={'#EF3349'} />
      </View>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedDua) {
    return (
      <View style={styles.detailWrapper}>
        <LinearGradient colors={['#fff', '#fefefe']} style={styles.detailContainer}>
          <View style={styles.headerRow}>
            <TouchableOpacity
              onPress={() => setSelectedDua(null)}
              style={styles.backBtnWrapper}
            >
              <Ionicons name="arrow-back-circle" size={32} color="#EF3349" />
              <Text style={styles.backButton}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.title}>{selectedDua.dua_name}</Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.imageContainer}>
              <Image source={{ uri: selectedDua.image_url }} style={styles.imageLarge} />
            </View>
            <Text style={styles.arabic}>{selectedDua.dua}</Text>
            <Text style={styles.translation}>{selectedDua.translation}</Text>

            <View style={styles.audioControls}>
              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() => playSpeech(selectedDua.dua, 'ar')}
              >
                <Ionicons name="volume-high-outline" size={22} color="#EF3349" />
                <Text style={styles.audioBtnText}>Arabic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.audioBtn}
                onPress={() => playSpeech(selectedDua.translation, 'en')}
              >
                <MaterialIcons name="language" size={22} color="#EF3349" />
                <Text style={styles.audioBtnText}>Translation</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </LinearGradient>
      </View>
    );
  }

  // --- LIST VIEW ---
  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFC1CC', '#FFB6C1']} style={styles.headerCard}>
        <View style={styles.headerContent}>
          <Image source={require('../assets/dua.png')} style={styles.headerIcon} />
          <View>
            <Text style={styles.headerTitle}>Daily Duas</Text>
            {/* ✅ Shorter subtitle line */}
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              Practice daily Duas.
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {duas.map((item, index) => {
            const gradientColors =
              index % 3 === 0
                ? ['#FFC1CC', '#FFB6C1'] // pink
                : index % 3 === 1
                ? ['#A0F0DC', '#7BE7CE'] // mint
                : ['#FFE680', '#FFD54F']; // yellow

            return (
              <TouchableOpacity
                key={index}
                style={styles.gridItemWrapper}
                onPress={() => setSelectedDua(item)}
              >
                <LinearGradient
                  colors={gradientColors}
                  style={styles.gridCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Image source={{ uri: item.image_url }} style={styles.gridIcon} />
                  <Text style={styles.gridCardText}>{item.dua_name}</Text>

                  <View style={styles.learnButton}>
                    <Ionicons name="play-circle-outline" size={20} color="#EF3349" />
                    <Text style={styles.learnText}>Learn Dua</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

export default DuaScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefefe', paddingTop: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // HEADER
  headerCard: {
    margin: 15,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerIcon: { width: 40, height: 40, resizeMode: 'contain', marginRight: 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000' },
  headerSubtitle: {
    fontSize: 14,
    color: '#000',
    marginTop: 4,
    width: 220, // ✅ makes line shorter
  },
  duaCount: { flexDirection: 'row', alignItems: 'center' },
  duaCountText: { fontSize: 18, color: '#000', marginLeft: 6, fontWeight: 'bold' },

  // GRID
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  gridItemWrapper: { width: '48%', marginBottom: 20 },
  gridCard: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    padding: 15,
    height: 200,
    elevation: 4,
  },
  gridIcon: { width: 90, height: 90, marginBottom: 10, resizeMode: 'contain' },
  gridCardText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 10,
  },
  learnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  learnText: { color: '#000', fontSize: 14, marginLeft: 5, fontWeight: 'bold' },

  // DETAIL
  detailWrapper: { flex: 1, backgroundColor: '#fff' },
  detailContainer: { flex: 1, paddingTop: 50, paddingHorizontal: 16 },
  headerRow: { flexDirection: 'column', alignItems: 'center', marginBottom: 20 },
  backBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backButton: { fontSize: 18, color: '#EF3349', marginLeft: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#000', marginTop: 8 },
  imageContainer: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  imageLarge: { width, height: 320, resizeMode: 'contain', marginVertical: 14 },
  arabic: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
    lineHeight: 38,
    color: '#000',
  },
  translation: {
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
    color: '#444',
  },
  audioControls: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    // ✅ Mint gradient for buttons
    backgroundColor: '#7BE7CE',
  },
  audioBtnText: { color: '#000', fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});
