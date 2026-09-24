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

// 静态内置图标，除 linestring 外拷贝自 lucide（@iconify-json/lucide 1.2.135），stroke 跟随 currentColor
const ICONS: Record<string, string> = {
  select: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"/>',
  point: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></g>',
  linestring: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M4.89 16.21l3.22-6.42M10.2 9.6l3.6 4.8M15.89 14.21l3.22-6.42"/><circle cx="4" cy="18" r="2"/><circle cx="9" cy="8" r="2"/><circle cx="15" cy="16" r="2"/><circle cx="20" cy="6" r="2"/></g>',
  polygon: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.83 2.38a2 2 0 0 1 2.34 0l8 5.74a2 2 0 0 1 .73 2.25l-3.04 9.26a2 2 0 0 1-1.9 1.37H7.04a2 2 0 0 1-1.9-1.37L2.1 10.37a2 2 0 0 1 .73-2.25z"/>',
  rectangle: '<rect width="20" height="12" x="2" y="6" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" rx="2"/>',
  circle: '<circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>',
  ellipse: '<ellipse cx="12" cy="12" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" rx="10" ry="6"/>',
  sector: '<g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M21 12c.552 0 1.005-.449.95-.998a10 10 0 0 0-8.953-8.951c-.55-.055-.998.398-.998.95v8a1 1 0 0 0 1 1z"/><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/></g>',
  trash: '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 11v6m4-6v6m5-11v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>'
}

// 自定义模式无专属图标时的兜底（lucide pencil）
const FALLBACK_ICON = '<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497zM15 5l4 4"/>'

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
  button.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">${ICONS[name] ?? FALLBACK_ICON}</svg>`
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
