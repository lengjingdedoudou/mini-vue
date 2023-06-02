import { createApp } from './mini-vue/runtime-dom';
import { createVNode } from './mini-vue/runtime-core/vnode';
import './style.css';

createApp({
  data() {
    return { title: 1 };
  },
  render() {
    return createVNode('h1', null, [
      this.title.toString(),
      createVNode(
        'button',
        {
          events: {
            click: () => {
              this.title++;
            },
          },
        },
        ['+']
      ),
    ]);
  },
  mounted() {
    // setTimeout(() => {
    //   this.title = 'ffffffooopoo';
    // }, 2000);
  },
}).mount('#app');
