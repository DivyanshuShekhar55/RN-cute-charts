import { Text, View, StyleSheet } from "react-native";
import {Canvas, LinearGradient, vec} from "@shopify/react-native-skia"

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        //justifyContent: "center",
        paddingVertical: 30,
        alignItems: "center",
        backgroundColor: "black",
      }}
    >
      <Text style={styles.home__price}>$10,000.12</Text>


      <Canvas >
        <LinearGradient
          start={vec(0,0)}
          end={vec(300, 300)}
          colors={}
        />
      </Canvas>

    </View>
  );
}

const styles = StyleSheet.create({
  home__price: {
    color: "white",
    fontSize: 48,
    fontWeight: "800",
    fontFamily: 'Satoshi-Bold'
  },
});
