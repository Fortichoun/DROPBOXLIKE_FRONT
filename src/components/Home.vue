<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <form enctype="multipart/form-data">
      <div>
        <input
          id="file"
          type="file"
          multiple
          @change="processFile"
        >
        <label for="file">Choose file</label>
      </div>
      <button @click="uploadFiles()">Upload files</button>
    </form>
    <div v-if="uploadedFiles">
      <ul>
        <li
          v-for="file in uploadedFiles"
          :key="file.id"
        >
          <p>Name : {{ file.filename }}</p>
          <p>isDirectory ? : {{ file.isDirectory }}</p>
          <button @click="removeFile(file.filename)">Remove file</button>
          <button @click="downloadFile(file.filename)">Download file</button>
          <button
            v-if="file.isDirectory"
            @click="moveToFolder(file.filename)">
            Go to folder
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'Home',
    data () {
      return {
        msg: 'Home page',
        postFormData: new FormData(),
        uploadedFiles: [],
        path: this.$route.params.path || ''
      }
    },
    methods: {
      processFile(event) {
        for(const key in event.target.files){
          this.postFormData.append('file', event.target.files[key]);
        }
      },

      uploadFiles: function() {
        this.axios.post('http://localhost:9005/api/file/upload',
          this.postFormData,
          {params: {username: 'test', path: this.path}}
        );
      },

      removeFile: function(filename) {
        this.axios.post('http://localhost:9005/api/file/remove',
          {username: 'test', path: this.path, filename}
        );
      },

      downloadFile: function(filename) {
        this.$http.post(
          'http://localhost:9005/api/file/download',
          {username: 'test', path: this.path, filename},
          {responseType: 'arraybuffer'}
        )
          .then(function (response) {
            const blob = new Blob([response.data],{type:response.headers['content-type']});
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = filename;
            link.click();
          });
      },

      moveToFolder: function(folderName) {
        this.path = (!this.path) ? folderName : `${this.path}/${folderName}`;
        this.$router.push({ path: `/home/${this.path}` });
        this.axios.get('http://localhost:9005/api/file/allFiles',
          { params: { username: 'test', path: this.path } }
        )
          .then(response => {
            this.uploadedFiles = response.data
          });
      }
    },


    mounted: function () {
      this.axios.get('http://localhost:9005/api/file/allFiles',
        { params: { username: 'test', path: this.path } }
        )
        .then(response => {
            this.uploadedFiles = response.data;
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
