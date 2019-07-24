function getMaxOfArray(numArray) {
	return Math.max.apply(null, numArray);
}

function saveState(obj, key) {
	if(localStorage.getItem(key)) obj.value = localStorage.getItem(key);
	// obj.addEventListener('change', function(){ localStorage.setItem(key, obj.value); });
	obj.addEventListener('blur', function(){ localStorage.setItem(key, obj.value); });
	// obj.addEventListener('keyup', function(){ localStorage.setItem(key, obj.value); });
}

var go = document.querySelector('#go');
var inputtext = document.querySelector('#input');
var download = document.querySelector('#download');
var clusters = document.querySelector('#clusters');
var uselocalmess = document.querySelector('#uselocalmess');

var everything = document.querySelector('#everything');

var exportclusters = document.querySelector('#exportclusters');
var exporteverything = document.querySelector('#exporteverything');
var exportlocal = document.querySelector('#exportlocal');
var savegraph = document.querySelector('#savegraph');

var exporteverythingfile = document.querySelector('#exporteverythingfile');
var exportclustersfile = document.querySelector('#exportclustersfile');
var exportlocalfile = document.querySelector('#exportlocalfile');
var downloadfile = document.querySelector('#downloadfile');
var graphfile = document.querySelector('#graphfile');

var maketable = document.querySelector('#maketable');

var blocklinks = document.querySelector('#block-links');

var progressbar = document.querySelector('.progressbar .bar'); 

/* Local mess */
saveState(inputtext, 'input');

inputtext.addEventListener('blur', function(){
	exportlocal.setAttribute('href', 'data:application/octet-stream,'+encodeURIComponent(inputtext.value));
});

/* Clusters */
saveState(clusters, 'clusters');

clusters.addEventListener('blur', function(){
	exportclusters.setAttribute('href', 'data:application/octet-stream,'+encodeURIComponent(clusters.value));
});

/* Mess */
saveState(everything, 'everything');

everything.addEventListener('blur', function(){
	exporteverything.setAttribute('href', 'data:application/octet-stream,'+encodeURIComponent(everything.value));
	// process();
});

/* Use local mess */
if(localStorage.getItem('uselocalmess') == 'checked') uselocalmess.checked = true;
if(localStorage.getItem('uselocalmess') == 'unchecked') uselocalmess.checked = false;

uselocalmess.addEventListener('change', function(){

	if(this.checked) localStorage.setItem('uselocalmess', 'checked');
	else localStorage.setItem('uselocalmess', 'unchecked');

	startProcess();
});

/* File names */
saveState(exporteverythingfile, 'exporteverythingfile');

// exporteverything.innerHTML = '<i class="fi-page-export"></i> Export '+exporteverythingfile.value+'.txt';
// exporteverything.setAttribute('download', exporteverythingfile.value+'.txt');

exporteverythingfile.addEventListener('change', function(){
	if(this.value != '') {
		exporteverything.setAttribute('download', this.value+'.txt');
		// exporteverything.innerHTML = '<i class="fi-page-export"></i> Export '+this.value+'.txt';
	}
});

saveState(exportclustersfile, 'exportclustersfile');

// exportclusters.innerHTML = '<i class="fi-page-export"></i> Export '+exportclustersfile.value+'.txt';
// exportclusters.setAttribute('download', exportclustersfile.value+'.txt');

exportclustersfile.addEventListener('change', function(){
	exportclusters.setAttribute('download', this.value+'.txt');
	// exportclusters.innerHTML = '<i class="fi-page-export"></i> Export '+this.value+'.txt';
});

saveState(exportlocalfile, 'exportlocalfile');

// exportlocal.innerHTML = '<i class="fi-page-export"></i> Export '+exportlocalfile.value+'.txt';
// exportlocal.setAttribute('download', exportlocalfile.value+'.txt');

exportlocalfile.addEventListener('change', function(){
	exportlocal.setAttribute('download', this.value+'.txt');
	// exportlocal.innerHTML = '<i class="fi-page-export"></i> Export '+this.value+'.txt';
});

saveState(downloadfile, 'downloadfile');

// download.innerHTML = '<i class="fi-download"></i> Download '+downloadfile.value+'.csv';
// download.setAttribute('download', downloadfile.value+'.csv');

