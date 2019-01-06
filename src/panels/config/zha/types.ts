import { HassEntity } from "home-assistant-js-websocket";

export interface PickerTarget extends EventTarget {
  selected: number;
}

export interface ItemSelectedEvent {
  target?: PickerTarget;
}

export interface Cluster {
  name: string;
  id: number;
  type: string;
}

export interface Attribute {
  name: string;
  id: number;
}

export interface SetAttributeServiceData {
  entity_id: string;
  cluster_id: number;
  cluster_type: string;
  attribute: number;
  value: any;
  manufacturer: number;
}
