import {
  LitElement,
  customElement,
  TemplateResult,
  html,
  property,
  CSSResult,
  css,
} from "lit-element";
import "@material/mwc-button";
import "@polymer/paper-input/paper-input";
import { MessageBase } from "home-assistant-js-websocket";
import { HomeAssistant } from "../../../types";
import { PolymerChangedEvent } from "../../../polymer-types";
import "../../../components/ha-card";

@customElement("mqtt-subscribe-card")
class MqttSubscribeCard extends LitElement {
  @property() public hass?: HomeAssistant;

  @property() private _topic = "";

  @property() private _subscribed?: () => void;

  @property() private _messages: Array<{
    id: number;
    message: MessageBase;
  }> = [];

  private _messageCount = 0;

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (this._subscribed) {
      this._subscribed();
      this._subscribed = undefined;
    }
  }

  protected render(): TemplateResult {
    return html`
      <ha-card header="Listen to a topic">
        <form>
          <paper-input
            .label=${this._subscribed
              ? "Listening to"
              : "Topic to subscribe to"}
            .disabled=${this._subscribed !== undefined}
            .value=${this._topic}
            @value-changed=${this._valueChanged}
          ></paper-input>
          <mwc-button
            .disabled=${this._topic === ""}
            @click=${this._handleSubmit}
            type="submit"
          >
            ${this._subscribed ? "Stop listening" : "Start listening"}
          </mwc-button>
        </form>
        <div class="events">
          ${this._messages.map(
            (msg) => html`
              <div class="event">
                Message ${msg.id} received:
                <pre>${JSON.stringify(msg.message, null, 4)}</pre>
              </div>
            `
          )}
        </div>
      </ha-card>
    `;
  }

  private _valueChanged(ev: PolymerChangedEvent<string>): void {
    this._topic = ev.detail.value;
  }

  private async _handleSubmit(): Promise<void> {
    if (this._subscribed) {
      this._subscribed();
      this._subscribed = undefined;
    } else {
      this._subscribed = await this.hass!.connection.subscribeMessage<
        MessageBase
      >((message) => this._handleMessage(message), {
        type: "mqtt/subscribe",
        topic: this._topic,
      });
    }
  }

  private _handleMessage(message: MessageBase) {
    console.log(message);
    const tail =
      this._messages.length > 30 ? this._messages.slice(0, 29) : this._messages;
    this._messages = [
      {
        message,
        id: this._messageCount++,
      },
      ...tail,
    ];
  }

  static get styles(): CSSResult {
    return css`
      form {
        display: block;
        padding: 16px;
      }
      paper-input {
        display: inline-block;
        width: 200px;
      }
      .events {
        margin: -16px 0;
        padding: 0 16px;
      }
      .event {
        border-bottom: 1px solid var(--divider-color);
        padding-bottom: 16px;
        margin: 16px 0;
      }
      .event:last-child {
        border-bottom: 0;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mqtt-subscribe-card": MqttSubscribeCard;
  }
}
