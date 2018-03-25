<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Login</h2>
    <form>
      <label for="loginEmail">Email : </label>
      <input v-model="loginEmail" type="email" id="loginEmail"/>
      <label for="loginPassword">Password : </label>
      <input v-model="loginPassword" type="password" id="loginPassword"/>
      <button @click="login()">Login</button>
    </form>
    <h2>Register</h2>
    <form>
      <label for="registerEmail">Email : </label>
      <input v-model="registerEmail" type="email" id="registerEmail"/>
      <label for="registerPassword">Password : </label>
      <input v-model="registerPassword" type="password" id="registerPassword"/>
      <button @click="register()">Register</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      msg: 'Welcome to SupFile !',
      loginEmail: '',
      loginPassword: '',
      registerEmail: '',
      registerPassword: ''
    }
  },
  methods: {
    login: function () {
      this.$auth.login({ email: this.loginEmail, password: this.loginPassword }).then(function () {
        console.log('hello');
      })
    },

    register: function () {
      const self = this;
      const user = {
        email: this.registerEmail,
        password: this.registerPassword,
        access_token: 'tmFvgF4emDrvCpXuE3bvIW6GKuUVBaBo',
      };

      if (this.$auth.isAuthenticated()) {
        this.$auth.logout()
      }

      this.$auth.register(user).then(function (response) {
        self.response = response;
        console.log('response : ', self.response);
      })
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
