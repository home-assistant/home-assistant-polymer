import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-slider/paper-slider.js';
import { IronResizableBehavior } from '@polymer/iron-resizable-behavior/iron-resizable-behavior.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';

import '../components/hui-generic-entity-row.js';

class HuiInputNumberEntityRow extends mixinBehaviors([IronResizableBehavior], PolymerElement) {
  static get template() {
    return html`
      <style>
        paper-slider {
          margin-left: auto;
        }
        #state {
          min-width: 45px;
        }
        paper-input {
          text-align: right;
          margin-left: auto;
        }
        .wrapper {
          flex: 1;
        }
      </style>
      <hui-generic-entity-row
        hass="[[hass]]"
        config="[[_config]]"
        id="input_number_card"
      >
        <div class="wrapper">
          <template is="dom-if" if="[[_equals(_stateObj.attributes.mode, 'slider')]]">
            <paper-slider
              min="[[_min]]"
              max="[[_max]]"
              value="{{_value}}"
              step="[[_step]]"
              pin
              on-change="_selectedValueChanged"
              id="slider"
              ignore-bar-touch
            ></paper-slider>
          </template>
          <template is="dom-if" if="[[_equals(_stateObj.attributes.mode, 'box')]]">
            <paper-input
              no-label-float
              auto-validate
              pattern="[0-9]+([\\.][0-9]+)?"
              step="[[_step]]"
              min="[[_min]]"
              max="[[_max]]"
              value="{{_value}}"
              type="number"
              on-change="_selectedValueChanged"
            ></paper-input>
          </template>
          <div id="state">[[_value]] [[_stateObj.attributes.unit_of_measurement]]</div>
        </div>
      </hui-generic-entity-row>
    `;
  }

  static get properties() {
    return {
      hass: Object,
      _config: Object,
      _stateObj: {
        type: Object,
        computed: '_computeStateObj(hass.states, _config.entity)',
        observer: '_stateObjChanged'
      },
      _min: {
        type: Number,
        value: 0
      },
      _max: {
        type: Number,
        value: 100
      },
      _step: Number,
      _value: Number
    };
  }

  ready() {
    super.ready();
    if (typeof ResizeObserver === 'function') {
      const ro = new ResizeObserver((entries) => {
        entries.forEach(() => {
          this._hiddenState();
        });
      });
      ro.observe(this.$.input_number_card);
    } else {
      this.addEventListener('iron-resize', this._hiddenState);
    }
  }

  _equals(a, b) {
    return a === b;
  }

  _computeStateObj(states, entityId) {
    return states && entityId in states ? states[entityId] : null;
  }

  setConfig(config) {
    if (!config || !config.entity) {
      throw new Error('Entity not configured.');
    }
    this._config = config;
  }

  _hiddenState() {
    if (this.mode !== 'slider') return;
    const sliderwidth = this.$.slider.offsetWidth;
    if (sliderwidth < 100) {
      this.$.state.hidden = true;
    } else if (sliderwidth >= 145) {
      this.$.state.hidden = false;
    }
  }

  _stateObjChanged(stateObj, oldStateObj) {
    this.setProperties({
      _min: Number(stateObj.attributes.min),
      _max: Number(stateObj.attributes.max),
      _step: Number(stateObj.attributes.step),
      _value: Number(stateObj.state)
    });
    if (oldStateObj && stateObj.attributes.mode === 'slider' && oldStateObj.attributes.mode !== 'slider') {
      this._hiddenState();
    }
  }

  _selectedValueChanged() {
    if (this._value === Number(this._stateObj.state)) return;

    this.hass.callService('input_number', 'set_value', {
      value: this._value,
      entity_id: this._stateObj.entity_id,
    });
  }
}
customElements.define('hui-input-number-entity-row', HuiInputNumberEntityRow);
