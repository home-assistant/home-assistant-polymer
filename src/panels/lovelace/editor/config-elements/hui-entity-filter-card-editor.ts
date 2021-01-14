import {
  customElement,
  CSSResultArray,
  internalProperty,
  LitElement,
  property,
  TemplateResult,
  html,
  css,
  query,
} from "lit-element";
import { mdiClose, mdiDelete } from "@mdi/js";
import "@material/mwc-tab-bar/mwc-tab-bar";
import "@material/mwc-tab/mwc-tab";
import {
  any,
  array,
  assert,
  object,
  optional,
  string,
  boolean,
} from "superstruct";
import { EntityFilterCardConfig } from "../../cards/types";
import { LovelaceCardEditor, LovelaceEditorOptions } from "../../types";
import {
  entitiesConfigStruct,
  EntitiesEditorEvent,
  GUIModeChangedEvent,
} from "../types";
import "../card-editor/hui-card-picker";
import "../card-editor/hui-card-element-editor";
import { HomeAssistant } from "../../../../types";
import { LovelaceCardConfig, LovelaceConfig } from "../../../../data/lovelace";
import { fireEvent, HASSDomEvent } from "../../../../common/dom/fire_event";
import type { ConfigChangedEvent } from "../hui-element-editor";
import "../hui-entities-card-row-editor";
import {
  EntityFilterEntityConfig,
  LovelaceRowConfig,
} from "../../entity-rows/types";
import { processEditorEntities } from "../process-editor-entities";
import "../../components/hui-entity-editor";
import "../../../../components/ha-formfield";
import "../../../../components/ha-switch";
import { configElementStyle } from "./config-elements-style";
import { computeRTLDirection } from "../../../../common/util/compute_rtl";
import type { HuiCardElementEditor } from "../card-editor/hui-card-element-editor";

const cardConfigStruct = object({
  type: string(),
  entities: array(entitiesConfigStruct),
  state_filter: array(string()),
  card: optional(any()),
  show_empty: optional(boolean()),
});

