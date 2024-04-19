if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const passport = require("passport");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");
const hospitalDetails = require("./routes/hospital");
const diagnosisRoute = require("./routes/getDiagnosis");

// ? Mongo
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");
const { renderFile } = require("ejs");
app.use(express.json());

// initializePassport(
// 	passport,
// 	(email) => users.find((user) => user.email === email),
// 	(id) => users.find((user) => user.id === id)
// );

app.set("view engine", "ejs"); // Set up EJS as the template engine

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false, // Do not resave session if not modified
		saveUninitialized: false,
		cookie: { maxAge: 60 * 60 * 1000 },
	})
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use("/api", hospitalDetails);
app.use("/diagnosis", diagnosisRoute);

// Middleware to check session expiration
function checkSessionExpiration(req, res, next) {
	if (req.isAuthenticated() && req.session.cookie.expires < new Date()) {
		req.logout();
	}
	next();
}

// Apply the middleware to check session expiration
app.use(checkSessionExpiration);

let db;
connectToDb((err) => {
	if (!err) {
		app.listen(3000, () => {
			console.log("Server is live at port 3000!");
		});
		db = getDb();
	}
});

const users = [];

function importUserDetails() {
	Promise.all([
		db.collection("doctorDetails").find().toArray(),
		db.collection("userDetails").find().toArray(),
	])
		.then(([doctorUsersArray, regularUsersArray]) => {
			// Update doctor users array
			const doctorUsers = [...doctorUsersArray];

			// Update regular users array
			const regularUsers = [...regularUsersArray];

			// Optionally, if you need to update passport with the new users, you can reinitialize it
			initializePassport(
				passport,
				(email) =>
					doctorUsers.find((user) => user.email === email) ||
					regularUsers.find((user) => user.email === email),
				(id) =>
					doctorUsers.find((user) => user.id === id) ||
					regularUsers.find((user) => user.id === id)
			);
		})
		.catch((error) => {
			console.log("There is an Error: " + error);
			// Handle error
		});
}

app.get("/", checkAuthenticated, function (req, res) {
	if (req.user.role === "user") {
		res.render("index.ejs", {
			name: req.user.name,
			email: req.user.email,
			id: req.user._id,
		});
	} else if (req.user.role === "doctor") {
		res.render("doctors.ejs");
	} else {
		res.send(req.user.email + "Is not a doctor");
	}
});

// app.get("/", checkAuthenticated, function (req, res) {
// 	res.render("index.ejs", {
// 		name: req.user.name,
// 		userDiagnosis: req.session.userDiagnosis,
// 	});
// });

app.get("/login", function (req, res) {
	importUserDetails();
	res.render("login.ejs");
});

app.get("/register", function (req, res) {
	importUserDetails();
	res.render("register.ejs");
});

// app.get("/doctors", checkAuthenticated, (req, res) => {
// 	res.render("doctors.ejs");
// 	// res.send("Hello Doctors");
// });

app.post("/login", function (req, res, next) {
	const authenticationOptions = {
		failureRedirect: "/login",
		failureFlash: true,
		successRedirect: "/",
	};

	if (req.body.role === "user") {
		authenticationOptions.successRedirect = "/";
	} else if (req.body.role === "doctor") {
		authenticationOptions.successRedirect = "/";
	}
	passport.authenticate("local", authenticationOptions)(req, res, next);
});

app.post("/register", async (req, res) => {
	try {
		const existingUser = await db
			.collection("userDetails")
			.findOne({ email: req.body.email });
		if (existingUser) {
			// Email already exists, redirect to login page

			return res.redirect("/login");
		}

		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		const newUser = {
			id: Date.now().toString(),
			name: req.body.name,
			email: req.body.email,
			role: req.body.role,
			password: hashedPassword,
			gender: "",
			dob: "",
			requests: [],
		};
		if (newUser.role === "user") {
			db.collection("userDetails")
				.insertOne(newUser)
				.then((result) => {
					console.log(result);
					// res.status(201).json(result);
				})
				.catch((err) => {
					console.log(err);
					// res.status(500).json({ err: "Could not create a new document" });
				});
		} else if (newUser.role === "doctor") {
			db.collection("doctorDetails")
				.insertOne(newUser)
				.then((result) => {
					console.log(result);
					// res.status(201).json(result);
				})
				.catch((err) => {
					console.log(err);
					// res.status(500).json({ err: "Could not create a new document" });
				});
		}

		// users.push(newUser);
		importUserDetails();
		// console.table(newUser);
		res.redirect("/login");
	} catch (e) {
		console.log(e);
		res.redirect("/register");
	}
});

app.post("/logout", (req, res) => {
	req.logout((err) => {
		if (err) {
			console.error("Error during logout:", err);
			req.flash("error", "Failed to logout. Please try again.");
		}
		res.redirect("/login");
	});
});

app.get("/deleteReq/:id/:datetime", async (req, res) => {
	try {
		const db = getDb(); // Assuming getDb() is a function to get the database connection

		// Fetch the hospital document with specified _id and only select email and requests fields
		const hospital = await db.collection("userDetails").findOne(
			{ _id: new ObjectId(req.params.id) },
			{
				projection: {
					email: 1,
					requests: 1,
				},
			}
		);

		// Filter out the request with the specified datetime
		const filteredData = {
			...hospital,
			requests: hospital.requests.filter(
				(request) => request.datetime !== req.params.datetime
			),
		};

		// Update the document in the "userDetails" collection with filtered data
		const updatedData = await db.collection("userDetails").updateOne(
			{ _id: new ObjectId(req.params.id) }, // Find the document by its _id
			{ $set: { requests: filteredData.requests } } // Set the "requests" field to the filtered requests
		);

		if (updatedData.modifiedCount > 0) {
			// If the update was successful (at least one document modified)
			res.status(200).json({ message: "Request successfully updated" }); // Send a success response
		} else {
			// If the update failed (document not found, etc.)
			res.status(404).json({ error: "Request not found" }); // Send a response with status 404 and an error message
		}
	} catch (error) {
		res.status(500).json({ error: "Could not update the request." }); // Send a response with status 500 and an error message
	}
});

app.post("/getRequestList/:id", async (req, res) => {
	try {
		db = getDb();
		const requests = await db.collection("userDetails").findOne(
			{ _id: new ObjectId(req.params.id) },
			{
				projection: {
					_id: 0,
					requests: 1,
				},
			}
		);
		if (requests) {
			res.status(200).json(requests);
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ error: "Could not fetch the document" });
	}
});

function checkAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect("/login");
}
