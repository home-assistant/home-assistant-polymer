import { HomeAssistant } from "../types";
import type { HaFormSchema } from "../components/ha-form/ha-form";
import { Prop } from "vue/types/options";

export interface InsteonDevice {
  name: string;
  address: string;
  is_battery: boolean;
  aldb_status: string;
}

export interface Properties {
  [key: string]: boolean | number;
}

export interface ALDBRecord {
  mem_addr: number;
  in_use: boolean;
  mode: string;
  highwater: boolean;
  group: number;
  target: string;
  target_name: string;
  data1: number;
  data2: number;
  data3: number;
  dirty: boolean;
}

export const fetchInsteonDevice = (
  hass: HomeAssistant,
  id: string
): Promise<InsteonDevice> =>
  hass.callWS({
    type: "insteon/device/get",
    device_id: id,
  });

export const fetchInsteonALDB = (
  hass: HomeAssistant,
  id: string
): Promise<ALDBRecord[]> =>
  hass.callWS({
    type: "insteon/aldb/get",
    device_id: id,
  });

export const fetchInsteonProperties = (
  hass: HomeAssistant,
  id: string
): Promise<Properties[]> =>
  hass.callWS({
    type: "insteon/properties/get",
    device_id: id,
  });

export const changeALDBRecord = (
  hass: HomeAssistant,
  id: string,
  record: ALDBRecord
): Promise<void> =>
  hass.callWS({
    type: "insteon/aldb/change",
    device_id: id,
    record: record,
  });

export const changeProperty = (
  hass: HomeAssistant,
  id: string,
  name: string,
  value: number | boolean
): Promise<void> =>
  hass.callWS({
    type: "insteon/properties/change",
    device_id: id,
    name: name,
    value: value,
  });

export const createALDBRecord = (
  hass: HomeAssistant,
  id: string,
  record: ALDBRecord
): Promise<void> =>
  hass.callWS({
    type: "insteon/aldb/create",
    device_id: id,
    record: record,
  });

export const loadALDB = (hass: HomeAssistant, id: string): Promise<void> =>
  hass.callWS({
    type: "insteon/aldb/load",
    device_id: id,
  });

export const loadProperties = (
  hass: HomeAssistant,
  id: string
): Promise<void> =>
  hass.callWS({
    type: "insteon/properties/load",
    device_id: id,
  });

export const writeALDB = (hass: HomeAssistant, id: string): Promise<void> =>
  hass.callWS({
    type: "insteon/aldb/write",
    device_id: id,
  });

export const writeProperties = (
  hass: HomeAssistant,
  id: string
): Promise<void> =>
  hass.callWS({
    type: "insteon/properties/write",
    device_id: id,
  });

export const resetALDB = (hass: HomeAssistant, id: string): Promise<void> =>
  hass.callWS({
    type: "insteon/aldb/reset",
    device_id: id,
  });

export const resetProperties = (
  hass: HomeAssistant,
  id: string
): Promise<void> =>
  hass.callWS({
    type: "insteon/properties/reset",
    device_id: id,
  });

export const addDefaultLinks = (
  hass: HomeAssistant,
  id: string
): Promise<void> =>
  hass.callWS({
    type: "insteon/aldb/add_default_links",
    device_id: id,
  });

export const NEW_ALDB_SCHEMA: HaFormSchema[] = [
  {
    name: "mode",
    options: [("C", "Controller"), ("R", "Responder")],
    required: true,
    type: "select",
  },
  {
    name: "group",
    required: true,
    type: "integer",
  },
  {
    name: "target",
    required: true,
    type: "string",
  },
  {
    name: "data1",
    required: true,
    type: "integer",
  },
  {
    name: "data2",
    required: true,
    type: "integer",
  },
  {
    name: "data3",
    required: true,
    type: "integer",
  },
];

export const CHANGE_ALDB_SCHEMA: HaFormSchema[] = [
  {
    name: "in_use",
    required: true,
    type: "boolean",
  },
  ...NEW_ALDB_SCHEMA,
];
