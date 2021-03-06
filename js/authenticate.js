document.addEventListener('DOMContentLoaded', function() {
  chrome.storage.sync.get('KnurkdVerificationWords', function (obj) {
  	  if(!obj['KnurkdVerificationWords'])
  	  {
  	  	// Verification words not found for some reason; log-out
  	  	alert('Technical error! Please sign-in again');
        // Delete access token, log in again
        chrome.storage.sync.remove('KnurkdLoginToken',function() {
          	location.href = "login.html";
        });
  	  }
      var three_words = obj['KnurkdVerificationWords'];
      var wordesTag = document.getElementById('wordes');
      var insider = "For voice authentication, say the words \"";
      insider = insider + three_words[0] + " " + three_words[1] + " " + three_words[2] + "\" out loud with a gap of at least half second";
      wordesTag.innerHTML = insider;
      var eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
      var eventer = window[eventMethod];
      var messageEvent = eventMethod == "attachEvent" ? "onmessage" : "message";
      // Listen to message from child window
      eventer(messageEvent,function(e) {
          var key = e.message ? "message" : "data";
          var link = e[key];
          chrome.storage.sync.get('KnurkdLoginToken', function (obj) {
            var token = obj['KnurkdLoginToken'];
            chrome.storage.sync.get('KnurkdLoginUsername', function (obj) {
              chrome.storage.sync.get('KnurkdVerificationSecret', function (obj) {
                 var ver_sec = obj['KnurkdVerificationSecret'];
            	   $.ajax(
            	   {
                  	type: 'GET',
                    url: "https://voice6-byld.rhcloud.com/verify?at="+token+"&audioUrl="+link+"&verificationSecret="+ver_sec,
             	    	success: function(data)
             	    	{
                        if(!data["verified"])
                        {
                          alert('Authentication problem! Please sign-in again');
                          // Delete access token, log in again
                          chrome.storage.sync.remove('KnurkdLoginToken',function() {
                            location.href = "login.html";
                            // return;
                          });
                        }
                        // Get instructions for next time
                    		chrome.storage.sync.set({'KnurkdLoginKey':data["key"]},function()
                    		{
                          $.ajax({
                              type: 'GET',
                              url: "https://voice6-byld.rhcloud.com/getVerifyInstructions?at="+token.toString(),
                              success: function(data)
                              {
                                // alert(JSON.stringify(data));
                                if(data['verificationSecret'])
                                {
                                  chrome.storage.sync.set({'KnurkdVerificationSecret':data["verificationSecret"]},function()
                                  {
                                      chrome.storage.sync.set({'KnurkdVerificationWords':data["words"]},function()
                                      {
                                          // Redirect to 'logged in' page
                                          alert("Voice authenticated!");
                                          location.href = 'logged_in.html';
                                          // return;
                                      });
                                    });
                                }
                                else
                                {
                                  alert('Voice authentication error! Please try again');
                                  // Used this, request another set of instructions,verifykey
                                  $.ajax({
                                      type: 'GET',
                                      url: "https://voice6-byld.rhcloud.com/getVerifyInstructions?at="+token.toString(),
                                      success: function(data)
                                      {
                                        // alert(JSON.stringify(data));
                                        if(data['verificationSecret'])
                                        {
                                          chrome.storage.sync.set({'KnurkdVerificationSecret':data["verificationSecret"]},function()
                                          {
                                              chrome.storage.sync.set({'KnurkdVerificationWords':data["words"]},function()
                                              {
                                                  // Redirect to 'logged in' page
                                                  location.href = 'authenticate.html';
                                                  // return;
                                              });
                                            });
                                        }
                                        else
                                        {
                                          alert('Authentication problem! Please sign-in again');
                                          // Delete access token, log in again
                                          chrome.storage.sync.remove('KnurkdLoginToken',function() {
                                              location.href = "login.html";
                                              // return;
                                          });
                                        }
                                      }
                                  });
                                }
                              }
                          });
                    		});
             	    	 },
                     error: function(data)
                     {
                        alert('Authentication problem! Please sign-in again');
                        // Delete access token, log in again
                        chrome.storage.sync.remove('KnurkdLoginToken',function() {
                            location.href = "login.html";
                            // return;
                        });
                     }
            	   });
               });
            });
          });
      },false);
      // Render username in HTML
      chrome.storage.sync.get('KnurkdLoginUsername', function (obj) {
        document.getElementById("uname").innerHTML = obj['KnurkdLoginUsername'];
      });
      // Define source of iframe dynamically
      chrome.storage.sync.get('KnurkdLoginToken', function (obj) {
        var token = obj['KnurkdLoginToken'];
        var source = "https://voice6-byld.rhcloud.com/";
        var iframeButton = document.getElementById('eyeframe');
        iframeButton.src = source;
      });
      var logoutButton = document.getElementById('logout');
      logoutButton.addEventListener('click', function() {
        chrome.tabs.getSelected(null, function(tab) {
            chrome.storage.sync.get('KnurkdLoginToken', function (obj) {
              var token = obj['KnurkdLoginToken']; 
              chrome.storage.sync.remove('KnurkdLoginToken',function() {
                chrome.storage.sync.remove('KnurkdLoginUsername',function() {
                  // Redirect to login page
                  console.log('Logged out!');
                  location.href = "login.html";
                  return;
                });
              });
            });
        });
      }, false);
    });
}, false);
