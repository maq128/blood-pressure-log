<script setup>
import { ref } from 'vue'
import { Dialog, Field } from 'vant'

let autoFocus = ref(null)

let options = ref({
  show: false,
  title: '',
  text: '',
})

let promise = ref({})

async function open(args) {
  let {
    title = '请输入：',
    def = ''
  } = args
  options.value = {
    show: true,
    title,
    text: def,
  }
  // 设置输入焦点，这里使用 nextTick() 不管用
  setTimeout(() => {
    autoFocus.value.$el.querySelector('input').focus()
  }, 0)

  return new Promise((resolve, reject) => {
    promise.value = { resolve, reject }
  })
}

defineExpose({ open })
</script>

<template>
  <Dialog
    v-model:show="options.show"
    confirm-button-text="确定"
    :confirm-button-disabled="!(options.text)"
    show-cancel-button
    class="input-dlg"
    :title="options.title"
    @confirm="promise.resolve(options.text)"
    @cancel="promise.reject()"
  >
    <Field
      v-model="options.text"
      type="text"
      input-align="center"
      ref="autoFocus"
    />
  </Dialog>
</template>

<style scoped>
</style>
