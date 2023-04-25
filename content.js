document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['bookmarkTree'], ({ bookmarkTree }) => {
      const bookmarks = getBookmarks(bookmarkTree);
      const app = new Vue({
        el: '#app',
        data: {
          bookmarks,
        },
      });
    });
  
    function getBookmarks(tree) {
      return tree.flatMap((node) => {
        if (node.url) {
          return {
            name: node.title,
            url: node.url,
          };
        }
        return getBookmarks(node.children);
      });
    }
  });
  