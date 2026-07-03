import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { useAppStore } from "../../store/appStore";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function VehicleScreen() {
  const {
  dlUploaded,
  rcUploaded,
  insuranceUploaded,
  vehiclePhotoUploaded,
  setDocumentType,
} = useAppStore();

  // Dropdown States
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  // Dropdown Visibility
  const [showCity, setShowCity] = useState(false);
  const [showVehicle, setShowVehicle] = useState(false);
  const [insuranceExpiry, setInsuranceExpiry] = useState<Date | null>(null);
  const [showInsuranceDatePicker, setShowInsuranceDatePicker] = useState(false);

  // Dropdown Data
  const cities = [
    "Bangalore",
    "Mysore",
    "Hyderabad",
    "Chennai",
    "Coimbatore",
  ];

  const vehicleTypes = [
    "Truck",
    "Bike",
    "Auto",
    "Car",
  ];
  const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const days = Array.from(
  { length: 31 },
  (_, i) => String(i + 1)
);

const years = Array.from(
  { length: 11 },
  (_, i) => String(new Date().getFullYear() + i)
);

 const [fuel, setFuel] = useState("");
 const [autoCategory, setAutoCategory] = useState("");
 const [carType, setCarType] = useState("");
 const [seatCapacity, setSeatCapacity] = useState("");
 const [truckSize, setTruckSize] = useState("");
 const [bodyType, setBodyType] = useState("");
 const [showFuel, setShowFuel] = useState(false);
 const [showAutoCategory, setShowAutoCategory] = useState(false);
 const [showCarType, setShowCarType] = useState(false);
 const [showSeatCapacity, setShowSeatCapacity] = useState(false);
 const [showTruckSize, setShowTruckSize] = useState(false);
 const [showBodyType, setShowBodyType] = useState(false);
 const [customTruckSize, setCustomTruckSize] = useState("");

 const fuels = ["Petrol","Diesel","CNG","Electric"];

 const autoCategories = ["Passenger","Cargo",];

 const carTypes = ["Hatchback","Sedan","SUV",];

 const seatCapacities = ["4","5","6","7",];

 const truckSizes = [
  "7 ft (Mini truck)",
  "8 ft (Pickup truck)",
  "10 ft (Large pickup)",
  "14 ft (Light commercial truck / Eicher)",
  "17 ft (Medium truck / Eicher)",
  "19 ft (Medium truck)",
  "22 ft (Open/Closed heavy truck)",
  "24 ft (Heavy truck)",
  "32 ft Single Axle (6-wheeler truck for volume goods)",
  "32 ft Multi-Axle (10+ wheeler truck for heavy load)",
  "40 ft (Standard container trailer)",
  "Other / Custom",

 ];

 const bodyTypes = ["Open Body","Closed Body",];

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}

      <Text style={styles.header}>
        Complete Your KYC
      </Text>

      <Text style={styles.subHeader}>
        Upload your vehicle documents to
        start accepting orders.
      </Text>

      {/* STEPPER */}

      <View style={styles.stepper}>

        {/* Aadhaar */}

        <View style={styles.stepItem}>
          <View style={styles.completedCircle}>
            <Text style={styles.circleText}>✓</Text>
          </View>

          <Text style={styles.stepLabel}>
            Aadhaar
          </Text>
        </View>

        <View style={styles.line} />

        {/* Vehicle */}

        <View style={styles.stepItem}>
          <View style={styles.activeCircle}>
            <Text style={styles.circleText}>2</Text>
          </View>

          <Text style={styles.stepLabel}>
            Vehicle
          </Text>
        </View>

        <View style={styles.line} />

        {/* Selfie */}

        <View style={styles.stepItem}>
          <View style={styles.circle}>
            <Text style={styles.inactiveText}>
              3
            </Text>
          </View>

          <Text style={styles.stepLabel}>
            Selfie
          </Text>
        </View>

      </View>

      {/*  DOCUMENTS */}

      <Text style={styles.sectionTitle}>
        Vehicle Verification
      </Text>

      {/* Driving Licence */}

      <View style={styles.uploadCard}>

        <View>
          <Text style={styles.uploadTitle}>
            Driving Licence
          </Text>
        </View>

        <TouchableOpacity
         onPress={() => {            
            setDocumentType("dl");
            router.push("/kyc/camera");
          }}
          >
          <Text style={styles.uploadButton}>
            {dlUploaded
              ? "✓ Uploaded"
              : "📷 Upload"}
          </Text>
        </TouchableOpacity>

      </View>

      {/* Vehicle RC */}

      <View style={styles.uploadCard}>

        <View>
          <Text style={styles.uploadTitle}>
            Vehicle RC
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
          setDocumentType("rc");
          router.push("/kyc/camera");
          }}
          >
          <Text style={styles.uploadButton}>
            {rcUploaded
              ? "✓ Uploaded"
              : "📷 Upload"}
          </Text>
        </TouchableOpacity>

      </View>

      {/* CITY */}

      <Text style={styles.fieldTitle}>
        City
      </Text>

      <TouchableOpacity
        style={styles.selectBox}
        onPress={() =>
          setShowCity(!showCity)
        }
      >

        <Text style={styles.selectText}>
          {city || "Select City"}
        </Text>

        <Text style={styles.arrow}>
          {showCity ? "▲" : "▼"}
        </Text>

      </TouchableOpacity>

      {showCity && (

        <View style={styles.dropdown}>

          {cities.map((item) => (

            <TouchableOpacity
              key={item}
              style={styles.option}
              onPress={() => {
                setCity(item);
                setShowCity(false);
              }}
            >

              <Text style={styles.optionText}>
                {item}
              </Text>

            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* VEHICLE TYPE */}

      <Text style={styles.fieldTitle}>
        Vehicle Type
      </Text>

      <TouchableOpacity
        style={styles.selectBox}
        onPress={() =>
          setShowVehicle(!showVehicle)
        }
      >

        <Text style={styles.selectText}>
          {vehicleType || "Select Vehicle"}
        </Text>

        <Text style={styles.arrow}>
          {showVehicle ? "▲" : "▼"}
        </Text>

      </TouchableOpacity>

      {showVehicle && (

        <View style={styles.dropdown}>

          {vehicleTypes.map((item) => (

            <TouchableOpacity
              key={item}
              style={styles.option}
              onPress={() => {
                setVehicleType(item);
                setShowVehicle(false);
              }}
            >

              <Text style={styles.optionText}>
                {item}
              </Text>

            </TouchableOpacity>

          ))}

        </View>

      )}
{/*BIKE*/}

{vehicleType === "Bike" && (
  <View>

    {/* Fuel */}

    <Text style={styles.fieldTitle}>
      Fuel
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() => setShowFuel(!showFuel)}
    >
      <Text style={styles.selectText}>
        {fuel || "Select Fuel"}
      </Text>

      <Text style={styles.arrow}>
        {showFuel ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showFuel && (
      <View style={styles.dropdown}>
        {fuels.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setFuel(item);
              setShowFuel(false);
            }}
          >
            <Text style={styles.optionText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Show Vehicle Photo only after Fuel is selected */}

    {fuel && (

      <View style={styles.uploadCard}>

        <View>
          <Text style={styles.uploadTitle}>
            Vehicle Photo
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setDocumentType("vehiclePhoto");
            router.push("/kyc/camera");
          }}
        >
          <Text style={styles.uploadButton}>
            {vehiclePhotoUploaded
              ? "✓ Uploaded"
              : "📷 Upload"}
          </Text>
        </TouchableOpacity>

      </View>

    )}

  </View>
)}

{/* AUTO*/}

{vehicleType === "Auto" && (
  <View>

    {/* Passenger / Cargo */}

    <Text style={styles.fieldTitle}>
      Passenger / Cargo
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() =>
        setShowAutoCategory(!showAutoCategory)
      }
    >
      <Text style={styles.selectText}>
        {autoCategory || "Select Type"}
      </Text>

      <Text style={styles.arrow}>
        {showAutoCategory ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showAutoCategory && (
      <View style={styles.dropdown}>
        {autoCategories.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setAutoCategory(item);
              setShowAutoCategory(false);
            }}
          >
            <Text style={styles.optionText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Fuel */}

    <Text style={styles.fieldTitle}>
      Fuel
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() => setShowFuel(!showFuel)}
    >
      <Text style={styles.selectText}>
        {fuel || "Select Fuel"}
      </Text>

      <Text style={styles.arrow}>
        {showFuel ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showFuel && (
      <View style={styles.dropdown}>
        {fuels.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setFuel(item);
              setShowFuel(false);
            }}
          >
            <Text style={styles.optionText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Show Vehicle Photo only after selections */}

    {autoCategory && fuel && (

      <View style={styles.uploadCard}>

        <View>
          <Text style={styles.uploadTitle}>
            Vehicle Photo
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setDocumentType("vehiclePhoto");
            router.push("/kyc/camera");
          }}
        >
          <Text style={styles.uploadButton}>
            {vehiclePhotoUploaded
              ? "✓ Uploaded"
              : "📷 Upload"}
          </Text>
        </TouchableOpacity>

      </View>

    )}

  </View>
)}

