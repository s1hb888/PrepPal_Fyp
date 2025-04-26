import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as ScreenOrientation from 'expo-screen-orientation';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Polygon } from 'react-native-svg';

const screenWidth = Dimensions.get('window').width;

const colorPalette = ['#EF3349', '#2BCB9A', '#FFCF25'];

const shapes = [
  { name: 'Circle', type: 'circle' },
  { name: 'Star', type: 'star' },
  { name: 'Triangle', type: 'triangle' },
  { name: 'Rectangle', type: 'rectangle' },
  { name: 'Square', type: 'square' },
  { name: 'Diamond', type: 'diamond' },
  { name: 'Pentagon', type: 'pentagon' },
  { name: 'Hexagon', type: 'hexagon' },
  { name: 'Octagon', type: 'octagon' },
];

export default function ShapeLearning({ navigation }) {
  const [selectedShape, setSelectedShape] = useState(shapes[0]);
  const [scaleAnim] = useState(new Animated.Value(0));
  const shapeSize = 140;

  useEffect(() => {
    const lockOrientation = async () => {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
    };
    lockOrientation();
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, []);

  const speak = (text) => {
    Speech.speak(` ${text}`);
  };

  const animateShape = () => {
    scaleAnim.setValue(0);
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const renderShape = (shape, color, size = shapeSize) => {
    let adjustedSize = size;

    // Reduce sizes for specific shapes
    if (['circle', 'square', 'diamond', 'octagon', 'triangle'].includes(shape.type)) {
      adjustedSize = size * 0.8;
    }

    const baseStyle = {
      width: adjustedSize,
      height: adjustedSize,
      backgroundColor: color,
      justifyContent: 'center',
      alignItems: 'center',
    };

    switch (shape.type) {
      case 'triangle':
        return (
          <View
            style={{
              width: 0,
              height: 0,
              backgroundColor: 'transparent',
              borderLeftWidth: adjustedSize / 2,
              borderRightWidth: adjustedSize / 2,
              borderBottomWidth: adjustedSize,
              borderStyle: 'solid',
              borderLeftColor: 'transparent',
              borderRightColor: 'transparent',
              borderBottomColor: color,
            }}
          />
        );
      case 'pentagon':
        return (
          <Svg width={adjustedSize} height={adjustedSize} viewBox="0 0 100 100">
            <Polygon points="50,10 90,40 73,85 27,85 10,40" fill={color} />
          </Svg>
        );
      case 'hexagon':
        return (
          <Svg width={adjustedSize} height={adjustedSize} viewBox="0 0 100 100">
            <Polygon points="50,5 95,27.5 95,72.5 50,95 5,72.5 5,27.5" fill={color} />
          </Svg>
        );
      case 'diamond':
        return (
          <Svg width={adjustedSize} height={adjustedSize} viewBox="0 0 100 100">
            <Polygon points="50,0 100,50 50,100 0,50" fill={color} />
          </Svg>
        );
      case 'octagon':
        return (
          <Svg width={adjustedSize} height={adjustedSize} viewBox="0 0 100 100">
            <Polygon points="30,0 70,0 100,30 100,70 70,100 30,100 0,70 0,30" fill={color} />
          </Svg>
        );
      case 'star':
        return (
          <Svg width={adjustedSize} height={adjustedSize} viewBox="0 0 100 100">
            <Polygon
              points="50,5 61,35 95,35 67,57 75,90 50,70 25,90 33,57 5,35 39,35"
              fill={color}
            />
          </Svg>
        );
      case 'circle':
        baseStyle.borderRadius = adjustedSize / 2;
        break;
      case 'rectangle':
        baseStyle.width = adjustedSize;
        baseStyle.height = adjustedSize * 0.5;
        break;
      case 'square':
      default:
        break;
    }

    return <View style={baseStyle} />;
  };

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack?.()}>
          <Ionicons name="arrow-back-circle" size={36} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{selectedShape.name}</Text>
        <View style={{ width: 36 }} /> {/* Balance header layout */}
      </View>

      {/* Main Body */}
      <View style={styles.landscapeBody}>
        {/* Selected Shape Display */}
        <View style={styles.selectedContainer}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            {renderShape(selectedShape, '#FFCF25', 180)}
          </Animated.View>
        </View>

        {/* Shape List Horizontal Scroll at Bottom */}
        <View style={styles.bottomScrollContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.shapeScrollHorizontal}
          >
            {shapes.map((shape, index) => (
              <TouchableOpacity
                key={index}
                style={styles.iconWrapper}
                onPress={() => {
                  setSelectedShape(shape);
                  speak(shape.name);
                  animateShape();
                }}
              >
                {renderShape(shape, colorPalette[index % colorPalette.length], 50)}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2BCB9A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingTop: StatusBar.currentHeight || 40,
  },
  headerText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  landscapeBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 185,
    marginTop: 90,
  },
  bottomScrollContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    paddingVertical: 10,
    backgroundColor: '#D1FAE5',
  },
  shapeScrollHorizontal: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  iconWrapper: {
    marginHorizontal: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2BCB9A',
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
    height: 70,
  },
});
