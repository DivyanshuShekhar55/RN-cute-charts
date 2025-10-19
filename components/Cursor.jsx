import { View, Text } from 'react-native'
import React from 'react'
import { Canvas, Circle, Group } from '@shopify/react-native-skia'
import { useDerivedValue } from 'react-native-reanimated'

const Cursor = ({ x_pos, y_pos }) => {
  console.log("into cursor")

  console.log("transform", x_pos.value, y_pos.value)

  return (

    <Group transform={[
      { translateX: x_pos.value },
      { translateY: y_pos.value }]}
    >

      <Circle style="fill" color="#f69d69" cx={0} cy={0} r={5} />
      <Circle style="stroke" color="#f69d69" cx={0} cy={0} r={12} strokeWidth={2} opacity={0.65} />
      <Circle style="stroke" color="#f69d69" cx={0} cy={0} r={18} strokeWidth={2} opacity={0.65} />
    </Group>

  )
}

export default Cursor