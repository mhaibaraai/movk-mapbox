# 📋 Changelog

## [1.1.1](https://github.com/mhaibaraai/movk-mapbox/compare/v1.1.0...v1.1.1) (2026-07-09)

### ♻️ Code Refactoring

* **types:** 拆分运行时类型定义并统一类型导出方式 ([a47bd84](https://github.com/mhaibaraai/movk-mapbox/commit/a47bd84ae214446f22236db3117fc2522262bdb6))

### 🔧 Chores

* **play:** 移除空的 mapbox token 占位配置 ([cfd5ca4](https://github.com/mhaibaraai/movk-mapbox/commit/cfd5ca4dd486eaca228d648b55c3b4d5df593d88))

## [1.1.0](https://github.com/mhaibaraai/movk-mapbox/compare/v1.0.1...v1.1.0) (2026-07-09)

### ✨ Features

* **tianditu:** 新增天地图 WEB 服务 API 工具与类型 ([4c552f2](https://github.com/mhaibaraai/movk-mapbox/commit/4c552f2b8453837a4dd980b773226a73e4f16bc7))

### 🐛 Bug Fixes

* **build:** 修正 utils 导出后缀并移除 optimizeDeps 中的 CJS 依赖 ([58a5f60](https://github.com/mhaibaraai/movk-mapbox/commit/58a5f609caebc6df8939f2fc9b128cb9a24fd86d))

### 📝 Documentation

* **tianditu:** 修正天地图坐标系说明为 WGS84 ([fb0bd9d](https://github.com/mhaibaraai/movk-mapbox/commit/fb0bd9dac475b1339553c6012bf31430cc8467db))
* 新增天地图 API 文档与技能参考 ([8e9e419](https://github.com/mhaibaraai/movk-mapbox/commit/8e9e419a7be8b0fb374a071dea2deee7819fa0ef))
* 更新天地图文档链接和changelog组件配置 ([9adbd0c](https://github.com/mhaibaraai/movk-mapbox/commit/9adbd0c2c660fbc3c97e78af97a773f9a27868a1))
* 添加 optimizeDeps 配置文档说明 ([82799d4](https://github.com/mhaibaraai/movk-mapbox/commit/82799d4142617b26ab1f8515417269fd11bf5c61))

### ♻️ Code Refactoring

* **config:** 统一 Mapbox/天地图 token 环境变量注入 ([3f27e32](https://github.com/mhaibaraai/movk-mapbox/commit/3f27e3260df3f7465cbcb010ac6bd96407449154))

### 🔧 Chores

* **deps:** 升级各包依赖与 packageManager 版本 ([9c0428b](https://github.com/mhaibaraai/movk-mapbox/commit/9c0428b534e81ffe9872792a6533c4c60be2a02f))

## [1.0.1](https://github.com/mhaibaraai/movk-mapbox/compare/v1.0.0...v1.0.1) (2026-07-06)

### 🐛 Bug Fixes

* **module:** 自动注册 CJS 依赖至 optimizeDeps 并修正相机初始值 ([3e2f898](https://github.com/mhaibaraai/movk-mapbox/commit/3e2f898adcb9d2dbe559d8e82bc6aab241884310))

### 🔧 Chores

* 升级 pnpm 至 11.9.0 及各依赖版本 ([9db79bc](https://github.com/mhaibaraai/movk-mapbox/commit/9db79bc9a651c894202d2c6c65123102885187bc))

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
