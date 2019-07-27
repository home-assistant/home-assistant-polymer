import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";

import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
  PropertyValues,
} from "lit-element";

import { haStyle } from "../../../resources/styles";
import { HomeAssistant } from "../../../types";

import "../../../components/buttons/ha-call-service-button";
import "../../../components/ha-card";
import {
  ZWaveConfigItem,
  ZWaveNode,
  ZWaveConfigServiceData,
  fetchNodeConfig,
} from "../../../data/zwave";

@customElement("zwave-node-config")
export class ZwaveNodeConfig extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public nodes: ZWaveNode[] = [];
  @property() public config: ZWaveConfigItem[] = [];
  @property() public selectedNode: number = -1;
  @property() private _configItem?: ZWaveConfigItem;
  @property() private _wakeupInput: number = -1;
  @property() private _selectedConfigParameter: number = -1;
  @property() private _selectedConfigValue: number | string = -1;

  protected render(): TemplateResult | void {
    return html`
      <div class="content">
        <ha-card header="Node config options">
          ${this.nodes[this.selectedNode].attributes.hasOwnProperty(
            "wake_up_interval"
          )
            ? html`
                <div class="card-actions">
                  <paper-input
                    float-label="Wakeup Interval"
                    type="number"
                    .value=${this._wakeupInput !== -1
                      ? this._wakeupInput
                      : "unknown"}
                    @value-changed=${this._onWakeupIntervalChanged}
                    placeholder=${this.nodes[this.selectedNode].attributes
                      .wake_up_interval
                      ? this.nodes[this.selectedNode].attributes
                          .wake_up_interval
                      : "unknown"}
                  >
                    <div suffix="">seconds</div>
                  </paper-input>
                  <ha-call-service-button
                    .hass=${this.hass}
                    domain="zwave"
                    service="set_wakeup"
                    .serviceData=${this._computeWakeupServiceData(
                      this._wakeupInput
                    )}
                  >
                    Set Wakeup
                  </ha-call-service-button>
                </div>
              `
            : ""}
          <div class="device-picker">
            <paper-dropdown-menu
              label="Config parameter"
              dynamic-align
              class="flex"
            >
              <paper-listbox
                slot="dropdown-content"
                .selected=${this._selectedConfigParameter}
                @iron-select=${this._selectedConfigParameterChanged}
              >
                ${this.config.map(
                  (state) => html`
                    <paper-item>
                      ${state.key}: ${state.value.label}
                    </paper-item>
                  `
                )}
              </paper-listbox>
            </paper-dropdown-menu>
          </div>
          ${this._configItem
            ? html`
                ${["List"].includes(this._configItem.value.type)
                  ? html`
                      <div class="device-picker">
                        <paper-dropdown-menu
                          label="Config value"
                          dynamic-align
                          class="flex"
                          placeholder=${this._configItem.value.data}
                        >
                          <paper-listbox
                            slot="dropdown-content"
                            .selected=${this._configItem.value.data}
                            @iron-select=${this._configValueSelectChanged}
                          >
                            ${this._configItem.value.data_items.map(
                              (state) => html`
                                <paper-item>${state}</paper-item>
                              `
                            )}
                          </paper-listbox>
                        </paper-dropdown-menu>
                      </div>
                    `
                  : ""}
                ${["Byte", "Short", "Int"].includes(this._configItem.value.type)
                  ? html`
                      <div class="card-actions">
                        <paper-input
                          label=${this._configItem.value.data_items}
                          type="number"
                          value=${this._configItem.value.data}
                          max=${this._configItem.value.max}
                          min=${this._configItem.value.min}
                          @value-changed=${this._configValueInputChanged}
                        >
                        </paper-input>
                      </div>
                    `
                  : ""}
                ${["Bool", "Button"].includes(this._configItem.value.type)
                  ? html`
                      <div class="device-picker">
                        <paper-dropdown-menu
                          label="Config value"
                          class="flex"
                          dynamic-align
                          placeholder=${this._configItem.value.data}
                        >
                          <paper-listbox
                            slot="dropdown-content"
                            .selected=${this._configItem.value.data}
                            @iron-select=${this._configValueSelectChanged}
                          >
                            <paper-item>True</paper-item>
                            <paper-item>False</paper-item>
                          </paper-listbox>
                        </paper-dropdown-menu>
                      </div>
                    `
                  : ""}
                <div class="help-text">
                  <span>${this._configItem.value.help}</span>
                </div>
                ${["Bool", "Button", "Byte", "Short", "Int", "List"].includes(
                  this._configItem.value.type
                )
                  ? html`
                      <div class="card-actions">
                        <ha-call-service-button
                          .hass=${this.hass}
                          domain="zwave"
                          service="set_config_parameter"
                          .serviceData=${this._computeSetConfigParameterServiceData()}
                        >
                          Set Config Parameter
                        </ha-call-service-button>
                      </div>
                    `
                  : ""}
              `
            : ""}
        </ha-card>
      </div>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      haStyle,
      css`
        .content {
          margin-top: 24px;
        }

        ha-card {
          margin: 0 auto;
          max-width: 600px;
        }

        .device-picker {
          @apply --layout-horizontal;
          @apply --layout-center-center;
          display: -ms-flexbox;
          display: -webkit-flex;
          display: flex;
          -ms-flex-direction: row;
          -webkit-flex-direction: row;
          flex-direction: row;
          -ms-flex-align: center;
          -webkit-align-items: center;
          align-items: center;
          padding-left: 24px;
          padding-right: 24px;
          padding-bottom: 24px;
        }

        .help-text {
          padding-left: 24px;
          padding-right: 24px;
        }

        .flex {
          -ms-flex: 1 1 0.000000001px;
          -webkit-flex: 1;
          flex: 1;
          -webkit-flex-basis: 0.000000001px;
          flex-basis: 0.000000001px;
        }
      `,
    ];
  }

  protected firstUpdated(changedProps): void {
    super.firstUpdated(changedProps);
    this.addEventListener("hass-service-called", (ev) =>
      this.serviceCalled(ev)
    );
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has("selectedNode")) this._nodesChanged();
  }

  serviceCalled(ev) {
    if (ev.detail.success) {
      setTimeout(() => {
        this._refreshConfig(this.selectedNode);
      }, 5000);
    }
  }

  _nodesChanged() {
    if (!this.nodes) return;
    this._configItem = undefined;
    this._wakeupInput = this.nodes[this.selectedNode].attributes.hasOwnProperty(
      "wake_up_interval"
    )
      ? this.nodes[this.selectedNode].attributes.wake_up_interval!
      : -1;
  }

  private _onWakeupIntervalChanged(value: ChangeEvent): void {
    this._wakeupInput = value.detail!.value;
  }

  _computeWakeupServiceData(wakeupInput: number) {
    return {
      node_id: this.nodes[this.selectedNode].attributes.node_id,
      value: wakeupInput,
    };
  }

  _computeSetConfigParameterServiceData(): ZWaveConfigServiceData | boolean {
    if (this.selectedNode === -1 || typeof this._configItem === "undefined")
      return false;
    var valueData: number | string = "";
    if (["Short", "Byte", "Int"].includes(this._configItem!.value.type)) {
      if (typeof this._selectedConfigValue === "string")
        valueData = parseInt(this._selectedConfigValue, 10);
      else valueData = this._selectedConfigValue;
    }
    if (["Bool", "Button", "List"].includes(this._configItem!.value.type)) {
      valueData = this._selectedConfigValue;
    }
    return {
      node_id: this.nodes[this.selectedNode].attributes.node_id,
      parameter: this._configItem.key,
      value: valueData,
    };
  }

  _selectedConfigParameterChanged(event: ItemSelectedEvent): void {
    if (event.target!.selected === -1) return;
    this._selectedConfigParameter = event.target!.selected;
    this._configItem = this.config[event.target!.selected];
  }

  _configValueSelectChanged(event: ItemSelectedEvent): void {
    if (event.target!.selected === -1) return;
    this._selectedConfigValue = event.target!.selectedItem.textContent;
  }

  _configValueInputChanged(value: ChangeEvent): void {
    this._selectedConfigValue = value.detail!.value;
  }

  async _refreshConfig(selectedNode) {
    const configData: ZWaveConfigItem[] = [];
    const config = await fetchNodeConfig(
      this.hass,
      this.nodes[selectedNode].attributes.node_id
    );

    Object.keys(config).forEach((key) => {
      configData.push({
        key: parseInt(key),
        value: config[key],
      });
    });

    this.config = configData;
    this._configItem = this.config[this._selectedConfigParameter];
  }
}

export interface ChangeEvent {
  detail?: {
    value?: any;
  };
  target?: EventTarget;
}

export interface PickerTarget extends EventTarget {
  selected: number;
  selectedItem?: any;
}

export interface ItemSelectedEvent {
  target?: PickerTarget;
}

declare global {
  interface HTMLElementTagNameMap {
    "zwave-node-config": ZwaveNodeConfig;
  }
}
