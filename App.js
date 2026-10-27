import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Button, FlatList, StyleSheet, TextInput, View } from "react-native";
import TaskItem from "./src/components/itemTask";

export default function App() {
  const [text, setText] = useState("");
  const [taskList, setTaskList] = useState([]);

  function inputHandler(text) {
    setText(text);
  }

  function addHandler() {
    const title = text.trim();

    if (!title) {
      return;
    }

    setTaskList((currentTasks) => [
      ...currentTasks,
      {
        id: `${Date.now()}-${currentTasks.length}`,
        title,
        completed: false,
      },
    ]);
    setText("");
  }

  function toggleTaskHandler(id) {
    setTaskList((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          onChangeText={inputHandler}
          style={styles.input}
          placeholder="Zadaj:"
          value={text}
        />
        <Button onPress={addHandler} title="ADD" />
      </View>
      <FlatList
        data={taskList}
        renderItem={({ item }) => (
          <TaskItem itemTask={item} onToggle={toggleTaskHandler} />
        )}
        keyExtractor={(item) => item.id}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  input: {
    borderWidth: 5,
    borderRadius: 8,
    borderColor: "red",
    width: "80%",
  },
  inputContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
});
