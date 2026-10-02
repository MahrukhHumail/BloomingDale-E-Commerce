const app = require("./src/app");
const sequelize = require("./src/config/database");
require("./src/models");

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");

    await sequelize.sync();
    console.log("Database tables created successfully!");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start server:", error.message);
  }
}

startServer();