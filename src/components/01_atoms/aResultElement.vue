<template>
    <div class="result-container">
        <div class="result-title"><label>{{ resultTitle }}</label></div>
        <div class="result-values">
            <label> 
                {{ resultValue }}
            </label>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'aResultElement',
    props: {
        resultType: {
            type: String,
            required: true,
        },
        resultTitle: {
            type: String,
            required: true
        },
        resultValue: {
            required: false
        }
    }
});
</script>

<style scoped>
.result-container {
    display: flex;
    width: 100%;
    height: 35px;
    border: 1px solid #393B3A;
    border-radius: 3px;
    margin: 5px 0 5px 0;
}

.result-title {
    width: 60%;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 7px;
}

.result-values {
    width: 40%;
    display: flex;
    align-items: center;
    border-left: 1px solid #393B3A;
    padding-left: 7px;
    overflow: scroll;
}

.result-values label {
    overflow: scroll;
    max-height: 100%;
}
</style>
