<template>
  <div class="form-field-baisic-container">
    <div class="form-field-basic-container">
      <label>{{form.title}}</label>
      <input
        :class="{ 'error-input' : hasError }"
        :placeholder="form.placeholder"
        v-on:click="hasError=false"
        v-model="input"
      >
      <label v-if="hasError" class="error">{{ errorMessage }}</label>
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
      } else {
        this.hasError = false;
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
  padding-top: 10px;
  font-weight: normal;
  color: #ab7c79;
  display: initial;
}
</style>


