

class Complie {
  constructor(el, vm) {

    this.$el = document.querySelector(el)
    this.$vm = vm

    // 编译
    if(this.$el) {
      // 转换内部内容为Fragment片段
      this.$fragment = this.node2Fragment(this.$el)
      // 执行编译
      this.compile(this.$fragment)
      // 将编译完的html结果追加至$el
      this.$el.appendChild(this.$fragment)
    }
  }

  node2Fragment(el) { // 将宿主片段的代码拿出来便利
    const frag = document.createDocumentFragment()
    let child;
    while(child = el.firstChild) {  // 将el的子元素搬家至frag中
      frag.appendChild(child)
    }
    return frag
  }

  compile(el) {
    const nodeChilds = el.childNodes
    Array.from(nodeChilds).forEach(nodeChild => { // 节点数组转换成数组
      if(this.isElement(nodeChild)) {
        const nodeAttrs = nodeChild.attributes // 获取元素属性
        Array.from(nodeAttrs).forEach(attr => { // 循环遍历元素属性值
          const attrName = attr.name // 属性名
          const attrVal = attr.value // 键值
          if(this.isDirective(attrName)) { // 是否是规则定义的属性
            const dir = attrName.substring(2)
            this[dir] && this[dir](nodeChild, this.$vm, attrVal) // 执行函数
          }
          if (this.isEvent(attrName)) { // 事件
            const dir = attrName.substring(1)
            this.event(nodeChild, this.$vm, dir, attrVal) // 执行函数
          }
        })
      } else if (this.isInterpolations(nodeChild)) { // 插值表达式
        this.compileText(nodeChild)
      }

      if (nodeChild.childNodes && nodeChild.childNodes.length > 0) { // 递归查找子元素
          this.compile(nodeChild)
      }
    })
  }

  compileText(node) {
    this.updata(node, this.$vm, RegExp.$1, 'text')
  }

  updata(node, vm, exp, dir) {
    const updataFn = this[dir + 'Updater'] // 匹配执行函数
    updataFn && updataFn(node, vm[exp]) // 初始化
    new Watcher(vm, exp, function (value) { // 收集依赖
      updataFn && updataFn(node, value)
    })
  }

  textUpdater(node, value) { // text
    node.textContent = value
  }

  modelUpdater(node, value) { // model
    node.value = value
  }

  htmlUpdater(node, value) { // html
    node.innerHTML = value
  }

  text(node, vm, exp) { // 替换
    node.textContent = vm[exp]
  }

  model(node, vm, exp) {
    this.updata(node, vm, exp, 'model')
    node.addEventListener('input', e => {
      vm[exp] = e.target.value
    })
  }

  html(node, vm, exp) {
    this.updata(node, vm, exp, 'html')
  }

  event(node, vm, dir, exp) {
    const fn = vm.$options.$methods && vm.$options.$methods[exp] // 事件函数
    console.log(dir)
    if(dir && exp) { // 绑定事件
      node.addEventListener(dir, fn.bind(vm))
    }
  }

  isEvent(attrName) { // 事件
    return attrName.indexOf('@') === 0
  }

  isDirective(attrName) { // 元素
    return attrName.indexOf('m-') === 0
  }

  isElement(node) { // 是否是元素节点
    return node.nodeType === 1
  }

  isInterpolations(node) { // 插值文本
    return node.nodeType === 3 && /\{\{(.*)\}\}/.test(node.textContent)
  }
}
