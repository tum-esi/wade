# WADE
http://plugfest.thingweb.io:8083/TestThing

## TODOs and BUGS 
### LEGENDE:
(+) = IMPROVEMENT
(o) = NEW FEATURE
(x) = BUG
(-) = OTHER

### NEXT: 
- (o) Folders: Create user interface for folders
- (o) Mashups: Create user interface for mashups
- (o) Editor: Add td from local machine

### IMPORTANT TODO
- (-) Bindings: Test COAP/COAPS bindings
- (-) Bindings: Test Websocket bindings
- (o) Bindings: Add MQTT binding
- (+) Interaction Selection: Support all possible input types for write and actions in UI 
- (o) Store: Persistant element saving
- (o) Store: Display stored td
- (o) Subscribing: Show updated subscription status
- (o) Subscribing: Unsubscribe to events

### TODO 
- (o) Tabbar in Element: Handle tabbing (set active tab etc) -> Router!
- (+) Editor: Real JSON editor (line and error indidaction)
- (x) Interaction Selection: Reset button does not always reset UI 
- (+) Interaction Results: Array and Object type support 
- (o) Interactions: Reihenfolge & Drag n Drop von Interactions
- (o) Sidebar: Drag and Drop of elements to change order 
- (o) Sidebar: Drag and Drop to add a td/ mashup to a folder/ mashup

### LOW PRIO TODO
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
```

### Architecture:
    docs/ARCHITECTURE.md

### CSS Styles:
    docs/STYLEGUIDE.md

### Credit and sources: 
    docs/SOURCES.md