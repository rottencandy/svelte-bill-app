import { readFileSync, writeFileSync } from "fs"
import path from "path"
import initSqlJs, { type Database } from "sql.js"
import { BASEPATH } from "./const"

const baseDbPath = path.join(BASEPATH, "__database__")
const savenamePath = path.join(BASEPATH, "savename.txt")

const unitsPath = path.join(baseDbPath, "units.json")
const sqliteDbPath = path.join(baseDbPath, "database.db")

/** array of unit names, units.json */
type Units = string[]

export const getUnits = (): Units =>
    JSON.parse(readFileSync(unitsPath, "utf-8"))

/** Add unit to units list */
export const setUnit = (unit: string): void => {
    const units = getUnits()
    units.push(unit)
    writeFileSync(unitsPath, JSON.stringify(units))
}

/** Returns the latest invoice number */
// TODO: check for file validity?
export const getInvoiceNo = (): number =>
    parseInt(readFileSync(savenamePath, "utf-8"), 10)

export const createPvtFilter = (db: Database) => {
    const stmt = db.prepare("SELECT key FROM party WHERE key LIKE :key")
    return (key: string) => {
        stmt.reset()
        stmt.bind({ ":key": `%${key}%` })
        const result: string[] = []
        while (stmt.step()) {
            result.push(stmt.get()[0] as string)
        }
        return result
    }
}

/** Checks whether given pvt name is in database. If so returns their [name, address, tin] */
export const getPartyDetails = (
    db: Database,
    pvt: string,
): [string, string, string] | undefined => {
    const stmt = db.prepare(
        "SELECT name, address, tin FROM party WHERE key=:key",
    )
    const { name, address, tin } = stmt.getAsObject({ ":key": pvt })
    if (name !== null) {
        return [name as string, address as string, tin as string]
    }
}

export const setPartyDetails = (
    db: Database,
    pvtName: string,
    name: string,
    address?: string,
    tin?: string,
) => {
    const stmt = db.prepare("SELECT key FROM party WHERE key LIKE :key")
    const { key } = stmt.getAsObject({ ":key": pvtName })
    if (key !== null) {
        db.run("UPDATE party SET name=?, address=? tin=? WHERE key=?", [
            name,
            address ?? null,
            tin ?? null,
            pvtName,
        ])
    } else {
        db.run("INSERT INTO party VALUES (?,?,?,?,?)", [
            null,
            pvtName,
            name,
            address ?? null,
            tin ?? null,
        ])
    }
}

export const createItemFilter = (db: Database) => {
    const stmt = db.prepare("SELECT name, hsn FROM party WHERE name LIKE :name")
    return (name: string) => {
        stmt.reset()
        stmt.bind({ ":name": `%${name}%` })
        const result: string[] = []
        while (stmt.step()) {
            result.push(stmt.get()[0] as string)
        }
        return result
    }
}

export const getItemHsn = (db: Database, name: string): string | undefined => {
    const stmt = db.prepare(
        "SELECT name, hsn FROM item WHERE name=:name",
    )
    const { hsn } = stmt.getAsObject({ ":name": name })
    if (hsn !== null) {
        return hsn as string
    }
}

/** Update items list with hsn */
export const setHsn = (db: Database, name: string, hsn?: string): void => {
    const stmt = db.prepare("SELECT name FROM item WHERE name LIKE :name")
    const { key } = stmt.getAsObject({ ":name": name })
    if (key !== null) {
        db.run("UPDATE item SET name=?, hsn=? WHERE name=?", [
            name,
            hsn ?? null,
        ])
    } else {
        db.run("INSERT INTO item VALUES (?,?,?)", [
            null,
            name,
            hsn ?? null,
        ])
    }
}

export const incrementSavename = (): void => {
    const no = parseInt(readFileSync(savenamePath, "utf-8"), 10)
    writeFileSync(`${BASEPATH}/savename.txt`, (no + 1).toString())
}

export const initSqlDb = async () => {
    const sql = await initSqlJs({
        locateFile: (file) => `./node_modules/sql.js/dist/${file}`,
    })
    const data = readFileSync(sqliteDbPath)
    const db = new sql.Database(data)
    return db
}

export const saveSqlDb = async (db: Database) => {
    const newData = db.export()
    writeFileSync(sqliteDbPath, newData)
}
