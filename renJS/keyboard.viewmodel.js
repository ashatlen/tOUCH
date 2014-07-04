var KeyStatus = {
    notTyped: 0,
    match: 1,
    wrong: -1
};

function TypedKey(c, status, idx)
{
    var self= this;
    self.key= c;
    self.idx= idx;
    self.status= status;

    function AssignCorrectStyling(elementName, status) {
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
        if (textElement.children.length <= self.idx) {
            $(textElement).append("<span id='charIdx_" + self.idx + "'>" + self.key + "</span>");
            //  $(textElement).append("<span>" + self.key + "</span>").attr({id: "charIdx_" + self.idx});
            //  <-will add attr (correctly) on the div, not the span :)
            //$($(textElement).append("<span>" + self.key + "</span>").get(-1)).attr({id: "charIdx_" + self.idx});
            // <-same, same...
        }
        AssignCorrectStyling("#charIdx_" + self.idx, self.status);
    }
    return {
        key: self.key,
        render: renderKey
        };
    }

function keyboardViewModel () {
    var self= this;
    var shiftActive= false;
    /*    ko.bindingHandlers.*/
    //var keyHash= new Array[100];
    var registerKey = function(element, keyValue) {
        //keyHash.add(keyValue, element);
    };

    var expectedText = ko.observable("The quick red fox jumped on the lazy brown dogs back");
    var typedText = ko.observable("");
//    var matchingText = ko.observable("");
//    var nonMatchingText = ko.observable("");

    function getCharValue(data) {
        if (data == undefined) return undefined;
        var code = data.keyCode;
        var aKey = (code == 221 || code == 219) ? 'Å'
                : (code == 222) ? 'Æ'
                : (code == 192) ? 'Ø'
                : (code == 32) ? ' '
                : (code == 8) ? "Del"
                : (code == 16) ? "Shift"
                : (code == 13) ? "Enter"
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

            if (aChar == 'Shift')
                self.shiftActive= true;
            else if (aChar == 'Enter')
            {
                typedText(""); // Clear all
                var pane= $("#typingPane")[0];
                pane.removeAll();
            }
            else
                updateInputText(aChar);

            data.preventDefault= true;
        }
    };
    var handleKeyRelease = function (data) {
        var aChar = getCharValue(data);
        if (aChar == undefined) return;
        if (aChar == 'Shift') self.shiftActive= false;

        var keyElement = getCharElement(aChar);
        if (keyElement != undefined)
            keyElement.className = 'KeyButton';
    };

    function updateInputText(aChar)
    {
        var typed= typedText();
        if (self.shiftActive)
            aChar= aChar.toUpperCase();
        else
            aChar= aChar.toLowerCase();

        if (aChar == 'Del' && typed.length > 1) {
            typed= string.substr(-1);
        }
        else {
            typed= typed + aChar;
        }
        typedText(typed);
        var result= compareExpectedTextWithTyped(expectedText(), typed);

        var pane= $("#typingPane")[0];
        renderTypedText(pane, result);
    }

    function compareExpectedTextWithTyped(expected, typed)
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

    function renderTypedText(typePane, result)
    {
        if(result === undefined || result.length === 0)
            return;
//        for(var idx= 0; idx < result.length; idx++)
//        {
            result[result.length-1].render(typePane);
//        }
    }

    var error = ko.observable();
    return {
        error: error,
        handleKeyPress: handleKeyPress,
        handleKeyRelease: handleKeyRelease,
        registerKey: registerKey,
        expectedText: expectedText,
        typedText: typedText,
//        matchingText: matchingText,
//        nonMatchingText: nonMatchingText,
//        shiftActive: shiftActive,
        };
    };
