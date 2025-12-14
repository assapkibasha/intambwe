// models/index.js
const sequelize = require("../config/database");
const Department = require("./Department");
const Employee = require("./Employee");
const Class = require("./Class");
const Student = require("./Student");
const Subject = require("./Subject");
const Marks = require("./Marks");
const Timetable = require("./Timetable");
const TimetableEntry = require("./TimetableEntry");
const SpecialEvent = require("./SpecialEvent");
const Attendance = require("./Attendance");
const Trade = require("./Trade");
const SubjectTrade = require("./SubjectTrade");
const Inventory = require("./Inventory");
const Category = require("./Category");
const Supplier = require("./Supplier");
const Warehouse = require("./Warehouse");
const RequestAsset = require("./RequestAsset");
const TransactionReport = require("./TransactionReport");

// Define Associations

// Department Associations
Department.hasMany(Employee, { foreignKey: "dpt_id", onDelete: "SET NULL" });
Department.hasMany(Class, { foreignKey: "dpt_id", onDelete: "SET NULL" });
Department.hasMany(Student, { foreignKey: "dpt_id", onDelete: "SET NULL" });
Department.hasMany(Subject, { foreignKey: "dpt_id", onDelete: "SET NULL" });

// Employee Associations
Employee.belongsTo(Department, { foreignKey: "dpt_id", as: "department" });
Employee.hasMany(Class, {
  foreignKey: "emp_id",
  as: "classes",
  onDelete: "SET NULL",
});
Employee.hasMany(Subject, {
  foreignKey: "teacher_id",
  as: "subjects",
  onDelete: "SET NULL",
});
Employee.hasMany(Marks, { foreignKey: "emp_id", onDelete: "SET NULL" });
Employee.hasMany(TimetableEntry, {
  foreignKey: "teacher_id",
  onDelete: "SET NULL",
});
Employee.hasMany(SpecialEvent, {
  foreignKey: "teacher_id",
  onDelete: "SET NULL",
});

// Class Associations
Class.belongsTo(Department, { foreignKey: "dpt_id" });
Class.belongsTo(Employee, { foreignKey: "emp_id", as: "classTeacher" });
Class.hasMany(Student, { foreignKey: "class_id", onDelete: "SET NULL" });
Class.hasMany(Subject, { foreignKey: "class_id", onDelete: "CASCADE" });
Class.hasMany(Marks, { foreignKey: "class_id", onDelete: "SET NULL" });
Class.hasMany(TimetableEntry, { foreignKey: "class_id", onDelete: "CASCADE" });
Class.hasMany(SpecialEvent, { foreignKey: "class_id", onDelete: "CASCADE" });
Class.hasMany(Attendance, { foreignKey: "class_id", onDelete: "CASCADE" });
Trade.hasMany(Class, {
  foreignKey: "trade_id",
  as: "classes",
  onDelete: "CASCADE",
});

Class.belongsTo(Trade, {
  foreignKey: "trade_id",
  as: "Trade",
});

// Student Associations
Student.belongsTo(Class, { foreignKey: "class_id" });

Student.hasMany(Marks, { foreignKey: "std_id", onDelete: "CASCADE" });
Student.hasMany(Attendance, { foreignKey: "student_id", onDelete: "CASCADE" });

// Subject Associations
Subject.belongsTo(Employee, { foreignKey: "teacher_id", as: "teacher" });
Subject.belongsTo(Class, { foreignKey: "class_id" });
Subject.belongsTo(Department, { foreignKey: "dpt_id" });
Subject.hasMany(Marks, { foreignKey: "sbj_id", onDelete: "CASCADE" });
Subject.hasMany(TimetableEntry, { foreignKey: "sbj_id", onDelete: "SET NULL" });
Subject.hasMany(Attendance, { foreignKey: "subject_id", onDelete: "SET NULL" });

// Subject–Trade many-to-many association through SubjectTrade
Subject.belongsToMany(Trade, {
  through: SubjectTrade,
  foreignKey: "sbj_id",
  otherKey: "trade_id",
  as: "trades",
});

Trade.belongsToMany(Subject, {
  through: SubjectTrade,
  foreignKey: "trade_id",
  otherKey: "sbj_id",
  as: "subjects",
});

