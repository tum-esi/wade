<!--  Button with selection option -->
<template>
  <div
    :class="getButtonSelectedStyle"
    class="btn-selection-container"
  >
    <button 
      v-if="btnLabel" 
      class="select-btn-label" 
      :class="btnGeneralStyle"
    >
      {{ btnLabel }}
    </button>
    <button 
      v-else-if="!btnLabel" 
      :class="getBtnStyle"
    >
      {{ getBtnLabel }}
    </button>

    <div class="select-btn-container">
      <img class="select-btn"
        @click.prevent="!interactionReadAll ? changeSelection() : null" 
        :src="!btnDisabled ? currentSrc : srcSelectionNotPossible"/>
    </div>

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'aButtonSelect',
  created() {
    this.$eventHub.$on('selections-reseted', () => {
      this.btnSelected = false;
      this.currentSrc = this.srcUnselected;
    });
  },
  beforeDestroy() {
    this.$eventHub.$off('selections-reseted');
  },
  data() {
    return {
      btnSelected: false,
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
     * Optional value, which indicates button enablement.
     */
    btnDisabled: {
      type: Boolean,
      required: false,
      default: false
    },
    interactionReadAll: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    interactionReadAll() {
      if (this.interactionReadAll === undefined || this.interactionReadAll === null) return;

      if (this.btnKey.endsWith('read')) {
        if (this.interactionReadAll) {
          if (this.btnSelected) {
            this.changeSelection();
          }

          this.btnSelected = true;
          this.currentSrc = this.srcSelected;
          this.$emit('select-read-all');
        } else {
          this.btnSelected = false;
          this.currentSrc = this.srcUnselected;
          this.$emit('deselect-read-all');
        }
      }
    }
  },
  computed: {
    getBtnStyle(): string {
      return this.btnDisabled ? `select-btn-label ${this.btnGeneralStyle} disabled` : `select-btn-label ${this.btnGeneralStyle}`;
    },
    getBtnLabel(): string {
      return this.btnSelected ? 'Selected' : 'Select';
    },
    getButtonSelectedStyle(): string {
      return this.btnSelected && !this.btnDisabled ? 'btn-selection-container-selected' : '';
    }
  },
  methods: {
    onClick() {
      if (this.btnOnClickEvent) { this.$emit(this.btnOnClickEvent, this.btnOnClickValue); }
      this.btnSelected ? this.$emit('select') : this.$emit('deselect');
    },
    changeSelection() {
      if (!this.btnDisabled) {
        this.btnSelected = !this.btnSelected;
        this.currentSrc = this.btnSelected ? this.srcSelected : this.srcUnselected;
        this.onClick();
      }
    }
  }
});
</script>



<style scoped>
.btn-selection-container-selected {
  background: #305E5C !important;
}

.btn-selection-container-selected :hover {
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
  border-bottom-right-radius: 3px;
  border-top-right-radius: 3px;
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

