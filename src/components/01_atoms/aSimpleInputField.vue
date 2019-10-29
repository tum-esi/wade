<template>
    <div class="input-simple-container">
        <input 
            v-if="inputType === 'number'"
            class="input-number" 
            type="number" 
            :min="(inputOptions && inputOptions.min)
                ? inputOptions.min : undefined"
            :max="(inputOptions && inputOptions.max) 
                ? inputOptions.max : undefined" 
            :placeholder="inputPlaceholder" 
            v-model="inputValue" 
            @change="changeInput(inputValue)"
        />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aSimpleInputField',
    props: {
        /**
         * Defines what the input field takes
         * Can be number, string, array, object
         */
        inputType: {
            type: String,
            required: true
        },
        /**
         * Defines if there should be a placeholder or not. Optional.
         */
        inputPlaceholder: {
            type: String,
            required: false,
            default: ''
        },
        /**
         * A Default value for number input
         */
        inputDefault: {
            type: Number,
            required: false
        },
        /**
         * Options for input field. Optional.
         * For numbers: min, max
         * For text: maxChar
         */
        inputOptions: {
            type: Object,
            required: false
        }
    },
    data() {
        return {
            inputValue: (this.inputDefault ? this.inputDefault : undefined) as number | string | undefined
        };
    },
    computed: {

    },
    methods: {
        changeInput(input: string | number | undefined) {
            if (input === undefined) return;
            this.inputValue = input;
            this.$emit('input-changed', this.inputValue);
        }
    },
    watch: {
    }
});
</script>

<style scoped>
.input-simple-container {
    border: 1px solid #393B3A;
    border-radius: 3px;
    height: 100%;
    padding: 3px;
    font-size: 14px;
    width: 70%;
    background: none; 
    position: relative;
    display: inline-block;
}


</style>
