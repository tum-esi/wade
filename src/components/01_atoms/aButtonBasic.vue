<!-- Basic button with label -->
<template>
  <button class="btn btn-basic" :class="btnClass" v-on:click.prevent="onClick" :disabled="!btnActive">{{ btnLabel }}</button>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aButtonBasic',
    props: {
        /**
         * Displayed label on button.
         */
        btnLabel: {
          type: String,
          required: true
        },
        /**
         * Button class. Can either be 'btn-grey' or 'btn-pos' or any other custom style.
         */
        btnClass: {
          type: String,
          required: true
        },
        /**
         * Triggered event when button is clicked.
         */
        btnOnClick: {
          type: String,
          required: true
        },
        /**
         * Inidicates wether button is enabled or disabled.
         */
        btnActive: {
          type: Boolean,
          required: false,
          default: true
        }
    },
    methods: {
        onClick() {
            if (this.btnOnClick) {
                this.$emit(this.btnOnClick);
                this.$eventHub.$emit(this.btnOnClick);
            }
        }
    }
});
</script>

<style scoped>
button:disabled {
  background-color: #939C9E;
  color: #B4BAB9;
}

.btn-basic {
  border: none;
  font-size: 16px;
  margin-right: 10px;
}

.btn-basic:focus,
.btn-basic:active {
  outline: none;
  background: #92afae;
}

.btn-basic:hover {
  color: #fff;
}

.btn-grey {
  background: #b4bab9;
}

.btn-invoke {
  margin-right: 0;
}

.btn-results {
  background: none;
  border: 1px solid #393B3A;
}

.btn-url-bar {
  height: 70%;
  width: 20%;
  margin: 0;
  font-size: 14px;
}
</style>

