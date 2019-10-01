import {
  LitElement,
  TemplateResult,
  html,
  property,
  customElement,
  css,
  CSSResult,
} from "lit-element";
import { classMap } from "lit-html/directives/class-map";

import { HomeAssistant } from "../../../../types";
import memoizeOne from "memoize-one";

import { compare } from "../../../../common/string/compare";
import "../../../../components/entity/state-badge";

import "@polymer/paper-item/paper-icon-item";
import "@polymer/paper-item/paper-item-body";

import "../../../../components/ha-card";
import "../../../../components/ha-icon";
import { computeStateName } from "../../../../common/entity/compute_state_name";
import {
  EntityRegistryEntry,
  updateEntityRegistryEntry,
  removeEntityRegistryEntry,
} from "../../../../data/entity_registry";
import { showEntityRegistryDetailDialog } from "../../entity_registry/show-dialog-entity-registry-detail";
import { fireEvent } from "../../../../common/dom/fire_event";
import { computeDomain } from "../../../../common/entity/compute_domain";
import { domainIcon } from "../../../../common/entity/domain_icon";

@customElement("ha-device-entities-card")
export class HaDeviceEntitiesCard extends LitElement {
  @property() public hass!: HomeAssistant;
  @property() public deviceId!: string;
  @property() public entities!: EntityRegistryEntry[];
  @property() public narrow!: boolean;

  private _entities = memoizeOne(
    (
      deviceId: string,
      entities: EntityRegistryEntry[]
    ): EntityRegistryEntry[] =>
      entities
        .filter((entity) => entity.device_id === deviceId)
        .sort((ent1, ent2) =>
          compare(
            this._computeEntityName(ent1) || `zzz${ent1.entity_id}`,
            this._computeEntityName(ent2) || `zzz${ent2.entity_id}`
          )
        )
  );

  protected render(): TemplateResult {
    const entities = this._entities(this.deviceId, this.entities);
    return html`
      <ha-card>
        ${entities.length
          ? entities.map((entry: EntityRegistryEntry) => {
              const stateObj = this.hass.states[entry.entity_id];
              return html`
                <paper-icon-item
                  .entry=${entry}
                  class=${classMap({ "disabled-entry": !!entry.disabled_by })}
                >
                  ${stateObj
                    ? html`
                        <state-badge
                          .stateObj=${stateObj}
                          slot="item-icon"
                        ></state-badge>
                      `
                    : html`
                        <ha-icon
                          slot="item-icon"
                          .icon=${domainIcon(computeDomain(entry.entity_id))}
                        ></ha-icon>
                      `}
                  <paper-item-body two-line>
                    <div class="name">${this._computeEntityName(entry)}</div>
                    <div class="secondary entity-id">${entry.entity_id}</div>
                  </paper-item-body>
                  <div class="buttons">
                    ${stateObj
                      ? html`
                          <paper-icon-button
                            @click=${this._openMoreInfo}
                            icon="hass:open-in-new"
                          ></paper-icon-button>
                        `
                      : ""}
                    <paper-icon-button
                      @click=${this._openEditEntry}
                      icon="hass:settings"
                    ></paper-icon-button>
                  </div>
                </paper-icon-item>
              `;
            })
          : html`
              <div class="config-entry-row">
                <paper-item-body two-line>
                  <div>
                    ${this.hass.localize(
                      "ui.panel.config.devices.entities.none"
                    )}
                  </div>
                </paper-item-body>
              </div>
            `}
      </ha-card>
    `;
  }

  private _openEditEntry(ev: MouseEvent): void {
    const entry = (ev.currentTarget! as any).closest("paper-icon-item").entry;
    showEntityRegistryDetailDialog(this, {
      entry,
      updateEntry: async (updates) => {
        await updateEntityRegistryEntry(this.hass!, entry.entity_id, updates);
      },
      removeEntry: async () => {
        if (
          !confirm(`Are you sure you want to delete this entry?

Deleting an entry will not remove the entity from Home Assistant. To do this, you will need to remove the integration "${
            entry.platform
          }" from Home Assistant.`)
        ) {
          return false;
        }

        try {
          await removeEntityRegistryEntry(this.hass!, entry.entity_id);
          return true;
        } catch (err) {
          return false;
        }
      },
    });
  }

  private _openMoreInfo(ev: MouseEvent) {
    const entry = (ev.currentTarget! as any).closest("paper-icon-item").entry;
    fireEvent(this, "hass-more-info", { entityId: entry.entity_id });
  }

  private _computeEntityName(entity) {
    if (entity.name) {
      return entity.name;
    }
    const state = this.hass.states[entity.entity_id];
    return state ? computeStateName(state) : null;
  }

  static get styles(): CSSResult {
    return css`
      ha-icon {
        width: 40px;
      }
      .entity-id {
        color: var(--secondary-text-color);
      }
      .buttons {
        text-align: right;
        margin: 0 0 0 8px;
      }
      .disabled-entry {
        color: var(--secondary-text-color);
      }
    `;
  }
}
