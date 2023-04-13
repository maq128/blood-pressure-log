<script setup>
defineProps({
  log: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="log-card">
    <span class="sp">{{ log.sp }}</span>
    <span class="dp">{{ log.dp }}</span>
    <span class="hr">{{ log.hr }}{{ log.ip ? '~' : '' }}</span>
  </div>
</template>

<style scoped>
.log-card {
  display: inline-block;
  font-size: small;
  padding: 0.2em 0;
  cursor: pointer;
}
.sp {
  padding: 0.2em;
  color: white;
  background-color: purple;
  border-radius: 0.3em 0 0 0.3em;
}
.dp {
  padding: 0.2em;
  color: white;
  background-color: green;
}
.hr {
  padding: 0.2em;
  color: white;
  background-color: red;
  border-radius: 0 0.3em 0.3em 0;
}
</style>
