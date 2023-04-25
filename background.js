chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ bookmarks: [] }, () => {
    console.log('Bookmarks initialized');
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === 'getBookmarks') {
    chrome.storage.local.get('bookmarks', (result) => {
      sendResponse(result.bookmarks);
    });
    return true;
  }
});
