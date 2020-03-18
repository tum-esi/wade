<!-- A container for one or more 'aOptionElement's with a title. -->
<template>
  <div class="complex-option-element-container">
    <label class="full-height title">{{ title }}</label>
    <aOptionElement 
        class="option-element"
        v-for="(element, index) in optionElementObj"
        :key="`${element}${index}`"
        :firstElement="element.firstElement"
        :secondElement="element.secondElement"
        :elementStyle="'bg-grey'"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import aOptionElement from '@/components/01_atoms/aOptionElement.vue';

export default Vue.extend({
    name: 'mComplexOptionElement',
    components: {
        aOptionElement
    },
    props: {
        /**
         * Will be viewed in the middle as title.
         */
        title: {
            required: true
        },
        /**
         * Content for the simple option element.
         * Properties: <firstElement: string, secondElement?: string>
         */
        optionElementObj: {
            required: true
        }
    }
});
</script>

<style scoped>
.title {
    padding-top: 4px;
}

.complex-option-element-container {
    border: 1px solid #393B3A;
    border-radius: 3px;    
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    margin: 5px 0 5px 0;
}

.option-element-container label {
    display: flex;
    align-items: center;
    padding-left: 4px;
    overflow: scroll;
}

.option-element {
    padding: 0 4px 0 4px;
}
</style>


