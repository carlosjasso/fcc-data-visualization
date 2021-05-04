const dataUrl = "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json";

const colors = { // https://coolors.co/05668d-679436-00bd9d-c57b57-e0bad7-d7263d-6f584b
    Action: "05668d",
    Adventure: "679436",
    Comedy: "00bd9d",
    Drama: "c57b57",
    Animation: "e0bad7",
    Family: "d7263d",
    Biography: "6f584b"
}

function onDOMContentLoaded() {
    // SVG props
    const width = 960,
        height = 570;

    // Append SVG element to document
    const svg = d3.select("#visualizer")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // treemap object definition
    const treemap = d3.treemap()
        .size([width, height])
        .paddingInner(1);

    d3.json(dataUrl, (error, data) => {
        if (error) {
            throw error;
        }

        const root = d3.hierarchy(data)
            .eachBefore((d) => {
                d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name;
            })
            .sum(sumBySize)
            .sort((a, b) => b.height - a.height || b.value - a.value);
        
        treemap(root);

        const cell = svg.selectAll("g")
            .data(root.leaves())
            .enter()
            .append("g")
            .attr("class", "group")
            .attr("transform", (d) => `translate(${d.x0},${d.y0})`);
        
        const mouseOverHandler = (e) => {
            const {name, category, value} = e.data;
            const tooltip = document.getElementById("tooltip");
            const tooltipName = tooltip.querySelector("#data-name");
            const tooltipCategory = tooltip.querySelector("#data-category");
            const tooltipValue = tooltip.querySelector("#data-value");
            const rect = document.getElementById(e.data.id);
            
            tooltipName.textContent = `Name: ${name}`;
            tooltipCategory.textContent = `Category: ${category}`;
            tooltipValue.textContent = `Value: ${value}`;
            
            const rectProps = rect.getBoundingClientRect();
            const x = rectProps.left + rectProps.width + 12;
            const y = rectProps.top;

            tooltip.setAttribute("data-value", value);
            tooltip.style.left = `${x}px`;
            tooltip.style.top = `${y}px`;
            tooltip.classList.remove("hidden");
            tooltip.classList.add("visible");
        };

        const mouseOutHandler = (e) => {
            tooltip.classList.remove("visible");
            tooltip.classList.add("hidden");
        };
        
        cell.append("rect")
            .attr("id", (d) => d.data.id)
            .attr("class", "tile")
            .attr("width", (d) => d.x1 - d.x0)
            .attr("height", (d) => d.y1 - d.y0)
            .attr("data-name", (d) => d.data.name)
            .attr("data-category", (d) => d.data.category)
            .attr("data-value", (d) => d.data.value)
            .attr("fill", (d) => color(d.data.category))
            .on("mouseover", mouseOverHandler)
            .on("mouseout", mouseOutHandler);
        
        cell.append("text")
            .attr("class", "tile-text")
            .selectAll("tspan")
            .data((d) => d.data.name.split(/(?=[A-Z][^A-Z])/g))
            .enter()
            .append("tspan")
            .attr("x", 4)
            .attr("y", (d, i) => 13 + i * 10)
            .text((d) => d);

        const categories = [];
        root.leaves().map(leaf => leaf.data.category).forEach(item => {
            if (!categories.includes(item)) {
                categories.push(item);
            }
        });

        const legendProps = {
            width: 500,
            offset: 10,
            rectSize: 15,
            hSpacing: 150,
            vSpacing: 10,
            textXOffset: 3,
            textYOffset: -2
        };
        
        // Append legend SVG element to document
        const legendSvg = d3.select("#legend")
            .append("svg")
            .attr("width", legendProps.width);

        const legendElementsPerRow = Math.floor(legendProps.width / legendProps.hSpacing);

        const legend = legendSvg.append("g")
            .attr("transform", `translate(60,${legendProps.offset})`)
            .selectAll("g")
            .data(categories)
            .enter()
            .append("g")
            .attr("transform", (d, i) => {
                const x = (i % legendElementsPerRow) * legendProps.hSpacing;
                const variance = Math.floor(i / legendElementsPerRow);
                const y = variance * legendProps.rectSize +
                    legendProps.vSpacing * variance;
                return `translate(${x},${y})`;
            });
        
        legend.append("rect")
            .attr("width", legendProps.rectSize)
            .attr("height", legendProps.rectSize)
            .attr("class", "legend-item")
            .attr("fill", (d) => color(d));
        
        legend.append("text")
            .attr("x", legendProps.rectSize + legendProps.textXOffset)
            .attr("y", legendProps.rectSize + legendProps.textYOffset)
            .text((d) => d);
    });
}

function sumBySize(d) {
    return d.value;
}

function color(category) {
    return `#${colors[category]}`;
}

document.addEventListener("DOMContentLoaded", onDOMContentLoaded);