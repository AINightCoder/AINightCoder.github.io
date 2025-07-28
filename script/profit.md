# Quartz 付费文章功能实现方案

> 为 Quartz 静态网站生成器添加付费内容功能的完整实施指南

## 📋 方案概述

### 目标
- 在现有 Quartz 网站基础上添加付费文章功能
- 最小化对现有配置的影响
- 支持文章预览和完整内容解锁
- 提供简单的用户认证和支付流程

### 核心特性
- ✅ 文章内容预览（免费部分）
- ✅ 用户注册/登录系统
- ✅ 支付集成（一次性购买/订阅）
- ✅ 内容动态解锁
- ✅ 用户仪表板
- ✅ 移动端适配

## 🏗️ 技术架构

### 技术栈
```
Frontend: Quartz + TypeScript + Preact
认证服务: Supabase Auth (免费额度: 50,000 MAU)
数据库: Supabase Database (免费额度: 500MB)
支付处理: Stripe (2.9% + ¥0.3 per transaction)
托管平台: Netlify/Vercel (免费额度充足)
```

### 系统架构图
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Quartz Site   │    │   Supabase      │    │     Stripe      │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ 免费内容    │ │    │ │ 用户认证    │ │    │ │ 支付处理    │ │
│ │ 付费预览    │ │◄──►│ │ 用户数据    │ │◄──►│ │ 订阅管理    │ │
│ │ 动态解锁    │ │    │ │ 购买记录    │ │    │ │ Webhook     │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📊 数据库设计

### Supabase 表结构

```sql
-- 用户扩展信息表
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT DEFAULT 'free',
  subscription_end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 文章购买记录表
CREATE TABLE article_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  article_slug TEXT NOT NULL,
  purchase_type TEXT NOT NULL, -- 'one_time' or 'subscription'
  stripe_payment_intent_id TEXT,
  amount INTEGER, -- 金额（分）
  currency TEXT DEFAULT 'CNY',
  purchased_at TIMESTAMP DEFAULT NOW()
);

-- 订阅记录表
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 分阶段实施计划

### 阶段 1：基础内容标记 (1-2 天)

#### 1.1 扩展 Frontmatter 支持
在文章头部添加付费标记：

```yaml
---
title: "我的付费文章"
description: "这是一篇付费文章的描述"
premium: true
preview_length: 300
price: 9.99
currency: "CNY"
purchase_type: "one_time" # 或 "subscription"
---

这是文章的免费预览部分，所有用户都可以看到...

<!-- premium-content-start -->
这里是付费内容，只有购买后才能看到的详细内容...
<!-- premium-content-end -->
```

#### 1.2 创建 Premium Transformer 插件

创建文件：`quartz/plugins/transformers/premium.ts`

```typescript
import { QuartzTransformerPlugin } from "../types"
import { Root } from "mdast"
import { visit } from "unist-util-visit"

export interface Options {
  defaultPreviewLength: number
}

export const Premium: QuartzTransformerPlugin<Options> = (opts) => {
  const { defaultPreviewLength = 200 } = opts ?? {}

  return {
    name: "Premium",
    markdownPlugins() {
      return [
        () => {
          return (tree: Root, file) => {
            const frontmatter = file.data.frontmatter as any

            if (frontmatter?.premium) {
              // 处理付费内容标记
              let contentLength = 0
              let foundPremiumStart = false

              visit(tree, 'text', (node, index, parent) => {
                if (node.value.includes('<!-- premium-content-start -->')) {
                  foundPremiumStart = true
                  // 添加付费墙组件
                  const paywallNode = {
                    type: 'html',
                    value: `<div class="premium-paywall" data-article-slug="${file.stem}" data-price="${frontmatter.price}" data-currency="${frontmatter.currency}">
                      <div class="paywall-content">
                        <h3>🔒 付费内容</h3>
                        <p>此内容需要付费解锁</p>
                        <div class="paywall-price">¥${frontmatter.price}</div>
                        <button class="paywall-unlock-btn">解锁内容</button>
                      </div>
                    </div>`
                  }

                  if (parent && index !== undefined) {
                    parent.children.splice(index + 1, 0, paywallNode)
                  }
                }

                if (foundPremiumStart && node.value.includes('<!-- premium-content-end -->')) {
                  // 隐藏付费内容
                  if (parent && index !== undefined) {
                    parent.children.splice(index, 1)
                  }
                }
              })
            }
          }
        }
      ]
    }
  }
}
```

#### 1.3 更新 Quartz 配置

在 `quartz.config.ts` 中添加插件：

```typescript
import { Premium } from "./quartz/plugins/transformers/premium"

