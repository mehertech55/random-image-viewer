import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Image } from "expo-image";

const API_URL = "https://november7-730026606190.europe-west1.run.app/image";

function colorFromUrl(url: string, isDark: boolean): string {
  // Simple hash of URL -> hue
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = url.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const lightness = isDark ? 18 : 82;
  // pastel-ish but distinct per image
  return `hsl(${hue}, 60%, ${lightness}%)`;
}

export default function IndexScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState<string>(
    isDark ? "#000000" : "#f2f2f7"
  );

  const anim = useRef(new Animated.Value(0)).current;
  const prevBgColor = useRef<string>(bgColor);

  const animateBgTo = (nextColor: string) => {
    prevBgColor.current = bgColor;
    anim.setValue(0);
    setBgColor(nextColor);
    Animated.timing(anim, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false, // color interpolation needs false
    }).start();
  };

  const interpolatedBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [prevBgColor.current, bgColor],
  });

  const fetchRandomImage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(API_URL);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: { url?: string } = await res.json();
      if (!data.url) {
        throw new Error("Invalid response from /image");
      }

      setImageUrl(data.url);
    } catch (e) {
      console.error(e);
      setError("Unable to load image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomImage();
  }, []);

  const onImageLoaded = () => {
    if (!imageUrl) return;
    const dominant = colorFromUrl(imageUrl, isDark);
    animateBgTo(dominant);
  };

  const disabled = isLoading;

  return (
    <Animated.View
      style={[styles.root, { backgroundColor: interpolatedBg as any }]}
    >
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle={isDark ? "light-content" : "dark-content"}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Square image */}
          <View
            accessible
            accessibilityRole="image"
            style={styles.imageWrapper}
          >
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                contentFit="cover"
                transition={500}
                onLoadEnd={onImageLoaded}
                accessibilityLabel="Random image from Unsplash"
              />
            ) : (
              <View style={styles.placeholder}>
                <Text
                  style={[
                    styles.placeholderText,
                    { color: isDark ? "#e5e7eb" : "#4b5563" },
                  ]}
                >
                  Loading image…
                </Text>
              </View>
            )}

            {isLoading && (
              <View
                style={styles.loadingOverlay}
                accessible
                accessibilityLabel="Loading new image"
              >
                <ActivityIndicator size="large" />
              </View>
            )}
          </View>

          {error && (
            <Text
              style={[
                styles.errorText,
                { color: isDark ? "#fecaca" : "#b91c1c" },
              ]}
              accessibilityRole="alert"
            >
              {error}
            </Text>
          )}

          <TouchableOpacity
            onPress={fetchRandomImage}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel="Load another random image"
            accessibilityHint="Fetches a new random image and updates the background"
            style={[
              styles.button,
              isDark ? styles.buttonDark : styles.buttonLight,
              disabled && styles.buttonDisabled,
            ]}
          >
            <Text style={styles.buttonText}>
              {isLoading ? "Loading…" : "Another"}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  imageWrapper: {
    width: "80%",
    aspectRatio: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.08)",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  errorText: {
    marginBottom: 8,
    textAlign: "center",
    fontSize: 14,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 999,
  },
  buttonLight: {
    backgroundColor: "#111827",
  },
  buttonDark: {
    backgroundColor: "rgba(15,23,42,0.9)",
    borderWidth: 1,
    borderColor: "rgba(249,250,251,0.18)",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    color: "#f9fafb",
  },
});
