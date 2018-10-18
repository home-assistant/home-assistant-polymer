import { html, LitElement } from "@polymer/lit-element";

import "../../../components/ha-card.js";

import { HassLocalizeLitMixin } from "../../../mixins/lit-localize-mixin";
import { LovelaceCard, LovelaceConfig } from "../types.js";

interface Config extends LovelaceConfig {
  aspect_ratio?: string;
  title?: string;
  url?: string;
}

export class HuiIframeCard extends HassLocalizeLitMixin(LitElement)
  implements LovelaceCard {
  protected config?: Config;

  static get properties() {
    return {
      config: {},
    };
  }

  public getCardSize() {
    return 1 + this.offsetHeight / 50;
  }

  public setConfig(config: Config) {
    this.config = config;
    this.requestUpdate();
  }

  protected render() {
    if (!this.config) {
      return html``;
    }

    return html`
      ${this.renderStyle()}
      <ha-card header="${this.config.title}">
        <div id="root">
          <iframe src="${this.config.url}"></iframe>
        </div>
      </ha-card>
    `;
  }

  private renderStyle() {
    if (!this.config) {
      return html``;
    }

    return html`
      <style>
        ha-card {
          overflow: hidden;
        }
        #root {
          width: 100%;
          position: relative;
          padding-top: ${this.config.aspect_ratio || "50%"};
        }
        iframe {
          position: absolute;
          border: none;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
        }
      </style>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-iframe-card": HuiIframeCard;
  }
}

customElements.define("hui-iframe-card", HuiIframeCard);
