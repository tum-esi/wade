<template>

<body class="done-loading">
  <div class="container">
    <div id="title">
      <br><br>
      <h1><b>MAGE</b>: A WoT <b>Ma</b>shup <b>Ge</b>nerator</h1><br><br>
    </div>

    <!-- Choose TDs -->

    <h5>Available TDs</h5>
    <div class="card border-primary">
      <h6 class="card-header border-primary bg-transparent">
        <ul class="nav nav-tabs card-header-tabs">
          <li class="nav-item">
            <a class="nav-link active" id="inputs-tab" data-toggle="tab" href="#inputs">Inputs</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" id="outputs-tab" data-toggle="tab" href="#outputs">Outputs</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" data-toggle="tab" href="#ios">Input/Ouputs</a>
          </li>
        </ul>
      </h6>
      <div class="tab-content" id="myTabContent">

        <!-- Input TAB -->
        <div class="tab-pane fade show active" id="inputs">
          <div class="table-responsive-md">
            <table class="table table-hover">
              <!-- maybe add striped -->
              <thead>
                <tr>
                  <th scope="col" class="td-select-checkbox">Include</th>
                  <th scope="col" class="td-select-name">Thing Description</th>
                </tr>
              </thead>
              <tbody id="inputs-table">
              </tbody>
            </table>
          </div>
          <div class="card-body row justify-content-end">
            <div class="col-md-2">
              <a href="#" class="btn btn-primary float-right" id="add-input" @click="addInput()">Add TD</a><br>
            </div>
            <div class="col-md-1">
              <a href="#" class="btn btn-primary float-right td-reload" @click="tdReload()">Reload</a><br>
            </div>
          </div>
          <div class="card-footer">
            <div class="row justify-content-between">
              <p class="col-12">Number of input interactions per mashup: </p>
              <p class="col-md-1">Min:</p>
              <div class="col-md-4">
                <input type="number" id="min-inputs" value="1" min="1" max="15" step="1" />
              </div>
              <p class="col-md-2"></p>
              <p class="col-md-1">Max:</p>
              <div class="col-md-4">
                <input type="number" id="max-inputs" value="2" min="1" max="15" step="1" />
              </div>
            </div>
          </div>
        </div>

        <!-- Output TAB -->
        <div class="tab-pane fade" id="outputs">
          <div class="table-responsive-md">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col" class="td-select-checkbox">Include</th>
                  <th scope="col" class="td-select-name">Thing Description</th>
                </tr>
              </thead>
              <tbody id="outputs-table">

              </tbody>
            </table>
          </div>
          <div class="card-body row justify-content-end">
            <div class="col-md-2">
              <a href="#" class="btn btn-primary float-right" id="add-output" @click="addOutput">Add TD</a><br>
            </div>
            <div class="col-md-1">
              <a href="#" class="btn btn-primary float-right td-reload" @click="tdReload()">Reload</a><br>
            </div>
          </div>
          <div class="card-footer">
            <div class="row justify-content-between">
              <p class="col-12">Number of output interactions per mashup: </p>
              <p class="col-md-1">Min:</p>
              <div class="col-md-4">
                <input type="number" id="min-outputs" value="1" min="0" max="10" step="1" />
              </div>
              <p class="col-md-2"></p>
              <p class="col-md-1">Max:</p>
              <div class="col-md-4">
                <input type="number" id="max-outputs" value="2" min="0" max="10" step="1" />
              </div>
            </div>
          </div>
        </div>

        <!-- I/Os TAB -->
        <div class="tab-pane fade" id="ios">
          <div class="table-responsive-md">
            <table class="table">
              <thead>
                <tr>
                  <th scope="col" class="td-select-checkbox">Include</th>
                  <th scope="col" class="td-select-name">Thing Description</th>
                </tr>
              </thead>
              <tbody id="ios-table">

              </tbody>
            </table>
          </div>
          <div class="card-body row justify-content-end">
            <div class="col-md-2">
              <a href="#" class="btn btn-primary float-right" id="add-io" @click="addIo()">Add TD</a><br>
            </div>
            <div class="col-md-1">
              <a href="#" class="btn btn-primary float-right td-reload" @click="tdReload()">Reload</a><br>
            </div>
          </div>
        </div>

      </div>
    </div><br>

    <!-- Choose Template -->

    <h5>Choose a Mashup Template</h5>
    <div class="card-deck">
      <div class="card border-primary col-lg-4">
        <img src="./static/event-template.png" class="card-img-top template-img" alt="Template 1">
        <div class="card-body">
          <h5 class="card-title">Subscription-driven</h5>
          <p class="card-text">The interaction sequence starts when the mashup agent receives an event. The data from the event is then send to the matching outputs as input for an action or as a property write. </p>
        </div>
        <div class="card-footer">
          <div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" id="use-sub-template" checked>
            <label class="custom-control-label" for="use-sub-template">Use this template</label>
          </div>
        </div>
      </div>
      <div class="card border-primary col-lg-4">
        <img src="./static/read-template.png" class="card-img-top template-img" alt="Template 2">
        <div class="card-body">
          <h5 class="card-title">Read-driven</h5>
          <p class="card-text">The interaction sequence starts with the mashup agent reading a property from an input device. The data is then send to the matching outputs as input for an action or as a property write.</p>
        </div>
        <div class="card-footer">
          <div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" id="use-read-template">
            <label class="custom-control-label" for="use-read-template">Use this template</label>
          </div>
        </div>
      </div>
      <div class="card border-primary col-lg-4">
        <img src="./static/action-template.png" class="card-img-top template-img" alt="Template 3">
        <div class="card-body">
          <h5 class="card-title">Action-driven</h5>
          <p class="card-text">The interaction sequence starts with the mashup agent invoking an action that has an output from an input device. The received data is then send to the matching outputs as input for an action or as a property write.</p>
        </div>
        <div class="card-footer">
          <div class="custom-control custom-switch">
            <input type="checkbox" class="custom-control-input" id="use-action-template">
            <label class="custom-control-label" for="use-action-template">Use this template</label>
          </div>
        </div>
      </div>
    </div><br>

    <!-- Choose Filters -->

    <h5>Select filters and constraints</h5>
    <div class="card border-primary col-12">
      <form>
        <div class="row justify-content-left">
          <div class="col-md-6">
            <fieldset class="form-group">
              <legend class="col-form-label">Allowed Types:</legend>
              <div class="col">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="string" id="stringCheck" checked>
                  <label class="custom-control-label" for="stringCheck">
                    String
                  </label>
                </div>
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="integer" id="integerCheck" checked>
                  <label class="custom-control-label" for="integerCheck">
                    Integer
                  </label>
                </div>
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="number" id="numberCheck" checked>
                  <label class="custom-control-label" for="numberCheck">
                    Number
                  </label>
                </div>
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="boolean" id="booleanCheck" checked>
                  <label class="custom-control-label" for="booleanCheck">
                    Boolean
                  </label>
                </div>
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="array" id="arrayCheck">
                  <label class="custom-control-label" for="arrayCheck">
                    Array
                  </label>
                </div>
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="object" id="objectCheck">
                  <label class="custom-control-label" for="objectCheck">
                    Object
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          <div class="col-md-6">
            <fieldset class="form-group">
              <legend class="col-form-label">Interaction Matching Criteria:</legend>
              <div class="col">
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="" id="sameTypeCheck" checked>
                  <label class="custom-control-label" for="sameTypeCheck">
                    Only match interaction of the same type
                  </label>
                </div>
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="" id="similarityCheck">
                  <label class="custom-control-label" for="similarityCheck">
                    Only match interaction that have similar names
                  </label>
                </div>
                <div class="form-group hide row" id="similaritySliderGroup">
                    <label for="inputSimilarityRange" class="col-form-label col-12">Similarity threshold:</label>
                    <label for="inputSimilarityRange" id="simThresholdValue" class="col-form-label col-2">0.5</label>
                    <div class="col-sm-10">
                      <input type="range" class="custom-range" id="inputSimilarityRange" min="0" max="1" value="0.5" step="0.01">
                    </div>
                </div>
                <div class="custom-control custom-checkbox">
                  <input class="custom-control-input" type="checkbox" value="" id="semanticCheck">
                  <label class="custom-control-label" for="semanticCheck">
                    Only match interaction that have the same semantic ("@type") context.
                  </label>
                </div>
              </div>
            </fieldset>
          </div>
          <div class="col-md-6">
            <fieldset class="form-group">
                <legend class="col-form-label">Number of Things:</legend>
                <div class="col">
                  <div class="custom-control custom-checkbox">
                    <input class="custom-control-input" type="checkbox" value="" id="maxThingsCheck">
                    <label class="custom-control-label" for="maxThingsCheck">
                      Limit the number of Things per Mashup
                    </label>
                  </div>
                  <div class="form-group hide row" id="maxThingsGroup">
                      <label for="inputMaxThings" class="col-form-label col-12">Max Things per Mashup:</label>
                      <div class="col-12">
                          <input type="number" id="inputMaxThings" value="1" min="1" max="100" step="1" />
                      </div>
                  </div>
                </div>
              </fieldset>
          </div>
        </div>
      </form>
    </div>

    <!-- Submit button -->
    <br>
    <button id="submit-btn" class="btn btn-primary float-right" @click="mysubmitBtnF()">Generate Mashups</button>
    <br><br>

    <!-- Results -->
    <div class="results">
      <h5>Generated Mashups:</h5>
      <div class="card border-primary col-12">
        <div class="row justify-content-center">
          <div><p id="nrOfResults"></p></div>
          <div class="col-12 col-md-10 col-lg-8">
            <div id="resultsCarousel" class="carousel slide" data-interval="false">
              <div class="carousel-inner" id="resultsContainer">
                <!-- Result images will be added here -->
              </div>
              <a class="carousel-control-prev" href="#resultsCarousel" role="button" data-slide="prev">
                <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                <span class="sr-only">Previous</span>
              </a>
              <a class="carousel-control-next" href="#resultsCarousel" role="button" data-slide="next">
                <span class="carousel-control-next-icon" aria-hidden="true"></span>
                <span class="sr-only">Next</span>
              </a>
            </div>
          </div>
          <div class="explain col-12"><p id="currentMashupNr" class="center-txt"></p></div>
        </div>
      </div>

      <!-- Generate-code button -->
      <br>
      <button id="generate-btn" class="btn btn-primary float-right" @click="generateBtn()">Generate node-wot Code</button>
      <br><br>

    </div>

  </div>

  <!-- Add TD modal -->
  <div class="modal" tabindex="-1" role="dialog" id="tdModal">
      <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="td-modal-title"></h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <p>Add a TD:</p>
            <div id="tdBody"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" id="save-td">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Show Code Modal -->
    <div class="modal" tabindex="-1" role="dialog" id="codeModal">
      <div class="modal-dialog modal-xl" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Generated node-wot code</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            <div id="codeBody"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
            <button type="button" id="copy-code" class="btn btn-primary" @click="copyCode()">Copy</button>
          </div>
        </div>
      </div>
    </div>

  <!-- Loading screen -->
  <div class="loading-screen"></div>

