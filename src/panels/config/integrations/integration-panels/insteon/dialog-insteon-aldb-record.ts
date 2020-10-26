import "@material/mwc-button/mwc-button";
import "@polymer/paper-input/paper-input";
import {
  CSSResult,
  css,
  customElement,
  html,
  LitElement,
  property,
  internalProperty,
  TemplateResult,
} from "lit-element";
import "../../../../../components/ha-code-editor";
import { createCloseHeading } from "../../../../../components/ha-dialog";
import { haStyleDialog } from "../../../../../resources/styles";
import { HomeAssistant } from "../../../../../types";
import "./insteon-aldb-data-table";
import { ALDBRecord, CHANGE_ALDB_SCHEMA } from "../../../../../data/insteon";
import "../../../../../components/ha-form/ha-form";
import type { HaFormSchema } from "../../../../../components/ha-form/ha-form";
import { InsteonALDBRecordDialogParams } from "./show-dialog-insteon-aldb-record";
import { showConfirmationDialog } from "../../../../../dialogs/generic/show-dialog-box";

@customElement("dialog-insteon-aldb-record")
class DialogInsteonALDBRecord extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public isWide?: boolean;

  @property() public narrow?: boolean;

  @internalProperty() private _record?: ALDBRecord;

  @internalProperty() private _schema?: HaFormSchema[];

  @internalProperty() private _title?: string;

  @internalProperty() private _callback?: (record: ALDBRecord) => Promise<void>;

  @internalProperty() private _errors?: { [key: string]: string };

  @internalProperty() private _formData?: { [key: string]: any };

  public async showDialog(
    params: InsteonALDBRecordDialogParams
  ): Promise<void> {
    this._record = params.record;
    this._formData = { ...params.record };
    this._formData.mode = this._currentMode();
    this._schema = params.schema;
    this._callback = params.callback;
    this._title = params.title;
    this._errors = {};
  }

  protected render(): TemplateResult {
    if (!this._record) {
      return html``;
    }
    return html`
      <ha-dialog
        open
        hideActions
        @closing="${this._close}"
        .heading=${createCloseHeading(this.hass, this._title!)}
      >
        <div class="form">
          <ha-form
            .data=${this._formData}
            .schema=${this._schema}
            .error=${this._errors}
            @value-changed=${this._valueChanged}
          ></ha-form>
        </div>
        <div class="buttons">
          <mwc-button @click=${this._dismiss} slot="secondaryAction">
            ${this.hass.localize("ui.dialogs.generic.cancel")}
          </mwc-button>
          <mwc-button @click=${this._submit} slot="primaryAction">
            ${this.hass.localize("ui.dialogs.generic.ok")}
          </mwc-button>
        </div>
      </ha-dialog>
    `;
  }

  private _dismiss(): void {
    this._close();
  }

  private async _submit(): Promise<void> {
    if (!this._changeMade()) {
      this._close();
      return;
    }
    if (this._checkData()) {
      const record = this._record;
      record!.mem_addr = this._formData!.mem_addr;
      record!.in_use = this._formData!.in_use;
      record!.target = this._formData!.target;
      record!.mode = this._updatedMode();
      record!.group = this._formData!.group;
      record!.data1 = this._formData!.data1;
      record!.data2 = this._formData!.data2;
      record!.data3 = this._formData!.data3;
      record!.highwater = false;
      record!.dirty = true;
      this._close();
      await this._callback!(record!);
    } else {
      this._errors!.base = this.hass.localize(
        "ui.panel.config.insteon.device.common.error.base"
      );
    }
  }

  private _changeMade(): boolean {
    return (
      this._record!.in_use !== (this._formData!.in_use as boolean) ||
      this._currentMode() !== (this._formData!.mode as string) ||
      this._record!.target !== (this._formData!.target as string) ||
      this._record!.group !== (this._formData!.group as number) ||
      this._record!.data1 !== (this._formData!.data1 as number) ||
      this._record!.data2 !== (this._formData!.data2 as number) ||
      this._record!.data3 !== (this._formData!.data3 as number)
    );
  }

  private _close(): void {
    this._record = undefined;
  }

  private _currentMode(): string {
    if (this._record!.mode.toUpperCase() === "C") {
      return "Controller";
    }
    return "Responder";
  }

  private _updatedMode(): string {
    if (this._formData!.mode === "Controller") {
      return "C";
    }
    return "R";
  }

  private _valueChanged(ev: CustomEvent) {
    this._formData = ev.detail.value;
  }

  private _checkData(): boolean {
    let success = true;
    this._errors = {};
    const insteonAddressCheck = new RegExp(
      /(?<!.)[A-Fa-f0-9]{2}\.?[A-Fa-f0-9]{2}\.?[A-Fa-f0-9]{2}$/
    );
    if (!insteonAddressCheck.test(this._formData!.target)) {
      this._errors!.target = this.hass.localize(
        "ui.panel.config.insteon.device.common.error.address"
      );
      success = false;
    }
    if (this._formData?.group < 0 || this._formData?.group > 255) {
      this._errors!.group = this.hass.localize(
        "ui.panel.config.insteon.device.common.error.byte_range"
      );
      success = false;
    }
    if (this._formData?.data1 < 0 || this._formData?.data1 > 255) {
      this._errors!.data1 = this.hass.localize(
        "ui.panel.config.insteon.device.common.error.byte_range"
      );
      success = false;
    }
    if (this._formData?.data2 < 0 || this._formData?.data2 > 255) {
      this._errors!.data2 = this.hass.localize(
        "ui.panel.config.insteon.device.common.error.byte_range"
      );
      success = false;
    }
    if (this._formData?.data3 < 0 || this._formData?.data3 > 255) {
      this._errors!.data3 = this.hass.localize(
        "ui.panel.config.insteon.device.common.error.byte_range"
      );
      success = false;
    }
    return success;
  }

  static get styles(): CSSResult[] {
    return [
      haStyleDialog,
      css`
        table {
          width: 100%;
        }
        ha-combo-box {
          width: 20px;
        }
        .title {
          width: 200px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-insteon-aldb-record": DialogInsteonALDBRecord;
  }
}
