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

// 🔥 Simulasi API
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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const pendingCount = data.filter((d) => d.status === 'pending').length;

  return (
    <View style={styles.container}>
      
      {/* 🔥 HEADER */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Kamu punya {pendingCount} donasi aktif
        </Text>
      </View>

      {/* 📊 IMPACT CARD */}
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>Makanan didonasi</Text>
        <Text style={styles.impactValue}>
          {data.length} Porsi 🍽️
        </Text>
      </View>

      {/* 📦 LIST DONASI */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            
            <View style={styles.row}>
              <Text style={styles.food}>{item.food}</Text>
              <Text style={getStatusStyle(item.status)}>
                {item.status.toUpperCase()}
              </Text>
            </View>

            {item.status === 'pending' && (
              <Text style={styles.priority}>
                Segera diambil!
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

// 🔥 STATUS STYLE
const getStatusStyle = (status: DonationStatus) => {
  switch (status) {
    case 'pending':
      return { color: '#1ABC9C', fontWeight: 'bold' as const };
    case 'taken':
      return { color: '#2ECC71', fontWeight: 'bold' as const };
    case 'expired':
      return { color: '#95A5A6', fontWeight: 'bold' as const };
    default:
      return { color: '#95A5A6' as const };
  }
};

// 🎨 STYLE
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

  // HEADER
  header: {
    marginBottom: 16,
    marginTop: 25,
  },
  greeting: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  subtitle: {
    color: '#7F8C8D',
  },

  // IMPACT CARD
  impactCard: {
    backgroundColor: '#2ECC71',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  impactTitle: {
    color: 'white',
    fontSize: 14,
  },
  impactValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // LIST CARD
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: '#2ECC71',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  food: {
    fontSize: 16,
    fontWeight: '600',
  },

  priority: {
    marginTop: 6,
    color: '#E67E22',
    fontSize: 12,
  },
});