import {
  css,
  CSSResult,
  eventOptions,
  html,
  LitElement,
  property,
  PropertyValues,
  TemplateResult,
} from "lit-element";
import { scroll } from "lit-virtualizer";
import { formatDate } from "../../common/datetime/format_date";
import { formatTimeWithSeconds } from "../../common/datetime/format_time";
import { restoreScroll } from "../../common/decorators/restore-scroll";
import { fireEvent } from "../../common/dom/fire_event";
import { domainIcon } from "../../common/entity/domain_icon";
import { stateIcon } from "../../common/entity/state_icon";
import { computeRTL, emitRTLDirection } from "../../common/util/compute_rtl";
import "../../components/ha-icon";
import { LogbookEntry } from "../../data/logbook";
import { HomeAssistant } from "../../types";

class HaLogbook extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public userIdToName = {};

  @property({ attribute: false }) public entries: LogbookEntry[] = [];

  @property({ type: Boolean, attribute: "narrow", reflect: true })
  public narrow = false;

  @property({ attribute: "rtl", type: Boolean, reflect: true })
  private _rtl = false;

  @property({ type: Boolean, attribute: "no-click", reflect: true })
  public noClick = false;

  @property({ type: Boolean, attribute: "no-icon", reflect: true })
  public noIcon = false;

  @property({ type: Boolean, attribute: "no-name", reflect: true })
  public noName = false;

  // @ts-ignore
  @restoreScroll(".container") private _savedScrollPos?: number;

  protected shouldUpdate(changedProps: PropertyValues) {
    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    const languageChanged =
      oldHass === undefined || oldHass.language !== this.hass.language;

    return changedProps.has("entries") || languageChanged;
  }

  protected updated(_changedProps: PropertyValues) {
    const oldHass = _changedProps.get("hass") as HomeAssistant | undefined;

    if (oldHass === undefined || oldHass.language !== this.hass.language) {
      this._rtl = computeRTL(this.hass);
    }
  }

  protected render(): TemplateResult {
    if (!this.entries?.length) {
      return html`
        <div class="container no-entries" .dir=${emitRTLDirection(this._rtl)}>
          ${this.hass.localize("ui.panel.logbook.entries_not_found")}
        </div>
      `;
    }

    return html`
      <div class="container" @scroll=${this._saveScrollPos}>
        ${scroll({
          items: this.entries,
          renderItem: (item: LogbookEntry, index?: number) =>
            this._renderLogbookItem(item, index),
        })}
      </div>
    `;
  }

  private _renderLogbookItem(
    item: LogbookEntry,
    index?: number
  ): TemplateResult {
    if (index === undefined) {
      return html``;
    }
    const previous = this.entries[index - 1];
    const state = item.entity_id ? this.hass.states[item.entity_id] : undefined;
    const item_username =
      item.context_user_id && this.userIdToName[item.context_user_id];
    return html`
      <div>
        ${index === 0 ||
        (item?.when &&
          previous?.when &&
          new Date(item.when).toDateString() !==
            new Date(previous.when).toDateString())
          ? html`
              <h4 class="date">
                ${formatDate(new Date(item.when), this.hass.language)}
              </h4>
            `
          : html``}

        <div class="entry">
          <div class="time">
            ${formatTimeWithSeconds(new Date(item.when), this.hass.language)}
          </div>
          <div class="icon-message">
            ${!this.noIcon
              ? html`
                  <ha-icon
                    .icon=${state ? stateIcon(state) : domainIcon(item.domain)}
                  ></ha-icon>
                `
              : ""}
            <div class="message">
              ${!this.noName
                ? !item.entity_id
                  ? html`<span class="name">${item.name}</span>`
                  : html`
                      <a
                        href="#"
                        @click=${this._entityClicked}
                        .entityId=${item.entity_id}
                        class="name"
                        >${item.name}</a
                      >
                    `
                : ""}
              <span class="item-message">${item.message}</span>
              <span>${item_username ? ` (${item_username})` : ``}</span>
              ${!item.context_event_type
                ? ""
                : item.context_event_type === "call_service"
                ? // Service Call
                  html` by service
                  ${item.context_domain}.${item.context_service}`
                : item.context_entity_id === item.entity_id
                ? // HomeKit or something that self references
                  html` by
                  ${item.context_name
                    ? item.context_name
                    : item.context_event_type}`
                : // Another entity such as an automation or script
                  html` by
                    <a
                      href="#"
                      @click=${this._entityClicked}
                      .entityId=${item.context_entity_id}
                      class="name"
                      >${item.context_entity_id_name}</a
                    >`}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  @eventOptions({ passive: true })
  private _saveScrollPos(e: Event) {
    this._savedScrollPos = (e.target as HTMLDivElement).scrollTop;
  }

  private _entityClicked(ev: Event) {
    if (this.noClick) {
      return;
    }
    ev.preventDefault();
    fireEvent(this, "hass-more-info", {
      entityId: (ev.target as any).entityId,
    });
  }

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        height: 100%;
      }

      :host([rtl]) {
        direction: ltr;
      }

      .entry {
        display: flex;
        line-height: 2em;
      }

      .time {
        width: 65px;
        flex-shrink: 0;
        font-size: 0.8em;
        color: var(--secondary-text-color);
      }

      :host([rtl]) .date {
        direction: rtl;
      }

      .icon-message {
        display: flex;
        align-items: center;
      }

      .no-entries {
        text-align: center;
      }

      ha-icon {
        margin: 0 8px 0 16px;
        flex-shrink: 0;
        color: var(--primary-text-color);
      }

      .message {
        color: var(--primary-text-color);
      }

      :host([no-name]) .item-message {
        text-transform: capitalize;
      }

      a {
        color: var(--primary-color);
      }

      :host([no-click]) a {
        color: inherit;
        text-decoration: none;
        cursor: auto;
      }

      .container {
        padding: 0 16px;
      }

      .uni-virtualizer-host {
        display: block;
        position: relative;
        contain: strict;
        height: 100%;
        overflow: auto;
      }

      .uni-virtualizer-host > * {
        box-sizing: border-box;
      }

      :host([narrow]) .entry {
        flex-direction: column;
      }

      :host([narrow]) .icon-message ha-icon {
        margin-left: 0;
      }
    `;
  }
}

customElements.define("ha-logbook", HaLogbook);

declare global {
  interface HTMLElementTagNameMap {
    "ha-logbook": HaLogbook;
  }
}
