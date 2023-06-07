import { State } from "../src/State";
import { StateElement } from "../src/StateElement";

describe("StateElement module", () => {
  test("can initialize StateElement", () => {
    const state = new State({});

    const opts = {
      defaultValue: 123,
      config: {
        useLocalStorage: true,
        useEvents: true,
        onBeforeSet: null,
      },
    };

    const stateElement = state.init("test", opts);
    expect(stateElement).toBeDefined();
    expect(stateElement).toBeInstanceOf(StateElement);

    expect(stateElement.state).toBeDefined();
    expect(stateElement.state).toBeInstanceOf(State);

    expect(stateElement.key).toBe("test");
    expect(stateElement.defaultValue).toBe(123);
    expect(stateElement.type).toBe("number");

    const stateElementConfig = stateElement.config;
    for (const key in opts.config) {
      expect(opts.config[key as keyof typeof opts.config]).toBe(
        stateElementConfig[key as keyof typeof stateElementConfig]
      );
    }

    expect(state.elements.has("test")).toBeTruthy();
  });

  test("can attach to State", () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
        },
      }
    );

    const stateElement = state.attach("test");
    expect(stateElement).toBeDefined();
    expect(stateElement).toBeInstanceOf(StateElement);
  });

  test("can edit StateElement value", () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
        },
      }
    );

    const stateElement = state.attach("test");
    stateElement.set(456);
    expect(stateElement.get()).toBe(456);
  });

  test("can reset StateElement value to it's default value", () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
        },
      }
    );

    const stateElement = state.attach("test");
    stateElement.set(456);
    expect(stateElement.get()).toBe(456);

    stateElement.reset();
    expect(stateElement.get()).toBe(123);
  });

  test("can listen to StateElement value change", async () => {
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

    const value = await new Promise((resolve, reject) => {
      const stateElement = state.attach("test").addListener((value) => {
        try {
          resolve(value);
        } catch (error) {
          reject(error);
        }
      });

      stateElement.set(456);
    });

    expect(value).toBe(456);
  });
});
