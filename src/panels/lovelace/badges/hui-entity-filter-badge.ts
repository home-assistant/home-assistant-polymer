import { createBadgeElement } from "../common/create-badge-element";
import { processConfigEntities } from "../common/process-config-entities";
import { LovelaceBadge } from "../types";
import { LovelaceBadgeConfig } from "../../../data/lovelace";
import { EntityFilterEntityConfig } from "../entity-rows/types";
import { HomeAssistant } from "../../../types";
import { EntityFilterBadgeConfig } from "./types";
import { evaluateFilter } from "../common/evaluate-filter";

class EntityFilterBadge extends HTMLElement implements LovelaceBadge {
  public isPanel?: boolean;
  private _element?: LovelaceBadge;
  private _config?: EntityFilterBadgeConfig;
  private _configEntities?: EntityFilterEntityConfig[];
  private _baseCardConfig?: LovelaceBadgeConfig;
  private _hass?: HomeAssistant;
  private _oldEntities?: EntityFilterEntityConfig[];

  public setConfig(config: EntityFilterBadgeConfig): void {
    if (!config.entities || !Array.isArray(config.entities)) {
      throw new Error("entities must be specified.");
    }

    if (
      !(config.state_filter && Array.isArray(config.state_filter)) &&
      !config.entities.every(
        (entity) =>
          typeof entity === "object" &&
          entity.state_filter &&
          Array.isArray(entity.state_filter)
      )
    ) {
      throw new Error("Incorrect filter config.");
    }

    this._config = config;
    this._configEntities = undefined;

    if (this.lastChild) {
      this.removeChild(this.lastChild);
      this._element = undefined;
    }
  }

  set hass(hass: HomeAssistant) {
    if (!hass || !this._config) {
      return;
    }

    if (!this.haveEntitiesChanged(hass)) {
      this._hass = hass;
      return;
    }

    this._hass = hass;

    if (!this._configEntities) {
      this._configEntities = processConfigEntities(this._config.entities);
    }

    const entitiesList = this._configEntities.filter((entityConf) => {
      const stateObj = hass.states[entityConf.entity];

      if (!stateObj) {
        return false;
      }

      if (entityConf.state_filter) {
        for (const filter of entityConf.state_filter) {
          if (evaluateFilter(stateObj, filter)) {
            return true;
          }
        }
      } else {
        for (const filter of this._config!.state_filter) {
          if (evaluateFilter(stateObj, filter)) {
            return true;
          }
        }
      }

      return false;
    });

    if (entitiesList.length === 0) {
      this.style.display = "none";
      return;
    }

    const element = this._badgeElement();

    if (!element) {
      return;
    }

    if (element.tagName !== "HUI-ERROR-CARD") {
      const isSame =
        this._oldEntities &&
        entitiesList.length === this._oldEntities.length &&
        entitiesList.every((entity, idx) => entity === this._oldEntities![idx]);

      if (!isSame) {
        this._oldEntities = entitiesList;
        element.setConfig({ ...this._baseCardConfig!, entities: entitiesList });
      }

      element.hass = hass;
    }

    // Attach element if it has never been attached.
    if (!this.lastChild) {
      this.appendChild(element);
    }

    this.style.display = "block";
  }

  private haveEntitiesChanged(hass: HomeAssistant): boolean {
    if (!this._hass) {
      return true;
    }

    if (!this._configEntities) {
      return true;
    }

    for (const config of this._configEntities) {
      if (
        this._hass.states[config.entity] !== hass.states[config.entity] ||
        this._hass.localize !== hass.localize
      ) {
        return true;
      }
    }

    return false;
  }

  private _badgeElement(): LovelaceBadge | undefined {
    if (!this._element && this._config) {
      const element = createBadgeElement(this._baseCardConfig!);
      this._element = element;
    }

    return this._element;
  }
}
customElements.define("hui-entity-filter-badge", EntityFilterBadge);
