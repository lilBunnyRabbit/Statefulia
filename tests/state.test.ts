import { State } from "../src/State";

describe("State module", () => {
  test("can create State", () => {
    const state = new State({});
    expect(state).toBeDefined();
    expect(state).toBeInstanceOf(State);
  });

  test("can create State with configuration", () => {
    const config = {
      useChangeEvent: true,
      useLogs: false,
    };

    const state = new State(config);
    const stateConfig = state.config;

    for (const key in config) {
      expect(config[key as keyof typeof config]).toBe(stateConfig[key as keyof typeof stateConfig]);
    }
  });

  test("can create State with initial elements", () => {
    const state = new State(
      {},
      {
        test: {
          defaultValue: 123,
        },
      }
    );

    expect(state.elements.has("test")).toBeTruthy();
  });
});
