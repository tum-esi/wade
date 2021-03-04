<template>
   <div class="url-bar-container">
        <input  class="url-input" type="text" v-model="url" />
        <span style="width: 2%;"></span>
        <aButtonBasic
            class="url-btn"
            v-on:btn-clicked="btnClicked"
            :btnClass="button.btnClass"
            :btnLabel="button.btnLabel"
            :btnOnClick="button.btnOnClick"
            :btnActive="true"
        />
        <span style="width: 2%;"></span>
        <aButtonCancel class="hide-urlbar-btn" v-on:cancel-btn-clicked="$emit('cancel-btn-clicked')"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aButtonBasic from '@/components/01_atoms/aButtonBasic.vue';
import aButtonCancel from '@/components/01_atoms/aButtonCancel.vue';

export default Vue.extend({
    name: 'mUrlBar',
    components: {
        aButtonBasic,
        aButtonCancel
    },
    props: {
        /**
         * Button wich is displayed next to url bar.
         */
        button: {
            type: Object as () => {
                btnClass: string;
                btnLabel: string;
                btnOnClick: string;
                btnActive: boolean;
            }
        },
        /**
         * Action when button is invoked.
         */
        buttonAction: {
            type: Function
        }
    },
    data() {
        return {
            url: '',
        };
    },
    computed: {
        urlValid() {
            // Source for regex:
            // https://stackoverflow.com/questions/3809401/what-is-a-good-regular-expression-to-match-a-url
            const urlRegex = new RegExp(
                /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi
                );
            if (this.url.length <= 0 || !this.url.match(urlRegex)) return false;
            return true;
        }
    },
    methods: {
        btnClicked() {
            this.$emit(this.button.btnOnClick);
            this.buttonAction(this.url);
        }
    }
});
</script>


<style scoped>
.url-bar-container {
    display: flex;
    align-items: center;
    padding-top: 5px;
}

.url-input {
    width: 68%;
    border: 1px solid #393B3A;
    padding: 3px;
    border-radius: 3px;
    height: 70%;
}

.url-btn {
    width: 20%;
    height: 100%;
    border-radius: 3px;
    outline: none;
    border: none;
    background: #b5dfdd;
    cursor: pointer;
    font-size: 14px;
    text-align: center;
    text-decoration: none;
    text-shadow: none;
    display: inline-block;
}

.hide-urlbar-btn {
    width: 10%;
    height: 70%;
}

</style>
