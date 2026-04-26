import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// ===== TYPES =====
type Stats = {
  totalDonations: number;
  delivered: number;
  peopleHelped: number;
};

type Activity = {
  id: string;
  text: string;
};

type ProfileData = {
  name: string;
  role: string;
  stats: Stats;
  badges: string[];
  activities: Activity[];
};

// ===== MOCK FETCH (GANTI KE API / CONVEX NANTI) =====
const fetchProfile = async (): Promise<ProfileData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: 'Zacklee',
        role: 'Food Donor 🌱',
        stats: {
          totalDonations: 15,
          delivered: 12,
          peopleHelped: 20,
        },
        badges: ['🥇 Food Hero', '🔥 Active Donor'],
        activities: [
          { id: '1', text: '✔ Donasi nasi goreng berhasil disalurkan' },
          { id: '2', text: '⚠️ Donasi roti hampir kadaluarsa' },
        ],
      });
    }, 800);
  });
};

export default function Profile() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const result = await fetchProfile();
      setData(result);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  // ===== SAFETY CHECK =====
  if (!data) {
    return (
      <View style={styles.center}>
        <Text>Gagal memuat profile</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      {/* 👤 HEADER */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {data.name.charAt(0)}
          </Text>
        </View>

        <Text style={styles.name}>{data.name}</Text>
        <Text style={styles.subtitle}>{data.role}</Text>
      </View>

      {/* 📊 STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {data.stats.totalDonations}
          </Text>
          <Text style={styles.statLabel}>Donasi</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {data.stats.delivered}
          </Text>
          <Text style={styles.statLabel}>Tersalurkan</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {data.stats.peopleHelped}
          </Text>
          <Text style={styles.statLabel}>Terbantu</Text>
        </View>
      </View>

      {/* 🏅 BADGES */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges</Text>

        {data.badges.map((badge, index) => (
          <View key={index} style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        ))}
      </View>

      {/* 📜 ACTIVITY */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Aktivitas</Text>

        {data.activities.map((item) => (
          <Text key={item.id} style={styles.activityItem}>
            {item.text}
          </Text>
        ))}
      </View>
    </View>
  );
}

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

  // HEADER
  header: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop:40,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2ECC71',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  avatarText: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
  },

  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#27AE60',
  },

  subtitle: {
    color: '#7F8C8D',
  },

  // STATS
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  statBox: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
    elevation: 2,
  },

  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ECC71',
  },

  statLabel: {
    color: '#7F8C8D',
  },

  // SECTION
  section: {
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  // BADGE
  badge: {
    backgroundColor: '#D5F5E3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
  },

  badgeText: {
    color: '#27AE60',
    fontWeight: '600',
  },

  // ACTIVITY
  activityItem: {
    color: '#555',
    marginBottom: 6,
  },
});