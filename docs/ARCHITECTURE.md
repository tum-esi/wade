# W-ADE Software Architecture

Here you find the detailed software architecture explained to better understand W-ADE's structure.
First, the structure of the application logic is explained, followed by the frontend architecture.


## Application Logic

W-ADE is an Electron & Vue.js based desktop application.
It is mainly written in TypeScript, a typed superset of JavaScript.

The application structure is as following:

```
    -assets  
    -backend  
    -components  
    --01_atoms  
    --02_molecules  
    --03_organisms  
    --04_templates  
    -store  
    --modules  
    -util  
    -App.vue  
    -background.ts  
    -main.ts  
    -router.ts  
    -shims-tsx.d.ts  
```

## Fronted Architecture

---
The architectural style of W-ADE's frontend is inspired by the _**Atom Design**_ design system by Brad Frost: http://atomicdesign.bradfrost.com/chapter-2/.  

However, instead of being divided into 5 different types, W-ADE's GUI elements consist off only 4 different modules:
1) Atoms
2) Molecules
3) Organisms
4) Templates

### Atoms

*Atoms* comprise the most foundational building blocks of the user interface. 
They include basic GUI elements like buttons (with different styles), form fields, inputs, labels, etc.
Every element that cannot be further broken down should be added to the *Atoms* folder. 

Most *Atom* components are dynamic. That means they can be used for building other components, as they can be dynamically be filled with different content.
If you want to build plugins or work on the further development of W-ADE check out this folder to see if elements you need for your interface already exist in here. 
Create a new atom if needed.

### Molecules

In interfaces, molecules are relatively simple groups of UI elements functioning together as a unit. For example, a form label, search input, and button can join together to create a search form molecule.

### Organisms

### Templates

Templates are non-dynamic components, which shouldn't be reused.
They are components, filled with specific content, displaying full pages.


### Remarks

Some of the used styles are stored in the App.vue file to make them available "*globally*".

