var resource;

var carsRacing = [];

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		resource = JSON.parse(this.responseText);
		carsDisplay(resource);
		createRace(resource);
	}
};
xhttp.open("GET", "/json/data.json", true);
xhttp.send();

function carsDisplay(resource) {
	var carsContainer = '';
	for (var i = 0; i < resource.cars.length; i++) {
		carsContainer +=
		'<div class="car-card-wrapper">' +
			'<div class="car-card">' +
				'<div class="car-card-front">' +
					'<img class="car-card-image" src="' + resource.cars[i].image + '" />' +
					'<div class="car-card-name">' + resource.cars[i].name + '</div>' +
				'</div>' +
				'<div class="car-card-back">' +
					'<img class="car-card-image" src="' + resource.cars[i].image + '" />' +
					'<div class="car-card-info">' +
						'<div class="car-card-desc">' + resource.cars[i].description + '</div>' +
						'<div class="car-card-speed">' + resource.cars[i].speed + ' km/h</div>' +
					'</div>' +
				'</div>' +
			'</div>' +
		'</div>';
	}
	document.getElementById("cars-container").innerHTML = carsContainer;

	addCarSelection();
}

function addCarSelection(){
	var carCards = document.getElementsByClassName("car-card");

	for (var i = 0; i < carCards.length; i++) {
		carCards[i].addEventListener("click", function () {
			if(this.classList.contains("active-card")){
				var removeCar = this.children[1].children[0].getAttribute("src");
				for (var i = 0; i < carsRacing.length; i++) {
					if(carsRacing[i].source == removeCar) {
						carsRacing.splice(i, 1);
						populateRaceTrack();
						break;
					}
				}
				this.classList.remove("active-card");
			}
			else {
				if(carsRacing.length < 3){
					this.classList.add("active-card");
					var cloneCar = {};
					cloneCar.source = this.children[1].children[0].getAttribute("src");
					cloneCar.speed = parseInt(this.children[1].children[1].children[1].innerText);
					carsRacing.push(cloneCar);
					populateRaceTrack();
				}
			}
		});
	}
}

function populateRaceTrack(){
	var carPlace = document.getElementsByClassName("car-holder");
	for (var i = 0; i < carPlace.length; i++) {
		carPlace[i].innerHTML = "";
		carPlace[i].removeAttribute("data-car-speed");
	}
	for (var i = 0; i < carsRacing.length; i++) {
		var raceCar = document.createElement("IMG");
		raceCar.setAttribute("src", carsRacing[i].source);
		carPlace[i].setAttribute("data-car-speed", carsRacing[i].speed);
		carPlace[i].appendChild(raceCar);
	}
	checkStartStatus();
}

document.getElementById("search-box").oninput = function () {
	var search = this.value;
	var carNamesAll = document.getElementsByClassName("car-card-name");

	for (var i = 0; i < carNamesAll.length; i++) {
		var carName = carNamesAll[i].innerText;
		if (carName.indexOf(search) != -1) {
			document.getElementsByClassName("car-card-wrapper")[i].style.display = "block";
		}
		else {
			document.getElementsByClassName("car-card-wrapper")[i].style.display = "none";
		}
	}
}

function createRace(resource) {
	var raceTracks = 3;
	var raceGrid = 10;
	var raceDistance = resource.distance;
	var periodValue = raceDistance / raceGrid;
	var trafficLightChangeTime = resource.traffic_lights[0].duration;
	
	for (var i = 0; i < raceTracks; i++) {
		var raceTrackHeight = (100 / raceTracks).toFixed(2);
		var raceTrackOffset = raceTrackHeight * i;
		var raceTrack = document.createElement("DIV");
		raceTrack.classList.add("race-track");
		raceTrack.style.height = raceTrackHeight + "%";
		raceTrack.style.top = raceTrackOffset + "%";
		document.getElementById("track-container").appendChild(raceTrack);
		var carHolder = document.createElement("DIV");
		carHolder.classList.add("car-holder");
		carHolder.style.height = raceTrackHeight + "%";
		document.getElementById("car-start").appendChild(carHolder);
		document.getElementById("track-container").style.height = raceTracks * 100 + "px";
	}
	
	for (var i = 0; i < raceGrid; i++) {
		var racePeriod = (100 / raceGrid).toFixed(2);
		var racePeriodElement = document.createElement("DIV");
		racePeriodElement.classList.add("race-period");
		racePeriodElement.setAttribute("data-period-value", (periodValue * (i+1)).toFixed() + " km");
		racePeriodElement.style.width = racePeriod + "%";
		document.getElementById("race-field").appendChild(racePeriodElement);
	}

	for (var i = 0; i < resource.speed_limits.length; i++) {
		var signOffset = (100 * resource.speed_limits[i].position / raceDistance).toFixed(2);
		var signPeriod = document.createElement("SPAN");
		signPeriod.classList.add("sign-period");
		signPeriod.setAttribute("data-sign-value", resource.speed_limits[i].speed);
		signPeriod.style.left = signOffset + "%";
		document.getElementById("race-field").appendChild(signPeriod);
	}

	var trafficOffset = (100 * resource.traffic_lights[0].position / raceDistance).toFixed(2);
	var trafficPeriod = document.createElement("SPAN");
	trafficPeriod.classList.add("traffic-period");
	trafficPeriod.style.left = trafficOffset + "%";
	var trafficLight = document.createElement("SPAN");
	trafficLight.classList.add("traffic-light");
	trafficPeriod.appendChild(trafficLight);
	document.getElementById("race-field").appendChild(trafficPeriod);

	var trafficInterval = setInterval(function(){
		document.getElementsByClassName("traffic-light")[0].classList.toggle("stop");
	}, trafficLightChangeTime);
}

