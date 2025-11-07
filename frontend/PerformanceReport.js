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
    if (accuracy >= 90 && avgTime <= 5 && completionRate >= 90) {
      return { grade: 'Gold', icon: 'award', color: '#FFD700', message: 'Excellent Performance!' };
    } else if (accuracy >= 85 && avgTime <= 7 && completionRate >= 85) {
      return { grade: 'Silver', icon: 'award', color: '#C0C0C0', message: 'Great Job!' };
    } else if (accuracy >= 80 && avgTime <= 10 && completionRate >= 80) {
      return { grade: 'Bronze', icon: 'award', color: '#CD7F32', message: 'Good try!' };
    } else {
      return { grade: 'Participant', icon: 'target', color: '#89CFF0', message: 'Keep practicing!' };
    }
  };

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
            <Text style={styles.headerSubtitle}>Performance Overview</Text>
            <Text style={styles.headerTitle}>Subject Summary</Text>
          </View>
          <View style={styles.headerIconWrapper}>
            <Feather name="bar-chart-2" size={24} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* Content */}
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
          <View style={styles.bgBubble3} />

          {data.length === 0 ? (
            <View style={styles.noDataContainer}>
              <View style={styles.noDataIcon}>
                <Feather name="trending-up" size={48} color="#A0F0DC" />
              </View>
              <Text style={styles.noDataTitle}>No Performance Data</Text>
              <Text style={styles.noDataText}>
                Subject performance data will appear here once available.
              </Text>
            </View>
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
                  activeOpacity={0.7}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.subjectTitleContainer}>
                      <View style={styles.subjectIconWrapper}>
                        <Feather name="book-open" size={22} color="#EF3349" />
                      </View>
                      <Text style={styles.subjectTitle}>{item.subject}</Text>
                    </View>
                    <Feather name="chevron-right" size={20} color="#A0F0DC" />
                  </View>

                  {/* Progress Circle + Quick Stats */}
                  <View style={styles.progressSection}>
                    <View style={styles.circleWrapper}>
                     <Progress.Circle
  progress={item.avgAccuracy / 100}
  size={90}
  color={item.avgAccuracy >= 80 ? "#2BCB9A" : "#EF3349"} // ✅ correct
  showsText
  formatText={() => `${item.avgAccuracy}%`}
  unfilledColor="#F0F0F0"
  borderWidth={0}
  thickness={9}
  textStyle={styles.circleText}
/>

                      <Text style={styles.circleLabel}>Accuracy</Text>
                    </View>

                    <View style={styles.quickStats}>
                      <View style={styles.quickStatItem}>
                        <Feather name="zap" size={16} color="#FF9800" />
                        <Text style={styles.quickStatLabel}>Avg Time</Text>
                        <Text style={styles.quickStatValue}>{item.avgTimeSec}s</Text>
                      </View>
                      <View style={styles.quickStatDivider} />
                      <View style={styles.quickStatItem}>
                        <Feather name="check-circle" size={16} color="#4CAF50" />
                        <Text style={styles.quickStatLabel}>Completion</Text>
                        <Text style={styles.quickStatValue}>{item.completionRate}%</Text>
                      </View>
                    </View>
                  </View>

                  {/* Reward Badge */}
                  <LinearGradient
                    colors={[reward.color + '25', reward.color + '15']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.rewardBadge, { borderColor: reward.color }]}
                  >
                    <View style={[styles.rewardIconWrapper, { backgroundColor: reward.color }]}>
                      <Feather name={reward.icon} size={24} color="#fff" />
                    </View>
                    <View style={styles.rewardContent}>
                      <Text style={[styles.rewardGrade, { color: reward.color }]}>
                        {reward.grade} Badge
                      </Text>
                      <Text style={styles.rewardMessage}>{reward.message}</Text>
                    </View>
                  </LinearGradient>

                  {/* Detailed Stats Grid */}
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <View style={styles.statIconWrapper}>
                        <Feather name="activity" size={16} color="#7BE7CE" />
                      </View>
                      <Text style={styles.statValue}>{item.totalAttempts}</Text>
                      <Text style={styles.statLabel}>Attempts</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={styles.statIconWrapper}>
                        <Feather name="check" size={16} color="#4CAF50" />
                      </View>
                      <Text style={styles.statValue}>{item.totalCorrect}</Text>
                      <Text style={styles.statLabel}>Correct</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={styles.statIconWrapper}>
                        <Feather name="layers" size={16} color="#2196F3" />
                      </View>
                      <Text style={styles.statValue}>{item.totalWords}</Text>
                      <Text style={styles.statLabel}>Total Words</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={styles.statIconWrapper}>
                        <Feather name="award" size={16} color="#FF9800" />
                      </View>
                      <Text style={styles.statValue}>{item.completedWords}</Text>
                      <Text style={styles.statLabel}>Completed</Text>
                    </View>
                  </View>

                  {/* Passing Criteria */}
                  {item.min_attempts !== undefined && (
                    <View style={styles.criteriaSection}>
                      <View style={styles.criteriaHeader}>
                        <Feather name="target" size={16} color="#7BE7CE" />
                        <Text style={styles.criteriaTitle}>Passing Criteria</Text>
                      </View>
                      <View style={styles.criteriaGrid}>
                        <View style={styles.criteriaItem}>
                          <Text style={styles.criteriaLabel}>Min Attempts</Text>
                          <Text style={styles.criteriaValue}>{item.min_attempts}</Text>
                        </View>
                        <View style={styles.criteriaItem}>
                          <Text style={styles.criteriaLabel}>Min Avg Time</Text>
                          <Text style={styles.criteriaValue}>{item.min_time_avg}s</Text>
                        </View>
                        <View style={styles.criteriaItem}>
                          <Text style={styles.criteriaLabel}>Min Correct</Text>
                          <Text style={styles.criteriaValue}>{item.min_correct_avg}%</Text>
                        </View>
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
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
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
    top: 300,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(160, 240, 220, 0.06)',
  },
  bgBubble3: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(160, 240, 220, 0.1)',
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
  subjectCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
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
  subjectTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subjectIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEE8EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  subjectTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    flex: 1,
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 20,
  },
  circleWrapper: {
    alignItems: 'center',
  },
  circleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  circleLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontWeight: '600',
  },
  quickStats: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F5F3',
  },
  quickStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 6,
    marginBottom: 4,
    fontWeight: '500',
  },
  quickStatValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  quickStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 10,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 16,
    marginBottom: 20,
    gap: 14,
  },
  rewardIconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  rewardContent: {
    flex: 1,
  },
  rewardGrade: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  rewardMessage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    gap: 10,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#F8F9FA',
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8F5F3',
  },
  statIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  criteriaSection: {
    backgroundColor: '#E8FBF7',
    borderRadius: 14,
    padding: 15,
    marginTop: 5,
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
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  criteriaItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  criteriaLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  criteriaValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});

export default PerformanceReport;