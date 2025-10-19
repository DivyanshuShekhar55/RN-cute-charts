import { Text, View, StyleSheet } from "react-native";
import { Canvas, LinearGradient, Path, vec, Skia } from "@shopify/react-native-skia"
import { GenerateStringPath, GetYForX } from "../data/math-stuff"
import PeriodBar from "../components/PeriodBar"
import Cursor from "../components/Cursor"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { runOnJS } from "react-native-worklets";

const COLORS = ["#f69d69", "#ffc37d", "#61e0a1", "#31cbd1"]
//const COLORS2 = ["#ec38bcae", "#000"]
const SIZE = 300

const { str_path, x_func, data, y_func } = GenerateStringPath("curveBasis", "today", SIZE)
// const skpath = Skia.Path.MakeFromSVGString(str_path)


export default function Index() {
  let init_x = x_func(data[0].timestamp)
  let init_y = y_func(data[0].price)

  console.log("hereeeeeeee", init_x, init_y)

  const x_pos = useSharedValue(init_x)
  const y_pos = useSharedValue(init_y)

  const updateY = (clamped_x) => {
    y_pos.value = GetYForX(clamped_x, SIZE)
  }

  const pan = Gesture.Pan().onUpdate((evt) => {
    'worklet';
    const raw_x = Number(evt.x);
    const clamped = Math.max(0, Math.min(SIZE, raw_x))
    x_pos.value = clamped;
    console.log("calling get y for x from index")

    runOnJS(updateY)(clamped)
  });


  return (
    <View style={styles.home__main}>

      <Text style={styles.home__price}>$10,000.12</Text>
      <Text style={styles.home__percent}>+12.32%</Text>


      <GestureDetector gesture={pan}>

        <Canvas style={{ width: SIZE, height: SIZE, marginTop: 40, marginBottom: 40 }}>

          <Cursor x_pos={x_pos} y_pos={y_pos} />

          <Path path={str_path}
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
          {/* <Path path={str_path}
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
      </GestureDetector>


      <PeriodBar />

    </View>
  );
}

const styles = StyleSheet.create({
  home__main: {
    flex: 1,
    paddingVertical: 30,
    alignItems: "center",
    backgroundColor: "#181818",
    fontFamily: "Satoshi-Light"
  },
  home__price: {
    color: "#ffffab",
    fontSize: 52,
    fontFamily: 'Satoshi-Bold'
  },
  home__percent: {
    color: "#b7b7b7ff",
    fontSize: 28,
    fontFamily: 'Satoshi-Light',
    marginTop: 15
  },
});
