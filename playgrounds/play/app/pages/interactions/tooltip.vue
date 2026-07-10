<script setup lang="ts">
import type { GeoJSONSourceSpecification } from 'mapbox-gl'
import type { PopupTrigger } from '#mapbox/types'

const source: GeoJSONSourceSpecification = {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: [
      { type: 'Feature', properties: { title: '天安门', kind: '地标' }, geometry: { type: 'Point', coordinates: [116.397, 39.909] } },
      { type: 'Feature', properties: { title: '颐和园', kind: '园林' }, geometry: { type: 'Point', coordinates: [116.275, 39.999] } },
      { type: 'Feature', properties: { title: '鸟巢', kind: '场馆' }, geometry: { type: 'Point', coordinates: [116.397, 39.993] } }
    ]
  }
}

const triggers: PopupTrigger[] = ['hover', 'click', 'none']
const trigger = ref<PopupTrigger>('hover')
</script>

<template>
  <MapShowcase
    title="Tooltip 图层要素弹窗"
    description="MapboxTooltip 按 trigger 以悬浮或点击触发；none 不绑定监听可临时停用。作用域插槽拿到当前要素与 close。"
    :state="{ trigger }"
    state-label="Trigger"
  >
    <DemoMap :center="[116.35, 39.96]" :zoom="10.5">
      <MapboxSource source-id="poi" :source="source">
        <MapboxLayer
          layer-id="poi-circle"
          type="circle"
          source="poi"
          :paint="{ 'circle-color': '#e11d48', 'circle-radius': 8, 'circle-stroke-width': 2, 'circle-stroke-color': '#fff' }"
        />
      </MapboxSource>
      <MapboxTooltip layer-id="poi-circle" :trigger="trigger" :options="{ offset: 12 }">
        <template #default="{ feature, close }">
          <div class="px-1 py-0.5 text-sm">
            <p class="font-semibold">
              {{ feature?.properties?.title }}
            </p>
            <p class="text-xs text-gray-500">
              {{ feature?.properties?.kind }}
            </p>
            <UButton
              v-if="trigger === 'click'"
              class="mt-1.5"
              size="xs"
              color="neutral"
              variant="subtle"
              @click="close"
            >
              收起
            </UButton>
          </div>
        </template>
      </MapboxTooltip>

      <div class="absolute left-3 top-3 z-10 flex gap-1 rounded-(--ui-radius) border border-default bg-default/80 p-1 backdrop-blur">
        <UButton
          v-for="item in triggers"
          :key="item"
          size="xs"
          :color="trigger === item ? 'primary' : 'neutral'"
          :variant="trigger === item ? 'solid' : 'ghost'"
          @click="trigger = item"
        >
          {{ item }}
        </UButton>
      </div>
    </DemoMap>
  </MapShowcase>
</template>
