const connectedKnex = require("../knex-connector");
const { logger } = require("../logger");
const { sendMsg } = require("../producer");
const { recieveMsg } = require("../consumer");
const jwt = require("jsonwebtoken");
const uuid = require("uuid");
const User = require("../models/User");
const config = require("config");
const sessionData = config.get("sessionData");

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { username: "", password: "" };

  // incorrect username
  if (err.message === "incorrect username") {
    errors.username = "That username is not registered";
  }

  // incorrect password
  if (err.message === "incorrect password") {
    errors.password = "That password is incorrect";
  }

  // duplicate username error
  if (err.code === 11000) {
    errors.username = "that username is already registered";
    return errors;
  }

  // validation errors
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// create json web token
const maxAge = 24 * 60 * 60;
const createToken = (id, username, user_role, password) => {
  return jwt.sign({ id, username, user_role, password }, sessionData.secret, {
    expiresIn: maxAge,
  });
};

const Login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.login(username, password);
    const token = createToken(
      user._id,
      user.username,
      user.user_role,
      password
    );
    res.cookie("jwt_TOKEN", token, { httpOnly: true, maxAge: maxAge });
    await jwt.verify(token, sessionData.secret, (err, decodedToken) => {
      console.log(req.cookies.jwt_TOKEN);
      console.log(decodedToken);
      res.status(200).json(decodedToken);
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

const LoginCheck = (req, res) => {
  if (req.cookies.jwt) {
    console.log(req.cookies.jwt);
    jwt.verify(req.cookies.jwt, sessionData.secret, (err, decodedToken) => {
      res.status(200).json({ LoggedIn: true, user: decodedToken });
    });
  } else {
    res.status(200).json({ LoggedIn: false });
  }
};

const Logout = (req, res) => {
  try {
    res.cookie("jwt_TOKEN", "", { maxAge: 1 });
    console.log(req);
  } catch (err) {
    res.status(400).json({ err });
  }
  res.status(200).json({ LoggedIn: false });
};

const addCustomer = async (req, res) => {
  const qResName = `customer ${uuid.v4()}`;
  const {
    username,
    password,
    email,
    firstName,
    lastName,
    address,
    phone,
    ccn,
  } = req.body;
  try {
    reqMsg = {
      action: "addCustomer",
      username: username,
      password: password,
      email: email,
      public_id: uuid.v4(),
      first_name: firstName,
      last_name: lastName,
      address: address,
      phone_number: phone,
      credit_card_number: ccn,
      queue_name: `response ${qResName}`,
    };
    recieveMsg(reqMsg.queue_name, res);
    await sendMsg("customer", reqMsg);
  } catch (e) {
    logger.error(`failed to add a customer. Error: ${e}`);
    res.status(400).send({
      status: "error",
      message: e.message,
    });
  }
};

const getAllFlights = async (req, res) => {
  const flights = await connectedKnex("flights")
    .select(
      "flights.id",
      "airline_companies.name as airline",
      "c1.name as origin_country",
      "c2.name as destination_country",
      "flights.departure_time",
      "flights.landing_time",
      "flights.remaining_tickets"
    )
    .orderBy("flights.id", "asc")
    .join("countries as c1", function () {
      this.on("flights.origin_country_id", "=", "c1.id");
    })
    .join("countries as c2", function () {
      this.on("flights.destination_country_id", "=", "c2.id");
    })
    .join("airline_companies", function () {
      this.on("flights.airline_company_id", "=", "airline_companies.id");
    });
  res.status(200).json({ flights });
};

const getFlightById = async (req, res) => {
  const id = req.params.id;
  const flight = await connectedKnex("flights")
    .select(
      "flights.id",
      "airline_companies.name as airline",
      "c1.name as origin_country",
      "c2.name as destination_country",
      "flights.departure_time",
      "flights.landing_time",
      "flights.remaining_tickets"
    )
    .where("flights.id", id)
    .join("countries as c1", function () {
      this.on("flights.origin_country_id", "=", "c1.id");
    })
    .join("countries as c2", function () {
      this.on("flights.destination_country_id", "=", "c2.id");
    })
    .join("airline_companies", function () {
      this.on("flights.airline_company_id", "=", "airline_companies.id");
    })
    .first();
  res.status(200).json({ flight });
};

const getFlightByCountries = async (req, res) => {
  const originId = req.params.origin;
  const destinationId = req.params.destination;
  const flight = await connectedKnex("flights")
    .select(
      "flights.id",
      "airline_companies.name as airline",
      "c1.name as origin_country",
      "c2.name as destination_country",
      "flights.departure_time",
      "flights.landing_time",
      "flights.remaining_tickets"
    )
    .whereRaw("flights.remaining_tickets > 0")
    .where("flights.origin_country_id", originId)
    .where("flights.destination_country_id", destinationId)
    .join("countries as c1", function () {
      this.on("flights.origin_country_id", "=", "c1.id");
    })
    .join("countries as c2", function () {
      this.on("flights.destination_country_id", "=", "c2.id");
    })
    .join("airline_companies", function () {
      this.on("flights.airline_company_id", "=", "airline_companies.id");
    });
  res.status(200).json({ flight });
};

const getAllCountries = async (req, res) => {
  const countries = await connectedKnex("countries")
    .select("id", "name")
    .orderBy("name", "asc");
  res.status(200).json({ countries });
};

module.exports = {
  Logout,
  Login,
  LoginCheck,
  addCustomer,
  getAllFlights,
  getFlightById,
  getAllCountries,
  getFlightByCountries,
};
