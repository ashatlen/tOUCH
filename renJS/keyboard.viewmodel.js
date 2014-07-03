function keyboardViewModel () {
    /*    ko.bindingHandlers.*/
    //var keyHash= new Array[100];
    var registerKey = function(element, keyValue) {
        //keyHash.add(keyValue, element);
    };

    var expectedText = ko.observable("The quick red fox jumbed on the lazy brown dogs back");
    var typedText = ko.observable("Value should be viewed here: ");
    var matchingText = ko.observable("");
    var nonMatchingText = ko.observable("");

    function getCharValue(data) {
        if (data == undefined) return undefined;
        var code = data.keyCode;
        var aKey = (code == 221 || code == 219) ? 'Å'
                : (code == 222) ? 'Æ'
                : (code == 192) ? 'Ø'
                : (code == 32) ? 'Space'
                : (code == 999) ? "Del"
                : String.fromCharCode(code);
        return aKey;
    }

    function getCharElement(aChar) {
        if (aChar == undefined) return undefined;

        aChar = aChar.length == 1 ?  aChar.toUpperCase() : aChar;
        var keyElt= $("#key" + aChar);
        if (keyElt == null || keyElt.length === 0)
            return undefined;
        return keyElt[0];
    }

    var handleKeyPress = function (data, event) {
        var aChar = getCharValue(data);
        if (aChar == undefined) return;
        var keyElement = getCharElement(aChar);
        if (keyElement != undefined) {
            keyElement.className = 'KeyButtonPressed';
            updateInputText(aChar);

        }

        event.preventDefault= true;
        };
    var handleKeyRelease = function (data, event) {
        var aChar = getCharValue(data);
        if (aChar == undefined) return;
        var keyElement = getCharElement(aChar);
        if (keyElement != undefined)
            keyElement.className = 'KeyButton';
    };

    function updateInputText(aChar)
    {
        typedText(typedText() + aChar);
        var result= compareExpectedTextWithTyped(expectedText(), typedText());
        matchingText(result[0]);
        nonMatchingText(result[1]);
    }

    function compareExpectedTextWithTyped(expected, typed)
    {
        var nonMatchingText= "";
        var matchingText= "";
        var bound= Math.max(expected.length, typed.length);
        for(var idx= 0; idx < bound; idx++)
        {
            if (idx > expected.length || idx > typed.length)
            {
                nonMatchingText += typed[idx];
            }
            else if( expected[idx] == typed[idx])
                matchingText += typed[idx];
            else
                nonMatchingText += typed[idx];

            return new Array() {matchingText, nonMatchingText};
        }
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
        nonMatchingText: nonMatchingText
        };
    };
