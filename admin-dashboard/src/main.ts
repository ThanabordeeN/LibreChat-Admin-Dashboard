import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import registerPrimeVue from './plugins/primevue';
// Import global Tailwind CSS (was missing, so utility classes didn't apply)
import './index.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
registerPrimeVue(app);

app.mount('#app');
