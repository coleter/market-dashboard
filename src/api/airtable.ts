import Airtable from 'airtable'
import type { RecordEntry } from '../types/records'

const base_id = 'appSr0epmnJWRp7LB'
const enrollment_id = 'tblnNwBNUThIqVxiT'
const checkout_id = 'tbleOEvpQyQvTnQap'
const key = import.meta.env.VITE_AIRTABLE_TOKEN

Airtable.configure({ endpointUrl: 'https://api.airtable.com', apiKey: key })
const base = Airtable.base(base_id)

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
      ],
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

    const name = (record.get('Name - Shopper #1') as string) || ''
    const affiliation = (record.get('Affiliation') as string) || ''
    const phone = (record.get('Household Primary Phone') as string) || ''
    const neighborhood = (record.get('Neighborhood') as string) || ''
    const ethnicity = record.get('Ethnicity') ?? [] // Could be [] or null
    const adults = record.get('Household - # of Adults') ?? null
    const children = record.get('Household - # of children') ?? null
    const marketCheckouts = (record.get('Market Checkout') as string[]) || []

    // Compute info completeness
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
    }
  })
}

const PERSON_TYPE_MAP: Record<string, string> = {
  'Parent/Caregiver': 'Parent/Caregiver | Padre/Cuidador',
  Staff: 'Staff / Empleado',
  'Staff - Shopping for a Family': 'Staff - Shopping for a Family',
}

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

export async function fetchTransitionNotice(recordId: string): Promise<boolean> {
  const records = await base(enrollment_id)
    .select({
      filterByFormula: `RECORD_ID()='${recordId}'`,
      fields: ['Transition Notice'],
      maxRecords: 1,
    })
    .all()

  if (!records.length) return false
  return Boolean(records[0].get('Transition Notice'))
}

export async function updateTransitionNotice(recordId: string, value: boolean) {
  const payload = [
    {
      id: recordId,
      fields: {
        'Transition Notice': value,
      },
    },
  ]
  try {
    const updated = await base(enrollment_id).update(payload, { typecast: true })
    return Boolean(updated[0].get('Transition Notice'))
  } catch (err) {
    console.error('Error updating Transition Notice:', err)
    throw err
  }
}
