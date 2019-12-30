import "@material/mwc-button";
import "@polymer/paper-card/paper-card";
import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
  query,
} from "lit-element";
import { HomeAssistant } from "../../../src/types";
import { HassioAddonDetails } from "../../../src/data/hassio";
import { ANSI_HTML_STYLE, parseTextToColoredPre } from "../ansi-to-html";
import { hassioStyle } from "../resources/hassio-style";

@customElement("hassio-addon-logs")
class HassioAddonLogs extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public addon!: HassioAddonDetails;
  @query("#content") private _logContet!: any;

  protected render(): TemplateResult | void {
    return html`
      <paper-card heading="Log">
        <div class="card-content" id="content"></div>
        <div class="card-actions">
          <mwc-button @click=${this.refresh}>Refresh</mwc-button>
        </div>
      </paper-card>
    `;
  }

  static get styles(): CSSResult[] {
    return [
      hassioStyle,
      ANSI_HTML_STYLE,
      css`
        :host,
        paper-card {
          display: block;
        }
        pre {
          overflow-x: auto;
          white-space: pre-wrap;
          overflow-wrap: break-word;
        }
      `,
    ];
  }

  protected firstUpdated() {
    this.loadData();
  }

  loadData() {
    this.hass.callApi("GET", `hassio/addons/${this.addon.slug}/logs`).then(
      (text) => {
        while (this._logContet.lastChild) {
          this._logContet.removeChild(this._logContet.lastChild as Node);
        }
        this._logContet.appendChild(parseTextToColoredPre(text));
      },
      () => {
        this._logContet.innerHTML =
          '<span class="fg-red bold">Error fetching logs</span>';
      }
    );
  }

  refresh() {
    this.loadData();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hassio-addon-logs": HassioAddonLogs;
  }
}
