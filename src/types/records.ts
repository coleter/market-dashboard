export interface RecordEntry {
  barcode: string
  name: string
  affiliation: string
  phone: string
  neighborhood: string
  ethnicity: string
  adults: number | null
  children: number | null
  hasAllInfo: boolean
}
