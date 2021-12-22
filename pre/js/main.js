import html2canvas from 'html2canvas';
//import { getInTooltip, getOutTooltip, positionTooltip } from './tooltip';
import { setRRSSLinks } from './rrss';
import 'url-search-params-polyfill';
import * as d3 from 'd3';

//Necesario para importar los estilos de forma automática en la etiqueta 'style' del html final
import '../css/main.scss';

///// VISUALIZACIÓN DEL GRÁFICO //////
let foxSteps = [
    {pasos: 'Bajo ((< 3.196 pasos)', ahr: 1},
    {pasos: 'Medio', ahr: 0.72},
    {pasos: 'Alto ((> 5.170)', ahr: 0.18}
];

let yamamotoSteps = [
    {pasos: 'Bajo ((< 4.503 pasos)', ahr: 1},
    {pasos: 'Medio bajo ((4.503-6.110)', ahr: 0.81},
    {pasos: 'Medio alto ((6.111-7.971)', ahr: 1.26},
    {pasos: 'Alto ((>= 7.972)', ahr: 0.46}
];

let leeSteps = [
    {pasos: 'Bajo ((+- 2.718 pasos)', ahr: 1},
    {pasos: 'Medio bajo ((+- 4.363)', ahr: 0.59},
    {pasos: 'Medio alto ((+- 5.905)', ahr: 0.54},
    {pasos: 'Alto ((+- 8.442)', ahr: 0.42}
];

let mauriceSteps = [
    {pasos: 2000, ahr: 1.51},
    {pasos: 4000, ahr: 1},
    {pasos: 6000, ahr: 0.68},
    {pasos: 8000, ahr: 0.49},
    {pasos: 10000, ahr: 0.40},
    {pasos: 12000, ahr: 0.35},
    {pasos: 14000, ahr: 0.34},
    {pasos: 16000, ahr: 0.34}
];

let margin = {top: 7.5, right: 15, bottom: 35, left: 25};

foxChart();
yamamotoChart();
leeChart();
mauriceChart();
setTimeout(() => {
    setChartCanvas()
}, 4000);

function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(" (").reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1,
            y = 0,
            dy = words.length <= 3 ? parseFloat(text.attr("dy")) : 0,
            tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", 0.45 + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
};

//Helpers en visualización
function foxChart() {
    let chartBlock = d3.select('#viz_fox');

    let width = parseInt(chartBlock.style('width')) - margin.left - margin.right,
        height = parseInt(chartBlock.style('height')) - margin.top - margin.bottom;

    let chart = chartBlock
        .append('svg')
        .lower()
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Eje X
    let x = d3.scaleBand()
        .domain(['Bajo ((< 3.196 pasos)', 'Medio', 'Alto ((> 5.170)'])
        .range([0, width]);

    let xAxis = function(g){
        g.call(d3.axisBottom(x).ticks(3).tickFormat(function(d) {
            return d;
        }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', '-' + height + '')
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll('.tick text')
        .call(wrap, 5);

    //Eje Y
    let y = d3.scaleLinear()
        .domain([0, 2])
        .range([height,0])
        .nice();
    
    let yAxis = function(svg){
        svg.call(d3.axisLeft(y).ticks(4).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 1) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width + '')
        })
        svg.call(function(g){g.select('.domain').remove()})
    }        
        
    chart.append("g")
        .call(yAxis);

    //Línea
    let line = d3.line()
        .x(d => x(d.pasos) + x.bandwidth() / 2)
        .y(d => y(+d.ahr))
        .curve(d3.curveNatural);

    chart.append("path")
        .data([foxSteps])
        .attr("class", 'line-chart-1')
        .attr("fill", "none")
        .attr("stroke", '#78bb6e')
        .attr("stroke-width", '2.5px')
        .attr("d", line);

    //Círculos
    chart.selectAll('circles')
        .data(foxSteps)
        .enter()
        .append('circle')
        .attr('class', 'circle-chart')
        .attr("r", '3.5')
        .attr("cx", function(d) { return x(d.pasos) + x.bandwidth() / 2})
        .attr("cy", function(d) { return y(+d.ahr); })
        .style("fill", '#78bb6e')
        .style("stroke", '#78bb6e')
        .style('opacity', '1');

    //Textos
    chart.selectAll('.text')
        .data(foxSteps)
        .enter()
        .append('text')
        .attr("x", function(d) { return x(d.pasos) + x.bandwidth() / 2})
        .attr("y", function(d) { return y(+d.ahr) - 12.5; })
        .attr("dy", ".35em")
        .attr("font-size", '0.85em')
        .text(function(d) { 
            if(d.ahr == 1) {
                return '1 (Referencia)';
            } else {
                return d.ahr.toString().replace('.',',')
            } 
        });
}

