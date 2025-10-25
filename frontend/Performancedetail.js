import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import API_BASE_URL from './config';

const PerformanceDetail = ({ route, navigation }) => {
  const { subject } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Same reward logic from PerformanceReport
const getReward = (accuracy, avgTime, completionRate) => {
  if (accuracy >= 90 && avgTime <= 1 && completionRate >= 90) {
    return { grade: 'Gold', emoji: '🥇', color: '#FFD700', message: 'Excellent Performance!' };
  } else if (accuracy >= 85 && avgTime <= 1.5 && completionRate >= 85) {
    return { grade: 'Silver', emoji: '🥈', color: '#C0C0C0', message: 'Great Job!' };
  } else if (accuracy >= 80 && avgTime <= 2 && completionRate >= 80) {
    return { grade: 'Bronze', emoji: '🥉', color: '#CD7F32', message: 'Good try!' };
  } else {
    return { grade: 'Participant', emoji: '🎯', color: '#89CFF0', message: 'Keep practicing!' };
  }
};


  const fetchDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/performance/summary/${subject}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Error fetching subject details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#EF3349" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{subject} Details</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#EF3349" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {data.length === 0 ? (
            <Text style={styles.noData}>No word-level data yet.</Text>
          ) : (
            data.map((item, index) => {
              const reward = getReward(item.accuracy, item.avgTimeSec, item.completionRate || item.accuracy); // fallback
              return (
                <View key={index} style={styles.wordCard}>
                  <View style={styles.wordRow}>
                    <Text style={styles.word}>{item.item}</Text>
                    <Text style={[styles.status, item.done && styles.doneStatus]}>
                      {item.done ? '✅ Done' : '❌ Incomplete'}
                    </Text>
                  </View>

                  <Text style={styles.detail}>
                    Attempts: {item.attempts} | Correct: {item.correct}
                  </Text>
                  <Text style={styles.detail}>
                    Accuracy: {item.accuracy}% | Avg Time: {item.avgTimeSec}s
                  </Text>

                  {/* 🏅 Show reward badge only when done */}
                  {item.done && (
                    <View
                      style={[
                        styles.rewardBadge,
                        { borderColor: reward.color, backgroundColor: reward.color + '22' },
                      ]}
                    >
                      <Text style={[styles.rewardText, { color: reward.color }]}>
                        {reward.emoji} {reward.grade} Badge
                      </Text>
                    </View>
                  )}

                  {/* Passing Criteria */}
                  {item.passingCriteria && (
                    <View style={styles.criteriaBox}>
                      <Text style={styles.criteriaTitle}>Passing Criteria:</Text>
                      <Text style={styles.criteriaDetail}>
                        • Min Attempts: {item.passingCriteria.min_attempts ?? '—'}
                      </Text>
                      <Text style={styles.criteriaDetail}>
                        • Min Time Avg: {item.passingCriteria.min_time_avg ?? '—'}s
                      </Text>
                      <Text style={styles.criteriaDetail}>
                        • Min Correct Avg: {item.passingCriteria.min_correct_avg ?? '—'}%
                      </Text>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgb(160,240,220)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', marginLeft: 10 },
  scrollContent: { padding: 20 },
  noData: { textAlign: 'center', fontSize: 16, color: '#888', marginTop: 40 },
  wordCard: {
    backgroundColor: '#A0F0DC',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  wordRow: { flexDirection: 'row', justifyContent: 'space-between' },
  word: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  status: { fontSize: 14, color: '#000' },
  doneStatus: { color: '#00897B', fontWeight: '600' },
  detail: { fontSize: 14, color: '#333', marginTop: 4 },

  // 🏅 Reward badge shown when word is done
  rewardBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    borderWidth: 1.8,
    paddingVertical: 5,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  criteriaBox: {
    backgroundColor: '#E8FFF7',
    borderRadius: 10,
    padding: 8,
    marginTop: 10,
  },
  criteriaTitle: { fontSize: 14, fontWeight: '600', color: '#000' },
  criteriaDetail: { fontSize: 13, color: '#333', marginTop: 2 },
});

export default PerformanceDetail;
