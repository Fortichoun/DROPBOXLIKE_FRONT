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
    <h1>{{ currentFolder }}</h1>
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
          <th class="tdContext">Actions</th>
        </tr>
        <tr
          v-for="(file, key) in uploadedFiles"
          :key="key"
          :id="'row' + key"
          @click="handleClickOnRow($event, key, file)"
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
                <icon
                  v-if="file.isFolder"
                  name="folder"
                  class="fileListIcon"
                >
                </icon>
                <img
                  v-else-if="file.imageBuffer"
                  :src="'data:image/jpg;base64,' + file.imageBuffer"
                  class="fileListIcon"
                  v-viewer="{navbar: false, title: false, toolbar: false, hidden: true}"
                >
                <!--<img-->
                  <!--v-else-->
                  <!--src="../assets/fileIcon.png"-->
                  <!--class="fileListIcon"-->
                <!--&gt;-->
                <icon
                  v-else-if="file.isVideo"
                  name="video"
                  class="fileListIcon"
                >
                </icon>
                <icon
                  v-else
                  name="file"
                  class="fileListIcon"
                >
                </icon>
                <input
                  type="text"
                  :class="['input' + key, 'inputFields']"
                  :value="file.filename"
                  v-on-clickaway="($event) => awayFromInput($event, key, file.filename)"
                >
                <div class="filename">{{ file.filename }}</div>
              </drag>
            </drop>
          </td>
          <td class="tdContext">
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
                <!--<button-->
                  <!--class="contextMenu"-->
                  <!--@click="displayNav(key)"-->
                <!--&gt;-->
                  <!--<img-->
                    <!--class="contextMenuImg"-->
                    <!--src="../assets/contextMenu.png"-->
                  <!--&gt;-->
                <div @click="displayNav(key)">
                  <icon
                    name="ellipsis-h"
                    class="contextMenu"
                  >
                  </icon>
                </div>

                <!--</button>-->
                <nav
                  class="nav"
                  v-on-clickaway="($event) => away($event, key)"
                  @click="hideNav(key)"
                >
                  <ul>
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
                    <li><button
                      @click="removeFile(file.filename)"
                      class="navButton">
                      Remove file
                    </button></li>
                  </ul>
                </nav>
              </drag>
            </drop>
          </td>
        </tr>
      </table>
    </div>
    <modal
      :resizable=true
      :draggable=true
      :width="1280"
      name="videoModal"
      height="auto"
      :scrollable=true
      @opened="(event) => modalOpened(event, 'hello')"
    >
      <div class="videoContainer">
        <video id="videoPlayer" controls></video>
      </div>
    </modal>
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
        postFormData: new FormData(),
        uploadedFiles: [],
        path: this.$route.params.path || '',
        over: false,
        newFileNumber: -1,
        video: '',
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
      },
      currentFolder: function() {
          return  this.$route.fullPath.replace("%2F", "/").split('/').pop() || 'Home';
      }
    },

    methods: {
      // getVideoSource(filename) {
      //   this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/video',
      //     { params: { userFolder: this.userFolder, path: this.path, videoName: filename } }
      //   )
      //   .then(response => {
      //     console.log('videoResponse', response);
      //     console.log('videoResponsedata', response.data);
      //     this.video += response.data;
      //   });
      // },

      modalOpened(event, filename) {
        console.log('eventmodal', event);
        const source = document.createElement('source');
        const video = document.getElementById('videoPlayer');
        const modal = document.getElementsByClassName('v--modal')[0];
        // const video = document.createElement('video');
        // const modal = document.getElementById('videoModal');
        // console.log('modal', modal);
        // console.log('source', source);
        source.setAttribute('src', `${this.$backendPath}:${this.$backendPort}/api/file/video?userFolder=${this.userFolder}&path=${this.path}&videoName=${this.video}`);
        // video.setAttribute('controls', 'true');
        video.appendChild(source);
        // modal.appendChild(video);
        video.load();
      },

      handleClickOnRow(event, key, {filename, isFolder, imageBuffer, isVideo}) {
        console.log('eveeeeent', event);
        // console.log('eveeeeent.target.className', event.target.className);
        // console.log('eveeeeent.target.classList', event.target.classList);
        if (event.target.className !== 'contextMenu' &&
          event.target.className !== 'navButton' &&
          event.target.className !== 'nav' &&
          event.srcElement.nodeName !== 'svg' &&
          event.target.parentElement.nodeName !== 'svg'
        ) {
          if (isVideo) {
            this.video = filename;
            this.$modal.show('videoModal');
            console.log('video!!!');


            // this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/video',
            //   { params: { userFolder: this.userFolder, path: this.path, videoName: filename } }
            // )
            //   .then(response => {
            //     source.src += response.data;
            //   });
            // source.src = `${this.$backendPath}:${this.$backendPort}/api/file/video?userFolder=' + this.userFolder + '&path=' + this.path + '&videoName=' + 'Hello'
          }
          else if (imageBuffer) {
            this.displayPicture(key)
          } else {
            this.moveToFolder(event, filename, isFolder)
          }
        }
      },

      displayPicture(key) {
        const viewer = document.getElementById(`row${key}`).getElementsByClassName('fileListIcon')[0].$viewer;
        viewer.show()
      },

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
        this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/upload`,
          this.postFormData,
          {params: {userFolder: this.userFolder, path: this.path}}
        )
          .then(() => this.getFilesInCurrentFolder());
      },

//      uploadFiles: function() {
//        this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/upload',
//          this.postFormData,
//          {params: {userFolder: this.userFolder, path: this.path}}
//        );
//      },

      removeFile: function(filename) {
        this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/remove`,
          {userFolder: this.userFolder, path: this.path, filename}
        )
          .then(() => this.getFilesInCurrentFolder());
      },

      downloadFile: function(file) {
        //TODO TEST WITH AXIOS
        this.$http.post(
          `${this.$backendPath}:${this.$backendPort}/api/file/download`,
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

      moveToFolder: function(event, folderName, isFolder, self) {
          console.log('event', event);
          console.log('hello', this);
          console.log('isFolder', isFolder);
          if (isFolder &&
            event.target.className !== 'contextMenu' &&
            event.target.className !== 'navButton' &&
            event.target.className !== 'nav'
          ) {
            //TODO DECODE URL POUR LES ESPACES
//            const decodedFolderName = folderName.replace("%2F", "/");
            this.path = (!this.path) ? folderName : `${this.path}/${folderName}`;
            this.$router.push({ path: '/home/' + this.path.replace("%20", "-")});
            this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/allFiles`,
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
//        this.renameFile(inputNumber);
        this.newFileNumber = inputNumber;


//        this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/newFolder',
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
          this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/allFiles`,
            { params: { userFolder: this.userFolder, path: this.path } }
          )
            .then(response => {
              this.uploadedFiles = response.data;
            });
        }
        else if (!this.isProfileLoaded) {
          this.$store.dispatch(GETUSER_REQUEST).then(() => {
            this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/allFiles`,
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
        this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/folderSize`,
          { params: { userFolder: this.userFolder } }
        )
          .then(response => {
            console.log('response size', response);
          });
      },

      moveFile: function(sourceFile, destinationFile) {
        this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/move`,
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
        const fileExtension = inputToFocus.value.split('.').slice(1).join('.');
        let selectionRange = inputToFocus.value.length - fileExtension.length;
        if (fileExtension.length !== 0) selectionRange -= 1;
        inputToFocus.focus();
        inputToFocus.setSelectionRange(0, selectionRange);
        // inputToFocus.select();
        this.newFileNumber = -1;
//        this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/rename',
//          { userFolder: this.userFolder,
//            path: this.path,
//            filename,
//            newFileName: this.folderName
//          }
//        )
//          .then(() => this.getFilesInCurrentFolder());
      },

      displayNav: function(rowNumber) {
        console.log('hey');
        console.log('rowNumber', rowNumber);
        const clickedNav =  document.getElementById("row" + rowNumber).getElementsByClassName("nav")[0];
        console.log('clickedNav', clickedNav);
        // clickedNav.style.display = 'block';
        clickedNav.style.display = (window.getComputedStyle(clickedNav).display === "none") ? "block" : "none";
      },

      away: function (event, rowNumber) {
          if (event.target.className !== 'contextMenu' &&
            event.srcElement.nodeName !== 'svg' &&
            event.target.parentElement.nodeName !== 'svg') {
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
                  `${this.$backendPath}:${this.$backendPort}/api/file/newFolder`,
                  {userFolder: this.userFolder, path: this.path, folderName: input.value}
                )
                  .then(() => this.getFilesInCurrentFolder() );
              } else {
                this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/rename`,
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
      // console.log('fullpath', this.$route.fullPath);
      // const fullPath = this.$route.fullPath.replace("%2F", "/").split('/').pop();
      // console.log("route", fullPath);
      // const test = fullPath;
      // console.log("test", test);
      this.getFilesInCurrentFolder();
      this.getFolderTreePath();
    },

    updated: function() {
      if (this.newFileNumber !== -1) {
          this.renameFile(this.newFileNumber);
      }
    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
  }
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
    vertical-align: middle;
    width: 30px;
    height: 30px;
    color: dodgerblue;
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
    left:0;
    right:0;
    top: 47px;
    margin: auto;
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
    background-color: dodgerblue;
  }

  .contextMenu {
    /*position: relative;*/
    border: none;
    width: 30px;
    height: 30px;
    vertical-align: middle;
    /*margin: auto;*/
    /*margin-left: 5px;*/
    /*background-color: white;*/
  }

  /*.contextMenu > img {*/
    /*!*position: absolute;*!*/
    /*!*top: 50%;*!*/
    /*!*left: 50%;*!*/
    /*width: 20px;*/
    /*height: 20px;*/
    /*vertical-align: middle;*/
  /*}*/

  .contextMenu:hover {
    border: 2px solid dodgerblue;
    cursor: pointer;
    padding: 2px 6px;
    /*margin-left: 0;*/
  }
  .drop.over {
    border-color: #aaa;
    background: #ccc;
  }
  .drop {
    height: 100%;
    /*position: absolute;*/
    width: 100%;
    /*top: 0;*/
    /*left: 0;*/
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

  #fileList tr:hover {
    /*opacity: 0.5;*/
    /*color: black;*/
    background-color: grey;
  }

  #fileList tr:first-child:hover {
    /*opacity: 0.5;*/
    /*color: black;*/
    background-color: white;
    cursor: auto;
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
  #videoPlayer {
    margin: auto;
    /*vertical-align: middle;*/
  }
  .videoContainer {
    text-align: center;
    /*display: flex;*/
    /*align-items: center;*/
  }
  /*td > * {*/
    /*vertical-align : middle;*/
  /*}*/

  .filename {
    display: inline-block;
    vertical-align: middle;
  }
  .tdContext {
    text-align: center;
  }
</style>
