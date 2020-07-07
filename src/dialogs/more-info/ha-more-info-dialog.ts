import "@material/mwc-button";
import "@polymer/app-layout/app-toolbar/app-toolbar";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable";
import "../../components/ha-icon-button";
import "../../components/ha-dialog";
import { isComponentLoaded } from "../../common/config/is_component_loaded";
import { DOMAINS_MORE_INFO_NO_HISTORY } from "../../common/const";
import { computeStateName } from "../../common/entity/compute_state_name";
import { navigate } from "../../common/navigate";
import "../../components/state-history-charts";
import { removeEntityRegistryEntry } from "../../data/entity_registry";
import { showEntityEditorDialog } from "../../panels/config/entities/show-dialog-entity-editor";
import "../../state-summary/state-card-content";
import { showConfirmationDialog } from "../generic/show-dialog-box";
import "./more-info-content";
import { customElement, LitElement, property, css } from "lit-element";
import { html } from "lit-html";
import { haStyleDialog } from "../../resources/styles";
import { HomeAssistant } from "../../types";
import { fireEvent } from "../../common/dom/fire_event";
import { getRecentWithCache, CacheConfig } from "../../data/cached-history";
import { computeDomain } from "../../common/entity/compute_domain";
import { mdiClose, mdiSettings, mdiPencil } from "@mdi/js";

const DOMAINS_NO_INFO = ["camera", "configurator", "history_graph"];
const EDITABLE_DOMAINS_WITH_ID = ["scene", "automation"];
const EDITABLE_DOMAINS = ["script"];

@customElement("ha-more-info-dialog")
export class MoreInfoDialog extends LitElement {
  @property() public hass!: HomeAssistant;

  @property() private _stateHistory?: object;

  @property({ type: Boolean, reflect: true }) public large = false;

  @property() private _cacheConfig?: CacheConfig;

  private _interval?: number;

  protected updated(changedProperties) {
    super.updated(changedProperties);
    if (changedProperties.has("hass")) {
      const oldHass = changedProperties.get("hass");
      if (!oldHass || oldHass.moreInfoEntityId !== this.hass.moreInfoEntityId) {
        if (this.hass.moreInfoEntityId) {
          this.setAttribute(
            "data-domain",
            computeDomain(this.hass.moreInfoEntityId)
          );
          this.large = false;
          this._stateHistory = undefined;
          if (this._computeShowHistoryComponent(this.hass.moreInfoEntityId)) {
            this._cacheConfig = {
              refresh: 60,
              cacheKey: `more_info.${this.hass.moreInfoEntityId}`,
              hoursToShow: 24,
            };
            this._getStateHistory();
            clearInterval(this._interval);
            if (this._cacheConfig.refresh) {
              this._interval = window.setInterval(() => {
                this._getStateHistory();
              }, this._cacheConfig.refresh * 1000);
            }
          }
        } else {
          this._stateHistory = undefined;
          clearInterval(this._interval);
          this._interval = undefined;
        }
      }
    }
  }

  protected render() {
    if (!this.hass.moreInfoEntityId) {
      return html``;
    }
    const entityId = this.hass.moreInfoEntityId;
    const stateObj = this.hass.states[entityId];
    const domain = computeDomain(entityId);

    return html`
      <ha-dialog open @closed=${this._close} .heading=${true} hideActions>
        <app-toolbar slot="heading">
          <mwc-icon-button
            .label=${this.hass.localize("ui.dialogs.more_info_control.dismiss")}
            dialogAction="cancel"
          >
            <ha-svg-icon .path=${mdiClose}></ha-svg-icon>
          </mwc-icon-button>
          <div class="main-title" main-title @click=${this._enlarge}>
            ${stateObj ? computeStateName(stateObj) : ""}
          </div>
          ${this.hass.user!.is_admin
            ? html`<mwc-icon-button
                .label=${this.hass.localize(
                  "ui.dialogs.more_info_control.settings"
                )}
                @click=${this._gotoSettings}
              >
                <ha-svg-icon .path=${mdiSettings}></ha-svg-icon>
              </mwc-icon-button>`
            : ""}
          ${this.hass.user!.is_admin &&
          ((EDITABLE_DOMAINS_WITH_ID.includes(domain) &&
            stateObj?.attributes.id) ||
            EDITABLE_DOMAINS.includes(domain))
            ? html` <mwc-icon-button
                .label=${this.hass.localize(
                  "ui.dialogs.more_info_control.edit"
                )}
                @click=${this._gotoEdit}
              >
                <ha-svg-icon .path=${mdiPencil}></ha-svg-icon>
              </mwc-icon-button>`
            : ""}
        </app-toolbar>
        <div class="content">
          ${DOMAINS_NO_INFO.includes(domain)
            ? ""
            : html`
                <state-card-content
                  .stateObj=${stateObj}
                  .hass=${this.hass}
                  in-dialog
                ></state-card-content>
              `}
          ${this._computeShowHistoryComponent(entityId)
            ? html`
                <state-history-charts
                  .hass=${this.hass}
                  .historyData=${this._stateHistory}
                  upToNow
                  .isLoadingData=${!this._stateHistory}
                ></state-history-charts>
              `
            : ""}
          <more-info-content
            .stateObj=${stateObj}
            .hass=${this.hass}
          ></more-info-content>

          ${stateObj?.attributes.restored
            ? html`${this.hass.localize(
                  "ui.dialogs.more_info_control.restored.not_provided"
                )} <br />
                ${this.hass.localize(
                  "ui.dialogs.more_info_control.restored.remove_intro"
                )} <br />
                <mwc-button class="warning" @click=${this._removeEntity}
                  >${this.hass.localize(
                    "ui.dialogs.more_info_control.restored.remove_action"
                  )}</mwc-button
                >`
            : ""}
        </div>
      </ha-dialog>
    `;
  }

