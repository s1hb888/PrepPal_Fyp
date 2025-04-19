
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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const categories = [
  {
    id: '1',
    title: 'AI Generated',
    icon: 'robot',
    color: '#FFCF25',
    assessments: [
      { id: '1-1', title: 'English', icon: 'alphabet-latin' },
      { id: '1-2', title: 'Urdu', icon: 'alpha-u-box' },
      { id: '1-3', title: 'Maths', icon: 'calculator-variant' },
    ],
  },
  {
    id: '2',
    title: 'Basic Concepts',
    icon: 'book-open-page-variant',
    color: '#FFCF25',
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

  const toggleMenu = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedMenu(expandedMenu === id ? null : id);
  };

  const renderSubItem = (item) => (
    <TouchableOpacity
      key={item.id}
      style={styles.subMenuItem}
      onPress={() => alert(`${item.title} selected`)}>
      <Icon name={item.icon} size={22} color="#555" />
      <Text style={styles.subMenuText}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <View style={styles.menuContainer}>
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: item.color }]}
        onPress={() => toggleMenu(item.id)}>
        <Icon name={item.icon} size={26} color="#EF3349" />
        <Text style={styles.menuText}>{item.title}</Text>
        <Icon
          name={expandedMenu === item.id ? 'chevron-up' : 'chevron-down'}
          size={22}
          color="#EF3349"
          style={{ marginLeft: 'auto' }}
        />
      </TouchableOpacity>
      {expandedMenu === item.id && item.assessments.map(renderSubItem)}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assessments</Text>
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
    backgroundColor: '#fefefe',
  },
  title: {
    paddingTop: 40,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
    color: '#444',
  },
  menuContainer: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#fff',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  menuText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#EF3349',
  },
  subMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: '#2BCB9A',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    paddingLeft: 24,
  },
  subMenuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default Assessments;

