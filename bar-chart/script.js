function onDOMContentLoaded() {
    fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json")
    .then(response => response.json())
    .then(json => {
        // Data definition
        const dataset = [...json.data]; // format: [["1947-01-01", 243.1], ...]
        const dates = dataset.map(item => new Date(item[0]));
        const gdps = dataset.map(item => item[1]);

        // SVG properties
        const width = 800, 
            height = 400, 
            padding = 60,
            translate = 10,
            barWidth = width / dataset.length;
        
        // Aux item
        const tooltip = document.getElementById("tooltip");

        // append svg element
        const svg = d3.select(".visualizer")
            .append("svg")
            .attr("width", width + (padding * 1.5))
            .attr("height", height + padding);
        
        // x-axis
        const xMin = d3.min(dates);
        const xMax = new Date(d3.max(dates));
        xMax.setMonth(xMax.getMonth() + 3); //to make axis larger than max value
        const xScale = d3.scaleTime()
            .domain([xMin, xMax])
            .range([0, width]);
        const xAxis = d3.axisBottom()
            .scale(xScale);
        
        svg.append("g")
            .call(xAxis)
            .attr("id", "x-axis")
            .attr("transform", `translate(${ padding }, ${ height + translate })`);
        
        // y-axis
        const yMax = d3.max(gdps);
        const yScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);
        const yAxis = d3.axisLeft(yScale);
        
        svg.append("g")
            .call(yAxis)
            .attr("id", "y-axis")
            .attr("transform", `translate(${ padding }, ${ translate })`);
        
        // bars
        const gdpScale = d3.scaleLinear()
            .domain([0, yMax])
            .range([0, height]);
        const scaledGdps = dataset.map(item => gdpScale(item[1]));
        
        const barMouseOverHandler = (e)  => {
            const bar = e.target;
            const index = parseInt(e.target.getAttribute("key"));
            const item = dataset[index];
            
            const date = item[0];
            const dateElement = tooltip.querySelector("#data-date");
            dateElement.textContent = date;
            tooltip.setAttribute("data-date", date);

            const gdp = `$${ item[1].toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,') } Billion`;
            const gdpElement = tooltip.querySelector("#data-gdp");
            gdpElement.textContent = gdp;

            const barXPos = bar.getBoundingClientRect().left;
            const median = dataset.length / 2;
            tooltip.classList.remove("hidden");
            tooltip.classList.add("visible");
            const xPos = index <= median ? 
                barXPos + translate : barXPos - translate - tooltip.offsetWidth;
            tooltip.style.left = `${ xPos }px`;
        };

        const barMouseOutHandler = (e) => {
            tooltip.classList.remove("visible");
            tooltip.classList.add("hidden");
        };
        
        svg.selectAll("rect")
            .data(scaledGdps)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", barWidth)
            .attr("height", (gdp) => gdp)
            .attr("x", (gdp, index) => xScale(dates[index]) + padding)
            .attr("y", (gdp) => (height - gdp) + translate)
            .attr("data-date", (gdp, index) => dataset[index][0])
            .attr("data-gdp", (gdp, index) => dataset[index][1])
            .attr("key", (gdp, index) => index)
            .on("mouseover", barMouseOverHandler)
            .on("mouseout", barMouseOutHandler);
        
        // tooltip init position
        const xAxisTop = document.getElementById("x-axis").getBoundingClientRect().top;
        tooltip.style.top = `${ xAxisTop - (padding * 2) }px`;
    });
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);