<script setup>
import { ref } from 'vue'
import { Checkbox, Dialog, Field, Icon, showConfirmDialog } from 'vant'
import dayjs from 'dayjs'

const props = defineProps({
  readonly: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'add',
  'edit',
  'remove',
])

let log = ref({})

let show = ref(false)
let mode = ref('-')
let title = ref('...')
let autoFocus = ref(null)

function openAdd() {
  log.value = {
    sp: '',
    dp: '',
    hr: '',
    ip: false,
    ts: new Date().getTime(),
  }
  show.value = true
  mode.value = 'add'
  title.value = '添加新记录 ' + dayjs(log.value.ts).format('HH:MM')

  // 设置输入焦点，这里使用 nextTick() 不管用
  setTimeout(() => {
    autoFocus.value.$el.querySelector('input').focus()
  }, 0)
}

function openEdit(v) {
  log.value = { ...v }
  show.value = true
  mode.value = 'edit'
  title.value = dayjs(log.value.ts).format('YYYY/MM/DD HH:MM')

  // 设置输入焦点，这里使用 nextTick() 不管用
  setTimeout(() => {
    autoFocus.value.$el.querySelector('input').focus()
  }, 0)
}

function onSave() {
  let vo = {
    ts: log.value.ts,
    sp: Number(log.value.sp),
    dp: Number(log.value.dp),
    hr: Number(log.value.hr),
    ip: log.value.ip,
  }
  emit(mode.value, vo)
}

function onRemove() {
  showConfirmDialog({
    title: '删除',
    message: '确认要删除这条记录吗？'
  }).then(() => {
    emit('remove', { ...log.value })
    show.value = false
  }).catch(err => 0)
}

defineExpose({
  openAdd,
  openEdit,
})
</script>

<template>
  <Dialog
    class="editor-dlg"
    v-model:show="show"
    :show-confirm-button="!readonly"
    confirm-button-text="保存"
    :confirm-button-disabled="!(log.sp && log.dp && log.hr)"
    @confirm="onSave"
    show-cancel-button
    :cancel-button-text="readonly ? '关闭' : '取消'"
  >
    <template #title>
      <div class="title">
        {{ title }}
        <Icon
          v-if="mode == 'edit' && !readonly"
          class="delete"
          name="delete"
          color="red"
          @click="onRemove"
        />
      </div>
    </template>

    <Field
      placeholder="高压"
      v-model="log.sp"
      :readonly="readonly"
      type="number"
      autocomplete="off"
      label-align="right"
      input-align="left"
      ref="autoFocus"
    >
      <template #label>
        <div class="input-label">
          mmHg<br>收缩压
        </div>
      </template>
    </Field>

    <Field
      placeholder="低压"
      v-model="log.dp"
      :readonly="readonly"
      type="number"
      autocomplete="off"
      label-align="right"
      input-align="left"
      >
      <template #label>
        <div class="input-label">
          mmHg<br>舒张压
        </div>
      </template>
    </Field>

    <Field
      placeholder="心率"
      :readonly="readonly"
      v-model="log.hr"
      type="number"
      autocomplete="off"
      label-align="right"
      input-align="left"
      >
      <template #label>
        <div class="input-label">
          bpm<br>心率
        </div>
      </template>
    </Field>

    <Checkbox
      v-model="log.ip"
      shape="square"
      checked-color="red"
      class="irregular-pulse"
      :class="{ readonly }"
    >不规则脉波</Checkbox>
  </Dialog>
</template>

<style scoped>
.title {
  font-size: 1.2em;
}
.delete {
  cursor: pointer;
  font-size: 30px;
}
:deep(.van-field__label) {
  flex: 0.6;
  line-height: 2.8em;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.input-label {
  font-size: small;
  line-height: 1.2em;
}
:deep(input) {
  font-size: 2.5em;
  font-family: monospace;
  font-weight: bold;
}
.irregular-pulse {
  margin: 1em auto 2em;
  width: fit-content;
}
.irregular-pulse.readonly {
  pointer-events: none;
}
</style>
