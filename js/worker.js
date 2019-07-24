function getMaxOfArray(numArray) {
	return Math.max.apply(null, numArray);
}

function processBlock(text, cases) {

	var output = [];
	var ref = [];
	var split = text.split("\n");

	var result = '';

	for(var i=0; i<cases.length; i++) {
		output[i] = [];
	}
	output[cases.length] = [];

	if(split.length == 0) return;

	var clone = split.slice(0);

	for(var i=0; i<split.length; i++) {

		split[i] = split[i].trim();
		var match = false;
		
		for(var j=0; j<cases.length; j++) {

			var usespliter = false;
			var splitter = '';

			if(cases[j].indexOf('|') > -1) {
				usespliter = true;
				splitter = '|';
			}

			if(cases[j].indexOf('/') > -1) {
				usespliter = true;
				splitter = '/';
			}

			if(usespliter) {

				var vars = cases[j].split(splitter);

				for(var k=0; k<vars.length; k++) {

					var regex = new RegExp( "\\b" + vars[k].trim() + "\\b", 'gi');
			// 		// if(split[i].indexOf(vars[k].trim()) > -1 && output[j].indexOf(split[i]) == -1) {
			// 		// if(split[i].match(regex) && output[j].indexOf(split[i]) == -1 ) {
			// 		// 	output[j].push(split[i]);
			// 		// 	match = true;
			// 		// }
					if( split[i].match("^"+vars[k].trim()+" ") || split[i].match(" "+vars[k].trim()+"$") || split[i].match(" "+vars[k].trim()+" ") || split[i].match("^"+vars[k].trim()+"$"))  {
						if(output[j].indexOf(split[i]) == -1) {
							output[j].push(split[i]);
							match = true;
						}
					}
				}
			} else {

				var regex = new RegExp("\\b" + cases[j].trim() + "\\b", 'gi');
				// if(split[i].indexOf(cases[j]) > -1 && output[j].indexOf(split[i]) == -1) {
				// if(split[i].match(regex) && output[j].indexOf(split[i]) == -1) {
				// 	output[j].push(split[i]);
				// 	match = true;
				// }

				if( split[i].match("^"+cases[j].trim()+" ") || split[i].match(" "+cases[j].trim()+"$") || split[i].match(" "+cases[j].trim()+" ") || split[i].match("^"+cases[j].trim()+"$"))  {
					if(output[j].indexOf(split[i]) == -1) {
						output[j].push(split[i]);
						match = true;
					}
				}
			}

		}
		if(match) clone.splice(clone.indexOf(split[i]), 1);
	}
	
	output[cases.length] = clone;
	
	var max = [];

	for(var i=0; i<output.length; i++) max.push(output[i].length);

	var arrmax = getMaxOfArray(max);
	
	var div = '';
	for(var i=0; i<output.length; i++) div += "***;"
	div += "\n";

	for(var j=0; j<arrmax; j++) {

		var str = [];

		for(var i=0; i<output.length; i++) {
			str.push(output[i][j]);
		}

		if(j == 0) result += split[0]+";"+str.join(";")+"\n";
		else result += ";"+str.join(";")+"\n";
	}

	result += div;

	/* Charts data */
	var data = [];
	for(var i=0; i<output.length; i++) data.push(output[i].length);
	
	var labels = cases;
	// labels[labels.length] = 'misc';
	for(var i=0; i<labels.length; i++) labels[i] = labels[i].replace(/\|/g, ' / ');

	var chartsinfo = [data, labels];

	return [result, output, chartsinfo];
}

function makeTable(csv) {

	csv = csv.split("\n");

	var table = '<table><thead><tr>';
	
	var temp = csv[0].split(';');
	for(var i=0; i<temp.length; i++) table += '<td>'+temp[i]+'</td>';

	table += '<td>misc</td>';

	table += '</tr></thead><tbody>';

	for(var i=1; i<csv.length; i++) {
		table += '<tr>';

		temp = csv[i].split(';');
		for(var k=0; k<temp.length; k++) table += '<td>'+temp[k]+'</td>';

		table += '</tr>';
	}

	table += '</tbody></table>';

	return table;
	//document.querySelector('#table').innerHTML = table;
}

onmessage = function(e) {
	
	console.log('Process started');
	
	/* Local Mess */
	if(e.data[0] == 'processlocal') {

		var result = "keyword;"+e.data[2].join(";").replace(/\|/g, ' / ')+";misc\n";
		var temp = processBlock(e.data[1], e.data[2]);
		result += temp[0];

		temp[2][1][temp[2][1].length] = 'misc';

		postMessage(['processlocal', result, temp[2]]);
	}

	/* Total Mess */
	if(e.data[0] == 'processblocks') {

		if(!e.data[1]) {
			console.log('No blocks to process');
			return;
		}

		var result = "keyword;"+e.data[2].join(";").replace(/\|/g, ' / ')+";misc\n"; 
		var blocks = e.data[1].split("\n\n");
		var chartsinfo = [];

		for(var i=0; i<blocks.length; i++) {
			var temp = processBlock(blocks[i], e.data[2]);
			result += temp[0];

			chartsinfo[1] = temp[2][1]; // Labels
			if(i == 0) chartsinfo[0] = temp[2][0]; // Value
			else for(var j=0; j<temp[2][0].length; j++) chartsinfo[0][j] += temp[2][0][j];
				
			postMessage(['progress', parseInt(i*100/blocks.length)]);
		}
		chartsinfo[1][chartsinfo[1].length] = 'misc';

		postMessage(['processblocks', result, chartsinfo]);
	}

	/* Make table */
	if(e.data[0] == 'maketable') {
		var table = makeTable(e.data[1]);
		postMessage(['maketable', table]);
	}
}