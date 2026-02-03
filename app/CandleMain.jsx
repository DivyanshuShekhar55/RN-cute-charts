import { View } from 'react-native'
import { CandleChart } from "../components/CandleStick"
import { candle_data } from "../data/candledata"

const data = candle_data.slice(0, 20)

const CandleMain = () => {
  return (
    <View style={{alignItems: "center", justifyContent: "center", flex: 1}}>
      <CandleChart width={400} height={500} fill={["red", "green"]} bgCol={"white"} data={data}/>
    </View>
  )
}

export default CandleMain
