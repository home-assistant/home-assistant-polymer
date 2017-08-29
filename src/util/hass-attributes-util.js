window.hassAttributeUtil = window.hassAttributeUtil || {};

window.hassAttributeUtil.DOMAIN_DEVICE_CLASS = {
  binary_sensor: [
    'connectivity', 'light', 'moisture', 'motion', 'occupancy', 'opening',
    'sound', 'vibration', 'gas', 'power', 'safety', 'smoke', 'cold', 'heat',
    'moving'],
  cover: ['garage'],
};

window.hassAttributeUtil.UNKNOWN_TYPE = 'json';
window.hassAttributeUtil.ADD_TYPE = 'key-value';

window.hassAttributeUtil.TYPE_TO_TAG = {
  string: 'ha-customize-string',
  json: 'ha-customize-string',
  icon: 'ha-customize-icon',
  boolean: 'ha-customize-boolean',
  array: 'ha-customize-array',
  'key-value': 'ha-customize-key-value',
};

// Attributes here serve dual purpose:
// 1) Any key of this object won't be shown in more-info window.
// 2) Any key which has value other than undefined will appear in customization
//    config according to its value.
window.hassAttributeUtil.LOGIC_STATE_ATTRIBUTES =
  window.hassAttributeUtil.LOGIC_STATE_ATTRIBUTES || {
    entity_picture: undefined,
    friendly_name: { type: 'string', description: 'Name' },
    icon: { type: 'icon' },
    emulated_hue: { type: 'boolean' },
    emulated_hue_name: { type: 'string' },
    haaska_hidden: undefined,
    haaska_name: undefined,
    homebridge_hidden: { type: 'boolean' },
    homebridge_name: { type: 'string' },
    supported_features: undefined,
    attribution: undefined,
    custom_ui_state_card: { type: 'string' },
    device_class: {
      type: 'array',
      options: window.hassAttributeUtil.DOMAIN_DEVICE_CLASS,
      description: 'Device class',
      domains: ['binary_sensor', 'cover'] },
    hidden: { type: 'boolean', description: 'Hide from UI' },
    assumed_state: { type: 'boolean' },
    initial_state: { type: 'string' },
    unit_of_measurement: { type: 'string' },
  };
