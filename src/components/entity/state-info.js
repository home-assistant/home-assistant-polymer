import { html } from "@polymer/polymer/lib/utils/html-tag";
/* eslint-plugin-disable lit */
import { PolymerElement } from "@polymer/polymer/polymer-element";
import { computeStateName } from "../../common/entity/compute_state_name";
import { computeRTL } from "../../common/util/compute_rtl";
import "../ha-relative-time";
import "./state-badge";

class StateInfo extends PolymerElement {
  static get template() {
    return html`
      ${this.styleTemplate} ${this.stateBadgeTemplate} ${this.infoTemplate}
    `;
  }

  static get styleTemplate() {
    return html`
      <style>
        :host {
          @apply --paper-font-body1;
          min-width: 120px;
          white-space: nowrap;
        }

        state-badge {
          float: left;
        }

        :host([rtl]) state-badge {
          float: right;
        }

        .info {
          margin-left: 56px;
        }

        :host([rtl]) .info {
          margin-right: 56px;
          margin-left: 0;
          text-align: right;
        }

        .name {
          @apply --paper-font-common-nowrap;
          color: var(--primary-text-color);
          line-height: 40px;
        }

        .name[in-dialog],
        :host([secondary-line]) .name {
          line-height: 20px;
        }

        .time-ago,
        .extra-info,
        .extra-info > * {
          @apply --paper-font-common-nowrap;
          color: var(--secondary-text-color);
        }

        .last-updated {
          font-size: 90%;
          opacity: 0;
          padding: 3px 5px;
          position: absolute;
          background: rgba(80, 80, 80, 0.9);
          color: white;
          border-radius: 3px;
          pointer-events: none;
          z-index: 1000;
          width: 200px;
          transition: opacity 0.15s ease-in-out;
          display: flex;
          flex-direction: row;
          justify-content: space-between;
        }

        .time-ago:hover + .last-updated {
          opacity: 1;
        }
      </style>
    `;
  }

  static get stateBadgeTemplate() {
    return html` <state-badge state-obj="[[stateObj]]"></state-badge> `;
  }

  static get infoTemplate() {
    return html`
      <div class="info">
        <div class="name" in-dialog$="[[inDialog]]">
          [[computeStateName(stateObj)]]
        </div>

        <template is="dom-if" if="[[inDialog]]">
          <div class="time-ago">
            <ha-relative-time
              hass="[[hass]]"
              datetime="[[stateObj.last_changed]]"
            ></ha-relative-time>
          </div>
          <div class="last-updated">
            <div class="key">Last updated</div>
            <div class="value">
              <ha-relative-time
                hass="[[hass]]"
                datetime="[[stateObj.last_updated]]"
              ></ha-relative-time>
            </div>
          </div>
        </template>
        <template is="dom-if" if="[[!inDialog]]">
          <div class="extra-info"><slot> </slot></div>
        </template>
      </div>
    `;
  }

  static get properties() {
    return {
      hass: Object,
      stateObj: Object,
      inDialog: {
        type: Boolean,
        value: () => false,
      },
      rtl: {
        type: Boolean,
        reflectToAttribute: true,
        computed: "computeRTL(hass)",
      },
    };
  }

  computeStateName(stateObj) {
    return computeStateName(stateObj);
  }

  computeRTL(hass) {
    return computeRTL(hass);
  }
}

customElements.define("state-info", StateInfo);
