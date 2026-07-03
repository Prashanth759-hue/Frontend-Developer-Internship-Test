import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../store/appStore";
import { THEMES } from "../constants/colors";

export default function NotificationScreen() {
    const { theme, setTheme } =
    useAppStore();
  
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);
    type Notification = {
    id: number;
    title: string;
    message: string;
    time: string;
    read: boolean;
    };
    const [notifications, setNotifications] = useState<Notification[]>([]);

  // const [notifications, setNotifications] = useState([
    // {
    //   id: 1,
    //   title: "New Trip Available",
    //   message: "A new delivery request is waiting.",
    //   time: "2 min ago",
    //   read: false,
    // },
    // {
    //   id: 2,
    //   title: "KYC Approved",
    //   message: "Your documents have been verified.",
    //   time: "Today",
    //   read: false,
    // },
    // {
    //   id: 3,
    //   title: "Platform Update",
    //   message: "Vahan360 has introduced new driver rewards.",
    //   time: "Yesterday",
    //   read: true,
    // },
    // {
    //   id: 4,
    //   title: "Welcome to Vahan360",
    //   message: "Thank you for joining our platform.",
    //   time: "Yesterday",
    //   read: true,
    // },
  // ]);

  const markAsRead = (id: number) => {

    setNotifications(
      notifications.map((item) =>
        item.id === id
          ? { ...item, read: true }
          : item
      )
    );

  };

  if (notifications.length === 0) {
  return (
    <SafeAreaView style={styles.container}>

      <View style={styles.topBar}>

        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.backButton}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.heading}>
          Notifications
        </Text>

      </View>

      <View style={styles.emptyContainer}>

        <Text style={styles.emptyIcon}>
          🔔
        </Text>

        <Text style={styles.emptyTitle}>
          No notifications yet
        </Text>

        <Text style={styles.emptySub}>
          We'll notify you about new trips,
          wallet updates,
          KYC status,
          and important announcements.
        </Text>

      </View>

    </SafeAreaView>
  );
}

  return (

    <SafeAreaView style={styles.container}>

      <View style={styles.topBar}>

        <TouchableOpacity
          onPress={() => router.back()}
        >
          <Text style={styles.backButton}>
            ← Back
          </Text>
        </TouchableOpacity>

        <Text style={styles.heading}>
          Notifications
        </Text>

      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
      >

        {notifications.map((item) => (

          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              markAsRead(item.id)
            }
          >

            <View style={styles.row}>

              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      item.read
                        ? "#D1D5DB"
                        : "#FF7A00",
                  },
                ]}
              />

              <View style={{ flex: 1 }}>

                <Text style={styles.title}>
                  {item.title}
                </Text>

                <Text style={styles.message}>
                  {item.message}
                </Text>

                <Text style={styles.time}>
                  {item.time}
                </Text>

              </View>

            </View>

          </TouchableOpacity>

        ))}

      </ScrollView>

    </SafeAreaView>

  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },

    topBar: {
      marginTop: 20,
      marginBottom: 20,
    },

    backButton: {
      color: colors.primary,
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 15,
    },

    heading: {
      fontSize: 30,
      fontWeight: "700",
      color: colors.text,
    },

    card: {
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 18,
      marginBottom: 15,
      elevation: 3,
      borderWidth: 1,
      borderColor: colors.border,
    },

    row: {
      flexDirection: "row",
    },

    dot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginTop: 8,
      marginRight: 15,
    },

    title: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    message: {
      marginTop: 6,
      fontSize: 15,
      color: colors.secondaryText,
    },

    time: {
      marginTop: 10,
      fontSize: 13,
      color: colors.secondaryText,
    },

    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
    },

    emptyIcon: {
      fontSize: 70,
    },

    emptyTitle: {
      fontSize: 24,
      fontWeight: "700",
      marginTop: 20,
      color: colors.text,
    },

    emptySub: {
      fontSize: 16,
      textAlign: "center",
      color: colors.secondaryText,
      marginTop: 15,
      lineHeight: 24,
    },
  });