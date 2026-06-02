import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { colors } from "@/constants/colors";
import AuthProvider, { useAuth } from "@/contexts/AuthContext";

function RootNavigation() {
  const { user, loading } = useAuth();
  const router   = useRouter();
  const segments = useSegments();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || loading) return;
    const inLogin = !segments[0] || segments[0] === "login";
    if (!user && !inLogin) router.replace("/login");
    if (user  &&  inLogin) router.replace("/(tabs)");
  }, [mounted, user, loading, segments]);

  return (
    <Stack
      initialRouteName="login"
      screenOptions={{ contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="login"  options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar backgroundColor={colors.primary} style="light" />
      <RootNavigation />
    </AuthProvider>
  );
}
