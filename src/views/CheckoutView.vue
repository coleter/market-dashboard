<template>
  <section class="section">
    <div class="container" style="max-width: 500px">
      <!-- Logo -->
      <figure class="image has-text-centered mb-5">
        <img src="/ClaytonLogoNew.png" alt="Clayton Logo" style="max-width: 500px; margin: auto" />
      </figure>
      <h1 class="title is-3 has-text-centered mb-5">Market Checkout Form</h1>

      <!-- Form -->
      <form class="box">
        <!-- Barcode -->
        <div class="field">
          <label class="label">Market Barcode</label>
          <div class="control">
            <input
              class="input"
              type="number"
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
              <input type="radio" name="personType" value="Parent/Caregiver" required checked />
              Parent/Caregiver
            </label>
            <br />
            <label class="radio">
              <input type="radio" name="personType" value="Staff" /> Staff
            </label>
            <br />
            <label class="radio">
              <input type="radio" name="personType" value="Staff - Shopping for a Family" />
              Staff - Shopping for a Family
            </label>
          </div>
        </div>

        <!-- Food Weight -->
        <div class="field">
          <label class="label">Please enter the total weight of food (in lbs).</label>
          <div class="control">
            <input class="input" type="number" step="1" required />
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
      <a href="/records" class="button is-link">Records View</a>
    </div>
  </section>
</template>

<script setup lang="ts"></script>
