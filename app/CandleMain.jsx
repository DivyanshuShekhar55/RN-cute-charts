import { View } from 'react-native'
import { ChartScrub as CandleScrub } from "../components/CandleStick"
import { candle_data } from "../data/candledata"

const data = candle_data.slice(0, 20)

const CandleMain = () => {
  return (
    <View style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
      <CandleScrub width={400} height={500} fill={["green", "red"]} bgCol={"white"} data={data} wickColor='gray' crossHairColor='gray' />
    </View>
  )
}

export default CandleMain
