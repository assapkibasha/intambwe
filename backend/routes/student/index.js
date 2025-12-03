const router = require('express').Router()
const studentRoutes = require('../student/studentRoutes')

router.use(studentRoutes)

module.exports = studentRoutes