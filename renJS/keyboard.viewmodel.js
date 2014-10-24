var KeyStatus = {
    notTyped: 0,
    match: 1,
    wrong: -1
};

function TypedKey(c, status, idx)
{
    var self= this;
    this.key= c;
    this.idx= idx;
    this.status= status;

    function AssignCorrectStyling(elementName, status)
    {
        var correctClass= "matchKey";
        var wrongClass= "wrongKey";
        var untypedClass= "laterKey";

        var removeCs = [];
        var addC = "";
        if (status == KeyStatus.match) {
            removeCs = [wrongClass, untypedClass];
            addC = correctClass;
        }
        else if (status == KeyStatus.wrong) {
            removeCs = [correctClass, untypedClass];
            addC = wrongClass;
        }
        else {// assume KeyStatus.untyped
            removeCs = [wrongClass, correctClass];
            addC = untypedClass;
        }
        $(elementName)[0].className= addC; //.removeClass(removeCs).addClass(addC);
    }

    function renderKey(textElement)
    {
        if (textElement.children.length <= idx) {
            $(textElement).append("<span id='charIdx_" + self.idx + "'>" + self.key + "</span>");
            //  $(textElement).append("<span>" + self.key + "</span>").attr({id: "charIdx_" + self.idx});
            //  <-will add attr (correctly) on the div, not the span :)
            //$($(textElement).append("<span>" + self.key + "</span>").get(-1)).attr({id: "charIdx_" + self.idx});
            // <-same, same...
        }
        AssignCorrectStyling("#charIdx_" + self.idx, self.status);
    }
    return {
        key: c,
        render: renderKey
        };
    }

