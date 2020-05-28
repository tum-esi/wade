import { ThingDescription } from 'wot-typescript-definitions';
import { TypeOfMeasurementContext, MeasurementTypeEnum } from '@/util/enums';
import { ConfLevel } from '@/util/helpers';

// TODO: Form element to annotate
// Dynamic / Static Timing must be added to  specific form element -> right now we do not know which form-element thus which HREF is used. That's why it is currently added to the first existant form element

// TODO: Static Timing
// Implement static timing annotation
// Until now only the annotation with dynamic timing is working,
// as static timing computation is not yet included in W-ADE

export default class TdAnnotater {

    private _td: ThingDescription;
    private _performanceMeasurements: any;

    constructor(td: string, performanceMeasurements: any) {
        this._td = JSON.parse(td);
        this._performanceMeasurements = performanceMeasurements;

        // For each performance measurement result, annotate TD
        this._performanceMeasurements.forEach(element => {
            const addedInteractionResults = this._findInteraction(element);

            // Check wether results are not null
            if (!Object.values(addedInteractionResults).some(el => el === null)) {
                // Add measurment context and get it's path
                const path =
                    this._addMeasurementContext(addedInteractionResults.typeOfMeasurementContext, addedInteractionResults.elName, element);

                // Finally add dynamicTiming
                this._addDynamicTiming(addedInteractionResults.tdElement, path, element, addedInteractionResults.typeOfMeasurementContext);
            }
        });
    }
    /**
     * Return annotated TD.
     */
    public getAnnotatedTD(): ThingDescription {
        return this._td;
    }

    /**
     * Find interaction in TD for performanceMeasurement element.
     * Return it, together with its name and the type of measurementContext.
     *
     * @param performanceMeasurement
     */
    private _findInteraction(performanceMeasurement: any): {
        typeOfMeasurementContext: TypeOfMeasurementContext,
        tdElement: any,
        elName: string
    } {
        let typeOfMeasurementContext = TypeOfMeasurementContext.NULL;
        let tdElement: any;

        // 'Clean' name -> 'write'/'read' was added by W-ADE
        const elName = ['write', 'read', 'Write', 'Read'].some(el => performanceMeasurement.name.includes(el)) ? performanceMeasurement.name.replace(/(: write|: read)/ig, '') : performanceMeasurement.name;

        // Check if property
        if (this._td.properties[elName]) {
            // Check wether it is a read or write propery
            typeOfMeasurementContext =
                performanceMeasurement.name.toLowerCase().includes('write') ? TypeOfMeasurementContext.DYNAMIC_PROPERTY_WRITE : TypeOfMeasurementContext.DYNAMIC_PROPERTY_READ;
            tdElement = this._td.properties[elName];
        }

        // Check if action
        if (this._td.actions[elName]) {
            typeOfMeasurementContext = TypeOfMeasurementContext.DYNAMIC_ACTION;
            tdElement = this._td.actions[elName];
        }

        return { typeOfMeasurementContext, tdElement, elName};
    }


    /**
     * Create 'dynamicTiming' object and add it to the according td interaction.
     *
     * @param tdElement td interaction element (property / action)
     * @param pathOfMeasurementContext json link path for measurement context
     * @param performanceMeasurement measurement results
     * @param typeOfMeasurementContext
     */
    private _addDynamicTiming(
        tdElement: any,
        pathOfMeasurementContext: string,
        performanceMeasurement: any,
        typeOfMeasurementContext: TypeOfMeasurementContext) {
        // 'forms' should definetely exist, but well you never know
        if (!tdElement.forms) return;

        // Check if dynamicTiming element already exists & create it if required
        if (!tdElement.forms[0].dynamicTiming) tdElement.forms[0].dynamicTiming = [];

        // Add new element to 'dynamicTiming'
        tdElement.forms[0].dynamicTiming.push({
            type: typeOfMeasurementContext,
            measurementContext: pathOfMeasurementContext,
            possible: {
                firstMeasured: performanceMeasurement.firstMeasured,
                BCET: performanceMeasurement.possible.BCET,
                WCET: performanceMeasurement.possible.WCET,
                AET: {
                    AET: performanceMeasurement.possible.AET,
                    confidenceIntervalMin:
                        performanceMeasurement.possible.confidenceResults.confMin,
                    confidenceIntervalMax:
                        performanceMeasurement.possible.confidenceResults.confMax
                } as WADE.InteractionTimingAET
            } as WADE.InteractionTimingTimeBounds,
            realistic: {
                firstMeasured: performanceMeasurement.firstMeasured,
                BCET: performanceMeasurement.realistic.BCET,
                WCET: performanceMeasurement.realistic.WCET,
                AET: {
                    AET: performanceMeasurement.realistic.AET,
                    confidenceIntervalMin:
                        performanceMeasurement.realistic.    confidenceResults.confMin,
                    confidenceIntervalMax:
                        performanceMeasurement.realistic.confidenceResults.confMax
                } as WADE.InteractionTimingAET
            } as WADE.InteractionTimingTimeBounds,
            confidence: {
                level:
                    performanceMeasurement.settingsConfidenceLevel && typeof performanceMeasurement.settingsConfidenceLevel === 'string' ? parseInt(this._performanceMeasurements[0].settingsConfidenceLevel.replace('%', '') ) : performanceMeasurement.settingsConfidenceLevel,
                factor:
                    ConfLevel.get(performanceMeasurement.settingsConfidenceLevel),
                numMeasurments: {
                    realistic: performanceMeasurement.realistic.all.length,
                    possible: performanceMeasurement.possible.all.length
                }
            } as WADE.InteractionTimingConfidence
        } as WADE.InteractionTimingDynamicTiming);
    }

    /**
     * Create measurementContext in TD if non-existent & add new element to it.
     * Returns JSONlink path to newly created element.
     *
     * @param type of measurementContext
     * @param interactionName
     * @param data measurementContext data
     */
    private _addMeasurementContext(
        type: TypeOfMeasurementContext,
        interactionName: string,
        data: any)
        : string {
        // Create measurementContext if non-existent
        if (!this._td.measurementContext) this._td.measurementContext = [];

        // Create new element and add it to the measurementContext
        this._td.measurementContext.push({
            [`${type}/${interactionName}`]: {
                repetitions:
                    data.overallIterations && typeof data.overallIterations === 'string' ? parseInt(data.overallIterations) : data.overallIterations,
                duration:
                    data.overallDuration && typeof data.overallDuration === 'string' ? parseFloat(data.overallDuration) : data.overallDuration,
                measurement: {
                    type: data.settingsMeasurementType,
                    amount:
                        data.settingsMeasurementType === MeasurementTypeEnum.NUM_RUNS ?
                        (data.settingsIterations && typeof data.settingsIterations === 'string' ? parseFloat(data.settingsIterations) : data.settingsIterations ? data.settingsIterations : null)
                        :  (data.settingsDuration && typeof data.settingsDuration === 'string' ? parseInt(data.settingsDuration) : data.settingsDuration ? data.settingsDuration : null)
                },
                delay: {
                    type: data.settingsDelayType,
                    duration: data.settingsDelayDuration
                },
                output: data.output,
                input: data.input
            } as WADE.InteractionTimingMeasurementContextElement
        });

        // Return JSON path to this element
        // Info: measurementContext is added to the first level of TD
        return `#/measurementContext/${type}/${interactionName}`;
    }
}
