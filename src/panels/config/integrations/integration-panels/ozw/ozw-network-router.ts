import { customElement, property } from "lit-element";
import {
  HassRouterPage,
  RouterOptions,
} from "../../../../../layouts/hass-router-page";
import { HomeAssistant } from "../../../../../types";
import { computeTail } from "./ozw-config-router";
import { PageNavigation } from "../../../../../layouts/hass-tabs-subpage";
import { mdiServerNetwork, mdiNetwork } from "@mdi/js";

export const ozwNetworkTabs = (instance: number): PageNavigation[] => {
  return [
    {
      translationKey: "ui.panel.config.ozw.navigation.network",
      path: `/config/ozw/network/${instance}/dashboard`,
      iconPath: mdiServerNetwork,
    },
    {
      translationKey: "ui.panel.config.ozw.navigation.nodes",
      path: `/config/ozw/network/${instance}/nodes`,
      iconPath: mdiNetwork,
    },
  ];
};

@customElement("ozw-network-router")
class OZWNetworkRouter extends HassRouterPage {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property() public isWide!: boolean;

  @property() public narrow!: boolean;

  @property() public ozwInstance!: number;

  private _configEntry = new URLSearchParams(window.location.search).get(
    "config_entry"
  );

  protected routerOptions: RouterOptions = {
    defaultPage: "dashboard",
    showLoading: true,
    routes: {
      dashboard: {
        tag: "ozw-network-dashboard",
        load: () =>
          import(
            /* webpackChunkName: "ozw-network-dashboard" */ "./ozw-network-dashboard"
          ),
      },
      nodes: {
        tag: "ozw-network-nodes",
        load: () =>
          import(
            /* webpackChunkName: "ozw-network-nodes" */ "./ozw-network-nodes"
          ),
      },
      node: {
        tag: "ozw-node-router",
        load: () =>
          import(/* webpackChunkName: "ozw-node-router" */ "./ozw-node-router"),
      },
    },
  };

  protected updatePageEl(el): void {
    el.route = this.routeTail;
    el.hass = this.hass;
    el.isWide = this.isWide;
    el.narrow = this.narrow;
    el.configEntryId = this._configEntry;
    el.ozwInstance = this.ozwInstance;
    if (this._currentPage === "node") {
      const path = this.routeTail.path.split("/");
      el.nodeId = path[1];
      el.route = computeTail(this.routeTail);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ozw-network-router": OZWNetworkRouter;
  }
}