downloadfile.addEventListener('change', function(){
	if(this.value != '') {
		download.setAttribute('download', this.value+'.csv');
		download.innerHTML = '<i class="fi-download"></i> Download '+this.value+'.csv';
	}
});

saveState(graphfile, 'graphfile');

// savegraph.innerHTML = '<i class="fi-download"></i> Download '+graphfile.value+'.png';
// savegraph.setAttribute('download', graphfile.value+'.png');

graphfile.addEventListener('change', function(){
	savegraph.setAttribute('download', this.value+'.png');
	// savegraph.innerHTML = '<i class="fi-download"></i> Download '+this.value+'.png';
});


/* Export links */
exportclusters.setAttribute('href', 'data:application/octet-stream,'+encodeURIComponent(clusters.value));
exporteverything.setAttribute('href', 'data:application/octet-stream,'+encodeURIComponent(everything.value));
exportlocal.setAttribute('href', 'data:application/octet-stream,'+encodeURIComponent(inputtext.value));


var bgWorker = new Worker("js/worker.js");

bgWorker.onmessage = function(e) {
	// result.textContent = e.data;
	
	if(e.data[0] == 'processlocal' || e.data[0] == 'processblocks') {
		console.log('Process finished');

		localStorage.setItem('result', e.data[1]);
		download.setAttribute('href', makeTextFile(e.data[1]));

		progressbar.style.width = '100%';
		progressbar.innerHTML = '<i class="fi-clock"></i> 100% Complete';

		// download.setAttribute('class', 'button fadein visible success');
		download.innerHTML = '<i class="fi-download"></i> Download '+downloadfile.value+'.csv';
		download.setAttribute('download', downloadfile.value+'.csv');
		download.classList.add('visible');

		// document.querySelector('#charts').classList.add('done');
		buildCharts(e.data[2]);
		updateBlocks();
	}

	if(e.data[0] == 'progress') {
		// console.log(e.data[1]);
		// download.setAttribute('class', 'button warning');
		// download.innerHTML = '<i class="fi-clock"></i> '+e.data[1]+'% Complete';
		progressbar.innerHTML = '<i class="fi-clock"></i> '+e.data[1]+'% Complete';
		progressbar.style.width = e.data[1]+'%';
	};

	if(e.data[0] == 'maketable') {
		// console.log(e.data[1]);
	}	
}


function startProcess() {
	// download.setAttribute('class', 'button fadein');
	download.classList.remove('visible');
	// download.setAttribute('href', '#');
	// download.removeAttribute('disabled');
	// download.innerHTML = '<i class="fi-x-circle"></i> Download is not ready yet';
	// document.querySelector('#charts').classList.remove('done');
	process();
}

go.addEventListener('click', function(e){
	e.preventDefault();
	startProcess();
});

if(maketable) maketable.addEventListener('click', function(e){
	e.preventDefault();
	
	var csv = localStorage.getItem('result');
	if(!csv) {
		console.log('No results stored. Please Process first');
		return;
	}

	bgWorker.postMessage(['maketable', csv]);
});

function makeTextFile(text) {
    var data = new Blob([text], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
		window.URL.revokeObjectURL(textFile);
    }

    var textFile = window.URL.createObjectURL(data);

    return textFile;
}

function process() {

	var text = inputtext.value;
	var blocks = everything.value.split("\n\n");
	var cases = clusters.value.split("\n");

	if(clusters.value == '') { 
		console.log('No Clusters!');
		return; 
	}

	if(text == '' && blocks == '') return;
	if(cases.length < 1) return;

	updateBlocks();

	/* Start process */
	if(uselocalmess.checked) {
		if(text != '') bgWorker.postMessage(['processlocal', text.trim(), cases]);
	} else {
		if(blocks.length > 0 && blocks != '') bgWorker.postMessage(['processblocks', everything.value, cases]);
	}
}

