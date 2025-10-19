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
import { scaleLinear, scaleTime, invert } from "d3-scale";
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

function GenerateStringPath(strategy, period, canvas_width) {
  const curve = getStrategy(strategy);
  const data = getPeriodData(period);

  const min_x = min(data, (d) => {
    return d.timestamp;
  });
  const max_x = max(data, (d) => {
    return d.timestamp;
  });

  const x_func = scaleTime().domain([min_x, max_x]).range([0, canvas_width]);
  // now we can call like x(someTimestampValue)
  // this is done while plotting the path like line().x((d) => x(d.timestamp))

  const min_y = min(data, (d) => {
    return d.price;
  });
  const max_y = max(data, (d) => {
    return d.price;
  });

  const y_func = scaleLinear().domain([min_y, max_y]).range([canvas_width, 0]);

  const str_path = line()
    .x((d) => x_func(d.timestamp))
    .y((d) => y_func(d.price))
    .curve(curve)(data);

  return { str_path, x_func, y_func, data };
}

let path_config = null;

function GetYForX(x_pos, canvas_width) {
  // IDEA BEHIND THIS FUNC. :
  // the curve is not linear so find two nearby points for the given X (timestamp)
  // then assume them as a linear line and get Y via linear interpolation
  console.log("inside get y for x");
  if (!path_config) {
    path_config = GenerateStringPath("curveBumpX", "today", 300);
  }

  const { x_func, y_func, data } = path_config;
  console.log("x pos passed", x_pos);

  // keep x within bounds by clamping it
  let clamped_x_pos = Math.max(0, Math.min(canvas_width, x_pos));

  let timestamp = x_func.invert(clamped_x_pos).getTime();
  console.log("timestamp passed from xpos", timestamp);
  let left_idx = 0;
  let len = data.length;

  if (data.length === 0) throw new Error("Data array is empty");

  for (let i = 0; i < len - 1; i++) {
    console.log("777777", data[i].timestamp);
    if (data[i].timestamp <= timestamp && data[i + 1].timestamp >= timestamp) {
      left_idx = i;
      break;
    }
  }

  const left = data[left_idx];
  console.log("leftindex", left_idx, data[left_idx]);
  const right = data[left_idx + 1] || left;

  // do a linear interpolation here to find the closest point on curve
  const ratio =
    (timestamp - left.timestamp) / (right.timestamp - left.timestamp);
  const y_val = left.price + ratio * (right.price - left.price);

  return y_func(y_val);
}

export { GenerateStringPath, GetYForX };
