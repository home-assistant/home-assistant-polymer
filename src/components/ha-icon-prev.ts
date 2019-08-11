import "@polymer/iron-icon/iron-icon";
// Not duplicate, this is for typing.
// tslint:disable-next-line
import { HaIcon } from "./ha-icon";

export class HaIconPrev extends HaIcon {
  public connectedCallback() {
    super.connectedCallback();

    setTimeout(() => {
      this.icon =
        window.getComputedStyle(this).direction === "ltr"
          ? "hass:chevron-left"
          : "hass:chevron-right";
    }, 100);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-icon-prev": HaIconPrev;
  }
}

customElements.define("ha-icon-prev", HaIconPrev);
