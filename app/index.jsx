import { Text, View, StyleSheet } from "react-native";
import { Canvas, LinearGradient, Path, vec, Skia } from "@shopify/react-native-skia"
import { GenerateStringPath } from "../data/math-stuff"

const COLORS = ["#ec38bc", "#3e0174"]

const path = GenerateStringPath("curveBasis", "today", 300)
console.log(path)
const skpath = Skia.Path.MakeFromSVGString(path)


export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        //justifyContent: "center",
        paddingVertical: 30,
        alignItems: "center",
        backgroundColor: "black",
        fontFamily:"Satoshi-Light"
      }}
    >
      <Text style={styles.home__price}>$10,000.12</Text>


      <Canvas style={{ width: 300, height: 300, marginTop:30 }}>
        <Path path={path}
          style="stroke"
          strokeWidth={4}
          color={"#fff"}>

          <LinearGradient
            start={vec(0, 0)}
            end={vec(300, 300)}
            colors={COLORS}
          />
        </Path>
      </Canvas>

    </View>
  );
}

const styles = StyleSheet.create({
  home__price: {
    color: "#ffffab",
    fontSize: 52,
    fontFamily: 'Satoshi-Bold'
  },
});
