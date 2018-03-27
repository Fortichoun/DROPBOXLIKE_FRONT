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
    <form enctype="multipart/form-data">
      <div>
        <input id="file" type="file" multiple @change="processFile"/>
        <label for="file">Choose file</label>
      </div>
      <button @click="uploadFiles()">Upload files</button>
    </form>
    <div v-if="uploadedFiles">
      <ul>
        <li v-for="file in uploadedFiles">
          <p>{{file.filename}}</p>
          <button @click="removeFile(file._id)">Remove file</button>
          <button @click="downloadFile(file._id, file.filename)">Download file</button>
        </li>
      </ul>
    </div>
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
      registerPassword: '',
      postFormData: new FormData(),
      uploadedFiles: []
    }
  },
  methods: {
    processFile(event) {
      for(const key in event.target.files){
        this.postFormData.append('file', event.target.files[key]);
      }
      // save it
      console.log( this.postFormData);
    },

    uploadFiles: function() {
      this.axios.post('http://localhost:9005/api/file/upload', this.postFormData)
        .then(response => {
        console.log(response);
        });
    },

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

    removeFile: function(fileId) {
      console.log(fileId);
      this.axios.post('http://localhost:9005/api/file/remove', { fileId: fileId })
        .then(response => {
        console.log(response.data);
        });
    },
    downloadFile: function(fileId, filename) {
      this.$http.post(
        'http://localhost:9005/api/file/download',
        {fileId: fileId},
        {responseType: 'arraybuffer'}
      )
        .then(function (response) {
        console.log(response);
        const blob = new Blob([response.data],{type:response.headers['content-type']});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      });
    },
  },


  mounted: function () {
    this.axios.get('http://localhost:9005/api/file/allFiles')
      .then(response => {
        this.uploadedFiles = response.data
      });
  }
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
