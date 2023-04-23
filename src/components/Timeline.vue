<script setup>
import { Icon } from 'vant'

defineProps({
  marks: {
    type: Array,
    required: true
  },
  offset: {
    type: Number,
    required: true
  }
})
</script>

<template>
  <div class="timeline">
    <div
      v-for="mark in marks"
      class="mark"
      :class="{ h6: mark.h % 6 == 0, h12: mark.h == 12 }"
      :style="{ left: (100 * mark.offset).toFixed(2) + '%' }"
    />
    <Icon
      name="like"
      class="at"
      :style="{ left: (100 * offset).toFixed(2) + '%' }"
    />
  </div>
</template>

<style scoped>
.timeline {
  position: relative;
  margin: 1em 0.5em 0.3em 0.5em;
  border-top: 1px solid gray;
}
.mark {
  position: absolute;
  bottom: 0px;
  height: 0.3em;
  border-left: 1px solid gray;
}
.h6 {
  border-left: 2px solid black;
}
.h12 {
  border-left: 2px solid black;
  height: 0.5em;
}
.at {
  position: absolute;
  color: red;
  bottom: 0px;
  transform: translateX(-50%);
}
</style>
