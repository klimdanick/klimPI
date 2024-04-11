function mainLoop() {
	let days = ["", "Maandag", "Dinsdag", "Woensdag", "Donderdag", "Vrijdag", "Zaterdag", "Zondag"]				
	let months = ["Januari", "Februari", "Maart", "April", "Mei", "Juni", "Juli", "Augustus", "September", "Oktober", "November", "December"]
	let d = new Date();
	
	document.getElementById("time").innerHTML = d.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}) + ":" + d.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false});
	document.getElementById("date").innerHTML = days[d.getDay()] + "<br><h5>" + (d.getDate()) + " " + months[d.getMonth()] + " " + (d.getFullYear()) + "</h5>";
}

window.onload = function() {
	setTimeout(function(){document.querySelector("body").requestFullscreen()}, 5000);
	setInterval(mainLoop, 500);
}