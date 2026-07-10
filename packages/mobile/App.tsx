import React, { useState, useEffect, createContext, useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthScreen } from "./src/screens/AuthScreen";
import { DriverHomeScreen } from "./src/screens/DriverHomeScreen";
import { DeliveryScreen } from "./src/screens/DeliveryScreen";
import { RouteMapScreen } from "./src/screens/RouteMapScreen";
import { OrderDetailsScreen } from "./src/screens/OrderDetailsScreen";
import { WarehouseScanScreen } from "./src/screens/WarehouseScanScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { OfflineProvider } from "./src/context/OfflineContext";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <SafeAreaProvider>
      <OfflineProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isLoggedIn ? (
              <Stack.Screen name="Auth">
                {() => <AuthScreen onLogin={() => setIsLoggedIn(true)} />}
              </Stack.Screen>
            ) : (
              <>
                <Stack.Screen name="DriverHome" component={DriverHomeScreen} />
                <Stack.Screen name="Delivery" component={DeliveryScreen} options={{ headerShown: true, headerStyle: { backgroundColor: "#059669" }, headerTintColor: "#fff" }} />
                <Stack.Screen name="RouteMap" component={RouteMapScreen} options={{ headerShown: true, headerStyle: { backgroundColor: "#059669" }, headerTintColor: "#fff" }} />
                <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} options={{ headerShown: true, headerStyle: { backgroundColor: "#059669" }, headerTintColor: "#fff" }} />
                <Stack.Screen name="WarehouseScan" component={WarehouseScanScreen} options={{ headerShown: true, headerStyle: { backgroundColor: "#059669" }, headerTintColor: "#fff" }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, headerStyle: { backgroundColor: "#059669" }, headerTintColor: "#fff" }} />
              </>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </OfflineProvider>
    </SafeAreaProvider>
  );
}
