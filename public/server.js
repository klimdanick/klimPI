Process = (Name, Id) => {
	let process = {};
	process.Name = Name;
	process.Id = Id;
	process.Element = document.createElement("div");
	process.Element.classList.add("process");
	process.update();
	document.documentElement.getElementsByClassName("process-list")[0].appendChild(this.Element);
	return process
}

update = async (this) => {
	this.Element.innerHTML = "";
	let response = await fetch("https://vps.klimdanick.nl/getStatus/"+this.Id);
	this.Status = await response.text();
	//this.Status = Status;
	let title = document.createElement("div");
	title.classList.add("process-title");
	title.innerText = this.Name;
	this.Element.appendChild(title);
	let hr = document.createElement("hr");
	hr.style.width = "100%";
	hr.style.borderColor = "#299ad0";
	this.Element.appendChild(hr);
	let statusSpan = document.createElement("span"); //<hr style="width: 100%; border-color: #299ad0;">
	statusSpan.classList.add("process-status-label");
	statusSpan.innerText = "Status | ";//Running";
	let statusSpan2 = document.createElement("span");
	statusSpan2.classList.add("process-status");
	statusSpan2.innerText = this.Status;
	statusSpan.appendChild(statusSpan2);
	if (this.Status == "Running") {
		hr.style.borderColor = "#05d993";
		statusSpan2.style.color = "#05d993";
	}
	this.Element.appendChild(statusSpan);
	//<span onclick="toggleProcess('Assetto Corsa')" class="process-toggle">Stop</span>
	let Button = document.createElement("span");
	Button.classList.add("process-toggle");
	if (this.Status == "Running") {
		Button.innerText = "stop";
		Button.classList.add("Running");
	}
	else {
		Button.innerText = "start";
		Button.classList.add("Stopped");
	}
	Button.setAttribute("onclick", "toggleProcess("+this.Id+")");
	this.Element.appendChild(Button);
}

toggle = async () => {
	if (this.Status == "Running") {
		let response = await fetch("https://vps.klimdanick.nl/stop/"+this.Id);
		console.log(response);
	} else {
		let response = await fetch("https://vps.klimdanick.nl/start/"+this.Id);
		console.log(response);
	}
	update();
}

let Processes = [];
window.onload = function() {
  Processes.push(Process("Assetto Corsa Server", 0));
  Processes.push(Process("QuoteBot", 1));
  Processes.push(Process("E2 Bot", 2));
};

function update() {
	Processes.forEach((item, index)=>{
		update(item);
	})
}

function toggleProcess(Id) {
	Processes.forEach((item, index)=>{
		if (item.Id == Id) toggle(item);
	})
}