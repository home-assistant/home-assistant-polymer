import { html, LitElement, PropertyDeclarations } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";
import "@polymer/paper-button/paper-button";
import "@polymer/paper-icon-button/paper-icon-button";
import "@polymer/paper-card/paper-card";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import "@polymer/iron-flex-layout/iron-flex-layout-classes";
import "../../../components/buttons/ha-call-service-button";
import "../../../components/ha-service-description";
import "../../../resources/ha-style";
import "../ha-config-section";

import { HomeAssistant } from "../../../types";
import { HassEntity } from "home-assistant-js-websocket";
import computeStateName from "../../../common/entity/compute_state_name";
import sortByName from "../../../common/entity/states_sort_by_name";
import { fireEvent } from "../../../common/dom/fire_event";
import { ItemSelectedEvent } from "./types";

import "./zha-entities";

export class ZhaNode extends LitElement {
  public hass?: HomeAssistant;
  public isWide?: boolean;
  public showHelp: boolean;
  public selectedNodeIndex: number;
  public selectedNode?: HassEntity;
  public serviceData?: {};
  private _haStyle?: DocumentFragment;
  private _ironFlex?: DocumentFragment;
  private _nodes: HassEntity[];

  constructor() {
    super();
    this.showHelp = false;
    this.selectedNodeIndex = -1;
    this._nodes = [];
  }

  static get properties(): PropertyDeclarations {
    return {
      hass: {},
      isWide: {},
      showHelp: {},
      selectedNodeIndex: {},
      selectedNode: {},
      serviceData: {},
    };
  }

  protected render(): TemplateResult {
    this._nodes = this._computeNodes(this.hass);
    return html`
      ${this.renderStyle()}
      <ha-config-section .isWide="${this.isWide}">
        <div style="position: relative" slot="header">
          <span>Node Management</span>
          <paper-icon-button
            class="toggle-help-icon"
            @click="${this._onHelpTap}"
            icon="hass:help-circle"
          ></paper-icon-button>
        </div>
        <span slot="introduction">
          Run ZHA commands that affect a single node. Pick a node to see a list
          of available commands. <br /><br />Note: Sleepy (battery powered)
          devices need to be awake when executing commands against them. You can
          generally wake a sleepy device by triggering it. <br /><br />Some
          devices such as Xiaomi sensors have a wake up button that you can
          press at ~5 second intervals that keep devices awake while you
          interact with them.
        </span>
        <paper-card class="content">
          ${this._renderNodePicker()}
          ${
            this.showHelp
              ? html`
                  <div style="color: grey; padding: 16px">
                    Select node to view per-node options
                  </div>
                `
              : ""
          }
          ${this.selectedNodeIndex !== -1 ? this._renderNodeActions() : ""}
          ${this.selectedNodeIndex !== -1 ? this._renderEntities() : ""}
        </paper-card>
      </ha-config-section>
    `;
  }

  private _renderNodePicker(): TemplateResult {
    return html`
      <div class="node-picker">
        <paper-dropdown-menu dynamic-align="" label="Nodes" class="flex">
          <paper-listbox
            slot="dropdown-content"
            @iron-select="${this._selectedNodeChanged}"
          >
            ${
              this._nodes.map(
                (entry) => html`
                  <paper-item>${this._computeSelectCaption(entry)}</paper-item>
                `
              )
            }
          </paper-listbox>
        </paper-dropdown-menu>
      </div>
    `;
  }

  private _renderNodeActions(): TemplateResult {
    return html`
      <div class="card-actions">
        <paper-button @click="${this._showNodeInformation}"
          >Node Information</paper-button
        >
        <ha-call-service-button
          .hass="${this.hass}"
          domain="zha"
          service="reconfigure_device"
          .serviceData="${this.serviceData}"
          >Reconfigure Node</ha-call-service-button
        >
        ${
          this.showHelp
            ? html`
                <ha-service-description
                  .hass="${this.hass}"
                  domain="zha"
                  service="reconfigure_device"
                />
              `
            : ""
        }
        <ha-call-service-button
          .hass="${this.hass}"
          domain="zha"
          service="remove"
          .serviceData="${this.serviceData}"
          >Remove Node</ha-call-service-button
        >
        ${
          this.showHelp
            ? html`
                <ha-service-description
                  .hass="${this.hass}"
                  domain="zha"
                  service="remove"
                />
              `
            : ""
        }
      </div>
    `;
  }

  private _renderEntities(): TemplateResult {
    return html`
      <zha-entities
        .hass="${this.hass}"
        .selectedNode="${this.selectedNode}"
        .showHelp="${this.showHelp}"
      ></zha-entities>
    `;
  }

  private _onHelpTap(): void {
    this.showHelp = !this.showHelp;
  }

  private _selectedNodeChanged(event: ItemSelectedEvent) {
    this.selectedNodeIndex = event!.target!.selected;
    this.selectedNode = this._nodes[this.selectedNodeIndex];
    this.serviceData = this._computeNodeServiceData();
  }

  private _showNodeInformation(): void {
    fireEvent(this, "hass-more-info", {
      entityId: this.selectedNode!.entity_id,
    });
  }

  private _computeNodeServiceData() {
    return {
      ieee_address: this.selectedNode!.attributes.ieee,
    };
  }

  private _computeSelectCaption(stateObj: HassEntity): string {
    return (
      computeStateName(stateObj) + " (Node:" + stateObj.attributes.ieee + ")"
    );
  }

  private _computeNodes(hass?: HomeAssistant): HassEntity[] {
    if (hass) {
      return Object.keys(hass.states)
        .map((key) => hass.states[key])
        .filter((ent) => ent.entity_id.match("zha[.]"))
        .sort(sortByName);
    } else {
      return [];
    }
  }

  private renderStyle(): TemplateResult {
    if (!this._haStyle) {
      this._haStyle = document.importNode(
        (document.getElementById("ha-style")!
          .children[0] as HTMLTemplateElement).content,
        true
      );
    }
    if (!this._ironFlex) {
      this._ironFlex = document.importNode(
        (document.getElementById("iron-flex")!
          .children[0] as HTMLTemplateElement).content,
        true
      );
    }
    return html`
      ${this._ironFlex} ${this._haStyle}
      <style>
        .content {
          margin-top: 24px;
        }

        .node-info {
          margin-left: 16px;
        }

        .help-text {
          padding-left: 28px;
          padding-right: 28px;
        }

        paper-card {
          display: block;
          margin: 0 auto;
          max-width: 600px;
        }

        .node-picker {
          @apply --layout-horizontal;
          @apply --layout-center-center;
          padding-left: 28px;
          padding-right: 28px;
          padding-bottom: 10px;
        }

        ha-service-description {
          display: block;
          color: grey;
        }

        [hidden] {
          display: none;
        }

        .toggle-help-icon {
          position: absolute;
          top: 6px;
          right: 0;
          color: var(--primary-color);
        }
      </style>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-node": ZhaNode;
  }
}

customElements.define("zha-node", ZhaNode);
