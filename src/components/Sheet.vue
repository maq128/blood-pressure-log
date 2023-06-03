<script setup>
import { ref, onMounted } from 'vue'
import $api from '@/libs/api'
import { Button, Tab, Tabs } from 'vant'
import LogList from './LogList.vue'
import EditorDlg from './EditorDlg.vue'
import Movable from './Movable.vue'

const props = defineProps({
  content: {
    type: Array,
    required: true
  },
  readonly: {
    type: Boolean,
    default: false
  }
})

// 数据表的全部记录
let content = props.content

// 每个月份一个页签
let tabs = ref([{ title: '正在加载' }])
let activeTab = ref(0)

// 当前月份的数据列表
let list = ref([])

onMounted(async () => {
  // 找出所有有记录的月份
  let now = new Date()
  let y = now.getFullYear()
  let m = now.getMonth()
  let yms = {}
  yms[`${y}.${m}`] = { y, m }
  for (let log of content) {
    let t = new Date(log.ts)
    let y = t.getFullYear()
    let m = t.getMonth()
    yms[`${y}.${m}`] = { y, m }
  }

  // 构建出切换的页签
  let curY = 0
  tabs.value = Object.values(yms)
    .sort((a, b) => (b.y * 12 + b.m) - (a.y * 12 + a.m)) // 倒序
    .map(({ y, m }) => {
      let title = curY == y ? `${m + 1}` : `${y}.${m + 1}`
      curY = y
      return { y, m, title }
    })

  switchMonth(0)
})

function switchMonth(idx) {
  let tab = tabs.value[idx]

  // 过滤出当月的所有记录
  list.value = content.filter(log => {
    let t = new Date(log.ts)
    let y = t.getFullYear()
    let m = t.getMonth()
    return tab.y == y && tab.m == m
  }).sort((a, b) => a.ts - b.ts) // 正序
}

// 编辑对话框
let editorDlg = ref(null)

function onEditorDlgAdd(log) {
  content.unshift(log)
  $api.logCreate(log)
  switchMonth(activeTab.value)
}

function onEditorDlgEdit(log) {
  content = content.map(v => v.ts == log.ts ? log : v)
  $api.logUpdate(log)
  switchMonth(activeTab.value)
}

function onEditorDlgRemove(log) {
  content = content.filter(v => v.ts != log.ts)
  $api.logRemove({ ts: log.ts })
  switchMonth(activeTab.value)
}
</script>

<template>
  <div class="page page-sheet">
    <Tabs v-model:active="activeTab" @change="switchMonth">
      <Tab v-for="tab in tabs" :title="tab.title"></Tab>
    </Tabs>

    <LogList :list="list" @click="log => editorDlg.openEdit(log)" />
  </div>

  <EditorDlg
    ref="editorDlg"
    :readonly="readonly"
    @add="onEditorDlgAdd"
    @edit="onEditorDlgEdit"
    @remove="onEditorDlgRemove"
  />

  <Movable v-if="!readonly">
    <Button
      type="primary"
      icon="plus"
      round
      @click="editorDlg.openAdd()"
    ></Button>
  </Movable>
</template>

<style scoped>
:deep(.van-tabs--line .van-tabs__wrap) {
  height: 1.8em;
}
</style>
