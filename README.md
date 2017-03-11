# Bespin Cloud Bar - Face recognition and drink ordering interface
Usage of [Microsoft Face API](https://westus.dev.cognitive.microsoft.com/docs/services/563879b61984550e40cbbe8d/operations/563879b61984550f30395236) for for delivering orders to the correct customer at a fictional bar.

## Installation
Make sure you have node installed. You need a keys.js file in the `static/`folder. It must contain 

```
    var FACE_API_KEY = '<Your Azure Face API key here>'
    var FACE_LIST_ID = '<Your face list id>'
```

Install dependencies

`npm install`

Start the server:

`node index.js`

Open browser at `localhost:3000`

## What is a bar without a way to get your order?

With the Bespin Cloud Bar system you register your face in our mobile app and place your order for a drink. When you come to pick up your drink at the bar you take another picture for verification in our beautiful Drink Delivery Interface. When your face is recognised among the pending orders, the drink is will be poured automatically. If the bar is especially trusting you might even carry it off without the need of a bartender at all!

## Fights underage drinkers

As an added bonus, the face recognition software will help the bar in alerting of potentially underage drinkers. Below is a test with a picture found on google.
