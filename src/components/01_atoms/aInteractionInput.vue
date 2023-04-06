<!--  Button with selection option -->
<template>
  <div :class="getButtonSelectedStyle" class="btn-input-container">
    <input
      v-if="checkInputType('text')"
      class="input-text"
      type="text"
      :placeholder="getPlaceholder"
      v-model="inputValue"
      @input="changeInput(inputValue, false)"
    />

    <input
      v-else-if="checkInputType('number')"
      class="input-text"
      type="number"
      :min="this.btnInputType.propMin"
      :max="this.btnInputType.propMax"
      placeholder="Number"
      v-model="inputValue"
      @input="changeInput(inputValue, false)"
    />

    <div v-else-if="btnInputType.propType === 'boolean'" class="input-dropdown">
      <button
        class="input-dropdown-btn"
        @click.prevent="dropdownVisible = !dropdownVisible, dropdownVisible ? focusDropdown('booleanDropdown') : null"
      >
        {{ getSelectedOption }}
      </button>
      <div
        ref="booleanDropdown"
        class="input-dropdown-content"
        :class="{ 'input-dropdown-content-visible': dropdownVisible }"
        @blur="dropdownVisible = false"
        tabindex="-1"
      >
        <label @click.prevent="changeInput(true, true)">
          True
        </label>
        <label @click.prevent="changeInput(false, true)">
          False
        </label>
      </div>
    </div>

    <div v-else-if="btnInputType.propEnum" class="input-dropdown">
      <button
        class="input-dropdown-btn"
        @click.prevent="dropdownVisible = !dropdownVisible, dropdownVisible ? focusDropdown('enumDropdown') : null"
      >
        {{ getSelectedOption }}
      </button>
      <div
        ref="enumDropdown"
        class="input-dropdown-content"
        :class="{ 'input-dropdown-content-visible': dropdownVisible }"
        @blur="dropdownVisible = false"
        tabindex="-1"
      >
        <label
          v-for="(el, index) in this.btnInputType.propEnum"
          :key="index"
          @click.prevent="changeInput(el, true)"
        >
          {{ el }}
        </label>
      </div>
    </div>

    <div class="select-btn-container">
      <img
        class="select-btn"
        @click.prevent="!interactionWriteAll ? (btnSelected ? deselect() : select()) : null"
        :src="!hasError && !isInputEmpty ? currentSrc : srcSelectionNotPossible"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Ajv from 'ajv';
import { JSONSchemaFaker  as jsf } from 'json-schema-faker';
import { focusElement } from '@/util/helpers';