const config: QuartzConfig = {
  // ... 其他配置
  plugins: {
    transformers: [
      // ... 其他插件
      Premium({
        defaultPreviewLength: 300
      }),
    ],
    // ... 其他配置
  },
}
```

### 阶段 2：用户认证系统 (2-3 天)

#### 2.1 Supabase 项目设置

1. 访问 [Supabase](https://supabase.com) 创建新项目
2. 获取项目 URL 和 anon key
3. 在项目设置中配置认证提供商

#### 2.2 环境变量配置

创建 `.env` 文件：

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

#### 2.3 创建认证组件

创建文件：`quartz/components/Premium/AuthModal.tsx`

```typescript
import { JSX } from "preact"
import { useState } from "preact/hooks"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'register'
}

export default function AuthModal({ isOpen, onClose, mode }: AuthModalProps): JSX.Element {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 这里将在阶段2完成时实现认证逻辑
      console.log('认证逻辑待实现')
    } catch (error) {
      console.error('认证失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return <></>

  return (
    <div class="auth-modal-overlay" onClick={onClose}>
      <div class="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div class="auth-modal-header">
          <h2>{mode === 'login' ? '登录' : '注册'}</h2>
          <button class="auth-modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} class="auth-form">
          <div class="form-group">
            <label for="email">邮箱</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          <div class="form-group">
            <label for="password">密码</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          <button type="submit" class="auth-submit-btn" disabled={loading}>
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>
        </form>
      </div>
    </div>
  )
}
```

#### 2.4 创建认证管理脚本

创建文件：`quartz/components/scripts/auth.inline.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

// 初始化 Supabase 客户端
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

// 全局认证状态管理
class AuthManager {
  private user: any = null
  private listeners: Array<(user: any) => void> = []

  constructor() {
    this.init()
  }

  async init() {
    // 检查当前用户状态
    const { data: { user } } = await supabase.auth.getUser()
    this.setUser(user)

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((event, session) => {
      this.setUser(session?.user || null)
    })
  }

  setUser(user: any) {
    this.user = user
    this.listeners.forEach(listener => listener(user))
  }

  getUser() {
    return this.user
  }

  onAuthChange(callback: (user: any) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback)
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async checkArticleAccess(articleSlug: string): Promise<boolean> {
    if (!this.user) return false

    // 检查用户是否购买了该文章
    const { data, error } = await supabase
      .from('article_purchases')
      .select('*')
      .eq('user_id', this.user.id)
      .eq('article_slug', articleSlug)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('检查文章访问权限失败:', error)
      return false
    }

    return !!data
  }
}

// 全局实例
const authManager = new AuthManager()

// 导出到全局作用域
;(window as any).authManager = authManager
;(window as any).supabase = supabase
```

### 阶段 3：支付集成 (3-4 天)

#### 3.1 Stripe 配置

1. 创建 Stripe 账户
2. 配置产品和价格
3. 设置 Webhook 端点

#### 3.2 支付组件实现

创建文件：`quartz/components/Premium/PaymentModal.tsx`

```typescript
import { JSX } from "preact"
import { useState, useEffect } from "preact/hooks"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  articleSlug: string
  price: number
  currency: string
}

