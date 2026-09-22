# 📋 Changelog

> 本包前身为 `@movk/mapbox`（基于 mapbox-gl，已从 npm 下架）。`@movk/maplibre` 基于 maplibre-gl 6 重写，组件前缀由 `Mapbox` 改为 `Maplibre`，不再需要 access token，版本号从 1.0.0 重新开始。

## 1.0.0 (2026-09-22)

### ✨ Features

- **声明式核心与双分发架构**
  * `MaplibreMap` / `MaplibreSource` / `MaplibreLayer` / `MaplibreMarker` / `MaplibrePopup` / `MaplibreTooltip` 等声明式组件，配套 `useMap` / `useMaplibre` composables。
  * 基于 provide/inject 下发地图上下文，子组件无需等待地图就绪即可挂载；实例仅在客户端创建，SSR 安全无需 `<ClientOnly>`。
  * 双分发：Nuxt 4 模块与 Vue/Vite 插件共用同一 runtime，组件按裸文件名自动导入；配置以 `globalThis` 单例共享。
  * 缺省使用空白样式，文字标注经运行时配置 `glyphs` / `textFont` 提供；文档与示例统一使用免 key 的 OpenFreeMap 与天地图。
  * `MaplibreCustomLayer` 逃生舱，承接自定义 WebGL/Canvas 渲染。
- **图层组件**
  * `MaplibreClusterLayer` 点聚合、`MaplibreLayerGroup` 图层组。
  * `MaplibreImageLayer` / `MaplibreVideoLayer` / `MaplibreRasterLayer` / `MaplibreBuildingLayer` 便捷图层。
- **控件**
  * `MaplibreNavigationControl` / `MaplibreScaleControl` / `MaplibreFullscreenControl` / `MaplibreGeolocateControl` / `MaplibreAttributionControl`，以及 `defineMaplibreControl` 自定义控件。
- **标注与帧动画**
  * `MaplibreLottieMarker` 动画标记；`MaplibreMarker` 支持 `#popup` 插槽，`MaplibreTooltip` 支持 hover / click / none 触发。
  * `MaplibreSpriteImage` / `MaplibreAnimatedImage` 帧动画图标，`useMapAnimation` 帧动画原语与 `useFrameIcon` 基础设施。
- **动效组件**
  * 建筑特效：`MaplibreFlowBuilding` / `MaplibreGradientBuilding` / `MaplibreTextureBuilding` / `MaplibreWindowBuilding`。
  * `MaplibreDiffusionCircle` / `MaplibreGlowCircle` / `MaplibreWaveCircle` / `MaplibreRadar` / `MaplibreMigration` / `MaplibreTrail` 等动效组件与配套纯函数。
- **环境组件**
  * `MaplibreSky` 天空与大气、`MaplibreTerrain` 地形、`MaplibreTemperature` 温度热力图。
- **绘制与量算**
  * 基于 terra-draw 的 `MaplibreDrawControl`，支持 `v-model:features` / `v-model:mode`；`useMaplibreDraw` 可按 `mapId` 跨组件树驱动绘制。
  * 矩形 / 圆 / 椭圆 / 扇形自定义模式（`movkDrawModes`，亦可从 `@movk/maplibre/draw-modes` 显式导入）与 `drawThemeStyles` 主题工厂。
  * `useMeasure` 测距 / 测面；`MaplibreBufferCircle` 等五类 turf 缓冲区组件。
- **Composables 与工具**
  * `useFeatureState` / `useMaplibreImage` / `useMaplibreCamera` / `useMapExport`。
  * geometry / building / cluster / effects 等纯函数工具，经 `@movk/maplibre/utils/*` 子路径导出。
- **本土化与集成**
  * 坐标转换（WGS84 / GCJ02 / BD09）、`MaplibreTiandituLayer` 天地图底图与天地图 WEB 服务 API 工具、`MaplibreWmsLayer` / `MaplibreWmtsLayer`。
  * `@movk/maplibre/index.css` 样式入口；文档站与 MCP / llms.txt / Agent Skill 集成。

### ⚠ 相对 @movk/mapbox 的变化

- 底层由 mapbox-gl 切换为 maplibre-gl 6，组件前缀、composable 名称中的 `Mapbox` 统一改为 `Maplibre`。
- 移除 `Rain` / `Snow` / `Lights`（maplibre 无对应能力）；`Fog` 由 `MaplibreSky` 取代。
- 绘制由 mapbox-gl-draw 改为 terra-draw，模式名沿用 terra-draw 命名（`select` / `polygon` 等）。
