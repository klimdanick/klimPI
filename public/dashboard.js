function mainLoop() {
	let days = ["", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]				
	let months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"]
	let d = new Date();
	
	document.getElementById("time").innerHTML = d.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":" + d.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
	document.getElementById("date").innerHTML = days[d.getDay()] + "<br><h5>" + (d.getDate()) + " " + months[d.getMonth()] + " " + (d.getFullYear()) + "</h5>";
}

function nsLoop() {
	var params = {
		// Request parameters
		"station": "Brd",
		"maxJourneys": "4"
	};
  
	fetch("https://gateway.apiportal.ns.nl/reisinformatie-api/api/v2/departures?station=Brd&maxJourneys=9", {
		method: 'GET',
		headers: {
			"Ocp-Apim-Subscription-Key": "f920b2bbefcb486e98c950023f930fca"
		}
	})
	.then(res => res.json())
	.then(out => {
		let l = out["payload"]["departures"];
		document.getElementById("ns").innerHTML="";
		for (let i = 2; i < l.length; i++) {
			let tijdNu = new Date();
			let tijdAankomst = new Date(l[i]["actualDateTime"]);
			let deltaT = (Math.floor((tijdAankomst - tijdNu)/60000))+":"+(Math.floor((tijdAankomst - tijdNu)/1000)%60).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
			let vertraging = Math.round((tijdAankomst - new Date(l[i]["plannedDateTime"]))/60000);
			if (vertraging > 0) vertraging = "+" + vertraging;
			else vertraging = "";
			let message = "";
			let color = "#009A42";
			if (l[i]["product"]["categoryCode"] == "SPR") color = "#003082";
			if (l[i]["product"]["categoryCode"] == "IC") color = "#FFC917";
			if (l[i]["product"]["categoryCode"] == "ICD") color = "#ff7700";
			if (l[i]["messages"].length > 0) message = l[i]["messages"][0]["message"];
			if (l[i]["cancelled"]) color="#DB0029";
			/*if (tijdAankomst - tijdNu > 0)*/ document.getElementById("ns").innerHTML += "<div style=\"display: block; margin-top: 0.3em; line-height: 1em; font-size:300%;\"><p style=\"height: 1em; font-size: 0.7em; align-test:center; margin:0; margin-top: 0em; border-left: 6px solid "+color+"!important; line-height: 1em;\"><b>" + l[i]["direction"] + "</b></p><p style=\"font-size:0.4em; margin:0; margin-top: 0em; line-height: 1em;\">Spoor: " + l[i]["actualTrack"] + " Over: " + deltaT + " <span style=\"color: #DB0029\">" + vertraging + "</span>(" + tijdAankomst.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":" + tijdAankomst.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ")</p><p style=\"color:#DB0029; font-size:0.4em; margin:0; margin-top: 0em; line-height: 1em;\">" + message + "</p></div>"
			//console.log(l[i]);
		}
	}).catch(err => { throw err });
}
let nsloop, mainloop;
window.onload = function() {
	mainloop = setInterval(mainLoop, 500);
	nsloop = setInterval(nsLoop, 1000);
}

function fullscreen() {
	document.querySelector("body").requestFullscreen()
}