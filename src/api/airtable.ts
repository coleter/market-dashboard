import Airtable from 'airtable'
import type { RecordEntry } from '../types/records'

const base_id = 'appSr0epmnJWRp7LB'
const enrollment_id = 'tblnNwBNUThIqVxiT'
const key = import.meta.env.VITE_AIRTABLE_TOKEN

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: key })
const base = Airtable.base(base_id)

export async function fetchRecords(): Promise<RecordEntry[]> {
  const records = await base(enrollment_id)
    .select({
      fields: ['Barcode', 'Name - Shopper #1', 'Affiliation'],
      filterByFormula:
        "AND(AND(NOT({Access Revoked}), NOT({Barcode} = '')), NOT({Name - Shopper #1} = ''))",
      sort: [{ field: 'Barcode', direction: 'asc' }],
    })
    .all()

  return records.map((record) => {
    const barcodeValue = record.get('Barcode')
    const barcodeText =
      typeof barcodeValue === 'object' && barcodeValue !== null && 'text' in barcodeValue
        ? (barcodeValue as { text: string }).text
        : String(barcodeValue || '')

    return {
      barcode: barcodeText,
      name: (record.get('Name - Shopper #1') as string) || '',
      affiliation: (record.get('Affiliation') as string) || '',
    }
  })
}
