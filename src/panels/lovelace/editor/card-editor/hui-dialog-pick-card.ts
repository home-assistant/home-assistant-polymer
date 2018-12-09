import { html, LitElement, PropertyDeclarations } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";
import "@polymer/paper-dialog/paper-dialog";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable";

import "./hui-card-picker";
import { HomeAssistant } from "../../../../types";
import { hassLocalizeLitMixin } from "../../../../mixins/lit-localize-mixin";
import { LovelaceCardConfig } from "../../../../data/lovelace";

export class HuiDialogPickCard extends hassLocalizeLitMixin(LitElement) {
  public hass?: HomeAssistant;
  public cardPicked?: (cardConf: LovelaceCardConfig) => void;

  static get properties(): PropertyDeclarations {
    return {};
  }

  protected render(): TemplateResult {
    return html`
      <paper-dialog with-backdrop opened>
        <h2>${this.localize("ui.panel.lovelace.editor.edit_card.header")}</h2>
        <paper-dialog-scrollable>
          <hui-card-picker
            .hass="${this.hass}"
            .cardPicked="${this.cardPicked}"
          ></hui-card-picker>
        </paper-dialog-scrollable>
      </paper-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-dialog-pick-card": HuiDialogPickCard;
  }
}

customElements.define("hui-dialog-pick-card", HuiDialogPickCard);