function yamamotoChart() {
    let chartBlock = d3.select('#viz_yamamoto');

    let width = parseInt(chartBlock.style('width')) - margin.left - margin.right,
        height = parseInt(chartBlock.style('height')) - margin.top - margin.bottom;

    let chart = chartBlock
        .append('svg')
        .lower()
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Eje X
    let x = d3.scaleBand()
        .domain(['Bajo ((< 4.503 pasos)', 'Medio bajo ((4.503-6.110)', 'Medio alto ((6.111-7.971)', 'Alto ((>= 7.972)'])
        .range([0, width]);

    let xAxis = function(g){
        g.call(d3.axisBottom(x).ticks(3).tickFormat(function(d) { return d; }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', '-' + height + '')
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll('.tick text')
        .call(wrap, 5);

    //Eje Y
    let y = d3.scaleLinear()
        .domain([0, 2])
        .range([height,0])
        .nice();
    
    let yAxis = function(svg){
        svg.call(d3.axisLeft(y).ticks(4).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 1) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width + '')
        })
        svg.call(function(g){g.select('.domain').remove()})
    }        
        
    chart.append("g")
        .call(yAxis);

    let line = d3.line()
        .x(d => x(d.pasos) + x.bandwidth() / 2)
        .y(d => y(+d.ahr))
        .curve(d3.curveNatural);

    chart.append("path")
        .data([yamamotoSteps])
        .attr("class", 'line-chart-1')
        .attr("fill", "none")
        .attr("stroke", '#78bb6e')
        .attr("stroke-width", '2.5px')
        .attr("d", line);

    //Círculos
    chart.selectAll('circles')
        .data(yamamotoSteps)
        .enter()
        .append('circle')
        .attr('class', 'circle-chart')
        .attr("r", '3.5')
        .attr("cx", function(d) { return x(d.pasos) + x.bandwidth() / 2})
        .attr("cy", function(d) { return y(+d.ahr); })
        .style("fill", '#78bb6e')
        .style("stroke", '#78bb6e')
        .style('opacity', '1');

    //Textos
    chart.selectAll('.text')
        .data(yamamotoSteps)
        .enter()
        .append('text')
        .attr("x", function(d) { return x(d.pasos) + x.bandwidth() / 2})
        .attr("y", function(d) { return y(+d.ahr) - 12.5; })
        .attr("dy", ".35em")
        .attr("font-size", '0.85em')
        .text(function(d) { 
            if(d.ahr == 1) {
                return '1 (Referencia)';
            } else {
                return d.ahr.toString().replace('.',',')
            } 
        });
}