@customElement("hui-entity-filter-card-editor")
export class HuiEntityFilterCardEditor extends LitElement
  implements LovelaceCardEditor {
  @property({ attribute: false }) public hass?: HomeAssistant;

  @property({ attribute: false }) public lovelace?: LovelaceConfig;

  @property({ attribute: false }) public editorOptions?: LovelaceEditorOptions;

  @internalProperty() private _config?: EntityFilterCardConfig;

  @internalProperty() private _selectedTab = 0;

  @internalProperty() private _cardGUImode = true;

  @internalProperty() private _cardGUIModeAvailable? = true;

  @internalProperty() private _configEntities?: LovelaceRowConfig[];

  @query("hui-card-element-editor")
  private _cardEditorEl?: HuiCardElementEditor;

  public setConfig(config: Readonly<EntityFilterCardConfig>): void {
    assert(config, cardConfigStruct);
    this._config = config;
    this._configEntities = processEditorEntities(config.entities);
  }

  protected render(): TemplateResult {
    if (!this.hass || !this._config) {
      return html``;
    }

    return html`
      <div class="card-config">
        <div class="toolbar">
          <mwc-tab-bar
            .activeIndex=${this._selectedTab}
            @MDCTabBar:activated=${this._handleSwitchTab}
          >
            <mwc-tab
              .label=${this.hass!.localize(
                "ui.panel.lovelace.editor.card.entity_filter.entities"
              )}
            ></mwc-tab>
            <mwc-tab
              .label=${this.hass!.localize(
                "ui.panel.lovelace.editor.card.entity_filter.card"
              )}
            ></mwc-tab>
          </mwc-tab-bar>
        </div>
        <div id="editor">
          ${this._selectedTab === 0
            ? this._renderFilterEditor()
            : this._renderCardEditor()}
        </div>
      </div>
    `;
  }

  private _renderFilterEditor(): TemplateResult {
    return html`
      ${this.editorOptions?.hide_entities
        ? ""
        : html`
            <div class="entities">
              <hui-entity-editor
                .hass=${this.hass}
                .entities=${this._configEntities}
                @entities-changed=${this._entitiesChanged}
              ></hui-entity-editor>
            </div>
          `}
      <div class="states">
        <h3>
          ${this.hass!.localize(
            "ui.panel.lovelace.editor.card.entity_filter.states"
          )}
          (${this.hass!.localize(
            "ui.panel.lovelace.editor.card.config.required"
          )})
        </h3>
        <div>
          ${this._config!.state_filter.map((state, idx) => {
            return html`
              <div class="state">
                <paper-input
                  .label=${this.hass!.localize(
                    "ui.panel.lovelace.editor.card.entity_filter.states"
                  )}
                  .value=${state as string}
                  .index=${idx}
                  @change=${this._stateChanged}
                >
                  <mwc-icon-button
                    .title=${this.hass!.localize(
                      "ui.panel.lovelace.editor.card.entity_filter.delete_state"
                    )}
                    .index=${idx}
                    slot="suffix"
                    @click=${this._stateDeleted}
                  >
                    <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
                  </mwc-icon-button>
                </paper-input>
              </div>
            `;
          })}
          <paper-input
            .label=${this.hass!.localize(
              "ui.panel.lovelace.editor.card.entity_filter.states"
            )}
            @change=${this._stateAdded}
          ></paper-input>
        </div>
      </div>
    `;
  }

  private _renderCardEditor(): TemplateResult {
    return html`
      <div class="card">
        <ha-formfield
          .label=${this.hass!.localize(
            "ui.panel.lovelace.editor.card.entity_filter.show_empty"
          )}
          .dir=${computeRTLDirection(this.hass!)}
        >
          <ha-switch
            .checked=${this._config!.show_empty !== false}
            @change=${this._showEmptyToggle}
          ></ha-switch>
        </ha-formfield>
        ${this._config!.card
          ? html`
              <div class="card-options">
                <mwc-button
                  @click=${this._toggleCardMode}
                  .disabled=${!this._cardGUIModeAvailable}
                  class="gui-mode-button"
                >
                  ${this.hass!.localize(
                    !this._cardEditorEl || this._cardGUImode
                      ? "ui.panel.lovelace.editor.edit_card.show_code_editor"
                      : "ui.panel.lovelace.editor.edit_card.show_visual_editor"
                  )}
                </mwc-button>
                <mwc-icon-button
                  .title=${this.hass!.localize(
                    "ui.panel.lovelace.editor.edit_card.delete"
                  )}
                  @click=${this._deleteCard}
                >
                  <ha-svg-icon .path=${mdiDelete}></ha-svg-icon>
                </mwc-icon-button>
              </div>

              <hui-card-element-editor
                .hass=${this.hass}
                .value=${this._getCardConfig()}
                .lovelace=${this.lovelace}
                @config-changed=${this._handleCardConfigChanged}
                @GUImode-changed=${this._cardGUIModeChanged}
                .editorOptions=${{ hide_entities: true }}
              ></hui-card-element-editor>
            `
          : html`
              <hui-card-picker
                .hass=${this.hass}
                .lovelace=${this.lovelace}
                @config-changed=${this._pickCard}
              ></hui-card-picker>
            `}
      </div>
    `;
  }

  private _handleSwitchTab(ev) {
    this._selectedTab = parseInt(ev.detail.index, 10);
  }

  private _showEmptyToggle(): void {
    if (!this._config || !this.hass) {
      return;
    }
    this._config = {
      ...this._config,
      show_empty: this._config.show_empty === false,
    };
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _entitiesChanged(ev: EntitiesEditorEvent): void {
    if (!this._config || !this.hass) {
      return;
    }
    if (!ev.detail || !ev.detail.entities) {
      return;
    }

    this._config = {
      ...this._config,
      entities: ev.detail.entities as EntityFilterEntityConfig[],
    };
    this._configEntities = processEditorEntities(this._config.entities);

    fireEvent(this, "config-changed", { config: this._config });
  }

  private _stateDeleted(ev: Event): void {
    const target = ev.target! as any;
    if (target.value === "" || !this._config) {
      return;
    }
    const state_filter = [...this._config.state_filter];
    state_filter.splice(target.index, 1);

    this._config = { ...this._config, state_filter };
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _stateAdded(ev: Event): void {
    const target = ev.target! as any;
    if (target.value === "" || !this._config) {
      return;
    }
    const state_filter = [...this._config.state_filter];
    state_filter.push(target.value);

    this._config = { ...this._config, state_filter };
    target.value = "";
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _stateChanged(ev: Event): void {
    const target = ev.target! as any;
    if (target.value === "" || !this._config) {
      return;
    }
    const state_filter = [...this._config.state_filter];
    state_filter[target.index] = target.value;

    this._config = { ...this._config, state_filter };
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _cardGUIModeChanged(ev: HASSDomEvent<GUIModeChangedEvent>): void {
    ev.stopPropagation();
    this._cardGUImode = ev.detail.guiMode;
    this._cardGUIModeAvailable = ev.detail.guiModeAvailable;
  }

  private _toggleCardMode(): void {
    this._cardEditorEl?.toggleMode();
  }

  private _getCardConfig(): LovelaceCardConfig {
    const cardConfig = { ...this._config!.card } as LovelaceCardConfig;
    cardConfig.entities = [];
    return cardConfig;
  }

  private _handleCardConfigChanged(ev: HASSDomEvent<ConfigChangedEvent>): void {
    ev.stopPropagation();
    if (!this._config) {
      return;
    }
    const cardConfig = { ...ev.detail.config } as LovelaceCardConfig;
    delete cardConfig.entities;

    this._config = { ...this._config, card: cardConfig };
    this._cardGUIModeAvailable = ev.detail.guiModeAvailable;
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _pickCard(ev): void {
    ev.stopPropagation();
    if (!this._config) {
      return;
    }
    const cardConfig = { ...ev.detail.config } as LovelaceCardConfig;
    delete cardConfig.entities;

    this._config = { ...this._config, card: cardConfig };
    fireEvent(this, "config-changed", { config: this._config });
  }

  private _deleteCard(): void {
    if (!this._config) {
      return;
    }
    this._config = { ...this._config };
    delete this._config.card;
    fireEvent(this, "config-changed", { config: this._config });
  }

  static get styles(): CSSResultArray {
    return [
      configElementStyle,
      css`
        mwc-tab-bar {
          border-bottom: 1px solid var(--divider-color);
        }

        .entities,
        .states,
        .card {
          margin-top: 8px;
          border: 1px solid var(--divider-color);
          padding: 12px;
        }

        @media (max-width: 450px) {
          .entities,
          .states,
          .card {
            margin: 8px -12px 0;
          }
        }

        .state {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }
        .state paper-input {
          flex-grow: 1;
        }

        .card .card-options {
          display: flex;
          justify-content: flex-end;
          width: 100%;
        }

        .gui-mode-button {
          margin-right: auto;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entity-filter-card-editor": HuiEntityFilterCardEditor;
  }
}
