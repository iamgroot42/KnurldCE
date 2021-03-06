$(function() {
 // Useless variables
 var ret_pass = "",
 datsun = "%KNURLD%" + String(location.href),
 token = "",
 uname = "",
 pword = "",
 not_login = false,
 passwordBoxes = null;
 var request_credentials = function( username, callback) {
  chrome.storage.sync.get('KnurkdLoginKey', function (obj) {
 	  token = obj['KnurkdLoginKey'];
 	  if (!token)
  	  {	
  		// Not logged in, do nothing
  		callback();
  	  }
    chrome.storage.sync.get(datsun.toString(), function (obj) {
      site_accounts = obj[datsun.toString()];
      if(!site_accounts)
      {
        // Doesn't exist, callback
        callback();
      }
      else
      {
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
  request_credentials(uname, callback);
 };

 $("form").submit(function(e) {
  var $this = $(this);
  e.preventDefault();
  $this.unbind('submit');
  passwordBoxes = $("input[type=password]");
  chrome.storage.sync.get('KnurkdLoginUsername', function (obj) {
      datsun = obj['KnurkdLoginUsername'] + datsun;
      process(function() {
      // Not a user-account login, nvm
      if(not_login)
      {
        // $this.unbind('submit');
        $this.submit();
        return;
      }
      // Password loaded from memory
      else if(ret_pass)
      {
   	    // Decrypt and fill password
        var lol = CryptoJS.AES.decrypt(ret_pass, token).toString(CryptoJS.enc.Utf8);
        $("input[type=password]").val(lol);
        alert("Auto-filled!");
        $this.submit();
        return;
      }
      // Password not saved yet,offer to save
      else if(token)
      {
          // Not a login form
          if((!uname) || (!pword))
          {
            // $this.unbind('submit');
            $this.submit();
            return;
          }
   	      // Offer to save password if logged in
          var answer = false;
          answer = confirm('Save password?');
   	      if(answer)
   	      {
   	  	     var dummy = {};
   	  	     dummy[datsun.toString()] = {"potato":"angel"};
   	  	     chrome.storage.sync.set(dummy, function(){
        	     chrome.storage.sync.get(datsun.toString(), function (obj) {
          	   var theValue = {};
          	   if(obj[datsun.toString()])
          	   {
	          	    // Update storage
          		    theValue = obj[datsun.toString()];
          	   }
          	   // Encrypt password
          	   theValue[uname] = CryptoJS.AES.encrypt(pword, token).toString();
          	   var theman = {};
          	   theman[datsun.toString()] = theValue;
          	   chrome.storage.sync.set(theman, function() {
	               alert('Saved!');
                 $this.submit();
                return;
        	     });
	           });
     	      });
   	      }
          else
          {
            $this.submit();
            return;
          }
        }
        else
        {
          $this.submit();
          return;
        }
        // $this.unbind('submit');
        // $this.submit();
      });
    });
  });
});
