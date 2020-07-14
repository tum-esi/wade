import TdConsumer from "./TdConsumer";
import TdParser from "./TdParser";
import PerformancePrediction from "./PerformancePrediction";
import ConfidenceCalculator from "./ConfidenceCalculator";
import {
  PossibleInteractionTypesEnum,
  TdStateEnum,
  InteractionStateEnum,
  ProtocolEnum
} from "@/util/enums";
import { isDevelopment } from "@/util/helpers";
import MessageHandler from "./MessageHandler";
import VtCall from "./VtCall";
import * as stream from "stream";
import * as fs from "fs";
import * as path from "path";

let tdConsumer: any = null;

export function retrieveProtocols(td: string): ProtocolEnum[] | null {
  const protocols = [] as ProtocolEnum[];
  let tdJson;
  try {
    tdJson = JSON.parse(td);
  } catch (error) {
    return protocols;
  }

  // Check forms of properties and add protocols
  function addProtocols(interactions) {
    for (const el in interactions) {
      if (!interactions.hasOwnProperty(el)) continue;
      if (!interactions[el].forms) break;
      for (const form of interactions[el].forms) {
        if (form.href && form.href.indexOf("http") !== -1) {
          protocols.push(ProtocolEnum.HTTP);
        }
        if (form.href && form.href.indexOf("https") !== -1) {
          protocols.push(ProtocolEnum.HTTPS);
        }
        if (form.href && form.href.indexOf("mqtt") !== -1) {
          protocols.push(ProtocolEnum.MQTT);
        }
        if (form.href && form.href.indexOf("coap") !== -1) {
          protocols.push(ProtocolEnum.COAP);
        }
        if (form.href && form.href.indexOf("coaps") !== -1) {
          protocols.push(ProtocolEnum.COAPS);
        }
      }
    }
  }

  if (tdJson.properties) addProtocols(tdJson.properties);
  if (tdJson.actions) addProtocols(tdJson.actions);
  if (tdJson.events) addProtocols(tdJson.events);

  return Array.from(new Set(protocols));
}

export function updateStatusMessage(
  tdState: TdStateEnum | null,
  errorMsg: string | null,
  interactionState: InteractionStateEnum | null
): { message: string; error: boolean } {
  const messageHandler = new MessageHandler(
    tdState,
    errorMsg,
    interactionState
  );
  return messageHandler.getStatusMessage();
}

// Return vue-parsed td, td state information and possible errors
export async function consumeAndParseTd(
  td: string,
  config: object,
  protocols: ProtocolEnum[]
) {
  let consumedTd;
  // TODO: Check whenever a new TdConsumer is needed
  if (!tdConsumer) {
    tdConsumer = new TdConsumer(td, config, protocols);
    consumedTd = await tdConsumer.getConsumedTd();
  } else {
    tdConsumer.setConsumer(td, config, protocols);
    consumedTd = await tdConsumer.getConsumedTd();
  }

  if (consumedTd.tdState !== TdStateEnum.VALID_CONSUMED_TD) {
    return {
      tdParsed: null,
      errorMsg: consumedTd.errorMsg,
      tdState: consumedTd.tdState
    };
  }
  const parsedTd = new TdParser(consumedTd.tdConsumed, protocols).getParsedTd();
  return {
    tdParsed: parsedTd,
    errorMsg: null,
    tdState: consumedTd.tdState
  };
}

export async function resetAll() {
  // TODO:
  // delete TdConsumer
  // delete TdParser
  // -> rewrite getParsedTd -> TdConsumer/ TdParser global & new methods 'reset', 'init', ..
}

export function calculateConf(results: any, settings: any) {
  const confCalculator = new ConfidenceCalculator(results, settings);
  const calculated = confCalculator.calculateAll();
}

