<template>
  <div class="linkContainer">
    <p>You can share this link with people :</p>
    <input
      align="middle"
      type="text"
      :value="title"
      id="textToCopy"
    />
    <div class="tooltip">
      <a
        class="button copyButton"
        @click="copyText"
        @mouseleave="outFunc"
      >
        <span
          class="toolTipText"
          id="myTooltip"
        >
          Copy to clipboard
        </span>
        Copy text
      </a>
    </div>
  </div>
</template>

<script>
    export default {
      name: "ShareLink",
      methods: {
        copyText() {
          const textToCopy = document.getElementById('textToCopy');
          textToCopy.select();
          document.execCommand('copy');

          const tooltip = document.getElementById("myTooltip");
          tooltip.textContent = 'Copied ✔';
        },
        outFunc() {
          const tooltip = document.getElementById("myTooltip");
          tooltip.innerHTML = "Copy to clipboard";
        },
      },
      props: ['title'],
    }
</script>

<style scoped>
  #textToCopy {
    width: 100%;
    padding: 3px;
    border: 1px solid
  }

  .icon {
    width: 20px;
    height: 20px;
    color: white;
  }

  .copyButton {
    cursor: pointer;
    color: white;
    background-color: #41B883;
    margin-top: 15px;
    text-align: center;
  }

  .linkContainer {
    height: 100%;
    margin: 30px 0 20px 0;
    padding: 0 20px;
  }

  .tooltip {
    position: relative;
    display: inline-block;
    width: 100%;
    text-align: center;
  }

  .tooltip .toolTipText {
    visibility: hidden;
    width: 140px;
    background-color: #555;
    color: #fff;
    text-align: center;
    border-radius: 6px;
    padding: 5px;
    position: absolute;
    z-index: 1;
    bottom: 150%;
    left: 50%;
    margin-left: -75px;
    opacity: 0;
    transition: opacity 0.3s;
  }

  .tooltip .toolTipText::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }

  .tooltip:hover .toolTipText {
    visibility: visible;
    opacity: 1;
  }
</style>
