<template>
<div class="home">
  <div class="nav">
    <a href="#" class="active">推荐</a>
    <a href="#">排行</a>
    <a href="#">歌单</a>
    <a href="#">主播电台</a>
    <a href="#">最新音乐</a>
  </div>
  <v-banner :banner="banner"></v-banner>
</div>
</template>

<script>
import vBanner from '@/components/common/banner/banner'
import api from '@/api/api'
export default {
  name: 'homeView',
  data() {
    return {
      banner: []
    }
  },
  props: {},
  components: {
    vBanner
  },
  mounted() {
    // this.loadBanner()
  },
  methods: {
    loadBanner() {
      const param = {}
      api.banner(param, (data) => {
        this.banner = data.banners
      })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./home.scss";
</style>
