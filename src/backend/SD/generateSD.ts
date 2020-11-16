import {  
          interactionType,
          loopType,
          structureType,
          typeToTd,
          singToPlural} from "./util"


// Defines
/**
 * smaller value -> protocol is preferred over others
 * equal values are allowed
 * protocols that are not included in the list will not be accepted
 */
const PROTOCOL_SELECTION = {
  http: 0,
  https: 1,
  coap: 2,
  coaps: 3,
  mqtt: 4,
  null: 10
}

// determine filePaths
const mashupTemplatePath = "./mashup-template.json";

export default function generateSD(umlMashupLogic: SDSQ.mashupLogic, TdsFileContent: string) {

  // Parse Tds
  const fileContentsTds: SDSQ.tdTemplate[] = JSON.parse(TdsFileContent);

  // ------------ Program -------------

    let mashupSD = initSd(fileContentsTds, umlMashupLogic.name);
    mashupSD = fillSd(umlMashupLogic, PROTOCOL_SELECTION, fileContentsTds, mashupSD);
    mashupSD = parseStrctWrapper(umlMashupLogic, mashupSD);
    return JSON.stringify(mashupSD, null, 4);
}



// ----------------------------------


/**
 * read the template file, generate SD title, $id, base,...
 *
 * @param filepath path to the mashup template (.json)
 * @param tds The Array containing the Thing Descriptions
 * @returns The SD mashup template enhanced with the generated meta information
 */
function initSd(
  tds: SDSQ.tdTemplate[],
  mashupName?: string
): SDSQ.sdTemplate & {actions; properties; events; base; id; functions; variables} {
  const mashupTemplateProto: SDSQ.sdTemplate & {
      actions, properties, events, base, id, functions, variables
    } = {
      "@context": [
        "https://www.w3.org/2019/wot/td/v1",
        {
          "@language": "en"
        }
      ],
      "id": "de:tum:ei:esi:MashDE:",
      "@type": "Thing",
      "title": "",
      "description": "a mashup generated with MashDE",
      "securityDefinitions": {
        "nosec_sc": {
          "scheme": "nosec"
        }
      },
      "security": "nosec_sc",
      "things": {},
      "variables": {},
      "properties": {},
      "actions": {},
      "functions": {},
      "events": {}
    } as any
  let genName = "Mashup";

  // add title and id
  const addedTitles = [""]
  tds.forEach(td => {
    mashupTemplateProto.id += td.title.replace(/[^a-zA-Z0-9:]/g, "");
    genName += td.title;
    const noSpaceTitle = td.title.replace(/ /g, "");

    if (addedTitles.some(el => (el === noSpaceTitle))) {
      throw new Error("two Things in the Mashup have the same Title: " + td.title);
    }
    addedTitles.push(noSpaceTitle);

    mashupTemplateProto.things[noSpaceTitle] = {
      $id: "#" + noSpaceTitle,
      base: "example://-",
      properties: {},
      actions: {},
      events: {}
    };
  });
  mashupTemplateProto.id += ":";
  mashupTemplateProto.title = mashupName ? mashupName : genName;

  return mashupTemplateProto;
}

/**
 * Add all necessary forms to the SD
 * prefers protocols according to the protocolSelection
 * if a form is already added with a different op property
 * just an additional op value will be added
 *
 * @param umlStrct Mashup application logic
 * @param protocolSelection Priorities of protocols to prefer
 * @param tds The Array containing the Thing Descriptions
 * @param mashupTemplateProto The prefilled SD mashup template
 * @returns The SD mashup template enhanced by the interaction forms
 */
