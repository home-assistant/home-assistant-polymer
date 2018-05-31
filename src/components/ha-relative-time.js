import { dom } from '@polymer/polymer/lib/legacy/polymer.dom.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';

import relativeTime from '../common/datetime/relative_time.js';

class HaRelativeTime extends PolymerElement {
  static get properties() {
    return {
      datetime: {
        type: String,
        observer: 'datetimeChanged',
      },

      datetimeObj: {
        type: Object,
        observer: 'datetimeObjChanged',
      },

      parsedDateTime: Object
    };
  }

  constructor() {
    super();
    this.updateRelative = this.updateRelative.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    // update every 60 seconds
    this.updateInterval = setInterval(this.updateRelative, 60000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.updateInterval);
  }

  datetimeChanged(newVal) {
    this.parsedDateTime = newVal ? new Date(newVal) : null;

    this.updateRelative();
  }

  datetimeObjChanged(newVal) {
    this.parsedDateTime = newVal;

    this.updateRelative();
  }

  updateRelative() {
    const root = dom(this);
    if (!this.parsedDateTime) {
      root.innerHTML = this.localize('ui.relative_time.never');
    } else {
      const rel = relativeTime(this.parsedDateTime);
      console.log(JSON.stringify(rel, null, 2));
      console.log(typeof this.localize); // function
      console.log(this.localize('ui.relative_time.past')); // undefined
      console.log(this.localize('ui.sidebar.developer_tools')); // undefined
      const format = this.localize(`ui.relative_time.${rel.tense}`);
      const relTime = format
        .replace('$unit', this.localize(`ui.duration.${rel.unit}`, 'count', rel.value))
        .replace('$value', rel.value);
        root.innerHTML = relTime;
    }
  }
}

customElements.define('ha-relative-time', HaRelativeTime);
