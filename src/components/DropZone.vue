<template>
  <div id="container">
    <form
      enctype="multipart/form-data"
      novalidate
      id="form"
    >
      <div class="dropbox">
        <input
          type="file"
          onclick="return false;"
          multiple
          :name="uploadFieldName"
          :disabled="isSaving"
          @change="filesChange($event.target.name, $event.target.files); fileCount = $event.target.files.length"
          class="input-file"
          title="You can drop files here"
        >
        <p v-if="isSaving">
          Uploading {{ fileCount }} files...
        </p>
      </div>
    </form>
  </div>
</template>


<script>

const STATUS_INITIAL = 0, STATUS_SAVING = 1, STATUS_SUCCESS = 2, STATUS_FAILED = 3;

export default {
  name: 'DropZone',
  data() {
    return {
      uploadedFiles: [],
      uploadError: null,
      currentStatus: null,
      uploadFieldName: 'DropZone',
    }
  },
  computed: {
    isInitial() {
      return this.currentStatus === STATUS_INITIAL;
    },
    isSaving() {
      return this.currentStatus === STATUS_SAVING;
    },
    isSuccess() {
      return this.currentStatus === STATUS_SUCCESS;
    },
    isFailed() {
      return this.currentStatus === STATUS_FAILED;
    },
    userFolder() {
        return this.$parent.userFolder;
    },
    path() {
        return this.$parent.path;
    }
  },
  methods: {
    reset() {
      // reset form to initial state
      this.currentStatus = STATUS_INITIAL;
      this.uploadedFiles = [];
      this.uploadError = null;
    },
    save(formData) {
        console.log('heellllooo');
      // upload data to the server
      this.currentStatus = STATUS_SAVING;

      this.axios.post(`${this.$backendPath}:${this.$backendPort}/api/file/upload`,
          formData,
        {params: {userFolder: this.userFolder, path: this.path}}
      )
        .then(x => {
        this.uploadedFiles = [].concat(x);
        this.currentStatus = STATUS_SUCCESS;
        this.$parent.getFilesInCurrentFolder();
        })
      .catch(err => {
        this.uploadError = err.response;
        this.currentStatus = STATUS_FAILED;
      });
    },
    filesChange(fieldName, fileList) {
      // handle file changes
      const formData = new FormData();

      if (!fileList.length) return;

      // append the files to FormData
      for(const key in fileList){
        formData.append('file', event.target.files[key]);
      }
      // save it
      this.save(formData);
    }
  },
  mounted() {
    this.reset();
    let blockDropzone = false;
    const drop = document.getElementById("container");
    const page = document.getElementsByTagName("html")[0];

    document.addEventListener("drag", function() {
      blockDropzone = true;
    }, false);

    document.addEventListener("dragover", function() {
      if (blockDropzone === false) {
        change();
      }
    }, false);

    document.addEventListener("dragleave", function( event ) {
      if ( event.target.tagName === "HTML" || event.target.className === "input-file") {
        changeBack();
      }
    }, false);

    page.addEventListener("drop", function() {
      blockDropzone = false;
      changeBack();
    }, false);

    function change() {
      drop.style.backgroundColor = 'lightcyan';
      drop.style.opacity = '0.7';
      drop.style['z-index'] = 100;
    }

    function changeBack() {
      drop.style.backgroundColor = 'transparent';
      drop.style.opacity = '0';
      drop.style['z-index'] = -50;
    }
  },
}
</script>

<style>

  #container {
    /*position: absolute;*/
    position: fixed;
    top: 0;
    left: 0;
    z-index: -50;
    width: 100%;
    height: 100%;
  }

  #form{
    height: 100%;
    width: 100%;
  }

  .dropbox {
    /*position:absolute;*/
    /*outline: 2px dashed grey; !* the dash box *!*/
    /*outline-offset: -10px;*/
    /*background: lightcyan;*/
    /*color: dimgray;*/
    /*padding: 10px 10px;*/
    /*min-height: 200px; !* minimum height *!*/
    /*position: relative;*/
    /*cursor: pointer;*/
    /*width: 78%;*/
    height: 100%;
    width: 100%;
    /*z-index: -1;*/
  }

  .input-file {
    opacity: 0; /* invisible but it's there! */
    width: 100%;
    height: 100%;
    /*position: absolute;*/
    /*cursor: pointer;*/
  }

  /*.dropbox:hover {*/
    /*background: lightblue; !* when mouse over to the drop zone, change color *!*/
  /*}*/

  /*.dropbox p {*/
    /*font-size: 1.2em;*/
    /*text-align: center;*/
    /*padding: 50px 0;*/
  /*}*/
</style>
