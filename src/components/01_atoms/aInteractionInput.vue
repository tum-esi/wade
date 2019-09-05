<!--  Button with selection option -->
<template>
  <div
    :class="getButtonSelectedStyle"
    class="btn-input-container"
  >

    <input v-if="interactionInputType('text')" class="input-text" type="text" :placeholder="getPlaceholder" v-model="inputValue"/>

    <input v-else-if="interactionInputType('number')" class="input-text" type="number" :min="this.btnInputType.propMin" :max="this.btnInputType.propMax" placeholder="Number" v-model="inputValue"/>

    <div v-else-if="interactionInputType('boolean')" class="input-dropdown">
        <button class="input-dropdown-btn" @click.prevent="dropdownVisible = !dropdownVisible" >{{ getSelectedOption }}</button>
            <div class="input-dropdown-content" 
                :class="{'input-dropdown-content-visible' : dropdownVisible}">
                <label @click.prevent="changeBtnInputValue(true)">
                   True
                </label>
                <label @click.prevent="changeBtnInputValue(false)">
                   False
                </label>
            </div>
    </div>

    <div v-else-if="interactionInputType('enum')" class="input-dropdown">
        <button class="input-dropdown-btn" @click.prevent="dropdownVisible = !dropdownVisible" >{{ getSelectedOption }}</button>
            <div class="input-dropdown-content" 
                :class="{'input-dropdown-content-visible' : dropdownVisible}">
                <label 
                v-for="(el, index) in this.btnInputType.propEnum"
                :key="index" @click.prevent="changeBtnInputValue(el)">
                    {{ el }}
                </label>
            </div>
    </div>

    <div class="select-btn-container">
        <img class="select-btn" @click.prevent="changeSelection" :src="!isInputEmpty ? currentSrc : srcSelectionNotPossibele"/>
    </div>

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'aInteractionInput',
  created() {
    this.$eventHub.$on('selections-reseted', () => {
      this.btnSelected = false;
      this.currentSrc = this.btnSelected ? this.srcSelected : this.srcUnselected; });
  },
  data() {
    return {
      btnSelected: false,
      inputValue: '',
      dropdownVisible: false,
      placeholder: '',
      currentSrc: require('@/assets/circle.png'),
      srcUnselected: require('@/assets/circle.png'),
      srcSelected: require('@/assets/checked_circle.png'),
      srcSelectionNotPossibele: require('@/assets/circle_grey.png')
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
        if ((this as any).inputValue === false) { return this.inputValue; }
        return this.inputValue ? this.inputValue : 'Select';
    },
    getButtonSelectedStyle(): string {
        return this.btnSelected ? 'btn-selection-container-selected' : '';
    },
    isInputEmpty(): boolean {
      if ((typeof this.inputValue  === 'string' && this.inputValue.length <= 0)
          || this.inputValue === null
          || this.inputValue === undefined
      ) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    interactionInputType(type: string) {
        let isCorrectType = false;
        switch (type) {
            case 'text':
                if (this.btnInputType.propType === 'string' && !this.btnInputType.propEnum
                || this.btnInputType.propType === 'array' && !this.btnInputType.propEnum
                || this.btnInputType.propType === 'object' && !this.btnInputType.propEnum
                ) {
                    isCorrectType = true;
                    this.placeholder = this.btnInputType.propType;
                }
                break;
            case 'object':
              if (this.btnInputType.propType === 'object') isCorrectType = true;
              break;
            case 'array':
              if (this.btnInputType.propType === 'array') isCorrectType = true;
              break;
            case 'enum':
                if (this.btnInputType.propEnum) isCorrectType = true;
                break;
            case 'number':
                if (['integer', 'float', 'double', 'number'].indexOf(this.btnInputType.propType) !== -1
                && !this.btnInputType.propEnum) {
                    isCorrectType = true;
                }
                break;
            case 'boolean':
                if (this.btnInputType.propType === 'boolean') {
                    isCorrectType = true;
                }
                break;
            default:
                break;
        }
        return isCorrectType;
    },
    // Change input of an interaction
    //  TODO: Make difference between dropdown -> bool/enum and input field
    // TODO: When input field: parse!!
    changeBtnInputValue(input?: string | boolean) {
      // If (input) -> Was called by dropdown -> hide dropdown and change this.inputValue
      if (input) {
        this.dropdownVisible = !this.dropdownVisible;
        (this as any).inputValue = input;
      } else {
        this.inputValue = this.getParsedInputValue();
      }

      console.log('=== INPUT VALUE before Emit=', this.inputValue);
      // Only emit changed input when interaction is already selected
      if (this.btnSelected) this.$emit('select-with-input', this.element, this.inputValue, true);
    },
    // Select or deselect an interaction input
    changeSelection() {
      // Cannot be selected when there's no input value
      if (this.isInputEmpty || !this.element) return;

      // Change selection in UI
      this.btnSelected = !this.btnSelected;
      this.currentSrc = this.btnSelected ? this.srcSelected : this.srcUnselected;

      if (this.btnSelected && !this.isInputEmpty) {
        this.$emit('select-with-input', this.element, this.getParsedInputValue(), false);
      } else {
        this.$emit('deselect');
      }
    },
    getParsedInputValue() {
      console.log('this.inputValue: ', this.inputValue);
      let parsedInputValue: any = this.inputValue;
      // Parse string input when needed
      if (this.interactionInputType('number')) {
          parsedInputValue = parseInt(this.inputValue, 10);
      }
      if (this.interactionInputType('object')) {
        try {
          parsedInputValue = JSON.parse(this.inputValue);
        } catch {
          parsedInputValue = null;
        }
      }
      if (this.interactionInputType('array')) {
        // #1 Does it have brackets? No -> just split
        // #2 Does it have brackets? Yes -> 
        // -> remove brackets
        // -> has '' -> replace with ""
        // -> has " " -> passt
        // -> is boolean -> passt
        // -> is  number -> passt
        // -> is object -> check if valid obj -> wenn ja -> passt; wenn nein 
        // -> create real obj 

        // Test cases
        // const test1 = 'blabla';
        // const test2 = '"blabla"';
        // const test6 = '[a, b, c]'; // elements need to be converted to strings
        // const test8 = 'a, b, c'; // elements need to be converted to strings
        // const test7 = '["a", "b", "c"]';
        // const test9 = '"a", "b", "c"';
        // const test3 = '{ a : b }'; // Not valid obj
        // const test4 = '{ "a" : b }'; // Not valid obj
        // const test5 = '{ a : "b" }'; // Not valid obj
        // const test10 = '{ "a" : "b" }';
        // const test11 = '[{ "a" : "b" }]';
        // Remove []
        // Make elements for each ' '
        // Remove ""
        const jsonArr = parsedInputValue.replace(/([^\[\],\s]+)/g, '"$&"');
        try {
          parsedInputValue = JSON.parse(jsonArr);
        } catch {
          parsedInputValue = null;
        }
        if (!parsedInputValue || typeof parsedInputValue === 'string') parsedInputValue = this.inputValue.split(' ');
      }
      return parsedInputValue;
    }
  }
  // watch: {
  //   inputValue() {
  //     if (this.interactionInputType('object')) return; // Does not work for objects
  //     this.changeBtnInputValue();
  //   }
// }
});
</script>



<style scoped>
.btn-selection-container-selected {
  background: #305E5C !important;
}

.btn-selection-container-selected :hover {
  background: #305E5C !important;
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
    border: 1px solid #393B3A;
    border-radius: 3px;
    height: 100%;
    padding: 3px;
    font-size: 14px;
    width: 70%;
    background: none;
} 

.input-dropdown {
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

.input-dropdown-content {
  padding: 3px;
  display: none;
  position: absolute;
  background-color: #f1f1f1;
  left: -100%;
  width: 200%;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  z-index: 1;
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

.input-dropdown-content label{
  display: block;
}

.select-btn-container {
    width: 30%;
    height: 100%;
    text-align: center
}

.select-btn-container img{
    max-height: 100%;
    object-fit: contain;
    max-width: 100%;
    padding: 5px;
}
</style>

