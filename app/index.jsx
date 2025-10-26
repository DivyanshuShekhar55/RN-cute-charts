import { Text, View, StyleSheet, Dimensions } from "react-native";
import { Canvas, LinearGradient, Path, vec, Skia } from "@shopify/react-native-skia"
import { GenerateStringPath, GetYForX } from "../data/math-stuff"
import PeriodBar from "../components/PeriodBar"
import Cursor from "../components/Cursor"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import { useDerivedValue, useSharedValue, runOnJS, withTiming } from "react-native-reanimated";
import { useEffect, useState } from "react";
import StockHeader from "../components/StockHeader";
import ActionButton from "../components/ActionButton";
import StockInfo from "../components/StockInfo";


const COLORS = ["#f69d69", "#ffc37d", "#61e0a1", "#31cbd1"]

const WIDTH = Dimensions.get("screen").width
const SIZE = WIDTH

const { str_path, x_func, data, y_func, x_range_min, x_range_max } = GenerateStringPath("curveBumpX", "today", SIZE)

const skpath = Skia.Path.MakeFromSVGString(str_path)
console.log("size", SIZE)


export default function Index() {
  let init_x = x_func(data[0].timestamp)
  let init_y = y_func(data[0].price)

  const x_pos = useSharedValue(init_x)
  const y_pos = useSharedValue(init_y)
  const price_animated_val = useSharedValue(data[0].price)
  const [priceText, setPriceText] = useState(data[0].price)

  useDerivedValue(() => {
    const txt = price_animated_val.value.toFixed(2)
    runOnJS(setPriceText)(txt)
  }, [price_animated_val])

  const updateY = (clamped_x) => {
    let res_prices = GetYForX(clamped_x, SIZE, "binarySearchWithInterpolation")
    y_pos.value = res_prices.y_coord

    price_animated_val.value = withTiming(res_prices.real_price, { duration: 100 })
  }


  const pan = Gesture.Pan().onUpdate((evt) => {
    'worklet';
    const raw_x = Number(evt.x);
    const clamped = Math.max(x_range_min, Math.min(x_range_max, raw_x))
    x_pos.value = clamped;

    runOnJS(updateY)(clamped)
  });

  return (
    <View style={styles.home__main}>

      <StockHeader />

      <Text style={styles.home__price}>${priceText}</Text>

      <GestureDetector gesture={pan}>

        <Canvas style={{ width: SIZE, height: SIZE * 0.85, marginTop: 40, marginBottom: 40 }}>

          <Cursor x_pos={x_pos} y_pos={y_pos} />

          {skpath && (

            <Path path={skpath}
              style="stroke"
              strokeWidth={5}
              color={"#fff"}>

              <LinearGradient
                start={vec(0, 0)}
                end={vec(SIZE, SIZE * 0.85)}
                colors={COLORS}
              />
            </Path>
          )}

        </Canvas>
      </GestureDetector>

      <PeriodBar />

      <StockInfo />

      <View style={styles.home__actionContanier}>

        <ActionButton action={"Buy"} color={"red"} />
        <ActionButton action={"Sell"} color={"#00d499"} />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  home__main: {
    flex: 1,
    paddingVertical: 50,
    alignItems: "center",
    backgroundColor: "#181818",
    fontFamily: "Satoshi-Light",
    paddingHorizontal: 20
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
  home__actionContanier: {
    position: "absolute", bottom: 50, left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20
  }
  
});
