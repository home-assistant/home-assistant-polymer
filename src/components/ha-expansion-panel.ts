import {
  css,
  CSSResult,
  customElement,
  html,
  LitElement,
  property,
  TemplateResult,
} from "lit-element";
import { fireEvent } from "../common/dom/fire_event";
import "./ha-svg-icon";
import { mdiChevronDown } from "@mdi/js";
import { classMap } from "lit-html/directives/class-map";

@customElement("ha-expansion-panel")
class HaExpansionPanel extends LitElement {
  @property({ type: Boolean, reflect: true }) expanded = false;

  @property({ type: Boolean, reflect: true }) outlined = false;

  protected render(): TemplateResult {
    return html`
      <div class="summary" @click=${this._toggleContainer}>
        <div class="summary-content">
          <slot name="title"></slot>
        </div>
        <ha-svg-icon
          .path=${mdiChevronDown}
          class="summary-icon ${classMap({ expanded: this.expanded })}"
        ></ha-svg-icon>
      </div>
      <div class="container ${classMap({ expanded: this.expanded })}">
        <slot></slot>
      </div>
    `;
  }

  private _toggleContainer(): void {
    this.expanded = !this.expanded;
    fireEvent(this, "expanded-changed", { expanded: this.expanded });
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
      }

      :host([outlined]) {
        box-shadow: none;
        border-width: 1px;
        border-style: solid;
        border-color: var(
          --ha-card-border-color,
          var(--divider-color, #e0e0e0)
        );
        border-radius: var(--ha-card-border-radius, 4px);
      }

      .summary {
        display: flex;
        padding: 0px 16px;
        min-height: 48px;
        position: relative;
        align-items: center;
        cursor: pointer;
      }

      .summary-content {
        margin: 12px 0;
        display: flex;
        flex-grow: 1;
        overflow: hidden;
      }

      .summary-icon {
        transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
      }

      .summary-icon.expanded {
        transform: rotate(180deg);
      }

      .container {
        overflow: hidden;
        transition: max-height 200ms cubic-bezier(0.4, 0, 0.2, 1);
        max-height: 0px;
      }

      .container.expanded {
        max-height: 1000px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-expansion-panel": HaExpansionPanel;
  }

  // for fire event
  interface HASSDomEvents {
    "expanded-changed": {
      expanded: boolean;
    };
  }
}