import { Canvas, Line, Rect, vec } from '@shopify/react-native-skia'
import candle_data from '../data/candledata.js'
import { FindDomain } from "../data/math-stuff.js"
import { scaleLinear } from 'd3-scale'

// don't know use of candles yet
// fill is [highCandleCol, lowCandleCol]

const CandleChart = ({ width, height, bgCol, data, candles, fill }) => {

    let domain = FindDomain(data)
    let candleWidth = width / data.length
    const scaleY = scaleLinear().domain(domain).range([height, 0])
    const scaleBody = scaleLinear().domain([0, Math.max(...domain) - Math.min(...domain)]).range([0, height])

    return (
        <Canvas width={width} height={height} style={{ backgroundColor: bgCol }}>
            {candles.map((candle, idx) => (
                <CandleStick
                    key={idx}
                    scaleY
                    scaleBody
                    index
                    candleWidth
                    fill
                    candle />
            ))}
        </Canvas>
    )
}

const CandleStick = ({ scaleY, scaleBody, index, candleWidth, fill, candle }) => {
    const { high, low, open, close } = candle
    const fill = high > low ? fill[0] : fill[1]
    const x = index * candleWidth
    const yHigh = scaleY(Math.max(open, close))
    const candleHeight = scaleBody(Math.abs(open - close))
    return (
        <>
            <Line
                p1={vec(x + candleWidth / 2, scaleY(high))}
                p2={vec(x + candleWidth / 2, scaleY(low))}
                strokeWidth={3}
            />
            <Rect
                x={x}
                y={yHigh}
                width={candleWidth}
                height={candleHeight}
                color={fill}
            />
        </>

    )
}

export default CandleStick