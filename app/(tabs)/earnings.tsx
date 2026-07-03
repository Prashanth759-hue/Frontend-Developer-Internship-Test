import React, { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useAppStore } from "../../store/appStore"; //for database
import { THEMES } from "../../constants/colors";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function EarningsScreen() {
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const dummyEarnings = {
  "2025-11-14": {
    amount: "₹1,540",
    trips: "8 trips · ₹192 avg",
  },
  "2025-11-13": {
    amount: "₹920",
    trips: "5 trips · ₹184 avg",
  },
};
  const { theme,} = useAppStore(); //for database
  const colors =
    theme === "dark"
      ? THEMES.dark
      : THEMES.light;
  const styles = createStyles(colors);

  const [tab, setTab] = useState< "today" | "week" | "total" >("today");

  const earningsData: Record<
    string,
    { amount: string; trips: string }
  > = {
    "2025-11-14": {
      amount: "₹1,540",
      trips: "8 Trips",
    },
    "2025-11-15": {
      amount: "₹980",
      trips: "5 Trips",
    },
    "2025-11-16": {
      amount: "₹2,150",
      trips: "11 Trips",
    },
  };

  const dateKey = selectedDate
    .toISOString()
    .split("T")[0];

  const selectedEarnings =
    earningsData[dateKey] || {
      amount: "₹0",
      trips: "No Trips",
    };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >

        {/* Heading */}

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 20,
            marginBottom: 20,
          }}
        >
          <View>

            <TouchableOpacity
              onPress={() => router.back()}
            >
              <Text style={styles.backButton}>
                ← Back
              </Text>
            </TouchableOpacity>

            <Text style={styles.heading}>
              Earnings
            </Text>

          </View>

          <TouchableOpacity
          onPress={() =>
            setShowCalendar(true)
          }
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: colors.card,
              justifyContent: "center",
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ fontSize: 22 }}>
              📅
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              tab === "today" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setTab("today")
            }
          >
            <Text
              style={[
                styles.tabText,
                tab === "today" &&
                  styles.activeText,
              ]}
            >
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              tab === "week" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setTab("week")
            }
          >
            <Text
              style={[
                styles.tabText,
                tab === "week" &&
                  styles.activeText,
              ]}
            >
              Week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              tab === "total" &&
                styles.activeTab,
            ]}
            onPress={() =>
              setTab("total")
            }
          >
            <Text
              style={[
                styles.tabText,
                tab === "total" &&
                  styles.activeText,
              ]}
            >
              Total
            </Text>
          </TouchableOpacity>
        </View>

        {/* Earnings Card */}
        
        <View style={styles.earningsCard}>

          <Text style={styles.cardTitle}>
            Earnings
          </Text>

          <Text style={styles.amount}>
            {selectedEarnings.amount}
          </Text>

          <Text style={styles.cardSub}>
            📅 {selectedDate.toDateString()}
          </Text>

          <Text
            style={[
              styles.cardSub,
              {
                marginTop: 8,
                fontWeight: "700",
              },
            ]}
          >
            🚚 {selectedEarnings.trips}
          </Text>

        </View>

        {/* Withdraw */}

        <TouchableOpacity
          style={
            styles.withdrawCard
          }
        >
          <Text
            style={
              styles.withdrawText
            }
          >
            💳 Withdraw to Bank
          </Text>
        </TouchableOpacity>

        {/* Commission */}

        <View
          style={
            styles.commissionCard
          }
        >
          <Text
            style={
              styles.commissionText
            }
          >
            ⏰ Commission
            balance:
            {" "}
            -₹46 recovered
            from next COD
            trip.
          </Text>
        </View>

        {/* Recent */}

        <Text
          style={
            styles.recentTitle
          }
        >
          Recent
        </Text>

        <View
          style={
            styles.recentCard
          }
        >
          {[
            {
              title:
                "Parcel • Embassy Tech Village",
              time:
                "11:40 AM",
              amount:
                "+₹118",
            },
            {
              title:
                "Bike Taxi • Forum Mall",
              time:
                "10:22 AM",
              amount:
                "+₹66",
            },
            {
              title:
                "Freight • Whitefield",
              time:
                "9:05 AM",
              amount:
                "+₹240",
            },
            {
              title:
                "Bike Taxi • Indiranagar",
              time:
                "8:30 AM",
              amount:
                "+₹54",
            },
          ].map(
            (
              item,
              index
            ) => (
              <View
                key={
                  index
                }
                style={
                  styles.transaction
                }
              >
                <View
                  style={
                    styles.iconBox
                  }
                >
                  <Text
                    style={{
                      fontSize: 22,
                    }}
                  >
                    📦
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 12,
                  }}
                >
                  <Text
                    style={
                      styles.transactionTitle
                    }
                  >
                    {
                      item.title
                    }
                  </Text>

                  <Text
                    style={
                      styles.transactionTime
                    }
                  >
                    {
                      item.time
                    }
                  </Text>
                </View>

                <Text
                  style={
                    styles.transactionAmount
                  }
                >
                  {
                    item.amount
                  }
                </Text>
              </View>
            )
          )}
        </View>
      </ScrollView>
      
{showCalendar && (
  <DateTimePicker
    value={selectedDate}
    mode="date"
    display="default"
    onChange={(event, date) => {
      setShowCalendar(false);

      if (date) {
        setSelectedDate(date);
      }
    }}
  />
)}
    </SafeAreaView>
  );
}

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },

    heading: {
      fontSize: 28,
      fontWeight: "700",
      color: colors.text,
      marginTop: 20,
      marginBottom: 20,
    },

    tabContainer: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 18,
      padding: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },

    tabButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 14,
      alignItems: "center",
    },

    activeTab: {
      backgroundColor: colors.primary,
    },

    tabText: {
      fontSize: 15,
      fontWeight: "600",
      color: colors.secondaryText,
    },

    activeText: {
      color: "#FFFFFF",
    },

    earningsCard: {
      backgroundColor: colors.primary,
      borderRadius: 24,
      padding: 22,
      marginTop: 22,
    },

    cardTitle: {
      color: "#FFFFFF",
      fontSize: 16,
      fontWeight: "600",
    },

    amount: {
      fontSize: 42,
      fontWeight: "700",
      color: "#FFFFFF",
      marginTop: 16,
    },

    cardSub: {
      color: "#FFFFFF",
      fontSize: 15,
      marginTop: 16,
    },

    withdrawCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      paddingVertical: 20,
      alignItems: "center",
      marginTop: 22,
      elevation: 5,
      borderWidth: 1,
      borderColor: colors.border,
    },

    withdrawText: {
      fontSize: 18,
      fontWeight: "700",
      color: colors.text,
    },

    commissionCard: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 20,
      padding: 18,
      marginTop: 22,
    },

    commissionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 22,
    },

    recentTitle: {
      fontSize: 20,
      fontWeight: "700",
      marginTop: 30,
      color: colors.text,
    },

    recentCard: {
      backgroundColor: colors.card,
      borderRadius: 20,
      marginTop: 18,
      padding: 14,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },

    transaction: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },

    iconBox: {
      width: 55,
      height: 55,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },

    transactionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
    },

    transactionTime: {
      fontSize: 13,
      color: colors.secondaryText,
      marginTop: 4,
    },

    transactionAmount: {
      fontSize: 18,
      fontWeight: "700",
      color: "#16A34A",
    },

    topBar: {
      marginTop: 20,
      marginBottom: 20,
    },

    backButton: {
      fontSize: 18,
      color: colors.primary,
      fontWeight: "600",
      marginBottom: 15,
    },
  });