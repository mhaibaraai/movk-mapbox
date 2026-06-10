<script setup lang="ts">
const center = ref<[number, number]>([116.39, 39.91])
const zoom = ref(10)
const bearing = ref(0)
const pitch = ref(0)

const cities: Record<string, [number, number]> = {
  北京: [116.39, 39.91],
  上海: [121.47, 31.23],
  广州: [113.26, 23.13]
}

function flyTo(name: keyof typeof cities) {
  center.value = cities[name]!
  zoom.value = 11
}
</script>

<template>
  <MapShowcase
    title="相机双向绑定"
    description="v-model:center/zoom/bearing/pitch 双向同步，地图交互（平移/缩放/旋转/俯仰）结束后回写模型。"
    :state="{ center, zoom, bearing, pitch }"
    state-label="Camera"
  >
    <template #toolbar>
      <UButton
        v-for="(_, name) in cities"
        :key="name"
        size="xs"
        color="neutral"
        variant="outline"
        @click="flyTo(name)"
      >
        {{ name }}
      </UButton>
      <UButton size="xs" variant="soft" @click="bearing = (bearing + 30) % 360">
        旋转 +30°
      </UButton>
      <UButton size="xs" variant="soft" @click="pitch = pitch >= 60 ? 0 : pitch + 20">
        俯仰
      </UButton>
    </template>

    <MapboxMap
      v-model:center="center"
      v-model:zoom="zoom"
      v-model:bearing="bearing"
      v-model:pitch="pitch"
      :options="{ style: 'mapbox://styles/mapbox/streets-v12' }"
    />
  </MapShowcase>
</template>
