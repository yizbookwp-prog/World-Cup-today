# 实现计划：增强预测算法和数据来源展示

## 目标
1. 改进预测算法，加入多维度加权计算
2. 添加"数据来源分析"板块，提高透明度

## 实现步骤

### Step 1: 扩展数据类型定义
**文件**: `src/types.ts`

扩展 `Match` 接口，添加新的数据字段：
- `homeFifaRanking?: number` - FIFA排名（1-211）
- `awayFifaRanking?: number`
- `homeWorldCupHistory?: { appearances: number, titles: number, bestFinish: string }` - 世界杯历史
- `awayWorldCupHistory?: { appearances: number, titles: number, bestFinish: string }`
- `homeInjuries?: number` - 伤病人数（0-5）
- `awayInjuries?: number`
- `homeAttackRating?: number` - 进攻评分（1-100）
- `awayAttackRating?: number`
- `homeDefenseRating?: number` - 防守评分（1-100）
- `awayDefenseRating?: number`

扩展 `PredictionResult` 接口，添加：
```typescript
dataAnalysis: {
  homeTeam: {
    overallStrength: number;
    attackEfficiency: number;
    defenseStrength: number;
    fifaRanking: number;
    worldCupPedigree: number;
    injuryImpact: number;
  };
  awayTeam: {
    overallStrength: number;
    attackEfficiency: number;
    defenseStrength: number;
    fifaRanking: number;
    worldCupPedigree: number;
    injuryImpact: number;
  };
  weights: {
    baseStrength: number;
    fifaRanking: number;
    worldCupHistory: number;
    attackDefense: number;
    injuries: number;
  };
}
```

### Step 2: 增强预测逻辑
**文件**: `src/lib/predictor.ts`

#### 2.1 创建加权计算函数
```typescript
function calculateWeightedStrength(match: Match, isHome: boolean): object
```
- 基础实力权重: 30%
- FIFA排名权重: 25%（排名越高越好，需要反转计算）
- 世界杯历史权重: 20%（参赛次数、冠军数、最佳成绩）
- 进攻/防守效率权重: 15%
- 伤病影响权重: 10%（负面影响）

#### 2.2 世界杯历史评分函数
```typescript
function calculateWorldCupPedigree(history: WorldCupHistory): number
```
- 参赛次数 × 2分
- 冠军次数 × 20分
- 最佳成绩：冠军100分，亚军80分，四强60分，八强40分，其他20分

#### 2.3 FIFA排名评分函数
```typescript
function fifaRankingToScore(ranking: number): number
```
- 排名1-10: 95-100分
- 排名11-30: 85-94分
- 排名31-50: 75-84分
- 排名51-100: 60-74分
- 排名100+: 50-59分

#### 2.4 修改现有函数
- 修改 `calculateProbabilities()` 使用新的加权实力
- 修改 `generateScores()` 结合进攻/防守评分
- 修改 `generatePrediction()` 生成 `dataAnalysis` 对象

### Step 3: 扩展API数据
**文件**: `api/matches.ts`

为每个球队添加静态数据映射：
- `TEAM_FIFA_RANKINGS` - FIFA排名数据
- `TEAM_WORLD_CUP_HISTORY` - 世界杯历史数据
- `TEAM_ATTACK_DEFENSE` - 进攻防守评分
- `TEAM_INJURIES` - 伤病情况（随机生成0-3）

在 `getTeamStrength()` 附近创建对应的获取函数，在API响应中包含这些数据。

### Step 4: UI组件更新
**文件**: `src/components/PredictionResultCard.tsx`

在现有的三个板块（比赛结果概率、精确比分预测、优势差距分析）之后，添加第四个板块：

**"数据来源分析"板块**:
- 使用 `Database` 或 `BarChart3` 图标（从 lucide-react）
- 渐变色：from-indigo-400 to-violet-400
- 左右分栏展示主队和客队的各项数据
- 每个维度使用进度条或评分星级展示
- 底部显示权重说明

布局结构：
```
┌─────────────────────────────────┐
│ 📊 数据来源分析                  │
├─────────────┬───────────────────┤
│  主队数据   │    客队数据        │
│  - 综合实力 │    - 综合实力      │
│  - 进攻效率 │    - 进攻效率      │
│  - 防守强度 │    - 防守强度      │
│  - FIFA排名 │    - FIFA排名      │
│  - 历史战绩 │    - 历史战绩      │
│  - 伤病影响 │    - 伤病影响      │
├─────────────────────────────────┤
│ 权重配比说明                     │
└─────────────────────────────────┘
```

### Step 5: 验证和测试
- 运行开发服务器测试UI展示
- 验证计算逻辑是否合理
- 确保数据展示清晰易懂

## 技术决策

### 数据来源策略
由于这是模拟项目，所有扩展数据都采用静态映射或合理算法生成：
- FIFA排名：基于2026年真实数据近似值
- 世界杯历史：基于真实历史记录
- 伤病情况：随机生成（0-3人），模拟真实场景
- 进攻/防守评分：基于 `homeStrength` 加上随机波动

### 权重选择理由
- **基础实力30%**: 最直接的实力指标
- **FIFA排名25%**: 官方权威排名，反映近期表现
- **世界杯历史20%**: 大赛经验很重要
- **进攻防守15%**: 战术风格影响
- **伤病10%**: 负面因素，影响相对较小

### UI设计考虑
- 保持与现有设计风格一致（玻璃态、渐变色）
- 使用进度条而非纯数字，更直观
- 提供权重说明，增加透明度和教育性

## 潜在问题
1. 数据过多可能让UI显得拥挤 → 使用紧凑布局，适当折叠
2. 计算逻辑变复杂可能影响性能 → 保持简单算法，无需异步
3. 静态数据维护成本 → 只维护主要球队，其他使用算法生成

## 完成标准
- ✅ 类型定义完整且无错误
- ✅ 预测算法正确应用所有权重
- ✅ API返回包含所有必需数据
- ✅ UI正确展示所有数据维度
- ✅ 开发服务器运行无错误
- ✅ 数据展示清晰、美观、易懂
