import {
  html,
  LitElement,
  TemplateResult,
  customElement,
  property,
  PropertyValues,
} from "lit-element";

import "../../../components/entity/ha-state-label-badge";
import "../components/hui-warning-element";

import { computeStateName } from "../../../common/entity/compute_state_name";
import { LovelaceElement, StateBadgeElementConfig } from "./types";
import { HomeAssistant } from "../../../types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import { actionHandler } from "../common/directives/action-handler-directive";
import { hasAction } from "../common/has-action";
import { ActionHandlerEvent } from "../../../data/lovelace";
import { handleAction } from "../common/handle-action";

@customElement("hui-state-badge-element")
export class HuiStateBadgeElement extends LitElement
  implements LovelaceElement {
  @property() public hass?: HomeAssistant;
  @property() private _config?: StateBadgeElementConfig;

  public setConfig(config: StateBadgeElementConfig): void {
    if (!config.entity) {
      throw Error("Invalid Configuration: 'entity' required");
    }

    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render(): TemplateResult | void {
    if (!this._config || !this.hass) {
      return html``;
    }

    const stateObj = this.hass.states[this._config.entity!];

    if (!stateObj) {
      return html`
        <hui-warning-element
          label="${this.hass.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this._config.entity
          )}"
        ></hui-warning-element>
      `;
    }

    return html`
      <ha-state-label-badge
        .hass="${this.hass}"
        .state="${stateObj}"
        .title="${this._config.title === undefined
          ? computeStateName(stateObj)
          : this._config.title === null
          ? ""
          : this._config.title}"
        @action=${this._handleAction}
        .actionHandler=${actionHandler({
          hasHold: hasAction(this._config!.hold_action),
          hasDoubleClick: hasAction(this._config!.double_tap_action),
        })}
        tabindex="0"
      ></ha-state-label-badge>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.hass!, this._config!, ev.detail.action!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-state-badge-element": HuiStateBadgeElement;
  }
}
