<script setup lang="ts">
import type { LightsSpecification } from 'mapbox-gl'
import { useStyleEffect } from '../../domains/map/style-effect'

const props = defineProps<{
  /** 3D 光照列表（ambient/directional/flat） */
  lights: LightsSpecification[]
}>()

useStyleEffect(
  () => props.lights,
  (map, value) => map.setLights(value),
  map => map.setLights(null)
)
</script>

<template>
  <slot />
</template>
