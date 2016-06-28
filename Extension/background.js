$(function() {
 // Useless variables
 var ret_pass = "",
 datsun = "KNURLD" + location.href,
 token = "",
 uname = "",
 pword = "",
 not_login = false,
 passwordBoxes = null;
 var request_credentials = function(url, username, callback) {
  chrome.storage.local.get('KnurkdLoginToken', function (obj) {
    // alert(JSON.stringify(obj));
 	  token = obj['KnurkdLoginToken'];
 	  if (!token)
  	{	
  		// Not logged in, do nothing
  		callback();
  	}
    chrome.storage.local.get(datsun, function (obj) {
      site_accounts = obj[datsun];
      if(!site_accounts)
      {
        // Doesn't exist, callback
        // alert(JSON.stringify(obj));
        callback();
      }
      // alert(JSON.stringify(site_accounts));
      if(username in site_accounts)
      {
        uname = username;
        ret_pass = site_accounts[username];
        callback();
      }
      else
      {
        // Let callback handle addition of account to database
        callback();  
      }
    });
   });
 },
 process = function(callback) {
  uname = $("input[type=text]").not(passwordBoxes).filter(function() {
  var field = $(this);
   return field.val() || field.html();
  }).val(),
  pword = passwordBoxes.val();
  // No 'text' entry, try 'email' entry
  if(!uname){
    uname = $("input[type=email]").not(passwordBoxes).filter(function() {
      var field = $(this);
      return field.val() || field.html();
      }).val();
  }
  request_credentials(location.href, uname, callback);
 };

 $("form").submit(function(e) {
  var $this = $(this);
  passwordBoxes = $("input[type=password]");
  e.preventDefault();
  process(function() {
    // Not a user-account login, nvm
   if(not_login)
   {
     $this.unbind('submit');
     $this.submit();
     return;
   }
   // Password loaded from memory
   if(ret_pass)
   {
   	 // Decrypt and fill password
     var lol = CryptoJS.AES.decrypt(ret_pass, token).toString(CryptoJS.enc.Utf8);
     $("input[type=password]").val(lol);
   }
   // Password not saved yet,offer to save
   else if(token)
   {
      // Not a login form
      if((!uname) || (!pword))
      {
        $this.unbind('submit');
        $this.submit();
        return;
      }
   	  // Offer to save password if logged in
      var answer = false;
      answer = confirm('Save password?');
   	  if(answer)
   	  {
        chrome.storage.local.get(datsun, function (obj) {
          var theValue = {};
          // Initialize DB if doesn't exist
          if(!obj[datsun])
          {
            chrome.storage.local.set({datsun : {}});
          }
          // Update storage
          theValue = obj[datsun];
          // Encrypt password
          theValue[uname] = CryptoJS.AES.encrypt(pword, token).toString();
          // theValue[uname] = pword;
          chrome.storage.local.set({datsun : theValue}, function() {
            alert('Saved!');
            alert(theValue[uname]);
        });
      });
   	}
   }
   $this.unbind('submit');
   $this.submit();
  });
 });
});