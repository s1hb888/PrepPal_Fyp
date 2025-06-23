import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar, // Added for status bar control
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context'; // For better safe area handling

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Courses = ({ navigation }) => {
  const animations = useRef(menuItems.map(() => new Animated.Value(1))).current;

  const handlePressIn = (index) => {
    Animated.spring(animations[index], {
      toValue: 0.96, // Slightly more pronounced press effect
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index) => {
    Animated.spring(animations[index], {
      toValue: 1,
      friction: 3, // Add friction for a smoother release
      tension: 40, // Add tension for a bouncier release
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar translucent backgroundColor="white" barStyle="dark-content" />
 {/* Professional status bar */}
      <View style={styles.container}>
        {/* Banner */}
        <LinearGradient
          colors={['#FFA07A', '#FFDEAD']}
          style={styles.bannerContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }} // Diagonal gradient for a richer look
        >
          <Image
            source={{
              uri: 'https://img.freepik.com/free-vector/group-international-children-learning_1308-27670.jpg',
            }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay}>
            <Text style={styles.bannerTitle}>Let’s Learn Together!</Text>
            <Text style={styles.bannerSubtitle}>
              Fun, colorful & interactive learning for your kid
            </Text>
          </View>
        </LinearGradient>

        {/* Section Heading with subtle bar */}
        <View style={styles.sectionHeadingContainer}>
          <Text style={styles.sectionHeading}>Explore Courses</Text>
          <View style={styles.headingUnderline} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false} // Hide scroll indicator for a cleaner look
        >
          {menuItems.map((item, index) => (
            <Animated.View key={index} style={{ transform: [{ scale: animations[index] }] }}>
              <TouchableOpacity
                onPress={() => navigation.navigate(item.screen)}
                onPressIn={() => handlePressIn(index)}
                onPressOut={() => handlePressOut(index)}
                activeOpacity={1} // Control active opacity via animation
                style={styles.cardWrapper}
              >
                <LinearGradient
                  colors={getCardGradient(index)}
                  style={styles.card}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }} // Horizontal gradient for depth
                >
                  <View style={styles.textContent}>
                    <Text style={styles.cardTitle}>{item.label}</Text>
                    <Text style={styles.cardSubtitle}>Tap to start learning</Text>
                  </View>
                  <Image source={item.image} style={styles.cardImage} />
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const menuItems = [
  { label: 'English', image: require('../assets/alphabets.png'), screen: 'EnglishAlphaBetsScreen' },
  { label: 'Urdu', image: require('../assets/urdu.png'), screen: 'Urdu' },
  { label: 'Numbers', image: require('../assets/numbers.png'), screen: 'Numbers' },
];

const getCardGradient = (index) => {
  const gradients = [
    ['#FFC1CC', '#FFB6C1'], 
    ['#A0F0DC', '#7BE7CE'], 
    ['#FFE680', '#FFD54F'], 
    ['#B0E0E6', '#87CEEB'], 

  ];
  return gradients[index % gradients.length];
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFF', // Overall background
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  bannerContainer: {
    height: SCREEN_WIDTH * 0.55,
    borderBottomLeftRadius: 40, // Increased radius for softer look
    borderBottomRightRadius: 40, // Increased radius
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 25, // More padding
    shadowColor: '#FFA07A', // Shadow for depth
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: 'cover',

  },
  bannerOverlay: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)', // More opaque white overlay
    borderRadius: 18, // Softer corners
    paddingVertical: 12, // More vertical padding
    paddingHorizontal: 25, // More horizontal padding
    width: '88%', // Slightly smaller width for better framing
    alignItems: 'center',
    shadowColor: '#000', // Subtle shadow for the overlay
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  bannerTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5, 
  },
  bannerSubtitle: {
    fontSize: 14, 
    color: '#555', 
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 20, 
  },
  sectionHeadingContainer: {
    alignItems: 'center',
    marginTop: 30, 
    marginBottom: 20, 
  },
  sectionHeading: {
    fontSize: 22, // Slightly larger
    fontWeight: '700', // Bolder
    color: '#333', // Darker for contrast
    textTransform: 'uppercase', // Professional touch
    letterSpacing: 1, // Spacing for heading
  },
  headingUnderline: {
    width: 60, // Width of the underline bar
    height: 4, // Thickness of the underline bar
    backgroundColor: '#FF6347', // A vibrant accent color (Tomato)
    borderRadius: 2, // Rounded ends for the bar
    marginTop: 8, // Space between text and bar
  },
  scrollContent: {
    paddingHorizontal: 25, // Increased horizontal padding for overall balance
    paddingBottom: 40, // More padding at the bottom
  },
  cardWrapper: {
    marginBottom: 25, // More spacing between cards
  },
  card: {
    flexDirection: 'row',
    borderRadius: 28, // More rounded corners for a friendly yet professional look
    padding: 25, // More padding inside cards
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8, // Stronger shadow for more depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2, // Increased shadow opacity
    shadowRadius: 12, // Larger shadow blur radius
    minHeight: 120, // Slightly taller cards
    borderWidth: 1, // Subtle border for definition
    borderColor: 'rgba(255, 255, 255, 0.5)', // Blended border color
  },
  cardImage: {
    width: 85, // Slightly larger images
    height: 85, // Slightly larger images
    resizeMode: 'contain',
  },
  textContent: {
    flex: 1,
    marginRight: 20, // More space between text and image
  },
  cardTitle: {
    fontSize: 24, // Larger title
    fontWeight: '700', // Bolder
    color: '#222', // Darker for better contrast
    letterSpacing: 0.3,
  },
  cardSubtitle: {
    fontSize: 15, // Slightly larger subtitle
    color: '#666', // Softer
    marginTop: 8, // More space below title
    lineHeight: 20,
  },
});

export default Courses;