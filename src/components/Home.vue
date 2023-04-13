<script setup>
import { ref } from 'vue'
import $api from '@/libs/api'
import Admin from './Admin.vue'
import DropdownButton from './DropdownButton.vue'
import InputDlg from './InputDlg.vue'
import { Button, Cell, Field, showConfirmDialog, showDialog } from 'vant'

const props = defineProps({
  admin: {
    type: Boolean,
    default: false
  },
  sheet: Object
})

let name = ref((props.sheet || {}).name)
let pwd = ref((props.sheet || {}).pwd)
let inputDlg = ref(null)

let exportOptions = [{
  text: '导出 .xlsx',
  type: 'xls',
  def: true,
}, {
  text: '导出 .csv',
  type: 'csv',
}, {
  text: '导出 .json',
  type: 'json',
}]

function sheetCreate() {
  $api.sheetCreate(name.value, pwd.value)
    .then(result => {
      if (result.errMsg === 'ok') {
        showDialog({
          title: '已创建新数据表',
          message: '你可以在进入数据表之后收藏或分享页面链接，方便再次进入该数据表。',
          messageAlign: 'left',
          confirmButtonText: '知道了',
        }).then(() => {
          window.location = `/sid/${result.data.sid}`
        })
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

function sheetOpenReadonly() {
  $api.sheetOpenReadonly(name.value, pwd.value)
    .then(result => {
      if (result.errMsg === 'ok') {
        window.location = `/roid/${result.data.roid}`
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

function sheetOpen() {
  $api.sheetOpen(name.value, pwd.value)
    .then(result => {
      if (result.errMsg === 'ok') {
        window.location = `/sid/${result.data.sid}`
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

function sessionReset() {
  showConfirmDialog({
    title: '取消分享',
    message: [
      '此操作将导致以前收藏或分享的链接失效。',
      '',
      '确认要取消分享吗？'
    ].join('\n'),
    messageAlign: 'left',
  }).then(() => {
    $api.sessionReset(name.value, pwd.value)
      .then(result => {
        if (result.errMsg === 'ok') {
          window.location = `/sid/${result.data.sid}`
        }
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

function sheetChangeName() {
  inputDlg.value.open({ title: '请输入新名称：' }).then(newname => {
    $api.sheetChangeName(name.value, pwd.value, newname)
      .then(result => {
        showDialog({
          title: '操作成功',
          message: `数据表【${name.value}】名称已修改为【${newname}】。`,
          confirmButtonText: '知道了'
        })
        name.value = newname
      })
      .catch(err => {
        showDialog({
          title: '操作错误',
          message: err.response && err.response.data && err.response.data.errMsg || err.message,
          confirmButtonText: '知道了'
        })
      })
  }).catch(() => {})
}

function sheetChangePwd() {
  inputDlg.value.open({ title: '请输入新口令：' }).then(newpwd => {
    $api.sheetChangePwd(name.value, pwd.value, newpwd)
      .then(result => {
        showDialog({
          title: '操作成功',
          message: `数据表【${name.value}】口令已修改。`,
          confirmButtonText: '知道了'
        })
        pwd.value = newpwd
      })
      .catch(err => {
        showDialog({
          title: '操作错误',
          message: err.response && err.response.data && err.response.data.errMsg || err.message,
          confirmButtonText: '知道了'
        })
      })
  }).catch(() => {})
}
</script>

<template>
  <div class="page page-home">
    <fieldset>
      <legend>数据表操作</legend>
      <Field
        type="text"
        v-model="name"
        label="名称"
        placeholder="请输入数据表名称"
      />
      <Field
        type="text"
        v-model="pwd"
        label="口令"
        placeholder="请输入操作口令"
      />

      <div class="toolbar">
        <Button
          @click="sheetCreate"
          type="success"
          :disabled="!name || !pwd"
        >创建</Button>

        <DropdownButton
          @click="(opt)=>$api.sheetExport(name, pwd, opt.type)"
          :disabled="!name || !pwd"
          :options="exportOptions"
        />

        <Button
          @click="sheetOpen"
          type="success"
          :disabled="!name || !pwd"
        >打开</Button>

        <Button
          @click="sheetOpenReadonly"
          type="success"
          :disabled="!name || !pwd"
        >只读</Button>
      </div>

      <div class="toolbar">
        <Button
          @click="sessionReset"
          type="warning"
          :disabled="!name || !pwd"
        >取消分享</Button>

        <Button
          @click="sheetChangeName"
          type="warning"
          :disabled="!name || !pwd"
        >修改名称</Button>

        <Button
          @click="sheetChangePwd"
          type="warning"
          :disabled="!name || !pwd"
        >修改口令</Button>
      </div>
    </fieldset>

    <Admin v-if="admin" @sheet="sheet => {name=sheet.name; pwd=sheet.pwd}" />
  </div>

  <InputDlg ref="inputDlg" />
</template>

<style scoped>
.toolbar {
  margin: 1em auto;
  text-align: center;
}
.toolbar button, .toolbar .dropdown-button {
  margin: 0.2em 0.5em;
}
button {
  vertical-align: middle;
}
</style>
