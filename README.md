## Welcome To Cute Charts 
Made with ❤️ Expo, React Native, D3.js, Reanimated, Gesture Handler and Skia
 
![alt text](<demo.jpg>)

## Usage
1. I have put all the data in ./data/data.js file. Note that the data that you provide to the chart component must be sorted.
2. We are using a Bezier curve (`curveBasis`) as default curve over the provided data
3. There are various curves you can try playing with - `curveLinear`, `curveBumpX`, `CurveMonotoneX` and the `natural` curve. Look at D3.js docs for more : https://d3js.org/d3-shape/curve

4. The X-axis uses the time-scale function of the D3.js while Y-axis uses Linear scale.

5. Here are the important function signatures

 ```javascript
 // generate the string path using this function signature
const { str_path, x_func, data, y_func, x_range_min, x_range_max } = GenerateStringPath("curveBumpX", "today", SIZE)

// generate the skia path using 
const skpath = Skia.Path.MakeFromSVGString(str_path)
```
6. As the path is not a simple linear curve we need a method to map the finger's current X position on the canvas to the Y point on the curve
We are currently implement this by finding the two closest data points to the current X. A linear interpolation then gives us the required to plot the Cursor.

```javascript
// gets the Y for current X
let res_prices = GetYForX(clamped_x, SIZE, "binarySearchWithInterpolation")
```

7. Feel free to add your own strategy for searching and plotting the cursor. Also note that this is a computational part so we can NOT run on the reanimated's UI thread. If you find a better way to achieve this please, please let me know more about it.

8. Also note that using linear interpolation means we need ample number of points to render the cursor nicely over the curve. Lesser number of points will generate poor results from interpolation.

## All The Resources
1. Look up at D3's shape, scale and array modules
2. https://youtu.be/xeLdmn3se1I - William Candillon's Skia charts
3. https://www.youtube.com/live/rQroxWLZiCo?si=cmEP0X8v81vduDTX - Coding Train's D3 intro video
4. Read some material on Bezier Curves and parametric curves