import { Dimensions, View } from 'react-native'
import { ChartScrub as CandleScrub } from "../components/CandleStick"
import { candle_data } from "../data/candledata"

// Use all candle data to demonstrate zoom feature
const data = candle_data.slice(0, 400)

const {width, height} = Dimensions.get("window")

const CandleMain = () => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <CandleScrub 
        width={width} 
        height={height/2} 
        fill={["green", "red"]} 
        bgCol={"white"} 
        data={data} 
        wickColor='gray' 
        crossHairColor='gray'
        maxVisibleCandles={30}
        minVisibleCandles={10}
      />
    </View>
  )
}

export default CandleMain
