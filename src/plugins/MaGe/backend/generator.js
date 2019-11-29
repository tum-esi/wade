"use strict";

import * as Plantuml from "plantuml-encoder";
import * as Combinatorics from "js-combinatorics";
import * as _ from "lodash";
import * as Fs from "fs";
import * as Request from "request";
import * as Crypto from "crypto";
import * as Filters from "./filters.js";
import * as Utils from "./utils.js";

Request.defaults({encoding: null});

/** generate all the possible combinations of interactions for a given list of things and a given length */ 
async function generate_interaction_combinations(things, templates, filters = {}) {
    let events = []
    let property_reads = []
    let action_reads = []
    let property_writes = []
    let actions = []
    
    // get and categorize all input interactions
    things.input_tds.forEach( thing_description => {
        let interactions = get_input_interactions(thing_description, filters.accepted_types)
        events.push(...interactions.events)
        property_reads.push(...interactions.properties)
        action_reads.push(...interactions.actions)
    })

    // get and categorize all output interactions
    things.output_tds.forEach( thing_description => {
        let interactions = get_output_interactions(thing_description, filters.accepted_types)
        actions.push(...interactions.actions)
        property_writes.push(...interactions.properties)
    });
    // TODO: add possibility to only select actions or property writes
    let outputs = [...property_writes, ...actions] 

    // for each input, get matching outputs based on filters
    async function get_matching_output_combinations(input) {
        let matching_outputs = await get_matching_outputs(input, outputs, filters)
        let matching_output_combinations = []
        for (let i = things.min_outputs; i <= things.max_outputs; i++) {
            if (i > matching_outputs.length) break
            matching_output_combinations.push(...Combinatorics.bigCombination(matching_outputs, i).toArray())
        }
        return matching_output_combinations
    }

    for (let input of events) {
        input.matching_output_combinations = await get_matching_output_combinations(input)
    }
    for (let input of property_reads) {
        input.matching_output_combinations = await get_matching_output_combinations(input)
    }
    for (let input of action_reads) {
        input.matching_output_combinations = await get_matching_output_combinations(input)
    }

    // remove inputs without matching outputs
    events = events.filter(event => event.matching_output_combinations.length > 0)
    property_reads = property_reads.filter(property => property.matching_output_combinations.length > 0)
    action_reads = action_reads.filter(action => action.matching_output_combinations.length > 0)

    // Calculate all possible output combinations for each input combinations and put them together
    let interaction_combinations = []
    
    if (templates.subscribe && !templates.read && !templates.action) {
        interaction_combinations.push(...get_final_combinations(events, things))
    } else if (templates.read && !templates.subscribe && !templates.action) {
        interaction_combinations.push(...get_final_combinations(property_reads, things))
    } else if (templates.read && templates.subscribe && !templates.action) {
        interaction_combinations.push(...get_final_combinations([...events, ...property_reads], things))
    } else if (templates.read && templates.action && !templates.subscribe) {
        interaction_combinations.push(...get_final_combinations([...action_reads, ...property_reads], things))
    } else if (templates.subscribe && !templates.action && !templates.read) {
        interaction_combinations.push(...get_final_combinations([...events, ...action_reads], things))
    } else if (templates.subscribe && templates.action && templates.read) {
        interaction_combinations.push(...get_final_combinations([...events, ...action_reads, ...property_reads], things))
    }

    return interaction_combinations
}

/** parse a TD to return all interactions that can serve as an input */
function get_input_interactions(thing_description, accepted_types) {
    let events = []
    let property_reads = []
    let action_reads = []
    for (let prop in thing_description.properties) {
        if (!thing_description.properties[prop].writeOnly) {
            if (accepted_types) {
                if (!accepted_types.includes(thing_description.properties[prop].type)) continue
            }
            property_reads.push({
                "interaction_type": "property-read", 
                "name": prop,
                "object": thing_description.properties[prop],
                "from": "Agent",
                "to": thing_description.title,
                "thing_id": thing_description.id
            })
        }
    }
    for (let event in thing_description.events) {
        if (accepted_types) {
            if (!thing_description.events[event].data || !accepted_types.includes(thing_description.events[event].data.type)) continue
        }
        events.push({
            "interaction_type": "event",
            "name": event,
            "object": thing_description.events[event],
            "from": "Agent",
            "to": thing_description.title,
            "thing_id": thing_description.id
        })
    }
    for (let action in thing_description.actions) {
        if (!thing_description.actions[action].output) continue
        if (accepted_types) {
            if (!accepted_types.includes(thing_description.actions[action].output.type)) continue
        }
        action_reads.push({
            "interaction_type": "action-read",
            "name": action,
            "object": thing_description.actions[action],
            "from": "Agent",
            "to": thing_description.title,
            "thing_id": thing_description.id
        })
    }
    return { "events": events, "properties": property_reads, "actions": action_reads }
}

