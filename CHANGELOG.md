# 📋 Changelog

## 1.0.0 (2026-06-16)

### ✨ Features

- **声明式核心与双分发架构**
  * `MapboxMap` / `MapboxSource` / `MapboxLayer` / `MapboxMarker` / `MapboxPopup` 等声明式组件，配套 `useMap` / `useMapbox` composables。
  * 基于 provide/inject 下发地图上下文，子组件无需等待地图就绪即可挂载；实例仅在客户端创建，SSR 安全无需 `<ClientOnly>`。
  * 双分发：Nuxt 4 模块与 Vue/Vite 插件共用同一 runtime，组件按裸文件名自动导入；配置以 `globalThis` 单例共享。
  * `MapboxCustomLayer` 逃生舱，承接自定义 WebGL/Canvas 渲染。
- **图层组件**
  * `MapboxClusterLayer` 点聚合、`MapboxLayerGroup` 图层组。
  * `MapboxImageLayer` / `MapboxVideoLayer` / `MapboxRasterLayer` / `MapboxBuildingLayer` 便捷图层。
- **标注与帧动画**
  * `MapboxLottieMarker` 动画标记、`MapboxTooltip` 悬浮提示。
  * `MapboxSpriteImage` / `MapboxAnimatedImage` 帧动画图标，`useMapAnimation` 帧动画原语与 `useFrameIcon` 基础设施。
- **动效组件**
  * 建筑特效四件套：`MapboxFlowBuilding` / `MapboxGradientBuilding` / `MapboxTextureBuilding` / `MapboxWindowBuilding`。
  * 扩散 / 辉光 / 波纹 / 雷达 / 迁徙 / 拖尾等动效组件，`ringFade` 不透明度包络与配套动效纯函数（弧线、沿线采样、相位、彗尾渐变、雷达贴图）。
- **环境组件**
  * `MapboxTerrain` / `MapboxFog` / `MapboxRain` / `MapboxSnow` / `MapboxLights` 环境效果。
  * `MapboxTemperature` 温度热力图。
- **绘制与量算**
  * `MapboxDrawControl`，支持 `v-model:features` / `v-model:mode` 受控绑定。
  * 矩形 / 圆 / 椭圆 / 扇形四个自定义绘制模式，并导出其 `Options` / `State` 类型。
  * `drawThemeStyles` 主题工厂与 `setFeatureProperty`；`useMeasure` 测距/测面；`MapboxBufferCircle` 等五类 turf 缓冲区组件。
- **Composables 与工具**
  * `useFeatureState` / `useMapboxImage` / `useMapboxCamera` / `useMapExport`，控件组合式 `defineMapboxControl`。
  * geometry / building / cluster 纯函数工具与单测。
- **本土化与集成**
  * 坐标转换（WGS84 / GCJ02 / BD09）、`MapboxTiandituLayer` 天地图底图、`MapboxWmsLayer` / `MapboxWmtsLayer`。
  * `@movk/mapbox/index.css` 样式入口。
  * 文档站与 MCP / llms.txt / Agent Skill 集成。

### 🐛 Bug Fixes

- 样式切换整体重建并补跑 `onReady`，使切换底图后 source/layer 自动重建；剔除地图初始化 options 中的 `undefined`，避免污染相机矩阵。
- 样式未加载完时卸载/更新环境效果不再抛错；`setFeatureProperty` 重绘并保留选中态。
- canvas 2d 上下文启用 `willReadFrequently`；地图销毁后游标与卸载操作的兜底；`MapboxMarker` 定位完成前隐藏插槽元素。

### ♻️ Code Refactoring

- unplugin 自动派生组件清单并导出可复用 resolver，导出 `MapboxUnplugin` 类型。

### 📝 Documentation

- 基于 Nuxt Content 的文档站上线，组件页结构对齐书写规范并补齐英文 `seo` frontmatter。
- 规范化组件 props 与选项接口的 JSDoc 注释；重写 README 并新增 og-image。

### 🔧 Chores

- 新增 CI 与文档站部署工作流、release-it 发布配置与 renovate 配置。
- 引入 `@turf/*` 子包，升级依赖并完善 utils 子路径类型导出。
