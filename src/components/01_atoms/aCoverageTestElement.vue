<template>
    <div>
        <label class="coverage-test-result-label"
            v-on:click="toggleResultDetail"
        >{{ coverageName }}</label>
        <div class="coverage-test-result-detail"
            v-show="showResultDetail"
        >
            <textarea class="coverage-result-detail" disabled>
                {{ resultDetail }}
            </textarea>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'aCoverageTestElement',
    data() {
        return {
            showResultDetail: false
        }
    },
    props: {
        coverageName: {
            type: String,
            required: true
        },
        resultDetail: {
            type: [Object, Array],
            required: true
        }
    },
    methods: {
        toggleResultDetail() {
            this.showResultDetail = !this.showResultDetail;
        }
    }
})
</script>

<style scoped>


.coverage-test-result-label {
    padding-left: 5px;
    color: white;
    background-color: gray;
    display: block;
    border: 1px solid black;
    border-radius: 2px;
}

.coverage-test-result-label:hover { 
    background-color: rgba(128, 128, 128, 0.5);
}

.coverage-result-detail {
    display: block;
    width: 100%;
    height: 100px;
}

</style>