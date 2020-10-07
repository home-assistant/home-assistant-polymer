import "@polymer/paper-dropdown-menu/paper-dropdown-menu";
import "@polymer/paper-input/paper-input";
import "@polymer/paper-item/paper-item";
import "@polymer/paper-listbox/paper-listbox";
import {
  CSSResult,
  customElement,
  html,
  internalProperty,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";
import { array, assert, object, optional, string } from "superstruct";

import { fireEvent } from "../../../../common/dom/fire_event";
import { ActionConfig } from "../../../../data/lovelace";
import { HomeAssistant } from "../../../../types";
import { PictureGlanceCardConfig } from "../../cards/types";
import { EntityConfig } from "../../entity-rows/types";
import { LovelaceCardEditor } from "../../types";
import { processEditorEntities } from "../process-editor-entities";
import {
  actionConfigStruct,
  EditorTarget,
  entitiesConfigStruct,
} from "../types";
import { configElementStyle } from "./config-elements-style";
import { HuiActionBaseCardEditor } from "./hui-action-base-card-editor";

import "../hui-element-editor";
import "../../components/hui-actions-editor";
import "../hui-detail-editor-base";
import "../../components/hui-entity-editor";
import "../../components/hui-theme-select-editor";
import "../../../../components/entity/ha-entity-picker";

const cardConfigStruct = object({
  type: string(),
  title: optional(string()),
  entity: optional(string()),
  image: optional(string()),
  camera_image: optional(string()),
  camera_view: optional(string()),
  aspect_ratio: optional(string()),
  tap_action: optional(actionConfigStruct),
  hold_action: optional(actionConfigStruct),
  double_tap_action: optional(actionConfigStruct),
  entities: array(entitiesConfigStruct),
  theme: optional(string()),
});

const includeDomains = ["camera"];

@customElement("hui-picture-glance-card-editor")
export class HuiPictureGlanceCardEditor extends HuiActionBaseCardEditor {
  @internalProperty() private _configEntities?: EntityConfig[];

  public setConfig(config: PictureGlanceCardConfig): void {
    assert(config, cardConfigStruct);
    this._config = config;
    this._configEntities = processEditorEntities(config.entities);
  }

  get _entity(): string {
    return this._config!.entity || "";
  }

  get _title(): string {
    return this._config!.title || "";
  }

  get _image(): string {
    return this._config!.image || this._camera_image
      ? ""
      : "https://www.home-assistant.io/images/merchandise/shirt-frontpage.png";
  }

  get _camera_image(): string {
    return this._config!.camera_image || "";
  }

  get _camera_view(): string {
    return this._config!.camera_view || "auto";
  }

  get _state_image(): {} {
    return this._config!.state_image || {};
  }

  get _aspect_ratio(): string {
    return this._config!.aspect_ratio || "";
  }

  get _tap_action(): ActionConfig {
    return this._config!.tap_action || { action: "toggle" };
  }

  get _hold_action(): ActionConfig {
    return this._config!.hold_action || { action: "more-info" };
  }

  get _double_tap_action(): ActionConfig {
    return this._config!.double_tap_action || { action: "none" };
  }

  get _theme(): string {
    return this._config!.theme || "";
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    if (this._editActionConfig) {
      return html`
        <hui-detail-editor-base
          .hass=${this.hass}
          .guiModeAvailable=${this._editActionGuiModeAvailable}
          .guiMode=${this._editActionGuiMode}
          @toggle-gui-mode=${this._toggleMode}
          @go-back=${this._goBack}
        >
          <span slot="title"
            >${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic." + this._editActionType
            )}</span
          >
          <hui-element-editor
            .hass=${this.hass}
            .value=${this._editActionConfig}
            elementType="action"
            @config-changed=${this._handleActionConfigChanged}
            @GUImode-changed=${this._handleGUIModeChanged}
          ></hui-element-editor>
        </hui-detail-editor-base>
      `;
    }

    const views = ["auto", "live"];

    return html`
      <div class="card-config">
        <paper-input
          .label="${this.hass.localize(
            "ui.panel.lovelace.editor.card.generic.title"
          )} (${this.hass.localize(
            "ui.panel.lovelace.editor.card.config.optional"
          )})"
          .value="${this._title}"
          .configValue="${"title"}"
          @value-changed="${this._valueChanged}"
        ></paper-input>
        <paper-input
          .label="${this.hass.localize(
            "ui.panel.lovelace.editor.card.generic.image"
          )} (${this.hass.localize(
            "ui.panel.lovelace.editor.card.config.optional"
          )})"
          .value="${this._image}"
          .configValue="${"image"}"
          @value-changed="${this._valueChanged}"
        ></paper-input>
        <ha-entity-picker
          .label="${this.hass.localize(
            "ui.panel.lovelace.editor.card.generic.camera_image"
          )} (${this.hass.localize(
            "ui.panel.lovelace.editor.card.config.optional"
          )})"
          .hass=${this.hass}
          .value="${this._camera_image}"
          .configValue=${"camera_image"}
          @value-changed="${this._valueChanged}"
          allow-custom-entity
          .includeDomains=${includeDomains}
        ></ha-entity-picker>
        <div class="side-by-side">
          <paper-dropdown-menu
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.camera_view"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .configValue="${"camera_view"}"
            @value-changed="${this._valueChanged}"
          >
            <paper-listbox
              slot="dropdown-content"
              .selected="${views.indexOf(this._camera_view)}"
            >
              ${views.map((view) => {
                return html` <paper-item>${view}</paper-item> `;
              })}
            </paper-listbox>
          </paper-dropdown-menu>
          <paper-input
            .label="${this.hass.localize(
              "ui.panel.lovelace.editor.card.generic.aspect_ratio"
            )} (${this.hass.localize(
              "ui.panel.lovelace.editor.card.config.optional"
            )})"
            .value="${this._aspect_ratio}"
            .configValue="${"aspect_ratio"}"
            @value-changed="${this._valueChanged}"
          ></paper-input>
        </div>
        <ha-entity-picker
          .label="${this.hass.localize(
            "ui.panel.lovelace.editor.card.generic.entity"
          )} (${this.hass.localize(
            "ui.panel.lovelace.editor.card.config.optional"
          )})"
          .hass=${this.hass}
          .value="${this._entity}"
          .configValue=${"entity"}
          @value-changed="${this._valueChanged}"
          allow-custom-entity
        ></ha-entity-picker>
        <hui-actions-editor
          .hass=${this.hass}
          .tapAction=${this._tap_action}
          .holdAction=${this._hold_action}
          .doubleTapAction=${this._double_tap_action}
          .tooltipText=${this.hass.localize(
            "ui.panel.lovelace.editor.card.button.default_action_help"
          )}
          @edit-action=${this._editAction}
          @clear-action=${this._clearAction}
        ></hui-actions-editor>
        <hui-entity-editor
          .hass=${this.hass}
          .entities="${this._configEntities}"
          @entities-changed="${this._valueChanged}"
        ></hui-entity-editor>
        <hui-theme-select-editor
          .hass=${this.hass}
          .value="${this._theme}"
          .configValue="${"theme"}"
          @value-changed="${this._valueChanged}"
        ></hui-theme-select-editor>
      </div>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    if (!this._config || !this.hass) {
      return;
    }
    const target = ev.target! as EditorTarget;
    const value = ev.detail.value;

    if (ev.detail && ev.detail.entities) {
      this._config = { ...this._config, entities: ev.detail.entities };

      this._configEntities = processEditorEntities(this._config.entities);
    } else if (target.configValue) {
      if (this[`_${target.configValue}`] === value) {
        return;
      }

      if (value !== false && !value) {
        this._config = { ...this._config };
        delete this._config[target.configValue!];
      } else {
        this._config = {
          ...this._config,
          [target.configValue!]: value,
        };
      }
    }
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles(): CSSResult {
    return configElementStyle;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-picture-glance-card-editor": HuiPictureGlanceCardEditor;
  }
}
