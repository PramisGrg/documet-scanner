import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { Camera, useCameraDevice } from "react-native-vision-camera";

import * as DDN from "vision-camera-dynamsoft-document-normalizer";

export default function App() {
  const [showCamera, setShowCamera] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const camera = useRef<Camera>(null);
  const device = useCameraDevice("back");

  useEffect(() => {
    (async () => {
      const cameraPermission = await Camera.requestCameraPermission();
      if (cameraPermission !== "granted") {
        console.warn("Camera permission not granted");
      }

      // 🔑 Init Dynamsoft with your license
      await DDN.initLicense(
        "DLS2eyJoYW5kc2hha2VDb2RlIjoiMTA0NTI4OTQyLU1UQTBOVEk0T1RReUxWUnlhV0ZzVUhKdmFnIiwibWFpblNlcnZlclVSTCI6Imh0dHBzOi8vbWRscy5keW5hbXNvZnRvbmxpbmUuY29tIiwib3JnYW5pemF0aW9uSUQiOiIxMDQ1Mjg5NDIiLCJzdGFuZGJ5U2VydmVyVVJMIjoiaHR0cHM6Ly9zZGxzLmR5bmFtc29mdG9ubGluZS5jb20iLCJjaGVja0NvZGUiOjE0NDA0OTAxMTV9"
      );
    })();
  }, []);

  const takePhotoAndScan = async () => {
    if (camera.current == null) return;

    const photo = await camera.current.takePhoto();
    const filePath = "file://" + photo.path;

    try {
      // 🔍 Detect and normalize document
      const results = await DDN.detectFile(filePath);

      if (results && results.length > 0) {
        // The SDK gives you a normalized doc image
        setPhotoUri("data:image/png;base64," + results[0].imageData);
      } else {
        console.log("No document detected");
        setPhotoUri(filePath); // fallback to raw photo
      }
    } catch (err) {
      console.error("Document scan failed:", err);
      setPhotoUri(filePath);
    }

    setShowCamera(false);
  };

  if (showCamera && device != null) {
    return (
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <Camera
          ref={camera}
          style={{ flex: 1 }}
          device={device}
          isActive={true}
          photo={true}
        />
        <View
          style={{
            position: "absolute",
            bottom: 40,
            alignSelf: "center",
          }}
        >
          <TouchableOpacity
            onPress={takePhotoAndScan}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              backgroundColor: "white",
              borderWidth: 3,
              borderColor: "black",
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      {photoUri ? (
        <Image
          source={{ uri: photoUri }}
          style={{ width: 250, height: 350, marginBottom: 20 }}
          resizeMode="contain"
        />
      ) : (
        <Text>No document scanned yet</Text>
      )}

      <TouchableOpacity
        onPress={() => setShowCamera(true)}
        style={{
          backgroundColor: "blue",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderRadius: 8,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "white", fontSize: 16 }}>Scan Document</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
