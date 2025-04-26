import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const features = [
  { title: 'User Registration', description: 'Allows parents to register and create a secure profile for their child.' },
  { title: 'Login', description: 'Easy access to the app through secure login for parents and children.' },
  { title: 'Learn English Alphabets', description: 'Interactive lessons to recognize and pronounce A to Z.' },
  { title: 'Learn Urdu Alphabets', description: 'Engaging learning of Urdu letters with audio support.' },
  { title: 'Learn Vowels', description: 'Introduction to English vowels with clear sounds and visuals.' },
  { title: 'Learn Shapes & Colors', description: 'Visually appealing lessons for basic shapes and colors recognition.' },
  { title: 'Fruits, Vegetables & Body Parts', description: 'Real images and voiceovers to help identify common fruits, veggies, and body parts.' },
  { title: 'Learn Islamic Studies', description: 'Basic Islamic knowledge including duas, ethics, and important concepts.' },
  { title: 'Learn Numbers & Counting', description: 'Early math skills with number recognition and counting exercises.' },
  { title: 'Animated Videos', description: 'Educational cartoons to keep learning enjoyable and fun.' },
  { title: 'Screen Time Control', description: 'Parents can manage how long their child uses the app each day.' },
  { title: 'Profile Management', description: 'Parents can update or monitor individual kid profiles.' },
  { title: 'Admin Dashboard', description: 'Control panel to manage users, content, and overall app statistics.' },
  { title: 'Progress Tracking', description: 'View detailed performance reports and learning milestones.' },
  { title: 'AI-Generated Quizzes', description: 'Smart quizzes created based on child’s learning pattern and progress.' },
  { title: 'Voice Recognition-Based Quizzes', description: 'Children can answer verbally to test pronunciation and listening skills.' },
  { title: 'Reward System', description: 'Motivational badges and stars to keep kids encouraged and focused.' },
];

const AboutUs = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* App Info */}
        <View style={styles.sectionYellow}>
          <Text style={styles.sectionTitle}>About PrepPal</Text>
          <Text style={styles.sectionText}>
            PrepPal is a preschool learning app designed to support parents in preparing their children for school admissions in an easy and organized way. It makes early education fun, interactive, and effective through structured courses, engaging content, and a rewarding learning environment. With features like progress tracking and screen-time control, PrepPal not only helps kids learn essential skills but also empowers parents to stay involved in their child's development.
          </Text>
        </View>

        {/* Features List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Features & Descriptions</Text>
          {features.map((feature, index) => (
            <View key={index}>
              <TouchableOpacity onPress={() => toggleExpand(index)}>
                <Text style={styles.featureTitle}>• {feature.title}</Text>
              </TouchableOpacity>
              {expandedIndex === index && (
                <Text style={styles.featureDesc}>{feature.description}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactRow}>
            <Ionicons name="mail-outline" size={20} color="#2BCB9A" style={styles.icon} />
            <Text style={styles.sectionText}>support@preppal.com</Text>
          </View>
          <View style={styles.contactRow}>
            <Ionicons name="call-outline" size={20} color="#2BCB9A" style={styles.icon} />
            <Text style={styles.sectionText}>+92 300 1234567</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 PrepPal. All rights reserved.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionYellow: {
    backgroundColor: '#2BCB9A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  section: {
    backgroundColor: '#F1F1F1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
    marginBottom: 6,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2BCB9A',
    marginTop: 8,
  },
  featureDesc: {
    fontSize: 15,
    color: '#000',
    marginLeft: 10,
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    marginRight: 10,
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
});

export default AboutUs;
