Process = (Name, Id) => {
	let process = {};
	process.Name = Name;
	process.Id = Id;
	process.Element = document.createElement("div");
	process.Element.classList.add("process");
	update(process);
	document.documentElement.getElementsByClassName("process-list")[0].appendChild(process.Element);
	Processes.push(process);
	return process;
}

ACpros = (process) => {
	process.configure = "http://vps.klimdanick.nl:8772";
	return process;
}

MCpros = (process) => {
	process.resetWorld = "fetch(`https://vps.klimdanick.nl/resetMCWorld/"+process.Id+"`);"
	return process;
}

async function update (process) {
	process.Element.innerHTML = "";
	let response = await fetch("https://vps.klimdanick.nl/getStatus/"+process.Id);
	process.Status = await response.text();
	//this.Status = Status;
	let title = document.createElement("div");
	title.classList.add("process-title");
	title.innerText = process.Name + " | ";
	process.Element.appendChild(title);
	let hr = document.createElement("hr");
	hr.style.width = "100%";
	hr.style.borderColor = "#299ad0";
	process.Element.appendChild(hr);
	let statusSpan = document.createElement("span");
	statusSpan.classList.add("process-status");
	statusSpan.innerText = process.Status;
	

	if (process.Status == "Running") {
		hr.style.borderColor = "#05d993";
		statusSpan.style.color = "#05d993";
	}
	title.appendChild(statusSpan);
	//<span onclick="toggleProcess('Assetto Corsa')" class="process-toggle">Stop</span>

	let graph = document.createElement("div");
	graph.id = "graph-"+process.Name;
	graph.classList.add("process-graph");
	process.Element.appendChild(graph);

	let options = {
		backgroundColor: "transparent",
		animationEnabled: false,
		theme: "dark1", // "light1", "light2", "dark1", "dark2"
		axisY: {
		  valueFormatString: "#0%",
		},
		data: [{
		  type: "splineArea", 
		  name: "cpu",
		  yValueFormatString: "#%",
		  color: "#d70e48",
		  xValueType: "dateTime",
		  xValueFormatString: "",
		  dataPoints: []
		},{
			type: "splineArea", 
			name: "ram",
			yValueFormatString: "#%",
			color: "#d0b747",
			xValueType: "dateTime",
			xValueFormatString: "",
			dataPoints: []
		  },{
			type: "splineArea", 
			name: "up",
			yValueFormatString: "#%",
			color: "#05d993",
			xValueType: "dateTime",
			xValueFormatString: "",
			dataPoints: []
		  },{
			type: "splineArea", 
			name: "down",
			yValueFormatString: "#%",
			color: "#299ad0",
			xValueType: "dateTime",
			xValueFormatString: "",
			dataPoints: []
		  }]
	  };

  	process.chart = new CanvasJS.Chart(graph.id, options);

	process.chart.render();

	let Buttons = document.createElement("div");
	Buttons.classList.add("process-buttons");
	process.Element.appendChild(Buttons);

	let Button = document.createElement("span");
	Button.classList.add("process-toggle");
	if (process.Status == "Running") {
		Button.innerText = "stop";
		Button.classList.add("Running");
	}
	else {
		Button.innerText = "start";
		Button.classList.add("Stopped");
	}
	Button.setAttribute("onclick", "toggleProcess("+process.Id+")");
	Buttons.appendChild(Button);

	if (process.configure) {
		let Config = document.createElement("span");
		Config.classList.add("process-toggle");
		Config.innerText = "config";
		Config.classList.add("Stopped");
		Config.setAttribute("onclick", "window.location.href = \""+process.configure+"\"");
		Buttons.appendChild(Config);
	}

	if (process.resetWorld) {
		let Config = document.createElement("span");
		Config.classList.add("process-toggle");
		Config.innerText = "reset world";
		Config.classList.add("Stopped");
		Config.setAttribute("onclick", process.resetWorld);
		Buttons.appendChild(Config);
	}

	
}

toggle = async (process) => {
	if (process.Status == "Running") {
		let response = await fetch("https://vps.klimdanick.nl/stop/"+process.Id);
		console.log(response);
	} else {
		let response = await fetch("https://vps.klimdanick.nl/start/"+process.Id);
		console.log(response);
	}
	updatePage();
}

let Processes = [];
window.onload = function() {

  ACpros(Process("Assetto Corsa Server", 0));
  Process("QuoteBot", 1);
  Process("E2 Bot", 2);
  Process("x server", 3);
  Process("xterm", 4);
  //Process("torcs", 5);
  Process("KotN server", 6);
  MCpros(Process("MC hardcore", 7));
  //Process("Jayden Webserver", 8);

  graphUpdateInterval= setInterval(() => {
	Processes.forEach((item, index)=>{
		updateGraph(item);
	})
  }, 1000);
  
};

function updatePage() {
	Processes.forEach((item, index)=>{
		update(item);
	})
}

function toggleProcess(Id) {
	Processes.forEach((item, index)=>{
		if (item.Id == Id) toggle(item);
	})
}

async function updateGraph(process) {
	
	let response = await fetch("https://vps.klimdanick.nl/getStats/"+process.Id);
	response = await response.json();
	response.cpu.forEach((item, index)=>{response.cpu[index].x = new Date(item.x);})
	response.ram.forEach((item, index)=>{response.ram[index].x = new Date(item.x);})
	response.up.forEach((item, index)=>{response.up[index].x = new Date(item.x);})
	response.down.forEach((item, index)=>{response.down[index].x = new Date(item.x);})
	process.chart.options.data[0].dataPoints = response.cpu;
	process.chart.options.data[1].dataPoints = response.ram;
	process.chart.options.data[2].dataPoints = response.up;
	process.chart.options.data[3].dataPoints = response.down;
	
	process.chart.render();
}

let graphUpdateInterval;