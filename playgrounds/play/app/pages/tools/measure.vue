<script setup lang="ts">
const { start, stop, clear, mode, active, result } = useMeasure({ mapId: 'measure-demo' })

const state = computed(() => ({
  active: active.value,
  mode: mode.value ?? null,
  result: result.value || null
}))
</script>

<template>
  <MapShowcase
    title="Measure 测量"
    description="useMeasure 测距/测面：单击加点、移动预览、双击结束、Esc 取消当前段。"
    :state="state"
  >
    <template #toolbar>
      <UButton size="sm" :variant="active && mode === 'distance' ? 'solid' : 'soft'" @click="start('distance')">
        测距
      </UButton>
      <UButton size="sm" :variant="active && mode === 'area' ? 'solid' : 'soft'" @click="start('area')">
        测面
      </UButton>
      <UButton size="sm" variant="soft" :disabled="!active" @click="stop">
        结束
      </UButton>
      <UButton size="sm" color="error" variant="soft" @click="clear">
        清空
      </UButton>
    </template>

    <DemoMap map-id="measure-demo" :center="[116.39, 39.91]" :zoom="11" />
  </MapShowcase>
</template>