{/*CAR ------------------------------------------------------------------------------------------------------------*/}

{vehicleType === "Car" && (
  <View>

    {/* Car Type */}

    <Text style={styles.fieldTitle}>
      Car Type
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() => setShowCarType(!showCarType)}
    >
      <Text style={styles.selectText}>
        {carType || "Select Car Type"}
      </Text>

      <Text style={styles.arrow}>
        {showCarType ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showCarType && (
      <View style={styles.dropdown}>
        {carTypes.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setCarType(item);
              setShowCarType(false);
            }}
          >
            <Text style={styles.optionText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Seat Capacity */}

    <Text style={styles.fieldTitle}>
      Seat Capacity
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() => setShowSeatCapacity(!showSeatCapacity)}
    >
      <Text style={styles.selectText}>
        {seatCapacity || "Select Seats"}
      </Text>

      <Text style={styles.arrow}>
        {showSeatCapacity ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showSeatCapacity && (
      <View style={styles.dropdown}>
        {seatCapacities.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setSeatCapacity(item);
              setShowSeatCapacity(false);
            }}
          >
            <Text style={styles.optionText}>
              {item} Seater
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Fuel */}

    <Text style={styles.fieldTitle}>
      Fuel
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() => setShowFuel(!showFuel)}
    >
      <Text style={styles.selectText}>
        {fuel || "Select Fuel"}
      </Text>

      <Text style={styles.arrow}>
        {showFuel ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showFuel && (
      <View style={styles.dropdown}>
        {fuels.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setFuel(item);
              setShowFuel(false);
            }}
          >
            <Text style={styles.optionText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Show uploads only after all selections */}

    {carType && seatCapacity && fuel && (
      <>

        <View style={styles.uploadCard}>
          <View>
            <Text style={styles.uploadTitle}>
              Insurance
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setDocumentType("insurance");
              router.push("/kyc/camera");
            }}
          >
            <Text style={styles.uploadButton}>
              {insuranceUploaded
                ? "✓ Uploaded"
                : "📷 Upload"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Insurance Expiry */}

        {insuranceUploaded && (
          <>
            <Text style={styles.fieldTitle}>
              Insurance Expiry
            </Text>

            <TouchableOpacity
              style={styles.selectBox}
              onPress={() => setShowInsuranceDatePicker(true)}
            >
              <Text style={styles.selectText}>
                {insuranceExpiry
                  ? insuranceExpiry.toLocaleDateString()
                  : "Select Expiry Date"}
              </Text>
            </TouchableOpacity>

            {showInsuranceDatePicker && (
              <DateTimePicker
                value={insuranceExpiry || new Date()}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowInsuranceDatePicker(false);

                  if (event.type === "set" && selectedDate) {
                    setInsuranceExpiry(selectedDate);
                  }
                }}
              />
            )}
          </>
        )}

        <View style={styles.uploadCard}>
          <View>
            <Text style={styles.uploadTitle}>
              Vehicle Photo
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setDocumentType("vehiclePhoto");
              router.push("/kyc/camera");
            }}
          >
            <Text style={styles.uploadButton}>
              {vehiclePhotoUploaded
                ? "✓ Uploaded"
                : "📷 Upload"}
            </Text>
          </TouchableOpacity>
        </View>

      </>
    )}

  </View>
)}


