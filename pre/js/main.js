import html2canvas from 'html2canvas';
//import { getInTooltip, getOutTooltip, positionTooltip } from './tooltip';
import { setRRSSLinks } from './rrss';
import 'url-search-params-polyfill';
import * as d3 from 'd3';

//Necesario para importar los estilos de forma automática en la etiqueta 'style' del html final
import '../css/main.scss';

///// VISUALIZACIÓN DEL GRÁFICO //////
let mauriceSteps = [
    {pasos: 2000, ahr: 1.61},
    {pasos: 4000, ahr: 1},
    {pasos: 6000, ahr: 0.68},
    {pasos: 8000, ahr: 0.49},
    {pasos: 10000, ahr: 0.40},
    {pasos: 12000, ahr: 0.35},
    {pasos: 14000, ahr: 0.34},
    {pasos: 16000, ahr: 0.34}
];

let margin = {top: 5, right: 15, bottom: 17.5, left: 25};

foxChart();
yamamotoChart();
leeChart();
mauriceChart();

//Helpers en visualización
function foxChart() {

}

function yamamotoChart() {

}

function leeChart() {

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
        .attr("stroke-width", '2px')
        .attr("d", line);
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
        document.getElementsByClassName('container')[0].style.height = '612px';
        document.getElementsByClassName('main')[0].style.height = '580px';

        let titleBlock = document.getElementsByClassName('b-title')[0].clientHeight;
        let logicBlock = document.getElementsByClassName('chart__logics')[0].clientHeight;
        let footerBlock = document.getElementsByClassName('chart__footer')[0].clientHeight;
        let footerTop = 8, containerPadding = 8, marginTitle = 8, marginLogics = 12;

        //Comprobar previamente la altura que le demos al MAIN. El estado base es 588 pero podemos hacerlo más o menos alto en función de nuestros intereses

        let height = 580; //Altura total del main
        document.getElementsByClassName('chart__viz')[0].style.height = height - titleBlock - logicBlock - footerBlock - footerTop - containerPadding - marginTitle - marginLogics + 'px';
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
    aDownloadLink.download = 'longevidad_edv_saludable.png';
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