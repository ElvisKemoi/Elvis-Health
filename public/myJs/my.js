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

async function showLocation(long, lat, zoom) {
	const googleMapUrl = `http://maps.google.com/?ie=UTF8&ll=${Number(
		lat
	)},${Number(long)}&spn=0.093419,0.169086&t=m&z=${zoom}&output=embed`;

	const googleMap = document.querySelector("#googleMap");
	googleMap.innerHTML = "";
	googleMap.innerHTML = `
        <iframe
            width="100%"
            class="rounded"
            src="${googleMapUrl}"
            height="100%"
            style="border: 0"
            allowfullscreen=""
            loading="lazy"
            referrerpolicy="no-referrer-wzhen-downgrade">
        </iframe>
    `;
	// googleMap.classList.remove("invisible");
}

async function getNearbyHospitals() {
	if ("geolocation" in navigator) {
		navigator.geolocation.getCurrentPosition(
			function (position) {
				const latitude = position.coords.latitude;
				const longitude = position.coords.longitude;

				const url = `/api/hospitals/proximity?latitude=${latitude}&longitude=${longitude}&amenity=hospital&more=8`;
				showLocation(longitude, latitude, 13);

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
                                           
                                                <div class="card bg-warning invoice-card">
                                                     <button class="reset">
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
																
                                                                    <button id="directionBtn" class="btn btn-secondary  py-0 mx-0"  onclick="showLocation('${hospital.location[0]}','${hospital.location[1]}',18)"
																	>
                                                                        <div class="text-white-emphasis  fs-3 m-0 p-0">
                                                                    <span><i class='bx bxs-direction-right text-warning fs-3 mx-1 py-0 mx-0'></i></span>View Location 

                                                                    </button>
                                                                    
                                                                    </div>
                                                                
                                                            </div>
                                                        </div>
                                                    </button>
                                                </div>
                                         
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
		datetime: dateTime1,
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
			getRequestList(userId1);

			// Process the data as needed
		})

		.catch((error) => {
			console.error("There was a problem with the fetch operation:", error);
		});
}

// ? Get Request list

async function getRequestList(userid) {
	const requestsUrl = `getRequestList/${userid}`;
	const requestListList = document.querySelector(".requestListList");
	const requestListWeek = document.querySelector(".requestListWeek");
	const requestListDay = document.querySelector(".requestListDay");
	requestListList.innerHTML = "";
	requestListWeek.innerHTML = "";
	requestListDay.innerHTML = "";

	// requestListList.innerHTML = "";

	fetch(requestsUrl, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		// body: JSON.stringify(requestBody),
	})
		.then((response) => {
			if (response.ok) {
				return response.json();
			} else {
				console.log("There was an error in the request.");
			}
		})
		.then((data1) => {
			const realRequests = data1.requests;
			let hours24 = [];
			let week = [];
			let month = [];
			let unknown = [];
			realRequests.forEach((date) => {
				const result = checkDate(date.datetime);
				if (result === "The input date is within the last 24 hours.") {
					hours24.push(date);
					week.push(date);
					month.push(date);
				} else if (
					result ===
					"The input date lies within the past week and the past month."
				) {
					week.push(date);
					month.push(date);
				} else if (
					result ===
					"The input date lies within the past month but not the past week."
				) {
					month.push(date);
				} else {
					unknown.push(date);
				}
			});

			month.forEach((item) => {
				const maxLength = 40;
				const truncatedText =
					item.userSymptoms.length > maxLength
						? item.userSymptoms.slice(0, maxLength) + "..."
						: item.userSymptoms;
				const truncatedRemedy =
					item.diagnosis.length > maxLength
						? item.diagnosis.slice(20, maxLength) + "..."
						: item.diagnosis;
				// console.log(truncatedRemedy);

				let row1 = document.createElement("tr");
				let date = new Date(item.datetime);
				let formattedDate = date.toLocaleDateString("en-US", {
					month: "long",
					day: "2-digit",
					year: "numeric",
				});
				let localTime = date.toLocaleTimeString("en-US", { hour12: true });
				row1.classList.add("dropdown");

				row1.innerHTML = `
				<td>
								<svg
									class="bgl-success tr-icon"
									width="63"
									height="63"
									viewBox="0 0 63 63"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g>
										<path
											d="M35.2219 42.9875C34.8938 42.3094 35.1836 41.4891 35.8617 41.1609C37.7484 40.2531 39.3453 38.8422 40.4828 37.0758C41.6477 35.2656 42.2656 33.1656 42.2656 31C42.2656 24.7875 37.2125 19.7344 31 19.7344C24.7875 19.7344 19.7344 24.7875 19.7344 31C19.7344 33.1656 20.3523 35.2656 21.5117 37.0813C22.6437 38.8477 24.2461 40.2586 26.1328 41.1664C26.8109 41.4945 27.1008 42.3094 26.7727 42.993C26.4445 43.6711 25.6297 43.9609 24.9461 43.6328C22.6 42.5063 20.6148 40.7563 19.2094 38.5578C17.7656 36.3047 17 33.6906 17 31C17 27.2594 18.4547 23.743 21.1016 21.1016C23.743 18.4547 27.2594 17 31 17C34.7406 17 38.257 18.4547 40.8984 21.1016C43.5453 23.7484 45 27.2594 45 31C45 33.6906 44.2344 36.3047 42.7852 38.5578C41.3742 40.7508 39.3891 42.5063 37.0484 43.6328C36.3648 43.9555 35.55 43.6711 35.2219 42.9875Z"
											fill="#2BC155"
										></path>
										<path
											d="M36.3211 31.7274C36.5891 31.9953 36.7203 32.3453 36.7203 32.6953C36.7203 33.0453 36.5891 33.3953 36.3211 33.6633L32.8812 37.1031C32.3781 37.6063 31.7109 37.8797 31.0055 37.8797C30.3 37.8797 29.6273 37.6008 29.1297 37.1031L25.6898 33.6633C25.1539 33.1274 25.1539 32.2633 25.6898 31.7274C26.2258 31.1914 27.0898 31.1914 27.6258 31.7274L29.6437 33.7453L29.6437 25.9742C29.6437 25.2196 30.2562 24.6071 31.0109 24.6071C31.7656 24.6071 32.3781 25.2196 32.3781 25.9742L32.3781 33.7508L34.3961 31.7328C34.9211 31.1969 35.7852 31.1969 36.3211 31.7274Z"
											fill="#2BC155"
										></path>
									</g>
								</svg>
							</td>
							<td>
								<h6 class="fs-16 font-w600 mb-0">
									<a href="javascript:void(0);" class="text-black"
										>${truncatedText}</a
									>
								</h6>
								<span class="fs-14">Remedy Request</span>
							</td>
							<td>
								<h6 class="fs-16 text-black font-w600 mb-0">${formattedDate}</h6>
								<span class="fs-14">${localTime}</span>
							</td>
							<td>
								<span class="fs-16 text-black font-w600">${truncatedRemedy}</span>
							</td>
							<td>
								<span class="text-success fs-16 font-w500 text-end d-block"
									><button class="btn btn-sm btn-danger deleteBtn" onclick="deleteRequest('${userid}', '${item.datetime}')">Delete</button>
									</span
								>
							</td>
				`;
				requestListList.appendChild(row1);
			});
			week.forEach((item) => {
				let row1 = document.createElement("tr");
				const maxLength = 40;
				const truncatedText =
					item.userSymptoms.length > maxLength
						? item.userSymptoms.slice(0, maxLength) + "..."
						: item.userSymptoms;
				const truncatedRemedy =
					item.diagnosis.length > maxLength
						? item.diagnosis.slice(20, maxLength) + "..."
						: item.diagnosis;
				let date = new Date(item.datetime);
				let formattedDate = date.toLocaleDateString("en-US", {
					month: "long",
					day: "2-digit",
					year: "numeric",
				});
				let localTime = date.toLocaleTimeString("en-US", { hour12: true });

				row1.innerHTML = `
				<td>
								<svg
									class="bgl-success tr-icon"
									width="63"
									height="63"
									viewBox="0 0 63 63"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g>
										<path
											d="M35.2219 42.9875C34.8938 42.3094 35.1836 41.4891 35.8617 41.1609C37.7484 40.2531 39.3453 38.8422 40.4828 37.0758C41.6477 35.2656 42.2656 33.1656 42.2656 31C42.2656 24.7875 37.2125 19.7344 31 19.7344C24.7875 19.7344 19.7344 24.7875 19.7344 31C19.7344 33.1656 20.3523 35.2656 21.5117 37.0813C22.6437 38.8477 24.2461 40.2586 26.1328 41.1664C26.8109 41.4945 27.1008 42.3094 26.7727 42.993C26.4445 43.6711 25.6297 43.9609 24.9461 43.6328C22.6 42.5063 20.6148 40.7563 19.2094 38.5578C17.7656 36.3047 17 33.6906 17 31C17 27.2594 18.4547 23.743 21.1016 21.1016C23.743 18.4547 27.2594 17 31 17C34.7406 17 38.257 18.4547 40.8984 21.1016C43.5453 23.7484 45 27.2594 45 31C45 33.6906 44.2344 36.3047 42.7852 38.5578C41.3742 40.7508 39.3891 42.5063 37.0484 43.6328C36.3648 43.9555 35.55 43.6711 35.2219 42.9875Z"
											fill="#2BC155"
										></path>
										<path
											d="M36.3211 31.7274C36.5891 31.9953 36.7203 32.3453 36.7203 32.6953C36.7203 33.0453 36.5891 33.3953 36.3211 33.6633L32.8812 37.1031C32.3781 37.6063 31.7109 37.8797 31.0055 37.8797C30.3 37.8797 29.6273 37.6008 29.1297 37.1031L25.6898 33.6633C25.1539 33.1274 25.1539 32.2633 25.6898 31.7274C26.2258 31.1914 27.0898 31.1914 27.6258 31.7274L29.6437 33.7453L29.6437 25.9742C29.6437 25.2196 30.2562 24.6071 31.0109 24.6071C31.7656 24.6071 32.3781 25.2196 32.3781 25.9742L32.3781 33.7508L34.3961 31.7328C34.9211 31.1969 35.7852 31.1969 36.3211 31.7274Z"
											fill="#2BC155"
										></path>
									</g>
								</svg>
							</td>
							<td>
								<h6 class="fs-16 font-w600 mb-0">
									<a href="javascript:void(0);" class="text-black"
										>${truncatedText}</a
									>
								</h6>
								<span class="fs-14">Remedy Request</span>
							</td>
							<td>
								<h6 class="fs-16 text-black font-w600 mb-0">${formattedDate}</h6>
								<span class="fs-14">${localTime}</span>
							</td>
							<td>
								<span class="fs-16 text-black font-w600">${truncatedRemedy}</span>
							</td>
							<td>
								<span class="text-success fs-16 font-w500 text-end d-block"
									><button class="btn btn-sm btn-danger deleteBtn" onclick="deleteRequest('${userid}', '${item.datetime}')">Delete</button>
									</span
								>
							</td>
				`;
				requestListWeek.appendChild(row1);
			});
			hours24.forEach((item) => {
				let row1 = document.createElement("tr");
				const maxLength = 40;
				const truncatedText =
					item.userSymptoms.length > maxLength
						? item.userSymptoms.slice(0, maxLength) + "..."
						: item.userSymptoms;
				const truncatedRemedy =
					item.diagnosis.length > maxLength
						? item.diagnosis.slice(20, maxLength) + "..."
						: item.diagnosis;
				let date = new Date(item.datetime);
				let formattedDate = date.toLocaleDateString("en-US", {
					month: "long",
					day: "2-digit",
					year: "numeric",
				});
				let localTime = date.toLocaleTimeString("en-US", { hour12: true });

				row1.innerHTML = `
				<td>
								<svg
									class="bgl-success tr-icon"
									width="63"
									height="63"
									viewBox="0 0 63 63"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
								>
									<g>
										<path
											d="M35.2219 42.9875C34.8938 42.3094 35.1836 41.4891 35.8617 41.1609C37.7484 40.2531 39.3453 38.8422 40.4828 37.0758C41.6477 35.2656 42.2656 33.1656 42.2656 31C42.2656 24.7875 37.2125 19.7344 31 19.7344C24.7875 19.7344 19.7344 24.7875 19.7344 31C19.7344 33.1656 20.3523 35.2656 21.5117 37.0813C22.6437 38.8477 24.2461 40.2586 26.1328 41.1664C26.8109 41.4945 27.1008 42.3094 26.7727 42.993C26.4445 43.6711 25.6297 43.9609 24.9461 43.6328C22.6 42.5063 20.6148 40.7563 19.2094 38.5578C17.7656 36.3047 17 33.6906 17 31C17 27.2594 18.4547 23.743 21.1016 21.1016C23.743 18.4547 27.2594 17 31 17C34.7406 17 38.257 18.4547 40.8984 21.1016C43.5453 23.7484 45 27.2594 45 31C45 33.6906 44.2344 36.3047 42.7852 38.5578C41.3742 40.7508 39.3891 42.5063 37.0484 43.6328C36.3648 43.9555 35.55 43.6711 35.2219 42.9875Z"
											fill="#2BC155"
										></path>
										<path
											d="M36.3211 31.7274C36.5891 31.9953 36.7203 32.3453 36.7203 32.6953C36.7203 33.0453 36.5891 33.3953 36.3211 33.6633L32.8812 37.1031C32.3781 37.6063 31.7109 37.8797 31.0055 37.8797C30.3 37.8797 29.6273 37.6008 29.1297 37.1031L25.6898 33.6633C25.1539 33.1274 25.1539 32.2633 25.6898 31.7274C26.2258 31.1914 27.0898 31.1914 27.6258 31.7274L29.6437 33.7453L29.6437 25.9742C29.6437 25.2196 30.2562 24.6071 31.0109 24.6071C31.7656 24.6071 32.3781 25.2196 32.3781 25.9742L32.3781 33.7508L34.3961 31.7328C34.9211 31.1969 35.7852 31.1969 36.3211 31.7274Z"
											fill="#2BC155"
										></path>
									</g>
								</svg>
							</td>
							<td>
								<h6 class="fs-16 font-w600 mb-0">
									<a href="javascript:void(0);" class="text-black"
										>${truncatedText}</a
									>
								</h6>
								<span class="fs-14">Remedy Request</span>
							</td>
							<td>
								<h6 class="fs-16 text-black font-w600 mb-0">${formattedDate}</h6>
								<span class="fs-14">${localTime}</span>
							</td>
							<td>
								<span class="fs-16 text-black font-w600">${truncatedRemedy}</span>
							</td>
							<td>
								<span class="text-success fs-16 font-w500 text-end d-block"
									><button class="btn btn-sm btn-danger deleteBtn" onclick="deleteRequest('${userid}', '${item.datetime}')">Delete</button>
									</span
								>
							</td>
				`;
				requestListDay.appendChild(row1);
			});
			// console.table(month);

			// console.table(hours24);

			// console.table(week);

			// console.table(unknown);
		});
}