document.getElementById("anim-speed").oninput = function () {
	var animFieldEntered = this.value;
	var limitDigits = /\d/g;
	var animResult = animFieldEntered.match(limitDigits);
	if(animResult){
		var anim = parseInt(animResult.join(""));
		if(anim == 0){
			document.getElementById("anim-speed").value = "";
		} else if (anim > 0 && anim <= 100) {
			document.getElementById("anim-speed").value = anim;
		} else {
			document.getElementById("anim-speed").value = 100;
		}
	} else {
		document.getElementById("anim-speed").value = "";
	}
	checkStartStatus();
}

function checkStartStatus() {
	if(document.getElementById("anim-speed").value != "" && carsRacing.length) {
		document.getElementById("start-button").removeAttribute("disabled");
	} else {
		document.getElementById("start-button").setAttribute("disabled", "disabled");
	}
}

document.getElementById("start-button").onclick = function() {
	var raceDistance = resource.distance;
	var carsHolders = document.getElementsByClassName("car-holder");
	var animSpeed = document.getElementById("anim-speed").value;
	var signOffsetOne = parseInt(window.getComputedStyle(document.getElementsByClassName("sign-period")[0], null).getPropertyValue("left"));
	var signOffsetTwo = parseInt(window.getComputedStyle(document.getElementsByClassName("sign-period")[1], null).getPropertyValue("left"));
	var trafficOffset = parseInt(window.getComputedStyle(document.getElementsByClassName("traffic-period")[0], null).getPropertyValue("left"));
	var fullRace = parseInt(window.getComputedStyle(document.getElementById("race-field"), null).getPropertyValue("width"));
	var stopOne = 22;
	var stopTwo = 28;
	var stopThree = 45;
	var trafficLightComplete = [];
	var raceCarPositions = [];
	var raceTime = setInterval(function(){
		for (var i = 0; i < carsRacing.length; i++) {
			var carTraveled = parseInt(window.getComputedStyle(carsHolders[i], null).getPropertyValue("left"));
			var carSpeed = carsHolders[i].getAttribute("data-car-speed");
			if(carTraveled < signOffsetOne){
				var carTravelTime = ((60 / (carSpeed / stopOne)) * 60).toFixed();
				var carTravelFinal = carTravelTime / animSpeed;
				carsHolders[i].style.left = signOffsetOne + 1 + "px";
				carsHolders[i].style.transitionDuration = carTravelFinal + "s";
			}
			else if(carTraveled < trafficOffset){
				var carTravelTime = ((60 / (60 / 6)) * 60).toFixed();
				var carTravelFinal = carTravelTime / animSpeed;
				carsHolders[i].style.left = trafficOffset + 1 + "px";
				carsHolders[i].style.transitionDuration = carTravelFinal + "s";
			}
			else if ((!document.getElementsByClassName("traffic-light")[0].classList.contains("stop") || trafficLightComplete[i]) && carTraveled <= signOffsetTwo){
				trafficLightComplete[i] = true;
				var carTravelTime = ((60 / (carSpeed / 17)) * 60).toFixed();
				var carTravelFinal = carTravelTime / animSpeed;
				carsHolders[i].style.left = signOffsetTwo + 1 + "px";
				carsHolders[i].style.transitionDuration = carTravelFinal + "s";
			}
			else if (carTraveled > signOffsetTwo && carTraveled <= fullRace){
				var carTravelTime = ((60 / (80 / 5)) * 60).toFixed();
				var carTravelFinal = carTravelTime / animSpeed;
				carsHolders[i].style.left = fullRace + 1 + "px";
				carsHolders[i].style.transitionDuration = carTravelFinal + "s";
			}
			else if (carTraveled > fullRace && !carsHolders[i].classList.contains("completed-race")){
				raceCarPositions.push(i);
				carsHolders[i].classList.add("completed-race");
				if(raceCarPositions.length == 1) {
					carsHolders[i].classList.add("first-place");
				}
				else if (raceCarPositions.length == 2){
					carsHolders[i].classList.add("second-place");
				}
				else if (raceCarPositions.length == 3){
					carsHolders[i].classList.add("third-place");
				}
				else {
					carsHolders[i].classList.add("no-podium");
				}
				if(raceCarPositions.length == carsRacing.length){
					clearInterval(raceTime);
				}
			}
		}
	}, 50);
}