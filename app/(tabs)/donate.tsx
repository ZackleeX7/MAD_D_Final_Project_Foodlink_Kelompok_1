import { useMutation } from "convex/react";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";

// 🔥 DATABASE FOOD CALORIES (per 100g)
const foodCaloriesMap: Record<string, number> = {
  roti: 265,
  pisang: 89,
  nasi: 130,
  ayam: 239,
  mie: 138,
  nasi_goreng: 333,
  mie_goreng: 312,
  Soto: 180,
  Gado: 250,
  Ketoprak: 280,
};

type AIResult = {
  foodName: string;
  quantity: string;
  calories: string;
  expiry: string;
  expiryHours: number;
  warning: string;
};

export default function Donate() {
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("");
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // 📷 Pick from gallery
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      const uri = result.assets[0].uri;

      setImage(uri);
      setShowImageModal(true);

      if (base64) {
        analyzeFoodImage(base64);
      }
    }
  };

  // 📸 Take photo with camera
  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Please allow access to your camera");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      const uri = result.assets[0].uri;

      setImage(uri);
      setShowImageModal(true);

      if (base64) {
        analyzeFoodImage(base64);
      }
    }
  };

  // 🤖 Analyze food image with AI
  const analyzeFoodImage = async (base64: string) => {
    try {
      setLoadingAI(true);

      const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

      if (!API_KEY) {
        throw new Error("API KEY not found");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this food image and respond with ONLY valid JSON (no markdown, no explanation):

{
  "foodName": "name of food in Indonesian",
  "quantity": "number of servings or portions (e.g., '2 porsi', '3 pcs', '1 bungkus')",
  "calories": "estimated calories per serving",
  "expiry": "how long until food goes bad",
  "expiryHours": number (hours until food expires),
  "warning": "warning message about food freshness"
}

For expiryHours, estimate based on food type:
- Fresh cooked food: 4-6 hours
- Fried foods: 6-8 hours
- Rice/noodles: 4-6 hours
- Fruits: 12-24 hours
- Vegetables: 12-24 hours
- Meat: 2-4 hours
- Fish: 2-4 hours

Respond with ONLY the JSON object.`,
                  },
                  {
                    inline_data: {
                      mime_type: "image/jpeg",
                      data: base64,
                    },
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("No response from AI");

      // Clean and parse JSON
      const cleaned = text.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        throw new Error("Invalid JSON response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Use user's manual input if available, otherwise use AI detection
      const finalFoodName = food.trim() || parsed.foodName || "Unknown Food";

      setAiResult({
        foodName: finalFoodName,
        quantity: parsed.quantity || quantity || "1 porsi",
        calories: parsed.calories || "±300 kcal",
        expiry: parsed.expiry || "4-6 jam",
        expiryHours: parsed.expiryHours || 4,
        warning: parsed.warning || "Estimasi AI - konsumsi segera",
      });

      // Auto-fill quantity if detected and user hasn't set one
      if (parsed.quantity && !quantity) {
        setQuantity(parsed.quantity);
      }
    } catch (err) {
      console.error("AI Analysis Error:", err);

      setAiResult({
        foodName: "Makanan",
        quantity: "1 porsi",
        calories: "±300 kcal",
        expiry: "4-6 jam",
        expiryHours: 4,
        warning: "AI gagal menganalisis - gunakan estimasi manual",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const addDonation = useMutation(api.donation.addDonation);

  // 🔥 RULE-BASED FALLBACK (when no image)
  const analyzeFood = async (input: string) => {
    if (input.trim().length < 3) return;

    const lower = input.toLowerCase();

    // 🟢 1. RULE BASED (PRIORITAS)
    for (const key in foodCaloriesMap) {
      if (lower.includes(key)) {
        setAiResult({
          foodName: input,
          quantity: quantity || "1 porsi",
          calories: `${foodCaloriesMap[key]} kcal`,
          expiry: "4-6 jam",
          expiryHours: 4,
          warning: "Perkiraan berdasarkan database",
        });
        return;
      }
    }

    // 🔵 2. FALLBACK KE AI
    try {
      setLoadingAI(true);

      const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

      if (!API_KEY) throw new Error("API KEY missing");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyze this food and respond with ONLY valid JSON:

{
  "foodName": "name of food",
  "quantity": "number of servings or portions",
  "calories": "estimated calories per serving",
  "expiry": "how long until food goes bad",
  "expiryHours": number,
  "warning": "warning message"
}

Food: ${input}

Respond with ONLY the JSON object.`,
                  },
                ],
              },
            ],
          }),
        },
      );

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error("Empty AI response");

      const cleaned = text.replace(/```json|```/g, "").trim();
      const match = cleaned.match(/\{[\s\S]*\}/);

      if (!match) throw new Error("Invalid JSON");

      const parsed = JSON.parse(match[0]);

      // Use user's manual input if available, otherwise use AI detection
      const finalFoodName = food.trim() || parsed.foodName || input;

      setAiResult({
        foodName: finalFoodName,
        quantity: parsed.quantity || quantity || "1 porsi",
        calories: parsed.calories || "±300 kcal",
        expiry: parsed.expiry || "4-6 jam",
        expiryHours: parsed.expiryHours || 4,
        warning: parsed.warning || "Segera konsumsi",
      });
    } catch (err) {
      console.error("AI ERROR:", err);

      setAiResult({
        foodName: input,
        quantity: quantity || "1 porsi",
        calories: "±300 kcal",
        expiry: "4-6 jam",
        expiryHours: 4,
        warning: "Perkiraan default",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!food.trim()) {
      Alert.alert("Error", "Nama makanan tidak boleh kosong");
      return;
    }

    try {
      setLoadingSubmit(true);

      // Combine food name and quantity for donation
      const donationFood = quantity ? `${food} (${quantity})` : food;

      await addDonation({
        food: donationFood,
        status: "pending",
      });

      setFood("");
      setQuantity("");
      setAiResult(null);
      setImage(null);

      Alert.alert("Berhasil", "Donasi berhasil 🎉");
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Gagal menambahkan donasi");
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Get expiry color based on hours
  const getExpiryColor = (hours: number) => {
    if (hours <= 2) return "#E74C3C"; // Red - urgent
    if (hours <= 4) return "#F39C12"; // Orange - warning
    return "#27AE60"; // Green - safe
  };

  // Get expiry text
  const getExpiryText = (hours: number) => {
    if (hours <= 2) return "Segera!";
    if (hours <= 4) return "Habis dalam beberapa jam";
    if (hours <= 12) return "Harian";
    return "Beberapa hari";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>🍱 Donasi Makanan</Text>
      <Text style={styles.subtitle}>AI bantu analisis makanan kamu</Text>

      {/* 📷 Image Buttons */}
      <View style={styles.imageButtonRow}>
        <TouchableOpacity
          style={[styles.imageButton, styles.galleryButton]}
          onPress={pickImage}
        >
          <Text style={styles.imageButtonIcon}>🖼️</Text>
          <Text style={styles.imageButtonText}>Pilih Foto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.imageButton, styles.cameraButton]}
          onPress={takePhoto}
        >
          <Text style={styles.imageButtonIcon}>📸</Text>
          <Text style={styles.imageButtonText}>Ambil Foto</Text>
        </TouchableOpacity>
      </View>

      {/* 📸 Image Preview */}
      {image && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: image }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={styles.removeImageButton}
            onPress={() => {
              setImage(null);
              setAiResult(null);
            }}
          >
            <Text style={styles.removeImageText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading Indicator */}
      {loadingAI && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#27AE60" />
          <Text style={styles.loadingText}>🤖 AI sedang menganalisis...</Text>
        </View>
      )}

      {/* AI Result Display */}
      {aiResult && !loadingAI && (
        <View style={styles.aiBox}>
          <View style={styles.aiHeader}>
            <Text style={styles.aiTitle}>🍽️ Hasil Analisis AI</Text>
          </View>

          <View style={styles.aiContent}>
            <View style={styles.aiRow}>
              <Text style={styles.aiLabel}>Makanan:</Text>
              <Text style={styles.aiValue}>{aiResult.foodName}</Text>
            </View>

            <View style={styles.aiRow}>
              <Text style={styles.aiLabel}>Jumlah:</Text>
              <Text style={styles.aiValue}>📦 {aiResult.quantity}</Text>
            </View>

            <View style={styles.aiRow}>
              <Text style={styles.aiLabel}>Kalori:</Text>
              <Text style={[styles.aiValue, styles.caloriesValue]}>
                🔥 {aiResult.calories}
              </Text>
            </View>

            <View style={styles.aiRow}>
              <Text style={styles.aiLabel}>Tahan hingga:</Text>
              <Text
                style={[
                  styles.aiValue,
                  { color: getExpiryColor(aiResult.expiryHours) },
                ]}
              >
                ⏱️ {aiResult.expiry}
              </Text>
            </View>

            <View style={styles.expiryBarContainer}>
              <View style={styles.expiryBarBg}>
                <View
                  style={[
                    styles.expiryBarFill,
                    {
                      width: `${Math.min(100, (aiResult.expiryHours / 24) * 100)}%`,
                      backgroundColor: getExpiryColor(aiResult.expiryHours),
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.expiryStatus,
                  { color: getExpiryColor(aiResult.expiryHours) },
                ]}
              >
                {getExpiryText(aiResult.expiryHours)}
              </Text>
            </View>

            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠️ {aiResult.warning}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Food Name Input */}
      <TextInput
        style={styles.input}
        placeholder="Nama makanan (contoh: Nasi goreng)"
        value={food}
        onChangeText={(text) => {
          setFood(text);
          if (!image) {
            analyzeFood(text);
          }
        }}
      />

      {/* Quantity Input */}
      <TextInput
        style={styles.input}
        placeholder="Jumlah (contoh: 2 porsi, 3 pcs, 1 bungkus)"
        value={quantity}
        onChangeText={(text) => {
          setQuantity(text);
          if (aiResult) {
            setAiResult({ ...aiResult, quantity: text });
          }
        }}
      />

      {/* Submit Button */}
      <TouchableOpacity
        style={[styles.button, loadingSubmit && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loadingSubmit}
      >
        {loadingSubmit ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>🎁 Donasikan</Text>
        )}
      </TouchableOpacity>

      {/* Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>💡 Tips</Text>
        <Text style={styles.tipsText}>
          • Ambil foto makanan untuk analisis otomatis{"\n"}• Makanan harus
          segar untuk donasi{"\n"}• Cek waktu kedaluwarsa sebelum menyumbangkan
        </Text>
      </View>
    </ScrollView>
  );
}

// 🎨 STYLE
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FBF7",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#27AE60",
    marginBottom: 4,
  },

  subtitle: {
    color: "#7F8C8D",
    marginBottom: 20,
    fontSize: 14,
  },

  imageButtonRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },

  imageButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },

  galleryButton: {
    backgroundColor: "#E8F8F5",
    borderWidth: 2,
    borderColor: "#27AE60",
  },

  cameraButton: {
    backgroundColor: "#FEF9E7",
    borderWidth: 2,
    borderColor: "#F39C12",
  },

  imageButtonIcon: {
    fontSize: 20,
  },

  imageButtonText: {
    fontWeight: "600",
    color: "#2C3E50",
  },

  imagePreviewContainer: {
    position: "relative",
    marginBottom: 16,
  },

  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },

  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  removeImageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  loadingContainer: {
    alignItems: "center",
    padding: 20,
    marginBottom: 16,
  },

  loadingText: {
    marginTop: 10,
    color: "#7F8C8D",
  },

  aiBox: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },

  aiHeader: {
    backgroundColor: "#27AE60",
    padding: 12,
  },

  aiTitle: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  aiContent: {
    padding: 16,
  },

  aiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  aiLabel: {
    color: "#7F8C8D",
    fontSize: 14,
  },

  aiValue: {
    color: "#2C3E50",
    fontWeight: "600",
    fontSize: 14,
  },

  caloriesValue: {
    color: "#E74C3C",
  },

  expiryBarContainer: {
    marginTop: 8,
    marginBottom: 12,
  },

  expiryBarBg: {
    height: 8,
    backgroundColor: "#ECF0F1",
    borderRadius: 4,
    overflow: "hidden",
  },

  expiryBarFill: {
    height: "100%",
    borderRadius: 4,
  },

  expiryStatus: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
    textAlign: "right",
  },

  warningBox: {
    backgroundColor: "#FEF9E7",
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#F39C12",
  },

  warningText: {
    color: "#D68910",
    fontSize: 13,
  },

  input: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  button: {
    backgroundColor: "#2ECC71",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonDisabled: {
    backgroundColor: "#95A5A6",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  tipsContainer: {
    marginTop: 24,
    backgroundColor: "#E8F8F5",
    padding: 16,
    borderRadius: 12,
  },

  tipsTitle: {
    fontWeight: "bold",
    color: "#27AE60",
    marginBottom: 8,
  },

  tipsText: {
    color: "#2C3E50",
    fontSize: 13,
    lineHeight: 22,
  },
});
