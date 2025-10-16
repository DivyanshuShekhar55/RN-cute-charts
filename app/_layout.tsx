import { HeaderTitle } from "@react-navigation/elements";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    "Satoshi-Light": require(".././assets/fonts/Satoshi-Light.otf"),
    'Satoshi': require(".././assets/fonts/Satoshi-Regular.otf"),
    "Satoshi-Bold": require(".././assets/fonts/Satoshi-Bold.otf"),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