export default function PaymentModal({
  isOpen,
  onClose,
  articleSlug,
  price,
  currency
}: PaymentModalProps): JSX.Element {
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'alipay' | 'wechat' | 'card'>('alipay')

  const handlePayment = async () => {
    setLoading(true)

    try {
      // 创建支付意图
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleSlug,
          amount: Math.round(price * 100), // 转换为分
          currency: currency.toLowerCase(),
          paymentMethod
        })
      })

      const { clientSecret } = await response.json()

      // 重定向到 Stripe 支付页面
      window.location.href = `/payment?client_secret=${clientSecret}`

    } catch (error) {
      console.error('支付失败:', error)
      alert('支付失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return <></>

  return (
    <div class="payment-modal-overlay" onClick={onClose}>
      <div class="payment-modal" onClick={(e) => e.stopPropagation()}>
        <div class="payment-modal-header">
          <h2>购买文章</h2>
          <button class="payment-modal-close" onClick={onClose}>×</button>
        </div>

        <div class="payment-content">
          <div class="payment-summary">
            <h3>订单摘要</h3>
            <div class="payment-item">
              <span>文章访问权限</span>
              <span>¥{price}</span>
            </div>
            <div class="payment-total">
              <strong>总计: ¥{price}</strong>
            </div>
          </div>

          <div class="payment-methods">
            <h3>支付方式</h3>
            <div class="payment-method-options">
              <label class="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="alipay"
                  checked={paymentMethod === 'alipay'}
                  onChange={() => setPaymentMethod('alipay')}
                />
                <span>支付宝</span>
              </label>

              <label class="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="wechat"
                  checked={paymentMethod === 'wechat'}
                  onChange={() => setPaymentMethod('wechat')}
                />
                <span>微信支付</span>
              </label>

              <label class="payment-method-option">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                />
                <span>银行卡</span>
              </label>
            </div>
          </div>

          <button
            class="payment-submit-btn"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? '处理中...' : `支付 ¥${price}`}
          </button>
        </div>
      </div>
    </div>
  )
}
```

#### 3.3 创建支付处理 API

由于 Quartz 是静态网站，我们需要使用 Netlify Functions 或 Vercel API Routes：

**Netlify Functions 示例** (`netlify/functions/create-payment-intent.js`):

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    const { articleSlug, amount, currency, paymentMethod } = JSON.parse(event.body)

    // 创建 Stripe 支付意图
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      payment_method_types: [paymentMethod === 'alipay' ? 'alipay' : 'card'],
      metadata: {
        articleSlug,
        userId: context.clientContext?.user?.sub || 'anonymous'
      }
    })

    return {
      statusCode: 200,
      body: JSON.stringify({
        clientSecret: paymentIntent.client_secret
      })
    }
  } catch (error) {
    console.error('创建支付意图失败:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: '支付处理失败' })
    }
  }
}
```

#### 3.4 Webhook 处理

创建 `netlify/functions/stripe-webhook.js`:

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