// getRequestList();
function checkDate(dateString) {
	const currentDate = new Date();
	const inputDate = new Date(dateString);

	// Check if the input date is the same day as the current date
	if (
		inputDate.getFullYear() === currentDate.getFullYear() &&
		inputDate.getMonth() === currentDate.getMonth() &&
		inputDate.getDate() === currentDate.getDate() &&
		Math.abs(currentDate - inputDate) < 24 * 60 * 60 * 1000 // Less than 24 hours difference
	) {
		return "The input date is within the last 24 hours.";
	}

	// Check if the input date is within the past week or month
	const pastWeekDate = new Date();
	pastWeekDate.setDate(pastWeekDate.getDate() - 7);
	const pastMonthDate = new Date();
	pastMonthDate.setMonth(pastMonthDate.getMonth() - 1);

	if (inputDate > pastMonthDate) {
		if (inputDate > pastWeekDate) {
			return "The input date lies within the past week and the past month.";
		} else {
			return "The input date lies within the past month but not the past week.";
		}
	}

	return "The input date is not within the past month, past week, or the last 24 hours.";
}

function deleteRequest(userId, dateTime) {
	const url = `/deleteReq/${userId}/${dateTime}`;
	fetch(url, {
		method: "GET",
	})
		.then((response) => {
			return response.json();
		})
		.then((data) => {
			if (data.message === "Request successfully updated") {
				getRequestList(userId);
			} else {
				return "Request could not be deleted.";
			}
		});
}
