import "@material/mwc-icon-button/mwc-icon-button";
import { mdiClose } from "@mdi/js";
import "@polymer/iron-input/iron-input";
import "@polymer/paper-input/paper-input-container";
import {
  css,
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";
import { fireEvent } from "../common/dom/fire_event";
import { HomeAssistant } from "../types";
import "./ha-circular-progress";
import "./ha-svg-icon";

declare global {
  interface HASSDomEvents {
    "file-added": { file: File };
  }
}

@customElement("ha-file-upload")
export class HaFileUpload extends LitElement {
  public hass!: HomeAssistant;

  @property() public accept!: string;

  @property() public icon!: string;

  @property() public label!: string;

  @property() public value: string | TemplateResult | null = null;

  @property({ type: Boolean }) private uploading = false;

  @internalProperty() private _drag = false;

  @internalProperty() private _error = "";

  protected updated(changedProperties: PropertyValues) {
    if (changedProperties.has("_drag") && !this.uploading) {
      (this.shadowRoot!.querySelector(
        "paper-input-container"
      ) as any)._setFocused(this._drag);
    }
  }

  public render(): TemplateResult {
    return html`
      ${this.uploading
        ? html`<ha-circular-progress
            alt="Uploading"
            size="large"
            active
          ></ha-circular-progress>`
        : html`
            ${this._error ? html`<div class="error">${this._error}</div>` : ""}
            <label for="input">
              <paper-input-container
                .alwaysFloatLabel=${Boolean(this.value)}
                @drop=${this._handleDrop}
                @dragenter=${this._handleDragStart}
                @dragover=${this._handleDragStart}
                @dragleave=${this._handleDragEnd}
                @dragend=${this._handleDragEnd}
                class=${classMap({
                  dragged: this._drag,
                })}
              >
                <label for="input" slot="label">
                  ${this.label}
                </label>
                <iron-input slot="input">
                  <input
                    id="input"
                    type="file"
                    class="file"
                    accept=${this.accept}
                    @change=${this._handleFilePicked}
                  />
                  ${this.value}
                </iron-input>
                ${this.value
                  ? html`<mwc-icon-button
                      slot="suffix"
                      @click=${this._clearValue}
                    >
                      <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
                    </mwc-icon-button>`
                  : html`<mwc-icon-button slot="suffix">
                      <ha-svg-icon .path=${this.icon}></ha-svg-icon>
                    </mwc-icon-button>`}
              </paper-input-container>
            </label>
          `}
    `;
  }

  private _handleDrop(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    if (ev.dataTransfer?.files) {
      fireEvent(this, "file-added", { file: ev.dataTransfer.files[0] });
    }
    this._drag = false;
  }

  private _handleDragStart(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this._drag = true;
  }

  private _handleDragEnd(ev: DragEvent) {
    ev.preventDefault();
    ev.stopPropagation();
    this._drag = false;
  }

  private _handleFilePicked(ev) {
    fireEvent(this, "file-added", { file: ev.target.files[0] });
  }

  private _clearValue(ev: Event) {
    ev.preventDefault();
    this.value = null;
    this._error = "";
    fireEvent(this, "change");
  }

  static get styles() {
    return css`
      .error {
        color: var(--error-color);
      }
      paper-input-container {
        position: relative;
        padding: 8px;
        margin: 0 -8px;
      }
      paper-input-container.dragged:before {
        position: var(--layout-fit_-_position);
        top: var(--layout-fit_-_top);
        right: var(--layout-fit_-_right);
        bottom: var(--layout-fit_-_bottom);
        left: var(--layout-fit_-_left);
        background: currentColor;
        content: "";
        opacity: var(--dark-divider-opacity);
        pointer-events: none;
        border-radius: 4px;
      }
      input.file {
        display: none;
      }
      img {
        max-width: 125px;
        max-height: 125px;
      }
      mwc-icon-button {
        --mdc-icon-button-size: 24px;
        --mdc-icon-size: 20px;
      }
      ha-circular-progress {
        display: block;
        text-align-last: center;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-file-upload": HaFileUpload;
  }
}
