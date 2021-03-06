const connectedKnex = require("../knex-connector");
const { logger } = require("../logger");

const getAllAdmins = async (req, res) => {
  const admins = await connectedKnex("administrators").select("*");
  res.status(200).json({ admins });
};

const getAdminById = async (req, res) => {
  const id = req.params.id;
  const admin = await connectedKnex("administrators")
    .select("*")
    .where("id", id)
    .first();
  res.status(200).json({ admin });
};

const deleteAdmin = async (req, res) => {
  const id = req.params.id;
  try {
    const admin = await connectedKnex("administrators")
      .select("*")
      .where("id", id)
      .first();
    const userDel = await connectedKnex("users")
      .where("id", admin.user_id)
      .del();
    const adminDel = connectedKnex("administrators").where("id", id).del();
    res.status(200).json({ num_records_deleted: admin });
  } catch (e) {
    logger.error(`failed to delete an admin. Error: ${e}`);
    res.status(400).send({
      status: "error",
      message: e.message,
    });
  }
};

const updateAdmin = async (req, res) => {
  const id = req.params.id;
  try {
    admin = req.body;
    const result = await connectedKnex("administrators")
      .where("id", id)
      .update(admin);
    res.status(200).json({
      res: "success",
      url: `/admins/${id}`,
      result,
    });
  } catch (e) {
    logger.error(`failed to update admin. Error: ${e}`);
    res.status(400).send({
      status: "error",
      message: e.message,
    });
  }
};

const addAdmin = async (req, res) => {
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
    const resultAdmin = await connectedKnex("administrators").insert({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      user_id: newUser.id,
    });
    res.status(201).json({
      res: "success",
      url: `/admins/${resultAdmin[0]}`,
      result,
    });
  } catch (e) {
    logger.error(`failed to add an admin. Error: ${e}`);
    res.status(400).send({
      status: "error",
      message: e.message,
    });
  }
};

module.exports = {
  getAllAdmins,
  getAdminById,
  deleteAdmin,
  updateAdmin,
  addAdmin,
};