</body>

</template>

<script lang="ts">

// TODO replace the generation of plantUML Sequence Charts with a node-version/online
// TODO replace word2vec with own implementation/ node version


import Vue from 'vue';

import './bootstrap/dist/custom.css';

import $ from 'jquery';

import './node_modules/bootstrap/dist/js/bootstrap.js';

import ace from 'brace';
import 'brace/mode/json';
import 'brace/theme/monokai';
import 'brace/mode/javascript';

import * as Api from './backend/api.js';
import { stringify } from 'querystring';

export default Vue.extend({
  name: 'pMaGe',
  methods: {
    mysubmitBtnF() {
      if (!check_inputs()) return;

      $('body').removeClass('done-loading');
      Api.generateMashup(get_form_input())
      .then( (data) => {
          $('body').addClass('done-loading');
          console.log('received data from generateMashup', data);
          show_results(data);
      }, (err) => {
        alert('Error while generating code:\n' + err);
      });
    },
    tdReload() {
      get_saved_tds();
    },
    addInput() {
      add_td('input');
    },
    addOutput() {
      add_td('output');
    },
    addIo() {
      add_td('io');
    },
    generateBtn() {

      $('body').removeClass('done-loading');

      Api.generateCode(get_codegen_input())
      .then( (data) => {
          $('body').addClass('done-loading');
          show_code(data);
      });

    },
    copyCode() {
      const temp = $('<textarea>');
      const editor = ace.edit('codeBody');
      $('body').append(temp);
      temp.val(editor.getValue()).focus().select();
      if (document.execCommand('copy')) alert('Text Copied to clipboard.');
      temp.remove();
    }
  }
});

