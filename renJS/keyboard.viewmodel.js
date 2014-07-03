function keyboardViewModel () {
    var self= this;
    var shiftActive= false;
    /*    ko.bindingHandlers.*/
    //var keyHash= new Array[100];
    var registerKey = function(element, keyValue) {
        //keyHash.add(keyValue, element);
    };

    var expectedText = ko.observable("The quick red fox jumbed on the lazy brown dogs back");
    var typedText = ko.observable("");
    var matchingText = ko.observable("");
    var nonMatchingText = ko.observable("");

    function getCharValue(data) {
        if (data == undefined) return undefined;
        var code = data.keyCode;
        var aKey = (code == 221 || code == 219) ? 'Å'
                : (code == 222) ? 'Æ'
                : (code == 192) ? 'Ø'
                : (code == 32) ? ' '
                : (code == 8) ? "Del"
                : (code == 16) ? "Shift"
                //todo: Add functions for handling arrow left/right (?)
                : code <= 31 ? undefined  // non-printable - and not handled
                : String.fromCharCode(code);
        return aKey;
    }

    function getCharElement(aChar) {
        //if (aChar == undefined) return undefined;
        var aKey =
              (aChar == ' ') ? 'Space'
            : (aChar.length == 1) ? aChar.toUpperCase()
            : aChar; // => "Shift" or "Del" (potentially other non-printables)...
        var keyElt= $("#key" + aKey);
        if (keyElt == null || keyElt.length === 0)
            return undefined;
        return keyElt[0];
    }

    var handleKeyPress = function (data) {
        var aChar = getCharValue(data);
        if (aChar == undefined) return;

        var keyElement = getCharElement(aChar);
        if (keyElement != undefined) {
            keyElement.className = 'KeyButtonPressed';
            updateInputText(aChar);
            data.preventDefault= true;
        }
        };
    var handleKeyRelease = function (data) {
        var aChar = getCharValue(data);
        if (aChar == undefined) return;
        var keyElement = getCharElement(aChar);
        if (keyElement != undefined)
            keyElement.className = 'KeyButton';
    };

    function updateInputText(aChar)
    {
        var typed= typedText();
        if (aChar == 'Shift') {
            self.shiftActive= true;
            return; // no key to add (yet)
        }
        else
        {
            aChar= aChar.toUpperCase();
            self.shiftActive= false;
        }
        if (aChar == 'Del' && typed.length > 1) {
            typed= string.substr(-1);
        }
        else {
            typed= typed + aChar;
        }
        typedText(typed);
        var result= compareExpectedTextWithTyped(expectedText(), typed);
        matchingText(result[0]);
        nonMatchingText(result[1]);
    }

    function compareExpectedTextWithTyped(expected, typed)
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
    return {
        error: error,
        handleKeyPress: handleKeyPress,
        handleKeyRelease: handleKeyRelease,
        registerKey: registerKey,
        expectedText: expectedText,
        typedText: typedText,
        matchingText: matchingText,
        nonMatchingText: nonMatchingText,
        shiftActive: shiftActive
        };
    };
