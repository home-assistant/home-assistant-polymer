import { HaCodeEditor } from "./ha-code-editor";
import "codemirror/mode/yaml/yaml";
import { customElement } from "lit-element";

@customElement("ha-yaml-editor")
export class HaYamlEditor extends HaCodeEditor {
  public constructor() {
    super("yaml");
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-yaml-editor": HaYamlEditor;
  }
}
