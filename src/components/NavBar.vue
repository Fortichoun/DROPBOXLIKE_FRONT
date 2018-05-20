<template>
  <nav class="navbar has-shadow is-fixed-top">
    <div class="navbar-brand">
      <a class="navbar-item">
        <img
          src="../assets/supfiles.png"
          alt="SupFiles"
          class="logo"
        >
        <span class="appTitle">SupFiles</span>
      </a>
      <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false" @click="toggleBurger">
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <div
          v-if="$route.name === 'home'"
          class="navbar-item"
        >
          <div class="field is-grouped">
            <p class="control">
              <a
                class="button homeButton"
                @click="newFolder"
              >
                <span class="icon">
                  <icon name="plus-circle"/>
                </span>
                <span>
                  Create New Folder
                </span>
              </a>
              <a
                class="button homeButton"
                @click="chooseFile"
              >
                <span class="icon">
                  <icon name="upload"/>
                </span>
                <form
                  enctype="multipart/form-data"
                >
                  <input
                    id="uploadFile"
                    type="file"
                    multiple
                    @change="processFile"
                  />
                  <label for="uploadFile">Choose file</label>
                </form>
              </a>
            </p>
          </div>
        </div>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <div class="field is-grouped">
            <p class="control">
              <a
                v-if="!isUserConfirmed"
                class="button navButton"
                @click="openLoginModal"
              >
                <span class="icon">
                  <icon name="sign-in-alt"/>
                </span>
                <span>
                  Login
                </span>
              </a>
              <a
                v-if="isUserConfirmed"
                class="button navButton"
                @click="logout"
              >
                <span>
                  Logout
                </span>
                <span class="icon">
                  <icon name="sign-out-alt"/>
                </span>
              </a>
            </p>
            <p class="control">
              <a
                v-if="!isUserConfirmed"
                class="button navButton"
                @click="openRegisterModal"
              >
                <span class="icon">
                  <icon name="hand-point-right"/>
                </span>
                <span>Register</span>
              </a>
              <a
                v-if="isUserConfirmed"
                class="button navButton"
                @click="getHomePage"
              >
                <span>{{getUsername}}</span>
                <span class="icon">
                  <icon name="user"/>
                </span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
    <modal
      name="loginModal"
      width="60%"
      height="auto"
      :scrollable=true
      @before-close="beforeClose"
    >
      <Login/>
    </modal>
    <modal
      width="60%"
      height="auto"
      name="registerModal"
      :scrollable=true
      @before-close="beforeClose"
    >
      <Register/>
    </modal>
  </nav>
</template>

<script>
  import Login from './Login.vue'
  import Register from './Register.vue'
  import { mapGetters } from 'vuex'
  import {AUTH_LOGOUT} from '../store/actions/auth'

  export default {
    name: "NavBar",
    components: {
      Login,
      Register
    },
    computed: {
      ...mapGetters(['isAuthenticated', 'isEmailConfirmed', 'getProfile']),
      isUserConfirmed: function() {
        return this.isAuthenticated && this.isEmailConfirmed;
      },
      getUsername: function () {
        return this.getProfile.username;
      }
    },
    methods: {
      openLoginModal() {
        this.$modal.show('loginModal');
        console.log(this);
        // this.$modal.toggle('loginModal', {clickToClose: 'false'});

      },
      openRegisterModal() {
        this.$modal.show('registerModal');
      },
      logout() {
        this.googleSignOut();
        this.$store.dispatch(AUTH_LOGOUT).then(() => this.$router.push('/'))
      },
      getHomePage() {
        this.$router.push('/home')
      },
      newFolder() {
        this.$parent.createFolder();
      },
      processFile(event) {
        this.$parent.processFile(event);
      },
      chooseFile() {
        document.getElementById('uploadFile').click();
      },
      toggleBurger() {
        document.querySelector('.navbar-burger').classList.toggle('is-active');
        document.querySelector('.navbar-menu').classList.toggle('is-active');
      },
      googleSignOut() {
        if(gapi.auth2) {
          const auth2 = gapi.auth2.getAuthInstance();
          auth2.signOut().then(function () {
            console.log('User signed out.');
          });
        }
      },
      beforeClose(event) {
        console.log('username', this.getUsername);
        console.log('profile', this.getProfile);
        if (this.getProfile !== '' && this.getUsername === undefined) {
          event.stop();
          document.getElementsByTagName('html')[0].classList.add('v--modal-block-scroll');
          document.getElementsByTagName('body')[0].classList.add('v--modal-block-scroll');
          this.$notify({
            type: 'error',
            title: 'Error',
            text: 'Please tell us your username before quitting',
            duration: 5000,
          })
        } else {
          document.getElementsByTagName('html')[0].classList.remove('v--modal-block-scroll');
          document.getElementsByTagName('body')[0].classList.remove('v--modal-block-scroll');
        }
      }
    },
  }
</script>

<style scoped>
  .navButton {
    cursor: pointer;
    color: white;
    background-color: #41B883;
  }
  .homeButton {
    cursor: pointer;
    color: black;
    border: 2px solid #41B883;
  }
  .homeButton:hover {
    color: white;
    background-color: #41B883;
  }
  .navbar {
    position: fixed;
    width: 100%;
    z-index: 10000
  }
  .navbar-burger {
    height: auto;
  }
  .logo {
    height: 45px;
    max-height: 45px;
  }
  .appTitle {
    margin-left: 10px;
    font-size: x-large;
    font-family: "Bell MT";
    font-style: italic;
    color: grey
  }
  #uploadFile {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    position: absolute;
    z-index: -1;
  }
  #uploadFile + label {
    cursor: pointer;
  }

  .navbar-end {
    margin-left: 0;
  }

  .navbar-start {
    margin: auto;
  }
</style>
