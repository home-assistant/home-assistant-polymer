import { computeStateName } from "../../../common/entity/compute_state_name";
import {
  LitElement,
  html,
  css,
  CSSResult,
  PropertyValues,
  property,
  TemplateResult,
} from "lit-element";

import "../../../components/entity/state-badge";
import "../../../components/ha-relative-time";
import "../../../components/ha-icon";
import "../components/hui-warning";

import { HomeAssistant } from "../../../types";
import { computeRTL } from "../../../common/util/compute_rtl";
import { toggleAttribute } from "../../../common/dom/toggle_attribute";
import { longPress } from "../common/directives/long-press-directive";
import { hasDoubleClick } from "../common/has-double-click";
import { handleClick } from "../common/handle-click";
import { DOMAINS_HIDE_MORE_INFO } from "../../../common/const";
import { computeDomain } from "../../../common/entity/compute_domain";
import { classMap } from "lit-html/directives/class-map";
import { EntitiesCardEntityConfig } from "../cards/types";

class HuiGenericEntityRow extends LitElement {
  @property() public hass?: HomeAssistant;

  @property() public config?: EntitiesCardEntityConfig;

  @property() public showSecondary: boolean = true;

  protected render(): TemplateResult | void {
    if (!this.hass || !this.config) {
      return html``;
    }
    const stateObj = this.config.entity
      ? this.hass.states[this.config.entity]
      : undefined;

    if (!stateObj) {
      return html`
        <hui-warning
          >${this.hass.localize(
            "ui.panel.lovelace.warning.entity_not_found",
            "entity",
            this.config.entity
          )}</hui-warning
        >
      `;
    }

    return html`
      <state-badge
        .hass=${this.hass}
        .stateObj=${stateObj}
        .overrideIcon=${this.config.icon}
        .overrideImage=${this.config.image}
      ></state-badge>
      <div class="flex">
        <div
          class="info"
          class=${classMap({
            info: true,
            pointer:
              (this.config.tap_action &&
                this.config.tap_action.action !== "none") ||
              (this.config.entity &&
                !DOMAINS_HIDE_MORE_INFO.includes(
                  computeDomain(this.config.entity)
                )),
          })}
          @ha-click=${this._handleClick}
          @ha-hold=${this._handleHold}
          @ha-dblclick=${this._handleDblClick}
          .longPress=${longPress({
            hasDoubleClick: hasDoubleClick(this.config.double_tap_action),
          })}
        >
          ${this.config.name || computeStateName(stateObj)}
          <div class="secondary">
            ${!this.showSecondary
              ? html`
                  <slot name="secondary"></slot>
                `
              : this.config.secondary_info === "entity-id"
              ? stateObj.entity_id
              : this.config.secondary_info === "last-changed"
              ? html`
                  <ha-relative-time
                    .hass=${this.hass}
                    .datetime=${stateObj.last_changed}
                  ></ha-relative-time>
                `
              : ""}
          </div>
        </div>

        <slot></slot>
      </div>
    `;
  }

  protected updated(changedProps: PropertyValues): void {
    super.updated(changedProps);
    if (changedProps.has("hass")) {
      toggleAttribute(this, "rtl", computeRTL(this.hass!));
    }
  }

  private _handleClick(): void {
    handleClick(this, this.hass!, this.config!, false, false);
  }

  private _handleHold(): void {
    handleClick(this, this.hass!, this.config!, true, false);
  }

  private _handleDblClick(): void {
    handleClick(this, this.hass!, this.config!, false, true);
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: flex;
        align-items: center;
      }
      .flex {
        flex: 1;
        margin-left: 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        min-width: 0;
      }
      .info {
        flex: 1 0 60px;
      }
      .info,
      .info > * {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .flex ::slotted(*) {
        margin-left: 8px;
        min-width: 0;
      }
      .flex ::slotted([slot="secondary"]) {
        margin-left: 0;
      }
      .secondary,
      ha-relative-time {
        display: block;
        color: var(--secondary-text-color);
      }
      state-badge {
        flex: 0 0 40px;
      }
      :host([rtl]) .flex {
        margin-left: 0;
        margin-right: 16px;
      }
      :host([rtl]) .flex ::slotted(*) {
        margin-left: 0;
        margin-right: 8px;
      }
      .pointer {
        cursor: pointer;
      }
    `;
  }
}
customElements.define("hui-generic-entity-row", HuiGenericEntityRow);
