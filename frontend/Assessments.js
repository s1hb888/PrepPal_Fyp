import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  LayoutAnimation,
  Platform,
  UIManager,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import API_BASE_URL from './config';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const categories = [
  {
    id: '1',
    title: 'Academic Courses',
    icon: 'school',
    assessments: [
      { id: '1-1', title: 'English', icon: 'alphabet-latin' },
      { id: '1-2', title: 'Urdu', icon: 'alpha-u-box' },
      { id: '1-3', title: 'Maths', icon: 'calculator-variant' },
    ],
  },
  {
    id: '2',
    title: 'General Knowledge',
    icon: 'earth',
    assessments: [
      { id: '2-1', title: 'Fruits', icon: 'fruit-cherries' },
      { id: '2-2', title: 'Vegetables', icon: 'carrot' },
      { id: '2-3', title: 'Body Parts', icon: 'arm-flex' },
      { id: '2-4', title: 'Colors', icon: 'palette' },
      { id: '2-5', title: 'Shapes', icon: 'shape' },
      { id: '2-6', title: 'Counting', icon: 'counter' },
    ],
  },
];

const Assessments = () => {
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const toggleMenu = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMenu((prev) => (prev === id ? null : id));
  };

  const handleSubjectQuiz = async (subject) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/api/quiz/generate`, {
        subject,
      });

      const { quizText } = response.data;

      if (!quizText || !Array.isArray(quizText)) {
        Alert.alert('Error', 'No quiz generated from Gemini.');
        return;
      }

      Alert.alert('✅ Success', `${subject} quiz generated!`);

      navigation.navigate('QuizScreen', {
        subject,
        quizText,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate quiz. Check your API or internet.');
      console.error('❌ Quiz API error:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSubItem = (item, parentTitle) => {
    const isAcademic = parentTitle === 'Academic Courses';

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.subMenuItem}
        onPress={() =>
          isAcademic
            ? handleSubjectQuiz(item.title)
            : Alert.alert('Coming Soon', `${item.title} quizzes not available yet`)
        }
      >
        <Icon name={item.icon} size={22} color="#EF3349" />
        <Text style={styles.subMenuText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const renderItem = ({ item }) => {
    const isGK = item.title === 'General Knowledge';
    return (
      <View style={styles.menuContainer}>
        <TouchableOpacity onPress={() => toggleMenu(item.id)}>
          <LinearGradient
            colors={isGK ? ['#A0F0DC', '#7BE7CE'] : ['#FFC1CC', '#FFB6C1']}
            style={styles.menuItem}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Icon name={item.icon} size={26} color="#EF3349" />
            <Text style={styles.menuText}>{item.title}</Text>
            <Icon
              name={expandedMenu === item.id ? 'chevron-up' : 'chevron-down'}
              size={22}
              color="#EF3349"
              style={{ marginLeft: 'auto' }}
            />
          </LinearGradient>
        </TouchableOpacity>
        {expandedMenu === item.id &&
          item.assessments.map((subItem) => renderSubItem(subItem, item.title))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        <Icon name="medal" size={28} color="#FFCF25" /> Challenge Zone
      </Text>

      {loading && (
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <ActivityIndicator size="large" color="#EF3349" />
          <Text style={{ marginTop: 10, color: '#EF3349', fontWeight: '600' }}>
            Generating Quiz...
          </Text>
        </View>
      )}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    paddingTop: 40,
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#EF3349',
  },
  menuContainer: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 4,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  menuText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 16,
    flex: 1,
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#E0F7F2',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
    paddingLeft: 24,
  },
  subMenuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
    fontWeight: '600',
  },
});

export default Assessments;