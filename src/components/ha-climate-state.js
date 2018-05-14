import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

class HaClimateState extends PolymerElement {
  static get template() {
    return html`
    <style>
      :host {
        display: flex;
        flex-direction: column;
        justify-content: center;
        white-space: nowrap;
      }

      .target {
        color: var(--primary-text-color);
      }

      .current {
        color: var(--secondary-text-color);
      }

      .state-label {
        font-weight: bold;
        text-transform: capitalize;
      }
    </style>

    <div class="target">
      <span class="state-label">
        [[stateObj.state]]
      </span>
      [[computeTarget(stateObj)]]
    </div>

    <template is="dom-if" if="[[currentStatus]]">
      <div class="current">
        Currently: [[currentStatus]]
      </div>
    </template>
`;
  }

  static get is() { return 'ha-climate-state'; }

  static get properties() {
    return {
      stateObj: Object,
      currentStatus: {
        type: String,
        computed: 'computeCurrentStatus(stateObj)',
      },
    };
  }

  computeCurrentStatus(stateObj) {
    if (stateObj.attributes.current_temperature != null) {
      return `${stateObj.attributes.current_temperature} ${stateObj.attributes.unit_of_measurement}`;
    }
    if (stateObj.attributes.current_humidity != null) {
      return `${stateObj.attributes.current_humidity} ${stateObj.attributes.unit_of_measurement}`;
    }
    return null;
  }

  computeTarget(stateObj) {
    // We're using "!= null" on purpose so that we match both null and undefined.
    if (stateObj.attributes.target_temp_low != null &&
        stateObj.attributes.target_temp_high != null) {
      return `${stateObj.attributes.target_temp_low} - ${stateObj.attributes.target_temp_high} ${stateObj.attributes.unit_of_measurement}`;
    } else if (stateObj.attributes.temperature != null) {
      return `${stateObj.attributes.temperature} ${stateObj.attributes.unit_of_measurement}`;
    } else if (stateObj.attributes.target_humidity_low != null &&
               stateObj.attributes.target_humidity_high != null) {
      return `${stateObj.attributes.target_humidity_low} - ${stateObj.attributes.target_humidity_high} ${stateObj.attributes.unit_of_measurement}`;
    } else if (stateObj.attributes.humidity != null) {
      return `${stateObj.attributes.humidity} ${stateObj.attributes.unit_of_measurement}`;
    }

    return '';
  }
}
customElements.define(HaClimateState.is, HaClimateState);
