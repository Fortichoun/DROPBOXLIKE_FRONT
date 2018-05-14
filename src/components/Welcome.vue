<template>
  <div>
    <NavBar/>
    <section class="hero is-success is-fullheight">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Full Height title
          </h1>
          <h2 class="subtitle">
            Full Height subtitle
          </h2>
        </div>
      </div>
    </section>
    <section class="hero is-danger is-fullheight">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Full Height title
          </h1>
          <h2 class="subtitle">
            Full Height subtitle
          </h2>
        </div>
      </div>
    </section>
    <section class="hero is-info is-fullheight">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            Full Height title
          </h1>
          <h2 class="subtitle">
            Full Height subtitle
          </h2>
        </div>
      </div>
    </section>
    <notifications position="bottom right"/>
  </div>
</template>

<script>
  import NavBar from './NavBar.vue'
  import {GETUSER_REQUEST} from '../store/actions/auth'
  import { mapGetters } from 'vuex'

  export default {
    name: 'Welcome',
    components: {
      NavBar,
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'isEmailConfirmed']),
    },
    mounted: function () {
      if(this.isAuthenticated) {
        this.$store.dispatch(GETUSER_REQUEST);
      }

      if(this.$route.params.isEmailConfirmed === false) {
        this.$notify({
          type: 'error',
          title: 'Error',
          text: 'Sorry, your link is not valid',
        })
      }
    },
  }
</script>

<style scoped>
</style>
