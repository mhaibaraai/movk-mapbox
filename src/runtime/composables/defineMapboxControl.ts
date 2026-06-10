import type { IControl, Map as MapboxMap } from 'mapbox-gl'

/** 用回调式 onAdd/onRemove 快速定义一个自定义 Mapbox 控件。 */
export function defineMapboxControl(
  onAdd: (map: MapboxMap) => HTMLElement,
  onRemove: (map: MapboxMap) => void
): IControl {
  return {
    onAdd,
    onRemove
  }
}