// Marks Associations
Marks.belongsTo(Student, { foreignKey: "std_id" });
Marks.belongsTo(Subject, { foreignKey: "sbj_id" });
Marks.belongsTo(Class, { foreignKey: "class_id" });
Marks.belongsTo(Employee, { foreignKey: "emp_id", as: "gradedBy" });

// Timetable Associations
Timetable.hasMany(TimetableEntry, {
  foreignKey: "timetable_id",
  onDelete: "CASCADE",
});

// TimetableEntry Associations
TimetableEntry.belongsTo(Timetable, { foreignKey: "timetable_id" });
TimetableEntry.belongsTo(Class, { foreignKey: "class_id" });
TimetableEntry.belongsTo(Subject, { foreignKey: "sbj_id" });
TimetableEntry.belongsTo(Employee, { foreignKey: "teacher_id", as: "teacher" });

// SpecialEvent Associations
SpecialEvent.belongsTo(Class, { foreignKey: "class_id" });
SpecialEvent.belongsTo(Employee, { foreignKey: "teacher_id", as: "teacher" });

// Attendance Associations
Attendance.belongsTo(Student, { foreignKey: "student_id" });
Attendance.belongsTo(Class, { foreignKey: "class_id" });
Attendance.belongsTo(Subject, { foreignKey: "subject_id" });

/* =========================
   CATEGORY
========================= */
Category.hasMany(Inventory, {
  foreignKey: "category_id",
  as: "inventories",
  onDelete: "RESTRICT",
});

Inventory.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

/* =========================
   SUPPLIER
========================= */
Supplier.hasMany(Inventory, {
  foreignKey: "supplier_id",
  as: "inventories",
  onDelete: "RESTRICT",
});

Inventory.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});

/* =========================
   WAREHOUSE
========================= */
Warehouse.hasMany(Inventory, {
  foreignKey: "warehouse_id",
  as: "inventories",
  onDelete: "RESTRICT",
});

Inventory.belongsTo(Warehouse, {
  foreignKey: "warehouse_id",
  as: "warehouse",
});

/* =========================
   INVENTORY
========================= */
Inventory.hasMany(RequestAsset, {
  foreignKey: "inventory_id",
  as: "requests",
  onDelete: "CASCADE",
});

RequestAsset.belongsTo(Inventory, {
  foreignKey: "inventory_id",
  as: "inventory",
});

/* =========================
   REQUEST ASSET
========================= */

// Requested by (Employee)
Employee.hasMany(RequestAsset, {
  foreignKey: "requested_by",
  as: "assetRequests",
});

RequestAsset.belongsTo(Employee, {
  foreignKey: "requested_by",
  as: "requester",
});

// Approved by (Employee)
Employee.hasMany(RequestAsset, {
  foreignKey: "approved_by",
  as: "approvedRequests",
});

RequestAsset.belongsTo(Employee, {
  foreignKey: "approved_by",
  as: "approver",
});

/* =========================
   TRANSACTION REPORT
========================= */

// Inventory → TransactionReport
Inventory.hasMany(TransactionReport, {
  foreignKey: "inventory_id",
  as: "transactions",
});

TransactionReport.belongsTo(Inventory, {
  foreignKey: "inventory_id",
  as: "inventory",
});

// RequestAsset → TransactionReport
RequestAsset.hasMany(TransactionReport, {
  foreignKey: "request_id",
  as: "transactions",
});

TransactionReport.belongsTo(RequestAsset, {
  foreignKey: "request_id",
  as: "request",
});

// Employee → TransactionReport (performed_by)
Employee.hasMany(TransactionReport, {
  foreignKey: "performed_by",
  as: "performedTransactions",
});

TransactionReport.belongsTo(Employee, {
  foreignKey: "performed_by",
  as: "performedBy",
});

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    // Use { force: true } to drop and recreate tables (use with caution!)
    // Use { alter: true } to modify tables to match models
    await sequelize.sync({ alter: false });
    console.log("All models synchronized successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

module.exports = {
  sequelize,
  Department,
  Employee,
  Class,
  Student,
  Subject,
  Marks,
  Timetable,
  TimetableEntry,
  SpecialEvent,
  Attendance,
  SubjectTrade,
  Trade,
  Inventory,
  Category,
  Supplier,
  Warehouse,
  RequestAsset,
  TransactionReport,
  syncDatabase,
};