exports.handler = async (event, context) => {
  const sig = event.headers['stripe-signature']
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

  let stripeEvent

  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, endpointSecret)
  } catch (err) {
    console.error('Webhook 签名验证失败:', err.message)
    return { statusCode: 400, body: `Webhook Error: ${err.message}` }
  }

  // 处理支付成功事件
  if (stripeEvent.type === 'payment_intent.succeeded') {
    const paymentIntent = stripeEvent.data.object

    // 记录购买信息到数据库
    const { error } = await supabase
      .from('article_purchases')
      .insert({
        user_id: paymentIntent.metadata.userId,
        article_slug: paymentIntent.metadata.articleSlug,
        purchase_type: 'one_time',
        stripe_payment_intent_id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency.toUpperCase()
      })

    if (error) {
      console.error('记录购买信息失败:', error)
    }
  }

  return { statusCode: 200, body: 'OK' }
}
```

### 阶段 4：内容解锁 (2-3 天)

#### 4.1 权限检查和内容解锁

创建文件：`quartz/components/scripts/premium.inline.ts`

```typescript
// 付费内容解锁逻辑
document.addEventListener('DOMContentLoaded', async () => {
  const authManager = (window as any).authManager
  const paywalls = document.querySelectorAll('.premium-paywall')

  // 为每个付费墙设置事件监听
  paywalls.forEach(paywall => {
    const unlockBtn = paywall.querySelector('.paywall-unlock-btn')
    const articleSlug = paywall.getAttribute('data-article-slug')
    const price = paywall.getAttribute('data-price')
    const currency = paywall.getAttribute('data-currency')

    if (unlockBtn && articleSlug) {
      unlockBtn.addEventListener('click', () => {
        handleUnlockClick(articleSlug, price, currency)
      })
    }
  })

  // 检查用户是否已购买文章
  authManager.onAuthChange(async (user: any) => {
    if (user) {
      await checkAndUnlockContent()
    }
  })

  // 如果用户已登录，立即检查
  if (authManager.getUser()) {
    await checkAndUnlockContent()
  }

  async function checkAndUnlockContent() {
    for (const paywall of paywalls) {
      const articleSlug = paywall.getAttribute('data-article-slug')
      if (articleSlug) {
        const hasAccess = await authManager.checkArticleAccess(articleSlug)
        if (hasAccess) {
          await unlockContent(articleSlug, paywall as HTMLElement)
        }
      }
    }
  }

  async function unlockContent(articleSlug: string, paywall: HTMLElement) {
    try {
      // 从 API 获取完整内容
      const response = await fetch(`/api/get-premium-content/${articleSlug}`, {
        headers: {
          'Authorization': `Bearer ${authManager.getUser()?.access_token}`
        }
      })

      if (response.ok) {
        const { content } = await response.json()

        // 替换付费墙为实际内容
        const contentDiv = document.createElement('div')
        contentDiv.innerHTML = content
        contentDiv.className = 'premium-content-unlocked'

        paywall.parentNode?.replaceChild(contentDiv, paywall)
      }
    } catch (error) {
      console.error('解锁内容失败:', error)
    }
  }

  function handleUnlockClick(articleSlug: string, price: string, currency: string) {
    const user = authManager.getUser()

    if (!user) {
      // 显示登录模态框
      showAuthModal('login')
    } else {
      // 显示支付模态框
      showPaymentModal(articleSlug, parseFloat(price), currency)
    }
  }

  function showAuthModal(mode: 'login' | 'register') {
    // 创建并显示认证模态框
    const modal = document.createElement('div')
    modal.innerHTML = `
      <div class="auth-modal-overlay">
        <div class="auth-modal">
          <div class="auth-modal-header">
            <h2>${mode === 'login' ? '登录' : '注册'}</h2>
            <button class="auth-modal-close">×</button>
          </div>
          <form class="auth-form">
            <div class="form-group">
              <label>邮箱</label>
              <input type="email" name="email" required>
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" name="password" required>
            </div>
            <button type="submit" class="auth-submit-btn">
              ${mode === 'login' ? '登录' : '注册'}
            </button>
          </form>
        </div>
      </div>
    `

    document.body.appendChild(modal)

    // 绑定事件
    const closeBtn = modal.querySelector('.auth-modal-close')
    const form = modal.querySelector('.auth-form')

    closeBtn?.addEventListener('click', () => {
      document.body.removeChild(modal)
    })

    form?.addEventListener('submit', async (e) => {
      e.preventDefault()
      const formData = new FormData(e.target as HTMLFormElement)
      const email = formData.get('email') as string
      const password = formData.get('password') as string

      try {
        if (mode === 'login') {
          await authManager.signIn(email, password)
        } else {
          await authManager.signUp(email, password)
        }
        document.body.removeChild(modal)
      } catch (error) {
        alert('认证失败: ' + error.message)
      }
    })
  }

  function showPaymentModal(articleSlug: string, price: number, currency: string) {
    // 类似地创建支付模态框
    // 实现支付流程
  }
})
```

#### 4.2 用户仪表板组件

创建文件：`quartz/components/Premium/UserDashboard.tsx`

```typescript
import { JSX } from "preact"
import { useState, useEffect } from "preact/hooks"

