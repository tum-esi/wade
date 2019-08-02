# w-ade TODO
http://plugfest.thingweb.io:8083/TestThing

IMPORTANT TODO
- Add other bindings
- Editor JSON view
- Adapt store to save every element with a unique td (also persistant saving element) && display stored td / refactor store for persistant storage -> Persistent storage of elements and ids (electron)

-  event subscription updates

TODO 
- Array and Object type support -> Buggy
- Support all possible input types for write and actions in UI 
- Redo smart TD-Editor -> try again with other json plugin? -> readd old tdEditor? 
- Unsubscribe to events
- Loading indication when invoking actions
- Element (folder, td, mashup) name must be unique -> used as ID
- Implement filter functionality
- Upload from machine

SMALL & LOW PRIO TODOS 
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

### Architecture:
    docs/ARCHITECTURE.md

### CSS Styles:
    docs/STYLEGUIDE.md

### Credit and sources: 
    docs/SOURCES.md