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
              placeholder="Scan or enter the number on the market card"
              required
              autofocus
            />
          </div>
        </div>

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
      <router-link to="/records" class="button is-link mt-3">Records View</router-link>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const barcode = ref('')
const personType = ref('Parent/Caregiver')
const foodWeight = ref<number | null>(null)

onMounted(() => {
  // Pre-fill barcode if passed in query
  if (route.query.barcode && typeof route.query.barcode === 'string') {
    barcode.value = route.query.barcode
  }
})

import { submitCheckout } from '../api/airtable'

async function handleSubmit() {
  try {
    if (!barcode.value || !personType.value || !foodWeight.value) {
      alert('Please fill out all fields before submitting.')
      return
    }

    await submitCheckout(barcode.value, personType.value, foodWeight.value)
    alert('Checkout submitted successfully!')

    // Reset form
    barcode.value = ''
    personType.value = 'Parent/Caregiver'
    foodWeight.value = null
  } catch (err) {
    console.error('Error submitting checkout:', err)
    alert('Failed to submit checkout. Please try again.')
  }
}
</script>
