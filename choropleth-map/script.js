const EDUCATION_FILE_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const COUNIES_FILE_URL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

async function onDOMContentLoaded() {
    const educationData = await fetch(EDUCATION_FILE_URL)
        .then(data => data.json())
        .catch(error => console.error(error));
    
    const usTopologyData = await fetch(COUNIES_FILE_URL)
        .then(data => data.json())
        .catch(error => console.error(error));

    const svgProperties = {
        width: 960,
        height: 600
    }

    // const tooltip = document.getElementById("tooltip");
    const tooltip = d3.select(".visualizer")
        .append("div")
        .attr("id", "tooltip")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const svg = d3.select(".visualizer")
        .append("svg")
        .attr("width", svgProperties.width)
        .attr("height", svgProperties.height);

    const color = d3.scaleThreshold()
        .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
        .range(d3.schemeBlues[9]);
    
    const geoPath = d3.geoPath();
    
    // counties
    const countyOnMouseOver = (item) => {
        const data = educationData.filter(edu => edu.fips === item.id)[0];
        tooltip.html(`${data.area_name}, ${data.state}: ${data.bachelorsOrHigher}%`)
            .style("opacity", 0.6)
            .style("left", `${d3.event.pageX + 16}px`)
            .style("top", `${d3.event.pageY - 24}px`)
            .attr("data-education", data.bachelorsOrHigher)
        ;
    };

    const countyOnMouseOut = (item) => {
        tooltip.style("opacity", 0);
    };

    svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(topojson.feature(usTopologyData, usTopologyData.objects.counties).features)
        .enter()
        .append("path")
        .attr("class", "county")
        .attr("fill", (county) => {
            const fips = educationData.filter(item => item.fips === county.id);
            return fips[0] ? color(fips[0].bachelorsOrHigher) : color(0);
        })
        .attr("d", geoPath)
        .attr("data-fips", (county) => county.id)
        .attr("data-education", (county) => {
            const fips = educationData.filter(item => item.fips === county.id);
            return fips[0] ? fips[0].bachelorsOrHigher : 0;
        })
        .attr("id", (item) => `geo-${item.id}`)
        .on("mouseover", countyOnMouseOver)
        .on("mouseout", countyOnMouseOut)
    ;

    // states
    svg.append("path")
        .datum(topojson.mesh(usTopologyData, usTopologyData.objects.states, (a, b) => a !== b))
        .attr("class", "states")
        .attr("d", geoPath)

    // legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("id", "legend")
        .attr("transform", "translate(0, 40)");
    
    const xScale = d3.scaleLinear()
        .domain([2.6, 75.1])
        .rangeRound([600, 860]);
    
    const xAxis = d3.axisBottom()
        .scale(xScale)
        .tickSize(13)
        .tickFormat(data => `${Math.round(data)}%`)
        .tickValues(color.domain());
    
    legend.selectAll("rect")
        .data(
            color.range().map(item => {
                item = color.invertExtent(item);
                if (typeof(item[0]) === "undefined") {
                    item[0] = xScale.domain()[0];
                }
                if (typeof(item[1]) === "undefined") {
                    item[1] = xScale.domain()[1];
                }
                return item;
            })
        )
        .enter()
        .append("rect")
        .attr("height", 8)
        .attr("width", item => {
            const donas = xScale(item[1]) - xScale(item[0]);
            return donas;
        })
        .attr("x", item => xScale(item[0]))
        .attr("fill", item => color(item[0]))
    ;

    legend.call(xAxis)
        .select(".domain")
        .remove(); // removes last unused rect from legend
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded)