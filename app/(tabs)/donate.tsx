import { useMutation } from 'convex/react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { api } from '../../convex/_generated/api';

type AIResult = {
  calories: string;
  expiry: string;
  warning: string;
};

// 🔥 DATABASE SEDERHANA (BIAR KONSISTEN)
const foodCaloriesMap: Record<string, number> = {
  roti: 265,
  pisang: 89,
  nasi: 130,
  ayam: 239,
  mie: 138,
};

export default function Donate() {
  const [food, setFood] = useState('');
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);

  const addDonation = useMutation(api.donation.addDonation); 
  // ⚠️ kalau file kamu "donations.ts" → ganti ke api.donations.addDonation

  // 🔥 SATU FUNGSI AI + RULE
  const analyzeFood = async (input: string) => {
    if (input.trim().length < 3) return;

    const lower = input.toLowerCase();

    // 🟢 1. RULE BASED (PRIORITAS)
    for (const key in foodCaloriesMap) {
      if (lower.includes(key)) {
        setAiResult({
          calories: `${foodCaloriesMap[key]} kcal`,
          expiry: '4-6 jam',
          warning: 'Perkiraan berdasarkan database',
        });
        return;
      }
    }

    // 🔵 2. FALLBACK KE AI
    try {
      setLoadingAI(true);

      const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

      if (!API_KEY) throw new Error('API KEY missing');

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Balas HANYA JSON:
{"calories":"...","expiry":"...","warning":"..."}
Makanan: ${input}`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      const text =
        data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) throw new Error('Empty AI response');

      const cleaned = text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      let parsed;

      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('Invalid JSON');

        parsed = JSON.parse(match[0]);
      }

      setAiResult({
        calories: parsed.calories || '±300 kcal',
        expiry: parsed.expiry || '4-6 jam',
        warning: parsed.warning || 'Segera konsumsi',
      });

    } catch (err) {
      console.error('AI ERROR:', err);

      // 🔥 fallback kalau AI gagal
      setAiResult({
        calories: '±300 kcal',
        expiry: '4-6 jam',
        warning: 'Perkiraan default',
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async () => {
    if (!food.trim()) {
      Alert.alert('Error', 'Nama makanan tidak boleh kosong');
      return;
    }

    try {
      setLoadingSubmit(true);

      await addDonation({
        food,
        status: 'pending',
      });

      setFood('');
      setAiResult(null);

      Alert.alert('Berhasil', 'Donasi berhasil 🎉');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Gagal menambahkan donasi');
    } finally {
      setLoadingSubmit(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Donasi Makanan</Text>
      <Text style={styles.subtitle}>
        AI bantu analisis makanan kamu
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Contoh: Nasi goreng, 2 porsi"
        value={food}
        onChangeText={(text) => {
          setFood(text);
          analyzeFood(text);
        }}
      />

      {loadingAI && (
        <ActivityIndicator style={{ marginBottom: 10 }} />
      )}

      {aiResult && (
        <View style={styles.aiBox}>
          <Text style={styles.aiText}>
            🍽 Kalori: {aiResult.calories}
          </Text>
          <Text style={styles.aiText}>
            ⏳ Tahan: {aiResult.expiry}
          </Text>
          <Text style={styles.aiWarning}>
            ⚠️ {aiResult.warning}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={handleSubmit}
        disabled={loadingSubmit}
      >
        {loadingSubmit ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>Donasikan</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

// 🎨 STYLE
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
    padding: 16,
    justifyContent: 'center',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27AE60',
    marginBottom: 4,
  },

  subtitle: {
    color: '#7F8C8D',
    marginBottom: 20,
  },

  input: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },

  aiBox: {
    backgroundColor: '#D5F5E3',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  aiText: {
    color: '#27AE60',
    fontWeight: '600',
  },

  aiWarning: {
    color: '#E67E22',
    fontSize: 12,
    marginTop: 4,
  },

  button: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },

  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});