import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type DonationStatus = 'pending' | 'taken' | 'expired';

type Donation = {
  id: string;
  food: string;
  status: DonationStatus;
};

// Simulasi fetch (nanti ganti API / Convex)
const fetchDonations = async (): Promise<Donation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id: '1', food: 'Nasi Goreng', status: 'pending' },
        { id: '2', food: 'Roti', status: 'taken' },
        { id: '3', food: 'Ayam Goreng', status: 'expired' },
      ]);
    }, 1000);
  });
};

export default function Dashboard() {
  const [data, setData] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const result = await fetchDonations();
      setData(result);
    } catch (error) {
      console.error('Error fetching donations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>Belum ada donasi</Text>
        <Text style={{ color: 'gray' }}>
          Mulai donasi untuk membantu sesama
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Text style={styles.info}>
        {data.filter((d) => d.status === 'pending').length} donasi aktif
      </Text>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.food}>{item.food}</Text>

            <Text style={getStatusStyle(item.status)}>
              {item.status.toUpperCase()}
            </Text>

            {item.status === 'pending' && (
              <Text style={styles.priority}>
                Segera ambil
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

// Styling status (type-safe)
const getStatusStyle = (status: DonationStatus) => {
  switch (status) {
    case 'pending':
      return { color: '#F39C12', fontWeight: 'bold' as const };
    case 'taken':
      return { color: '#2ECC71', fontWeight: 'bold' as const };
    case 'expired':
      return { color: '#E74C3C', fontWeight: 'bold' as const };
    default:
      return { color: 'gray' as const };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 30
  },
  info: {
    color: 'gray',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  food: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  priority: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});