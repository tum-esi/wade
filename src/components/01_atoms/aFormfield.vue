<template>
  <div class="form-field-baisic-container">
    <div class="form-field-basic-container">
      <label>{{form.title}}</label>
      <input
        :class="{ 'error-input' : hasError || hasDuplicateError}"
        :placeholder="form.placeholder"
        v-on:click="hasError=false, hasDuplicateError=false"
        v-model="input"
      >
      <label v-if="hasError" class="error">{{ errorMessage }}</label>
      <label v-if="hasDuplicateError" class="error">{{ errorDuplicateMessage }}</label>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
    name: 'aFormfield',
    props: {
        form: {
        type: Object as () => WADE.BasicFormFieldInterface,
        required: true
        }
    },
  data() {
    return {
      input: '',
      hasError: false,
      hasDuplicateError: false,
      key: this.form.key
    };
  },
  computed: {
    errorMessage(): any {
      if (
        this.form.isRequired &&
        this.form.rules &&
        this.form.rules.errorMessage
      ) {
        return this.form.rules.errorMessage;
      } else {
        return '';
      }
    },
    errorDuplicateMessage(): string {
      if (this.form.rules && this.form.rules.errorMessageDuplicate) {
        return this.form.rules.errorMessageDuplicate;
      } else {
        return '';
      }
    }
  },
  created() {
    this.$eventHub.$on('check-has-error', this.checkError);
  },
  beforeDestroy() {
    this.$eventHub.$off('check-has-error');
  },
  methods: {
    // Is called by parent component to check if all inputs are correct
    checkError() {
      if (this.form.isRequired && this.input === '') {
        this.hasError = true;
        return; // Return when there's already an error here
      } else {
        this.hasError = false;
      }
      // Check if form is unique if it has to be unique
      if (this.form.mustBeUnique) {
        // check store if unique id
        this.hasDuplicateError =
          (this.input !== '')
          && this.$store.getters['SidebarStore/doesIdAlreadyExist'](this.input);
      }
    }
  }
});
</script>

<style scoped>
.form-field-basic-container label {
  font-weight: bold;
  float: left;
  clear: both;
  padding-bottom: 10px;
  font-size: 16px;
}

.form-field-basic-container input {
  float: left;
  clear: both;
  border-radius: 3px;
  outline: none;
  border: 1px solid #b4bab9;
  width: 100%;
  padding: 10px;
  font-size: 14px;
}

.form-field-basic-container input:active, .form-field-basic-container input:focus {
    box-shadow: 0 0 5px #b4bab9;
}

.error-input {
  box-shadow: 0 0 5px #ab7c79;
}

.form-field-basic-container .error {
  padding: 10px 0px 0px 2px;
  font-weight: normal;
  color: #ab7c79;
  display: initial;
}
</style>


