// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
Array.prototype.insert = function (index, item) {
  this.splice(index, 0, item);
};

function getActionsFromRulesetsForText(rulesets, text) {
  const selectedTextLines = text.split("\n");
  const matchedRulesets = [];
  for (let i = 0; i < rulesets.length; i++) {
    const ruleset = rulesets[i];
    const matchedLines = [];
    const matchedMatchers = new Set();
    // check that this ruleset's matchers are all satisfied. We use the separate lines to make changing easier later
    selectedTextLines.forEach((line, lineIndex) => {
      const [match, matchIndex] = getMatchFromLine(line, ruleset.matchers);
      if (match) {
        matchedMatchers.add(matchIndex);
        matchedLines.push(lineIndex);
      }
    });

    // sets guarantee uniqueness, so if the number of items in the set matches the number of matchers, the ruleset has been satisfied
    if (matchedMatchers.size === ruleset.matchers.length) {
      matchedRulesets.push(ruleset);
    }
  }

  return getMostSpecificRulesetMatch(matchedRulesets).actions;
}

function getMostSpecificRulesetMatch(matchedRulesets) {

  if (matchedRulesets.length === 0) return undefined;
  if (matchedRulesets.length === 1) return matchedRulesets[0];

  let highestMatchersRuleset;
  matchedRulesets.forEach((ruleset) => {
    if (!highestMatchersRuleset) highestMatchersRuleset = ruleset;

    if (ruleset.matchers.length > highestMatchersRuleset.matchers.length)
      highestMatchersRuleset = ruleset;
  });

  return highestMatchersRuleset;
}

function getMatchFromLine(line, matchers) {
  let match;
  let index;

  matchers.forEach((matcher, idx) => {
    if (line.indexOf(matcher) > -1) {
      match = matcher;
      index = idx;
    }
  });

  return [match, index];
}

function performActionsOnText(actions, text) {
  const textLines = text.split("\n");
  let linesBuffer = [];

  function removeFromTextLines(matchers) {
    linesBuffer = textLines.filter((line) => {
      let hasMatch = false;
      for (let i = 0; i < matchers.length; i++) {
        if (line.indexOf(matchers[i]) > -1) {
          hasMatch = true;
        }
      }
      return !hasMatch;
    });
  }

  function addToTextLines(lines) {
    lines.forEach((line) => {
      linesBuffer.insert(1, line);
    });
  }

  removeFromTextLines(actions.remove);
  addToTextLines(actions.add);

  if (linesBuffer) {
    return linesBuffer.join("\n");
  }
  return text;
}
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "selectify" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with  registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "selectify.helloWorld",
    function () {
      // The code you place here will be executed every time your command is executed
      let configuration = vscode.workspace.getConfiguration("selectify");
      const rulesets = configuration.rulesets;
      const editor = vscode.window.activeTextEditor;
      let selectedText = editor.document.getText(editor.selection);
      const actions = getActionsFromRulesetsForText(rulesets, selectedText);
      console.log(actions);
      if (actions) {
        const processedText = performActionsOnText(actions, selectedText);
        // set the selected text to the new processed text
        editor.edit((editBuilder) => {
          editBuilder.replace(editor.selection, processedText);
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