function fillSd(
  umlStrct: SDSQ.mashupLogic,
  protocolSelection: SDSQ.validProtocols,
  tds: SDSQ.tdTemplate[],
  mashupTemplateProto: SDSQ.sdTemplate & {actions; properties; events; base; id; functions; variables}
): SDSQ.sdTemplate & {actions; properties; events; base; id; functions; variables} {
  const isAdded: SDSQ.interactionAll[] = []

  // add forms for all application logic
  if (umlStrct.root) {parseStrct(umlStrct.root)}
  Object.keys(umlStrct.actions).forEach(p => parseStrct(umlStrct.actions[p]));
  Object.keys(umlStrct.functions).forEach(p => parseStrct(umlStrct.functions[p]));
  Object.keys(umlStrct.properties).forEach(p => parseStrct(umlStrct.properties[p]));


  return mashupTemplateProto;

  // TODO add new structure types: get, set, ref
  function parseStrct(strctArray: SDSQ.structureEl[]) {
    strctArray.forEach( strct => {
      if (strct.type === structureType.interact) {
        addForms(strct.receiveIntrcts);
        addForms(strct.sendIntrcts);
      } else if (strct.type === structureType.case) {
          parseStrct(strct.content);
          if(strct.elseContent) { parseStrct(strct.elseContent) }
      } else if (strct.type === structureType.loop) {
        parseStrct(strct.content);
      } else {
        // do nothing
      }
    });
  }

  /**
   * add required thing form for every interaction
   * @param umlIntrcts array of interactions
   */
  function addForms(umlIntrcts: SDSQ.interactionAll[]) {

    umlIntrcts.forEach((interact, intrIdx) => {
      let addIdx = 0

      if (isAdded.some((el, idx) =>   {
          const equal = (el.type === interact.type &&
                  el.name === interact.name &&
                  el.to === interact.to);
          if (equal) {
            const h = isAdded[idx].formRef;
            if (h === undefined) {throw new Error("problem with add idx");}
            addIdx = h;
          }
          return equal;
        })) {
        umlIntrcts[intrIdx].formRef = addIdx;
      } else {
        tds.forEach(td => {
          const noSpaceTitle = td.title.replace(/ /g, "");
          if (noSpaceTitle === interact.to) {
              if(Object.values(interactionType).includes(interact.type)) {
              let firstForm: boolean
              const nextOp: string = interactionType[interact.type].toLowerCase();
              const ttDIntr: string = typeToTd[interactionType[interact.type]];

              // add properties, actions or events if not already there
              if (mashupTemplateProto.things[noSpaceTitle][ttDIntr][interact.name] === undefined) {
                mashupTemplateProto.things[noSpaceTitle][ttDIntr][interact.name] = {forms: [ { } ] };
                firstForm = true;
              } else {
                firstForm = false;
              }

              // determine which form to choose
              let formCandidates: SDSQ.tdForms[] = td[ttDIntr][interact.name].forms.filter(
                candidate => {
                  if (!candidate.op) {
                    switch(ttDIntr) {
                      case "properties":
                        if(nextOp === "readproperty" || nextOp === "writeproperty") return true;
                        break;
                      case "actions":
                        if(nextOp === "invokeaction") return true;
                        break;
                      case "events":
                        if(nextOp === "subscribeevent") return true;
                        break;
                    }
                    return false;
                  }
                  else if (typeof candidate.op === "string") {
                    return (candidate.op === nextOp);
                  } else {
                    return candidate.op.some(opEl => opEl === nextOp);
                  }
                }
              )

              // add base for relative links protocol given
              formCandidates = formCandidates.map(el => {
                if(el.href.includes("://")) {return el;}
                else {

                  el.href = td ? td.base + el.href : el.href;
                  return el;
                }
              })

              // filter for forms that have no href included in protocol_selection

              formCandidates = formCandidates ? formCandidates.filter(candidate => {
                let tmp = candidate.href.split("://", 2).shift();
                const candidateProtocol = tmp ? tmp : "null";
                if (candidateProtocol in protocolSelection && candidateProtocol !== "null") {
                  return true;
                } else {
                  return false;
                }
              }) : undefined  ? formCandidates : [];

              // no candidate left?
              if (formCandidates.length === 0) {
                throw new Error("no valid form available for interaction:" + interact.name +
                        " to:" + interact.to +
                        " of type:" + interactionType[interact.type]);
              }

              // sort the forms in a way, that the first one is the "best" (->according to protocolSelection)
              formCandidates.sort( (a, b) => {
                let tmp1 = a.href.split("://", 2).shift();
                let tmp2 = b.href.split("://", 2).shift();
                const aProt = tmp1 ? tmp1 : "null";
                const bProt = tmp2 ? tmp2 :  "null";
                return (protocolSelection[aProt] - protocolSelection[bProt]);
              })


              const formProto: {[key: string]: any} = {}
              Object.keys(formCandidates[0]).forEach(prop => {
                if (prop !== "op") {
                  formProto[prop] = formCandidates[0][prop];
                }
              });
              formProto.op = nextOp;

              if (firstForm) {
                mashupTemplateProto.things[noSpaceTitle][ttDIntr][interact.name].forms[0] = formProto;
                interact.formRef = 0;
              } else {
                // check if any form is like formCandidate[0] except of op
                let safeIdx: number|undefined;
                /* eslint-disable-next-line max-len */
                const addToForm: SDSQ.tdForms = mashupTemplateProto.things[noSpaceTitle][ttDIntr][interact.name].forms.filter(
                  (possibleForm: SDSQ.tdForms, idx: number) => {
                    let fit = true;
                    Object.keys(possibleForm).forEach( formProp => {
                      if (formProp !== "op" &&
                        (formCandidates[0][formProp] === undefined ||
                         formCandidates[0][formProp] !== possibleForm[formProp])
                      ) {
                        fit = false;
                      }
                    });
                    Object.keys(formCandidates[0]).forEach( formProp => {
                      if (formProp !== "op" &&
                        (possibleForm[formProp] === undefined ||
                         possibleForm[formProp] !== formCandidates[0][formProp])
                      ) {
                        fit = false;
                      }
                    })
                    if (fit) {safeIdx = idx;}
                    return fit;
                  }
                )

                if (addToForm.length === 1 && safeIdx !== undefined) {
                  // an existing form fits the form needed for the current interaction

                  // add op to the existing form if it is not already included
                  if ( (typeof addToForm[0].op === "string" && addToForm[0].op !== nextOp) ||
                     (typeof addToForm[0].op === "object" && addToForm[0].op.every(el => el !== nextOp))) {
                       const add = [nextOp].concat(addToForm[0].op);
                       mashupTemplateProto.things[noSpaceTitle][ttDIntr][interact.name].forms[safeIdx].op = add;
                  }
                  interact.formRef = safeIdx;
                } else if (addToForm.length === 0) {
                  // no already added form fits the one to add -> add a new one
                  interact.formRef = mashupTemplateProto.things[noSpaceTitle][ttDIntr][interact.name].forms.length;
                  mashupTemplateProto.things[noSpaceTitle][ttDIntr][interact.name].forms.push(formProto);
                } else if (safeIdx === undefined) {
                  throw new Error("index of existing form was not safed but add to form is not 0");
                } else {
                  throw new Error("more then one existing form fits new form?");
                }
              }

              // update base url if protocol of added form is preferred (default is null -> will be updated always)
              if(interact.formRef === undefined){throw new TypeError();}
              let baseProto = td[ttDIntr][interact.name].forms[interact.formRef].href.split("://", 2);

              // add base for relative links protocol given
              if(!td[ttDIntr][interact.name].forms[interact.formRef].href.includes("://")) {
                baseProto = td.base ? td.base + td[ttDIntr][interact.name].forms[interact.formRef].href : undefined;
              }

              const filledBase = mashupTemplateProto.things[noSpaceTitle].base.split("://", 2);

              if (
                baseProto[0] in protocolSelection &&
                protocolSelection[baseProto[0]] < protocolSelection[filledBase[0]]
              ) {
                baseProto = [baseProto[0], ...baseProto[1].split("/", 3)];
                mashupTemplateProto.things[noSpaceTitle].base = baseProto[0] + "://" +
                                      baseProto[1] + "/" + baseProto[2];
              }

            } else {
              throw new Error("(formfill) unknown interaction type: " + interactionType[interact.type]);
            }
          }
        })

        isAdded.push(interact);

      }
    })
  }
}