function keyboardViewModel ()
{
    var self= this;
    var shiftActive= false;
    /*    ko.bindingHandlers.*/
    //var keyHash= new Array[100];
    var registerKey = function(element, keyValue) {
        //keyHash.add(keyValue, element);
    };

    var expectedText = ko.observable("");
    var typedText = ko.observable("");
//    var matchingText = ko.observable("");
//    var nonMatchingText = ko.observable("");

    var TypePanel= function(elementID)
    {
        var self= this;
        var pane= $("#"+elementID)[0];

        function renderTypedText (result)
        {
            renderTypedTextInternal(pane, result);
        };

        function clearPanel() {
            $(pane).html("");
        };

        function renderTypedTextInternal(typePane, result)
        {
            //TODO: Optimise this. It is not necessary to re-render everything. If Delete, just remove the last element.
//                $(typePane).html("");
            clearPanel();
            if(result === undefined || result.length === 0)
                return;
            for(var idx= 0; idx < result.length; idx++)
                result[idx].render(typePane);
        }

        return {
            clearPanel: clearPanel,
            renderTypedText: renderTypedText
        };
    };
    var typePanel= new TypePanel("contentOverlay");

    function getCharValue(data) {
        if (data == undefined) return undefined;
        var code = data.keyCode;
        var aKey = (code == 221 || code == 219) ? 'Å'
                : (code == 222) ? 'Æ'
                : (code == 186 || code == 192) ? 'Ø'
                : (code == 32) ? ' '
                : (code == 8) ? "Del"
                : (code == 46) ? "Del"
                : (code == 16) ? "Shift"
                : (code == 13) ? "Enter"
                //todo: Add functions for handling arrow left/right (?)
                : code <= 31 ? undefined  // non-printable - and not handled
                : String.fromCharCode(code);

        if (aKey == undefined)
            console.log("Key pressed " + code.toString() + " not recognized")
        return aKey;
    }

    // provided a character, return the name/id of the corresponding button on the keyboard.
    function getCharElement(aChar) {
        //if (aChar == undefined) return undefined;
        var aKey =
              (aChar == ' ') ? 'Space'
            : (aChar.length == 1)
                ? aChar.toUpperCase()
                : aChar; // => "Shift" or "Del" (potentially other non-printables)...
        var keyElt= $("#key" + aKey);
        if (keyElt == null || keyElt.length === 0)
            return undefined;
        return keyElt[0];
    }

    // When a key is pressed, process the key (find the corresponding button (if any)
    // If the key is not a special key receive and analyse the new character with
    // respect to the expected input.
    var handleKeyDown = function (data) {
        var countThisKey= true;
        var aChar = getCharValue(data);
        if (aChar != undefined) {
            data.preventDefault();
            data.stopPropagation();
            if (aChar == 'Enter') {
                // todo: Check if the phrase is correct before getting the next?
                init(phraseLib.nextPhrase());
                // todo: Get new line on display, clean up "points" etc...
            }
            else {
                var keyElement = getCharElement(aChar);
                if (keyElement !== undefined) {
                    keyElement.className = 'KeyButtonPressed';
                    if (aChar == 'Shift') {
                        countThisKey= false;    // no keystroke yet
                        self.shiftActive = true;
                    }
                    else
                        updateInputText(aChar);
                    var noOfWrongCharacters = CalculateDifference(expectedText(), typedText());
                    textDifference(noOfWrongCharacters);
                }
            }
        }
        if (countThisKey)
            numberOfStrokes(numberOfStrokes() + 1);
    };
    var handleKeyRelease = function (data) {
        var aChar = getCharValue(data);
        if (aChar == undefined)
            return;

        if (aChar == 'Shift') self.shiftActive= false;
        var keyElement = getCharElement(aChar);
        if (keyElement != undefined) {
            keyElement.className = 'KeyButton';
            data.preventDefault();
            data.stopPropagation();
        }
        else {
            console.log("Key element for char " + aChar + " not found")
        }
    };

    function init(textString)
    {
        if (textString == undefined)
            textString= phraseLib.getPhrase();
        typedText("");
        typePanel.clearPanel();
        expectedText(textString)
    }

    // Insert here: Should refactor later...
//    var currentPhrase= 0;
//    var phraseLibrary= [
//        "Hei på deg",
//        "Hvordan går det med deg",
//        "Gullfisken min skal på svømmetur",
//        "The quick red fox jumped on the lazy brown dogs back"
//    ];
//
//    function getPhrase()
//    {
//        if (currentPhrase > phraseLibrary.length) currentPhrase= 0;
//        return phraseLibrary[currentPhrase];
//    };
//
//    function nextPhrase()
//    {
//        if (currentPhrase > phraseLibrary.length)
//            currentPhrase= 0;
//        else
//            currentPhrase++;
//        return current();
//    };
//
//    var phraseLib= {
//        getPhrase: getPhrase,
//        nextPhrase: nextPhrase
//    };

    function resetTyping (data, fn)
    {
        //todo: Get a "library" of different phrases. Keep the current phrase when resetting. On completion, move to the next phrase.
        init(phraseLib.getPhrase());//"The quick red fox jumped on the lazy brown dogs back")
        numberOfStrokes(0);
        textDifference(0);
        error("Skriv setningen som står under. Bruk færrest mulig tastetrykk");
    }

    function setPhraseLibrary(phrases)
    {
        phraseLib= phrases;
    }

    // Match the typed key with the expected
    function CalculateDifference(expected, typed) {

        var expectedTyped= expected.substr(0, typed.length);
        var lDist= LevenshteinDistance(expectedTyped, typed);
//        var levenshteinResult= "Distance between " + expectedTyped + " and " + typed +" is " + lDist;
//        error(levenshteinResult);
        return lDist;
    }

    function updateInputText(aChar)
    {
        var typed= typedText();
        if (aChar == 'Del' && typed.length >= 1) {
            typed = typed.substr(0, typed.length - 1);
            }
        else {
            if (self.shiftActive)
                aChar= aChar.toUpperCase();
            else
                aChar= aChar.toLowerCase();
            typed= typed + aChar;
        }
        typedText(typed);
        var result= generateKeyStrokeSequenceWithStatus(expectedText(), typed);
        typePanel.renderTypedText(result);
    }

    function generateKeyStrokeSequenceWithStatus(expected, typed)
    {
        var typedKeys= [];
        var match= false;
        for(var idx= 0; idx < typed.length; idx++) {
            if ((idx < expected.length)  // if not out of bounds!
                && (expected[idx] == typed[idx])) {// the character matches at the current position...
                match= true;
            }
             else {
                match= false;
            }
            //todo: if a mismatch is detected, should all following chars be "non-matching"?
            //todo: be more clever with object creation, reuse objects instead of recreating all...
            typedKeys[idx]= new TypedKey(typed[idx], match ? KeyStatus.match : KeyStatus.wrong, idx);
        }
        return typedKeys;
    }

    function compareExpectedTextWithTyped_AbsoluteAlignment(expected, typed)
    {
        var typedKeys= [];
        var match= false;
        //var bound= Math.max(expected.length, typed.length);
        for(var idx= 0; idx < typed.length; idx++) {
            if ((idx < expected.length)  // not out of bounds!
                && (expected[idx] == typed[idx])) {// the character matches at the current position...
                match= true;
            }
            else {
                match= false;
            }
            //todo: if a mismatch is detected, should all following chars be "non-matching"?
            typedKeys[idx]= TypedKey(typed[idx], match ? KeyStatus.match : KeyStatus.wrong, idx);
        }
        return typedKeys;
    }


    function compareExpectedTextWithTyped_Naive1(expected, typed)
    {
        var nonMatchingText= "";
        var matchingText= "";
        //var bound= Math.max(expected.length, typed.length);
        var bound= typed.length;
        for(var idx= 0; idx < bound; idx++) {
            if (idx >= expected.length)  {
                //would always be...if (idx < typed.length) {
                // out of bounds - too many characters entered!
                nonMatchingText += typed[idx];
                //}
            }
            else if (expected[idx] == typed[idx]) {
                // the character matches so far...
                matchingText += typed[idx];
            }
            else {
                // the character did not match..
                //todo: if a mismatch is detected, should all following chars be "non-matching"?
                nonMatchingText += typed[idx];
            }
        }
        return [matchingText, nonMatchingText];
    }
    var error = ko.observable();
    var numberOfStrokes= ko.observable(0);
    var textDifference= ko.observable(0);
    return {
        handleKeyDown: handleKeyDown,
        handleKeyUp: handleKeyRelease,
        numberOfStrokes: numberOfStrokes,

        error: error,
        typedText: typedText,
        expectedText: expectedText,
        textDifference: textDifference,
        setPhraseLibrary: setPhraseLibrary,
        resetTyping: resetTyping,
        init: init,
        registerKey: registerKey
        };
};

function createPhraseLibrary(startNo)
{
//    var self= this;
    var currentPhrase= startNo;
    var phraseLibrary= [
        "Hei",
        "Hei på deg",
        "Hvordan går det med deg",
        "Gullfisken min skal på svømmetur",
        "The quick red fox jumped on the lazy brown dogs back"
    ];

    function current()
    {
        if (currentPhrase >= phraseLibrary.length) currentPhrase= 0;
        return phraseLibrary[currentPhrase];
    };

    function next()
    {
        if (currentPhrase > phraseLibrary.length)
            currentPhrase= 0;
        else
            currentPhrase++;
        return current();
    };

    return {
        getPhrase: current,
        nextPhrase: next
    };
}