function leeChart() {
    let chartBlock = d3.select('#viz_lee');

    let width = parseInt(chartBlock.style('width')) - margin.left - margin.right,
        height = parseInt(chartBlock.style('height')) - margin.top - margin.bottom;

    let chart = chartBlock
        .append('svg')
        .lower()
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Eje X
    let x = d3.scaleBand()
        .domain(['Bajo ((+- 2.718 pasos)', 'Medio bajo ((+- 4.363)', 'Medio alto ((+- 5.905)', 'Alto ((+- 8.442)'])
        .range([0, width]);

    let xAxis = function(g){
        g.call(d3.axisBottom(x).ticks(3).tickFormat(function(d) { return d; }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', '-' + height + '')
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll('.tick text')
        .call(wrap, 5);

    //Eje Y
    let y = d3.scaleLinear()
        .domain([0, 2])
        .range([height,0])
        .nice();
    
    let yAxis = function(svg){
        svg.call(d3.axisLeft(y).ticks(4).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 1) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width + '')
        })
        svg.call(function(g){g.select('.domain').remove()})
    }        
        
    chart.append("g")
        .call(yAxis);

    let line = d3.line()
        .x(d => x(d.pasos) + x.bandwidth() / 2)
        .y(d => y(+d.ahr))
        .curve(d3.curveNatural);

    chart.append("path")
        .data([leeSteps])
        .attr("class", 'line-chart-1')
        .attr("fill", "none")
        .attr("stroke", '#78bb6e')
        .attr("stroke-width", '2.5px')
        .attr("d", line);

    //Círculos
    chart.selectAll('circles')
        .data(leeSteps)
        .enter()
        .append('circle')
        .attr('class', 'circle-chart')
        .attr("r", '3.5')
        .attr("cx", function(d) { return x(d.pasos) + x.bandwidth() / 2})
        .attr("cy", function(d) { return y(+d.ahr); })
        .style("fill", '#78bb6e')
        .style("stroke", '#78bb6e')
        .style('opacity', '1');

    //Textos
    chart.selectAll('.text')
        .data(leeSteps)
        .enter()
        .append('text')
        .attr("x", function(d) { return x(d.pasos) + x.bandwidth() / 2})
        .attr("y", function(d) { return y(+d.ahr) - 12.5; })
        .attr("dy", ".35em")
        .attr("font-size", '0.85em')
        .text(function(d) { 
            if(d.ahr == 1) {
                return '1 (Referencia)';
            } else {
                return d.ahr.toString().replace('.',',')
            } 
        });
}

function mauriceChart() {
    let chartBlock = d3.select('#viz_maurice');

    let width = parseInt(chartBlock.style('width')) - margin.left - margin.right,
        height = parseInt(chartBlock.style('height')) - margin.top - margin.bottom;

    let chart = chartBlock
        .append('svg')
        .lower()
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //Eje X
    let x = d3.scaleLinear()
        .domain([0, 18000])
        .range([0, width]);

    let xAxis = function(g){
        g.call(d3.axisBottom(x).ticks(9).tickFormat(function(d, i) {
            if (i % 2 == 0) {
                return d;
            }
            }))
        g.call(function(g){
            g.selectAll('.tick line')
                .attr('y1', '0%')
                .attr('y2', '-' + height + '')
        })
        g.call(function(g){g.select('.domain').remove()});
    }

    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    //Eje Y
    let y = d3.scaleLinear()
        .domain([0, 2])
        .range([height,0])
        .nice();
    
    let yAxis = function(svg){
        svg.call(d3.axisLeft(y).ticks(4).tickFormat(function(d) { return d; }))
        svg.call(function(g){
            g.selectAll('.tick line')
                .attr('class', function(d,i) {
                    if (d == 1) {
                        return 'line-special';
                    }
                })
                .attr("x1", '0')
                .attr("x2", '' + width + '')
        })
        svg.call(function(g){g.select('.domain').remove()})
    }        
        
    chart.append("g")
        .call(yAxis);

    let line = d3.line()
        .x(d => x(+d.pasos))
        .y(d => y(+d.ahr))
        .curve(d3.curveNatural);

    chart.append("path")
        .data([mauriceSteps])
        .attr("class", 'line-chart-1')
        .attr("fill", "none")
        .attr("stroke", '#78bb6e')
        .attr("stroke-width", '2.5px')
        .attr("d", line);

    //Círculos
    chart.selectAll('circles')
        .data(mauriceSteps)
        .enter()
        .append('circle')
        .attr('class', 'circle-chart')
        .attr("r", '3.5')
        .attr("cx", function(d) { return x(d.pasos)})
        .attr("cy", function(d) { return y(+d.ahr); })
        .style("fill", '#78bb6e')
        .style("stroke", '#78bb6e')
        .style('opacity', '1');

    //Textos
    chart.selectAll('.text')
        .data(mauriceSteps)
        .enter()
        .append('text')
        .attr("x", function(d) { return x(+d.pasos)})
        .attr("y", function(d) { return y(+d.ahr) - 12.5; })
        .attr("dy", ".35em")
        .attr("font-size", '0.85em')
        .text(function(d) { 
            if(d.ahr == 1) {
                return '1 (Referencia)';
            } else {
                return d.ahr.toString().replace('.',',')
            } 
        });
}

