import { Stack } from "expo-router";
import { useSessionTimeout } from "../../hooks/useSessionTimeout";

export default function KycLayout() {

    console.log("KYC Layout Loaded");

    useSessionTimeout(300000);

    return (
        <Stack
            screenOptions={{
                headerShown: false,
            }}
        />
    );
}