export async function startPerformancePrediction(
  interactions: any,
  settings: WADE.PerformanceMeasurementSettings
) {
  // Alien vs. Predictor
  const performancePredictor = new PerformancePrediction(
    interactions,
    settings.settingsMeasurementType,
    settings.settingsConfidenceLevel,
    settings.settingsDelayType,
    settings.settingsDelayDuration,
    settings.settingsIterations,
    settings.settingsDuration,
    settings.settingsNumMeasurements,
    settings.settingsNumClients
  );

  // Calculate confidence interval of performance measurements
  const performanceResult = await performancePredictor.getPerformance();

  // Return performance measurements enhanced with confidence interval calculations
  return performanceResult;
}

export async function invokeInteractions(selectedInteractions) {
  let resultProps: any[] = [];
  let resultActions: any[] = [];
  let resultEvents: any[] = [];

  for (const interaction in selectedInteractions) {
    if (!selectedInteractions.hasOwnProperty(interaction)) {
      continue;
    }

    const {
      interactionName,
      interactionSelectBtn,
      interactionTitle,
      interactionType
    } = selectedInteractions[interaction];

    console.log(selectedInteractions);

    switch (interactionType) {
      case PossibleInteractionTypesEnum.PROP_READ:
        if (interactionSelectBtn.interaction) {
          // Invoke property read (no input)
          let resultProp = await selectedInteractions[
            interaction
          ].interactionSelectBtn.interaction();

          resultProp = resultProp.error
            ? { Error: resultProp.error }
            : { [interactionName]: resultProp.res };

          // Set property object for component
          resultProps.push({
            resultType: PossibleInteractionTypesEnum.PROP_READ,
            resultTitle: interactionTitle,
            resultValue: resultProp,
            resultTime: `${resultProp.s} sec ${resultProp.ms} ms`,
            resultError: resultProp.error ? true : false,
            resultSize: resultProp.size
          });
        }
        break;

      case PossibleInteractionTypesEnum.PROP_WRITE:
        if (interactionSelectBtn.interaction) {
          // Invoke property write (with input)
          let resultProp = await selectedInteractions[
            interaction
          ].interactionSelectBtn.interaction(interactionSelectBtn.input);

          resultProp = resultProp.error
            ? { Error: resultProp.error }
            : { [interactionName]: resultProp.res };

          // Set property object for component
          resultProps.push({
            resultType: PossibleInteractionTypesEnum.PROP_READ,
            resultTitle: interactionTitle,
            resultValue: resultProp,
            resultTime: `${resultProp.s}sec ${resultProp.ms}ms`,
            resultError: resultProp.error ? true : false,
            resultSize:
              resultProp.size === undefined
                ? "n.a."
                : `Input ${resultProp.size}`
          });
        }
        break;

      case PossibleInteractionTypesEnum.PROP_OBSERVE_READ:
      case PossibleInteractionTypesEnum.PROP_OBSERVE_WRITE:
        if (interactionSelectBtn.interaction) {
          let resultProp = await selectedInteractions[
            interaction
          ].interactionSelectBtn.interaction();

          resultProp = resultProp.error
            ? { Error: resultProp.error }
            : { [interactionName]: resultProp.res };

          resultProps.push({
            resultType: PossibleInteractionTypesEnum.PROP_OBSERVE_READ,
            resultTitle: interactionTitle,
            resultValue: resultProp,
            resultError: resultProp.error ? true : false
          });
        }
        break;

      case PossibleInteractionTypesEnum.EVENT_SUB:
        if (interactionSelectBtn.interaction) {
          let resultEvent = await selectedInteractions[
            interaction
          ].interactionSelectBtn.interaction();

          console.log(resultEvent);

          // TODO: resultEvent is simply object with callbakcs (errors will be handled with callbacks)

          // OPTION 1) how it already was
          resultEvent = resultEvent.error ? resultEvent.error : resultEvent;

          // OPTION 2) not as object e.g. "lorem ipsum"
          // resultEvent = resultEvent.error
          //   ? { Error: resultEvent.error }
          //   : { [interactionName]: resultEvent.res }; // TODO: udpate to resultEvent.res for consitency with properties/actions

          // OPTION 3) as object { maintenance: "lorem ipsum" }?
          // resultEvent = resultEvent.error
          //   ? { Error: resultEvent.error }
          //   : { res: resultEvent.res };

          resultEvents.push({
            resultType: PossibleInteractionTypesEnum.EVENT_SUB,
            resultTitle: interactionTitle,
            resultValue: resultEvent,
            resultError: resultEvent.error ? true : false
          });
        }
        break;

      case PossibleInteractionTypesEnum.EVENT_UNSUB:
        // TODO: notify when unsubscribed
        break;

      case PossibleInteractionTypesEnum.ACTION:
        if (interactionSelectBtn.interaction) {
          // Invoke action (possibily with input)
          let resultAction = await selectedInteractions[
            interaction
          ].interactionSelectBtn.interaction(interactionSelectBtn.input);

          // TODO: DO WE NEED RESULT AS OBJECT FOR ACTIONS

          // OPTION 1) as object e.g. { abort: "Success" }
          resultAction = resultAction.error
            ? { Error: resultAction.error }
            : { [interactionName]: resultAction.res };

          // OPTION 2) as object with "res" as key e.g. { res: "Success" }?
          // resultAction = resultAction.error
          //   ? { Error: resultAction.error }
          //   : { res: resultAction.res };

          // Set property object for component
          resultActions.push({
            resultType: PossibleInteractionTypesEnum.ACTION,
            resultTitle: interactionTitle,
            resultValue: resultAction,
            resultTime: `${resultAction.s} sec ${resultAction.ms} ms`,
            resultError: resultAction.error ? true : false,
            resultSize: resultAction.size
          });
        }
        break;

      default:
        break;
    }
  }

  return {
    resultProps,
    resultActions,
    resultEvents
  };
}

