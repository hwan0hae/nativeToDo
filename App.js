import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Fontisto } from "@expo/vector-icons";
import { theme } from "./color";

/**
 button 3종 
 TouchableOpacity - 클라이언트가 클릭을 알수 있음 
 TouchableHighlight - 옵션이 더 많음 배경색 변겅 가능
 TouchableWithoutFeedback - UI변화가 없음 클라이언트가 클릭을 알 수 없음
 Pressable - TouchableWithoutFeedback과 비슷하지만 옵션이 더 많음 (new)

  optional - hitSlop은 클릭 범위를 설정

  TextInput

  optional - keyboardType은 번호나 이메일 등 때에따라 변경가능
           - returnKeyType은 엔터키를 변경 가능 ex)send 
           - secureTextEntry은 비밀번호 등 보이지않게 처리
           - multline 한줄이상 쓸때 텍스트처럼 글을 쓸 수 있음 ex)게시글
 */
const STORAGE_KEY = "@toDos";
const WORKING = "@working";
export default function App() {
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [editText, setEditText] = useState("");

  const [toDos, setToDos] = useState({});
  useEffect(() => {
    loadToDos();
  }, []);

  const travel = async () => {
    setWorking(false);
    saveWorking(false);
  };
  const work = async () => {
    setWorking(true);
    saveWorking(true);
  };

  const onChangeText = (payload) => setText(payload);
  const onChangeEditText = (payload) => setEditText(payload);
  const saveToDos = async (toSave) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.log(e);
    }
  };
  const saveWorking = async (title) => {
    try {
      await AsyncStorage.setItem(WORKING, String(title));
    } catch (e) {
      console.log(e);
    }
  };
  const loadToDos = async () => {
    const save = await AsyncStorage.getItem(STORAGE_KEY);
    if (save) {
      setToDos(JSON.parse(save));
    }

    const title = await AsyncStorage.getItem(WORKING);
    title === "true" ? work() : travel();
  };

  const addToDo = async () => {
    if (text === "") {
      return;
    }

    //save to do
    //assign 합친다 개념 첫번째 - target으로 새로운 오브젝트 생성 {} = toDos + 새로운 toDo
    // const NewToDos = Object.assign({}, toDos, {
    //   [Date.now()]: { text, work: working },
    // });
    const newToDos = {
      [Date.now()]: { text, working, done: false, edit: false },
      ...toDos,
    };
    setToDos(newToDos);
    await saveToDos(newToDos);
    setText("");
  };
  const deleteToDo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("Do you want to delete this To Do?");
      if (ok) {
        const newToDos = { ...toDos };
        delete newToDos[key];
        setToDos(newToDos);
        await saveToDos(newToDos);
      }
    } else {
      Alert.alert("Delete To Do", "Are you sure?", [
        { text: "Cancel" },
        {
          text: "I'm Sure",
          style: "destructive",
          onPress: async () => {
            const newToDos = { ...toDos };
            delete newToDos[key];
            setToDos(newToDos);
            await saveToDos(newToDos);
          },
        },
      ]);
    }
  };
  const editToDo = async (key) => {
    if (editText === "") {
      return;
    }
    const newToDos = { ...toDos };
    newToDos[key] = { ...newToDos[key], text: editText, edit: false };
    console.log(newToDos[key]);
    setToDos(newToDos);
    await saveToDos(newToDos);
  };
  const checkToDo = (key) => {
    Alert.alert("Are you done?", "", [
      { text: "Cancel" },
      {
        text: "I'm Done",
        style: "destructive",
        onPress: async () => {
          const newToDos = { ...toDos };
          newToDos[key] = { ...newToDos[key], done: true };
          setToDos(newToDos);
          await saveToDos(newToDos);
        },
      },
    ]);
  };
  const openEdit = async (key) => {
    const newToDos = { ...toDos };
    Object.keys(newToDos).map((key) => {
      if (newToDos[key].edit === true) {
        newToDos[key] = { ...newToDos[key], edit: false };
        console.log(newToDos[key]);
        setToDos(newToDos);
      }
    });
    setEditText("");
    newToDos[key] = { ...newToDos[key], edit: true };
    setToDos(newToDos);
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work}>
          <Text
            style={{ ...styles.btnText, color: working ? "white" : theme.gray }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel}>
          <Text
            style={{
              ...styles.btnText,
              color: !working ? "white" : theme.gray,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onSubmitEditing={addToDo}
        returnKeyType="done"
        onChangeText={onChangeText}
        value={text}
        style={styles.input}
        placeholder={working ? "Add a To Do" : "Where do you want to go?"}
      />
      {/** Object를 map하기위해 key값을array로 뽑아서 돌려서 값 참조*/}
      <ScrollView>
        {Object.keys(toDos).map((key) =>
          toDos[key].working === working ? (
            <View key={key} style={styles.toDo}>
              {toDos[key].edit ? (
                <TextInput
                  onSubmitEditing={() => editToDo(key)}
                  returnKeyType="done"
                  onChangeText={onChangeEditText}
                  value={editText}
                  style={styles.toDoInput}
                  placeholder={working ? "Edit a To Do" : "Edit a where?"}
                />
              ) : null}
              {toDos[key].done ? (
                <Text
                  style={{
                    ...styles.toDoText,
                    color: theme.gray,
                    textDecorationLine: "line-through",
                  }}
                >
                  {toDos[key].text}
                </Text>
              ) : (
                <Text style={styles.toDoText}>{toDos[key].text}</Text>
              )}
              <View style={styles.toDoCheck}>
                {toDos[key].done ? (
                  <Fontisto name="checkbox-active" size={18} color="green" />
                ) : (
                  <TouchableOpacity onPress={() => checkToDo(key)}>
                    <Fontisto
                      name="checkbox-active"
                      size={18}
                      color={theme.gray}
                    />
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={() => openEdit(key)}>
                  <Fontisto
                    name="eraser"
                    size={18}
                    color={theme.gray}
                    style={{ marginLeft: 5 }}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => deleteToDo(key)}>
                  <Fontisto
                    name="trash"
                    size={18}
                    color={theme.gray}
                    style={{ marginLeft: 5 }}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  btnText: {
    color: "white",
    fontSize: 38,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 18,
  },
  toDo: {
    backgroundColor: theme.toDoBg,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toDoText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  toDoCheck: {
    flexDirection: "row",
  },
  toDoInput: {
    backgroundColor: "white",
    paddingHorizontal: 5,
    borderRadius: 5,
    fontSize: 16,
  },
});
