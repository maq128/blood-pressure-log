<script setup>
import { ref } from 'vue'
import { Button } from 'vant'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  },
  options: {
    type: Array,
    required: true
  }
})

let selectIdx = ref(-1)
let buttonOption = ref(props.options[0])

const emit = defineEmits([
  'click',
])

for (let option of props.options) {
  if (option.def) {
    buttonOption.value = option
  }
}

function onSelectChange() {
  buttonOption.value = props.options[selectIdx.value]
  selectIdx.value = -1
  emit('click', { ...buttonOption.value })
}

function onButtonClick() {
  emit('click', { ...buttonOption.value })
}
</script>

<template>
  <div class="dropdown-button">
    <Button
      type="success"
      class="button"
      :disabled="props.disabled"
      @click="onButtonClick"
    >{{ buttonOption.text }}</Button>

    <select
      v-model="selectIdx"
      class="select"
      :disabled="props.disabled"
      @change="onSelectChange"
    >
      <option
        v-for="(opt, idx) in options"
        :value="idx"
      >{{ opt.text }}</option>
    </select>
  </div>
</template>

<style scoped>
.dropdown-button {
  display: inline-block;
}
.button {
  vertical-align: middle;
  border-radius: var(--van-button-radius) 0 0 var(--van-button-radius);
}
.select {
  vertical-align: middle;
  outline: none;
  width: 1.5em;
  height: var(--van-button-default-height);
  border: var(--van-button-border-width) solid var(--van-button-success-border-color);
  border-left: 1px solid white;
  border-radius: 0 var(--van-button-radius) var(--van-button-radius) 0;
  font-size: var(--van-button-normal-font-size);
  color: var(--van-button-success-color);
  background: var(--van-button-success-background);
  transition: opacity var(--van-duration-fast);
}
.select:disabled {
  opacity: var(--van-button-disabled-opacity);
}
</style>
