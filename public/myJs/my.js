const logoutBtn = document.getElementById("logout");
logoutBtn.addEventListener("click", function () {
	document.querySelector(".logout").click();
});

async function rejectCookie() {
	const nearbyHospitalsContainer = document.getElementById(
		"nearbyHospitalsContainer"
	);
	nearbyHospitalsContainer.innerHTML = `
    <div class="user-bx">
                                    <img src="images/ion/man (1).png" alt="" />
                                    <div>
                                        <button class="btn btn-outline card" onclick="getNearbyHospitals()">Get Nearby Hospitals</button>
                                    </div>
                                    <i class="las la-check-circle check-icon"></i>
                                </div>



    `;
	// nearbyHospitalsContainer.style.display = "none";
}

async function getNearbyHospitals() {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(
			function (position) {
				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;
				const url = `/api/hospitals/proximity?latitude=${latitude}&longitude=${longitude}&amenity=hospital&more=4`;

				fetch(url)
					.then((response) => {
						if (!response.ok) {
							throw new Error("Network response was not ok");
						}
						return response.json();
					})
					.then((data) => {
						const hospitalTableBody = document.getElementById(
							"nearbyHospitalsContainer"
						);
						const fragment = document.createDocumentFragment();
						function calculateTime(distance, speed) {
							// Calculate time in hours
							const timeInHours = distance / speed;

							// Convert time to hours and minutes
							const hours = Math.floor(timeInHours);
							const minutes = Math.round((timeInHours - hours) * 60);

							// Format the time
							if (hours >= 1) {
								return hours + " h," + minutes + " min";
							} else {
								return minutes + " min";
							}
						}

						data.forEach((hospital) => {
							const row = document.createElement("div");
							const drivingTime = calculateTime(hospital.proximity, 30);
							const publicTime = calculateTime(hospital.proximity, 20);
							const walkingTime = calculateTime(hospital.proximity, 5);

							row.classList.add("col-xl-3", "col-xxl-3", "col-sm-6");
							row.innerHTML = `
                                            <form action="">
                                                <div class="card bg-warning invoice-card">
                                                    <button class="reset" type="submit">
                                                        <div class="card-body d-flex pb-2 pt-2 mb-0">
                                                            <div class="icon me-2 d-flex justify-content-center align-items-center fs-1">
                                                                <i class="bi bi-hospital-fill fs-2 text-white"></i>
                                                            </div>
                                                            <div class="overflow-hidden text-nowrap " >
                                                                
                                                                    <h2  class="text-white  invoice-num fs-4">${hospital.name}</h2>
                                                                <p class="text-white m-0 p-0">${hospital.amenity}</p>
                                                                <p class="text-white fs-4 m-0 p-0"><i class='bx bx-location-plus fs-2 p-1 text-warning'></i><u>${hospital.proximity} Km</u></p>
                                                                <p class="text-white m-0 p-0 card-footer border-0 shadow-md text-nowrap fs-6">
                                                                    <span id="drivingTime"><i class='bx bxs-car mx-1 text-warning'></i>${drivingTime}</span>
                                                                    <span id="publicTransTime"><i class='bx bxs-bus mx-1 text-warning'></i>${publicTime}</span>
                                                                    <span id="walkingTime"><i class='bx bx-walk mx-1 text-warning'></i>${walkingTime}</span>
                                                                </p>
                                                                    <button id="directionBtn" class="btn btn-secondary  py-0 mx-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                                        <div class="text-white-emphasis  fs-3 m-0 p-0">
                                                                    <span><i class='bx bxs-direction-right text-warning fs-3 mx-1 py-0 mx-0'></i></span>View Location 

                                                                    </button>
                                                                    
                                                                    </div>
                                                                
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                            </form>
                                        `;
							fragment.appendChild(row);
						});

						// Clear previous data
						while (hospitalTableBody.firstChild) {
							hospitalTableBody.removeChild(hospitalTableBody.firstChild);
						}

						hospitalTableBody.appendChild(fragment);
					})
					.catch((error) => {
						console.error("Error fetching hospital data:", error);
					});
			},
			function (error) {
				console.error("Error getting geolocation:", error);
			}
		);
	} else {
		console.error("Geolocation is not supported by this browser.");
	}
}

// ?Get Remedy
const getRemedyLoader = document.querySelector(".getRemedyLoader");
const downArrow = document.querySelector(".downArrow");
const getRemedyUrl = `/diagnosis/getDiagnosis`;
const userRemedyBox = document.getElementById("userRemedy");

function getRemedyFunction(userId) {
	const userId1 = userId;
	downArrow.classList.remove("d-block");
	downArrow.classList.add("d-none");
	getRemedyLoader.classList.remove("d-none");
	getRemedyLoader.classList.add("d-block");
	dateTime1 = new Date();
	var formattedDateTime = dateTime1.toLocaleString();

	const userSymptomsTest = document.getElementById("userSymptoms").value;
	const requestBody = {
		userId: userId1,
		dateTime: dateTime1,
		userSymptoms: userSymptomsTest, // Assuming userSymptoms is defined elsewhere
	};

	fetch(getRemedyUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(requestBody),
	})
		.then((response) => {
			if (!response.ok) {
				userRemedyBox.classList.remove("d-none");

				userRemedyBox.innerHTML = `<h3 class="text-danger">There was an error fetching the remedy. Pleasy try again.</h3>`;

				throw new Error("Network response was not ok");
			}
			return response.json();
		})
		.then((data) => {
			userRemedyBox.classList.remove("d-none");
			userRemedyBox.innerHTML = `
			<h2 class="text-dark">Here is the remedy<span class="card-footer fs-6 text-break">${formattedDateTime}</span><span class="text-warning">${data.saveStatus}</span></h2>
			<h6 class="">
				${data.diagnosis}
			</h6>`;

			downArrow.classList.remove("d-none");
			downArrow.classList.add("d-block");
			getRemedyLoader.classList.remove("d-block");
			getRemedyLoader.classList.add("d-none");
			// Process the data as needed
		})
		.catch((error) => {
			console.error("There was a problem with the fetch operation:", error);
		});
}
