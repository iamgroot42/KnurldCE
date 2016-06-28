document.addEventListener('DOMContentLoaded', function() {
  // Set username in html
  chrome.storage.local.get('KnurkdLoginUsername', function (obj) {
    document.getElementById("uname").innerHTML = obj['KnurkdLoginUsername'];
  });
  var logoutButton = document.getElementById('logout');
  var getMessage = function(token) {
      return "token=" + token;
      };
  logoutButton.addEventListener('click', function() {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.storage.local.get('KnurkdLoginToken', function (obj) {
          var token = obj['KnurkdLoginToken']; 
          $.ajax({
          type: 'POST',
          url: 'http://127.0.0.1:5001/logout', 
          data: token,
          success: function(text)
          {
              // Delete access token
              chrome.storage.local.remove('KnurkdLoginToken',function() {
                chrome.storage.local.remove('KnurkdLoginUsername',function() {
                  // Redirect to login page
                  location.href = "login.html";
                 });
              });
           }
        });
        });
    });
  }, false);
}, false);