/*
Web Interface for the MaGe mashup generator

Licence: Creative Commons
Author: Hassib Belhaj - Hassib.belhaj at tum.de
*/

let input_tds = [];
let output_tds = [];
let generated_mashups = [];


/** Function called when a list of TD is received from the backend.
 *
 * Updates the shown TDs and set event listeners to update selected TDs when a TD is checked/unchecked.
 * @param {Object} tds - An object with the inputs/outputs/ios properties. Each is an array of TD Objects.
 */
function showTDs(tds) {
    const input_ids = [];
    const output_ids = [];

    function row_from_td(td, typ) {
        return `<tr>
        <td>
          <div class="custom-control custom-checkbox">
            <input type="checkbox" class="custom-control-input" id="${typ}Check-${td.id}" checked>
            <label class="custom-control-label" for="${typ}Check-${td.id}"></label>
          </div>
        </td>
        <td>${td.title}</td>
      </tr>`;
    }

    // add event listener for checking/unchecking
    function setup_check_listener(td, typ) {
        if ((typ === 'input') || (typ === 'output')) {
            const ids = typ === 'input' ? input_ids : output_ids;
            const tds = typ === 'input' ? input_tds : output_tds;
            $(`[id="${typ}Check-${td.id}"]`).change(() => {
                if ($(`[id="${typ}Check-${td.id}"]`).is(':checked')) {
                    if (!ids.includes(td.id as never)) {
                        tds.push(td as never);
                        ids.push(td.id as never);
                    }
                } else {
                    if (ids.includes(td.id as never)) {
                        const indx = ids.indexOf(td.id as never);
                        ids.splice(indx, 1);
                        tds.splice(indx, 1);
                    }
                }
            });
        } else if (typ === 'io') {
            $(`[id="ioCheck-${td.id}"]`).change(() => {
                if ($(`[id="ioCheck-${td.id}"]`).is(':checked')) {
                    if (!input_ids.includes(td.id as never)) {
                        input_tds.push(td as never);
                        input_ids.push(td.id as never);
                    }
                    if (!output_ids.includes(td.id as never)) {
                        output_tds.push(td as never);
                        output_ids.push(td.id as never);
                    }
                } else {
                    if (input_ids.includes(td.id as never)) {
                        const indx = input_ids.indexOf(td.id as never);
                        input_ids.splice(indx, 1);
                        input_tds.splice(indx, 1);
                    }
                    if (output_ids.includes(td.id as never)) {
                        const indx = output_ids.indexOf(td.id as never);
                        output_ids.splice(indx, 1);
                        output_tds.splice(indx, 1);
                    }
                }
            });
        }
    }

    // handle inputs
    input_tds = [];
    $('#inputs-table').empty();
    tds.inputs.forEach(input => {
        if (!input_ids.includes(input.id as never)) {
            input_tds.push(input as never);
            input_ids.push(input.id as never);
            $('#inputs-table').append(row_from_td(input, 'input'));
            setup_check_listener(input, 'input');
        }
    });

    // handle outputs
    output_tds = [];
    $('#outputs-table').empty();
    tds.outputs.forEach(output => {
        if (!output_ids.includes(output.id as never)) {
            output_ids.push(output.id as never);
            output_tds.push(output as never);
            $('#outputs-table').append(row_from_td(output, 'output'));
            setup_check_listener(output, 'output');
        }
    });

    // handle ios
    $('#ios-table').empty();
    tds.ios.forEach(io => {
        $('#ios-table').append(row_from_td(io, 'io'));
        if (!input_ids.includes(io.id as never)) {
            input_tds.push(io as never);
            input_ids.push(io.id as never);
        }
        if (!output_ids.includes(io.id as never)) {
            output_tds.push(io as never);
            output_ids.push(io.id as never);
        }
        setup_check_listener(io, 'io');
   });
}

