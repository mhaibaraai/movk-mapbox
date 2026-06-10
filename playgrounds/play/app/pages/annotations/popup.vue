<script setup lang="ts">
const open = ref(true)
const closedAt = ref<string>()

function onClose() {
  open.value = false
  closedAt.value = new Date().toLocaleTimeString()
}
</script>

<template>
  <MapShowcase
    title="Popup 弹窗"
    description="lnglat 定位，默认插槽渲染弹窗内容，关闭时触发 close 事件。"
    :state="{ open, closedAt }"
  >
    <template #toolbar>
      <UButton size="xs" variant="soft" :disabled="open" @click="open = true">
        重新打开
      </UButton>
    </template>

    <MapboxMap :options="{ style: 'mapbox://styles/mapbox/light-v11', center: [116.397, 39.909], zoom: 12 }">
      <MapboxPopup
        v-if="open"
        :lnglat="[116.397, 39.909]"
        :options="{ offset: 12, closeOnClick: false }"
        @close="onClose"
      >
        <div class="p-1">
          <p class="text-sm font-semibold text-highlighted">
            天安门
          </p>
          <p class="text-xs text-muted">
            116.397, 39.909
          </p>
        </div>
      </MapboxPopup>
    </MapboxMap>
  </MapShowcase>
</template>
