<template>
  <div>
    <NavBar/>
    <vue-headful
      :title="currentFolder"
      description="SupFiles"
    />
    <div class="body">
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
      <DropZone/>
      <ul class="treeFolder">
        <li
          v-for="folder in treeFolders"
          :key="folder.key"
          class="treePathButton"
        >
          <button @click="moveToFolderInTreePath(folder.folderPath)">{{ folder.folderName }}</button>
        </li>
      </ul>
      <div class="columns is-mobile is-multiline">
        <h1 class="currentFolder column is-8 is-offset-2">{{ currentFolder }}</h1>
        <radial-progress-bar
          class=""
          :diameter="200"
          :completed-steps="folderSize"
          :total-steps="30"
          :strokeWidth="25"
          :startColor="startColor"
          :stopColor="startColor"
        >
          <p>{{folderSize}} GB Free</p>
        </radial-progress-bar>
      </div>
      <div v-if="uploadedFiles.length !== 0">
        <table id="fileList">
          <tr>
            <th>File name</th>
            <th class="tdContext">Actions</th>
          </tr>
          <tr
            v-for="(file, key) in uploadedFiles"
            :key="key"
            :id="'row' + key"
            @click="($event) =>  handleClickOnRow($event, key, file)"
          >
            <td :class="{over: file.isFolder && over}">
              <drop
                class="drop"
                @drop="(data) => handleDrop(key, data)"
              >
                <drag
                  :transfer-data="file"
                  :image="require('../assets/file-plus-one.png')"
                  @dragstart="over = true"
                  @dragend="over = false"
                  class="height100"
                >
                  <icon
                    v-if="file.isFolder"
                    name="folder"
                    class="fileListIcon"
                  />
                  <img
                    v-else-if="file.imageBuffer"
                    :src="'data:image/jpg;base64,' + file.imageBuffer"
                    class="fileListIcon"
                    v-viewer="{navbar: false, title: false, toolbar: false, hidden: true}"
                  >
                  <icon
                    v-else-if="file.isVideo"
                    name="video"
                    class="fileListIcon"
                  />
                  <icon
                    v-else
                    name="file"
                    class="fileListIcon"
                  />
                    <input
                      type="text"
                      :class="['input' + key, 'inputFields']"
                      :value="file.filename"
                      v-click-outside="($event) => awayFromInput($event, key, file.filename)"
                    >
                  <div class="filename">{{ file.filename }}</div>
                  <span class="helper"></span>
                </drag>
              </drop>
            </td>
            <td :class="{tdContext: true, over: file.isFolder && over}">
              <drop
                class="drop"
                @drop="(data) => handleDrop(key, data)"
              >
                <drag
                  :transfer-data="file"
                  :image="require('../assets/file-plus-one.png')"
                  @dragstart="over = true"
                  @dragend="over = false"
                  class="height100"
                >
                  <div
                    @click="displayNav(key)"
                    class="height100"
                  >
                    <span class="helper"></span>
                    <icon
                      name="ellipsis-h"
                      class="contextMenu"
                    />
                  </div>
                  <nav
                    class="nav"
                    v-click-outside="($event) => away($event, key)"
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
                      <li><button
                        @click="createLink(file.filename)"
                        class="navButton">
                        Create a link
                      </button></li>
                    </ul>
                  </nav>
                </drag>
              </drop>
            </td>
          </tr>
        </table>
      </div>
      <div
        v-if="uploadedFiles.length === 0 && currentFolder !== 'SupFiles Home' && !loading"
        class="noFile"
      >
        There is currently no file in this folder.
      </div>
      <div
        v-if="uploadedFiles.length === 0 && currentFolder === 'SupFiles Home' && !loading"
        class="noFile"
      >
        <p>
          There is currently no file in your SupFiles' folder.
        </p>
        <p>
          You can now start to drop some files in this window !
        </p>
        <icon
          name="long-arrow-alt-down"
          scale="3"
          class="noFileIcon"
        />
      </div>
      <modal
        :width="1280"
        name="videoModal"
        height="auto"
        :scrollable=true
        @opened="modalOpened"
      >
        <div class="videoContainer">
          <video
            id="videoPlayer"
            controls
          />
        </div>
      </modal>
      <modal
        width="80%"
        height="auto"
        name="linkModal"
        :scrollable=true
      >
        <ShareLink :title="linkToShare"/>
      </modal>
      <notifications position="bottom right"/>
    </div>
  </div>
</template>

