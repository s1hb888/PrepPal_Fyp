import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import Ionicons from '@expo/vector-icons/Ionicons';

const { width } = Dimensions.get("window");

const numberData = [
  { numeral: 1, word: "One", object: "🦆", type: "walk" },
  { numeral: 2, word: "Two", object: "🍎", type: "fall" },
  { numeral: 3, word: "Three", object: "🚗", type: "drive" },
  { numeral: 4, word: "Four", object: "🌟", type: "twinkle" },
  { numeral: 5, word: "Five", object: "🍬", type: "bounce" },
  { numeral: 6, word: "Six", object: "⚽", type: "bounce" },
  { numeral: 7, word: "Seven", object: "🌸", type: "grow" },
  { numeral: 8, word: "Eight", object: "🎈", type: "float" },
  { numeral: 9, word: "Nine", object: "🍩", type: "rotate" },
  { numeral: 10, word: "Ten", object: "🐟", type: "swim" },
];

const CountingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentItem = numberData[currentIndex];

  const handleSpeak = (text) => {
    const Speech = require('expo-speech');
    Speech.speak(text);
  };

  const numberToWord = (num) => {
    const map = ["One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten"];
    return map[num - 1] || "";
  };

  const handleObjectTap = (index) => {
    const countNumber = index + 1;
    if (countNumber === 3) {
      handleSpeak("T H R double E 3");
    } else {
      const word = numberToWord(countNumber).toUpperCase();
      const spelledWord = word.split("").join(" ");
      handleSpeak(`${spelledWord} ${countNumber}`);
    }
  };

  const onSwipe = (event) => {
    const { translationX } = event.nativeEvent;
    if (translationX < -50 && currentIndex < numberData.length - 1) setCurrentIndex(currentIndex + 1);
    else if (translationX > 50 && currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const AnimatedObject = ({ emoji, size }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }, []);

    return (
      <Animated.Text style={[{ fontSize: size, transform: [{ scale: scaleAnim }] }]}>
        {emoji}
      </Animated.Text>
    );
  };

  const getObjectSize = (count, type) => {
    let size;
    if(count <= 2) size = 65;
    else if(count <= 4) size = 55;
    else if(count <= 6) size = 45;
    else if(count <= 8) size = 37;
    else size = 33;

    if(type === "twinkle" || type === "grow") size -= 10;
    return size;
  };

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <PanGestureHandler onEnded={onSwipe}>
        <View style={styles.container}>
          {/* Decorative Bubbles */}
          <View style={styles.bubble1} />
          <View style={styles.bubble2} />
          <View style={styles.bubble3} />
          <View style={styles.bubble4} />
          <View style={styles.bubble5} />

          <LinearGradient colors={['#FFC1CC', '#FFB6C1']} style={styles.header}>
            <Text style={styles.heading}>✨ Let's Count ✨</Text>
          </LinearGradient>

          <View style={styles.contentCard}>
            <View style={styles.numberSection}>
              <LinearGradient 
                colors={['#FFE680', '#FFD54F']} 
                style={styles.numeralCircle}
              >
                <Text style={styles.numeral}>{currentItem.numeral}</Text>
              </LinearGradient>
              <Text style={styles.word}>{currentItem.word}</Text>
            </View>

            <View style={styles.objectsContainer}>
              {Array.from({length: currentItem.numeral}).map((_,index)=>(
                <TouchableOpacity key={index} style={styles.objectWrapper} onPress={()=>handleObjectTap(index)}>
                  <View style={styles.objectBubble}>
                    <AnimatedObject emoji={currentItem.object} size={getObjectSize(currentItem.numeral, currentItem.type)} />
                  </View>
                  <View style={styles.labelCircle}>
                    <Text style={styles.label}>{index+1}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.footerRow}>
              <TouchableOpacity 
                onPress={()=>currentIndex>0 && setCurrentIndex(currentIndex-1)} 
                style={[styles.arrowButton, currentIndex === 0 && styles.disabledButton]}
                disabled={currentIndex === 0}
              >
                <Ionicons name="chevron-back" size={28} color="#000" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.speakerButton} onPress={()=>{
                if(currentItem.numeral === 3){
                  handleSpeak("T H R double E 3");
                } else {
                  const spelledWord = currentItem.word.toUpperCase().split("").join(" ");
                  handleSpeak(`${spelledWord} ${currentItem.numeral}`);
                }
              }}>
                <LinearGradient 
                  colors={['#A0F0DC', '#7BE7CE']} 
                  style={styles.speakerGradient}
                >
                  <Ionicons name="volume-high" size={28} color="#000" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={()=>currentIndex<numberData.length-1 && setCurrentIndex(currentIndex+1)} 
                style={[styles.arrowButton, currentIndex === numberData.length - 1 && styles.disabledButton]}
                disabled={currentIndex === numberData.length - 1}
              >
                <Ionicons name="chevron-forward" size={28} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#fff',
  },
  bubble1: { 
    position: 'absolute', 
    top: -30, 
    right: -30, 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: 'rgba(160, 240, 220, 0.15)' 
  },
  bubble2: { 
    position: 'absolute', 
    top: 100, 
    left: -40, 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    backgroundColor: 'rgba(255, 193, 204, 0.12)' 
  },
  bubble3: { 
    position: 'absolute', 
    bottom: 150, 
    right: 20, 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: 'rgba(255, 230, 128, 0.15)' 
  },
  bubble4: { 
    position: 'absolute', 
    bottom: 100, 
    left: 30, 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: 'rgba(160, 240, 220, 0.1)' 
  },
  bubble5: { 
    position: 'absolute', 
    top: 200, 
    right: 40, 
    width: 70, 
    height: 70, 
    borderRadius: 35, 
    backgroundColor: 'rgba(255, 193, 204, 0.08)' 
  },
  header: {
    alignItems: 'center', 
    paddingVertical: 25,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heading: {
    fontSize: 28, 
    fontWeight: 'bold', 
    color: '#000',
    textShadowColor: 'rgba(255,255,255,0.3)', 
    textShadowOffset: {width: 2, height: 2}, 
    textShadowRadius: 4
  },
  contentCard: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: -10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 15,
    paddingBottom: 25,
    elevation: 3,
  },
  numberSection: {
    alignItems: 'center', 
    marginVertical: 15
  },
  numeralCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 10,
  },
  numeral: {
    fontSize: 44, 
    fontWeight: 'bold', 
    color: '#000',
  },
  word: {
    fontSize: 24, 
    fontWeight: '700', 
    color: '#EF3349',
  },
  objectsContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    paddingHorizontal: 10,
    maxWidth: '100%',
  },
  objectWrapper: {
    alignItems: 'center', 
    justifyContent: 'center', 
    margin: 4
  },
  objectBubble: {
    backgroundColor: 'rgba(160, 240, 220, 0.15)',
    borderRadius: 50,
    padding: 6,
    minWidth: 45,
    minHeight: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelCircle: {
    backgroundColor: '#FFE680',
    borderRadius: 15,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    borderWidth: 2,
    borderColor: '#fff',
    elevation: 3,
  },
  label: {
    fontSize: 12, 
    color: '#000', 
    fontWeight: 'bold',
  },
  footerRow: {
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    width: width * 0.85, 
    alignSelf: 'center', 
    marginTop: 20,
    marginBottom: 10
  },
  speakerButton: {
    borderRadius: 50,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  speakerGradient: {
    padding: 18,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FFC1CC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.5,
  },
});

export default CountingScreen;