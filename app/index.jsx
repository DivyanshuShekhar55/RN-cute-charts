import { Text, View, StyleSheet } from "react-native";
import { Canvas, LinearGradient, Path, vec, Skia } from "@shopify/react-native-skia"
import { GenerateStringPath } from "../data/math-stuff"
import PeriodBar from "../components/PeriodBar"

const COLORS = ["#f69d69", "#ffc37d", "#61e0a1", "#31cbd1"]
const COLORS2 = ["#ec38bcae", "#000"]
const SIZE = 300

const path = GenerateStringPath("curveBasis", "today", SIZE)
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
        backgroundColor: "#181818",
        fontFamily:"Satoshi-Light"
      }}
    >
      <Text style={styles.home__price}>$10,000.12</Text>
      <Text style={styles.home__percent}>+12.32%</Text>


      <Canvas style={{ width: SIZE, height: SIZE, marginTop:40, marginBottom:40 }}>
        <Path path={path}
          style="stroke"
          strokeWidth={5}
          color={"#fff"}>

          <LinearGradient
            start={vec(0, 0)}
            end={vec(SIZE, SIZE)}
            colors={COLORS}
          />
        </Path>

        {/*keep if want some shadow/shade below the curve*/}
        {/* <Path path={path}
          style="fill"
          strokeWidth={4}
          color={"#fff"}>

          <LinearGradient
            start={vec(0, 0)}
            end={vec(0, SIZE/2)}
            colors={COLORS2}
          />
        </Path> */}
      </Canvas>

      <PeriodBar />

    </View>
  );
}

const styles = StyleSheet.create({
  home__price: {
    color: "#ffffab",
    fontSize: 52,
    fontFamily: 'Satoshi-Bold'
  },
  home__percent: {
    color: "#b7b7b7ff",
    fontSize: 28,
    fontFamily: 'Satoshi-Light',
    marginTop:15
  },
});
