import {
  property,
  LitElement,
  TemplateResult,
  html,
  CSSResult,
  css,
  customElement,
} from "lit-element";
import { HassEntity } from "home-assistant-js-websocket";
import { repeat } from "lit-html/directives/repeat";

import hassAttributeUtil from "../util/hass-attributes-util";

@customElement("ha-attributes")
class HaAttributes extends LitElement {
  @property() public stateObj?: HassEntity;
  @property() public extraFilters?: string;

  protected render(): TemplateResult | void {
    if (!this.stateObj) {
      return html``;
    }

    const items = this.computeDisplayAttributes(
      Object.keys(hassAttributeUtil.LOGIC_STATE_ATTRIBUTES).concat(
        this.extraFilters ? this.extraFilters.split(",") : []
      )
    );

    return html`
      <div class="layout vertical">
        ${repeat(
          items,
          (attribute) => attribute,
          (attribute) => html`
            <div class="data-entry layout justified horizontal">
              <div class="key">${attribute.replace(/_/g, " ")}</div>
              <div class="value">
                ${this.formatAttributeValue(attribute)}
              </div>
            </div>
          `
        )}
        ${this.stateObj.attributes.attribution
          ? html``
          : html`
              <div class="attribution">
                ${this.stateObj.attributes.attribution}
              </div>
            `}
      </div>
    `;
  }

  static get styles(): CSSResult {
    return css`
      .data-entry .value {
        max-width: 200px;
        overflow-wrap: break-word;
      }
      .attribution {
        color: var(--secondary-text-color);
        text-align: right;
      }
    `;
  }

  private computeDisplayAttributes(filtersArray: string[]): string[] {
    if (!this.stateObj) {
      return [];
    }
    return Object.keys(this.stateObj.attributes).filter((key) => {
      return filtersArray.indexOf(key) === -1;
    });
  }

  private formatAttributeValue(attribute: string): string {
    if (!this.stateObj) {
      return "-";
    }
    const value = this.stateObj.attributes[attribute];
    if (value === null) {
      return "-";
    }
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    return value instanceof Object ? JSON.stringify(value, null, 2) : value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-attributes": HaAttributes;
  }
}
