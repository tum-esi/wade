# WADE
http://plugfest.thingweb.io:8083/TestThing

## TODOs and BUGS 
### LEGENDE:
(+) = IMPROVEMENT
(o) = NEW FEATURE
(x) = BUG
(-) = OTHER


What happens if the prop title is super long? -> in UI? 

change default config: 

```json
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

### NEXT: 
    - Invoke interaction -> timeout
    - Make option to select protocol (if more than one protocol is available)

    - Finish interface for mashups -> 
        - Ausklappen und auswählen der TDs 
        - Ausführen der TDs nacheinander 

- (o) Folders: Create user interface for folders
- (o) Editor: Add td from local machine
- (+) Refactor: Deleting / Adding / Merging sidebar elements: strict interface to add / remove in data and in GUI 


### IMPORTANT TODO

### TODO 
- (o) User credentials
- (o) Tabbar in Element: Handle tabbing (set active tab etc) -> Router!
- (+) Editor: Real JSON editor (line and error indidaction)
- (x) Interaction Results: Array and Object type support 
- (o) Interactions: Reihenfolge & Drag n Drop von Interactions
- (o) Sidebar: Drag and Drop of elements to change order 
- (o) Sidebar: Drag and Drop to add a td/ mashup to a folder/ mashup

### LOW PRIO TODO
- (+) Limit
- (+) Results UI: Make id smaller (write -> w, read -> r ...) and response bigger -> display as obj
- (o) Output/Input Results: Validating interaction response data schema: Error Message (A WoT Thing Description MUST accurately describe the data returned and accepted by each interaction)
- (x) Mashup: Should only have td as childern (not folders or other mashups) 
- (+) Sidebar: Delete element -> confirm deletion
- (o) Sidebar: Implement filter functionality
- (+) Results: Improve error handling (right now just the full response is shown)
- (+) Uri Bar: Fetch error handling when connection timed out
- (o) Throbber: Indicate loading in fetch url, results, ...
- (o) Statusbar: History functionality
- (+) Interaction Selection: Input Button -> only click on outer div 
- (+) Statusbar: Add zeros to current time in statusbar to prevent different length of statusbar-time
- (x) Design: WoT-Logo is a button right now -> NO!
- (o) Td Names: Basic validation for naming of Td (default node regex)
- (-) Bindings: Test Websocket bindings
- (+) Dropdown: Hide all open dropdowns if anything else was clicked
- (o) Duplicate Tds: There should be duplicate tds for mashup. (To share Tds among several mashup)
- (+) Electron Interface: 
        Hide developer console on start. 
        Do not allow resizing of window (to a very small window).
        Remove gap to window (Make "full screen")
- (+) Scrollbar: Restyle
- (o) Selection: Show error if input is not in correct format
- (+) Errors: Show connection errors in statusbar

## Known Problems
- (x) Install node-aead-crypto to avoid failing dev build and build,
   because coap-binding seems to need it might be necessary (it isn't installed
   with current node version because it shouldn't be needed anymore)
   (found on windows):  
  ```
  npm install -f node-aead-crypto
  ```  
  After installing node-aead-crypto you should delete the dependency from your package.json, so it isn't added to the wade package on the next commit. Also installing a previous "node" version could solve the problem (but
  comes with other disadvantages)
- (x) correct the name conflict with "interfaces" in the coap module [./node_modules/coap/lib/server.js](./node_modules/coap/lib/server.js) line 230 and line 231(two words) to avoid an error for "Unexpected token: name (interface):  
change "interface" to "_interface" or any other valid expression in both lines. (found on windows). Should be resolved as soon as the wot coap-binding uses version 0.22.0 of the coap module.

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