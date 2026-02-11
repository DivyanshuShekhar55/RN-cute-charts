import { Dimensions, View } from 'react-native'
import { ChartScrub as CandleScrub } from "../components/CandleStick"
import { candle_data } from "../data/candledata"

const data = candle_data.slice(0, 20)

const {width, height} = Dimensions.get("window")

const CandleMain = () => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <CandleScrub width={width} height={height/2} fill={["green", "red"]} bgCol={"white"} data={data} wickColor='gray' crossHairColor='gray' />
    </View>
  )
}

export default CandleMain
