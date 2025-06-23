import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';

const features = [
  { icon: 'user-circle', title: 'User Registration', description: 'Allows parents to register and create a secure profile for their child.' },
  { icon: 'sign-in', title: 'Login', description: 'Easy access to the app through secure login for parents and children.' },
  { icon: 'font', title: 'Learn English Alphabets', description: 'Interactive lessons to recognize and pronounce A to Z.' },
  { icon: 'language', title: 'Learn Urdu Alphabets', description: 'Engaging learning of Urdu letters with audio support.' },
  { icon: 'circle-o', title: 'Learn Vowels', description: 'Introduction to English vowels with clear sounds and visuals.' },
  { icon: 'paint-brush', title: 'Learn Shapes & Colors', description: 'Visually appealing lessons for basic shapes and colors recognition.' },
  { icon: 'leaf', title: 'Fruits, Vegetables & Body Parts', description: 'Real images and voiceovers to help identify common fruits, veggies, and body parts.' },
  { icon: 'book', title: 'Learn Islamic Studies', description: 'Basic Islamic knowledge including duas, ethics, and important concepts.' },
  { icon: 'calculator', title: 'Learn Numbers & Counting', description: 'Early math skills with number recognition and counting exercises.' },
  { icon: 'video-camera', title: 'Animated Videos', description: 'Educational cartoons to keep learning enjoyable and fun.' },
  { icon: 'clock-o', title: 'Screen Time Control', description: 'Parents can manage how long their child uses the app each day.' },
  { icon: 'user', title: 'Profile Management', description: 'Parents can update or monitor individual kid profiles.' },
  { icon: 'dashboard', title: 'Admin Dashboard', description: 'Control panel to manage users, content, and overall app statistics.' },
  { icon: 'line-chart', title: 'Progress Tracking', description: 'View detailed performance reports and learning milestones.' },
  { icon: 'magic', title: 'AI-Generated Quizzes', description: 'Smart quizzes created based on child’s learning pattern and progress.' },
  { icon: 'microphone', title: 'Voice Recognition-Based Quizzes', description: 'Children can answer verbally to test pronunciation and listening skills.' },
  { icon: 'star', title: 'Reward System', description: 'Motivational badges and stars to keep kids encouraged and focused.' },
];

const AboutUs = () => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mainHeading}>About PrepPal</Text>
          <Text style={styles.subHeading}>© 2025 PrepPal. All rights reserved.</Text>
        </View>

        {/* Our Story */}
<View style={styles.infoBox}>
  <View style={styles.iconRow}>
    <FontAwesome name="heart" size={20} color="#EF3349" />
    <Text style={styles.infoTitle}>Our Story</Text>
  </View>
  <Text style={styles.infoText}>
     As software engineering students, we identified a gap in admission test preparation for kids — especially in digital learning solutions for preschoolers in our region.{"\n\n"}
    PrepPal is developed from our desire to make early education more accessible, structured, and enjoyable using technology.
  </Text>
</View>


        {/* Mission */}
        <View style={styles.infoBox}>
          <View style={styles.iconRow}>
            <FontAwesome name="bullseye" size={20} color="#EF3349" />
            <Text style={styles.infoTitle}>Our Mission</Text>
          </View>
          <Text style={styles.infoText}>
            Our mission is to prepare preschoolers for school admission tests by helping them learn basic concepts in a fun, structured, and interactive way.{"\n\n"}
    We aim to make the transition into school smooth and joyful for every child.
          </Text>
        </View>

        {/* Who It's For */}
        <View style={styles.infoBox}>
          <View style={styles.iconRow}>
            <FontAwesome name="users" size={20} color="#EF3349" />
            <Text style={styles.infoTitle}>Who It's For</Text>
          </View>
          <Text style={styles.infoText}>
            PrepPal is designed for busy parents and curious preschoolers between ages 2 to 5. Whether you're just getting started or preparing for interviews, PrepPal guides you every step of the way.
          </Text>
        </View>

        {/* How It Helps */}
        <View style={styles.infoBox}>
          <View style={styles.iconRow}>
            <FontAwesome name="check-square-o" size={20} color="#EF3349" />
            <Text style={styles.infoTitle}>How It Helps Parents</Text>
          </View>
          <Text style={styles.infoText}>
            • Get structured daily learning content.{"\n"}
            • Track progress and identify weak areas.{"\n"}
            • Manage screen time with in-app limits.{"\n"}
            • Let AI generate personalized quizzes for your child’s growth.
          </Text>
        </View>

        {/* Contact Us */}
        <View style={styles.infoBox}>
          <View style={styles.iconRow}>
            <FontAwesome name="envelope" size={20} color="#EF3349" />
            <Text style={styles.infoTitle}>Contact Us</Text>
          </View>
          <View style={styles.contactItem}>
            <FontAwesome name="envelope-o" size={18} color="#EF3349" />
            <Text style={styles.contactText}>support@preppal.com</Text>
          </View>
          <View style={styles.contactItem}>
            <FontAwesome name="phone" size={18} color="#EF3349" />
            <Text style={styles.contactText}>+92 300 1234567</Text>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.infoBox}>
          <View style={styles.iconRow}>
            <FontAwesome name="share-alt" size={20} color="#EF3349" />
            <Text style={styles.infoTitle}>Stay Connected</Text>
          </View>
          <Text style={styles.infoText}>
            Follow us on social media for parenting tips, app updates, and early learning resources.
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { fontWeight: 'bold', textAlign: 'center', color: '#EF3349' }]}>
            Ready to give your child the best start? Explore our features below.
          </Text>
        </View>

        {/* Features */}
        <Text style={styles.featuresTitle}>App Features</Text>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <TouchableOpacity
              onPress={() => toggleExpand(index)}
              style={styles.featureHeader}
            >
              <View style={styles.iconWithText}>
                <FontAwesome name={feature.icon} size={18} color="#EF3349" style={{ marginRight: 8 }} />
                <Text style={styles.featureTitle}>{feature.title}</Text>
              </View>
              <Ionicons
                name={expandedIndex === index ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#EF3349"
              />
            </TouchableOpacity>
            {expandedIndex === index && (
              <Text style={styles.featureDescription}>{feature.description}</Text>
            )}
          </View>
        ))}

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
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainHeading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#000',
  },
  subHeading: {
    fontSize: 13,
    color: '#000',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 8,
  },
  infoText: {
    fontSize: 15,
    color: '#000',
    lineHeight: 22,
    marginBottom: 6,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  contactText: {
    fontSize: 15,
    marginLeft: 10,
    color: '#000',
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 14,
  },
  featureItem: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flexShrink: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: '#000',
    marginTop: 6,
    marginLeft: 26,
    lineHeight: 20,
  },
});

export default AboutUs;
