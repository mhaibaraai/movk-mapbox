<script setup lang="ts">
import type { ReverseGeocodeResult } from '#mapbox/types'

const point = ref<[number, number]>([116.37304, 39.92594])
const result = ref<ReverseGeocodeResult>()
const loading = ref(false)
const error = ref<string>()

async function query() {
  loading.value = true
  error.value = undefined
  try {
    result.value = await $fetch<ReverseGeocodeResult>('/api/tianditu-reverse-geocode', {
      query: { longitude: point.value[0], latitude: point.value[1] }
    })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

watch(point, query, { immediate: true })

const state = computed(() => ({ point: point.value, loading: loading.value, error: error.value ?? null, result: result.value ?? null }))
</script>

<template>
  <MapShowcase
    title="天地图逆地理编码"
    description="reverseGeocode 服务端专用：拖动标注点，拖拽结束即反查该 WGS84 坐标的结构化地址。"
    :state="state"
  >
    <DemoMap map-id="reverse-geocode-demo" :center="[116.37304, 39.92594]" :zoom="15">
      <MapboxMarker v-model:lnglat="point" :options="{ draggable: true }">
        <div class="rounded-full bg-primary size-3.5 ring-2 ring-white shadow" />
      </MapboxMarker>
      <MapboxPopup v-if="result?.formattedAddress" :lnglat="point" :options="{ offset: 16, closeOnClick: false }">
        <div class="p-1 max-w-56">
          <p class="text-sm font-semibold text-highlighted">
            {{ result.formattedAddress }}
          </p>
          <p class="mt-0.5 text-xs text-muted">
            {{ [result.province, result.county, result.road].filter(Boolean).join(' / ') }}
          </p>
        </div>
      </MapboxPopup>
    </DemoMap>
  </MapShowcase>
</template>
