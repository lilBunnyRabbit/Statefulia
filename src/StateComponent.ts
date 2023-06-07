import { State, StorageValue } from "./State";
import { StateElement } from "./StateElement";

/**
 * Class representing StateComponent for selected StateElement's.
 * The purpose of this class is to be extended and override its "$onStateChange" method to listen to events.
 * @export
 * @class StateComponent
 */
export class StateComponent {
  /**
   * Object of attached StateElement's.
   * @type {Record<string, StateElement>}
   * @memberof StateComponent
   */
  readonly states: Record<string, StateElement> = {};

  /**
   * Creates an instance of StateComponent.
   * @param {State} state - State that the component belongs to.
   * @param {(string[] | boolean)} [elements]
   *   - If list of StateElement keys: those StateElement's will be attached.
   *     If "true": all initialized StateElement's will be attached.
   *     If "falsy": no StateElement will be attached but if a listenere is present it will listen to all initialized StateElement's.
   * @memberof StateComponent
   */
  constructor(private state: State, elements?: string[] | boolean) {
    const prototype = Object.getPrototypeOf(this);
    const overrides = {
      $onStateChange: prototype.hasOwnProperty("$onStateChange"),
    };

    let events = [];
    if (elements === true) {
      for (const element of this.state.elements.values()) {
        const key = element.key;
        events.push(key);
        this.states[key] = element;
        if (overrides.$onStateChange) {
          this.states[key].addListener((value) => this.$onStateChange(key, value));
        }
      }
    } else if (elements) {
      events = elements;
      elements.forEach((key) => {
        this.states[key] = this.state.attach(key);
        if (overrides.$onStateChange) {
          this.states[key].addListener((value) => this.$onStateChange(key, value));
        }
      });
    } else if (overrides.$onStateChange) {
      events.push("change");
      this.state.addEventListener("change", (event) => {
        if (event instanceof CustomEvent) return this.$onStateChange(event.detail.key, event.detail.value);
        throw new Error("Invalid event.");
      });
    }

    Object.freeze(this.states);

    if (this.state.config.useLogs) {
      console.log("StateComponent", {
        class: this.constructor.name,
        stateElements: Object.keys(this.states),
        overrides,
        events,
      });
    }
  }

  /**
   * Triggers when any of the attached StateElement's is changed.
   * If no StateElement is attached it will emit when any initialized StateElement is changed.
   * @param {string} key - Event key.
   * @param {StorageValue} value - Value for the event key.
   * @memberof StateComponent
   * @abstract
   */
  $onStateChange(key: string, value: StorageValue) {
    console.log(this.constructor.name, "$onStateChange", { key, value });
  }

  /**
   * Reset all attached StateElement's to their default value.
   * @memberof StateComponent
   */
  $resetAll() {
    Object.keys(this.states).forEach((key) => this.states[key].reset());
  }
}
