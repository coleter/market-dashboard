const token = import.meta.env.AIRTABLE_TOKEN
const base_id = 'appSr0epmnJWRp7LB'
const checkout_id = 'tbleOEvpQyQvTnQap'
//const enrollment_id = 'tblnNwBNUThIqVxiT'

export async function fetchRecords() {
  const response = await fetch(`https://api.airtable.com/v0/${base_id}/${checkout_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json()
  return data.records
}