interface Purchase {
  id: string
  article_slug: string
  amount: number
  currency: string
  purchased_at: string
}

export default function UserDashboard(): JSX.Element {
  const [user, setUser] = useState<any>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const authManager = (window as any).authManager

    const unsubscribe = authManager.onAuthChange((user: any) => {
      setUser(user)
      if (user) {
        loadPurchases(user.id)
      } else {
        setPurchases([])
      }
      setLoading(false)
    })

    // 初始加载
    const currentUser = authManager.getUser()
    if (currentUser) {
      setUser(currentUser)
      loadPurchases(currentUser.id)
    }
    setLoading(false)

    return unsubscribe
  }, [])

  const loadPurchases = async (userId: string) => {
    try {
      const supabase = (window as any).supabase
      const { data, error } = await supabase
        .from('article_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('purchased_at', { ascending: false })

      if (error) throw error
      setPurchases(data || [])
    } catch (error) {
      console.error('加载购买记录失败:', error)
    }
  }

  const handleSignOut = async () => {
    try {
      const authManager = (window as any).authManager
      await authManager.signOut()
    } catch (error) {
      console.error('登出失败:', error)
    }
  }

  if (loading) {
    return <div class="dashboard-loading">加载中...</div>
  }

  if (!user) {
    return (
      <div class="dashboard-login-prompt">
        <h2>请先登录</h2>
        <button class="login-btn">登录</button>
      </div>
    )
  }

  return (
    <div class="user-dashboard">
      <div class="dashboard-header">
        <h1>我的账户</h1>
        <button class="signout-btn" onClick={handleSignOut}>登出</button>
      </div>

      <div class="dashboard-content">
        <div class="user-info">
          <h2>用户信息</h2>
          <p>邮箱: {user.email}</p>
          <p>注册时间: {new Date(user.created_at).toLocaleDateString()}</p>
        </div>

        <div class="purchase-history">
          <h2>购买记录</h2>
          {purchases.length === 0 ? (
            <p>暂无购买记录</p>
          ) : (
            <div class="purchase-list">
              {purchases.map(purchase => (
                <div key={purchase.id} class="purchase-item">
                  <div class="purchase-article">
                    <a href={`/${purchase.article_slug}`}>
                      {purchase.article_slug}
                    </a>
                  </div>
                  <div class="purchase-amount">
                    ¥{(purchase.amount / 100).toFixed(2)}
                  </div>
                  <div class="purchase-date">
                    {new Date(purchase.purchased_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

## 🎨 样式设计

### 付费墙样式

创建文件：`quartz/components/styles/premium.scss`

```scss
// 付费墙样式
.premium-paywall {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  margin: 2rem 0;
  text-align: center;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);

  .paywall-content {
    h3 {
      margin: 0 0 1rem 0;
      font-size: 1.5rem;
      font-weight: 600;
    }

    p {
      margin: 0 0 1.5rem 0;
      opacity: 0.9;
    }

    .paywall-price {
      font-size: 2rem;
      font-weight: 700;
      margin: 1rem 0;
      color: #ffd700;
    }

    .paywall-unlock-btn {
      background: #ffd700;
      color: #333;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #ffed4e;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

// 认证模态框样式
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.auth-modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

  .auth-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #eee;

    h2 {
      margin: 0;
      color: #333;
    }

    .auth-modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        color: #333;
      }
    }
  }

  .auth-form {
    padding: 1.5rem;

    .form-group {
      margin-bottom: 1rem;

      label {
        display: block;
        margin-bottom: 0.5rem;
        color: #333;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 1rem;
        transition: border-color 0.3s ease;

        &:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      }
    }

    .auth-submit-btn {
      width: 100%;
      background: #667eea;
      color: white;
      border: none;
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover:not(:disabled) {
        background: #5a6fd8;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

// 支付模态框样式
.payment-modal-overlay {
  @extend .auth-modal-overlay;
}

.payment-modal {
  @extend .auth-modal;
  max-width: 500px;

  .payment-content {
    padding: 1.5rem;

    .payment-summary {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;

      h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .payment-item {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }

      .payment-total {
        border-top: 1px solid #ddd;
        padding-top: 0.5rem;
        margin-top: 0.5rem;
      }
    }

    .payment-methods {
      margin-bottom: 1.5rem;

      h3 {
        margin: 0 0 1rem 0;
        color: #333;
      }

      .payment-method-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;

        .payment-method-option {
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;

          &:hover {
            border-color: #667eea;
            background: #f8f9ff;
          }

          input[type="radio"] {
            margin-right: 0.75rem;
          }
        }
      }
    }

    .payment-submit-btn {
      @extend .auth-submit-btn;
      background: #28a745;

      &:hover:not(:disabled) {
        background: #218838;
      }
    }
  }
}

// 用户仪表板样式
.user-dashboard {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;

    h1 {
      margin: 0;
      color: #333;
    }

    .signout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s ease;

      &:hover {
        background: #c82333;
      }
    }
  }

  .dashboard-content {
    display: grid;
    gap: 2rem;

    .user-info, .purchase-history {
      background: #f8f9fa;
      border-radius: 8px;
      padding: 1.5rem;

      h2 {
        margin: 0 0 1rem 0;
        color: #333;
      }
    }

    .purchase-list {
      .purchase-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 1rem;
        align-items: center;
        padding: 1rem;
        background: white;
        border-radius: 6px;
        margin-bottom: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

        .purchase-article a {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;

          &:hover {
            text-decoration: underline;
          }
        }

        .purchase-amount {
          font-weight: 600;
          color: #28a745;
        }

        .purchase-date {
          color: #666;
          font-size: 0.9rem;
        }
      }
    }
  }
}

// 解锁后的内容样式
.premium-content-unlocked {
  border-left: 4px solid #28a745;
  padding-left: 1rem;
  margin: 1rem 0;
  background: #f8fff8;
  border-radius: 0 6px 6px 0;
}

// 响应式设计
@media (max-width: 768px) {
  .premium-paywall {
    padding: 1.5rem;
    margin: 1rem 0;

    .paywall-content {
      .paywall-price {
        font-size: 1.5rem;
      }

      .paywall-unlock-btn {
        padding: 0.6rem 1.5rem;
        font-size: 1rem;
      }
    }
  }

  .auth-modal, .payment-modal {
    width: 95%;
    margin: 1rem;
  }

  .user-dashboard {
    padding: 1rem;

    .dashboard-header {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .purchase-item {
      grid-template-columns: 1fr;
      gap: 0.5rem;
      text-align: center;
    }
  }
}
```

## 💰 成本分析

### 免费额度
- **Supabase**:
  - 50,000 月活用户
  - 500MB 数据库存储
  - 1GB 文件存储
  - 2GB 带宽

- **Netlify/Vercel**:
  - 100GB 带宽/月
  - 300 分钟构建时间/月
  - 无限静态网站

- **Stripe**:
  - 无月费
  - 按交易收费：2.9% + ¥0.3

### 预估成本（月活 1000 用户，月收入 ¥10,000）

| 服务 | 免费额度 | 超出费用 | 预估成本 |
|------|----------|----------|----------|
| Supabase | 50,000 MAU | $25/月 (Pro) | ¥0 |
| 托管平台 | 100GB 带宽 | $20/月 | ¥0 |
| Stripe | 无限制 | 2.9% + ¥0.3 | ¥320 |
| **总计** | - | - | **¥320/月** |

### 盈亏平衡点
- 月收入需达到 ¥500 以上才能覆盖 Stripe 费用
- 在免费额度内，主要成本是 Stripe 交易费用

## 🔒 安全考虑

### 客户端安全
1. **内容保护**
   - 付费内容不在静态文件中暴露
   - 通过 API 动态加载完整内容
   - 使用 JWT 令牌验证用户身份

2. **防止绕过**
   - 服务端验证用户权限
   - 内容加密传输
   - 定期刷新访问令牌

### 服务端安全
1. **数据库安全**
   - 启用 Supabase RLS（行级安全）
   - 限制 API 访问权限
   - 定期备份数据

2. **支付安全**
   - Stripe Webhook 签名验证
   - 支付状态双重确认
   - 敏感信息加密存储

### RLS 策略示例

```sql
-- 用户只能查看自己的购买记录
CREATE POLICY "Users can view own purchases" ON article_purchases
  FOR SELECT USING (auth.uid() = user_id);

-- 用户只能查看自己的个人资料
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- 用户可以更新自己的个人资料
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 📝 实施检查清单

### 阶段 1：基础内容标记 ✅
- [ ] 创建 Premium transformer 插件
- [ ] 更新 quartz.config.ts 配置
- [ ] 测试 frontmatter 扩展功能
- [ ] 实现付费墙基础样式
- [ ] 验证内容截断功能

### 阶段 2：用户认证系统 🔄
- [ ] 创建 Supabase 项目
- [ ] 配置环境变量
- [ ] 创建数据库表结构
- [ ] 实现认证组件
- [ ] 测试登录/注册流程
- [ ] 配置 RLS 安全策略

### 阶段 3：支付集成 💳
- [ ] 创建 Stripe 账户
- [ ] 配置产品和价格
- [ ] 实现支付组件
- [ ] 创建 API 端点
- [ ] 配置 Webhook 处理
- [ ] 测试支付流程

### 阶段 4：内容解锁 🔓
- [ ] 实现权限检查逻辑
- [ ] 创建内容解锁脚本
- [ ] 实现用户仪表板
- [ ] 测试端到端流程
- [ ] 优化用户体验

### 部署和上线 🚀
- [ ] 配置生产环境变量
- [ ] 部署到 Netlify/Vercel
- [ ] 配置自定义域名
- [ ] 设置 SSL 证书
- [ ] 配置 Stripe 生产环境
- [ ] 进行全面测试

## 🚀 部署指南

### 1. 环境准备

#### 1.1 Supabase 设置
1. 访问 [Supabase](https://supabase.com) 创建项目
2. 在 SQL 编辑器中执行数据库表创建脚本
3. 在认证设置中配置邮箱认证
4. 获取项目 URL 和 anon key

#### 1.2 Stripe 设置
1. 创建 [Stripe](https://stripe.com) 账户
2. 在产品目录中创建付费文章产品
3. 获取可发布密钥和密钥
4. 配置 Webhook 端点

### 2. 本地开发

#### 2.1 安装依赖
```bash
npm install @supabase/supabase-js stripe
```

#### 2.2 环境变量配置
创建 `.env` 文件：
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### 2.3 本地测试
```bash
npm run build
npm run serve
```

### 3. 生产部署

#### 3.1 Netlify 部署
1. 连接 GitHub 仓库
2. 配置构建设置：
   - Build command: `npm run build`
   - Publish directory: `public`
3. 添加环境变量
4. 启用 Netlify Functions

#### 3.2 Vercel 部署
1. 导入 GitHub 仓库
2. 配置环境变量
3. 部署项目

### 4. 生产环境配置

#### 4.1 Stripe 生产环境
1. 切换到生产模式
2. 更新 API 密钥
3. 配置生产 Webhook URL
4. 测试支付流程

#### 4.2 域名和 SSL
1. 配置自定义域名
2. 启用 SSL 证书
3. 更新 CORS 设置

## 🔧 故障排除

### 常见问题

#### 1. 认证问题
**问题**: 用户无法登录
**解决方案**:
- 检查 Supabase URL 和密钥配置
- 验证邮箱认证设置
- 查看浏览器控制台错误信息

#### 2. 支付问题
**问题**: 支付失败或无响应
**解决方案**:
- 验证 Stripe 密钥配置
- 检查 Webhook 端点配置
- 查看 Stripe 仪表板日志

#### 3. 内容解锁问题
**问题**: 付费用户无法看到完整内容
**解决方案**:
- 检查数据库购买记录
- 验证权限检查逻辑
- 确认 API 端点正常工作

#### 4. 样式问题
**问题**: 付费墙样式异常
**解决方案**:
- 检查 CSS 文件是否正确加载
- 验证 Sass 编译配置
- 清除浏览器缓存

### 调试工具

#### 1. 浏览器开发者工具
- 网络面板：检查 API 请求
- 控制台：查看 JavaScript 错误
- 应用面板：检查本地存储

#### 2. Supabase 仪表板
- 认证用户管理
- 数据库查询工具
- 实时日志查看

#### 3. Stripe 仪表板
- 支付事件日志
- Webhook 事件历史
- 测试模式切换

### 性能优化

#### 1. 代码分割
```typescript
// 动态导入支付组件
const PaymentModal = lazy(() => import('./Premium/PaymentModal'))
```

#### 2. 缓存策略
```typescript
// 缓存用户权限信息
const cacheUserPermissions = (userId: string, permissions: any) => {
  localStorage.setItem(`permissions_${userId}`, JSON.stringify({
    data: permissions,
    timestamp: Date.now()
  }))
}
```

#### 3. 图片优化
- 使用 WebP 格式
- 实现懒加载
- 压缩图片资源

## 📊 监控和分析

### 1. 用户行为分析
```typescript
// 跟踪付费转化率
const trackPaywallInteraction = (action: string, articleSlug: string) => {
  // 发送到分析服务
  analytics.track('paywall_interaction', {
    action,
    article_slug: articleSlug,
    timestamp: new Date().toISOString()
  })
}
```

### 2. 收入监控
- Stripe 仪表板收入报告
- 自定义收入分析脚本
- 月度/年度收入趋势

### 3. 错误监控
```typescript
// 错误上报
const reportError = (error: Error, context: any) => {
  console.error('Payment Error:', error)
  // 发送到错误监控服务
  errorReporting.captureException(error, { extra: context })
}
```

## 🔄 维护和更新

### 定期维护任务

#### 每周
- [ ] 检查支付状态和异常
- [ ] 监控用户反馈
- [ ] 更新内容和定价

#### 每月
- [ ] 分析收入和转化率
- [ ] 检查安全漏洞
- [ ] 备份数据库

#### 每季度
- [ ] 更新依赖包
- [ ] 性能优化
- [ ] 功能迭代规划

### 版本更新流程

1. **开发环境测试**
   - 功能测试
   - 兼容性测试
   - 性能测试

2. **预发布环境验证**
   - 端到端测试
   - 支付流程测试
   - 用户体验测试

3. **生产环境部署**
   - 灰度发布
   - 监控关键指标
   - 回滚准备

## 📞 技术支持和资源

### 官方文档
- [Quartz 文档](https://quartz.jzhao.xyz/)
- [Supabase 文档](https://supabase.com/docs)
- [Stripe 文档](https://stripe.com/docs)
- [Netlify 文档](https://docs.netlify.com/)

### 社区资源
- [Quartz Discord](https://discord.gg/cRFFHYye7t)
- [Supabase Discord](https://discord.supabase.com/)
- [Stripe 开发者社区](https://stripe.com/docs/development)

### 示例项目
- [GitHub 示例仓库](https://github.com/your-username/quartz-premium-example)
- [在线演示](https://quartz-premium-demo.netlify.app)

---

## 📋 总结

这个实现方案为 Quartz 提供了完整的付费文章功能，包括：

✅ **核心功能**
- 文章内容预览和付费解锁
- 用户认证和管理
- 支付处理和订阅管理
- 响应式用户界面

✅ **技术优势**
- 基于现有 Quartz 架构
- 最小化配置变更
- 使用成熟的第三方服务
- 良好的扩展性

✅ **商业价值**
- 低成本启动（免费额度充足）
- 灵活的定价策略
- 完整的用户体验
- 可持续的收入模式

通过分阶段实施，你可以逐步构建这个付费系统，每个阶段都有独立的价值，降低了实施风险。

---

*文档版本: v1.0*
*最后更新: 2025-01-28*
*作者: AI夜码人*