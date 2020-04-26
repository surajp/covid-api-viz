import * as d3 from "d3";

export default function chart(data) {
  let counts = data.map((d) => d.positive);
  let states = data.map((d) => d.state);
  const margin = { top: 20, right: 20, left: 40, bottom: 20 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const x = d3
    .scaleBand()
    .domain(d3.range(data.length))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(counts)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const svg = d3.select("#graph").attr("viewBox", [0, 0, width, height]);

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y).tickFormat((i) => i))
    .call((g) =>
      g
        .append("text")
        .attr("x", -margin.left)
        .attr("y", 10)
        .attr("fill", "black")
        .attr("text-anchor", "start")
        .text("Positive")
    );

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(
      d3
        .axisBottom(x)
        .tickFormat((i) => data[i].state)
        .tickSizeOuter(0)
    );

  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("fill", "steelblue")
    .attr("x", (d, i) => x(i))
    .attr("y", (d, i) => y(d.positive))
    .attr("height", (d) => y(0) - y(d.positive))
    .attr("width", x.bandwidth());
}
