<template>
  <div class="profileContainer">
    <vue-headful
      title="Update Profile"
      description="SupFiles"
    />
    <h1>My Profile</h1>
    <h2><icon name="envelope" scale="2" class="emailIcon"/>{{getProfile.email}}<span v-if="getProfile.isGoogle"> via Google authentication</span></h2>
    <form
      @submit.prevent="validateBeforeSubmit"
      class="form"
    >
      <div class="field">
        <label class="label">Username :</label>
        <div class="control">
          <input
            name="username"
            v-model="profileForm.username"
            v-validate="'required|min:3'"
            :class="{'is-danger': errors.has('username')}"
            class="input"
            type="text"
          >
        </div>
        <p
          class="help is-danger"
          v-show="errors.has('username')"
        >
          {{ errors.first('username') }}
        </p>
      </div>
      <div
        class="field"
        v-if="!getProfile.isGoogle"
      >
        <label class="label">New Password :</label>
        <div class="control">
          <input
            name="new password"
            v-model="profileForm.password"
            v-validate="'min:6'"
            :class="{'is-danger': errors.has('new password')}"
            class="input"
            type="password"
            placeholder="New password"
          >
        </div>
        <p
          class="help is-danger"
          v-show="errors.has('new password')"
        >
          {{ errors.first('new password') }}
        </p>
      </div>
      <div
        class="field"
        v-if="!getProfile.isGoogle"
      >
        <label class="label">Confirm new password :</label>
        <div class="control">
          <input
            name="password"
            v-model="profileForm.confirmPassword"
            v-validate="'confirmed:new password'"
            :class="{'is-danger': errors.has('password')}"
            class="input"
            type="password"
            placeholder="Confirm password"
          >
        </div>
        <p
          class="help is-danger"
          v-show="errors.has('password')"
        >
          {{ errors.first('password') }}
        </p>
        <p
          class="help is-danger"
          v-show="confirmError"
        >
          {{ confirmError }}
        </p>
      </div>
      <button
        class="button formButton"
        type="submit"
      >
        <span class="icon">
          <icon name="check"/>
        </span>
        <span>Change information</span>
      </button>
    </form>
    <br />
  </div>
</template>

<script>
  import {UPDATE_USER_REQUEST} from '../store/actions/auth'
  import { mapGetters } from 'vuex'

    export default {
      name: "Profile",
      data () {
        return {
          profileForm: {
            username: '',
            password: '',
            confirmPassword: '',
          },
        }
      },
      computed: {
        ...mapGetters(['authStatus', 'getProfile']),
        loading: function () {
          return this.authStatus === 'loading' && !this.isAuthenticated
        },
        confirmError: function () {
          return (this.profileForm.password && !this.profileForm.confirmPassword) ?  'The password confirmation does not match.' : ''
        }
      },
      methods: {
        validateBeforeSubmit() {
          this.$validator.validateAll().then((result) => {
            if (result) {
              if (!this.confirmError) {
                this.updateProfile();
              }
            }
          });
        },
        updateProfile() {
          const user = {
            username: this.profileForm.username,
            id: this.getProfile.id
          };
          this.profileForm.password ? user['password'] = this.profileForm.password : false;
          this.$store.dispatch(UPDATE_USER_REQUEST,
            user
          ).then(() => {
            this.$parent.$modal.hide('profileModal');
            this.$notify({
              type: 'success',
              title: '✓  Information successfully updated',
              duration: 4000,
            })
          });
        }
      },
      mounted() {
        this.profileForm.username = this.getProfile.username;
      }
    }
</script>

<style scoped>
  h1 {
    margin: 3% auto 3% auto;
    text-align: center;
    font-size: x-large;
  }
  h2 {
    text-align: center;
    font-size: large;
    margin: 3% auto 3% auto;
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
    margin-bottom: 8%;
    float: right;
    cursor: pointer;
    color: white;
    background-color: #41B883;
  }
  .profileContainer {
    width:100%;
    height:100%;
  }
  .emailIcon {
    vertical-align: middle;
    margin-right: 10px;
  }
</style>
