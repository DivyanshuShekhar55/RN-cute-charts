import { Canvas, Line, Rect, vec } from '@shopify/react-native-skia'
import { scaleLinear } from 'd3-scale'
import { FindDomain } from "../data/math-stuff.js"
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
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

const ChartScrub = ({width, height, bgCol, data, fill }) => {
    //let { width } = useWindowDimensions()
    const caliber = width / data.length
    const x = useSharedValue(0)
    const y = useSharedValue(0)
    const isActive = useSharedValue(false)

    const pan = Gesture.Pan()
        .onBegin(() => {
            isActive.value = true
        })
        .onUpdate((evt) => {
            rawX = evt.x
            rawY = evt.y
            clampedY = Math.min(height, Math.max(rawY, 0))

            // Snap X to nearest candle center
            // following line finds nearest candle's start value
            const slot = Math.floor(rawX / caliber);
            const clampedSlot = Math.max(0, Math.min(slot, data.length - 1))
            // this line snaps first to start of candle, then +candleWidth/2 to get to center 
            const snappedX = clampedSlot * candleWidth + candleWidth / 2;

            x.value = snappedX;
            y.value = clampedY;

        })
        .onEnd(() => {
            isActive.value = false
        })
        .onFinalize(() => {
            isActive.value = false
        })

    // Animated styles for lines
    const horizontalLineStyle = useAnimatedStyle(() => ({
        opacity: isActive.value ? 1 : 0,
        transform: [{ translateY: y.value }],
    }));

    const verticalLineStyle = useAnimatedStyle(() => ({
        opacity: isActive.value ? 1 : 0,
        transform: [{ translateX: x.value }],
    }));

    return (
        <View>
            <GestureDetector gesture={pan}>
                <CandleChart
                    width={width}
                    height={height}
                    bgCol={bgCol}
                    fill={fill}
                    data={data}
                />
                <Animated.View
                    style={[
                        scrubStyles.line,
                        {
                            width: width,
                            height: 1
                        },
                        horizontalLineStyle
                    ]}
                />

                <Animated.View
                    style={[
                        scrubStyles.line,
                        {
                            height: height,
                            width: 1
                        },
                        verticalLineStyle
                    ]}
                />


            </GestureDetector>
        </View>
    )

}

const scrubStyles = StyleSheet.create({
    line: {
        position: "absolute"
    }
})

export { CandleChart, CandleStick, ChartScrub }