/** Perform some checks on the selected inputs before sending request to generator */
function check_inputs() {
    let allgood = true;
    let message = '';
    if (input_tds.length < 1) {
        allgood = false;
        message += 'Number of inputs must be higher than zero.\n';
    }
    if (output_tds.length < 1) {
        allgood = false;
        message += 'Number of outputs must be higher than zero.\n';
    }
    if ( $('#maxThingsCheck').is(':checked')
      && Number($('#inputMaxThings').val()) > (Number($('#max-inputs').val()) + Number($('#max-outputs').val())) ) {
        allgood = false;
        message += 'Not allowed: Max things > Max inputs + Max outputs.\n';
    }
    if (Number($('#min-inputs').val()) > Number($('#max-inputs').val())) {
        allgood = false;
        message += 'Min inputs can not be bigger than max inputs.\n';
    }
    if (Number($('#min-outputs').val()) > Number($('#max-outputs').val())) {
        allgood = false;
        message += 'Min outputs can not be bigger than max outputs.\n';
    }

    if (message !== '') alert(message);

    return allgood;
}

/** Get all the form data and send it to the backend. Called when Generate button is clicked */
function get_form_input() {
    const form = {
        things: { } as any,
        templates: { } as any,
        filters: {
            accepted_types: undefined as any,
            only_same_type: false,
            similarity_threshold: undefined as any,
            semantic_match: undefined as any
        },
        generation: {
            generate_code: false,
            include_function_skeletons: false
        }
    };
    // set nr of inputs / outputs
    form.things.input_tds = input_tds;
    form.things.output_tds = output_tds;
    form.things.min_inputs = Number($('#min-inputs').val());
    form.things.max_inputs = Number($('#max-inputs').val());
    form.things.min_outputs = Number($('#min-outputs').val());
    form.things.max_outputs = Number($('#max-outputs').val());
    if ($('#maxThingsCheck').is(':checked')) form.things.max_things = Number($('#inputMaxThings').val());

    // set templates
    form.templates.subscribe = $('#use-sub-template').is(':checked');
    form.templates.read = $('#use-read-template').is(':checked');
    form.templates.action = $('#use-action-template').is(':checked');

    // Set filters
    const checks = ['stringCheck', 'numberCheck', 'integerCheck', 'booleanCheck', 'arrayCheck', 'objectCheck'];
    const selectedChecks = [];
    checks.forEach(el => {
        const checkbox = $('#' + el);
        if (checkbox.is(':checked')) selectedChecks.push(checkbox.val() as never);
    });
    if (selectedChecks.length > 0) {
      form.filters.accepted_types = selectedChecks;
    }
    if ($('#sameTypeCheck').is(':checked')) {
      form.filters.only_same_type = true;
    }
    if ($('#similarityCheck').is(':checked')) {
      form.filters.similarity_threshold = Number($('#inputSimilarityRange').text());
    }
    if ($('#semanticCheck').is(':checked')) {
      form.filters.semantic_match = true;
    }

    // Code generation
    if ($('#codeGenCheck').is(':checked')) {
      form.generation.generate_code = true;
    }

    return form;
}

