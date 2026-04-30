import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type Donation = {
  _id: Id<"donations">;
  food: string;
  status: "pending" | "taken" | "expired" | "cancelled";
  expiryTime?: number;
};

export default function Dashboard() {
  const data = useQuery(api.donation.getDonations) as
    | Donation[]
    | undefined;

  const updateStatus = useMutation(api.donation.updateDonationStatus);
  const autoExpire = useMutation(api.donation.autoExpire);

  const [now, setNow] = useState(Date.now());

  // ⏱ TIMER
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔥 AUTO EXPIRE
  useEffect(() => {
    const interval = setInterval(() => {
      autoExpire();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text>Loading...</Text>
      </View>
    );
  }

  const pendingCount = data.filter(
    (d) => d.status === "pending"
  ).length;

  const getRemainingTime = (expiryTime?: number) => {
    if (!expiryTime) return "No timer";

    const diff = expiryTime - now;
    if (diff <= 0) return "Expired";

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);

    return `${h}j ${m}m`;
  };

  return (
    <View style={styles.container}>
      {/* 🔥 HEADER (UI LAMA) */}
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>
          Kamu punya {pendingCount} donasi aktif
        </Text>
      </View>

      {/* 📊 IMPACT CARD */}
      <View style={styles.impactCard}>
        <Text style={styles.impactTitle}>Total Donasi</Text>
        <Text style={styles.impactValue}>
          {data.length} Item 🍽️
        </Text>
      </View>

      {/* 📦 LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.food}>{item.food}</Text>
              <Text style={getStatusStyle(item.status)}>
                {item.status.toUpperCase()}
              </Text>
            </View>

            {/* ⏱ COUNTDOWN */}
            {item.status === "pending" && (
              <Text style={styles.timer}>
                ⏱ {getRemainingTime(item.expiryTime)}
              </Text>
            )}

            {/* PRIORITY */}
            {item.status === "pending" && (
              <Text style={styles.priority}>
                ⚠️ Segera diambil
              </Text>
            )}

            {/* BUTTON */}
            {item.status === "pending" && (
              <>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() =>
                    updateStatus({
                      id: item._id,
                      status: "taken",
                    })
                  }
                >
                  <Text style={styles.buttonText}>
                    Sudah Diambil
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() =>
                    updateStatus({
                      id: item._id,
                      status: "cancelled",
                    })
                  }
                >
                  <Text style={styles.buttonText}>
                    Batalkan
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {item.status === "taken" && (
              <Text style={styles.done}>
                ✔ Sudah tersalurkan
              </Text>
            )}

            {item.status === "cancelled" && (
              <Text style={styles.cancelled}>
                ❌ Dibatalkan
              </Text>
            )}
          </View>
        )}
      />
    </View>
  );
}

// 🎨 STATUS STYLE
const getStatusStyle = (status: string) => {
  switch (status) {
    case "pending":
      return { color: "#F39C12", fontWeight: "bold" as const };
    case "taken":
      return { color: "#2ECC71", fontWeight: "bold" as const };
    case "expired":
      return { color: "#95A5A6", fontWeight: "bold" as const };
    case "cancelled":
      return { color: "#E74C3C", fontWeight: "bold" as const };
    default:
      return { color: "#7F8C8D" };
  }
};

// 🎨 STYLE (UI LAMA DIPERTAHANKAN)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4FBF7",
    padding: 16,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    marginTop: 25,
    marginBottom: 16,
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#27AE60",
  },

  subtitle: {
    color: "#7F8C8D",
  },

  impactCard: {
    backgroundColor: "#2ECC71",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },

  impactTitle: {
    color: "white",
    fontSize: 14,
  },

  impactValue: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderLeftWidth: 5,
    borderLeftColor: "#2ECC71",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  food: {
    fontSize: 16,
    fontWeight: "600",
  },

  timer: {
    marginTop: 6,
    color: "#E67E22",
    fontSize: 12,
  },

  priority: {
    marginTop: 6,
    color: "#E67E22",
    fontSize: 12,
  },

  button: {
    backgroundColor: "#2ECC71",
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },

  cancelButton: {
    backgroundColor: "#E74C3C",
    padding: 10,
    borderRadius: 10,
    marginTop: 6,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },

  done: {
    marginTop: 8,
    color: "#27AE60",
    fontSize: 12,
  },

  cancelled: {
    marginTop: 8,
    color: "#E74C3C",
    fontSize: 12,
  },
});