class Process {
	constructor(Name, Id) {
		this.Name = Name;
		this.Id= Id;
		this.update();
		document.documentElement.getElementsByClassName("process-list")[0].appendChild(this.Element);
	}
	
	update() {
		
		fetch("https://vps.klimdanick.nl/getStatus").then(response => {console.log(response); console.log(response.text()); this.Status = response.text();}).catch(error => {});
		
		//this.Status = Status;
		this.Element = document.createElement("div");
		this.Element.classList.add("process");
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
		this.Element.appendChild(Button);
		document.documentElement.getElementsByClassName("process-list")[0].appendChild(this.Element);
	}
}

let Processes = [];
window.onload = function() {
  Processes.push(new Process("Assetto Corsa Server", 0));
  /*
  Processes.push(new Process("QuoteBot", "Stopped"));
  Processes.push(new Process("Viking Server", "Stopped"));
  Processes.push(new Process("QuoteApi", "Stopped"));
  Processes.push(new Process("E2 Bot", "Stopped"));
  */
};

function update() {
	document.documentElement.getElementsByClassName("process-list")[0].innerHTML = "";
	Processes.forEach((item, index)=>{
		item.update();
	})
}