/** Get a refreshed list of TDs from backend. Called when refresh TDs clicked. Calls showTDs. */
function get_saved_tds() {

    $('body').removeClass('done-loading');

    Api.getTDs()
    .then( (res) => {
        $('body').addClass('done-loading');
        showTDs(res);
    });
}

// function get_saved_tds() {
//     $.ajax(
//         "/api/getTDs",
//         {
//             type: "GET",
//             dataType: "json",
//             success: showTDs
//         }
//     )
// }

/** Called when Add TD is clicked. Shows editor to add TD.
 *
 * @param {String} classification - which type of TD is being added: input / output / io
 */
function add_td(classification) {
    $('#tdModal').modal();
    $('#td-modal-title').text(`Add a TD as ${classification}`);

    const editor = ace.edit('tdBody');
    editor.getSession().setMode('ace/mode/json');
    editor.setSelectionStyle('text');
    editor.setTheme('ace/theme/monokai');
    editor.$blockScrolling = Infinity;
    editor.setValue('', -1);

    $('#save-td').off('click');
    $('#save-td').click(event => {
        const td = ace.edit('tdBody').getValue();
        let tdObj = {};
        try {
            tdObj = JSON.parse(td);
        } catch (err) {
            alert(err);
            return;
        }

        $('body').removeClass('done-loading');

        // TODO remove stringify??
        Api.addTD(JSON.stringify({td: tdObj, classification}))
        .then( () => {
            $('body').addClass('done-loading');
            get_saved_tds();
            $('#tdModal').modal('hide');
        }, (err) => {
            $('body').addClass('done-loading');
            alert(err);
        });
    });
}

/** Add img elements to show the generated mashups */
function show_results(data) {
    $('#resultsContainer').empty();
    $('#resultsContainerIndex').empty();
    generated_mashups = data.mashups;
    if (data.mashups_generated === 0) {
        hide_results();
        alert('Zero mashups match your criteria! please try using different filters or things.');
        return;
    }
    let added = false;
    if (data.images && data.images.length) {
        data.images.forEach(img => {
            if (!added) {
                $('#resultsContainer').append(`<div class="carousel-item active"><img src="${img}" class="d-block w-100"></div>`);
                added = true;
            } else {
                $('#resultsContainer').append(`<div class="carousel-item"><img src="${img}" class="d-block w-100"></div>`);
            }
        });
        $('#resultsCarousel').show();
        if (data.mashups && data.mashups.length) $('#generate-btn').show();
    }

    $('#currentMashupNr').text(`Mashup 1 / ${data.mashups_generated}`);
    $('#nrOfResults').text(data.mashups_generated +
      ' mashups conform to the selected criteria from a total of ' +
      data.design_space_size +
      ' possible mashups');

    $('.results').show();
    $('html,body').animate({ scrollTop: 9999 }, 'slow');
}

