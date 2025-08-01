document.addEventListener("nav", () => {
  const wechatTriggers = document.querySelectorAll(".wechat-trigger") as NodeListOf<HTMLElement>
  const wechatModal = document.getElementById("wechat-modal") as HTMLElement
  const wechatClose = document.querySelector(".wechat-close") as HTMLButtonElement

  if (!wechatTriggers.length || !wechatModal || !wechatClose) {
    return
  }

  // 锁定body滚动
  const lockBodyScroll = () => {
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    document.body.setAttribute('data-scroll-y', scrollY.toString())
  }

  // 解锁body滚动
  const unlockBodyScroll = () => {
    const scrollY = document.body.getAttribute('data-scroll-y')
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
    document.body.removeAttribute('data-scroll-y')
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY))
    }
  }

  // 显示微信弹窗
  const showWechatModal = (e: Event) => {
    e.preventDefault()
    lockBodyScroll()
    wechatModal.style.display = "flex"
  }

  // 隐藏微信弹窗
  const hideWechatModal = (e: Event) => {
    e.preventDefault()
    unlockBodyScroll()
    wechatModal.style.display = "none"
  }

  // 点击空白处关闭弹窗
  const handleModalClick = (e: Event) => {
    if (e.target === wechatModal) {
      hideWechatModal(e)
    }
  }

  // 为所有微信触发器绑定事件监听器
  wechatTriggers.forEach(trigger => {
    trigger.addEventListener("click", showWechatModal)
  })

  wechatClose.addEventListener("click", hideWechatModal)
  wechatModal.addEventListener("click", handleModalClick)

  // 清理函数
  window.addCleanup(() => {
    wechatTriggers.forEach(trigger => {
      trigger.removeEventListener("click", showWechatModal)
    })
    wechatClose.removeEventListener("click", hideWechatModal)
    wechatModal.removeEventListener("click", handleModalClick)
  })
})