export default Vue.extend({
  name: 'aInteractionInput',
  created() {
    this.$eventHub.$on('selections-reseted', () => {
      this.deselect();
    });
  },
  beforeDestroy() {
    this.$eventHub.$off('selections-reseted');
  },
  data() {
    return {
      btnSelected: false,
      writeAllSelected: false,
      inputValue: '',
      dropdownVisible: false,
      placeholder: '',
      currentSrc: require('@/assets/circle.png'),
      srcUnselected: require('@/assets/circle.png'),
      srcSelected: require('@/assets/checked_circle.png'),
      srcSelectionNotPossible: require('@/assets/circle_grey.png')
    };
  },
  props: {
    /**
     * Displayed label on button.
     */
    btnLabel: {
      type: String,
      required: false
    },
    /**
     * Btn key should explain the main purpose of the button.
     * Use kebap-case.
     * E.g. "property-invoke" or "td-upload"
     */
    btnKey: {
      type: String,
      required: true
    },
    /**
     * What type of input should be displayed.
     */
    btnInputType: {
      type: Object,
      required: true
    },
    /**
     * Input data shema to validate the user input.
     */
    btnInputSchema: {
      type: Object,
      required: false
    },
    /**
     * Button css style. Can either be 'btn-grey' or 'btn-pos' or any other custom style.
     */
    btnGeneralStyle: {
      type: String,
      required: false
    },
    /**
     * Button style which is actived when the button is selected.
     */
    btnSelectedStyle: {
      type: String,
      required: false
    },
    /**
     * Optional triggered event when button is clicked.
     */
    btnOnClickEvent: {
      type: String,
      required: false
    },
    /**
     * Optional value to be passed when button is triggered.
     * Requirement: btnOnClickEvent may not be null.
     */
    btnOnClickValue: {
      type: String,
      required: false
    },
    /**
     * Element to dispatch an event.
     */
    element: {
      required: false
    },
    interactionWriteAll: {
      type: Boolean,
      required: false
    }
  },
  watch: {
    interactionWriteAll() {
      if (this.interactionWriteAll === undefined || this.interactionWriteAll === null) return;

      if (this.btnKey.endsWith('write')) {
        if (this.interactionWriteAll) {
          if (this.btnSelected) {
            this.deselect();
          }

          this.btnSelected = true;
          this.currentSrc = this.srcSelected;
          this.writeAllSelected = true;
          this.inputValue = this.generateInputValue();

          this.$emit(
            'select-write-all',
            this.element,
            this.getParsedInputValue()
          );
        } else {
          this.btnSelected = false;
          this.currentSrc = this.srcUnselected;
          this.writeAllSelected = false;
          this.inputValue = '';
        }
      }
    }
  },
  computed: {
    getBtnLabel(): string {
      return this.btnSelected ? 'Selected' : 'Select';
    },
    getPlaceholder(): string {
      return this.placeholder ? this.placeholder : 'Write';
    },
    getBtnSourcePath(): any {
      return this.btnSelected ? this.srcSelected : this.srcUnselected;
    },
    getSelectedOption(): string {
      if ((this as any).inputValue === false) {
        return this.inputValue;
      }
      return this.inputValue ? this.inputValue : 'Select';
    },
    getButtonSelectedStyle(): string {
      return this.btnSelected ? 'btn-selection-container-selected' : '';
    },
    isInputEmpty(): boolean {
      if (
        (typeof this.inputValue === 'string' && this.inputValue.length <= 0) ||
        this.inputValue === null ||
        this.inputValue === undefined
      ) {
        return true;
      } else {
        return false;
      }
    },
    hasError(): boolean {
      let errorMessage = '\n';

      const validationResult = this.getInputValidationResult();

      if (validationResult) {
        for (const result of validationResult) {
          errorMessage += `- ${result}\n`;
        }
      }

      errorMessage = errorMessage.trim();
      
      if (errorMessage) {
        this.$emit('show-error-message', errorMessage);
        return true;
      } else {
        this.$emit('remove-error-message', errorMessage);
        return false;
      }
    }
  },
  methods: {
    checkInputType(inputType: string): boolean {
      if (
        (inputType === 'text' &&
          this.btnInputType.propType === 'string' &&
          !this.btnInputType.propEnum) ||
        (this.btnInputType.propType === 'array' &&
          !this.btnInputType.propEnum) ||
        (this.btnInputType.propType === 'object' && !this.btnInputType.propEnum)
      ) {
        // sets placeholder to proper cased propType
        this.placeholder =
          this.btnInputType.propType[0].toUpperCase() +
          this.btnInputType.propType.slice(1);
        return true;
      }

      if (
        inputType === 'number' &&
        ['integer', 'float', 'double', 'number'].indexOf(
          this.btnInputType.propType
        ) !== -1 &&
        !this.btnInputType.propEnum
      ) {
        return true;
      }

      return false;
    },
    changeInput(input: string | boolean | number | any, isDropdown: boolean) {
      if (input === undefined || input === '' || input === null) { 
        this.deselect();
        return;
      }

      // Hide dropdown and change input when enum/boolean
      if (isDropdown) {
        this.dropdownVisible = !this.dropdownVisible;
        (this as any).inputValue = input;
      }

      // When btn is selected emit selection change
      if (this.btnSelected) {
        if (this.writeAllSelected) {
          this.$emit(
            'select-write-all',
            this.element,
            this.getParsedInputValue()
          );
        } else {
          this.$emit(
            'select-with-input',
            this.element,
            isDropdown ? this.inputValue : this.getParsedInputValue(),
            true
          );
        }
      }
    },
    select() {
      // Cannot be selected when there's no input value
      if (this.isInputEmpty || !this.element || this.hasError) return;
      // Change UI selection
      this.btnSelected = true;
      this.currentSrc = this.srcSelected;
      // Emit new selection
      this.$emit(
        'select-with-input',
        this.element,
        this.getParsedInputValue(),
        false
      );
    },
    deselect() {
      this.inputValue = '';
      this.btnSelected = false;
      this.currentSrc = this.srcUnselected;
      this.$emit('deselect');
    },
    // Parse string input to correct data type (do not show in UI)
    getParsedInputValue() {
      let parsedInputValue: any = this.inputValue;

      if (
        ['integer', 'float', 'double', 'number'].indexOf(
          this.btnInputType.propType
        ) !== -1
      ) {
        parsedInputValue = parseInt(this.inputValue, 10);
      }
      if (this.btnInputType.propType === 'object') {
        try {
          parsedInputValue = JSON.parse(this.inputValue);
        } catch {
          parsedInputValue = null;
        }
      }
      if (this.btnInputType.propType === 'array') {
        const jsonArr = parsedInputValue.replace(/([^\[\],\s]+)/g, '"$&"');
        try {
          parsedInputValue = JSON.parse(jsonArr);
        } catch {
          parsedInputValue = null;
        }
        if (!parsedInputValue || typeof parsedInputValue === 'string')
          parsedInputValue = this.inputValue.split(' ');
      }

      return parsedInputValue;
    },
    getInputValidationResult(): any {
      if (this.isInputEmpty) {
        return; 
      }

      if (this.btnInputSchema) {
        const ajv = new Ajv({ allErrors: true, strict: false });
        const validate = ajv.compile(this.btnInputSchema);
        const valid = validate(this.getParsedInputValue());
        
        if (!valid) {
          const errorMessages: (string | undefined) [] = [];
          for (const error of validate.errors!) {
            if (error.instancePath) {
              errorMessages.push(`${error.instancePath} ${error.message}`);
            } else {
              errorMessages.push(error.message);
            }
          }

          return errorMessages;
        } 
      }
    },

    generateInputValue(): any {
      const fakeInputValue = jsf.generate(this.btnInputSchema);
      if (this.btnInputType.propType === 'boolean') {
        return fakeInputValue as boolean;
      } else {
        return JSON.stringify(fakeInputValue);
      }
    },
    focusDropdown(refName: string) {
      focusElement(refName, this);

    }
  }

});
</script>



