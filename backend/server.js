const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./model");
const employeeRoute = require("./routes/attendance/employee");
const studentRoutes = require("./routes/student");

const attendanceRoutes = require("./routes/attendance/attendanceRoutes");
const classRoutes = require("./routes/class/classRoutes");
const marksRoutes = require("./routes/marks/marksRoutes");
const departmentRoute = require("./routes/department/departmentRoutes");
const specialEventRoutes = require("./routes/specialEvent/specialEventRoutes");
const subjectRoutes = require("./routes/subject/subjectRoutes");
const timetableRoutes = require("./routes/timetable/timetableRoutes");
const timetableEntryRoutes = require("./routes/timetableEntry/timetableEntryRoutes");
const tradeRoutes = require("./routes/trade/tradeRoutes");
const inventoryRoutes = require('./routes/inventoryRoutes');
const inventoryRequestRoutes = require('./routes/inventoryRequestRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const stockRoutes = require('./routes/stockRoutes');

const cookieParser = require("cookie-parser");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 5000;

/* ✅ ONE CORS CONFIG — THIS IS ENOUGH */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

/* ✅ Routes */
app.use("/api/employee", employeeRoute);
app.use("/api/student", studentRoutes);

app.use("/api/attendance", attendanceRoutes);
app.use("/api/class", classRoutes);
app.use("/api/marks", marksRoutes);
app.use("/api/department", departmentRoute);
app.use("/api/special-event", specialEventRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/timetable-entry", timetableEntryRoutes);
app.use("/api/trade", tradeRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/inventory/requests', inventoryRequestRoutes);
app.use('/api/inventory/categories', categoryRoutes);
app.use('/api/inventory/stock', stockRoutes);

/* ✅ Health check */
app.get("/", (req, res) => {
  res.json({ message: "Attendance Management API is running" });
});

/* ✅ Error handler */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong!",
    error: err.message,
  });
});

/* ✅ Start server */
// Do not run `sync({ alter: true })` automatically in production-like environments.
// Automatic schema alterations can generate many ALTER statements and cause
// unexpected SQL errors (and is unsafe for production). Authenticate the DB
// connection here and start the server. Use explicit migrations (sequelize-cli)
// to change schemas when needed.
db.sequelize
  .authenticate()
  .then(() => {
    console.log("Database connection established. Skipping automatic schema sync.");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Unable to connect to database:", err);
    process.exit(1);
  });

module.exports = app;
