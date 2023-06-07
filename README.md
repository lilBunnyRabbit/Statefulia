# Statefulia

[![npm version](https://img.shields.io/npm/v/@lilbunnyrabbit/statefulia.svg)](https://www.npmjs.com/package/@lilbunnyrabbit/statefulia)
[![npm downloads](https://img.shields.io/npm/dt/@lilbunnyrabbit/statefulia.svg)](https://www.npmjs.com/package/@lilbunnyrabbit/statefulia)

JavaScript/TypeScript library for state management.

## Installation

```sh
npm i @lilbunnyrabbit/statefulia
```

## Example
```js
const state = new State({
  useChangeEvent: true,
  useLogs: true,
});

// ...

const stateElement = state.init("clicks", {
  defaultValue: 0,
  config: {
    useLocalStorage: true,
    useEvents: true,
  },
});

// Increment "clicks" element in State.
document.getElementById("clicks-button").addEventListener("click", () => {
  stateElement.set(stateElement.get() + 1);
});

// ...

class App extends StateComponent {
  constructor() {
    super(state);
  }

  $onStateChange(key, value) {
    switch (key) {
      case "clicks":
        document.getElementById("clicks-display").innerText = `${value} clicks.`;
        break;
      default:
        break;
    }
  }
}
```

## TODO
* [ ] TypeScript generics
* [ ] Documentation

## License

MIT © Andraž Mesarič-Sirec

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/lilBunnyRabbit)