<script setup>
import { ref, onMounted } from 'vue'

const props = defineProps({
  right: {
    type: Number,
    default: 10
  },
  bottom: {
    type: Number,
    default: 100
  },
})

let movableDiv = ref(null)

let divRight = props.right
let divBottom = props.bottom
let divWidth = 0
let divHeight = 0

let step = 0 // 0/1/2 - 无/按下/拖拽中
let startX = 0
let startY = 0
let DRAG_THRESHOLD = 5

let startRight = props.right
let startBottom = props.bottom

onMounted(() => {
  movableDiv.value.style.right = `${divRight}px`
  movableDiv.value.style.bottom = `${divBottom}px`
})

function onPointerDown(evt) {
  if (!evt.isPrimary) return
  evt.preventDefault()

  step = 1
  startX = evt.pageX
  startY = evt.pageY

  startRight = divRight
  startBottom = divBottom
}

function onPointerMove(evt) {
  if (!evt.isPrimary) return
  evt.preventDefault()

  switch (step) {
    case 0:
      return

    case 1:
      {
        let dx = evt.pageX - startX
        let dy = evt.pageY - startY
        if (dx > DRAG_THRESHOLD || dx < -DRAG_THRESHOLD || dy > DRAG_THRESHOLD || dy < -DRAG_THRESHOLD) {
          step = 2
          movableDiv.value.setPointerCapture(evt.pointerId)
          let rect = movableDiv.value.getBoundingClientRect()
          divWidth = rect.width
          divHeight = rect.height
          moveBy(evt)
        }
      }
      return

    case 2:
      moveBy(evt)
      return
  }
}

function onPointerUp(evt) {
  if (!evt.isPrimary) return
  evt.preventDefault()

  if (step == 2) {
    movableDiv.value.releasePointerCapture(evt.pointerId)
  }
  step = 0
  moveBy(evt)
}

function onPointerCancel(evt) {
  step = 0
  movableDiv.value.releasePointerCapture(evt.pointerId)
}

function moveBy(evt) {
  let dx = evt.pageX - startX
  let dy = evt.pageY - startY
  divRight = startRight - dx
  divBottom = startBottom - dy

  if (divRight < 0) divRight = 0
  if (divBottom < 50) divBottom = 50

  if (divRight > window.innerWidth - divWidth) {
    divRight = window.innerWidth - divWidth
  }
  if (divBottom > window.innerHeight - divHeight) {
    divBottom = window.innerHeight - divHeight
  }

  movableDiv.value.style.right = `${divRight}px`
  movableDiv.value.style.bottom = `${divBottom}px`
}
</script>

<template>
  <div
    class="movable"
    ref="movableDiv"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerCancel"
  >
    <slot></slot>
  </div>
</template>

<style scoped>
.movable {
  touch-action: none;
  user-select: none;
  position: fixed;
  cursor: pointer;
  min-width: 1em;
  min-height: 1em;
}
</style>
