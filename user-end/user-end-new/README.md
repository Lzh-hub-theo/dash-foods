# dash·foods · 用户端前端

> 一份来自田野的轻食外卖 —— 桌面端 Web 点单平台。基于 sky-take-out 后端接口实现。

## 项目定位

`dash-foods` 是苍穹外卖项目的现代化用户端前端，定位为"清新明亮轻食"风格的桌面 Web 体验。

- 后端：复用 `sky-server`（默认 `localhost:8080`），已通过 Vite Proxy 转发 `/user/*` 与 `/admin/*` 路径
- 前端：Vue 3 + TypeScript + Vite + Pinia + Vue Router + Axios
- 风格：奶油米白底、鼠尾草绿主色、衬线 Fraunces 标题 + 无衬线 Manrope 正文，纯手写 CSS

## 启动

```bash
cd user-end/user-end-new

# 安装依赖
npm install

# 启动 dev server（http://localhost:5173）
npm run dev

# 生产构建
npm run build

# 本地预览生产构建
npm run preview
```

> 注意：dev 模式下需要本地同时启动 `sky-server`（`localhost:8080`），否则购物车等依赖登录态的接口会触发本地 mock 降级。

## 目录结构

```
src/
├── api/                  # 接口封装（request + 各模块）
├── components/
│   ├── layout/           # Header / Footer / BrandMark / StatusBadge
│   ├── home/             # Hero / CategoryRail / DishGrid / DishCard / ChefPick / MarqueeBar
│   └── cart/             # CartFab / CartDrawer / CartItemRow
├── router/               # Vue Router 配置
├── stores/               # Pinia: user / cart / shop / menu
├── styles/               # tokens / reset / animations / global
├── types/                # api.d.ts（与后端 Result<T> 对齐）
└── views/                # HomeView / LoginView / CheckoutView / OrdersView
```

## 已实现页面

| 路由 | 页面 | 状态 |
|---|---|---|
| `/` | 门店首页：Hero + 分类导航 + 菜品网格 + 主厨推荐 | ✅ 完整 |
| `/checkout` | 结算 / 下单：地址选择 + 备注 + 餐具 + 提交 | ✅ 完整（地址簿 UI 略简化） |
| `/orders` | 我的订单：状态分组 + 详情弹窗 | ✅ 完整 |
| `/login` | 微信小程序 code 登录（含 mock 降级） | ✅ 完整 |

## 关键设计

- **视觉语言**：奶油米白 `#FAF8F3`、鼠尾草绿 `#3F6B3A`、鲜橙 `#F2A65A`、番茄红 `#D9534F`，全 CSS 变量驱动
- **字体**：Fraunces（衬线 / 标题 / 价格 italic）+ Manrope（无衬线 / 正文）+ Noto Serif SC（中文衬线兜底）
- **质感**：圆角 + 柔和米色阴影 + 纸纹纹理背景 + 大字号间距，克制玻璃拟态用于购物车浮层
- **动效**：标题 line-rise 入场、菜品 hover 上浮、加入购物车 +1 抛物、抽屉滑入、分类激活脉冲点

## 未来可补充

详见 `MEMORY.md` 中的项目进度条目，按优先级排序：

1. **地址簿独立页面 + 表单**（MVP 已用占位）
2. **真实菜品图片**（首轮用渐变 fallback）
3. **倒计时 / 催单 / 再来一单** 完整订单流
4. **微信支付 V3** 真实调用（首轮 submit 后仅做提示）
5. **响应式断点** 优化（首轮面向 ≥1024px）