import "@material/mwc-icon-button/mwc-icon-button";
import "../../../components/ha-svg-icon";
import "../../../components/ha-switch";
import type { HaSwitch } from "../../../components/ha-switch";
import "../../../components/paper-time-input";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property, PropertyValues } from "lit/decorators";
import { mdiDelete, mdiPlus } from "@mdi/js";
import { HassEntity } from "home-assistant-js-websocket";
import { BINARY_STATE_ON, BINARY_STATE_OFF } from "../../../common/const";
import { HomeAssistant } from "../../../types";

declare type EventEntry = {
  time: string;
  state: string;
};

@customElement("more-info-input_timetable")
class MoreInfoInputTimetable extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({
    attribute: false,
    hasChanged(newVal: HassEntity, oldVal: HassEntity) {
      if (!newVal) {
        return false;
      }
      return (
        !oldVal ||
        JSON.stringify(oldVal.attributes.timetable) !==
          JSON.stringify(newVal.attributes.timetable)
      );
    },
  })
  public stateObj?: HassEntity;

  private _timetable: Array<EventEntry> = [];

  private _disable_reconfig = false;

  protected render(): TemplateResult {
    if (!this.hass || !this.stateObj) {
      return html``;
    }
    this._disable_reconfig = true;
    return html`
      ${this._timetable.map((event: EventEntry, index: number) =>
        this._renderEntry(event, index)
      )}
      <div class="add">
        <mwc-icon-button
          .label=${this.hass!.localize(
            "ui.dialogs.more_info_control.input_timetable.add"
          )}
          @click=${this._addEntry}
        >
          <ha-svg-icon .path=${mdiPlus}></ha-svg-icon>
        </mwc-icon-button>
        <p>
          ${this.hass!.localize(
            "ui.dialogs.more_info_control.input_timetable.add"
          )}
        </p>
      </div>
    `;
  }

  updated() {
    this._disable_reconfig = false;
  }

  private _renderEntry(event: EventEntry, index: number) {
    const time = event.time.split(":");
    return html` <div class="entry">
      <paper-time-input
        .hour=${time[0]}
        .min=${time[1]}
        format="24"
        hide-label
        @hour-changed=${this._hourChanged.bind(this, event)}
        @min-changed=${this._minChanged.bind(this, event)}
      ></paper-time-input>
      <ha-switch
        .checked=${event.state === BINARY_STATE_ON}
        @change=${(ev: { target: any }) => {
          this._updateEventState((ev.target as HaSwitch).checked, event);
        }}
      ></ha-switch>
      <mwc-icon-button
        .label=${this.hass!.localize(
          "ui.dialogs.more_info_control.input_timetable.delete"
        )}
        class="delete"
        @click=${this._deleteEntry.bind(this, index)}
      >
        <ha-svg-icon path=${mdiDelete}></ha-svg-icon>
      </mwc-icon-button>
    </div>`;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (changedProps.has("stateObj")) {
      const new_timetable = this.stateObj!.attributes.timetable;
      const old_timetable = [...this._timetable];
      old_timetable.sort((x, y) => (x.time < y.time ? -1 : 1));
      if (JSON.stringify(old_timetable) !== JSON.stringify(new_timetable)) {
        this._timetable = [...new_timetable];
      }
    }
    return true;
  }

  private _hourChanged(event: EventEntry, ev: { detail: { value: any } }) {
    this._updateEventTime(ev.detail.value, 0, event);
  }

  private _minChanged(event: EventEntry, ev: { detail: { value: any } }) {
    this._updateEventTime(ev.detail.value, 1, event);
  }

  private _updateEventTime(value: string, index: number, event: EventEntry) {
    const time = event.time.split(":");
    const normalized = parseInt(value).toString();
    const element = (normalized.length < 2 ? "0" : "") + normalized;
    if (element !== time[index]) {
      time[index] = element;
      event.time = `${time[0]}:${time[1]}:${time[2]}`;
      this._reconfig();
    }
  }

  private _updateEventState(value: boolean, event: EventEntry) {
    event.state = value ? BINARY_STATE_ON : BINARY_STATE_OFF;
    this._reconfig();
  }

  private _reconfig() {
    if (!this._disable_reconfig) {
      this.hass!.callService("input_timetable", "reconfig", {
        entity_id: this.stateObj!.entity_id,
        timetable: this._timetable,
      });
    }
  }

  private _deleteEntry(index: number) {
    this._timetable = this._timetable.filter((_, i) => i !== index);
    this.requestUpdate();
    this._reconfig();
  }

  private _addEntry() {
    this._timetable.push({
      time: "00:00:00",
      state: BINARY_STATE_ON,
    });
    this.requestUpdate();
  }

  static get styles(): CSSResultGroup {
    return css`
      .entry {
        display: flex;
        justify-content: space-around;
      }
      .add {
        display: flex;
        justify-content: center;
      }
      .delete {
        margin-top: -4px;
      }
      ha-switch {
        padding-top: 12px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-input_timetable": MoreInfoInputTimetable;
  }
}
