import { readFileSync, writeFileSync } from "fs"
import initSqlJs from 'sql.js'
import path from "path"

const baseDbPath = "__database__"
const partyAddressPath = path.join(baseDbPath, "pvtaddresses.json")
const addressesPath = path.join(baseDbPath, "addresses.json")
const itemsPath = path.join(baseDbPath, "items.json")
const unitsPath = path.join(baseDbPath, "units.json")
const sqliteDbPath = path.join(baseDbPath, "database.db")

/**
 * key, value paris of name to [address, tin]
 * `Record<string, [address: string, tin: string]>`
 */
const getAddresses = () => JSON.parse(readFileSync(addressesPath, "utf-8"))

/**
 * key, value paris of pvtname to party name
 * name is unique for every party
 * `Record<string, string>`
 */
const getPartyData = () => JSON.parse(readFileSync(partyAddressPath, "utf-8"))

/**
 * key, value paris of name to hsn
 * `Record<string, string>`
 */
const getItems = () => JSON.parse(readFileSync(itemsPath, "utf-8"))

const CREATE_INVOICE_TABLE = `CREATE TABLE IF NOT EXISTS invoice (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    party_key TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);`

const CREATE_PARTY_TABLE = `CREATE TABLE IF NOT EXISTS party (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    address TEXT,
    tin TEXT
);`

const CREATE_ITEM_TABLE = `CREATE TABLE IF NOT EXISTS item (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    hsn TEXT
);`

const migrate = async () => {
    console.log("Initiating migration...")
    console.log("..........")
    const sql = await initSqlJs({
        locateFile: (file) => `./node_modules/sql.js/dist/${file}`,
    })
    //const data = readFileSync(sqliteDbPath)
    //const sqlDatabase = new sql.Database(data)
    const sqlDatabase = new sql.Database()

    // create party table
    sqlDatabase.run(CREATE_PARTY_TABLE)
    // create invoice table
    sqlDatabase.run(CREATE_INVOICE_TABLE)
    // create item table
    sqlDatabase.run(CREATE_ITEM_TABLE)

    // get all data
    const parties = getPartyData()
    const addresses = getAddresses()
    const items = getItems()

    // fill party details
    try {
        Object.entries(parties).forEach(([key, name]) => {
            const [addr, tin] = addresses[key] ?? []
            sqlDatabase.run("INSERT INTO party VALUES (?,?,?,?,?);", [null, key, name, addr ?? null, tin ?? null])
            console.debug('ENTRY - key: ', key, ', name: ', name, ', addr: ', addr, ', tin: ', tin)
        })
    } catch(e) {
        console.error("Got error: ", e)
        console.error("Aborting.")
        return
    }
    console.log("..........")

    // fill item details
    try {
        Object.entries(items).forEach(([name, hsn]) => {
            sqlDatabase.run("INSERT INTO item VALUES (?,?,?);", [null, name, hsn ?? null])
            console.debug('ENTRY - name: ', name, ', hsn: ', hsn)
        })
    } catch(e) {
        console.error("Got error: ", e)
        console.error("Aborting.")
        return
    }

    console.log("..........")

    console.log("Migration successful!")

    const newData = sqlDatabase.export()
    writeFileSync(sqliteDbPath, newData)
}

migrate()
