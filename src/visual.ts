/*
*  Power BI Visual CLI
*
*  Copyright (c) Microsoft Corporation
*  All rights reserved.
*  MIT License
*
*  Permission is hereby granted, free of charge, to any person obtaining a copy
*  of this software and associated documentation files (the ""Software""), to deal
*  in the Software without restriction, including without limitation the rights
*  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
*  copies of the Software, and to permit persons to whom the Software is
*  furnished to do so, subject to the following conditions:
*
*  The above copyright notice and this permission notice shall be included in
*  all copies or substantial portions of the Software.
*
*  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
*  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
*  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
*  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
*  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
*  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
*  THE SOFTWARE.
*/
"use strict";

import "core-js/stable";
import "./../style/visual.less";
import powerbi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbi.VisualObjectInstance;
import DataView = powerbi.DataView;
import IVisualEventService = powerbi.extensibility.IVisualEventService;
import VisualObjectInstanceEnumerationObject = powerbi.VisualObjectInstanceEnumerationObject;

import { VisualSettings } from "./settings";
import { AcceptRiskSettings } from "./settings";
import { HtmlSettings } from "./settings";
import { json } from "d3";
import { getValue } from "powerbi-visuals-utils-dataviewutils/lib/dataViewObjects";
//import createPurify from "dompurify";
import * as dompurify from "dompurify";

export class Visual implements IVisual {
    private target: HTMLElement;
    private events: IVisualEventService;

    private acceptRiskHtmlText: Text;
    private acceptRiskHtml: HTMLElement;
    private htmlTarget: HTMLElement;
    //private updateCount: number;
    private settings: VisualSettings;
    private acceptRiskSettings: AcceptRiskSettings;
    //private textNode: Text;
    //private viewJson: HTMLElement;
    private acceptRisk: boolean = true;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);

        this.acceptRisk = true;

        this.target = options.element;
        this.events = options.host.eventService;

        this.acceptRiskSettings = new AcceptRiskSettings();
        this.acceptRiskSettings.htmlSettings = new HtmlSettings();
        this.acceptRiskSettings.htmlSettings.htmlRiskProperty = false;



        if (document) {
            this.acceptRiskHtml = document.createElement("div");
            //this.acceptRiskHtml.innerText = "ACCEPT THE HTML RISK";
            this.acceptRiskHtmlText = document.createTextNode("YOU NEED TO ACCEPT THE HTML RISK IN FORMAT SETTINGS");
            this.acceptRiskHtml.appendChild(this.acceptRiskHtmlText);
            this.target.appendChild(this.acceptRiskHtml);

            this.htmlTarget = document.createElement("div");
            this.target.appendChild(this.htmlTarget);
            this.htmlTarget.className = "aci-html-wrapper";
        }
    }

    public update(options: VisualUpdateOptions) {
        this.events.renderingStarted(options);

        this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
        //this.acceptRiskSettings = Visual.parseAcceptRisk(options && options.dataViews && options.dataViews[0]);
        this.acceptRiskSettings = AcceptRiskSettings.parse<AcceptRiskSettings>(options.dataViews[0]);
        if (this.acceptRiskSettings.htmlSettings.htmlRiskProperty) {
            this.acceptRiskHtml.style.display = "none";
            this.htmlTarget.style.display = "";
        } else {
            this.acceptRiskHtml.style.display = "";
            this.htmlTarget.style.display = "none";
        }

        //if (options.dataViews[0].metadata.objects) {
        //    getValue(options.dataViews[0].metadata.objects,"htmlSettings","")
        //}

        //this.acceptRisk = !this.acceptRisk;//this.acceptRiskSettings.htmlSettings.htmlRiskProperty;




        if (this.acceptRiskHtml) {
            //this.acceptRiskHtmlText.textContent += JSON.stringify(this.acceptRiskSettings);
            //this.acceptRiskHtmlText.textContent += JSON.stringify(options.dataViews[0].metadata.objects);
            if (options.dataViews && options.dataViews[0] && options.dataViews[0].metadata.objects && options.dataViews[0].metadata.objects["acceptHtmlRisk"]) {
                //this.acceptRisk = options.dataViews[0].metadata.objects["acceptHtmlRisk"].$instances[0]
                //this.acceptRisk.toString();
            }
        }

        console.log('Visual update', options);
        if (this.htmlTarget) {
            try {
                const dataView: DataView = options
                    && options.dataViews
                    && options.dataViews[0];
                const HTMLString = dataView.single.value.toString();
                if (typeof this.htmlTarget !== "undefined") {
                    try {
                        //const purify = createPurify()
                        //this.htmlTarget.innerText = dompurify.sanitize(HTMLString);
                        this.htmlTarget.innerHTML = dompurify.sanitize(HTMLString);
                    } catch (ex1) {
                        this.htmlTarget.innerHTML = "<div>" + JSON.stringify((<Error>ex1).message) + "</div>"; 
                    }
                }
            }
            catch (exception) {

            }
        }
        this.events.renderingFinished(options);
    }



    private static parseSettings(dataView: DataView): VisualSettings {
        return <VisualSettings>VisualSettings.parse(dataView);
    }
    private static parseAcceptRisk(dataView: DataView): AcceptRiskSettings {
        return <AcceptRiskSettings>AcceptRiskSettings.parse(dataView);
    }

    /**
     * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
     * objects and properties you want to expose to the users in the property pane.
     *
     */
    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        //return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);


        let objectName: string = options.objectName;
        let objectEnumeration: VisualObjectInstance[] = [];

        switch (objectName) {
            case 'htmlSettings':
                //const viObj: VisualObjectInstance = new VisualObjectInstance();
                objectEnumeration.push({
                    objectName: objectName,
                    displayName: "pushed displayName",
                    properties: {
                        htmlRiskProperty: this.acceptRiskSettings.htmlSettings.htmlRiskProperty
                    },
                    selector: null
                });
                break;
        };



        return objectEnumeration;

    }


}