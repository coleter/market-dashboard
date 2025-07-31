const base_id = 'appSr0epmnJWRp7LB'
//const checkout_id = 'tbleOEvpQyQvTnQap'
const enrollment_id = 'tblnNwBNUThIqVxiT'
import 'dotenv/config'
const key = import.meta.env?.VITE_AIRTABLE_TOKEN || process.env.VITE_AIRTABLE_TOKEN

//airtable setup
import Airtable from 'airtable'

Airtable.configure({
  endpointUrl: 'https://api.airtable.com',
  apiKey: key,
})
var base = Airtable.base(base_id)

export async function fetchRecords() {
  const records = await base(enrollment_id)
    .select({ fields: ['Barcode', 'Name - Shopper #1'] })
    .firstPage()
  // Extract just the fields
  const simplified = records.map((record) => ({
    barcode: record.get('Barcode').text,
    name: record.get('Name - Shopper #1'),
  }))
  console.log(simplified)
}

fetchRecords().catch((err) => {
  console.error('Error in fetchRecords:', err)
})
