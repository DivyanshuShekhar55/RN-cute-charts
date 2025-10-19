import { View, Text } from 'react-native'
import React from 'react'
import { Canvas, Circle, Group } from '@shopify/react-native-skia'
import { useDerivedValue } from 'react-native-reanimated'

const Cursor = ({ x_pos, y_pos }) => {

  const transform = useDerivedValue(() => {
    return [
      { translateX: x_pos.value },
      { translateY: y_pos.value }
    ]
  }, [x_pos, y_pos])

  return (

    <Group transform={transform}>
      <Circle style="fill" color="#f69d69" cx={50} cy={50} r={5} />
      <Circle style="stroke" color="#f69d69" cx={50} cy={50} r={12} strokeWidth={2} opacity={0.65} />
      <Circle style="stroke" color="#f69d69" cx={50} cy={50} r={18} strokeWidth={2} opacity={0.65} />
    </Group>

  )
}

export default Cursor