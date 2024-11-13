var toggledOn;

// Main function to enable disabled input fields and buttons
// Not being used yet, but adding the `startingElement` as it may make more sense to rerun this function only on the mutation.target instead of the full document.
// Right now only it is firing once per group of mutations for the full document and it feels like that might be less costly than running on specific portions but multiple times.
function enableDisabledElements(startingElement = document) {
    if (!toggledOn) {
        return;
    }
    // Collect all disabled inputs and buttons.
    // If you find any other types of elements that you would want enabled, add them here.
    // Per mozilla: `The disabled attribute is supported by <button>, <fieldset>, <optgroup>, <option>, <select>, <textarea> and <input>`
    // not exactly sure why I was using input[disabled] & button[disabled] previously. Some types of elements were not being captured with it but can check back if there are any issues.
    let elements = startingElement.querySelectorAll(":disabled"); //("input[disabled], button[disabled]"); 
    
    elements.forEach(element => {
        // I personally liked the apperance of borders over outlines, but found some element types did not support borders so they get a colored outline
        if (element.type == "checkbox" || element.type == "range" || element.type == "radio") {
            if (element.style.outline && !(element.style.outline == "2px dashed rgb(255, 168, 52)" || element.style.outline == "2px dashed #ffa834")) {
                // Capturing the original style so it can be reapplied when the extension is turned off
                element.setAttribute("original-outline", element.style.outline);
            }
            element.style.outline = "2px dashed #ffa834 "; // Add an outline for elements not supporting a border            
        } else {
            if (element.style.border && !(element.style.border == "2px dashed rgb(255, 168, 52)" || element.style.border == "2px dashed #ffa834")) {
                // Capturing the original style so it can be reapplied when the extension is turned off
                element.setAttribute("original-border", element.style.border);
            }
            element.style.border = "2px dashed #ffa834 "; // Add outline for all other elements
        }
        element.setAttribute('wasDisabled', true);
        element.disabled = false;
    });
}

// Set a custom tag on effected elements so when the extension is disabled they can be returned to their original state
function revertChangedElements(startingElement = document) {
    let elements = startingElement.querySelectorAll("input, button");

    elements.forEach(element => {
        if (!element.hasAttribute('wasDisabled') || !element.getAttribute('wasDisabled') === true) {
            return
        }
        // Either revert each element to it's original outline/border style, or just clear it
        if (element.type == "checkbox" || element.type == "range" || element.type == "radio") {
            if (element.hasAttribute('original-outline')) {
                element.style.outline = element.getAttribute('original-outline');
            } else {
                element.style.outline = '';
            }
        } else {
            if (element.hasAttribute('original-border')) {
                element.style.border = element.getAttribute('original-border');
            } else {
                element.style.border = '';
            }
        }
        element.disabled = true;
        element.setAttribute('wasDisabled', false)
    })
}

// Initial run when the extension is activated
chrome.storage.sync.get('extensionEnabled', function (data) {
    const isEnabled = data.extensionEnabled;
    toggledOn = isEnabled;
    if (isEnabled) {
        enableDisabledElements();
    }
});

// Listen for messages from the popup
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    toggledOn = message.enableExtension;
    if (message.enableExtension) {
        enableDisabledElements();
    } else {
        revertChangedElements();
    }
});

// Mutation Observer to detect changes and re-run the disable function
const observer = new MutationObserver(mutations => {
    if (toggledOn && mutations.filter(
        (mutation) => {
            return (mutation.type === 'childList' || mutation.type === 'subtree' || mutation.type === 'attributes');
        }
    )) {
        enableDisabledElements();
    }
});

// Start observing the document for mutations
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['disabled']
});

// Initial run when the extension is activated
enableDisabledElements();
