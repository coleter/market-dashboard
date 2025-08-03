<template>
  <section class="section">
    <div class="container" style="max-width: 1000px">
      <!-- Logo -->
      <figure class="image has-text-centered mb-5">
        <img src="/ClaytonLogoNew.png" alt="Clayton Logo" style="max-width: 500px; margin: auto" />
      </figure>
      <h1 class="title is-3 has-text-centered mb-5">Market Checkout Form</h1>

      <!-- Form -->
      <div class="container" style="max-width: 1000px" ref="formSection">
        <form class="box" @submit.prevent="handleSubmit">
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

          <!-- Under Barcode Input -->
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
                  <td>{{ formattedAffiliation }}</td>
                  <td>—</td>
                  <!-- Placeholder for last checkout -->
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
            <label class="label">Please enter the total weight of food (in lbs).</label>
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

    <!-- Records Section -->
    <div class="container mt-6" style="max-width: 1000px">
      <h2 class="title is-4 has-text-centered mb-4">Market Card Lookup</h2>

      <!-- Filter + Search Row -->
      <div class="columns is-vcentered mb-4">
        <div class="column is-half">
          <label class="label">Filter by Affiliation:</label>
          <div class="control">
            <div class="select is-fullwidth">
              <select v-model="selectedFilter">
                <option value="all">All</option>
                <option value="enrolled">Clayton Enrolled</option>
                <option value="community">Community / Formerly Enrolled</option>
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
            />
          </div>
        </div>
      </div>

      <!-- Table -->
      <table class="table is-fullwidth is-hoverable">
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Name</th>
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
            :class="[rowClass(record.affiliation), 'clickable-row']"
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
import { submitCheckout, fetchRecords } from '../api/airtable'
import type { RecordEntry } from '../types/records'

const barcode = ref('')
const personType = ref('Parent/Caregiver')
const foodWeight = ref<number | null>(null)
const successMessage = ref(false)
const barcodeInput = ref<HTMLInputElement | null>(null)
const foodWeightInput = ref<HTMLInputElement | null>(null)

// Records
const records = ref<RecordEntry[]>([])
const loading = ref(true)
const selectedFilter = ref('all')
const searchQuery = ref('')

// Handle record click -> auto-fill barcode
const formSection = ref<HTMLElement | null>(null)

// Row color
function rowClass(affiliation: string) {
  if (affiliation === 'Clayton Enrolled Program') return 'row-teal'
  if (['Community', 'Formerly Clayton Enrolled'].includes(affiliation)) return 'row-orange'
  return ''
}

// Filtered list
const filteredRecords = computed(() => {
  let result = records.value
  if (selectedFilter.value === 'enrolled') {
    result = result.filter((r) => r.affiliation === 'Clayton Enrolled Program')
  } else if (selectedFilter.value === 'community') {
    result = result.filter((r) =>
      ['Community', 'Formerly Clayton Enrolled'].includes(r.affiliation),
    )
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
  barcode.value = barcode.value.replace(/\s+/g, '')
  const barcodeRegex = /^2000\d{4}$/

  if (!barcode.value || !personType.value || foodWeight.value == null) {
    alert('Please fill out all fields before submitting.')
    return
  }
  if (!barcodeRegex.test(barcode.value)) {
    alert('Invalid barcode')
    return
  }
  if (foodWeight.value < 0 || foodWeight.value > 99) {
    alert('Invalid food weight.')
    return
  }

  try {
    await submitCheckout(barcode.value, personType.value, foodWeight.value!)
    successMessage.value = true
    setTimeout(() => (successMessage.value = false), 2000)

    // Reset form
    barcode.value = ''
    personType.value = 'Parent/Caregiver'
    foodWeight.value = null
    nextTick(() => barcodeInput.value?.focus())
  } catch (err) {
    console.error('Airtable submission failed', err)
    alert('Failed to submit checkout.')
  }
}

// Load records
onMounted(async () => {
  loading.value = true
  try {
    records.value = await fetchRecords()
  } catch (err) {
    console.error('Failed to load records:', err)
  } finally {
    loading.value = false
    nextTick(() => barcodeInput.value?.focus())
  }
})

// More info section
const selectedRecord = ref<RecordEntry | null>(null)

const formattedAffiliation = computed(() => {
  if (!selectedRecord.value) return ''
  if (selectedRecord.value.affiliation === 'Clayton Enrolled Program') return 'Enrolled'
  if (selectedRecord.value.affiliation === 'Formerly Clayton Enrolled') return 'Community'
  return selectedRecord.value.affiliation
})

function selectRecord(selectedBarcode: string) {
  barcode.value = selectedBarcode
  searchQuery.value = ''
  nextTick(() => foodWeightInput.value?.focus())
}

watch(barcode, (newVal) => {
  const cleaned = newVal?.toString().trim() || ''
  if (cleaned.length === 8) {
    const match = records.value.find((r) => r.barcode.trim() === cleaned)
    selectedRecord.value = match || null
  } else {
    selectedRecord.value = null
  }
})
</script>

<style scoped>
.table {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;
}
.row-teal {
  background-color: rgba(122, 195, 189, 0.25);
}
.row-orange {
  background-color: rgba(224, 149, 62, 0.2);
}
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}
</style>