/** parse a TD to return all interactions that can serve as an output */
function get_output_interactions(thing_description, accepted_types) {
    let actions = []
    let property_writes = []
    for (let prop in thing_description.properties) {
        if (!thing_description.properties[prop].readOnly) {
            if (accepted_types) {
                if (!accepted_types.includes(thing_description.properties[prop].type)) continue
            }
            property_writes.push({
                "interaction_type": "property-write",
                "name": prop,
                "object": thing_description.properties[prop],
                "from": "Agent",
                "to": thing_description.title,
                "id": Crypto.createHash("sha1").update(thing_description.id+prop).digest("hex"),
                "thing_id": thing_description.id
            })
        }
    }
    for (let action in thing_description.actions) {
        if (accepted_types) {
            if (!thing_description.actions[action].input || !accepted_types.includes(thing_description.actions[action].input.type)) continue
        }
        actions.push({
            "interaction_type": "action",
            "name": action,
            "object": thing_description.actions[action],
            "from": "Agent",
            "to": thing_description.title,
            "id": Crypto.createHash("sha1").update(thing_description.id+action).digest("hex"),
            "thing_id": thing_description.id
        })
    }
    return { "actions": actions, "properties": property_writes }
}

/** filter a list of outputs to match a given input (event or property_read) */
async function get_matching_outputs(input, outputs, filters) {
    if (filters.only_same_type) {
        outputs = outputs.filter(element => Filters.same_type(input, element))
    }
    if (filters.similarity_threshold) {
        // since filter cannot by async, we have to filter manually.
        let new_outputs = []
        for (let element of outputs) {
            let filter_results = await Filters.similar(input, element, filters.similarity_threshold)
            if (filter_results) new_outputs.push(element)
        }
        return new_outputs
    }
    if (filters.semantic_match) {
        outputs = outputs.filter(element => Filters.same_semantics(input, element))
    }
    return outputs
}

/** for a list of inputs, return all possible input/output combinations */
function get_final_combinations(inputs, things) {
    let interaction_combinations = []

    // calculate all input combinations
    let all_input_combinations = []
    for (let i = things.min_inputs; i <= things.max_inputs; i++) {
        if (i > inputs.length) break
        all_input_combinations.push(...Combinatorics.bigCombination(inputs, i).toArray())
    }

    // filter input combinations that have more things than allowed
    if (things.max_things) all_input_combinations = all_input_combinations.filter(inputs_c => get_number_of_things(inputs_c) <= things.max_things)

    all_input_combinations.forEach(inputs_c => {
        let available_outputs = []
        inputs_c.forEach(input => {available_outputs.push(input.matching_output_combinations) }) 
        Utils.modified_cartesian_product(...available_outputs)
        .filter(outputs_c => (outputs_c.length <= things.max_outputs) && (outputs_c.length >= things.min_outputs))
        .forEach(outputs_c => {
            interaction_combinations.push([...inputs_c, ...outputs_c])
        })
    })

    // filter final combinations that have more things than allowed
    if (things.max_things) interaction_combinations = interaction_combinations.filter(ios_c => get_number_of_things(ios_c) <= things.max_things)

    return interaction_combinations
}

/** Returns the number of Things that participate in a given list on interactions */
function get_number_of_things(interactions) {
    let thing_ids = []
    interactions.forEach(inter => {
        if (!thing_ids.includes(inter.thing_id)) thing_ids.push(inter.thing_id)
    })
    return thing_ids.length
}

