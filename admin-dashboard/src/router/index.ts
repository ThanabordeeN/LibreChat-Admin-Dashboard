import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/Login.vue';
import Users from '../views/Users.vue';
import Balance from '../views/Balance.vue';
import Banners from '../views/Banners.vue';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'users',
        component: Users,
      },
      {
        path: 'balance',
        name: 'balance',
        component: Balance,
      },
      {
        path: 'banners',
        name: 'banners',
        component: Banners,
      }
    ],
    beforeEnter: (_to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
      const authStore = useAuthStore();
      if (!authStore.isAuthenticated) {
        next({ name: 'login' });
      } else {
        next();
      }
    },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
