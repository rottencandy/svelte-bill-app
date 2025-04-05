import { readFileSync, writeFileSync } from "fs"
import { BASEPATH } from "./const"

const baseDbPath = `${BASEPATH}/__database__`
const pvtAddressPath = `${baseDbPath}/pvtaddresses.json`
const addressesPath = `${baseDbPath}/addresses.json`
const itemsPath = `${baseDbPath}/items.json`
const unitsPath = `${baseDbPath}/units.json`
const savenamePath = `${BASEPATH}/savename.txt`

/** key, value paris of name to [address, tin], addresses.json */
type Addresses = Record<string, [address: string, tin: string]>

/** key, value paris of pvtname to party name, pvtaddresses.json */
type PvtAddresses = Record<string, string>

/** key, value paris of name to hsn, item.json */
type Items = Record<string, string>

/** array of unit names, units.json */
type Units = string[]

export const getPvtAddresses = (): PvtAddresses =>
    JSON.parse(readFileSync(pvtAddressPath, "utf-8"))

export const getAddresses = (): Addresses =>
    JSON.parse(readFileSync(addressesPath, "utf-8"))

export const getItems = (): Items =>
    JSON.parse(readFileSync(itemsPath, "utf-8"))

export const getUnits = (): Units =>
    JSON.parse(readFileSync(unitsPath, "utf-8"))

/** Returns the latest invoice number */
// TODO: check for file validity?
export const getInvoiceNo = (): number =>
    parseInt(readFileSync(savenamePath, "utf-8"), 10)

export const getAllPvtMarks = (): string[] => Object.keys(getPvtAddresses())

export const getNameByPvt = (pvt: string): string | undefined =>
    getPvtAddresses()[pvt]

export const setPvt = (name: string, pvt: string): void => {
    const details = getPvtAddresses()
    details[pvt] = name
    writeFileSync(pvtAddressPath, JSON.stringify(details))
}

/** Checks whether given name is in database. If so returns their [address,tin] */
export const getPartyDetails = (name: string) => {
    const details = getAddresses()
    if (name in details) {
        return details[name]
    }
}

/** Takes 3 strings name,address,tin and updates database */
export const setPartyDetails = (
    name: string,
    address: string,
    tin: string,
    pvtMark?: string,
): void => {
    // Update addresses.json
    const addressesDetails = getAddresses()
    addressesDetails[name] = [address, tin]
    writeFileSync(addressesPath, JSON.stringify(addressesDetails))
    // Update pvtaddresses.json if pvtMark exists
    if (pvtMark !== undefined) {
        setPvt(name, pvtMark)
    }
}

/** Update items list with hsn */
export const setHsn = (item: string, hsn: string): void => {
    const items = getItems()
    items[item] = hsn
    writeFileSync(itemsPath, JSON.stringify(items))
}

export const incrementSavename = (): void => {
    const no = parseInt(readFileSync(savenamePath, "utf-8"), 10)
    writeFileSync(`${BASEPATH}/savename.txt`, (no + 1).toString())
}
