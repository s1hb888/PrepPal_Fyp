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
import * as Speech from "expo-speech";
import { GestureHandlerRootView, PanGestureHandler } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";

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
    Speech.speak(text);
  };

  const numberToWord = (num) => {
    const map = ["One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten"];
    return map[num - 1] || "";
  };

  const handleObjectTap = (index) => {
    const countNumber = index + 1;
    if (countNumber === 3) {
      handleSpeak("T H R double E 3"); // Exact wording for 3
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

  const AnimatedObject = ({ type, emoji, size }) => {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      let animation;
      switch(type){
        case "walk":
        case "drive":
        case "swim":
          animation = Animated.loop(
            Animated.sequence([
              Animated.timing(anim, { toValue: 20, duration: 800, useNativeDriver: true }),
              Animated.timing(anim, { toValue: -20, duration: 800, useNativeDriver: true }),
            ])
          );
          break;
        case "fall":
        case "bounce":
        case "float":
          animation = Animated.loop(
            Animated.sequence([
              Animated.timing(anim, { toValue: -20, duration: 600, easing: Easing.linear, useNativeDriver: true }),
              Animated.timing(anim, { toValue: 0, duration: 600, easing: Easing.linear, useNativeDriver: true }),
            ])
          );
          break;
        case "twinkle":
        case "grow":
          animation = Animated.loop(
            Animated.sequence([
              Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }),
              Animated.timing(anim, { toValue: 0, duration: 500, useNativeDriver: true }),
            ])
          );
          break;
        case "rotate":
          animation = Animated.loop(
            Animated.timing(anim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
          );
          break;
      }
      animation?.start();
      return () => animation?.stop();
    }, [type]);

    let style = {};
    if (["walk","drive","swim"].includes(type)) style = { transform: [{ translateX: anim }] };
    else if (["fall","bounce","float"].includes(type)) style = { transform: [{ translateY: anim }] };
    else if (["twinkle","grow"].includes(type)) style = { transform: [{ scale: anim.interpolate({ inputRange:[0,1], outputRange:[1,1.2] }) }] }; // smaller scale
    else if (type==="rotate") style = { transform: [{ rotate: anim.interpolate({ inputRange:[0,1], outputRange:["0deg","360deg"] }) }] };

    return <Animated.Text style={[{ fontSize: size }, style]}>{emoji}</Animated.Text>;
  };

  const getObjectSize = (count, type) => {
    let size;
    if(count <= 2) size=120;
    else if(count <= 4) size=100;
    else if(count <= 6) size=80;
    else if(count <= 8) size=65;
    else size=55;

    if(type==="twinkle" || type==="grow") size -= 35; // Smaller stars/flowers
    return size;
  };

  return (
    <GestureHandlerRootView style={{flex:1}}>
      <PanGestureHandler onEnded={onSwipe}>
        <LinearGradient colors={["#E6FAF6","#CFF7EC"]} style={styles.container}>

          <View style={styles.header}>
            <Text style={styles.heading}>✨ Counting ✨</Text>
          </View>

          <View style={styles.numberSection}>
            <Text style={styles.numeral}>{currentItem.numeral}</Text>
            <Text style={styles.word}>{currentItem.word}</Text>
          </View>

          <View style={styles.objectsContainer}>
            {Array.from({length: currentItem.numeral}).map((_,index)=>(
              <TouchableOpacity key={index} style={styles.objectWrapper} onPress={()=>handleObjectTap(index)}>
                <AnimatedObject type={currentItem.type} emoji={currentItem.object} size={getObjectSize(currentItem.numeral, currentItem.type)} />
                <Text style={styles.label}>{index+1}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity onPress={()=>currentIndex>0 && setCurrentIndex(currentIndex-1)} style={styles.arrowButton}>
              <Text style={styles.arrow}>⬅</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.speakerButton} onPress={()=>{
              if(currentItem.numeral === 3){
                handleSpeak("T H R double E 3");
              } else {
                const spelledWord = currentItem.word.toUpperCase().split("").join(" ");
                handleSpeak(`${spelledWord} ${currentItem.numeral}`);
              }
            }}>
              <Text style={styles.speakerIcon}>🔊</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={()=>currentIndex<numberData.length-1 && setCurrentIndex(currentIndex+1)} style={styles.arrowButton}>
              <Text style={styles.arrow}>➡</Text>
            </TouchableOpacity>
          </View>

        </LinearGradient>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container:{flex:1, justifyContent:"space-between", paddingBottom:20},
  header:{alignItems:"center", marginTop:40},
  heading:{fontSize:34, fontWeight:"bold", color:"#FF4500", textShadowColor:"#FF4500", textShadowOffset:{width:2,height:2}, textShadowRadius:4},
  numberSection:{alignItems:"center", marginVertical:10},
  numeral:{fontSize:100, fontWeight:"bold", color:"#FFD700", textShadowColor:"#FFD700", textShadowOffset:{width:3,height:3}, textShadowRadius:6},
  word:{fontSize:32, fontWeight:"600", color:"#FF4500", textShadowColor:"#FF4500", textShadowOffset:{width:2,height:2}, textShadowRadius:4},
  objectsContainer:{flex:1, justifyContent:"center", alignItems:"center", flexDirection:"row", flexWrap:"wrap", paddingHorizontal:20},
  objectWrapper:{alignItems:"center", justifyContent:"center", margin:10},
  label:{fontSize:16, color:"#555", marginTop:5},
  footerRow:{flexDirection:"row", justifyContent:"space-around", alignItems:"center", width: width*0.8, alignSelf:"center", marginBottom:10},
  speakerButton:{backgroundColor:"#FFD700", padding:15, borderRadius:50, elevation:5},
  speakerIcon:{fontSize:24},
  arrowButton:{
    width:60,
    height:60,
    borderRadius:30,
    backgroundColor:"#FF4500",
    justifyContent:"center",
    alignItems:"center",
    elevation:5,
  },
  arrow:{fontSize:24, color:"white"},
});

export default CountingScreen;
