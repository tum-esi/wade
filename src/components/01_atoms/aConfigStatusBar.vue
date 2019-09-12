<template>
    <div class="statusbar-container border-bottom" :class="style">
        <label>{{ statusMessage }}</label>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { TdConfigEnum } from '@/util/enums';
// import { mapGetters } from 'vuex';
export default Vue.extend({
    name: 'aConfigStatusBar',
    props: {
        statusMessage: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            hasError: false,
            isSaved: false,
            style: ''
        };
    },
    watch: {
        statusMessage() {
            if (this.statusMessage === TdConfigEnum.ERROR) {
                this.style = 'error';
            } else if (this.statusMessage === TdConfigEnum.SAVE_SUCCESS) {
                this.style = 'saved';
            } else {
                this.style = '';
            }
        },
    }
});
</script>

<style scoped>
.statusbar-container {
    background: #939c9e;
    display: flex;
    align-items: center;
    padding: 7px;
    font-size: 12px;
    color: #000000;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    border: 1px solid #393B3A;
    border-bottom: none;
}

.statusbar-container label {
    font-weight: lighter;
}

.saved {
    background: #b5dfdd;
}
</style>
