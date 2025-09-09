<template>
  <section class="section">
    <div class="container" style="max-width: 1000px">
      <!-- Logo -->
      <figure class="image has-text-centered mb-5">
        <img src="/ClaytonLogoNew.png" alt="Clayton Logo" style="max-width: 500px; margin: auto" />
      </figure>
      <h1 class="title is-3 has-text-centered mb-5">Market Checkout Form</h1>

      <!-- Checkout Form -->
      <div class="container" style="max-width: 1000px">
        <form class="box" @submit.prevent="handleSubmit" @keydown.enter="handleEnterKey">
          <!-- Barcode -->
          <div class="field">
            <label class="label">Market Barcode</label>
            <div class="control">
              <input
                class="input"
                type="number"
                v-model="barcode"
                ref="barcodeInput"
                placeholder="Scan or enter the number on the market card"
                required
                autofocus
              />
            </div>
          </div>

          <!-- Profile info section -->
          <div v-if="selectedRecord" class="box mt-4">
            <table class="table is-fullwidth">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Affiliation</th>
                  <th>Last Checkout</th>
                  <th>Info Complete?</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ selectedRecord.name }}</td>
                  <td :class="selectedRecord.isRevoked ? 'has-text-danger' : ''">
                    {{ formattedAffiliation }}
                  </td>
                  <td>
                    <span :class="lastCheckoutClass">{{ formattedLastCheckout }}</span>
                  </td>
                  <td>
                    <span
                      :class="selectedRecord.hasAllInfo ? 'has-text-success' : 'has-text-danger'"
                    >
                      {{ selectedRecord.hasAllInfo ? 'Yes' : 'No' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Success Indicator -->
          <p v-if="successMessage" class="has-text-success has-text-centered mt-2">Submitted!</p>

          <!-- Person Type -->
          <div class="field">
            <label class="label">Person Type</label>
            <div class="control">
              <label class="radio">
                <input type="radio" value="Parent/Caregiver" v-model="personType" required />
                Parent/Caregiver
              </label>
              <br />
              <label class="radio">
                <input type="radio" value="Staff" v-model="personType" />
                Staff
              </label>
              <br />
              <label class="radio">
                <input type="radio" value="Staff - Shopping for a Family" v-model="personType" />
                Staff - Shopping for a Family
              </label>
            </div>
          </div>

          <!-- Food Weight -->
          <div class="field">
            <label class="label">Food Weight (in lbs)</label>
            <div class="control">
              <input
                class="input"
                type="number"
                step="1"
                v-model="foodWeight"
                required
                ref="foodWeightInput"
              />
            </div>
          </div>

          <!-- Submit -->
          <div class="field mt-5">
            <div class="control">
              <button type="submit" class="button is-primary is-fullwidth">Submit</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Card Lookup Section -->
    <div class="container mt-6" style="max-width: 1000px">
      <h2 class="title is-4 has-text-centered mb-4">Market Card Lookup</h2>

      <!-- Filter & Search -->
      <div class="columns is-vcentered mb-4">
        <div class="column is-half">
          <label class="label">Filter by Affiliation:</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="selectedFilter">
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="enrolled">Clayton Enrolled</option>
                <option value="community">Community / Formerly Enrolled</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
        </div>

        <div class="column is-half">
          <label class="label">Search:</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="searchQuery"
              placeholder="Search by barcode or name"
              @keydown.enter="handleSearchEnter"
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <table class="table is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th style="width: 33%">Barcode</th>
            <th style="width: 66%">Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="2" class="has-text-centered">Loading...</td>
          </tr>
          <tr v-else-if="filteredRecords.length === 0">
            <td colspan="2" class="has-text-centered has-text-grey">
              No records match your search/filter.
            </td>
          </tr>
          <tr
            v-else
            v-for="record in filteredRecords"
            :key="record.barcode"
            :class="[rowClass(record.affiliation, record.isRevoked), 'clickable-row']"
            @click="selectRecord(record.barcode)"
          >
            <td>{{ record.barcode }}</td>
            <td>{{ record.name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { submitCheckout, fetchRecords, fetchCheckoutRecords } from '../api/airtable'
import type { RecordEntry } from '../types/records'

// Form vars
const barcode = ref('')
const personType = ref('Parent/Caregiver')
const foodWeight = ref<number | null>(null)
const successMessage = ref(false)
const allowEnterSubmit = ref(true)
const barcodeInput = ref<HTMLInputElement | null>(null)
const foodWeightInput = ref<HTMLInputElement | null>(null)

// Lookup vars
const records = ref<RecordEntry[]>([])
const loading = ref(true)
const selectedFilter = ref('active')
const searchQuery = ref('')

// More info section
const selectedRecord = ref<RecordEntry | null>(null)
const lastCheckoutDate = ref<string | null>(null)

// Row styling helper
function rowClass(affiliation: string, revoked: boolean) {
  if (revoked) return 'row-grey'
  if (affiliation === 'Clayton Enrolled Program') return 'row-teal'
  if (affiliation === 'Community' || affiliation === 'Formerly Clayton Enrolled')
    return 'row-orange'
  return ''
}

// Filter/search list
const filteredRecords = computed(() => {
  let result = records.value
  if (selectedFilter.value === 'active') {
    result = result.filter((r) => r.isRevoked === false)
  } else if (selectedFilter.value === 'enrolled') {
    result = result.filter(
      (r) => r.affiliation === 'Clayton Enrolled Program' && r.isRevoked === false,
    )
  } else if (selectedFilter.value === 'community') {
    result = result.filter((r) =>
      (['Community', 'Formerly Clayton Enrolled'].includes(r.affiliation)) && r.isRevoked === false,
    )
  } else if (selectedFilter.value === 'staff') {
    result = result.filter((r) => r.isStaff && !r.isRevoked)
  }
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (r) => r.barcode.toLowerCase().includes(query) || r.name.toLowerCase().includes(query),
    )
  }
  return result
})

// Form submission
async function handleSubmit() {
  // Ensure valid data
  barcode.value = (barcode.value || '').toString().replace(/\s+/g, '')
  const barcodeRegex = /^2000\d{4}$/

  if (!barcode.value || foodWeight.value == null) {
    alert('Please fill out all fields before submitting.')
    return
  }
  if (!barcodeRegex.test(barcode.value)) {
    alert(`Invalid barcode - does not match 2000XXXX. Barcode: "${barcode.value}"`)
    return
  }
  if (foodWeight.value < 0 || foodWeight.value > 99) {
    alert('Invalid food weight.')
    return
  }

  // Actual submission
  try {
    await submitCheckout(barcode.value, personType.value, foodWeight.value!)
    successMessage.value = true
    setTimeout(() => (successMessage.value = false), 2000)

    // Reset form
    barcode.value = ''
    personType.value = 'Parent/Caregiver'
    foodWeight.value = null
    selectedRecord.value = null
    lastCheckoutDate.value = null
    nextTick(() => barcodeInput.value?.focus())
  } catch (err) {
    console.error('Airtable submission failed', err)
    alert('Failed to submit checkout.')
  }
}

// Fetch records on load
onMounted(async () => {
  loading.value = true
  try {
    records.value = await fetchRecords()
  } catch (err) {
    console.error('Failed to load records:', err)
  } finally {
    loading.value = false
  }
})

// Map Airtable affinities to actual used affinities
const formattedAffiliation = computed(() => {
  if (!selectedRecord.value) return ''
  if (selectedRecord.value.isRevoked) return 'REVOKED - ' + getBaseAffiliation()
  if (selectedRecord.value.isStaff) return 'Staff'
  return getBaseAffiliation()
})

// Helper function to get base affiliation without revoked prefix
function getBaseAffiliation() {
  if (!selectedRecord.value) return ''
  if (selectedRecord.value.isStaff) return 'Staff'
  if (selectedRecord.value.affiliation === 'Clayton Enrolled Program') return 'Enrolled'
  if (selectedRecord.value.affiliation === 'Formerly Clayton Enrolled') return 'Community'
  return selectedRecord.value.affiliation
}

// Choose record
function selectRecord(selectedBarcode: string) {
  barcode.value = selectedBarcode
  searchQuery.value = ''
  allowEnterSubmit.value = false

  const record = records.value.find((r) => r.barcode === selectedBarcode)
  if (record?.isStaff) {
    personType.value = 'Staff'
  } else {
    personType.value = 'Parent/Caregiver'
  }

  nextTick(() => {
    foodWeightInput.value?.focus()
    setTimeout(() => {
      allowEnterSubmit.value = true
    }, 300)
  })
}

// Trigger selectRecord whenever barcode length is 8
// Allows for typing a number, clicking a record after searching, or scanning a barcode
watch(barcode, (newVal) => {
  const cleaned = newVal?.toString().trim() || ''
  if (cleaned.length === 8) {
    // Always prevent immediate submission when barcode changes
    allowEnterSubmit.value = false
    
    const match = records.value.find((r) => r.barcode.trim() === cleaned)
    if (match) {
      selectedRecord.value = match
      selectRecord(cleaned)
    } else {
      // For unsynced profiles, clear selected record but don't prevent submission
      selectedRecord.value = null
      lastCheckoutDate.value = null
      
      // Still focus on food weight input for faster workflow
      nextTick(() => {
        foodWeightInput.value?.focus()
        // Re-enable enter submission after delay (same as selectRecord does)
        setTimeout(() => {
          allowEnterSubmit.value = true
        }, 300)
      })
    }
  } else {
    selectedRecord.value = null
    lastCheckoutDate.value = null
  }
})

// Recent checkout formatting & color
const isRecentCheckout = computed(() => {
  if (!lastCheckoutDate.value) return false

  // Check if user is revoked and checked out after 9/1/25
  if (selectedRecord.value?.isRevoked) {
    const checkoutDate = new Date(lastCheckoutDate.value)
    const revokeDate = new Date('2025-09-01')
    return checkoutDate > revokeDate
  }

  // Regular logic: red if checkout was within last 6 days
  const diff = Date.now() - new Date(lastCheckoutDate.value).getTime()
  return diff < 6 * 24 * 60 * 60 * 1000
})

const formattedLastCheckout = computed(() => {
  if (!lastCheckoutDate.value) return '-'
  const date = new Date(lastCheckoutDate.value)
  return date.toLocaleDateString()
})

const lastCheckoutClass = computed(() => {
  return isRecentCheckout.value ? 'has-text-danger' : ''
})

// Pull checkout info only when a record is selected
watch(selectedRecord, async (record) => {
  lastCheckoutDate.value = null
  if (record) {
    if (record?.marketCheckouts?.length) {
      const checkouts = await fetchCheckoutRecords(record.marketCheckouts)
      if (checkouts.length > 0) {
        checkouts.sort(
          (a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime(),
        )
        lastCheckoutDate.value = checkouts[0].createdTime
      }
    }
  }
})

// Our barcode scanners send an enter keystroke, so this prevents accidental submission
function handleEnterKey(event: KeyboardEvent) {
  const target = event.target as HTMLInputElement
  if (target !== foodWeightInput.value || !allowEnterSubmit.value) {
    event.preventDefault()
  }
}

// Handle enter in search if there's only one record
// Also handles if barcodes are scanned into search
function handleSearchEnter(event: KeyboardEvent) {
  if (filteredRecords.value.length === 1) {
    event.preventDefault()
    selectRecord(filteredRecords.value[0].barcode)
  }
}
</script>
