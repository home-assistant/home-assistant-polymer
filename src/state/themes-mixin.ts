import {
  applyThemesOnElement,
  invalidateThemeCache,
} from "../common/dom/apply_themes_on_element";
import { HASSDomEvent } from "../common/dom/fire_event";
import { subscribeThemes } from "../data/ws-themes";
import { Constructor, HomeAssistant } from "../types";
import { storeState } from "../util/ha-pref-storage";
import { HassBaseEl } from "./hass-base-mixin";

declare global {
  // for add event listener
  interface HTMLElementEventMap {
    settheme: HASSDomEvent<Partial<HomeAssistant["selectedTheme"]>>;
  }
  interface HASSDomEvents {
    settheme: Partial<HomeAssistant["selectedTheme"]>;
  }
}

const mql = matchMedia("(prefers-color-scheme: dark)");

export default <T extends Constructor<HassBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("settheme", (ev) => {
        this._updateHass({
          selectedTheme: { ...this.hass!.selectedTheme!, ...ev.detail },
        });
        this._applyTheme(mql.matches);
        storeState(this.hass!);
      });
      mql.addListener((ev) => this._applyTheme(ev.matches));
    }

    protected hassConnected() {
      super.hassConnected();

      subscribeThemes(this.hass!.connection, (themes) => {
        this._updateHass({ themes });
        invalidateThemeCache();
        this._applyTheme(mql.matches);
      });
    }

    private _applyTheme(darkPreferred: boolean) {
      if (!this.hass) {
        return;
      }
      const themeName =
        this.hass.selectedTheme?.theme ||
        (darkPreferred && this.hass.themes.default_dark_theme
          ? this.hass.themes.default_dark_theme!
          : this.hass.themes.default_theme);

      let options: Partial<HomeAssistant["selectedTheme"]> = this.hass!
        .selectedTheme;

      const selectedTheme = this.hass.themes.themes[
        this.hass.selectedTheme!.theme
      ];

      let darkMode =
        options?.darkMode === undefined ? darkPreferred : options?.darkMode;

      // Override dark mode selection depending on what the theme actually provides.
      // Leave the selection as-is if the theme can provide the requested style.
      if (darkMode && !selectedTheme.dark_styles) darkMode = false;
      else if (!darkMode && !selectedTheme.styles && selectedTheme.dark_styles)
        darkMode = true;

      options = {
        ...this.hass.selectedTheme!,
        darkMode,
      };

      applyThemesOnElement(
        document.documentElement,
        this.hass.themes,
        themeName,
        options
      );

      darkMode =
        !!options?.darkMode ||
        !!(darkPreferred && this.hass.themes.default_dark_theme);

      if (darkMode !== this.hass.selectedTheme!.darkMode) {
        this._updateHass({
          selectedTheme: { ...this.hass.selectedTheme!, darkMode },
        });

        const schemeMeta = document.querySelector("meta[name=color-scheme]");
        if (schemeMeta) {
          schemeMeta.setAttribute(
            "content",
            darkMode ? "dark" : themeName === "default" ? "light" : "dark light"
          );
        }
      }

      const themeMeta = document.querySelector("meta[name=theme-color]");
      const computedStyles = getComputedStyle(document.documentElement);
      const headerColor = computedStyles.getPropertyValue(
        "--app-header-background-color"
      );

      document.documentElement.style.backgroundColor = computedStyles.getPropertyValue(
        "--primary-background-color"
      );

      if (themeMeta) {
        if (!themeMeta.hasAttribute("default-content")) {
          themeMeta.setAttribute(
            "default-content",
            themeMeta.getAttribute("content")!
          );
        }
        const themeColor =
          headerColor?.trim() ||
          (themeMeta.getAttribute("default-content") as string);
        themeMeta.setAttribute("content", themeColor);
      }
    }
  };
