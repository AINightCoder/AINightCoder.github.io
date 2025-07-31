import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"
// @ts-ignore
import wechatScript from "./scripts/wechat.inline"
import { classNames } from "../util/lang"

const PersonalIntro: QuartzComponent = ({ displayClass }: QuartzComponentProps) => {
  return (
    <div class={classNames(displayClass, "personal-intro")}>
      <div class="intro-content">
        <p class="intro-main">🚀 全栈工程师 · AI应用开发 · 超级个体创业</p>
        <ul class="intro-list">
          <li>💻 白天写代码，晚上搞副业</li>
          <li>🤖 用AI做有趣又能赚钱的应用</li>
          <li>📈 Build in Public，记录真实创业旅程</li>
          <li>🎯 目标：实现5位数以上的持续性被动收入</li>
        </ul>
      </div>

      <div class="wechat-group-invite">
        <span class="wechat-group-link wechat-trigger">
          💬 点击加入社群
        </span>
      </div>

      <div class="social-links">
        <a href="https://github.com/AINightCoder" target="_blank" rel="noopener noreferrer" class="social-link" title="GitHub">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>

        <a href="https://twitter.com/AINightCoder" target="_blank" rel="noopener noreferrer" class="social-link" title="Twitter">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
          </svg>
        </a>

        <button
          class="social-link wechat-trigger"
          title="微信"
        >
            <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
                <g transform="scale(1.5)">
                <path d="M11.176 14.429c-2.665 0-4.826-1.8-4.826-4.018
                        0-2.22 2.159-4.02 4.824-4.02S16 8.191 16 10.411
                        c0 1.21-.65 2.301-1.666 3.036a.32.32 0 0 0-.12.366l.218.81
                        a.6.6 0 0 1 .029.117.166.166 0 0 1-.162.162.2.2 0 0 1-.092-.03
                        l-1.057-.61a.5.5 0 0 0-.256-.074.5.5 0 0 0-.142.021
                        5.7 5.7 0 0 1-1.576.22M9.064 9.542a.647.647 0 1 0
                        .557-1 .645.645 0 0 0-.646.647.6.6 0 0 0 .09.353Zm3.232.001
                        a.646.646 0 1 0 .546-1 .645.645 0 0 0-.644.644.63.63 0 0 0
                        .098.356"/>
                <path d="M0 6.826c0 1.455.781 2.765 2.001 3.656a.385.385 0 0 1
                        .143.439l-.161.6-.1.373a.5.5 0 0 0-.032.14.19.19 0 0 0
                        .193.193q.06 0 .111-.029l1.268-.733a.6.6 0 0 1
                        .308-.088q.088 0 .171.025a6.8 6.8 0 0 0 1.625.26
                        4.5 4.5 0 0 1-.177-1.251c0-2.936 2.785-5.02 5.824-5.02l.15.002
                        C10.587 3.429 8.392 2 5.796 2 2.596 2 0 4.16 0 6.826m4.632-1.555
                        a.77.77 0 1 1-1.54 0 .77.77 0 0 1 1.54 0m3.875 0a.77.77 0 1 1
                        -1.54 0 .77.77 0 0 1 1.54 0"/>
                </g>
            </svg>
        </button>

        {/* <a href="https://www.linkedin.com/in/ainightcoder" target="_blank" rel="noopener noreferrer" class="social-link" title="LinkedIn">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </a>

        <a href="https://www.youtube.com/@AINightCoder" target="_blank" rel="noopener noreferrer" class="social-link" title="YouTube">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </a>

        <a href="mailto:contact@ainightcoder.com" class="social-link" title="Email">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-.904.732-1.636 1.636-1.636h1.832l8.532 6.545 8.532-6.545h1.832c.904 0 1.636.732 1.636 1.636z"/>
          </svg>
        </a>

        <a href="https://blog.ainightcoder.com" target="_blank" rel="noopener noreferrer" class="social-link" title="Blog">
          <svg class="social-icon" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </a> */}
      </div>

      {/* 微信二维码弹窗 */}
      <div
        id="wechat-modal"
        class="wechat-modal"
      >
        <div class="wechat-modal-content">
          <button
            class="wechat-close"
          >
            ×
          </button>
          <h3>微信联系</h3>
          <img src="/static/wechat_qrcode.png" alt="微信二维码" class="wechat-qr" />
          <p>扫描二维码添加微信</p>
        </div>
      </div>
    </div>
  )
}

