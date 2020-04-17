import { HomeAssistant } from "../types";
import { fetchFrontendUserData, saveFrontendUserData } from "./frontend";

export interface FrontendTranslationData {
  language: string;
}

declare global {
  interface FrontendUserData {
    language: FrontendTranslationData;
  }
}

export type TranslationCategory =
  | "title"
  | "state"
  | "config"
  | "options"
  | "device_automation";

export const fetchTranslationPreferences = (hass: HomeAssistant) =>
  fetchFrontendUserData(hass.connection, "language");

export const saveTranslationPreferences = (
  hass: HomeAssistant,
  data: FrontendTranslationData
) => saveFrontendUserData(hass.connection, "language", data);

export const getHassTranslations = async (
  hass: HomeAssistant,
  language: string,
  category: TranslationCategory,
  integration?: string,
  config_flow?: boolean
): Promise<{}> => {
  const result = await hass.callWS<{ resources: {} }>({
    type: "frontend/get_translations",
    language,
    category,
    integration,
    config_flow,
  });
  return result.resources;
};
