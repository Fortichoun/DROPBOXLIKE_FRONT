<template>
  <div class="loginContainer">
    <div>
      <vue-headful
        title="Login"
        description="SupFiles"
      />
      <div
        class="loading"
        :class="{'iconVisible': loading}"
      >
        <icon
          name="hourglass"
          spin
          class="loadingIcon"
        />
      </div>
      <h1>LOGIN</h1>
      <form
        @submit.prevent="validateBeforeSubmit"
        class="form"
      >
        <div class="field">
          <label class="label">Email :</label>
          <div class="control">
            <input
              name="email"
              v-model="loginForm.email"
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
          <label class="label">Password :</label>
          <div class="control">
            <input
              name="password"
              v-model="loginForm.password"
              v-validate="'required'"
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
          <span>Login</span>
        </button>
      </form>
      <br />

      <div id='my-signin2'/>
      <!--<facebook-login class="button"-->
        <!--appId="2223755347852016"-->
        <!--@login="getUserData"-->
        <!--@logout="onLogout"-->
        <!--@get-initial-status="getUserData">-->
      <!--</facebook-login>-->
      <!--<div class="fb-login-button" data-max-rows="1" data-size="large" data-button-type="login_with" data-show-faces="false" data-auto-logout-link="false" data-use-continue-as="true"></div>    <notifications position="bottom right"/>-->
    </div>
    <div class="usernameSlider">
      <h1>ONE LAST STEP !</h1>
      <div class="confirmationText">
        <p class="thanksText">Thanks you for registering to SupFiles !</p>
        <form @submit.prevent="saveUsername">
          <div class="field">
            <label class="label">Please let us know your username :</label>
            <div class="control has-icons-left">
              <input
                v-model="username"
                class="input is-success"
                type="text"
                placeholder="Username"
                :class="{'is-danger': username === '' && emptyUsername}"
              >
              <span class="icon is-small is-left">
              <icon name="user"></icon>
            </span>
              <p
                class="help is-danger"
                v-show="username === '' && emptyUsername"
              >
                Please enter a username
              </p>
            </div>
          </div>
          <button
            class="button usernameButton"
            type="submit"
          >
            Let's start !
          </button>
        </form>
      </div>
      <img
        src="../assets/supfiles-logo.png"
        alt="SupFiles"
        class="modalLogo"
      >
    </div>
  </div>
</template>

