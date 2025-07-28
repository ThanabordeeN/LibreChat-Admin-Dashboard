<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
// App component is now just a router outlet
// Layout components will be handled by the router
</script>

<style scoped>
#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>