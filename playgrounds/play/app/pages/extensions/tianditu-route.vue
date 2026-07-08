<script setup lang="ts">
import type { FeatureCollection } from 'geojson'
import type { RouteMode, RouteResult } from '#mapbox/types'

const orig = ref<[number, number]>([121.4737, 31.2304])
const dest = ref<[number, number]>([121.5, 31.25])
const mode = ref<RouteMode>('fastest')
const result = ref<RouteResult>()
const loading = ref(false)
const error = ref<string>()

const { fitBounds } = useMapboxCamera({ mapId: 'route-demo' })

const routeSource = computed<FeatureCollection | undefined>(() => {
  if (!result.value) return undefined
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: result.value.path }] }
})

async function query() {
  loading.value = true
  error.value = undefined
  try {
    result.value = await $fetch<RouteResult>('/api/tianditu-route', {
      query: {
        origLng: orig.value[0], origLat: orig.value[1],
        destLng: dest.value[0], destLat: dest.value[1],
        mode: mode.value
      }
    })
    if (result.value?.path.coordinates.length) fitBounds(result.value.path, { padding: 60 })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

onMounted(query)

const modeItems = [
  { label: '最快', value: 'fastest' },
  { label: '最短', value: 'shortest' },
  { label: '避开高速', value: 'avoid-highway' },
  { label: '步行', value: 'walking' }
]

const state = computed(() => ({
  loading: loading.value,
  error: error.value ?? null,
  distanceKm: result.value?.distanceKm,
  durationMinutes: result.value?.durationMinutes,
  points: result.value?.path.coordinates.length,
  summary: result.value?.summary
}))
</script>

<template>
  <MapShowcase
    title="天地图路线规划"
    description="planRoute 服务端专用：拖动起终点标注，返回真实路网路径与真实距离/时长（非直线）。"
    :state="state"
  >
    <template #toolbar>
      <USelect
        v-model="mode"
        :items="modeItems"
        value-key="value"
        size="sm"
        class="w-28"
        @update:model-value="query"
      />
      <UButton size="sm" :loading="loading" @click="query">
        规划路线
      </UButton>
    </template>

    <DemoMap map-id="route-demo" :center="[121.487, 31.24]" :zoom="13">
      <MapboxMarker v-model:lnglat="orig" :options="{ draggable: true }" @update:lnglat="query">
        <div class="rounded-full bg-success size-3.5 ring-2 ring-white shadow" title="起点" />
      </MapboxMarker>
      <MapboxMarker v-model:lnglat="dest" :options="{ draggable: true }" @update:lnglat="query">
        <div class="rounded-full bg-error size-3.5 ring-2 ring-white shadow" title="终点" />
      </MapboxMarker>
      <MapboxLayer
        v-if="routeSource"
        layer-id="route-line"
        type="line"
        :source="{ type: 'geojson', data: routeSource }"
        :layout="{ 'line-cap': 'round', 'line-join': 'round' }"
        :paint="{ 'line-color': '#6366f1', 'line-width': 5 }"
      />
    </DemoMap>
  </MapShowcase>
</template>
