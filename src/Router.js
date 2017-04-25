import url from 'x-url'
import UrlRouter from 'url-router'
import view from './view'

class VueRouter {
  constructor({ routes, mode = 'history', base }) {
    this.mode = mode
    this.base = base
    this.routes = this._parseRoutes(routes)
    this.urlRouter = new UrlRouter(this.routes)
  }

  _parseRoutes(routes) {
    const parsed = []
    routes.forEach(route => {
      if (route.path) {
        parsed.push([route.path, route.component, { meta: route.meta, props: route.props, children: route.children, layout: null }])
      } else if (route.layout) {
        const rts = this._findRoutesInLayout(route.layout)
        if (rts) rts.forEach(r => parsed.push([r.path, r.component, { meta: r.meta, props: r.props, children: r.children, layout: route.layout }]))
      }
    })
    return parsed
  }

  _findRoutesInLayout(layout) {
    for (const name in layout) {
      const section = layout[name]
      if (section.constructor === Array) {
        return section
      } else if (section.children) {
        if (section.children.constructor === Array) {
          return section.children
        } else {
          const routes = this._findRoutesInLayout(section.children)
          if (routes) return routes
        }
      }
    }
  }

  resolve(_url) {
    _url = url.parse(_url)

    let pathname = _url.pathname

    // if (this.base)

    const _route = this.urlRouter.find(u.pathname)
    if (!_route) return false


    const route = {
      meta: _route.options.meta,
      params: _route.params,
      query: _url.query
    }
    const mainRouterView = {
      component: _route.result,
      props: _route.options.props,
      children: _route.options.children
    }

    if (_route.options.layout) {
      route = this._resolveLayout(_route.options.layout, mainRouterView)
    } else {
      route = this._resolveLayout({ default: mainRouterView })
    }
  }

  _resolveLayout(layout, mainRouterView, asyncComponents = []) {
    const result = {}

    for (const name in layout) {
      let routerView = layout[name]

      if (routerView.constructor === Array) routerView =  mainRouterView

      // create a clone
      routerView = {
        component: routerView.component,
        meta: routerView.meta,
        props: routerView.props,
        children: routerView.children
      }

      routerView.meta = routerView.meta()
      routerView.props = routerView.props()
      result[name] = routerView

      if (routerView.component.constructor !== Object) {
        asyncComponents.push(routerView)
      } else if (routerView.children) {
        this._resolveLayout(routerView.children, mainRouterView, asyncComponents)
      }
    }
  }

  static install(Vue) {
    Vue.component('router-view', view)
  }
}

export default VueRouter
