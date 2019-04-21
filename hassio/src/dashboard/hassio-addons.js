import "@polymer/paper-card/paper-card";
import { html } from "@polymer/polymer/lib/utils/html-tag";
import { PolymerElement } from "@polymer/polymer/polymer-element";

import "../components/hassio-card-content";
import "../resources/hassio-style";
import NavigateMixin from "../../../src/mixins/navigate-mixin";
import Fuse from "fuse.js";

class HassioAddons extends NavigateMixin(PolymerElement) {
  static get template() {
    return html`
      <style include="ha-style hassio-style">
        paper-card {
          cursor: pointer;
        }
      </style>
      <div class="content card-group">
        <div class="title">Add-ons</div>
        <template is="dom-if" if="[[!addons.length]]">
          <paper-card>
            <div class="card-content">
              You don't have any add-ons installed yet. Head over to
              <a href="#" on-click="openStore">the add-on store</a> to get
              started!
            </div>
          </paper-card>
        </template>
        <template
          is="dom-repeat"
          items="[[fuzzySearchAndSort(addons, filter)]]"
          as="addon"
        >
          <paper-card on-click="addonTapped">
            <div class="card-content">
              <hassio-card-content
                hass="[[hass]]"
                title="[[addon.name]]"
                description="[[addon.description]]"
                available="[[addon.available]]"
                icon="[[computeIcon(addon)]]"
                icon-title="[[computeIconTitle(addon)]]"
                icon-class="[[computeIconClass(addon)]]"
              ></hassio-card-content>
            </div>
          </paper-card>
        </template>
      </div>
    `;
  }

  static get properties() {
    return {
      hass: Object,
      addons: Array,
    };
  }

  fuzzySearchAndSort(addons, filter) {
    if (!filter) {
      return addons.sort((a, b) =>
        a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1
      );
    }

    const options = {
      keys: ["name", "description", "slug"],
      caseSensitive: false,
      minMatchCharLength: 2,
      threshold: 0.2,
    };
    const fuse = new Fuse(addons, options);
    return fuse.search(filter);
  }

  computeIcon(addon) {
    return addon.installed !== addon.version
      ? "hassio:arrow-up-bold-circle"
      : "hassio:puzzle";
  }

  computeIconTitle(addon) {
    if (addon.installed !== addon.version) return "New version available";
    return addon.state === "started"
      ? "Add-on is running"
      : "Add-on is stopped";
  }

  computeIconClass(addon) {
    if (addon.installed !== addon.version) return "update";
    return addon.state === "started" ? "running" : "";
  }

  addonTapped(ev) {
    this.navigate("/hassio/addon/" + ev.model.addon.slug);
    ev.target.blur();
  }

  openStore(ev) {
    this.navigate("/hassio/store");
    ev.target.blur();
  }
}

customElements.define("hassio-addons", HassioAddons);
