<script setup lang="ts">
import { onLaunch } from '@dcloudio/uni-app'
import { useThemeStore } from './store/theme'

onLaunch(() => {
  const themeStore = useThemeStore()
  themeStore.initTheme()
})
</script>

<style>
@import './theme/index.scss';
</style>
