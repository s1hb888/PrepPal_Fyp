import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, SafeAreaView } from 'react-native';

const AboutUs = () => {
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

        {/* Features List with Descriptions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Features & Descriptions</Text>

          <Text style={styles.featureTitle}>• User Registration</Text>
          <Text style={styles.featureDesc}>Allows parents to register and create a secure profile for their child.</Text>

          <Text style={styles.featureTitle}>• Login</Text>
          <Text style={styles.featureDesc}>Easy access to the app through secure login for parents and children.</Text>

          <Text style={styles.featureTitle}>• Learn English Alphabets</Text>
          <Text style={styles.featureDesc}>Interactive lessons to recognize and pronounce A to Z.</Text>

          <Text style={styles.featureTitle}>• Learn Urdu Alphabets</Text>
          <Text style={styles.featureDesc}>Engaging learning of Urdu letters with audio support.</Text>

          <Text style={styles.featureTitle}>• Learn Vowels</Text>
          <Text style={styles.featureDesc}>Introduction to English vowels with clear sounds and visuals.</Text>

          <Text style={styles.featureTitle}>• Learn Shapes & Colors</Text>
          <Text style={styles.featureDesc}>Visually appealing lessons for basic shapes and colors recognition.</Text>

          <Text style={styles.featureTitle}>• Fruits, Vegetables & Body Parts</Text>
          <Text style={styles.featureDesc}>Real images and voiceovers to help identify common fruits, veggies, and body parts.</Text>

          <Text style={styles.featureTitle}>• Learn Islamic Studies</Text>
          <Text style={styles.featureDesc}>Basic Islamic knowledge including duas, ethics, and important concepts.</Text>

          <Text style={styles.featureTitle}>• Learn Numbers & Counting</Text>
          <Text style={styles.featureDesc}>Early math skills with number recognition and counting exercises.</Text>

          <Text style={styles.featureTitle}>• Animated Videos</Text>
          <Text style={styles.featureDesc}>Educational cartoons to keep learning enjoyable and fun.</Text>

          <Text style={styles.featureTitle}>• Screen Time Control</Text>
          <Text style={styles.featureDesc}>Parents can manage how long their child uses the app each day.</Text>

          <Text style={styles.featureTitle}>• Profile Management</Text>
          <Text style={styles.featureDesc}>Parents can update or monitor individual kid profiles.</Text>

          <Text style={styles.featureTitle}>• Admin Dashboard</Text>
          <Text style={styles.featureDesc}>Control panel to manage users, content, and overall app statistics.</Text>

          <Text style={styles.featureTitle}>• Progress Tracking</Text>
          <Text style={styles.featureDesc}>View detailed performance reports and learning milestones.</Text>

          <Text style={styles.featureTitle}>• AI-Generated Quizzes</Text>
          <Text style={styles.featureDesc}>Smart quizzes created based on child’s learning pattern and progress.</Text>

          <Text style={styles.featureTitle}>• Voice Recognition-Based Quizzes</Text>
          <Text style={styles.featureDesc}>Children can answer verbally to test pronunciation and listening skills.</Text>

          <Text style={styles.featureTitle}>• Reward System</Text>
          <Text style={styles.featureDesc}>Motivational badges and stars to keep kids encouraged and focused.</Text>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionText}>📧 Email: support@preppal.com</Text>
          <Text style={styles.sectionText}>📞 Phone: +92 300 1234567</Text>
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
  introSection: {
    backgroundColor: '#F1F1F1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  introText: {
    fontSize: 16,
    color: '#000',
    lineHeight: 22,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
  },
  sectionYellow: {
    backgroundColor: '#FFCF25',
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
    color: '#EF3349',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 6,
    lineHeight: 22,
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
