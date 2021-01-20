const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";

function onDOMContentLoaded() {
    fetch(dataURL)
    .then(text => text.json())
    .then(json => {
        // Data definition
        const dataSet = [...json];
        console.log(dataSet);
        const timeFormat = d3.timeFormat("%M:%S");

        // SVG Props
        const margin = {
                top: 10,
                right: 10,
                bottom: 20,
                left: 10
            },
            width = 800,
            height = 400;

        // append SVG element
        const svg = d3.select("#visualizer")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
        
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
            .domain([timeMax, timeMin])
            .range([margin.top, (height - margin.top - margin.bottom)]);
        const timeAxis = d3.axisLeft()
            .scale(timeScale);
        
        svg.append("g")
            .call(timeAxis)
            .attr("id", "y-axis")
            .attr("transform", `translate(50, ${ margin.top })`);
        
        
    })
    .catch(error => {
        throw error;
    });
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);