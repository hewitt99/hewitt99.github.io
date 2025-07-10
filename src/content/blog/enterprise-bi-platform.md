---
title: '从零到一构建企业级 BI 可视化平台的技术实践'
description: '初来公司，到手的第一个项目就是 BI，下面我将分享我们团队从零开始构建一个企业级商业智能（BI）数据可视化平台的完整技术实践，涵盖架构设计、核心技术选型、关键问题解决方案以及踩坑经验总结。'
publishDate: '2024-03-15'
category: '技术分享'
tags: ['BI', '可视化', 'Vue']
author: 'Hewitt'
slug: 'enterprise-bi-platform'
---

> 初来公司，到手的第一个项目就是 BI，下面我将分享笔者团队从零开始构建一个企业级商业智能（BI）数据可视化平台的完整技术实践，涵盖架构设计、核心技术选型、关键问题解决方案以及踩坑经验总结。

## 背景与挑战

面临的核心挑战包括：

- **功能复杂性**：需要支持 20+种图表类型，满足不同业务场景
- **交互丰富性**：实现下钻、联动、筛选等高级分析功能
- **性能要求**：处理大数据量、多图表及其联动时保持流畅的用户体验
- **扩展性**：支持快速添加新的图表类型和业务功能

最终公司的前辈构建了一个基于 Vue2.js 的现代化 BI 平台，笔者在此基础上进行改造和优化。

## 技术架构设计

### 整体架构思路

采用了经典的三面板布局设计（大部分低码平台都是如此），结合分层架构模式，确保各层职责清晰、低耦合高内聚：

#### 三面板布局架构