export function createNewVt(
  VtConfig: string,
  writeOut: stream.Writable,
  writeError: stream.Writable,
  Td: string
) {
  return new Promise((res, rej) => {
    const newVtCall = new VtCall(VtConfig, writeOut, writeError, Td);

    newVtCall.launchVt().then(
      () => {
        res(newVtCall);
      },
      err => {
        rej(new Error("creating Virtual Thing had problems:" + err));
      }
    );
  });
}

export function removeVt(VT: VtCall) {
  return new Promise((res, rej) => {
    VT.stopVt().then(
      () => {
        VT = null as any;
        res();
      },
      err => {
        rej(err);
      }
    );
  });
}

export function showExampleTds() {
  return new Promise((res, rej) => {
    let pathToExamples: string;

    if (isDevelopment()) {
      if (process.platform === "darwin") {
        pathToExamples = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "..",
          "..",
          "..",
          "..",
          "..",
          "example-tds"
        );
      } else {
        pathToExamples = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "..",
          "..",
          "..",
          "example-tds"
        );
      }
    } else {
      if (process.resourcesPath) {
        pathToExamples = path.join(process.resourcesPath, "example-tds");
      } else {
        pathToExamples = "";
        rej(new Error("process resources Path is undefined"));
      }
    }

    fs.readdir(pathToExamples, (err, fileList) => {
      if (err) {
        rej(new Error("Problem at reading example tds: " + err));
      } else {
        const output = [] as WADE.DropdownOptionInterface[];
        fileList.forEach((file, ind) => {
          output.push({ title: file.slice(0, -5), key: file });
        });
        res(output);
      }
    });
  });
}

export function loadExampleTd(exampleTdPath: string) {
  return new Promise((res, rej) => {
    let pathToExamples: string;

    if (isDevelopment()) {
      if (process.platform === "darwin") {
        pathToExamples = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "..",
          "..",
          "..",
          "..",
          "..",
          "example-tds"
        );
      } else {
        pathToExamples = path.join(
          __dirname,
          "..",
          "..",
          "..",
          "..",
          "..",
          "..",
          "example-tds"
        );
      }
    } else {
      if (process.resourcesPath) {
        pathToExamples = path.join(process.resourcesPath, "example-tds");
      } else {
        pathToExamples = "";
        rej(new Error("process resources Path is undefined"));
      }
    }

    fs.readFile(path.join(pathToExamples, exampleTdPath), (err, data) => {
      if (err) {
        rej(new Error("Problem at reading the example Td file: " + err));
      } else {
        let output: string;
        output = data.toString();
        res(output);
      }
    });
  });
}
