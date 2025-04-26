import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import Svg, { Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import * as Speech from 'expo-speech';

const COLORS = [
  'red', 'blue', 'green', 'yellow', 'orange', 'purple',
  'pink', 'brown', 'black', 'white', 'gray', 'cyan',
  'magenta', 'lime', 'teal', 'navy', 'gold', 'silver',
  'beige', 'maroon', 'violet', 'indigo', 'turquoise', 'chocolate',
  'skyblue', 'coral', 'salmon', 'plum', 'khaki'
];

export default function Color() {
  const [selectedColor, setSelectedColor] = useState('red');

  const handleColorSelect = (color) => {
    setSelectedColor(color);
    Speech.speak(color);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>🍭 Tap a Color to Paint the Lollipop!</Text>

      {/* Color Palette */}
      <View style={styles.palette}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorBox,
              {
                backgroundColor: color,
                borderWidth: selectedColor === color ? 3 : 1,
              },
            ]}
            onPress={() => handleColorSelect(color)}
          />
        ))}
      </View>
<View style={styles.svgArea}>
        <Svg height="400" width="250" viewBox="0 0 250 400">
        
          <Defs>
            <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" style={{ stopColor: selectedColor, stopOpacity: 1 }} />
              <Stop offset="100%" style={{ stopColor: 'white', stopOpacity: 1 }} />
            </LinearGradient>
          </Defs>
          
          {/* Stick */}
          <Rect
            x="115"
            y="190"
            width="20"
            height="150"
            rx="10"
            fill="burlywood"
          />

          {/* Candy (Lollipop) */}
          <Circle
            cx="125"
            cy="100"
            r="80"
            fill="url(#grad1)" // Applying gradient color
            stroke="white"
            strokeWidth="5"
          />
        </Svg>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
  },
  heading: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  colorBox: {
    width: 40,
    height: 40,
    margin: 8,
    borderRadius: 8,
    borderColor: '#000',
  },
  svgArea: {
    alignItems: 'center',
  },
});
