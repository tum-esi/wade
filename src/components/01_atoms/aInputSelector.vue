<template>
    <div class="input-container">
        <input list="myDataList">
        <datalist id="myDataList">
            <option v-for="opt in givenData" 
            :key="opt" :value="opt" />
        </datalist>
    </div>
</template>

<script lang="ts">

import Vue from 'vue';

export default Vue.extend({
    name: 'aInputSelector',
    props: {
        givenData: {
            type: Array
            }
    }
});
</script>

<style scoped>
.input-container {
    background: #939c9e;
    padding: 7px;
    font-size: 12px;
    color: #000000;
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
}



.normTR {
    background-color: white;
}
/* .error {
    color: #a81900;
} */
</style>
