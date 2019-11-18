<!-- A simple element, that takes one or two inputs (strings or numbers) and has a border. 
With multiple inputs: The first is viewed on the left, the second on the right, divided by a line. -->
<template>
  <div class="option-element-container">
    <label class="full-height option-element" :class="{'width-50 border-right' : secondElement}">{{ firstElement }}</label>
    <label v-if="secondElement" class="width-50 option-element second">{{ secondElement }}</label>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aOptionElement',
    props: {
        /**
         * Will be viewed on the left.
         */
        firstElement: {
            required: true
        },
        /**
         * Will be viewed on the right. Optional.
         */
        secondElement: {
            required: false
        }
    }
});
</script>

<style scoped>
.option-element-container {
    border: 1px solid #393B3A;
    border-radius: 3px;    
    display: flex;
    width: 100%;
    height: 35px;
    margin: 5px 0 5px 0;
}

.option-element-container label {
    display: flex;
    align-items: center;
    padding-left: 4px;
    overflow: scroll;
}

.option-element {
    padding: 0 3px 0 3px;
}

.second {
    align-items: flex-start !important;
}
</style>


