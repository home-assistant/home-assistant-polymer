import { html } from '@polymer/polymer/lib/utils/html-tag.js';
import { PolymerElement } from '@polymer/polymer/polymer-element.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';

import { STATES_OFF } from '../../../common/const.js';

const UPDATE_INTERVAL = 10000;

class HuiImage extends PolymerElement {
  static get template() {
    return html`
      <style>
        .state-off {
          filter: grayscale(100%);
        } 
        
        img {
          display: block;
          height: auto;
          transition: filter .2s linear;
          width: 100%;
        }
      </style>
      <img src="[[imageSrc]]" id="image" class$="[[_getStateClass(state)]]"/>
`;
  }

  static get properties() {
    return {
      hass: Object,
      state: {
        type: String,
        observer: '_stateChanged'
      },
      image: String,
      stateImage: Object,
      cameraImage: String,
      imageSrc: String
    };
  }

  static get observers() {
    return ['_configChanged(image, state_image, camera_image)'];
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.cameraImage) {
      this.timer = setInterval(this._updateCameraImageSrc(), UPDATE_INTERVAL);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this.timer);
  }

  _configChanged(image, stateImage, cameraImage) {
    if (image && !stateImage && !cameraImage) {
      this.imageSrc = image;
    }
  }

  _getStateClass(state) {
    return !this.stateImage && !this.cameraImage && STATES_OFF.includes(state) ? 'state-off' : '';
  }

  _stateChanged(state) {
    if (this.cameraImage || !this.stateImage) {
      return;
    }

    const stateImg = this.stateImage &&
      (this.stateImage[state] || this.stateImage.default);

    this.imageSrc = stateImg || this.image;
  }

  _updateCameraImageSrc() {
    this.hass.connection.sendMessagePromise({
      type: 'camera_thumbnail',
      entity_id: this.cameraImage,
    }).then((resp) => {
      if (resp.success) {
        this.setProperties({
          imageSrc: `data:${resp.result.content_type};base64, ${resp.result.content}`,
        });
      }
    });
  }
}

customElements.define('hui-image', HuiImage);
