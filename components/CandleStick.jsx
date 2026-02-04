import { Canvas, Line, Rect, vec } from '@shopify/react-native-skia'
import { scaleLinear } from 'd3-scale'
import { FindDomain } from "../data/math-stuff.js"
import Animated, { useAnimatedStyle, useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

// fill is [highCandleCol, lowCandleCol]

const MARGIN = 4

const CandleChart = ({ width, height, bgCol, data, fill }) => {

    let domain = FindDomain(data)
    let candleWidth = width / data.length
    const scaleY = scaleLinear().domain(domain).range([height, 0])
    const scaleBody = scaleLinear().domain([0, Math.max(...domain) - Math.min(...domain)]).range([0, height])

    return (
        <Canvas width={width} height={height} style={{ backgroundColor: bgCol }}>
            {data.map((candle, idx) => (
                <CandleStick
                    key={idx}
                    scaleY={scaleY}
                    scaleBody={scaleBody}
                    index={idx}
                    candleWidth={candleWidth}
                    fill={fill}
                    candle={candle} />
            ))}
        </Canvas>
    )
}

const CandleStick = ({ scaleY, scaleBody, index, candleWidth, fill, candle }) => {
    const { high, low, open, close } = candle
    const col = close > open ? fill[0] : fill[1]
    const x = index * candleWidth
    const yHigh = scaleY(Math.max(open, close))
    const candleHeight = scaleBody(Math.abs(open - close))
    return (
        <>
            <Line
                p1={vec(x + candleWidth / 2, scaleY(high))}
                p2={vec(x + candleWidth / 2, scaleY(low))}
                strokeWidth={1}
            />
            <Rect
                x={x + MARGIN}
                y={yHigh}
                width={candleWidth - 2 * MARGIN}
                height={candleHeight}
                color={col}
            />
        </>

    )
}

const ChartScrub = ({ width, height, bgCol, data, fill }) => {
    //let { width } = useWindowDimensions()
    const caliber = width / data.length
    const x = useSharedValue(0)
    const y = useSharedValue(0)
    const isActive = useSharedValue(false)

    // Snap X to nearest candle center
    const snappedX = useDerivedValue(() => {
        // following line finds nearest candle's start value
        const slot = Math.floor(x.value / candleWidth)
        const clamped = Math.max(0, Math.min(slot, data.length - 1))
        // this line snaps first to start of candle, then +candleWidth/2 to get to center 
        return clamped * candleWidth + candleWidth / 2
    })

    const clampedY = useDerivedValue(() => {
        return Math.min(height, Math.max(y.value, 0))
    })


    const pan = Gesture.Pan()
        .onBegin(() => {
            isActive.value = true
        })
        .onUpdate((evt) => {
            x.value = evt.x
            y.value = evt.y
        })
        .onEnd(() => {
            isActive.value = false
        })
        .onFinalize(() => {
            isActive.value = false
        })

    return (
        <View>
            <GestureDetector gesture={pan}>
                <Canvas style={{ width: width, height: height }} >
                    <CandleChart
                        width={width}
                        height={height}
                        bgCol={bgCol}
                        fill={fill}
                        data={data}
                    />

                    <Line
                        p1={vec(snappedX.value, 0)}
                        p2={vec(snappedX.value, height)}
                        strokeWidth={1}
                        color={"rgba(255,255,255,0.6)"}
                        opacity={isActive.value === true ? 1 : 0}
                    />

                    <Line
                        p1={vec(0, clampedY.value)}
                        p2={vec(width, clampedY.value)}
                        strokeWidth={1}
                        color={"rgba(255,255,255,0.6)"}
                        opacity={isActive.value === true ? 1 : 0}
                    />
                </Canvas>
            </GestureDetector>
        </View>
    )

}

export { CandleChart, CandleStick, ChartScrub }
