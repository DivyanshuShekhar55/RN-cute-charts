import { Canvas, Line, Rect, Text, vec, matchFont, useFonts, DashPathEffect } from '@shopify/react-native-skia'
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
    data,
    bgCol = "white",
    fill = ["green", "red"],
    currency = "$",
    labelFontSize = 18,
    labelRightOffset = 96,
    labelFontCol = "black",
    numLabels = 5,
    axisFontColor = "black",
    axisFontSize = 14,
    axisLabelRightOffset = 54,
    axisLabelBottomOffset = 20,
    axisLinePathEffect = "dashed",
    axisLineColor = "gray",
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

            {/* separated the axes from main canvas as don't want to re-render axes everytime user moves a finger */}
            <Axis
                data={data}
                width={width}
                height={height}
                domain={domain}
                numLabels={numLabels}
                axisFontSize={axisFontSize}
                axisFontColor={axisFontColor}
                axisLineColor={axisLineColor}
                axisLinePathEffect={axisLinePathEffect}
                axisLabelRightOffset={axisLabelRightOffset}
                axisLabelBottomOffset={axisLabelBottomOffset}
            />

            <GestureDetector gesture={pan}>
                <Canvas style={{
                    width: width,
                    height: height,
                    backgroundColor: "transparent",
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                }} >
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
                        labelRightOffset={labelRightOffset}
                    />


                </Canvas>
            </GestureDetector>
        </View>
    )

}

const Label = ({
    y,
    width,
    height,
    domain,
    isActive,
    currency,
    fontSize,
    fontColor,
    labelRightOffset }) => {

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
            x={width - labelRightOffset}
            y={textY}
            text={formattedPrice}
            opacity={opacity}
            font={font}
            color={fontColor}
        />
    )
}

const Axis = ({
    data,
    width,
    height,
    domain,
    numLabels,
    axisFontSize,
    axisFontColor,
    axisLineColor,
    axisLinePathEffect,
    axisLabelRightOffset,
    axisLabelBottomOffset,
}) => {
    return (
        <Canvas style={{ width: width, height: height, zIndex: 0 }} pointerEvents='none'>
            <YAxis
                height={height}
                width={width}
                domain={domain}
                numLabels={numLabels}
                axisFontColor={axisFontColor}
                axisFontSize={axisFontSize}
                axisLabelRightOffset={axisLabelRightOffset}
                axisLineColor={axisLineColor}
                axisLinePathEffect={axisLinePathEffect}
            />
            <XAxis
                height={height}
                width={width}
                data={data}
                numLabels={numLabels}
                axisFontColor={axisFontColor}
                axisFontSize={axisFontSize}
                axisLabelBottomOffset={axisLabelBottomOffset}
                axisLineColor={axisLineColor}
                axisLinePathEffect={axisLinePathEffect}
            />
        </Canvas>
    )
}

const YAxis = ({
    width,
    height,
    domain,
    numLabels,
    axisFontSize,
    axisFontColor,
    axisLineColor,
    axisLinePathEffect,
    axisLabelRightOffset,
}) => {

    const fontFamily = Platform.select({ default: "sans-serif" });
    const fontStyle = {
        fontFamily,
        fontSize: axisFontSize,
        fontWeight: "500",
    };
    const font = matchFont(fontStyle);


    const [min, max] = domain
    const priceStep = (max - min) / (numLabels - 1)

    const verticalPadding = axisFontSize / 2

    return (
        <>
            {Array.from({ length: numLabels }).map((_, idx) => {
                const price = max - (idx * priceStep)
                const yPos = verticalPadding + (idx / (numLabels - 1)) * (height - 2 * verticalPadding)

                return (
                    <>
                        <Text
                            key={idx}
                            x={width - axisLabelRightOffset}
                            y={yPos + axisFontSize / 2}
                            text={`$${price.toFixed(2)}`}
                            color={axisFontColor}
                            font={font}
                        />

                        <AxisLine axisLinePathEffect={axisLinePathEffect} axisLineColor={axisLineColor} x1={width} y1={yPos} x2={0} y2={yPos} key={idx + 1} />
                    </>
                )
            })}
        </>
    )
}

const XAxis = ({
    data,
    width,
    height,
    numLabels,
    axisFontSize,
    axisFontColor,
    axisLineColor,
    axisLinePathEffect,
    axisLabelBottomOffset, }) => {

    const fontFamily = Platform.select({ default: "sans-serif" });
    const fontStyle = {
        fontFamily,
        fontSize: axisFontSize,
        fontWeight: "500",
    };
    const font = matchFont(fontStyle);

    const step = Math.floor(data.length / (numLabels - 1))
    const dataLen = data.length

    return (
        <>
            {Array.from({ length: numLabels }).map((_, idx) => {
                const dataIdx = Math.min(idx * step, data.length - 1)
                const candle = data[dataIdx]
                const xPos = (dataIdx / dataLen) * width
                const date = new Date(candle.timestamp * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false  // change to true for 12hr format like "12:05 PM"
                })
                console.log(date)

                return (
                    <>
                        <Text
                            key={idx}
                            x={xPos}
                            y={height - axisLabelBottomOffset + axisFontSize}
                            text={date}
                            color={axisFontColor}
                            font={font}
                        />
                        <AxisLine axisLinePathEffect={axisLinePathEffect} axisLineColor={axisLineColor} x1={xPos} y1={0} x2={xPos} y2={height} key={idx + 1} />
                    </>
                )
            })}
        </>
    )
}

// axisLinePathEffect is either "dashed", "line" or "none"
// none removes the axis lines
const AxisLine = ({ axisLinePathEffect, axisLineColor, x1, y1, x2, y2 }) => {
    // add line stoke style option
    if (axisLinePathEffect === "none") {
        return null
    }
    return (
        <Line p1={vec(x1, y1)} p2={vec(x2, y2)} color={axisLineColor} strokeWidth={0} >
            {(axisLinePathEffect === "dashed") && (
                <DashPathEffect intervals={[4, 4]} />
            )}
        </Line>
    )
}

export { CandleChart, CandleStick, ChartScrub }
