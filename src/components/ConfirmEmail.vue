<template>

</template>

<script>
  import {CONFIRM_EMAIL_REQUEST} from '../store/actions/auth'

  export default {
      name: "ConfirmEmail",
      mounted() {
        this.$store.dispatch(CONFIRM_EMAIL_REQUEST, this.$route.params.hash)
          .then(() => this.$router.push({ name: 'home', params: { isEmailConfirmed: true }}))
          .catch(() => this.$router.push({ name: 'welcome', params: { isEmailConfirmed: false }}))

      }
    }
</script>

<style scoped>

</style>
