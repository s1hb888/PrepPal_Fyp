import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import Svg, { Circle, Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import * as Speech from "expo-speech";

const { width, height } = Dimensions.get("window");

const COLORS = [
  { name: "Red", hex: "#EF3349" },
  { name: "Green", hex: "#2BCB9A" },
  { name: "Yellow", hex: "#FFCF25" },
  { name: "Blue", hex: "#4287F5" },
  { name: "Pink", hex: "#FF77AA" },
  { name: "Purple", hex: "#8B5CF6" },
  { name: "Orange", hex: "#FF7A00" },
  { name: "Gray", hex: "#9CA3AF" },
  { name: "Brown", hex: "#8B4513" },
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#001F54" },
];

export default function ColorScreen() {
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleColorSelect = (colorObj) => {
    setSelectedColor(colorObj);
    Speech.speak(colorObj.name);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>🎨 Pick a Color & Make Your Lollipop Pop!</Text>

      {/* SVG Lollipop */}
      <View style={styles.svgArea}>
        <Svg height="385" width="245" viewBox="0 0 250 450">
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={selectedColor.hex} stopOpacity="1" />
              <Stop offset="100%" stopColor={selectedColor.hex} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Lollipop head */}
          <Circle
            cx="125"
            cy="120"
            r="90"
            fill="url(#grad)"
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
        <Text style={styles.selectedName}>{selectedColor.name}</Text>
      </View>

      {/* Palette */}
      <View style={styles.paletteContainer}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color.name}
            onPress={() => handleColorSelect(color)}
            style={[
              styles.colorCircle,
              {
                backgroundColor: color.hex,
                borderWidth: selectedColor.hex === color.hex ? 3 : 1,
                borderColor:
                  selectedColor.hex === color.hex ? "#EF3349" : "#ccc",
              },
            ]}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FFFDF8", 
    paddingTop: Platform.OS === "android" ? 50 : 0 
  },
  heading: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 0,
    marginBottom: 0,
    fontWeight: "700",
    color: "#000",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  svgArea: {
    alignItems: "center",
    marginVertical: 0, // was 20
  },
  selectedName: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: "700",
  },
  paletteContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 5,   // was 20 → reduced to lift palette up
    marginBottom: 20, // optional spacing from bottom
  },
  colorCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    margin: 8,
  },
});
