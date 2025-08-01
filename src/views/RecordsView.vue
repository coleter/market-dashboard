<template>
  <section class="section">
    <div class="container" style="max-width: 800px">
      <h1 class="title is-3 has-text-centered mb-5">Market Card Lookup</h1>

      <!-- Filter + Search Row -->
      <div class="columns is-vcentered mb-4">
        <!-- Affiliation Filter -->
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

        <!-- Search Box -->
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
          <!-- Loading row -->
          <tr v-if="loading">
            <td colspan="2" class="has-text-centered">Loading...</td>
          </tr>

          <!-- No results -->
          <tr v-else-if="filteredRecords.length === 0">
            <td colspan="2" class="has-text-centered has-text-grey">
              No records match your search/filter.
            </td>
          </tr>

          <!-- Actual rows -->
          <tr
            v-else
            v-for="record in filteredRecords"
            :key="record.barcode"
            :class="[rowClass(record.affiliation), 'clickable-row']"
            @click="goToCheckout(record.barcode)"
          >
            <td>{{ record.barcode }}</td>
            <td>{{ record.name }}</td>
          </tr>
        </tbody>
      </table>

      <!-- Checkout Button -->
      <a href="/." class="button is-link mt-4">Back to Checkout</a>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { fetchRecords } from '../api/airtable'
import type { RecordEntry } from '../types/records'

const router = useRouter()

// State
const records = ref<RecordEntry[]>([])
const loading = ref(true)
const selectedFilter = ref('all') // all | enrolled | community
const searchQuery = ref('')

// Navigate to checkout with pre-filled barcode
function goToCheckout(barcode: string) {
  router.push({ path: '/', query: { barcode } })
}

// Row color class function
function rowClass(affiliation: string) {
  if (affiliation === 'Clayton Enrolled Program') return 'row-green'
  if (affiliation === 'Community' || affiliation === 'Formerly Clayton Enrolled') return 'row-blue'
  return ''
}

// Computed: Filtered + searched records
const filteredRecords = computed(() => {
  let result = records.value
  if (selectedFilter.value === 'enrolled') {
    result = result.filter((r) => r.affiliation === 'Clayton Enrolled Program')
  } else if (selectedFilter.value === 'community') {
    result = result.filter(
      (r) => r.affiliation === 'Community' || r.affiliation === 'Formerly Clayton Enrolled',
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

// Fetch Airtable data
onMounted(async () => {
  try {
    loading.value = true
    records.value = await fetchRecords()
  } catch (err) {
    console.error('Failed to load records:', err)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.table {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;
  table-layout: fixed;
  width: 100%;
}

th,
td {
  text-align: left;
  padding: 0.75em;
}

th {
  background-color: rgb(122, 195, 189);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

th:first-child,
td:first-child {
  width: 30%;
}
th:last-child,
td:last-child {
  width: 70%;
}

.row-green {
  background-color: rgba(122, 195, 150, 0.2);
}

.row-blue {
  background-color: rgba(122, 180, 195, 0.2);
}

/* Make rows clickable */
.clickable-row {
  cursor: pointer;
}
.clickable-row:hover {
  background-color: rgba(0, 0, 0, 0.05) !important;
}
</style>
