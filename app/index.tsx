import VisionCameraComponent from "@/component/camera";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const ParentComponent = () => {
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = (photoPath: string) => {
    console.log("Photo captured:", photoPath);
    setShowCamera(false);
  };

  const handleClose = () => {
    setShowCamera(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {showCamera ? (
        <VisionCameraComponent
          onClose={handleClose}
          onCapture={handleCapture}
        />
      ) : (
        <TouchableOpacity
          style={{ borderColor: "red", borderWidth: 1, padding: 12 }}
          onPress={() => setShowCamera(true)}
        >
          <Text>Open Camera</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default ParentComponent;
