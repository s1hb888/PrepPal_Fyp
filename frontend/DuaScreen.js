import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { API_BASE_URL } from './config';

const MINT = 'rgb(160,240,220)'; 

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
        <ActivityIndicator size="large" color={MINT} />
      </View>
    );
  }

  // --- DETAIL VIEW ---
  if (selectedDua) {
    return (
      <View style={styles.detailWrapper}>
        <LinearGradient
          colors={['#fff', '#fefefe']}
          style={styles.detailContainer}
        >
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
            <Image
              source={{ uri: selectedDua.image_url }}
              style={styles.imageLarge}
            />
            <Text style={styles.arabic}>{selectedDua.dua}</Text>
            <Text style={styles.translation}>{selectedDua.translation}</Text>

            <View style={styles.audioControls}>
              <TouchableOpacity
                style={[styles.audioBtn, { backgroundColor: MINT }]}
                onPress={() => playSpeech(selectedDua.sound_dua, 'ar')}
              >
                <Ionicons name="volume-high" size={22} color="#EF3349" />
                <Text style={styles.audioText}>Arabic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.audioBtn, { backgroundColor: MINT }]}
                onPress={() => playSpeech(selectedDua.sound_translation, 'en')}
              >
                <Ionicons name="earth" size={22} color="#EF3349" />
                <Text style={styles.audioText}>Translation</Text>
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
      <Text style={styles.heading}>Learn Daily Duas</Text>
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
      >
        {duas.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.cardWrapper}
            onPress={() => setSelectedDua(item)}
          >
            <LinearGradient
              colors={
                index % 3 === 0
                  ? ['#FFC1CC', '#FFB6C1']
                  : index % 3 === 1
                  ? ['#A0F0DC', '#7BE7CE']
                  : ['#FFE680', '#FFD54F']
              }
              style={styles.card}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Image source={{ uri: item.image_url }} style={styles.icon} />
              <Text
                style={styles.cardText}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {item.dua_name}
              </Text>
              <Ionicons
                name="chevron-forward"
                size={22}
                color="#EF3349"
                style={styles.arrowIcon}
              />
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default DuaScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fefefe',
    paddingTop: 50,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#EF3349',
    textAlign: 'center',
    marginBottom: 25,
  },
  listContainer: {
    flex: 1,
  },
  detailWrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  detailContainer: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 16,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  headerRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 20,
  },
  backBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backButton: {
    fontSize: 18,
    color: '#EF3349',
    marginLeft: 5,
  },
  cardWrapper: {
    marginBottom: 16,
    borderRadius: 18,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: {
    width: 60,
    height: 60,
    marginRight: 14,
    resizeMode: 'contain',
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
  cardText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  arabic: {
    fontSize: 30,
    fontFamily: 'serif',
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginVertical: 15,
    lineHeight: 40,
  },
  translation: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 28,
    paddingHorizontal: 10,
  },
  imageLarge: {
    width: '100%',
    height: 280,
    resizeMode: 'contain',
    marginVertical: 14,
  },
  audioControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 20,
  },
  audioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  audioText: {
    color: '#000', // Black text
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
