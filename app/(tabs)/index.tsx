import { Text, View } from "react-native";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function Index() {
  const message = useQuery(api.test.getMessage);

  console.log("DATA:", message);

  return (
    <View>
      <Text>HALO TEST</Text>
      <Text>{JSON.stringify(message)}</Text>
    </View>
  );
}