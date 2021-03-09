# @netcodejs/event User Guide

This is the **TypeScript** framework of the "observer model". It provides fewer but efficient interfaces, such as `on`, `off` and so on.

## Installation

For npm:

```shell
$ npm install @netcodejs/event --save
```

For Yarn:

```shell
$ yarn add @netcodejs/event
```



## Usage

For esmodule: 

```typescript 
import { Event } from "@netcodejs/event"
```

For commonjs:

```typescript
var Event = require("@netcodejs/event")
```



## Simple Example

```typescript
const event = new Event();

function logHelloWorld(author: string) {
    console.log("Hello, world. Author: " + author + ".");
}
event.on("hello", logHelloWorld);

event.emit("hello", "LittleMoi"); // It will log "Hello, world. Author: LittleMoi".
event.emit("hello", "netcodejs"); // Similaryly, "Hello, world. Author: netcodejs".
event.emit("hi"); // No throws, no things.
```