/** Hides the results section on page load */
function hide_results() {
    $('.results').hide();
    $('#resultsCarousel').hide();
    $('#generate-btn').hide();
}

/** Determine which mashup is currently selected */
function get_codegen_input() {
    // get the currently selected mashup
    const nr = Number($('#currentMashupNr').text().split(' ')[1]) - 1;
    const gen = { mashup: generated_mashups[nr], tds: {} };

    // get all relevant TDs for the selected mashup
    const idsUsed = [];
    (gen.mashup as any).forEach(element => {
        if (!idsUsed.includes(element.thing_id as never)) idsUsed.push(element.thing_id as never);
    });
    output_tds.concat(input_tds).forEach( (td) => {
        if (idsUsed.includes((td as any).id as never)) gen.tds[(td as any).id] = td;
    });
    gen.tds = Object.values(gen.tds);

    return gen;
}

/** Show the mashup code in a modal. Called when code is received from the backend. */
function show_code(code) {
    $('#codeModal').modal();

    const editor = ace.edit('codeBody');
    editor.getSession().setMode('ace/mode/javascript');
    editor.setSelectionStyle('text');
    editor.setTheme('ace/theme/monokai');
    editor.$blockScrolling = Infinity;
    editor.setValue(code, -1);
}


// -------------- Interface event listeners below --------------
// TODO check for every event handler if it works (jQuery events didn't always work in vue)

$('#inputSimilarityRange').on('input', event => {
    console.log('inputSimilarityRange -> input DEBUG');
    $('#simThresholdValue').text( $('#inputSimilarityRange').val() );
});

$('#similarityCheck').change(event => {
    console.log('similarityCheck -> change DEBUG');
    $('#similaritySliderGroup').toggleClass('hide');
});

$('#maxThingsCheck').change(event => {
    const min = Number($('#min-inputs').val()) + Number($('#min-outputs').val());
    const max = Number($('#max-inputs').val()) + Number($('#max-outputs').val());
    $('#inputMaxThings').attr({
        max,
        min
    });
    $('#maxThingsGroup').toggleClass('hide');
});

$('#max-inputs').change(event => {
    $('#min-inputs').attr({
        max : Number($('#max-inputs').val())
    });
});

$('#min-inputs').change(event => {
    $('#max-inputs').attr({
        min : Number($('#min-inputs').val())
    });
});

$('#max-outputs').change(event => {
    $('#min-outputs').attr({
        max : Number($('#max-outputs').val())
    });
});

$('#min-outputs').change(event => {
    $('#max-outputs').attr({
        min : Number($('#min-outputs').val())
    });
});

$('#resultsCarousel').on('slid.bs.carousel', event => {
    const p = $('#currentMashupNr');
    const total = p.text().split(' ');
    p.text(`Mashup ${event.to + 1} / ${total[total.length - 1]}`);
});

// This works (often)
$(document).ready(() => {
    hide_results();
    get_saved_tds();
});

</script>

<style scoped>

body {
    background-color: #E6E6EA;  
    /* 33b8a4 */
}

#title {
    text-align: center;
    /* font-family: 'Courier New', Courier, monospace; */
}

.td-select-checkbox {
    width: 50px;
}

.loading-screen {
    display:    block;
    position:   fixed;
    z-index:    1000;
    top:        0;
    left:       0;
    height:     100%;
    width:      100%;
    background: rgba( 255, 255, 255, .8 ) 
                url('/static/ajax-loader.gif') 
                50% 50% 
                no-repeat;
    overflow:   hidden; 
}

body.done-loading .loading-screen {
    overflow: visible;   
    display: none;
}

.hide {
    display: none
}

.template-img {
    width: 300px;
    height: 200px;
    align-self: center
}

.explain {
    color: dimgray;
    font-size: 80%;
}

.carousel-control-next,
.carousel-control-prev,
.carousel-indicators {
    filter: invert(100%);
}

.center-txt {
    text-align: center
}

#codeBody,
#tdBody{ 
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
}

.modal-dialog,
.modal-content {
    height: 90%;
}

</style>