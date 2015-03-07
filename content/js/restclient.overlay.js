/* ***** BEGIN LICENSE BLOCK *****
Copyright (c) 2007-2012, Chao ZHOU (chao@zhou.fr). All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the author nor the names of its contributors may
      be used to endorse or promote products derived from this software
      without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * ***** END LICENSE BLOCK ***** */

"use strict";

restclient.overlay = {

  init : function() {
    restclient.init();
    restclient.overlay.firstRun();
  },
  getBrowser: function(){
    var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                           .getInterface(Components.interfaces.nsIWebNavigation)
                           .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                           .rootTreeItem
                           .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                           .getInterface(Components.interfaces.nsIDOMWindow);
    return mainWindow.gBrowser;
  },
  firstRun: function() {
    var versionNumber = "",
      currentVersion = restclient.getPref('version', '');

    if (versionNumber != currentVersion) { //install/upgrade
      for (var k in restclient.overlay.upgrades) {   
        if ((k === currentVersion) || (k && restclient.helper.vercmp(currentVersion, k))) {
          restclient.overlay.upgrades[k]();
          break;
        }
      }
      restclient.setPref('version', versionNumber);
    }
  },
  upgrades: {
    '': function() { //clean install
      var navbar = document.getElementById("nav-bar"),
        newset = navbar.currentSet + ',restclient-navbar-button';
      navbar.currentSet = newset;
      navbar.setAttribute("currentset", newset );
      document.persist("nav-bar", "currentset");
      restclient.setPref('defaultSkin', 'cerulean');
      restclient.setPref('enableCurl', true);
      restclient.setPref('taAutosize', true);
      restclient.setPref('requestTimer', true);
    },
    '2.1.0': function() { //RESTClient versioning
      restclient.deletePref('firstRunDone');
      restclient.sqlite.open();
      restclient.sqlite.db.executeSimpleSQL('DROP TABLE requests');
      restclient.sqlite.db.createTable('requests', restclient.sqlite.tables['requests']);
      restclient.sqlite.close();
    }
  },
  open: function(){
    var browser = restclient.overlay.getBrowser();
    browser.selectedTab = browser.addTab("chrome://restclient/content/restclient.html");
  }
}
window.addEventListener("load", function(){ restclient.overlay.init();  }, false);
window.addEventListener("unload", function(){ }, false);