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
  // also cache the path configs

  if (!path_config || path_config.canvas_width !== canvas_width) {
    path_config = {
      ...GenerateStringPath("curveBumpX", "today", canvas_width),
      canvas_width,
    };
  }

  const { x_func, y_func, data } = path_config;

  // keep x within bounds by clamping it
  let clamped_x_pos = Math.max(0, Math.min(canvas_width, x_pos));

  let y_val = searchStrategy(
    "binaryWithInterpolation",
    clamped_x_pos,
    x_func,
    data,
    y_func
  );

  return y_func(y_val);
}

const searchStrategy = (
  search_strategy,
  clamped_x_pos,
  x_func,
  data,
  y_func
) => {
  let res;
  switch (search_strategy) {
    case "binaryWithInterpolation":
      res = BinarySearchWithInterpolation(clamped_x_pos, x_func, data, y_func);
      break;

    // might add more strategies later
    // one might be using lookup tables
    // as for less data points interpolation fails

    default:
      console.warn(
        "invalid search strategy, falling back to binary with interpolation"
      );
      res = BinarySearchWithInterpolation(clamped_x_pos, x_func, data, y_func);
      break;
  }

  return res;
};

const BinarySearchWithInterpolation = (clamped_x_pos, x_func, data, y_func) => {
  let timestamp = x_func.invert(clamped_x_pos).getTime();

  let left_idx = 0;

  if (timestamp <= data[0].timestamp) {
    return y_func(data[0].price);
  }
  if (timestamp >= data[data.length - 1].timestamp) {
    return y_func(data[data.length - 1].price);
  }

  // Binary search (could have gone with linear search as well but lol why not better)
  let left = 0;
  let right = data.length - 1;

  while (left < right - 1) {
    const mid = Math.floor((left + right) / 2);
    if (data[mid].timestamp <= timestamp) {
      left = mid;
    } else {
      right = mid;
    }
  }

  left_idx = left;

  const left_point = data[left_idx];
  const right_point = data[left_idx + 1];

  // do Linear interpolation here
  const denominator = right_point.timestamp - left_point.timestamp;
  const ratio =
    denominator !== 0 ? (timestamp - left_point.timestamp) / denominator : 0;
  const y_val =
    left_point.price + ratio * (right_point.price - left_point.price);

  return y_val;
};

export { GenerateStringPath, GetYForX };
