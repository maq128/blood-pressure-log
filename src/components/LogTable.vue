<script setup>
import { computed } from 'vue'
import LogCard from './LogCard.vue'

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

// 显示用的数据列表
let list = computed(() => {
  // 根据第一条记录取当前月份
  if (props.list.length > 0) {
    let t = new Date(props.list[0].ts)
    y = t.getFullYear()
    m = t.getMonth()
  }

  // 生成显示用的数据列表
  let sameMonth = y == now.getFullYear() && m == now.getMonth()
  let list = []
  for (let idx of Array(new Date(y, m + 1, 0).getDate()).keys()) {
    let date = idx + 1
    let isToday = sameMonth && date == now.getDate()
    let isTodayForenoon = isToday && now.getHours() < 12
    let isTodayAfternoon = isToday && now.getHours() >= 12
    list.push({
      date,
      forenoon: [],
      afternoon: [],
      isTodayForenoon,
      isTodayAfternoon,
    })
  }

  for (let log of props.list) {
    let d = new Date(log.ts)
    let item = list[d.getDate() - 1]
    item[d.getHours() < 12 ? 'forenoon' : 'afternoon'].push(log)
  }

  return list
})
</script>

<template>
  <div class="log-table">
    <table class="list">
      <thead>
        <tr>
          <th></th>
          <th>午前</th>
          <th>午后</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in list">
          <th class="c1">{{ item.date }}</th>
          <td class="c2" :class="{ 'is-now': item.isTodayForenoon }">
            <LogCard
              v-for="log in item.forenoon"
              :key="log.ts"
              class="log-card"
              :log="log"
              @click="emit('click', log)"
            />
          </td>
          <td class="c3" :class="{ 'is-now': item.isTodayAfternoon }">
            <LogCard
              v-for="log in item.afternoon"
              :key="log.ts"
              class="log-card"
              :log="log"
              @click="emit('click', log)"
            />
          </td>
        </tr>
      </tbody>
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
}
table.list td {
  border: 1px solid silver;
}
.c1 {
  width: 8%;
  text-align: center;
}
.c2, .c3 {
  width: 41%;
  vertical-align: top;
}
.is-now {
  background-color: #fdd;
}
.log-card {
  margin: 0.1em 0 0.1em 0.3em;
}
</style>
