import type { IControl } from 'maplibre-gl'

export interface DrawToolbarOptions {
  /** 按钮对应的模式名，按顺序渲染 */
  modes: string[]
  /** 点击模式按钮 */
  onMode: (mode: string) => void
  /** 点击删除按钮 */
  onTrash: () => void
}

export interface DrawToolbar extends IControl {
  /** 高亮当前模式按钮 */
  setActive: (mode: string | undefined) => void
}

// 静态内置图标（不含外部输入），stroke 跟随 currentColor 适配明暗主题
const ICONS: Record<string, string> = {
  select: '<path d="M6 3l12 9-5.5 1.2L15 20l-2.4 1-2.5-6.7L6 18z"/>',
  point: '<circle cx="12" cy="12" r="4" fill="currentColor"/>',
  linestring: '<path d="M4 19l6-10 5 6 5-10"/>',
  polygon: '<path d="M5 18L4 8l8-4 8 5-3 10z"/>',
  rectangle: '<rect x="4" y="6" width="16" height="12"/>',
  circle: '<circle cx="12" cy="12" r="8"/>',
  ellipse: '<ellipse cx="12" cy="12" rx="9" ry="6"/>',
  sector: '<path d="M12 12h8a8 8 0 0 0-8-8z"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>'
}

// 自定义模式无专属图标时的通用画笔图标
const FALLBACK_ICON = '<path d="M4 20l4-1L19 8l-3-3L5 16z"/>'

const LABELS: Record<string, string> = {
  select: 'Select',
  point: 'Point',
  linestring: 'Line',
  polygon: 'Polygon',
  rectangle: 'Rectangle',
  circle: 'Circle',
  ellipse: 'Ellipse',
  sector: 'Sector',
  trash: 'Delete'
}

function createButton(name: string, dataset: Record<string, string>, onClick: () => void): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'movk-draw-toolbar__button'
  button.title = LABELS[name] ?? name
  button.setAttribute('aria-label', button.title)
  Object.assign(button.dataset, dataset)
  button.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round">${ICONS[name] ?? FALLBACK_ICON}</svg>`
  button.addEventListener('click', onClick)
  return button
}

/** terra-draw 不带 UI，此控件提供模式切换与删除按钮，挂在地图控件槽位 */
export function createDrawToolbar(options: DrawToolbarOptions): DrawToolbar {
  const container = document.createElement('div')
  container.className = 'maplibregl-ctrl maplibregl-ctrl-group movk-draw-toolbar'

  const modeButtons = options.modes.map((mode) => {
    const button = createButton(mode, { mode }, () => options.onMode(mode))
    container.appendChild(button)
    return button
  })
  container.appendChild(createButton('trash', { action: 'trash' }, options.onTrash))

  return {
    onAdd: () => container,
    onRemove: () => container.remove(),
    setActive(mode) {
      for (const button of modeButtons) {
        button.setAttribute('aria-pressed', String(button.dataset.mode === mode))
      }
    }
  }
}
