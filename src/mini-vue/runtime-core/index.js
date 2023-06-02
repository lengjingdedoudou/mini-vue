import { reactive, effect } from '../reactivity';
import { createVNode } from './vnode';

export function createRenderer(options) {
  const {
    querySelector: hostQuerySelector,
    createElement: hostCreateElement,
    setElementText: hostSetElementText,
    insert: hostInsert,
    clearElement: hostClearElement,
    addElementEventListener: hostAddElementEventListener,
  } = options;
  const render = (vnode, selectorOrContainer) => {
    let container = selectorOrContainer;
    if (typeof selectorOrContainer === 'string') {
      container = hostQuerySelector(selectorOrContainer);
    }
    // 如果存在vnode则为mount或patch
    if (vnode) {
      patch(container._vnode || null, vnode, container);
    }

    container._vnode = vnode;
  };

  const patch = (n1, n2, container) => {
    if (typeof n2.type === 'string') {
      processElement(n1, n2, container);
    } else {
      processComponent(n1, n2, container);
    }
  };

  const processElement = (n1, n2, container) => {
    if (n1 === null) {
      mountElement(n2, container);
    } else {
      // 更新操作
    }
  };

  const mountElement = (vnode, container) => {
    const el = (vnode.el = hostCreateElement(vnode.type));
    vnode.children.forEach((child) => {
      if (typeof child === 'string') {
        hostSetElementText(el, child);
      } else {
        patch(null, child, el);
      }
    });

    if (vnode.props) {
      if (vnode.props.events) {
        mountEvent(vnode);
      }
    }

    hostInsert(el, container);
  };

  const mountEvent = (vnode) => {
    Object.entries(vnode.props.events).forEach(([event, fn]) => {
      hostAddElementEventListener(vnode.el, event, fn);
    });
  };

  const processComponent = (n1, n2, container) => {
    if (n1 === null) {
      mountComponent(n2, container);
    }
  };

  // 挂载做三件事
  // 1.组件实例化
  // 2.状态初始化
  // 3.副作用安装
  const mountComponent = (initialVNode, container) => {
    const instance = {
      data: {},
      vnode: initialVNode,
      isMounted: false,
    };

    const { data: dataOptions } = instance.vnode.type;
    instance.data = reactive(dataOptions());

    // 安装副作用
    setupRenderEffect(instance, container);
  };

  const setupRenderEffect = (instance, container) => {
    const { render, mounted } = instance.vnode.type;
    const componentUpdateFn = () => {
      if (!instance.isMounted) {
        const vnode = render.call(instance.data);
        hostClearElement(container);
        patch(null, vnode, container);

        // 生命周期挂载钩子
        if (mounted) {
          mounted.call(instance.data);
          instance.isMounted = true;
        }
      } else {
        hostClearElement(container);
        const vnode = render.call(instance.data);
        patch(null, vnode, container);

        // const vnode = (instance.subtree = render.call(instance.data));
      }
    };

    effect(componentUpdateFn);
    // 初始化执行一次
    componentUpdateFn();
  };

  return {
    render,
    createApp: createAppAPI(render),
  };
}

function createAppAPI(render) {
  return function createApp(rootComponent) {
    const app = {
      mount(selector) {
        const vnode = createVNode(rootComponent);
        render(vnode, selector);
      },
    };
    return app;
  };
}
