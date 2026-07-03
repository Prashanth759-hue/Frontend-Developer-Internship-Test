import React, { useState } from "react";
import { router } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useAppStore } from "../../store/appStore"; //for database
import { THEMES } from "../../constants/colors";

export default function TripsScreen() {
    const { theme,} = useAppStore(); //for database
    const colors =
      theme === "dark"
        ? THEMES.dark
        : THEMES.light;
    const styles = createStyles(colors);

  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const trips = [
    {
      id: 1,
      title: "Freight • Whitefield",
      time: "Today • 9:05 AM",
      distance: "12 km",
      duration: "35 mins",
      amount: "+₹240",
      status: "Completed",
    },
    {
      id: 2,
      title: "Freight • Electronic City",
      time: "Today • 11:40 AM",
      distance: "8 km",
      duration: "22 mins",
      amount: "+₹118",
      status: "Completed",
    },
    {
      id: 3,
      title: "Freight • Forum Mall",
      time: "Yesterday • 4:20 PM",
      distance: "10 km",
      duration: "30 mins",
      amount: "-",
      status: "Cancelled",
    },
  ];

  const filteredTrips = trips.filter((trip) => {
    const matchSearch =
      trip.title
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchFilter =
      filter === "all"
        ? true
        : trip.status.toLowerCase() ===
          filter;

    return matchSearch && matchFilter;
  });

  const completedTrips =
    trips.filter(
      (t) =>
        t.status === "Completed"
    ).length;

  const cancelledTrips =
    trips.filter(
      (t) =>
        t.status === "Cancelled"
    ).length;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* Heading */}
        <View style={styles.topBar}>
  <TouchableOpacity
    onPress={() => router.back()}
  >
    <Text style={styles.backButton}>
      ← Back
    </Text>
  </TouchableOpacity>

  <Text style={styles.heading}>
    Trips
  </Text>
</View>

        {/* Search */}

        <TextInput
          placeholder="Search location..."
          placeholderTextColor="#9CA3AF"
          style={styles.search}
          value={search}
          onChangeText={setSearch}
        />

        {/* Filters */}

        <View style={styles.filterRow}>
          {[
            "all",
            "completed",
            "cancelled",
          ].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filterChip,
                filter === item &&
                  styles.activeChip,
              ]}
              onPress={() =>
                setFilter(item)
              }
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item &&
                    styles.activeText,
                ]}
              >
                {item
                  .charAt(0)
                  .toUpperCase() +
                  item.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Card */}

        <View style={styles.summaryCard}>
          <View
            style={styles.summaryBox}
          >
            <Text
              style={
                styles.summaryNumber
              }
            >
              {trips.length}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Total
            </Text>
          </View>

          <View
            style={styles.summaryBox}
          >
            <Text
              style={[
                styles.summaryNumber,
                {
                  color:
                    "#16A34A",
                },
              ]}
            >
              {completedTrips}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Completed
            </Text>
          </View>

          <View
            style={styles.summaryBox}
          >
            <Text
              style={[
                styles.summaryNumber,
                {
                  color:
                    "#DC2626",
                },
              ]}
            >
              {cancelledTrips}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Cancelled
            </Text>
          </View>
        </View>

        {/* Trips */}

        {filteredTrips.length ===
        0 ? (
          <View
            style={styles.empty}
          >
            <Text
              style={{
                fontSize: 50,
              }}
            >
              🚚
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              No Trips Found
            </Text>

            <Text
              style={
                styles.emptySub
              }
            >
              Go online to start
              receiving trips.
            </Text>
          </View>
        ) : (
          filteredTrips.map(
            (trip) => (
              <View
                key={trip.id}
                style={
                  styles.tripCard
                }
              >
                <View
                  style={
                    styles.iconBox
                  }
                >
                  <Text
                    style={{
                      fontSize: 28,
                    }}
                  >
                    🚚
                  </Text>
                </View>

                <View
                  style={{
                    flex: 1,
                    marginLeft: 15,
                  }}
                >
                  <Text
                    style={
                      styles.tripTitle
                    }
                  >
                    {
                      trip.title
                    }
                  </Text>

                  <Text
                    style={
                      styles.tripTime
                    }
                  >
                    {
                      trip.time
                    }
                  </Text>

                  <Text
                    style={
                      styles.tripInfo
                    }
                  >
                    {
                      trip.distance
                    }{" "}
                    •{" "}
                    {
                      trip.duration
                    }
                  </Text>
                </View>

                <View
                  style={{
                    alignItems:
                      "flex-end",
                  }}
                >
                  <Text
                    style={
                      styles.amount
                    }
                  >
                    {
                      trip.amount
                    }
                  </Text>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          trip.status ===
                          "Completed"
                            ? "#DCFCE7"
                            : "#FEE2E2",
                      },
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          trip.status ===
                          "Completed"
                            ? "#16A34A"
                            : "#DC2626",
                        fontWeight:
                          "600",
                      }}
                    >
                      {
                        trip.status
                      }
                    </Text>
                  </View>
                </View>
              </View>
            )
          )
        )}
      </ScrollView>
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
      marginBottom: 18,
    },

    search: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      fontSize: 14,
      color: colors.text,
    },

    filterRow: {
      flexDirection: "row",
      marginTop: 18,
      justifyContent: "space-between",
    },

    filterChip: {
      paddingVertical: 8,
      paddingHorizontal: 18,
      borderRadius: 18,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },

    activeChip: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    filterText: {
      color: colors.secondaryText,
      fontWeight: "600",
      fontSize: 14,
    },

    activeText: {
      color: "#FFFFFF",
    },

    summaryCard: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 22,
      padding: 18,
      marginTop: 18,
      justifyContent: "space-around",
      borderWidth: 1,
      borderColor: colors.border,
    },

    summaryBox: {
      alignItems: "center",
    },

    summaryNumber: {
      fontSize: 22,
      fontWeight: "700",
      color: colors.primary,
    },

    summaryLabel: {
      marginTop: 4,
      color: colors.secondaryText,
      fontSize: 13,
    },

    tripCard: {
      flexDirection: "row",
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 16,
      marginTop: 16,
      elevation: 3,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },

    iconBox: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.background,
      justifyContent: "center",
      alignItems: "center",
    },

    tripTitle: {
      fontSize: 15,
      fontWeight: "700",
      color: colors.text,
    },

    tripTime: {
      marginTop: 4,
      color: colors.secondaryText,
      fontSize: 13,
    },

    tripInfo: {
      marginTop: 4,
      color: colors.secondaryText,
      fontSize: 12,
    },

    amount: {
      color: "#16A34A",
      fontSize: 16,
      fontWeight: "700",
    },

    statusBadge: {
      marginTop: 8,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 18,
    },

    empty: {
      alignItems: "center",
      marginTop: 70,
    },

    emptyText: {
      fontSize: 18,
      fontWeight: "700",
      marginTop: 12,
      color: colors.text,
    },

    emptySub: {
      marginTop: 8,
      color: colors.secondaryText,
      textAlign: "center",
      fontSize: 14,
      lineHeight: 20,
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