<script>
  import {AUTH_REQUEST, GOOGLE_AUTH_REQUEST, UPDATE_USERNAME_REQUEST} from '../store/actions/auth'
  import { mapGetters } from 'vuex'
  import facebookLogin from 'facebook-login-vuejs';

  export default {
    name: 'Login',
    data () {
      return {
        username: '',
        emptyUsername: false,
        loginForm: {
          email: '',
          password: '',
        },
      }
    },
    components: {
      facebookLogin
    },
    computed: {
      ...mapGetters(['authStatus', 'getProfile']),
      loading: function () {
        return this.authStatus === 'loading' && !this.isAuthenticated
      },
    },
    mounted: function () {
      this.googleSignOut();
      this.renderButton();

      // VueScript2.load('https://apis.google.com/js/platform.js').then(function () {
      // });
      // VueScript2.load('https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v3.0').then(function () {
        // FB.Event.subscribe('xfbml.render', function () {
        //   console.log("finished rendering plugins");
        //   var spinner = document.getElementById("spinner");
        //   spinner.removeAttribute("style");
        //   spinner.removeChild(spinner.childNodes[0]);
        // });
      // });
    },
    methods: {
      validateBeforeSubmit() {
        this.$validator.validateAll().then((result) => {
          if (result) {
            this.login();
          }
        });
      },

      login: function () {
        const { email, password } = this.loginForm;
        this.$store.dispatch(AUTH_REQUEST, { email, password }).then((resp) => {
          if(!resp.data.user.isEmailConfirmed) {
            this.$notify({
              type: 'error',
              title: 'Please confirm your email',
              text: 'Sorry, you can\'t login because your email is not confirmed',
            })
          }
          this.$router.push('/home')
        }).catch(() =>  this.$notify({
          type: 'error',
          title: 'Error',
          text: 'Invalid Credentials',
        }));
      },

      saveUsername() {
        if (this.username === '') {
          this.emptyUsername = true;
        }
        else {
          this.$store.dispatch(UPDATE_USERNAME_REQUEST, { username: this.username, id: this.getProfile.id }).then(() => {
            this.$router.push('/home')
          });
        }
      },

      onSuccess(googleUser) {
        console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
        console.log('Logged in as: ' + googleUser.getBasicProfile().getEmail());
        this.$store.dispatch(GOOGLE_AUTH_REQUEST, googleUser.getBasicProfile().getEmail()).then((resp) => {
          // console.log('hey', this.$parent.$modal.toggle('loginModal', {clickToClose: false}));
          if(!resp.data.user.username) {
            const slider = document.getElementsByClassName('usernameSlider')[0];
            slider.style.right = 0;
          } else {
            this.$router.push('/home')
          }
        }).catch(() =>  this.$notify({
            type: 'error',
            title: 'Error',
          text: 'Sorry, an error occurred, please retry',
        }))
      },
      onFailure(error) {
        console.log(error);
      },
      renderButton() {
        gapi.signin2.render('my-signin2', {
          'scope': 'profile email',
          'width': 300,
          'height': 50,
          'longtitle': true,
          'theme': 'dark',
          'onsuccess': this.onSuccess,
          'onfailure': this.onFailure
        });
      },
      googleSignOut() {
        if(gapi.auth2) {
          const auth2 = gapi.auth2.getAuthInstance();
          auth2.signOut().then(function () {
            console.log('User signed out.');
          });
        }
      }
    },
  }
  // var finished_rendering = function() {
  //   console.log("finished rendering plugins");
  //   var spinner = document.getElementById("spinner");
  //   spinner.removeAttribute("style");
  //   spinner.removeChild(spinner.childNodes[0]);
  // }
  // // window.onbeforeunload = function(e){
  // //   gapi.auth2.getAuthInstance().signOut().then(function () {
  // //     console.log('User signed out.');
  // //   });
  // // };
  // window.fbAsyncInit = function() {
  //   FB.init({
  //     appId      : '2223755347852016',
  //     cookie     : true,
  //     xfbml      : true,
  //     version    : 'v3.0'
  //   });
  //
  //   FB.AppEvents.logPageView();
  //
  //   FB.getLoginStatus(function(response) {
  //     statusChangeCallback(response);
  //   });
  // };
  //
  // (function(d, s, id){
  //   var js, fjs = d.getElementsByTagName(s)[0];
  //   if (d.getElementById(id)) {return;}
  //   js = d.createElement(s); js.id = id;
  //   js.src = "https://connect.facebook.net/en_US/sdk.js";
  //   fjs.parentNode.insertBefore(js, fjs);
  // }(document, 'script', 'facebook-jssdk'));
  //
  // function statusChangeCallback(response) {
  //   console.log('statusChangeCallback');
  //   console.log(response);
  //   // The response object is returned with a status field that lets the
  //   // app know the current login status of the person.
  //   // Full docs on the response object can be found in the documentation
  //   // for FB.getLoginStatus().
  //   if (response.status === 'connected') {
  //     // Logged into your app and Facebook.
  //     console.log('connected');
  //   } else {
  //     // The person is not logged into your app or we are unable to tell.
  //     console.log('please log in');
  //     // document.getElementById('status').innerHTML = 'Please log ' +
  //     //   'into this app.';
  //   }
  // }
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
  .usernameButton {
    cursor: pointer;
    color: white;
    background-color: #41B883;
  }
  .loginContainer {
    height: 100%;
  }
  #my-signin2 {
    margin: 8% auto 3% auto;
    width: 300px;
  }

  .usernameSlider {
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

  .thanksText {
    margin-bottom: 2%;
  }
  .usernameSlider h1 {
    font-size: x-large;
  }

  .confirmationText {
    width: 75%;
    margin: auto;
    font-size: large;
    text-align: left;
  }

  .modalLogo {
    margin-top: 5%;
    width: 70px;
  }
</style>
