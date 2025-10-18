import React, { FC } from "react";
import {
  View,
  Pressable,
  Image,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ImageSourcePropType,
  PressableStateCallbackType,
} from "react-native";
// If 'ThemedView' is a custom component, you would import it and its props
// import { ThemedView } from './path/to/ThemedView';

// --- Static data ---

// An array of all the required moon images
// We explicitly type this as an array of ImageSourcePropType
const MOON_IMAGES: ImageSourcePropType[] = [
  require("../assets/moonRatings/1.png"),
  require("../assets/moonRatings/2.png"),
  require("../assets/moonRatings/3.png"),
  require("../assets/moonRatings/4.png"),
  require("../assets/moonRatings/5.png"),
  require("../assets/moonRatings/6.png"),
  require("../assets/moonRatings/7.png"),
  require("../assets/moonRatings/8.png"),
  require("../assets/moonRatings/9.png"),
  require("../assets/moonRatings/10.png"),
];

// TypeScript infers this as number[] correctly, no explicit type needed
const RATING_VALUES = Array.from({ length: 10 }, (_, i) => i + 1);

// --- Prop Types Definition ---

/**
 * Defines the props for the MoonRatingInput component.
 */
type MoonRatingInputProps = {
  /** The currently selected rating (from 1 to 10). */
  rating: number | null;
  /** Callback when a new rating is selected. */
  onRatingChange: (rating: number) => void;
  /** Optional style to apply to the container view. */
  style?: StyleProp<ViewStyle>;
};

// --- The Component ---

export const MoonRatingInput: FC<MoonRatingInputProps> = ({
  rating,
  onRatingChange,
  style,
}) => {
  return (
    // Replace 'View' with 'ThemedView' if you are using it
    <View style={[styles.container, style]}>
      {RATING_VALUES.map((value) => {
        const idx = value - 1;
        const selected = rating != null && rating >= value;
        const exactSelected = rating === value;

        return (
          <Pressable
            key={value}
            onPress={() => onRatingChange(value)}
            accessibilityLabel={`Rate ${value} out of 10`}
            style={({ pressed }: PressableStateCallbackType) => [
              styles.pressable,
              {
                backgroundColor: pressed ? "rgba(0,0,0,0.06)" : "transparent",
              },
            ]}
          >
            <Image
              source={MOON_IMAGES[idx]}
              style={[
                styles.image,
                { opacity: selected ? 1 : 0.45 }, // Unselected moons are faded
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
};

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  pressable: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
    marginBottom: 4,
  },
  image: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
});
