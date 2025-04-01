export type Party = {
    name: string
    address: string
    tin: string
    privateMark: string
}

export type Item = {
    particulars: string
    size: string
    hsn: number
    quantity: number
    unit: string
    rate: number
    gst: number
}

export type Bill = {
    date: Date
    invoice: string
    transport: string
    paymentTerms: string
    esugam: string
    items: Item[]
}
