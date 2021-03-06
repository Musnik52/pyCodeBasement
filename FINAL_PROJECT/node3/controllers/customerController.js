const connectedKnex = require("../knex-connector");
const { logger } = require("../logger");

const getAllCustomers = async (req, res) => {
  const customers = await connectedKnex("customers").select("*");
  res.status(200).json({ customers });
};

const getCustomerById = async (req, res) => {
  const id = req.params.id;
  const customer = await connectedKnex("customers")
    .select("*")
    .where("id", id)
    .first();
  res.status(200).json({ customer });
};

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
  const id = req.params.id;
  try {
    customer = req.body;
    const result = await connectedKnex("customers")
      .where("id", id)
      .update(customer);
    res.status(200).json({
      res: "success",
      url: `/customers/${id}`,
      result,
    });
  } catch (e) {
    logger.error(`failed to update customer. Error: ${e}`);
    res.status(400).send({
      status: "error",
      message: e.message,
    });
  }
};

const addCustomer = async (req, res) => {
  try {
    user = {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      user_role: 3,
    };
    const resultUser = await connectedKnex("users").insert(user);
    const newUser = await connectedKnex("users")
      .select("*")
      .where("username", req.body.username)
      .first();
    const resultCustomer = await connectedKnex("customers").insert({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address,
      phone_number: req.body.phone_number,
      credit_card_number: req.body.credit_card_number,
      user_id: newUser.id,
    });
    res.status(201).json({
      res: "success",
      url: `/customers/${resultCustomer[0]}`,
      resultCustomer,
    });
  } catch (e) {
    logger.error(`failed to add a customer. Error: ${e}`);
    res.status(400).send({
      status: "error",
      message: e.message,
    });
  }
};

module.exports = {
  getAllCustomers,
  getCustomerById,
  deleteCustomer,
  updateCustomer,
  addCustomer,
};
