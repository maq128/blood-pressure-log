<script setup>
import { ref } from 'vue'
import $api from '@/libs/api'
import { Button, Cell, Field, showConfirmDialog, showDialog } from 'vant'
import UploaderDlg from './UploaderDlg.vue'

const emit = defineEmits([
  'sheet',
])

let adminPwd = ref('')
let sheets = ref({})
let uploaderDlg = ref(null)

function sheetList() {
  $api.sheetList(adminPwd.value)
    .then(result => {
      if (result.errMsg === 'ok') {
        sheets.value = result.data
      }
    })
    .catch(err => {
      showDialog({
        title: '操作错误',
        message: err.response && err.response.data && err.response.data.errMsg || err.message,
        confirmButtonText: '知道了'
      })
    })
}

function sheetRemove(sheet) {
  let { name, num } = sheet
  showConfirmDialog({
    title: '删除数据表',
    message: `确认要删除数据表【${name}】吗？\n表中现有 ${num} 条记录。`,
    messageAlign: 'left',
  }).then(() => {
    $api.sheetRemove(adminPwd.value, name)
      .then(result => {
        showDialog({
          title: '操作成功',
          message: `数据表【${name}】已删除。`,
          confirmButtonText: '知道了'
        })
        sheets.value = result.data
      })
      .catch(err => {
        showDialog({
          title: '操作错误',
          message: err.response && err.response.data && err.response.data.errMsg || err.message,
          confirmButtonText: '知道了'
        })
      })
  }).catch(err => 0)
}

function dbRestore() {
  uploaderDlg.value.open(adminPwd.value)
}
</script>

<template>
  <div class="admin">
    <fieldset>
      <legend>运维操作</legend>
      <Field
        type="password"
        v-model="adminPwd"
        label="操作密码"
        placeholder="请输入操作密码"
      />
      <div class="toolbar">
        <Button
          @click="sheetList"
          type="primary"
          :disabled="!adminPwd"
        >查看列表</Button>

        <Button
          @click="$api.dbBackup(adminPwd)"
          type="primary"
          :disabled="!adminPwd"
        >备份</Button>

        <Button
          @click="dbRestore"
          type="primary"
          :disabled="!adminPwd"
        >恢复</Button>
      </div>
    </fieldset>

    <fieldset v-if="sheets.length > 0">
      <legend>数据表</legend>
      <Cell
        v-for="sheet in sheets"
        :title="`${sheet.name} [${sheet.num}]`"
        title-class="sheet-item-title"
        class="sheet-item"
      >
        <Button
          type="danger"
          size="mini"
          @click="sheetRemove(sheet)"
        >删除</Button>

        <Button
          type="success"
          size="mini"
          @click="emit('sheet', sheet)"
        >更多操作</Button>
      </Cell>
    </fieldset>

    <UploaderDlg ref="uploaderDlg" />
  </div>
</template>

<style scoped>
.toolbar {
  text-align: center;
}
.toolbar button {
  margin: 0.2em 0.5em;
}
.sheet-item:hover {
  background-color: #eee;
}
:deep(.sheet-item-title) {
  flex: unset;
}
</style>
