<template>
  <div>
    <NavBar/>
    <section class="hero is-fullheight first-section">
      <div class="hero-body">
        <div class="first-container" data-aos="fade-up">
          <h1 class="first-section-title">
            SupFiles
            <p class="first-section-subtitle">Your new personal cloud</p>
          </h1>
          <img
            src="../assets/supfiles.png"
            alt="SupFiles"
            class="homeLogo"
          >
        </div>
      </div>
    </section>
    <section class="hero is-fullheight second-section">
      <div class="hero-body">
        <div class="second-container columns is-mobile is-multiline is-centered">
          <div class="bubble box column is-narrow" data-aos="fade-right" data-aos-duration="1500">
            <icon name="lock" scale="4"></icon>
            <p>Secure and private</p>
          </div>
          <div class="bubble box column is-narrow" data-aos="fade-up" data-aos-duration="1500">
            <icon name="fighter-jet" scale="5"></icon>
            <p>Fast and simple</p>
          </div>
          <div class="bubble box column is-narrow" data-aos="fade-left" data-aos-duration="1500">
            <icon name="globe" scale="4"></icon>
            <p>Your files, everywhere</p>
          </div>
        </div>
      </div>
    </section>
    <section class="hero is-fullheight third-section">
      <div class="hero-body">
        <div class="third-container">
          <h1 class="third-section-title">
            SupFiles allows you to keep all your files safe in one place.
          </h1>
          <h1 class="third-section-title">
            It's free and easy to use.
          </h1>
          <a
            class="button registerButton"
            @click="openRegisterModal"
          >
            <span class="icon">
              <icon name="hand-point-right"/>
            </span>
            <span>Register now</span>
          </a>
        </div>
      </div>
    </section>
    <notifications position="bottom right"/>
    <notifications
      position="bottom"
      group="localStorage"
      width="100%"
      classes="localStorage"
    >
      <template slot="body" slot-scope="props">
        <div class="custom-template">
          <div class="custom-template-content">
            <div class="custom-template-title">
              {{props.item.title}}
            </div>
            <div
              class="custom-template-text"
            >
              <span class="custom-template-warn">
                This website uses 'local storage' to give you the best, most relevant experience. Using this website means you're Ok with this.
                For more information, please visit <a target="_blank" href="http://web.archive.org/web/20130326235146/http://www.theeucookielaw.com/">this site</a>.
              </span>
              <span @click="props.close" class="custom-template-close"
              >
                <icon
                  name="times"
                  scale="2"
                />
              </span>
            </div>
          </div>
        </div>
      </template>
      <modal
        width="60%"
        height="auto"
        name="registerModal"
        :scrollable=true
      >
        <Register/>
      </modal>
    </notifications>
    <footer class="footer">
      <div class="container">
        <div class="content has-text-centered">
          <p>
            Copyright © 2018 <strong>SupFiles</strong>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
  import NavBar from './NavBar.vue'
  import {GETUSER_REQUEST} from '../store/actions/auth'
  import { mapGetters } from 'vuex'
  import Register from './Register.vue'

  export default {
    name: 'Welcome',
    components: {
      NavBar,
      Register,
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
      if(localStorage.getItem('popState') !== 'shown') {
        localStorage.setItem('popState','shown');
        this.$notify({
          group: 'localStorage',
          title: 'Important message',
          duration: -1,
        });
      }
    },
    methods: {
      openRegisterModal() {
        this.$modal.show('registerModal');
      },
    }
  }
</script>

<style>
  .custom-template {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    text-align: left;
    font-size: 13px;
    margin: 5px 5px 5px 5px;
    align-items: center;
    justify-content: center;
  }

  .custom-template > div {
    box-sizing: border-box;
    background: black;
    color: white;
    opacity: 0.6;
    border: 2px solid black;
  }

  .custom-template-text {
    display: flex;
    align-items: center;
    width: 100%
  }

  .custom-template-warn {
    width: 70%
  }

  .custom-template-close {
    font-size: 16px;
    opacity: 0.2;
    cursor: pointer;
    text-align: right;
    width: 30%
  }
  .custom-template-close:hover {
     opacity: 0.8;
   }
  .custom-template-content {
    padding: 10px;
    flex: 1 0 auto;
  }
  .custom-template-title {
    letter-spacing: 1px;
    text-transform: uppercase;
    font-size: 15px;
    font-weight: 600;
  }

  .first-section {
    background: rgba(255,255,255,1);
    background: -moz-linear-gradient(top, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 60%, rgba(65,185,131,1) 100%);
    background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(255,255,255,1)), color-stop(60%, rgba(245,245,245,1)), color-stop(100%, rgba(65,185,131,1)));
    background: -webkit-linear-gradient(top, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 60%, rgba(65,185,131,1) 100%);
    background: -o-linear-gradient(top, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 60%, rgba(65,185,131,1) 100%);
    background: -ms-linear-gradient(top, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 60%, rgba(65,185,131,1) 100%);
    background: linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(245,245,245,1) 60%, rgba(65,185,131,1) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#41b983', GradientType=0 );
  }

  .first-section-title {
    color: grey;
    font-size: 10vw;
    font-family: "Bell MT";
    font-style: italic;
  }

  .first-section-subtitle {
    font-size: 3vw;
  }

  .first-container {
    display: flex;
    align-items: center;
    margin: auto;
    height: 70%;
  }

  .homeLogo {
    margin-left: 10%;
    width: 35%;
  }

  .second-section {
    background-color: #41B883;
  }

  .second-container {
    display: flex;
    align-items: center;
    margin: 0 auto;
    height: 100%;
    width: 100%;
  }

  .bubble {
    border-radius: 50%;
    width: 350px;
    height: 350px;
    text-align: center;
    vertical-align: middle;
    margin: 0 auto;
    padding: 80px 0;
  }

  .bubble p {
    margin-top: 20px;
    font-size: 200%;
  }

  .third-section {

    background: rgba(65,184,130,1);
    background: -moz-linear-gradient(top, rgba(65,184,130,1) 0%, rgba(246,246,246,1) 21%, rgba(190,190,190,1) 100%);
    background: -webkit-gradient(left top, left bottom, color-stop(0%, rgba(65,184,130,1)), color-stop(21%, rgba(246,246,246,1)), color-stop(100%, rgba(190,190,190,1)));
    background: -webkit-linear-gradient(top, rgba(65,184,130,1) 0%, rgba(246,246,246,1) 21%, rgba(190,190,190,1) 100%);
    background: -o-linear-gradient(top, rgba(65,184,130,1) 0%, rgba(246,246,246,1) 21%, rgba(190,190,190,1) 100%);
    background: -ms-linear-gradient(top, rgba(65,184,130,1) 0%, rgba(246,246,246,1) 21%, rgba(190,190,190,1) 100%);
    background: linear-gradient(to bottom, rgba(65,184,130,1) 0%, rgba(246,246,246,1) 21%, rgba(190,190,190,1) 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#41b882', endColorstr='#bebebe', GradientType=0 );
  }

  .third-container {
    text-align: center;
    width: 100%;
  }

  .third-section-title {
    font-size: 2vw;
  }

  .registerButton {
    cursor: pointer;
    color: white;
    background-color: #41B883;
    width: 200px;
    height: 50px;
    margin-top: 50px
  }
  .footer {
    padding: 20px 0;
  }
</style>
