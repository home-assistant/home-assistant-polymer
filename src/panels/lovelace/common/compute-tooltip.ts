import computeStateName from "../../../common/entity/compute_state_name";
import { HomeAssistant } from "../../../types";
import { LovelaceElementConfig } from "../elements/types";
import { ActionConfig } from "../../../data/lovelace";

interface Config extends LovelaceElementConfig {
  entity?: string;
  title?: string;
  hide_title?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
}

export const computeTooltip = (hass: HomeAssistant, config: Config): string => {
  if (config.hide_title) {
    return "";
  }

  if (config.title) {
    return config.title;
  }

  let stateName = "";
  let tooltip = "";

  if (config.entity) {
    stateName =
      config.entity in hass.states
        ? computeStateName(hass.states[config.entity])
        : config.entity;
  }

  const tapTooltip = config.tap_action
    ? computeActionTooltip(hass, stateName, config.tap_action, false)
    : "";
  const holdTooltip = config.hold_action
    ? computeActionTooltip(hass, stateName, config.hold_action, true)
    : "";

  const newline = tapTooltip && holdTooltip ? "\n" : "";

  tooltip = tapTooltip + newline + holdTooltip;

  return tooltip;
};

function computeActionTooltip(
  hass: HomeAssistant,
  state: string,
  config: ActionConfig,
  isHold: boolean
) {
  if (!config || !config.action || config.action === "none") {
    return "";
  }

  let tooltip =
    (isHold
      ? hass.localize("ui.panel.lovelace.cards.picture-elements.hold")
      : hass.localize("ui.panel.lovelace.cards.picture-elements.tap")) + " ";

  switch (config.action) {
    case "navigate":
      tooltip += `${hass.localize(
        "ui.panel.lovelace.cards.picture-elements.navigate_to"
      )} ${config.navigation_path}`;
      break;
    case "toggle":
      tooltip += `${hass.localize(
        "ui.panel.lovelace.cards.picture-elements.toggle"
      )} ${state}`;
      break;
    case "call-service":
      tooltip += `${hass.localize(
        "ui.panel.lovelace.cards.picture-elements.call_service"
      )} ${config.service}`;
      break;
    case "more-info":
      tooltip += `${hass.localize(
        "ui.panel.lovelace.cards.picture-elements.more_info"
      )} ${state}`;
      break;
  }

  return tooltip;
}
