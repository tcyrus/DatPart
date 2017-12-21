var chromeos_server_app_id = chrome.runtime.getManifest().externally_connectable.ids[0];

var appip = "127.0.0.1";
var port = "9989";

function fakeDisable() {
	chrome.browserAction.setBadgeBackgroundColor({color: "red"});
	//chrome.browserAction.setPopup({popup: ""});
}

function fakeEnable() {
	chrome.browserAction.setBadgeBackgroundColor({color: "green"});
	chrome.browserAction.setPopup({popup: chrome.runtime.getManifest().browser_action.default_popup});
}

chrome.tabs.onActivated.addListener(function (tab) {
	console.log(tab);
	
		  chrome.tabs.query (
                { currentWindow: true, active: true }, 
                function(tabs) {
                    var activeTab = tabs[0];
                    console.log(JSON.stringify(activeTab));
					
					var currentURLRequest = document.createElement('a');
					currentURLRequest.href = activeTab.url;
					
					var currentTLD = currentURLRequest.hostname.split(".").pop();
					console.log(currentTLD);
					
				if (currentTLD != 'dat_site') {
					//chrome.browserAction.disable();
					fakeDisable();
				} else {
					//chrome.browserAction.enable();
					fakeEnable();
				}

      });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
	console.log(changeInfo); console.log(changeInfo.url);
	
					var currentURLRequest = document.createElement('a');
					currentURLRequest.href = changeInfo.url;
					
					var currentTLD = currentURLRequest.hostname.split(".").pop();
					console.log(currentTLD);
					
				if (currentTLD != 'dat_site') {
					//chrome.browserAction.disable();
					fakeDisable();
				} else {
					//chrome.browserAction.enable();
					fakeEnable();
				}

});

chrome.omnibox.onInputChanged.addListener(function(text, suggest) {
    console.log('inputChanged: ' + text);
    suggest([
      {content: text + " one", description: "the first one"},
      {content: text + " number two", description: "the second entry"}
    ]);
});

chrome.omnibox.onInputEntered.addListener(function(text) {
    console.log('inputEntered: ' + text);
	
});

chrome.webNavigation.onBeforeNavigate.addListener(function(details) {
	var currentURLRequest = document.createElement('a');
	currentURLRequest.href = details.url;
	var currentTLD = currentURLRequest.hostname.split(".").pop();
	var currentURLhostNoTLD = currentURLRequest.hostname.split(".")[0];

	if (currentTLD != 'dat_site') {
		//Do nothing
	  } else {
	    chrome.runtime.sendMessage(chromeos_server_app_id, { launch: true });
	    console.log('inputEntered: ' + details.url + "|" + currentTLD);
	  }
});
  
chrome.webRequest.onBeforeRequest.addListener(function(details) {
    var currentURLRequest = document.createElement('a');
	currentURLRequest.href = details.url;
	console.log(details.url);
	var currentTLD = currentURLRequest.hostname.split(".").pop();
	var currentURLhostNoTLD = currentURLRequest.hostname.split(".")[0];
	
	if (currentTLD != 'dat_site') {
		return;
	} else {
	//chrome.runtime.sendMessage(chromeos_server_app_id, { launch: true });
	};
	
	var dathost = currentURLRequest.hostname;
	var access = "PROXY";
	
	var config = {
		mode: "pac_script",
		pacScript: {
			data: "function FindProxyForURL(url, host) {\n" +
			"  if (dnsDomainIs(host, '"+dathost+"'))\n" +
			"    return '"+access+" "+appip+":"+port+"';\n" +
			"  return 'DIRECT';\n" +
			"}"
		}
	};
	
	chrome.proxy.settings.set({value: config, scope: 'regular'},function() {});
	console.log('IP '+appip+' for '+dathost+' found, config is changed: '+JSON.stringify(config));
	
	//var redirectBackup = "redirect.html#"+currentURLhostNoTLD;
    //return {cancel: true, redirectUrl: "redirect.html"};
}, {urls: ["*://*.dat_site/*"]}, ["blocking"]);

chrome.webRequest.onErrorOccurred.addListener(function(details)
{
    var currentURLRequest = document.createElement('a');
	currentURLRequest.href = details.url;
	var currentURLpage = currentURLRequest.pathname;
	var currentTLD = currentURLRequest.hostname.split(".").pop();
	var currentURLhostNoTLD = currentURLRequest.hostname.split(".")[0];
	
	if (currentTLD != 'dat_site') {
		return;
	} else {
		chrome.tabs.update(details.tabId, {url: "/dat_error.html?datHash="+currentURLhostNoTLD+"&path="+currentURLpage});
	}
},
{urls: ["*://*.dat_site/*"], types: ["main_frame"]});

chrome.webRequest.onErrorOccurred.addListener(function(details)
{
    var currentURLRequest = document.createElement('a');
	currentURLRequest.href = details.url;
	var currentTLD = currentURLRequest.hostname.split(".").pop();
	var currentURLhostNoTLD = currentURLRequest.hostname.split(".")[0];
	
	if (currentTLD != 'torrent_site') {
		return;
	} else {
		chrome.tabs.update(details.tabId, {url: "/torrent_error.html?torrentHash="+currentURLhostNoTLD});
	}
},
{urls: ["*://*.torrent_site/*"], types: ["main_frame"]});

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        console.log("This is a first install!");
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
    }
});

/*

Array.from(document.querySelectorAll('[href^="dat://"],[src^="dat://"]')).forEach(function(link){
});

*/