<script>
  import {AUTH_LOGOUT, GETUSER_REQUEST} from '../store/actions/auth'
  import { mapGetters } from 'vuex'
  import { mixin as clickaway } from 'vue-clickaway';
  import DropZone from './DropZone.vue'
  import NavBar from './NavBar.vue'
  import ShareLink from './ShareLink.vue'
  import { Drag, Drop } from 'vue-drag-drop';
  import ClickOutside from 'vue-click-outside'
  import download from 'downloadjs'
  import RadialProgressBar from 'vue-radial-progress'

  export default {
    name: 'Home',
    mixins: [ clickaway ],
    directives: {
      ClickOutside
    },
    data () {
      return {
        postFormData: new FormData(),
        uploadedFiles: [],
        path: this.$route.params.path || '',
        over: false,
        newFileNumber: -1,
        video: '',
        loading: false,
        linkToShare: '',
        folderSize: 0,
        startColor: '#42b983'
      }
    },
    components: {
      DropZone,
      Drag,
      Drop,
      NavBar,
      ShareLink,
      RadialProgressBar,
    },
    computed: {
      ...mapGetters(['isProfileLoaded', 'isAuthenticated', 'authStatus', 'getProfile']),
      // loading: function () {
      //   return this.authStatus === 'loading' && !this.isAuthenticated
      // },
      // isAuthenticated: function() {
      //   return this.isAuthenticated;
      // },
      userFolder: function() {
          return this.getProfile.folderName
      },
      treeFolders: function() {
          return this.getFolderTreePath();
      },
      currentFolder: function() {
          return  (this.$route.fullPath.replace("%2F", "/").split('/').pop() === 'home') ?
            'SupFiles Home' :
            this.$route.fullPath.replace("%2F", "/").split('/').pop();
      }
    },

    methods: {
      modalOpened() {
        const source = document.createElement('source');
        const video = document.getElementById('videoPlayer');
        source.setAttribute('src', `${this.$backendPath}:${this.$backendPort}/api/file/video?userFolder=${this.userFolder}&path=${this.path}&videoName=${this.video}`);
        video.appendChild(source);
        video.load();
      },

      handleClickOnRow(event, key, {filename, isFolder, imageBuffer, isVideo}) {
        if (event.target.className !== 'contextMenu' &&
          event.target.className !== 'navButton' &&
          event.target.className !== 'nav' &&
          event.target.nodeName !== 'svg' &&
          event.target.parentElement.nodeName !== 'svg'
        ) {
          if (isVideo) {
            this.video = filename;
            this.$modal.show('videoModal');
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
          this.moveFile(file.filename, destinationFile.filename)
        }
      },

      logout: function () {
        this.$store.dispatch(AUTH_LOGOUT).then(() => this.$router.push('/'))
      },

      processFile(event) {
        this.loading = true;
        let filesSizeToUpload = 0;
        for(const key in event.target.files){
          filesSizeToUpload += event.target.files[key].size || 0;
          this.postFormData.append('file', event.target.files[key]);

        }
        if(filesSizeToUpload  / 1024 / 1024 / 1024 < this.folderSize) {
          this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/upload`,
            this.postFormData,
            {params: {userFolder: this.userFolder, path: this.path}}
          )
            .then(() => this.getFilesInCurrentFolder());
        } else {
          this.loading = false;
          this.$notify({
            type: 'error',
            title: 'Size limit',
            text: 'Sorry, you can\'t store more than 30GB with this account.',
            duration: 8000,
          })
        }
      },

      removeFile: function(filename) {
        this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/remove`,
          {userFolder: this.userFolder, path: this.path, filename}
        )
          .then(() => this.getFilesInCurrentFolder());
      },

      downloadFile: function(file) {
        this.axios.post(
          `${this.$backendPath}:${this.$backendPort}/api/file/download`,
          { userFolder: this.userFolder,
            path: this.path,
            filename: file.filename,
            isFolder: file.isFolder,
          },
          {responseType: 'arraybuffer'}
        )
          .then(function (response) {
            let filename = file.filename;
            const blob = new Blob([response.data],{type:response.headers['content-type']});
            if (response.headers['content-type'] === 'application/zip') {
              filename += '.zip';
            }
            download(blob, filename);
          });
      },

      moveToFolder: function(event, folderName, isFolder) {
          console.log('eventMoveToFolder', event);
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
        this.uploadedFiles.push({ filename: '', isFolder: true });
        const inputNumber = this.uploadedFiles.length - 1;
        this.newFileNumber = inputNumber;
      },

      getFilesInCurrentFolder: function() {
        if (this.isProfileLoaded) {
          this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/allFiles`,
            { params: { userFolder: this.userFolder, path: this.path } }
          )
            .then(response => {
              this.uploadedFiles = response.data;
              this.getFolderSize();
            });
        }
        else if (!this.isProfileLoaded) {
          this.$store.dispatch(GETUSER_REQUEST).then(() => {
            this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/allFiles`,
              { params: { userFolder: this.userFolder, path: this.path } }
            )
              .then(response => {
                this.uploadedFiles = response.data;
                this.getFolderSize();
              });
          });
        }
        this.loading = false;
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
        this.getFilesInCurrentFolder();
        this.getFolderTreePath();
      },

      getFolderSize: function () {
        if (this.isProfileLoaded) {
          this.axios.get(`${this.$backendPath}:${this.$backendPort}/api/file/folderSize`,
            { params: { userFolder: this.userFolder } }
          )
            .then(response => {
              this.folderSize = Number((30 - (response.data.folderSize / 1024 / 1024 / 1024)).toFixed(2));
            });
        }
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
        const self = this;
        const inputToFocus = document.getElementsByClassName(`input${key}`)[0];
        inputToFocus.style.display = "block";
        inputToFocus.addEventListener("keyup", function(event) {
          if (event.key === "Enter") {
            console.log('uploadedFiles', self.uploadedFiles);
            self.awayFromInput(event, key, self.uploadedFiles[key].filename);
          }
        });
        const fileExtension = inputToFocus.value.split('.').slice(1).join('.');
        let selectionRange = inputToFocus.value.length - fileExtension.length;
        if (fileExtension.length !== 0) selectionRange -= 1;
        inputToFocus.focus();
        inputToFocus.setSelectionRange(0, selectionRange);
        this.newFileNumber = -1;
      },

      createLink: function(filename) {
        this.axios.post(
          `${this.$backendPath}:${this.$backendPort}/api/file/shared`,
          { userFolder: this.userFolder, path: this.path, filename }
        )
          .then((result) => {
            //TODO CREATE LINK TO SHARE
            this.linkToShare = `${this.$backendPath}:${this.$backendPort}/api/file/getSharedFile/${result.data.linkHash}`;
            this.$modal.show('linkModal');
            // return linkToShare;
          });
      },

      displayNav: function(rowNumber) {
        const clickedNav =  document.getElementById("row" + rowNumber).getElementsByClassName("nav")[0];
        const activeNav =  document.getElementsByClassName('activeNav');
        if (activeNav.length !== 0) {
          const nav = activeNav[0];
          if (!clickedNav.classList.contains('activeNav')) {
            nav.style.display = 'none';
          }
          nav.classList.remove('activeNav');
        }
        clickedNav.classList.add('activeNav');
        clickedNav.style.display = (window.getComputedStyle(clickedNav).display === "none") ? "block" : "none";
      },

      away: function (event, rowNumber) {
          if (event.target.className !== 'contextMenu' &&
            event.target.nodeName !== 'svg' &&
            event.target.parentElement.nodeName !== 'svg') {
            const clickedNav =  document.getElementById("row" + rowNumber).getElementsByClassName("nav")[0];
            if (window.getComputedStyle(clickedNav).display !== "none") {
              // clickedNav.classList.remove('activeNav');
              clickedNav.style.display = 'none';
            }
          }
      },

      awayFromInput: function (event, inputNumber, filename) {
        // console.log('eveeeent', event);
        // console.log('inputNumber', inputNumber);
        // console.log('filename', filename);
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
      this.loading = true;
      this.getFilesInCurrentFolder();
      this.getFolderTreePath();
      if(this.$route.params.isEmailConfirmed === true) {
        this.$notify({
          type: 'success',
          title: 'Welcome to SupFiles !',
          text: 'Thanks you for confirming your email, please enjoy using SupFiles',
          duration: 5000,
        })
      }
      document.getElementsByTagName('html')[0].classList.remove('v--modal-block-scroll');
      document.getElementsByTagName('body')[0].classList.remove('v--modal-block-scroll');
    },

    // created: function () {
    //   this.loading = true;
    // },
    updated: function() {
      if (this.newFileNumber !== -1) {
          this.renameFile(this.newFileNumber);
      }
    }
  }
