import './assets/main.css'
import 'bulma' //not sure if this will work, gpt says import 'bulma/css/bulma.min.css'; but that seems wrong too
//might also have to do with assets/main

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
