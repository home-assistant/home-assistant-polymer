import { html, LitElement, PropertyDeclarations } from "@polymer/lit-element";
import { TemplateResult } from "lit-html";

import "@polymer/paper-spinner/paper-spinner";
import "@polymer/paper-dialog/paper-dialog";
// This is not a duplicate import, one is for types, one is for element.
// tslint:disable-next-line
import { PaperDialogElement } from "@polymer/paper-dialog/paper-dialog";
import "@polymer/paper-button/paper-button";
import { fireEvent } from "../../../common/dom/fire_event";

import { HomeAssistant } from "../../../types";
import { hassLocalizeLitMixin } from "../../../mixins/lit-localize-mixin";
import { migrateConfig } from "../common/data";

export class HuiMigrateConfig extends hassLocalizeLitMixin(LitElement) {
  private _hass?: HomeAssistant;
  private _migrating?: boolean;

  static get properties(): PropertyDeclarations {
    return { hass: {}, _migrating: {} };
  }

  private get _dialog(): PaperDialogElement {
    return this.shadowRoot!.querySelector("paper-dialog")!;
  }

  public async openDialog(): Promise<void> {
    // Wait till dialog is rendered.
    await this.updateComplete;
    this._dialog.open();
  }

  protected render(): TemplateResult {
    return html`
      <style>
        paper-dialog {
          width: 650px;
        }
        paper-spinner {
          display: none;
        }
        paper-spinner[active] {
          display: block;
        }
        paper-button paper-spinner {
          width: 14px;
          height: 14px;
          margin-right: 20px;
        }
      </style>
      <paper-dialog with-backdrop>
        <h2>${this.localize("ui.panel.lovelace.editor.migrate.header")}</h2>
        <paper-dialog-scrollable>
          <p>${this.localize("ui.panel.lovelace.editor.migrate.para_no_id")}</p>
          <p>
            ${this.localize("ui.panel.lovelace.editor.migrate.para_migrate")}
          </p>
        </paper-dialog-scrollable>
        <div class="paper-dialog-buttons">
          <paper-button @click="${this._closeDialog}"
            >${this.localize("ui.common.cancel")}</paper-button
          >
          <paper-button
            ?disabled="${this._migrating}"
            @click="${this._migrateConfig}"
          >
            <paper-spinner
              ?active="${this._migrating}"
              alt="Saving"
            ></paper-spinner>
            ${
              this.localize("ui.panel.lovelace.editor.migrate.migrate")
            }</paper-button
          >
        </div>
      </paper-dialog>
    `;
  }

  private _closeDialog(): void {
    this._dialog.close();
  }

  private async _migrateConfig(): Promise<void> {
    this._migrating = true;
    try {
      await migrateConfig(this._hass!);
      this._closeDialog();
      fireEvent(this, "reload-lovelace");
    } catch (err) {
      alert(`Migration failed: ${err.message}`);
      this._migrating = false;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-migrate-config": HuiMigrateConfig;
  }
}

customElements.define("hui-migrate-config", HuiMigrateConfig);
