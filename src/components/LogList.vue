<script setup>
import { computed } from 'vue'
import Timeline from './Timeline.vue'

const emit = defineEmits([
  'click',
])

const props = defineProps({
  // 一个月的原始数据列表，正序
  list: {
    type: Array,
    required: true
  }
})

let now = new Date()
let y = now.getFullYear()
let m = now.getMonth()

// 所有记录所覆盖的时间段（以小时计）
let timeSpan = computed(() => {
  let from = 8
  let to = 20
  for (let log of props.list) {
    let hours = new Date(log.ts).getHours()
    if (from > hours) from = hours
    if (to < hours + 1) to = hours + 1
  }
  return { from, to }
})

// 指定小时数计算偏移量
function offsetHour(h) {
  let { from, to } = timeSpan.value
  return h / (to - from)
}

// 指定时间戳计算偏移量
function offsetTs(ts) {
  let { from, to } = timeSpan.value
  let t = new Date(ts)
  t.setHours(from)
  t.setMinutes(0)
  t.setSeconds(0)
  t.setMilliseconds(0)
  let tsFrom = t.getTime()
  t.setHours(to)
  let tsTo = t.getTime()
  return (ts - tsFrom) / (tsTo - tsFrom)
}

// 时间标尺的刻度
let marks = computed(() => {
  let { from, to } = timeSpan.value

  let marks = []
  for (let h = from; h <= to; h++) {
    marks.push({
      h,
      offset: offsetHour(h - from),
    })
  }
  return marks
})

// 按天归集的数据列表
let list = computed(() => {
  // 根据第一条记录取当前月份
  if (props.list.length > 0) {
    let t = new Date(props.list[0].ts)
    y = t.getFullYear()
    m = t.getMonth()
  }

  // 生成显示用的数据列表
  let sameMonth = y == now.getFullYear() && m == now.getMonth()
  let days = new Date(y, m + 1, 0).getDate()
  let list = { days }
  for (let date = 1; date <= days; date++) {
    let isToday = sameMonth && date == now.getDate()
    list[date] = {
      isToday,
      logs: [],
    }
  }

  for (let log of props.list) {
    let d = new Date(log.ts)
    list[d.getDate()].logs.push(log)
  }

  return list
})
</script>

<template>
  <div class="log-list">
    <table class="list">
      <tr>
        <th class="date">日期</th>
        <th class="sp">高压</th>
        <th class="dp">低压</th>
        <th class="hr">心率</th>
        <th class="ip">波</th>
        <th class="line">{{ timeSpan.from }} - - - - 时间 - - - - {{ timeSpan.to }}</th>
      </tr>
    <template v-for="date in list.days" :key="date">
    <template v-if="list[date].logs.length == 0">
      <tr :class="{ today: list[date].isToday }">
        <td class="date">{{ date }}</td>
        <td class="sp"></td>
        <td class="dp"></td>
        <td class="hr"></td>
        <td class="ip"></td>
        <td class="line"></td>
      </tr>
    </template>

    <template v-if="list[date].logs.length > 0">
      <tr :class="{ today: list[date].isToday }" @click="emit('click', list[date].logs[0])">
        <td class="date" :rowspan="list[date].logs.length">{{ date }}</td>
        <td class="sp">{{ list[date].logs[0].sp }}</td>
        <td class="dp">{{ list[date].logs[0].dp }}</td>
        <td class="hr">{{ list[date].logs[0].hr }}</td>
        <td class="ip">{{ list[date].logs[0].ip ? '+' : '' }}</td>
        <td class="line">
          <Timeline :marks="marks" :offset="offsetTs(list[date].logs[0].ts)" />
        </td>
      </tr>
    <template v-for="(log, idx) in list[date].logs" :key="log.ts">
      <tr v-if="idx > 0" :class="{ today: list[date].isToday }" @click="emit('click', log)">
        <td class="sp">{{ log.sp }}</td>
        <td class="dp">{{ log.dp }}</td>
        <td class="hr">{{ log.hr }}</td>
        <td class="ip">{{ log.ip ? '+' : '' }}</td>
        <td class="line">
          <Timeline :marks="marks" :offset="offsetTs(log.ts)" />
        </td>
      </tr>
    </template>
    </template>
    </template>
    </table>
  </div>
</template>

<style scoped>
table.list {
  width: 100%;
  border-collapse: collapse;
  font-size: small;
}
table.list th {
  border: 1px solid silver;
  background-color: #eee;
  text-align: center;
  padding: 0.3em;
  white-space: nowrap;
}
table.list td {
  border: 1px solid silver;
  text-align: center;
}
.date, .sp, .dp, .hr, .ip {
  width: 1em;
}
.today {
  background-color: #fdd;
}
</style>
