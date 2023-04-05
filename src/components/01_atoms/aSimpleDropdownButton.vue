<template>
    <div 
        class="dropdown-simple-container"
    >
        <!-- Dropdown button -->
        <button 
            :class="optionalIconPaths 
                ? `${optionalStyle} width-80` 
                : `${optionalStyle} full-width`"
            class="input-dropdown-btn" 
            @click.prevent="dropdownVisible = !dropdownVisible, dropdownVisible ? focusDropdown() : null"
        >
            {{ getSelectedOption }}
        </button>
        <!-- Dropdown elements -->
        <div ref="dropdownContent" 
            class="input-dropdown-content" 
            :class="{'input-dropdown-content-visible' : dropdownVisible}"
            @blur="dropdownVisible = false"
            tabindex="-1"
        >
            <label 
                v-for="(el, index) in this.dropdownOptions"
                :key="index"
                :class="el.style + ' dropdown-element'"
                @click.prevent="changeSelection(el.title)">
                {{ el.title }}
            </label>
        </div>
        <!-- Optional dropdown icon (can change when dropdown visible) -->
        <div v-if="optionalIconPaths" class="dropdown-icon">
            <img 
                :src="dropdownVisible 
                ? getIcon(optionalIconPaths.iconPathDropdownClosed) 
                : getIcon(optionalIconPaths.iconPathDropdownActive)"
            >
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { focusElement } from '@/util/helpers';

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
            // type: Array,
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
        },
        /**
         * Optional icon for dropdown.
         * Can change if dropdown is shown.
         */
        optionalIconPaths: {
            type: Object as () => { iconPathDropdownClosed: string, iconPathDropdownActive: string } | null,
            required: false,
            default: null
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
        },
        /**
         * Require desired icon
         */
        getIcon(path: string) {
           return require(`@/assets/${path}.png`);
        },
        focusDropdown() {
            focusElement("dropdownContent", this);
        }
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
    background: #b5dfdd; 
    position: relative;
    display: flex;
}

.input-dropdown-btn {
    height: 100%;
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
    top: 102%;
}

.input-dropdown-content-visible {
    display: flex;
    flex-wrap: wrap;
}

.dropdown-icon {
    height: 100%;
}

.dropdown-icon img{
    max-height: 100%;
    object-fit: contain;
    max-width: 100%;
    padding: 5px;
}

.dropdown-element:hover {
  background-color: #8aaba9;
}

</style>
