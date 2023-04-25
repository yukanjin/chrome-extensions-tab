function buildBookmarkTree(bookmarkTreeNodes) {
  var tree = document.createElement('ul');
  tree.classList.add('bookmark-tree');
  
  for (var i = 0; i < bookmarkTreeNodes.length; i++) {
    var node = bookmarkTreeNodes[i];
    
    if (node.url) {
      var link = document.createElement('a');
      link.classList.add('bookmark-link');
      link.href = node.url;
      link.textContent = node.title;
      
      var icon = document.createElement('img');
      icon.classList.add('bookmark-icon');
      icon.src = 'https://www.google.com/s2/favicons?domain=' + node.url;
      
      link.insertBefore(icon, link.firstChild);
      
      var li = document.createElement('li');
      li.appendChild(link);
      tree.appendChild(li);
    } else {
      var folder = document.createElement('div');
      folder.classList.add('bookmark-folder');
      folder.textContent = node.title;
      
      var toggle = document.createElement('span');
      toggle.classList.add('bookmark-toggle');
      toggle.classList.add('bookmark-toggle-expanded');
      toggle.addEventListener('click', function() {
        if (this.classList.contains('bookmark-toggle-expanded')) {
          this.classList.remove('bookmark-toggle-expanded');
          this.classList.add('bookmark-toggle-collapsed');
          this.nextElementSibling.style.display = 'none';
        } else {
          this.classList.remove('bookmark-toggle-collapsed');
          this.classList.add('bookmark-toggle-expanded');
          this.nextElementSibling.style.display = 'block';
        }
      });
      
      folder.insertBefore(toggle, folder.firstChild);
      
      var ul = buildBookmarkTree(node.children);
      
      var li = document.createElement('li');
      li.appendChild(folder);
      li.appendChild(ul);
      tree.appendChild(li);
    }
  }
  
  return tree;
}

chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
  var tree = buildBookmarkTree(bookmarkTreeNodes[0].children);
  document.getElementById('tree').appendChild(tree);
});

document.querySelector('.bookmark-search input[type="text"]').addEventListener('input', function() {
  var query = this.value.trim().toLowerCase();
  var links = document.querySelectorAll('.bookmark-link');
  
  for (var i = 0; i < links.length; i++) {
    var link = links[i];
    var parentLi = link.parentNode;
    var parentUl = parentLi.parentNode;
    
    if (query === '' || link.textContent.toLowerCase().indexOf(query) !== -1) {
      parentLi.style.display = 'block';
      
      // Expand all parent folders of the matched link
      while (parentUl && parentUl.tagName === 'UL') {
        var parentFolder = parentUl.previousElementSibling;
        var parentToggle = parentFolder.querySelector('.bookmark-toggle');
        
        if (parentToggle.classList.contains('bookmark-toggle-collapsed')) {
          parentToggle.click();
        }
        
        parentUl = parentUl.parentNode;
      }
    } else {
      parentLi.style.display = 'none';
    }
  }
});


// 渲染GitHub Trending榜单
function renderTrendingRepos(data) {
  var list = document.querySelector('.trending-list');
  list.innerHTML = '';
  for (var i = 0; i < data.length; i++) {
    var repo = data[i];
    var item = document.createElement('li');
    item.innerHTML = '<a href="' + repo.url + '">' +
      // '<img src="' + repo.avatar + '" alt="' + repo.owner + '">' +
      '<div class="repo-info">' +
      '<h4>' + repo.name + '</h4>' +
      '<p>' + repo.description + '</p>' +
      '<span class="stars">' + repo.stars + '</span>' +
      '<span class="forks">' + repo.forks + '</span>' +
      '</div>' +
      '</a>';
    list.appendChild(item);
  }
}

// 获取GitHub Trending榜单数据
function getTrendingRepos(period, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.github.com/search/repositories?q=created:>' + period + '&sort=stars&order=desc');
  xhr.onload = function() {
    if (xhr.status === 200) {
      var response = JSON.parse(xhr.responseText);
      var data = response.items.map(function(item) {
        return {
          url: item.html_url,
          name: item.name,
          description: item.description,
          owner: item.owner.login,
          avatar: item.owner.avatar_url,
          stars: item.stargazers_count,
          forks: item.forks_count
        };
      });
      callback(data);
    }
  };
  xhr.send();
}

// 初始化单选按钮和默认的GitHub Trending榜单
function init() {
  // 初始化单选按钮
  var options = document.querySelectorAll('input[name="trending-option"]');
  options[0].checked = true;
  // 绑定单选按钮的change事件
  options[0].addEventListener('change', function() {
    // 获取并渲染当天的榜单数据
    getTrendingRepos(formatDate(new Date()), renderTrendingRepos);
  });
  options[1].addEventListener('change', function() {
    // 获取并渲染最近一周的榜单数据
    getTrendingRepos(formatDate(new Date(new Date() - 7 * 24 * 60 * 60 * 1000)), renderTrendingRepos);
  });
  options[2].addEventListener('change', function() {
    // 获取并渲染上一个月的榜单数据
    getTrendingRepos(formatDate(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1)), renderTrendingRepos);
  });
  // 获取并渲染当天的榜单数据
  getTrendingRepos(formatDate(new Date()), renderTrendingRepos);
}

// 将日期格式化为YYYY-MM-DD的形式
function formatDate(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  return year + '-' + (month < 10 ? '0' + month : month) + '-' + (day < 10 ? '0' + day : day);
}

// 等待DOM加载完成后初始化插件
document.addEventListener('DOMContentLoaded', init);

