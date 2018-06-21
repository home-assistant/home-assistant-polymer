import { CARD_TYPES } from './const.js';

const CUSTOM_TYPE_PREFIX = 'custom:';

export default function computeCardElement(type) {
  if (CARD_TYPES.includes(type)) {
    return `hui-${type}-card`;
  } else if (type.startsWith(CUSTOM_TYPE_PREFIX)) {
    return type.substr(CUSTOM_TYPE_PREFIX.length);
  }
  return null;
}