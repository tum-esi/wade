<!--  Button with selection option -->
<template>
  <div
    :class="getButtonSelectedStyle"
    class="btn-selection-container"
  >
    <button v-if="btnLabel" class="select-btn-label" :class="btnGeneralStyle" >{{ btnLabel }}</button>
    <button v-else-if="!btnLabel" class="select-btn-label" :class="btnGeneralStyle">{{ getBtnLabel }}</button>
    
    <!-- <div class="select-btn-container">
      
      <input class="select-btn" id="select-btn" type="radio" :value="btnSelected" :checked="btnSelected" />
    </div> -->
    <div class="select-btn-container">
      <img class="select-btn" @click.prevent="changeSelection" :src="currentSrc"/>
    </div>

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'aButtonSelect',
  data() {
    return {
      btnSelected: false,
      currentSrc: require('@/assets/circle.png'),
      srcUnselected: require('@/assets/circle.png'),
      srcSelected: require('@/assets/checked_circle.png')
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
    }
  },
  computed: {
    getBtnLabel(): string {
      return this.btnSelected ? 'Selected' : 'Select';
    },
    getButtonSelectedStyle(): string {
      return this.btnSelected ? 'btn-selection-container-selected' : '';
    }
  },
  methods: {
    onClick() {
      if (this.btnOnClickEvent) { this.$emit(this.btnOnClickEvent, this.btnOnClickValue); }
      this.btnSelected ? this.$emit('select') : this.$emit('deselect');
    },
     changeSelection() {
        this.btnSelected = !this.btnSelected;
        this.currentSrc = this.btnSelected ? this.srcSelected : this.srcUnselected;
        this.onClick();
    }
  }
});
</script>



<style scoped>
.btn-selection-container-selected {
  background: #305E5C !important;
}

.btn-selection-container {
  background: #b5dfdd;
  height: 100%;
  background: #b5dfdd;
  display: flex;
  height: 100%;
  align-items: center;
  padding: 3px;
}

.btn-selection-container button {
  width: 70%;
  font-size: 14px;
  outline: none; 
  border: none;
  background: none; 
}

.btn-selection-container button:active button:focus{
  outline: none; 
  border: none;
}

.btn-selection-container:hover {
  color: #fff;
  background: #92afae;
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

.select-btn-label{
  text-align: left;
  padding-left: 7px;
}
</style>

