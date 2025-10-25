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
import * as Progress from 'react-native-progress';
import API_BASE_URL from './config';

const PerformanceReport = ({ navigation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/performance/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error('Error fetching performance summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  // 🎯 Reward Logic
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={22} color="#EF3349" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subject Performance</Text>
      </View>

      {/* Content */}
      {loading ? (
        <ActivityIndicator color="#EF3349" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {data.length === 0 ? (
            <Text style={styles.noData}>No performance data yet.</Text>
          ) : (
            data.map((item) => {
              const reward = getReward(item.avgAccuracy, item.avgTimeSec, item.completionRate);
              return (
                <TouchableOpacity
                  key={item.subject}
                  style={styles.subjectCard}
                  onPress={() =>
                    navigation.navigate('PerformanceDetail', { subject: item.subject })
                  }
                >
                  <Text style={styles.subjectTitle}>{item.subject}</Text>

                  {/* Progress + Stats */}
                  <View style={styles.progressRow}>
                    <Progress.Circle
                      progress={item.avgAccuracy / 100}
                      size={80}
                      color="#EF3349"
                      showsText
                      formatText={() => `${item.avgAccuracy}%`}
                      unfilledColor="#eee"
                      borderWidth={0}
                      thickness={8}
                    />
                    <View style={styles.statsRight}>
                      <Text style={styles.statLine}>
                        🧠 Accuracy: <Text style={styles.bold}>{item.avgAccuracy}%</Text>
                      </Text>
                      <Text style={styles.statLine}>
                        ⏱ Avg Time: <Text style={styles.bold}>{item.avgTimeSec}s</Text>
                      </Text>
                      <Text style={styles.statLine}>
                        ✅ Completion: <Text style={styles.bold}>{item.completionRate}%</Text>
                      </Text>
                    </View>
                  </View>

                  {/* 🏅 Reward Badge */}
                  <View
                    style={[
                      styles.rewardBox,
                      { borderColor: reward.color, backgroundColor: reward.color + '33' },
                    ]}
                  >
                    <Text style={[styles.rewardTitle, { color: reward.color }]}>
                      {reward.emoji} {reward.grade} Badge
                    </Text>
                    <Text style={styles.rewardMessage}>{reward.message}</Text>
                  </View>

                  {/* Attempts + Correct */}
                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>
                      Attempts: <Text style={styles.bold}>{item.totalAttempts}</Text>
                    </Text>
                    <Text style={styles.footerText}>
                      Correct: <Text style={styles.bold}>{item.totalCorrect}</Text>
                    </Text>
                  </View>

                  {/* Total & Completed Words */}
                  <View style={styles.footerRow}>
                    <Text style={styles.footerText}>
                      Total Words: <Text style={styles.bold}>{item.totalWords}</Text>
                    </Text>
                    <Text style={styles.footerText}>
                      Completed: <Text style={styles.bold}>{item.completedWords}</Text>
                    </Text>
                  </View>

                  {/* Passing Criteria */}
                  {item.min_attempts !== undefined && (
                    <View style={styles.criteriaBox}>
                      <Text style={styles.criteriaTitle}>🎯 Passing Criteria</Text>
                      <View style={styles.criteriaRow}>
                        <Text style={styles.criteriaLabel}>Min Attempts:</Text>
                        <Text style={styles.criteriaValue}>{item.min_attempts}</Text>
                      </View>
                      <View style={styles.criteriaRow}>
                        <Text style={styles.criteriaLabel}>Min Avg Time (s):</Text>
                        <Text style={styles.criteriaValue}>{item.min_time_avg}</Text>
                      </View>
                      <View style={styles.criteriaRow}>
                        <Text style={styles.criteriaLabel}>Min Correct Avg (%):</Text>
                        <Text style={styles.criteriaValue}>{item.min_correct_avg}</Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
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
  subjectCard: {
    backgroundColor: '#A0F0DC',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  subjectTitle: { fontSize: 20, fontWeight: 'bold', color: '#000', marginBottom: 15 },
  progressRow: { flexDirection: 'row', alignItems: 'center' },
  statsRight: { marginLeft: 20 },
  statLine: { fontSize: 14, color: '#000', marginBottom: 4 },
  bold: { fontWeight: 'bold', color: '#000' },

  // 🏅 Reward Section (brighter & visible)
  rewardBox: {
    marginTop: 18,
    borderRadius: 15,
    borderWidth: 2,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  rewardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  rewardMessage: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingTop: 10,
  },
  footerText: { fontSize: 14, color: '#000' },

  // Passing Criteria Styles
  criteriaBox: {
    marginTop: 15,
    backgroundColor: '#eafff7',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#d3f3e5',
  },
  criteriaTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 6,
  },
  criteriaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 2,
  },
  criteriaLabel: { fontSize: 13, color: '#333' },
  criteriaValue: { fontSize: 13, fontWeight: 'bold', color: '#000' },
});

export default PerformanceReport;