<style scoped>
.btn-selection-container-selected {
  background: #305e5c !important;
}

.btn-selection-container-selected :hover {
  background: #305e5c !important;
}

.btn-input-container {
  background: #b5dfdd;
  height: 100%;
  background: #b5dfdd;
  display: flex;
  height: 100%;
  align-items: center;
  padding: 3px;
  border-bottom-right-radius: 3px;
  border-top-right-radius: 3px;
}

.input-text {
  border: 1px solid #393b3a;
  border-radius: 3px;
  height: 100%;
  padding: 3px;
  font-size: 14px;
  width: 70%;
  background: none;
}

.input-dropdown {
  border: 1px solid #393b3a;
  border-radius: 3px;
  height: 100%;
  padding: 3px;
  font-size: 14px;
  width: 70%;
  background: none;
  position: relative;
  display: inline-block;
}

.input-dropdown-content {
  padding: 3px;
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  left: -100%;
  width: 200%;
  box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
  z-index: 2;
  border-radius: 3px;
}

.input-dropdown-content:hover {
  background-color: #f1f1f1 !important;
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
.input-dropdown-content-visible {
  display: block;
}

.input-dropdown-content label {
  display: block;
}

.select-btn-container {
  width: 30%;
  height: 100%;
  text-align: center;
}

.select-btn-container img {
  max-height: 100%;
  object-fit: contain;
  max-width: 100%;
  padding: 5px;
}
</style>

