window.keyboardViewModel = (function(ko) {
    /*    ko.bindingHandlers.*/
    //var keyHash= new Array[100];
    var registerKey = function(element, keyValue) {
        //keyHash.add(keyValue, element);
    };

    var expectedText = ko.observable("The quick red fox jumbed on the lazy brown dogs back");
    var typedText = ko.observable("Value should be viewed here: ");
    var matchingText = ko.observable("");
    var nonMatchingText = ko.observable("");

    function getCharValue(event) {
        if (event == undefined) return undefined;
        var code = event.keyCode;
        var aKey = (code == 221) ? 'Å'
            : (code == 222) ? 'Æ'
                : (code == 192) ? 'Ø'
                    : String.fromCharCode(code);
        return aKey;
    }

    function getCharElement(aChar) {
        if (aChar == undefined) return undefined;

        aChar = aChar.toUpperCase();
        var keyElement = document.getElementById("key" + aChar);
        return keyElement;
    }

    var handleKeyPress = function (data, event) {
        var aChar = getCharValue(event);
        if (aChar == undefined) return; 
        var keyElement = getCharElement(aChar);
        if (keyElement != undefined) {
            typedText(typedText() + aChar);
            keyElement.className = 'KeyButtonPressed';
        }
    };
    var handleKeyRelease = function (data, event) {
        var aChar = getCharValue(event);
        if (aChar == undefined) return;
        var keyElement = getCharElement(aChar);
        if (keyElement != undefined)
            keyElement.className = 'KeyButton';
    };
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
    })(ko);

// Initiate the Knockout bindings
ko.applyBindings(window.keyboardViewModel);
