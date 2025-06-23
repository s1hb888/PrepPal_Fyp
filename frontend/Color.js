import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';

import * as Speech from 'expo-speech';

const { width, height } = Dimensions.get('window');

const COLORS = [
  'red', 'green', 'black', 'white',
  'blue', 'yellow', 'orange', 'pink',
  'navy', 'brown', 'purple', 'gray'
];


export default function ColorScreen() {
  const [selectedColor, setSelectedColor] = useState('red');

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    Speech.speak(color);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Gradient Background Top */}
      <View style={styles.gradientTop} />

      {/* Heading */}
      <Text style={styles.heading}>🎨 Pick a Color & Make Your Lollipop Pop!</Text>

      {/* Lollipop */}
      <View style={styles.svgArea}>
        <Svg height="385" width="245" viewBox="0 0 250 450">

          <Defs>
            <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={selectedColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={selectedColor} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Lollipop Circle */}
          <Circle
            cx="125"
            cy="120"
            r="90"
            fill="url(#grad1)"
            stroke="black"
            strokeWidth="2"
          />

          {/* Stick */}
          <Rect
            x="112"
            y="230"
            width="26"
            height="180"
            rx="13"
            fill="burlywood"
          />
        </Svg>
      </View>

      {/* Color Palette */}
      <View style={styles.paletteContainer}>
  {/* 3 Horizontal Rows with 4 colors each */}
  {[0, 1, 2].map((rowIndex) => (
    <View key={rowIndex} style={styles.colorRow}>
      {COLORS.slice(rowIndex * 4, rowIndex * 4 + 4).map((color) => (
        <TouchableOpacity
          key={color}
          onPress={() => handleColorSelect(color)}
          style={[
            styles.colorCircle,
            {
              backgroundColor: color,
              borderWidth: selectedColor === color ? 3 : 1,
              borderColor: selectedColor === color ? '#EF3349' : '#ccc',
            },
          ]}
        />
      ))}
    </View>
  ))}
</View>


      {/* Gradient Background Bottom */}
      <View style={styles.gradientBottom} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFDF8',
  },
  heading: {
    fontSize: 26,
    textAlign: 'center',
    marginTop: 50,
    marginBottom: 22,
    fontWeight: '700',
    color: '#000',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  svgArea: {
    alignItems: 'center',
    marginTop: -20,
    marginBottom: 120,
  },
paletteContainer: {
  alignSelf: 'center',
  backgroundColor: '#FFF3F5',
  borderRadius: 25,
  paddingVertical: 20,
  paddingHorizontal: 10,
  width: width * 0.94,
  elevation: 6,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 6,
  marginBottom: 30,
  marginTop:-120,
 // ✅ ensures 3 full rows
},

colorRow: {
  flexDirection: 'row',
  justifyContent: 'center',
  marginBottom: 15,
},
  colorCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    marginHorizontal: 8,
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.2,
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
    backgroundColor: '#FFC1CC',
    opacity: 0.3,
    zIndex: -1,
  },
  gradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.18,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    backgroundColor: '#A0F0DC',
    opacity: 0.3,
    zIndex: -1,
  },
});
