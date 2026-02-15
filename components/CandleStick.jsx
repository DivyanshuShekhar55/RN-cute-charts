import { Canvas, DashPathEffect, Line, matchFont, Rect, Text, vec } from '@shopify/react-native-skia'
import { scaleLinear } from 'd3-scale'
import React, { useState, useMemo } from 'react'
import { Platform, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { useDerivedValue, useSharedValue } from 'react-native-reanimated'
import { FindDomain } from "../data/math-stuff.js"
import { scheduleOnUI, scheduleOnRN } from 'react-native-worklets'

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
    crossHairColor = "rgba(255,255,255,0.6)",
    maxVisibleCandles = 50,
    minVisibleCandles = 10 }) => {

    const chartRegionWidth = width - axisLabelRightOffset
    const chartRegionHeight = height - axisLabelBottomOffset

    // state for visible range (updates axes on gesture end)
    // visibleStart for example is min price for the candles currently on screen
    const [visibleStart, setVisibleStart] = useState(
        Math.max(0, data.length - Math.min(maxVisibleCandles, data.length))
    )
    const [visibleEnd, setVisibleEnd] = useState(data.length)

    // Shared values for gestures
    const scale = useSharedValue(1)
    const savedScale = useSharedValue(1)
    const panOffset = useSharedValue(0)
    const savedPanOffset = useSharedValue(0)

    const savedVisibleStart = useSharedValue(visibleStart)
    const savedVisibleEnd = useSharedValue(visibleEnd)

    // Crosshair state
    const x = useSharedValue(0)
    const y = useSharedValue(0)
    const isActive = useSharedValue(false)

    // Calculate visible data and domain
    // *** TODO :  in future check if calculating slice everytime is really performant
    // can we use smthing like a sliding window?
    const visibleData = useMemo(() => {
        return data.slice(visibleStart, visibleEnd)
    }, [data, visibleStart, visibleEnd])

    const domain = useMemo(() => {
        return FindDomain(visibleData)
    }, [visibleData])

    const caliber = chartRegionWidth / visibleData.length

    // Snap X (user's touch and crosshair X) to nearest candle's center
    const snappedX = useDerivedValue(() => {
        // following line finds nearest candle's start value
        const slot = Math.floor(x.value / caliber)
        const clamped = Math.max(0, Math.min(slot, visibleData.length - 1))
        // this line snaps first to start of candle, then +candleWidth/2 to get to center 
        return clamped * caliber + caliber / 2
    })

    const clampedY = useDerivedValue(() => {
        return Math.min(chartRegionHeight, Math.max(y.value, 0))
    })

    // had to create the derived values as any skia prop that depends on a shared value ... 
    // must itself be a derived value, otherwise it won't update on the skia side
    const verticalP1 = useDerivedValue(() =>
        vec(snappedX.value, 0)
    )

    const verticalP2 = useDerivedValue(() =>
        vec(snappedX.value, chartRegionHeight)
    )

    const horizontalP1 = useDerivedValue(() =>
        vec(0, clampedY.value)
    )

    const horizontalP2 = useDerivedValue(() =>
        vec(chartRegionWidth, clampedY.value)
    )

    const crosshairOpacity = useDerivedValue(() => {
        return isActive.value ? 1 : 0
    })

    // Pinch gesture for zoom
    // 2 finger gesture
    const pinch = Gesture.Pinch()
        .onStart(() => {
            savedScale.value = scale.value
        })
        .onUpdate((evt) => {
            scale.value = savedScale.value * evt.scale
            console.log("scale", evt.scale)
        })
        .onEnd(() => {
            // Calculate new visible count based on accumulated scale
            const initialCount = Math.min(maxVisibleCandles, data.length)
            const newCount = Math.round(initialCount / scale.value)
            const clampedCount = Math.max(
                minVisibleCandles,
                Math.min(maxVisibleCandles, newCount)
            )

            console.log("scale on end", clampedCount)

            // Update states to re-render with new visible range
            // Keep the end position, adjust start based on new count

            // DOES IT REALLY ZOOM AROUNDS THE FOCUS ?  OR THE RIGHT VISIBLE END ?
            const newStart = Math.max(0, visibleEnd - clampedCount)
            scheduleOnRN(setVisibleStart, newStart)

            // Reset scale for next gesture
            // as we consider the next zoom "session" to start from the current zoom level, so scale=1
            scale.value = 1
            savedScale.value = 1

        })

    // Crosshair - one finger only
    const crosshair = Gesture.Pan()
        .minPointers(1)
        .maxPointers(1)
        .onStart((evt) => {
            isActive.value = true
            x.value = evt.x
            y.value = evt.y
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

    // Horizontal scroll - three fingers with live UI updates
    const panScroll = Gesture.Pan()
        .minPointers(3)
        .maxPointers(3)
        .onStart(() => {
            isActive.value = false
            savedPanOffset.value = panOffset.value
            // Save the initial visible range when gesture starts
            savedVisibleStart.value = visibleStart
            savedVisibleEnd.value = visibleEnd
        })
        .onUpdate((evt) => {
            panOffset.value = savedPanOffset.value + evt.translationX

            // Live update during gesture
            const candlesToShift = Math.round(-panOffset.value / caliber)
            const currentCount = savedVisibleEnd.value - savedVisibleStart.value

            const newEnd = Math.min(
                data.length,
                Math.max(currentCount, savedVisibleEnd.value + candlesToShift)
            )
            const newStart = Math.max(0, newEnd - currentCount)

            // Apply live updates
            scheduleOnRN(setVisibleStart, newStart)
            scheduleOnRN(setVisibleEnd, newEnd)
        })
        .onEnd(() => {
            // Reset pan offset for next gesture
            panOffset.value = 0
            savedPanOffset.value = 0
        })

    // Compose: crosshair OR (pinch + pan together)
    const composed = Gesture.Race(
        crosshair,
        pinch,
        panScroll
    )

    return (
        <View>

            {/* separated the axes from main canvas as don't want to re-render axes everytime user moves a finger */}
            <Axis
                data={visibleData}
                width={width} // give exact dimensions passed by user, so axes remain in margin area
                height={height}
                bgCol={bgCol}
                domain={domain}
                numLabels={numLabels}
                axisFontSize={axisFontSize}
                axisFontColor={axisFontColor}
                axisLineColor={axisLineColor}
                axisLinePathEffect={axisLinePathEffect}
                axisLabelRightOffset={axisLabelRightOffset}
                axisLabelBottomOffset={axisLabelBottomOffset}
            />

            <GestureDetector gesture={composed}>
                <Canvas style={{
                    width: chartRegionWidth,
                    height: chartRegionHeight,
                    backgroundColor: "transparent",
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    zIndex: 1
                }} >
                    <CandleChart
                        width={chartRegionWidth}
                        height={chartRegionHeight}
                        fill={fill}
                        data={visibleData}
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
                        y={clampedY}
                        domain={domain}
                        currency={currency}
                        isActive={isActive}
                        fontColor={labelFontCol}
                        fontSize={labelFontSize}
                        width={chartRegionWidth}
                        height={chartRegionHeight}
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
    bgCol,
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
        <Canvas style={{ width: width, height: height, zIndex: 0, backgroundColor:bgCol }} pointerEvents='none'>
            <YAxis
                height={height - axisLabelBottomOffset}
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
                width={width - axisLabelRightOffset}
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
                    <React.Fragment key={idx}>
                        <Text
                            x={width - axisLabelRightOffset}
                            y={yPos + axisFontSize / 2}
                            text={`$${price.toFixed(2)}`}
                            color={axisFontColor}
                            font={font}
                        />

                        <AxisLine axisLinePathEffect={axisLinePathEffect} axisLineColor={axisLineColor} x1={width} y1={yPos} x2={0} y2={yPos} />
                    </React.Fragment>
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
}) => {

    const fontFamily = Platform.select({ default: "sans-serif" });
    const fontStyle = {
        fontFamily,
        fontSize: axisFontSize,
        fontWeight: "500",
    };
    const font = matchFont(fontStyle);

    const step = Math.floor(data.length / (numLabels - 1))
    const dataLen = data.length

    // we do following reduction to width
    //  so that the last label doesn't overlap with first label of y-axis
    width -= axisFontSize

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

                return (
                    <React.Fragment key={idx}>
                        <Text
                            x={xPos}
                            y={height}
                            text={date}
                            color={axisFontColor}
                            font={font}
                        />
                        <AxisLine axisLinePathEffect={axisLinePathEffect} axisLineColor={axisLineColor} x1={xPos} y1={0} x2={xPos} y2={height} />
                    </React.Fragment>
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

