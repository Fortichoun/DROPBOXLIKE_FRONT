<template>
  <div class="registerContainer">
    <div>
      <h1>CREATE ACCOUNT</h1>
      <vue-headful
        title="Register"
        description="SupFiles"
      />
      <div
        class="loading"
        :class="{'iconVisible': loading}"
      >
        <icon
          v-if="loading"
          name="hourglass"
          spin
          class="loadingIcon"
        />
      </div>
      <form
        @submit.prevent="validateBeforeSubmit"
        class="form"
      >
        <div class="field">
          <label class="label">Email :</label>
          <div class="control">
            <input
              name="email"
              v-model="registerForm.email"
              v-validate="'required|email'"
              :class="{'is-danger': errors.has('email')}"
              class="input"
              type="text"
              placeholder="Address mail"
            >
          </div>
          <p
            class="help is-danger"
            v-show="errors.has('email')"
          >
            {{ errors.first('email') }}
          </p>
        </div>
        <div class="field">
          <label class="label">Username :</label>
          <div class="control">
            <input
              name="username"
              v-model="registerForm.username"
              v-validate="'required|min:3'"
              :class="{'is-danger': errors.has('username')}"
              class="input"
              type="text"
              placeholder="Username"
            >
          </div>
          <p
            class="help is-danger"
            v-show="errors.has('username')"
          >
            {{ errors.first('username') }}
          </p>
        </div>
        <div class="field">
          <label class="label">Password :</label>
          <div class="control">
            <input
              name="password"
              v-model="registerForm.password"
              v-validate="'required|min:6'"
              :class="{'is-danger': errors.has('password')}"
              class="input"
              type="password"
              placeholder="Password"
            >
          </div>
          <p
            class="help is-danger"
            v-show="errors.has('password')"
          >
            {{ errors.first('password') }}
          </p>
        </div>
        <button
          class="button formButton"
          type="submit"
        >
          <span class="icon">
            <icon name="check"/>
          </span>
          <span>Register</span>
        </button>
      </form>
      <notifications position="bottom right"/>
    </div>
    <div class="slider">
      <h1>ONE LAST STEP !</h1>
      <div class="confirmationText">
        <p>Thanks you for registering to SupFiles !</p>
        <p>We just sent you an email to <span class="email">{{registerForm.email}}</span>.</p>
        <p>Please confirm your email before you can use our services.</p>
      </div>
      <img
        src="../assets/supfiles-logo.png"
        alt="SupFiles"
        class="logo"
      >
    </div>
  </div>
</template>

<script>
  import {REGISTER_REQUEST} from '../store/actions/auth'
  import { mapGetters } from 'vuex'

  export default {
    name: 'Register',
    data () {
      return {
        registerForm: {
          email: '',
          username: '',
          password: '',
        },
      }
    },
    computed: {
      ...mapGetters(['authStatus']),
      loading: function () {
        return this.authStatus === 'loading' && !this.isAuthenticated
      },
    },
    methods: {
      validateBeforeSubmit() {
        this.$validator.validateAll().then((result) => {
          if (result) {
            this.register();
          }
        });
      },

      register: function () {
        const { email, username, password } = this.registerForm;
        const user = {
          email,
          password,
          username,
          access_token: 'tmFvgF4emDrvCpXuE3bvIW6GKuUVBaBo',
        };

        this.$store.dispatch(REGISTER_REQUEST, user).then((resp) => {
          const slider = document.getElementsByClassName('slider')[0];
          slider.style.right = 0;
          if(!resp.data.user.isEmailConfirmed) {

          }
          this.$router.push('/home')
        });
      },
    },
  }
</script>

<style scoped>
  h1 {
    margin: 3% auto 6% auto;
    text-align: center;
    font-size: x-large;
  }
  .loading {
    display: none;
    z-index: -100;
    width: 8%;
    height: 8%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .loadingIcon {
    width: 100%;
    height: 100%;
    color: grey;
  }
  .iconVisible {
    display: block;
    z-index: 100;
  }
  .form {
    width: 50%;
    margin: auto;
  }
  .field {
    width: 100%;
  }
  .formButton {
    float: right;
    cursor: pointer;
    color: white;
    background-color: #41B883;
  }
  .registerContainer {
    width:100%;
    height:100%;
    }
  .slider {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    right: -100%;
    background-color: white;
    color: black;
    transition:1s ease;
    text-align: center;
  }
  .slider h1 {
    font-size: x-large;
  }
  .confirmationText {
    width: 75%;
    margin: auto;
    font-size: large;
    text-align: left !important;
  }
  /*.registerContainer:hover .slider {*/
    /*right:0;*/
  /*}*/
  .logo {
    margin-top: 5%;
    width: 70px;
    height: 100px;
  }
  .email {
    color: #42b983;
  }
</style>
