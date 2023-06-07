import { StateElement, StateElementConfig, StateElementOptions } from "./StateElement";

/**
 * State configuration.
 * @export
 * @interface StateConfig
 */
export interface StateConfig {
  /**
   * Dispatch "change" event when any element is updated.
   * @type {boolean}
   * @memberof StateConfig
   */
  useChangeEvent?: boolean;
  /**
   * Enable/disable logging.
   * @type {boolean}
   * @memberof StateConfig
   */
  useLogs?: boolean;
  /**
   * Local storage prefix.
   * @type {string}
   * @memberof StateConfig
   */
  prefix?: string;
  /**
   * Refetch from local storage on window focus if `useLocalStorage` and `useRefetchOnFocus` is set for StateElement.
   * @type {boolean}
   * @memberof StateConfig
   */
  useRefetchOnFocus?: boolean;
}

/**
 * Type of stored values.
 */
export type StorageValue = bigint | boolean | symbol | number | object | string;

/**
 * String type of StorageValue.
 */
export type StorageValueType = "bigint" | "boolean" | "symbol" | "number" | "object" | "string";

/**
 * Class representing main control unit for state management.
 * @export
 * @class State
 * @extends {EventTarget}
 */
export class State extends EventTarget {
  /**
   * State storage.
   * @private
   * @memberof State
   */
  private _storage = new Map<string, StorageValue>();

  /**
   * Initialized StateElement's.
   * @private
   * @memberof State
   */
  private _elements = new Map<string, StateElement>();

  /**
   * State configuration.
   * @private
   * @type {StateConfig}
   * @memberof State
   */
  private _config: StateConfig = {
    useChangeEvent: false,
    useLogs: false,
    prefix: "",
    useRefetchOnFocus: true,
  };

  /**
   * Creates an instance of State.
   * @param {(StateConfig | undefined)} config - State configuration.
   * @param {(Record<string, StateElementOptions> | undefined)} [initElements] - "List" of StateElement's to initialize.
   * @memberof State
   */
  constructor(config: StateConfig | undefined, initElements?: Record<string, StateElementOptions>) {
    super();

    if (config) {
      this._config = { ...this._config, ...config };
    }

    if (this._config.useLogs) {
      console.log("State", { config: this._config });
    }

    if (initElements) {
      Object.keys(initElements).forEach((key) => {
        const initElement = initElements[key];
        this.init(key, initElement);
      });
    }

    if (this._config.useRefetchOnFocus) {
      window.addEventListener("focus", () => {
        this._elements.forEach((element, key) => {
          if (element.config.useLocalStorage && element.config.useRefetchOnFocus) {
            const localValue = localStorage.getItem(this.prefixKey(key));
            if (localValue !== null) {
              try {
                element.set(this.valueFromString(localValue, element.type));
              } catch (error) {
                console.error(error);
              }
            }
          }
        });
      });
    }
  }

  /**
   * State storage.
   * @readonly
   * @memberof State
   */
  get storage() {
    return this._storage;
  }

  /**
   * Initialized StateElement's.
   * @readonly
   * @memberof State
   */
  get elements() {
    return this._elements;
  }

  /**
   * State configuration.
   * @readonly
   * @memberof State
   */
  get config() {
    return this._config;
  }

  /**
   * Prefix key with defined prefix.
   * @private
   * @param {string} key
   * @return Prefixed key
   * @memberof State
   */
  private prefixKey(key: string) {
    if (!this._config.prefix) return key;
    return `${this._config.prefix}-${key}`;
  }

  /**
   * Set value for selected key.
   * @param {string} key - Selected key.
   * @param {StorageValue} value - Value to be stored.
   * @param {StateElementConfig} config - StateElement configuration.
   * @memberof State
   */
  public set(key: string, value: StorageValue, config: StateElementConfig) {
    this._storage.set(key, value);

    if (config.useLocalStorage) {
      localStorage.setItem(this.prefixKey(key), this.valueToString(value));
    }

    if (config.useEvents) {
      this.dispatchEvent(new CustomEvent(key, { detail: value }));

      if (this._config.useChangeEvent) {
        this.dispatchEvent(new CustomEvent("change", { detail: { key, value } }));
      }
    }
  }

  /**
   * Get stored value for selected key.
   * @param {string} key
   * @return Stored value
   * @memberof State
   */
  public get(key: string) {
    return this._storage.get(key);
  }

  /**
   * Convert value to string.
   * @private
   * @param {StorageValue} value
   * @return String value.
   * @memberof State
   */
  private valueToString(value: StorageValue) {
    switch (typeof value) {
      case "bigint":
      case "boolean":
      case "symbol":
      case "number":
        return value.toString();
      case "object":
        return JSON.stringify(value);
      case "string":
        return value;
      case "undefined":
      case "function":
      default:
        throw new Error(`Value type "${typeof value}" is not supported`);
    }
  }

  /**
   * Convert string to value.
   * @private
   * @param {string} value - String value.
   * @param {StorageValueType} type - Value type.
   * @return Converted value.
   * @memberof State
   */
  private valueFromString(value: string, type: StorageValueType) {
    switch (type) {
      case "bigint":
        return Number(value);
      case "boolean":
        return Boolean(value);
      case "symbol":
        return Symbol(value);
      case "number":
        return Number.parseFloat(value);
      case "object":
        return JSON.parse(value);
      case "string":
        return value;
      default:
        throw new Error(`Value type "${typeof value}" is not supported`);
    }
  }

  /**
   * Initialize new StateElement.
   * @param {string} key - Unique key.
   * @param {StateElementOptions} opts - StateElement options.
   * @return Initialized StateElement.
   * @memberof State
   */
  public init(key: string, opts: StateElementOptions) {
    if (this._elements.get(key)) {
      throw new Error("Element already initialized");
    }

    const type = typeof opts.defaultValue;
    if (type === "function" || type === "undefined") {
      throw new Error(`Value type "${type}" is not supported`);
    }

    let value = opts.defaultValue;
    if (opts.config?.useLocalStorage) {
      const localValue = localStorage.getItem(this.prefixKey(key));
      if (localValue !== null) {
        value = this.valueFromString(localValue, type);
      }
    }

    this.set(key, value, { ...opts.config, useEvents: false });

    const element = new StateElement(this, key, opts);
    this._elements.set(key, element);

    return element;
  }

  /**
   * Attach to initialized StateElement.
   * @param {string} key - Selected key.
   * @return Initialized StateElement.
   * @memberof State
   */
  public attach(key: string) {
    const element = this._elements.get(key);
    if (!element) {
      throw new Error("Element not initialized");
    }

    return element;
  }
}
