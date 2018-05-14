import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import '../../util/hass-util.js';
import '../ha-relative-time.js';
import './state-badge.js';

class StateInfo extends PolymerElement {
  static get template() {
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

    .info {
      margin-left: 56px;
    }

    .name {
      @apply --paper-font-common-nowrap;
      color: var(--primary-text-color);
      line-height: 40px;
    }

    .name[in-dialog], :host([secondary-line]) .name {
      line-height: 20px;
    }

    .time-ago, .extra-info, .extra-info > * {
      @apply --paper-font-common-nowrap;
      color: var(--secondary-text-color);
    }
    </style>

      <state-badge state-obj="[[stateObj]]"></state-badge>

      <div class="info">
        <div class="name" in-dialog\$="[[inDialog]]">[[computeStateName(stateObj)]]</div>

        <template is="dom-if" if="[[inDialog]]">
          <div class="time-ago">
            <ha-relative-time datetime="[[stateObj.last_changed]]"></ha-relative-time>
          </div>
        </template>
        <template is="dom-if" if="[[!inDialog]]">
          <div class="extra-info">
            <slot>
          </slot></div>
        </template>
      </div>
`;
  }

  static get is() { return 'state-info'; }

  static get properties() {
    return {
      detailed: {
        type: Boolean,
        value: false,
      },

      stateObj: {
        type: Object,
      },

      inDialog: {
        type: Boolean,
      },
    };
  }

  computeStateName(stateObj) {
    return window.hassUtil.computeStateName(stateObj);
  }
}

customElements.define(StateInfo.is, StateInfo);
