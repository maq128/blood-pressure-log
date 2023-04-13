<script setup>
import { ref } from 'vue'
import { Icon, Dialog, showDialog, Uploader } from 'vant'
import $api from '@/libs/api'

let show = ref(false)
let uploading = ref(false)
let pwd = ref('')

async function open(adminPwd) {
  show.value = true
  uploading.value = false
  pwd.value = adminPwd
}

defineExpose({ open })

function onFile(file) {
  uploading.value = true
  $api.dbRestore(pwd.value, file.file)
    .then(() => {
      show.value = false
      uploading.value = false
      showDialog({
        title: '操作成功',
        message: `数据库已经恢复。`,
        confirmButtonText: '知道了'
      })
    })
    .catch(err => {
      show.value = false
      uploading.value = false
      showDialog({
        title: '操作错误',
        message: err.response && err.response.data && err.response.data.errMsg || err.message,
        confirmButtonText: '知道了'
      })
    })
}
</script>

<template>
  <Dialog
    class="uploader-dlg"
    v-model:show="show"
    confirm-button-text="关闭"
    :confirm-button-disabled="uploading"
    title="上传数据库备份文件"
  >
    <Uploader
      class="uploader"
      accept=".db.json"
      :after-read="onFile"
    >
      <div v-if="!uploading" class="drop-area">
        <Icon name="plus"/> 点击选择文件
        <br>或者
        <br>把文件拖拽到本区域
      </div>
      <div v-if="uploading" class="drop-area">
        请稍候，正在上传……
        <br>
      </div>
    </Uploader>
  </Dialog>
</template>

<style scoped>
.uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1em;
}
.drop-area {
  width: 12em;
  height: 6em;
  border: 3px dashed silver;
  line-height: 2em;
  text-align: center;
  padding: 3em 3em;
}
</style>
