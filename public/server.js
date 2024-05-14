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
	//ACdata = process.tracks = await (await fetch("https://vps.klimdanick.nl/getACdata/"+process.Id)).json();
	process.configure = "vps.klimdanick.nl:443";
	//setInterval(update(process), 2000);
	return process;
}

async function update (process) {
	process.Element.innerHTML = "";
	let response = await fetch("https://vps.klimdanick.nl/getStatus/"+process.Id);
	process.Status = await response.text();
	//this.Status = Status;
	let title = document.createElement("div");
	title.classList.add("process-title");
	title.innerText = process.Name;
	process.Element.appendChild(title);
	let hr = document.createElement("hr");
	hr.style.width = "100%";
	hr.style.borderColor = "#299ad0";
	process.Element.appendChild(hr);
	let statusSpan = document.createElement("span"); //<hr style="width: 100%; border-color: #299ad0;">
	statusSpan.classList.add("process-status-label");
	statusSpan.innerText = "Status | ";//Running";
	let statusSpan2 = document.createElement("span");
	statusSpan2.classList.add("process-status");
	statusSpan2.innerText = process.Status;
	statusSpan.appendChild(statusSpan2);
	if (process.Status == "Running") {
		hr.style.borderColor = "#05d993";
		statusSpan2.style.color = "#05d993";
	}
	process.Element.appendChild(statusSpan);
	//<span onclick="toggleProcess('Assetto Corsa')" class="process-toggle">Stop</span>
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
	process.Element.appendChild(Button);

	if (process.configure) {
		let Config = document.createElement("span");
		Config.classList.add("process-toggle");
		Config.innerText = "config";
		Config.classList.add("Stopped");
		Config.setAttribute("onclick", "alert("+process.configure+")");
		process.Element.appendChild(Config);
	}

	if (process.tracks) {
		let Select = document.createElement("select");
		for (let i = 0; i < process.tracks.length; i++){
			opt = document.createElement('option');
			opt.value = process.tracks[i];
			opt.innerHTML = process.tracks[i];
			Select.appendChild(opt);
		}
		Select.onchange = () => {
			fetch("https://vps.klimdanick.nl/setTrack/"+process.Id+"/"+Select.value);
		}
		process.Element.appendChild(Select);
	}

	if (process.cars) {
		let Select = document.createElement("select");
		for (let i = 0; i < process.cars.length; i++){
			opt = document.createElement('option');
			opt.value = process.cars[i];
			opt.innerHTML = process.cars[i];
			Select.appendChild(opt);
		}
		Select.onchange = () => {
			fetch("https://vps.klimdanick.nl/setCar/"+process.Id+"/"+Select.value);
		}
		process.Element.appendChild(Select);
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