function buildCharts(chartsinfo) {
	if(!chartsinfo) return;

	var data = chartsinfo[0];
	var labels = chartsinfo[1];

	document.querySelector('#canvas').innerHTML = '<canvas id="overview"></canvas>';

	var ctx = document.querySelector('#overview').getContext("2d");

	var myChart = new Chart(ctx, {
	    type: 'horizontalBar',
	    data: {
	        labels: labels, //["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
	        datasets: [{
	            label: 'Clusters distribution',
	            data: data, //[12, 19, 3, 5, 2, 3],
	            backgroundColor: 'rgba(255, 99, 132, 0.2)', 
	            borderColor: 'rgba(255,99,132,1)',
	            borderWidth: 1
	        }]
	    },
	    options: {
			responsive: true,
			// maintainAspectRatio: false,
	    	animation: {
	    		onComplete: function(animation){
	    			var chartInstance = this.chart;
                    var ctx = chartInstance.ctx;
                    ctx.textAlign = "center";

                    Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                        var meta = chartInstance.controller.getDatasetMeta(i);
                        // var max = getMaxOfArray(dataset.data);
                        Chart.helpers.each(meta.data.forEach(function (bar, index) {
                        	var offset = 15;
                        	if(dataset.data[index] > 100) offset = 20;
                            ctx.fillText(dataset.data[index], bar._model.x + offset, bar._model.y - 7);
                        }),this)
                    }),this);
	    			// document.querySelector('#savegraph').setAttribute('href', this.toBase64Image());
	    			document.querySelector('#savegraph').setAttribute('href', document.querySelector('#overview').toDataURL());
	    		}
	    	}
	    }
	});
}

function updateBlocks() {

	document.querySelector('#blocks').classList.remove('done');

	var blocks = everything.value.split("\n\n");

	if(blocks.length > 0 && blocks != '') {

		var links = '';
		
		tempblocks = [];

		for(var i=0; i<blocks.length; i++) {
			
			var regexp = /^(.*)$/m;
			var name = blocks[i].trim().match(regexp);
			
			tempblocks.push(name[0]);
			//<a class="button hollow small custom-block" data-key="'+i+'" href="#">'+name[0]+'</a>
		}

		var hash = tempblocks.join('|');
		
		if(blocklinks.getAttribute('data-hash') == '' || blocklinks.getAttribute('data-hash') != hash) {

			blocklinks.setAttribute('data-hash', hash);

			for(var i=0; i<tempblocks.length; i++) {
				links += '<div><input type="checkbox" class="custom-block" id="block'+i+'" data-key="'+i+'" /> <label for="block'+i+'" data-key="'+i+'">'+tempblocks[i]+'</label></div>';
			}

			blocklinks.innerHTML = links; 
		}

		var blockclicks = document.querySelectorAll('.custom-block');
		var activecheckboxes = document.querySelectorAll('.custom-block:checked');
		for(var i=0; i<blockclicks.length; i++) {
			
			blockclicks[i].addEventListener('change', function(e){

				var activecheckboxes = document.querySelectorAll('.custom-block:checked');
				
				if(!activecheckboxes) return;

				inputtext.value = '';

				for(var j=0; j<activecheckboxes.length; j++) {
					inputtext.value += blocks[activecheckboxes[j].getAttribute('data-key')];
					localStorage.setItem('input', inputtext.value);
				}
			});
		}

		// document.querySelector('#blocks').style.display = 'block';
		document.querySelector('#blocks').classList.add('done');
	} else {
		// document.querySelector('#blocks').style.display = 'none';
		document.querySelector('#blocks').classList.remove('done');
	}
}

function loadSamples() {
	fetch('./samples.txt', {
		method: 'get'
	}).then(function(response) {
		console.log('Response');
		response.text().then(function (text) {
			everything.value = text;
		});
	}).catch(function(err) {
		console.log('Error');
		console.log(err)
		// Error :(
	});

	fetch('./clusters.txt', {
		method: 'get'
	}).then(function(response) {
		console.log('Response');
		response.text().then(function (text) {
			clusters.value = text;
		});
	}).catch(function(err) {
		console.log('Error');
		console.log(err)
		// Error :(
	});
}

document.querySelector('.load-samples').addEventListener('click', function(e){
	e.preventDefault();
	loadSamples();
});



var tabs = document.querySelectorAll('#tabs a');
var tabsContent = document.querySelectorAll('.tab-content');

if(tabs) tabs.forEach(function(tab, index){
	tab.addEventListener('click', function(e){
		e.preventDefault();
		var id = this.getAttribute('href').replace('#', '');
		tabs.forEach(function(t){
			t.classList.remove('active');
		});
		tabsContent.forEach(function(tabContent){
			tabContent.classList.remove('active');
		});
		document.querySelector('#'+id).classList.add('active');
		this.classList.add('active');
	});
});