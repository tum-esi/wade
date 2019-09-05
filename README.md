# WADE
http://plugfest.thingweb.io:8083/TestThing

## TODOs and BUGS 
### LEGENDE:
(+) = IMPROVEMENT
(o) = NEW FEATURE
(x) = BUG
(-) = OTHER

### NEXT: 
When input selection is unselected reset input (dropdown)

TODO neue Version morgen: 
- Subscription!!!
    - Fix reset Interaction Selection
    - Invoke interaction -> timeout
    - if it has no port -> default port
    - Enum input
    - Test with coap 
    - Make option to select protocol (if more than one protocol is available)
    - Make a default config file for each td -> in an extra tab
    - Make a default config file for mqtt
    - Finish interface for mashups -> 
        - Ausklappen und auswählen der TDs 
        - Ausführen der TDs nacheinander 


- (-) Build: Build for other systems (linux & windows & mac)
             -> Test on other mac (do you need electron installed?)
             -> Test on windows (do you need electron installed)
- (o) Folders: Create user interface for folders
- (o) Mashups: Create user interface for mashups
- (o) Subscribing: Show updated subscription status
- (o) Subscribing: Unsubscribe to events
- (-) Testing: Test wade with WoT cart
- (+) Interaction Selection: Support all possible input types for write and actions in UI (also images and so on)
- (o) Editor: Add td from local machine
- (+) Refactor: Deleting / Adding / Merging sidebar elements: strict interface to add / remove in data and in GUI 


### IMPORTANT TODO
- (-) Bindings: Test COAP/COAPS bindings
- (o) Bindings: Add MQTT binding
- (o) Store: Persistant element saving
- (o) Store: Display stored td

### TODO 
- (o) User credentials
- (o) Tabbar in Element: Handle tabbing (set active tab etc) -> Router!
- (+) Editor: Real JSON editor (line and error indidaction)
- (x) Interaction Selection: Reset button does not always reset UI 
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