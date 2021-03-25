# selectify README

## Features

Crude way to modify selected code in the editor according to rulesets.

Set the rulesets by going to Code -> Preferences -> Settings -> Extensions -> Selectify.

Each ruleset is an object in the rulesets array. 

A ruleset contains matchers--all of which much be satisfied before the actions apply.
All matchers are matched on a "contains" basis, so you don't need the full line to create a matcher.
If all matchers are found in a selection, the actions are performed.

Remove actions get rid of lines that contain the matchers in the "remove" array, as seen below.
In the above example, any lines of code containing "font-size: $font-size-medium" and "font-weight: $font-weight-medium" will be removed.


Add actions add the line(s) of code to the 2nd line in the selection.
*YOU MUST SELECT THE CODE ACCORDINGLY*.

Here's an example of ruleset settings:
```
{
    "matchers": [
      "font-size: $font-size-medium",
      "font-weight: $font-weight-medium",
    ],
    "actions": {
      "remove": [
        "font-size: $font-size-medium",
        "font-weight: $font-weight-medium",
      ],
      "add": ["@include body1;"],
    },
  },
```

So if your selection is:
```
.cssrule {
    font-size: $font-size-medium;
    font-weight: $font-weight-medium;
}
```

The above rulesets will results in:
```
.cssrule {
@include body1;
}
```

Note the lack of formatting (run Prettier after execution)

**How to mess this up**
Add actions literally add what you say to the 2nd line in the selected text. 
It's crude, it has no clue it's even working with CSS, I literally do a string.split("\n") to parse the text and insert the added line at splitString[1]

Selecting anything outside of the CSS rule will mess this up.

If your selection is:
```
.anExtraClass {
    something: thing;
}

.cssrule {
    color: red;
    font-size: $font-size-medium;
    font-weight: $font-weight-medium;
}
```

The above rulesets will results in:
```
.anExtraClass {
@include body1;
    something: thing;
}

.cssrule {
    color: red;
}
```