{/*TRUCK------------------------------------------------------------------------------------------------------------*/}

{vehicleType === "Truck" && (
  <View>

    {/* Truck Size */}

    <Text style={styles.fieldTitle}>
      Truck Size
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() => setShowTruckSize(!showTruckSize)}
    >
      <Text style={styles.selectText}>
        {truckSize || "Select Truck Size"}
      </Text>

      <Text style={styles.arrow}>
        {showTruckSize ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showTruckSize && (
      <View style={styles.dropdown}>
        {truckSizes.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setTruckSize(item);
              setShowTruckSize(false);
            }}
          >
            <Text style={styles.optionText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
    {truckSize === "Other / Custom" && (
  <>
    <Text style={styles.fieldTitle}>
      Enter Truck Size
    </Text>

    <TextInput
      style={styles.selectBox}
      placeholder="Enter truck size (e.g., 28 ft)"
      placeholderTextColor="#9CA3AF"
      value={customTruckSize}
      onChangeText={setCustomTruckSize}
    />
  </>
)}

    {/* Body Type */}

    <Text style={styles.fieldTitle}>
      Body Type
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() => setShowBodyType(!showBodyType)}
    >
      <Text style={styles.selectText}>
        {bodyType || "Select Body Type"}
      </Text>

      <Text style={styles.arrow}>
        {showBodyType ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showBodyType && (
      <View style={styles.dropdown}>
        {bodyTypes.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setBodyType(item);
              setShowBodyType(false);
            }}
          >
            <Text style={styles.optionText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Fuel */}

    <Text style={styles.fieldTitle}>
      Fuel
    </Text>

    <TouchableOpacity
      style={styles.selectBox}
      onPress={() => setShowFuel(!showFuel)}
    >
      <Text style={styles.selectText}>
        {fuel || "Select Fuel"}
      </Text>

      <Text style={styles.arrow}>
        {showFuel ? "▲" : "▼"}
      </Text>
    </TouchableOpacity>

    {showFuel && (
      <View style={styles.dropdown}>
        {fuels.map((item) => (
          <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
              setFuel(item);
              setShowFuel(false);
            }}
          >
            <Text style={styles.optionText}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* Show uploads only after all selections */}

    {truckSize && bodyType && fuel && (
      <>

          <View style={styles.uploadCard}>
            <View>
              <Text style={styles.uploadTitle}>
                Insurance
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setDocumentType("insurance");
                router.push("/kyc/camera");
              }}
            >
              <Text style={styles.uploadButton}>
                {insuranceUploaded
                  ? "✓ Uploaded"
                  : "📷 Upload"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Insurance Expiry */}

          {insuranceUploaded && (
            <>
              <Text style={styles.fieldTitle}>
                Insurance Expiry
              </Text>

              <TouchableOpacity
                style={styles.selectBox}
                onPress={() => setShowInsuranceDatePicker(true)}
              >
                <Text style={styles.selectText}>
                  {insuranceExpiry
                    ? insuranceExpiry.toLocaleDateString()
                    : "Select Expiry Date"}
                </Text>
              </TouchableOpacity>

              {showInsuranceDatePicker && (
                <DateTimePicker
                  value={insuranceExpiry || new Date()}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowInsuranceDatePicker(false);

                    if (event.type === "set" && selectedDate) {
                      setInsuranceExpiry(selectedDate);
                    }
                  }}
                />
              )}
            </>
          )}

        <View style={styles.uploadCard}>
          <View>
            <Text style={styles.uploadTitle}>
              Vehicle Photo
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setDocumentType("vehiclePhoto");
              router.push("/kyc/camera");
            }}
          >
            <Text style={styles.uploadButton}>
              {vehiclePhotoUploaded
                ? "✓ Uploaded"
                : "📷 Upload"}
            </Text>
          </TouchableOpacity>
        </View>

      </>
    )}

  </View>
)}

 {/* CONTINUE BUTTON*/}

