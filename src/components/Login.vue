<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <h2>Login</h2>
    <!--<form @submit="login">-->
    <label for="loginEmail">Email : </label>
    <input
      v-model="loginEmail"
      type="email"
      id="loginEmail"
    >
    <label for="loginPassword">Password : </label>
    <input
      v-model="loginPassword"
      type="password"
      id="loginPassword"
    >
    <button @click="login()">Login</button>
    <div id="errorMessage">
      {{ errorMessage }}
    </div>

    <!--</form>-->
    <h2>Register</h2>
    <!--<form>-->
    <label for="registerEmail">Email : </label>
    <input
      v-model="registerEmail"
      type="email"
      id="registerEmail"
    >
    <label for="registerPassword">Password : </label>
    <input
      v-model="registerPassword"
      type="password"
      id="registerPassword"
    >
    <button @click="register()">Register</button>
    <!--</form>-->
  </div>
</template>

<script>
  import {AUTH_REQUEST, REGISTER_REQUEST} from '../store/actions/auth'

  export default {
  name: 'Login',
  data () {
    return {
      msg: 'Welcome to SupFile !',
      loginEmail: '',
      loginPassword: '',
      registerEmail: '',
      registerPassword: '',
      errorMessage: '',
    }
  },
  methods: {
    login: function () {
      const { loginEmail, loginPassword } = this;
      this.$store.dispatch(AUTH_REQUEST, { loginEmail, loginPassword }).then(() => {
        this.$router.push('/home')
      });
//      const self = this;
//      this.$auth.login({ email: this.loginEmail, password: this.loginPassword })
//        .then(function (response) {
//        if(response.data.status === 'NOTFOUND') {
//          self.errorMessage = 'This account doesn\'t exist'
//        }
//        if(response.data.status === 'BADPASS') {
//          self.errorMessage = 'The password doesn\'t match the email'
//        }
//        if(response.data.user) {
//          self.$router.push('home');
//        }
//      });
    },

    register: function () {
//      const self = this;
      const user = {
        email: this.registerEmail,
        password: this.registerPassword,
        access_token: 'tmFvgF4emDrvCpXuE3bvIW6GKuUVBaBo',
      };

      this.$store.dispatch(REGISTER_REQUEST, user).then(() => {
        this.$router.push('/home')
      });

//      if (this.$auth.isAuthenticated()) {
//        this.$auth.logout()
//      }
//
//      this.$auth.register(user).then(function (response) {
//        self.response = response;
//        //eslint-disable-next-line
//        console.log('register');
//      })
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
#errorMessage {
  color: red;
}
</style>
