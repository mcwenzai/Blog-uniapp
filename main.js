import Vue from 'vue'
import App from './App'
import uView from "uview-ui";
Vue.use(uView);
Vue.config.productionTip = false
// 工具类注册
import prototype from './utils/prototype'
Vue.use(prototype)

App.mpType = 'app'
const app = new Vue({
    ...App
})
app.$mount()