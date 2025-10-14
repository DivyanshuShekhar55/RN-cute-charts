// FILE ka main goals kya hai ? =>
// get the data
// generate the skia-path for curve

import {
  line,
  curveBasis,
  curveBumpX,
  curveLinear,
  curveMonotoneX,
  curveNatural,
} from "d3-shape";
import data from "./data.js";

function getStrategy(strategy) {
  let curve;

  // following are curves I believe are good matches for stock data
  switch (strategy) {
    case "curveBasis":
      curve = curveBasis;
      break;
    case "curveBumpX":
      curve = curveBumpX;
      break;
    case "curveLinear":
      curve = curveLinear;
      break;
    case "curveMonotoneX":
      curve = curveMonotoneX;
      break;
    case "natural":
      curve = curveNatural;
      break;
    default:
      curve = curveBasis;
      console.warn(
        "Invalid strategy, falling back to default bezier (curveBasis)"
      );
      break;
  }
  return curve;
}

export default function GenerateStringPath(points, strategy) {

  const curve = getStrategy(strategy);

  const str_path = line()
    .x((d) => d.timestamp)
    .y((d) => d.price)
    .curve(curve)(points);

  return str_path;
}

console.log(GenerateStringPath(data, "natural"));
