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
    gst: 12 | 18 | 28
}

export type Bill = {
    date: Date
    invoice: number
    transport: string
    paymentTerms: string
    esugam: string
}
