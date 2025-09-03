import Airtable from 'airtable'
import type { RecordEntry } from '../types/records'

const base_id = 'appSr0epmnJWRp7LB'
const enrollment_id = 'tblnNwBNUThIqVxiT'
const checkout_id = 'tbleOEvpQyQvTnQap'
const key = import.meta.env.VITE_AIRTABLE_TOKEN

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: key })
const base = Airtable.base(base_id)

// Main fetch - profiles and most information is here
export async function fetchRecords(): Promise<RecordEntry[]> {
  const records = await base(enrollment_id)
    .select({
      fields: [
        'Barcode',
        'Name - Shopper #1',
        'Affiliation',
        'Household Primary Phone',
        'Neighborhood',
        'Ethnicity',
        'Household - # of Adults',
        'Household - # of children',
        'Market Checkout',
        'Community Site',
        'Access Revoked',
      ],
      filterByFormula: "NOT(OR({Barcode} = '', {Name - Shopper #1} = ''))",
      sort: [{ field: 'Barcode', direction: 'asc' }],
    })
    .all()

  return records.map((record) => {
    const barcodeValue = record.get('Barcode')
    const barcodeText =
      typeof barcodeValue === 'object' && barcodeValue !== null && 'text' in barcodeValue
        ? (barcodeValue as { text: string }).text
        : String(barcodeValue || '')

    const name = (record.get('Name - Shopper #1') as string) || ''
    const affiliation = (record.get('Affiliation') as string) || ''
    const phone = (record.get('Household Primary Phone') as string) || ''
    const neighborhood = (record.get('Neighborhood') as string) || ''
    const ethnicity = record.get('Ethnicity') ?? [] // Could be [] or null
    const adults = record.get('Household - # of Adults') ?? null
    const children = record.get('Household - # of children') ?? null
    const marketCheckouts = (record.get('Market Checkout') as string[]) || []
    const communitySite = (record.get('Community Site') as string) || []
    const isStaff = communitySite === 'Clayton Staff'
    const isRevoked = record.get('Access Revoked') === true || record.get('Access Revoked') === 1

    // Compute hasAllInfo boolean
    const hasAllInfo =
      !!name &&
      !!affiliation &&
      !!barcodeText &&
      !!phone &&
      !!neighborhood &&
      Array.isArray(ethnicity) &&
      ethnicity.length > 0 &&
      typeof adults === 'number' &&
      typeof children === 'number'

    return {
      id: record.id,
      barcode: barcodeText,
      name,
      affiliation,
      hasAllInfo,
      marketCheckouts,
      isStaff,
      isRevoked,
    }
  })
}

// Mapping for Airtable compatibility
const PERSON_TYPE_MAP: Record<string, string> = {
  'Parent/Caregiver': 'Parent/Caregiver | Padre/Cuidador',
  Staff: 'Staff / Empleado',
  'Staff - Shopping for a Family': 'Staff - Shopping for a Family',
}

// Submits checkout record to Airtable
export async function submitCheckout(barcode: string, personType: string, foodWeight: number) {
  const airtablePersonType = PERSON_TYPE_MAP[personType]
  const payload = [
    {
      fields: {
        Barcode: String(barcode),
        Type: airtablePersonType,
        Pounds: foodWeight,
      },
    },
  ]
  try {
    const records = await base(checkout_id).create(payload, { typecast: true })
    return records[0]
  } catch (err) {
    console.error('Airtable error:', err)
    throw err
  }
}

// Fetch information for last checkout
export async function fetchCheckoutRecords(recordIds: string[]) {
  if (!recordIds || recordIds.length === 0) return []

  const checkoutTable = base(checkout_id)
  const records = await checkoutTable
    .select({
      filterByFormula: `OR(${recordIds.map((id) => `RECORD_ID()='${id}'`).join(',')})`,
      fields: ['Date/Time'],
    })
    .all()

  return records.map((r) => ({
    id: r.id,
    createdTime: r._rawJson.createdTime,
  }))
}
