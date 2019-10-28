<template>
    <div class="dropdown-simple-container">
        <button 
            :class="optionalStyle"
            class="input-dropdown-btn" 
            @click.prevent="dropdownVisible = !dropdownVisible"
        >
            {{ getSelectedOption }}
        </button>
        <div class="input-dropdown-content" 
            :class="{'input-dropdown-content-visible' : dropdownVisible}">
            <label 
                v-for="(el, index) in this.dropdownOptions"
                :key="index"
                :class="el.style"
                @click.prevent="changeSelection(el.title)">
                {{ el.title }}
            </label>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aSimpleDropdownButton',
    props: {
        /**
         * Set default text for dropdown (shown when nothing selected)
         * Type: String
         */
        defaultOption: {
            type: String,
            required: false,
            default: 'Select'
        },
        /**
         * Array of options for Dropdown
         * Type: Array<string>
         */
        dropdownOptions: {
            type: Array,
            required: true
        },
        /**
         * Optional css class
         * Type: string
         */
        optionalStyle: {
            type: String,
            required: false,
            default: ''
        },
        /**
         * Which event should be emitted when selection changes.
         * Optional
         * Type: string
         */
        selectionAction: {
            type: String,
            required: false
        }
    },
    data() {
        return {
            dropdownVisible: false,
            selectedOption: undefined as any,
        };
    },
    computed: {
        /**
         * Return the selected option - to be viewed in selection
         * If none is selected return 'Select
         */
        getSelectedOption(): string {
            // Handle case where selected option is boolean value 'false'
            if (this.selectedOption === false) return this.selectedOption;
            return this.selectedOption || this.defaultOption;
        }
    },
    methods: {
        /**
         * Change selected option
         */
        changeSelection(selectedElement: string | boolean | number) {
            this.dropdownVisible = !this.dropdownVisible;
            this.selectedOption = selectedElement;
            this.$emit(this.selectionAction, this.selectedOption);
        }
    },
    watch: {
    }
});
</script>

<style scoped>
.dropdown-simple-container {
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

.input-dropdown-btn {
    height: 100%;
    width: 100%;
    font-size: 14px;
    outline: none;
    border: none;
    background: none;
    text-align: left;
    padding-left: 1px;
    overflow: hidden;
}

.input-dropdown-content {
    padding: 3px;
    display: none;
    position: absolute;
    background-color: #f1f1f1;
    left: 0;
    width: 100%;
    box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
    z-index: 1;
    border-radius: 3px;
}

.input-dropdown-content-visible {
    display: flex;
    flex-wrap: wrap;
}
</style>
