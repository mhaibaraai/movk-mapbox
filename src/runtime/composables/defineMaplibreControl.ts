import type { IControl, Map as MaplibreMap } from 'maplibre-gl'

/** 用回调式 onAdd/onRemove 快速定义一个自定义 MapLibre 控件。 */
export function defineMaplibreControl(
  onAdd: (map: MaplibreMap) => HTMLElement,
  onRemove: (map: MaplibreMap) => void
): IControl {
  return {
    onAdd,
    onRemove
  }
}
