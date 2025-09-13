import React, { useCallback, useRef, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
import {
  Camera,
  useCameraDevice,
  useFrameProcessor,
} from "react-native-vision-camera";
import {
  useCameraPermission,
  useMicrophonePermission,
} from "react-native-vision-camera";

interface VisionCameraProps {
  onClose: () => void;
  onCapture: (photoPath: string) => void;
}

const VisionCameraComponent = ({ onClose, onCapture }: VisionCameraProps) => {
  const camera = useRef<Camera>(null);
  const device = useCameraDevice("back");

  const {
    hasPermission: hasCameraPermission,
    requestPermission: requestCameraPermission,
  } = useCameraPermission();
  const {
    hasPermission: hasMicrophonePermission,
    requestPermission: requestMicrophonePermission,
  } = useMicrophonePermission();

  const [isActive, setIsActive] = useState(true);
  const [flash, setFlash] = useState<"off" | "on" | "auto">("off");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  // Request permissions if not granted
  React.useEffect(() => {
    if (!hasCameraPermission) {
      requestCameraPermission();
    }
    if (!hasMicrophonePermission) {
      requestMicrophonePermission();
    }
  }, [hasCameraPermission, hasMicrophonePermission]);

  const takePhoto = useCallback(async () => {
    try {
      if (camera.current == null) throw new Error("Camera ref is null!");

      const photo = await camera.current.takePhoto({
        flash: flash,
        enableShutterSound: true,
      });

      console.log("Photo taken:", photo.path);
      setCapturedPhoto(`file://${photo.path}`);
      setIsActive(false);
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  }, [flash]);

  const retakePhoto = () => {
    setCapturedPhoto(null);
    setIsActive(true);
  };

  const confirmPhoto = () => {
    if (capturedPhoto) {
      onCapture(capturedPhoto);
      onClose();
    }
  };

  const toggleFlash = () => {
    setFlash((prev) =>
      prev === "off" ? "on" : prev === "on" ? "auto" : "off"
    );
  };

  const frameProcessor = useFrameProcessor((frame) => {
    "worklet";
  }, []);

  if (!hasCameraPermission) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white text-lg mb-4">
          Camera permission is required
        </Text>
        <TouchableOpacity
          onPress={requestCameraPermission}
          className="bg-blue-500 px-6 py-3 rounded-lg"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (capturedPhoto) {
    return (
      <View className="flex-1 bg-black">
        <Image
          source={{ uri: capturedPhoto }}
          className="flex-1"
          resizeMode="cover"
        />
        <View className="absolute bottom-12 left-4 right-4 flex-row justify-between">
          <TouchableOpacity
            onPress={retakePhoto}
            className="bg-gray-800 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={confirmPhoto}
            className="bg-blue-500 px-6 py-3 rounded-full"
          >
            <Text className="text-white font-semibold">Use Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (device == null) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <Text className="text-white">Loading camera...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Camera
        ref={camera}
        style={{ flex: 1 }}
        device={device}
        isActive={isActive}
        photo={true}
        video={false}
        frameProcessor={frameProcessor}
        enableZoomGesture={true}
      />

      <View className="absolute inset-0 justify-between">
        <View className="flex-row justify-between items-center p-4 pt-12">
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-white text-2xl">✕</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={toggleFlash} className="p-2">
            <Text className="text-white text-lg">
              Flash: {flash === "off" ? "⚫" : flash === "on" ? "🔆" : "⚡"}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-center items-center p-8">
          <TouchableOpacity
            onPress={takePhoto}
            className="w-20 h-20 rounded-full border-4 border-white bg-transparent items-center justify-center mx-8"
          >
            <View className="w-16 h-16 rounded-full bg-white" />
          </TouchableOpacity>

          <View className="w-12" />
        </View>
      </View>
    </View>
  );
};

export default VisionCameraComponent;
