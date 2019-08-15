<template>
    <div class="dropdown-btn-container" v-on:click.prevent="showDropdown =! showDropdown">
        <div v-if="btnLabel" class="button-label-container">
            <label v-if="btnLabel" class="button-label">{{ btnLabel }}</label>
        </div>

        <img class="button-icon" v-if="btnSrc" v-bind:src="iconSrc" :class="btnIconStyle">

        <div class="dropdown-container" v-if="showDropdown" :class="btnStyle">
            <div
                class="dropdown-element"
                v-for="(dropdownElement, index) in btnDropdownOptions"
                v-bind:key="index"
                v-bind:class="dropdownElement.style"
                v-on:click.prevent="dropDownClicked(dropdownElement)"
            >   
                <img class="dropdown-element-img" v-if="dropdownElement.icon" :src="iconDropdownSrc(dropdownElement.icon)"/>
                <input v-if="dropdownElement.editable" type="text" :placeholder="dropdownElement.title"/>
                <label v-else>{{ dropdownElement.title }}</label>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aDropdownButton',
    props: {
        /**
         * Label of the button to be displayed.
         */
        btnLabel: {
        type: String,
        required: false,
        default: ''
        },
        /**
         * The key should explain the main purpose of the button.
         * Use kebap-case.
         * E.g. "property-invoke" or "td-upload"
         */
        btnKey: {
        type: String,
        required: true
        },
        /**
         * Source path for the button's icon.
         */
        btnSrc: {
        type: String,
        required: false
        },
        /**
         * A list of all options for the dropdown.
         */
        btnDropdownOptions: {
        type: Array as () => WADE.DropdownOptionInterface[],
        required: true
        },
        /**
         * Unique styling for the dropdown container.
         */
        btnStyle: {
            type: String,
            required: false
        },
        /**
         * Unique styling for the icon.
         */
        btnIconStyle: {
            type: String,
            required: false
        }
    },
    data() {
        return {
        showDropdown: false,
        key: ''
        };
    },
    computed: {
        iconSrc(): any {
          return require(`@/assets/${this.btnSrc}.png`);
        }
    },
    methods: {
        getBtnKey() {
            return '';
        },
        iconDropdownSrc(btnSrc: string): any {
            return require(`@/assets/${btnSrc}.png`);
        },
        dropDownClicked(dropdownElement: WADE.DropdownOptionInterface) {
            this.$emit('dropdown-clicked', {
                btnKey: this.btnKey,
                btnValue: dropdownElement.key,
                btnInput: dropdownElement.inputValue,
                parentId: null
            });
            this.$eventHub.$emit('dropdown-clicked', {
                btnKey: this.btnKey,
                btnValue: dropdownElement.key,
                btnInput: dropdownElement.inputValue,
                parentId: null
            });
        }
    },
    watch: {
        showDropdown() {
            this.$emit(`${this.btnKey}`, this.showDropdown);
        }
    }
});
</script>

<style scoped>
.dropdown-btn-container {
    display: flex;
    border: 1px solid #b5dfdd;
    border-radius: 3px;
    position: relative;
}

.button-icon {
    max-width: 100%;
    object-fit: contain;
    padding: 5px 7px 5px 7px;
    background: #b5dfdd;
}

/* Btn styling for td selection field */
.button-icon-selection {
    max-height: 100%;
    max-width: 100%;
    object-fit: contain;
    padding: 5px 7px 5px 7px;
    background: #b5dfdd;
}

/* Default styling for dropdown container */
.dropdown-container {
    border: 1px solid #000;
    border-radius: 3px;
    text-align: left;
    position: absolute;
    background: #fff;
    font-size: 14px;
    left: -400%;
    width: 500%;
    margin-top: 80%;
}

/* Dropdown styling for td selection field */
.dropdown-container-selection {
    border: 1px solid #000;
    border-radius: 3px;
    text-align: left;
    position: absolute;
    background: #fff;
    font-size: 14px;
    left: -100%;
    width: 200%;
    margin-top: 80%;
}

/* Dropdown styling for sidebar element dropdowns */
.dropdown-container-sidebar-element {
    left: -1180%;
    width: 1300%;
    margin-top: 200%;
}

.dropdown-element {
    padding: 0px 7px 0px 7px;
    display: flex;
    width: 100%;
    height: 30px;
    align-items: center;
}

.dropdown-element-img {
    max-height: 50%;
    object-fit: contain;
    padding-right: 7px;
}

.button-label-container {
    background: #b5dfdd;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* btn style for sidebar dropdown options */
.sidebar-element-icon-options {
  padding: 7px 0px 7px 0px;
  width: 15px;
  height: 100%;
  object-fit: contain;
  background: transparent;
}
</style>
