import { css, CSSResult } from "lit-element";
import { computeCardSize } from "../common/compute-card-size";
import { HuiStackCard } from "./hui-stack-card";
import { GridCardConfig } from "./types";
import { LovelaceCardEditor } from "../types";

const DEFAULT_COLUMNS = 3;
const SQUARE_ROW_HEIGHTS = {
  1: 5,
  2: 3,
  3: 2,
};

class HuiGridCard extends HuiStackCard<GridCardConfig> {
  public static async getConfigElement(): Promise<LovelaceCardEditor> {
    await import("../editor/config-elements/hui-grid-card-editor");
    return document.createElement("hui-grid-card-editor");
  }

  public async getCardSize(): Promise<number> {
    if (!this._cards || !this._config) {
      return 0;
    }

    if (this.square) {
      const rowHeight = SQUARE_ROW_HEIGHTS[this.columns] || 1;
      return (
        (this._cards.length / this.columns) * rowHeight +
        (this._config.title ? 1 : 0)
      );
    }

    const promises: Array<Promise<number> | number> = [];

    for (const element of this._cards) {
      promises.push(computeCardSize(element));
    }

    const cardSizes = await Promise.all(promises);

    let totalHeight = this._config.title ? 1 : 0;

    console.log(cardSizes);

    // Each column will adjust to max card size of it's row
    for (let start = 0; start < cardSizes.length; start += this.columns) {
      console.log({
        start,
        end: start + this.columns,
        height: cardSizes.slice(start, start + this.columns),
      });
      totalHeight += Math.max(...cardSizes.slice(start, start + this.columns));
    }

    return totalHeight;
  }

  get columns() {
    return this._config?.columns || DEFAULT_COLUMNS;
  }

  get square() {
    return this._config?.square !== false;
  }

  setConfig(config: GridCardConfig) {
    super.setConfig(config);
    this.style.setProperty("--grid-card-column-count", String(this.columns));
    this.toggleAttribute("square", this.square);
  }

  static get styles(): CSSResult[] {
    return [
      super.sharedStyles,
      css`
        #root {
          display: grid;
          grid-template-columns: repeat(
            var(--grid-card-column-count, ${DEFAULT_COLUMNS}),
            minmax(0, 1fr)
          );
          grid-gap: var(--grid-card-gap, 8px);
        }
        :host([square]) #root {
          grid-auto-rows: 1fr;
        }
        :host([square]) #root::before {
          content: "";
          width: 0;
          padding-bottom: 100%;
          grid-row: 1 / 1;
          grid-column: 1 / 1;
        }

        :host([square]) #root > *:first-child {
          grid-row: 1 / 1;
          grid-column: 1 / 1;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-grid-card": HuiGridCard;
  }
}

customElements.define("hui-grid-card", HuiGridCard);
