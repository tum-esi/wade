<template>
    <div>
        <label
            :class="passed ? 'passed-test' : 'failed-test'"
            v-on:click="toggleResultDetail"
        >{{interactionName}}</label>
        <div class="test-result-detail"
            v-show="showResultDetail"
        >
            <textarea class="result-detail" disabled>
                {{ resultDetail }}
            </textarea>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'aConformanceTestElement',
    components: {},
    created() {
        if (!this.passed) {
            this.$emit('test-failed');
        }
    }, 
    data() {
        return {
            showResultDetail: false
        }
    },
    props: {
        interactionName: {
            type: String,
            required: true
        },
        passed: {
            type: Boolean,
            required: true
        },
        resultDetail: {
            type: Object,
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
.passed-test {
    padding-left: 5px;
    color: white;
    background-color: green;
    display: block;
}

.passed-test:hover {
    background-color: rgba(0, 128, 0, 0.6);
}

.failed-test {
    padding-left: 5px;
    color: white;
    background-color: red;
    display: block;

}

.failed-test:hover {
    background-color: rgba(255, 0, 0, 0.7);
}

.result-detail {
    display: block;
    width: 100%;
    height: 200px;
}
</style>