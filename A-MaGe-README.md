# A-MAGE

## Table of Contents  
1. [Atomic Mashup Generator for the Web of Things](#atomic-mashup-generator-for-the-web-of-things) 
2. [Prerequisites](#prerequisites)  
3. [Installation](#Installation)  
4. [Evaluation of A-MaGe](#evaluation-of-a-mage)
---
## **A**tomic **Ma**shup **Ge**nerator for the Web of Things
A-MaGe is a mashup generator for the Web of Things designed to take advantage of the Atomic Mashup abstraction proposed by the [System Description](https://ieeexplore.ieee.org/abstract/document/9191677).
![demonstration](demonstration.gif)

---
## Prerequisites
You need to have [Node.js](https://nodejs.org/en/) and  [Yarn](https://yarnpkg.com/) installed.

Additionally, for NLP:  
Latest version of [Python](https://www.python.org/) and the following packages
1. [gensim](https://radimrehurek.com/gensim/)
2. [Flask](https://flask.palletsprojects.com/en/1.1.x/)
3. [Flask-RESTful](https://flask-restful.readthedocs.io/en/latest/)

---
## Installation
**Step 1:** Navigate into the main folder and install all dependencies.

```
yarn install 
```
**Step 2:** Check if `./node_modules/@node-wot/core/dist/servient.js` contains `var vm2_1 = require("vm2");` in line 3. If so, please remove line 3 and lines 15-68.

**Step 3:** Build the electron application.
```
yarn run electron:build
```
**Step 4:** Navigate into the folder 'dist_electron' and install the application. After installing it you can start the application on your machine.

**Step 5:** To run the NLP-Sever, run the Python script
`./NLP/word2vec-api.py`

---
## Evaluation of A-MaGe
The results of all the tests performed in the paper are available under the folder `./A-MaGe-Testing`. Each test has a designated folder that includes the Thing Descriptions used for mashup generation as well as the results in `.csv` format.