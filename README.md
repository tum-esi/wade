# WADE
http://plugfest.thingweb.io:8083/TestThing

## TODOs and BUGS 

TODO: 
- Add UI for performance 
- Measure performance 
- Think about how to annotate a TD (what metrics)
- Generate an annotated TD
- Implement Mashups

### LEGENDE:
(+) = IMPROVEMENT
(o) = NEW FEATURE
(x) = BUG
(-) = OTHER


What happens if the prop title is super long? -> in UI? 

change default config: 

```json
{
  "http": {
    "port": 8080,
    "allowSelfSigned": true
  },
  "coap": {
    "_port": 5683
  },
  "mqtt": {
    "broker": "mqtt://test.mosquitto.org",
    "_username": "username",
    "_password": "password",
    "_clientId": "uniqueId",
    "port": 1883
  },
  "credentials": {
    "urn:dev:wot:org:eclipse:leshan": {
      "identity": "node-wot",
      "psk": "hello"
    },
    "urn:dev:wot:org:eclipse:cf-secure": {
      "identity": "password",
      "psk": "sesame"
    }
  }
}
```

Add description for config


## Known Problems
- [Install node-aead-crypto to avoid failing dev build and build](https://gitlab.lrz.de/tum-ei-esi/wade/issues/22),
   because coap-binding seems to need it might be necessary (it isn't installed
   with current node version because it shouldn't be needed anymore):  
  ```
  npm install -f node-aead-crypto
  ```  
  After installing node-aead-crypto you should delete the dependency from your package.json, so it isn't added to the wade package on the next commit. Also installing a previous "node" version could solve the problem (but
  comes with other disadvantages).
- [Correct the name conflict with "interfaces"](https://gitlab.lrz.de/tum-ei-esi/wade/issues/23) in the coap module [./node_modules/coap/lib/server.js](./node_modules/coap/lib/server.js) line 230 and line 231(two words) to avoid an error for 
  ```
  Unexpected token: name (interface): 
  ``` 
  change "interface" to "_interface" or any other valid expression in both lines. (found on windows). Should be resolved as soon as the wot coap-binding uses version 0.22.0 of the coap module.
- The *Virtual Thing* packet needs to be installed locally (not just a symlink in ./node_modules/) in order to work in the production build, and it has to be installed manually anyway if you want to make **Virtual Thing** work in WADE. The reason therefore is, that automatic installation of virtual thing fails under windows and so would
the installation of WADE if Virtual Thing was added to the packet.
- Vuex version 3.1.2 leads to build problems -> [Issue 55](https://gitlab.lrz.de/tum-ei-esi/wade/issues/55)

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Run in electron in dev mode: 
```
npm run electron:serve
```

### Build electron app: 
```
npm run electron:build
npm run electron:build --linux
```

### Architecture:
    docs/ARCHITECTURE.md

### CSS Styles:
    docs/STYLEGUIDE.md

### Credit and sources: 
    docs/SOURCES.md