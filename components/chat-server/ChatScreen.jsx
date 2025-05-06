import React, { useEffect, useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import io from "socket.io-client";
import { auth } from '../firebaseConfig';

const SOCKET_SERVER_URL = "http://192.168.100.8:3001"; // Make sure this is correct

const ChatScreen = ({ route }) => {
  const { senderId, receiverId } = route.params;
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const socketRef = useRef(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      forceNew: true,
    });

    // Register user
    socketRef.current.emit("join", { userId: senderId });

    // Join room
    const roomId = [senderId, receiverId].sort().join("-");
    socketRef.current.emit("joinRoom", roomId);

    // Listen for incoming messages
    socketRef.current.on("receiveMessage", (data) => {
      console.log("Received message:", data);
      setChatMessages(prev => [
        ...prev,
        {
          ...data,
          fromSelf: data.senderId === senderId,
        }
      ]);
    });

    // Error handling
    socketRef.current.on("connect_error", (err) => {
      console.log("Socket connection error:", err);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receiveMessage");
        socketRef.current.disconnect();
      }
    };
  }, [senderId, receiverId]);

  useEffect(() => {
    if (chatMessages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }, [chatMessages]);

  const sendMessage = () => {
    if (message.trim() === "") return;

    const newMessage = {
      senderId,
      receiverId,
      message,
      timestamp: Date.now(),
    };

    socketRef.current.emit("sendMessage", newMessage);
    setChatMessages(prev => [
      ...prev,
      { ...newMessage, fromSelf: true }
    ]);
    setMessage("");
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageBubble,
        item.fromSelf ? styles.self : styles.other,
      ]}
    >
      <Text style={styles.messageText}>{item.message}</Text>
      <Text style={styles.timestamp}>
        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor="#888"
          multiline
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  messagesContainer: {
    padding: 10,
  },
  messageBubble: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 12,
  },
  self: {
    alignSelf: "flex-end",
    backgroundColor: "#FF9901",
    borderTopRightRadius: 0,
  },
  other: {
    alignSelf: "flex-start",
    backgroundColor: "#444",
    borderTopLeftRadius: 0,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  timestamp: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 10,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#222",
  },
  input: {
    flex: 1,
    color: "#fff",
    padding: 10,
    backgroundColor: "#333",
    borderRadius: 20,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#FF9901",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default ChatScreen;