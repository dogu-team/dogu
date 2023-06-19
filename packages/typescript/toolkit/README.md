# @dogu-tech/toolkit

Gamium controller is a game automation library. Used for testing game-applications, Gamium aims to imitate the behavior of game users.

## Installation

Gamium can be installed via npm:

```bash
npm install gamium-client
```

## Usage

```typescript
const elem = (
  await game.wait(
    until.objectLocated(
      By.path('/Canvas[1]/MainMenu[1]/Window[1]/Settings[1]'),
    ),
  )
).asUIElement();
await game.wait(until.elementInteractable(elem));
await elem.click();
```

## Documentation

Please refer to [dogu](https://docs.dogutech.io/)

## Node Support Policy

nodejs 16.16.0 or higher.

## License

[MIT](LICENSE)
