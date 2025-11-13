# Random Image Viewer

Tiny mobile app that fetches a random image from `GET /image` and displays it
centered as a square. The background animates to match the image's dominant color.

## Tech

- React Native + Expo
- expo-image for performant remote images (with caching & transitions)
- react-native-image-colors for dominant color extraction

## Running locally

```bash
npm install
npx expo start
# then press 'i' for iOS simulator or 'a' for Android
```
