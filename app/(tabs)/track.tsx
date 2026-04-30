import { useQuery } from "convex/react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

type DonationStatus =
  | "pending"
  | "taken"
  | "expired"
  | "cancelled";

type Donation = {
  _id: Id<"donations">;
  food: string;
  status: DonationStatus;
};

export default function Track() {
  const data = useQuery(api.donation.getDonations) as
    | Donation[]
    | undefined;

  if (!data) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2ECC71" />
        <Text>Loading...</Text>
      </View>
    );
  }

  // 🔥 FILTER (CANCELLED TIDAK DIHITUNG)
  const activeDonations = data.filter(
    (d) => d.status !== "cancelled"
  );

  const total = activeDonations.length;
  const taken = activeDonations.filter(
    (d) => d.status === "taken"
  ).length;
  const pending = activeDonations.filter(
    (d) => d.status === "pending"
  ).length;
  const expired = activeDonations.filter(
    (d) => d.status === "expired"
  ).length;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <Text style={styles.title}>Tracking Donasi</Text>

      {/* 📊 STATS */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#2ECC71" }]}>
            {taken}
          </Text>
          <Text style={styles.statLabel}>Tersalurkan</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#F39C12" }]}>
            {pending}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={[styles.statValue, { color: "#E74C3C" }]}>
            {expired}
          </Text>
          <Text style={styles.statLabel}>Expired</Text>
        </View>
      </View>

      {/* 📦 LIST */}
      <FlatList
        data={data}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.row}>
              {/* 🔴 DOT STATUS */}
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: getDotColor(item.status),
                  },
                ]}
              />

              <Text style={styles.food}>{item.food}</Text>
            </View>

            <Text style={getStatusStyle(item.status)}>
              {item.status.toUpperCase()}
            </Text>

            {/* 🔴 LABEL CANCEL */}
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

// 🎨 DOT COLOR
const getDotColor = (status: DonationStatus) => {
  switch (status) {
    case "pending":
      return "#F39C12";
    case "taken":
      return "#2ECC71";
    case "expired":
      return "#95A5A6";
    case "cancelled":
      return "#E74C3C"; // 🔴 MERAH
  }
};

// 🎨 TEXT COLOR
const getStatusStyle = (status: DonationStatus) => {
  switch (status) {
    case "pending":
      return { color: "#F39C12", fontWeight: "bold" as const };
    case "taken":
      return { color: "#2ECC71", fontWeight: "bold" as const };
    case "expired":
      return { color: "#95A5A6", fontWeight: "bold" as const };
    case "cancelled":
      return { color: "#E74C3C", fontWeight: "bold" as const };
  }
};

// 🎨 STYLE
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

  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#27AE60",
    marginTop: 30,
    marginBottom: 16,
  },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  statBox: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    width: "25%",
  },

  statValue: {
    fontSize: 18,
    fontWeight: "bold",
  },

  statLabel: {
    fontSize: 12,
    color: "#7F8C8D",
  },

  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  food: {
    fontSize: 15,
    fontWeight: "600",
  },

  cancelled: {
    marginTop: 6,
    fontSize: 12,
    color: "#E74C3C",
  },
});