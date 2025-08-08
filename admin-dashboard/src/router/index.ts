import { createRouter, createWebHistory, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';
import MainLayout from '../layouts/MainLayout.vue';
import Login from '../views/Login.vue';
import Users from '../views/Users.vue';
import Balance from '../views/Balance.vue';
import Banners from '../views/Banners.vue';
import CreateUser from '../views/CreateUser.vue';
import BanUser from '../views/BanUser.vue';
import UpdateBanner from '../views/UpdateBanner.vue';
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
      },
      {
        path: 'create-user',
        name: 'create-user',
        component: CreateUser,
      },
      {
        path: 'ban-user',
        name: 'ban-user',
        component: BanUser,
      },
      {
        path: 'update-banner',
        name: 'update-banner',
        component: UpdateBanner,
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
