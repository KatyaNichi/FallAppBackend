const express = require("express")
const sqlite3 = require("sqlite3").verbose()
const app = express()
const cors = require("cors")
const port = process.env.PORT || 3000
// Function to initialize the database
async function initializeDatabase(db) {
    const schema = `
    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      elderly_name TEXT NOT NULL,
      was_fall_last_3_months TEXT,
      accident_date TEXT,
      accident_time TEXT,
      accident_place TEXT,
      witness TEXT,
      additional_content TEXT,
      person_number TEXT,
      was_fall_inside BOOLEAN
    );
    CREATE TABLE IF NOT EXISTS fall_reasons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      reason TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS user_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      activity TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS preceding_symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      symptom TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS fall_consequences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      consequence TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS injury_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      injury TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS taken_measures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      measure TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS report_photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      report_id INTEGER,
      photo_uri TEXT,
      FOREIGN KEY (report_id) REFERENCES reports(id) ON DELETE CASCADE
    );
  `
    return new Promise((resolve, reject) => {
        db.exec(schema, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    })
}
let db = new sqlite3.Database("./elderly_reports.db")
app.use(
    cors({
        origin: "http://localhost:5173", 
    })
)
app.use(express.json())
console.log("Starting server...")
// Initialize the database before starting the server
initializeDatabase(db)
    .then(() => {
        console.log("Database initialized successfully")
        app.post("/api/reports", (req, res) => {
            const {
                elderlyname,
                wasFallLast3Months,
                accidentDate,
                accidentTime,
                accidentPlace,
                personNumber,
                wasFallInside,
                fallReason = [],
                userActivity = [],
                precedingSymptoms = [],
                witness,
                fallConsequence = [],
                injuryType = [],
                takenMeasures = [],
                photos = [],
                additionalContent = "",
            } = req.body
            db.serialize(() => {
                db.run("BEGIN TRANSACTION")
                // Insert into reports table
                const reportQuery = `
          INSERT INTO reports (elderly_name, was_fall_last_3_months, accident_date, accident_time, accident_place, witness, additional_content, person_number, was_fall_inside)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
                db.run(
                    reportQuery,
                    [
                        elderlyname,
                        wasFallLast3Months,
                        accidentDate,
                        accidentTime,
                        accidentPlace,
                        witness,
                        additionalContent,
                        personNumber,
                        wasFallInside,
                    ],
                    function (err) {
                        if (err) {
                            console.error("Error inserting report:", err) // Log the error
                            db.run("ROLLBACK")
                            return res.status(500).json({ error: err.message })
                        }
                        const reportId = this.lastID
                        const insertListItems = (table, items) => {
                            if (!items || items.length === 0) return Promise.resolve()
                            let columnName
                            switch (table) {
                                case "fall_reasons":
                                    columnName = "reason"
                                    break
                                case "user_activities":
                                    columnName = "activity"
                                    break
                                case "preceding_symptoms":
                                    columnName = "symptom"
                                    break
                                case "fall_consequences":
                                    columnName = "consequence"
                                    break
                                case "injury_types":
                                    columnName = "injury"
                                    break
                                case "taken_measures":
                                    columnName = "measure"
                                    break
                                case "report_photos":
                                    columnName = "photo_uri"
                                    break
                                default:
                                    return Promise.reject(new Error(`Unknown table: ${table}`))
                            }
                            const listQuery = `INSERT INTO ${table} (report_id, ${columnName}) VALUES (?, ?)`
                            const promises = items.map((item) => {
                                return new Promise((resolve, reject) => {
                                    db.run(listQuery, [reportId, item], function (err) {
                                        if (err) reject(err)
                                        else resolve()
                                    })
                                })
                            })
                            return Promise.all(promises)
                        }
                        // Insert into related tables
                        Promise.all([
                            insertListItems("fall_reasons", fallReason),
                            insertListItems("user_activities", userActivity),
                            insertListItems("preceding_symptoms", precedingSymptoms),
                            insertListItems("fall_consequences", fallConsequence),
                            insertListItems("injury_types", injuryType),
                            insertListItems("taken_measures", takenMeasures),
                            insertListItems("report_photos", photos),
                        ])
                            .then(() => {
                                // If everything is successful, commit the transaction
                                db.run("COMMIT", (err) => {
                                    if (err) {
                                        return res
                                            .status(500)
                                            .json({ error: "Transaction commit failed" })
                                    }
                                    res
                                        .status(200)
                                        .json({ message: "Report successfully added", reportId })
                                })
                            })
                            .catch((err) => {
                                db.run("ROLLBACK")
                                res.status(500).json({ error: err.message })
                            })
                    }
                )
            })
        })
        app.get("/api/reports", (req, res) => {
            db.all("SELECT * FROM reports", (err, reports) => {
                if (err) {
                    return res.status(500).json({ error: err.message })
                }
                // If there are no reports, return an empty array
                if (reports.length === 0) {
                    return res.status(200).json([])
                }
                const reportPromises = reports.map((report) => {
                    const reportId = report.id
                    // Function to get related data for a specific table
                    const getRelatedData = (tableName, columnName) => {
                        return new Promise((resolve, reject) => {
                            db.all(
                                `SELECT ${columnName} FROM ${tableName} WHERE report_id = ?`,
                                [reportId],
                                (err, rows) => {
                                    if (err) {
                                        reject(err)
                                    } else {
                                        resolve(rows.map((row) => row[columnName])) // Extracting the related data values
                                    }
                                }
                            )
                        })
                    }
                    return Promise.all([
                        getRelatedData("fall_reasons", "reason"),
                        getRelatedData("user_activities", "activity"),
                        getRelatedData("preceding_symptoms", "symptom"),
                        getRelatedData("fall_consequences", "consequence"),
                        getRelatedData("injury_types", "injury"),
                        getRelatedData("taken_measures", "measure"),
                        getRelatedData("report_photos", "photo_uri"),
                    ]).then(
                        ([
                            fallReason,
                            userActivity,
                            precedingSymptoms,
                            fallConsequence,
                            injuryType,
                            takenMeasures,
                            photos,
                        ]) => {
                            return {
                                ...report,
                                was_fall_inside: report.was_fall_inside === 1,
                                was_fall_last_3_months: report.was_fall_last_3_months,
                                fallReason,
                                userActivity,
                                precedingSymptoms,
                                fallConsequence,
                                injuryType,
                                takenMeasures,
                                photos,
                            }
                        }
                    )
                })
                Promise.all(reportPromises)
                    .then((detailedReports) => {
                        res.status(200).json(detailedReports)
                    })
                    .catch((error) => {
                        res.status(500).json({ error: error.message })
                    })
            })
        })
        const server = app.listen(port, () => {
            const actualPort = server.address().port
            console.log(`Server running on port ${actualPort}`)
        })
    })
    .catch((err) => {
        console.error("Failed to initialize database:", err)
        process.exit(1)
    })