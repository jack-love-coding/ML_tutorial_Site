import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { i18n, syncDocumentLanguage } from './i18n'
import { router } from './router'
import 'katex/dist/katex.min.css'
import './style.css'

const app = createApp(App)

app.use(createPinia())
app.use(i18n)
app.use(router)

syncDocumentLanguage()

router.isReady().then(() => {
  app.mount('#app')
})
