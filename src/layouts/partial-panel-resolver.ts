import { LitElement, html, PropertyValues, property } from "lit-element";

import "./hass-loading-screen";
import { HomeAssistant, Panel, PanelElement, Route } from "../types";

// Cache of panel loading promises.
const LOADED: { [panel: string]: Promise<void> } = {};

// Which panel elements we will cache.
// Maybe we can cache them all eventually, but not sure yet about
// unknown side effects (like history taking a lot of memory, reset needed)
const CACHED_EL = ["lovelace", "states"];

function ensureLoaded(panel): Promise<void> | null {
  if (panel in LOADED) {
    return LOADED[panel];
  }

  let imported;
  // Name each panel we support here, that way Webpack knows about it.
  switch (panel) {
    case "config":
      imported = import(/* webpackChunkName: "panel-config" */ "../panels/config/ha-panel-config");
      break;

    case "custom":
      imported = import(/* webpackChunkName: "panel-custom" */ "../panels/custom/ha-panel-custom");
      break;

    case "dev-event":
      imported = import(/* webpackChunkName: "panel-dev-event" */ "../panels/dev-event/ha-panel-dev-event");
      break;

    case "dev-info":
      imported = import(/* webpackChunkName: "panel-dev-info" */ "../panels/dev-info/ha-panel-dev-info");
      break;

    case "dev-mqtt":
      imported = import(/* webpackChunkName: "panel-dev-mqtt" */ "../panels/dev-mqtt/ha-panel-dev-mqtt");
      break;

    case "dev-service":
      imported = import(/* webpackChunkName: "panel-dev-service" */ "../panels/dev-service/ha-panel-dev-service");
      break;

    case "dev-state":
      imported = import(/* webpackChunkName: "panel-dev-state" */ "../panels/dev-state/ha-panel-dev-state");
      break;

    case "dev-template":
      imported = import(/* webpackChunkName: "panel-dev-template" */ "../panels/dev-template/ha-panel-dev-template");
      break;

    case "lovelace":
      imported = import(/* webpackChunkName: "panel-lovelace" */ "../panels/lovelace/ha-panel-lovelace");
      break;

    case "states":
      imported = import(/* webpackChunkName: "panel-states" */ "../panels/states/ha-panel-states");
      break;

    case "history":
      imported = import(/* webpackChunkName: "panel-history" */ "../panels/history/ha-panel-history");
      break;

    case "iframe":
      imported = import(/* webpackChunkName: "panel-iframe" */ "../panels/iframe/ha-panel-iframe");
      break;

    case "kiosk":
      imported = import(/* webpackChunkName: "panel-kiosk" */ "../panels/kiosk/ha-panel-kiosk");
      break;

    case "logbook":
      imported = import(/* webpackChunkName: "panel-logbook" */ "../panels/logbook/ha-panel-logbook");
      break;

    case "mailbox":
      imported = import(/* webpackChunkName: "panel-mailbox" */ "../panels/mailbox/ha-panel-mailbox");
      break;

    case "map":
      imported = import(/* webpackChunkName: "panel-map" */ "../panels/map/ha-panel-map");
      break;

    case "profile":
      imported = import(/* webpackChunkName: "panel-profile" */ "../panels/profile/ha-panel-profile");
      break;

    case "shopping-list":
      imported = import(/* webpackChunkName: "panel-shopping-list" */ "../panels/shopping-list/ha-panel-shopping-list");
      break;

    case "calendar":
      imported = import(/* webpackChunkName: "panel-calendar" */ "../panels/calendar/ha-panel-calendar");
      break;

    default:
      imported = null;
  }

  if (imported != null) {
    LOADED[panel] = imported;
  }

  return imported;
}

class PartialPanelResolver extends LitElement {
  @property() public hass?: HomeAssistant;
  @property() public narrow?: boolean;
  @property() public showMenu?: boolean;
  @property() public route?: Route | null;

  @property() private _routeTail?: Route | null;
  @property() private _panelEl?: PanelElement;
  @property() private _error?: boolean;
  private _panel?: Panel;
  private _cache: { [name: string]: PanelElement } = {};

  protected render() {
    if (this._error) {
      return html`
        <hass-error-screen
          title=""
          error="Error while loading this panel."
          .narrow=${this.narrow}
          .showMenu=${this.showMenu}
        ></hass-error-screen>
      `;
    }

    if (!this._panelEl) {
      return html`
        <hass-loading-screen
          .narrow=${this.narrow}
          .showMenu=${this.showMenu}
        ></hass-loading-screen>
      `;
    }

    return html`
      ${this._panelEl}
    `;
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    // Load it before it's needed, because it will be shown if user is offline
    // and a panel has to be loaded.
    import(/* webpackChunkName: "hass-error-screen" */ "./hass-error-screen");
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (!this.hass) {
      return;
    }

    if (changedProps.has("route")) {
      // Manual splitting
      const route = this.route!;
      const dividerPos = route.path.indexOf("/", 1);
      this._routeTail =
        dividerPos === -1
          ? {
              prefix: route.path,
              path: "",
            }
          : {
              prefix: route.path.substr(0, dividerPos),
              path: route.path.substr(dividerPos),
            };

      // If just route changed, no need to process further.
      if (changedProps.size === 1) {
        return;
      }
    }

    if (changedProps.has("hass")) {
      const panel = this.hass.panels[this.hass.panelUrl];

      if (panel !== this._panel) {
        this._panel = panel;
        this._panelEl = undefined;

        // Found cached one, use that
        if (panel.component_name in this._cache) {
          this._panelEl = this._cache[panel.component_name];
          this._updatePanel();
          return;
        }

        const loadingProm = ensureLoaded(panel.component_name);

        if (loadingProm === null) {
          this._error = true;
          return;
        }

        loadingProm.then(
          () => {
            // If panel changed while loading.
            if (this._panel !== panel) {
              return;
            }

            this._panelEl = (this._panelEl = document.createElement(
              `ha-panel-${panel.component_name}`
            )) as PanelElement;

            if (CACHED_EL.includes(panel.component_name)) {
              this._cache[panel.component_name] = this._panelEl;
            }

            this._updatePanel();
          },
          (err) => {
            // tslint:disable-next-line
            console.error("Error loading panel", err);
            this._error = true;
          }
        );
        return;
      }
    }

    this._updatePanel();
  }

  private _updatePanel() {
    const el = this._panelEl;

    if (!el) {
      return;
    }

    if ("setProperties" in el) {
      // As long as we have Polymer panels
      (el as any).setProperties({
        hass: this.hass,
        narrow: this.narrow,
        showMenu: this.showMenu,
        route: this._routeTail,
        panel: this._panel,
      });
    } else {
      el.hass = this.hass;
      el.narrow = this.narrow;
      el.showMenu = this.showMenu;
      el.route = this._routeTail;
      el.panel = this._panel;
    }
  }
}

customElements.define("partial-panel-resolver", PartialPanelResolver);
