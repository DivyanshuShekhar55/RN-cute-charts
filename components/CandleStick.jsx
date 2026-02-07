import { Canvas, Line, Rect, Text, vec, matchFont, useFonts } from '@shopify/react-native-skia'
import { scaleLinear } from 'd3-scale'
import { FindDomain } from "../data/math-stuff.js"
import { useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { Platform, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'

// fill is [highCandleCol, lowCandleCol]

const MARGIN = 4

const CandleChart = ({ width, height, data, fill, wickColor, domain }) => {

    let candleWidth = width / data.length
    const scaleY = scaleLinear().domain(domain).range([height, 0])
    const scaleBody = scaleLinear().domain([0, Math.max(...domain) - Math.min(...domain)]).range([0, height])

    return (
        <>
            {data.map((candle, idx) => (
                <CandleStick
                    key={idx}
                    scaleY={scaleY}
                    scaleBody={scaleBody}
                    index={idx}
                    candleWidth={candleWidth}
                    fill={fill}
                    candle={candle}
                    wickColor={wickColor} />
            ))}
        </>
    )
}

const CandleStick = ({ scaleY, scaleBody, index, candleWidth, fill, candle, wickColor }) => {
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
                color={wickColor}
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

const ChartScrub = ({
    width,
    height,
    bgCol,
    data,
    fill = ["green", "red"],
    currency = "$",
    labelFontSize = 18,
    labelFontCol = "black",
    wickColor = "rgba(255, 255, 255, 0.6)",
    crossHairColor = "rgba(255,255,255,0.6)" }) => {

    let domain = FindDomain(data)

    const caliber = width / data.length
    const x = useSharedValue(0)
    const y = useSharedValue(0)
    const isActive = useSharedValue(false)

    // Snap X to nearest candle center
    const snappedX = useDerivedValue(() => {
        // following line finds nearest candle's start value
        const slot = Math.floor(x.value / caliber)
        const clamped = Math.max(0, Math.min(slot, data.length - 1))
        // this line snaps first to start of candle, then +candleWidth/2 to get to center 
        return clamped * caliber + caliber / 2
    })

    const clampedY = useDerivedValue(() => {
        return Math.min(height, Math.max(y.value, 0))
    })

    // had to create the derived values as any skia prop thaqt depends on a shared value ... 
    // must itself be a derived value, otherwise it won't update on the skia side
    const verticalP1 = useDerivedValue(() =>
        vec(snappedX.value, 0)
    )

    const verticalP2 = useDerivedValue(() =>
        vec(snappedX.value, height)
    )

    const horizontalP1 = useDerivedValue(() =>
        vec(0, clampedY.value)
    )

    const horizontalP2 = useDerivedValue(() =>
        vec(width, clampedY.value)
    )

    const crosshairOpacity = useDerivedValue(() => {
        return isActive.value ? 1 : 0
    })

    const pan = Gesture.Pan()
        .onBegin(() => {
            isActive.value = true
        })
        .onUpdate((evt) => {
            x.value = evt.x
            y.value = evt.y
            isActive.value = true
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
                <Canvas style={{ width: width, height: height, backgroundColor: bgCol }} >
                    <CandleChart
                        width={width}
                        height={height}
                        fill={fill}
                        data={data}
                        wickColor={wickColor}
                        domain={domain}
                    />

                    <Line
                        p1={horizontalP1}
                        p2={horizontalP2}
                        strokeWidth={1}
                        color={crossHairColor}
                        opacity={crosshairOpacity}
                    />

                    <Line
                        p1={verticalP1}
                        p2={verticalP2}
                        strokeWidth={1}
                        color={crossHairColor}
                        opacity={crosshairOpacity}
                    />

                    <Label
                        domain={domain}
                        height={height}
                        y={clampedY}
                        isActive={isActive}
                        currency={currency}
                        width={width}
                        fontColor={labelFontCol}
                        fontSize={labelFontSize}
                    />

                </Canvas>
            </GestureDetector>
        </View>
    )

}

const Label = ({
    height,
    domain,
    y,
    isActive,
    currency = "$",
    width,
    fontColor = "black",
    fontSize = 32 }) => {

    const formattedPrice = useDerivedValue(() => {
        "worklet"
        let min = domain[0]
        let max = domain[1]
        const price = max - (y.value / height) * (max - min)
        return `${currency}${price.toFixed(2)}`
    })

    const opacity = useDerivedValue(() => {
        return isActive.value ? 1 : 0
    })

    const textY = useDerivedValue(() => {
        // Adjust Y position so text doesn't go off screen
        return Math.max(fontSize, Math.min(y.value + fontSize, height))
    })

    // go with default system fonts for now
    // TODO : might add customised fonts here
    const fontFamily = Platform.select({ default: "sans-serif" });
    const fontStyle = {
        fontFamily,
        fontSize: fontSize,
        fontWeight: "500",
    };
    const font = matchFont(fontStyle);


    return (
        <Text
            x={width - 80}
            y={textY}
            text={formattedPrice}
            color={fontColor}
            opacity={opacity}
            font={font}
        />
    )
}

export { CandleChart, CandleStick, ChartScrub }
