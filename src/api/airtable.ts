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
        'fldY8QBBuOu1aQAzq',
        'Market Checkout',
        'Community Site',
        'Access Revoked',
        'First Checkout Date',
      ],
      filterByFormula: "NOT(OR({Barcode} = '', {Name - Shopper #1} = ''))",
    })
    .all()

  const transformedRecords = records.map((record) => {
    const barcodeValue = record.get('Barcode')
    const barcodeText =
      typeof barcodeValue === 'object' && barcodeValue !== null && 'text' in barcodeValue
        ? (barcodeValue as { text: string }).text
        : String(barcodeValue || '')

    const name = (record.get('Name - Shopper #1') as string) || ''
    const affiliation = (record.get('Affiliation') as string) || ''
    const phone = (record.get('Household Primary Phone') as string) || ''
    const neighborhood = (record.get('Neighborhood') as string) || ''
    const ethnicity = record.get('Ethnicity') ?? []
    const adults = record.get('Household - # of Adults') ?? null
    const children = record.get('Household - # of children') ?? null
    const childrensAges = (record.get('fldY8QBBuOu1aQAzq') as string) || ''
    const marketCheckouts = (record.get('Market Checkout') as string[]) || []
    const communitySite = (record.get('Community Site') as string) || []
    const isStaff = communitySite === 'Clayton Staff'
    const isRevoked = record.get('Access Revoked') === true || record.get('Access Revoked') === 1
    const firstCheckoutDate = record.get('First Checkout Date') as string | null

    // Debug logging for the first few records
    if (transformedRecords.length < 3) {
      console.log(`Debug for ${name} (${barcodeText}):`, {
        phone: phone,
        phoneValid: !!(phone && phone.trim() !== ''),
        neighborhood: neighborhood,
        neighborhoodValid: !!(neighborhood && neighborhood.trim() !== ''),
        ethnicity: ethnicity,
        ethnicityValid: !!(Array.isArray(ethnicity) && ethnicity.length > 0),
        children: children,
        childrenValid: !!(typeof children === 'number'),
        childrensAges: childrensAges,
        childrensAgesValid: !!(childrensAges && childrensAges.trim() !== '')
      })
    }

    // Check if all required fields are present and not blank
    const hasAllInfo = !!(
      phone && phone.trim() !== '' &&
      neighborhood && neighborhood.trim() !== '' &&
      Array.isArray(ethnicity) && ethnicity.length > 0 &&
      typeof children === 'number' &&
      childrensAges && childrensAges.trim() !== ''
    )

    return {
      id: record.id,
      barcode: barcodeText,
      name,
      affiliation,
      hasAllInfo,
      marketCheckouts,
      isStaff,
      isRevoked,
      firstCheckoutDate,
    }
  })

  // Client-side sorting: oldest first checkout date to newest, then never checked out. Subsort by barcode
  return transformedRecords.sort((a, b) => {
    // If both have first checkout dates, sort by date (oldest first)
    if (a.firstCheckoutDate && b.firstCheckoutDate) {
      const dateComparison =
        new Date(a.firstCheckoutDate).getTime() - new Date(b.firstCheckoutDate).getTime()
      // If dates are the same, sort by barcode
      if (dateComparison === 0) {
        return parseInt(a.barcode) - parseInt(b.barcode)
      }
      return dateComparison
    }

    // If only a has a date, a comes first
    if (a.firstCheckoutDate && !b.firstCheckoutDate) {
      return -1
    }

    // If only b has a date, b comes first
    if (!a.firstCheckoutDate && b.firstCheckoutDate) {
      return 1
    }

    // If neither has a date, sort by barcode numerically
    return parseInt(a.barcode) - parseInt(b.barcode)
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