  private _enlarge() {
    this.large = !this.large;
  }

  private _getStateHistory(): void {
    if (!this._cacheConfig || !this.hass.moreInfoEntityId) {
      return;
    }
    getRecentWithCache(
      this.hass!,
      this.hass.moreInfoEntityId,
      this._cacheConfig!,
      this.hass!.localize,
      this.hass!.language
    ).then((stateHistory) => {
      this._stateHistory = {
        ...this._stateHistory,
        ...stateHistory,
      };
    });
  }

  private _computeShowHistoryComponent(entityId) {
    return (
      isComponentLoaded(this.hass, "history") &&
      !DOMAINS_MORE_INFO_NO_HISTORY.includes(computeDomain(entityId))
    );
  }

  private _removeEntity() {
    const entityId = this.hass.moreInfoEntityId!;
    showConfirmationDialog(this, {
      title: this.hass.localize(
        "ui.dialogs.more_info_control.restored.confirm_remove_title"
      ),
      text: this.hass.localize(
        "ui.dialogs.more_info_control.restored.confirm_remove_text"
      ),
      confirmText: this.hass.localize("ui.common.yes"),
      dismissText: this.hass.localize("ui.common.no"),
      confirm: () => {
        removeEntityRegistryEntry(this.hass, entityId);
      },
    });
  }

  private _gotoSettings() {
    showEntityEditorDialog(this, {
      entity_id: this.hass.moreInfoEntityId!,
    });
    fireEvent(this, "hass-more-info", { entityId: null });
  }

  private _gotoEdit() {
    const stateObj = this.hass.states[this.hass.moreInfoEntityId!];
    const domain = computeDomain(this.hass.moreInfoEntityId!);
    navigate(
      this,
      `/config/${domain}/edit/${
        EDITABLE_DOMAINS_WITH_ID.includes(domain)
          ? stateObj.attributes.id
          : stateObj.entity_id
      }`
    );
    this._close();
  }

  private _close() {
    fireEvent(this, "hass-more-info", { entityId: null });
  }

  static get styles() {
    return [
      haStyleDialog,
      css`
        app-toolbar {
          flex-shrink: 0;
          color: var(--primary-text-color);
          background-color: var(--secondary-background-color);
        }

        app-toolbar [main-title] {
          /* Design guideline states 24px, changed to 16 to align with state info */
          margin-left: 16px;
          line-height: 1.3em;
          max-height: 2.6em;
          overflow: hidden;
          /* webkit and blink still support simple multiline text-overflow */
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          text-overflow: ellipsis;
        }

        @media all and (max-width: 450px), all and (max-height: 500px) {
          app-toolbar {
            background-color: var(--app-header-background-color);
            color: var(--app-header-text-color, white);
          }
        }

        @media all and (min-width: 451px) and (min-height: 501px) {
          ha-dialog {
            --mdc-dialog-max-width: 90vw;
          }

          .content {
            width: 352px;
          }

          .main-title {
            pointer-events: auto;
            cursor: default;
          }

          :host([data-domain="camera"]) .content {
            width: auto;
          }

          :host([data-domain="history_graph"]) .content,
          :host([large]) .content {
            width: calc(90vw - 48px);
          }
        }

        state-history-charts {
          margin-top: 16px 0;
        }

        :host([data-domain="camera"]) ha-dialog {
          --dialog-content-padding: 0;
        }
      `,
    ];
  }
}
