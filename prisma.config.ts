import mysql from "mysql2/promise"

export const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "password",
  database: "project_tracker",
  waitForConnections: true,
  connectionLimit: 10
})