import { HomeAssistant } from "../types";
import compute_state_name from "../common/entity/compute_state_name";

export interface DeviceAutomation {
  device_id: string;
  domain: string;
  entity_id: string;
  type?: string;
  event?: string;
}

export interface DeviceAction extends DeviceAutomation {
  device: string;
}

export interface DeviceCondition extends DeviceAutomation {
  condition: string;
}

export interface DeviceTrigger extends DeviceAutomation {
  platform: string;
}

export const fetchDeviceActions = (hass: HomeAssistant, deviceId: string) =>
  hass.callWS<DeviceAction[]>({
    type: "device_automation/action/list",
    device_id: deviceId,
  });

export const fetchDeviceConditions = (hass: HomeAssistant, deviceId: string) =>
  hass.callWS<DeviceCondition[]>({
    type: "device_automation/condition/list",
    device_id: deviceId,
  });

export const fetchDeviceTriggers = (hass: HomeAssistant, deviceId: string) =>
  hass.callWS<DeviceTrigger[]>({
    type: "device_automation/trigger/list",
    device_id: deviceId,
  });

export const deviceAutomationsEqual = (
  a: DeviceAutomation,
  b: DeviceAutomation
) => {
  if (typeof a !== typeof b) {
    return false;
  }

  for (const property in a) {
    if (!Object.is(a[property], b[property])) {
      return false;
    }
  }
  for (const property in b) {
    if (!Object.is(a[property], b[property])) {
      return false;
    }
  }

  return true;
};

export const localizeDeviceAutomationAction = (
  hass: HomeAssistant,
  action: DeviceAction
) => {
  const state = action.entity_id ? hass.states[action.entity_id] : undefined;
  return hass.localize(
    `component.${action.domain}.device_automation.action_type.${action.type}`,
    "name",
    state ? compute_state_name(state) : "<unknown>"
  );
};

export const localizeDeviceAutomationCondition = (
  hass: HomeAssistant,
  condition: DeviceCondition
) => {
  const state = condition.entity_id
    ? hass.states[condition.entity_id]
    : undefined;
  return hass.localize(
    `component.${condition.domain}.device_automation.condition_type.${
      condition.type
    }`,
    "name",
    state ? compute_state_name(state) : "<unknown>"
  );
};

export const localizeDeviceAutomationTrigger = (
  hass: HomeAssistant,
  trigger: DeviceTrigger
) => {
  const state = trigger.entity_id ? hass.states[trigger.entity_id] : undefined;
  return hass.localize(
    `component.${trigger.domain}.device_automation.trigger_type.${
      trigger.type
    }`,
    "name",
    state ? compute_state_name(state) : "<unknown>"
  );
};
