import { Pressable, StyleSheet, Text } from "react-native";

export default function ItemTask({ title }) {
  return (
    <Pressable style={styles.itemContainer}>
      <Text style={styles.taskText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#ff0505",
    margin: 5,
  },
  taskText: { color: "#ffffff", fontSize: 16, padding: 5, fontWeight: "bold" },
});
