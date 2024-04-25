<h1>Info_Health</h1>
<h2>Navigate Your Diagnosis with Symptom-Based Insights</h2>
# Info_Health by <a href="https://github.com/ElvisKemoi">Elvis Kemoi </a> &amp;<a href="https://github.com/developer-austine">Dev Austine Alex</a>

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Description

This is a project aimed to help people in case of emergencies. One can access the web app and get relevant information about healthcare availability around their location. <br>
The app accesses the users location and displays the nearest hospitals. It also has the option to view the location of each hospital using google maps so that the user can know the location of the hospital when he/she is in an unfamiliar environment. <br>
Users can also get quick remedies for their symptoms and also recommends if the user needs to see the doctor.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

<ul >
<li>Clone this repository to a local directory. </li>
<li>Run "npm install" to install all the  dependencies in the package.json file.</li>
<li>Make a .env file and in it insert the values for "SESSION_SECRET"
"GOOGLE_API_KEY" and 
"GOOGLE_API_MODEL"</li>
<li>The "SESSION_SECRET" can be any integer or string. You have to get your own "GOOGLE_API_KEY" for gemini and while you are at it you will be able to view your "GOOGLE_API_MODEL"</li>
<li>Now run "npm run Start" to run the app on "http://localhost:3000/"</li>

## Usage

<h2>Nearby Hospitals</h2>
Users are able to access nearby hospitals.
<img src="./Screenshot 2024-04-25 152208.png" alt="Screenshot of Nearby Hospitals Section.">
<h2>Quick Remedy</h2>
Users are able to insert their symptoms and the system will give the user a quick remedy.
<img src="./Screenshot 2024-04-25 152225.png" alt="Screenshot of Quick Remedy Section.>

## Contributing

This repository is open for contribution. Any improvement to the system will be much appreciated.

## License

This project is licensed under the terms of the [MIT License](https://opensource.org/licenses/MIT).

<hr>
