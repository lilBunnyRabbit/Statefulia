import { State, StorageValue, StorageValueType } from "./State";

/**
 * StateElement configuration.
 * @export
 * @interface StateElementConfig
 */
export interface StateElementConfig {
  /**
   * Enable/disable using local storage for storing and retrieving data.
   * @type {boolean}
   * @memberof StateElementConfig
   */
  useLocalStorage?: boolean;
  /**
   * Enable/disable "change" event for the element.
   * @type {boolean}
   * @memberof StateElementConfig
   */
  useEvents?: boolean;
  /**
   * Callback before the value is set.
   * @type {function(StorageValue): StorageValue}
   * @memberof StateElementConfig
   */
  onBeforeSet?: ((value: StorageValue) => StorageValue) | null;
  /**
   * Refetch from local storage on window focus if `useLocalStorage` is set.
   * @type {boolean}
   * @memberof StateElementConfig
   */
  useRefetchOnFocus?: boolean;
}

/**
 * StateElement options for creation.
 * @export
 * @interface StateElementOptions
 */
export interface StateElementOptions {
  /**
   * Default value used when reseting and when no value is stored in local storage.
   * @type {StorageValue}
   * @memberof StateElementOptions
   */
  defaultValue: StorageValue;
  /**
   * StateElement configuration.
   * @type {StateElementConfig}
   * @memberof StateElementOptions
   */
  config?: StateElementConfig;
}

/**
 * Class representing state for unique key.
 * The purpose of this class is to control a specific State element.
 * @export
 * @class StateElement
 */
export class StateElement {
  /**
   * StateElement's default value.
   * @private
   * @type {StorageValue}
   * @memberof StateElement
   */
  private _defaultValue!: StorageValue;

  /**
   * StateElement's default value type.
   * @private
   * @type {StorageValueType}
   * @memberof StateElement
   */
  private _type!: StorageValueType;

  /**
   * StateElement's configuration.
   * @private
   * @type {StateElementConfig}
   * @memberof StateElement
   */
  private _config: StateElementConfig = {
    useLocalStorage: false,
    useEvents: false,
    onBeforeSet: null,
    useRefetchOnFocus: true,
  };

  /**
   * Creates an instance of StateElement.
   * @param {State} state - State that the StateElement belongs to.
   * @param {string} key - Selected key.
   * @param {StateElementOptions} opts - StateElement options.
   * @memberof StateElement
   */
  constructor(readonly state: State, readonly key: string, opts: StateElementOptions) {
    this._defaultValue = opts.defaultValue;
    this._type = typeof opts.defaultValue as StorageValueType;

    if (opts.config) {
      this._config = { ...this._config, ...opts.config };
    }

    if (this.state.config.useLogs) {
      console.log("StateElement", {
        key: this.key,
        defaultValue: this._defaultValue,
        type: this._type,
        config: this._config,
      });
    }
  }

  /**
   * StateElement's default value.
   * @readonly
   * @memberof StateElement
   */
  get defaultValue() {
    return this._defaultValue;
  }

  /**
   * StateElement's default value type.
   * @readonly
   * @memberof StateElement
   */
  get type() {
    return this._type;
  }

  /**
   * StateElement's configuration.
   * @readonly
   * @memberof StateElement
   */
  get config() {
    return this._config;
  }

  /**
   * Get value for defined key from state.
   * @return State value.
   * @memberof StateElement
   */
  public get() {
    return this.state.get(this.key);
  }

  /**
   * Set value for defined key to state.
   * @param {StorageValue} value - Value to be stored.
   * @memberof StateElement
   */
  public set(value: StorageValue) {
    if (typeof value !== this._type) {
      throw new Error(`Expected value type "${this._type}" but got "${typeof value}"`);
    }

    if (this._config.onBeforeSet) {
      value = this._config.onBeforeSet(value);
    }

    this.state.set(this.key, value, this._config);
  }

  /**
   * Reset value to default value.
   * @memberof StateElement
   */
  public reset() {
    this.set(this._defaultValue);
  }

  /**
   * Assign event listener for this StateElement.
   * @param {(value: StorageValue) => void} listener
   * @return Current StateElement.
   * @memberof StateElement
   */
  public addListener(listener: (value: StorageValue) => void) {
    this.state.addEventListener(this.key, (event) => {
      if (event instanceof CustomEvent) return listener(event.detail);
      throw new Error("Invalid event.");
    });
    return this;
  }
}
