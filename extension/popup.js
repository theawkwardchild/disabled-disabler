// popup.js

document.addEventListener('DOMContentLoaded', function() {
    // Retrieve saved state from storage (if any)
    chrome.storage.sync.get('extensionEnabled', function(data) {
        const isEnabled = data.extensionEnabled;
        
        // Update UI based on saved state
        const toggleCheckbox = document.getElementById('toggleCheckbox');
        toggleCheckbox.checked = isEnabled;
        
        // Toggle extension state when checkbox changes
        toggleCheckbox.addEventListener('change', function() {
            const isChecked = toggleCheckbox.checked;
            
            // Save the state to storage
            chrome.storage.sync.set({ 'extensionEnabled': isChecked });
            
            // Send a message to content script to toggle functionality
            chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
                chrome.tabs.sendMessage(tabs[0].id, { enableExtension: isChecked });
            });
        });
    });
});