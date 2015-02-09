# jonquil
jq as a service

## Overview
Runs the handy [jq](http://stedolan.github.io/jq/) JSON processing tool in a web service. If you want to provide data that's out of your control to a service like charted.co, you might need to apply some processing first. jonquil allows you to insert a live data-manipulation stage.

## Usage
Make GET requests to `http://jonquil.herokuapp.com/jq` (or `https://jonquil.herokuapp.com/jq`) with the following query parameters:

+ `url`: URL of the remote JSON data
+ `f`: text of the jq filter to apply
+ `type`: (optional, default: `application/json`) value to set for the `Content-Type` header of the response, in case you are building CSV output, for example
+ `flags`: (optional) comma-separated flags to pass to the jq command

For example, here's a traditional jq command to create valid GeoJSON from an array of objects that have location fields formatted as `[latitude, longitude]`.

```
curl https://git.io/bdAQ | jq '{type:"FeatureCollection", features:[.[] | {type:"Feature",properties: {name: .name}, geometry:{type:"Point",coordinates:[.location[1],.location[0]]}}]}'
```

To perform the equivalent with jonquil, you would request the following URL:
```
https://jonquil.herokuapp.com/jq?url=https%3A%2F%2Fgit.io%2FbdAQ&f=%7Btype%3A%22FeatureCollection%22%2C+features%3A%5B.%5B%5D+%7C+%7Btype%3A%22Feature%22%2Cproperties%3A+%7Bname%3A+.name%7D%2C+geometry%3A%7Btype%3A%22Point%22%2Ccoordinates%3A%5B.location%5B1%5D%2C.location%5B0%5D%5D%7D%7D%5D%7D
```
