import { onMounted, onUnmounted, toValue, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import type { ControlPosition, IControl } from 'mapbox-gl'
import { useMap } from '../../composables/useMap'

/** 控件组件共享逻辑：地图就绪后 addControl；position/options 变化时移除并按新配置重建；卸载时 removeControl。 */
export function useControl(
  create: () => IControl,
  position?: MaybeRefOrGetter<ControlPosition | undefined>,
  watchSource?: () => unknown
): void {
  const ctx = useMap()
  let control: IControl | undefined

  function rebuild(): void {
    const map = ctx.map.value
    if (!map) return
    if (control) map.removeControl(control)
    control = create()
    map.addControl(control, toValue(position))
  }

  onMounted(async () => {
    await ctx.whenLoaded()
    rebuild()
  })

  // setup 同步注册以绑定组件 effect scope，自动随卸载停止；仅首挂后响应
  watch(
    () => [toValue(position), watchSource?.()],
    () => { if (control) rebuild() },
    { deep: true }
  )

  onUnmounted(() => {
    if (control) ctx.map.value?.removeControl(control)
    control = undefined
  })
}
