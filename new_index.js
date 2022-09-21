
const getData = async () => {
    const api_url = 'https://api.alternative.me/fng/?limit=365';
    const fearAndGreedRes = await fetch(api_url);
    const fearAndGreedData = await fearAndGreedRes.json();
    const options = {
        method: 'GET',
        headers: {
            'X-RapidAPI-Key': '561cfbcb75msh43805fa99923e8cp132b81jsn90b57299acda',
            'X-RapidAPI-Host': 'coinranking1.p.rapidapi.com'
        }
    };
    const pricesRes = await fetch('https://api.coinranking.com/v2/coin/Qwsogvtv82FCd/history?timePeriod=1y', options)
    const pricesData = await pricesRes.json();


    let BitcoinData = pricesData.data.history;
    BitcoinData.pop()

    BitcoinData.forEach((current, index) => {
        current.price = +current.price
        current.date = new Date(current.timestamp * 1000).toISOString().split("T")[0]
        current.fearAndGreed = fearAndGreedData.data[index]
        current.fearAndGreed.value = +current.fearAndGreed.value
    })

    BitcoinData.reverse()
    return BitcoinData
}


(async () => {
    const data = await getData()

    let width = 900,
        height = 400,
        margin = 100;

    var dates = data.map(c => c.date);

    var domain = d3.extent(dates);
    var newStartDate = new Date(domain[0]).setDate(new Date(domain[0]).getDate());
    var newEndtDate = new Date(domain[1]).setDate(new Date(domain[1]).getDate());

    var xScaleTest = d3.scaleTime()
        .domain([new Date(newStartDate), new Date(newEndtDate)])
        .range([0, width - margin * 2]);

    var yScaleTest = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.price) * 1.1])
        .range([height - margin, 0]);

    /* Add SVG */
    var svg = d3.select("#container").append("svg")
        .attr("viewBox", `0 0 ${width + margin} ${height + margin}`)
        .append('g')
        .attr("transform", `translate(${margin}, ${margin})`);


    //Add Line
    var line = d3.line()
        .x(function (d) {
            return xScaleTest(new Date(d.date))
        })
        .y(function (d) {
            return yScaleTest(d.price)
        });


    /* Add Axis into SVG */
    var xAxis = d3.axisBottom(xScaleTest)
        .ticks(d3.timeMonth.every(1))
        .tickSizeOuter(0)
        .tickSizeInner(-height + margin)
        .tickFormat(d3.timeFormat("%b -%Y"));

    var yAxis = d3.axisLeft(yScaleTest)
        .ticks(12)
        .tickSize(-width + margin + 100)

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", `translate(0, ${height - margin})`)
        .call(xAxis)
        

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        

    let lines = svg.append('g')
        .attr('class', 'lines');

    lines.append("path")
        .attr("class", "line")
        .attr("d", () => line(data))
        .attr("stroke", "#7fb3d5")

    // Build color scale
    const scoreColor = d3
        .scaleSequential()
        .interpolator(d3.interpolate("#8d8d8d", "#379a80"))
        //.domain([0, d3.max(data, d => d.fearAndGreed.value)]); 
        .domain([0, 100]);

    svg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "circle")
        .attr("fill", d => scoreColor(d.fearAndGreed.value))
        .attr("r", 3)
        .attr("cx", function (d) {
            return xScaleTest((new Date(d.date)));
        })
        .attr("cy", function (d) {
            return yScaleTest(d.price);
        })


    svg.selectAll(".tick line")
            .attr("class", "axis_bar")
            .attr("stroke", "rgba(0, 0, 0, 0.1)")
    svg.selectAll(".domain").attr("stroke", "rgba(0, 0, 0, 0.1)")
})()
