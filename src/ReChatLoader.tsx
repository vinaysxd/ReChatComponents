import React, { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";

export default function CustomLoader({
  size = 24,
  color = "#FFD700", // gold
  borderWidth = 3,
  text = null
}) {
  const rotateValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
  const spin = () => {
    rotateValue.setValue(0);
    Animated.timing(rotateValue, {
      toValue: 1,
      duration: 2000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => spin()); // restart automatically after completion
  };

  spin(); // start the loop

  return () => rotateValue.stopAnimation(); // cleanup
}, [rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.loader,
          {
            borderWidth,
            width: size,
            height: size,
            borderColor: color, 
            transform: [{ rotate }],
          },
        ]}
      />
      {text && <Text>{text}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  loader: {
    borderRadius: 4,
  },
});