PersonalIntro.css = `
.personal-intro {
  margin: 0.5rem 0;
  padding: 0;
  background: transparent;
  border: none;
}

.intro-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}

.intro-emoji {
  font-size: 1.1rem;
}

.intro-title {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: var(--dark);
}

.intro-content {
  margin: 0;
}

.intro-main {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--secondary);
  margin: 0 0 0.6rem 0;
  line-height: 1.3;
}

.intro-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.intro-list li {
  font-size: 0.8rem;
  color: var(--darkgray);
  line-height: 1.4;
  margin: 0.25rem 0;
  padding-left: 0;
  position: relative;
}

/* 微信社群邀请样式 */
.wechat-group-invite {
  margin: 0.8rem 0;
  text-align: left;
}

.wechat-group-link {
  display: inline;
  color: var(--secondary);
  text-decoration: none;
  font-size: 0.8rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.wechat-group-link:hover {
  color: #07c160;
  border-bottom-color: #07c160;
}

.social-links {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid var(--lightgray);
  flex-wrap: wrap;
  align-items: center;
}

.social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--lightgray);
  color: var(--dark);
  text-decoration: none;
  transition: all 0.2s ease;
  position: relative;
  border: none;
  cursor: pointer;
}

.social-link:hover {
  background: var(--secondary);
  color: var(--light);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.social-icon {
  width: 1rem;
  height: 1rem;
  fill: currentColor;
}

/* 微信弹窗样式 */
.wechat-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  /* 确保弹窗始终在视口中央 */
  inset: 0;
}

.wechat-modal-content {
  background: var(--light);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 300px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.wechat-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--darkgray);
  transition: color 0.2s ease;
}

.wechat-close:hover {
  color: var(--dark);
}

.wechat-modal-content h3 {
  margin: 0 0 1rem 0;
  color: var(--dark);
  font-size: 1.2rem;
}

.wechat-qr {
  width: 200px;
  height: 200px;
  margin: 1rem 0;
  border-radius: 8px;
}

.wechat-modal-content p {
  margin: 1rem 0 0 0;
  color: var(--darkgray);
  font-size: 0.9rem;
}

/* 暗色主题优化 */
:root[saved-theme="dark"] .intro-title {
  color: var(--light);
}

:root[saved-theme="dark"] .intro-main {
  color: var(--secondary);
}

:root[saved-theme="dark"] .intro-list li {
  color: var(--lightgray);
}

/* 暗色主题微信社群邀请样式 */
:root[saved-theme="dark"] .wechat-group-link {
  color: var(--secondary);
}

:root[saved-theme="dark"] .wechat-group-link:hover {
  color: #07c160;
  border-bottom-color: #07c160;
}

:root[saved-theme="dark"] .social-links {
  border-top-color: var(--darkgray);
}

:root[saved-theme="dark"] .social-link {
  background: var(--darkgray);
  color: var(--lightgray);
}

:root[saved-theme="dark"] .social-link:hover {
  background: var(--secondary);
  color: var(--light);
}

/* 暗色主题微信弹窗样式 */
:root[saved-theme="dark"] .wechat-modal-content {
  background: var(--darkgray);
}

:root[saved-theme="dark"] .wechat-modal-content h3 {
  color: var(--light);
}

:root[saved-theme="dark"] .wechat-close {
  color: var(--lightgray);
}

:root[saved-theme="dark"] .wechat-close:hover {
  color: var(--light);
}

:root[saved-theme="dark"] .wechat-modal-content p {
  color: var(--lightgray);
}

/* 响应式优化 */
@media (max-width: 600px) {
  .personal-intro {
    margin: 0.4rem 0;
  }

  .intro-header {
    margin-bottom: 0.5rem;
  }

  .intro-main {
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
  }

  .intro-list li {
    font-size: 0.75rem;
    margin: 0.2rem 0;
  }

  /* 移动端微信社群邀请样式 */
  .wechat-group-invite {
    margin: 0.6rem 0;
  }

  .wechat-group-link {
    font-size: 0.75rem;
  }

  .social-links {
    gap: 0.6rem;
    margin-top: 0.8rem;
    padding-top: 0.6rem;
  }

  .social-link {
    width: 1.8rem;
    height: 1.8rem;
  }

  .social-icon {
    width: 0.9rem;
    height: 0.9rem;
  }

  /* 移动端微信弹窗优化 */
  .wechat-modal-content {
    width: 95%;
    max-width: 280px;
    padding: 1.5rem;
    margin: 1rem;
  }

  .wechat-qr {
    width: 180px;
    height: 180px;
  }
}
`

PersonalIntro.afterDOMLoaded = wechatScript

export default (() => PersonalIntro) satisfies QuartzComponentConstructor
