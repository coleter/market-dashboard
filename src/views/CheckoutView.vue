<template>
  <section class="section">
    <div class="container" style="max-width: 500px">
      <!-- Logo -->
      <figure class="image has-text-centered mb-5">
        <img src="/ClaytonLogoNew.png" alt="Clayton Logo" style="max-width: 500px; margin: auto" />
      </figure>
      <h1 class="title is-3 has-text-centered mb-5">Market Checkout Form</h1>

      <!-- Form -->
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
            <input class="input" type="number" step="1" v-model="foodWeight" required />
          </div>
        </div>

        <!-- Submit -->
        <div class="field mt-5">
          <div class="control">
            <button type="submit" class="button is-primary is-fullwidth">Submit</button>
          </div>
        </div>
      </form>

      <!-- Records link -->
      <router-link to="/records" class="button is-link mt-3">Card Lookup</router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { submitCheckout } from '../api/airtable'

const route = useRoute()
const router = useRouter()

const barcode = ref('')
const personType = ref('Parent/Caregiver')
const foodWeight = ref<number | null>(null)
const successMessage = ref(false)
const barcodeInput = ref<HTMLInputElement | null>(null)

onMounted(() => {
  // Pre-fill barcode if passed in query
  if (route.query.barcode && typeof route.query.barcode === 'string') {
    barcode.value = route.query.barcode
  }

  // Focus the barcode field
  nextTick(() => barcodeInput.value?.focus())
})

async function handleSubmit() {
  console.log('Submitting checkout with values:', {
    barcode: barcode.value,
    personType: personType.value,
    foodWeight: foodWeight.value,
  })

  // Clean barcode (remove spaces)
  barcode.value = barcode.value.replace(/\s+/g, '')

  // Validate fields
  if (!barcode.value || !personType.value || foodWeight.value == null) {
    alert('Please fill out all fields before submitting.')
    return
  }

  // Validate barcode format
  const barcodeRegex = /^2000\d{4}$/
  if (!barcodeRegex.test(barcode.value)) {
    alert('Invalid barcode. It should be in the format 2000xxxx.')
    return
  }

  // Validate weight
  if (foodWeight.value <= 0 || foodWeight.value > 99) {
    alert('Please enter a food weight between 1 and 99 lbs.')
    return
  }

  try {
    await submitCheckout(barcode.value, personType.value, foodWeight.value!)

    // Show success indicator
    successMessage.value = true
    setTimeout(() => (successMessage.value = false), 2000) // hide after 2 sec

    // Clear form
    barcode.value = ''
    personType.value = 'Parent/Caregiver'
    foodWeight.value = null

    // Focus barcode field for next scan
    nextTick(() => barcodeInput.value?.focus())

    // Clean the URL (remove ?barcode=...)
    router.replace({ query: {} })
  } catch (err) {
    console.error('Airtable submission failed', err)
    alert('Failed to submit checkout.')
  }
}
</script>
