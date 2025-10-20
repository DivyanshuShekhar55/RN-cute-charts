import React from 'react'
import { Circle } from '@shopify/react-native-skia'

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