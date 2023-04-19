<script setup>
import { ref } from 'vue'
import { Loading, Overlay, showDialog, Tabbar, TabbarItem } from 'vant'
import Home from '@/components/Home.vue'
import Sheet from '@/components/Sheet.vue'
import $api from '@/libs/api'

const admin = ref(false)
const sheet = ref(null)
const curPage = ref(0)
const readonly = ref(false)
const loading = ref(false)

// 向服务器发送请求时，若短时间内未完成响应则显示遮罩提示
let loadingTimerId
$api.setListeners({
  onBegin() {
    loadingTimerId = setTimeout(() => {
      loading.value = true
    }, 1000)
  },
  onComplete(succ) {
    clearTimeout(loadingTimerId)
    loading.value = false
  }
})

if (window.location.pathname.startsWith('/admin')) {
  admin.value = true
  document.title = 'admin - 血压记'
}

// 从 url 里面提取出当前会话的 sid
let [_, k, v] = window.location.pathname.match(/\/(sid|roid)\/([0-9a-zA-Z]*)$/) || []
if (k && v) {
  // 读取当前数据表的所有记录
  $api.sheetLoad({ [k]: v })
    .then(({ data }) => {
      sheet.value = data
      curPage.value = 1
      if (k === 'sid') {
        document.title = `${sheet.value.name} - 血压记`
        $api.setSid(v)
      } else {
        document.title = `${sheet.value.name}:只读 - 血压记`
        readonly.value = true
      }
    })
    .catch(err => {
      showDialog({
        title: '操作错误',
        message: '链接已经失效，无法打开数据表。',
        confirmButtonText: '知道了'
      }).then(() => {
        window.location = '/'
      })
    })
}
</script>

<template>
  <Tabbar v-model="curPage">
    <TabbarItem icon="wap-home">首页</TabbarItem>
    <TabbarItem icon="bars" v-if="sheet">数据表</TabbarItem>
  </Tabbar>
  <Home v-if="curPage == 0" :admin="admin" :sheet="sheet" />
  <Sheet v-if="curPage == 1" :content="sheet.content" :readonly="readonly" />
  <div class="bottom-padding" />

  <Overlay :show="loading" :duration="0">
    <Loading class="loading">正在请求服务器 ...</Loading>
  </Overlay>
</template>

<style scoped>
.bottom-padding {
  height: 5em;
}
.loading {
  text-align: center;
  line-height: 80vh;
}
</style>
