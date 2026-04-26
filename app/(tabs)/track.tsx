import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ===== TYPES =====
type TrackItem = {
  id: string;
  food: string;
  status: 'created' | 'taken' | 'completed';
};

type Summary = {
  total: number;
  completed: number;
  peopleHelped: number;
};

// ===== MOCK FETCH (GANTI KE API / CONVEX NANTI) =====
const fetchTrackData = async (): Promise<{
  summary: Summary;
  timeline: TrackItem[];
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        summary: {
          total: 15,
          completed: 12,
          peopleHelped: 20,
        },
        timeline: [
          {
            id: '1',
            food: 'Nasi Goreng',
            status: 'completed',
          },
          {
            id: '2',
            food: 'Roti',
            status: 'taken',
          },
          {
            id: '3',
            food: 'Ayam Goreng',
            status: 'created',
          },
        ],
      });
    }, 1000);
  });
};

export default function Track() {
  const [data, setData] = useState<TrackItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrack();
  }, []);

  const loadTrack = async () => {
    try {
      const result = await fetchTrackData();
      setData(result.timeline);
      setSummary(result.summary);
    } catch (error) {
      console.error('Error loading track:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text>Loading impact...</Text>
      </View>
    );
  }

  // ===== SAFETY =====
  if (!summary) {
    return (
      <View style={styles.center}>
        <Text>Gagal memuat data</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 📊 SUMMARY */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Dampak Kamu</Text>
        <Text style={styles.summaryValue}>
          {summary.peopleHelped} Orang Terbantu 👥
        </Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryItem}>
            📦 {summary.total} Donasi
          </Text>
          <Text style={styles.summaryItem}>
            ✅ {summary.completed} Selesai
          </Text>
        </View>
      </View>

      {/* 📜 TIMELINE */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.timelineCard}>
            <Text style={styles.food}>{item.food}</Text>
            <Text style={getStatusText(item.status)}>
              {getStatusLabel(item.status)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

// ===== STATUS =====
const getStatusLabel = (status: string) => {
  switch (status) {
    case 'created':
      return 'Dibuat';
    case 'taken':
      return 'Diambil';
    case 'completed':
      return 'Selesai';
    default:
      return '-';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'created':
      return { color: '#1ABC9C', fontWeight: 'bold' as const };
    case 'taken':
      return { color: '#F39C12', fontWeight: 'bold' as const };
    case 'completed':
      return { color: '#2ECC71', fontWeight: 'bold' as const };
    default:
      return { color: '#95A5A6' as const };
  }
};

// ===== STYLES =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FBF7',
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // SUMMARY
  summaryCard: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    marginTop: 40,
  },

  summaryTitle: {
    color: 'white',
    fontSize: 14,
  },

  summaryValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  summaryItem: {
    color: 'white',
  },

  // TIMELINE
  timelineCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#2ECC71',
  },

  food: {
    fontSize: 16,
    fontWeight: '600',
  },
});