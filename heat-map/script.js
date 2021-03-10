const dataURL = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

function onDOMContentLoaded() {
    fetch(dataURL)
    .then(data => data.json())
    .then(json => {
        // Object.keys(json) => ["baseTemperature", "monthlyVariance"]
        const dataset = json["monthlyVariance"];
        const minYear = dataset[0]["year"];
        const maxYear = dataset[dataset.length - 1]["year"];
        const midYear = ((maxYear - minYear) / 2) + minYear;
        // https://coolors.co/277da1-577590-4d908e-43aa8b-90be6d-f9c74f-f9844a-f8961e-f3722c-f94144
        const colors = {"CG Blue":"277da1","Queen Blue":"577590","Cadet Blue":"4d908e","Zomp":"43aa8b","Pistachio":"90be6d","Maize Crayola":"f9c74f","Mango Tango":"f9844a","Yellow Orange Color Wheel":"f8961e","Orange Red":"f3722c","Red Salsa":"f94144"};
        const baseTemperature = parseFloat(json["baseTemperature"]);
        const temperatures = [];
        let minTemperature = null;
        let maxTemperature = null;
        dataset.forEach(item => {
            item["month"] -= 1 // to math JS Date type month #
            item["temperature"] = baseTemperature + item["variance"];
            temperatures.push(item["temperature"]); // add calculated temperature to dataset
            if (minTemperature === null || item["temperature"] < minTemperature) {
                minTemperature = item["temperature"];
            }
            if (maxTemperature === null || item["temperature"] > maxTemperature) {
                maxTemperature = item["temperature"];
            }
        });
        const temperatureStep = (maxTemperature - minTemperature) / Object.keys(colors).length;

        const dimensions = {
            width: 5 * Math.ceil(dataset.length / 12),
            height: 33 * 12
        }

        const legendDimensions = {
            width: 0,
            height: 40
        }

        const margin = {
            top: 24,
            right: 8,
            bottom: 40,
            left: 8 * 12
        }

        const container = d3.select(".graph-container");
        
        const heading = container.append("div")
            .classed("graph-heading", true);
        
        const tooltip = document.querySelector("#tooltip");
        const tipMonthFormatter = d3.time.format.utc("%b");
        
        // title
        heading.append("h1")
            .attr("id", "title")
            .text("Monthly Global Land-Surface Temperature");

        // description
        heading.append("h3")
            .attr("id", "description")
            .text(`${minYear} - ${maxYear}: Base Temperature ${baseTemperature}°C`);

        // SVG
        const visualizer = container.append("div")
            .classed("visualizer", true);

        const svg = visualizer.append("svg")
            .attr({
                width: dimensions.width + margin.left + margin.right,
                height: dimensions.height + margin.top + margin.bottom + legendDimensions.height + 8
            });
            
        // x-axis
        const xScale = d3.scale
            .ordinal()
            .domain(dataset.map(item => item.year))
            .rangeRoundBands([0, dimensions.width], 0, 0);
        
        const xFormatter = d3.time.format.utc('%Y');

        const xAxis = d3.svg.axis()
            .scale(xScale)
            .tickValues(xScale.domain().filter(year => year % 10 === 0))
            .tickFormat(year => xFormatter(new Date(year, 0, 1)))
            .tickSize(8, 1)
            .orient("bottom");
        
        svg.append("g")
            .attr("id", "x-axis")
            .attr("transform", `translate(${margin.left}, ${dimensions.height + margin.top})`)
            .call(xAxis);

        // y-axis
        const yScale = d3.scale
            .ordinal()
            .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) // JS Date type months
            .rangeRoundBands([0, dimensions.height], 0, 0);
        
        const yFormatter = d3.time.format.utc("%B");
        
        const yAxis = d3.svg.axis()
            .scale(yScale)
            .tickValues(yScale.domain())
            .tickFormat(month => yFormatter(new Date(0, month)))
            .orient("left")
            .tickSize(8, 1);
        
        svg.append("g")
            .attr("id", "y-axis")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .call(yAxis);
        
        // data
        svg.append("g")
            .attr("id", "map-data")
            .attr("transform", `translate(${margin.left}, ${margin.top})`)
            .selectAll("rect")
            .data(dataset)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr({
                x: (item) => xScale(item.year),
                y: (item) => yScale(item.month),
                width: (item) => xScale.rangeBand(item.year),
                height: (item) => yScale.rangeBand(item.month)
            })
            .attr("fill", (item) => {
                let color = null;
                const colorKeys = Object.keys(colors);
                for (let i = 0; i < colorKeys.length; i++) {
                    const minRange = minTemperature + (temperatureStep * i);
                    const maxRange = minTemperature + (temperatureStep * (i + 1));
                    if (item["temperature"] >= minRange && item["temperature"] <= maxRange) {
                        color = `#${colors[colorKeys[i]]}`;
                        break;
                    }
                }
                return color;
            })
            .attr("data-month", (item) => item["month"])
            .attr("data-year", (item) => item["year"])
            .attr("data-temp", (item) => item["temperature"])
            .attr("id", (item, index) => `map-data-item${index}`)
            .on("mouseover", (item, index) => {
                const rect = document.querySelector(`#map-data-item${index}`);
                const rectPos = rect.getBoundingClientRect();

                const tipDate = `${item["year"]} - ${tipMonthFormatter(new Date(0, item["month"]))}`;
                tooltip.querySelector("#tip-date").textContent = tipDate;
                const tipTemperature = `${item["temperature"].toFixed(2)}°C`;
                tooltip.querySelector("#tip-temperature").textContent = tipTemperature;
                const tipVariance = `${item["variance"].toFixed(2)}°C`;
                tooltip.querySelector("#tip-variance").textContent = tipVariance;
                tooltip.setAttribute("data-year", item["year"]);
                
                tooltip.style.left = item["year"] <= midYear ? `${rectPos.left + 8}px` : 
                    `${rectPos.left - 122}px`;
                tooltip.style.top = `${rectPos.top - 20}px`;

                tooltip.hidden = false;
            })
            .on("mouseout", (item) => {
                tooltip.hidden = true;
            });
        
        // legend
        const legendSVG = svg.append("g")
            .attr("id", "legend")
            .attr("transform", `translate(${margin.left}, ${dimensions.height + margin.top + margin.bottom})`);
        
        legendSVG.append("g")
            .attr("id", "legend-colors")
            .selectAll("rect")
            .data(Object.keys(colors))
            .enter()
            .append("rect")
            .attr({
                width: legendDimensions.height,
                height: legendDimensions.height
            })
            .attr("x", (item, index) => legendDimensions.height * index)
            .attr("fill", (item) => `#${colors[item]}`);

        const steps = [];
        for (let i = 0; i < Object.keys(colors).length; i++) {
            steps.push(minTemperature + (temperatureStep * i));
        }
        
        legendSVG.append("g")
            .attr("id", "legend-colors")
            .selectAll("text")
            .data(steps)
            .enter()
            .append("text")
            .text((item) => `${item.toFixed(1)}+`)
            .attr({
                width: legendDimensions.height - 8,
                height: legendDimensions.height - 8
            })
            .attr("x", (item, index) => (legendDimensions.height * index) + 6)
            .attr("y", (legendDimensions.height / 2) + 6)
            .style("font-size", 12)
            .attr("fill", "#ffffff");
    })
    .catch(error => {
        console.error(error);
        alert("There's been an error and it's been logged into the console.");
    });
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);