/** Generate PlantUML textual code for a mashup
 * 
 * @param {Array} interactions - Array of interaction (ie: a mashup)
 */
function generate_UML(interactions) {
    let uml = "@startuml\n"
    interactions.forEach( interaction => {
        // Determine interaction label and return path
        if (interaction.interaction_type === "property-read")
            uml += `"${interaction.from}" -> "${interaction.to}" : read: "${interaction.name}"\n`
        else if (interaction.interaction_type === "property-write")
            uml += `"${interaction.from}" -> "${interaction.to}" : write: "${interaction.name}"\n`
        else if (interaction.interaction_type === "action")
            uml += `"${interaction.from}" -> "${interaction.to}" : invoke: "${interaction.name}"\n`
        else if (interaction.interaction_type === "event")
            uml += `"${interaction.from}" -> "${interaction.to}" : subscribe: "${interaction.name}"\n`
        
        // determine return path
        if (interaction.interaction_type === "property-read") {
            uml += `activate "${interaction.to}"\n`
            uml += `"${interaction.to}" --> "${interaction.from}" : response\n`
            uml += `deactivate "${interaction.to}"\n`
        } else if (interaction.interaction_type === "event") {
            uml += `activate "${interaction.to}"\n`
            uml += `"${interaction.to}" --> "${interaction.from}" : event-triggered\n`
            uml += `deactivate "${interaction.to}"\n`
        }
    })
    uml += "@enduml"
    return uml
}

// TODO change to online version/ node plantUML
/** if folder is given, save images in folder and return their names, if not, return PlantUML hash addresses. */
function generate_PNG(uml, plantuml_server="http://localhost:8080/plantuml/", folder) {
    let umlhash = Plantuml.encode(uml)

    if (folder) {
        let sha1hash = Crypto.createHash("sha1").update(umlhash).digest("hex")
        return new Promise((resolve, reject) => {
            Request(plantuml_server + "img/" + umlhash, (err, res, body) => {
                if (err) {
                    console.log(err);
                } else if (res.statusCode == 200) {
                    Fs.writeFile(folder + sha1hash + ".png", body, (err) => {
                        if (err) {console.error(err); reject()}
                        else resolve(sha1hash + ".png")
                    })
                } else {
                    console.warn("PlantUML HTTP response code: " + res.statusCode)
                    reject()
                }
            })
        })
    } else {
        return new Promise((resolve, reject) => {
            resolve(plantuml_server + "img/" + umlhash)
        })
    }
}

/** calculate size of design space ( how many mashups would be possible without any rules or filters ) */
function get_design_space_size(things) {
    let design_space_size = 0
    let n = 0

    let td_ids = []
    let unique_tds = []
    things.input_tds.concat(things.output_tds).forEach(td => {
        if (!td_ids.includes(td.id)) {
            unique_tds.push(td)
            td_ids.push(td.id)
        }
    })

    unique_tds.forEach(element => {
        if (element.properties) n += Object.keys(element.properties).length
        if (element.actions) n += Object.keys(element.actions).length
        if (element.events) n += Object.keys(element.events).length
    })

    let max_k = Number(things.max_inputs) + Number(things.max_outputs)
    let min_k =  Number(things.min_inputs) + Number(things.min_outputs)
    if (max_k > n) max_k = n
    for (let i = min_k; i <= max_k; i++) {
        design_space_size += ( Utils.factorial(n) / ( Utils.factorial(i) * Utils.factorial(n - i) ) )
    }

    return design_space_size
}

/** Main function to generate mashups. Calls all other functions. */
export async function generate_mashups(input) {
    let intraction_combinations = await generate_interaction_combinations(input.things, input.templates, input.filters)

    let design_space_size = get_design_space_size(input.things)

    let total_mashups =  intraction_combinations.length
    console.log(`${total_mashups} mashups can be generated from given parameters. Design space size is: ${design_space_size}`)

    let results = {
        "design_space_size": design_space_size,
        "mashups_generated": total_mashups
    }

    // create PNGs
    let images = []
    for (let combi of intraction_combinations) {
        let uml = generate_UML(combi)
        images.push( await generate_PNG(uml) )
    }

    results.images = images
    results.mashups = intraction_combinations 

    return results
}