///// REDES SOCIALES /////
setRRSSLinks();

///// ALTURA DEL BLOQUE DEL GRÁFICO //////
function getIframeParams() {
    const params = new URLSearchParams(window.location.search);
    const iframe = params.get('iframe');

    if(iframe == 'fijo') {
        setChartHeight('fijo');
    } else {
        setChartHeight();
    }
}

///Si viene desde iframe con altura fija, ejecutamos esta función. Si no, los altos son dinámicos a través de PYMJS
function setChartHeight(iframe_fijo) {
    if(iframe_fijo) {
        //El contenedor y el main reciben una altura fija
        //La altura del gráfico se ajusta más a lo disponible en el main, quitando títulos, lógica, ejes y pie de gráfico
        if(document.getElementsByClassName('container')[0].clientWidth > 600){
            document.getElementsByClassName('container')[0].style.height = '2100px';
            document.getElementsByClassName('main')[0].style.height = '2068px';
        } else if (document.getElementsByClassName('container')[0].clientWidth > 500) {
            document.getElementsByClassName('container')[0].style.height = '2100px';
            document.getElementsByClassName('main')[0].style.height = '2068px';
        } else if (document.getElementsByClassName('container')[0].clientWidth > 450) {
            document.getElementsByClassName('container')[0].style.height = '2150px';
            document.getElementsByClassName('main')[0].style.height = '2118px';
        } else if (document.getElementsByClassName('container')[0].clientWidth > 400) {
            document.getElementsByClassName('container')[0].style.height = '2410px';
            document.getElementsByClassName('main')[0].style.height = '2378px';
        } else if (document.getElementsByClassName('container')[0].clientWidth > 360) {
            document.getElementsByClassName('container')[0].style.height = '2482px';
            document.getElementsByClassName('main')[0].style.height = '2450px';
        } else {
            document.getElementsByClassName('container')[0].style.height = '2582px';
            document.getElementsByClassName('main')[0].style.height = '2550px';
        }
        
    } else {
        document.getElementsByClassName('main')[0].style.height = document.getElementsByClassName('main')[0].clientHeight + 'px';
    }    
}

getIframeParams();

///// DESCARGA COMO PNG O SVG > DOS PASOS/////
let innerCanvas;
let pngDownload = document.getElementById('pngImage');

function setChartCanvas() {
    html2canvas(document.querySelector("#chartBlock"), {width: document.querySelector('#chartBlock').clientWidth, height: document.querySelector('#chartBlock').clientHeight, imageTimeout: 12000, useCORS: true}).then(canvas => { innerCanvas = canvas; });
}

function setChartCanvasImage() {    
    var image = innerCanvas.toDataURL();
    // Create a link
    var aDownloadLink = document.createElement('a');
    // Add the name of the file to the link
    aDownloadLink.download = 'mortalidad_daily_steps.png';
    // Attach the data to the link
    aDownloadLink.href = image;
    // Get the code to click the download link
    aDownloadLink.click();
}

pngDownload.addEventListener('click', function(){
    setChartCanvasImage();
});

//Cambios de pestañas
let tabs = document.getElementsByClassName('tab');
let contenidos = document.getElementsByClassName('content');

for(let i = 0; i < tabs.length; i++) {
    tabs[i].addEventListener('click', function(e) {
        document.getElementsByClassName('main')[0].scrollIntoView();
        displayContainer(e.target);
    });
}

function displayContainer(elem) {
    let content = elem.getAttribute('data-target');

    //Poner activo el botón
    for(let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    elem.classList.add('active');

    //Activar el contenido
    for(let i = 0; i < contenidos.length; i++) {
        contenidos[i].classList.remove('active');
    }

    document.getElementsByClassName(content)[0].classList.add('active');
}