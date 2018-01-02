var uri = "ws://" + window.location.host + "/data";
var jsonObject = "";
var init = true;
function connect() {
        socket = new WebSocket(uri);
        socket.onopen = function(event) {
                console.log("opened connection to " + uri);
        };
        socket.onclose = function(event) {
                console.log("closed connection from " + uri);
        };
        socket.onmessage = function(event) {
            jsonObject = JSON.parse(event.data);
            init ? initChart(jsonObject) : null ;
            !init ? updateChart(jsonObject) : null;
            init = false;
            updateDPM(jsonObject);
            updateButtonFooter(jsonObject);
        };
        socket.onerror = function(event) {
                console.log("error: " + event.data);
        };
}
connect();
var dpmList = document.getElementById("DPM");
var button = document.getElementById("refresh"); 
var checkbox = document.getElementById("checkbox"); 
var interval = document.getElementById("interval");
var refreshIntervall;
/*checkbox.addEventListener('change', function() {
    if(this.checked) {
        console.log("AutoRefresh On !");
        refreshIntervall = setInterval(function(){ autoRefresh() },interval.value*60);
    } else {
        console.log("AutoRefresh Off !");
        clearInterval(refreshIntervall);
    }
});
button.addEventListener("click", function(event) {
    console.log("Refresh ...");
    socket.send("refresh");
});*/

var myChart;
function initChart(data) {
    var dataset = generateDataset(data);

    var canvas = document.getElementById("barCanvas");
    var ctx = canvas.getContext('2d');

    Chart.pluginService.register({
        afterDraw: function(chart) {
            if (typeof chart.config.options.lineAt != 'undefined') {
                var lineAt = chart.config.options.lineAt;
                var ctxPlugin = chart.chart.ctx;
                var xAxe = chart.scales[chart.config.options.scales.xAxes[0].id];
                var yAxe = chart.scales[chart.config.options.scales.yAxes[0].id];
                ctxPlugin.strokeStyle = "red";
                ctxPlugin.beginPath();
                lineAt = yAxe.getPixelForValue(lineAt);
                ctxPlugin.moveTo(xAxe.left, lineAt);
                ctxPlugin.lineTo(xAxe.right, lineAt);
                ctxPlugin.stroke();
            }
        }
    });

    myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                datasets: dataset
            },
            options: {
                lineAt: data["fpyTol"].Line1,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:false,
                            min: data["fpyTol"].Line1 - 5
                        }
                    }]
                },
                maintainAspectRatio: false,
                legend: {
                    onClick: (e) => e.stopPropagation(),
                    position: 'bottom',
                    labels: {
                        filter: function(legendItem, chartData) {
                            // Remove legend entry if line is not selected
                            if(legendItem.hidden === false ){
                                return true;
                            } else {
                                return false;
                            }
                        }
                    }
                }
            }
    });
} 
function updateChart(data) {
    var dataset = generateDataset(data);
    if(myChart.data.datasets.length === dataset.length){
        for (var i in dataset) {
            myChart.data.datasets[i].data = dataset[i].data;
            myChart.update();
        }
    } else {
        myChart.data.datasets = dataset;
        myChart.update();
    }
}
function generateDataset(data){
    var dataset = [];
    var i = 0;
    for (var key in data) {
        if (key.startsWith("fpyLine")){
            
            //Change Line Color to Red if it is less then Tolerance
            var tempBoderColor = [];
            var tempBackgroundColor = [];
            var j = 0;
            for (var day in data[key]) {
                if(data[key][day] <= data["fpyTol"].Line1){
                    tempBoderColor.push('rgba(255, 0, 0, 1)') ;
                    tempBackgroundColor.push('rgba(255, 0, 0, 0.2)') ;
                } else {
                    tempBoderColor.push(borderColor[i%8]);
                    tempBackgroundColor.push(backgroundColor[i%8]);
                }
            j++;
            }
            
            dataset.push({label: key,
                        data: [data[key].Sunday,data[key].Monday,data[key].Tuesday,data[key].Wednesday,data[key].Thursday,data[key].Friday],
                        backgroundColor: tempBackgroundColor,
                        borderColor: tempBoderColor,
                        borderWidth: 1});
            i++
        }
    }
    return dataset;
}
function updateDPM(data){
    while (dpmList.firstChild) {
        dpmList.removeChild(dpmList.firstChild);
    }
    for (var key in data) {
        if (key.startsWith("dpmLine")){
            appendItem(dpmList, key + ": "+ data[key]);
        }
    }
}

function updateButtonFooter(data){
    var lines = []
    for (var key in data) {
        if (key.startsWith("fpyLine")){
            lines.push(key.substring(7));
        }
    }
    var footer = document.getElementById("footer");
    //Get Button Div
    for (var i = 0; i < footer.childNodes.length; i++) {
        if (footer.childNodes[i].className == "toolbar-content toolbar-content-md") {
        var div = footer.childNodes[i];
            for (var j = 0; j < div.childNodes.length; j++) {
                if(div.childNodes[j].nodeType === 1) {
                    if(lines.indexOf(div.childNodes[j].textContent) > -1){
                        div.childNodes[j].style.display = null;
                    } else {
                        div.childNodes[j].style.display = 'none';
                    }
                }
            }
        break;
        }        
    }
}

function toggleLine(e){
    e.classList.toggle('active');
    for (var i in myChart.data.datasets) {
        if(myChart.data.datasets[i].label.substring(7) === e.firstChild.textContent){
            myChart.data.datasets[i].hidden = !myChart.data.datasets[i].hidden;
        }
    }
    myChart.update();
}

function autoRefresh() {
    socket.send("autoRefresh");
}

function appendItem(list, message) {
    var item = document.createElement("li");
    item.appendChild(document.createTextNode(message));
    list.appendChild(item);
}  
var backgroundColor2 = [
                'rgba(255, 99, 132, 0.2)',
                'rgba(54, 162, 235, 0.2)',
                'rgba(255, 206, 86, 0.2)',
                'rgba(75, 192, 192, 0.2)',
                'rgba(153, 102, 255, 0.2)',
                'rgba(255, 159, 64, 0.2)']
var borderColor2 = [
                'rgba(255,99,132,1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)']
var backgroundColor = [
                'rgba(54, 102, 255, 0.2)',
                'rgba(54, 122, 235, 0.2)',
                'rgba(54, 142, 215, 0.2)',
                'rgba(54, 162, 195, 0.2)',
                'rgba(54, 182, 175, 0.2)',
                'rgba(54, 202, 155, 0.2)',
                'rgba(54, 222, 135, 0.2)',
                'rgba(54, 242, 115, 0.2)']
var borderColor = [
                'rgba(54, 102, 255, 1)',
                'rgba(54, 122, 235, 1)',
                'rgba(54, 142, 215, 1)',
                'rgba(54, 162, 195, 1)',
                'rgba(54, 182, 175, 1)',
                'rgba(54, 202, 155, 1)',
                'rgba(54, 222, 135, 1)',
                'rgba(54, 242, 115, 1)']