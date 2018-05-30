import '@polymer/paper-slider/paper-slider.js';

/**
* @polymer
* @customElement
* @appliesMixin paper-slider
*/
const PaperSliderClass = customElements.get('paper-slider');

class HaPaperSlider extends PaperSliderClass {
  static get template() {
    const tpl = document.createElement('template');
    tpl.innerHTML = PaperSliderClass.template.innerHTML;
    const styleEl = tpl.content.querySelector('style');
    styleEl.setAttribute('include', 'paper-slider');
    styleEl.innerHTML = `
      .pin > .slider-knob > .slider-knob-inner {
        font-size:  var(--ha-paper-slider-pin-font-size, 10px);
        line-height: normal;
      }

      .pin > .slider-knob > .slider-knob-inner::before {
        top: unset;
        margin-left: unset;

        bottom: calc(15px + var(--calculated-paper-slider-height)/2);
        left: 50%;
        width: 2.0em;
        height: 2.0em;

        -webkit-transform-origin: left bottom;
        transform-origin: left bottom;
        -webkit-transform: rotate(-45deg) scale(0) translate(0);
        transform: rotate(-45deg) scale(0) translate(0);
      }

      .pin.expand > .slider-knob > .slider-knob-inner::before {
        -webkit-transform: rotate(-45deg) scale(1) translate(7px, -7px);
        transform: rotate(-45deg) scale(1) translate(7px, -7px);
      }

      .pin > .slider-knob > .slider-knob-inner::after {
        top: unset;
        font-size: unset;

        bottom: calc(15px + var(--calculated-paper-slider-height)/2);
        left: 50%;
        margin-left: -1.0em;
        width: 2.0em;
        height: 1.8em;

        -webkit-transform-origin: center bottom;
        transform-origin: center bottom;
        -webkit-transform: scale(0) translate(0);
        transform: scale(0) translate(0);
      }

      .pin.expand > .slider-knob > .slider-knob-inner::after {
        -webkit-transform: scale(1) translate(0, -10px);
        transform: scale(1) translate(0, -10px);
      }
    `;
    return tpl;
  }
}
customElements.define('ha-paper-slider', HaPaperSlider);
