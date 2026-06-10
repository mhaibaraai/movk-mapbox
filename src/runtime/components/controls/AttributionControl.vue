<script setup lang="ts">
import { omitUndefined } from '@movk/core'
import { AttributionControl } from 'mapbox-gl'
import type { ControlPosition } from 'mapbox-gl'
import { useControl } from '../../domains/map/control'

const props = defineProps<{
  position?: ControlPosition
  options?: ConstructorParameters<typeof AttributionControl>[0]
}>()

useControl(() => new AttributionControl(omitUndefined(props.options ?? {})), props.position)
</script>

<template>
  <slot />
</template>
