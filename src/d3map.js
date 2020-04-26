import * as d3 from "d3";
import * as topojson from "topojson-client";

export default function chart(data) {
  Promise.all(
    ["counties-albers-10m.json", "state-abbr.json"].map((file) => d3.json(file))
  ).then(geo.bind(this, data));
}

function geo(data, results) {
  const us = results[0];
  const stateabbr = results[1];
  const margin = { top: 20, right: 20, left: 40, bottom: 20 };
  const width = 975;
  const height = 610;
  const projection = d3.geoAlbersUsa().scale([1300]).translate([487.5, 305]);
  const path = d3.geoPath();
  const svg = d3.select("#graph").attr("viewBox", [0, 0, width, height]);

  const stateCodeMap = stateabbr.data.reduce((obj, st) => {
    const currentState = data.filter((row) => row.state == st.Code);
    obj[st.State] = { code: "", rate: 0 };
    if (currentState && currentState.length > 0) {
      obj[st.State].rate =
        (currentState[0].positive /
          (currentState[0].positive + currentState[0].negative)) *
        100;
      obj[st.State].code = st.Code;
    }
    return obj;
  }, {});

  const states = topojson.feature(us, us.objects.states).features;
  const positives = Object.values(stateCodeMap).map((o) => o.rate);
  const colors = d3
    //.scaleLinear(d3.interpolateBrBG)
    .scalePow()
    .exponent(0.47)
    //.domain(d3.range(d3.min(positives), d3.max(positives), 2000))
    .domain([0, d3.max(positives)])
    //.range(d3.interpolateBrBG);
    .range(["yellow", "red"]);
  //.interpolate(d3.interpolateHcl);
  states.forEach((state) => {
    state.properties.positive = stateCodeMap[state.properties.name].rate || 0;
    state.properties.code = stateCodeMap[state.properties.name].code || "";
  });

  debugger;
  svg
    .append("g")
    .attr("fill", "none")
    .call((g) => {
      let ng = g
        .selectAll("g.states")
        .data(states)
        .join("g")
        .attr("class", "states");

      ng.append("path")
        .attr("stroke", "none")
        .attr("d", path)
        .attr("fill", (d) => colors(d.properties.positive))
        .append("title")
        .text(
          (d) => `${d.properties.name}
        ${d.properties.positive}`
        );

      ng.append("text")
        .call((t) => t.append("tspan").text((d) => d.properties.code))
        .call((t) =>
          t
            .append("tspan")
            .text((d) => `${d.properties.positive.toFixed(2)}%`)
            .attr("dy", "1.2em")
        )
        .attr("font-size", 8)
        .attr("stroke-width", "0.4")
        .style("stroke", "#000")
        .attr("text-anchor", "middle")
        .attr("x", (d) => path.centroid(d)[0])
        .attr("y", (d) => path.centroid(d)[1]);
    })
    .call((g) => {
      g.append("path")
        .attr(
          "d",
          path(topojson.mesh(us, us.objects.states, (a, b) => a !== b))
        )
        .attr("stroke", "#000")
        .attr("stroke-width", ".5");
    })
    .call((g) => {
      g.append("path")
        .attr("stroke", "#000")
        .attr("d", path(topojson.feature(us, us.objects.nation)));
    });

  d3.select("#range").on("input", (val) => {
    colors.exponent(d3.select("#range").property("value"));
    d3.selectAll("g.states path").attr("fill", (d) =>
      colors(d.properties.positive)
    );
  });
}
