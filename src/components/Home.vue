<template>
  <div class="hello">
    <DropZone/>
    <ul>
      <li
        v-for="folder in treeFolders"
        :key="folder.key"
        class="treePathButton"
      >
        <button @click="moveToFolderInTreePath(folder.folderPath)">{{ folder.folderName }}</button>
      </li>
    </ul>
    <button @click="logout">Logout</button>
    <h1>{{ msg }}</h1>
    <button @click="createFolder()">Create New Folder</button>
    <form
      enctype="multipart/form-data"
      class="uploadForm"
    >
      <div>
        <input
          id="uploadFile"
          type="file"
          multiple
          @change="processFile"
        >
        <label for="uploadFile">Choose file</label>
      </div>
    </form>
    <div v-if="uploadedFiles">
      <table id="fileList">
        <tr>
          <th>File name</th>
          <th>Actions</th>
        </tr>
        <tr
          v-for="(file, key) in uploadedFiles"
          :key="key"
          :id="'row' + key"
          @click="moveToFolder($event, file.filename, file.isFolder)"
        >
          <td>
            <drop
              class="drop"
              :class="{ over: file.isFolder && over }"
              @drop="(data) => handleDrop(key, data)"
            >
              <drag
                :transfer-data="file"
                :image="require('../assets/folderIcon.png')"
                @dragstart="over = true"
                @dragend="over = false"
              >
                <img
                  v-if="file.isFolder"
                  src="../assets/folderIcon.png"
                  class="fileListIcon"
                >
                <img
                  v-else=""
                  src="../assets/fileIcon.png"
                  class="fileListIcon"
                >
                {{ file.filename }}
                <input
                  type="text"
                  :class="['input' + key, 'inputFields']"
                  :value="file.filename"
                  v-on-clickaway="($event) => awayFromInput($event, key, file.filename)"
                >
              </drag>
            </drop>
          </td>
          <td>
            <drop
              class="drop"
              :class="{over: file.isFolder && over}"
              @drop="(data) => handleDrop(key, data)"
            >
              <drag
                :transfer-data="file"
                :image="require('../assets/folderIcon.png')"
                @dragstart="over = true"
                @dragend="over = false"
              >
                <button
                  class="contextMenu"
                  @click="displayNav(key)"
                >
                  <img
                    class="contextMenuImg"
                    src="../assets/contextMenu.png"
                  >
                </button>
                <nav
                  class="nav"
                  v-on-clickaway="($event) => away($event, key)"
                  @click="hideNav(key)"
                >
                  <ul>
                    <li><button
                      @click="removeFile(file.filename)"
                      class="navButton">
                      Remove file
                    </button></li>
                    <li><button
                      @click="downloadFile(file)"
                      class="navButton">
                      Download file
                    </button></li>
                    <li><button
                      @click="renameFile(key)"
                      class="navButton">
                      Rename File
                    </button></li>
                  </ul>
                </nav>
              </drag>
            </drop>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import {AUTH_LOGOUT, GETUSER_REQUEST} from '../store/actions/auth'
  import { mapGetters } from 'vuex'
  import { mixin as clickaway } from 'vue-clickaway';
  import DropZone from './DropZone.vue'
  import { Drag, Drop } from 'vue-drag-drop';

  export default {
    name: 'Home',
    mixins: [ clickaway ],
    data () {
      return {
        msg: 'Home page',
        postFormData: new FormData(),
        uploadedFiles: [],
        path: this.$route.params.path || '',
//        folderName: '',
        over: false,
        newFileNumber: -1,
      }
    },
    components: {
      DropZone,
      Drag,
      Drop
    },
    computed: {
      ...mapGetters(['isProfileLoaded', 'authStatus', 'getProfile']),
      loading: function () {
        return this.authStatus === 'loading' && !this.isAuthenticated
      },
      userFolder: function() {
          return this.getProfile.folderName
      },
      treeFolders: function() {
          return this.getFolderTreePath();
      }
    },

    methods: {
      handleDrop(key, file) {
        this.over = false;
        const destinationFile = this.uploadedFiles[key];
        if(destinationFile.isFolder)  {
          console.log('you dropped on folder :', this.uploadedFiles[key]);
          console.log('you dropped file', file);
          this.moveFile(file.filename, destinationFile.filename)
        }
        console.log('key', key);
      },

      logout: function () {
        this.$store.dispatch(AUTH_LOGOUT).then(() => this.$router.push('/'))
      },

      processFile(event) {
        for(const key in event.target.files){
          this.postFormData.append('file', event.target.files[key]);
        }
        this.axios.post('http://localhost:9005/api/file/upload',
          this.postFormData,
          {params: {userFolder: this.userFolder, path: this.path}}
        )
          .then(() => this.getFilesInCurrentFolder());
      },

//      uploadFiles: function() {
//        this.axios.post('http://localhost:9005/api/file/upload',
//          this.postFormData,
//          {params: {userFolder: this.userFolder, path: this.path}}
//        );
//      },

      removeFile: function(filename) {
        this.axios.post('http://localhost:9005/api/file/remove',
          {userFolder: this.userFolder, path: this.path, filename}
        )
          .then(() => this.getFilesInCurrentFolder());
      },

      downloadFile: function(file) {
        this.$http.post(
          'http://localhost:9005/api/file/download',
          { userFolder: this.userFolder,
            path: this.path,
            filename: file.filename,
            isFolder: file.isFolder,
          },
          {responseType: 'arraybuffer'}
        )
          .then(function (response) {
            const blob = new Blob([response.data],{type:response.headers['content-type']});
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = file.filename;
            link.click();
          });
      },

      moveToFolder: function(event, folderName, isFolder) {
          console.log('event', event);
          console.log('hello');
          console.log('isFolder', isFolder);
          if (isFolder &&
            event.target.className !== 'contextMenuImg' &&
            event.target.className !== 'contextMenu' &&
            event.target.className !== 'navButton' &&
            event.target.className !== 'nav'
          ) {
            //TODO DECODE URL POUR LES ESPACES
//            const decodedFolderName = folderName.replace("%2F", "/");
            this.path = (!this.path) ? folderName : `${this.path}/${folderName}`;
            this.$router.push({ path: '/home/' + this.path.replace("%20", "-")});
            this.axios.get('http://localhost:9005/api/file/allFiles',
              { params: { userFolder: this.userFolder, path: this.path } }
            )
              .then(response => {
                this.getFolderTreePath();
                return this.uploadedFiles = response.data
              });
          }
      },

      createFolder: function() {
        console.log('uploadedFiles', this.uploadedFiles);
        this.uploadedFiles.push({ filename: '', isFolder: true });
        const inputNumber = this.uploadedFiles.length - 1;
        console.log('inputNumber', inputNumber);
        console.log('hey', document.getElementsByClassName('inputFields'));
//        this.renameFile(inputNumber);
        this.newFileNumber = inputNumber;


//        this.axios.post('http://localhost:9005/api/file/newFolder',
//          {userFolder: this.userFolder, path: this.path, folderName: this.folderName}
//        )
//          .then(() => {
//            this.folderName = '';
//            this.getFolderTreePath();
//            return this.getFilesInCurrentFolder();
//          });
      },

      getFilesInCurrentFolder: function() {
        if (this.isProfileLoaded) {
          this.axios.get('http://localhost:9005/api/file/allFiles',
            { params: { userFolder: this.userFolder, path: this.path } }
          )
            .then(response => {
              this.uploadedFiles = response.data;
            });
        }
        else if (!this.isProfileLoaded) {
          this.$store.dispatch(GETUSER_REQUEST).then(() => {
            this.axios.get('http://localhost:9005/api/file/allFiles',
              { params: { userFolder: this.userFolder, path: this.path } }
            )
              .then(response => {
                this.uploadedFiles = response.data;
              });
          });
        }
      },

      getFolderTreePath: function() {
          const fullPath = this.$route.fullPath.replace("%2F", "/");
          let treeFolders = fullPath.split('/').slice(1, -1);
//          let treeFolders = this.$route.fullPath.split('/').slice(1, -1);
          console.log('this.$route.fullPath', this.$route.fullPath);
          console.log('treeFolders', treeFolders);
          const foldersEnhanced = [];
          treeFolders.forEach((folder, index) => {
            foldersEnhanced.push({
              key: index,
              folderName: folder,
              folderPath: fullPath.split('/').slice(2, ( -1 * treeFolders.length) + index).join('/')
            });
          });
        return foldersEnhanced;
      },

      moveToFolderInTreePath: function(folderPath) {
        this.path = folderPath;
        this.path === '' ?
          this.$router.push({ name: 'home' }) :
          this.$router.push({ path: '/home/' + this.path.replace("%2F", "/")});
//          this.$router.push({ name: 'home', params: { path: this.path.replace("%2F", "/") } });
        this.getFilesInCurrentFolder();
        this.getFolderTreePath();
      },

      getFolderSize: function () {
        this.axios.get('http://localhost:9005/api/file/folderSize',
          { params: { userFolder: this.userFolder } }
        )
          .then(response => {
            console.log('response size', response);
          });
      },

      moveFile: function(sourceFile, destinationFile) {
        this.axios.post('http://localhost:9005/api/file/move',
          {
            userFolder: this.userFolder,
            path: this.path,
            sourceFile,
            destinationFile
          }
        )
          .then(() => this.getFilesInCurrentFolder());
      },

      renameFile: function(key) {
        const inputToFocus = document.getElementsByClassName(`input${key}`)[0];
        inputToFocus.style.display = "block";
        inputToFocus.focus();
        inputToFocus.select();
        this.newFileNumber = -1;
//        this.axios.post('http://localhost:9005/api/file/rename',
//          { userFolder: this.userFolder,
//            path: this.path,
//            filename,
//            newFileName: this.folderName
//          }
//        )
//          .then(() => this.getFilesInCurrentFolder());
      },

      displayNav: function(rowNumber) {
        const clickedNav =  document.getElementById("row" + rowNumber).getElementsByClassName("nav")[0];
        clickedNav.style.display = (window.getComputedStyle(clickedNav).display === "none") ? "block" : "none";
      },

      away: function (event, rowNumber) {
          if (!(event.target.className === 'contextMenuImg' || event.target.className === 'contextMenu')) {
            const clickedNav =  document.getElementById("row" + rowNumber).getElementsByClassName("nav")[0];
            if (window.getComputedStyle(clickedNav).display !== "none") {
              clickedNav.style.display = 'none';
            }
          }
      },

      awayFromInput: function (event, inputNumber, filename) {
        if (event.target.className !== 'navButton') {
          const input = document.getElementsByClassName(`input${inputNumber}`)[0];
          if (window.getComputedStyle(input).display !== "none") {
            input.style.display = 'none';
            if (input.value === '') {
              this.getFilesInCurrentFolder();
            } else {
              if (filename === '') {
                this.axios.post(
                  'http://localhost:9005/api/file/newFolder',
                  {userFolder: this.userFolder, path: this.path, folderName: input.value}
                )
                  .then(() => this.getFilesInCurrentFolder() );
              } else {
                this.axios.post('http://localhost:9005/api/file/rename',
                  { userFolder: this.userFolder,
                    path: this.path,
                    filename,
                    newFileName: input.value
                  }
                )
                  .then(() => this.getFilesInCurrentFolder());
              }
            }
          }
        }
      },

      hideNav: function (rowNumber) {
        const clickedNav =  document.getElementById("row" + rowNumber).getElementsByClassName("nav")[0];
          clickedNav.style.display = 'none';
      }
    },

    mounted: function () {
      this.getFilesInCurrentFolder();
      this.getFolderTreePath();
    },

    updated: function() {
      console.log('updated', this.uploadedFiles);
      if (this.newFileNumber !== -1) {
          this.renameFile(this.newFileNumber);
      }
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
  #fileList {
    position: relative;
    /*z-index: 1;*/
    margin: auto;
    width: 80%;
    border-collapse: collapse;
  }

  #fileList tr {
    text-align: left;
    position: relative;
    /*z-index: 1;*/
    height: 50px;
    border-top: 3px solid black;
    border-bottom: 3px solid black;
    cursor: pointer;
  }
  #fileList td {
    position: relative;
  }

  .fileListIcon {
    width: 30px;
    height: 30px;
  }

  .nav {
    box-shadow: 0 0 0 1px rgba(99, 114, 130, 0.16), 0 8px 16px rgba(27, 39, 51, 0.08);
    display: none;
    width: 200px;
    /*border: 2px solid black;*/
    position: absolute;
    background-color: white;
    /*margin-left: 96px;*/
    /*margin-top: 3px;*/
    z-index: 1;
  }

  /*.nav.active  {*/
    /*display: none;*/
  /*}*/

  .nav > ul > li {
    height: 40px;
    margin: 2px 0;
    width: 100%;
  }

  /*.nav > ul > li:hover {*/
    /*background-color: lightskyblue;*/
  /*}*/

  .nav button {
    border: none;
    background-color: white;
    width: 100%;
    height: 100%;
    padding: 0;
    cursor: pointer;
  }

  .nav button:hover {
    background-color: lightskyblue;
  }

  .contextMenu {
    /*position: relative;*/
    border: none;
    width: 40px;
    height: 40px;
    background-color: white;
  }

  .contextMenu > img {
    /*position: absolute;*/
    /*top: 50%;*/
    /*left: 50%;*/
    width: 20px;
    height: 20px;
    vertical-align: middle;
  }

  .contextMenu:hover {
    border: 2px solid lightblue;
    cursor: pointer;
    padding: 5px;
  }
  .drop.over {
    border-color: #aaa;
    background: #ccc;
  }
  .drop {
    height: 100%;
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
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
    font-size: 1.25em;
    font-weight: 700;
    /*color: white;*/
    /*background-color: black;*/
    display: inline-block;
    cursor: pointer;
  }

  #uploadFile:focus + label,
  #uploadFile + label:hover {
    background-color: lightcyan;
  }

  .inputFields {
    border: cyan solid 3px;
    position: absolute;
    left: 30px;
    /*margin: auto;*/
    top: 5px;
    width: 80%;
    height: 60%;
    padding: 0 5px;
    display: none;
  }

  .treePathButton::after {
    content: "   >"
  }

  .treePathButton:last-child::after {
    content: "";
  }

  .treePathButton button{
    border: none;
    background-color: white;
    cursor: pointer;
    /*padding-right: 6px;*/
    font-size: 20px;
  }

  .treePathButton {
    margin: 0;
  }
</style>
