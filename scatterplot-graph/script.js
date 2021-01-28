const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

function onDOMContentLoaded() {
    fetch(dataURL)
    .then(text => text.json())
    .then(json => {
        // Data definition
        const dataSet = json.map(item => {
            const splitTime = item.Time.split(":");
            item.Time = new Date(Date.UTC(2021, 0, 1, 0, splitTime[0], splitTime[1]));
            return item;
        });
        const timeFormat = d3.timeFormat("%M:%S");
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        // SVG Props
        const margin = {
                top: 10,
                right: 0,
                bottom: 20,
                left: 40
            },
            width = 800,
            height = 400;

        // append SVG element
        const svg = d3.select("#visualizer")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        
        // aux elements
        const tooltip = document.getElementById("tooltip");
        const tooltipBreak = document.getElementById("tooltip-break");
        
        // x axis
        const yearMin = d3.min(dataSet, item => item.Year) - 1;
        const yearMax = d3.max(dataSet, item => item.Year) + 1;
        const yearScale = d3.scaleTime()
            .domain([yearMin, yearMax])
            .range([margin.left, (width - margin.left - margin.right)]);
        const yearAxis = d3.axisBottom()
            .scale(yearScale)
            .tickFormat(d3.format("d"));

        svg.append("g")
            .call(yearAxis)
            .attr("id", "x-axis")
            .attr("transform", `translate(0, ${ height - margin.bottom })`);
        
        // y axis
        const timeMin = d3.min(dataSet, item => item.Time);
        const timeMax = d3.max(dataSet, item => item.Time);
        const timeScale = d3.scaleTime()
            .domain([timeMin, timeMax])
            .range([margin.top, (height - margin.top - margin.bottom)]);
        const timeAxis = d3.axisLeft()
            .scale(timeScale)
            .tickFormat(timeFormat);
        
        svg.append("g")
            .call(timeAxis)
            .attr("id", "y-axis")
            .attr("transform", `translate(${ margin.left }, ${ margin.top })`);
        
        // dots
        const dotMouseOverHandler = (e) => {
            const dot = e.target;
            const index = parseInt(dot.getAttribute("key"));
            const item = dataSet[index];

            const tooltipName = document.getElementById("tooltip-name");
            tooltipName.textContent = `${ item.Name } (${ item.Nationality })`;
            const tooltipTime = document.getElementById("tooltip-time");
            tooltipTime.textContent = `Year: ${ item.Year } - Time ${ item.Time.getMinutes() }:${ item.Time.getSeconds() }`;
            const tooltipDoping = document.getElementById("tooltip-doping");
            tooltipDoping.textContent = `${ item.Doping }`;

            if (item.Doping) {
                tooltipBreak.style.display = "block";
            } else {
                tooltipBreak.style.display = "none";
            }

            const x = dot.getBoundingClientRect().left + 20;
            const y = dot.getBoundingClientRect().top;

            tooltip.setAttribute("data-year", item.Year); 
            tooltip.style.left = `${ x }px`;
            tooltip.style.top = `${ y }px`;
            tooltip.classList.remove("hidden");
            tooltip.classList.add("visible");
        }

        const dotMouseOutHandler = (e) => {
            tooltip.classList.remove("visible");
            tooltip.classList.add("hidden");
        }

        svg.selectAll(".dot")
            .data(dataSet)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("r", 5)
            .attr("cx", data => yearScale(data.Year))
            .attr("cy", data => timeScale(data.Time))
            .attr("data-xvalue", data => data.Year)
            .attr("data-yvalue", data => data.Time.toISOString())
            .attr("transform", `translate(0, ${ margin.top })`)
            .attr("key", (data, index) => index)
            .style("fill", data => color(data.Doping !== ""))
            .on("mouseover", dotMouseOverHandler)
            .on("mouseout", dotMouseOutHandler);  
        
        // legend
        const legendGroup = svg.append("g")
            .attr("id", "legend");
        
        const legend = legendGroup.selectAll("#legend")
            .data(color.domain())
            .enter()
            .append("g")
            .attr("class", "legend-label")
            .attr("transform", (data, index) => `translate(0, ${ height / 2 - index * 20 })`);

        legend.append("rect")
            .attr("x", width - 10)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", color);
        
        legend.append("text")
            .attr("x", width - 15)
            .attr("y", 9)
            .style("text-anchor", "end")
            .style("font-size", ".6rem")
            .style("font-family", "Arial, Helvetica, sans-serif")
            .text(data => data ? "Riders with doping allegations" : "No doping allegations");
    })
    .catch(error => {
        throw error;
    });
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);