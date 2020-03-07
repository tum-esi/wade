# W-ADE Software Architecture

Here you find the detailed software architecture explained to better understand W-ADE's structure.
First, the frontend architecture is explained, followed by the structure of the backend.


## Fronted Architecture
---
The architectural style of W-ADE's frontend is inspired by the _**Atom Design**_ design system by Brad Frost: http://atomicdesign.bradfrost.com/chapter-2/.  

However, instead of being divided into 5 different types, W-ADE's GUI elements are only divided into 4 different modules:
1) Atoms
2) Molecules
3) Organisms 
4) Templates

### Atoms
Atoms comprise the most foundational building blocks of the user interface. 
They include basic GUI elements like buttons (with different styles), form fields, inputs, labels and others.
Every element that cannot be further broken down should be added to the atoms folder. 

If you want to build a plugin or work on the further development of W-ADE check out the atoms and see if elements you need for your interface already exist in here. 
Create a new atom if needed.

Some of the styles used in atoms (and also in other elements) are stored in the App.vue file to make the available "*globally*".

### Molecules
In interfaces, molecules are relatively simple groups of UI elements functioning together as a unit. For example, a form label, search input, and button can join together to create a search form molecule.

### Organisms

### Templates

Gitlab Issues: 

- Num Clients performance testing (see PerformancePrediction.ts)
- Overall error handling & displaying of errors