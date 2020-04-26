import * as d3 from "d3-fetch";
import chart from "./d3map.js";

d3.json("states-data.json").then((data) => {
  chart(data);
});
