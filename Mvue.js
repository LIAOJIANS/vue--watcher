class Mvue {
  constructor(options) {
    this.$options = options
    this.$data = options.data
    this.$options.$methods = options.methods
    this.observer(this.$data) // 观察数据

    new Complie(options.el, this)

    if(options.create()) options.create.call(this)

  }

  observer(obj) {
    if(obj === null || typeof obj !== 'object') return
    Object.keys(obj).forEach(key => {
      this.defineProperty(obj, key, obj[key])
      this.poxryData(key)
    })
  }

  /*
  * 给元素添加数据，并且在数据发生变化的时候通知视图更新（双向绑定）
  *
  * */
  defineProperty(obj, key, val) {
    this.observer(val) // 递归监听子元素是否存在对象
    const dep = new Dep()
    Object.defineProperty(obj, key, {
      get() {
        Dep.target && dep.addDep(Dep.target)
        return val
      },
      set(newVal) {
        if(newVal === val) return
        val = newVal
        dep.notify() // 通知更新
      }
    })
  }

  /*
  * 代理数据使得能用this.xxx直接访问到this.$data.xxx
  *
  * */
  poxryData(key) {
    Object.defineProperty(this, key, {
      configurable: true,
      get() {
        return this.$data[key]
      },
      set(newValue) {
        this.$data[key] = newValue
      }
    })
  }
}

/*
* 用于收集依赖
* */

class Dep {
  constructor() {
    this.deps = [] // 依赖容器
  }

  addDep(dep) { // 收集当前实例
    this.deps.push(dep)
  }

  notify() {
    this.deps.forEach(dep => dep.update())
  }

}

/*
* 用于观察数据是否发生变化
*
* */
class Watcher {
  constructor(vm, key, cb) {
    this.vm = vm
    this.key = key
    this.cb = cb
    Dep.target = this
    this.vm[this.key] // 触发get, 进行依赖收集
    Dep.target = null
  }

  update() {
    this.cb.call(this.vm, this.vm[this.key])
  }
}