/**
 * generates the SD `path` properties content from the Mashup application logic
 * @param wholeStrctArray structure of the application logic of the Mashup
 * @param mashupTemplate SD draft that will be enhanced
 */
function parseStrctWrapper(
  wholeStrctArray: SDSQ.mashupLogic,
  mashupTemplate: SDSQ.sdTemplate & {actions; properties; events; base; id; functions; variables}
) {
  if (wholeStrctArray.root) {mashupTemplate.path =  parseStructure(wholeStrctArray.root);}

  Object.keys(wholeStrctArray.actions).forEach( elName => {
    mashupTemplate.actions[elName] = {
      forms: [{
        href: "example://actions/" + elName
      }],
      path: parseStructure(wholeStrctArray.actions[elName])
    };
  })

  Object.keys(wholeStrctArray.functions).forEach( elName => {
    mashupTemplate.functions[elName] = {
      forms: [{
        href: "example://functions/" + elName
      }],
      path: parseStructure(wholeStrctArray.functions[elName])
    };
  })

  Object.keys(wholeStrctArray.properties).forEach( elName => {
    mashupTemplate.properties[elName] = {
      forms: [{
        href: "example://properties/" + elName
      }],
      path: parseStructure(wholeStrctArray.properties[elName])
    };
  })

  return mashupTemplate

  /**
   * recursive callable function for parent function
   * @param strctArray object structured application logic elements
   */
  function parseStructure(strctArray: SDSQ.structureEl[]): SDSQ.pathEl[] {

    const pathProto: SDSQ.pathEl[] = []

    strctArray.forEach( strct => {
      switch (strct.type) {

        case structureType.interact:

          pathProto.push({
            receive: parseReceiveInteractions(strct.receiveIntrcts),
            send: parseSendInteractions(strct.sendIntrcts),
            breakOnDataPushed: strct.breakOnDataPushed
          });

          break;

        case structureType.case:

          const structIfconv = (inS: SDSQ.comparison) => {
            let outS: SDSQ.ifWord;
            if(inS.type === "not") {outS = {not: structIfconv(inS.not)};}
            else if(inS.type === "all") {outS = {allOf: inS.allOf.map( el => structIfconv(el))};}
            else if(inS.type === "one") {outS = {oneOf: inS.oneOf.map( el => structIfconv(el))};}
            else if(inS.type === "any") {outS = {anyOf: inS.anyOf.map( el => structIfconv(el))};}
            else if(inS.type === "var") {

              let output;

              if(typeof inS.value === "object") {
                output = {
                  $ref: "#/" + singToPlural[inS.value.type] + "/" + inS.value.name
                };
                initIfReq(inS.variable.name, "boolean", inS.variable.type);
              } else if (typeof inS.value === "number" || typeof inS.value === "string") {
                output = inS.value;
              }
              initIfReq(inS.variable.name, "boolean", inS.variable.type)
              outS = {
                get:{$ref: "#/" + singToPlural[inS.variable.type] + "/" + inS.variable.name},
                output
              };
            } else {
              throw new Error("strange if");
            }
            return outS;
          }

          pathProto.push(
            {
              case: {
                if: structIfconv(strct.condition),
                then: {
                  path: parseStructure(strct.content)
                },
                else: (strct.elseContent) ? {path: parseStructure(strct.elseContent)} : {}
              }
            }
          );

          break;

        case structureType.loop:

          if (strct.loopOpts.type === loopType.timed) {
            pathProto.push(
              {
                loop: {
                  type: "timed",
                  defaultInput: strct.loopOpts.period,
                  path: parseStructure(strct.content)
                }
              }
            );
          } else if (strct.loopOpts.type === loopType.logic && strct.loopOpts.exCount === "forever") {
            pathProto.push(
              {
                loop: {
                  type: "logical",
                  defaultInput: true,
                  path: parseStructure(strct.content)
                }
              }
            );
          } else if (strct.loopOpts.type === loopType.logic && (typeof strct.loopOpts.exCount === "number") ) {
            pathProto.push(
              {
                loop: {
                  type: "logical",
                  defaultInput: strct.loopOpts.exCount,
                  path: parseStructure(strct.content)
                }
              }
            );
          } else {
            throw new Error("loop cannot be translated to SD");
          }

          break;

        case structureType.wait:

          pathProto.push({wait: strct.waitTime});

          break;

        case structureType.ref:
          pathProto.push({$ref: "#/" + singToPlural[strct.ref.type] + "/" + strct.ref.name + "/path"});
          break;

        case structureType.get:
          pathProto.push({get: genGetSetRef(strct.get)});
          break;

        case structureType.set:
          let get; let defaultInput;
          if(strct.get) get = genGetSetRef(strct.get);
          if (strct.defaultInput !== undefined) defaultInput = strct.defaultInput;
          pathProto.push({
            set: genGetSetRef(strct.set), get, defaultInput
          });
          break;
      }
    })
    if(pathProto.length === 0){throw new Error("empty path problem");}

    return pathProto;
  }

  /**
   * generate a path element for an array of receiving interactions
   * @param intrctArray Array of interaction receive objects
   */
  function parseReceiveInteractions(intrctArray: SDSQ.interactionReceive[]) {
    const pathPrototype: SDSQ.pathInteractReceive[] = [];

    intrctArray.forEach( currentIntrct => {

      let set;
      if (currentIntrct.set) {
        set = genGetSetRef(currentIntrct.set);
      }

      pathPrototype.push({
        form: {$ref: genFormRef(currentIntrct)},
        op: interactionType[currentIntrct.type].toLowerCase() as any,
        set
      });

    })
    return pathPrototype;
  }

  /**
   * generate a path element for an array of send interactions
   * @param intrctArray Array of interaction send objects
   */
  function parseSendInteractions(intrctArray: SDSQ.interactionSend[]) {
    const pathPrototype: SDSQ.pathInteractSend[] = [];

    intrctArray.forEach( currentIntrct => {
      let get; let defaultInput;

      if (currentIntrct.get) get = genGetSetRef(currentIntrct.get);
      if (currentIntrct.defaultInput) defaultInput = currentIntrct.defaultInput;
      pathPrototype.push({
        form: {$ref: genFormRef(currentIntrct)},
        op: interactionType[currentIntrct.type].toLowerCase() as any,
        get,
        defaultInput
      });
    });

    return pathPrototype;
  }

  // ##############################################
  // ----------- helper functions ------------
  // ##############################################
  function genGetSetRef(arg: {name: string; type: "property"|"variable"}) {
    initIfReq(arg.name, undefined, arg.type);
    return {$ref: "#/" + singToPlural[arg.type] + "/" + arg.name};
  }

  function genFormRef( Intrct: SDSQ.interactionAll ) {
    if (Intrct.formRef === undefined) {
      throw new Error("unknown which form to choose: " + Object.keys(Intrct).map(el => el + "->" + Intrct[el]).join(" "));
    }
    return ["#" + Intrct.to, [typeToTd[interactionType[Intrct.type]]], Intrct.name, "forms", Intrct.formRef].join("/");
  }

  function initIfReq( varname: string, type?: string, varOrProp: "variable" | "property" = "variable" ) {

    if (mashupTemplate[singToPlural[varOrProp]][varname] === undefined){
      if (varOrProp === "property") {
        mashupTemplate.properties[varname] = {
          forms: [{
            href: "example://properties/" + varname
          }],
          type
        };
      } else {
        mashupTemplate.variables[varname] = {type};
      }
    }

  }
}
