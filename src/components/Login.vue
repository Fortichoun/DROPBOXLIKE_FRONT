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
  </div>
</template>
<!--<script2 src="https://apis.google.com/js/platform.js?onload=renderButton"></script2>-->

<script>
  import {AUTH_REQUEST} from '../store/actions/auth'
  import { mapGetters } from 'vuex'
  import VueScript2 from 'vue-script2'
  import facebookLogin from 'facebook-login-vuejs';

  export default {
    name: 'Login',
    data () {
      return {
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
      ...mapGetters(['authStatus']),
      loading: function () {
        return this.authStatus === 'loading' && !this.isAuthenticated
      },
    },
    mounted: function () {
      const self = this;
      VueScript2.load('https://apis.google.com/js/platform.js').then(function () {
        self.renderButton();
      });
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
        console.log('loginform', this.loginForm);
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
      // auth: function (provider) {
      //     if (this.$auth.isAuthenticated()) {
      //       this.$auth.logout()
      //     }
      //
      //     var this_ = this;
      //     this.$auth.authenticate(provider).then(function (authResponse) {
      //       if (provider === 'google') {
      //         this.axios.get('https://www.googleapis.com/plus/v1/people/me/openIdConnect').then(function (response) {
      //           this_.response = response
      //         })
      //       }
      //     });
      //   },
      onSuccess(googleUser) {
        console.log('hello');
        console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
        console.log('Logged in as: ' + googleUser.getBasicProfile().getEmail());
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
        // if(gapi.auth2 && gapi.auth2.getAuthInstance()) {
        // }
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
  .loginContainer {
    height: 100%;
  }
  #my-signin2 {
    margin: 8% auto 3% auto;
    width: 300px;
  }

</style>
