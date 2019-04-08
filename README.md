# vscode-external

[![Greenkeeper badge](https://badges.greenkeeper.io/axetroy/vscode-external.svg)](https://greenkeeper.io/)

An extension to Run External Tools.

## Feature

- [x] Add External Tools
- [x] Remove External Tools
- [x] Run External Tools

## [CHANGELOG](https://github.com/axetroy/vscode-external/blob/master/CHANGELOG.md)

## Useful external tools

```json
    "external.commands": [
      {
        "name": "Prettify",
        "command": "prettier --write $FilePath$"
      },
      {
        "name": "Format",
        "command": "prettier --write './**/*.{js,css,json,md}'"
      },
      {
        "name": "Changelog",
        "command": "conventional-changelog -p angular -i CHANGELOG.md -s -r 0"
      }
    ],
```

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

| [<img src="https://avatars1.githubusercontent.com/u/9758711?v=3" width="100px;"/><br /><sub>Axetroy</sub>](http://axetroy.github.io)<br />[💻](https://github.com/axetroy/vscode-external/commits?author=axetroy) 🔌 [⚠️](https://github.com/axetroy/vscode-external/commits?author=axetroy) [🐛](https://github.com/axetroy/vscode-external/issues?q=author%3Aaxetroy) 🎨 |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |


<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

The [MIT License](https://github.com/axetroy/vscode-external/blob/master/LICENSE)
