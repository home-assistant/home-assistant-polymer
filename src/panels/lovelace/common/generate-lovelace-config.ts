import { HomeAssistant, GroupEntity } from "../../../types";
import {
  LovelaceConfig,
  LovelaceCardConfig,
  LovelaceViewConfig,
} from "../../../data/lovelace";
import { HassEntity, HassEntities } from "home-assistant-js-websocket";
import extractViews from "../../../common/entity/extract_views";
import getViewEntities from "../../../common/entity/get_view_entities";
import computeStateName from "../../../common/entity/compute_state_name";
import splitByGroups from "../../../common/entity/split_by_groups";
import computeObjectId from "../../../common/entity/compute_object_id";
import computeStateDomain from "../../../common/entity/compute_state_domain";
import { LocalizeFunc } from "../../../mixins/localize-base-mixin";
import computeDomain from "../../../common/entity/compute_domain";

const DEFAULT_VIEW_ENTITY_ID = "group.default_view";
const DOMAINS_BADGES = [
  "binary_sensor",
  "device_tracker",
  "mailbox",
  "sensor",
  "sun",
  "timer",
];
const HIDE_DOMAIN = new Set(["persistent_notification", "configurator"]);

const computeCards = (
  title: string,
  states: Array<[string, HassEntity]>
): LovelaceCardConfig[] => {
  const cards: LovelaceCardConfig[] = [];

  // For entity card
  const entities: string[] = [];

  for (const [entityId /*, stateObj */] of states) {
    const domain = computeDomain(entityId);

    if (domain === "alarm_control_panel") {
      cards.push({
        type: "alarm-panel",
        entity: entityId,
      });
    } else if (domain === "climate") {
      cards.push({
        type: "thermostat",
        entity: entityId,
      });
    } else if (domain === "media_player") {
      cards.push({
        type: "media-control",
        entity: entityId,
      });
    } else if (domain === "plant") {
      cards.push({
        type: "plant-status",
        entity: entityId,
      });
    } else if (domain === "weather") {
      cards.push({
        type: "weather-forecast",
        entity: entityId,
      });
    } else {
      entities.push(entityId);
    }
  }

  if (entities.length > 0) {
    cards.unshift({
      title,
      type: "entities",
      entities,
    });
  }

  return cards;
};

const computeDefaultViewStates = (hass: HomeAssistant): HassEntities => {
  const states = {};
  Object.keys(hass.states).forEach((entityId) => {
    const stateObj = hass.states[entityId];
    if (
      !stateObj.attributes.hidden &&
      !HIDE_DOMAIN.has(computeStateDomain(stateObj))
    ) {
      states[entityId] = hass.states[entityId];
    }
  });
  return states;
};

const generateViewConfig = (
  localize: LocalizeFunc,
  id: string,
  title: string | undefined,
  icon: string | undefined,
  entities: HassEntities,
  groupOrders: { [entityId: string]: number }
): LovelaceViewConfig => {
  const splitted = splitByGroups(entities);
  splitted.groups.sort(
    (gr1, gr2) => groupOrders[gr1.entity_id] - groupOrders[gr2.entity_id]
  );

  const badgeEntities: { [domain: string]: string[] } = {};
  const ungroupedEntitites: { [domain: string]: string[] } = {};

  // Organize ungrouped entities in badges/ungrouped things
  Object.keys(splitted.ungrouped).forEach((entityId) => {
    const state = splitted.ungrouped[entityId];
    const domain = computeStateDomain(state);

    const coll = DOMAINS_BADGES.includes(domain)
      ? badgeEntities
      : ungroupedEntitites;

    if (!(domain in coll)) {
      coll[domain] = [];
    }

    coll[domain].push(state.entity_id);
  });

  let badges: string[] = [];
  DOMAINS_BADGES.forEach((domain) => {
    if (domain in badgeEntities) {
      badges = badges.concat(badgeEntities[domain]);
    }
  });

  let cards: LovelaceCardConfig[] = [];

  splitted.groups.forEach((groupEntity) => {
    cards = cards.concat(
      computeCards(
        computeStateName(groupEntity),
        groupEntity.attributes.entity_id.map(
          (entityId): [string, HassEntity] => [entityId, entities[entityId]]
        )
      )
    );
  });

  Object.keys(ungroupedEntitites)
    .sort()
    .forEach((domain) => {
      cards = cards.concat(
        computeCards(
          localize(`domain.${domain}`),
          ungroupedEntitites[domain].map(
            (entityId): [string, HassEntity] => [entityId, entities[entityId]]
          )
        )
      );
    });

  return {
    id,
    title,
    icon,
    badges,
    cards,
  };
};

export const generateLovelaceConfig = (
  hass: HomeAssistant,
  localize: LocalizeFunc
): LovelaceConfig => {
  const viewEntities = extractViews(hass.states);

  const views = viewEntities.map((viewEntity: GroupEntity) => {
    const states = getViewEntities(hass.states, viewEntity);

    // In the case of a normal view, we use group order as specified in view
    const groupOrders = {};
    Object.keys(states).forEach((entityId, idx) => {
      groupOrders[entityId] = idx;
    });

    return generateViewConfig(
      localize,
      computeObjectId(viewEntity.entity_id),
      computeStateName(viewEntity),
      viewEntity.attributes.icon,
      states,
      groupOrders
    );
  });

  let title = hass.config.location_name;

  // User can override default view. If they didn't, we will add one
  // that contains all entities.
  if (
    viewEntities.length === 0 ||
    viewEntities[0].entity_id !== DEFAULT_VIEW_ENTITY_ID
  ) {
    const states = computeDefaultViewStates(hass);

    // In the case of a default view, we want to use the group order attribute
    const groupOrders = {};
    Object.keys(states).forEach((entityId) => {
      const stateObj = states[entityId];
      if (stateObj.attributes.order) {
        groupOrders[entityId] = stateObj.attributes.order;
      }
    });

    views.unshift(
      generateViewConfig(
        localize,
        "default_view",
        "Home",
        undefined,
        states,
        groupOrders
      )
    );

    // Make sure we don't have Home as title and first tab.
    if (views.length > 1 && title === "Home") {
      title = "Home Assistant";
    }
  }

  return {
    _frontendAuto: true,
    title,
    views,
  };
};
