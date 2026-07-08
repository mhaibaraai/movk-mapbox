<script setup lang="ts">
import type { FeatureCollection } from 'geojson'
import type { AdministrativeDivision } from '#mapbox/types'

const keyword = ref('上海')
const division = ref<AdministrativeDivision>()
const loading = ref(false)
const error = ref<string>()

const { fitBounds } = useMapboxCamera({ mapId: 'administrative-demo' })

const boundarySource = computed<FeatureCollection | undefined>(() => {
  if (!division.value?.boundary) return undefined
  return { type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: division.value.boundary }] }
})

async function query() {
  loading.value = true
  error.value = undefined
  try {
    const { divisions } = await $fetch<{ divisions: AdministrativeDivision[] }>('/api/tianditu-administrative', {
      query: { keyword: keyword.value }
    })
    division.value = divisions[0]
    if (division.value?.boundary) fitBounds(division.value.boundary, { padding: 40 })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    loading.value = false
  }
}

onMounted(query)

const state = computed(() => ({
  loading: loading.value,
  error: error.value ?? null,
  name: division.value?.name,
  level: division.value?.level,
  center: division.value?.center,
  polygonCount: division.value?.boundary?.coordinates.length,
  children: division.value?.children?.map(c => c.name)
}))
</script>

<template>
  <MapShowcase
    title="天地图行政区划边界"
    description="getAdministrativeDivision 服务端专用：按名称查真实边界多边形（多环含飞地）、中心点、下级行政区。"
    :state="state"
  >
    <template #toolbar>
      <UInput v-model="keyword" placeholder="省/市/区县名，如：上海" size="sm" class="w-40" />
      <UButton size="sm" :loading="loading" @click="query">
        查询边界
      </UButton>
    </template>

    <DemoMap map-id="administrative-demo" :center="[121.47, 31.23]" :zoom="7">
      <MapboxLayer
        v-if="boundarySource"
        layer-id="admin-boundary"
        type="fill"
        :source="{ type: 'geojson', data: boundarySource }"
        :paint="{ 'fill-color': '#3b82f6', 'fill-opacity': 0.2, 'fill-outline-color': '#2563eb' }"
      />
    </DemoMap>
  </MapShowcase>
</template>
