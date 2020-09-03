import "@material/mwc-button/mwc-button";
import "@material/mwc-fab";
import {
  css,
  CSSResultArray,
  customElement,
  html,
  LitElement,
  internalProperty,
  property,
  TemplateResult,
} from "lit-element";
import { navigate } from "../../../../../common/navigate";
import "../../../../../components/buttons/ha-call-service-button";
import "../../../../../components/ha-card";
import "../../../../../components/ha-icon-next";
import "../../../../../layouts/hass-tabs-subpage";
import { haStyle } from "../../../../../resources/styles";
import type { HomeAssistant, Route } from "../../../../../types";
import "../../../ha-config-section";
import {
  fetchOZWNodeStatus,
  fetchOZWNodeMetadata,
  OZWDevice,
  OZWDeviceMetaDataResponse,
} from "../../../../../data/ozw";
import { showOZWRefreshNodeDialog } from "./show-dialog-ozw-refresh-node";
import { ozwNetworkTabs } from "./ozw-network-router";

@customElement("ozw-node-dashboard")
class OZWNodeDashboard extends LitElement {
  @property({ type: Object }) public hass!: HomeAssistant;

  @property({ type: Object }) public route!: Route;

  @property({ type: Boolean }) public narrow!: boolean;

  @property({ type: Boolean }) public isWide!: boolean;

  @property() public configEntryId?: string;

  @property() public ozwInstance = 0;

  @property() public nodeId = 0;

  @internalProperty() private _node?: OZWDevice;

  @internalProperty() private _metadata?: OZWDeviceMetaDataResponse;

  protected firstUpdated() {
    if (this.ozwInstance <= 0) {
      navigate(this, "/config/ozw/dashboard", true);
    } else if (this.nodeId <= 0) {
      navigate(this, `/config/ozw/network/${this.ozwInstance}/nodes`, true);
    } else if (this.hass) {
      this._fetchData();
    }
  }

  protected render(): TemplateResult {
    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        .tabs=${ozwNetworkTabs(this.ozwInstance)}
      >
        <ha-config-section .narrow=${this.narrow} .isWide=${this.isWide}>
          <div slot="header">
            Node Management
          </div>

          <div slot="introduction">
            View the status of a node and manage its configuration.
          </div>

          ${this._node
            ? html`
                <ha-card class="content">
                  <div class="card-content">
                    <b
                      >${this._node.node_manufacturer_name}
                      ${this._node.node_product_name}</b
                    ><br />
                    Node ID: ${this._node.node_id}<br />
                    Query Stage: ${this._node.node_query_stage}
                    ${this._metadata?.metadata.ProductManualURL
                      ? html` <a
                          href="${this._metadata.metadata.ProductManualURL}"
                        >
                          <p>Product Manual</p>
                        </a>`
                      : ``}
                  </div>
                  <div class="card-actions">
                    <mwc-button @click=${this._refreshNodeClicked}>
                      Refresh Node
                    </mwc-button>
                  </div>
                </ha-card>
              `
            : ``}
          ${this._metadata
            ? html`
                <ha-card class="content" header="Description">
                  <div class="card-content">
                    ${this._metadata.metadata.Description}
                  </div>
                </ha-card>
                <ha-card class="content" header="Inclusion">
                  <div class="card-content">
                    ${this._metadata.metadata.InclusionHelp}
                  </div>
                </ha-card>
                <ha-card class="content" header="Exclusion">
                  <div class="card-content">
                    ${this._metadata.metadata.ExclusionHelp}
                  </div>
                </ha-card>
                <ha-card class="content" header="Reset">
                  <div class="card-content">
                    ${this._metadata.metadata.ResetHelp}
                  </div>
                </ha-card>
                <ha-card class="content" header="WakeUp">
                  <div class="card-content">
                    ${this._metadata.metadata.WakeupHelp}
                  </div>
                </ha-card>
              `
            : ``}
        </ha-config-section>
      </hass-tabs-subpage>
    `;
  }

  private async _fetchData() {
    this._node = await fetchOZWNodeStatus(
      this.hass!,
      this.ozwInstance,
      this.nodeId
    );
    this._metadata = await fetchOZWNodeMetadata(
      this.hass!,
      this.ozwInstance,
      this.nodeId
    );
  }

  private async _refreshNodeClicked() {
    showOZWRefreshNodeDialog(this, {
      node_id: this.nodeId,
      ozw_instance: this.ozwInstance,
    });
  }

  static get styles(): CSSResultArray {
    return [
      haStyle,
      css`
        .secondary {
          color: var(--secondary-text-color);
        }

        .content {
          margin-top: 24px;
        }

        .sectionHeader {
          position: relative;
          padding-right: 40px;
        }

        ha-card {
          margin: 0 auto;
          max-width: 600px;
        }

        .card-actions.warning ha-call-service-button {
          color: var(--error-color);
        }

        .toggle-help-icon {
          position: absolute;
          top: -6px;
          right: 0;
          color: var(--primary-color);
        }

        ha-service-description {
          display: block;
          color: grey;
          padding: 0 8px 12px;
        }

        [hidden] {
          display: none;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ozw-node-dashboard": OZWNodeDashboard;
  }
}
