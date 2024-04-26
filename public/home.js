function fullscreen() {
	document.querySelector("body").requestFullscreen()
}

let panels = [];

window.onload = () => {
	panels.push(new Panel("temperatuur", 0, "#d70e48"));
	panels.push(new Panel("Humidity", 1, "#299ad0"));
	panels.push(new Panel("Pressure", 2, "#05d993"));
	panels.push(new Panel("Light", 3, "#d0b747"));
	panels.push(new Clock(4));
	panels.push(new Panel("Sound", 5, "#ffffff"));
	for (let i = 0; i < panels.length; i++) panels[i].render();
}

class Clock {
	constructor(id) {
		this.el = document.createElement("div");
		this.el.classList.add("panel");
		this.el.style.overflow = "hidden";
		this.el.id = "panel-"+id;
		document.getElementById("panelGrid").appendChild(this.el);
		
		/*
		<div class="time" style="position:absolute; left: auto; right: 1em; margin-left: auto; margin-right: auto;  text-align: center; top: 0em;">
			<u><h2 id="time" style="font-size: 0.65em;"></h2></u>
			<p id="date" style="font-size: 0.4em; line-height:0;"></p>
		</div>
		*/
		let div = document.createElement("div");
		this.el.appendChild(div);
		div.classList.add("time");
		div.style.textAlign = "center";
		this.time = document.createElement("h2");
		div.appendChild(this.time);
	}

	render() {
		//let days = ["", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]				
		//let months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"]
		let d = new Date();
		
		this.time.innerHTML = d.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":" + d.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
		//this.date.innerHTML = days[d.getDay()] + "<br><h5>" + (d.getDate()) + " " + months[d.getMonth()] + " " + (d.getFullYear()) + "</h5>";
	}
}
class Panel {
	constructor(title, id, color) {
		this.el = document.createElement("div");
		this.el.classList.add("panel");
		this.el.id = "panel-"+id;
		document.getElementById("panelGrid").appendChild(this.el);
		this.data = [];

		let date = new Date();
		let y = Math.random()*2;
		for (var i = 1; i < 100; i++) {
			y+= Math.random()-0.5;
			this.data.push({x: new Date(i), y: parseFloat(y)});
		}

		let options = {
			backgroundColor: "transparent",
			animationEnabled: true,
			theme: "dark1", // "light1", "light2", "dark1", "dark2"
			title:{
			  text: title
			},
			axisY: {
			  valueFormatString: "#0.#*",
			},
			data: [{
			  type: "splineArea", 
			  name: "temp",
			  yValueFormatString: "#0.#*",
			  color: color,
			  xValueType: "dateTime",
			  xValueFormatString: "DD MMM YY HH:mm",
			  dataPoints: this.data
			}]
		  };

		this.chart = new CanvasJS.Chart("panel-"+id, options);
	}

	render() {
		this.chart.render();
	}
}