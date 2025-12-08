


// models/index.js
const sequelize = require('../config/database');
const Department = require('./Department');
const Employee = require('./Employee');
const Class = require('./Class');
const Student = require('./Student');
const Subject = require('./Subject');
const Marks = require('./Marks');
const Timetable = require('./Timetable');
const TimetableEntry = require('./TimetableEntry');
const SpecialEvent = require('./SpecialEvent');
const Attendance = require('./Attendance');

// Define Associations

// Department Associations
Department.hasMany(Employee, { foreignKey: 'dpt_id', onDelete: 'SET NULL' });
Department.hasMany(Class, { foreignKey: 'dpt_id', onDelete: 'SET NULL' });
Department.hasMany(Student, { foreignKey: 'dpt_id', onDelete: 'SET NULL' });
Department.hasMany(Subject, { foreignKey: 'dpt_id', onDelete: 'SET NULL' });

// Employee Associations
Employee.belongsTo(Department, { foreignKey: 'dpt_id' });
Employee.hasMany(Class, { foreignKey: 'emp_id', as: 'classes', onDelete: 'SET NULL' });
Employee.hasMany(Subject, { foreignKey: 'teacher_id', as: 'subjects', onDelete: 'SET NULL' });
Employee.hasMany(Marks, { foreignKey: 'emp_id', onDelete: 'SET NULL' });
Employee.hasMany(TimetableEntry, { foreignKey: 'teacher_id', onDelete: 'SET NULL' });
Employee.hasMany(SpecialEvent, { foreignKey: 'teacher_id', onDelete: 'SET NULL' });

// Class Associations
Class.belongsTo(Department, { foreignKey: 'dpt_id' });
Class.belongsTo(Employee, { foreignKey: 'emp_id', as: 'classTeacher' });
Class.hasMany(Student, { foreignKey: 'class_id', onDelete: 'SET NULL' });
Class.hasMany(Subject, { foreignKey: 'class_id', onDelete: 'CASCADE' });
Class.hasMany(Marks, { foreignKey: 'class_id', onDelete: 'SET NULL' });
Class.hasMany(TimetableEntry, { foreignKey: 'class_id', onDelete: 'CASCADE' });
Class.hasMany(SpecialEvent, { foreignKey: 'class_id', onDelete: 'CASCADE' });
Class.hasMany(Attendance, { foreignKey: 'class_id', onDelete: 'CASCADE' });

// Student Associations
Student.belongsTo(Class, { foreignKey: 'class_id' });
Student.belongsTo(Department, { foreignKey: 'dpt_id' });
Student.hasMany(Marks, { foreignKey: 'std_id', onDelete: 'CASCADE' });
Student.hasMany(Attendance, { foreignKey: 'student_id', onDelete: 'CASCADE' });

// Subject Associations
Subject.belongsTo(Employee, { foreignKey: 'teacher_id', as: 'teacher' });
Subject.belongsTo(Class, { foreignKey: 'class_id' });
Subject.belongsTo(Department, { foreignKey: 'dpt_id' });
Subject.hasMany(Marks, { foreignKey: 'sbj_id', onDelete: 'CASCADE' });
Subject.hasMany(TimetableEntry, { foreignKey: 'sbj_id', onDelete: 'SET NULL' });
Subject.hasMany(Attendance, { foreignKey: 'subject_id', onDelete: 'SET NULL' });

// Marks Associations
Marks.belongsTo(Student, { foreignKey: 'std_id' });
Marks.belongsTo(Subject, { foreignKey: 'sbj_id' });
Marks.belongsTo(Class, { foreignKey: 'class_id' });
Marks.belongsTo(Employee, { foreignKey: 'emp_id', as: 'gradedBy' });

// Timetable Associations
Timetable.hasMany(TimetableEntry, { foreignKey: 'timetable_id', onDelete: 'CASCADE' });

// TimetableEntry Associations
TimetableEntry.belongsTo(Timetable, { foreignKey: 'timetable_id' });
TimetableEntry.belongsTo(Class, { foreignKey: 'class_id' });
TimetableEntry.belongsTo(Subject, { foreignKey: 'sbj_id' });
TimetableEntry.belongsTo(Employee, { foreignKey: 'teacher_id', as: 'teacher' });

// SpecialEvent Associations
SpecialEvent.belongsTo(Class, { foreignKey: 'class_id' });
SpecialEvent.belongsTo(Employee, { foreignKey: 'teacher_id', as: 'teacher' });

// Attendance Associations
Attendance.belongsTo(Student, { foreignKey: 'student_id' });
Attendance.belongsTo(Class, { foreignKey: 'class_id' });
Attendance.belongsTo(Subject, { foreignKey: 'subject_id' });

// Sync database
const syncDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models in dependency order
    await Department.sync({ force: true });
    await Employee.sync({ force: true });
    await Class.sync({ force: true });
    await Student.sync({ force: true });
    await Subject.sync({ force: true });
    await Timetable.sync({ force: true });
    await Marks.sync({ force: true });
    await TimetableEntry.sync({ force: true });
    await SpecialEvent.sync({ force: true });
    await Attendance.sync({ force: true });
    
    console.log('All models synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
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
  syncDatabase
};