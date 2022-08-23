const connectedKnex = require("../knex-connector");
const { logger } = require("../logger");
const { sendMsg } = require("../producer");
const { recieveMsg } = require("../consumer");
const uuid = require("uuid");

const deleteCustomer = async (req, res) => {
  const id = req.params.id;
  try {
    const customer = await connectedKnex("customers")
      .select("*")
      .where("id", id)
      .first();
    const userDel = await connectedKnex("users")
      .where("id", customer.user_id)
      .del();
    const customerDel = await connectedKnex("customers").where("id", id).del();
    res.status(200).json({ customer_deleted: customer });
  } catch (e) {
    logger.error(`failed to delete a customer. Error: ${e}`);
    res.status(400).send({
      status: "error",
      message: e.message,
    });
  }
};

const updateCustomer = async (req, res) => {
  const qResName = `customer ${uuid.v4()}`;
  try {
    reqMsg = {
      action: "updateCustomer",
      username: req.body.username,
      password: req.body.password,
      id: req.body.id,
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      address: req.body.address,
      phone_number: req.body.phone,
      credit_card_number: req.body.ccn,
      queue_name: `response ${qResName}`,
    };
    recieveMsg(reqMsg.queue_name, res);
    await sendMsg("customer", reqMsg);
  } catch (e) {
    logger.error(`failed to update customer. Error: ${e}`);
    res.status(400).send({
      status: "error",
      message: e.message,
    });
  }
};

const getMyTickets = async (req, res) => {
  const myUser = await connectedKnex("users")
    .select("*")
    .where("username", req.params.user)
    .first();
  const customer = await connectedKnex("customers")
    .select("*")
    .where("user_id", myUser.id)
    .first();
  const tickets = await connectedKnex("tickets")
    .select(
      "flights.id",
      "airline_companies.name",
      "c1.name as origin_country",
      "c2.name as destination_country",
      "flights.departure_time",
      "flights.landing_time"
    )
    .orderBy("flights.id", "asc")
    .where("customer_id", customer.id)
    .join("flights", function () {
      this.on("flights.id", "=", "tickets.flight_id");
    })
    .join("airline_companies", function () {
      this.on("flights.airline_company_id", "=", "airline_companies.id");
    })
    .join("countries as c1", function () {
      this.on("flights.origin_country_id", "=", "c1.id");
    })
    .join("countries as c2", function () {
      this.on("flights.destination_country_id", "=", "c2.id");
    });
  res.status(200).json({ tickets });
};

const getMyData = async (req, res) => {
  const myUser = await connectedKnex("users")
    .select("*")
    .where("username", req.params.user)
    .first();
  const customer = await connectedKnex("customers")
    .select("*")
    .where("user_id", myUser.id)
    .first();
  res.status(200).json({ customer });
};

module.exports = {
  deleteCustomer,
  updateCustomer,
  getMyTickets,
  getMyData,
};