[![BI 平台设计图.jpg](https://img.picui.cn/free/2025/07/10/686f1c09a3148.jpg)](https://img.picui.cn/free/2025/07/10/686f1c09a3148.jpg)

#### 分层架构设计

[![分层设计图.jpg](https://img.picui.cn/free/2025/07/10/686f1c0990d07.jpg)](https://img.picui.cn/free/2025/07/10/686f1c0990d07.jpg)

### 核心技术栈

到手的项目选型如下：

- **前端框架**：Vue 2.6 + Vue Router 3.x
- **UI 组件库**：Element UI 2.x
- **图表库**：ECharts 5.x
- **状态管理**：使用 Vue2.6 新增的自定义 Observable 状态管理
- **构建工具**：Vue CLI 4.x
- **编程语言**：TypeScript

**选型特点：**

1. **Vue.js**：渐进式框架，学习成本低，生态成熟
2. **ECharts**：功能强大，图表类型丰富，性能优秀
3. **TypeScript**：提供类型安全，提升代码质量

## 三面板核心实现

### 1. 左侧组件面板实现

#### 组件库设计

左侧面板包含两个核心部分：组件库和画板列表。组件库提供丰富的图表类型供用户选择：

```typescript
// configs/charts.ts - 图表组件配置
export const groupCharts: GroupChart[] = [
	{
		title: '柱状图',
		id: 'bar',
		charts: [
			{
				id: 'bar',
				name: '基础柱状图',
				imgUrl: require('@/assets/imgs/bar.png')
			},
			{
				id: 'bar-stack',
				name: '堆叠柱状图',
				imgUrl: require('@/assets/imgs/bar-stack.png')
			}
		]
	},
	{
		title: '控件',
		id: 'other',
		charts: [
			{
				id: 'date-filter',
				name: '日期筛选',
				imgUrl: require('@/assets/imgs/time-filter.png')
			},
			{
				id: 'button',
				name: '按钮',
				imgUrl: require('@/assets/imgs/button.png')
			}
		]
	}
	// ... 更多图表类型
]
```

#### 组件面板 UI 实现

```vue
<!-- designer-nav.vue - 组件选择面板 -->
<template>
	<div class="designer-nav">
		<ul>
			<li v-for="chart in chartsNav" :key="chart.id" @click="createChart(chart)">
				<el-tooltip :content="chart.name" placement="top">
					<a href="javascript:void(0)">
						<img :src="chart.imgUrl" />
					</a>
				</el-tooltip>
			</li>

			<!-- 更多图表类型下拉菜单 -->
			<li @mouseover="showAllType = true" @mouseleave="showAllType = false">
				<div v-show="showAllType" class="designer-nav-dropdown">
					<div v-for="group in groupCharts" :key="group.id">
						<p>{{ group.title }}</p>
						<ul>
							<li v-for="chart in group.charts" :key="chart.id" @click="createChart(chart)">
								<img :src="chart.imgUrl" />
								<p>{{ chart.name }}</p>
							</li>
						</ul>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>
```

#### 画板列表管理

```vue
<!-- painter-list.vue - 画板管理 -->
<template>
	<div class="painter-list-wrapper">
		<draggable class="painter-list" v-model="painterList" @end="dragEnd">
			<li
				v-for="(painter, i) in painterList"
				:key="painter.id"
				:class="{ active: painter.active }"
				@click="painterSelect(i)"
			>
				<img src="./imgs/painter.png" />
				<input v-model="painter.name" @blur="modifyPainterName(painter)" />
				<!-- 操作菜单 -->
				<div class="operation-wrapper">
					<a @click.stop="toggleOperation($event, painter)">
						<img src="./imgs/operation.png" />
					</a>
				</div>
			</li>
		</draggable>
	</div>
</template>
```

### 2. 中间画布实现

#### 可拖拽画布容器

中间画布是整个系统的核心，使用 `avue-draggable` 组件实现拖拽功能：

```vue
<!-- subgroup.vue - 画布容器 -->
<template>
	<div ref="subgroupWrapper" class="subgroup-wrapper">
		<avue-draggable
			v-for="(item, i) in chartsList"
			:key="item.id + currentPainter.id"
			v-bind="item"
			:gridAreaOption="item.gridAreaOption"
			:current="currentChart.id === item.id"
			:isEdit="isEdit"
			@focus="handleFocus"
			@changedGridArea="changedGridArea"
			@gridAreaChange="gridAreaChange"
		>
			<!-- 图表组件渲染 -->
			<avue-echart-chart
				v-if="item.isChart"
				:chart="item"
				:data="item.chartConfig.data"
				:option="item.chartConfig.options"
				@chartClick="chartClick"
			/>

			<!-- 表格组件 -->
			<bi-table v-else-if="item.type === TABLE" :data="item.tableData" :columns="item.columns" />

			<!-- 其他组件类型... -->
		</avue-draggable>

		<!-- 拖拽阴影提示 -->
		<div
			class="subgroup-shadow-wrapper"
			:style="shadowGridAreaStyle"
			v-if="isEdit"
			v-show="shadowShow"
		>
			<div class="subgroup-shadow"></div>
		</div>
	</div>
</template>
```

#### 网格布局系统

画布采用网格布局系统，支持精确的组件定位：

```typescript
// 网格区域配置
interface GridArea {
	rowStart: number // 起始行
	columnStart: number // 起始列
	rowSpan: number // 行跨度
	columnSpan: number // 列跨度
}

// 网格样式计算
const gridAreaStyle = computed(() => {
	const { rowStart, columnStart, rowSpan, columnSpan } = gridAreaOption
	return {
		gridArea: `${rowStart + 1} / ${columnStart + 1} / span ${rowSpan} / span ${columnSpan}`
	}
})
```

### 3. 右侧配置面板实现

#### 配置面板结构

右侧配置面板采用选项卡设计，包含数据、样式、动作三个配置模块：

```vue
<!-- board.vue - 配置面板主容器 -->
<template>
	<div class="build-board">
		<div v-show="chartBoardShow" class="board-head">
			<span>图表设计</span>
		</div>

		<div v-show="chartBoardShow" class="board-tabs">
			<el-tabs v-model="currentTab">
				<!-- 数据配置 -->
				<el-tab-pane v-if="dataBoardShow" label="数据" name="data">
					<board-data></board-data>
				</el-tab-pane>

				<!-- 样式配置 -->
				<el-tab-pane v-if="styleBoardShow" label="样式" name="style">
					<board-style></board-style>
				</el-tab-pane>

				<!-- 动作配置 -->
				<el-tab-pane v-if="actionBoardShow" label="动作" name="action">
					<board-action></board-action>
				</el-tab-pane>
			</el-tabs>
		</div>
	</div>
</template>
```

#### 数据配置面板

数据配置面板支持拖拽字段配置，实现维度和度量的灵活组合：

```vue
<!-- board-data-panel.vue - 数据配置 -->
<template>
	<div class="board-data-panel-wrapper">
		<div class="board-data-panel">
			<ul>
				<!-- 度量配置 -->
				<data-field
					v-if="chartSettingsShow"
					v-model="measureEles"
					title="值轴/度量"
					type="measure"
					:handleOpenFilterDialog="handleOpenFilterDialog"
				/>

				<!-- 维度配置 -->
				<data-field
					v-if="normalDimShow"
					v-model="dimensionEles"
					title="类别轴/维度"
					type="dimension"
					:num="1"
					:hasDrill="true"
					:drillDim="drillDim"
				/>

				<!-- 筛选配置 -->
				<data-field
					v-if="filterShow"
					v-model="filterEles"
					title="筛选"
					:handleOpenFilterDialog="handleOpenFilterDialog"
				/>
			</ul>

			<div class="bottom-menus">
				<a class="refresh" @click="refresh()">更新</a>
			</div>
		</div>
	</div>
</template>
```

#### 拖拽字段组件

数据字段支持从左侧数据源拖拽到配置区域：

```vue
<!-- data-field.vue - 字段拖拽组件 -->
<template>
	<ul class="main">
		<li class="config-data-item">
			<div class="config-data-item_head">
				<span class="config-data-item_head-title">{{ title }}</span>
			</div>

			<ul class="field-box" @drop="handleDrop" @dragover="handleDragOver">
				<draggable v-model="dragColumns" group="field">
					<li v-for="(ele, i) in dragColumns" :key="ele.id" class="field-box-component">
						<img
							v-if="ele.dataType === 'number'"
							src="@/pages/build/components/board/imgs/number.png"
						/>
						<span>{{ ele.columnDesc }}</span>

						<div class="field-operation">
							<el-tooltip content="删除" placement="top">
								<a @click="deleteField(i)">
									<img src="@/pages/build/components/board/imgs/delete.png" />
								</a>
							</el-tooltip>
						</div>
					</li>
				</draggable>
			</ul>
		</li>
	</ul>
</template>
```

## 核心技术实现

### 1. 图表系统架构设计

#### 图表基类设计

我们设计了一个通用的图表基类，所有图表类型都继承自这个基类：

```typescript
// configs/baseConfigs/base.ts
export default class Base {
	id: string
	name: string
	type: string
	isChart: boolean
	gridAreaOption: GridArea

	constructor() {
		this.id = uuid.v4()
		this.isChart = false
		this.gridAreaOption = {
			rowStart: 0,
			columnStart: 0,
			rowSpan: 4,
			columnSpan: 6
		}
	}
}
```

#### 具体图表实现

以柱状图为例，展示图表类的具体实现：

```typescript
// configs/baseConfigs/bar.ts
import Base from './base'
import { BAR } from './consts'

export default class Bar extends Base {
	dimensions: Dimension[]
	measures: Measure[]
	chartConfig: ChartConfig
	linkageActions: Action[]

	constructor() {
		super()
		this.isChart = true
		this.name = '柱图'
		this.type = BAR
		this.dimensions = []
		this.measures = []
		this.chartConfig = {
			data: {
				categories: [],
				series: []
			},
			options: {}
		}
		this.linkageActions = []
	}
}
```

这种设计的优势：

- **统一接口**：所有图表都有相同的基础属性和方法
- **易于扩展**：新增图表类型只需继承基类并实现特有逻辑
- **类型安全**：TypeScript 提供编译时类型检查

### 2. 自定义状态管理系统

#### GlobalStorer 架构实现

我们设计了基于 Observable 模式的全局状态管理系统：

```typescript
// storer/index.ts
class GlobalStorer {
	store: StoreState
	mutations: Mutations

	constructor() {
		this.store = reactive({
			// 画板相关
			painters: [], // 画板列表
			currentPainter: null, // 当前画板
			analysisBoardId: '', // 分析板ID

			// 图表相关
			charts: [], // 图表列表
			currentChart: null, // 当前选中图表
			relativeCharts: [], // 关联图表

			// 数据源相关
			dataSources: [], // 数据源列表
			dataSourceId: '', // 当前数据源ID

			// 筛选器相关
			globalFilter: {}, // 全局筛选器
			filters: {}, // 局部筛选器

			// 导航相关
			globalNav: [] // 全局导航配置
		})

		this.mutations = {
			// 画板操作
			setPainters: (painters) => {
				this.store.painters = painters
			},
			setCurrentPainter: (painter) => {
				this.store.currentPainter = painter
			},

			// 图表操作
			setCharts: (charts) => {
				this.store.charts = charts
			},
			setCurrentChart: (chart) => {
				this.store.currentChart = chart
			},

			// 数据源操作
			setDataSources: (dataSources) => {
				this.store.dataSources = dataSources
			},

			// 筛选器操作
			setGlobalFilter: (filter) => {
				this.store.globalFilter = filter
			},

			// 缓存操作
			setCachePainters: (painter) => {
				// 缓存画板数据，用于性能优化
				const existingIndex = this.store.painters.findIndex((p) => p.id === painter.id)
				if (existingIndex !== -1) {
					this.store.painters[existingIndex] = painter
				}
			}
		}
	}

	// 单例模式
	static instance: GlobalStorer
	static getGlobalStorer() {
		if (!GlobalStorer.instance) {
			GlobalStorer.instance = new GlobalStorer()
		}
		return GlobalStorer.instance
	}
}

export default GlobalStorer
```

#### 三面板状态协同

状态管理系统需要协调三个面板的交互：

```typescript
// 左侧面板 - 组件创建时更新画布状态
const createChart = (chartType) => {
	const newChart = new ChartConfig(chartType)
	const charts = [...store.charts, newChart]
	mutations.setCharts(charts)
	mutations.setCurrentChart(newChart)
}

// 中间画布 - 选中图表时更新配置面板
const handleChartFocus = (chartId) => {
	const chart = store.charts.find((c) => c.id === chartId)
	mutations.setCurrentChart(chart)
}

// 右侧配置面板 - 配置变更时更新画布
const updateChartConfig = (config) => {
	const charts = store.charts.map((chart) =>
		chart.id === store.currentChart.id ? { ...chart, ...config } : chart
	)
	mutations.setCharts(charts)
}
```

### 3. 数据处理与图表渲染

#### 三面板数据流架构

数据在三面板之间的完整流转过程：

```typescript
// 数据流：左侧数据源 → 右侧配置 → 中间画布渲染

// 1. 左侧数据源面板 - 提供可拖拽的字段
// board-data-origin.vue
export default {
  async mounted() {
    // 获取数据源结构
    const { dimensionTree, measures, tableInfo } = await dataService.getDataDetail(dataSourceId);
    this.dimensionTree = dimensionTree; // 维度树
    this.measures = measures;           // 度量列表
    this.tableInfo = tableInfo;         // 表信息
  },

  methods: {
    // 处理字段拖拽开始
    handleDimDragStart(e, dim) {
      e.dataTransfer.setData('DimEle', JSON.stringify(dim));
    },

    handleMeasureDragStart(e, measure) {
      e.dataTransfer.setData('MeasureEle', JSON.stringify(measure));
      e.dataTransfer.setData('tableInfo', JSON.stringify({id: this.tableInfo.id}));
    }
  }
}

// 2. 右侧配置面板 - 接收字段并配置图表
// board-data-panel.vue
export default {
  methods: {
    // 字段配置完成后刷新图表
    async refresh() {
      const { echartData, inputFilterDims } = await chartDataService.refreshChart(
        this.dataSourceId,
        this.tableInfo,
        this.dimensionEles,   // 从拖拽配置的维度
        this.measureEles,     // 从拖拽配置的度量
        this.filterEles,      // 筛选条件
        this.currentChart,
        { store: this.storer.store }
      );

      // 更新图表数据到状态管理
      this.updateChartData(echartData);
    }
  }
}

// 3. 中间画布 - 渲染图表
// subgroup.vue
<template>
  <avue-draggable v-for="item in chartsList" :key="item.id">
    <avue-echart-chart
      v-if="item.isChart"
      :data='item.chartConfig.data'      // 来自右侧配置的数据
      :option='item.chartConfig.options'  // 样式配置
      @chartClick='chartClick'            // 图表交互事件
    />
  </avue-draggable>
</template>
```

#### 数据处理服务层

核心的数据处理服务，负责数据格式化和图表适配：

```typescript
// services/chartData.service.ts
export async function refreshChart(
	dataSourceId,
	tableInfo,
	dimensions,
	measures,
	filters,
	currentChart,
	{ store }
) {
	// 1. 构建查询参数
	const { data, inputFilterDims } = await getQueryParams(
		dataSourceId,
		tableInfo,
		dimensions,
		measures,
		filters,
		currentChart,
		{ store }
	)

	// 2. 数据格式化 - 根据图表类型适配
	const { echartData } = await chartDataFormat(data?.list || [], measures, dimensions, currentChart)

	// 3. 数据过滤处理
	filterChartData(echartData)

	return { echartData, inputFilterDims }
}
```

#### 图表数据格式化

不同图表类型需要不同的数据格式，我们实现了统一的格式化处理：

```typescript
// utils/chartDataFormat.ts
export default async function chartDataFormat(data, measures, dimensions, currentChart) {
	const measureIds = measures.map((measure) => measure.columnName)
	const dimensionIds = dimensions.map((dimension) => dimension.columnName)

	// 获取分类数据
	let categories = getCategories(data, dimensionIds)

	// 根据图表类型处理数据
	if (isBarLineChart(currentChart.type)) {
		return getBarLineData(series, categories, measures)
	}

	if (isMapChart(currentChart.type)) {
		return await getMapChart(/* 参数 */)
	}

	if (isScatterChart(currentChart.type)) {
		return getScatterData(measures, dimensions, data)
	}

	// 默认处理
	let series = getSeries(measureIds, measures, data)

	return {
		echartData: {
			categories,
			series
		}
	}
}
```

### 4. 拖拽交互系统实现

#### 数据源拖拽机制

系统支持从左侧数据源面板拖拽字段到右侧配置面板，实现直观的数据配置：

```typescript
// board-data-origin.vue - 数据源拖拽
export default {
	methods: {
		// 处理维度拖拽事件
		handleDimDragStart(e, dim) {
			e.dataTransfer.setData('DimEle', JSON.stringify(dim))
		},

		// 处理度量拖拽事件
		handleMeasureDragStart(e, measure) {
			e.dataTransfer.setData('MeasureEle', JSON.stringify(measure))
			e.dataTransfer.setData('tableInfo', JSON.stringify({ id: this.tableInfo.id }))
		}
	}
}
```

#### 配置面板拖拽接收

配置面板通过 drop 事件接收拖拽的字段数据：

```typescript
// data-field.vue - 字段拖拽接收
export default {
	methods: {
		// 处理拖拽over事件
		handleDragOver(e) {
			e.preventDefault()
			e.dataTransfer.dropEffect = 'copy'
		},

		// 处理字段drop事件
		handleDrop(e) {
			e.preventDefault()
			e.stopPropagation()

			try {
				// 根据字段类型获取数据
				const dimData = e?.dataTransfer?.getData('DimEle')
				const measureData = e?.dataTransfer?.getData('MeasureEle')

				const ele = JSON.parse(dimData || measureData)

				// 验证字段类型匹配
				if (this.type === 'dimension' && !dimData) return
				if (this.type === 'measure' && !measureData) return

				// 添加到字段列表
				const newFields = _.cloneDeep(this.dragColumns)
				newFields.push(ele)

				// 去重处理
				this.dragColumns = _.uniqWith(newFields, (a, b) => a.id === b.id)

				this.$emit('change', this.dragColumns)
			} catch (e) {
				console.log('拖拽数据解析失败:', e)
			}
		}
	}
}
```

#### 画布组件拖拽

画布支持组件的拖拽移动和尺寸调整：

```typescript
// subgroup.vue - 画布拖拽处理
export default {
	methods: {
		// 组件网格区域变化
		changedGridArea(gridAreaOption, id) {
			const charts = _.cloneDeep(this.charts)
			const currentChartItem = charts.find((chart) => chart.id === id)

			if (currentChartItem) {
				currentChartItem.gridAreaOption = gridAreaOption
				this.storer?.mutations.setCharts(charts)
			}
		},

		// 实时网格变化反馈
		gridAreaChange(gridAreaOption) {
			this.shadowGridAreaStyle = {
				gridArea: `${gridAreaOption.rowStart + 1} / ${
					gridAreaOption.columnStart + 1
				} / span ${gridAreaOption.rowSpan} / span ${gridAreaOption.columnSpan}`
			}
			this.shadowShow = true
		}
	}
}
```

### 5. 复杂交互系统实现

#### 图表联动机制

图表联动是 BI 系统的核心功能之一，我们的实现方案：

```typescript
// services/subgroup.service.ts
export const handleLinkageAction = async (currentChart, dimensionValue, linkageAction, storer) => {
	// 1. 解析维度值
	let dimValues = []
	if ([SCATTER, PIPELINE].includes(currentChart.type)) {
		dimValues = dimensionValue
	} else {
		dimValues = dimensionValue?.split(dimensionSplitSymbol) ?? []
	}

	// 2. 构建联动参数
	const attachValues = getAttachValues(currentChart, dimValues)
	const action = getAction(linkageAction, attachValues)

	// 3. 设置关联图表
	setRelativeCharts(action, 'linkage', currentChart, storer)

	// 4. 刷新关联图表
	const currentAttachCharts = action.attachPainters.find(
		(item) => item.id === storer?.store?.currentPainter?.id
	)?.charts

	for (let i = 0; i < currentAttachCharts?.length; i++) {
		const chartId = currentAttachCharts[i]
		const attachChart = storer?.store?.charts.find((item) => item.id === chartId)

		if (!_.isEmpty(attachChart)) {
			const { echartData, inputFilterDims } = await chartDataService
				.refreshChart
				/* 参数 */
				()
			attachChart.actionValues = filterService.getActionValueTags(
				storer?.store,
				attachChart,
				inputFilterDims
			)
			refreshChartData(attachChart, echartData)
		}
	}
}
```

#### 下钻分析实现

下钻分析允许用户逐层深入数据细节：

```typescript
export const handleDrill = async (currentChart, chartTarget, drills, storer) => {
	// 1. 获取当前下钻层级
	const currentDrillIndex = drills.findIndex((drill) => drill.current)
	if (currentDrillIndex === drills.length - 1) {
		return // 已到最深层
	}

	// 2. 获取维度值
	const measureVal = getMeasureVal(currentChart, chartTarget)
	const lastCurrentIndex = drills.findIndex((drill) => !!drill.current)
	drills[lastCurrentIndex].value = measureVal

	// 3. 切换到下一层
	let currentIndex = lastCurrentIndex + 1
	const dimensions = [drills[currentIndex]]

	drills.forEach((drill, i) => {
		drill.current = i === currentIndex
	})

	// 4. 刷新图表数据
	const measures = getMeasures(currentChart)
	const { echartData } = await chartDataService
		.refreshChart
		/* 参数 */
		()

	// 5. 更新状态
	const charts = _.cloneDeep(storer?.store?.charts)
	const currentChartItem = charts.find((chart) => chart.id === storer?.store?.currentChart.id)
	currentChartItem.drills = drills
	currentChartItem.dimensions = dimensions
	refreshChartData(currentChartItem, echartData)
	storer?.mutations.setCurrentChart(currentChartItem)
	storer?.mutations.setCharts(charts)
}
```

## 性能优化实践

### 1. 数据缓存策略

优化数据请求，避免重复请求，提高页面加载效率。

```typescript
// services/data.service.ts
export const getDataDetail = async (analysisModelId: string) => {
	// 检查缓存
	const cacheData = sessionStorage.getItem(`tree_${analysisModelId}`)
	if (cacheData) {
		return JSON.parse(cacheData)
	}

	// 获取数据
	const [, res] = await modelDetail({ analysisModelId })
	if (res?.data) {
		const resData = processData(res.data)
		// 缓存数据
		sessionStorage.setItem(`tree_${analysisModelId}`, JSON.stringify(resData))
		return resData
	}
}
```

### 2. 图表渲染性能优化

通过防抖处理图表更新，减少不必要的渲染，提高图表渲染性能。

```typescript
// 防抖处理图表更新
const debouncedUpdate = _.debounce((chart, data) => {
	chart.chartConfig.data = data
}, 100)

// 懒加载图表组件
const ChartComponent = () => import(`@/components/charts/${chartType}`)
```

### 3.webpack 构建产物分包

通过 webpack 构建产物分包，减少首屏加载时间。

```js
// vue.config.js
module.exports = {
	configureWebpack: {
		optimization: {
			splitChunks: {
				chunks: 'all', // 对所有类型的代码块（同步 + 异步）都进行代码分割
				minSize: 300000, // 当模块大于 300KB 时才进行提取，防止生成太多小文件
				maxInitialRequests: 5, // 页面初始加载时最大并行请求数，防止首屏加载过多请求
				cacheGroups: {
					vendor: {
						test: /[\\/]node_modules[\\/]/, // 匹配 node_modules 中的依赖
						name(module) {
							// 动态命名每个拆分出来的模块
							const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1] // 从模块路径中提取包名
							return packageName.replace('@', '') // 去除包名前的 @，防止命名冲突
						}
					}
				}
			}
		}
	}
}
```

## 项目架构演进

### 初期架构问题

在项目初期，笔者团队遇到了一些架构问题：

1. **组件耦合度高**：图表组件直接调用 API，难以复用
2. **状态管理混乱**：没有统一的状态管理机制
3. **性能问题**：大量图表同时渲染时页面卡顿

### 重构方案

笔者团队进行了系统性的重构：

```typescript
// 重构前：组件直接调用 API
export default {
	async mounted() {
		const data = await axios.get('/api/chart-data')
		this.chartData = data
	}
}

// 重构后：通过 api 层抽象
export default {
	async mounted() {
		const data = await chartDataService.getChartData(this.chartConfig)
		this.chartData = data
	}
}
```

### 服务层设计

笔者团队将 api 层分类，方便管理维护：

```typescript
// services/index.js
export { default as chartDataService } from './chartData.service'
export { default as filterService } from './filter.service'
export { default as dataService } from './data.service'
export { default as chartService } from './chart.service'
```

每个服务都有明确的职责划分：

- **chartDataService**：图表数据处理
- **filterService**：筛选器逻辑
- **dataService**：数据源管理
- **chartService**：图表生命周期管理

## 踩坑经验总结

### 1. ECharts 内存泄漏问题

**问题描述**：频繁切换图表时出现内存泄漏

**解决方案**：

```typescript
// 组件销毁时正确清理 ECharts 实例
beforeDestroy() {
  if (this.chartInstance) {
    this.chartInstance.dispose()
    this.chartInstance = null
  }
}
```

### 2. 状态管理复杂度问题

**问题描述**：图表间联动关系复杂，状态难以维护

**解决方案**：

```typescript
// 引入关系图谱管理联动关系
const setRelativeCharts = (action, actionType, currentChart, storer) => {
	const actionCharts = action.attachPainters?.map((chartId) => ({
		chartId,
		attachValues: action?.attachValues.map((item) => ({
			...item,
			actionType,
			originChartId: currentChart?.id,
			relativeId: `${currentChart.id}_${actionType}_${chartId}_${item.id}`
		}))
	}))

	// 更新关联关系
	storer?.mutations?.setRelativeCharts(actionCharts)
}
```

### 4. TypeScript 类型定义问题

**问题描述**：复杂的图表配置类型定义困难

**解决方案**：

```typescript
// 使用泛型和条件类型
interface ChartConfig<T extends ChartType> {
	type: T
	data: T extends 'bar' ? BarData : T extends 'line' ? LineData : T extends 'pie' ? PieData : any
	options: ChartOptions<T>
}
```

## 总结与展望

### 项目成果

经过一年多的开发和迭代，笔者独立维护了一个功能完整的企业级 BI 平台：

#### 核心功能特性

- **功能完整性**：支持 20+ 种图表类型，覆盖柱状图、折线图、饼图、散点图、地图等主流场景
- **用户体验**：所见即所得的设计器，直观的拖拽式数据配置

### 技术收获

1. **拖拽交互系统**：深入理解经典 BI 设计器的架构模式和交互逻辑，掌握复杂拖拽场景的技术实现，包括数据传递和状态同步
2. **自定义状态管理**：针对复杂业务场景设计专用状态管理系统
3. **组件化架构**：构建可复用、可扩展的图表组件体系

### 未来规划

1. **技术升级**：

   - 迁移到 Vue 3.x，利用 Composition API 优化逻辑复用
   - 引入 WebAssembly 提升数据处理性能
   - 集成 WebGL 支持更复杂的 3D 可视化

2. **功能扩展**：
   - 实时数据流处理
   - 移动端适配

## 写在最后

构建企业级 BI 平台是一个复杂的系统工程。希望笔者的实践经验能为同样在做数据可视化项目的团队提供一些参考和启发。谢谢观看！
