let vehicle;

	function setup() {
		let canvas = createCanvas(windowWidth, windowHeight);
		canvas.elt.style.zIndex = -10
		document.documentElement.getElementsByClassName("slide")[0].appendChild(canvas.elt)
		vehicle = new Vehicle(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
		vehicle = new Vehicle(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
		vehicle = new Vehicle(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
		vehicle = new Vehicle(Math.floor(Math.random() * width), Math.floor(Math.random() * height));
	}

	function draw() {
		resizeCanvas(windowWidth, windowHeight);
		background(0);
		target= new Target(mouseX, mouseY);
		vehicle.wander();

		vehicle.update();
		vehicle.show();
	 	vehicle.edges();
	}