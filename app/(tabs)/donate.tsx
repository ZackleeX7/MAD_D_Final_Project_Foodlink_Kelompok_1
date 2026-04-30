import { useMutation } from "convex/react";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";

/* =========================
   🔥 LOCAL DICTIONARY
========================= */
const foodMap: Record<string, string> = {
  "nasi goreng": "fried rice",
  nasi: "white rice",
  ayam: "chicken",
  "ayam goreng": "fried chicken",
  mie: "noodles",
  roti: "bread",
  pisang: "banana",
  burger: "beef burger",
};

/* =========================
   🔥 CACHE (ANTI BOROS API)
========================= */
const nutritionCache: Record<string, any> = {};

/* =========================
   🔥 NORMALIZE + TRANSLATE
========================= */
const normalizeAndTranslate = (input: string) => {
  const lower = input.toLowerCase();

  // 1. exact match dulu
  if (foodMap[lower]) return foodMap[lower];

  // 2. partial match
  for (const key in foodMap) {
    if (lower.includes(key)) {
      return foodMap[key];
    }
  }

  // 3. fallback: return original
  return input;
};

/* =========================
   🔥 CLEAN TEXT (AI RESULT)
========================= */
const cleanAIText = (text: string) => {
  return text
    .replace(/[^a-zA-Z\s]/g, "")
    .trim()
    .toLowerCase();
};

/* =========================
   🔥 EDAMAM FETCH
========================= */
const fetchNutrition = async (query: string) => {
  if (nutritionCache[query]) {
    console.log("⚡ CACHE HIT:", query);
    return nutritionCache[query];
  }

  try {
    const APP_ID = process.env.EXPO_PUBLIC_EDAMAM_APP_ID;
    const APP_KEY = process.env.EXPO_PUBLIC_EDAMAM_APP_KEY;

    const res = await fetch(
      `https://api.edamam.com/api/nutrition-data?app_id=${APP_ID}&app_key=${APP_KEY}&ingr=${encodeURIComponent(
        query
      )}`
    );

    const data = await res.json();

    console.log("🍎 EDAMAM:", data);

    if (!data?.calories || !data?.totalNutrients) {
      return null;
    }

    const result = {
      calories: data.calories,
      protein: data.totalNutrients?.PROCNT?.quantity,
      fat: data.totalNutrients?.FAT?.quantity,
      carbs: data.totalNutrients?.CHOCDF?.quantity,
    };

    nutritionCache[query] = result;

    return result;
  } catch (err) {
    console.log("❌ Edamam error:", err);
    return null;
  }
};

/* =========================
   🔥 GEMINI FALLBACK
========================= */
const callGemini = async (input: string) => {
  try {
    const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!API_KEY) return input;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Convert this food to simple English food name: ${input}. Answer ONLY food name.`,
                },
              ],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    return cleanAIText(text || input);
  } catch {
    return input;
  }
};

/* =========================
   🔥 MAIN COMPONENT
========================= */
export default function Donate() {
  const [food, setFood] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addDonation = useMutation(api.donation.addDonation);

  const analyzeFood = async (input: string) => {
    if (input.length < 3) return;

    setLoading(true);

    try {
      // 1. Normalize
      let clean = normalizeAndTranslate(input);

      // 2. Gemini fallback kalau belum bagus
      if (clean === input) {
        clean = await callGemini(input);
      }

      console.log("🧠 FINAL FOOD:", clean);

      // 3. Format query (tanpa 'serving')
      let query = `${quantity || 1} ${clean}`;

      let nutrition = await fetchNutrition(query);

      // 4. Retry kalau gagal
      if (!nutrition) {
        console.log("🔁 RETRY...");
        query = clean;
        nutrition = await fetchNutrition(query);
      }

      setResult({
        foodName: input,
        calories: `${nutrition?.calories || 300} kcal`,
        protein: `${nutrition?.protein?.toFixed(1) || 0} g`,
        fat: `${nutrition?.fat?.toFixed(1) || 0} g`,
        carbs: `${nutrition?.carbs?.toFixed(1) || 0} g`,
      });
    } catch (err) {
      console.log("❌ ERROR:", err);

      setResult({
        foodName: input,
        calories: "±300 kcal",
        protein: "0 g",
        fat: "0 g",
        carbs: "0 g",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!food) {
      Alert.alert("Error", "Isi makanan dulu");
      return;
    }

    try {
      await addDonation({
        food: `${food} (${quantity})`,
        status: "pending",
        expiryHours: 6,
      });

      Alert.alert("Success", "Donasi berhasil");
      setFood("");
      setQuantity("1");
      setResult(null);
    } catch {
      Alert.alert("Error", "Gagal");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🍱 Donasi AI + Gizi</Text>

      <TextInput
        style={styles.input}
        placeholder="Nama makanan"
        value={food}
        onChangeText={(text) => {
          setFood(text);
          analyzeFood(text);
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Jumlah"
        value={quantity}
        onChangeText={(text) => {
          setQuantity(text);
          if (food) analyzeFood(food);
        }}
      />

      {loading && <ActivityIndicator />}

      {result && (
        <View style={styles.box}>
          <Text>🍽 {result.foodName}</Text>
          <Text>🔥 {result.calories}</Text>
          <Text>🥩 Protein: {result.protein}</Text>
          <Text>🧈 Lemak: {result.fat}</Text>
          <Text>🍞 Karbo: {result.carbs}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.btn} onPress={handleSubmit}>
        <Text style={styles.btnText}>Donasi</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

/* =========================
   🎨 STYLE
========================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F4FBF7" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 30,
    color: "#27AE60",
  },
  input: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  box: {
    backgroundColor: "#E8F8F5",
    padding: 12,
    marginTop: 10,
    borderRadius: 10,
  },
  btn: {
    backgroundColor: "#2ECC71",
    padding: 14,
    marginTop: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold" },
});