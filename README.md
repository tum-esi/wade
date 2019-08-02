# w-ade TODO
http://plugfest.thingweb.io:8083/TestThing

1) Interactions: Reihenfolge & Drag n Drop von Interactions
2) Editor: JSON View Editor for TD 
4) Sidebar: Put folders together / Folder / Element structure
5) Store: Storage of multiple TDs / Mashups/ Folders with unique ID
6) Bindings: Add Coap, MQTT and other
7) Subscribing: Show updated subscription status
8) WoT-Logo is a button right now -> NO!
9) Router: Redirect if td does not exist

IMPORTANT TODO
- Add other bindings
- Editor JSON view
- Persistant saving element && display stored td / refactor store for persistant storage -> Persistent storage of elements and ids (electron)

-  event subscription updates

TODO 
- Array and Object type support -> Buggy
- Support all possible input types for write and actions in UI 
- Redo smart TD-Editor -> try again with other json plugin? -> readd old tdEditor? 
- Unsubscribe to events
- Loading indication when invoking actions
- Implement filter functionality
- Upload from machine

SMALL & LOW PRIO TODOS 
- Statusbar History functionality
- Filter sidebar
- Refactor sidebar selection with store
- Handle unsubscribe
- Input Button -> only click on outer div 
- Drag and Drop for ordering of interactions
- Fix styling of home element / - Settings / Logo -> Header
- Dropdown -> reselect -> dann invoke möglich
- 'isActive' on sidebar is not invoked when new element is added
- Fetch error handling when connection timed out
- Error in Results: Handle better (right now just the full response is shown)
- Add zeros to current time in statusbar to prevent different length of statusbar-time
- Reset inputs of selected interactions when they are 
- When interactions of a td have been selected and the same td is fetched from an url, the selected interactions are not reseted in GUI.

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