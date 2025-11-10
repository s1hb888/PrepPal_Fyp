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
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from './config';

const PerformanceDetail = ({ route, navigation }) => {
  const { subject } = route.params;
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Same reward logic from PerformanceReport
  const getReward = (accuracy, avgTime) => {
    if (accuracy >= 90 && avgTime <= 5 ) {
      return { grade: 'Gold', emoji: '🥇', color: '#FFD700', message: 'Excellent Performance!' };
    } else if (accuracy >= 85 && avgTime <= 7 ) {
      return { grade: 'Silver', emoji: '🥈', color: '#C0C0C0', message: 'Great Job!' };
    } else if (accuracy >= 80 && avgTime <= 10 ) {
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
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#7BE7CE', '#5DD9BF', '#A0F0DC']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Decorative Header Elements */}
        <View style={styles.headerBubble1} />
        <View style={styles.headerBubble2} />

        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={22} color="#EF3349" />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerSubtitle}>Performance Details</Text>
            <Text style={styles.headerTitle}>{subject}</Text>
          </View>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color="#EF3349" size="large" />
          <Text style={styles.loadingText}>Loading performance data...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Background Bubbles */}
          <View style={styles.bgBubble1} />
          <View style={styles.bgBubble2} />

          {data.length === 0 ? (
            <View style={styles.noDataContainer}>
              <View style={styles.noDataIcon}>
                <Feather name="inbox" size={48} color="#A0F0DC" />
              </View>
              <Text style={styles.noDataTitle}>No Data Available</Text>
              <Text style={styles.noDataText}>
                Word-level performance data will appear here once available.
              </Text>
            </View>
          ) : (
            data.map((item, index) => {
              const reward = getReward(
                item.accuracy,
                item.avgTimeSec
              );
              return (
                <View key={index} style={styles.wordCard}>
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.wordTitleContainer}>
                      <View style={styles.wordIconWrapper}>
                        <Feather name="book" size={20} color="#EF3349" />
                      </View>
                      <Text style={styles.wordTitle}>{item.item}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        item.done ? styles.doneBadge : styles.incompleteBadge,
                      ]}
                    >
                      <Feather
                        name={item.done ? 'check-circle' : 'x-circle'}
                        size={14}
                        color={item.done ? '#00897B' : '#EF3349'}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          item.done ? styles.doneText : styles.incompleteText,
                        ]}
                      >
                        {item.done ? 'Done' : 'Incomplete'}
                      </Text>
                    </View>
                  </View>

                  {/* Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                      <Feather name="target" size={18} color="#7BE7CE" />
                      <Text style={styles.statValue}>{item.attempts}</Text>
                      <Text style={styles.statLabel}>Attempts</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Feather name="check" size={18} color="#4CAF50" />
                      <Text style={styles.statValue}>{item.correct}</Text>
                      <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Feather name="percent" size={18} color="#EF3349" />
                      <Text style={styles.statValue}>{item.accuracy}%</Text>
                      <Text style={styles.statLabel}>Accuracy</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Feather name="clock" size={18} color="#FF9800" />
                      <Text style={styles.statValue}>{item.avgTimeSec}s</Text>
                      <Text style={styles.statLabel}>Avg Time</Text>
                    </View>
                  </View>

                  {/* Reward Badge - Only when done */}
                  {item.done && (
                    <View style={styles.rewardSection}>
                      <LinearGradient
                        colors={[reward.color + '30', reward.color + '10']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                          styles.rewardBadge,
                          { borderColor: reward.color },
                        ]}
                      >
                        <Text style={styles.rewardEmoji}>{reward.emoji}</Text>
                        <View style={styles.rewardTextContainer}>
                          <Text style={[styles.rewardGrade, { color: reward.color }]}>
                            {reward.grade} Badge
                          </Text>
                          <Text style={styles.rewardMessage}>{reward.message}</Text>
                        </View>
                      </LinearGradient>
                    </View>
                  )}

                  {/* Passing Criteria */}
                  {item.passingCriteria && (
                    <View style={styles.criteriaSection}>
                      <View style={styles.criteriaHeader}>
                        <Feather name="info" size={16} color="#7BE7CE" />
                        <Text style={styles.criteriaTitle}>Passing Criteria</Text>
                      </View>
                      <View style={styles.criteriaList}>
                        <View style={styles.criteriaItem}>
                          <Feather name="check-square" size={14} color="#666" />
                          <Text style={styles.criteriaText}>
                            Min Attempts:{' '}
                            <Text style={styles.criteriaBold}>
                              {item.passingCriteria.min_attempts ?? '—'}
                            </Text>
                          </Text>
                        </View>
                        <View style={styles.criteriaItem}>
                          <Feather name="clock" size={14} color="#666" />
                          <Text style={styles.criteriaText}>
                            Min Time Avg:{' '}
                            <Text style={styles.criteriaBold}>
                              {item.passingCriteria.min_time_avg ?? '—'}s
                            </Text>
                          </Text>
                        </View>
                        <View style={styles.criteriaItem}>
                          <Feather name="trending-up" size={14} color="#666" />
                          <Text style={styles.criteriaText}>
                            Min Correct Avg:{' '}
                            <Text style={styles.criteriaBold}>
                              {item.passingCriteria.min_correct_avg ?? '—'}%
                            </Text>
                          </Text>
                        </View>
                      </View>
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
  safeArea: { 
    flex: 1, 
    backgroundColor: '#F5F7FA' 
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerBubble1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  headerBubble2: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bgBubble1: {
    position: 'absolute',
    top: 50,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(160, 240, 220, 0.08)',
  },
  bgBubble2: {
    position: 'absolute',
    bottom: 100,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(160, 240, 220, 0.06)',
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  noDataIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#E8FBF7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  noDataTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  noDataText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  wordCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#E8F5F3',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  wordTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  wordIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEE8EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  wordTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  doneBadge: {
    backgroundColor: '#E8F5E9',
  },
  incompleteBadge: {
    backgroundColor: '#FFEBEE',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  doneText: {
    color: '#00897B',
  },
  incompleteText: {
    color: '#EF3349',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 10,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F5F3',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  rewardSection: {
    marginTop: 15,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 15,
    gap: 12,
  },
  rewardEmoji: {
    fontSize: 32,
  },
  rewardTextContainer: {
    flex: 1,
  },
  rewardGrade: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  rewardMessage: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  criteriaSection: {
    backgroundColor: '#E8FBF7',
    borderRadius: 14,
    padding: 15,
    marginTop: 15,
  },
  criteriaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  criteriaTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  criteriaList: {
    gap: 10,
  },
  criteriaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  criteriaText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  criteriaBold: {
    fontWeight: '700',
    color: '#000',
  },
});

export default PerformanceDetail;