</script>

<style>
  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
  }
</style>

<style scoped>
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
  #fileList td > * {
    vertical-align: middle;
    height: 100%;
  }
  #fileList {
    position: relative;
    /*z-index: 1;*/
    margin: 3% auto;
    width: 80%;
    border-collapse: collapse;
  }

  #fileList tr {
    text-align: left;
    position: relative;
    /*z-index: 1;*/
    /*height: 80px;*/
    border-top: 2px solid #42b983;
    border-bottom: 2px solid #42b983;
    cursor: pointer;
  }
  #fileList td, th {
    position: relative;
    height: 50px;
    width: 80%;
    vertical-align: middle;
    /*padding: 1.5% 0;*/
    /*padding: auto;*/
  }

  #fileList th, td:first-child {
    padding-left: 1%;
  }

  .fileListIcon {
    vertical-align: middle;
    width: 30px;
    height: 30px;
    color: dodgerblue;
  }

  #fileList tr:hover {
    /*opacity: 0.2;*/
    /*color: black;*/
    background-color: lightgray;
    /*border: 2px solid grey !important;*/
  }

  #fileList tr:hover .contextMenu {
    border: 2px solid lightgray;
  }

  #fileList tr:first-child:hover {
    /*opacity: 0.5;*/
    /*color: black;*/
    background-color: white;
    cursor: auto;
  }

  .noFile {
    text-align: center;
    margin-top: 10%;
    font-size: 200%;
    color: #42b983;
  }

  .noFileIcon {
    animation: float 1s ease-in-out infinite;
  }

  .tdContext {
    text-align: center;
    vertical-align: center;
  }

  .nav {
    box-shadow: 0 0 0 1px rgba(99, 114, 130, 0.16), 0 8px 16px rgba(27, 39, 51, 0.08);
    display: none;
    width: 200px;
    position: absolute;
    background-color: white;
    /*margin-left: 96px;*/
    /*margin-top: 3px;*/
    z-index: 9500;
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

  .nav > ul {
    border: 1px solid grey
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
    position: relative;
    border: 2px solid rgba(0, 0, 0, 0);
    width: 40px;
    height: 40px;
    vertical-align: middle;
    padding: 6px 2px;

    /*max-height: 100%;*/
    /*max-width: 100%;*/
    /*width: auto;*/
    /*height: 30px;*/
    /*position: absolute;*/
    /*top: 0;*/
    /*bottom: 0;*/
    /*left: 0;*/
    /*right: 0;*/
    /*margin: auto;*/


    /*padding-top: 10px;*/
    /*padding: 2px 6px;*/
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
  .helper {
    display: inline-block;
    height: 100%;
    vertical-align: middle;
  }

  .contextMenu:hover {
    border: 2px solid dodgerblue !important;
    cursor: pointer;
    width: 40px;
    height: 40px;
    /*height: 40px;*/
    /*width: 40px;*/
    /*padding: 2px 6px;*/
    /*margin-left: 0;*/
  }
  td.over{
    background-color: lightskyblue;
    cursor: grabbing !important;
  }
  .drop {
    height: 100%;
    /*position: absolute;*/
    width: 100%;
    /*top: 0;*/
    /*left: 0;*/
  }

  .inputFields {
    border: 2px solid grey;
    position: absolute;
    left: 49px;
    /*margin: auto;*/
    top: 10px;
    width: 80%;
    height: 60%;
    padding: 0 5px;
    display: none;
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
    margin-left: 5px;
  }
  .loading {
    z-index: -100;
    width: 15%;
    height: 15%;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .loadingIcon {
    width: 100%;
    height: 100%;
    color: dodgerblue;
  }
  .iconVisible {
    display: block;
    z-index: 100000;
  }
  .height100 {
    height: 100%;
  }
  .treeFolder {
    text-align: center;
  }

  .treePathButton::after {
    font-size: x-large;
    content: "   >"
  }

  .treePathButton:last-child::after {
    content: "";
  }

  .treePathButton button{
    font-size: x-large;
    margin-left: 3px;
    border: 1px solid white;
    background-color: white;
    display: inline-flex;
    align-items: flex-end;
  }

  .treePathButton button:hover{
    border: 1px solid #42b983;
    background-color: #42b983;
    color: white;
    cursor: pointer;
    border-radius: 15%;
  }

  .treePathButton {
    margin: 0;
  }

  .currentFolder {
    margin-top: 3%;
    font-size: 300%;
    text-align: center;
    /*width: 100%;*/
  }
  .body {
    padding-top: 6%;
  }

  @keyframes float {
    0% {
      transform: translatey(0px);
    }
    50% {
      transform: translatey(20px);
    }
    100% {
      transform: translatey(0px);
    }
  }

  .radial-progress-container {
    margin: 0 auto;
  }
</style>
