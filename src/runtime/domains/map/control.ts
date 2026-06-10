import { onMounted, onUnmounted } from 'vue'
import type { ControlPosition, IControl } from 'mapbox-gl'
import { useMap } from '../../composables/useMap'

/** 控件组件共享逻辑：地图就绪后 addControl，卸载时 removeControl。 */
export function useControl(create: () => IControl, position?: ControlPosition): void {
  const ctx = useMap()
  let control: IControl | undefined

  onMounted(async () => {
    const map = await ctx.whenLoaded()
    control = create()
    map.addControl(control, position)
  })

  onUnmounted(() => {
    if (control) ctx.map.value?.removeControl(control)
  })
}
