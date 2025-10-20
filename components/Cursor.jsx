import React from 'react'
import { Canvas, Circle, Group } from '@shopify/react-native-skia'
import { useAnimatedReaction, useDerivedValue, useSharedValue } from 'react-native-reanimated'

const Cursor = ({ x_pos, y_pos }) => {
  
  return (
    <>
      <Circle style="fill" color="#f69d69" cx={x_pos} cy={y_pos} r={5} />
      <Circle style="stroke" color="#f69d69" cx={x_pos} cy={y_pos} r={12} strokeWidth={2} opacity={0.65} />
      <Circle style="stroke" color="#f69d69" cx={x_pos} cy={y_pos} r={18} strokeWidth={2} opacity={0.65} />
    </>
  )
}

export default Cursor