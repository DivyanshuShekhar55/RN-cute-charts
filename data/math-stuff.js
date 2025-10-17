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

import { min, max } from "d3-array";
import { scaleLinear, scaleTime } from "d3-scale";
import daily_data from "./data.js";

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

function getTimestamps(data) {
  let timestamped_data = data.map((item) => {
    return { ...item, timestamp: new Date(item.timestamp).getTime() };
  });

  return timestamped_data;
}

function getPeriodData(period) {
  let data;
  switch (period) {
    case "today":
      data = getTimestamps(daily_data);
      break;
    case "week":
      data = getTimestamps(weekly_data);
      break;
    default:
      console.warn("invalid period, falling back to default daily");
      data = getTimestamps(daily_data);
      break;
  }

  return data;
}

export function GenerateStringPath(strategy, period, canvas_width) {
  const curve = getStrategy(strategy);
  const data = getPeriodData(period);

  const min_x = min(data, (d) => {
    return d.timestamp;
  });
  const max_x = max(data, (d) => {
    return d.timestamp;
  });

  const x = scaleTime().domain([min_x, max_x]).range([0, canvas_width]);
  // now we can call like x(someTimestampValue)
  // this is done while plotting the path like line().x((d) => x(d.timestamp))

  const min_y = min(data, (d) => {
    return d.price;
  });
  const max_y = max(data, (d) => {
    return d.price;
  });

  const y = scaleLinear().domain([min_y, max_y]).range([canvas_width, 0]);

  const str_path = line()
    .x((d) => x(d.timestamp))
    .y((d) => y(d.price))
    .curve(curve)(data);

  return str_path;
}

console.log(GenerateStringPath("natural", "today", 300));

