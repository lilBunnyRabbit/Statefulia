import { State, StorageValue } from "../src/State";
import { StateComponent } from "../src/StateComponent";
import { StateElement } from "../src/StateElement";

describe("StateComponent module", () => {
  test("can create StateComponent with no StateElement's", () => {
    const state = new State({});

    const stateComponent = new (class extends StateComponent {
      constructor() {
        super(state);
      }
    })();

    expect(stateComponent).toBeDefined();
    expect(stateComponent).toBeInstanceOf(StateComponent);
    expect(Object.keys(stateComponent.states).length).toBe(0);
  });

  test("can create StateComponent with all initialized StateElement's", () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
        },
      }
    );

    const stateComponent = new (class extends StateComponent {
      constructor() {
        super(state, true);
      }
    })();

    expect(Object.keys(stateComponent.states).length).toBe(1);

    const stateComponentStates = stateComponent.states;
    for (const key in state.elements) {
      expect(stateComponentStates.hasOwnProperty(key)).toBeTruthy();
    }
  });

  test("can access and edit StateElement's from StateComponent", async () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
        },
      }
    );

    const states = (await new Promise((resolve) => {
      new (class extends StateComponent {
        constructor() {
          super(state, ["test"]);
          resolve(this.states);
        }
      })();
    })) as Record<"test", StateElement>;

    expect(states.test.get()).toBe(123);
    states.test.set(456);
    expect(states.test.get()).toBe(456);
  });

  test("can reset StateElement's values to default value from StateComponent", async () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
        },
      }
    );

    const { states, $resetAll } = (await new Promise((resolve) => {
      new (class extends StateComponent {
        constructor() {
          super(state, ["test"]);
          resolve({ states: this.states, $resetAll: this.$resetAll.bind(this) });
        }
      })();
    })) as { states: Record<"test", StateElement>; $resetAll: StateComponent["$resetAll"] };

    expect(states.test.get()).toBe(123);
    states.test.set(456);
    expect(states.test.get()).toBe(456);
    $resetAll();
    expect(states.test.get()).toBe(123);
  });

  test("can listen to StateElement event from StateComponent", async () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
          config: {
            useEvents: true,
          },
        },
      }
    );

    const [key, value] = (await new Promise((resolve, reject) => {
      new (class extends StateComponent {
        constructor() {
          super(state, ["test"]);

          this.states.test.set(456);
        }

        $onStateChange(key: string, value: StorageValue) {
          try {
            resolve([key, value]);
          } catch (error) {
            reject(error);
          }
        }
      })();
    })) as [any, any];

    expect(key).toBe("test");
    expect(value).toBe(456);
  });

  test("can listen to all StateElement's from StateComponent with no StateElement's", async () => {
    const state = new State({ useChangeEvent: true });

    const opts = {
      defaultValue: 123,
      config: { useEvents: true },
    };

    const stateElement = state.init("test", opts);

    const [key, value] = (await new Promise((resolve, reject) => {
      new (class extends StateComponent {
        constructor() {
          super(state);
        }

        $onStateChange(key: string, value: StorageValue) {
          try {
            resolve([key, value]);
          } catch (error) {
            reject(error);
          }
        }
      })();

      stateElement.set(456);
    })) as [any, any];

    expect(key).toBe("test");
    expect(value).toBe(456);
  });

  test("can listen to all StateElement's from StateComponent with all StateElement's", async () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
          config: {
            useEvents: true,
          },
        },
      }
    );

    const [key, value] = (await new Promise((resolve, reject) => {
      new (class extends StateComponent {
        constructor() {
          super(state, true);

          this.states.test.set(456);
        }

        $onStateChange(key: string, value: StorageValue) {
          try {
            resolve([key, value]);
          } catch (error) {
            reject(error);
          }
        }
      })();
    })) as [any, any];

    expect(key).toBe("test");
    expect(value).toBe(456);
  });
});
