import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-item/paper-icon-item.js';
import '@polymer/paper-item/paper-item-body.js';
import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@vaadin/vaadin-combo-box/vaadin-combo-box-light.js';

import '../../util/hass-mixins.js';
import './state-badge.js';

/*
 * @appliesMixin window.hassMixins.LocalizeMixin
 */
class HaEntityPicker extends window.hassMixins.LocalizeMixin(PolymerElement) {
  static get template() {
    return html`
    <style>
      paper-input > paper-icon-button {
        width: 24px;
        height: 24px;
        padding: 2px;
        color: var(--secondary-text-color);
      }
      [hidden] {
        display: none;
      }
    </style>
    <vaadin-combo-box-light items="[[_states]]" item-value-path="entity_id" item-label-path="entity_id" value="{{value}}" opened="{{opened}}" allow-custom-value="[[allowCustomEntity]]">
      <paper-input autofocus="[[autofocus]]" label="[[_computeLabel(label, localize)]]" class="input" value="[[value]]" disabled="[[disabled]]">
        <paper-icon-button slot="suffix" class="clear-button" icon="mdi:close" no-ripple="" hidden\$="[[!value]]">Clear</paper-icon-button>
        <paper-icon-button slot="suffix" class="toggle-button" icon="[[_computeToggleIcon(opened)]]" hidden="[[!_states.length]]">Toggle</paper-icon-button>
      </paper-input>
      <template>
        <style>
          paper-icon-item {
            margin: -10px;
          }
        </style>
        <paper-icon-item>
          <state-badge state-obj="[[item]]" slot="item-icon"></state-badge>
          <paper-item-body two-line="">
            <div>[[computeStateName(item)]]</div>
            <div secondary="">[[item.entity_id]]</div>
          </paper-item-body>
        </paper-icon-item>
      </template>
    </vaadin-combo-box-light>
`;
  }

  static get properties() {
    return {
      allowCustomEntity: {
        type: Boolean,
        value: false,
      },
      hass: {
        type: Object,
        observer: '_hassChanged',
      },
      _hass: Object,
      _states: {
        type: Array,
        computed: '_computeStates(_hass, domainFilter, entityFilter)',
      },
      autofocus: Boolean,
      label: {
        type: String,
      },
      value: {
        type: String,
        notify: true,
      },
      opened: {
        type: Boolean,
        value: false,
        observer: '_openedChanged',
      },
      domainFilter: {
        type: String,
        value: null,
      },
      entityFilter: {
        type: Function,
        value: null,
      },
      disabled: Boolean,
    };
  }

  _computeLabel(label, localize) {
    return label === undefined
      ? localize('ui.components.entity.entity-picker.entity')
      : label;
  }

  _computeStates(hass, domainFilter, entityFilter) {
    if (!hass) return [];

    let entityIds = Object.keys(hass.states);

    if (domainFilter) {
      entityIds = entityIds.filter(eid => eid.substr(0, eid.indexOf('.')) === domainFilter);
    }

    let entities = entityIds.sort().map(key => hass.states[key]);

    if (entityFilter) {
      entities = entities.filter(entityFilter);
    }

    return entities;
  }

  computeStateName(state) {
    return window.hassUtil.computeStateName(state);
  }

  _openedChanged(newVal) {
    if (!newVal) {
      this._hass = this.hass;
    }
  }

  _hassChanged(newVal) {
    if (!this.opened) {
      this._hass = newVal;
    }
  }

  _computeToggleIcon(opened) {
    return opened ? 'mdi:menu-up' : 'mdi:menu-down';
  }
}

customElements.define('ha-entity-picker', HaEntityPicker);
