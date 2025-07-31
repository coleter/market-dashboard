<template>
  <section class="section">
    <div class="container" style="max-width: 800px">
      <h1 class="title is-3 has-text-centered mb-5">Market Records</h1>

      <!-- Table -->
      <table class="table is-fullwidth is-striped is-hoverable">
        <thead>
          <tr>
            <th>Barcode</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="record in records" :key="record.barcode">
            <td>{{ record.barcode }}</td>
            <td>{{ record.name }}</td>
          </tr>
        </tbody>
      </table>
      <a href="/." class="button is-link">Checkout View</a>
    </div>
  </section>
</template>

<script setup lang="ts">
interface RecordEntry {
  barcode: string
  name: string
}

const records: RecordEntry[] = [
  { barcode: '20000587', name: 'Carolina Rojas' },
  { barcode: '20000267', name: 'Irma Reyes' },
  { barcode: '20000322', name: 'Victoria Salazar' },
  { barcode: '20000768', name: 'Ashante Anita Gomez (duplicate #0768)' },
  { barcode: '20000336', name: 'Tamara Scott' },
  { barcode: '20000675', name: 'Grisel Nieto' },
  { barcode: '20000087', name: 'Marzia Mobarez' },
  { barcode: '20000034', name: 'Adriana Ibarra' },
  { barcode: '20000221', name: 'Brande Staha' },
  { barcode: '20000297', name: 'Leticia Lopez' },
  { barcode: '20000829', name: 'Shamika Jones, Terrance Jones' },
]
</script>

<style scoped>
.table {
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  overflow: hidden;
}

th {
  background-color: rgb(122, 195, 189);
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
</style>
