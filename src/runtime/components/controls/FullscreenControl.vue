<script setup lang="ts">
import { omitUndefined } from '@movk/core'
import { FullscreenControl } from 'mapbox-gl'
import type { ControlPosition } from 'mapbox-gl'
import { useControl } from '../../domains/map/control'

const props = defineProps<{
  position?: ControlPosition
  options?: ConstructorParameters<typeof FullscreenControl>[0]
}>()

useControl(() => new FullscreenControl(omitUndefined(props.options ?? {})), props.position)
</script>

<template>
  <slot />
</template>
