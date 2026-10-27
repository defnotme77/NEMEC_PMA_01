import { Pressable, StyleSheet, Text } from "react-native";

export default function ItemTask({ itemTask, onToggle }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: itemTask.completed }}
      onPress={() => onToggle(itemTask.id)}
      style={
        itemTask.completed ? styles.itemContainerTrue : styles.itemContainer
      }
    >
      <Text style={styles.taskText}>{itemTask.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "#ff0505",
    margin: 5,
    padding: 5,
  },
  itemContainerTrue: {
    backgroundColor: "#28c552",
    margin: 5,
    padding: 5,
  },
  taskText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
