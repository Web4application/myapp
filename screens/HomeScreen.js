import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { fetchData } from "../utils/api";

export default function HomeScreen({ navigation }) {
  const [data, setData] = useState("Loading...");

  useEffect(() => {
    fetchData("https://api.example.com/data")
      .then((res) => setData(JSON.stringify(res)))
      .catch((err) => setData("Error: " + err.message));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚀 General AI App Template</Text>
      <Text>{data}</Text>
      <Button title="Go to Settings" onPress={() => navigation.navigate("Settings")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
});