{dlUploaded &&
rcUploaded &&
vehiclePhotoUploaded &&
(

<TouchableOpacity
style={styles.button}
onPress={() =>
router.replace("/kyc/selfie")
}
>

<Text style={styles.buttonText}>
Continue
</Text>
</TouchableOpacity>
)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },

// HEADER
  header: {
    fontSize: 30,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginTop: 25,
  },

  subHeader: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 35,
    lineHeight: 22,
  },

//STEPPER
  stepper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    marginBottom: 35,
  },

  stepItem: {
    alignItems: "center",
  },

  completedCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },

  activeCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FF7A00",
    justifyContent: "center",
    alignItems: "center",
  },

  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  circleText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 18,
  },

  inactiveText: {
    color: "#9CA3AF",
    fontWeight: "700",
    fontSize: 18,
  },

  line: {
    width: 60,
    height: 2,
    backgroundColor: "#E5E7EB",
    marginTop: 20,
  },

  stepLabel: {
    marginTop: 8,
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },

 //TITLES
  sectionTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },

  fieldTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
    marginTop: 18,
  },

//UPLOAD CARD
  uploadCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#ECECEC",
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },

    elevation: 2,
  },

  uploadTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#111827",
  },

  uploadSub: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },

  uploadButton: {
    color: "#FF7A00",
    fontWeight: "700",
    fontSize: 15,
  },

//DROPDOWN
  selectBox: {
    height: 56,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  selectText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },

  arrow: {
    fontSize: 15,
    color: "#6B7280",
  },

  dropdown: {
    borderWidth: 1,
    borderColor: "#ECECEC",
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    marginTop: 8,
    marginBottom: 10,
    overflow: "hidden",
  },

  option: {
    height: 50,
    justifyContent: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  optionText: {
    fontSize: 15,
    color: "#111827",
  },

// CONTINUE BUTTON
  button: {
    height: 58,
    backgroundColor: "#FF7A00",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 35,
    marginBottom: 40,

    shadowColor: "#FF7A00",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 4,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

//COMMON
  cardSpacing: {
    marginBottom: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  spaceBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 15,
  },

  required: {
    color: "#EF4444",
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.5,
  },

  successText: {
    color: "#16A34A",
    fontWeight: "600",
  },

  errorText: {
    color: "#DC2626",
    fontSize: 13,
    marginTop: 4,
  },

  placeholder: {
    color: "#9CA3AF",
  },

  inputContainer: {
    marginTop: 16,
  },

  bottomSpacing: {
    height: 30,
  },

});