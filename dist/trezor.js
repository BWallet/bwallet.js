!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.trezor=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var console = _dereq_('console'),
    extend = _dereq_('extend'),
    Promise = _dereq_('promise'),
    bowser = _dereq_('bowser'),
    deployJava = _dereq_('./deployJava');

// Try to load a applet with given options, returns promise. In case of
// rejection, err contains `installed` property.
module.exports.load = function (options) {
    var o = extend(options, {
        // name of the callback in the global namespace
        fname: '__bwalletAppletLoaded',
        // id of the applet element
        id: '__bwallet-applet',
        // time to wait until timeout, in msec
        timeout: 500
    });

    // if we know for sure that the applet is installed, timeout after
    // 10 seconds
    var installed = isInstalled(),
        timeout = installed ? 10000 : o.timeout;

    // if the applet is already loaded, use it
    var applet = document.getElementById(o.id);
    if (applet)
        return Promise.from(applet);

    // inject or reject after timeout
    return Promise.race([
        injectApplet(o.id, o.fname),
        rejectAfter(timeout, new Error('Loading timed out'))
    ]).catch(function (err) {
        err.installed = installed;
        throw err;
    }).then(
        function (applet) {
            console.log('[bwallet] Loaded applet ' + applet.version);
            return applet;
        },
        function (err) {
            console.error('[bwallet] Failed to load applet: ' + err.message);
            throw err;
        }
    );
};

// Injects the applet object into the page and waits until it loads.
function injectApplet(id, fname) {
    return new Promise(function (resolve, reject) {
        var body = document.getElementsByTagName('body')[0],
            elem = document.createElement('div');

        // register load function
        window[fname] = function () {
            var applet = document.getElementById(id);
            if (applet)
                resolve(applet);
            else
                reject(new Error('Applet not found'));
        }
        ;
        // inject object elem
        body.appendChild(elem);
        var html = "";
        if (bowser.browser.msie && bowser.version >= 11) {
        	html = 
        	'<embed id="'+id+'" '+
        		'archive="bwallet-applet-0.0.1.jar,hid4java-0.1.0.jar,jna-4.1.0.jar,jackson-annotations-2.3.0.jar,jackson-core-2.3.1.jar,jackson-databind-2.3.1.jar,protobuf-java-2.5.0.jar,protobuf-java-format-1.4-SNAPSHOT.jar,commons-codec-1.4.jar,commons-io-1.4.jar" '+
				'code="com/bdx/bwallet/applet/BWalletApplet.class" '+
				'codebase="jars" '+
				'width="1" height="1" '+
				'type="application/x-java-applet;version=1.6" '+
				'onload="'+fname+'" '+
				'pluginspage="http://java.sun.com/j2se/1.6.0/download.html" >'+
			'</embed>';
        } else {
        	html = 
        	'<object id="'+id+'" classid="java:com/bdx/bwallet/applet/BWalletApplet.class"'+
					'type="application/x-java-applet"'+
					'height="1" width="1" >'+
			    '<param name="code" value="com.bdx.bwallet.applet.BWalletApplet" />'+
			    '<param name="archive" value="bwallet-applet-0.0.1.jar,hid4java-0.1.0.jar,jna-4.1.0.jar,jackson-annotations-2.3.0.jar,jackson-core-2.3.1.jar,jackson-databind-2.3.1.jar,protobuf-java-2.5.0.jar,protobuf-java-format-1.4-SNAPSHOT.jar,commons-codec-1.4.jar,commons-io-1.4.jar" />'+
			    '<param name="codebase" value="data/jars" />'+
			    '<param name="persistState" value="false" />'+
			    '<param name="onload" value="'+fname+'" />'+
			'</object>';
        }
        elem.innerHTML = html;
    });
}

// If given timeout, gets rejected after n msec, otherwise never resolves.
function rejectAfter(msec, val) {
    return new Promise(function (resolve, reject) {
        if (msec > 0)
            setTimeout(function () { reject(val); }, msec);
    });
}

// Returns true if applet with a given mimetype is installed.
function isInstalled() {
    return deployJava.versionCheck("1.6+");
}

},{"./deployJava":2,"bowser":11,"console":17,"extend":29,"promise":31}],2:[function(_dereq_,module,exports){
var deployJava = function() {
    var l = {
        core: ["id", "class", "title", "style"],
        i18n: ["lang", "dir"],
        events: ["onclick", "ondblclick", "onmousedown", "onmouseup", "onmouseover", "onmousemove", "onmouseout", "onkeypress", "onkeydown", "onkeyup"],
        applet: ["codebase", "code", "name", "archive", "object", "width", "height", "alt", "align", "hspace", "vspace"],
        object: ["classid", "codebase", "codetype", "data", "type", "archive", "declare", "standby", "height", "width", "usemap", "name", "tabindex", "align", "border", "hspace", "vspace"]
    };
    var b = l.object.concat(l.core, l.i18n, l.events);
    var m = l.applet.concat(l.core);

    function g(o) {
        if (!d.debug) {
            return
        }
        if (console.log) {
            console.log(o)
        } else {
            alert(o)
        }
    }

    function k(p, o) {
        if (p == null || p.length == 0) {
            return true
        }
        var r = p.charAt(p.length - 1);
        if (r != "+" && r != "*" && (p.indexOf("_") != -1 && r != "_")) {
            p = p + "*";
            r = "*"
        }
        p = p.substring(0, p.length - 1);
        if (p.length > 0) {
            var q = p.charAt(p.length - 1);
            if (q == "." || q == "_") {
                p = p.substring(0, p.length - 1)
            }
        }
        if (r == "*") {
            return (o.indexOf(p) == 0)
        } else {
            if (r == "+") {
                return p <= o
            }
        }
        return false
    }

    function e() {
        var o = "//java.com/js/webstart.png";
        try {
            return document.location.protocol.indexOf("http") != -1 ? o : "http:" + o
        } catch (p) {
            return "http:" + o
        }
    }

    function n(p) {
        var o = "http://java.com/dt-redirect";
        if (p == null || p.length == 0) {
            return o
        }
        if (p.charAt(0) == "&") {
            p = p.substring(1, p.length)
        }
        return o + "?" + p
    }

    function j(q, p) {
        var o = q.length;
        for (var r = 0; r < o; r++) {
            if (q[r] === p) {
                return true
            }
        }
        return false
    }

    function c(o) {
        return j(m, o.toLowerCase())
    }

    function i(o) {
        return j(b, o.toLowerCase())
    }

    function a(o) {
        if ("MSIE" != deployJava.browserName) {
            return true
        }
        if (deployJava.compareVersionToPattern(deployJava.getPlugin().version, ["10", "0", "0"], false, true)) {
            return true
        }
        if (o == null) {
            return false
        }
        return !k("1.6.0_33+", o)
    }
    var d = {
        debug: null,
        version: "20120801",
        firefoxJavaVersion: null,
        myInterval: null,
        preInstallJREList: null,
        returnPage: null,
        brand: null,
        locale: null,
        installType: null,
        EAInstallEnabled: false,
        EarlyAccessURL: null,
        oldMimeType: "application/npruntime-scriptable-plugin;DeploymentToolkit",
        mimeType: "application/java-deployment-toolkit",
        launchButtonPNG: e(),
        browserName: null,
        browserName2: null,
        getJREs: function() {
            var t = new Array();
            if (this.isPluginInstalled()) {
                var r = this.getPlugin();
                var o = r.jvms;
                for (var q = 0; q < o.getLength(); q++) {
                    t[q] = o.get(q).version
                }
            } else {
                var p = this.getBrowser();
                if (p == "MSIE") {
                    if (this.testUsingActiveX("1.7.0")) {
                        t[0] = "1.7.0"
                    } else {
                        if (this.testUsingActiveX("1.6.0")) {
                            t[0] = "1.6.0"
                        } else {
                            if (this.testUsingActiveX("1.5.0")) {
                                t[0] = "1.5.0"
                            } else {
                                if (this.testUsingActiveX("1.4.2")) {
                                    t[0] = "1.4.2"
                                } else {
                                    if (this.testForMSVM()) {
                                        t[0] = "1.1"
                                    }
                                }
                            }
                        }
                    }
                } else {
                    if (p == "Netscape Family") {
                        this.getJPIVersionUsingMimeType();
                        if (this.firefoxJavaVersion != null) {
                            t[0] = this.firefoxJavaVersion
                        } else {
                            if (this.testUsingMimeTypes("1.7")) {
                                t[0] = "1.7.0"
                            } else {
                                if (this.testUsingMimeTypes("1.6")) {
                                    t[0] = "1.6.0"
                                } else {
                                    if (this.testUsingMimeTypes("1.5")) {
                                        t[0] = "1.5.0"
                                    } else {
                                        if (this.testUsingMimeTypes("1.4.2")) {
                                            t[0] = "1.4.2"
                                        } else {
                                            if (this.browserName2 == "Safari") {
                                                if (this.testUsingPluginsArray("1.7.0")) {
                                                    t[0] = "1.7.0"
                                                } else {
                                                    if (this.testUsingPluginsArray("1.6")) {
                                                        t[0] = "1.6.0"
                                                    } else {
                                                        if (this.testUsingPluginsArray("1.5")) {
                                                            t[0] = "1.5.0"
                                                        } else {
                                                            if (this.testUsingPluginsArray("1.4.2")) {
                                                                t[0] = "1.4.2"
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (this.debug) {
                for (var q = 0; q < t.length; ++q) {
                    g("[getJREs()] We claim to have detected Java SE " + t[q])
                }
            }
            return t
        },
        installJRE: function(r, p) {
            var o = false;
            if (this.isPluginInstalled() && this.isAutoInstallEnabled(r)) {
                var q = false;
                if (this.isCallbackSupported()) {
                    q = this.getPlugin().installJRE(r, p)
                } else {
                    q = this.getPlugin().installJRE(r)
                }
                if (q) {
                    this.refresh();
                    if (this.returnPage != null) {
                        document.location = this.returnPage
                    }
                }
                return q
            } else {
                return this.installLatestJRE()
            }
        },
        isAutoInstallEnabled: function(o) {
            if (!this.isPluginInstalled()) {
                return false
            }
            if (typeof o == "undefined") {
                o = null
            }
            return a(o)
        },
        isCallbackSupported: function() {
            return this.isPluginInstalled() && this.compareVersionToPattern(this.getPlugin().version, ["10", "2", "0"], false, true)
        },
        installLatestJRE: function(q) {
            if (this.isPluginInstalled() && this.isAutoInstallEnabled()) {
                var r = false;
                if (this.isCallbackSupported()) {
                    r = this.getPlugin().installLatestJRE(q)
                } else {
                    r = this.getPlugin().installLatestJRE()
                }
                if (r) {
                    this.refresh();
                    if (this.returnPage != null) {
                        document.location = this.returnPage
                    }
                }
                return r
            } else {
                var p = this.getBrowser();
                var o = navigator.platform.toLowerCase();
                if ((this.EAInstallEnabled == "true") && (o.indexOf("win") != -1) && (this.EarlyAccessURL != null)) {
                    this.preInstallJREList = this.getJREs();
                    if (this.returnPage != null) {
                        this.myInterval = setInterval("deployJava.poll()", 3000)
                    }
                    location.href = this.EarlyAccessURL;
                    return false
                } else {
                    if (p == "MSIE") {
                        return this.IEInstall()
                    } else {
                        if ((p == "Netscape Family") && (o.indexOf("win32") != -1)) {
                            return this.FFInstall()
                        } else {
                            location.href = n(((this.returnPage != null) ? ("&returnPage=" + this.returnPage) : "") + ((this.locale != null) ? ("&locale=" + this.locale) : "") + ((this.brand != null) ? ("&brand=" + this.brand) : ""))
                        }
                    }
                    return false
                }
            }
        },
        runApplet: function(p, u, r) {
            if (r == "undefined" || r == null) {
                r = "1.1"
            }
            var t = "^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$";
            var o = r.match(t);
            if (this.returnPage == null) {
                this.returnPage = document.location
            }
            if (o != null) {
                var q = this.getBrowser();
                if (q != "?") {
                    if (this.versionCheck(r + "+")) {
                        this.writeAppletTag(p, u)
                    } else {
                        if (this.installJRE(r + "+")) {
                            this.refresh();
                            location.href = document.location;
                            this.writeAppletTag(p, u)
                        }
                    }
                } else {
                    this.writeAppletTag(p, u)
                }
            } else {
                g("[runApplet()] Invalid minimumVersion argument to runApplet():" + r)
            }
        },
        writeAppletTag: function(r, w) {
            var o = "<" + "applet ";
            var q = "";
            var t = "<" + "/" + "applet" + ">";
            var x = true;
            if (null == w || typeof w != "object") {
                w = new Object()
            }
            for (var p in r) {
                if (!c(p)) {
                    w[p] = r[p]
                } else {
                    o += (" " + p + '="' + r[p] + '"');
                    if (p == "code") {
                        x = false
                    }
                }
            }
            var v = false;
            for (var u in w) {
                if (u == "codebase_lookup") {
                    v = true
                }
                if (u == "object" || u == "java_object" || u == "java_code") {
                    x = false
                }
                q += '<param name="' + u + '" value="' + w[u] + '"/>'
            }
            if (!v) {
                q += '<param name="codebase_lookup" value="false"/>'
            }
            if (x) {
                o += (' code="dummy"')
            }
            o += ">";
            document.write(o + "\n" + q + "\n" + t)
        },
        versionCheck: function(p) {
            var v = 0;
            var x = "^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?(\\*|\\+)?$";
            var y = p.match(x);
            if (y != null) {
                var r = false;
                var u = false;
                var q = new Array();
                for (var t = 1; t < y.length; ++t) {
                    if ((typeof y[t] == "string") && (y[t] != "")) {
                        q[v] = y[t];
                        v++
                    }
                }
                if (q[q.length - 1] == "+") {
                    u = true;
                    r = false;
                    q.length--
                } else {
                    if (q[q.length - 1] == "*") {
                        u = false;
                        r = true;
                        q.length--
                    } else {
                        if (q.length < 4) {
                            u = false;
                            r = true
                        }
                    }
                }
                var w = this.getJREs();
                for (var t = 0; t < w.length; ++t) {
                    if (this.compareVersionToPattern(w[t], q, r, u)) {
                        return true
                    }
                }
                return false
            } else {
                var o = "Invalid versionPattern passed to versionCheck: " + p;
                g("[versionCheck()] " + o);
                alert(o);
                return false
            }
        },
        isWebStartInstalled: function(r) {
            var q = this.getBrowser();
            if (q == "?") {
                return true
            }
            if (r == "undefined" || r == null) {
                r = "1.4.2"
            }
            var p = false;
            var t = "^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$";
            var o = r.match(t);
            if (o != null) {
                p = this.versionCheck(r + "+")
            } else {
                g("[isWebStartInstaller()] Invalid minimumVersion argument to isWebStartInstalled(): " + r);
                p = this.versionCheck("1.4.2+")
            }
            return p
        },
        getJPIVersionUsingMimeType: function() {
            for (var p = 0; p < navigator.mimeTypes.length; ++p) {
                var q = navigator.mimeTypes[p].type;
                var o = q.match(/^application\/x-java-applet;jpi-version=(.*)$/);
                if (o != null) {
                    this.firefoxJavaVersion = o[1];
                    if ("Opera" != this.browserName2) {
                        break
                    }
                }
            }
        },
        launchWebStartApplication: function(r) {
            var o = navigator.userAgent.toLowerCase();
            this.getJPIVersionUsingMimeType();
            if (this.isWebStartInstalled("1.7.0") == false) {
                if ((this.installJRE("1.7.0+") == false) || ((this.isWebStartInstalled("1.7.0") == false))) {
                    return false
                }
            }
            var u = null;
            if (document.documentURI) {
                u = document.documentURI
            }
            if (u == null) {
                u = document.URL
            }
            var p = this.getBrowser();
            var q;
            if (p == "MSIE") {
                q = "<" + 'object classid="clsid:8AD9C840-044E-11D1-B3E9-00805F499D93" ' + 'width="0" height="0">' + "<" + 'PARAM name="launchjnlp" value="' + r + '"' + ">" + "<" + 'PARAM name="docbase" value="' + u + '"' + ">" + "<" + "/" + "object" + ">"
            } else {
                if (p == "Netscape Family") {
                    q = "<" + 'embed type="application/x-java-applet;jpi-version=' + this.firefoxJavaVersion + '" ' + 'width="0" height="0" ' + 'launchjnlp="' + r + '"' + 'docbase="' + u + '"' + " />"
                }
            }
            if (document.body == "undefined" || document.body == null) {
                document.write(q);
                document.location = u
            } else {
                var t = document.createElement("div");
                t.id = "div1";
                t.style.position = "relative";
                t.style.left = "-10000px";
                t.style.margin = "0px auto";
                t.className = "dynamicDiv";
                t.innerHTML = q;
                document.body.appendChild(t)
            }
        },
        createWebStartLaunchButtonEx: function(q, p) {
            if (this.returnPage == null) {
                this.returnPage = q
            }
            var o = "javascript:deployJava.launchWebStartApplication('" + q + "');";
            document.write("<" + 'a href="' + o + "\" onMouseOver=\"window.status=''; " + 'return true;"><' + "img " + 'src="' + this.launchButtonPNG + '" ' + 'border="0" /><' + "/" + "a" + ">")
        },
        createWebStartLaunchButton: function(q, p) {
            if (this.returnPage == null) {
                this.returnPage = q
            }
            var o = "javascript:" + "if (!deployJava.isWebStartInstalled(&quot;" + p + "&quot;)) {" + "if (deployJava.installLatestJRE()) {" + "if (deployJava.launch(&quot;" + q + "&quot;)) {}" + "}" + "} else {" + "if (deployJava.launch(&quot;" + q + "&quot;)) {}" + "}";
            document.write("<" + 'a href="' + o + "\" onMouseOver=\"window.status=''; " + 'return true;"><' + "img " + 'src="' + this.launchButtonPNG + '" ' + 'border="0" /><' + "/" + "a" + ">")
        },
        launch: function(o) {
            document.location = o;
            return true
        },
        isPluginInstalled: function() {
            var o = this.getPlugin();
            if (o && o.jvms) {
                return true
            } else {
                return false
            }
        },
        isAutoUpdateEnabled: function() {
            if (this.isPluginInstalled()) {
                return this.getPlugin().isAutoUpdateEnabled()
            }
            return false
        },
        setAutoUpdateEnabled: function() {
            if (this.isPluginInstalled()) {
                return this.getPlugin().setAutoUpdateEnabled()
            }
            return false
        },
        setInstallerType: function(o) {
            this.installType = o;
            if (this.isPluginInstalled()) {
                return this.getPlugin().setInstallerType(o)
            }
            return false
        },
        setAdditionalPackages: function(o) {
            if (this.isPluginInstalled()) {
                return this.getPlugin().setAdditionalPackages(o)
            }
            return false
        },
        setEarlyAccess: function(o) {
            this.EAInstallEnabled = o
        },
        isPlugin2: function() {
            if (this.isPluginInstalled()) {
                if (this.versionCheck("1.6.0_10+")) {
                    try {
                        return this.getPlugin().isPlugin2()
                    } catch (o) {}
                }
            }
            return false
        },
        allowPlugin: function() {
            this.getBrowser();
            var o = ("Safari" != this.browserName2 && "Opera" != this.browserName2);
            return o
        },
        getPlugin: function() {
            this.refresh();
            var o = null;
            if (this.allowPlugin()) {
                o = document.getElementById("deployJavaPlugin")
            }
            return o
        },
        compareVersionToPattern: function(v, p, r, t) {
            if (v == undefined || p == undefined) {
                return false
            }
            var w = "^(\\d+)(?:\\.(\\d+)(?:\\.(\\d+)(?:_(\\d+))?)?)?$";
            var x = v.match(w);
            if (x != null) {
                var u = 0;
                var y = new Array();
                for (var q = 1; q < x.length; ++q) {
                    if ((typeof x[q] == "string") && (x[q] != "")) {
                        y[u] = x[q];
                        u++
                    }
                }
                var o = Math.min(y.length, p.length);
                if (t) {
                    for (var q = 0; q < o; ++q) {
                        if (y[q] < p[q]) {
                            return false
                        } else {
                            if (y[q] > p[q]) {
                                return true
                            }
                        }
                    }
                    return true
                } else {
                    for (var q = 0; q < o; ++q) {
                        if (y[q] != p[q]) {
                            return false
                        }
                    }
                    if (r) {
                        return true
                    } else {
                        return (y.length == p.length)
                    }
                }
            } else {
                return false
            }
        },
        getBrowser: function() {
            if (this.browserName == null) {
                var o = navigator.userAgent.toLowerCase();
                g("[getBrowser()] navigator.userAgent.toLowerCase() -> " + o);
                if ((o.indexOf("msie") != -1) && (o.indexOf("opera") == -1)) {
                    this.browserName = "MSIE";
                    this.browserName2 = "MSIE"
                } else {
                    if (o.indexOf("trident") != -1 || o.indexOf("Trident") != -1) {
                        this.browserName = "MSIE";
                        this.browserName2 = "MSIE"
                    } else {
                        if (o.indexOf("iphone") != -1) {
                            this.browserName = "Netscape Family";
                            this.browserName2 = "iPhone"
                        } else {
                            if ((o.indexOf("firefox") != -1) && (o.indexOf("opera") == -1)) {
                                this.browserName = "Netscape Family";
                                this.browserName2 = "Firefox"
                            } else {
                                if (o.indexOf("chrome") != -1) {
                                    this.browserName = "Netscape Family";
                                    this.browserName2 = "Chrome"
                                } else {
                                    if (o.indexOf("safari") != -1) {
                                        this.browserName = "Netscape Family";
                                        this.browserName2 = "Safari"
                                    } else {
                                        if ((o.indexOf("mozilla") != -1) && (o.indexOf("opera") == -1)) {
                                            this.browserName = "Netscape Family";
                                            this.browserName2 = "Other"
                                        } else {
                                            if (o.indexOf("opera") != -1) {
                                                this.browserName = "Netscape Family";
                                                this.browserName2 = "Opera"
                                            } else {
                                                this.browserName = "?";
                                                this.browserName2 = "unknown"
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                g("[getBrowser()] Detected browser name:" + this.browserName + ", " + this.browserName2)
            }
            return this.browserName
        },
        testUsingActiveX: function(o) {
            var q = "JavaWebStart.isInstalled." + o + ".0";
            if (typeof ActiveXObject == "undefined" || !ActiveXObject) {
                g("[testUsingActiveX()] Browser claims to be IE, but no ActiveXObject object?");
                return false
            }
            try {
                return (new ActiveXObject(q) != null)
            } catch (p) {
                return false
            }
        },
        testForMSVM: function() {
            var p = "{08B0E5C0-4FCB-11CF-AAA5-00401C608500}";
            if (typeof oClientCaps != "undefined") {
                var o = oClientCaps.getComponentVersion(p, "ComponentID");
                if ((o == "") || (o == "5,0,5000,0")) {
                    return false
                } else {
                    return true
                }
            } else {
                return false
            }
        },
        testUsingMimeTypes: function(p) {
            if (!navigator.mimeTypes) {
                g("[testUsingMimeTypes()] Browser claims to be Netscape family, but no mimeTypes[] array?");
                return false
            }
            for (var q = 0; q < navigator.mimeTypes.length; ++q) {
                s = navigator.mimeTypes[q].type;
                var o = s.match(/^application\/x-java-applet\x3Bversion=(1\.8|1\.7|1\.6|1\.5|1\.4\.2)$/);
                if (o != null) {
                    if (this.compareVersions(o[1], p)) {
                        return true
                    }
                }
            }
            return false
        },
        testUsingPluginsArray: function(p) {
            if ((!navigator.plugins) || (!navigator.plugins.length)) {
                return false
            }
            var o = navigator.platform.toLowerCase();
            for (var q = 0; q < navigator.plugins.length; ++q) {
                s = navigator.plugins[q].description;
                if (s.search(/^Java Switchable Plug-in (Cocoa)/) != -1) {
                    if (this.compareVersions("1.5.0", p)) {
                        return true
                    }
                } else {
                    if (s.search(/^Java/) != -1) {
                        if (o.indexOf("win") != -1) {
                            if (this.compareVersions("1.5.0", p) || this.compareVersions("1.6.0", p)) {
                                return true
                            }
                        }
                    }
                }
            }
            if (this.compareVersions("1.5.0", p)) {
                return true
            }
            return false
        },
        IEInstall: function() {
            location.href = n(((this.returnPage != null) ? ("&returnPage=" + this.returnPage) : "") + ((this.locale != null) ? ("&locale=" + this.locale) : "") + ((this.brand != null) ? ("&brand=" + this.brand) : ""));
            return false
        },
        done: function(p, o) {},
        FFInstall: function() {
            location.href = n(((this.returnPage != null) ? ("&returnPage=" + this.returnPage) : "") + ((this.locale != null) ? ("&locale=" + this.locale) : "") + ((this.brand != null) ? ("&brand=" + this.brand) : "") + ((this.installType != null) ? ("&type=" + this.installType) : ""));
            return false
        },
        compareVersions: function(r, t) {
            var p = r.split(".");
            var o = t.split(".");
            for (var q = 0; q < p.length; ++q) {
                p[q] = Number(p[q])
            }
            for (var q = 0; q < o.length; ++q) {
                o[q] = Number(o[q])
            }
            if (p.length == 2) {
                p[2] = 0
            }
            if (p[0] > o[0]) {
                return true
            }
            if (p[0] < o[0]) {
                return false
            }
            if (p[1] > o[1]) {
                return true
            }
            if (p[1] < o[1]) {
                return false
            }
            if (p[2] > o[2]) {
                return true
            }
            if (p[2] < o[2]) {
                return false
            }
            return true
        },
        enableAlerts: function() {
            this.browserName = null;
            this.debug = true
        },
        poll: function() {
            this.refresh();
            var o = this.getJREs();
            if ((this.preInstallJREList.length == 0) && (o.length != 0)) {
                clearInterval(this.myInterval);
                if (this.returnPage != null) {
                    location.href = this.returnPage
                }
            }
            if ((this.preInstallJREList.length != 0) && (o.length != 0) && (this.preInstallJREList[0] != o[0])) {
                clearInterval(this.myInterval);
                if (this.returnPage != null) {
                    location.href = this.returnPage
                }
            }
        },
        writePluginTag: function() {
            var o = this.getBrowser();
            if (o == "MSIE") {
                document.write("<" + 'object classid="clsid:CAFEEFAC-DEC7-0000-0001-ABCDEFFEDCBA" ' + 'id="deployJavaPlugin" width="0" height="0">' + "<" + "/" + "object" + ">")
            } else {
                if (o == "Netscape Family" && this.allowPlugin()) {
                    this.writeEmbedTag()
                }
            }
        },
        refresh: function() {
            navigator.plugins.refresh(false);
            var o = this.getBrowser();
            if (o == "Netscape Family" && this.allowPlugin()) {
                var p = document.getElementById("deployJavaPlugin");
                if (p == null) {
                    this.writeEmbedTag()
                }
            }
        },
        writeEmbedTag: function() {
			/*
            var o = false;
            if (navigator.mimeTypes != null) {
                for (var p = 0; p < navigator.mimeTypes.length; p++) {
                    if (navigator.mimeTypes[p].type == this.mimeType) {
                        if (navigator.mimeTypes[p].enabledPlugin) {
                            document.write("<" + 'embed id="deployJavaPlugin" type="' + this.mimeType + '" hidden="true" />');
                            o = true
                        }
                    }
                }
                if (!o) {
                    for (var p = 0; p < navigator.mimeTypes.length; p++) {
                        if (navigator.mimeTypes[p].type == this.oldMimeType) {
                            if (navigator.mimeTypes[p].enabledPlugin) {
                                document.write("<" + 'embed id="deployJavaPlugin" type="' + this.oldMimeType + '" hidden="true" />')
                            }
                        }
                    }
                }
            }
			*/
        }
    };
    d.writePluginTag();
    if (d.locale == null) {
        var h = null;
        if (h == null) {
            try {
                h = navigator.userLanguage
            } catch (f) {}
        }
        if (h == null) {
            try {
                h = navigator.systemLanguage
            } catch (f) {}
        }
        if (h == null) {
            try {
                h = navigator.language
            } catch (f) {}
        }
        if (h != null) {
            h.replace("-", "_");
            d.locale = h
        }
    }
    return d
}();

module.exports = deployJava;
},{}],3:[function(_dereq_,module,exports){
var Promise = _dereq_('promise'),
    request = _dereq_('browser-request');

function promiseRequest(options, payload) {
    return new Promise(function (resolve, reject) {
        request(options, function (err, response, body) {
            if (err) {
                reject(err);
                return;
            }

            if (response.statusCode !== 200) {
                if (body && body.error) {
                    err = new Error(body.error);
                } else {
                    err = new Error('Request failed with status '
                                    + response.statusCode);
                }
                reject(err);
            }

            resolve(body);
        });
    });
}

module.exports = promiseRequest;

},{"browser-request":12,"promise":31}],4:[function(_dereq_,module,exports){
'use strict';

// interface Transport {
//
//     function configure(String config) -> Promise()
//
//     function enumerate(Boolean wait) -> Promise([{
//         String path
//         String vendor
//         String product
//         String serialNumber
//         String session
//     }] devices)
//
//     function acquire(String path) -> Promise(String session)
//
//     function release(String session) -> Promise()
//
//     function call(String session, String name, Object data) -> Promise({
//         String name,
//         Object data,
//     })
//
// }

module.exports = {
    HttpTransport: _dereq_('./transport/http'),
    PluginTransport: _dereq_('./transport/plugin'),
    AppletTransport: _dereq_('./transport/applet'),
    Session: _dereq_('./session'),
    installers: _dereq_('./installers'),
    plugin: _dereq_('./plugin'),
    http: _dereq_('./http')
};

},{"./http":3,"./installers":5,"./plugin":6,"./session":7,"./transport/applet":8,"./transport/http":9,"./transport/plugin":10}],5:[function(_dereq_,module,exports){
// var BRIDGE_VERSION_URL = '/data/bridge/latest.txt',
//     BRIDGE_INSTALLERS = [{
//         url: '/data/bridge/%version%/trezor-bridge-%version%-win64.msi',
//         label: 'Windows 64-bit',
//         platform: 'win64'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge-%version%-win32.msi',
//         label: 'Windows 32-bit',
//         platform: 'win32'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge-%version%.pkg',
//         label: 'Mac OS X',
//         platform: 'mac'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge_%version%_amd64.deb',
//         label: 'Linux 64-bit (deb)',
//         platform: 'deb64'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge-%version%-1.x86_64.rpm',
//         label: 'Linux 64-bit (rpm)',
//         platform: 'rpm64'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge_%version%_i386.deb',
//         label: 'Linux 32-bit (deb)',
//         platform: 'deb32'
//     }, {
//         url: '/data/bridge/%version%/trezor-bridge-%version%-1.i386.rpm',
//         label: 'Linux 32-bit (rpm)',
//         platform: 'rpm32'
//     }];

var BRIDGE_VERSION_URL = '/data/plugin/latest.txt',
    BRIDGE_INSTALLERS = [{
        url: '/data/plugin/%version%/BitcoinTrezorPlugin-%version%.msi',
        label: 'Windows',
        platform: ['win32', 'win64']
    }, {
        url: '/data/plugin/%version%/trezor-plugin-%version%.dmg',
        label: 'Mac OS X',
        platform: 'mac'
    }, {
        url: '/data/plugin/%version%/browser-plugin-trezor_%version%_amd64.deb',
        label: 'Linux x86_64 (deb)',
        platform: 'deb64'
    }, {
        url: '/data/plugin/%version%/browser-plugin-trezor-%version%.x86_64.rpm',
        label: 'Linux x86_64 (rpm)',
        platform: 'rpm64'
    }, {
        url: '/data/plugin/%version%/browser-plugin-trezor_%version%_i386.deb',
        label: 'Linux i386 (deb)',
        platform: 'deb32'
    }, {
        url: '/data/plugin/%version%/browser-plugin-trezor-%version%.i386.rpm',
        label: 'Linux i386 (rpm)',
        platform: 'rpm32'
    }];

// Returns a list of bridge installers, with download URLs and a mark on
// bridge preferred for the user's platform.
function installers(options) {
    var o = options || {},
        bridgeUrl = o.bridgeUrl || BRIDGE_VERSION_URL,
        version = o.version || requestUri(bridgeUrl).trim(),
        platform = o.platform || preferredPlatform();

    return BRIDGE_INSTALLERS.map(function (bridge) {
        return {
            version: version,
            url: bridge.url.replace(/%version%/g, version),
            label: bridge.label,
            platform: bridge.platform,
            preferred: isPreferred(bridge.platform)
        };
    });

    function isPreferred(installer) {
        if (typeof installer === 'string') { // single platform
            return installer === platform;
        } else { // any of multiple platforms
            for (var i = 0; i < installer.length; i++) {
                if (installer[i] === platform) {
                    return true;
                }
            }
            return false;
        }
    }
};

function preferredPlatform() {
    var ver = navigator.userAgent;

    if (ver.match(/Win64|WOW64/)) return 'win64';
    if (ver.match(/Win/)) return 'win32';
    if (ver.match(/Mac/)) return 'mac';
    if (ver.match(/Linux i[3456]86/))
        return ver.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/)
            ? 'rpm32' : 'deb32';
    if (ver.match(/Linux/))
        return ver.match(/CentOS|Fedora|Mandriva|Mageia|Red Hat|Scientific|SUSE/)
            ? 'rpm64' : 'deb64';
}

function requestUri(url) {
    var req = new XMLHttpRequest();

    req.open('get', url, false);
    req.send();

    if (req.status !== 200)
        throw new Error('Failed to GET ' + url);

    return req.responseText;
}

module.exports = installers;

},{}],6:[function(_dereq_,module,exports){
'use strict';

var console = _dereq_('console'),
    extend = _dereq_('extend'),
    Promise = _dereq_('promise');

// Try to load a plugin with given options, returns promise. In case of
// rejection, err contains `installed` property.
module.exports.load = function (options) {
    var o = extend(options, {
        // mimetype of the plugin
        mimetype: 'application/x-bitcointrezorplugin',
        // name of the callback in the global namespace
        fname: '__trezorPluginLoaded',
        // id of the plugin element
        id: '__trezor-plugin',
        // time to wait until timeout, in msec
        timeout: 500
    });

    // if we know for sure that the plugin is installed, timeout after
    // 10 seconds
    var installed = isInstalled(o.mimetype),
        timeout = installed ? 10000 : o.timeout;

    // if the plugin is already loaded, use it
    var plugin = document.getElementById(o.id);
    if (plugin)
        return Promise.from(plugin);

    // inject or reject after timeout
    return Promise.race([
        injectPlugin(o.id, o.mimetype, o.fname),
        rejectAfter(timeout, new Error('Loading timed out'))
    ]).catch(function (err) {
        err.installed = installed;
        throw err;
    }).then(
        function (plugin) {
            console.log('[trezor] Loaded plugin ' + plugin.version);
            return plugin;
        },
        function (err) {
            console.error('[trezor] Failed to load plugin: ' + err.message);
            throw err;
        }
    );
};

// Injects the plugin object into the page and waits until it loads.
function injectPlugin(id, mimetype, fname) {
    return new Promise(function (resolve, reject) {
        var body = document.getElementsByTagName('body')[0],
            elem = document.createElement('div');

        // register load function
        window[fname] = function () {
            var plugin = document.getElementById(id);
            if (plugin)
                resolve(plugin);
            else
                reject(new Error('Plugin not found'));
        };

        // inject object elem
        body.appendChild(elem);
        elem.innerHTML =
            '<object width="1" height="1" id="'+id+'" type="'+mimetype+'">'+
            ' <param name="onload" value="'+fname+'" />'+
            '</object>';
    });
}

// If given timeout, gets rejected after n msec, otherwise never resolves.
function rejectAfter(msec, val) {
    return new Promise(function (resolve, reject) {
        if (msec > 0)
            setTimeout(function () { reject(val); }, msec);
    });
}

// Returns true if plugin with a given mimetype is installed.
function isInstalled(mimetype) {
    navigator.plugins.refresh(false);
    return !!navigator.mimeTypes[mimetype];
}

},{"console":17,"extend":29,"promise":31}],7:[function(_dereq_,module,exports){
'use strict';

var util = _dereq_('util'),
    extend = _dereq_('extend'),
    unorm = _dereq_('unorm'),
    crypto = _dereq_('crypto'),
    Promise = _dereq_('promise'),
    EventEmitter = _dereq_('events').EventEmitter;

//
// Trezor device session handle. Acts as a event emitter.
//
// Events:
//
//  send: type, message
//  receive: type, message
//  error: error
//
//  button: code
//  pin: type, callback(error, pin)
//  word: callback(error, word)
//  passphrase: callback(error, passphrase)
//
var Session = function (transport, sessionId) {
    this._transport = transport;
    this._sessionId = sessionId;
    this._emitter = this; // TODO: get emitter as a param
};

util.inherits(Session, EventEmitter);

Session.prototype.release = function () {
    console.log('[trezor] Releasing session');
    return this._transport.release(this._sessionId);
};

Session.prototype.initialize = function () {
    return this._typedCommonCall('Initialize', 'Features');
};

Session.prototype.getEntropy = function (size) {
    return this._typedCommonCall('GetEntropy', 'Entropy', {
        size: size
    });
};

Session.prototype.getAddress = function (address_n, coin, show_display) {
    return this._typedCommonCall('GetAddress', 'Address', {
        address_n: address_n,
        coin_name: coin.coin_name,
        show_display: !!show_display
    }).then(function (res) {
        res.message.path = address_n || [];
        return res;
    });
};

Session.prototype.getPublicKey = function (address_n) {
    return this._typedCommonCall('GetPublicKey', 'PublicKey', {
        address_n: address_n
    }).then(function (res) {
        res.message.node.path = address_n || [];
        return res;
    });
};

Session.prototype.wipeDevice = function () {
    return this._commonCall('WipeDevice');
};

Session.prototype.resetDevice = function (settings) {
    return this._commonCall('ResetDevice', settings);
};

Session.prototype.loadDevice = function (settings) {
    return this._commonCall('LoadDevice', settings);
};

Session.prototype.recoverDevice = function (settings) {
    return this._commonCall('RecoveryDevice', settings);
};

Session.prototype.applySettings = function (settings) {
    return this._commonCall('ApplySettings', settings);
};

Session.prototype.changePin = function (remove) {
    return this._commonCall('ChangePin', {
        remove: remove || false
    });
};

Session.prototype.eraseFirmware = function () {
    return this._commonCall('FirmwareErase');
};

Session.prototype.uploadFirmware = function (payload) {
    return this._commonCall('FirmwareUpload', {
        payload: payload
    });
};

Session.prototype.verifyMessage = function (address, signature, message) {
    return this._commonCall('VerifyMessage', {
        address: address,
        signature: signature,
        message: message
    });
};

Session.prototype.signMessage = function (address_n, message, coin) {
    return this._typedCommonCall('SignMessage', 'MessageSignature', {
        address_n: address_n,
        message: message,
        coin_name: coin.coin_name
    });
};

Session.prototype.measureTx = function (inputs, outputs, coin) {
    return this._typedCommonCall('EstimateTxSize', 'TxSize', {
        inputs_count: inputs.length,
        outputs_count: outputs.length,
        coin_name: coin.coin_name
    });
};

Session.prototype.simpleSignTx = function (inputs, outputs, txs, coin) {
    return this._typedCommonCall('SimpleSignTx', 'TxRequest', {
        inputs: inputs,
        outputs: outputs,
        coin_name: coin.coin_name,
        transactions: txs
    });
};

Session.prototype._indexTxsForSign = function (inputs, outputs, txs) {
    var index = {};

    // Tx being signed
    index[''] = {
        inputs: inputs,
        outputs: outputs
    };

    // Referenced txs
    txs.forEach(function (tx) {
        index[tx.hash.toLowerCase()] = tx;
    });

    return index;
};

Session.prototype.signTx = function (inputs, outputs, txs, coin) {
    var self = this,
        index = this._indexTxsForSign(inputs, outputs, txs),
        signatures = [],
        serializedTx = '';

    return this._typedCommonCall('SignTx', 'TxRequest', {
        inputs_count: inputs.length,
        outputs_count: outputs.length,
        coin_name: coin.coin_name
    }).then(process);

    function process(res) {
        var m = res.message,
            ms = m.serialized,
            md = m.details,
            reqTx, resTx;

        if (ms && ms.serialized_tx != null)
            serializedTx += ms.serialized_tx;
        if (ms && ms.signature_index != null)
            signatures[ms.signature_index] = ms.signature;

        if (m.request_type === 'TXFINISHED')
            return { // same format as SimpleSignTx
                message: {
                    serialized: {
                        signatures: signatures,
                        serialized_tx: serializedTx
                    }
                }
            };

        resTx = {};
        reqTx = index[(md.tx_hash || '').toLowerCase()];

        if (!reqTx)
            throw new Error(md.tx_hash
                            ? ('Requested unknown tx: ' + md.tx_hash)
                            : ('Requested tx for signing not indexed')
                           );

        switch (m.request_type) {

        case 'TXINPUT':
            resTx.inputs = [reqTx.inputs[+md.request_index]];
            break;

        case 'TXOUTPUT':
            if (md.tx_hash)
                resTx.bin_outputs = [reqTx.bin_outputs[+md.request_index]];
            else
                resTx.outputs = [reqTx.outputs[+md.request_index]];
            break;

        case 'TXMETA':
            resTx.version = reqTx.version;
            resTx.lock_time = reqTx.lock_time;
            resTx.inputs_cnt = reqTx.inputs.length;
            if (md.tx_hash)
                resTx.outputs_cnt = reqTx.bin_outputs.length;
            else
                resTx.outputs_cnt = reqTx.outputs.length;
            break;

        default:
            throw new Error('Unknown request type: ' + m.request_type);
        }

        return self._typedCommonCall('TxAck', 'TxRequest', {
            tx: resTx
        }).then(process);
    }
};

Session.prototype._typedCommonCall = function (type, resType, msg) {
    var self = this;

    return this._commonCall(type, msg).then(function (res) {
        return self._assertType(res, resType);
    });
};

Session.prototype._assertType = function (res, resType) {
    if (res.type !== resType)
        throw new TypeError('Response of unexpected type: ' + res.type);
    return res;
};

Session.prototype._commonCall = function (type, msg) {
    var self = this,
        callpr = this._call(type, msg);

    return callpr.then(function (res) {
        return self._filterCommonTypes(res);
    });
};

Session.prototype._filterCommonTypes = function (res) {
    var self = this;

    if (res.type === 'Failure')
        throw res.message;

    if (res.type === 'ButtonRequest') {
        this._emitter.emit('button', res.message.code);
        return this._commonCall('ButtonAck');
    }

    if (res.type === 'EntropyRequest')
        return this._commonCall('EntropyAck', {
            entropy: stringToHex(this._generateEntropy(32))
        });

    if (res.type === 'PinMatrixRequest')
        return this._promptPin(res.message.type).then(
            function (pin) {
                return self._commonCall('PinMatrixAck', { pin: pin });
            },
            function () {
                return self._commonCall('Cancel');
            }
        );

    if (res.type === 'PassphraseRequest')
        return this._promptPassphrase().then(
            function (passphrase) {
                return self._commonCall('PassphraseAck', { passphrase: passphrase });
            },
            function (err) {
                return self._commonCall('Cancel').then(null, function (e) {
                    throw err || e;
                });
            }
        );

    if (res.type === 'WordRequest')
        return this._promptWord().then(
            function (word) {
                return self._commonCall('WordAck', { word: word });
            },
            function () {
                return self._commonCall('Cancel');
            }
        );

    return res;
};

Session.prototype._promptPin = function (type) {
    var self = this;

    return new Promise(function (resolve, reject) {
        if (!self._emitter.emit('pin', type, function (err, pin) {
            if (err || pin == null)
                reject(err);
            else
                resolve(pin);
        })) {
            console.warn('[trezor] PIN callback not configured, cancelling request');
            reject();
        }
    });
};

Session.prototype._promptPassphrase = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
        if (!self._emitter.emit('passphrase', function (err, passphrase) {
            if (err || passphrase == null)
                reject(err);
            else
                resolve(passphrase.normalize('NFKD'));
        })) {
            console.warn('[trezor] Passphrase callback not configured, cancelling request');
            reject();
        }
    });
};

Session.prototype._promptWord = function () {
    var self = this;

    return new Promise(function (resolve, reject) {
        if (!self._emitter.emit('word', function (err, word) {
            if (err || word == null)
                reject(err);
            else
                resolve(word.toLocaleLowerCase());
        })) {
            console.warn('[trezor] Word callback not configured, cancelling request');
            reject();
        }
    });
};

Session.prototype._generateEntropy = function (len) {
    return crypto.randomBytes(len).toString('binary');
};

Session.prototype._call = function (type, msg) {
    var self = this,
        logMessage;

    msg = msg || {};
    logMessage = this._filterForLog(type, msg);

    console.log('[trezor] Sending', type, logMessage);
    this._emitter.emit('send', type, msg);

    return this._transport.call(this._sessionId, type, msg).then(
        function (res) {
            var logMessage = self._filterForLog(res.type, res.message);

            console.log('[trezor] Received', res.type, logMessage);
            self._emitter.emit('receive', res.type, res.message);
            return res;
        },
        function (err) {
            console.log('[trezord] Received error', err);
            self._emitter.emit('error', err);
            throw err;
        }
    );
};

Session.prototype._filterForLog = function (type, msg) {
    var redacted = {},
        blacklist = {
            PassphraseAck: {
                passphrase: '(redacted...)'
            }
        };

    return extend(redacted, msg, blacklist[type] || {});
};

module.exports = Session;

//
// Hex codec
//

// Encode binary string to hex string
function stringToHex(bin) {
    var i, chr, hex = '';

    for (i = 0; i < bin.length; i++) {
        chr = (bin.charCodeAt(i) & 0xFF).toString(16);
        hex += chr.length < 2 ? '0' + chr : chr;
    }

    return hex;
}

// Decode hex string to binary string
function hexToString(hex) {
    var i, bytes = [];

    for (i = 0; i < hex.length - 1; i += 2)
        bytes.push(parseInt(hex.substr(i, 2), 16));

    return String.fromCharCode.apply(String, bytes);
}

},{"crypto":19,"events":24,"extend":29,"promise":31,"unorm":34,"util":28}],8:[function(_dereq_,module,exports){
'use strict';

var Promise = _dereq_('promise'),
    applet_ = _dereq_('../applet'),
    traverse = _dereq_('traverse')
//
// Applet transport.
//
var AppletTransport = function (applet) {
    this._applet = applet;
};

// Injects the applet object into the document.
AppletTransport.loadApplet = function () {
    return applet_.load();
};

// BIP32 CKD derivation of the given index
/*
AppletTransport.prototype.deriveChildNode = function (node, index) {
    var child = this._applet.deriveChildNode(node, index);

    if (node.path) {
        child.path = node.path.concat([index]);
    }

    return child;
};
*/

// Configures the applet.
AppletTransport.prototype.configure = function (config) {
    var applet = this._applet;

    return new Promise(function (resolve, reject) {
        try {
            applet.configure(config);
            resolve();
        } catch (e) {
            // In most browsers, exceptions from applet methods are not properly
            // propagated
            reject(new Error(
                'Applet configuration found, but could not be used. ' +
                    'Make sure it has proper format and a valid signature.'
            ));
        }
    });
};

// Enumerates connected devices.
// Requires configured applet.
AppletTransport.prototype.enumerate = function () {
    var applet = this._applet;

    return new Promise(function (resolve) {
        resolve(JSON.parse(applet.devices()));
    });
};

// Opens a device and returns a session object.
AppletTransport.prototype.acquire = function (device) {
    return Promise.resolve({
        session: device
    });
};

// Releases the device handle.
AppletTransport.prototype.release = function (device) {
    var applet = this._applet;

    return new Promise(function (resolve, reject) {
        applet.close(JSON.stringify(device), {
            success: resolve,
            error: reject
        });
    });
};

// Does a request-response call to the device.
AppletTransport.prototype.call = function (device, type, message) {
    var applet = this._applet,
        timeout = false;

    // BitcoinTrezorApplet has a bug, causing different treatment of
    // undefined fields in messages. We need to find all undefined fields
    // and remove them from the message object. `traverse` will delete
    // object fields and splice out array items properly.
    traverse(message).forEach(function (value) {
        if (value === undefined) {
            this.remove();
        }
    });
    // JSON.stringify will contain $$hashKey
    return new Promise(function (resolve, reject) {
        applet.call(JSON.stringify(device), timeout, type, angular.toJson(message), {
            success: function (t, m) {
                resolve({
                    type: t,
                    message: JSON.parse(m)
                });
            },
            error: function (err) {
                reject(new Error(err));
            }
        });
    });
};

module.exports = AppletTransport;

},{"../applet":1,"promise":31,"traverse":33}],9:[function(_dereq_,module,exports){
'use strict';

var extend = _dereq_('extend'),
    http = _dereq_('../http');

//
// HTTP transport.
//
var HttpTransport = function (url) {
    this._url = url;
};

HttpTransport.connect = function (url) {
    return http({
        url: url, json: true
    });
};

HttpTransport.prototype._request = function (options) {
    return http(extend(options, {
        url: this._url + options.url
    }));
};

HttpTransport.prototype.configure = function (config) {
    return this._request({
        method: 'POST', url: '/configure', body: config, json: true
    });
};

HttpTransport.prototype.enumerate = function (wait) {
    return this._request({
        method: 'GET', url: wait ? '/listen' : '/enumerate', json: true
    });
};

HttpTransport.prototype.acquire = function (device) {
    var path = device.path; // TODO: take just path
    return this._request({
        method: 'POST', url: '/acquire/' + path, json: true
    });
};

HttpTransport.prototype.release = function (sessionId) {
    return this._request({
        method: 'POST', url: '/release/' + sessionId, json: true
    });
};

HttpTransport.prototype.call = function (sessionId, type, message) {
    return this._request({
        method: 'POST', url: '/call/' + sessionId, json: {
            type: type,
            message: message
        }
    });
};

module.exports = HttpTransport;

},{"../http":3,"extend":29}],10:[function(_dereq_,module,exports){
'use strict';

var Promise = _dereq_('promise'),
    plugin_ = _dereq_('../plugin'),
    traverse = _dereq_('traverse');

//
// Plugin transport.
//
var PluginTransport = function (plugin) {
    this._plugin = plugin;
};

// Injects the plugin object into the document.
PluginTransport.loadPlugin = function () {
    return plugin_.load();
};

// BIP32 CKD derivation of the given index
PluginTransport.prototype.deriveChildNode = function (node, index) {
    var child = this._plugin.deriveChildNode(node, index);

    if (node.path) {
        child.path = node.path.concat([index]);
    }

    return child;
};

// Configures the plugin.
PluginTransport.prototype.configure = function (config) {
    var plugin = this._plugin;

    return new Promise(function (resolve, reject) {
        try {
            plugin.configure(config);
            resolve();
        } catch (e) {
            // In most browsers, exceptions from plugin methods are not properly
            // propagated
            reject(new Error(
                'Plugin configuration found, but could not be used. ' +
                    'Make sure it has proper format and a valid signature.'
            ));
        }
    });
};

// Enumerates connected devices.
// Requires configured plugin.
PluginTransport.prototype.enumerate = function () {
    var plugin = this._plugin;

    return new Promise(function (resolve) {
        resolve(plugin.devices());
    });
};

// Opens a device and returns a session object.
PluginTransport.prototype.acquire = function (device) {
    return Promise.resolve({
        session: device
    });
};

// Releases the device handle.
PluginTransport.prototype.release = function (device) {
    var plugin = this._plugin;

    return new Promise(function (resolve, reject) {
        plugin.close(device, {
            success: resolve,
            error: reject
        });
    });
};

// Does a request-response call to the device.
PluginTransport.prototype.call = function (device, type, message) {
    var plugin = this._plugin,
        timeout = false;

    // BitcoinTrezorPlugin has a bug, causing different treatment of
    // undefined fields in messages. We need to find all undefined fields
    // and remove them from the message object. `traverse` will delete
    // object fields and splice out array items properly.
    traverse(message).forEach(function (value) {
        if (value === undefined) {
            this.remove();
        }
    });

    return new Promise(function (resolve, reject) {
        plugin.call(device, timeout, type, message, {
            success: function (t, m) {
                resolve({
                    type: t,
                    message: m
                });
            },
            error: function (err) {
                reject(new Error(err));
            }
        });
    });
};

module.exports = PluginTransport;

},{"../plugin":6,"promise":31,"traverse":33}],11:[function(_dereq_,module,exports){
/*!
  * Bowser - a browser detector
  * https://github.com/ded/bowser
  * MIT License | (c) Dustin Diaz 2014
  */

!function (name, definition) {
  if (typeof module != 'undefined' && module.exports) module.exports['browser'] = definition()
  else if (typeof define == 'function' && define.amd) define(definition)
  else this[name] = definition()
}('bowser', function () {
  /**
    * See useragents.js for examples of navigator.userAgent
    */

  var t = true

  function detect(ua) {

    function getFirstMatch(regex) {
      var match = ua.match(regex);
      return (match && match.length > 1 && match[1]) || '';
    }

    var iosdevice = getFirstMatch(/(ipod|iphone|ipad)/i).toLowerCase()
      , likeAndroid = /like android/i.test(ua)
      , android = !likeAndroid && /android/i.test(ua)
      , versionIdentifier = getFirstMatch(/version\/(\d+(\.\d+)?)/i)
      , tablet = /tablet/i.test(ua)
      , mobile = !tablet && /[^-]mobi/i.test(ua)
      , result

    if (/opera|opr/i.test(ua)) {
      result = {
        name: 'Opera'
      , opera: t
      , version: versionIdentifier || getFirstMatch(/(?:opera|opr)[\s\/](\d+(\.\d+)?)/i)
      }
    }
    else if (/windows phone/i.test(ua)) {
      result = {
        name: 'Windows Phone'
      , windowsphone: t
      , msie: t
      , version: getFirstMatch(/iemobile\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/msie|trident/i.test(ua)) {
      result = {
        name: 'Internet Explorer'
      , msie: t
      , version: getFirstMatch(/(?:msie |rv:)(\d+(\.\d+)?)/i)
      }
    }
    else if (/chrome|crios|crmo/i.test(ua)) {
      result = {
        name: 'Chrome'
      , chrome: t
      , version: getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.\d+)?)/i)
      }
    }
    else if (iosdevice) {
      result = {
        name : iosdevice == 'iphone' ? 'iPhone' : iosdevice == 'ipad' ? 'iPad' : 'iPod'
      }
      // WTF: version is not part of user agent in web apps
      if (versionIdentifier) {
        result.version = versionIdentifier
      }
    }
    else if (/sailfish/i.test(ua)) {
      result = {
        name: 'Sailfish'
      , sailfish: t
      , version: getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/seamonkey\//i.test(ua)) {
      result = {
        name: 'SeaMonkey'
      , seamonkey: t
      , version: getFirstMatch(/seamonkey\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/firefox|iceweasel/i.test(ua)) {
      result = {
        name: 'Firefox'
      , firefox: t
      , version: getFirstMatch(/(?:firefox|iceweasel)[ \/](\d+(\.\d+)?)/i)
      }
      if (/\((mobile|tablet);[^\)]*rv:[\d\.]+\)/i.test(ua)) {
        result.firefoxos = t
      }
    }
    else if (/silk/i.test(ua)) {
      result =  {
        name: 'Amazon Silk'
      , silk: t
      , version : getFirstMatch(/silk\/(\d+(\.\d+)?)/i)
      }
    }
    else if (android) {
      result = {
        name: 'Android'
      , version: versionIdentifier
      }
    }
    else if (/phantom/i.test(ua)) {
      result = {
        name: 'PhantomJS'
      , phantom: t
      , version: getFirstMatch(/phantomjs\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/blackberry|\bbb\d+/i.test(ua) || /rim\stablet/i.test(ua)) {
      result = {
        name: 'BlackBerry'
      , blackberry: t
      , version: versionIdentifier || getFirstMatch(/blackberry[\d]+\/(\d+(\.\d+)?)/i)
      }
    }
    else if (/(web|hpw)os/i.test(ua)) {
      result = {
        name: 'WebOS'
      , webos: t
      , version: versionIdentifier || getFirstMatch(/w(?:eb)?osbrowser\/(\d+(\.\d+)?)/i)
      };
      /touchpad\//i.test(ua) && (result.touchpad = t)
    }
    else if (/bada/i.test(ua)) {
      result = {
        name: 'Bada'
      , bada: t
      , version: getFirstMatch(/dolfin\/(\d+(\.\d+)?)/i)
      };
    }
    else if (/tizen/i.test(ua)) {
      result = {
        name: 'Tizen'
      , tizen: t
      , version: getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.\d+)?)/i) || versionIdentifier
      };
    }
    else if (/safari/i.test(ua)) {
      result = {
        name: 'Safari'
      , safari: t
      , version: versionIdentifier
      }
    }
    else result = {}

    // set webkit or gecko flag for browsers based on these engines
    if (/(apple)?webkit/i.test(ua)) {
      result.name = result.name || "Webkit"
      result.webkit = t
      if (!result.version && versionIdentifier) {
        result.version = versionIdentifier
      }
    } else if (!result.opera && /gecko\//i.test(ua)) {
      result.name = result.name || "Gecko"
      result.gecko = t
      result.version = result.version || getFirstMatch(/gecko\/(\d+(\.\d+)?)/i)
    }

    // set OS flags for platforms that have multiple browsers
    if (android || result.silk) {
      result.android = t
    } else if (iosdevice) {
      result[iosdevice] = t
      result.ios = t
    }

    // OS version extraction
    var osVersion = '';
    if (iosdevice) {
      osVersion = getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i);
      osVersion = osVersion.replace(/[_\s]/g, '.');
    } else if (android) {
      osVersion = getFirstMatch(/android[ \/-](\d+(\.\d+)*)/i);
    } else if (result.windowsphone) {
      osVersion = getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i);
    } else if (result.webos) {
      osVersion = getFirstMatch(/(?:web|hpw)os\/(\d+(\.\d+)*)/i);
    } else if (result.blackberry) {
      osVersion = getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i);
    } else if (result.bada) {
      osVersion = getFirstMatch(/bada\/(\d+(\.\d+)*)/i);
    } else if (result.tizen) {
      osVersion = getFirstMatch(/tizen[\/\s](\d+(\.\d+)*)/i);
    }
    if (osVersion) {
      result.osversion = osVersion;
    }

    // device type extraction
    var osMajorVersion = osVersion.split('.')[0];
    if (tablet || iosdevice == 'ipad' || (android && (osMajorVersion == 3 || (osMajorVersion == 4 && !mobile))) || result.silk) {
      result.tablet = t
    } else if (mobile || iosdevice == 'iphone' || iosdevice == 'ipod' || android || result.blackberry || result.webos || result.bada) {
      result.mobile = t
    }

    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if ((result.msie && result.version >= 10) ||
        (result.chrome && result.version >= 20) ||
        (result.firefox && result.version >= 20.0) ||
        (result.safari && result.version >= 6) ||
        (result.opera && result.version >= 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] >= 6) ||
        (result.blackberry && result.version >= 10.1)
        ) {
      result.a = t;
    }
    else if ((result.msie && result.version < 10) ||
        (result.chrome && result.version < 20) ||
        (result.firefox && result.version < 20.0) ||
        (result.safari && result.version < 6) ||
        (result.opera && result.version < 10.0) ||
        (result.ios && result.osversion && result.osversion.split(".")[0] < 6)
        ) {
      result.c = t
    } else result.x = t

    return result
  }

  var bowser = detect(typeof navigator !== 'undefined' ? navigator.userAgent : '')


  /*
   * Set our detect method to the main bowser object so we can
   * reuse it to test other user agents.
   * This is needed to implement future tests.
   */
  bowser._detect = detect;

  return bowser
});

},{}],12:[function(_dereq_,module,exports){
// Browser Request
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// UMD HEADER START 
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node. Does not work with strict CommonJS, but
        // only CommonJS-like enviroments that support module.exports,
        // like Node.
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.returnExports = factory();
  }
}(this, function () {
// UMD HEADER END

var XHR = XMLHttpRequest
if (!XHR) throw new Error('missing XMLHttpRequest')
request.log = {
  'trace': noop, 'debug': noop, 'info': noop, 'warn': noop, 'error': noop
}

var DEFAULT_TIMEOUT = 3 * 60 * 1000 // 3 minutes

//
// request
//

function request(options, callback) {
  // The entry-point to the API: prep the options object and pass the real work to run_xhr.
  if(typeof callback !== 'function')
    throw new Error('Bad callback given: ' + callback)

  if(!options)
    throw new Error('No options given')

  var options_onResponse = options.onResponse; // Save this for later.

  if(typeof options === 'string')
    options = {'uri':options};
  else
    options = JSON.parse(JSON.stringify(options)); // Use a duplicate for mutating.

  options.onResponse = options_onResponse // And put it back.

  if (options.verbose) request.log = getLogger();

  if(options.url) {
    options.uri = options.url;
    delete options.url;
  }

  if(!options.uri && options.uri !== "")
    throw new Error("options.uri is a required argument");

  if(typeof options.uri != "string")
    throw new Error("options.uri must be a string");

  var unsupported_options = ['proxy', '_redirectsFollowed', 'maxRedirects', 'followRedirect']
  for (var i = 0; i < unsupported_options.length; i++)
    if(options[ unsupported_options[i] ])
      throw new Error("options." + unsupported_options[i] + " is not supported")

  options.callback = callback
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.body    = options.body || null
  options.timeout = options.timeout || request.DEFAULT_TIMEOUT

  if(options.headers.host)
    throw new Error("Options.headers.host is not supported");

  if(options.json) {
    options.headers.accept = options.headers.accept || 'application/json'
    if(options.method !== 'GET')
      options.headers['content-type'] = 'application/json'

    if(typeof options.json !== 'boolean')
      options.body = JSON.stringify(options.json)
    else if(typeof options.body !== 'string')
      options.body = JSON.stringify(options.body)
  }
  
  //BEGIN QS Hack
  var serialize = function(obj) {
    var str = [];
    for(var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }
  
  if(options.qs){
    var qs = (typeof options.qs == 'string')? options.qs : serialize(options.qs);
    if(options.uri.indexOf('?') !== -1){ //no get params
        options.uri = options.uri+'&'+qs;
    }else{ //existing get params
        options.uri = options.uri+'?'+qs;
    }
  }
  //END QS Hack
  
  //BEGIN FORM Hack
  var multipart = function(obj) {
    //todo: support file type (useful?)
    var result = {};
    result.boundry = '-------------------------------'+Math.floor(Math.random()*1000000000);
    var lines = [];
    for(var p in obj){
        if (obj.hasOwnProperty(p)) {
            lines.push(
                '--'+result.boundry+"\n"+
                'Content-Disposition: form-data; name="'+p+'"'+"\n"+
                "\n"+
                obj[p]+"\n"
            );
        }
    }
    lines.push( '--'+result.boundry+'--' );
    result.body = lines.join('');
    result.length = result.body.length;
    result.type = 'multipart/form-data; boundary='+result.boundry;
    return result;
  }
  
  if(options.form){
    if(typeof options.form == 'string') throw('form name unsupported');
    if(options.method === 'POST'){
        var encoding = (options.encoding || 'application/x-www-form-urlencoded').toLowerCase();
        options.headers['content-type'] = encoding;
        switch(encoding){
            case 'application/x-www-form-urlencoded':
                options.body = serialize(options.form).replace(/%20/g, "+");
                break;
            case 'multipart/form-data':
                var multi = multipart(options.form);
                //options.headers['content-length'] = multi.length;
                options.body = multi.body;
                options.headers['content-type'] = multi.type;
                break;
            default : throw new Error('unsupported encoding:'+encoding);
        }
    }
  }
  //END FORM Hack

  // If onResponse is boolean true, call back immediately when the response is known,
  // not when the full request is complete.
  options.onResponse = options.onResponse || noop
  if(options.onResponse === true) {
    options.onResponse = callback
    options.callback = noop
  }

  // XXX Browsers do not like this.
  //if(options.body)
  //  options.headers['content-length'] = options.body.length;

  // HTTP basic authentication
  if(!options.headers.authorization && options.auth)
    options.headers.authorization = 'Basic ' + b64_enc(options.auth.username + ':' + options.auth.password);

  return run_xhr(options)
}

var req_seq = 0
function run_xhr(options) {
  var xhr = new XHR
    , timed_out = false
    , is_cors = is_crossDomain(options.uri)
    , supports_cors = ('withCredentials' in xhr)

  req_seq += 1
  xhr.seq_id = req_seq
  xhr.id = req_seq + ': ' + options.method + ' ' + options.uri
  xhr._id = xhr.id // I know I will type "_id" from habit all the time.

  if(is_cors && !supports_cors) {
    var cors_err = new Error('Browser does not support cross-origin request: ' + options.uri)
    cors_err.cors = 'unsupported'
    return options.callback(cors_err, xhr)
  }

  xhr.timeoutTimer = setTimeout(too_late, options.timeout)
  function too_late() {
    timed_out = true
    var er = new Error('ETIMEDOUT')
    er.code = 'ETIMEDOUT'
    er.duration = options.timeout

    request.log.error('Timeout', { 'id':xhr._id, 'milliseconds':options.timeout })
    return options.callback(er, xhr)
  }

  // Some states can be skipped over, so remember what is still incomplete.
  var did = {'response':false, 'loading':false, 'end':false}

  xhr.onreadystatechange = on_state_change
  xhr.open(options.method, options.uri, true) // asynchronous
  if(is_cors)
    xhr.withCredentials = !! options.withCredentials
  xhr.send(options.body)
  return xhr

  function on_state_change(event) {
    if(timed_out)
      return request.log.debug('Ignoring timed out state change', {'state':xhr.readyState, 'id':xhr.id})

    request.log.debug('State change', {'state':xhr.readyState, 'id':xhr.id, 'timed_out':timed_out})

    if(xhr.readyState === XHR.OPENED) {
      request.log.debug('Request started', {'id':xhr.id})
      for (var key in options.headers)
        xhr.setRequestHeader(key, options.headers[key])
    }

    else if(xhr.readyState === XHR.HEADERS_RECEIVED)
      on_response()

    else if(xhr.readyState === XHR.LOADING) {
      on_response()
      on_loading()
    }

    else if(xhr.readyState === XHR.DONE) {
      on_response()
      on_loading()
      on_end()
    }
  }

  function on_response() {
    if(did.response)
      return

    did.response = true
    request.log.debug('Got response', {'id':xhr.id, 'status':xhr.status})
    clearTimeout(xhr.timeoutTimer)
    xhr.statusCode = xhr.status // Node request compatibility

    // Detect failed CORS requests.
    if(is_cors && xhr.statusCode == 0) {
      var cors_err = new Error('CORS request rejected: ' + options.uri)
      cors_err.cors = 'rejected'

      // Do not process this request further.
      did.loading = true
      did.end = true

      return options.callback(cors_err, xhr)
    }

    options.onResponse(null, xhr)
  }

  function on_loading() {
    if(did.loading)
      return

    did.loading = true
    request.log.debug('Response body loading', {'id':xhr.id})
    // TODO: Maybe simulate "data" events by watching xhr.responseText
  }

  function on_end() {
    if(did.end)
      return

    did.end = true
    request.log.debug('Request done', {'id':xhr.id})

    xhr.body = xhr.responseText
    if(options.json) {
      try        { xhr.body = JSON.parse(xhr.responseText) }
      catch (er) { return options.callback(er, xhr)        }
    }

    options.callback(null, xhr, xhr.body)
  }

} // request

request.withCredentials = false;
request.DEFAULT_TIMEOUT = DEFAULT_TIMEOUT;

//
// defaults
//

request.defaults = function(options, requester) {
  var def = function (method) {
    var d = function (params, callback) {
      if(typeof params === 'string')
        params = {'uri': params};
      else {
        params = JSON.parse(JSON.stringify(params));
      }
      for (var i in options) {
        if (params[i] === undefined) params[i] = options[i]
      }
      return method(params, callback)
    }
    return d
  }
  var de = def(request)
  de.get = def(request.get)
  de.post = def(request.post)
  de.put = def(request.put)
  de.head = def(request.head)
  return de
}

//
// HTTP method shortcuts
//

var shortcuts = [ 'get', 'put', 'post', 'head' ];
shortcuts.forEach(function(shortcut) {
  var method = shortcut.toUpperCase();
  var func   = shortcut.toLowerCase();

  request[func] = function(opts) {
    if(typeof opts === 'string')
      opts = {'method':method, 'uri':opts};
    else {
      opts = JSON.parse(JSON.stringify(opts));
      opts.method = method;
    }

    var args = [opts].concat(Array.prototype.slice.apply(arguments, [1]));
    return request.apply(this, args);
  }
})

//
// CouchDB shortcut
//

request.couch = function(options, callback) {
  if(typeof options === 'string')
    options = {'uri':options}

  // Just use the request API to do JSON.
  options.json = true
  if(options.body)
    options.json = options.body
  delete options.body

  callback = callback || noop

  var xhr = request(options, couch_handler)
  return xhr

  function couch_handler(er, resp, body) {
    if(er)
      return callback(er, resp, body)

    if((resp.statusCode < 200 || resp.statusCode > 299) && body.error) {
      // The body is a Couch JSON object indicating the error.
      er = new Error('CouchDB error: ' + (body.error.reason || body.error.error))
      for (var key in body)
        er[key] = body[key]
      return callback(er, resp, body);
    }

    return callback(er, resp, body);
  }
}

//
// Utility
//

function noop() {}

function getLogger() {
  var logger = {}
    , levels = ['trace', 'debug', 'info', 'warn', 'error']
    , level, i

  for(i = 0; i < levels.length; i++) {
    level = levels[i]

    logger[level] = noop
    if(typeof console !== 'undefined' && console && console[level])
      logger[level] = formatted(console, level)
  }

  return logger
}

function formatted(obj, method) {
  return formatted_logger

  function formatted_logger(str, context) {
    if(typeof context === 'object')
      str += ' ' + JSON.stringify(context)

    return obj[method].call(obj, str)
  }
}

// Return whether a URL is a cross-domain request.
function is_crossDomain(url) {
  var rurl = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/

  // jQuery #8138, IE may throw an exception when accessing
  // a field from window.location if document.domain has been set
  var ajaxLocation
  try { ajaxLocation = location.href }
  catch (e) {
    // Use the href attribute of an A element since IE will modify it given document.location
    ajaxLocation = document.createElement( "a" );
    ajaxLocation.href = "";
    ajaxLocation = ajaxLocation.href;
  }

  var ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || []
    , parts = rurl.exec(url.toLowerCase() )

  var result = !!(
    parts &&
    (  parts[1] != ajaxLocParts[1]
    || parts[2] != ajaxLocParts[2]
    || (parts[3] || (parts[1] === "http:" ? 80 : 443)) != (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? 80 : 443))
    )
  )

  //console.debug('is_crossDomain('+url+') -> ' + result)
  return result
}

// MIT License from http://phpjs.org/functions/base64_encode:358
function b64_enc (data) {
    // Encodes string using MIME base64 algorithm
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0, ac = 0, enc="", tmp_arr = [];

    if (!data) {
        return data;
    }

    // assume utf8 data
    // data = this.utf8_encode(data+'');

    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);

        bits = o1<<16 | o2<<8 | o3;

        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;

        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);

    enc = tmp_arr.join('');

    switch (data.length % 3) {
        case 1:
            enc = enc.slice(0, -2) + '==';
        break;
        case 2:
            enc = enc.slice(0, -1) + '=';
        break;
    }

    return enc;
}
    return request;
//UMD FOOTER START
}));
//UMD FOOTER END

},{}],13:[function(_dereq_,module,exports){
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// when used in node, this will actually load the util module we depend on
// versus loading the builtin util module as happens otherwise
// this is a bug in node module loading as far as I am concerned
var util = _dereq_('util/');

var pSlice = Array.prototype.slice;
var hasOwn = Object.prototype.hasOwnProperty;

// 1. The assert module provides functions that throw
// AssertionError's when particular conditions are not met. The
// assert module must conform to the following interface.

var assert = module.exports = ok;

// 2. The AssertionError is defined in assert.
// new assert.AssertionError({ message: message,
//                             actual: actual,
//                             expected: expected })

assert.AssertionError = function AssertionError(options) {
  this.name = 'AssertionError';
  this.actual = options.actual;
  this.expected = options.expected;
  this.operator = options.operator;
  if (options.message) {
    this.message = options.message;
    this.generatedMessage = false;
  } else {
    this.message = getMessage(this);
    this.generatedMessage = true;
  }
  var stackStartFunction = options.stackStartFunction || fail;

  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, stackStartFunction);
  }
  else {
    // non v8 browsers so we can have a stacktrace
    var err = new Error();
    if (err.stack) {
      var out = err.stack;

      // try to strip useless frames
      var fn_name = stackStartFunction.name;
      var idx = out.indexOf('\n' + fn_name);
      if (idx >= 0) {
        // once we have located the function frame
        // we need to strip out everything before it (and its line)
        var next_line = out.indexOf('\n', idx + 1);
        out = out.substring(next_line + 1);
      }

      this.stack = out;
    }
  }
};

// assert.AssertionError instanceof Error
util.inherits(assert.AssertionError, Error);

function replacer(key, value) {
  if (util.isUndefined(value)) {
    return '' + value;
  }
  if (util.isNumber(value) && (isNaN(value) || !isFinite(value))) {
    return value.toString();
  }
  if (util.isFunction(value) || util.isRegExp(value)) {
    return value.toString();
  }
  return value;
}

function truncate(s, n) {
  if (util.isString(s)) {
    return s.length < n ? s : s.slice(0, n);
  } else {
    return s;
  }
}

function getMessage(self) {
  return truncate(JSON.stringify(self.actual, replacer), 128) + ' ' +
         self.operator + ' ' +
         truncate(JSON.stringify(self.expected, replacer), 128);
}

// At present only the three keys mentioned above are used and
// understood by the spec. Implementations or sub modules can pass
// other keys to the AssertionError's constructor - they will be
// ignored.

// 3. All of the following functions must throw an AssertionError
// when a corresponding condition is not met, with a message that
// may be undefined if not provided.  All assertion methods provide
// both the actual and expected values to the assertion error for
// display purposes.

function fail(actual, expected, message, operator, stackStartFunction) {
  throw new assert.AssertionError({
    message: message,
    actual: actual,
    expected: expected,
    operator: operator,
    stackStartFunction: stackStartFunction
  });
}

// EXTENSION! allows for well behaved errors defined elsewhere.
assert.fail = fail;

// 4. Pure assertion tests whether a value is truthy, as determined
// by !!guard.
// assert.ok(guard, message_opt);
// This statement is equivalent to assert.equal(true, !!guard,
// message_opt);. To test strictly for the value true, use
// assert.strictEqual(true, guard, message_opt);.

function ok(value, message) {
  if (!value) fail(value, true, message, '==', assert.ok);
}
assert.ok = ok;

// 5. The equality assertion tests shallow, coercive equality with
// ==.
// assert.equal(actual, expected, message_opt);

assert.equal = function equal(actual, expected, message) {
  if (actual != expected) fail(actual, expected, message, '==', assert.equal);
};

// 6. The non-equality assertion tests for whether two objects are not equal
// with != assert.notEqual(actual, expected, message_opt);

assert.notEqual = function notEqual(actual, expected, message) {
  if (actual == expected) {
    fail(actual, expected, message, '!=', assert.notEqual);
  }
};

// 7. The equivalence assertion tests a deep equality relation.
// assert.deepEqual(actual, expected, message_opt);

assert.deepEqual = function deepEqual(actual, expected, message) {
  if (!_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'deepEqual', assert.deepEqual);
  }
};

function _deepEqual(actual, expected) {
  // 7.1. All identical values are equivalent, as determined by ===.
  if (actual === expected) {
    return true;

  } else if (util.isBuffer(actual) && util.isBuffer(expected)) {
    if (actual.length != expected.length) return false;

    for (var i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) return false;
    }

    return true;

  // 7.2. If the expected value is a Date object, the actual value is
  // equivalent if it is also a Date object that refers to the same time.
  } else if (util.isDate(actual) && util.isDate(expected)) {
    return actual.getTime() === expected.getTime();

  // 7.3 If the expected value is a RegExp object, the actual value is
  // equivalent if it is also a RegExp object with the same source and
  // properties (`global`, `multiline`, `lastIndex`, `ignoreCase`).
  } else if (util.isRegExp(actual) && util.isRegExp(expected)) {
    return actual.source === expected.source &&
           actual.global === expected.global &&
           actual.multiline === expected.multiline &&
           actual.lastIndex === expected.lastIndex &&
           actual.ignoreCase === expected.ignoreCase;

  // 7.4. Other pairs that do not both pass typeof value == 'object',
  // equivalence is determined by ==.
  } else if (!util.isObject(actual) && !util.isObject(expected)) {
    return actual == expected;

  // 7.5 For all other Object pairs, including Array objects, equivalence is
  // determined by having the same number of owned properties (as verified
  // with Object.prototype.hasOwnProperty.call), the same set of keys
  // (although not necessarily the same order), equivalent values for every
  // corresponding key, and an identical 'prototype' property. Note: this
  // accounts for both named and indexed properties on Arrays.
  } else {
    return objEquiv(actual, expected);
  }
}

function isArguments(object) {
  return Object.prototype.toString.call(object) == '[object Arguments]';
}

function objEquiv(a, b) {
  if (util.isNullOrUndefined(a) || util.isNullOrUndefined(b))
    return false;
  // an identical 'prototype' property.
  if (a.prototype !== b.prototype) return false;
  //~~~I've managed to break Object.keys through screwy arguments passing.
  //   Converting to array solves the problem.
  if (isArguments(a)) {
    if (!isArguments(b)) {
      return false;
    }
    a = pSlice.call(a);
    b = pSlice.call(b);
    return _deepEqual(a, b);
  }
  try {
    var ka = objectKeys(a),
        kb = objectKeys(b),
        key, i;
  } catch (e) {//happens when one is a string literal and the other isn't
    return false;
  }
  // having the same number of owned properties (keys incorporates
  // hasOwnProperty)
  if (ka.length != kb.length)
    return false;
  //the same set of keys (although not necessarily the same order),
  ka.sort();
  kb.sort();
  //~~~cheap key test
  for (i = ka.length - 1; i >= 0; i--) {
    if (ka[i] != kb[i])
      return false;
  }
  //equivalent values for every corresponding key, and
  //~~~possibly expensive deep test
  for (i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!_deepEqual(a[key], b[key])) return false;
  }
  return true;
}

// 8. The non-equivalence assertion tests for any deep inequality.
// assert.notDeepEqual(actual, expected, message_opt);

assert.notDeepEqual = function notDeepEqual(actual, expected, message) {
  if (_deepEqual(actual, expected)) {
    fail(actual, expected, message, 'notDeepEqual', assert.notDeepEqual);
  }
};

// 9. The strict equality assertion tests strict equality, as determined by ===.
// assert.strictEqual(actual, expected, message_opt);

assert.strictEqual = function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    fail(actual, expected, message, '===', assert.strictEqual);
  }
};

// 10. The strict non-equality assertion tests for strict inequality, as
// determined by !==.  assert.notStrictEqual(actual, expected, message_opt);

assert.notStrictEqual = function notStrictEqual(actual, expected, message) {
  if (actual === expected) {
    fail(actual, expected, message, '!==', assert.notStrictEqual);
  }
};

function expectedException(actual, expected) {
  if (!actual || !expected) {
    return false;
  }

  if (Object.prototype.toString.call(expected) == '[object RegExp]') {
    return expected.test(actual);
  } else if (actual instanceof expected) {
    return true;
  } else if (expected.call({}, actual) === true) {
    return true;
  }

  return false;
}

function _throws(shouldThrow, block, expected, message) {
  var actual;

  if (util.isString(expected)) {
    message = expected;
    expected = null;
  }

  try {
    block();
  } catch (e) {
    actual = e;
  }

  message = (expected && expected.name ? ' (' + expected.name + ').' : '.') +
            (message ? ' ' + message : '.');

  if (shouldThrow && !actual) {
    fail(actual, expected, 'Missing expected exception' + message);
  }

  if (!shouldThrow && expectedException(actual, expected)) {
    fail(actual, expected, 'Got unwanted exception' + message);
  }

  if ((shouldThrow && actual && expected &&
      !expectedException(actual, expected)) || (!shouldThrow && actual)) {
    throw actual;
  }
}

// 11. Expected to throw an error:
// assert.throws(block, Error_opt, message_opt);

assert.throws = function(block, /*optional*/error, /*optional*/message) {
  _throws.apply(this, [true].concat(pSlice.call(arguments)));
};

// EXTENSION! This is annoying to write outside this module.
assert.doesNotThrow = function(block, /*optional*/message) {
  _throws.apply(this, [false].concat(pSlice.call(arguments)));
};

assert.ifError = function(err) { if (err) {throw err;}};

var objectKeys = Object.keys || function (obj) {
  var keys = [];
  for (var key in obj) {
    if (hasOwn.call(obj, key)) keys.push(key);
  }
  return keys;
};

},{"util/":28}],14:[function(_dereq_,module,exports){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = _dereq_('base64-js')
var ieee754 = _dereq_('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

},{"base64-js":15,"ieee754":16}],15:[function(_dereq_,module,exports){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS)
			return 62 // '+'
		if (code === SLASH)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

},{}],16:[function(_dereq_,module,exports){
exports.read = function(buffer, offset, isLE, mLen, nBytes) {
  var e, m,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      nBits = -7,
      i = isLE ? (nBytes - 1) : 0,
      d = isLE ? -1 : 1,
      s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8);

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8);

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity);
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

exports.write = function(buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c,
      eLen = nBytes * 8 - mLen - 1,
      eMax = (1 << eLen) - 1,
      eBias = eMax >> 1,
      rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0),
      i = isLE ? 0 : (nBytes - 1),
      d = isLE ? 1 : -1,
      s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8);

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8);

  buffer[offset + i - d] |= s * 128;
};

},{}],17:[function(_dereq_,module,exports){
(function (global){
/*global window, global*/
var util = _dereq_("util")
var assert = _dereq_("assert")

var slice = Array.prototype.slice
var console
var times = {}

if (typeof global !== "undefined" && global.console) {
    console = global.console
} else if (typeof window !== "undefined" && window.console) {
    console = window.console
} else {
    console = {}
}

var functions = [
    [log, "log"]
    , [info, "info"]
    , [warn, "warn"]
    , [error, "error"]
    , [time, "time"]
    , [timeEnd, "timeEnd"]
    , [trace, "trace"]
    , [dir, "dir"]
    , [assert, "assert"]
]

for (var i = 0; i < functions.length; i++) {
    var tuple = functions[i]
    var f = tuple[0]
    var name = tuple[1]

    if (!console[name]) {
        console[name] = f
    }
}

module.exports = console

function log() {}

function info() {
    console.log.apply(console, arguments)
}

function warn() {
    console.log.apply(console, arguments)
}

function error() {
    console.warn.apply(console, arguments)
}

function time(label) {
    times[label] = Date.now()
}

function timeEnd(label) {
    var time = times[label]
    if (!time) {
        throw new Error("No such label: " + label)
    }

    var duration = Date.now() - time
    console.log(label + ": " + duration + "ms")
}

function trace() {
    var err = new Error()
    err.name = "Trace"
    err.message = util.format.apply(null, arguments)
    console.error(err.stack)
}

function dir(object) {
    console.log(util.inspect(object) + "\n")
}

function assert(expression) {
    if (!expression) {
        var arr = slice.call(arguments, 1)
        assert.ok(false, util.format.apply(null, arr))
    }
}

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"assert":13,"util":28}],18:[function(_dereq_,module,exports){
var Buffer = _dereq_('buffer').Buffer;
var intSize = 4;
var zeroBuffer = new Buffer(intSize); zeroBuffer.fill(0);
var chrsz = 8;

function toArray(buf, bigEndian) {
  if ((buf.length % intSize) !== 0) {
    var len = buf.length + (intSize - (buf.length % intSize));
    buf = Buffer.concat([buf, zeroBuffer], len);
  }

  var arr = [];
  var fn = bigEndian ? buf.readInt32BE : buf.readInt32LE;
  for (var i = 0; i < buf.length; i += intSize) {
    arr.push(fn.call(buf, i));
  }
  return arr;
}

function toBuffer(arr, size, bigEndian) {
  var buf = new Buffer(size);
  var fn = bigEndian ? buf.writeInt32BE : buf.writeInt32LE;
  for (var i = 0; i < arr.length; i++) {
    fn.call(buf, arr[i], i * 4, true);
  }
  return buf;
}

function hash(buf, fn, hashSize, bigEndian) {
  if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
  var arr = fn(toArray(buf, bigEndian), buf.length * chrsz);
  return toBuffer(arr, hashSize, bigEndian);
}

module.exports = { hash: hash };

},{"buffer":14}],19:[function(_dereq_,module,exports){
var Buffer = _dereq_('buffer').Buffer
var sha = _dereq_('./sha')
var sha256 = _dereq_('./sha256')
var rng = _dereq_('./rng')
var md5 = _dereq_('./md5')

var algorithms = {
  sha1: sha,
  sha256: sha256,
  md5: md5
}

var blocksize = 64
var zeroBuffer = new Buffer(blocksize); zeroBuffer.fill(0)
function hmac(fn, key, data) {
  if(!Buffer.isBuffer(key)) key = new Buffer(key)
  if(!Buffer.isBuffer(data)) data = new Buffer(data)

  if(key.length > blocksize) {
    key = fn(key)
  } else if(key.length < blocksize) {
    key = Buffer.concat([key, zeroBuffer], blocksize)
  }

  var ipad = new Buffer(blocksize), opad = new Buffer(blocksize)
  for(var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36
    opad[i] = key[i] ^ 0x5C
  }

  var hash = fn(Buffer.concat([ipad, data]))
  return fn(Buffer.concat([opad, hash]))
}

function hash(alg, key) {
  alg = alg || 'sha1'
  var fn = algorithms[alg]
  var bufs = []
  var length = 0
  if(!fn) error('algorithm:', alg, 'is not yet supported')
  return {
    update: function (data) {
      if(!Buffer.isBuffer(data)) data = new Buffer(data)
        
      bufs.push(data)
      length += data.length
      return this
    },
    digest: function (enc) {
      var buf = Buffer.concat(bufs)
      var r = key ? hmac(fn, key, buf) : fn(buf)
      bufs = null
      return enc ? r.toString(enc) : r
    }
  }
}

function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/dominictarr/crypto-browserify'
    ].join('\n'))
}

exports.createHash = function (alg) { return hash(alg) }
exports.createHmac = function (alg, key) { return hash(alg, key) }
exports.randomBytes = function(size, callback) {
  if (callback && callback.call) {
    try {
      callback.call(this, undefined, new Buffer(rng(size)))
    } catch (err) { callback(err) }
  } else {
    return new Buffer(rng(size))
  }
}

function each(a, f) {
  for(var i in a)
    f(a[i], i)
}

// the least I can do is make error messages for the rest of the node.js/crypto api.
each(['createCredentials'
, 'createCipher'
, 'createCipheriv'
, 'createDecipher'
, 'createDecipheriv'
, 'createSign'
, 'createVerify'
, 'createDiffieHellman'
, 'pbkdf2'], function (name) {
  exports[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
})

},{"./md5":20,"./rng":21,"./sha":22,"./sha256":23,"buffer":14}],20:[function(_dereq_,module,exports){
/*
 * A JavaScript implementation of the RSA Data Security, Inc. MD5 Message
 * Digest Algorithm, as defined in RFC 1321.
 * Version 2.1 Copyright (C) Paul Johnston 1999 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for more info.
 */

var helpers = _dereq_('./helpers');

/*
 * Perform a simple self-test to see if the VM is working
 */
function md5_vm_test()
{
  return hex_md5("abc") == "900150983cd24fb0d6963f7d28e17f72";
}

/*
 * Calculate the MD5 of an array of little-endian words, and a bit length
 */
function core_md5(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << ((len) % 32);
  x[(((len + 64) >>> 9) << 4) + 14] = len;

  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;

    a = md5_ff(a, b, c, d, x[i+ 0], 7 , -680876936);
    d = md5_ff(d, a, b, c, x[i+ 1], 12, -389564586);
    c = md5_ff(c, d, a, b, x[i+ 2], 17,  606105819);
    b = md5_ff(b, c, d, a, x[i+ 3], 22, -1044525330);
    a = md5_ff(a, b, c, d, x[i+ 4], 7 , -176418897);
    d = md5_ff(d, a, b, c, x[i+ 5], 12,  1200080426);
    c = md5_ff(c, d, a, b, x[i+ 6], 17, -1473231341);
    b = md5_ff(b, c, d, a, x[i+ 7], 22, -45705983);
    a = md5_ff(a, b, c, d, x[i+ 8], 7 ,  1770035416);
    d = md5_ff(d, a, b, c, x[i+ 9], 12, -1958414417);
    c = md5_ff(c, d, a, b, x[i+10], 17, -42063);
    b = md5_ff(b, c, d, a, x[i+11], 22, -1990404162);
    a = md5_ff(a, b, c, d, x[i+12], 7 ,  1804603682);
    d = md5_ff(d, a, b, c, x[i+13], 12, -40341101);
    c = md5_ff(c, d, a, b, x[i+14], 17, -1502002290);
    b = md5_ff(b, c, d, a, x[i+15], 22,  1236535329);

    a = md5_gg(a, b, c, d, x[i+ 1], 5 , -165796510);
    d = md5_gg(d, a, b, c, x[i+ 6], 9 , -1069501632);
    c = md5_gg(c, d, a, b, x[i+11], 14,  643717713);
    b = md5_gg(b, c, d, a, x[i+ 0], 20, -373897302);
    a = md5_gg(a, b, c, d, x[i+ 5], 5 , -701558691);
    d = md5_gg(d, a, b, c, x[i+10], 9 ,  38016083);
    c = md5_gg(c, d, a, b, x[i+15], 14, -660478335);
    b = md5_gg(b, c, d, a, x[i+ 4], 20, -405537848);
    a = md5_gg(a, b, c, d, x[i+ 9], 5 ,  568446438);
    d = md5_gg(d, a, b, c, x[i+14], 9 , -1019803690);
    c = md5_gg(c, d, a, b, x[i+ 3], 14, -187363961);
    b = md5_gg(b, c, d, a, x[i+ 8], 20,  1163531501);
    a = md5_gg(a, b, c, d, x[i+13], 5 , -1444681467);
    d = md5_gg(d, a, b, c, x[i+ 2], 9 , -51403784);
    c = md5_gg(c, d, a, b, x[i+ 7], 14,  1735328473);
    b = md5_gg(b, c, d, a, x[i+12], 20, -1926607734);

    a = md5_hh(a, b, c, d, x[i+ 5], 4 , -378558);
    d = md5_hh(d, a, b, c, x[i+ 8], 11, -2022574463);
    c = md5_hh(c, d, a, b, x[i+11], 16,  1839030562);
    b = md5_hh(b, c, d, a, x[i+14], 23, -35309556);
    a = md5_hh(a, b, c, d, x[i+ 1], 4 , -1530992060);
    d = md5_hh(d, a, b, c, x[i+ 4], 11,  1272893353);
    c = md5_hh(c, d, a, b, x[i+ 7], 16, -155497632);
    b = md5_hh(b, c, d, a, x[i+10], 23, -1094730640);
    a = md5_hh(a, b, c, d, x[i+13], 4 ,  681279174);
    d = md5_hh(d, a, b, c, x[i+ 0], 11, -358537222);
    c = md5_hh(c, d, a, b, x[i+ 3], 16, -722521979);
    b = md5_hh(b, c, d, a, x[i+ 6], 23,  76029189);
    a = md5_hh(a, b, c, d, x[i+ 9], 4 , -640364487);
    d = md5_hh(d, a, b, c, x[i+12], 11, -421815835);
    c = md5_hh(c, d, a, b, x[i+15], 16,  530742520);
    b = md5_hh(b, c, d, a, x[i+ 2], 23, -995338651);

    a = md5_ii(a, b, c, d, x[i+ 0], 6 , -198630844);
    d = md5_ii(d, a, b, c, x[i+ 7], 10,  1126891415);
    c = md5_ii(c, d, a, b, x[i+14], 15, -1416354905);
    b = md5_ii(b, c, d, a, x[i+ 5], 21, -57434055);
    a = md5_ii(a, b, c, d, x[i+12], 6 ,  1700485571);
    d = md5_ii(d, a, b, c, x[i+ 3], 10, -1894986606);
    c = md5_ii(c, d, a, b, x[i+10], 15, -1051523);
    b = md5_ii(b, c, d, a, x[i+ 1], 21, -2054922799);
    a = md5_ii(a, b, c, d, x[i+ 8], 6 ,  1873313359);
    d = md5_ii(d, a, b, c, x[i+15], 10, -30611744);
    c = md5_ii(c, d, a, b, x[i+ 6], 15, -1560198380);
    b = md5_ii(b, c, d, a, x[i+13], 21,  1309151649);
    a = md5_ii(a, b, c, d, x[i+ 4], 6 , -145523070);
    d = md5_ii(d, a, b, c, x[i+11], 10, -1120210379);
    c = md5_ii(c, d, a, b, x[i+ 2], 15,  718787259);
    b = md5_ii(b, c, d, a, x[i+ 9], 21, -343485551);

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
  }
  return Array(a, b, c, d);

}

/*
 * These functions implement the four basic operations the algorithm uses.
 */
function md5_cmn(q, a, b, x, s, t)
{
  return safe_add(bit_rol(safe_add(safe_add(a, q), safe_add(x, t)), s),b);
}
function md5_ff(a, b, c, d, x, s, t)
{
  return md5_cmn((b & c) | ((~b) & d), a, b, x, s, t);
}
function md5_gg(a, b, c, d, x, s, t)
{
  return md5_cmn((b & d) | (c & (~d)), a, b, x, s, t);
}
function md5_hh(a, b, c, d, x, s, t)
{
  return md5_cmn(b ^ c ^ d, a, b, x, s, t);
}
function md5_ii(a, b, c, d, x, s, t)
{
  return md5_cmn(c ^ (b | (~d)), a, b, x, s, t);
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function bit_rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function md5(buf) {
  return helpers.hash(buf, core_md5, 16);
};

},{"./helpers":18}],21:[function(_dereq_,module,exports){
// Original code adapted from Robert Kieffer.
// details at https://github.com/broofa/node-uuid
(function() {
  var _global = this;

  var mathRNG, whatwgRNG;

  // NOTE: Math.random() does not guarantee "cryptographic quality"
  mathRNG = function(size) {
    var bytes = new Array(size);
    var r;

    for (var i = 0, r; i < size; i++) {
      if ((i & 0x03) == 0) r = Math.random() * 0x100000000;
      bytes[i] = r >>> ((i & 0x03) << 3) & 0xff;
    }

    return bytes;
  }

  if (_global.crypto && crypto.getRandomValues) {
    whatwgRNG = function(size) {
      var bytes = new Uint8Array(size);
      crypto.getRandomValues(bytes);
      return bytes;
    }
  }

  module.exports = whatwgRNG || mathRNG;

}())

},{}],22:[function(_dereq_,module,exports){
/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */

var helpers = _dereq_('./helpers');

/*
 * Calculate the SHA-1 of an array of big-endian words, and a bit length
 */
function core_sha1(x, len)
{
  /* append padding */
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = len;

  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;

  for(var i = 0; i < x.length; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  return Array(a, b, c, d, e);

}

/*
 * Perform the appropriate triplet combination function for the current
 * iteration
 */
function sha1_ft(t, b, c, d)
{
  if(t < 20) return (b & c) | ((~b) & d);
  if(t < 40) return b ^ c ^ d;
  if(t < 60) return (b & c) | (b & d) | (c & d);
  return b ^ c ^ d;
}

/*
 * Determine the appropriate additive constant for the current iteration
 */
function sha1_kt(t)
{
  return (t < 20) ?  1518500249 : (t < 40) ?  1859775393 :
         (t < 60) ? -1894007588 : -899497514;
}

/*
 * Add integers, wrapping at 2^32. This uses 16-bit operations internally
 * to work around bugs in some JS interpreters.
 */
function safe_add(x, y)
{
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
}

/*
 * Bitwise rotate a 32-bit number to the left.
 */
function rol(num, cnt)
{
  return (num << cnt) | (num >>> (32 - cnt));
}

module.exports = function sha1(buf) {
  return helpers.hash(buf, core_sha1, 20, true);
};

},{"./helpers":18}],23:[function(_dereq_,module,exports){

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */

var helpers = _dereq_('./helpers');

var safe_add = function(x, y) {
  var lsw = (x & 0xFFFF) + (y & 0xFFFF);
  var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
  return (msw << 16) | (lsw & 0xFFFF);
};

var S = function(X, n) {
  return (X >>> n) | (X << (32 - n));
};

var R = function(X, n) {
  return (X >>> n);
};

var Ch = function(x, y, z) {
  return ((x & y) ^ ((~x) & z));
};

var Maj = function(x, y, z) {
  return ((x & y) ^ (x & z) ^ (y & z));
};

var Sigma0256 = function(x) {
  return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
};

var Sigma1256 = function(x) {
  return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
};

var Gamma0256 = function(x) {
  return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
};

var Gamma1256 = function(x) {
  return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
};

var core_sha256 = function(m, l) {
  var K = new Array(0x428A2F98,0x71374491,0xB5C0FBCF,0xE9B5DBA5,0x3956C25B,0x59F111F1,0x923F82A4,0xAB1C5ED5,0xD807AA98,0x12835B01,0x243185BE,0x550C7DC3,0x72BE5D74,0x80DEB1FE,0x9BDC06A7,0xC19BF174,0xE49B69C1,0xEFBE4786,0xFC19DC6,0x240CA1CC,0x2DE92C6F,0x4A7484AA,0x5CB0A9DC,0x76F988DA,0x983E5152,0xA831C66D,0xB00327C8,0xBF597FC7,0xC6E00BF3,0xD5A79147,0x6CA6351,0x14292967,0x27B70A85,0x2E1B2138,0x4D2C6DFC,0x53380D13,0x650A7354,0x766A0ABB,0x81C2C92E,0x92722C85,0xA2BFE8A1,0xA81A664B,0xC24B8B70,0xC76C51A3,0xD192E819,0xD6990624,0xF40E3585,0x106AA070,0x19A4C116,0x1E376C08,0x2748774C,0x34B0BCB5,0x391C0CB3,0x4ED8AA4A,0x5B9CCA4F,0x682E6FF3,0x748F82EE,0x78A5636F,0x84C87814,0x8CC70208,0x90BEFFFA,0xA4506CEB,0xBEF9A3F7,0xC67178F2);
  var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);
    var W = new Array(64);
    var a, b, c, d, e, f, g, h, i, j;
    var T1, T2;
  /* append padding */
  m[l >> 5] |= 0x80 << (24 - l % 32);
  m[((l + 64 >> 9) << 4) + 15] = l;
  for (var i = 0; i < m.length; i += 16) {
    a = HASH[0]; b = HASH[1]; c = HASH[2]; d = HASH[3]; e = HASH[4]; f = HASH[5]; g = HASH[6]; h = HASH[7];
    for (var j = 0; j < 64; j++) {
      if (j < 16) {
        W[j] = m[j + i];
      } else {
        W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);
      }
      T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
      T2 = safe_add(Sigma0256(a), Maj(a, b, c));
      h = g; g = f; f = e; e = safe_add(d, T1); d = c; c = b; b = a; a = safe_add(T1, T2);
    }
    HASH[0] = safe_add(a, HASH[0]); HASH[1] = safe_add(b, HASH[1]); HASH[2] = safe_add(c, HASH[2]); HASH[3] = safe_add(d, HASH[3]);
    HASH[4] = safe_add(e, HASH[4]); HASH[5] = safe_add(f, HASH[5]); HASH[6] = safe_add(g, HASH[6]); HASH[7] = safe_add(h, HASH[7]);
  }
  return HASH;
};

module.exports = function sha256(buf) {
  return helpers.hash(buf, core_sha256, 32, true);
};

},{"./helpers":18}],24:[function(_dereq_,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],25:[function(_dereq_,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],26:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],27:[function(_dereq_,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],28:[function(_dereq_,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = _dereq_('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = _dereq_('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,_dereq_("/home/dean/osc-workspaces/ws-bwallet-web/bwallet.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":27,"/home/dean/osc-workspaces/ws-bwallet-web/bwallet.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":26,"inherits":25}],29:[function(_dereq_,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	"use strict";
	if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval) {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	"use strict";
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if (typeof target !== "object" && typeof target !== "function" || target == undefined) {
			target = {};
	}

	for (; i < length; ++i) {
		// Only deal with non-null/undefined values
		if ((options = arguments[i]) != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],30:[function(_dereq_,module,exports){
'use strict';

var asap = _dereq_('asap')

module.exports = Promise
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  var state = null
  var value = null
  var deferreds = []
  var self = this

  this.then = function(onFulfilled, onRejected) {
    return new Promise(function(resolve, reject) {
      handle(new Handler(onFulfilled, onRejected, resolve, reject))
    })
  }

  function handle(deferred) {
    if (state === null) {
      deferreds.push(deferred)
      return
    }
    asap(function() {
      var cb = state ? deferred.onFulfilled : deferred.onRejected
      if (cb === null) {
        (state ? deferred.resolve : deferred.reject)(value)
        return
      }
      var ret
      try {
        ret = cb(value)
      }
      catch (e) {
        deferred.reject(e)
        return
      }
      deferred.resolve(ret)
    })
  }

  function resolve(newValue) {
    try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then
        if (typeof then === 'function') {
          doResolve(then.bind(newValue), resolve, reject)
          return
        }
      }
      state = true
      value = newValue
      finale()
    } catch (e) { reject(e) }
  }

  function reject(newValue) {
    state = false
    value = newValue
    finale()
  }

  function finale() {
    for (var i = 0, len = deferreds.length; i < len; i++)
      handle(deferreds[i])
    deferreds = null
  }

  doResolve(fn, resolve, reject)
}


function Handler(onFulfilled, onRejected, resolve, reject){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.resolve = resolve
  this.reject = reject
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, onFulfilled, onRejected) {
  var done = false;
  try {
    fn(function (value) {
      if (done) return
      done = true
      onFulfilled(value)
    }, function (reason) {
      if (done) return
      done = true
      onRejected(reason)
    })
  } catch (ex) {
    if (done) return
    done = true
    onRejected(ex)
  }
}

},{"asap":32}],31:[function(_dereq_,module,exports){
'use strict';

//This file contains then/promise specific extensions to the core promise API

var Promise = _dereq_('./core.js')
var asap = _dereq_('asap')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Object.create(Promise.prototype)

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.from = Promise.cast = function (value) {
  var err = new Error('Promise.from and Promise.cast are deprecated, use Promise.resolve instead')
  err.name = 'Warning'
  console.warn(err.stack)
  return Promise.resolve(value)
}

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      fn.apply(self, args)
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    try {
      return fn.apply(this, arguments).nodeify(callback)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback(ex)
        })
      }
    }
  }
}

Promise.all = function () {
  var calledWithArray = arguments.length === 1 && Array.isArray(arguments[0])
  var args = Array.prototype.slice.call(calledWithArray ? arguments[0] : arguments)

  if (!calledWithArray) {
    var err = new Error('Promise.all should be called with a single array, calling it with multiple arguments is deprecated')
    err.name = 'Warning'
    console.warn(err.stack)
  }

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      try {
        if (val && (typeof val === 'object' || typeof val === 'function')) {
          var then = val.then
          if (typeof then === 'function') {
            then.call(val, function (val) { res(i, val) }, reject)
            return
          }
        }
        args[i] = val
        if (--remaining === 0) {
          resolve(args);
        }
      } catch (ex) {
        reject(ex)
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    asap(function () {
      throw err
    })
  })
}

Promise.prototype.nodeify = function (callback) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback(null, value)
    })
  }, function (err) {
    asap(function () {
      callback(err)
    })
  })
}

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":30,"asap":32}],32:[function(_dereq_,module,exports){
(function (process){

// Use the fastest possible means to execute a task in a future turn
// of the event loop.

// linked list of tasks (single, with head node)
var head = {task: void 0, next: null};
var tail = head;
var flushing = false;
var requestFlush = void 0;
var isNodeJS = false;

function flush() {
    /* jshint loopfunc: true */

    while (head.next) {
        head = head.next;
        var task = head.task;
        head.task = void 0;
        var domain = head.domain;

        if (domain) {
            head.domain = void 0;
            domain.enter();
        }

        try {
            task();

        } catch (e) {
            if (isNodeJS) {
                // In node, uncaught exceptions are considered fatal errors.
                // Re-throw them synchronously to interrupt flushing!

                // Ensure continuation if the uncaught exception is suppressed
                // listening "uncaughtException" events (as domains does).
                // Continue in next event to avoid tick recursion.
                if (domain) {
                    domain.exit();
                }
                setTimeout(flush, 0);
                if (domain) {
                    domain.enter();
                }

                throw e;

            } else {
                // In browsers, uncaught exceptions are not fatal.
                // Re-throw them asynchronously to avoid slow-downs.
                setTimeout(function() {
                   throw e;
                }, 0);
            }
        }

        if (domain) {
            domain.exit();
        }
    }

    flushing = false;
}

if (typeof process !== "undefined" && process.nextTick) {
    // Node.js before 0.9. Note that some fake-Node environments, like the
    // Mocha test runner, introduce a `process` global without a `nextTick`.
    isNodeJS = true;

    requestFlush = function () {
        process.nextTick(flush);
    };

} else if (typeof setImmediate === "function") {
    // In IE10, Node.js 0.9+, or https://github.com/NobleJS/setImmediate
    if (typeof window !== "undefined") {
        requestFlush = setImmediate.bind(window, flush);
    } else {
        requestFlush = function () {
            setImmediate(flush);
        };
    }

} else if (typeof MessageChannel !== "undefined") {
    // modern browsers
    // http://www.nonblocking.io/2011/06/windownexttick.html
    var channel = new MessageChannel();
    channel.port1.onmessage = flush;
    requestFlush = function () {
        channel.port2.postMessage(0);
    };

} else {
    // old browsers
    requestFlush = function () {
        setTimeout(flush, 0);
    };
}

function asap(task) {
    tail = tail.next = {
        task: task,
        domain: isNodeJS && process.domain,
        next: null
    };

    if (!flushing) {
        flushing = true;
        requestFlush();
    }
};

module.exports = asap;


}).call(this,_dereq_("/home/dean/osc-workspaces/ws-bwallet-web/bwallet.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/home/dean/osc-workspaces/ws-bwallet-web/bwallet.js/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":26}],33:[function(_dereq_,module,exports){
var traverse = module.exports = function (obj) {
    return new Traverse(obj);
};

function Traverse (obj) {
    this.value = obj;
}

Traverse.prototype.get = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            node = undefined;
            break;
        }
        node = node[key];
    }
    return node;
};

Traverse.prototype.has = function (ps) {
    var node = this.value;
    for (var i = 0; i < ps.length; i ++) {
        var key = ps[i];
        if (!node || !hasOwnProperty.call(node, key)) {
            return false;
        }
        node = node[key];
    }
    return true;
};

Traverse.prototype.set = function (ps, value) {
    var node = this.value;
    for (var i = 0; i < ps.length - 1; i ++) {
        var key = ps[i];
        if (!hasOwnProperty.call(node, key)) node[key] = {};
        node = node[key];
    }
    node[ps[i]] = value;
    return value;
};

Traverse.prototype.map = function (cb) {
    return walk(this.value, cb, true);
};

Traverse.prototype.forEach = function (cb) {
    this.value = walk(this.value, cb, false);
    return this.value;
};

Traverse.prototype.reduce = function (cb, init) {
    var skip = arguments.length === 1;
    var acc = skip ? this.value : init;
    this.forEach(function (x) {
        if (!this.isRoot || !skip) {
            acc = cb.call(this, acc, x);
        }
    });
    return acc;
};

Traverse.prototype.paths = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.path); 
    });
    return acc;
};

Traverse.prototype.nodes = function () {
    var acc = [];
    this.forEach(function (x) {
        acc.push(this.node);
    });
    return acc;
};

Traverse.prototype.clone = function () {
    var parents = [], nodes = [];
    
    return (function clone (src) {
        for (var i = 0; i < parents.length; i++) {
            if (parents[i] === src) {
                return nodes[i];
            }
        }
        
        if (typeof src === 'object' && src !== null) {
            var dst = copy(src);
            
            parents.push(src);
            nodes.push(dst);
            
            forEach(objectKeys(src), function (key) {
                dst[key] = clone(src[key]);
            });
            
            parents.pop();
            nodes.pop();
            return dst;
        }
        else {
            return src;
        }
    })(this.value);
};

function walk (root, cb, immutable) {
    var path = [];
    var parents = [];
    var alive = true;
    
    return (function walker (node_) {
        var node = immutable ? copy(node_) : node_;
        var modifiers = {};
        
        var keepGoing = true;
        
        var state = {
            node : node,
            node_ : node_,
            path : [].concat(path),
            parent : parents[parents.length - 1],
            parents : parents,
            key : path.slice(-1)[0],
            isRoot : path.length === 0,
            level : path.length,
            circular : null,
            update : function (x, stopHere) {
                if (!state.isRoot) {
                    state.parent.node[state.key] = x;
                }
                state.node = x;
                if (stopHere) keepGoing = false;
            },
            'delete' : function (stopHere) {
                delete state.parent.node[state.key];
                if (stopHere) keepGoing = false;
            },
            remove : function (stopHere) {
                if (isArray(state.parent.node)) {
                    state.parent.node.splice(state.key, 1);
                }
                else {
                    delete state.parent.node[state.key];
                }
                if (stopHere) keepGoing = false;
            },
            keys : null,
            before : function (f) { modifiers.before = f },
            after : function (f) { modifiers.after = f },
            pre : function (f) { modifiers.pre = f },
            post : function (f) { modifiers.post = f },
            stop : function () { alive = false },
            block : function () { keepGoing = false }
        };
        
        if (!alive) return state;
        
        function updateState() {
            if (typeof state.node === 'object' && state.node !== null) {
                if (!state.keys || state.node_ !== state.node) {
                    state.keys = objectKeys(state.node)
                }
                
                state.isLeaf = state.keys.length == 0;
                
                for (var i = 0; i < parents.length; i++) {
                    if (parents[i].node_ === node_) {
                        state.circular = parents[i];
                        break;
                    }
                }
            }
            else {
                state.isLeaf = true;
                state.keys = null;
            }
            
            state.notLeaf = !state.isLeaf;
            state.notRoot = !state.isRoot;
        }
        
        updateState();
        
        // use return values to update if defined
        var ret = cb.call(state, state.node);
        if (ret !== undefined && state.update) state.update(ret);
        
        if (modifiers.before) modifiers.before.call(state, state.node);
        
        if (!keepGoing) return state;
        
        if (typeof state.node == 'object'
        && state.node !== null && !state.circular) {
            parents.push(state);
            
            updateState();
            
            forEach(state.keys, function (key, i) {
                path.push(key);
                
                if (modifiers.pre) modifiers.pre.call(state, state.node[key], key);
                
                var child = walker(state.node[key]);
                if (immutable && hasOwnProperty.call(state.node, key)) {
                    state.node[key] = child.node;
                }
                
                child.isLast = i == state.keys.length - 1;
                child.isFirst = i == 0;
                
                if (modifiers.post) modifiers.post.call(state, child);
                
                path.pop();
            });
            parents.pop();
        }
        
        if (modifiers.after) modifiers.after.call(state, state.node);
        
        return state;
    })(root).node;
}

function copy (src) {
    if (typeof src === 'object' && src !== null) {
        var dst;
        
        if (isArray(src)) {
            dst = [];
        }
        else if (isDate(src)) {
            dst = new Date(src.getTime ? src.getTime() : src);
        }
        else if (isRegExp(src)) {
            dst = new RegExp(src);
        }
        else if (isError(src)) {
            dst = { message: src.message };
        }
        else if (isBoolean(src)) {
            dst = new Boolean(src);
        }
        else if (isNumber(src)) {
            dst = new Number(src);
        }
        else if (isString(src)) {
            dst = new String(src);
        }
        else if (Object.create && Object.getPrototypeOf) {
            dst = Object.create(Object.getPrototypeOf(src));
        }
        else if (src.constructor === Object) {
            dst = {};
        }
        else {
            var proto =
                (src.constructor && src.constructor.prototype)
                || src.__proto__
                || {}
            ;
            var T = function () {};
            T.prototype = proto;
            dst = new T;
        }
        
        forEach(objectKeys(src), function (key) {
            dst[key] = src[key];
        });
        return dst;
    }
    else return src;
}

var objectKeys = Object.keys || function keys (obj) {
    var res = [];
    for (var key in obj) res.push(key)
    return res;
};

function toS (obj) { return Object.prototype.toString.call(obj) }
function isDate (obj) { return toS(obj) === '[object Date]' }
function isRegExp (obj) { return toS(obj) === '[object RegExp]' }
function isError (obj) { return toS(obj) === '[object Error]' }
function isBoolean (obj) { return toS(obj) === '[object Boolean]' }
function isNumber (obj) { return toS(obj) === '[object Number]' }
function isString (obj) { return toS(obj) === '[object String]' }

var isArray = Array.isArray || function isArray (xs) {
    return Object.prototype.toString.call(xs) === '[object Array]';
};

var forEach = function (xs, fn) {
    if (xs.forEach) return xs.forEach(fn)
    else for (var i = 0; i < xs.length; i++) {
        fn(xs[i], i, xs);
    }
};

forEach(objectKeys(Traverse.prototype), function (key) {
    traverse[key] = function (obj) {
        var args = [].slice.call(arguments, 1);
        var t = new Traverse(obj);
        return t[key].apply(t, args);
    };
});

var hasOwnProperty = Object.hasOwnProperty || function (obj, key) {
    return key in obj;
};

},{}],34:[function(_dereq_,module,exports){
(function (root) {
   "use strict";

/***** unorm.js *****/

/*
 * UnicodeNormalizer 1.0.0
 * Copyright (c) 2008 Matsuza
 * Dual licensed under the MIT (MIT-LICENSE.txt) and GPL (GPL-LICENSE.txt) licenses.
 * $Date: 2008-06-05 16:44:17 +0200 (Thu, 05 Jun 2008) $
 * $Rev: 13309 $
 */

   var DEFAULT_FEATURE = [null, 0, {}];
   var CACHE_THRESHOLD = 10;
   var SBase = 0xAC00, LBase = 0x1100, VBase = 0x1161, TBase = 0x11A7, LCount = 19, VCount = 21, TCount = 28;
   var NCount = VCount * TCount; // 588
   var SCount = LCount * NCount; // 11172

   var UChar = function(cp, feature){
      this.codepoint = cp;
      this.feature = feature;
   };

   // Strategies
   var cache = {};
   var cacheCounter = [];
   for (var i = 0; i <= 0xFF; ++i){
      cacheCounter[i] = 0;
   }

   function fromCache(next, cp, needFeature){
      var ret = cache[cp];
      if(!ret){
         ret = next(cp, needFeature);
         if(!!ret.feature && ++cacheCounter[(cp >> 8) & 0xFF] > CACHE_THRESHOLD){
            cache[cp] = ret;
         }
      }
      return ret;
   }

   function fromData(next, cp, needFeature){
      var hash = cp & 0xFF00;
      var dunit = UChar.udata[hash] || {};
      var f = dunit[cp];
      return f ? new UChar(cp, f) : new UChar(cp, DEFAULT_FEATURE);
   }
   function fromCpOnly(next, cp, needFeature){
      return !!needFeature ? next(cp, needFeature) : new UChar(cp, null);
   }
   function fromRuleBasedJamo(next, cp, needFeature){
      var j;
      if(cp < LBase || (LBase + LCount <= cp && cp < SBase) || (SBase + SCount < cp)){
         return next(cp, needFeature);
      }
      if(LBase <= cp && cp < LBase + LCount){
         var c = {};
         var base = (cp - LBase) * VCount;
         for (j = 0; j < VCount; ++j){
            c[VBase + j] = SBase + TCount * (j + base);
         }
         return new UChar(cp, [,,c]);
      }

      var SIndex = cp - SBase;
      var TIndex = SIndex % TCount;
      var feature = [];
      if(TIndex !== 0){
         feature[0] = [SBase + SIndex - TIndex, TBase + TIndex];
      } else {
         feature[0] = [LBase + Math.floor(SIndex / NCount), VBase + Math.floor((SIndex % NCount) / TCount)];
         feature[2] = {};
         for (j = 1; j < TCount; ++j){
            feature[2][TBase + j] = cp + j;
         }
      }
      return new UChar(cp, feature);
   }
   function fromCpFilter(next, cp, needFeature){
      return cp < 60 || 13311 < cp && cp < 42607 ? new UChar(cp, DEFAULT_FEATURE) : next(cp, needFeature);
   }

   var strategies = [fromCpFilter, fromCache, fromCpOnly, fromRuleBasedJamo, fromData];

   UChar.fromCharCode = strategies.reduceRight(function (next, strategy) {
      return function (cp, needFeature) {
         return strategy(next, cp, needFeature);
      };
   }, null);

   UChar.isHighSurrogate = function(cp){
      return cp >= 0xD800 && cp <= 0xDBFF;
   };
   UChar.isLowSurrogate = function(cp){
      return cp >= 0xDC00 && cp <= 0xDFFF;
   };

   UChar.prototype.prepFeature = function(){
      if(!this.feature){
         this.feature = UChar.fromCharCode(this.codepoint, true).feature;
      }
   };

   UChar.prototype.toString = function(){
      if(this.codepoint < 0x10000){
         return String.fromCharCode(this.codepoint);
      } else {
         var x = this.codepoint - 0x10000;
         return String.fromCharCode(Math.floor(x / 0x400) + 0xD800, x % 0x400 + 0xDC00);
      }
   };

   UChar.prototype.getDecomp = function(){
      this.prepFeature();
      return this.feature[0] || null;
   };

   UChar.prototype.isCompatibility = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 8));
   };
   UChar.prototype.isExclude = function(){
      this.prepFeature();
      return !!this.feature[1] && (this.feature[1] & (1 << 9));
   };
   UChar.prototype.getCanonicalClass = function(){
      this.prepFeature();
      return !!this.feature[1] ? (this.feature[1] & 0xff) : 0;
   };
   UChar.prototype.getComposite = function(following){
      this.prepFeature();
      if(!this.feature[2]){
         return null;
      }
      var cp = this.feature[2][following.codepoint];
      return cp ? UChar.fromCharCode(cp) : null;
   };

   var UCharIterator = function(str){
      this.str = str;
      this.cursor = 0;
   };
   UCharIterator.prototype.next = function(){
      if(!!this.str && this.cursor < this.str.length){
         var cp = this.str.charCodeAt(this.cursor++);
         var d;
         if(UChar.isHighSurrogate(cp) && this.cursor < this.str.length && UChar.isLowSurrogate((d = this.str.charCodeAt(this.cursor)))){
            cp = (cp - 0xD800) * 0x400 + (d -0xDC00) + 0x10000;
            ++this.cursor;
         }
         return UChar.fromCharCode(cp);
      } else {
         this.str = null;
         return null;
      }
   };

   var RecursDecompIterator = function(it, cano){
      this.it = it;
      this.canonical = cano;
      this.resBuf = [];
   };

   RecursDecompIterator.prototype.next = function(){
      function recursiveDecomp(cano, uchar){
         var decomp = uchar.getDecomp();
         if(!!decomp && !(cano && uchar.isCompatibility())){
            var ret = [];
            for(var i = 0; i < decomp.length; ++i){
               var a = recursiveDecomp(cano, UChar.fromCharCode(decomp[i]));
               //ret.concat(a); //<-why does not this work?
               //following block is a workaround.
               for(var j = 0; j < a.length; ++j){
                  ret.push(a[j]);
               }
            }
            return ret;
         } else {
            return [uchar];
         }
      }
      if(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            return null;
         }
         this.resBuf = recursiveDecomp(this.canonical, uchar);
      }
      return this.resBuf.shift();
   };

   var DecompIterator = function(it){
      this.it = it;
      this.resBuf = [];
   };

   DecompIterator.prototype.next = function(){
      var cc;
      if(this.resBuf.length === 0){
         do{
            var uchar = this.it.next();
            if(!uchar){
               break;
            }
            cc = uchar.getCanonicalClass();
            var inspt = this.resBuf.length;
            if(cc !== 0){
               for(; inspt > 0; --inspt){
                  var uchar2 = this.resBuf[inspt - 1];
                  var cc2 = uchar2.getCanonicalClass();
                  if(cc2 <= cc){
                     break;
                  }
               }
            }
            this.resBuf.splice(inspt, 0, uchar);
         } while(cc !== 0);
      }
      return this.resBuf.shift();
   };

   var CompIterator = function(it){
      this.it = it;
      this.procBuf = [];
      this.resBuf = [];
      this.lastClass = null;
   };

   CompIterator.prototype.next = function(){
      while(this.resBuf.length === 0){
         var uchar = this.it.next();
         if(!uchar){
            this.resBuf = this.procBuf;
            this.procBuf = [];
            break;
         }
         if(this.procBuf.length === 0){
            this.lastClass = uchar.getCanonicalClass();
            this.procBuf.push(uchar);
         } else {
            var starter = this.procBuf[0];
            var composite = starter.getComposite(uchar);
            var cc = uchar.getCanonicalClass();
            if(!!composite && (this.lastClass < cc || this.lastClass === 0)){
               this.procBuf[0] = composite;
            } else {
               if(cc === 0){
                  this.resBuf = this.procBuf;
                  this.procBuf = [];
               }
               this.lastClass = cc;
               this.procBuf.push(uchar);
            }
         }
      }
      return this.resBuf.shift();
   };

   var createIterator = function(mode, str){
      switch(mode){
         case "NFD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true));
         case "NFKD":
            return new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false));
         case "NFC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), true)));
         case "NFKC":
            return new CompIterator(new DecompIterator(new RecursDecompIterator(new UCharIterator(str), false)));
      }
      throw mode + " is invalid";
   };
   var normalize = function(mode, str){
      var it = createIterator(mode, str);
      var ret = "";
      var uchar;
      while(!!(uchar = it.next())){
         ret += uchar.toString();
      }
      return ret;
   };

   /* API functions */
   function nfd(str){
      return normalize("NFD", str);
   }

   function nfkd(str){
      return normalize("NFKD", str);
   }

   function nfc(str){
      return normalize("NFC", str);
   }

   function nfkc(str){
      return normalize("NFKC", str);
   }

/* Unicode data */
UChar.udata={
0:{60:[,,{824:8814}],61:[,,{824:8800}],62:[,,{824:8815}],65:[,,{768:192,769:193,770:194,771:195,772:256,774:258,775:550,776:196,777:7842,778:197,780:461,783:512,785:514,803:7840,805:7680,808:260}],66:[,,{775:7682,803:7684,817:7686}],67:[,,{769:262,770:264,775:266,780:268,807:199}],68:[,,{775:7690,780:270,803:7692,807:7696,813:7698,817:7694}],69:[,,{768:200,769:201,770:202,771:7868,772:274,774:276,775:278,776:203,777:7866,780:282,783:516,785:518,803:7864,807:552,808:280,813:7704,816:7706}],70:[,,{775:7710}],71:[,,{769:500,770:284,772:7712,774:286,775:288,780:486,807:290}],72:[,,{770:292,775:7714,776:7718,780:542,803:7716,807:7720,814:7722}],73:[,,{768:204,769:205,770:206,771:296,772:298,774:300,775:304,776:207,777:7880,780:463,783:520,785:522,803:7882,808:302,816:7724}],74:[,,{770:308}],75:[,,{769:7728,780:488,803:7730,807:310,817:7732}],76:[,,{769:313,780:317,803:7734,807:315,813:7740,817:7738}],77:[,,{769:7742,775:7744,803:7746}],78:[,,{768:504,769:323,771:209,775:7748,780:327,803:7750,807:325,813:7754,817:7752}],79:[,,{768:210,769:211,770:212,771:213,772:332,774:334,775:558,776:214,777:7886,779:336,780:465,783:524,785:526,795:416,803:7884,808:490}],80:[,,{769:7764,775:7766}],82:[,,{769:340,775:7768,780:344,783:528,785:530,803:7770,807:342,817:7774}],83:[,,{769:346,770:348,775:7776,780:352,803:7778,806:536,807:350}],84:[,,{775:7786,780:356,803:7788,806:538,807:354,813:7792,817:7790}],85:[,,{768:217,769:218,770:219,771:360,772:362,774:364,776:220,777:7910,778:366,779:368,780:467,783:532,785:534,795:431,803:7908,804:7794,808:370,813:7798,816:7796}],86:[,,{771:7804,803:7806}],87:[,,{768:7808,769:7810,770:372,775:7814,776:7812,803:7816}],88:[,,{775:7818,776:7820}],89:[,,{768:7922,769:221,770:374,771:7928,772:562,775:7822,776:376,777:7926,803:7924}],90:[,,{769:377,770:7824,775:379,780:381,803:7826,817:7828}],97:[,,{768:224,769:225,770:226,771:227,772:257,774:259,775:551,776:228,777:7843,778:229,780:462,783:513,785:515,803:7841,805:7681,808:261}],98:[,,{775:7683,803:7685,817:7687}],99:[,,{769:263,770:265,775:267,780:269,807:231}],100:[,,{775:7691,780:271,803:7693,807:7697,813:7699,817:7695}],101:[,,{768:232,769:233,770:234,771:7869,772:275,774:277,775:279,776:235,777:7867,780:283,783:517,785:519,803:7865,807:553,808:281,813:7705,816:7707}],102:[,,{775:7711}],103:[,,{769:501,770:285,772:7713,774:287,775:289,780:487,807:291}],104:[,,{770:293,775:7715,776:7719,780:543,803:7717,807:7721,814:7723,817:7830}],105:[,,{768:236,769:237,770:238,771:297,772:299,774:301,776:239,777:7881,780:464,783:521,785:523,803:7883,808:303,816:7725}],106:[,,{770:309,780:496}],107:[,,{769:7729,780:489,803:7731,807:311,817:7733}],108:[,,{769:314,780:318,803:7735,807:316,813:7741,817:7739}],109:[,,{769:7743,775:7745,803:7747}],110:[,,{768:505,769:324,771:241,775:7749,780:328,803:7751,807:326,813:7755,817:7753}],111:[,,{768:242,769:243,770:244,771:245,772:333,774:335,775:559,776:246,777:7887,779:337,780:466,783:525,785:527,795:417,803:7885,808:491}],112:[,,{769:7765,775:7767}],114:[,,{769:341,775:7769,780:345,783:529,785:531,803:7771,807:343,817:7775}],115:[,,{769:347,770:349,775:7777,780:353,803:7779,806:537,807:351}],116:[,,{775:7787,776:7831,780:357,803:7789,806:539,807:355,813:7793,817:7791}],117:[,,{768:249,769:250,770:251,771:361,772:363,774:365,776:252,777:7911,778:367,779:369,780:468,783:533,785:535,795:432,803:7909,804:7795,808:371,813:7799,816:7797}],118:[,,{771:7805,803:7807}],119:[,,{768:7809,769:7811,770:373,775:7815,776:7813,778:7832,803:7817}],120:[,,{775:7819,776:7821}],121:[,,{768:7923,769:253,770:375,771:7929,772:563,775:7823,776:255,777:7927,778:7833,803:7925}],122:[,,{769:378,770:7825,775:380,780:382,803:7827,817:7829}],160:[[32],256],168:[[32,776],256,{768:8173,769:901,834:8129}],170:[[97],256],175:[[32,772],256],178:[[50],256],179:[[51],256],180:[[32,769],256],181:[[956],256],184:[[32,807],256],185:[[49],256],186:[[111],256],188:[[49,8260,52],256],189:[[49,8260,50],256],190:[[51,8260,52],256],192:[[65,768]],193:[[65,769]],194:[[65,770],,{768:7846,769:7844,771:7850,777:7848}],195:[[65,771]],196:[[65,776],,{772:478}],197:[[65,778],,{769:506}],198:[,,{769:508,772:482}],199:[[67,807],,{769:7688}],200:[[69,768]],201:[[69,769]],202:[[69,770],,{768:7872,769:7870,771:7876,777:7874}],203:[[69,776]],204:[[73,768]],205:[[73,769]],206:[[73,770]],207:[[73,776],,{769:7726}],209:[[78,771]],210:[[79,768]],211:[[79,769]],212:[[79,770],,{768:7890,769:7888,771:7894,777:7892}],213:[[79,771],,{769:7756,772:556,776:7758}],214:[[79,776],,{772:554}],216:[,,{769:510}],217:[[85,768]],218:[[85,769]],219:[[85,770]],220:[[85,776],,{768:475,769:471,772:469,780:473}],221:[[89,769]],224:[[97,768]],225:[[97,769]],226:[[97,770],,{768:7847,769:7845,771:7851,777:7849}],227:[[97,771]],228:[[97,776],,{772:479}],229:[[97,778],,{769:507}],230:[,,{769:509,772:483}],231:[[99,807],,{769:7689}],232:[[101,768]],233:[[101,769]],234:[[101,770],,{768:7873,769:7871,771:7877,777:7875}],235:[[101,776]],236:[[105,768]],237:[[105,769]],238:[[105,770]],239:[[105,776],,{769:7727}],241:[[110,771]],242:[[111,768]],243:[[111,769]],244:[[111,770],,{768:7891,769:7889,771:7895,777:7893}],245:[[111,771],,{769:7757,772:557,776:7759}],246:[[111,776],,{772:555}],248:[,,{769:511}],249:[[117,768]],250:[[117,769]],251:[[117,770]],252:[[117,776],,{768:476,769:472,772:470,780:474}],253:[[121,769]],255:[[121,776]]},
256:{256:[[65,772]],257:[[97,772]],258:[[65,774],,{768:7856,769:7854,771:7860,777:7858}],259:[[97,774],,{768:7857,769:7855,771:7861,777:7859}],260:[[65,808]],261:[[97,808]],262:[[67,769]],263:[[99,769]],264:[[67,770]],265:[[99,770]],266:[[67,775]],267:[[99,775]],268:[[67,780]],269:[[99,780]],270:[[68,780]],271:[[100,780]],274:[[69,772],,{768:7700,769:7702}],275:[[101,772],,{768:7701,769:7703}],276:[[69,774]],277:[[101,774]],278:[[69,775]],279:[[101,775]],280:[[69,808]],281:[[101,808]],282:[[69,780]],283:[[101,780]],284:[[71,770]],285:[[103,770]],286:[[71,774]],287:[[103,774]],288:[[71,775]],289:[[103,775]],290:[[71,807]],291:[[103,807]],292:[[72,770]],293:[[104,770]],296:[[73,771]],297:[[105,771]],298:[[73,772]],299:[[105,772]],300:[[73,774]],301:[[105,774]],302:[[73,808]],303:[[105,808]],304:[[73,775]],306:[[73,74],256],307:[[105,106],256],308:[[74,770]],309:[[106,770]],310:[[75,807]],311:[[107,807]],313:[[76,769]],314:[[108,769]],315:[[76,807]],316:[[108,807]],317:[[76,780]],318:[[108,780]],319:[[76,183],256],320:[[108,183],256],323:[[78,769]],324:[[110,769]],325:[[78,807]],326:[[110,807]],327:[[78,780]],328:[[110,780]],329:[[700,110],256],332:[[79,772],,{768:7760,769:7762}],333:[[111,772],,{768:7761,769:7763}],334:[[79,774]],335:[[111,774]],336:[[79,779]],337:[[111,779]],340:[[82,769]],341:[[114,769]],342:[[82,807]],343:[[114,807]],344:[[82,780]],345:[[114,780]],346:[[83,769],,{775:7780}],347:[[115,769],,{775:7781}],348:[[83,770]],349:[[115,770]],350:[[83,807]],351:[[115,807]],352:[[83,780],,{775:7782}],353:[[115,780],,{775:7783}],354:[[84,807]],355:[[116,807]],356:[[84,780]],357:[[116,780]],360:[[85,771],,{769:7800}],361:[[117,771],,{769:7801}],362:[[85,772],,{776:7802}],363:[[117,772],,{776:7803}],364:[[85,774]],365:[[117,774]],366:[[85,778]],367:[[117,778]],368:[[85,779]],369:[[117,779]],370:[[85,808]],371:[[117,808]],372:[[87,770]],373:[[119,770]],374:[[89,770]],375:[[121,770]],376:[[89,776]],377:[[90,769]],378:[[122,769]],379:[[90,775]],380:[[122,775]],381:[[90,780]],382:[[122,780]],383:[[115],256,{775:7835}],416:[[79,795],,{768:7900,769:7898,771:7904,777:7902,803:7906}],417:[[111,795],,{768:7901,769:7899,771:7905,777:7903,803:7907}],431:[[85,795],,{768:7914,769:7912,771:7918,777:7916,803:7920}],432:[[117,795],,{768:7915,769:7913,771:7919,777:7917,803:7921}],439:[,,{780:494}],452:[[68,381],256],453:[[68,382],256],454:[[100,382],256],455:[[76,74],256],456:[[76,106],256],457:[[108,106],256],458:[[78,74],256],459:[[78,106],256],460:[[110,106],256],461:[[65,780]],462:[[97,780]],463:[[73,780]],464:[[105,780]],465:[[79,780]],466:[[111,780]],467:[[85,780]],468:[[117,780]],469:[[220,772]],470:[[252,772]],471:[[220,769]],472:[[252,769]],473:[[220,780]],474:[[252,780]],475:[[220,768]],476:[[252,768]],478:[[196,772]],479:[[228,772]],480:[[550,772]],481:[[551,772]],482:[[198,772]],483:[[230,772]],486:[[71,780]],487:[[103,780]],488:[[75,780]],489:[[107,780]],490:[[79,808],,{772:492}],491:[[111,808],,{772:493}],492:[[490,772]],493:[[491,772]],494:[[439,780]],495:[[658,780]],496:[[106,780]],497:[[68,90],256],498:[[68,122],256],499:[[100,122],256],500:[[71,769]],501:[[103,769]],504:[[78,768]],505:[[110,768]],506:[[197,769]],507:[[229,769]],508:[[198,769]],509:[[230,769]],510:[[216,769]],511:[[248,769]],66045:[,220]},
512:{512:[[65,783]],513:[[97,783]],514:[[65,785]],515:[[97,785]],516:[[69,783]],517:[[101,783]],518:[[69,785]],519:[[101,785]],520:[[73,783]],521:[[105,783]],522:[[73,785]],523:[[105,785]],524:[[79,783]],525:[[111,783]],526:[[79,785]],527:[[111,785]],528:[[82,783]],529:[[114,783]],530:[[82,785]],531:[[114,785]],532:[[85,783]],533:[[117,783]],534:[[85,785]],535:[[117,785]],536:[[83,806]],537:[[115,806]],538:[[84,806]],539:[[116,806]],542:[[72,780]],543:[[104,780]],550:[[65,775],,{772:480}],551:[[97,775],,{772:481}],552:[[69,807],,{774:7708}],553:[[101,807],,{774:7709}],554:[[214,772]],555:[[246,772]],556:[[213,772]],557:[[245,772]],558:[[79,775],,{772:560}],559:[[111,775],,{772:561}],560:[[558,772]],561:[[559,772]],562:[[89,772]],563:[[121,772]],658:[,,{780:495}],688:[[104],256],689:[[614],256],690:[[106],256],691:[[114],256],692:[[633],256],693:[[635],256],694:[[641],256],695:[[119],256],696:[[121],256],728:[[32,774],256],729:[[32,775],256],730:[[32,778],256],731:[[32,808],256],732:[[32,771],256],733:[[32,779],256],736:[[611],256],737:[[108],256],738:[[115],256],739:[[120],256],740:[[661],256]},
768:{768:[,230],769:[,230],770:[,230],771:[,230],772:[,230],773:[,230],774:[,230],775:[,230],776:[,230,{769:836}],777:[,230],778:[,230],779:[,230],780:[,230],781:[,230],782:[,230],783:[,230],784:[,230],785:[,230],786:[,230],787:[,230],788:[,230],789:[,232],790:[,220],791:[,220],792:[,220],793:[,220],794:[,232],795:[,216],796:[,220],797:[,220],798:[,220],799:[,220],800:[,220],801:[,202],802:[,202],803:[,220],804:[,220],805:[,220],806:[,220],807:[,202],808:[,202],809:[,220],810:[,220],811:[,220],812:[,220],813:[,220],814:[,220],815:[,220],816:[,220],817:[,220],818:[,220],819:[,220],820:[,1],821:[,1],822:[,1],823:[,1],824:[,1],825:[,220],826:[,220],827:[,220],828:[,220],829:[,230],830:[,230],831:[,230],832:[[768],230],833:[[769],230],834:[,230],835:[[787],230],836:[[776,769],230],837:[,240],838:[,230],839:[,220],840:[,220],841:[,220],842:[,230],843:[,230],844:[,230],845:[,220],846:[,220],848:[,230],849:[,230],850:[,230],851:[,220],852:[,220],853:[,220],854:[,220],855:[,230],856:[,232],857:[,220],858:[,220],859:[,230],860:[,233],861:[,234],862:[,234],863:[,233],864:[,234],865:[,234],866:[,233],867:[,230],868:[,230],869:[,230],870:[,230],871:[,230],872:[,230],873:[,230],874:[,230],875:[,230],876:[,230],877:[,230],878:[,230],879:[,230],884:[[697]],890:[[32,837],256],894:[[59]],900:[[32,769],256],901:[[168,769]],902:[[913,769]],903:[[183]],904:[[917,769]],905:[[919,769]],906:[[921,769]],908:[[927,769]],910:[[933,769]],911:[[937,769]],912:[[970,769]],913:[,,{768:8122,769:902,772:8121,774:8120,787:7944,788:7945,837:8124}],917:[,,{768:8136,769:904,787:7960,788:7961}],919:[,,{768:8138,769:905,787:7976,788:7977,837:8140}],921:[,,{768:8154,769:906,772:8153,774:8152,776:938,787:7992,788:7993}],927:[,,{768:8184,769:908,787:8008,788:8009}],929:[,,{788:8172}],933:[,,{768:8170,769:910,772:8169,774:8168,776:939,788:8025}],937:[,,{768:8186,769:911,787:8040,788:8041,837:8188}],938:[[921,776]],939:[[933,776]],940:[[945,769],,{837:8116}],941:[[949,769]],942:[[951,769],,{837:8132}],943:[[953,769]],944:[[971,769]],945:[,,{768:8048,769:940,772:8113,774:8112,787:7936,788:7937,834:8118,837:8115}],949:[,,{768:8050,769:941,787:7952,788:7953}],951:[,,{768:8052,769:942,787:7968,788:7969,834:8134,837:8131}],953:[,,{768:8054,769:943,772:8145,774:8144,776:970,787:7984,788:7985,834:8150}],959:[,,{768:8056,769:972,787:8000,788:8001}],961:[,,{787:8164,788:8165}],965:[,,{768:8058,769:973,772:8161,774:8160,776:971,787:8016,788:8017,834:8166}],969:[,,{768:8060,769:974,787:8032,788:8033,834:8182,837:8179}],970:[[953,776],,{768:8146,769:912,834:8151}],971:[[965,776],,{768:8162,769:944,834:8167}],972:[[959,769]],973:[[965,769]],974:[[969,769],,{837:8180}],976:[[946],256],977:[[952],256],978:[[933],256,{769:979,776:980}],979:[[978,769]],980:[[978,776]],981:[[966],256],982:[[960],256],1008:[[954],256],1009:[[961],256],1010:[[962],256],1012:[[920],256],1013:[[949],256],1017:[[931],256]},
1024:{1024:[[1045,768]],1025:[[1045,776]],1027:[[1043,769]],1030:[,,{776:1031}],1031:[[1030,776]],1036:[[1050,769]],1037:[[1048,768]],1038:[[1059,774]],1040:[,,{774:1232,776:1234}],1043:[,,{769:1027}],1045:[,,{768:1024,774:1238,776:1025}],1046:[,,{774:1217,776:1244}],1047:[,,{776:1246}],1048:[,,{768:1037,772:1250,774:1049,776:1252}],1049:[[1048,774]],1050:[,,{769:1036}],1054:[,,{776:1254}],1059:[,,{772:1262,774:1038,776:1264,779:1266}],1063:[,,{776:1268}],1067:[,,{776:1272}],1069:[,,{776:1260}],1072:[,,{774:1233,776:1235}],1075:[,,{769:1107}],1077:[,,{768:1104,774:1239,776:1105}],1078:[,,{774:1218,776:1245}],1079:[,,{776:1247}],1080:[,,{768:1117,772:1251,774:1081,776:1253}],1081:[[1080,774]],1082:[,,{769:1116}],1086:[,,{776:1255}],1091:[,,{772:1263,774:1118,776:1265,779:1267}],1095:[,,{776:1269}],1099:[,,{776:1273}],1101:[,,{776:1261}],1104:[[1077,768]],1105:[[1077,776]],1107:[[1075,769]],1110:[,,{776:1111}],1111:[[1110,776]],1116:[[1082,769]],1117:[[1080,768]],1118:[[1091,774]],1140:[,,{783:1142}],1141:[,,{783:1143}],1142:[[1140,783]],1143:[[1141,783]],1155:[,230],1156:[,230],1157:[,230],1158:[,230],1159:[,230],1217:[[1046,774]],1218:[[1078,774]],1232:[[1040,774]],1233:[[1072,774]],1234:[[1040,776]],1235:[[1072,776]],1238:[[1045,774]],1239:[[1077,774]],1240:[,,{776:1242}],1241:[,,{776:1243}],1242:[[1240,776]],1243:[[1241,776]],1244:[[1046,776]],1245:[[1078,776]],1246:[[1047,776]],1247:[[1079,776]],1250:[[1048,772]],1251:[[1080,772]],1252:[[1048,776]],1253:[[1080,776]],1254:[[1054,776]],1255:[[1086,776]],1256:[,,{776:1258}],1257:[,,{776:1259}],1258:[[1256,776]],1259:[[1257,776]],1260:[[1069,776]],1261:[[1101,776]],1262:[[1059,772]],1263:[[1091,772]],1264:[[1059,776]],1265:[[1091,776]],1266:[[1059,779]],1267:[[1091,779]],1268:[[1063,776]],1269:[[1095,776]],1272:[[1067,776]],1273:[[1099,776]]},
1280:{1415:[[1381,1410],256],1425:[,220],1426:[,230],1427:[,230],1428:[,230],1429:[,230],1430:[,220],1431:[,230],1432:[,230],1433:[,230],1434:[,222],1435:[,220],1436:[,230],1437:[,230],1438:[,230],1439:[,230],1440:[,230],1441:[,230],1442:[,220],1443:[,220],1444:[,220],1445:[,220],1446:[,220],1447:[,220],1448:[,230],1449:[,230],1450:[,220],1451:[,230],1452:[,230],1453:[,222],1454:[,228],1455:[,230],1456:[,10],1457:[,11],1458:[,12],1459:[,13],1460:[,14],1461:[,15],1462:[,16],1463:[,17],1464:[,18],1465:[,19],1466:[,19],1467:[,20],1468:[,21],1469:[,22],1471:[,23],1473:[,24],1474:[,25],1476:[,230],1477:[,220],1479:[,18]},
1536:{1552:[,230],1553:[,230],1554:[,230],1555:[,230],1556:[,230],1557:[,230],1558:[,230],1559:[,230],1560:[,30],1561:[,31],1562:[,32],1570:[[1575,1619]],1571:[[1575,1620]],1572:[[1608,1620]],1573:[[1575,1621]],1574:[[1610,1620]],1575:[,,{1619:1570,1620:1571,1621:1573}],1608:[,,{1620:1572}],1610:[,,{1620:1574}],1611:[,27],1612:[,28],1613:[,29],1614:[,30],1615:[,31],1616:[,32],1617:[,33],1618:[,34],1619:[,230],1620:[,230],1621:[,220],1622:[,220],1623:[,230],1624:[,230],1625:[,230],1626:[,230],1627:[,230],1628:[,220],1629:[,230],1630:[,230],1631:[,220],1648:[,35],1653:[[1575,1652],256],1654:[[1608,1652],256],1655:[[1735,1652],256],1656:[[1610,1652],256],1728:[[1749,1620]],1729:[,,{1620:1730}],1730:[[1729,1620]],1746:[,,{1620:1747}],1747:[[1746,1620]],1749:[,,{1620:1728}],1750:[,230],1751:[,230],1752:[,230],1753:[,230],1754:[,230],1755:[,230],1756:[,230],1759:[,230],1760:[,230],1761:[,230],1762:[,230],1763:[,220],1764:[,230],1767:[,230],1768:[,230],1770:[,220],1771:[,230],1772:[,230],1773:[,220]},
1792:{1809:[,36],1840:[,230],1841:[,220],1842:[,230],1843:[,230],1844:[,220],1845:[,230],1846:[,230],1847:[,220],1848:[,220],1849:[,220],1850:[,230],1851:[,220],1852:[,220],1853:[,230],1854:[,220],1855:[,230],1856:[,230],1857:[,230],1858:[,220],1859:[,230],1860:[,220],1861:[,230],1862:[,220],1863:[,230],1864:[,220],1865:[,230],1866:[,230],2027:[,230],2028:[,230],2029:[,230],2030:[,230],2031:[,230],2032:[,230],2033:[,230],2034:[,220],2035:[,230]},
2048:{2070:[,230],2071:[,230],2072:[,230],2073:[,230],2075:[,230],2076:[,230],2077:[,230],2078:[,230],2079:[,230],2080:[,230],2081:[,230],2082:[,230],2083:[,230],2085:[,230],2086:[,230],2087:[,230],2089:[,230],2090:[,230],2091:[,230],2092:[,230],2093:[,230],2137:[,220],2138:[,220],2139:[,220],2276:[,230],2277:[,230],2278:[,220],2279:[,230],2280:[,230],2281:[,220],2282:[,230],2283:[,230],2284:[,230],2285:[,220],2286:[,220],2287:[,220],2288:[,27],2289:[,28],2290:[,29],2291:[,230],2292:[,230],2293:[,230],2294:[,220],2295:[,230],2296:[,230],2297:[,220],2298:[,220],2299:[,230],2300:[,230],2301:[,230],2302:[,230]},
2304:{2344:[,,{2364:2345}],2345:[[2344,2364]],2352:[,,{2364:2353}],2353:[[2352,2364]],2355:[,,{2364:2356}],2356:[[2355,2364]],2364:[,7],2381:[,9],2385:[,230],2386:[,220],2387:[,230],2388:[,230],2392:[[2325,2364],512],2393:[[2326,2364],512],2394:[[2327,2364],512],2395:[[2332,2364],512],2396:[[2337,2364],512],2397:[[2338,2364],512],2398:[[2347,2364],512],2399:[[2351,2364],512],2492:[,7],2503:[,,{2494:2507,2519:2508}],2507:[[2503,2494]],2508:[[2503,2519]],2509:[,9],2524:[[2465,2492],512],2525:[[2466,2492],512],2527:[[2479,2492],512]},
2560:{2611:[[2610,2620],512],2614:[[2616,2620],512],2620:[,7],2637:[,9],2649:[[2582,2620],512],2650:[[2583,2620],512],2651:[[2588,2620],512],2654:[[2603,2620],512],2748:[,7],2765:[,9],68109:[,220],68111:[,230],68152:[,230],68153:[,1],68154:[,220],68159:[,9]},
2816:{2876:[,7],2887:[,,{2878:2891,2902:2888,2903:2892}],2888:[[2887,2902]],2891:[[2887,2878]],2892:[[2887,2903]],2893:[,9],2908:[[2849,2876],512],2909:[[2850,2876],512],2962:[,,{3031:2964}],2964:[[2962,3031]],3014:[,,{3006:3018,3031:3020}],3015:[,,{3006:3019}],3018:[[3014,3006]],3019:[[3015,3006]],3020:[[3014,3031]],3021:[,9]},
3072:{3142:[,,{3158:3144}],3144:[[3142,3158]],3149:[,9],3157:[,84],3158:[,91],3260:[,7],3263:[,,{3285:3264}],3264:[[3263,3285]],3270:[,,{3266:3274,3285:3271,3286:3272}],3271:[[3270,3285]],3272:[[3270,3286]],3274:[[3270,3266],,{3285:3275}],3275:[[3274,3285]],3277:[,9]},
3328:{3398:[,,{3390:3402,3415:3404}],3399:[,,{3390:3403}],3402:[[3398,3390]],3403:[[3399,3390]],3404:[[3398,3415]],3405:[,9],3530:[,9],3545:[,,{3530:3546,3535:3548,3551:3550}],3546:[[3545,3530]],3548:[[3545,3535],,{3530:3549}],3549:[[3548,3530]],3550:[[3545,3551]]},
3584:{3635:[[3661,3634],256],3640:[,103],3641:[,103],3642:[,9],3656:[,107],3657:[,107],3658:[,107],3659:[,107],3763:[[3789,3762],256],3768:[,118],3769:[,118],3784:[,122],3785:[,122],3786:[,122],3787:[,122],3804:[[3755,3737],256],3805:[[3755,3745],256]},
3840:{3852:[[3851],256],3864:[,220],3865:[,220],3893:[,220],3895:[,220],3897:[,216],3907:[[3906,4023],512],3917:[[3916,4023],512],3922:[[3921,4023],512],3927:[[3926,4023],512],3932:[[3931,4023],512],3945:[[3904,4021],512],3953:[,129],3954:[,130],3955:[[3953,3954],512],3956:[,132],3957:[[3953,3956],512],3958:[[4018,3968],512],3959:[[4018,3969],256],3960:[[4019,3968],512],3961:[[4019,3969],256],3962:[,130],3963:[,130],3964:[,130],3965:[,130],3968:[,130],3969:[[3953,3968],512],3970:[,230],3971:[,230],3972:[,9],3974:[,230],3975:[,230],3987:[[3986,4023],512],3997:[[3996,4023],512],4002:[[4001,4023],512],4007:[[4006,4023],512],4012:[[4011,4023],512],4025:[[3984,4021],512],4038:[,220]},
4096:{4133:[,,{4142:4134}],4134:[[4133,4142]],4151:[,7],4153:[,9],4154:[,9],4237:[,220],4348:[[4316],256],69702:[,9],69785:[,,{69818:69786}],69786:[[69785,69818]],69787:[,,{69818:69788}],69788:[[69787,69818]],69797:[,,{69818:69803}],69803:[[69797,69818]],69817:[,9],69818:[,7]},
4352:{69888:[,230],69889:[,230],69890:[,230],69934:[[69937,69927]],69935:[[69938,69927]],69937:[,,{69927:69934}],69938:[,,{69927:69935}],69939:[,9],69940:[,9],70080:[,9]},
4864:{4957:[,230],4958:[,230],4959:[,230]},
5632:{71350:[,9],71351:[,7]},
5888:{5908:[,9],5940:[,9],6098:[,9],6109:[,230]},
6144:{6313:[,228]},
6400:{6457:[,222],6458:[,230],6459:[,220]},
6656:{6679:[,230],6680:[,220],6752:[,9],6773:[,230],6774:[,230],6775:[,230],6776:[,230],6777:[,230],6778:[,230],6779:[,230],6780:[,230],6783:[,220]},
6912:{6917:[,,{6965:6918}],6918:[[6917,6965]],6919:[,,{6965:6920}],6920:[[6919,6965]],6921:[,,{6965:6922}],6922:[[6921,6965]],6923:[,,{6965:6924}],6924:[[6923,6965]],6925:[,,{6965:6926}],6926:[[6925,6965]],6929:[,,{6965:6930}],6930:[[6929,6965]],6964:[,7],6970:[,,{6965:6971}],6971:[[6970,6965]],6972:[,,{6965:6973}],6973:[[6972,6965]],6974:[,,{6965:6976}],6975:[,,{6965:6977}],6976:[[6974,6965]],6977:[[6975,6965]],6978:[,,{6965:6979}],6979:[[6978,6965]],6980:[,9],7019:[,230],7020:[,220],7021:[,230],7022:[,230],7023:[,230],7024:[,230],7025:[,230],7026:[,230],7027:[,230],7082:[,9],7083:[,9],7142:[,7],7154:[,9],7155:[,9]},
7168:{7223:[,7],7376:[,230],7377:[,230],7378:[,230],7380:[,1],7381:[,220],7382:[,220],7383:[,220],7384:[,220],7385:[,220],7386:[,230],7387:[,230],7388:[,220],7389:[,220],7390:[,220],7391:[,220],7392:[,230],7394:[,1],7395:[,1],7396:[,1],7397:[,1],7398:[,1],7399:[,1],7400:[,1],7405:[,220],7412:[,230]},
7424:{7468:[[65],256],7469:[[198],256],7470:[[66],256],7472:[[68],256],7473:[[69],256],7474:[[398],256],7475:[[71],256],7476:[[72],256],7477:[[73],256],7478:[[74],256],7479:[[75],256],7480:[[76],256],7481:[[77],256],7482:[[78],256],7484:[[79],256],7485:[[546],256],7486:[[80],256],7487:[[82],256],7488:[[84],256],7489:[[85],256],7490:[[87],256],7491:[[97],256],7492:[[592],256],7493:[[593],256],7494:[[7426],256],7495:[[98],256],7496:[[100],256],7497:[[101],256],7498:[[601],256],7499:[[603],256],7500:[[604],256],7501:[[103],256],7503:[[107],256],7504:[[109],256],7505:[[331],256],7506:[[111],256],7507:[[596],256],7508:[[7446],256],7509:[[7447],256],7510:[[112],256],7511:[[116],256],7512:[[117],256],7513:[[7453],256],7514:[[623],256],7515:[[118],256],7516:[[7461],256],7517:[[946],256],7518:[[947],256],7519:[[948],256],7520:[[966],256],7521:[[967],256],7522:[[105],256],7523:[[114],256],7524:[[117],256],7525:[[118],256],7526:[[946],256],7527:[[947],256],7528:[[961],256],7529:[[966],256],7530:[[967],256],7544:[[1085],256],7579:[[594],256],7580:[[99],256],7581:[[597],256],7582:[[240],256],7583:[[604],256],7584:[[102],256],7585:[[607],256],7586:[[609],256],7587:[[613],256],7588:[[616],256],7589:[[617],256],7590:[[618],256],7591:[[7547],256],7592:[[669],256],7593:[[621],256],7594:[[7557],256],7595:[[671],256],7596:[[625],256],7597:[[624],256],7598:[[626],256],7599:[[627],256],7600:[[628],256],7601:[[629],256],7602:[[632],256],7603:[[642],256],7604:[[643],256],7605:[[427],256],7606:[[649],256],7607:[[650],256],7608:[[7452],256],7609:[[651],256],7610:[[652],256],7611:[[122],256],7612:[[656],256],7613:[[657],256],7614:[[658],256],7615:[[952],256],7616:[,230],7617:[,230],7618:[,220],7619:[,230],7620:[,230],7621:[,230],7622:[,230],7623:[,230],7624:[,230],7625:[,230],7626:[,220],7627:[,230],7628:[,230],7629:[,234],7630:[,214],7631:[,220],7632:[,202],7633:[,230],7634:[,230],7635:[,230],7636:[,230],7637:[,230],7638:[,230],7639:[,230],7640:[,230],7641:[,230],7642:[,230],7643:[,230],7644:[,230],7645:[,230],7646:[,230],7647:[,230],7648:[,230],7649:[,230],7650:[,230],7651:[,230],7652:[,230],7653:[,230],7654:[,230],7676:[,233],7677:[,220],7678:[,230],7679:[,220]},
7680:{7680:[[65,805]],7681:[[97,805]],7682:[[66,775]],7683:[[98,775]],7684:[[66,803]],7685:[[98,803]],7686:[[66,817]],7687:[[98,817]],7688:[[199,769]],7689:[[231,769]],7690:[[68,775]],7691:[[100,775]],7692:[[68,803]],7693:[[100,803]],7694:[[68,817]],7695:[[100,817]],7696:[[68,807]],7697:[[100,807]],7698:[[68,813]],7699:[[100,813]],7700:[[274,768]],7701:[[275,768]],7702:[[274,769]],7703:[[275,769]],7704:[[69,813]],7705:[[101,813]],7706:[[69,816]],7707:[[101,816]],7708:[[552,774]],7709:[[553,774]],7710:[[70,775]],7711:[[102,775]],7712:[[71,772]],7713:[[103,772]],7714:[[72,775]],7715:[[104,775]],7716:[[72,803]],7717:[[104,803]],7718:[[72,776]],7719:[[104,776]],7720:[[72,807]],7721:[[104,807]],7722:[[72,814]],7723:[[104,814]],7724:[[73,816]],7725:[[105,816]],7726:[[207,769]],7727:[[239,769]],7728:[[75,769]],7729:[[107,769]],7730:[[75,803]],7731:[[107,803]],7732:[[75,817]],7733:[[107,817]],7734:[[76,803],,{772:7736}],7735:[[108,803],,{772:7737}],7736:[[7734,772]],7737:[[7735,772]],7738:[[76,817]],7739:[[108,817]],7740:[[76,813]],7741:[[108,813]],7742:[[77,769]],7743:[[109,769]],7744:[[77,775]],7745:[[109,775]],7746:[[77,803]],7747:[[109,803]],7748:[[78,775]],7749:[[110,775]],7750:[[78,803]],7751:[[110,803]],7752:[[78,817]],7753:[[110,817]],7754:[[78,813]],7755:[[110,813]],7756:[[213,769]],7757:[[245,769]],7758:[[213,776]],7759:[[245,776]],7760:[[332,768]],7761:[[333,768]],7762:[[332,769]],7763:[[333,769]],7764:[[80,769]],7765:[[112,769]],7766:[[80,775]],7767:[[112,775]],7768:[[82,775]],7769:[[114,775]],7770:[[82,803],,{772:7772}],7771:[[114,803],,{772:7773}],7772:[[7770,772]],7773:[[7771,772]],7774:[[82,817]],7775:[[114,817]],7776:[[83,775]],7777:[[115,775]],7778:[[83,803],,{775:7784}],7779:[[115,803],,{775:7785}],7780:[[346,775]],7781:[[347,775]],7782:[[352,775]],7783:[[353,775]],7784:[[7778,775]],7785:[[7779,775]],7786:[[84,775]],7787:[[116,775]],7788:[[84,803]],7789:[[116,803]],7790:[[84,817]],7791:[[116,817]],7792:[[84,813]],7793:[[116,813]],7794:[[85,804]],7795:[[117,804]],7796:[[85,816]],7797:[[117,816]],7798:[[85,813]],7799:[[117,813]],7800:[[360,769]],7801:[[361,769]],7802:[[362,776]],7803:[[363,776]],7804:[[86,771]],7805:[[118,771]],7806:[[86,803]],7807:[[118,803]],7808:[[87,768]],7809:[[119,768]],7810:[[87,769]],7811:[[119,769]],7812:[[87,776]],7813:[[119,776]],7814:[[87,775]],7815:[[119,775]],7816:[[87,803]],7817:[[119,803]],7818:[[88,775]],7819:[[120,775]],7820:[[88,776]],7821:[[120,776]],7822:[[89,775]],7823:[[121,775]],7824:[[90,770]],7825:[[122,770]],7826:[[90,803]],7827:[[122,803]],7828:[[90,817]],7829:[[122,817]],7830:[[104,817]],7831:[[116,776]],7832:[[119,778]],7833:[[121,778]],7834:[[97,702],256],7835:[[383,775]],7840:[[65,803],,{770:7852,774:7862}],7841:[[97,803],,{770:7853,774:7863}],7842:[[65,777]],7843:[[97,777]],7844:[[194,769]],7845:[[226,769]],7846:[[194,768]],7847:[[226,768]],7848:[[194,777]],7849:[[226,777]],7850:[[194,771]],7851:[[226,771]],7852:[[7840,770]],7853:[[7841,770]],7854:[[258,769]],7855:[[259,769]],7856:[[258,768]],7857:[[259,768]],7858:[[258,777]],7859:[[259,777]],7860:[[258,771]],7861:[[259,771]],7862:[[7840,774]],7863:[[7841,774]],7864:[[69,803],,{770:7878}],7865:[[101,803],,{770:7879}],7866:[[69,777]],7867:[[101,777]],7868:[[69,771]],7869:[[101,771]],7870:[[202,769]],7871:[[234,769]],7872:[[202,768]],7873:[[234,768]],7874:[[202,777]],7875:[[234,777]],7876:[[202,771]],7877:[[234,771]],7878:[[7864,770]],7879:[[7865,770]],7880:[[73,777]],7881:[[105,777]],7882:[[73,803]],7883:[[105,803]],7884:[[79,803],,{770:7896}],7885:[[111,803],,{770:7897}],7886:[[79,777]],7887:[[111,777]],7888:[[212,769]],7889:[[244,769]],7890:[[212,768]],7891:[[244,768]],7892:[[212,777]],7893:[[244,777]],7894:[[212,771]],7895:[[244,771]],7896:[[7884,770]],7897:[[7885,770]],7898:[[416,769]],7899:[[417,769]],7900:[[416,768]],7901:[[417,768]],7902:[[416,777]],7903:[[417,777]],7904:[[416,771]],7905:[[417,771]],7906:[[416,803]],7907:[[417,803]],7908:[[85,803]],7909:[[117,803]],7910:[[85,777]],7911:[[117,777]],7912:[[431,769]],7913:[[432,769]],7914:[[431,768]],7915:[[432,768]],7916:[[431,777]],7917:[[432,777]],7918:[[431,771]],7919:[[432,771]],7920:[[431,803]],7921:[[432,803]],7922:[[89,768]],7923:[[121,768]],7924:[[89,803]],7925:[[121,803]],7926:[[89,777]],7927:[[121,777]],7928:[[89,771]],7929:[[121,771]]},
7936:{7936:[[945,787],,{768:7938,769:7940,834:7942,837:8064}],7937:[[945,788],,{768:7939,769:7941,834:7943,837:8065}],7938:[[7936,768],,{837:8066}],7939:[[7937,768],,{837:8067}],7940:[[7936,769],,{837:8068}],7941:[[7937,769],,{837:8069}],7942:[[7936,834],,{837:8070}],7943:[[7937,834],,{837:8071}],7944:[[913,787],,{768:7946,769:7948,834:7950,837:8072}],7945:[[913,788],,{768:7947,769:7949,834:7951,837:8073}],7946:[[7944,768],,{837:8074}],7947:[[7945,768],,{837:8075}],7948:[[7944,769],,{837:8076}],7949:[[7945,769],,{837:8077}],7950:[[7944,834],,{837:8078}],7951:[[7945,834],,{837:8079}],7952:[[949,787],,{768:7954,769:7956}],7953:[[949,788],,{768:7955,769:7957}],7954:[[7952,768]],7955:[[7953,768]],7956:[[7952,769]],7957:[[7953,769]],7960:[[917,787],,{768:7962,769:7964}],7961:[[917,788],,{768:7963,769:7965}],7962:[[7960,768]],7963:[[7961,768]],7964:[[7960,769]],7965:[[7961,769]],7968:[[951,787],,{768:7970,769:7972,834:7974,837:8080}],7969:[[951,788],,{768:7971,769:7973,834:7975,837:8081}],7970:[[7968,768],,{837:8082}],7971:[[7969,768],,{837:8083}],7972:[[7968,769],,{837:8084}],7973:[[7969,769],,{837:8085}],7974:[[7968,834],,{837:8086}],7975:[[7969,834],,{837:8087}],7976:[[919,787],,{768:7978,769:7980,834:7982,837:8088}],7977:[[919,788],,{768:7979,769:7981,834:7983,837:8089}],7978:[[7976,768],,{837:8090}],7979:[[7977,768],,{837:8091}],7980:[[7976,769],,{837:8092}],7981:[[7977,769],,{837:8093}],7982:[[7976,834],,{837:8094}],7983:[[7977,834],,{837:8095}],7984:[[953,787],,{768:7986,769:7988,834:7990}],7985:[[953,788],,{768:7987,769:7989,834:7991}],7986:[[7984,768]],7987:[[7985,768]],7988:[[7984,769]],7989:[[7985,769]],7990:[[7984,834]],7991:[[7985,834]],7992:[[921,787],,{768:7994,769:7996,834:7998}],7993:[[921,788],,{768:7995,769:7997,834:7999}],7994:[[7992,768]],7995:[[7993,768]],7996:[[7992,769]],7997:[[7993,769]],7998:[[7992,834]],7999:[[7993,834]],8000:[[959,787],,{768:8002,769:8004}],8001:[[959,788],,{768:8003,769:8005}],8002:[[8000,768]],8003:[[8001,768]],8004:[[8000,769]],8005:[[8001,769]],8008:[[927,787],,{768:8010,769:8012}],8009:[[927,788],,{768:8011,769:8013}],8010:[[8008,768]],8011:[[8009,768]],8012:[[8008,769]],8013:[[8009,769]],8016:[[965,787],,{768:8018,769:8020,834:8022}],8017:[[965,788],,{768:8019,769:8021,834:8023}],8018:[[8016,768]],8019:[[8017,768]],8020:[[8016,769]],8021:[[8017,769]],8022:[[8016,834]],8023:[[8017,834]],8025:[[933,788],,{768:8027,769:8029,834:8031}],8027:[[8025,768]],8029:[[8025,769]],8031:[[8025,834]],8032:[[969,787],,{768:8034,769:8036,834:8038,837:8096}],8033:[[969,788],,{768:8035,769:8037,834:8039,837:8097}],8034:[[8032,768],,{837:8098}],8035:[[8033,768],,{837:8099}],8036:[[8032,769],,{837:8100}],8037:[[8033,769],,{837:8101}],8038:[[8032,834],,{837:8102}],8039:[[8033,834],,{837:8103}],8040:[[937,787],,{768:8042,769:8044,834:8046,837:8104}],8041:[[937,788],,{768:8043,769:8045,834:8047,837:8105}],8042:[[8040,768],,{837:8106}],8043:[[8041,768],,{837:8107}],8044:[[8040,769],,{837:8108}],8045:[[8041,769],,{837:8109}],8046:[[8040,834],,{837:8110}],8047:[[8041,834],,{837:8111}],8048:[[945,768],,{837:8114}],8049:[[940]],8050:[[949,768]],8051:[[941]],8052:[[951,768],,{837:8130}],8053:[[942]],8054:[[953,768]],8055:[[943]],8056:[[959,768]],8057:[[972]],8058:[[965,768]],8059:[[973]],8060:[[969,768],,{837:8178}],8061:[[974]],8064:[[7936,837]],8065:[[7937,837]],8066:[[7938,837]],8067:[[7939,837]],8068:[[7940,837]],8069:[[7941,837]],8070:[[7942,837]],8071:[[7943,837]],8072:[[7944,837]],8073:[[7945,837]],8074:[[7946,837]],8075:[[7947,837]],8076:[[7948,837]],8077:[[7949,837]],8078:[[7950,837]],8079:[[7951,837]],8080:[[7968,837]],8081:[[7969,837]],8082:[[7970,837]],8083:[[7971,837]],8084:[[7972,837]],8085:[[7973,837]],8086:[[7974,837]],8087:[[7975,837]],8088:[[7976,837]],8089:[[7977,837]],8090:[[7978,837]],8091:[[7979,837]],8092:[[7980,837]],8093:[[7981,837]],8094:[[7982,837]],8095:[[7983,837]],8096:[[8032,837]],8097:[[8033,837]],8098:[[8034,837]],8099:[[8035,837]],8100:[[8036,837]],8101:[[8037,837]],8102:[[8038,837]],8103:[[8039,837]],8104:[[8040,837]],8105:[[8041,837]],8106:[[8042,837]],8107:[[8043,837]],8108:[[8044,837]],8109:[[8045,837]],8110:[[8046,837]],8111:[[8047,837]],8112:[[945,774]],8113:[[945,772]],8114:[[8048,837]],8115:[[945,837]],8116:[[940,837]],8118:[[945,834],,{837:8119}],8119:[[8118,837]],8120:[[913,774]],8121:[[913,772]],8122:[[913,768]],8123:[[902]],8124:[[913,837]],8125:[[32,787],256],8126:[[953]],8127:[[32,787],256,{768:8141,769:8142,834:8143}],8128:[[32,834],256],8129:[[168,834]],8130:[[8052,837]],8131:[[951,837]],8132:[[942,837]],8134:[[951,834],,{837:8135}],8135:[[8134,837]],8136:[[917,768]],8137:[[904]],8138:[[919,768]],8139:[[905]],8140:[[919,837]],8141:[[8127,768]],8142:[[8127,769]],8143:[[8127,834]],8144:[[953,774]],8145:[[953,772]],8146:[[970,768]],8147:[[912]],8150:[[953,834]],8151:[[970,834]],8152:[[921,774]],8153:[[921,772]],8154:[[921,768]],8155:[[906]],8157:[[8190,768]],8158:[[8190,769]],8159:[[8190,834]],8160:[[965,774]],8161:[[965,772]],8162:[[971,768]],8163:[[944]],8164:[[961,787]],8165:[[961,788]],8166:[[965,834]],8167:[[971,834]],8168:[[933,774]],8169:[[933,772]],8170:[[933,768]],8171:[[910]],8172:[[929,788]],8173:[[168,768]],8174:[[901]],8175:[[96]],8178:[[8060,837]],8179:[[969,837]],8180:[[974,837]],8182:[[969,834],,{837:8183}],8183:[[8182,837]],8184:[[927,768]],8185:[[908]],8186:[[937,768]],8187:[[911]],8188:[[937,837]],8189:[[180]],8190:[[32,788],256,{768:8157,769:8158,834:8159}]},
8192:{8192:[[8194]],8193:[[8195]],8194:[[32],256],8195:[[32],256],8196:[[32],256],8197:[[32],256],8198:[[32],256],8199:[[32],256],8200:[[32],256],8201:[[32],256],8202:[[32],256],8209:[[8208],256],8215:[[32,819],256],8228:[[46],256],8229:[[46,46],256],8230:[[46,46,46],256],8239:[[32],256],8243:[[8242,8242],256],8244:[[8242,8242,8242],256],8246:[[8245,8245],256],8247:[[8245,8245,8245],256],8252:[[33,33],256],8254:[[32,773],256],8263:[[63,63],256],8264:[[63,33],256],8265:[[33,63],256],8279:[[8242,8242,8242,8242],256],8287:[[32],256],8304:[[48],256],8305:[[105],256],8308:[[52],256],8309:[[53],256],8310:[[54],256],8311:[[55],256],8312:[[56],256],8313:[[57],256],8314:[[43],256],8315:[[8722],256],8316:[[61],256],8317:[[40],256],8318:[[41],256],8319:[[110],256],8320:[[48],256],8321:[[49],256],8322:[[50],256],8323:[[51],256],8324:[[52],256],8325:[[53],256],8326:[[54],256],8327:[[55],256],8328:[[56],256],8329:[[57],256],8330:[[43],256],8331:[[8722],256],8332:[[61],256],8333:[[40],256],8334:[[41],256],8336:[[97],256],8337:[[101],256],8338:[[111],256],8339:[[120],256],8340:[[601],256],8341:[[104],256],8342:[[107],256],8343:[[108],256],8344:[[109],256],8345:[[110],256],8346:[[112],256],8347:[[115],256],8348:[[116],256],8360:[[82,115],256],8400:[,230],8401:[,230],8402:[,1],8403:[,1],8404:[,230],8405:[,230],8406:[,230],8407:[,230],8408:[,1],8409:[,1],8410:[,1],8411:[,230],8412:[,230],8417:[,230],8421:[,1],8422:[,1],8423:[,230],8424:[,220],8425:[,230],8426:[,1],8427:[,1],8428:[,220],8429:[,220],8430:[,220],8431:[,220],8432:[,230]},
8448:{8448:[[97,47,99],256],8449:[[97,47,115],256],8450:[[67],256],8451:[[176,67],256],8453:[[99,47,111],256],8454:[[99,47,117],256],8455:[[400],256],8457:[[176,70],256],8458:[[103],256],8459:[[72],256],8460:[[72],256],8461:[[72],256],8462:[[104],256],8463:[[295],256],8464:[[73],256],8465:[[73],256],8466:[[76],256],8467:[[108],256],8469:[[78],256],8470:[[78,111],256],8473:[[80],256],8474:[[81],256],8475:[[82],256],8476:[[82],256],8477:[[82],256],8480:[[83,77],256],8481:[[84,69,76],256],8482:[[84,77],256],8484:[[90],256],8486:[[937]],8488:[[90],256],8490:[[75]],8491:[[197]],8492:[[66],256],8493:[[67],256],8495:[[101],256],8496:[[69],256],8497:[[70],256],8499:[[77],256],8500:[[111],256],8501:[[1488],256],8502:[[1489],256],8503:[[1490],256],8504:[[1491],256],8505:[[105],256],8507:[[70,65,88],256],8508:[[960],256],8509:[[947],256],8510:[[915],256],8511:[[928],256],8512:[[8721],256],8517:[[68],256],8518:[[100],256],8519:[[101],256],8520:[[105],256],8521:[[106],256],8528:[[49,8260,55],256],8529:[[49,8260,57],256],8530:[[49,8260,49,48],256],8531:[[49,8260,51],256],8532:[[50,8260,51],256],8533:[[49,8260,53],256],8534:[[50,8260,53],256],8535:[[51,8260,53],256],8536:[[52,8260,53],256],8537:[[49,8260,54],256],8538:[[53,8260,54],256],8539:[[49,8260,56],256],8540:[[51,8260,56],256],8541:[[53,8260,56],256],8542:[[55,8260,56],256],8543:[[49,8260],256],8544:[[73],256],8545:[[73,73],256],8546:[[73,73,73],256],8547:[[73,86],256],8548:[[86],256],8549:[[86,73],256],8550:[[86,73,73],256],8551:[[86,73,73,73],256],8552:[[73,88],256],8553:[[88],256],8554:[[88,73],256],8555:[[88,73,73],256],8556:[[76],256],8557:[[67],256],8558:[[68],256],8559:[[77],256],8560:[[105],256],8561:[[105,105],256],8562:[[105,105,105],256],8563:[[105,118],256],8564:[[118],256],8565:[[118,105],256],8566:[[118,105,105],256],8567:[[118,105,105,105],256],8568:[[105,120],256],8569:[[120],256],8570:[[120,105],256],8571:[[120,105,105],256],8572:[[108],256],8573:[[99],256],8574:[[100],256],8575:[[109],256],8585:[[48,8260,51],256],8592:[,,{824:8602}],8594:[,,{824:8603}],8596:[,,{824:8622}],8602:[[8592,824]],8603:[[8594,824]],8622:[[8596,824]],8653:[[8656,824]],8654:[[8660,824]],8655:[[8658,824]],8656:[,,{824:8653}],8658:[,,{824:8655}],8660:[,,{824:8654}]},
8704:{8707:[,,{824:8708}],8708:[[8707,824]],8712:[,,{824:8713}],8713:[[8712,824]],8715:[,,{824:8716}],8716:[[8715,824]],8739:[,,{824:8740}],8740:[[8739,824]],8741:[,,{824:8742}],8742:[[8741,824]],8748:[[8747,8747],256],8749:[[8747,8747,8747],256],8751:[[8750,8750],256],8752:[[8750,8750,8750],256],8764:[,,{824:8769}],8769:[[8764,824]],8771:[,,{824:8772}],8772:[[8771,824]],8773:[,,{824:8775}],8775:[[8773,824]],8776:[,,{824:8777}],8777:[[8776,824]],8781:[,,{824:8813}],8800:[[61,824]],8801:[,,{824:8802}],8802:[[8801,824]],8804:[,,{824:8816}],8805:[,,{824:8817}],8813:[[8781,824]],8814:[[60,824]],8815:[[62,824]],8816:[[8804,824]],8817:[[8805,824]],8818:[,,{824:8820}],8819:[,,{824:8821}],8820:[[8818,824]],8821:[[8819,824]],8822:[,,{824:8824}],8823:[,,{824:8825}],8824:[[8822,824]],8825:[[8823,824]],8826:[,,{824:8832}],8827:[,,{824:8833}],8828:[,,{824:8928}],8829:[,,{824:8929}],8832:[[8826,824]],8833:[[8827,824]],8834:[,,{824:8836}],8835:[,,{824:8837}],8836:[[8834,824]],8837:[[8835,824]],8838:[,,{824:8840}],8839:[,,{824:8841}],8840:[[8838,824]],8841:[[8839,824]],8849:[,,{824:8930}],8850:[,,{824:8931}],8866:[,,{824:8876}],8872:[,,{824:8877}],8873:[,,{824:8878}],8875:[,,{824:8879}],8876:[[8866,824]],8877:[[8872,824]],8878:[[8873,824]],8879:[[8875,824]],8882:[,,{824:8938}],8883:[,,{824:8939}],8884:[,,{824:8940}],8885:[,,{824:8941}],8928:[[8828,824]],8929:[[8829,824]],8930:[[8849,824]],8931:[[8850,824]],8938:[[8882,824]],8939:[[8883,824]],8940:[[8884,824]],8941:[[8885,824]]},
8960:{9001:[[12296]],9002:[[12297]]},
9216:{9312:[[49],256],9313:[[50],256],9314:[[51],256],9315:[[52],256],9316:[[53],256],9317:[[54],256],9318:[[55],256],9319:[[56],256],9320:[[57],256],9321:[[49,48],256],9322:[[49,49],256],9323:[[49,50],256],9324:[[49,51],256],9325:[[49,52],256],9326:[[49,53],256],9327:[[49,54],256],9328:[[49,55],256],9329:[[49,56],256],9330:[[49,57],256],9331:[[50,48],256],9332:[[40,49,41],256],9333:[[40,50,41],256],9334:[[40,51,41],256],9335:[[40,52,41],256],9336:[[40,53,41],256],9337:[[40,54,41],256],9338:[[40,55,41],256],9339:[[40,56,41],256],9340:[[40,57,41],256],9341:[[40,49,48,41],256],9342:[[40,49,49,41],256],9343:[[40,49,50,41],256],9344:[[40,49,51,41],256],9345:[[40,49,52,41],256],9346:[[40,49,53,41],256],9347:[[40,49,54,41],256],9348:[[40,49,55,41],256],9349:[[40,49,56,41],256],9350:[[40,49,57,41],256],9351:[[40,50,48,41],256],9352:[[49,46],256],9353:[[50,46],256],9354:[[51,46],256],9355:[[52,46],256],9356:[[53,46],256],9357:[[54,46],256],9358:[[55,46],256],9359:[[56,46],256],9360:[[57,46],256],9361:[[49,48,46],256],9362:[[49,49,46],256],9363:[[49,50,46],256],9364:[[49,51,46],256],9365:[[49,52,46],256],9366:[[49,53,46],256],9367:[[49,54,46],256],9368:[[49,55,46],256],9369:[[49,56,46],256],9370:[[49,57,46],256],9371:[[50,48,46],256],9372:[[40,97,41],256],9373:[[40,98,41],256],9374:[[40,99,41],256],9375:[[40,100,41],256],9376:[[40,101,41],256],9377:[[40,102,41],256],9378:[[40,103,41],256],9379:[[40,104,41],256],9380:[[40,105,41],256],9381:[[40,106,41],256],9382:[[40,107,41],256],9383:[[40,108,41],256],9384:[[40,109,41],256],9385:[[40,110,41],256],9386:[[40,111,41],256],9387:[[40,112,41],256],9388:[[40,113,41],256],9389:[[40,114,41],256],9390:[[40,115,41],256],9391:[[40,116,41],256],9392:[[40,117,41],256],9393:[[40,118,41],256],9394:[[40,119,41],256],9395:[[40,120,41],256],9396:[[40,121,41],256],9397:[[40,122,41],256],9398:[[65],256],9399:[[66],256],9400:[[67],256],9401:[[68],256],9402:[[69],256],9403:[[70],256],9404:[[71],256],9405:[[72],256],9406:[[73],256],9407:[[74],256],9408:[[75],256],9409:[[76],256],9410:[[77],256],9411:[[78],256],9412:[[79],256],9413:[[80],256],9414:[[81],256],9415:[[82],256],9416:[[83],256],9417:[[84],256],9418:[[85],256],9419:[[86],256],9420:[[87],256],9421:[[88],256],9422:[[89],256],9423:[[90],256],9424:[[97],256],9425:[[98],256],9426:[[99],256],9427:[[100],256],9428:[[101],256],9429:[[102],256],9430:[[103],256],9431:[[104],256],9432:[[105],256],9433:[[106],256],9434:[[107],256],9435:[[108],256],9436:[[109],256],9437:[[110],256],9438:[[111],256],9439:[[112],256],9440:[[113],256],9441:[[114],256],9442:[[115],256],9443:[[116],256],9444:[[117],256],9445:[[118],256],9446:[[119],256],9447:[[120],256],9448:[[121],256],9449:[[122],256],9450:[[48],256]},
10752:{10764:[[8747,8747,8747,8747],256],10868:[[58,58,61],256],10869:[[61,61],256],10870:[[61,61,61],256],10972:[[10973,824],512]},
11264:{11388:[[106],256],11389:[[86],256],11503:[,230],11504:[,230],11505:[,230]},
11520:{11631:[[11617],256],11647:[,9],11744:[,230],11745:[,230],11746:[,230],11747:[,230],11748:[,230],11749:[,230],11750:[,230],11751:[,230],11752:[,230],11753:[,230],11754:[,230],11755:[,230],11756:[,230],11757:[,230],11758:[,230],11759:[,230],11760:[,230],11761:[,230],11762:[,230],11763:[,230],11764:[,230],11765:[,230],11766:[,230],11767:[,230],11768:[,230],11769:[,230],11770:[,230],11771:[,230],11772:[,230],11773:[,230],11774:[,230],11775:[,230]},
11776:{11935:[[27597],256],12019:[[40863],256]},
12032:{12032:[[19968],256],12033:[[20008],256],12034:[[20022],256],12035:[[20031],256],12036:[[20057],256],12037:[[20101],256],12038:[[20108],256],12039:[[20128],256],12040:[[20154],256],12041:[[20799],256],12042:[[20837],256],12043:[[20843],256],12044:[[20866],256],12045:[[20886],256],12046:[[20907],256],12047:[[20960],256],12048:[[20981],256],12049:[[20992],256],12050:[[21147],256],12051:[[21241],256],12052:[[21269],256],12053:[[21274],256],12054:[[21304],256],12055:[[21313],256],12056:[[21340],256],12057:[[21353],256],12058:[[21378],256],12059:[[21430],256],12060:[[21448],256],12061:[[21475],256],12062:[[22231],256],12063:[[22303],256],12064:[[22763],256],12065:[[22786],256],12066:[[22794],256],12067:[[22805],256],12068:[[22823],256],12069:[[22899],256],12070:[[23376],256],12071:[[23424],256],12072:[[23544],256],12073:[[23567],256],12074:[[23586],256],12075:[[23608],256],12076:[[23662],256],12077:[[23665],256],12078:[[24027],256],12079:[[24037],256],12080:[[24049],256],12081:[[24062],256],12082:[[24178],256],12083:[[24186],256],12084:[[24191],256],12085:[[24308],256],12086:[[24318],256],12087:[[24331],256],12088:[[24339],256],12089:[[24400],256],12090:[[24417],256],12091:[[24435],256],12092:[[24515],256],12093:[[25096],256],12094:[[25142],256],12095:[[25163],256],12096:[[25903],256],12097:[[25908],256],12098:[[25991],256],12099:[[26007],256],12100:[[26020],256],12101:[[26041],256],12102:[[26080],256],12103:[[26085],256],12104:[[26352],256],12105:[[26376],256],12106:[[26408],256],12107:[[27424],256],12108:[[27490],256],12109:[[27513],256],12110:[[27571],256],12111:[[27595],256],12112:[[27604],256],12113:[[27611],256],12114:[[27663],256],12115:[[27668],256],12116:[[27700],256],12117:[[28779],256],12118:[[29226],256],12119:[[29238],256],12120:[[29243],256],12121:[[29247],256],12122:[[29255],256],12123:[[29273],256],12124:[[29275],256],12125:[[29356],256],12126:[[29572],256],12127:[[29577],256],12128:[[29916],256],12129:[[29926],256],12130:[[29976],256],12131:[[29983],256],12132:[[29992],256],12133:[[30000],256],12134:[[30091],256],12135:[[30098],256],12136:[[30326],256],12137:[[30333],256],12138:[[30382],256],12139:[[30399],256],12140:[[30446],256],12141:[[30683],256],12142:[[30690],256],12143:[[30707],256],12144:[[31034],256],12145:[[31160],256],12146:[[31166],256],12147:[[31348],256],12148:[[31435],256],12149:[[31481],256],12150:[[31859],256],12151:[[31992],256],12152:[[32566],256],12153:[[32593],256],12154:[[32650],256],12155:[[32701],256],12156:[[32769],256],12157:[[32780],256],12158:[[32786],256],12159:[[32819],256],12160:[[32895],256],12161:[[32905],256],12162:[[33251],256],12163:[[33258],256],12164:[[33267],256],12165:[[33276],256],12166:[[33292],256],12167:[[33307],256],12168:[[33311],256],12169:[[33390],256],12170:[[33394],256],12171:[[33400],256],12172:[[34381],256],12173:[[34411],256],12174:[[34880],256],12175:[[34892],256],12176:[[34915],256],12177:[[35198],256],12178:[[35211],256],12179:[[35282],256],12180:[[35328],256],12181:[[35895],256],12182:[[35910],256],12183:[[35925],256],12184:[[35960],256],12185:[[35997],256],12186:[[36196],256],12187:[[36208],256],12188:[[36275],256],12189:[[36523],256],12190:[[36554],256],12191:[[36763],256],12192:[[36784],256],12193:[[36789],256],12194:[[37009],256],12195:[[37193],256],12196:[[37318],256],12197:[[37324],256],12198:[[37329],256],12199:[[38263],256],12200:[[38272],256],12201:[[38428],256],12202:[[38582],256],12203:[[38585],256],12204:[[38632],256],12205:[[38737],256],12206:[[38750],256],12207:[[38754],256],12208:[[38761],256],12209:[[38859],256],12210:[[38893],256],12211:[[38899],256],12212:[[38913],256],12213:[[39080],256],12214:[[39131],256],12215:[[39135],256],12216:[[39318],256],12217:[[39321],256],12218:[[39340],256],12219:[[39592],256],12220:[[39640],256],12221:[[39647],256],12222:[[39717],256],12223:[[39727],256],12224:[[39730],256],12225:[[39740],256],12226:[[39770],256],12227:[[40165],256],12228:[[40565],256],12229:[[40575],256],12230:[[40613],256],12231:[[40635],256],12232:[[40643],256],12233:[[40653],256],12234:[[40657],256],12235:[[40697],256],12236:[[40701],256],12237:[[40718],256],12238:[[40723],256],12239:[[40736],256],12240:[[40763],256],12241:[[40778],256],12242:[[40786],256],12243:[[40845],256],12244:[[40860],256],12245:[[40864],256]},
12288:{12288:[[32],256],12330:[,218],12331:[,228],12332:[,232],12333:[,222],12334:[,224],12335:[,224],12342:[[12306],256],12344:[[21313],256],12345:[[21316],256],12346:[[21317],256],12358:[,,{12441:12436}],12363:[,,{12441:12364}],12364:[[12363,12441]],12365:[,,{12441:12366}],12366:[[12365,12441]],12367:[,,{12441:12368}],12368:[[12367,12441]],12369:[,,{12441:12370}],12370:[[12369,12441]],12371:[,,{12441:12372}],12372:[[12371,12441]],12373:[,,{12441:12374}],12374:[[12373,12441]],12375:[,,{12441:12376}],12376:[[12375,12441]],12377:[,,{12441:12378}],12378:[[12377,12441]],12379:[,,{12441:12380}],12380:[[12379,12441]],12381:[,,{12441:12382}],12382:[[12381,12441]],12383:[,,{12441:12384}],12384:[[12383,12441]],12385:[,,{12441:12386}],12386:[[12385,12441]],12388:[,,{12441:12389}],12389:[[12388,12441]],12390:[,,{12441:12391}],12391:[[12390,12441]],12392:[,,{12441:12393}],12393:[[12392,12441]],12399:[,,{12441:12400,12442:12401}],12400:[[12399,12441]],12401:[[12399,12442]],12402:[,,{12441:12403,12442:12404}],12403:[[12402,12441]],12404:[[12402,12442]],12405:[,,{12441:12406,12442:12407}],12406:[[12405,12441]],12407:[[12405,12442]],12408:[,,{12441:12409,12442:12410}],12409:[[12408,12441]],12410:[[12408,12442]],12411:[,,{12441:12412,12442:12413}],12412:[[12411,12441]],12413:[[12411,12442]],12436:[[12358,12441]],12441:[,8],12442:[,8],12443:[[32,12441],256],12444:[[32,12442],256],12445:[,,{12441:12446}],12446:[[12445,12441]],12447:[[12424,12426],256],12454:[,,{12441:12532}],12459:[,,{12441:12460}],12460:[[12459,12441]],12461:[,,{12441:12462}],12462:[[12461,12441]],12463:[,,{12441:12464}],12464:[[12463,12441]],12465:[,,{12441:12466}],12466:[[12465,12441]],12467:[,,{12441:12468}],12468:[[12467,12441]],12469:[,,{12441:12470}],12470:[[12469,12441]],12471:[,,{12441:12472}],12472:[[12471,12441]],12473:[,,{12441:12474}],12474:[[12473,12441]],12475:[,,{12441:12476}],12476:[[12475,12441]],12477:[,,{12441:12478}],12478:[[12477,12441]],12479:[,,{12441:12480}],12480:[[12479,12441]],12481:[,,{12441:12482}],12482:[[12481,12441]],12484:[,,{12441:12485}],12485:[[12484,12441]],12486:[,,{12441:12487}],12487:[[12486,12441]],12488:[,,{12441:12489}],12489:[[12488,12441]],12495:[,,{12441:12496,12442:12497}],12496:[[12495,12441]],12497:[[12495,12442]],12498:[,,{12441:12499,12442:12500}],12499:[[12498,12441]],12500:[[12498,12442]],12501:[,,{12441:12502,12442:12503}],12502:[[12501,12441]],12503:[[12501,12442]],12504:[,,{12441:12505,12442:12506}],12505:[[12504,12441]],12506:[[12504,12442]],12507:[,,{12441:12508,12442:12509}],12508:[[12507,12441]],12509:[[12507,12442]],12527:[,,{12441:12535}],12528:[,,{12441:12536}],12529:[,,{12441:12537}],12530:[,,{12441:12538}],12532:[[12454,12441]],12535:[[12527,12441]],12536:[[12528,12441]],12537:[[12529,12441]],12538:[[12530,12441]],12541:[,,{12441:12542}],12542:[[12541,12441]],12543:[[12467,12488],256]},
12544:{12593:[[4352],256],12594:[[4353],256],12595:[[4522],256],12596:[[4354],256],12597:[[4524],256],12598:[[4525],256],12599:[[4355],256],12600:[[4356],256],12601:[[4357],256],12602:[[4528],256],12603:[[4529],256],12604:[[4530],256],12605:[[4531],256],12606:[[4532],256],12607:[[4533],256],12608:[[4378],256],12609:[[4358],256],12610:[[4359],256],12611:[[4360],256],12612:[[4385],256],12613:[[4361],256],12614:[[4362],256],12615:[[4363],256],12616:[[4364],256],12617:[[4365],256],12618:[[4366],256],12619:[[4367],256],12620:[[4368],256],12621:[[4369],256],12622:[[4370],256],12623:[[4449],256],12624:[[4450],256],12625:[[4451],256],12626:[[4452],256],12627:[[4453],256],12628:[[4454],256],12629:[[4455],256],12630:[[4456],256],12631:[[4457],256],12632:[[4458],256],12633:[[4459],256],12634:[[4460],256],12635:[[4461],256],12636:[[4462],256],12637:[[4463],256],12638:[[4464],256],12639:[[4465],256],12640:[[4466],256],12641:[[4467],256],12642:[[4468],256],12643:[[4469],256],12644:[[4448],256],12645:[[4372],256],12646:[[4373],256],12647:[[4551],256],12648:[[4552],256],12649:[[4556],256],12650:[[4558],256],12651:[[4563],256],12652:[[4567],256],12653:[[4569],256],12654:[[4380],256],12655:[[4573],256],12656:[[4575],256],12657:[[4381],256],12658:[[4382],256],12659:[[4384],256],12660:[[4386],256],12661:[[4387],256],12662:[[4391],256],12663:[[4393],256],12664:[[4395],256],12665:[[4396],256],12666:[[4397],256],12667:[[4398],256],12668:[[4399],256],12669:[[4402],256],12670:[[4406],256],12671:[[4416],256],12672:[[4423],256],12673:[[4428],256],12674:[[4593],256],12675:[[4594],256],12676:[[4439],256],12677:[[4440],256],12678:[[4441],256],12679:[[4484],256],12680:[[4485],256],12681:[[4488],256],12682:[[4497],256],12683:[[4498],256],12684:[[4500],256],12685:[[4510],256],12686:[[4513],256],12690:[[19968],256],12691:[[20108],256],12692:[[19977],256],12693:[[22235],256],12694:[[19978],256],12695:[[20013],256],12696:[[19979],256],12697:[[30002],256],12698:[[20057],256],12699:[[19993],256],12700:[[19969],256],12701:[[22825],256],12702:[[22320],256],12703:[[20154],256]},
12800:{12800:[[40,4352,41],256],12801:[[40,4354,41],256],12802:[[40,4355,41],256],12803:[[40,4357,41],256],12804:[[40,4358,41],256],12805:[[40,4359,41],256],12806:[[40,4361,41],256],12807:[[40,4363,41],256],12808:[[40,4364,41],256],12809:[[40,4366,41],256],12810:[[40,4367,41],256],12811:[[40,4368,41],256],12812:[[40,4369,41],256],12813:[[40,4370,41],256],12814:[[40,4352,4449,41],256],12815:[[40,4354,4449,41],256],12816:[[40,4355,4449,41],256],12817:[[40,4357,4449,41],256],12818:[[40,4358,4449,41],256],12819:[[40,4359,4449,41],256],12820:[[40,4361,4449,41],256],12821:[[40,4363,4449,41],256],12822:[[40,4364,4449,41],256],12823:[[40,4366,4449,41],256],12824:[[40,4367,4449,41],256],12825:[[40,4368,4449,41],256],12826:[[40,4369,4449,41],256],12827:[[40,4370,4449,41],256],12828:[[40,4364,4462,41],256],12829:[[40,4363,4457,4364,4453,4523,41],256],12830:[[40,4363,4457,4370,4462,41],256],12832:[[40,19968,41],256],12833:[[40,20108,41],256],12834:[[40,19977,41],256],12835:[[40,22235,41],256],12836:[[40,20116,41],256],12837:[[40,20845,41],256],12838:[[40,19971,41],256],12839:[[40,20843,41],256],12840:[[40,20061,41],256],12841:[[40,21313,41],256],12842:[[40,26376,41],256],12843:[[40,28779,41],256],12844:[[40,27700,41],256],12845:[[40,26408,41],256],12846:[[40,37329,41],256],12847:[[40,22303,41],256],12848:[[40,26085,41],256],12849:[[40,26666,41],256],12850:[[40,26377,41],256],12851:[[40,31038,41],256],12852:[[40,21517,41],256],12853:[[40,29305,41],256],12854:[[40,36001,41],256],12855:[[40,31069,41],256],12856:[[40,21172,41],256],12857:[[40,20195,41],256],12858:[[40,21628,41],256],12859:[[40,23398,41],256],12860:[[40,30435,41],256],12861:[[40,20225,41],256],12862:[[40,36039,41],256],12863:[[40,21332,41],256],12864:[[40,31085,41],256],12865:[[40,20241,41],256],12866:[[40,33258,41],256],12867:[[40,33267,41],256],12868:[[21839],256],12869:[[24188],256],12870:[[25991],256],12871:[[31631],256],12880:[[80,84,69],256],12881:[[50,49],256],12882:[[50,50],256],12883:[[50,51],256],12884:[[50,52],256],12885:[[50,53],256],12886:[[50,54],256],12887:[[50,55],256],12888:[[50,56],256],12889:[[50,57],256],12890:[[51,48],256],12891:[[51,49],256],12892:[[51,50],256],12893:[[51,51],256],12894:[[51,52],256],12895:[[51,53],256],12896:[[4352],256],12897:[[4354],256],12898:[[4355],256],12899:[[4357],256],12900:[[4358],256],12901:[[4359],256],12902:[[4361],256],12903:[[4363],256],12904:[[4364],256],12905:[[4366],256],12906:[[4367],256],12907:[[4368],256],12908:[[4369],256],12909:[[4370],256],12910:[[4352,4449],256],12911:[[4354,4449],256],12912:[[4355,4449],256],12913:[[4357,4449],256],12914:[[4358,4449],256],12915:[[4359,4449],256],12916:[[4361,4449],256],12917:[[4363,4449],256],12918:[[4364,4449],256],12919:[[4366,4449],256],12920:[[4367,4449],256],12921:[[4368,4449],256],12922:[[4369,4449],256],12923:[[4370,4449],256],12924:[[4366,4449,4535,4352,4457],256],12925:[[4364,4462,4363,4468],256],12926:[[4363,4462],256],12928:[[19968],256],12929:[[20108],256],12930:[[19977],256],12931:[[22235],256],12932:[[20116],256],12933:[[20845],256],12934:[[19971],256],12935:[[20843],256],12936:[[20061],256],12937:[[21313],256],12938:[[26376],256],12939:[[28779],256],12940:[[27700],256],12941:[[26408],256],12942:[[37329],256],12943:[[22303],256],12944:[[26085],256],12945:[[26666],256],12946:[[26377],256],12947:[[31038],256],12948:[[21517],256],12949:[[29305],256],12950:[[36001],256],12951:[[31069],256],12952:[[21172],256],12953:[[31192],256],12954:[[30007],256],12955:[[22899],256],12956:[[36969],256],12957:[[20778],256],12958:[[21360],256],12959:[[27880],256],12960:[[38917],256],12961:[[20241],256],12962:[[20889],256],12963:[[27491],256],12964:[[19978],256],12965:[[20013],256],12966:[[19979],256],12967:[[24038],256],12968:[[21491],256],12969:[[21307],256],12970:[[23447],256],12971:[[23398],256],12972:[[30435],256],12973:[[20225],256],12974:[[36039],256],12975:[[21332],256],12976:[[22812],256],12977:[[51,54],256],12978:[[51,55],256],12979:[[51,56],256],12980:[[51,57],256],12981:[[52,48],256],12982:[[52,49],256],12983:[[52,50],256],12984:[[52,51],256],12985:[[52,52],256],12986:[[52,53],256],12987:[[52,54],256],12988:[[52,55],256],12989:[[52,56],256],12990:[[52,57],256],12991:[[53,48],256],12992:[[49,26376],256],12993:[[50,26376],256],12994:[[51,26376],256],12995:[[52,26376],256],12996:[[53,26376],256],12997:[[54,26376],256],12998:[[55,26376],256],12999:[[56,26376],256],13000:[[57,26376],256],13001:[[49,48,26376],256],13002:[[49,49,26376],256],13003:[[49,50,26376],256],13004:[[72,103],256],13005:[[101,114,103],256],13006:[[101,86],256],13007:[[76,84,68],256],13008:[[12450],256],13009:[[12452],256],13010:[[12454],256],13011:[[12456],256],13012:[[12458],256],13013:[[12459],256],13014:[[12461],256],13015:[[12463],256],13016:[[12465],256],13017:[[12467],256],13018:[[12469],256],13019:[[12471],256],13020:[[12473],256],13021:[[12475],256],13022:[[12477],256],13023:[[12479],256],13024:[[12481],256],13025:[[12484],256],13026:[[12486],256],13027:[[12488],256],13028:[[12490],256],13029:[[12491],256],13030:[[12492],256],13031:[[12493],256],13032:[[12494],256],13033:[[12495],256],13034:[[12498],256],13035:[[12501],256],13036:[[12504],256],13037:[[12507],256],13038:[[12510],256],13039:[[12511],256],13040:[[12512],256],13041:[[12513],256],13042:[[12514],256],13043:[[12516],256],13044:[[12518],256],13045:[[12520],256],13046:[[12521],256],13047:[[12522],256],13048:[[12523],256],13049:[[12524],256],13050:[[12525],256],13051:[[12527],256],13052:[[12528],256],13053:[[12529],256],13054:[[12530],256]},
13056:{13056:[[12450,12497,12540,12488],256],13057:[[12450,12523,12501,12449],256],13058:[[12450,12531,12506,12450],256],13059:[[12450,12540,12523],256],13060:[[12452,12491,12531,12464],256],13061:[[12452,12531,12481],256],13062:[[12454,12457,12531],256],13063:[[12456,12473,12463,12540,12489],256],13064:[[12456,12540,12459,12540],256],13065:[[12458,12531,12473],256],13066:[[12458,12540,12512],256],13067:[[12459,12452,12522],256],13068:[[12459,12521,12483,12488],256],13069:[[12459,12525,12522,12540],256],13070:[[12460,12525,12531],256],13071:[[12460,12531,12510],256],13072:[[12462,12460],256],13073:[[12462,12491,12540],256],13074:[[12461,12517,12522,12540],256],13075:[[12462,12523,12480,12540],256],13076:[[12461,12525],256],13077:[[12461,12525,12464,12521,12512],256],13078:[[12461,12525,12513,12540,12488,12523],256],13079:[[12461,12525,12527,12483,12488],256],13080:[[12464,12521,12512],256],13081:[[12464,12521,12512,12488,12531],256],13082:[[12463,12523,12476,12452,12525],256],13083:[[12463,12525,12540,12493],256],13084:[[12465,12540,12473],256],13085:[[12467,12523,12490],256],13086:[[12467,12540,12509],256],13087:[[12469,12452,12463,12523],256],13088:[[12469,12531,12481,12540,12512],256],13089:[[12471,12522,12531,12464],256],13090:[[12475,12531,12481],256],13091:[[12475,12531,12488],256],13092:[[12480,12540,12473],256],13093:[[12487,12471],256],13094:[[12489,12523],256],13095:[[12488,12531],256],13096:[[12490,12494],256],13097:[[12494,12483,12488],256],13098:[[12495,12452,12484],256],13099:[[12497,12540,12475,12531,12488],256],13100:[[12497,12540,12484],256],13101:[[12496,12540,12524,12523],256],13102:[[12500,12450,12473,12488,12523],256],13103:[[12500,12463,12523],256],13104:[[12500,12467],256],13105:[[12499,12523],256],13106:[[12501,12449,12521,12483,12489],256],13107:[[12501,12451,12540,12488],256],13108:[[12502,12483,12471,12455,12523],256],13109:[[12501,12521,12531],256],13110:[[12504,12463,12479,12540,12523],256],13111:[[12506,12477],256],13112:[[12506,12491,12498],256],13113:[[12504,12523,12484],256],13114:[[12506,12531,12473],256],13115:[[12506,12540,12472],256],13116:[[12505,12540,12479],256],13117:[[12509,12452,12531,12488],256],13118:[[12508,12523,12488],256],13119:[[12507,12531],256],13120:[[12509,12531,12489],256],13121:[[12507,12540,12523],256],13122:[[12507,12540,12531],256],13123:[[12510,12452,12463,12525],256],13124:[[12510,12452,12523],256],13125:[[12510,12483,12495],256],13126:[[12510,12523,12463],256],13127:[[12510,12531,12471,12519,12531],256],13128:[[12511,12463,12525,12531],256],13129:[[12511,12522],256],13130:[[12511,12522,12496,12540,12523],256],13131:[[12513,12460],256],13132:[[12513,12460,12488,12531],256],13133:[[12513,12540,12488,12523],256],13134:[[12516,12540,12489],256],13135:[[12516,12540,12523],256],13136:[[12518,12450,12531],256],13137:[[12522,12483,12488,12523],256],13138:[[12522,12521],256],13139:[[12523,12500,12540],256],13140:[[12523,12540,12502,12523],256],13141:[[12524,12512],256],13142:[[12524,12531,12488,12466,12531],256],13143:[[12527,12483,12488],256],13144:[[48,28857],256],13145:[[49,28857],256],13146:[[50,28857],256],13147:[[51,28857],256],13148:[[52,28857],256],13149:[[53,28857],256],13150:[[54,28857],256],13151:[[55,28857],256],13152:[[56,28857],256],13153:[[57,28857],256],13154:[[49,48,28857],256],13155:[[49,49,28857],256],13156:[[49,50,28857],256],13157:[[49,51,28857],256],13158:[[49,52,28857],256],13159:[[49,53,28857],256],13160:[[49,54,28857],256],13161:[[49,55,28857],256],13162:[[49,56,28857],256],13163:[[49,57,28857],256],13164:[[50,48,28857],256],13165:[[50,49,28857],256],13166:[[50,50,28857],256],13167:[[50,51,28857],256],13168:[[50,52,28857],256],13169:[[104,80,97],256],13170:[[100,97],256],13171:[[65,85],256],13172:[[98,97,114],256],13173:[[111,86],256],13174:[[112,99],256],13175:[[100,109],256],13176:[[100,109,178],256],13177:[[100,109,179],256],13178:[[73,85],256],13179:[[24179,25104],256],13180:[[26157,21644],256],13181:[[22823,27491],256],13182:[[26126,27835],256],13183:[[26666,24335,20250,31038],256],13184:[[112,65],256],13185:[[110,65],256],13186:[[956,65],256],13187:[[109,65],256],13188:[[107,65],256],13189:[[75,66],256],13190:[[77,66],256],13191:[[71,66],256],13192:[[99,97,108],256],13193:[[107,99,97,108],256],13194:[[112,70],256],13195:[[110,70],256],13196:[[956,70],256],13197:[[956,103],256],13198:[[109,103],256],13199:[[107,103],256],13200:[[72,122],256],13201:[[107,72,122],256],13202:[[77,72,122],256],13203:[[71,72,122],256],13204:[[84,72,122],256],13205:[[956,8467],256],13206:[[109,8467],256],13207:[[100,8467],256],13208:[[107,8467],256],13209:[[102,109],256],13210:[[110,109],256],13211:[[956,109],256],13212:[[109,109],256],13213:[[99,109],256],13214:[[107,109],256],13215:[[109,109,178],256],13216:[[99,109,178],256],13217:[[109,178],256],13218:[[107,109,178],256],13219:[[109,109,179],256],13220:[[99,109,179],256],13221:[[109,179],256],13222:[[107,109,179],256],13223:[[109,8725,115],256],13224:[[109,8725,115,178],256],13225:[[80,97],256],13226:[[107,80,97],256],13227:[[77,80,97],256],13228:[[71,80,97],256],13229:[[114,97,100],256],13230:[[114,97,100,8725,115],256],13231:[[114,97,100,8725,115,178],256],13232:[[112,115],256],13233:[[110,115],256],13234:[[956,115],256],13235:[[109,115],256],13236:[[112,86],256],13237:[[110,86],256],13238:[[956,86],256],13239:[[109,86],256],13240:[[107,86],256],13241:[[77,86],256],13242:[[112,87],256],13243:[[110,87],256],13244:[[956,87],256],13245:[[109,87],256],13246:[[107,87],256],13247:[[77,87],256],13248:[[107,937],256],13249:[[77,937],256],13250:[[97,46,109,46],256],13251:[[66,113],256],13252:[[99,99],256],13253:[[99,100],256],13254:[[67,8725,107,103],256],13255:[[67,111,46],256],13256:[[100,66],256],13257:[[71,121],256],13258:[[104,97],256],13259:[[72,80],256],13260:[[105,110],256],13261:[[75,75],256],13262:[[75,77],256],13263:[[107,116],256],13264:[[108,109],256],13265:[[108,110],256],13266:[[108,111,103],256],13267:[[108,120],256],13268:[[109,98],256],13269:[[109,105,108],256],13270:[[109,111,108],256],13271:[[80,72],256],13272:[[112,46,109,46],256],13273:[[80,80,77],256],13274:[[80,82],256],13275:[[115,114],256],13276:[[83,118],256],13277:[[87,98],256],13278:[[86,8725,109],256],13279:[[65,8725,109],256],13280:[[49,26085],256],13281:[[50,26085],256],13282:[[51,26085],256],13283:[[52,26085],256],13284:[[53,26085],256],13285:[[54,26085],256],13286:[[55,26085],256],13287:[[56,26085],256],13288:[[57,26085],256],13289:[[49,48,26085],256],13290:[[49,49,26085],256],13291:[[49,50,26085],256],13292:[[49,51,26085],256],13293:[[49,52,26085],256],13294:[[49,53,26085],256],13295:[[49,54,26085],256],13296:[[49,55,26085],256],13297:[[49,56,26085],256],13298:[[49,57,26085],256],13299:[[50,48,26085],256],13300:[[50,49,26085],256],13301:[[50,50,26085],256],13302:[[50,51,26085],256],13303:[[50,52,26085],256],13304:[[50,53,26085],256],13305:[[50,54,26085],256],13306:[[50,55,26085],256],13307:[[50,56,26085],256],13308:[[50,57,26085],256],13309:[[51,48,26085],256],13310:[[51,49,26085],256],13311:[[103,97,108],256]},
42496:{42607:[,230],42612:[,230],42613:[,230],42614:[,230],42615:[,230],42616:[,230],42617:[,230],42618:[,230],42619:[,230],42620:[,230],42621:[,230],42655:[,230],42736:[,230],42737:[,230]},
42752:{42864:[[42863],256],43000:[[294],256],43001:[[339],256]},
43008:{43014:[,9],43204:[,9],43232:[,230],43233:[,230],43234:[,230],43235:[,230],43236:[,230],43237:[,230],43238:[,230],43239:[,230],43240:[,230],43241:[,230],43242:[,230],43243:[,230],43244:[,230],43245:[,230],43246:[,230],43247:[,230],43248:[,230],43249:[,230]},
43264:{43307:[,220],43308:[,220],43309:[,220],43347:[,9],43443:[,7],43456:[,9]},
43520:{43696:[,230],43698:[,230],43699:[,230],43700:[,220],43703:[,230],43704:[,230],43710:[,230],43711:[,230],43713:[,230],43766:[,9]},
43776:{44013:[,9]},
53504:{119134:[[119127,119141],512],119135:[[119128,119141],512],119136:[[119135,119150],512],119137:[[119135,119151],512],119138:[[119135,119152],512],119139:[[119135,119153],512],119140:[[119135,119154],512],119141:[,216],119142:[,216],119143:[,1],119144:[,1],119145:[,1],119149:[,226],119150:[,216],119151:[,216],119152:[,216],119153:[,216],119154:[,216],119163:[,220],119164:[,220],119165:[,220],119166:[,220],119167:[,220],119168:[,220],119169:[,220],119170:[,220],119173:[,230],119174:[,230],119175:[,230],119176:[,230],119177:[,230],119178:[,220],119179:[,220],119210:[,230],119211:[,230],119212:[,230],119213:[,230],119227:[[119225,119141],512],119228:[[119226,119141],512],119229:[[119227,119150],512],119230:[[119228,119150],512],119231:[[119227,119151],512],119232:[[119228,119151],512]},
53760:{119362:[,230],119363:[,230],119364:[,230]},
54272:{119808:[[65],256],119809:[[66],256],119810:[[67],256],119811:[[68],256],119812:[[69],256],119813:[[70],256],119814:[[71],256],119815:[[72],256],119816:[[73],256],119817:[[74],256],119818:[[75],256],119819:[[76],256],119820:[[77],256],119821:[[78],256],119822:[[79],256],119823:[[80],256],119824:[[81],256],119825:[[82],256],119826:[[83],256],119827:[[84],256],119828:[[85],256],119829:[[86],256],119830:[[87],256],119831:[[88],256],119832:[[89],256],119833:[[90],256],119834:[[97],256],119835:[[98],256],119836:[[99],256],119837:[[100],256],119838:[[101],256],119839:[[102],256],119840:[[103],256],119841:[[104],256],119842:[[105],256],119843:[[106],256],119844:[[107],256],119845:[[108],256],119846:[[109],256],119847:[[110],256],119848:[[111],256],119849:[[112],256],119850:[[113],256],119851:[[114],256],119852:[[115],256],119853:[[116],256],119854:[[117],256],119855:[[118],256],119856:[[119],256],119857:[[120],256],119858:[[121],256],119859:[[122],256],119860:[[65],256],119861:[[66],256],119862:[[67],256],119863:[[68],256],119864:[[69],256],119865:[[70],256],119866:[[71],256],119867:[[72],256],119868:[[73],256],119869:[[74],256],119870:[[75],256],119871:[[76],256],119872:[[77],256],119873:[[78],256],119874:[[79],256],119875:[[80],256],119876:[[81],256],119877:[[82],256],119878:[[83],256],119879:[[84],256],119880:[[85],256],119881:[[86],256],119882:[[87],256],119883:[[88],256],119884:[[89],256],119885:[[90],256],119886:[[97],256],119887:[[98],256],119888:[[99],256],119889:[[100],256],119890:[[101],256],119891:[[102],256],119892:[[103],256],119894:[[105],256],119895:[[106],256],119896:[[107],256],119897:[[108],256],119898:[[109],256],119899:[[110],256],119900:[[111],256],119901:[[112],256],119902:[[113],256],119903:[[114],256],119904:[[115],256],119905:[[116],256],119906:[[117],256],119907:[[118],256],119908:[[119],256],119909:[[120],256],119910:[[121],256],119911:[[122],256],119912:[[65],256],119913:[[66],256],119914:[[67],256],119915:[[68],256],119916:[[69],256],119917:[[70],256],119918:[[71],256],119919:[[72],256],119920:[[73],256],119921:[[74],256],119922:[[75],256],119923:[[76],256],119924:[[77],256],119925:[[78],256],119926:[[79],256],119927:[[80],256],119928:[[81],256],119929:[[82],256],119930:[[83],256],119931:[[84],256],119932:[[85],256],119933:[[86],256],119934:[[87],256],119935:[[88],256],119936:[[89],256],119937:[[90],256],119938:[[97],256],119939:[[98],256],119940:[[99],256],119941:[[100],256],119942:[[101],256],119943:[[102],256],119944:[[103],256],119945:[[104],256],119946:[[105],256],119947:[[106],256],119948:[[107],256],119949:[[108],256],119950:[[109],256],119951:[[110],256],119952:[[111],256],119953:[[112],256],119954:[[113],256],119955:[[114],256],119956:[[115],256],119957:[[116],256],119958:[[117],256],119959:[[118],256],119960:[[119],256],119961:[[120],256],119962:[[121],256],119963:[[122],256],119964:[[65],256],119966:[[67],256],119967:[[68],256],119970:[[71],256],119973:[[74],256],119974:[[75],256],119977:[[78],256],119978:[[79],256],119979:[[80],256],119980:[[81],256],119982:[[83],256],119983:[[84],256],119984:[[85],256],119985:[[86],256],119986:[[87],256],119987:[[88],256],119988:[[89],256],119989:[[90],256],119990:[[97],256],119991:[[98],256],119992:[[99],256],119993:[[100],256],119995:[[102],256],119997:[[104],256],119998:[[105],256],119999:[[106],256],120000:[[107],256],120001:[[108],256],120002:[[109],256],120003:[[110],256],120005:[[112],256],120006:[[113],256],120007:[[114],256],120008:[[115],256],120009:[[116],256],120010:[[117],256],120011:[[118],256],120012:[[119],256],120013:[[120],256],120014:[[121],256],120015:[[122],256],120016:[[65],256],120017:[[66],256],120018:[[67],256],120019:[[68],256],120020:[[69],256],120021:[[70],256],120022:[[71],256],120023:[[72],256],120024:[[73],256],120025:[[74],256],120026:[[75],256],120027:[[76],256],120028:[[77],256],120029:[[78],256],120030:[[79],256],120031:[[80],256],120032:[[81],256],120033:[[82],256],120034:[[83],256],120035:[[84],256],120036:[[85],256],120037:[[86],256],120038:[[87],256],120039:[[88],256],120040:[[89],256],120041:[[90],256],120042:[[97],256],120043:[[98],256],120044:[[99],256],120045:[[100],256],120046:[[101],256],120047:[[102],256],120048:[[103],256],120049:[[104],256],120050:[[105],256],120051:[[106],256],120052:[[107],256],120053:[[108],256],120054:[[109],256],120055:[[110],256],120056:[[111],256],120057:[[112],256],120058:[[113],256],120059:[[114],256],120060:[[115],256],120061:[[116],256],120062:[[117],256],120063:[[118],256]},
54528:{120064:[[119],256],120065:[[120],256],120066:[[121],256],120067:[[122],256],120068:[[65],256],120069:[[66],256],120071:[[68],256],120072:[[69],256],120073:[[70],256],120074:[[71],256],120077:[[74],256],120078:[[75],256],120079:[[76],256],120080:[[77],256],120081:[[78],256],120082:[[79],256],120083:[[80],256],120084:[[81],256],120086:[[83],256],120087:[[84],256],120088:[[85],256],120089:[[86],256],120090:[[87],256],120091:[[88],256],120092:[[89],256],120094:[[97],256],120095:[[98],256],120096:[[99],256],120097:[[100],256],120098:[[101],256],120099:[[102],256],120100:[[103],256],120101:[[104],256],120102:[[105],256],120103:[[106],256],120104:[[107],256],120105:[[108],256],120106:[[109],256],120107:[[110],256],120108:[[111],256],120109:[[112],256],120110:[[113],256],120111:[[114],256],120112:[[115],256],120113:[[116],256],120114:[[117],256],120115:[[118],256],120116:[[119],256],120117:[[120],256],120118:[[121],256],120119:[[122],256],120120:[[65],256],120121:[[66],256],120123:[[68],256],120124:[[69],256],120125:[[70],256],120126:[[71],256],120128:[[73],256],120129:[[74],256],120130:[[75],256],120131:[[76],256],120132:[[77],256],120134:[[79],256],120138:[[83],256],120139:[[84],256],120140:[[85],256],120141:[[86],256],120142:[[87],256],120143:[[88],256],120144:[[89],256],120146:[[97],256],120147:[[98],256],120148:[[99],256],120149:[[100],256],120150:[[101],256],120151:[[102],256],120152:[[103],256],120153:[[104],256],120154:[[105],256],120155:[[106],256],120156:[[107],256],120157:[[108],256],120158:[[109],256],120159:[[110],256],120160:[[111],256],120161:[[112],256],120162:[[113],256],120163:[[114],256],120164:[[115],256],120165:[[116],256],120166:[[117],256],120167:[[118],256],120168:[[119],256],120169:[[120],256],120170:[[121],256],120171:[[122],256],120172:[[65],256],120173:[[66],256],120174:[[67],256],120175:[[68],256],120176:[[69],256],120177:[[70],256],120178:[[71],256],120179:[[72],256],120180:[[73],256],120181:[[74],256],120182:[[75],256],120183:[[76],256],120184:[[77],256],120185:[[78],256],120186:[[79],256],120187:[[80],256],120188:[[81],256],120189:[[82],256],120190:[[83],256],120191:[[84],256],120192:[[85],256],120193:[[86],256],120194:[[87],256],120195:[[88],256],120196:[[89],256],120197:[[90],256],120198:[[97],256],120199:[[98],256],120200:[[99],256],120201:[[100],256],120202:[[101],256],120203:[[102],256],120204:[[103],256],120205:[[104],256],120206:[[105],256],120207:[[106],256],120208:[[107],256],120209:[[108],256],120210:[[109],256],120211:[[110],256],120212:[[111],256],120213:[[112],256],120214:[[113],256],120215:[[114],256],120216:[[115],256],120217:[[116],256],120218:[[117],256],120219:[[118],256],120220:[[119],256],120221:[[120],256],120222:[[121],256],120223:[[122],256],120224:[[65],256],120225:[[66],256],120226:[[67],256],120227:[[68],256],120228:[[69],256],120229:[[70],256],120230:[[71],256],120231:[[72],256],120232:[[73],256],120233:[[74],256],120234:[[75],256],120235:[[76],256],120236:[[77],256],120237:[[78],256],120238:[[79],256],120239:[[80],256],120240:[[81],256],120241:[[82],256],120242:[[83],256],120243:[[84],256],120244:[[85],256],120245:[[86],256],120246:[[87],256],120247:[[88],256],120248:[[89],256],120249:[[90],256],120250:[[97],256],120251:[[98],256],120252:[[99],256],120253:[[100],256],120254:[[101],256],120255:[[102],256],120256:[[103],256],120257:[[104],256],120258:[[105],256],120259:[[106],256],120260:[[107],256],120261:[[108],256],120262:[[109],256],120263:[[110],256],120264:[[111],256],120265:[[112],256],120266:[[113],256],120267:[[114],256],120268:[[115],256],120269:[[116],256],120270:[[117],256],120271:[[118],256],120272:[[119],256],120273:[[120],256],120274:[[121],256],120275:[[122],256],120276:[[65],256],120277:[[66],256],120278:[[67],256],120279:[[68],256],120280:[[69],256],120281:[[70],256],120282:[[71],256],120283:[[72],256],120284:[[73],256],120285:[[74],256],120286:[[75],256],120287:[[76],256],120288:[[77],256],120289:[[78],256],120290:[[79],256],120291:[[80],256],120292:[[81],256],120293:[[82],256],120294:[[83],256],120295:[[84],256],120296:[[85],256],120297:[[86],256],120298:[[87],256],120299:[[88],256],120300:[[89],256],120301:[[90],256],120302:[[97],256],120303:[[98],256],120304:[[99],256],120305:[[100],256],120306:[[101],256],120307:[[102],256],120308:[[103],256],120309:[[104],256],120310:[[105],256],120311:[[106],256],120312:[[107],256],120313:[[108],256],120314:[[109],256],120315:[[110],256],120316:[[111],256],120317:[[112],256],120318:[[113],256],120319:[[114],256]},
54784:{120320:[[115],256],120321:[[116],256],120322:[[117],256],120323:[[118],256],120324:[[119],256],120325:[[120],256],120326:[[121],256],120327:[[122],256],120328:[[65],256],120329:[[66],256],120330:[[67],256],120331:[[68],256],120332:[[69],256],120333:[[70],256],120334:[[71],256],120335:[[72],256],120336:[[73],256],120337:[[74],256],120338:[[75],256],120339:[[76],256],120340:[[77],256],120341:[[78],256],120342:[[79],256],120343:[[80],256],120344:[[81],256],120345:[[82],256],120346:[[83],256],120347:[[84],256],120348:[[85],256],120349:[[86],256],120350:[[87],256],120351:[[88],256],120352:[[89],256],120353:[[90],256],120354:[[97],256],120355:[[98],256],120356:[[99],256],120357:[[100],256],120358:[[101],256],120359:[[102],256],120360:[[103],256],120361:[[104],256],120362:[[105],256],120363:[[106],256],120364:[[107],256],120365:[[108],256],120366:[[109],256],120367:[[110],256],120368:[[111],256],120369:[[112],256],120370:[[113],256],120371:[[114],256],120372:[[115],256],120373:[[116],256],120374:[[117],256],120375:[[118],256],120376:[[119],256],120377:[[120],256],120378:[[121],256],120379:[[122],256],120380:[[65],256],120381:[[66],256],120382:[[67],256],120383:[[68],256],120384:[[69],256],120385:[[70],256],120386:[[71],256],120387:[[72],256],120388:[[73],256],120389:[[74],256],120390:[[75],256],120391:[[76],256],120392:[[77],256],120393:[[78],256],120394:[[79],256],120395:[[80],256],120396:[[81],256],120397:[[82],256],120398:[[83],256],120399:[[84],256],120400:[[85],256],120401:[[86],256],120402:[[87],256],120403:[[88],256],120404:[[89],256],120405:[[90],256],120406:[[97],256],120407:[[98],256],120408:[[99],256],120409:[[100],256],120410:[[101],256],120411:[[102],256],120412:[[103],256],120413:[[104],256],120414:[[105],256],120415:[[106],256],120416:[[107],256],120417:[[108],256],120418:[[109],256],120419:[[110],256],120420:[[111],256],120421:[[112],256],120422:[[113],256],120423:[[114],256],120424:[[115],256],120425:[[116],256],120426:[[117],256],120427:[[118],256],120428:[[119],256],120429:[[120],256],120430:[[121],256],120431:[[122],256],120432:[[65],256],120433:[[66],256],120434:[[67],256],120435:[[68],256],120436:[[69],256],120437:[[70],256],120438:[[71],256],120439:[[72],256],120440:[[73],256],120441:[[74],256],120442:[[75],256],120443:[[76],256],120444:[[77],256],120445:[[78],256],120446:[[79],256],120447:[[80],256],120448:[[81],256],120449:[[82],256],120450:[[83],256],120451:[[84],256],120452:[[85],256],120453:[[86],256],120454:[[87],256],120455:[[88],256],120456:[[89],256],120457:[[90],256],120458:[[97],256],120459:[[98],256],120460:[[99],256],120461:[[100],256],120462:[[101],256],120463:[[102],256],120464:[[103],256],120465:[[104],256],120466:[[105],256],120467:[[106],256],120468:[[107],256],120469:[[108],256],120470:[[109],256],120471:[[110],256],120472:[[111],256],120473:[[112],256],120474:[[113],256],120475:[[114],256],120476:[[115],256],120477:[[116],256],120478:[[117],256],120479:[[118],256],120480:[[119],256],120481:[[120],256],120482:[[121],256],120483:[[122],256],120484:[[305],256],120485:[[567],256],120488:[[913],256],120489:[[914],256],120490:[[915],256],120491:[[916],256],120492:[[917],256],120493:[[918],256],120494:[[919],256],120495:[[920],256],120496:[[921],256],120497:[[922],256],120498:[[923],256],120499:[[924],256],120500:[[925],256],120501:[[926],256],120502:[[927],256],120503:[[928],256],120504:[[929],256],120505:[[1012],256],120506:[[931],256],120507:[[932],256],120508:[[933],256],120509:[[934],256],120510:[[935],256],120511:[[936],256],120512:[[937],256],120513:[[8711],256],120514:[[945],256],120515:[[946],256],120516:[[947],256],120517:[[948],256],120518:[[949],256],120519:[[950],256],120520:[[951],256],120521:[[952],256],120522:[[953],256],120523:[[954],256],120524:[[955],256],120525:[[956],256],120526:[[957],256],120527:[[958],256],120528:[[959],256],120529:[[960],256],120530:[[961],256],120531:[[962],256],120532:[[963],256],120533:[[964],256],120534:[[965],256],120535:[[966],256],120536:[[967],256],120537:[[968],256],120538:[[969],256],120539:[[8706],256],120540:[[1013],256],120541:[[977],256],120542:[[1008],256],120543:[[981],256],120544:[[1009],256],120545:[[982],256],120546:[[913],256],120547:[[914],256],120548:[[915],256],120549:[[916],256],120550:[[917],256],120551:[[918],256],120552:[[919],256],120553:[[920],256],120554:[[921],256],120555:[[922],256],120556:[[923],256],120557:[[924],256],120558:[[925],256],120559:[[926],256],120560:[[927],256],120561:[[928],256],120562:[[929],256],120563:[[1012],256],120564:[[931],256],120565:[[932],256],120566:[[933],256],120567:[[934],256],120568:[[935],256],120569:[[936],256],120570:[[937],256],120571:[[8711],256],120572:[[945],256],120573:[[946],256],120574:[[947],256],120575:[[948],256]},
55040:{120576:[[949],256],120577:[[950],256],120578:[[951],256],120579:[[952],256],120580:[[953],256],120581:[[954],256],120582:[[955],256],120583:[[956],256],120584:[[957],256],120585:[[958],256],120586:[[959],256],120587:[[960],256],120588:[[961],256],120589:[[962],256],120590:[[963],256],120591:[[964],256],120592:[[965],256],120593:[[966],256],120594:[[967],256],120595:[[968],256],120596:[[969],256],120597:[[8706],256],120598:[[1013],256],120599:[[977],256],120600:[[1008],256],120601:[[981],256],120602:[[1009],256],120603:[[982],256],120604:[[913],256],120605:[[914],256],120606:[[915],256],120607:[[916],256],120608:[[917],256],120609:[[918],256],120610:[[919],256],120611:[[920],256],120612:[[921],256],120613:[[922],256],120614:[[923],256],120615:[[924],256],120616:[[925],256],120617:[[926],256],120618:[[927],256],120619:[[928],256],120620:[[929],256],120621:[[1012],256],120622:[[931],256],120623:[[932],256],120624:[[933],256],120625:[[934],256],120626:[[935],256],120627:[[936],256],120628:[[937],256],120629:[[8711],256],120630:[[945],256],120631:[[946],256],120632:[[947],256],120633:[[948],256],120634:[[949],256],120635:[[950],256],120636:[[951],256],120637:[[952],256],120638:[[953],256],120639:[[954],256],120640:[[955],256],120641:[[956],256],120642:[[957],256],120643:[[958],256],120644:[[959],256],120645:[[960],256],120646:[[961],256],120647:[[962],256],120648:[[963],256],120649:[[964],256],120650:[[965],256],120651:[[966],256],120652:[[967],256],120653:[[968],256],120654:[[969],256],120655:[[8706],256],120656:[[1013],256],120657:[[977],256],120658:[[1008],256],120659:[[981],256],120660:[[1009],256],120661:[[982],256],120662:[[913],256],120663:[[914],256],120664:[[915],256],120665:[[916],256],120666:[[917],256],120667:[[918],256],120668:[[919],256],120669:[[920],256],120670:[[921],256],120671:[[922],256],120672:[[923],256],120673:[[924],256],120674:[[925],256],120675:[[926],256],120676:[[927],256],120677:[[928],256],120678:[[929],256],120679:[[1012],256],120680:[[931],256],120681:[[932],256],120682:[[933],256],120683:[[934],256],120684:[[935],256],120685:[[936],256],120686:[[937],256],120687:[[8711],256],120688:[[945],256],120689:[[946],256],120690:[[947],256],120691:[[948],256],120692:[[949],256],120693:[[950],256],120694:[[951],256],120695:[[952],256],120696:[[953],256],120697:[[954],256],120698:[[955],256],120699:[[956],256],120700:[[957],256],120701:[[958],256],120702:[[959],256],120703:[[960],256],120704:[[961],256],120705:[[962],256],120706:[[963],256],120707:[[964],256],120708:[[965],256],120709:[[966],256],120710:[[967],256],120711:[[968],256],120712:[[969],256],120713:[[8706],256],120714:[[1013],256],120715:[[977],256],120716:[[1008],256],120717:[[981],256],120718:[[1009],256],120719:[[982],256],120720:[[913],256],120721:[[914],256],120722:[[915],256],120723:[[916],256],120724:[[917],256],120725:[[918],256],120726:[[919],256],120727:[[920],256],120728:[[921],256],120729:[[922],256],120730:[[923],256],120731:[[924],256],120732:[[925],256],120733:[[926],256],120734:[[927],256],120735:[[928],256],120736:[[929],256],120737:[[1012],256],120738:[[931],256],120739:[[932],256],120740:[[933],256],120741:[[934],256],120742:[[935],256],120743:[[936],256],120744:[[937],256],120745:[[8711],256],120746:[[945],256],120747:[[946],256],120748:[[947],256],120749:[[948],256],120750:[[949],256],120751:[[950],256],120752:[[951],256],120753:[[952],256],120754:[[953],256],120755:[[954],256],120756:[[955],256],120757:[[956],256],120758:[[957],256],120759:[[958],256],120760:[[959],256],120761:[[960],256],120762:[[961],256],120763:[[962],256],120764:[[963],256],120765:[[964],256],120766:[[965],256],120767:[[966],256],120768:[[967],256],120769:[[968],256],120770:[[969],256],120771:[[8706],256],120772:[[1013],256],120773:[[977],256],120774:[[1008],256],120775:[[981],256],120776:[[1009],256],120777:[[982],256],120778:[[988],256],120779:[[989],256],120782:[[48],256],120783:[[49],256],120784:[[50],256],120785:[[51],256],120786:[[52],256],120787:[[53],256],120788:[[54],256],120789:[[55],256],120790:[[56],256],120791:[[57],256],120792:[[48],256],120793:[[49],256],120794:[[50],256],120795:[[51],256],120796:[[52],256],120797:[[53],256],120798:[[54],256],120799:[[55],256],120800:[[56],256],120801:[[57],256],120802:[[48],256],120803:[[49],256],120804:[[50],256],120805:[[51],256],120806:[[52],256],120807:[[53],256],120808:[[54],256],120809:[[55],256],120810:[[56],256],120811:[[57],256],120812:[[48],256],120813:[[49],256],120814:[[50],256],120815:[[51],256],120816:[[52],256],120817:[[53],256],120818:[[54],256],120819:[[55],256],120820:[[56],256],120821:[[57],256],120822:[[48],256],120823:[[49],256],120824:[[50],256],120825:[[51],256],120826:[[52],256],120827:[[53],256],120828:[[54],256],120829:[[55],256],120830:[[56],256],120831:[[57],256]},
60928:{126464:[[1575],256],126465:[[1576],256],126466:[[1580],256],126467:[[1583],256],126469:[[1608],256],126470:[[1586],256],126471:[[1581],256],126472:[[1591],256],126473:[[1610],256],126474:[[1603],256],126475:[[1604],256],126476:[[1605],256],126477:[[1606],256],126478:[[1587],256],126479:[[1593],256],126480:[[1601],256],126481:[[1589],256],126482:[[1602],256],126483:[[1585],256],126484:[[1588],256],126485:[[1578],256],126486:[[1579],256],126487:[[1582],256],126488:[[1584],256],126489:[[1590],256],126490:[[1592],256],126491:[[1594],256],126492:[[1646],256],126493:[[1722],256],126494:[[1697],256],126495:[[1647],256],126497:[[1576],256],126498:[[1580],256],126500:[[1607],256],126503:[[1581],256],126505:[[1610],256],126506:[[1603],256],126507:[[1604],256],126508:[[1605],256],126509:[[1606],256],126510:[[1587],256],126511:[[1593],256],126512:[[1601],256],126513:[[1589],256],126514:[[1602],256],126516:[[1588],256],126517:[[1578],256],126518:[[1579],256],126519:[[1582],256],126521:[[1590],256],126523:[[1594],256],126530:[[1580],256],126535:[[1581],256],126537:[[1610],256],126539:[[1604],256],126541:[[1606],256],126542:[[1587],256],126543:[[1593],256],126545:[[1589],256],126546:[[1602],256],126548:[[1588],256],126551:[[1582],256],126553:[[1590],256],126555:[[1594],256],126557:[[1722],256],126559:[[1647],256],126561:[[1576],256],126562:[[1580],256],126564:[[1607],256],126567:[[1581],256],126568:[[1591],256],126569:[[1610],256],126570:[[1603],256],126572:[[1605],256],126573:[[1606],256],126574:[[1587],256],126575:[[1593],256],126576:[[1601],256],126577:[[1589],256],126578:[[1602],256],126580:[[1588],256],126581:[[1578],256],126582:[[1579],256],126583:[[1582],256],126585:[[1590],256],126586:[[1592],256],126587:[[1594],256],126588:[[1646],256],126590:[[1697],256],126592:[[1575],256],126593:[[1576],256],126594:[[1580],256],126595:[[1583],256],126596:[[1607],256],126597:[[1608],256],126598:[[1586],256],126599:[[1581],256],126600:[[1591],256],126601:[[1610],256],126603:[[1604],256],126604:[[1605],256],126605:[[1606],256],126606:[[1587],256],126607:[[1593],256],126608:[[1601],256],126609:[[1589],256],126610:[[1602],256],126611:[[1585],256],126612:[[1588],256],126613:[[1578],256],126614:[[1579],256],126615:[[1582],256],126616:[[1584],256],126617:[[1590],256],126618:[[1592],256],126619:[[1594],256],126625:[[1576],256],126626:[[1580],256],126627:[[1583],256],126629:[[1608],256],126630:[[1586],256],126631:[[1581],256],126632:[[1591],256],126633:[[1610],256],126635:[[1604],256],126636:[[1605],256],126637:[[1606],256],126638:[[1587],256],126639:[[1593],256],126640:[[1601],256],126641:[[1589],256],126642:[[1602],256],126643:[[1585],256],126644:[[1588],256],126645:[[1578],256],126646:[[1579],256],126647:[[1582],256],126648:[[1584],256],126649:[[1590],256],126650:[[1592],256],126651:[[1594],256]},
61696:{127232:[[48,46],256],127233:[[48,44],256],127234:[[49,44],256],127235:[[50,44],256],127236:[[51,44],256],127237:[[52,44],256],127238:[[53,44],256],127239:[[54,44],256],127240:[[55,44],256],127241:[[56,44],256],127242:[[57,44],256],127248:[[40,65,41],256],127249:[[40,66,41],256],127250:[[40,67,41],256],127251:[[40,68,41],256],127252:[[40,69,41],256],127253:[[40,70,41],256],127254:[[40,71,41],256],127255:[[40,72,41],256],127256:[[40,73,41],256],127257:[[40,74,41],256],127258:[[40,75,41],256],127259:[[40,76,41],256],127260:[[40,77,41],256],127261:[[40,78,41],256],127262:[[40,79,41],256],127263:[[40,80,41],256],127264:[[40,81,41],256],127265:[[40,82,41],256],127266:[[40,83,41],256],127267:[[40,84,41],256],127268:[[40,85,41],256],127269:[[40,86,41],256],127270:[[40,87,41],256],127271:[[40,88,41],256],127272:[[40,89,41],256],127273:[[40,90,41],256],127274:[[12308,83,12309],256],127275:[[67],256],127276:[[82],256],127277:[[67,68],256],127278:[[87,90],256],127280:[[65],256],127281:[[66],256],127282:[[67],256],127283:[[68],256],127284:[[69],256],127285:[[70],256],127286:[[71],256],127287:[[72],256],127288:[[73],256],127289:[[74],256],127290:[[75],256],127291:[[76],256],127292:[[77],256],127293:[[78],256],127294:[[79],256],127295:[[80],256],127296:[[81],256],127297:[[82],256],127298:[[83],256],127299:[[84],256],127300:[[85],256],127301:[[86],256],127302:[[87],256],127303:[[88],256],127304:[[89],256],127305:[[90],256],127306:[[72,86],256],127307:[[77,86],256],127308:[[83,68],256],127309:[[83,83],256],127310:[[80,80,86],256],127311:[[87,67],256],127338:[[77,67],256],127339:[[77,68],256],127376:[[68,74],256]},
61952:{127488:[[12411,12363],256],127489:[[12467,12467],256],127490:[[12469],256],127504:[[25163],256],127505:[[23383],256],127506:[[21452],256],127507:[[12487],256],127508:[[20108],256],127509:[[22810],256],127510:[[35299],256],127511:[[22825],256],127512:[[20132],256],127513:[[26144],256],127514:[[28961],256],127515:[[26009],256],127516:[[21069],256],127517:[[24460],256],127518:[[20877],256],127519:[[26032],256],127520:[[21021],256],127521:[[32066],256],127522:[[29983],256],127523:[[36009],256],127524:[[22768],256],127525:[[21561],256],127526:[[28436],256],127527:[[25237],256],127528:[[25429],256],127529:[[19968],256],127530:[[19977],256],127531:[[36938],256],127532:[[24038],256],127533:[[20013],256],127534:[[21491],256],127535:[[25351],256],127536:[[36208],256],127537:[[25171],256],127538:[[31105],256],127539:[[31354],256],127540:[[21512],256],127541:[[28288],256],127542:[[26377],256],127543:[[26376],256],127544:[[30003],256],127545:[[21106],256],127546:[[21942],256],127552:[[12308,26412,12309],256],127553:[[12308,19977,12309],256],127554:[[12308,20108,12309],256],127555:[[12308,23433,12309],256],127556:[[12308,28857,12309],256],127557:[[12308,25171,12309],256],127558:[[12308,30423,12309],256],127559:[[12308,21213,12309],256],127560:[[12308,25943,12309],256],127568:[[24471],256],127569:[[21487],256]},
63488:{194560:[[20029]],194561:[[20024]],194562:[[20033]],194563:[[131362]],194564:[[20320]],194565:[[20398]],194566:[[20411]],194567:[[20482]],194568:[[20602]],194569:[[20633]],194570:[[20711]],194571:[[20687]],194572:[[13470]],194573:[[132666]],194574:[[20813]],194575:[[20820]],194576:[[20836]],194577:[[20855]],194578:[[132380]],194579:[[13497]],194580:[[20839]],194581:[[20877]],194582:[[132427]],194583:[[20887]],194584:[[20900]],194585:[[20172]],194586:[[20908]],194587:[[20917]],194588:[[168415]],194589:[[20981]],194590:[[20995]],194591:[[13535]],194592:[[21051]],194593:[[21062]],194594:[[21106]],194595:[[21111]],194596:[[13589]],194597:[[21191]],194598:[[21193]],194599:[[21220]],194600:[[21242]],194601:[[21253]],194602:[[21254]],194603:[[21271]],194604:[[21321]],194605:[[21329]],194606:[[21338]],194607:[[21363]],194608:[[21373]],194609:[[21375]],194610:[[21375]],194611:[[21375]],194612:[[133676]],194613:[[28784]],194614:[[21450]],194615:[[21471]],194616:[[133987]],194617:[[21483]],194618:[[21489]],194619:[[21510]],194620:[[21662]],194621:[[21560]],194622:[[21576]],194623:[[21608]],194624:[[21666]],194625:[[21750]],194626:[[21776]],194627:[[21843]],194628:[[21859]],194629:[[21892]],194630:[[21892]],194631:[[21913]],194632:[[21931]],194633:[[21939]],194634:[[21954]],194635:[[22294]],194636:[[22022]],194637:[[22295]],194638:[[22097]],194639:[[22132]],194640:[[20999]],194641:[[22766]],194642:[[22478]],194643:[[22516]],194644:[[22541]],194645:[[22411]],194646:[[22578]],194647:[[22577]],194648:[[22700]],194649:[[136420]],194650:[[22770]],194651:[[22775]],194652:[[22790]],194653:[[22810]],194654:[[22818]],194655:[[22882]],194656:[[136872]],194657:[[136938]],194658:[[23020]],194659:[[23067]],194660:[[23079]],194661:[[23000]],194662:[[23142]],194663:[[14062]],194664:[[14076]],194665:[[23304]],194666:[[23358]],194667:[[23358]],194668:[[137672]],194669:[[23491]],194670:[[23512]],194671:[[23527]],194672:[[23539]],194673:[[138008]],194674:[[23551]],194675:[[23558]],194676:[[24403]],194677:[[23586]],194678:[[14209]],194679:[[23648]],194680:[[23662]],194681:[[23744]],194682:[[23693]],194683:[[138724]],194684:[[23875]],194685:[[138726]],194686:[[23918]],194687:[[23915]],194688:[[23932]],194689:[[24033]],194690:[[24034]],194691:[[14383]],194692:[[24061]],194693:[[24104]],194694:[[24125]],194695:[[24169]],194696:[[14434]],194697:[[139651]],194698:[[14460]],194699:[[24240]],194700:[[24243]],194701:[[24246]],194702:[[24266]],194703:[[172946]],194704:[[24318]],194705:[[140081]],194706:[[140081]],194707:[[33281]],194708:[[24354]],194709:[[24354]],194710:[[14535]],194711:[[144056]],194712:[[156122]],194713:[[24418]],194714:[[24427]],194715:[[14563]],194716:[[24474]],194717:[[24525]],194718:[[24535]],194719:[[24569]],194720:[[24705]],194721:[[14650]],194722:[[14620]],194723:[[24724]],194724:[[141012]],194725:[[24775]],194726:[[24904]],194727:[[24908]],194728:[[24910]],194729:[[24908]],194730:[[24954]],194731:[[24974]],194732:[[25010]],194733:[[24996]],194734:[[25007]],194735:[[25054]],194736:[[25074]],194737:[[25078]],194738:[[25104]],194739:[[25115]],194740:[[25181]],194741:[[25265]],194742:[[25300]],194743:[[25424]],194744:[[142092]],194745:[[25405]],194746:[[25340]],194747:[[25448]],194748:[[25475]],194749:[[25572]],194750:[[142321]],194751:[[25634]],194752:[[25541]],194753:[[25513]],194754:[[14894]],194755:[[25705]],194756:[[25726]],194757:[[25757]],194758:[[25719]],194759:[[14956]],194760:[[25935]],194761:[[25964]],194762:[[143370]],194763:[[26083]],194764:[[26360]],194765:[[26185]],194766:[[15129]],194767:[[26257]],194768:[[15112]],194769:[[15076]],194770:[[20882]],194771:[[20885]],194772:[[26368]],194773:[[26268]],194774:[[32941]],194775:[[17369]],194776:[[26391]],194777:[[26395]],194778:[[26401]],194779:[[26462]],194780:[[26451]],194781:[[144323]],194782:[[15177]],194783:[[26618]],194784:[[26501]],194785:[[26706]],194786:[[26757]],194787:[[144493]],194788:[[26766]],194789:[[26655]],194790:[[26900]],194791:[[15261]],194792:[[26946]],194793:[[27043]],194794:[[27114]],194795:[[27304]],194796:[[145059]],194797:[[27355]],194798:[[15384]],194799:[[27425]],194800:[[145575]],194801:[[27476]],194802:[[15438]],194803:[[27506]],194804:[[27551]],194805:[[27578]],194806:[[27579]],194807:[[146061]],194808:[[138507]],194809:[[146170]],194810:[[27726]],194811:[[146620]],194812:[[27839]],194813:[[27853]],194814:[[27751]],194815:[[27926]]},
63744:{63744:[[35912]],63745:[[26356]],63746:[[36554]],63747:[[36040]],63748:[[28369]],63749:[[20018]],63750:[[21477]],63751:[[40860]],63752:[[40860]],63753:[[22865]],63754:[[37329]],63755:[[21895]],63756:[[22856]],63757:[[25078]],63758:[[30313]],63759:[[32645]],63760:[[34367]],63761:[[34746]],63762:[[35064]],63763:[[37007]],63764:[[27138]],63765:[[27931]],63766:[[28889]],63767:[[29662]],63768:[[33853]],63769:[[37226]],63770:[[39409]],63771:[[20098]],63772:[[21365]],63773:[[27396]],63774:[[29211]],63775:[[34349]],63776:[[40478]],63777:[[23888]],63778:[[28651]],63779:[[34253]],63780:[[35172]],63781:[[25289]],63782:[[33240]],63783:[[34847]],63784:[[24266]],63785:[[26391]],63786:[[28010]],63787:[[29436]],63788:[[37070]],63789:[[20358]],63790:[[20919]],63791:[[21214]],63792:[[25796]],63793:[[27347]],63794:[[29200]],63795:[[30439]],63796:[[32769]],63797:[[34310]],63798:[[34396]],63799:[[36335]],63800:[[38706]],63801:[[39791]],63802:[[40442]],63803:[[30860]],63804:[[31103]],63805:[[32160]],63806:[[33737]],63807:[[37636]],63808:[[40575]],63809:[[35542]],63810:[[22751]],63811:[[24324]],63812:[[31840]],63813:[[32894]],63814:[[29282]],63815:[[30922]],63816:[[36034]],63817:[[38647]],63818:[[22744]],63819:[[23650]],63820:[[27155]],63821:[[28122]],63822:[[28431]],63823:[[32047]],63824:[[32311]],63825:[[38475]],63826:[[21202]],63827:[[32907]],63828:[[20956]],63829:[[20940]],63830:[[31260]],63831:[[32190]],63832:[[33777]],63833:[[38517]],63834:[[35712]],63835:[[25295]],63836:[[27138]],63837:[[35582]],63838:[[20025]],63839:[[23527]],63840:[[24594]],63841:[[29575]],63842:[[30064]],63843:[[21271]],63844:[[30971]],63845:[[20415]],63846:[[24489]],63847:[[19981]],63848:[[27852]],63849:[[25976]],63850:[[32034]],63851:[[21443]],63852:[[22622]],63853:[[30465]],63854:[[33865]],63855:[[35498]],63856:[[27578]],63857:[[36784]],63858:[[27784]],63859:[[25342]],63860:[[33509]],63861:[[25504]],63862:[[30053]],63863:[[20142]],63864:[[20841]],63865:[[20937]],63866:[[26753]],63867:[[31975]],63868:[[33391]],63869:[[35538]],63870:[[37327]],63871:[[21237]],63872:[[21570]],63873:[[22899]],63874:[[24300]],63875:[[26053]],63876:[[28670]],63877:[[31018]],63878:[[38317]],63879:[[39530]],63880:[[40599]],63881:[[40654]],63882:[[21147]],63883:[[26310]],63884:[[27511]],63885:[[36706]],63886:[[24180]],63887:[[24976]],63888:[[25088]],63889:[[25754]],63890:[[28451]],63891:[[29001]],63892:[[29833]],63893:[[31178]],63894:[[32244]],63895:[[32879]],63896:[[36646]],63897:[[34030]],63898:[[36899]],63899:[[37706]],63900:[[21015]],63901:[[21155]],63902:[[21693]],63903:[[28872]],63904:[[35010]],63905:[[35498]],63906:[[24265]],63907:[[24565]],63908:[[25467]],63909:[[27566]],63910:[[31806]],63911:[[29557]],63912:[[20196]],63913:[[22265]],63914:[[23527]],63915:[[23994]],63916:[[24604]],63917:[[29618]],63918:[[29801]],63919:[[32666]],63920:[[32838]],63921:[[37428]],63922:[[38646]],63923:[[38728]],63924:[[38936]],63925:[[20363]],63926:[[31150]],63927:[[37300]],63928:[[38584]],63929:[[24801]],63930:[[20102]],63931:[[20698]],63932:[[23534]],63933:[[23615]],63934:[[26009]],63935:[[27138]],63936:[[29134]],63937:[[30274]],63938:[[34044]],63939:[[36988]],63940:[[40845]],63941:[[26248]],63942:[[38446]],63943:[[21129]],63944:[[26491]],63945:[[26611]],63946:[[27969]],63947:[[28316]],63948:[[29705]],63949:[[30041]],63950:[[30827]],63951:[[32016]],63952:[[39006]],63953:[[20845]],63954:[[25134]],63955:[[38520]],63956:[[20523]],63957:[[23833]],63958:[[28138]],63959:[[36650]],63960:[[24459]],63961:[[24900]],63962:[[26647]],63963:[[29575]],63964:[[38534]],63965:[[21033]],63966:[[21519]],63967:[[23653]],63968:[[26131]],63969:[[26446]],63970:[[26792]],63971:[[27877]],63972:[[29702]],63973:[[30178]],63974:[[32633]],63975:[[35023]],63976:[[35041]],63977:[[37324]],63978:[[38626]],63979:[[21311]],63980:[[28346]],63981:[[21533]],63982:[[29136]],63983:[[29848]],63984:[[34298]],63985:[[38563]],63986:[[40023]],63987:[[40607]],63988:[[26519]],63989:[[28107]],63990:[[33256]],63991:[[31435]],63992:[[31520]],63993:[[31890]],63994:[[29376]],63995:[[28825]],63996:[[35672]],63997:[[20160]],63998:[[33590]],63999:[[21050]],194816:[[27966]],194817:[[28023]],194818:[[27969]],194819:[[28009]],194820:[[28024]],194821:[[28037]],194822:[[146718]],194823:[[27956]],194824:[[28207]],194825:[[28270]],194826:[[15667]],194827:[[28363]],194828:[[28359]],194829:[[147153]],194830:[[28153]],194831:[[28526]],194832:[[147294]],194833:[[147342]],194834:[[28614]],194835:[[28729]],194836:[[28702]],194837:[[28699]],194838:[[15766]],194839:[[28746]],194840:[[28797]],194841:[[28791]],194842:[[28845]],194843:[[132389]],194844:[[28997]],194845:[[148067]],194846:[[29084]],194847:[[148395]],194848:[[29224]],194849:[[29237]],194850:[[29264]],194851:[[149000]],194852:[[29312]],194853:[[29333]],194854:[[149301]],194855:[[149524]],194856:[[29562]],194857:[[29579]],194858:[[16044]],194859:[[29605]],194860:[[16056]],194861:[[16056]],194862:[[29767]],194863:[[29788]],194864:[[29809]],194865:[[29829]],194866:[[29898]],194867:[[16155]],194868:[[29988]],194869:[[150582]],194870:[[30014]],194871:[[150674]],194872:[[30064]],194873:[[139679]],194874:[[30224]],194875:[[151457]],194876:[[151480]],194877:[[151620]],194878:[[16380]],194879:[[16392]],194880:[[30452]],194881:[[151795]],194882:[[151794]],194883:[[151833]],194884:[[151859]],194885:[[30494]],194886:[[30495]],194887:[[30495]],194888:[[30538]],194889:[[16441]],194890:[[30603]],194891:[[16454]],194892:[[16534]],194893:[[152605]],194894:[[30798]],194895:[[30860]],194896:[[30924]],194897:[[16611]],194898:[[153126]],194899:[[31062]],194900:[[153242]],194901:[[153285]],194902:[[31119]],194903:[[31211]],194904:[[16687]],194905:[[31296]],194906:[[31306]],194907:[[31311]],194908:[[153980]],194909:[[154279]],194910:[[154279]],194911:[[31470]],194912:[[16898]],194913:[[154539]],194914:[[31686]],194915:[[31689]],194916:[[16935]],194917:[[154752]],194918:[[31954]],194919:[[17056]],194920:[[31976]],194921:[[31971]],194922:[[32000]],194923:[[155526]],194924:[[32099]],194925:[[17153]],194926:[[32199]],194927:[[32258]],194928:[[32325]],194929:[[17204]],194930:[[156200]],194931:[[156231]],194932:[[17241]],194933:[[156377]],194934:[[32634]],194935:[[156478]],194936:[[32661]],194937:[[32762]],194938:[[32773]],194939:[[156890]],194940:[[156963]],194941:[[32864]],194942:[[157096]],194943:[[32880]],194944:[[144223]],194945:[[17365]],194946:[[32946]],194947:[[33027]],194948:[[17419]],194949:[[33086]],194950:[[23221]],194951:[[157607]],194952:[[157621]],194953:[[144275]],194954:[[144284]],194955:[[33281]],194956:[[33284]],194957:[[36766]],194958:[[17515]],194959:[[33425]],194960:[[33419]],194961:[[33437]],194962:[[21171]],194963:[[33457]],194964:[[33459]],194965:[[33469]],194966:[[33510]],194967:[[158524]],194968:[[33509]],194969:[[33565]],194970:[[33635]],194971:[[33709]],194972:[[33571]],194973:[[33725]],194974:[[33767]],194975:[[33879]],194976:[[33619]],194977:[[33738]],194978:[[33740]],194979:[[33756]],194980:[[158774]],194981:[[159083]],194982:[[158933]],194983:[[17707]],194984:[[34033]],194985:[[34035]],194986:[[34070]],194987:[[160714]],194988:[[34148]],194989:[[159532]],194990:[[17757]],194991:[[17761]],194992:[[159665]],194993:[[159954]],194994:[[17771]],194995:[[34384]],194996:[[34396]],194997:[[34407]],194998:[[34409]],194999:[[34473]],195000:[[34440]],195001:[[34574]],195002:[[34530]],195003:[[34681]],195004:[[34600]],195005:[[34667]],195006:[[34694]],195007:[[17879]],195008:[[34785]],195009:[[34817]],195010:[[17913]],195011:[[34912]],195012:[[34915]],195013:[[161383]],195014:[[35031]],195015:[[35038]],195016:[[17973]],195017:[[35066]],195018:[[13499]],195019:[[161966]],195020:[[162150]],195021:[[18110]],195022:[[18119]],195023:[[35488]],195024:[[35565]],195025:[[35722]],195026:[[35925]],195027:[[162984]],195028:[[36011]],195029:[[36033]],195030:[[36123]],195031:[[36215]],195032:[[163631]],195033:[[133124]],195034:[[36299]],195035:[[36284]],195036:[[36336]],195037:[[133342]],195038:[[36564]],195039:[[36664]],195040:[[165330]],195041:[[165357]],195042:[[37012]],195043:[[37105]],195044:[[37137]],195045:[[165678]],195046:[[37147]],195047:[[37432]],195048:[[37591]],195049:[[37592]],195050:[[37500]],195051:[[37881]],195052:[[37909]],195053:[[166906]],195054:[[38283]],195055:[[18837]],195056:[[38327]],195057:[[167287]],195058:[[18918]],195059:[[38595]],195060:[[23986]],195061:[[38691]],195062:[[168261]],195063:[[168474]],195064:[[19054]],195065:[[19062]],195066:[[38880]],195067:[[168970]],195068:[[19122]],195069:[[169110]],195070:[[38923]],195071:[[38923]]},
64000:{64000:[[20999]],64001:[[24230]],64002:[[25299]],64003:[[31958]],64004:[[23429]],64005:[[27934]],64006:[[26292]],64007:[[36667]],64008:[[34892]],64009:[[38477]],64010:[[35211]],64011:[[24275]],64012:[[20800]],64013:[[21952]],64016:[[22618]],64018:[[26228]],64021:[[20958]],64022:[[29482]],64023:[[30410]],64024:[[31036]],64025:[[31070]],64026:[[31077]],64027:[[31119]],64028:[[38742]],64029:[[31934]],64030:[[32701]],64032:[[34322]],64034:[[35576]],64037:[[36920]],64038:[[37117]],64042:[[39151]],64043:[[39164]],64044:[[39208]],64045:[[40372]],64046:[[37086]],64047:[[38583]],64048:[[20398]],64049:[[20711]],64050:[[20813]],64051:[[21193]],64052:[[21220]],64053:[[21329]],64054:[[21917]],64055:[[22022]],64056:[[22120]],64057:[[22592]],64058:[[22696]],64059:[[23652]],64060:[[23662]],64061:[[24724]],64062:[[24936]],64063:[[24974]],64064:[[25074]],64065:[[25935]],64066:[[26082]],64067:[[26257]],64068:[[26757]],64069:[[28023]],64070:[[28186]],64071:[[28450]],64072:[[29038]],64073:[[29227]],64074:[[29730]],64075:[[30865]],64076:[[31038]],64077:[[31049]],64078:[[31048]],64079:[[31056]],64080:[[31062]],64081:[[31069]],64082:[[31117]],64083:[[31118]],64084:[[31296]],64085:[[31361]],64086:[[31680]],64087:[[32244]],64088:[[32265]],64089:[[32321]],64090:[[32626]],64091:[[32773]],64092:[[33261]],64093:[[33401]],64094:[[33401]],64095:[[33879]],64096:[[35088]],64097:[[35222]],64098:[[35585]],64099:[[35641]],64100:[[36051]],64101:[[36104]],64102:[[36790]],64103:[[36920]],64104:[[38627]],64105:[[38911]],64106:[[38971]],64107:[[24693]],64108:[[148206]],64109:[[33304]],64112:[[20006]],64113:[[20917]],64114:[[20840]],64115:[[20352]],64116:[[20805]],64117:[[20864]],64118:[[21191]],64119:[[21242]],64120:[[21917]],64121:[[21845]],64122:[[21913]],64123:[[21986]],64124:[[22618]],64125:[[22707]],64126:[[22852]],64127:[[22868]],64128:[[23138]],64129:[[23336]],64130:[[24274]],64131:[[24281]],64132:[[24425]],64133:[[24493]],64134:[[24792]],64135:[[24910]],64136:[[24840]],64137:[[24974]],64138:[[24928]],64139:[[25074]],64140:[[25140]],64141:[[25540]],64142:[[25628]],64143:[[25682]],64144:[[25942]],64145:[[26228]],64146:[[26391]],64147:[[26395]],64148:[[26454]],64149:[[27513]],64150:[[27578]],64151:[[27969]],64152:[[28379]],64153:[[28363]],64154:[[28450]],64155:[[28702]],64156:[[29038]],64157:[[30631]],64158:[[29237]],64159:[[29359]],64160:[[29482]],64161:[[29809]],64162:[[29958]],64163:[[30011]],64164:[[30237]],64165:[[30239]],64166:[[30410]],64167:[[30427]],64168:[[30452]],64169:[[30538]],64170:[[30528]],64171:[[30924]],64172:[[31409]],64173:[[31680]],64174:[[31867]],64175:[[32091]],64176:[[32244]],64177:[[32574]],64178:[[32773]],64179:[[33618]],64180:[[33775]],64181:[[34681]],64182:[[35137]],64183:[[35206]],64184:[[35222]],64185:[[35519]],64186:[[35576]],64187:[[35531]],64188:[[35585]],64189:[[35582]],64190:[[35565]],64191:[[35641]],64192:[[35722]],64193:[[36104]],64194:[[36664]],64195:[[36978]],64196:[[37273]],64197:[[37494]],64198:[[38524]],64199:[[38627]],64200:[[38742]],64201:[[38875]],64202:[[38911]],64203:[[38923]],64204:[[38971]],64205:[[39698]],64206:[[40860]],64207:[[141386]],64208:[[141380]],64209:[[144341]],64210:[[15261]],64211:[[16408]],64212:[[16441]],64213:[[152137]],64214:[[154832]],64215:[[163539]],64216:[[40771]],64217:[[40846]],195072:[[38953]],195073:[[169398]],195074:[[39138]],195075:[[19251]],195076:[[39209]],195077:[[39335]],195078:[[39362]],195079:[[39422]],195080:[[19406]],195081:[[170800]],195082:[[39698]],195083:[[40000]],195084:[[40189]],195085:[[19662]],195086:[[19693]],195087:[[40295]],195088:[[172238]],195089:[[19704]],195090:[[172293]],195091:[[172558]],195092:[[172689]],195093:[[40635]],195094:[[19798]],195095:[[40697]],195096:[[40702]],195097:[[40709]],195098:[[40719]],195099:[[40726]],195100:[[40763]],195101:[[173568]]},
64256:{64256:[[102,102],256],64257:[[102,105],256],64258:[[102,108],256],64259:[[102,102,105],256],64260:[[102,102,108],256],64261:[[383,116],256],64262:[[115,116],256],64275:[[1396,1398],256],64276:[[1396,1381],256],64277:[[1396,1387],256],64278:[[1406,1398],256],64279:[[1396,1389],256],64285:[[1497,1460],512],64286:[,26],64287:[[1522,1463],512],64288:[[1506],256],64289:[[1488],256],64290:[[1491],256],64291:[[1492],256],64292:[[1499],256],64293:[[1500],256],64294:[[1501],256],64295:[[1512],256],64296:[[1514],256],64297:[[43],256],64298:[[1513,1473],512],64299:[[1513,1474],512],64300:[[64329,1473],512],64301:[[64329,1474],512],64302:[[1488,1463],512],64303:[[1488,1464],512],64304:[[1488,1468],512],64305:[[1489,1468],512],64306:[[1490,1468],512],64307:[[1491,1468],512],64308:[[1492,1468],512],64309:[[1493,1468],512],64310:[[1494,1468],512],64312:[[1496,1468],512],64313:[[1497,1468],512],64314:[[1498,1468],512],64315:[[1499,1468],512],64316:[[1500,1468],512],64318:[[1502,1468],512],64320:[[1504,1468],512],64321:[[1505,1468],512],64323:[[1507,1468],512],64324:[[1508,1468],512],64326:[[1510,1468],512],64327:[[1511,1468],512],64328:[[1512,1468],512],64329:[[1513,1468],512],64330:[[1514,1468],512],64331:[[1493,1465],512],64332:[[1489,1471],512],64333:[[1499,1471],512],64334:[[1508,1471],512],64335:[[1488,1500],256],64336:[[1649],256],64337:[[1649],256],64338:[[1659],256],64339:[[1659],256],64340:[[1659],256],64341:[[1659],256],64342:[[1662],256],64343:[[1662],256],64344:[[1662],256],64345:[[1662],256],64346:[[1664],256],64347:[[1664],256],64348:[[1664],256],64349:[[1664],256],64350:[[1658],256],64351:[[1658],256],64352:[[1658],256],64353:[[1658],256],64354:[[1663],256],64355:[[1663],256],64356:[[1663],256],64357:[[1663],256],64358:[[1657],256],64359:[[1657],256],64360:[[1657],256],64361:[[1657],256],64362:[[1700],256],64363:[[1700],256],64364:[[1700],256],64365:[[1700],256],64366:[[1702],256],64367:[[1702],256],64368:[[1702],256],64369:[[1702],256],64370:[[1668],256],64371:[[1668],256],64372:[[1668],256],64373:[[1668],256],64374:[[1667],256],64375:[[1667],256],64376:[[1667],256],64377:[[1667],256],64378:[[1670],256],64379:[[1670],256],64380:[[1670],256],64381:[[1670],256],64382:[[1671],256],64383:[[1671],256],64384:[[1671],256],64385:[[1671],256],64386:[[1677],256],64387:[[1677],256],64388:[[1676],256],64389:[[1676],256],64390:[[1678],256],64391:[[1678],256],64392:[[1672],256],64393:[[1672],256],64394:[[1688],256],64395:[[1688],256],64396:[[1681],256],64397:[[1681],256],64398:[[1705],256],64399:[[1705],256],64400:[[1705],256],64401:[[1705],256],64402:[[1711],256],64403:[[1711],256],64404:[[1711],256],64405:[[1711],256],64406:[[1715],256],64407:[[1715],256],64408:[[1715],256],64409:[[1715],256],64410:[[1713],256],64411:[[1713],256],64412:[[1713],256],64413:[[1713],256],64414:[[1722],256],64415:[[1722],256],64416:[[1723],256],64417:[[1723],256],64418:[[1723],256],64419:[[1723],256],64420:[[1728],256],64421:[[1728],256],64422:[[1729],256],64423:[[1729],256],64424:[[1729],256],64425:[[1729],256],64426:[[1726],256],64427:[[1726],256],64428:[[1726],256],64429:[[1726],256],64430:[[1746],256],64431:[[1746],256],64432:[[1747],256],64433:[[1747],256],64467:[[1709],256],64468:[[1709],256],64469:[[1709],256],64470:[[1709],256],64471:[[1735],256],64472:[[1735],256],64473:[[1734],256],64474:[[1734],256],64475:[[1736],256],64476:[[1736],256],64477:[[1655],256],64478:[[1739],256],64479:[[1739],256],64480:[[1733],256],64481:[[1733],256],64482:[[1737],256],64483:[[1737],256],64484:[[1744],256],64485:[[1744],256],64486:[[1744],256],64487:[[1744],256],64488:[[1609],256],64489:[[1609],256],64490:[[1574,1575],256],64491:[[1574,1575],256],64492:[[1574,1749],256],64493:[[1574,1749],256],64494:[[1574,1608],256],64495:[[1574,1608],256],64496:[[1574,1735],256],64497:[[1574,1735],256],64498:[[1574,1734],256],64499:[[1574,1734],256],64500:[[1574,1736],256],64501:[[1574,1736],256],64502:[[1574,1744],256],64503:[[1574,1744],256],64504:[[1574,1744],256],64505:[[1574,1609],256],64506:[[1574,1609],256],64507:[[1574,1609],256],64508:[[1740],256],64509:[[1740],256],64510:[[1740],256],64511:[[1740],256]},
64512:{64512:[[1574,1580],256],64513:[[1574,1581],256],64514:[[1574,1605],256],64515:[[1574,1609],256],64516:[[1574,1610],256],64517:[[1576,1580],256],64518:[[1576,1581],256],64519:[[1576,1582],256],64520:[[1576,1605],256],64521:[[1576,1609],256],64522:[[1576,1610],256],64523:[[1578,1580],256],64524:[[1578,1581],256],64525:[[1578,1582],256],64526:[[1578,1605],256],64527:[[1578,1609],256],64528:[[1578,1610],256],64529:[[1579,1580],256],64530:[[1579,1605],256],64531:[[1579,1609],256],64532:[[1579,1610],256],64533:[[1580,1581],256],64534:[[1580,1605],256],64535:[[1581,1580],256],64536:[[1581,1605],256],64537:[[1582,1580],256],64538:[[1582,1581],256],64539:[[1582,1605],256],64540:[[1587,1580],256],64541:[[1587,1581],256],64542:[[1587,1582],256],64543:[[1587,1605],256],64544:[[1589,1581],256],64545:[[1589,1605],256],64546:[[1590,1580],256],64547:[[1590,1581],256],64548:[[1590,1582],256],64549:[[1590,1605],256],64550:[[1591,1581],256],64551:[[1591,1605],256],64552:[[1592,1605],256],64553:[[1593,1580],256],64554:[[1593,1605],256],64555:[[1594,1580],256],64556:[[1594,1605],256],64557:[[1601,1580],256],64558:[[1601,1581],256],64559:[[1601,1582],256],64560:[[1601,1605],256],64561:[[1601,1609],256],64562:[[1601,1610],256],64563:[[1602,1581],256],64564:[[1602,1605],256],64565:[[1602,1609],256],64566:[[1602,1610],256],64567:[[1603,1575],256],64568:[[1603,1580],256],64569:[[1603,1581],256],64570:[[1603,1582],256],64571:[[1603,1604],256],64572:[[1603,1605],256],64573:[[1603,1609],256],64574:[[1603,1610],256],64575:[[1604,1580],256],64576:[[1604,1581],256],64577:[[1604,1582],256],64578:[[1604,1605],256],64579:[[1604,1609],256],64580:[[1604,1610],256],64581:[[1605,1580],256],64582:[[1605,1581],256],64583:[[1605,1582],256],64584:[[1605,1605],256],64585:[[1605,1609],256],64586:[[1605,1610],256],64587:[[1606,1580],256],64588:[[1606,1581],256],64589:[[1606,1582],256],64590:[[1606,1605],256],64591:[[1606,1609],256],64592:[[1606,1610],256],64593:[[1607,1580],256],64594:[[1607,1605],256],64595:[[1607,1609],256],64596:[[1607,1610],256],64597:[[1610,1580],256],64598:[[1610,1581],256],64599:[[1610,1582],256],64600:[[1610,1605],256],64601:[[1610,1609],256],64602:[[1610,1610],256],64603:[[1584,1648],256],64604:[[1585,1648],256],64605:[[1609,1648],256],64606:[[32,1612,1617],256],64607:[[32,1613,1617],256],64608:[[32,1614,1617],256],64609:[[32,1615,1617],256],64610:[[32,1616,1617],256],64611:[[32,1617,1648],256],64612:[[1574,1585],256],64613:[[1574,1586],256],64614:[[1574,1605],256],64615:[[1574,1606],256],64616:[[1574,1609],256],64617:[[1574,1610],256],64618:[[1576,1585],256],64619:[[1576,1586],256],64620:[[1576,1605],256],64621:[[1576,1606],256],64622:[[1576,1609],256],64623:[[1576,1610],256],64624:[[1578,1585],256],64625:[[1578,1586],256],64626:[[1578,1605],256],64627:[[1578,1606],256],64628:[[1578,1609],256],64629:[[1578,1610],256],64630:[[1579,1585],256],64631:[[1579,1586],256],64632:[[1579,1605],256],64633:[[1579,1606],256],64634:[[1579,1609],256],64635:[[1579,1610],256],64636:[[1601,1609],256],64637:[[1601,1610],256],64638:[[1602,1609],256],64639:[[1602,1610],256],64640:[[1603,1575],256],64641:[[1603,1604],256],64642:[[1603,1605],256],64643:[[1603,1609],256],64644:[[1603,1610],256],64645:[[1604,1605],256],64646:[[1604,1609],256],64647:[[1604,1610],256],64648:[[1605,1575],256],64649:[[1605,1605],256],64650:[[1606,1585],256],64651:[[1606,1586],256],64652:[[1606,1605],256],64653:[[1606,1606],256],64654:[[1606,1609],256],64655:[[1606,1610],256],64656:[[1609,1648],256],64657:[[1610,1585],256],64658:[[1610,1586],256],64659:[[1610,1605],256],64660:[[1610,1606],256],64661:[[1610,1609],256],64662:[[1610,1610],256],64663:[[1574,1580],256],64664:[[1574,1581],256],64665:[[1574,1582],256],64666:[[1574,1605],256],64667:[[1574,1607],256],64668:[[1576,1580],256],64669:[[1576,1581],256],64670:[[1576,1582],256],64671:[[1576,1605],256],64672:[[1576,1607],256],64673:[[1578,1580],256],64674:[[1578,1581],256],64675:[[1578,1582],256],64676:[[1578,1605],256],64677:[[1578,1607],256],64678:[[1579,1605],256],64679:[[1580,1581],256],64680:[[1580,1605],256],64681:[[1581,1580],256],64682:[[1581,1605],256],64683:[[1582,1580],256],64684:[[1582,1605],256],64685:[[1587,1580],256],64686:[[1587,1581],256],64687:[[1587,1582],256],64688:[[1587,1605],256],64689:[[1589,1581],256],64690:[[1589,1582],256],64691:[[1589,1605],256],64692:[[1590,1580],256],64693:[[1590,1581],256],64694:[[1590,1582],256],64695:[[1590,1605],256],64696:[[1591,1581],256],64697:[[1592,1605],256],64698:[[1593,1580],256],64699:[[1593,1605],256],64700:[[1594,1580],256],64701:[[1594,1605],256],64702:[[1601,1580],256],64703:[[1601,1581],256],64704:[[1601,1582],256],64705:[[1601,1605],256],64706:[[1602,1581],256],64707:[[1602,1605],256],64708:[[1603,1580],256],64709:[[1603,1581],256],64710:[[1603,1582],256],64711:[[1603,1604],256],64712:[[1603,1605],256],64713:[[1604,1580],256],64714:[[1604,1581],256],64715:[[1604,1582],256],64716:[[1604,1605],256],64717:[[1604,1607],256],64718:[[1605,1580],256],64719:[[1605,1581],256],64720:[[1605,1582],256],64721:[[1605,1605],256],64722:[[1606,1580],256],64723:[[1606,1581],256],64724:[[1606,1582],256],64725:[[1606,1605],256],64726:[[1606,1607],256],64727:[[1607,1580],256],64728:[[1607,1605],256],64729:[[1607,1648],256],64730:[[1610,1580],256],64731:[[1610,1581],256],64732:[[1610,1582],256],64733:[[1610,1605],256],64734:[[1610,1607],256],64735:[[1574,1605],256],64736:[[1574,1607],256],64737:[[1576,1605],256],64738:[[1576,1607],256],64739:[[1578,1605],256],64740:[[1578,1607],256],64741:[[1579,1605],256],64742:[[1579,1607],256],64743:[[1587,1605],256],64744:[[1587,1607],256],64745:[[1588,1605],256],64746:[[1588,1607],256],64747:[[1603,1604],256],64748:[[1603,1605],256],64749:[[1604,1605],256],64750:[[1606,1605],256],64751:[[1606,1607],256],64752:[[1610,1605],256],64753:[[1610,1607],256],64754:[[1600,1614,1617],256],64755:[[1600,1615,1617],256],64756:[[1600,1616,1617],256],64757:[[1591,1609],256],64758:[[1591,1610],256],64759:[[1593,1609],256],64760:[[1593,1610],256],64761:[[1594,1609],256],64762:[[1594,1610],256],64763:[[1587,1609],256],64764:[[1587,1610],256],64765:[[1588,1609],256],64766:[[1588,1610],256],64767:[[1581,1609],256]},
64768:{64768:[[1581,1610],256],64769:[[1580,1609],256],64770:[[1580,1610],256],64771:[[1582,1609],256],64772:[[1582,1610],256],64773:[[1589,1609],256],64774:[[1589,1610],256],64775:[[1590,1609],256],64776:[[1590,1610],256],64777:[[1588,1580],256],64778:[[1588,1581],256],64779:[[1588,1582],256],64780:[[1588,1605],256],64781:[[1588,1585],256],64782:[[1587,1585],256],64783:[[1589,1585],256],64784:[[1590,1585],256],64785:[[1591,1609],256],64786:[[1591,1610],256],64787:[[1593,1609],256],64788:[[1593,1610],256],64789:[[1594,1609],256],64790:[[1594,1610],256],64791:[[1587,1609],256],64792:[[1587,1610],256],64793:[[1588,1609],256],64794:[[1588,1610],256],64795:[[1581,1609],256],64796:[[1581,1610],256],64797:[[1580,1609],256],64798:[[1580,1610],256],64799:[[1582,1609],256],64800:[[1582,1610],256],64801:[[1589,1609],256],64802:[[1589,1610],256],64803:[[1590,1609],256],64804:[[1590,1610],256],64805:[[1588,1580],256],64806:[[1588,1581],256],64807:[[1588,1582],256],64808:[[1588,1605],256],64809:[[1588,1585],256],64810:[[1587,1585],256],64811:[[1589,1585],256],64812:[[1590,1585],256],64813:[[1588,1580],256],64814:[[1588,1581],256],64815:[[1588,1582],256],64816:[[1588,1605],256],64817:[[1587,1607],256],64818:[[1588,1607],256],64819:[[1591,1605],256],64820:[[1587,1580],256],64821:[[1587,1581],256],64822:[[1587,1582],256],64823:[[1588,1580],256],64824:[[1588,1581],256],64825:[[1588,1582],256],64826:[[1591,1605],256],64827:[[1592,1605],256],64828:[[1575,1611],256],64829:[[1575,1611],256],64848:[[1578,1580,1605],256],64849:[[1578,1581,1580],256],64850:[[1578,1581,1580],256],64851:[[1578,1581,1605],256],64852:[[1578,1582,1605],256],64853:[[1578,1605,1580],256],64854:[[1578,1605,1581],256],64855:[[1578,1605,1582],256],64856:[[1580,1605,1581],256],64857:[[1580,1605,1581],256],64858:[[1581,1605,1610],256],64859:[[1581,1605,1609],256],64860:[[1587,1581,1580],256],64861:[[1587,1580,1581],256],64862:[[1587,1580,1609],256],64863:[[1587,1605,1581],256],64864:[[1587,1605,1581],256],64865:[[1587,1605,1580],256],64866:[[1587,1605,1605],256],64867:[[1587,1605,1605],256],64868:[[1589,1581,1581],256],64869:[[1589,1581,1581],256],64870:[[1589,1605,1605],256],64871:[[1588,1581,1605],256],64872:[[1588,1581,1605],256],64873:[[1588,1580,1610],256],64874:[[1588,1605,1582],256],64875:[[1588,1605,1582],256],64876:[[1588,1605,1605],256],64877:[[1588,1605,1605],256],64878:[[1590,1581,1609],256],64879:[[1590,1582,1605],256],64880:[[1590,1582,1605],256],64881:[[1591,1605,1581],256],64882:[[1591,1605,1581],256],64883:[[1591,1605,1605],256],64884:[[1591,1605,1610],256],64885:[[1593,1580,1605],256],64886:[[1593,1605,1605],256],64887:[[1593,1605,1605],256],64888:[[1593,1605,1609],256],64889:[[1594,1605,1605],256],64890:[[1594,1605,1610],256],64891:[[1594,1605,1609],256],64892:[[1601,1582,1605],256],64893:[[1601,1582,1605],256],64894:[[1602,1605,1581],256],64895:[[1602,1605,1605],256],64896:[[1604,1581,1605],256],64897:[[1604,1581,1610],256],64898:[[1604,1581,1609],256],64899:[[1604,1580,1580],256],64900:[[1604,1580,1580],256],64901:[[1604,1582,1605],256],64902:[[1604,1582,1605],256],64903:[[1604,1605,1581],256],64904:[[1604,1605,1581],256],64905:[[1605,1581,1580],256],64906:[[1605,1581,1605],256],64907:[[1605,1581,1610],256],64908:[[1605,1580,1581],256],64909:[[1605,1580,1605],256],64910:[[1605,1582,1580],256],64911:[[1605,1582,1605],256],64914:[[1605,1580,1582],256],64915:[[1607,1605,1580],256],64916:[[1607,1605,1605],256],64917:[[1606,1581,1605],256],64918:[[1606,1581,1609],256],64919:[[1606,1580,1605],256],64920:[[1606,1580,1605],256],64921:[[1606,1580,1609],256],64922:[[1606,1605,1610],256],64923:[[1606,1605,1609],256],64924:[[1610,1605,1605],256],64925:[[1610,1605,1605],256],64926:[[1576,1582,1610],256],64927:[[1578,1580,1610],256],64928:[[1578,1580,1609],256],64929:[[1578,1582,1610],256],64930:[[1578,1582,1609],256],64931:[[1578,1605,1610],256],64932:[[1578,1605,1609],256],64933:[[1580,1605,1610],256],64934:[[1580,1581,1609],256],64935:[[1580,1605,1609],256],64936:[[1587,1582,1609],256],64937:[[1589,1581,1610],256],64938:[[1588,1581,1610],256],64939:[[1590,1581,1610],256],64940:[[1604,1580,1610],256],64941:[[1604,1605,1610],256],64942:[[1610,1581,1610],256],64943:[[1610,1580,1610],256],64944:[[1610,1605,1610],256],64945:[[1605,1605,1610],256],64946:[[1602,1605,1610],256],64947:[[1606,1581,1610],256],64948:[[1602,1605,1581],256],64949:[[1604,1581,1605],256],64950:[[1593,1605,1610],256],64951:[[1603,1605,1610],256],64952:[[1606,1580,1581],256],64953:[[1605,1582,1610],256],64954:[[1604,1580,1605],256],64955:[[1603,1605,1605],256],64956:[[1604,1580,1605],256],64957:[[1606,1580,1581],256],64958:[[1580,1581,1610],256],64959:[[1581,1580,1610],256],64960:[[1605,1580,1610],256],64961:[[1601,1605,1610],256],64962:[[1576,1581,1610],256],64963:[[1603,1605,1605],256],64964:[[1593,1580,1605],256],64965:[[1589,1605,1605],256],64966:[[1587,1582,1610],256],64967:[[1606,1580,1610],256],65008:[[1589,1604,1746],256],65009:[[1602,1604,1746],256],65010:[[1575,1604,1604,1607],256],65011:[[1575,1603,1576,1585],256],65012:[[1605,1581,1605,1583],256],65013:[[1589,1604,1593,1605],256],65014:[[1585,1587,1608,1604],256],65015:[[1593,1604,1610,1607],256],65016:[[1608,1587,1604,1605],256],65017:[[1589,1604,1609],256],65018:[[1589,1604,1609,32,1575,1604,1604,1607,32,1593,1604,1610,1607,32,1608,1587,1604,1605],256],65019:[[1580,1604,32,1580,1604,1575,1604,1607],256],65020:[[1585,1740,1575,1604],256]},
65024:{65040:[[44],256],65041:[[12289],256],65042:[[12290],256],65043:[[58],256],65044:[[59],256],65045:[[33],256],65046:[[63],256],65047:[[12310],256],65048:[[12311],256],65049:[[8230],256],65056:[,230],65057:[,230],65058:[,230],65059:[,230],65060:[,230],65061:[,230],65062:[,230],65072:[[8229],256],65073:[[8212],256],65074:[[8211],256],65075:[[95],256],65076:[[95],256],65077:[[40],256],65078:[[41],256],65079:[[123],256],65080:[[125],256],65081:[[12308],256],65082:[[12309],256],65083:[[12304],256],65084:[[12305],256],65085:[[12298],256],65086:[[12299],256],65087:[[12296],256],65088:[[12297],256],65089:[[12300],256],65090:[[12301],256],65091:[[12302],256],65092:[[12303],256],65095:[[91],256],65096:[[93],256],65097:[[8254],256],65098:[[8254],256],65099:[[8254],256],65100:[[8254],256],65101:[[95],256],65102:[[95],256],65103:[[95],256],65104:[[44],256],65105:[[12289],256],65106:[[46],256],65108:[[59],256],65109:[[58],256],65110:[[63],256],65111:[[33],256],65112:[[8212],256],65113:[[40],256],65114:[[41],256],65115:[[123],256],65116:[[125],256],65117:[[12308],256],65118:[[12309],256],65119:[[35],256],65120:[[38],256],65121:[[42],256],65122:[[43],256],65123:[[45],256],65124:[[60],256],65125:[[62],256],65126:[[61],256],65128:[[92],256],65129:[[36],256],65130:[[37],256],65131:[[64],256],65136:[[32,1611],256],65137:[[1600,1611],256],65138:[[32,1612],256],65140:[[32,1613],256],65142:[[32,1614],256],65143:[[1600,1614],256],65144:[[32,1615],256],65145:[[1600,1615],256],65146:[[32,1616],256],65147:[[1600,1616],256],65148:[[32,1617],256],65149:[[1600,1617],256],65150:[[32,1618],256],65151:[[1600,1618],256],65152:[[1569],256],65153:[[1570],256],65154:[[1570],256],65155:[[1571],256],65156:[[1571],256],65157:[[1572],256],65158:[[1572],256],65159:[[1573],256],65160:[[1573],256],65161:[[1574],256],65162:[[1574],256],65163:[[1574],256],65164:[[1574],256],65165:[[1575],256],65166:[[1575],256],65167:[[1576],256],65168:[[1576],256],65169:[[1576],256],65170:[[1576],256],65171:[[1577],256],65172:[[1577],256],65173:[[1578],256],65174:[[1578],256],65175:[[1578],256],65176:[[1578],256],65177:[[1579],256],65178:[[1579],256],65179:[[1579],256],65180:[[1579],256],65181:[[1580],256],65182:[[1580],256],65183:[[1580],256],65184:[[1580],256],65185:[[1581],256],65186:[[1581],256],65187:[[1581],256],65188:[[1581],256],65189:[[1582],256],65190:[[1582],256],65191:[[1582],256],65192:[[1582],256],65193:[[1583],256],65194:[[1583],256],65195:[[1584],256],65196:[[1584],256],65197:[[1585],256],65198:[[1585],256],65199:[[1586],256],65200:[[1586],256],65201:[[1587],256],65202:[[1587],256],65203:[[1587],256],65204:[[1587],256],65205:[[1588],256],65206:[[1588],256],65207:[[1588],256],65208:[[1588],256],65209:[[1589],256],65210:[[1589],256],65211:[[1589],256],65212:[[1589],256],65213:[[1590],256],65214:[[1590],256],65215:[[1590],256],65216:[[1590],256],65217:[[1591],256],65218:[[1591],256],65219:[[1591],256],65220:[[1591],256],65221:[[1592],256],65222:[[1592],256],65223:[[1592],256],65224:[[1592],256],65225:[[1593],256],65226:[[1593],256],65227:[[1593],256],65228:[[1593],256],65229:[[1594],256],65230:[[1594],256],65231:[[1594],256],65232:[[1594],256],65233:[[1601],256],65234:[[1601],256],65235:[[1601],256],65236:[[1601],256],65237:[[1602],256],65238:[[1602],256],65239:[[1602],256],65240:[[1602],256],65241:[[1603],256],65242:[[1603],256],65243:[[1603],256],65244:[[1603],256],65245:[[1604],256],65246:[[1604],256],65247:[[1604],256],65248:[[1604],256],65249:[[1605],256],65250:[[1605],256],65251:[[1605],256],65252:[[1605],256],65253:[[1606],256],65254:[[1606],256],65255:[[1606],256],65256:[[1606],256],65257:[[1607],256],65258:[[1607],256],65259:[[1607],256],65260:[[1607],256],65261:[[1608],256],65262:[[1608],256],65263:[[1609],256],65264:[[1609],256],65265:[[1610],256],65266:[[1610],256],65267:[[1610],256],65268:[[1610],256],65269:[[1604,1570],256],65270:[[1604,1570],256],65271:[[1604,1571],256],65272:[[1604,1571],256],65273:[[1604,1573],256],65274:[[1604,1573],256],65275:[[1604,1575],256],65276:[[1604,1575],256]},
65280:{65281:[[33],256],65282:[[34],256],65283:[[35],256],65284:[[36],256],65285:[[37],256],65286:[[38],256],65287:[[39],256],65288:[[40],256],65289:[[41],256],65290:[[42],256],65291:[[43],256],65292:[[44],256],65293:[[45],256],65294:[[46],256],65295:[[47],256],65296:[[48],256],65297:[[49],256],65298:[[50],256],65299:[[51],256],65300:[[52],256],65301:[[53],256],65302:[[54],256],65303:[[55],256],65304:[[56],256],65305:[[57],256],65306:[[58],256],65307:[[59],256],65308:[[60],256],65309:[[61],256],65310:[[62],256],65311:[[63],256],65312:[[64],256],65313:[[65],256],65314:[[66],256],65315:[[67],256],65316:[[68],256],65317:[[69],256],65318:[[70],256],65319:[[71],256],65320:[[72],256],65321:[[73],256],65322:[[74],256],65323:[[75],256],65324:[[76],256],65325:[[77],256],65326:[[78],256],65327:[[79],256],65328:[[80],256],65329:[[81],256],65330:[[82],256],65331:[[83],256],65332:[[84],256],65333:[[85],256],65334:[[86],256],65335:[[87],256],65336:[[88],256],65337:[[89],256],65338:[[90],256],65339:[[91],256],65340:[[92],256],65341:[[93],256],65342:[[94],256],65343:[[95],256],65344:[[96],256],65345:[[97],256],65346:[[98],256],65347:[[99],256],65348:[[100],256],65349:[[101],256],65350:[[102],256],65351:[[103],256],65352:[[104],256],65353:[[105],256],65354:[[106],256],65355:[[107],256],65356:[[108],256],65357:[[109],256],65358:[[110],256],65359:[[111],256],65360:[[112],256],65361:[[113],256],65362:[[114],256],65363:[[115],256],65364:[[116],256],65365:[[117],256],65366:[[118],256],65367:[[119],256],65368:[[120],256],65369:[[121],256],65370:[[122],256],65371:[[123],256],65372:[[124],256],65373:[[125],256],65374:[[126],256],65375:[[10629],256],65376:[[10630],256],65377:[[12290],256],65378:[[12300],256],65379:[[12301],256],65380:[[12289],256],65381:[[12539],256],65382:[[12530],256],65383:[[12449],256],65384:[[12451],256],65385:[[12453],256],65386:[[12455],256],65387:[[12457],256],65388:[[12515],256],65389:[[12517],256],65390:[[12519],256],65391:[[12483],256],65392:[[12540],256],65393:[[12450],256],65394:[[12452],256],65395:[[12454],256],65396:[[12456],256],65397:[[12458],256],65398:[[12459],256],65399:[[12461],256],65400:[[12463],256],65401:[[12465],256],65402:[[12467],256],65403:[[12469],256],65404:[[12471],256],65405:[[12473],256],65406:[[12475],256],65407:[[12477],256],65408:[[12479],256],65409:[[12481],256],65410:[[12484],256],65411:[[12486],256],65412:[[12488],256],65413:[[12490],256],65414:[[12491],256],65415:[[12492],256],65416:[[12493],256],65417:[[12494],256],65418:[[12495],256],65419:[[12498],256],65420:[[12501],256],65421:[[12504],256],65422:[[12507],256],65423:[[12510],256],65424:[[12511],256],65425:[[12512],256],65426:[[12513],256],65427:[[12514],256],65428:[[12516],256],65429:[[12518],256],65430:[[12520],256],65431:[[12521],256],65432:[[12522],256],65433:[[12523],256],65434:[[12524],256],65435:[[12525],256],65436:[[12527],256],65437:[[12531],256],65438:[[12441],256],65439:[[12442],256],65440:[[12644],256],65441:[[12593],256],65442:[[12594],256],65443:[[12595],256],65444:[[12596],256],65445:[[12597],256],65446:[[12598],256],65447:[[12599],256],65448:[[12600],256],65449:[[12601],256],65450:[[12602],256],65451:[[12603],256],65452:[[12604],256],65453:[[12605],256],65454:[[12606],256],65455:[[12607],256],65456:[[12608],256],65457:[[12609],256],65458:[[12610],256],65459:[[12611],256],65460:[[12612],256],65461:[[12613],256],65462:[[12614],256],65463:[[12615],256],65464:[[12616],256],65465:[[12617],256],65466:[[12618],256],65467:[[12619],256],65468:[[12620],256],65469:[[12621],256],65470:[[12622],256],65474:[[12623],256],65475:[[12624],256],65476:[[12625],256],65477:[[12626],256],65478:[[12627],256],65479:[[12628],256],65482:[[12629],256],65483:[[12630],256],65484:[[12631],256],65485:[[12632],256],65486:[[12633],256],65487:[[12634],256],65490:[[12635],256],65491:[[12636],256],65492:[[12637],256],65493:[[12638],256],65494:[[12639],256],65495:[[12640],256],65498:[[12641],256],65499:[[12642],256],65500:[[12643],256],65504:[[162],256],65505:[[163],256],65506:[[172],256],65507:[[175],256],65508:[[166],256],65509:[[165],256],65510:[[8361],256],65512:[[9474],256],65513:[[8592],256],65514:[[8593],256],65515:[[8594],256],65516:[[8595],256],65517:[[9632],256],65518:[[9675],256]}

};

   /***** Module to export */
   var unorm = {
      nfc: nfc,
      nfd: nfd,
      nfkc: nfkc,
      nfkd: nfkd,
   };

   /*globals module:true,define:true*/

   // CommonJS
   if (typeof module === "object") {
      module.exports = unorm;

   // AMD
   } else if (typeof define === "function" && define.amd) {
      define("unorm", function () {
         return unorm;
      });

   // Global
   } else {
      root.unorm = unorm;
   }

   /***** Export as shim for String::normalize method *****/
   /*
      http://wiki.ecmascript.org/doku.php?id=harmony:specification_drafts#november_8_2013_draft_rev_21

      21.1.3.12 String.prototype.normalize(form="NFC")
      When the normalize method is called with one argument form, the following steps are taken:

      1. Let O be CheckObjectCoercible(this value).
      2. Let S be ToString(O).
      3. ReturnIfAbrupt(S).
      4. If form is not provided or undefined let form be "NFC".
      5. Let f be ToString(form).
      6. ReturnIfAbrupt(f).
      7. If f is not one of "NFC", "NFD", "NFKC", or "NFKD", then throw a RangeError Exception.
      8. Let ns be the String value is the result of normalizing S into the normalization form named by f as specified in Unicode Standard Annex #15, UnicodeNormalizatoin Forms.
      9. Return ns.

      The length property of the normalize method is 0.

      *NOTE* The normalize function is intentionally generic; it does not require that its this value be a String object. Therefore it can be transferred to other kinds of objects for use as a method.
   */
   if (!String.prototype.normalize) {
      String.prototype.normalize = function(form) {
         var str = "" + this;
         form =  form === undefined ? "NFC" : form;

         if (form === "NFC") {
            return unorm.nfc(str);
         } else if (form === "NFD") {
            return unorm.nfd(str);
         } else if (form === "NFKC") {
            return unorm.nfkc(str);
         } else if (form === "NFKD") {
            return unorm.nfkd(str);
         } else {
            throw new RangeError("Invalid normalization form: " + form);
         }
      };
   }
}(this));

},{}]},{},[4])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2RlYW4vb3NjLXdvcmtzcGFjZXMvd3MtYndhbGxldC13ZWIvYndhbGxldC5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL2xpYi9hcHBsZXQuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbGliL2RlcGxveUphdmEuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbGliL2h0dHAuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbGliL2luZGV4LmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL2xpYi9pbnN0YWxsZXJzLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL2xpYi9wbHVnaW4uanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbGliL3Nlc3Npb24uanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbGliL3RyYW5zcG9ydC9hcHBsZXQuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbGliL3RyYW5zcG9ydC9odHRwLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL2xpYi90cmFuc3BvcnQvcGx1Z2luLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9ib3dzZXIvYm93c2VyLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9icm93c2VyLXJlcXVlc3QvaW5kZXguanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Fzc2VydC9hc3NlcnQuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIi9ob21lL2RlYW4vb3NjLXdvcmtzcGFjZXMvd3MtYndhbGxldC13ZWIvYndhbGxldC5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9iYXNlNjQtanMvbGliL2I2NC5qcyIsIi9ob21lL2RlYW4vb3NjLXdvcmtzcGFjZXMvd3MtYndhbGxldC13ZWIvYndhbGxldC5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvYnVmZmVyL25vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9jb25zb2xlLWJyb3dzZXJpZnkvaW5kZXguanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2NyeXB0by1icm93c2VyaWZ5L2hlbHBlcnMuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2NyeXB0by1icm93c2VyaWZ5L2luZGV4LmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9jcnlwdG8tYnJvd3NlcmlmeS9tZDUuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2NyeXB0by1icm93c2VyaWZ5L3JuZy5qcyIsIi9ob21lL2RlYW4vb3NjLXdvcmtzcGFjZXMvd3MtYndhbGxldC13ZWIvYndhbGxldC5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvY3J5cHRvLWJyb3dzZXJpZnkvc2hhLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9jcnlwdG8tYnJvd3NlcmlmeS9zaGEyNTYuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luaGVyaXRzL2luaGVyaXRzX2Jyb3dzZXIuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3N1cHBvcnQvaXNCdWZmZXJCcm93c2VyLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy91dGlsL3V0aWwuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi9ob21lL2RlYW4vb3NjLXdvcmtzcGFjZXMvd3MtYndhbGxldC13ZWIvYndhbGxldC5qcy9ub2RlX21vZHVsZXMvcHJvbWlzZS9jb3JlLmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9wcm9taXNlL2luZGV4LmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy9wcm9taXNlL25vZGVfbW9kdWxlcy9hc2FwL2FzYXAuanMiLCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL3RyYXZlcnNlL2luZGV4LmpzIiwiL2hvbWUvZGVhbi9vc2Mtd29ya3NwYWNlcy93cy1id2FsbGV0LXdlYi9id2FsbGV0LmpzL25vZGVfbW9kdWxlcy91bm9ybS9saWIvdW5vcm0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3eUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqYUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNybENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY29uc29sZSA9IHJlcXVpcmUoJ2NvbnNvbGUnKSxcbiAgICBleHRlbmQgPSByZXF1aXJlKCdleHRlbmQnKSxcbiAgICBQcm9taXNlID0gcmVxdWlyZSgncHJvbWlzZScpLFxuICAgIGJvd3NlciA9IHJlcXVpcmUoJ2Jvd3NlcicpLFxuICAgIGRlcGxveUphdmEgPSByZXF1aXJlKCcuL2RlcGxveUphdmEnKTtcblxuLy8gVHJ5IHRvIGxvYWQgYSBhcHBsZXQgd2l0aCBnaXZlbiBvcHRpb25zLCByZXR1cm5zIHByb21pc2UuIEluIGNhc2Ugb2Zcbi8vIHJlamVjdGlvbiwgZXJyIGNvbnRhaW5zIGBpbnN0YWxsZWRgIHByb3BlcnR5LlxubW9kdWxlLmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIG8gPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgICAvLyBuYW1lIG9mIHRoZSBjYWxsYmFjayBpbiB0aGUgZ2xvYmFsIG5hbWVzcGFjZVxuICAgICAgICBmbmFtZTogJ19fYndhbGxldEFwcGxldExvYWRlZCcsXG4gICAgICAgIC8vIGlkIG9mIHRoZSBhcHBsZXQgZWxlbWVudFxuICAgICAgICBpZDogJ19fYndhbGxldC1hcHBsZXQnLFxuICAgICAgICAvLyB0aW1lIHRvIHdhaXQgdW50aWwgdGltZW91dCwgaW4gbXNlY1xuICAgICAgICB0aW1lb3V0OiA1MDBcbiAgICB9KTtcblxuICAgIC8vIGlmIHdlIGtub3cgZm9yIHN1cmUgdGhhdCB0aGUgYXBwbGV0IGlzIGluc3RhbGxlZCwgdGltZW91dCBhZnRlclxuICAgIC8vIDEwIHNlY29uZHNcbiAgICB2YXIgaW5zdGFsbGVkID0gaXNJbnN0YWxsZWQoKSxcbiAgICAgICAgdGltZW91dCA9IGluc3RhbGxlZCA/IDEwMDAwIDogby50aW1lb3V0O1xuXG4gICAgLy8gaWYgdGhlIGFwcGxldCBpcyBhbHJlYWR5IGxvYWRlZCwgdXNlIGl0XG4gICAgdmFyIGFwcGxldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG8uaWQpO1xuICAgIGlmIChhcHBsZXQpXG4gICAgICAgIHJldHVybiBQcm9taXNlLmZyb20oYXBwbGV0KTtcblxuICAgIC8vIGluamVjdCBvciByZWplY3QgYWZ0ZXIgdGltZW91dFxuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW1xuICAgICAgICBpbmplY3RBcHBsZXQoby5pZCwgby5mbmFtZSksXG4gICAgICAgIHJlamVjdEFmdGVyKHRpbWVvdXQsIG5ldyBFcnJvcignTG9hZGluZyB0aW1lZCBvdXQnKSlcbiAgICBdKS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGVyci5pbnN0YWxsZWQgPSBpbnN0YWxsZWQ7XG4gICAgICAgIHRocm93IGVycjtcbiAgICB9KS50aGVuKFxuICAgICAgICBmdW5jdGlvbiAoYXBwbGV0KSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW2J3YWxsZXRdIExvYWRlZCBhcHBsZXQgJyArIGFwcGxldC52ZXJzaW9uKTtcbiAgICAgICAgICAgIHJldHVybiBhcHBsZXQ7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tid2FsbGV0XSBGYWlsZWQgdG8gbG9hZCBhcHBsZXQ6ICcgKyBlcnIubWVzc2FnZSk7XG4gICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgIH1cbiAgICApO1xufTtcblxuLy8gSW5qZWN0cyB0aGUgYXBwbGV0IG9iamVjdCBpbnRvIHRoZSBwYWdlIGFuZCB3YWl0cyB1bnRpbCBpdCBsb2Fkcy5cbmZ1bmN0aW9uIGluamVjdEFwcGxldChpZCwgZm5hbWUpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB2YXIgYm9keSA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0sXG4gICAgICAgICAgICBlbGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbiAgICAgICAgLy8gcmVnaXN0ZXIgbG9hZCBmdW5jdGlvblxuICAgICAgICB3aW5kb3dbZm5hbWVdID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIGFwcGxldCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgICAgIGlmIChhcHBsZXQpXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShhcHBsZXQpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoJ0FwcGxldCBub3QgZm91bmQnKSk7XG4gICAgICAgIH1cbiAgICAgICAgO1xuICAgICAgICAvLyBpbmplY3Qgb2JqZWN0IGVsZW1cbiAgICAgICAgYm9keS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgICAgICAgdmFyIGh0bWwgPSBcIlwiO1xuICAgICAgICBpZiAoYm93c2VyLmJyb3dzZXIubXNpZSAmJiBib3dzZXIudmVyc2lvbiA+PSAxMSkge1xuICAgICAgICBcdGh0bWwgPSBcbiAgICAgICAgXHQnPGVtYmVkIGlkPVwiJytpZCsnXCIgJytcbiAgICAgICAgXHRcdCdhcmNoaXZlPVwiYndhbGxldC1hcHBsZXQtMC4wLjEuamFyLGhpZDRqYXZhLTAuMS4wLmphcixqbmEtNC4xLjAuamFyLGphY2tzb24tYW5ub3RhdGlvbnMtMi4zLjAuamFyLGphY2tzb24tY29yZS0yLjMuMS5qYXIsamFja3Nvbi1kYXRhYmluZC0yLjMuMS5qYXIscHJvdG9idWYtamF2YS0yLjUuMC5qYXIscHJvdG9idWYtamF2YS1mb3JtYXQtMS40LVNOQVBTSE9ULmphcixjb21tb25zLWNvZGVjLTEuNC5qYXIsY29tbW9ucy1pby0xLjQuamFyXCIgJytcblx0XHRcdFx0J2NvZGU9XCJjb20vYmR4L2J3YWxsZXQvYXBwbGV0L0JXYWxsZXRBcHBsZXQuY2xhc3NcIiAnK1xuXHRcdFx0XHQnY29kZWJhc2U9XCJqYXJzXCIgJytcblx0XHRcdFx0J3dpZHRoPVwiMVwiIGhlaWdodD1cIjFcIiAnK1xuXHRcdFx0XHQndHlwZT1cImFwcGxpY2F0aW9uL3gtamF2YS1hcHBsZXQ7dmVyc2lvbj0xLjZcIiAnK1xuXHRcdFx0XHQnb25sb2FkPVwiJytmbmFtZSsnXCIgJytcblx0XHRcdFx0J3BsdWdpbnNwYWdlPVwiaHR0cDovL2phdmEuc3VuLmNvbS9qMnNlLzEuNi4wL2Rvd25sb2FkLmh0bWxcIiA+Jytcblx0XHRcdCc8L2VtYmVkPic7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgIFx0aHRtbCA9IFxuICAgICAgICBcdCc8b2JqZWN0IGlkPVwiJytpZCsnXCIgY2xhc3NpZD1cImphdmE6Y29tL2JkeC9id2FsbGV0L2FwcGxldC9CV2FsbGV0QXBwbGV0LmNsYXNzXCInK1xuXHRcdFx0XHRcdCd0eXBlPVwiYXBwbGljYXRpb24veC1qYXZhLWFwcGxldFwiJytcblx0XHRcdFx0XHQnaGVpZ2h0PVwiMVwiIHdpZHRoPVwiMVwiID4nK1xuXHRcdFx0ICAgICc8cGFyYW0gbmFtZT1cImNvZGVcIiB2YWx1ZT1cImNvbS5iZHguYndhbGxldC5hcHBsZXQuQldhbGxldEFwcGxldFwiIC8+Jytcblx0XHRcdCAgICAnPHBhcmFtIG5hbWU9XCJhcmNoaXZlXCIgdmFsdWU9XCJid2FsbGV0LWFwcGxldC0wLjAuMS5qYXIsaGlkNGphdmEtMC4xLjAuamFyLGpuYS00LjEuMC5qYXIsamFja3Nvbi1hbm5vdGF0aW9ucy0yLjMuMC5qYXIsamFja3Nvbi1jb3JlLTIuMy4xLmphcixqYWNrc29uLWRhdGFiaW5kLTIuMy4xLmphcixwcm90b2J1Zi1qYXZhLTIuNS4wLmphcixwcm90b2J1Zi1qYXZhLWZvcm1hdC0xLjQtU05BUFNIT1QuamFyLGNvbW1vbnMtY29kZWMtMS40Lmphcixjb21tb25zLWlvLTEuNC5qYXJcIiAvPicrXG5cdFx0XHQgICAgJzxwYXJhbSBuYW1lPVwiY29kZWJhc2VcIiB2YWx1ZT1cImRhdGEvamFyc1wiIC8+Jytcblx0XHRcdCAgICAnPHBhcmFtIG5hbWU9XCJwZXJzaXN0U3RhdGVcIiB2YWx1ZT1cImZhbHNlXCIgLz4nK1xuXHRcdFx0ICAgICc8cGFyYW0gbmFtZT1cIm9ubG9hZFwiIHZhbHVlPVwiJytmbmFtZSsnXCIgLz4nK1xuXHRcdFx0Jzwvb2JqZWN0Pic7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbS5pbm5lckhUTUwgPSBodG1sO1xuICAgIH0pO1xufVxuXG4vLyBJZiBnaXZlbiB0aW1lb3V0LCBnZXRzIHJlamVjdGVkIGFmdGVyIG4gbXNlYywgb3RoZXJ3aXNlIG5ldmVyIHJlc29sdmVzLlxuZnVuY3Rpb24gcmVqZWN0QWZ0ZXIobXNlYywgdmFsKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKG1zZWMgPiAwKVxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7IHJlamVjdCh2YWwpOyB9LCBtc2VjKTtcbiAgICB9KTtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIGFwcGxldCB3aXRoIGEgZ2l2ZW4gbWltZXR5cGUgaXMgaW5zdGFsbGVkLlxuZnVuY3Rpb24gaXNJbnN0YWxsZWQoKSB7XG4gICAgcmV0dXJuIGRlcGxveUphdmEudmVyc2lvbkNoZWNrKFwiMS42K1wiKTtcbn1cbiIsInZhciBkZXBsb3lKYXZhID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbCA9IHtcclxuICAgICAgICBjb3JlOiBbXCJpZFwiLCBcImNsYXNzXCIsIFwidGl0bGVcIiwgXCJzdHlsZVwiXSxcclxuICAgICAgICBpMThuOiBbXCJsYW5nXCIsIFwiZGlyXCJdLFxyXG4gICAgICAgIGV2ZW50czogW1wib25jbGlja1wiLCBcIm9uZGJsY2xpY2tcIiwgXCJvbm1vdXNlZG93blwiLCBcIm9ubW91c2V1cFwiLCBcIm9ubW91c2VvdmVyXCIsIFwib25tb3VzZW1vdmVcIiwgXCJvbm1vdXNlb3V0XCIsIFwib25rZXlwcmVzc1wiLCBcIm9ua2V5ZG93blwiLCBcIm9ua2V5dXBcIl0sXHJcbiAgICAgICAgYXBwbGV0OiBbXCJjb2RlYmFzZVwiLCBcImNvZGVcIiwgXCJuYW1lXCIsIFwiYXJjaGl2ZVwiLCBcIm9iamVjdFwiLCBcIndpZHRoXCIsIFwiaGVpZ2h0XCIsIFwiYWx0XCIsIFwiYWxpZ25cIiwgXCJoc3BhY2VcIiwgXCJ2c3BhY2VcIl0sXHJcbiAgICAgICAgb2JqZWN0OiBbXCJjbGFzc2lkXCIsIFwiY29kZWJhc2VcIiwgXCJjb2RldHlwZVwiLCBcImRhdGFcIiwgXCJ0eXBlXCIsIFwiYXJjaGl2ZVwiLCBcImRlY2xhcmVcIiwgXCJzdGFuZGJ5XCIsIFwiaGVpZ2h0XCIsIFwid2lkdGhcIiwgXCJ1c2VtYXBcIiwgXCJuYW1lXCIsIFwidGFiaW5kZXhcIiwgXCJhbGlnblwiLCBcImJvcmRlclwiLCBcImhzcGFjZVwiLCBcInZzcGFjZVwiXVxyXG4gICAgfTtcclxuICAgIHZhciBiID0gbC5vYmplY3QuY29uY2F0KGwuY29yZSwgbC5pMThuLCBsLmV2ZW50cyk7XHJcbiAgICB2YXIgbSA9IGwuYXBwbGV0LmNvbmNhdChsLmNvcmUpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGcobykge1xyXG4gICAgICAgIGlmICghZC5kZWJ1Zykge1xyXG4gICAgICAgICAgICByZXR1cm5cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGNvbnNvbGUubG9nKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKG8pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYWxlcnQobylcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gayhwLCBvKSB7XHJcbiAgICAgICAgaWYgKHAgPT0gbnVsbCB8fCBwLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciByID0gcC5jaGFyQXQocC5sZW5ndGggLSAxKTtcclxuICAgICAgICBpZiAociAhPSBcIitcIiAmJiByICE9IFwiKlwiICYmIChwLmluZGV4T2YoXCJfXCIpICE9IC0xICYmIHIgIT0gXCJfXCIpKSB7XHJcbiAgICAgICAgICAgIHAgPSBwICsgXCIqXCI7XHJcbiAgICAgICAgICAgIHIgPSBcIipcIlxyXG4gICAgICAgIH1cclxuICAgICAgICBwID0gcC5zdWJzdHJpbmcoMCwgcC5sZW5ndGggLSAxKTtcclxuICAgICAgICBpZiAocC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHZhciBxID0gcC5jaGFyQXQocC5sZW5ndGggLSAxKTtcclxuICAgICAgICAgICAgaWYgKHEgPT0gXCIuXCIgfHwgcSA9PSBcIl9cIikge1xyXG4gICAgICAgICAgICAgICAgcCA9IHAuc3Vic3RyaW5nKDAsIHAubGVuZ3RoIC0gMSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAociA9PSBcIipcIikge1xyXG4gICAgICAgICAgICByZXR1cm4gKG8uaW5kZXhPZihwKSA9PSAwKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmIChyID09IFwiK1wiKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcCA8PSBvXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZSgpIHtcclxuICAgICAgICB2YXIgbyA9IFwiLy9qYXZhLmNvbS9qcy93ZWJzdGFydC5wbmdcIjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICByZXR1cm4gZG9jdW1lbnQubG9jYXRpb24ucHJvdG9jb2wuaW5kZXhPZihcImh0dHBcIikgIT0gLTEgPyBvIDogXCJodHRwOlwiICsgb1xyXG4gICAgICAgIH0gY2F0Y2ggKHApIHtcclxuICAgICAgICAgICAgcmV0dXJuIFwiaHR0cDpcIiArIG9cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbihwKSB7XHJcbiAgICAgICAgdmFyIG8gPSBcImh0dHA6Ly9qYXZhLmNvbS9kdC1yZWRpcmVjdFwiO1xyXG4gICAgICAgIGlmIChwID09IG51bGwgfHwgcC5sZW5ndGggPT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm4gb1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAocC5jaGFyQXQoMCkgPT0gXCImXCIpIHtcclxuICAgICAgICAgICAgcCA9IHAuc3Vic3RyaW5nKDEsIHAubGVuZ3RoKVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbyArIFwiP1wiICsgcFxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGoocSwgcCkge1xyXG4gICAgICAgIHZhciBvID0gcS5sZW5ndGg7XHJcbiAgICAgICAgZm9yICh2YXIgciA9IDA7IHIgPCBvOyByKyspIHtcclxuICAgICAgICAgICAgaWYgKHFbcl0gPT09IHApIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYyhvKSB7XHJcbiAgICAgICAgcmV0dXJuIGoobSwgby50b0xvd2VyQ2FzZSgpKVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGkobykge1xyXG4gICAgICAgIHJldHVybiBqKGIsIG8udG9Mb3dlckNhc2UoKSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhKG8pIHtcclxuICAgICAgICBpZiAoXCJNU0lFXCIgIT0gZGVwbG95SmF2YS5icm93c2VyTmFtZSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVwbG95SmF2YS5jb21wYXJlVmVyc2lvblRvUGF0dGVybihkZXBsb3lKYXZhLmdldFBsdWdpbigpLnZlcnNpb24sIFtcIjEwXCIsIFwiMFwiLCBcIjBcIl0sIGZhbHNlLCB0cnVlKSkge1xyXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAobyA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gIWsoXCIxLjYuMF8zMytcIiwgbylcclxuICAgIH1cclxuICAgIHZhciBkID0ge1xyXG4gICAgICAgIGRlYnVnOiBudWxsLFxyXG4gICAgICAgIHZlcnNpb246IFwiMjAxMjA4MDFcIixcclxuICAgICAgICBmaXJlZm94SmF2YVZlcnNpb246IG51bGwsXHJcbiAgICAgICAgbXlJbnRlcnZhbDogbnVsbCxcclxuICAgICAgICBwcmVJbnN0YWxsSlJFTGlzdDogbnVsbCxcclxuICAgICAgICByZXR1cm5QYWdlOiBudWxsLFxyXG4gICAgICAgIGJyYW5kOiBudWxsLFxyXG4gICAgICAgIGxvY2FsZTogbnVsbCxcclxuICAgICAgICBpbnN0YWxsVHlwZTogbnVsbCxcclxuICAgICAgICBFQUluc3RhbGxFbmFibGVkOiBmYWxzZSxcclxuICAgICAgICBFYXJseUFjY2Vzc1VSTDogbnVsbCxcclxuICAgICAgICBvbGRNaW1lVHlwZTogXCJhcHBsaWNhdGlvbi9ucHJ1bnRpbWUtc2NyaXB0YWJsZS1wbHVnaW47RGVwbG95bWVudFRvb2xraXRcIixcclxuICAgICAgICBtaW1lVHlwZTogXCJhcHBsaWNhdGlvbi9qYXZhLWRlcGxveW1lbnQtdG9vbGtpdFwiLFxyXG4gICAgICAgIGxhdW5jaEJ1dHRvblBORzogZSgpLFxyXG4gICAgICAgIGJyb3dzZXJOYW1lOiBudWxsLFxyXG4gICAgICAgIGJyb3dzZXJOYW1lMjogbnVsbCxcclxuICAgICAgICBnZXRKUkVzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIHQgPSBuZXcgQXJyYXkoKTtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNQbHVnaW5JbnN0YWxsZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHIgPSB0aGlzLmdldFBsdWdpbigpO1xyXG4gICAgICAgICAgICAgICAgdmFyIG8gPSByLmp2bXM7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBxID0gMDsgcSA8IG8uZ2V0TGVuZ3RoKCk7IHErKykge1xyXG4gICAgICAgICAgICAgICAgICAgIHRbcV0gPSBvLmdldChxKS52ZXJzaW9uXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcCA9IHRoaXMuZ2V0QnJvd3NlcigpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHAgPT0gXCJNU0lFXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50ZXN0VXNpbmdBY3RpdmVYKFwiMS43LjBcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdFswXSA9IFwiMS43LjBcIlxyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRlc3RVc2luZ0FjdGl2ZVgoXCIxLjYuMFwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdFswXSA9IFwiMS42LjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudGVzdFVzaW5nQWN0aXZlWChcIjEuNS4wXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdFswXSA9IFwiMS41LjBcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50ZXN0VXNpbmdBY3RpdmVYKFwiMS40LjJcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdFswXSA9IFwiMS40LjJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRlc3RGb3JNU1ZNKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRbMF0gPSBcIjEuMVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwID09IFwiTmV0c2NhcGUgRmFtaWx5XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nZXRKUElWZXJzaW9uVXNpbmdNaW1lVHlwZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5maXJlZm94SmF2YVZlcnNpb24gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdFswXSA9IHRoaXMuZmlyZWZveEphdmFWZXJzaW9uXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50ZXN0VXNpbmdNaW1lVHlwZXMoXCIxLjdcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0WzBdID0gXCIxLjcuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRlc3RVc2luZ01pbWVUeXBlcyhcIjEuNlwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0WzBdID0gXCIxLjYuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudGVzdFVzaW5nTWltZVR5cGVzKFwiMS41XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0WzBdID0gXCIxLjUuMFwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50ZXN0VXNpbmdNaW1lVHlwZXMoXCIxLjQuMlwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRbMF0gPSBcIjEuNC4yXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuYnJvd3Nlck5hbWUyID09IFwiU2FmYXJpXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudGVzdFVzaW5nUGx1Z2luc0FycmF5KFwiMS43LjBcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRbMF0gPSBcIjEuNy4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRlc3RVc2luZ1BsdWdpbnNBcnJheShcIjEuNlwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRbMF0gPSBcIjEuNi4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudGVzdFVzaW5nUGx1Z2luc0FycmF5KFwiMS41XCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRbMF0gPSBcIjEuNS4wXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy50ZXN0VXNpbmdQbHVnaW5zQXJyYXkoXCIxLjQuMlwiKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdFswXSA9IFwiMS40LjJcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmRlYnVnKSB7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBxID0gMDsgcSA8IHQubGVuZ3RoOyArK3EpIHtcclxuICAgICAgICAgICAgICAgICAgICBnKFwiW2dldEpSRXMoKV0gV2UgY2xhaW0gdG8gaGF2ZSBkZXRlY3RlZCBKYXZhIFNFIFwiICsgdFtxXSlcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gdFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaW5zdGFsbEpSRTogZnVuY3Rpb24ociwgcCkge1xyXG4gICAgICAgICAgICB2YXIgbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1BsdWdpbkluc3RhbGxlZCgpICYmIHRoaXMuaXNBdXRvSW5zdGFsbEVuYWJsZWQocikpIHtcclxuICAgICAgICAgICAgICAgIHZhciBxID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0NhbGxiYWNrU3VwcG9ydGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICBxID0gdGhpcy5nZXRQbHVnaW4oKS5pbnN0YWxsSlJFKHIsIHApXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHEgPSB0aGlzLmdldFBsdWdpbigpLmluc3RhbGxKUkUocilcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGlmIChxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmV0dXJuUGFnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gdGhpcy5yZXR1cm5QYWdlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHFcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmluc3RhbGxMYXRlc3RKUkUoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc0F1dG9JbnN0YWxsRW5hYmxlZDogZnVuY3Rpb24obykge1xyXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNQbHVnaW5JbnN0YWxsZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvID09IFwidW5kZWZpbmVkXCIpIHtcclxuICAgICAgICAgICAgICAgIG8gPSBudWxsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGEobylcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzQ2FsbGJhY2tTdXBwb3J0ZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc1BsdWdpbkluc3RhbGxlZCgpICYmIHRoaXMuY29tcGFyZVZlcnNpb25Ub1BhdHRlcm4odGhpcy5nZXRQbHVnaW4oKS52ZXJzaW9uLCBbXCIxMFwiLCBcIjJcIiwgXCIwXCJdLCBmYWxzZSwgdHJ1ZSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIGluc3RhbGxMYXRlc3RKUkU6IGZ1bmN0aW9uKHEpIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNQbHVnaW5JbnN0YWxsZWQoKSAmJiB0aGlzLmlzQXV0b0luc3RhbGxFbmFibGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHZhciByID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0NhbGxiYWNrU3VwcG9ydGVkKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByID0gdGhpcy5nZXRQbHVnaW4oKS5pbnN0YWxsTGF0ZXN0SlJFKHEpXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHIgPSB0aGlzLmdldFBsdWdpbigpLmluc3RhbGxMYXRlc3RKUkUoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHIpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5yZXR1cm5QYWdlICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQubG9jYXRpb24gPSB0aGlzLnJldHVyblBhZ2VcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gclxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHAgPSB0aGlzLmdldEJyb3dzZXIoKTtcclxuICAgICAgICAgICAgICAgIHZhciBvID0gbmF2aWdhdG9yLnBsYXRmb3JtLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHRoaXMuRUFJbnN0YWxsRW5hYmxlZCA9PSBcInRydWVcIikgJiYgKG8uaW5kZXhPZihcIndpblwiKSAhPSAtMSkgJiYgKHRoaXMuRWFybHlBY2Nlc3NVUkwgIT0gbnVsbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZUluc3RhbGxKUkVMaXN0ID0gdGhpcy5nZXRKUkVzKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMucmV0dXJuUGFnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubXlJbnRlcnZhbCA9IHNldEludGVydmFsKFwiZGVwbG95SmF2YS5wb2xsKClcIiwgMzAwMClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHRoaXMuRWFybHlBY2Nlc3NVUkw7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwID09IFwiTVNJRVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLklFSW5zdGFsbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChwID09IFwiTmV0c2NhcGUgRmFtaWx5XCIpICYmIChvLmluZGV4T2YoXCJ3aW4zMlwiKSAhPSAtMSkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLkZGSW5zdGFsbCgpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbigoKHRoaXMucmV0dXJuUGFnZSAhPSBudWxsKSA/IChcIiZyZXR1cm5QYWdlPVwiICsgdGhpcy5yZXR1cm5QYWdlKSA6IFwiXCIpICsgKCh0aGlzLmxvY2FsZSAhPSBudWxsKSA/IChcIiZsb2NhbGU9XCIgKyB0aGlzLmxvY2FsZSkgOiBcIlwiKSArICgodGhpcy5icmFuZCAhPSBudWxsKSA/IChcIiZicmFuZD1cIiArIHRoaXMuYnJhbmQpIDogXCJcIikpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIHJ1bkFwcGxldDogZnVuY3Rpb24ocCwgdSwgcikge1xyXG4gICAgICAgICAgICBpZiAociA9PSBcInVuZGVmaW5lZFwiIHx8IHIgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgciA9IFwiMS4xXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdCA9IFwiXihcXFxcZCspKD86XFxcXC4oXFxcXGQrKSg/OlxcXFwuKFxcXFxkKykoPzpfKFxcXFxkKykpPyk/KT8kXCI7XHJcbiAgICAgICAgICAgIHZhciBvID0gci5tYXRjaCh0KTtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmV0dXJuUGFnZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJldHVyblBhZ2UgPSBkb2N1bWVudC5sb2NhdGlvblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChvICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBxID0gdGhpcy5nZXRCcm93c2VyKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAocSAhPSBcIj9cIikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnZlcnNpb25DaGVjayhyICsgXCIrXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud3JpdGVBcHBsZXRUYWcocCwgdSlcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5pbnN0YWxsSlJFKHIgKyBcIitcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGRvY3VtZW50LmxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53cml0ZUFwcGxldFRhZyhwLCB1KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndyaXRlQXBwbGV0VGFnKHAsIHUpXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBnKFwiW3J1bkFwcGxldCgpXSBJbnZhbGlkIG1pbmltdW1WZXJzaW9uIGFyZ3VtZW50IHRvIHJ1bkFwcGxldCgpOlwiICsgcilcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgd3JpdGVBcHBsZXRUYWc6IGZ1bmN0aW9uKHIsIHcpIHtcclxuICAgICAgICAgICAgdmFyIG8gPSBcIjxcIiArIFwiYXBwbGV0IFwiO1xyXG4gICAgICAgICAgICB2YXIgcSA9IFwiXCI7XHJcbiAgICAgICAgICAgIHZhciB0ID0gXCI8XCIgKyBcIi9cIiArIFwiYXBwbGV0XCIgKyBcIj5cIjtcclxuICAgICAgICAgICAgdmFyIHggPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAobnVsbCA9PSB3IHx8IHR5cGVvZiB3ICE9IFwib2JqZWN0XCIpIHtcclxuICAgICAgICAgICAgICAgIHcgPSBuZXcgT2JqZWN0KClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKHZhciBwIGluIHIpIHtcclxuICAgICAgICAgICAgICAgIGlmICghYyhwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHdbcF0gPSByW3BdXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG8gKz0gKFwiIFwiICsgcCArICc9XCInICsgcltwXSArICdcIicpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChwID09IFwiY29kZVwiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHggPSBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdiA9IGZhbHNlO1xyXG4gICAgICAgICAgICBmb3IgKHZhciB1IGluIHcpIHtcclxuICAgICAgICAgICAgICAgIGlmICh1ID09IFwiY29kZWJhc2VfbG9va3VwXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB2ID0gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgaWYgKHUgPT0gXCJvYmplY3RcIiB8fCB1ID09IFwiamF2YV9vYmplY3RcIiB8fCB1ID09IFwiamF2YV9jb2RlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICB4ID0gZmFsc2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHEgKz0gJzxwYXJhbSBuYW1lPVwiJyArIHUgKyAnXCIgdmFsdWU9XCInICsgd1t1XSArICdcIi8+J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmICghdikge1xyXG4gICAgICAgICAgICAgICAgcSArPSAnPHBhcmFtIG5hbWU9XCJjb2RlYmFzZV9sb29rdXBcIiB2YWx1ZT1cImZhbHNlXCIvPidcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoeCkge1xyXG4gICAgICAgICAgICAgICAgbyArPSAoJyBjb2RlPVwiZHVtbXlcIicpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbyArPSBcIj5cIjtcclxuICAgICAgICAgICAgZG9jdW1lbnQud3JpdGUobyArIFwiXFxuXCIgKyBxICsgXCJcXG5cIiArIHQpXHJcbiAgICAgICAgfSxcclxuICAgICAgICB2ZXJzaW9uQ2hlY2s6IGZ1bmN0aW9uKHApIHtcclxuICAgICAgICAgICAgdmFyIHYgPSAwO1xyXG4gICAgICAgICAgICB2YXIgeCA9IFwiXihcXFxcZCspKD86XFxcXC4oXFxcXGQrKSg/OlxcXFwuKFxcXFxkKykoPzpfKFxcXFxkKykpPyk/KT8oXFxcXCp8XFxcXCspPyRcIjtcclxuICAgICAgICAgICAgdmFyIHkgPSBwLm1hdGNoKHgpO1xyXG4gICAgICAgICAgICBpZiAoeSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIHZhciBxID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB0ID0gMTsgdCA8IHkubGVuZ3RoOyArK3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKHR5cGVvZiB5W3RdID09IFwic3RyaW5nXCIpICYmICh5W3RdICE9IFwiXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHFbdl0gPSB5W3RdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2KytcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAocVtxLmxlbmd0aCAtIDFdID09IFwiK1wiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgIHEubGVuZ3RoLS1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHFbcS5sZW5ndGggLSAxXSA9PSBcIipcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBxLmxlbmd0aC0tXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHEubGVuZ3RoIDwgNCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgciA9IHRydWVcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHZhciB3ID0gdGhpcy5nZXRKUkVzKCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciB0ID0gMDsgdCA8IHcubGVuZ3RoOyArK3QpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5jb21wYXJlVmVyc2lvblRvUGF0dGVybih3W3RdLCBxLCByLCB1KSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIG8gPSBcIkludmFsaWQgdmVyc2lvblBhdHRlcm4gcGFzc2VkIHRvIHZlcnNpb25DaGVjazogXCIgKyBwO1xyXG4gICAgICAgICAgICAgICAgZyhcIlt2ZXJzaW9uQ2hlY2soKV0gXCIgKyBvKTtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KG8pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzV2ViU3RhcnRJbnN0YWxsZWQ6IGZ1bmN0aW9uKHIpIHtcclxuICAgICAgICAgICAgdmFyIHEgPSB0aGlzLmdldEJyb3dzZXIoKTtcclxuICAgICAgICAgICAgaWYgKHEgPT0gXCI/XCIpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHIgPT0gXCJ1bmRlZmluZWRcIiB8fCByID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHIgPSBcIjEuNC4yXCJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgcCA9IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgdCA9IFwiXihcXFxcZCspKD86XFxcXC4oXFxcXGQrKSg/OlxcXFwuKFxcXFxkKykoPzpfKFxcXFxkKykpPyk/KT8kXCI7XHJcbiAgICAgICAgICAgIHZhciBvID0gci5tYXRjaCh0KTtcclxuICAgICAgICAgICAgaWYgKG8gIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgcCA9IHRoaXMudmVyc2lvbkNoZWNrKHIgKyBcIitcIilcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGcoXCJbaXNXZWJTdGFydEluc3RhbGxlcigpXSBJbnZhbGlkIG1pbmltdW1WZXJzaW9uIGFyZ3VtZW50IHRvIGlzV2ViU3RhcnRJbnN0YWxsZWQoKTogXCIgKyByKTtcclxuICAgICAgICAgICAgICAgIHAgPSB0aGlzLnZlcnNpb25DaGVjayhcIjEuNC4yK1wiKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBwXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRKUElWZXJzaW9uVXNpbmdNaW1lVHlwZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHAgPSAwOyBwIDwgbmF2aWdhdG9yLm1pbWVUeXBlcy5sZW5ndGg7ICsrcCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHEgPSBuYXZpZ2F0b3IubWltZVR5cGVzW3BdLnR5cGU7XHJcbiAgICAgICAgICAgICAgICB2YXIgbyA9IHEubWF0Y2goL15hcHBsaWNhdGlvblxcL3gtamF2YS1hcHBsZXQ7anBpLXZlcnNpb249KC4qKSQvKTtcclxuICAgICAgICAgICAgICAgIGlmIChvICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpcmVmb3hKYXZhVmVyc2lvbiA9IG9bMV07XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFwiT3BlcmFcIiAhPSB0aGlzLmJyb3dzZXJOYW1lMikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVha1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGF1bmNoV2ViU3RhcnRBcHBsaWNhdGlvbjogZnVuY3Rpb24ocikge1xyXG4gICAgICAgICAgICB2YXIgbyA9IG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgdGhpcy5nZXRKUElWZXJzaW9uVXNpbmdNaW1lVHlwZSgpO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1dlYlN0YXJ0SW5zdGFsbGVkKFwiMS43LjBcIikgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5pbnN0YWxsSlJFKFwiMS43LjArXCIpID09IGZhbHNlKSB8fCAoKHRoaXMuaXNXZWJTdGFydEluc3RhbGxlZChcIjEuNy4wXCIpID09IGZhbHNlKSkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgdSA9IG51bGw7XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5kb2N1bWVudFVSSSkge1xyXG4gICAgICAgICAgICAgICAgdSA9IGRvY3VtZW50LmRvY3VtZW50VVJJXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHUgPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgdSA9IGRvY3VtZW50LlVSTFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBwID0gdGhpcy5nZXRCcm93c2VyKCk7XHJcbiAgICAgICAgICAgIHZhciBxO1xyXG4gICAgICAgICAgICBpZiAocCA9PSBcIk1TSUVcIikge1xyXG4gICAgICAgICAgICAgICAgcSA9IFwiPFwiICsgJ29iamVjdCBjbGFzc2lkPVwiY2xzaWQ6OEFEOUM4NDAtMDQ0RS0xMUQxLUIzRTktMDA4MDVGNDk5RDkzXCIgJyArICd3aWR0aD1cIjBcIiBoZWlnaHQ9XCIwXCI+JyArIFwiPFwiICsgJ1BBUkFNIG5hbWU9XCJsYXVuY2hqbmxwXCIgdmFsdWU9XCInICsgciArICdcIicgKyBcIj5cIiArIFwiPFwiICsgJ1BBUkFNIG5hbWU9XCJkb2NiYXNlXCIgdmFsdWU9XCInICsgdSArICdcIicgKyBcIj5cIiArIFwiPFwiICsgXCIvXCIgKyBcIm9iamVjdFwiICsgXCI+XCJcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChwID09IFwiTmV0c2NhcGUgRmFtaWx5XCIpIHtcclxuICAgICAgICAgICAgICAgICAgICBxID0gXCI8XCIgKyAnZW1iZWQgdHlwZT1cImFwcGxpY2F0aW9uL3gtamF2YS1hcHBsZXQ7anBpLXZlcnNpb249JyArIHRoaXMuZmlyZWZveEphdmFWZXJzaW9uICsgJ1wiICcgKyAnd2lkdGg9XCIwXCIgaGVpZ2h0PVwiMFwiICcgKyAnbGF1bmNoam5scD1cIicgKyByICsgJ1wiJyArICdkb2NiYXNlPVwiJyArIHUgKyAnXCInICsgXCIgLz5cIlxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5ib2R5ID09IFwidW5kZWZpbmVkXCIgfHwgZG9jdW1lbnQuYm9keSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC53cml0ZShxKTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gdVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdmFyIHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgICAgICAgICAgICAgdC5pZCA9IFwiZGl2MVwiO1xyXG4gICAgICAgICAgICAgICAgdC5zdHlsZS5wb3NpdGlvbiA9IFwicmVsYXRpdmVcIjtcclxuICAgICAgICAgICAgICAgIHQuc3R5bGUubGVmdCA9IFwiLTEwMDAwcHhcIjtcclxuICAgICAgICAgICAgICAgIHQuc3R5bGUubWFyZ2luID0gXCIwcHggYXV0b1wiO1xyXG4gICAgICAgICAgICAgICAgdC5jbGFzc05hbWUgPSBcImR5bmFtaWNEaXZcIjtcclxuICAgICAgICAgICAgICAgIHQuaW5uZXJIVE1MID0gcTtcclxuICAgICAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodClcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlV2ViU3RhcnRMYXVuY2hCdXR0b25FeDogZnVuY3Rpb24ocSwgcCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5yZXR1cm5QYWdlID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMucmV0dXJuUGFnZSA9IHFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB2YXIgbyA9IFwiamF2YXNjcmlwdDpkZXBsb3lKYXZhLmxhdW5jaFdlYlN0YXJ0QXBwbGljYXRpb24oJ1wiICsgcSArIFwiJyk7XCI7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LndyaXRlKFwiPFwiICsgJ2EgaHJlZj1cIicgKyBvICsgXCJcXFwiIG9uTW91c2VPdmVyPVxcXCJ3aW5kb3cuc3RhdHVzPScnOyBcIiArICdyZXR1cm4gdHJ1ZTtcIj48JyArIFwiaW1nIFwiICsgJ3NyYz1cIicgKyB0aGlzLmxhdW5jaEJ1dHRvblBORyArICdcIiAnICsgJ2JvcmRlcj1cIjBcIiAvPjwnICsgXCIvXCIgKyBcImFcIiArIFwiPlwiKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlYXRlV2ViU3RhcnRMYXVuY2hCdXR0b246IGZ1bmN0aW9uKHEsIHApIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMucmV0dXJuUGFnZSA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnJldHVyblBhZ2UgPSBxXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIG8gPSBcImphdmFzY3JpcHQ6XCIgKyBcImlmICghZGVwbG95SmF2YS5pc1dlYlN0YXJ0SW5zdGFsbGVkKCZxdW90O1wiICsgcCArIFwiJnF1b3Q7KSkge1wiICsgXCJpZiAoZGVwbG95SmF2YS5pbnN0YWxsTGF0ZXN0SlJFKCkpIHtcIiArIFwiaWYgKGRlcGxveUphdmEubGF1bmNoKCZxdW90O1wiICsgcSArIFwiJnF1b3Q7KSkge31cIiArIFwifVwiICsgXCJ9IGVsc2Uge1wiICsgXCJpZiAoZGVwbG95SmF2YS5sYXVuY2goJnF1b3Q7XCIgKyBxICsgXCImcXVvdDspKSB7fVwiICsgXCJ9XCI7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LndyaXRlKFwiPFwiICsgJ2EgaHJlZj1cIicgKyBvICsgXCJcXFwiIG9uTW91c2VPdmVyPVxcXCJ3aW5kb3cuc3RhdHVzPScnOyBcIiArICdyZXR1cm4gdHJ1ZTtcIj48JyArIFwiaW1nIFwiICsgJ3NyYz1cIicgKyB0aGlzLmxhdW5jaEJ1dHRvblBORyArICdcIiAnICsgJ2JvcmRlcj1cIjBcIiAvPjwnICsgXCIvXCIgKyBcImFcIiArIFwiPlwiKVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbGF1bmNoOiBmdW5jdGlvbihvKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmxvY2F0aW9uID0gbztcclxuICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIGlzUGx1Z2luSW5zdGFsbGVkOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgdmFyIG8gPSB0aGlzLmdldFBsdWdpbigpO1xyXG4gICAgICAgICAgICBpZiAobyAmJiBvLmp2bXMpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgaXNBdXRvVXBkYXRlRW5hYmxlZDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmlzUGx1Z2luSW5zdGFsbGVkKCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldFBsdWdpbigpLmlzQXV0b1VwZGF0ZUVuYWJsZWQoKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc2V0QXV0b1VwZGF0ZUVuYWJsZWQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1BsdWdpbkluc3RhbGxlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQbHVnaW4oKS5zZXRBdXRvVXBkYXRlRW5hYmxlZCgpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRJbnN0YWxsZXJUeXBlOiBmdW5jdGlvbihvKSB7XHJcbiAgICAgICAgICAgIHRoaXMuaW5zdGFsbFR5cGUgPSBvO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1BsdWdpbkluc3RhbGxlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQbHVnaW4oKS5zZXRJbnN0YWxsZXJUeXBlKG8pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRBZGRpdGlvbmFsUGFja2FnZXM6IGZ1bmN0aW9uKG8pIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMuaXNQbHVnaW5JbnN0YWxsZWQoKSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0UGx1Z2luKCkuc2V0QWRkaXRpb25hbFBhY2thZ2VzKG8pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRFYXJseUFjY2VzczogZnVuY3Rpb24obykge1xyXG4gICAgICAgICAgICB0aGlzLkVBSW5zdGFsbEVuYWJsZWQgPSBvXHJcbiAgICAgICAgfSxcclxuICAgICAgICBpc1BsdWdpbjI6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy5pc1BsdWdpbkluc3RhbGxlZCgpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodGhpcy52ZXJzaW9uQ2hlY2soXCIxLjYuMF8xMCtcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRQbHVnaW4oKS5pc1BsdWdpbjIoKVxyXG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKG8pIHt9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBhbGxvd1BsdWdpbjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZ2V0QnJvd3NlcigpO1xyXG4gICAgICAgICAgICB2YXIgbyA9IChcIlNhZmFyaVwiICE9IHRoaXMuYnJvd3Nlck5hbWUyICYmIFwiT3BlcmFcIiAhPSB0aGlzLmJyb3dzZXJOYW1lMik7XHJcbiAgICAgICAgICAgIHJldHVybiBvXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRQbHVnaW46IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgdmFyIG8gPSBudWxsO1xyXG4gICAgICAgICAgICBpZiAodGhpcy5hbGxvd1BsdWdpbigpKSB7XHJcbiAgICAgICAgICAgICAgICBvID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXBsb3lKYXZhUGx1Z2luXCIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIG9cclxuICAgICAgICB9LFxyXG4gICAgICAgIGNvbXBhcmVWZXJzaW9uVG9QYXR0ZXJuOiBmdW5jdGlvbih2LCBwLCByLCB0KSB7XHJcbiAgICAgICAgICAgIGlmICh2ID09IHVuZGVmaW5lZCB8fCBwID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgdmFyIHcgPSBcIl4oXFxcXGQrKSg/OlxcXFwuKFxcXFxkKykoPzpcXFxcLihcXFxcZCspKD86XyhcXFxcZCspKT8pPyk/JFwiO1xyXG4gICAgICAgICAgICB2YXIgeCA9IHYubWF0Y2godyk7XHJcbiAgICAgICAgICAgIGlmICh4ICE9IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHZhciB1ID0gMDtcclxuICAgICAgICAgICAgICAgIHZhciB5ID0gbmV3IEFycmF5KCk7XHJcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBxID0gMTsgcSA8IHgubGVuZ3RoOyArK3EpIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoKHR5cGVvZiB4W3FdID09IFwic3RyaW5nXCIpICYmICh4W3FdICE9IFwiXCIpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHlbdV0gPSB4W3FdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1KytcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB2YXIgbyA9IE1hdGgubWluKHkubGVuZ3RoLCBwLmxlbmd0aCk7XHJcbiAgICAgICAgICAgICAgICBpZiAodCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHEgPSAwOyBxIDwgbzsgKytxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh5W3FdIDwgcFtxXSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeVtxXSA+IHBbcV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHEgPSAwOyBxIDwgbzsgKytxKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh5W3FdICE9IHBbcV0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuICh5Lmxlbmd0aCA9PSBwLmxlbmd0aClcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ2V0QnJvd3NlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGlmICh0aGlzLmJyb3dzZXJOYW1lID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIHZhciBvID0gbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICAgICAgZyhcIltnZXRCcm93c2VyKCldIG5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSAtPiBcIiArIG8pO1xyXG4gICAgICAgICAgICAgICAgaWYgKChvLmluZGV4T2YoXCJtc2llXCIpICE9IC0xKSAmJiAoby5pbmRleE9mKFwib3BlcmFcIikgPT0gLTEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTmFtZSA9IFwiTVNJRVwiO1xyXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3Nlck5hbWUyID0gXCJNU0lFXCJcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG8uaW5kZXhPZihcInRyaWRlbnRcIikgIT0gLTEgfHwgby5pbmRleE9mKFwiVHJpZGVudFwiKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb3dzZXJOYW1lID0gXCJNU0lFXCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3Nlck5hbWUyID0gXCJNU0lFXCJcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5pbmRleE9mKFwiaXBob25lXCIpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb3dzZXJOYW1lID0gXCJOZXRzY2FwZSBGYW1pbHlcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3Nlck5hbWUyID0gXCJpUGhvbmVcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChvLmluZGV4T2YoXCJmaXJlZm94XCIpICE9IC0xKSAmJiAoby5pbmRleE9mKFwib3BlcmFcIikgPT0gLTEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTmFtZSA9IFwiTmV0c2NhcGUgRmFtaWx5XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTmFtZTIgPSBcIkZpcmVmb3hcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5pbmRleE9mKFwiY2hyb21lXCIpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3Nlck5hbWUgPSBcIk5ldHNjYXBlIEZhbWlseVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb3dzZXJOYW1lMiA9IFwiQ2hyb21lXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoby5pbmRleE9mKFwic2FmYXJpXCIpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb3dzZXJOYW1lID0gXCJOZXRzY2FwZSBGYW1pbHlcIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3Nlck5hbWUyID0gXCJTYWZhcmlcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKChvLmluZGV4T2YoXCJtb3ppbGxhXCIpICE9IC0xKSAmJiAoby5pbmRleE9mKFwib3BlcmFcIikgPT0gLTEpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTmFtZSA9IFwiTmV0c2NhcGUgRmFtaWx5XCI7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTmFtZTIgPSBcIk90aGVyXCJcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8uaW5kZXhPZihcIm9wZXJhXCIpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3Nlck5hbWUgPSBcIk5ldHNjYXBlIEZhbWlseVwiO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJyb3dzZXJOYW1lMiA9IFwiT3BlcmFcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYnJvd3Nlck5hbWUgPSBcIj9cIjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5icm93c2VyTmFtZTIgPSBcInVua25vd25cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGcoXCJbZ2V0QnJvd3NlcigpXSBEZXRlY3RlZCBicm93c2VyIG5hbWU6XCIgKyB0aGlzLmJyb3dzZXJOYW1lICsgXCIsIFwiICsgdGhpcy5icm93c2VyTmFtZTIpXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYnJvd3Nlck5hbWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRlc3RVc2luZ0FjdGl2ZVg6IGZ1bmN0aW9uKG8pIHtcclxuICAgICAgICAgICAgdmFyIHEgPSBcIkphdmFXZWJTdGFydC5pc0luc3RhbGxlZC5cIiArIG8gKyBcIi4wXCI7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgQWN0aXZlWE9iamVjdCA9PSBcInVuZGVmaW5lZFwiIHx8ICFBY3RpdmVYT2JqZWN0KSB7XHJcbiAgICAgICAgICAgICAgICBnKFwiW3Rlc3RVc2luZ0FjdGl2ZVgoKV0gQnJvd3NlciBjbGFpbXMgdG8gYmUgSUUsIGJ1dCBubyBBY3RpdmVYT2JqZWN0IG9iamVjdD9cIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChuZXcgQWN0aXZlWE9iamVjdChxKSAhPSBudWxsKVxyXG4gICAgICAgICAgICB9IGNhdGNoIChwKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGVzdEZvck1TVk06IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB2YXIgcCA9IFwiezA4QjBFNUMwLTRGQ0ItMTFDRi1BQUE1LTAwNDAxQzYwODUwMH1cIjtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBvQ2xpZW50Q2FwcyAhPSBcInVuZGVmaW5lZFwiKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgbyA9IG9DbGllbnRDYXBzLmdldENvbXBvbmVudFZlcnNpb24ocCwgXCJDb21wb25lbnRJRFwiKTtcclxuICAgICAgICAgICAgICAgIGlmICgobyA9PSBcIlwiKSB8fCAobyA9PSBcIjUsMCw1MDAwLDBcIikpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB0ZXN0VXNpbmdNaW1lVHlwZXM6IGZ1bmN0aW9uKHApIHtcclxuICAgICAgICAgICAgaWYgKCFuYXZpZ2F0b3IubWltZVR5cGVzKSB7XHJcbiAgICAgICAgICAgICAgICBnKFwiW3Rlc3RVc2luZ01pbWVUeXBlcygpXSBCcm93c2VyIGNsYWltcyB0byBiZSBOZXRzY2FwZSBmYW1pbHksIGJ1dCBubyBtaW1lVHlwZXNbXSBhcnJheT9cIik7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBmb3IgKHZhciBxID0gMDsgcSA8IG5hdmlnYXRvci5taW1lVHlwZXMubGVuZ3RoOyArK3EpIHtcclxuICAgICAgICAgICAgICAgIHMgPSBuYXZpZ2F0b3IubWltZVR5cGVzW3FdLnR5cGU7XHJcbiAgICAgICAgICAgICAgICB2YXIgbyA9IHMubWF0Y2goL15hcHBsaWNhdGlvblxcL3gtamF2YS1hcHBsZXRcXHgzQnZlcnNpb249KDFcXC44fDFcXC43fDFcXC42fDFcXC41fDFcXC40XFwuMikkLyk7XHJcbiAgICAgICAgICAgICAgICBpZiAobyAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZVZlcnNpb25zKG9bMV0sIHApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdGVzdFVzaW5nUGx1Z2luc0FycmF5OiBmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgICAgIGlmICgoIW5hdmlnYXRvci5wbHVnaW5zKSB8fCAoIW5hdmlnYXRvci5wbHVnaW5zLmxlbmd0aCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHZhciBvID0gbmF2aWdhdG9yLnBsYXRmb3JtLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHEgPSAwOyBxIDwgbmF2aWdhdG9yLnBsdWdpbnMubGVuZ3RoOyArK3EpIHtcclxuICAgICAgICAgICAgICAgIHMgPSBuYXZpZ2F0b3IucGx1Z2luc1txXS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAgICAgICAgIGlmIChzLnNlYXJjaCgvXkphdmEgU3dpdGNoYWJsZSBQbHVnLWluIChDb2NvYSkvKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbXBhcmVWZXJzaW9ucyhcIjEuNS4wXCIsIHApKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAocy5zZWFyY2goL15KYXZhLykgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG8uaW5kZXhPZihcIndpblwiKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZVZlcnNpb25zKFwiMS41LjBcIiwgcCkgfHwgdGhpcy5jb21wYXJlVmVyc2lvbnMoXCIxLjYuMFwiLCBwKSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKHRoaXMuY29tcGFyZVZlcnNpb25zKFwiMS41LjBcIiwgcCkpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBJRUluc3RhbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbigoKHRoaXMucmV0dXJuUGFnZSAhPSBudWxsKSA/IChcIiZyZXR1cm5QYWdlPVwiICsgdGhpcy5yZXR1cm5QYWdlKSA6IFwiXCIpICsgKCh0aGlzLmxvY2FsZSAhPSBudWxsKSA/IChcIiZsb2NhbGU9XCIgKyB0aGlzLmxvY2FsZSkgOiBcIlwiKSArICgodGhpcy5icmFuZCAhPSBudWxsKSA/IChcIiZicmFuZD1cIiArIHRoaXMuYnJhbmQpIDogXCJcIikpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIGRvbmU6IGZ1bmN0aW9uKHAsIG8pIHt9LFxyXG4gICAgICAgIEZGSW5zdGFsbDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBuKCgodGhpcy5yZXR1cm5QYWdlICE9IG51bGwpID8gKFwiJnJldHVyblBhZ2U9XCIgKyB0aGlzLnJldHVyblBhZ2UpIDogXCJcIikgKyAoKHRoaXMubG9jYWxlICE9IG51bGwpID8gKFwiJmxvY2FsZT1cIiArIHRoaXMubG9jYWxlKSA6IFwiXCIpICsgKCh0aGlzLmJyYW5kICE9IG51bGwpID8gKFwiJmJyYW5kPVwiICsgdGhpcy5icmFuZCkgOiBcIlwiKSArICgodGhpcy5pbnN0YWxsVHlwZSAhPSBudWxsKSA/IChcIiZ0eXBlPVwiICsgdGhpcy5pbnN0YWxsVHlwZSkgOiBcIlwiKSk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY29tcGFyZVZlcnNpb25zOiBmdW5jdGlvbihyLCB0KSB7XHJcbiAgICAgICAgICAgIHZhciBwID0gci5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgIHZhciBvID0gdC5zcGxpdChcIi5cIik7XHJcbiAgICAgICAgICAgIGZvciAodmFyIHEgPSAwOyBxIDwgcC5sZW5ndGg7ICsrcSkge1xyXG4gICAgICAgICAgICAgICAgcFtxXSA9IE51bWJlcihwW3FdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGZvciAodmFyIHEgPSAwOyBxIDwgby5sZW5ndGg7ICsrcSkge1xyXG4gICAgICAgICAgICAgICAgb1txXSA9IE51bWJlcihvW3FdKVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwLmxlbmd0aCA9PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBwWzJdID0gMFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwWzBdID4gb1swXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocFswXSA8IG9bMF0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwWzFdID4gb1sxXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocFsxXSA8IG9bMV0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwWzJdID4gb1syXSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAocFsyXSA8IG9bMl0pIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiB0cnVlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlbmFibGVBbGVydHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLmJyb3dzZXJOYW1lID0gbnVsbDtcclxuICAgICAgICAgICAgdGhpcy5kZWJ1ZyA9IHRydWVcclxuICAgICAgICB9LFxyXG4gICAgICAgIHBvbGw6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICB0aGlzLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgdmFyIG8gPSB0aGlzLmdldEpSRXMoKTtcclxuICAgICAgICAgICAgaWYgKCh0aGlzLnByZUluc3RhbGxKUkVMaXN0Lmxlbmd0aCA9PSAwKSAmJiAoby5sZW5ndGggIT0gMCkpIHtcclxuICAgICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5teUludGVydmFsKTtcclxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJldHVyblBhZ2UgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSB0aGlzLnJldHVyblBhZ2VcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoKHRoaXMucHJlSW5zdGFsbEpSRUxpc3QubGVuZ3RoICE9IDApICYmIChvLmxlbmd0aCAhPSAwKSAmJiAodGhpcy5wcmVJbnN0YWxsSlJFTGlzdFswXSAhPSBvWzBdKSkge1xyXG4gICAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLm15SW50ZXJ2YWwpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmV0dXJuUGFnZSAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IHRoaXMucmV0dXJuUGFnZVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB3cml0ZVBsdWdpblRhZzogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHZhciBvID0gdGhpcy5nZXRCcm93c2VyKCk7XHJcbiAgICAgICAgICAgIGlmIChvID09IFwiTVNJRVwiKSB7XHJcbiAgICAgICAgICAgICAgICBkb2N1bWVudC53cml0ZShcIjxcIiArICdvYmplY3QgY2xhc3NpZD1cImNsc2lkOkNBRkVFRkFDLURFQzctMDAwMC0wMDAxLUFCQ0RFRkZFRENCQVwiICcgKyAnaWQ9XCJkZXBsb3lKYXZhUGx1Z2luXCIgd2lkdGg9XCIwXCIgaGVpZ2h0PVwiMFwiPicgKyBcIjxcIiArIFwiL1wiICsgXCJvYmplY3RcIiArIFwiPlwiKVxyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgaWYgKG8gPT0gXCJOZXRzY2FwZSBGYW1pbHlcIiAmJiB0aGlzLmFsbG93UGx1Z2luKCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndyaXRlRW1iZWRUYWcoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZWZyZXNoOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgbmF2aWdhdG9yLnBsdWdpbnMucmVmcmVzaChmYWxzZSk7XHJcbiAgICAgICAgICAgIHZhciBvID0gdGhpcy5nZXRCcm93c2VyKCk7XHJcbiAgICAgICAgICAgIGlmIChvID09IFwiTmV0c2NhcGUgRmFtaWx5XCIgJiYgdGhpcy5hbGxvd1BsdWdpbigpKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVwbG95SmF2YVBsdWdpblwiKTtcclxuICAgICAgICAgICAgICAgIGlmIChwID09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgICAgICB0aGlzLndyaXRlRW1iZWRUYWcoKVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICB3cml0ZUVtYmVkVGFnOiBmdW5jdGlvbigpIHtcclxuXHRcdFx0LypcclxuICAgICAgICAgICAgdmFyIG8gPSBmYWxzZTtcclxuICAgICAgICAgICAgaWYgKG5hdmlnYXRvci5taW1lVHlwZXMgIT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgcCA9IDA7IHAgPCBuYXZpZ2F0b3IubWltZVR5cGVzLmxlbmd0aDsgcCsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5hdmlnYXRvci5taW1lVHlwZXNbcF0udHlwZSA9PSB0aGlzLm1pbWVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYXZpZ2F0b3IubWltZVR5cGVzW3BdLmVuYWJsZWRQbHVnaW4pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvY3VtZW50LndyaXRlKFwiPFwiICsgJ2VtYmVkIGlkPVwiZGVwbG95SmF2YVBsdWdpblwiIHR5cGU9XCInICsgdGhpcy5taW1lVHlwZSArICdcIiBoaWRkZW49XCJ0cnVlXCIgLz4nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG8gPSB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAoIW8pIHtcclxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBwID0gMDsgcCA8IG5hdmlnYXRvci5taW1lVHlwZXMubGVuZ3RoOyBwKyspIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5hdmlnYXRvci5taW1lVHlwZXNbcF0udHlwZSA9PSB0aGlzLm9sZE1pbWVUeXBlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobmF2aWdhdG9yLm1pbWVUeXBlc1twXS5lbmFibGVkUGx1Z2luKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZG9jdW1lbnQud3JpdGUoXCI8XCIgKyAnZW1iZWQgaWQ9XCJkZXBsb3lKYXZhUGx1Z2luXCIgdHlwZT1cIicgKyB0aGlzLm9sZE1pbWVUeXBlICsgJ1wiIGhpZGRlbj1cInRydWVcIiAvPicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuXHRcdFx0Ki9cclxuICAgICAgICB9XHJcbiAgICB9O1xyXG4gICAgZC53cml0ZVBsdWdpblRhZygpO1xyXG4gICAgaWYgKGQubG9jYWxlID09IG51bGwpIHtcclxuICAgICAgICB2YXIgaCA9IG51bGw7XHJcbiAgICAgICAgaWYgKGggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaCA9IG5hdmlnYXRvci51c2VyTGFuZ3VhZ2VcclxuICAgICAgICAgICAgfSBjYXRjaCAoZikge31cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGggPT0gbnVsbCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgaCA9IG5hdmlnYXRvci5zeXN0ZW1MYW5ndWFnZVxyXG4gICAgICAgICAgICB9IGNhdGNoIChmKSB7fVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaCA9PSBudWxsKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBoID0gbmF2aWdhdG9yLmxhbmd1YWdlXHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGYpIHt9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChoICE9IG51bGwpIHtcclxuICAgICAgICAgICAgaC5yZXBsYWNlKFwiLVwiLCBcIl9cIik7XHJcbiAgICAgICAgICAgIGQubG9jYWxlID0gaFxyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBkXHJcbn0oKTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZGVwbG95SmF2YTsiLCJ2YXIgUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UnKSxcbiAgICByZXF1ZXN0ID0gcmVxdWlyZSgnYnJvd3Nlci1yZXF1ZXN0Jyk7XG5cbmZ1bmN0aW9uIHByb21pc2VSZXF1ZXN0KG9wdGlvbnMsIHBheWxvYWQpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICByZXF1ZXN0KG9wdGlvbnMsIGZ1bmN0aW9uIChlcnIsIHJlc3BvbnNlLCBib2R5KSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzQ29kZSAhPT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKGJvZHkgJiYgYm9keS5lcnJvcikge1xuICAgICAgICAgICAgICAgICAgICBlcnIgPSBuZXcgRXJyb3IoYm9keS5lcnJvcik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyID0gbmV3IEVycm9yKCdSZXF1ZXN0IGZhaWxlZCB3aXRoIHN0YXR1cyAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICArIHJlc3BvbnNlLnN0YXR1c0NvZGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmVzb2x2ZShib2R5KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gcHJvbWlzZVJlcXVlc3Q7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIGludGVyZmFjZSBUcmFuc3BvcnQge1xuLy9cbi8vICAgICBmdW5jdGlvbiBjb25maWd1cmUoU3RyaW5nIGNvbmZpZykgLT4gUHJvbWlzZSgpXG4vL1xuLy8gICAgIGZ1bmN0aW9uIGVudW1lcmF0ZShCb29sZWFuIHdhaXQpIC0+IFByb21pc2UoW3tcbi8vICAgICAgICAgU3RyaW5nIHBhdGhcbi8vICAgICAgICAgU3RyaW5nIHZlbmRvclxuLy8gICAgICAgICBTdHJpbmcgcHJvZHVjdFxuLy8gICAgICAgICBTdHJpbmcgc2VyaWFsTnVtYmVyXG4vLyAgICAgICAgIFN0cmluZyBzZXNzaW9uXG4vLyAgICAgfV0gZGV2aWNlcylcbi8vXG4vLyAgICAgZnVuY3Rpb24gYWNxdWlyZShTdHJpbmcgcGF0aCkgLT4gUHJvbWlzZShTdHJpbmcgc2Vzc2lvbilcbi8vXG4vLyAgICAgZnVuY3Rpb24gcmVsZWFzZShTdHJpbmcgc2Vzc2lvbikgLT4gUHJvbWlzZSgpXG4vL1xuLy8gICAgIGZ1bmN0aW9uIGNhbGwoU3RyaW5nIHNlc3Npb24sIFN0cmluZyBuYW1lLCBPYmplY3QgZGF0YSkgLT4gUHJvbWlzZSh7XG4vLyAgICAgICAgIFN0cmluZyBuYW1lLFxuLy8gICAgICAgICBPYmplY3QgZGF0YSxcbi8vICAgICB9KVxuLy9cbi8vIH1cblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgSHR0cFRyYW5zcG9ydDogcmVxdWlyZSgnLi90cmFuc3BvcnQvaHR0cCcpLFxuICAgIFBsdWdpblRyYW5zcG9ydDogcmVxdWlyZSgnLi90cmFuc3BvcnQvcGx1Z2luJyksXG4gICAgQXBwbGV0VHJhbnNwb3J0OiByZXF1aXJlKCcuL3RyYW5zcG9ydC9hcHBsZXQnKSxcbiAgICBTZXNzaW9uOiByZXF1aXJlKCcuL3Nlc3Npb24nKSxcbiAgICBpbnN0YWxsZXJzOiByZXF1aXJlKCcuL2luc3RhbGxlcnMnKSxcbiAgICBwbHVnaW46IHJlcXVpcmUoJy4vcGx1Z2luJyksXG4gICAgaHR0cDogcmVxdWlyZSgnLi9odHRwJylcbn07XG4iLCIvLyB2YXIgQlJJREdFX1ZFUlNJT05fVVJMID0gJy9kYXRhL2JyaWRnZS9sYXRlc3QudHh0Jyxcbi8vICAgICBCUklER0VfSU5TVEFMTEVSUyA9IFt7XG4vLyAgICAgICAgIHVybDogJy9kYXRhL2JyaWRnZS8ldmVyc2lvbiUvdHJlem9yLWJyaWRnZS0ldmVyc2lvbiUtd2luNjQubXNpJyxcbi8vICAgICAgICAgbGFiZWw6ICdXaW5kb3dzIDY0LWJpdCcsXG4vLyAgICAgICAgIHBsYXRmb3JtOiAnd2luNjQnXG4vLyAgICAgfSwge1xuLy8gICAgICAgICB1cmw6ICcvZGF0YS9icmlkZ2UvJXZlcnNpb24lL3RyZXpvci1icmlkZ2UtJXZlcnNpb24lLXdpbjMyLm1zaScsXG4vLyAgICAgICAgIGxhYmVsOiAnV2luZG93cyAzMi1iaXQnLFxuLy8gICAgICAgICBwbGF0Zm9ybTogJ3dpbjMyJ1xuLy8gICAgIH0sIHtcbi8vICAgICAgICAgdXJsOiAnL2RhdGEvYnJpZGdlLyV2ZXJzaW9uJS90cmV6b3ItYnJpZGdlLSV2ZXJzaW9uJS5wa2cnLFxuLy8gICAgICAgICBsYWJlbDogJ01hYyBPUyBYJyxcbi8vICAgICAgICAgcGxhdGZvcm06ICdtYWMnXG4vLyAgICAgfSwge1xuLy8gICAgICAgICB1cmw6ICcvZGF0YS9icmlkZ2UvJXZlcnNpb24lL3RyZXpvci1icmlkZ2VfJXZlcnNpb24lX2FtZDY0LmRlYicsXG4vLyAgICAgICAgIGxhYmVsOiAnTGludXggNjQtYml0IChkZWIpJyxcbi8vICAgICAgICAgcGxhdGZvcm06ICdkZWI2NCdcbi8vICAgICB9LCB7XG4vLyAgICAgICAgIHVybDogJy9kYXRhL2JyaWRnZS8ldmVyc2lvbiUvdHJlem9yLWJyaWRnZS0ldmVyc2lvbiUtMS54ODZfNjQucnBtJyxcbi8vICAgICAgICAgbGFiZWw6ICdMaW51eCA2NC1iaXQgKHJwbSknLFxuLy8gICAgICAgICBwbGF0Zm9ybTogJ3JwbTY0J1xuLy8gICAgIH0sIHtcbi8vICAgICAgICAgdXJsOiAnL2RhdGEvYnJpZGdlLyV2ZXJzaW9uJS90cmV6b3ItYnJpZGdlXyV2ZXJzaW9uJV9pMzg2LmRlYicsXG4vLyAgICAgICAgIGxhYmVsOiAnTGludXggMzItYml0IChkZWIpJyxcbi8vICAgICAgICAgcGxhdGZvcm06ICdkZWIzMidcbi8vICAgICB9LCB7XG4vLyAgICAgICAgIHVybDogJy9kYXRhL2JyaWRnZS8ldmVyc2lvbiUvdHJlem9yLWJyaWRnZS0ldmVyc2lvbiUtMS5pMzg2LnJwbScsXG4vLyAgICAgICAgIGxhYmVsOiAnTGludXggMzItYml0IChycG0pJyxcbi8vICAgICAgICAgcGxhdGZvcm06ICdycG0zMidcbi8vICAgICB9XTtcblxudmFyIEJSSURHRV9WRVJTSU9OX1VSTCA9ICcvZGF0YS9wbHVnaW4vbGF0ZXN0LnR4dCcsXG4gICAgQlJJREdFX0lOU1RBTExFUlMgPSBbe1xuICAgICAgICB1cmw6ICcvZGF0YS9wbHVnaW4vJXZlcnNpb24lL0JpdGNvaW5UcmV6b3JQbHVnaW4tJXZlcnNpb24lLm1zaScsXG4gICAgICAgIGxhYmVsOiAnV2luZG93cycsXG4gICAgICAgIHBsYXRmb3JtOiBbJ3dpbjMyJywgJ3dpbjY0J11cbiAgICB9LCB7XG4gICAgICAgIHVybDogJy9kYXRhL3BsdWdpbi8ldmVyc2lvbiUvdHJlem9yLXBsdWdpbi0ldmVyc2lvbiUuZG1nJyxcbiAgICAgICAgbGFiZWw6ICdNYWMgT1MgWCcsXG4gICAgICAgIHBsYXRmb3JtOiAnbWFjJ1xuICAgIH0sIHtcbiAgICAgICAgdXJsOiAnL2RhdGEvcGx1Z2luLyV2ZXJzaW9uJS9icm93c2VyLXBsdWdpbi10cmV6b3JfJXZlcnNpb24lX2FtZDY0LmRlYicsXG4gICAgICAgIGxhYmVsOiAnTGludXggeDg2XzY0IChkZWIpJyxcbiAgICAgICAgcGxhdGZvcm06ICdkZWI2NCdcbiAgICB9LCB7XG4gICAgICAgIHVybDogJy9kYXRhL3BsdWdpbi8ldmVyc2lvbiUvYnJvd3Nlci1wbHVnaW4tdHJlem9yLSV2ZXJzaW9uJS54ODZfNjQucnBtJyxcbiAgICAgICAgbGFiZWw6ICdMaW51eCB4ODZfNjQgKHJwbSknLFxuICAgICAgICBwbGF0Zm9ybTogJ3JwbTY0J1xuICAgIH0sIHtcbiAgICAgICAgdXJsOiAnL2RhdGEvcGx1Z2luLyV2ZXJzaW9uJS9icm93c2VyLXBsdWdpbi10cmV6b3JfJXZlcnNpb24lX2kzODYuZGViJyxcbiAgICAgICAgbGFiZWw6ICdMaW51eCBpMzg2IChkZWIpJyxcbiAgICAgICAgcGxhdGZvcm06ICdkZWIzMidcbiAgICB9LCB7XG4gICAgICAgIHVybDogJy9kYXRhL3BsdWdpbi8ldmVyc2lvbiUvYnJvd3Nlci1wbHVnaW4tdHJlem9yLSV2ZXJzaW9uJS5pMzg2LnJwbScsXG4gICAgICAgIGxhYmVsOiAnTGludXggaTM4NiAocnBtKScsXG4gICAgICAgIHBsYXRmb3JtOiAncnBtMzInXG4gICAgfV07XG5cbi8vIFJldHVybnMgYSBsaXN0IG9mIGJyaWRnZSBpbnN0YWxsZXJzLCB3aXRoIGRvd25sb2FkIFVSTHMgYW5kIGEgbWFyayBvblxuLy8gYnJpZGdlIHByZWZlcnJlZCBmb3IgdGhlIHVzZXIncyBwbGF0Zm9ybS5cbmZ1bmN0aW9uIGluc3RhbGxlcnMob3B0aW9ucykge1xuICAgIHZhciBvID0gb3B0aW9ucyB8fCB7fSxcbiAgICAgICAgYnJpZGdlVXJsID0gby5icmlkZ2VVcmwgfHwgQlJJREdFX1ZFUlNJT05fVVJMLFxuICAgICAgICB2ZXJzaW9uID0gby52ZXJzaW9uIHx8IHJlcXVlc3RVcmkoYnJpZGdlVXJsKS50cmltKCksXG4gICAgICAgIHBsYXRmb3JtID0gby5wbGF0Zm9ybSB8fCBwcmVmZXJyZWRQbGF0Zm9ybSgpO1xuXG4gICAgcmV0dXJuIEJSSURHRV9JTlNUQUxMRVJTLm1hcChmdW5jdGlvbiAoYnJpZGdlKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICAgICAgdXJsOiBicmlkZ2UudXJsLnJlcGxhY2UoLyV2ZXJzaW9uJS9nLCB2ZXJzaW9uKSxcbiAgICAgICAgICAgIGxhYmVsOiBicmlkZ2UubGFiZWwsXG4gICAgICAgICAgICBwbGF0Zm9ybTogYnJpZGdlLnBsYXRmb3JtLFxuICAgICAgICAgICAgcHJlZmVycmVkOiBpc1ByZWZlcnJlZChicmlkZ2UucGxhdGZvcm0pXG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBpc1ByZWZlcnJlZChpbnN0YWxsZXIpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBpbnN0YWxsZXIgPT09ICdzdHJpbmcnKSB7IC8vIHNpbmdsZSBwbGF0Zm9ybVxuICAgICAgICAgICAgcmV0dXJuIGluc3RhbGxlciA9PT0gcGxhdGZvcm07XG4gICAgICAgIH0gZWxzZSB7IC8vIGFueSBvZiBtdWx0aXBsZSBwbGF0Zm9ybXNcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgaW5zdGFsbGVyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluc3RhbGxlcltpXSA9PT0gcGxhdGZvcm0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuZnVuY3Rpb24gcHJlZmVycmVkUGxhdGZvcm0oKSB7XG4gICAgdmFyIHZlciA9IG5hdmlnYXRvci51c2VyQWdlbnQ7XG5cbiAgICBpZiAodmVyLm1hdGNoKC9XaW42NHxXT1c2NC8pKSByZXR1cm4gJ3dpbjY0JztcbiAgICBpZiAodmVyLm1hdGNoKC9XaW4vKSkgcmV0dXJuICd3aW4zMic7XG4gICAgaWYgKHZlci5tYXRjaCgvTWFjLykpIHJldHVybiAnbWFjJztcbiAgICBpZiAodmVyLm1hdGNoKC9MaW51eCBpWzM0NTZdODYvKSlcbiAgICAgICAgcmV0dXJuIHZlci5tYXRjaCgvQ2VudE9TfEZlZG9yYXxNYW5kcml2YXxNYWdlaWF8UmVkIEhhdHxTY2llbnRpZmljfFNVU0UvKVxuICAgICAgICAgICAgPyAncnBtMzInIDogJ2RlYjMyJztcbiAgICBpZiAodmVyLm1hdGNoKC9MaW51eC8pKVxuICAgICAgICByZXR1cm4gdmVyLm1hdGNoKC9DZW50T1N8RmVkb3JhfE1hbmRyaXZhfE1hZ2VpYXxSZWQgSGF0fFNjaWVudGlmaWN8U1VTRS8pXG4gICAgICAgICAgICA/ICdycG02NCcgOiAnZGViNjQnO1xufVxuXG5mdW5jdGlvbiByZXF1ZXN0VXJpKHVybCkge1xuICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuICAgIHJlcS5vcGVuKCdnZXQnLCB1cmwsIGZhbHNlKTtcbiAgICByZXEuc2VuZCgpO1xuXG4gICAgaWYgKHJlcS5zdGF0dXMgIT09IDIwMClcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gR0VUICcgKyB1cmwpO1xuXG4gICAgcmV0dXJuIHJlcS5yZXNwb25zZVRleHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gaW5zdGFsbGVycztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNvbnNvbGUgPSByZXF1aXJlKCdjb25zb2xlJyksXG4gICAgZXh0ZW5kID0gcmVxdWlyZSgnZXh0ZW5kJyksXG4gICAgUHJvbWlzZSA9IHJlcXVpcmUoJ3Byb21pc2UnKTtcblxuLy8gVHJ5IHRvIGxvYWQgYSBwbHVnaW4gd2l0aCBnaXZlbiBvcHRpb25zLCByZXR1cm5zIHByb21pc2UuIEluIGNhc2Ugb2Zcbi8vIHJlamVjdGlvbiwgZXJyIGNvbnRhaW5zIGBpbnN0YWxsZWRgIHByb3BlcnR5LlxubW9kdWxlLmV4cG9ydHMubG9hZCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgdmFyIG8gPSBleHRlbmQob3B0aW9ucywge1xuICAgICAgICAvLyBtaW1ldHlwZSBvZiB0aGUgcGx1Z2luXG4gICAgICAgIG1pbWV0eXBlOiAnYXBwbGljYXRpb24veC1iaXRjb2ludHJlem9ycGx1Z2luJyxcbiAgICAgICAgLy8gbmFtZSBvZiB0aGUgY2FsbGJhY2sgaW4gdGhlIGdsb2JhbCBuYW1lc3BhY2VcbiAgICAgICAgZm5hbWU6ICdfX3RyZXpvclBsdWdpbkxvYWRlZCcsXG4gICAgICAgIC8vIGlkIG9mIHRoZSBwbHVnaW4gZWxlbWVudFxuICAgICAgICBpZDogJ19fdHJlem9yLXBsdWdpbicsXG4gICAgICAgIC8vIHRpbWUgdG8gd2FpdCB1bnRpbCB0aW1lb3V0LCBpbiBtc2VjXG4gICAgICAgIHRpbWVvdXQ6IDUwMFxuICAgIH0pO1xuXG4gICAgLy8gaWYgd2Uga25vdyBmb3Igc3VyZSB0aGF0IHRoZSBwbHVnaW4gaXMgaW5zdGFsbGVkLCB0aW1lb3V0IGFmdGVyXG4gICAgLy8gMTAgc2Vjb25kc1xuICAgIHZhciBpbnN0YWxsZWQgPSBpc0luc3RhbGxlZChvLm1pbWV0eXBlKSxcbiAgICAgICAgdGltZW91dCA9IGluc3RhbGxlZCA/IDEwMDAwIDogby50aW1lb3V0O1xuXG4gICAgLy8gaWYgdGhlIHBsdWdpbiBpcyBhbHJlYWR5IGxvYWRlZCwgdXNlIGl0XG4gICAgdmFyIHBsdWdpbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG8uaWQpO1xuICAgIGlmIChwbHVnaW4pXG4gICAgICAgIHJldHVybiBQcm9taXNlLmZyb20ocGx1Z2luKTtcblxuICAgIC8vIGluamVjdCBvciByZWplY3QgYWZ0ZXIgdGltZW91dFxuICAgIHJldHVybiBQcm9taXNlLnJhY2UoW1xuICAgICAgICBpbmplY3RQbHVnaW4oby5pZCwgby5taW1ldHlwZSwgby5mbmFtZSksXG4gICAgICAgIHJlamVjdEFmdGVyKHRpbWVvdXQsIG5ldyBFcnJvcignTG9hZGluZyB0aW1lZCBvdXQnKSlcbiAgICBdKS5jYXRjaChmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGVyci5pbnN0YWxsZWQgPSBpbnN0YWxsZWQ7XG4gICAgICAgIHRocm93IGVycjtcbiAgICB9KS50aGVuKFxuICAgICAgICBmdW5jdGlvbiAocGx1Z2luKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3RyZXpvcl0gTG9hZGVkIHBsdWdpbiAnICsgcGx1Z2luLnZlcnNpb24pO1xuICAgICAgICAgICAgcmV0dXJuIHBsdWdpbjtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignW3RyZXpvcl0gRmFpbGVkIHRvIGxvYWQgcGx1Z2luOiAnICsgZXJyLm1lc3NhZ2UpO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgKTtcbn07XG5cbi8vIEluamVjdHMgdGhlIHBsdWdpbiBvYmplY3QgaW50byB0aGUgcGFnZSBhbmQgd2FpdHMgdW50aWwgaXQgbG9hZHMuXG5mdW5jdGlvbiBpbmplY3RQbHVnaW4oaWQsIG1pbWV0eXBlLCBmbmFtZSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHZhciBib2R5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ2JvZHknKVswXSxcbiAgICAgICAgICAgIGVsZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICAvLyByZWdpc3RlciBsb2FkIGZ1bmN0aW9uXG4gICAgICAgIHdpbmRvd1tmbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcGx1Z2luID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICAgICAgaWYgKHBsdWdpbilcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBsdWdpbik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcignUGx1Z2luIG5vdCBmb3VuZCcpKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBpbmplY3Qgb2JqZWN0IGVsZW1cbiAgICAgICAgYm9keS5hcHBlbmRDaGlsZChlbGVtKTtcbiAgICAgICAgZWxlbS5pbm5lckhUTUwgPVxuICAgICAgICAgICAgJzxvYmplY3Qgd2lkdGg9XCIxXCIgaGVpZ2h0PVwiMVwiIGlkPVwiJytpZCsnXCIgdHlwZT1cIicrbWltZXR5cGUrJ1wiPicrXG4gICAgICAgICAgICAnIDxwYXJhbSBuYW1lPVwib25sb2FkXCIgdmFsdWU9XCInK2ZuYW1lKydcIiAvPicrXG4gICAgICAgICAgICAnPC9vYmplY3Q+JztcbiAgICB9KTtcbn1cblxuLy8gSWYgZ2l2ZW4gdGltZW91dCwgZ2V0cyByZWplY3RlZCBhZnRlciBuIG1zZWMsIG90aGVyd2lzZSBuZXZlciByZXNvbHZlcy5cbmZ1bmN0aW9uIHJlamVjdEFmdGVyKG1zZWMsIHZhbCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmIChtc2VjID4gMClcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgeyByZWplY3QodmFsKTsgfSwgbXNlYyk7XG4gICAgfSk7XG59XG5cbi8vIFJldHVybnMgdHJ1ZSBpZiBwbHVnaW4gd2l0aCBhIGdpdmVuIG1pbWV0eXBlIGlzIGluc3RhbGxlZC5cbmZ1bmN0aW9uIGlzSW5zdGFsbGVkKG1pbWV0eXBlKSB7XG4gICAgbmF2aWdhdG9yLnBsdWdpbnMucmVmcmVzaChmYWxzZSk7XG4gICAgcmV0dXJuICEhbmF2aWdhdG9yLm1pbWVUeXBlc1ttaW1ldHlwZV07XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciB1dGlsID0gcmVxdWlyZSgndXRpbCcpLFxuICAgIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpLFxuICAgIHVub3JtID0gcmVxdWlyZSgndW5vcm0nKSxcbiAgICBjcnlwdG8gPSByZXF1aXJlKCdjcnlwdG8nKSxcbiAgICBQcm9taXNlID0gcmVxdWlyZSgncHJvbWlzZScpLFxuICAgIEV2ZW50RW1pdHRlciA9IHJlcXVpcmUoJ2V2ZW50cycpLkV2ZW50RW1pdHRlcjtcblxuLy9cbi8vIFRyZXpvciBkZXZpY2Ugc2Vzc2lvbiBoYW5kbGUuIEFjdHMgYXMgYSBldmVudCBlbWl0dGVyLlxuLy9cbi8vIEV2ZW50czpcbi8vXG4vLyAgc2VuZDogdHlwZSwgbWVzc2FnZVxuLy8gIHJlY2VpdmU6IHR5cGUsIG1lc3NhZ2Vcbi8vICBlcnJvcjogZXJyb3Jcbi8vXG4vLyAgYnV0dG9uOiBjb2RlXG4vLyAgcGluOiB0eXBlLCBjYWxsYmFjayhlcnJvciwgcGluKVxuLy8gIHdvcmQ6IGNhbGxiYWNrKGVycm9yLCB3b3JkKVxuLy8gIHBhc3NwaHJhc2U6IGNhbGxiYWNrKGVycm9yLCBwYXNzcGhyYXNlKVxuLy9cbnZhciBTZXNzaW9uID0gZnVuY3Rpb24gKHRyYW5zcG9ydCwgc2Vzc2lvbklkKSB7XG4gICAgdGhpcy5fdHJhbnNwb3J0ID0gdHJhbnNwb3J0O1xuICAgIHRoaXMuX3Nlc3Npb25JZCA9IHNlc3Npb25JZDtcbiAgICB0aGlzLl9lbWl0dGVyID0gdGhpczsgLy8gVE9ETzogZ2V0IGVtaXR0ZXIgYXMgYSBwYXJhbVxufTtcblxudXRpbC5pbmhlcml0cyhTZXNzaW9uLCBFdmVudEVtaXR0ZXIpO1xuXG5TZXNzaW9uLnByb3RvdHlwZS5yZWxlYXNlID0gZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdbdHJlem9yXSBSZWxlYXNpbmcgc2Vzc2lvbicpO1xuICAgIHJldHVybiB0aGlzLl90cmFuc3BvcnQucmVsZWFzZSh0aGlzLl9zZXNzaW9uSWQpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdJbml0aWFsaXplJywgJ0ZlYXR1cmVzJyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5nZXRFbnRyb3B5ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdHZXRFbnRyb3B5JywgJ0VudHJvcHknLCB7XG4gICAgICAgIHNpemU6IHNpemVcbiAgICB9KTtcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLmdldEFkZHJlc3MgPSBmdW5jdGlvbiAoYWRkcmVzc19uLCBjb2luLCBzaG93X2Rpc3BsYXkpIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdHZXRBZGRyZXNzJywgJ0FkZHJlc3MnLCB7XG4gICAgICAgIGFkZHJlc3NfbjogYWRkcmVzc19uLFxuICAgICAgICBjb2luX25hbWU6IGNvaW4uY29pbl9uYW1lLFxuICAgICAgICBzaG93X2Rpc3BsYXk6ICEhc2hvd19kaXNwbGF5XG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgIHJlcy5tZXNzYWdlLnBhdGggPSBhZGRyZXNzX24gfHwgW107XG4gICAgICAgIHJldHVybiByZXM7XG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5nZXRQdWJsaWNLZXkgPSBmdW5jdGlvbiAoYWRkcmVzc19uKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVkQ29tbW9uQ2FsbCgnR2V0UHVibGljS2V5JywgJ1B1YmxpY0tleScsIHtcbiAgICAgICAgYWRkcmVzc19uOiBhZGRyZXNzX25cbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgcmVzLm1lc3NhZ2Uubm9kZS5wYXRoID0gYWRkcmVzc19uIHx8IFtdO1xuICAgICAgICByZXR1cm4gcmVzO1xuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUud2lwZURldmljZSA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbW9uQ2FsbCgnV2lwZURldmljZScpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUucmVzZXREZXZpY2UgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcbiAgICByZXR1cm4gdGhpcy5fY29tbW9uQ2FsbCgnUmVzZXREZXZpY2UnLCBzZXR0aW5ncyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5sb2FkRGV2aWNlID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwoJ0xvYWREZXZpY2UnLCBzZXR0aW5ncyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5yZWNvdmVyRGV2aWNlID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwoJ1JlY292ZXJ5RGV2aWNlJywgc2V0dGluZ3MpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuYXBwbHlTZXR0aW5ncyA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdBcHBseVNldHRpbmdzJywgc2V0dGluZ3MpO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuY2hhbmdlUGluID0gZnVuY3Rpb24gKHJlbW92ZSkge1xuICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdDaGFuZ2VQaW4nLCB7XG4gICAgICAgIHJlbW92ZTogcmVtb3ZlIHx8IGZhbHNlXG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5lcmFzZUZpcm13YXJlID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdGaXJtd2FyZUVyYXNlJyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS51cGxvYWRGaXJtd2FyZSA9IGZ1bmN0aW9uIChwYXlsb2FkKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwoJ0Zpcm13YXJlVXBsb2FkJywge1xuICAgICAgICBwYXlsb2FkOiBwYXlsb2FkXG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS52ZXJpZnlNZXNzYWdlID0gZnVuY3Rpb24gKGFkZHJlc3MsIHNpZ25hdHVyZSwgbWVzc2FnZSkge1xuICAgIHJldHVybiB0aGlzLl9jb21tb25DYWxsKCdWZXJpZnlNZXNzYWdlJywge1xuICAgICAgICBhZGRyZXNzOiBhZGRyZXNzLFxuICAgICAgICBzaWduYXR1cmU6IHNpZ25hdHVyZSxcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZVxuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuc2lnbk1lc3NhZ2UgPSBmdW5jdGlvbiAoYWRkcmVzc19uLCBtZXNzYWdlLCBjb2luKSB7XG4gICAgcmV0dXJuIHRoaXMuX3R5cGVkQ29tbW9uQ2FsbCgnU2lnbk1lc3NhZ2UnLCAnTWVzc2FnZVNpZ25hdHVyZScsIHtcbiAgICAgICAgYWRkcmVzc19uOiBhZGRyZXNzX24sXG4gICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgICAgIGNvaW5fbmFtZTogY29pbi5jb2luX25hbWVcbiAgICB9KTtcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLm1lYXN1cmVUeCA9IGZ1bmN0aW9uIChpbnB1dHMsIG91dHB1dHMsIGNvaW4pIHtcbiAgICByZXR1cm4gdGhpcy5fdHlwZWRDb21tb25DYWxsKCdFc3RpbWF0ZVR4U2l6ZScsICdUeFNpemUnLCB7XG4gICAgICAgIGlucHV0c19jb3VudDogaW5wdXRzLmxlbmd0aCxcbiAgICAgICAgb3V0cHV0c19jb3VudDogb3V0cHV0cy5sZW5ndGgsXG4gICAgICAgIGNvaW5fbmFtZTogY29pbi5jb2luX25hbWVcbiAgICB9KTtcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLnNpbXBsZVNpZ25UeCA9IGZ1bmN0aW9uIChpbnB1dHMsIG91dHB1dHMsIHR4cywgY29pbikge1xuICAgIHJldHVybiB0aGlzLl90eXBlZENvbW1vbkNhbGwoJ1NpbXBsZVNpZ25UeCcsICdUeFJlcXVlc3QnLCB7XG4gICAgICAgIGlucHV0czogaW5wdXRzLFxuICAgICAgICBvdXRwdXRzOiBvdXRwdXRzLFxuICAgICAgICBjb2luX25hbWU6IGNvaW4uY29pbl9uYW1lLFxuICAgICAgICB0cmFuc2FjdGlvbnM6IHR4c1xuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX2luZGV4VHhzRm9yU2lnbiA9IGZ1bmN0aW9uIChpbnB1dHMsIG91dHB1dHMsIHR4cykge1xuICAgIHZhciBpbmRleCA9IHt9O1xuXG4gICAgLy8gVHggYmVpbmcgc2lnbmVkXG4gICAgaW5kZXhbJyddID0ge1xuICAgICAgICBpbnB1dHM6IGlucHV0cyxcbiAgICAgICAgb3V0cHV0czogb3V0cHV0c1xuICAgIH07XG5cbiAgICAvLyBSZWZlcmVuY2VkIHR4c1xuICAgIHR4cy5mb3JFYWNoKGZ1bmN0aW9uICh0eCkge1xuICAgICAgICBpbmRleFt0eC5oYXNoLnRvTG93ZXJDYXNlKCldID0gdHg7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaW5kZXg7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5zaWduVHggPSBmdW5jdGlvbiAoaW5wdXRzLCBvdXRwdXRzLCB0eHMsIGNvaW4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGluZGV4ID0gdGhpcy5faW5kZXhUeHNGb3JTaWduKGlucHV0cywgb3V0cHV0cywgdHhzKSxcbiAgICAgICAgc2lnbmF0dXJlcyA9IFtdLFxuICAgICAgICBzZXJpYWxpemVkVHggPSAnJztcblxuICAgIHJldHVybiB0aGlzLl90eXBlZENvbW1vbkNhbGwoJ1NpZ25UeCcsICdUeFJlcXVlc3QnLCB7XG4gICAgICAgIGlucHV0c19jb3VudDogaW5wdXRzLmxlbmd0aCxcbiAgICAgICAgb3V0cHV0c19jb3VudDogb3V0cHV0cy5sZW5ndGgsXG4gICAgICAgIGNvaW5fbmFtZTogY29pbi5jb2luX25hbWVcbiAgICB9KS50aGVuKHByb2Nlc3MpO1xuXG4gICAgZnVuY3Rpb24gcHJvY2VzcyhyZXMpIHtcbiAgICAgICAgdmFyIG0gPSByZXMubWVzc2FnZSxcbiAgICAgICAgICAgIG1zID0gbS5zZXJpYWxpemVkLFxuICAgICAgICAgICAgbWQgPSBtLmRldGFpbHMsXG4gICAgICAgICAgICByZXFUeCwgcmVzVHg7XG5cbiAgICAgICAgaWYgKG1zICYmIG1zLnNlcmlhbGl6ZWRfdHggIT0gbnVsbClcbiAgICAgICAgICAgIHNlcmlhbGl6ZWRUeCArPSBtcy5zZXJpYWxpemVkX3R4O1xuICAgICAgICBpZiAobXMgJiYgbXMuc2lnbmF0dXJlX2luZGV4ICE9IG51bGwpXG4gICAgICAgICAgICBzaWduYXR1cmVzW21zLnNpZ25hdHVyZV9pbmRleF0gPSBtcy5zaWduYXR1cmU7XG5cbiAgICAgICAgaWYgKG0ucmVxdWVzdF90eXBlID09PSAnVFhGSU5JU0hFRCcpXG4gICAgICAgICAgICByZXR1cm4geyAvLyBzYW1lIGZvcm1hdCBhcyBTaW1wbGVTaWduVHhcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiB7XG4gICAgICAgICAgICAgICAgICAgIHNlcmlhbGl6ZWQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpZ25hdHVyZXM6IHNpZ25hdHVyZXMsXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpYWxpemVkX3R4OiBzZXJpYWxpemVkVHhcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgcmVzVHggPSB7fTtcbiAgICAgICAgcmVxVHggPSBpbmRleFsobWQudHhfaGFzaCB8fCAnJykudG9Mb3dlckNhc2UoKV07XG5cbiAgICAgICAgaWYgKCFyZXFUeClcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihtZC50eF9oYXNoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAoJ1JlcXVlc3RlZCB1bmtub3duIHR4OiAnICsgbWQudHhfaGFzaClcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6ICgnUmVxdWVzdGVkIHR4IGZvciBzaWduaW5nIG5vdCBpbmRleGVkJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgc3dpdGNoIChtLnJlcXVlc3RfdHlwZSkge1xuXG4gICAgICAgIGNhc2UgJ1RYSU5QVVQnOlxuICAgICAgICAgICAgcmVzVHguaW5wdXRzID0gW3JlcVR4LmlucHV0c1srbWQucmVxdWVzdF9pbmRleF1dO1xuICAgICAgICAgICAgYnJlYWs7XG5cbiAgICAgICAgY2FzZSAnVFhPVVRQVVQnOlxuICAgICAgICAgICAgaWYgKG1kLnR4X2hhc2gpXG4gICAgICAgICAgICAgICAgcmVzVHguYmluX291dHB1dHMgPSBbcmVxVHguYmluX291dHB1dHNbK21kLnJlcXVlc3RfaW5kZXhdXTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXNUeC5vdXRwdXRzID0gW3JlcVR4Lm91dHB1dHNbK21kLnJlcXVlc3RfaW5kZXhdXTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgJ1RYTUVUQSc6XG4gICAgICAgICAgICByZXNUeC52ZXJzaW9uID0gcmVxVHgudmVyc2lvbjtcbiAgICAgICAgICAgIHJlc1R4LmxvY2tfdGltZSA9IHJlcVR4LmxvY2tfdGltZTtcbiAgICAgICAgICAgIHJlc1R4LmlucHV0c19jbnQgPSByZXFUeC5pbnB1dHMubGVuZ3RoO1xuICAgICAgICAgICAgaWYgKG1kLnR4X2hhc2gpXG4gICAgICAgICAgICAgICAgcmVzVHgub3V0cHV0c19jbnQgPSByZXFUeC5iaW5fb3V0cHV0cy5sZW5ndGg7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzVHgub3V0cHV0c19jbnQgPSByZXFUeC5vdXRwdXRzLmxlbmd0aDtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gcmVxdWVzdCB0eXBlOiAnICsgbS5yZXF1ZXN0X3R5cGUpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbGYuX3R5cGVkQ29tbW9uQ2FsbCgnVHhBY2snLCAnVHhSZXF1ZXN0Jywge1xuICAgICAgICAgICAgdHg6IHJlc1R4XG4gICAgICAgIH0pLnRoZW4ocHJvY2Vzcyk7XG4gICAgfVxufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX3R5cGVkQ29tbW9uQ2FsbCA9IGZ1bmN0aW9uICh0eXBlLCByZXNUeXBlLCBtc2cpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gdGhpcy5fY29tbW9uQ2FsbCh0eXBlLCBtc2cpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICByZXR1cm4gc2VsZi5fYXNzZXJ0VHlwZShyZXMsIHJlc1R5cGUpO1xuICAgIH0pO1xufTtcblxuU2Vzc2lvbi5wcm90b3R5cGUuX2Fzc2VydFR5cGUgPSBmdW5jdGlvbiAocmVzLCByZXNUeXBlKSB7XG4gICAgaWYgKHJlcy50eXBlICE9PSByZXNUeXBlKVxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdSZXNwb25zZSBvZiB1bmV4cGVjdGVkIHR5cGU6ICcgKyByZXMudHlwZSk7XG4gICAgcmV0dXJuIHJlcztcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLl9jb21tb25DYWxsID0gZnVuY3Rpb24gKHR5cGUsIG1zZykge1xuICAgIHZhciBzZWxmID0gdGhpcyxcbiAgICAgICAgY2FsbHByID0gdGhpcy5fY2FsbCh0eXBlLCBtc2cpO1xuXG4gICAgcmV0dXJuIGNhbGxwci50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX2ZpbHRlckNvbW1vblR5cGVzKHJlcyk7XG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5fZmlsdGVyQ29tbW9uVHlwZXMgPSBmdW5jdGlvbiAocmVzKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKHJlcy50eXBlID09PSAnRmFpbHVyZScpXG4gICAgICAgIHRocm93IHJlcy5tZXNzYWdlO1xuXG4gICAgaWYgKHJlcy50eXBlID09PSAnQnV0dG9uUmVxdWVzdCcpIHtcbiAgICAgICAgdGhpcy5fZW1pdHRlci5lbWl0KCdidXR0b24nLCByZXMubWVzc2FnZS5jb2RlKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwoJ0J1dHRvbkFjaycpO1xuICAgIH1cblxuICAgIGlmIChyZXMudHlwZSA9PT0gJ0VudHJvcHlSZXF1ZXN0JylcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NvbW1vbkNhbGwoJ0VudHJvcHlBY2snLCB7XG4gICAgICAgICAgICBlbnRyb3B5OiBzdHJpbmdUb0hleCh0aGlzLl9nZW5lcmF0ZUVudHJvcHkoMzIpKVxuICAgICAgICB9KTtcblxuICAgIGlmIChyZXMudHlwZSA9PT0gJ1Bpbk1hdHJpeFJlcXVlc3QnKVxuICAgICAgICByZXR1cm4gdGhpcy5fcHJvbXB0UGluKHJlcy5tZXNzYWdlLnR5cGUpLnRoZW4oXG4gICAgICAgICAgICBmdW5jdGlvbiAocGluKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2NvbW1vbkNhbGwoJ1Bpbk1hdHJpeEFjaycsIHsgcGluOiBwaW4gfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9jb21tb25DYWxsKCdDYW5jZWwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgIGlmIChyZXMudHlwZSA9PT0gJ1Bhc3NwaHJhc2VSZXF1ZXN0JylcbiAgICAgICAgcmV0dXJuIHRoaXMuX3Byb21wdFBhc3NwaHJhc2UoKS50aGVuKFxuICAgICAgICAgICAgZnVuY3Rpb24gKHBhc3NwaHJhc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5fY29tbW9uQ2FsbCgnUGFzc3BocmFzZUFjaycsIHsgcGFzc3BocmFzZTogcGFzc3BocmFzZSB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2NvbW1vbkNhbGwoJ0NhbmNlbCcpLnRoZW4obnVsbCwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgZXJyIHx8IGU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG5cbiAgICBpZiAocmVzLnR5cGUgPT09ICdXb3JkUmVxdWVzdCcpXG4gICAgICAgIHJldHVybiB0aGlzLl9wcm9tcHRXb3JkKCkudGhlbihcbiAgICAgICAgICAgIGZ1bmN0aW9uICh3b3JkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2NvbW1vbkNhbGwoJ1dvcmRBY2snLCB7IHdvcmQ6IHdvcmQgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9jb21tb25DYWxsKCdDYW5jZWwnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcblxuICAgIHJldHVybiByZXM7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5fcHJvbXB0UGluID0gZnVuY3Rpb24gKHR5cGUpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIXNlbGYuX2VtaXR0ZXIuZW1pdCgncGluJywgdHlwZSwgZnVuY3Rpb24gKGVyciwgcGluKSB7XG4gICAgICAgICAgICBpZiAoZXJyIHx8IHBpbiA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc29sdmUocGluKTtcbiAgICAgICAgfSkpIHtcbiAgICAgICAgICAgIGNvbnNvbGUud2FybignW3RyZXpvcl0gUElOIGNhbGxiYWNrIG5vdCBjb25maWd1cmVkLCBjYW5jZWxsaW5nIHJlcXVlc3QnKTtcbiAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5fcHJvbXB0UGFzc3BocmFzZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoIXNlbGYuX2VtaXR0ZXIuZW1pdCgncGFzc3BocmFzZScsIGZ1bmN0aW9uIChlcnIsIHBhc3NwaHJhc2UpIHtcbiAgICAgICAgICAgIGlmIChlcnIgfHwgcGFzc3BocmFzZSA9PSBudWxsKVxuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJlc29sdmUocGFzc3BocmFzZS5ub3JtYWxpemUoJ05GS0QnKSk7XG4gICAgICAgIH0pKSB7XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ1t0cmV6b3JdIFBhc3NwaHJhc2UgY2FsbGJhY2sgbm90IGNvbmZpZ3VyZWQsIGNhbmNlbGxpbmcgcmVxdWVzdCcpO1xuICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cblNlc3Npb24ucHJvdG90eXBlLl9wcm9tcHRXb3JkID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmICghc2VsZi5fZW1pdHRlci5lbWl0KCd3b3JkJywgZnVuY3Rpb24gKGVyciwgd29yZCkge1xuICAgICAgICAgICAgaWYgKGVyciB8fCB3b3JkID09IG51bGwpXG4gICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh3b3JkLnRvTG9jYWxlTG93ZXJDYXNlKCkpO1xuICAgICAgICB9KSkge1xuICAgICAgICAgICAgY29uc29sZS53YXJuKCdbdHJlem9yXSBXb3JkIGNhbGxiYWNrIG5vdCBjb25maWd1cmVkLCBjYW5jZWxsaW5nIHJlcXVlc3QnKTtcbiAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5fZ2VuZXJhdGVFbnRyb3B5ID0gZnVuY3Rpb24gKGxlbikge1xuICAgIHJldHVybiBjcnlwdG8ucmFuZG9tQnl0ZXMobGVuKS50b1N0cmluZygnYmluYXJ5Jyk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5fY2FsbCA9IGZ1bmN0aW9uICh0eXBlLCBtc2cpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXMsXG4gICAgICAgIGxvZ01lc3NhZ2U7XG5cbiAgICBtc2cgPSBtc2cgfHwge307XG4gICAgbG9nTWVzc2FnZSA9IHRoaXMuX2ZpbHRlckZvckxvZyh0eXBlLCBtc2cpO1xuXG4gICAgY29uc29sZS5sb2coJ1t0cmV6b3JdIFNlbmRpbmcnLCB0eXBlLCBsb2dNZXNzYWdlKTtcbiAgICB0aGlzLl9lbWl0dGVyLmVtaXQoJ3NlbmQnLCB0eXBlLCBtc2cpO1xuXG4gICAgcmV0dXJuIHRoaXMuX3RyYW5zcG9ydC5jYWxsKHRoaXMuX3Nlc3Npb25JZCwgdHlwZSwgbXNnKS50aGVuKFxuICAgICAgICBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICB2YXIgbG9nTWVzc2FnZSA9IHNlbGYuX2ZpbHRlckZvckxvZyhyZXMudHlwZSwgcmVzLm1lc3NhZ2UpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnW3RyZXpvcl0gUmVjZWl2ZWQnLCByZXMudHlwZSwgbG9nTWVzc2FnZSk7XG4gICAgICAgICAgICBzZWxmLl9lbWl0dGVyLmVtaXQoJ3JlY2VpdmUnLCByZXMudHlwZSwgcmVzLm1lc3NhZ2UpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcztcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1t0cmV6b3JkXSBSZWNlaXZlZCBlcnJvcicsIGVycik7XG4gICAgICAgICAgICBzZWxmLl9lbWl0dGVyLmVtaXQoJ2Vycm9yJywgZXJyKTtcbiAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgfVxuICAgICk7XG59O1xuXG5TZXNzaW9uLnByb3RvdHlwZS5fZmlsdGVyRm9yTG9nID0gZnVuY3Rpb24gKHR5cGUsIG1zZykge1xuICAgIHZhciByZWRhY3RlZCA9IHt9LFxuICAgICAgICBibGFja2xpc3QgPSB7XG4gICAgICAgICAgICBQYXNzcGhyYXNlQWNrOiB7XG4gICAgICAgICAgICAgICAgcGFzc3BocmFzZTogJyhyZWRhY3RlZC4uLiknXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICByZXR1cm4gZXh0ZW5kKHJlZGFjdGVkLCBtc2csIGJsYWNrbGlzdFt0eXBlXSB8fCB7fSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlc3Npb247XG5cbi8vXG4vLyBIZXggY29kZWNcbi8vXG5cbi8vIEVuY29kZSBiaW5hcnkgc3RyaW5nIHRvIGhleCBzdHJpbmdcbmZ1bmN0aW9uIHN0cmluZ1RvSGV4KGJpbikge1xuICAgIHZhciBpLCBjaHIsIGhleCA9ICcnO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGJpbi5sZW5ndGg7IGkrKykge1xuICAgICAgICBjaHIgPSAoYmluLmNoYXJDb2RlQXQoaSkgJiAweEZGKS50b1N0cmluZygxNik7XG4gICAgICAgIGhleCArPSBjaHIubGVuZ3RoIDwgMiA/ICcwJyArIGNociA6IGNocjtcbiAgICB9XG5cbiAgICByZXR1cm4gaGV4O1xufVxuXG4vLyBEZWNvZGUgaGV4IHN0cmluZyB0byBiaW5hcnkgc3RyaW5nXG5mdW5jdGlvbiBoZXhUb1N0cmluZyhoZXgpIHtcbiAgICB2YXIgaSwgYnl0ZXMgPSBbXTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBoZXgubGVuZ3RoIC0gMTsgaSArPSAyKVxuICAgICAgICBieXRlcy5wdXNoKHBhcnNlSW50KGhleC5zdWJzdHIoaSwgMiksIDE2KSk7XG5cbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGJ5dGVzKTtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFByb21pc2UgPSByZXF1aXJlKCdwcm9taXNlJyksXG4gICAgYXBwbGV0XyA9IHJlcXVpcmUoJy4uL2FwcGxldCcpLFxuICAgIHRyYXZlcnNlID0gcmVxdWlyZSgndHJhdmVyc2UnKVxuLy9cbi8vIEFwcGxldCB0cmFuc3BvcnQuXG4vL1xudmFyIEFwcGxldFRyYW5zcG9ydCA9IGZ1bmN0aW9uIChhcHBsZXQpIHtcbiAgICB0aGlzLl9hcHBsZXQgPSBhcHBsZXQ7XG59O1xuXG4vLyBJbmplY3RzIHRoZSBhcHBsZXQgb2JqZWN0IGludG8gdGhlIGRvY3VtZW50LlxuQXBwbGV0VHJhbnNwb3J0LmxvYWRBcHBsZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIGFwcGxldF8ubG9hZCgpO1xufTtcblxuLy8gQklQMzIgQ0tEIGRlcml2YXRpb24gb2YgdGhlIGdpdmVuIGluZGV4XG4vKlxuQXBwbGV0VHJhbnNwb3J0LnByb3RvdHlwZS5kZXJpdmVDaGlsZE5vZGUgPSBmdW5jdGlvbiAobm9kZSwgaW5kZXgpIHtcbiAgICB2YXIgY2hpbGQgPSB0aGlzLl9hcHBsZXQuZGVyaXZlQ2hpbGROb2RlKG5vZGUsIGluZGV4KTtcblxuICAgIGlmIChub2RlLnBhdGgpIHtcbiAgICAgICAgY2hpbGQucGF0aCA9IG5vZGUucGF0aC5jb25jYXQoW2luZGV4XSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNoaWxkO1xufTtcbiovXG5cbi8vIENvbmZpZ3VyZXMgdGhlIGFwcGxldC5cbkFwcGxldFRyYW5zcG9ydC5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHZhciBhcHBsZXQgPSB0aGlzLl9hcHBsZXQ7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXBwbGV0LmNvbmZpZ3VyZShjb25maWcpO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAvLyBJbiBtb3N0IGJyb3dzZXJzLCBleGNlcHRpb25zIGZyb20gYXBwbGV0IG1ldGhvZHMgYXJlIG5vdCBwcm9wZXJseVxuICAgICAgICAgICAgLy8gcHJvcGFnYXRlZFxuICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICAnQXBwbGV0IGNvbmZpZ3VyYXRpb24gZm91bmQsIGJ1dCBjb3VsZCBub3QgYmUgdXNlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdNYWtlIHN1cmUgaXQgaGFzIHByb3BlciBmb3JtYXQgYW5kIGEgdmFsaWQgc2lnbmF0dXJlLidcbiAgICAgICAgICAgICkpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG4vLyBFbnVtZXJhdGVzIGNvbm5lY3RlZCBkZXZpY2VzLlxuLy8gUmVxdWlyZXMgY29uZmlndXJlZCBhcHBsZXQuXG5BcHBsZXRUcmFuc3BvcnQucHJvdG90eXBlLmVudW1lcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYXBwbGV0ID0gdGhpcy5fYXBwbGV0O1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZShhcHBsZXQuZGV2aWNlcygpKSk7XG4gICAgfSk7XG59O1xuXG4vLyBPcGVucyBhIGRldmljZSBhbmQgcmV0dXJucyBhIHNlc3Npb24gb2JqZWN0LlxuQXBwbGV0VHJhbnNwb3J0LnByb3RvdHlwZS5hY3F1aXJlID0gZnVuY3Rpb24gKGRldmljZSkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgICAgICBzZXNzaW9uOiBkZXZpY2VcbiAgICB9KTtcbn07XG5cbi8vIFJlbGVhc2VzIHRoZSBkZXZpY2UgaGFuZGxlLlxuQXBwbGV0VHJhbnNwb3J0LnByb3RvdHlwZS5yZWxlYXNlID0gZnVuY3Rpb24gKGRldmljZSkge1xuICAgIHZhciBhcHBsZXQgPSB0aGlzLl9hcHBsZXQ7XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBhcHBsZXQuY2xvc2UoSlNPTi5zdHJpbmdpZnkoZGV2aWNlKSwge1xuICAgICAgICAgICAgc3VjY2VzczogcmVzb2x2ZSxcbiAgICAgICAgICAgIGVycm9yOiByZWplY3RcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vLyBEb2VzIGEgcmVxdWVzdC1yZXNwb25zZSBjYWxsIHRvIHRoZSBkZXZpY2UuXG5BcHBsZXRUcmFuc3BvcnQucHJvdG90eXBlLmNhbGwgPSBmdW5jdGlvbiAoZGV2aWNlLCB0eXBlLCBtZXNzYWdlKSB7XG4gICAgdmFyIGFwcGxldCA9IHRoaXMuX2FwcGxldCxcbiAgICAgICAgdGltZW91dCA9IGZhbHNlO1xuXG4gICAgLy8gQml0Y29pblRyZXpvckFwcGxldCBoYXMgYSBidWcsIGNhdXNpbmcgZGlmZmVyZW50IHRyZWF0bWVudCBvZlxuICAgIC8vIHVuZGVmaW5lZCBmaWVsZHMgaW4gbWVzc2FnZXMuIFdlIG5lZWQgdG8gZmluZCBhbGwgdW5kZWZpbmVkIGZpZWxkc1xuICAgIC8vIGFuZCByZW1vdmUgdGhlbSBmcm9tIHRoZSBtZXNzYWdlIG9iamVjdC4gYHRyYXZlcnNlYCB3aWxsIGRlbGV0ZVxuICAgIC8vIG9iamVjdCBmaWVsZHMgYW5kIHNwbGljZSBvdXQgYXJyYXkgaXRlbXMgcHJvcGVybHkuXG4gICAgdHJhdmVyc2UobWVzc2FnZSkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICAvLyBKU09OLnN0cmluZ2lmeSB3aWxsIGNvbnRhaW4gJCRoYXNoS2V5XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgYXBwbGV0LmNhbGwoSlNPTi5zdHJpbmdpZnkoZGV2aWNlKSwgdGltZW91dCwgdHlwZSwgYW5ndWxhci50b0pzb24obWVzc2FnZSksIHtcbiAgICAgICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uICh0LCBtKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHQsXG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6IEpTT04ucGFyc2UobSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlcnJvcjogZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHBsZXRUcmFuc3BvcnQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBleHRlbmQgPSByZXF1aXJlKCdleHRlbmQnKSxcbiAgICBodHRwID0gcmVxdWlyZSgnLi4vaHR0cCcpO1xuXG4vL1xuLy8gSFRUUCB0cmFuc3BvcnQuXG4vL1xudmFyIEh0dHBUcmFuc3BvcnQgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgdGhpcy5fdXJsID0gdXJsO1xufTtcblxuSHR0cFRyYW5zcG9ydC5jb25uZWN0ID0gZnVuY3Rpb24gKHVybCkge1xuICAgIHJldHVybiBodHRwKHtcbiAgICAgICAgdXJsOiB1cmwsIGpzb246IHRydWVcbiAgICB9KTtcbn07XG5cbkh0dHBUcmFuc3BvcnQucHJvdG90eXBlLl9yZXF1ZXN0ID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gaHR0cChleHRlbmQob3B0aW9ucywge1xuICAgICAgICB1cmw6IHRoaXMuX3VybCArIG9wdGlvbnMudXJsXG4gICAgfSkpO1xufTtcblxuSHR0cFRyYW5zcG9ydC5wcm90b3R5cGUuY29uZmlndXJlID0gZnVuY3Rpb24gKGNvbmZpZykge1xuICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsIHVybDogJy9jb25maWd1cmUnLCBib2R5OiBjb25maWcsIGpzb246IHRydWVcbiAgICB9KTtcbn07XG5cbkh0dHBUcmFuc3BvcnQucHJvdG90eXBlLmVudW1lcmF0ZSA9IGZ1bmN0aW9uICh3YWl0KSB7XG4gICAgcmV0dXJuIHRoaXMuX3JlcXVlc3Qoe1xuICAgICAgICBtZXRob2Q6ICdHRVQnLCB1cmw6IHdhaXQgPyAnL2xpc3RlbicgOiAnL2VudW1lcmF0ZScsIGpzb246IHRydWVcbiAgICB9KTtcbn07XG5cbkh0dHBUcmFuc3BvcnQucHJvdG90eXBlLmFjcXVpcmUgPSBmdW5jdGlvbiAoZGV2aWNlKSB7XG4gICAgdmFyIHBhdGggPSBkZXZpY2UucGF0aDsgLy8gVE9ETzogdGFrZSBqdXN0IHBhdGhcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLCB1cmw6ICcvYWNxdWlyZS8nICsgcGF0aCwganNvbjogdHJ1ZVxuICAgIH0pO1xufTtcblxuSHR0cFRyYW5zcG9ydC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uIChzZXNzaW9uSWQpIHtcbiAgICByZXR1cm4gdGhpcy5fcmVxdWVzdCh7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLCB1cmw6ICcvcmVsZWFzZS8nICsgc2Vzc2lvbklkLCBqc29uOiB0cnVlXG4gICAgfSk7XG59O1xuXG5IdHRwVHJhbnNwb3J0LnByb3RvdHlwZS5jYWxsID0gZnVuY3Rpb24gKHNlc3Npb25JZCwgdHlwZSwgbWVzc2FnZSkge1xuICAgIHJldHVybiB0aGlzLl9yZXF1ZXN0KHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsIHVybDogJy9jYWxsLycgKyBzZXNzaW9uSWQsIGpzb246IHtcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBtZXNzYWdlOiBtZXNzYWdlXG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gSHR0cFRyYW5zcG9ydDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFByb21pc2UgPSByZXF1aXJlKCdwcm9taXNlJyksXG4gICAgcGx1Z2luXyA9IHJlcXVpcmUoJy4uL3BsdWdpbicpLFxuICAgIHRyYXZlcnNlID0gcmVxdWlyZSgndHJhdmVyc2UnKTtcblxuLy9cbi8vIFBsdWdpbiB0cmFuc3BvcnQuXG4vL1xudmFyIFBsdWdpblRyYW5zcG9ydCA9IGZ1bmN0aW9uIChwbHVnaW4pIHtcbiAgICB0aGlzLl9wbHVnaW4gPSBwbHVnaW47XG59O1xuXG4vLyBJbmplY3RzIHRoZSBwbHVnaW4gb2JqZWN0IGludG8gdGhlIGRvY3VtZW50LlxuUGx1Z2luVHJhbnNwb3J0LmxvYWRQbHVnaW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHBsdWdpbl8ubG9hZCgpO1xufTtcblxuLy8gQklQMzIgQ0tEIGRlcml2YXRpb24gb2YgdGhlIGdpdmVuIGluZGV4XG5QbHVnaW5UcmFuc3BvcnQucHJvdG90eXBlLmRlcml2ZUNoaWxkTm9kZSA9IGZ1bmN0aW9uIChub2RlLCBpbmRleCkge1xuICAgIHZhciBjaGlsZCA9IHRoaXMuX3BsdWdpbi5kZXJpdmVDaGlsZE5vZGUobm9kZSwgaW5kZXgpO1xuXG4gICAgaWYgKG5vZGUucGF0aCkge1xuICAgICAgICBjaGlsZC5wYXRoID0gbm9kZS5wYXRoLmNvbmNhdChbaW5kZXhdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hpbGQ7XG59O1xuXG4vLyBDb25maWd1cmVzIHRoZSBwbHVnaW4uXG5QbHVnaW5UcmFuc3BvcnQucHJvdG90eXBlLmNvbmZpZ3VyZSA9IGZ1bmN0aW9uIChjb25maWcpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5fcGx1Z2luO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHBsdWdpbi5jb25maWd1cmUoY29uZmlnKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgLy8gSW4gbW9zdCBicm93c2VycywgZXhjZXB0aW9ucyBmcm9tIHBsdWdpbiBtZXRob2RzIGFyZSBub3QgcHJvcGVybHlcbiAgICAgICAgICAgIC8vIHByb3BhZ2F0ZWRcbiAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgJ1BsdWdpbiBjb25maWd1cmF0aW9uIGZvdW5kLCBidXQgY291bGQgbm90IGJlIHVzZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnTWFrZSBzdXJlIGl0IGhhcyBwcm9wZXIgZm9ybWF0IGFuZCBhIHZhbGlkIHNpZ25hdHVyZS4nXG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuLy8gRW51bWVyYXRlcyBjb25uZWN0ZWQgZGV2aWNlcy5cbi8vIFJlcXVpcmVzIGNvbmZpZ3VyZWQgcGx1Z2luLlxuUGx1Z2luVHJhbnNwb3J0LnByb3RvdHlwZS5lbnVtZXJhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuX3BsdWdpbjtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuICAgICAgICByZXNvbHZlKHBsdWdpbi5kZXZpY2VzKCkpO1xuICAgIH0pO1xufTtcblxuLy8gT3BlbnMgYSBkZXZpY2UgYW5kIHJldHVybnMgYSBzZXNzaW9uIG9iamVjdC5cblBsdWdpblRyYW5zcG9ydC5wcm90b3R5cGUuYWNxdWlyZSA9IGZ1bmN0aW9uIChkZXZpY2UpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICAgICAgc2Vzc2lvbjogZGV2aWNlXG4gICAgfSk7XG59O1xuXG4vLyBSZWxlYXNlcyB0aGUgZGV2aWNlIGhhbmRsZS5cblBsdWdpblRyYW5zcG9ydC5wcm90b3R5cGUucmVsZWFzZSA9IGZ1bmN0aW9uIChkZXZpY2UpIHtcbiAgICB2YXIgcGx1Z2luID0gdGhpcy5fcGx1Z2luO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcGx1Z2luLmNsb3NlKGRldmljZSwge1xuICAgICAgICAgICAgc3VjY2VzczogcmVzb2x2ZSxcbiAgICAgICAgICAgIGVycm9yOiByZWplY3RcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG4vLyBEb2VzIGEgcmVxdWVzdC1yZXNwb25zZSBjYWxsIHRvIHRoZSBkZXZpY2UuXG5QbHVnaW5UcmFuc3BvcnQucHJvdG90eXBlLmNhbGwgPSBmdW5jdGlvbiAoZGV2aWNlLCB0eXBlLCBtZXNzYWdlKSB7XG4gICAgdmFyIHBsdWdpbiA9IHRoaXMuX3BsdWdpbixcbiAgICAgICAgdGltZW91dCA9IGZhbHNlO1xuXG4gICAgLy8gQml0Y29pblRyZXpvclBsdWdpbiBoYXMgYSBidWcsIGNhdXNpbmcgZGlmZmVyZW50IHRyZWF0bWVudCBvZlxuICAgIC8vIHVuZGVmaW5lZCBmaWVsZHMgaW4gbWVzc2FnZXMuIFdlIG5lZWQgdG8gZmluZCBhbGwgdW5kZWZpbmVkIGZpZWxkc1xuICAgIC8vIGFuZCByZW1vdmUgdGhlbSBmcm9tIHRoZSBtZXNzYWdlIG9iamVjdC4gYHRyYXZlcnNlYCB3aWxsIGRlbGV0ZVxuICAgIC8vIG9iamVjdCBmaWVsZHMgYW5kIHNwbGljZSBvdXQgYXJyYXkgaXRlbXMgcHJvcGVybHkuXG4gICAgdHJhdmVyc2UobWVzc2FnZSkuZm9yRWFjaChmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIHBsdWdpbi5jYWxsKGRldmljZSwgdGltZW91dCwgdHlwZSwgbWVzc2FnZSwge1xuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24gKHQsIG0pIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdCxcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogbVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVycm9yOiBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihlcnIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBsdWdpblRyYW5zcG9ydDtcbiIsIi8qIVxuICAqIEJvd3NlciAtIGEgYnJvd3NlciBkZXRlY3RvclxuICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9kZWQvYm93c2VyXG4gICogTUlUIExpY2Vuc2UgfCAoYykgRHVzdGluIERpYXogMjAxNFxuICAqL1xuXG4hZnVuY3Rpb24gKG5hbWUsIGRlZmluaXRpb24pIHtcbiAgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIG1vZHVsZS5leHBvcnRzWydicm93c2VyJ10gPSBkZWZpbml0aW9uKClcbiAgZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIGRlZmluZShkZWZpbml0aW9uKVxuICBlbHNlIHRoaXNbbmFtZV0gPSBkZWZpbml0aW9uKClcbn0oJ2Jvd3NlcicsIGZ1bmN0aW9uICgpIHtcbiAgLyoqXG4gICAgKiBTZWUgdXNlcmFnZW50cy5qcyBmb3IgZXhhbXBsZXMgb2YgbmF2aWdhdG9yLnVzZXJBZ2VudFxuICAgICovXG5cbiAgdmFyIHQgPSB0cnVlXG5cbiAgZnVuY3Rpb24gZGV0ZWN0KHVhKSB7XG5cbiAgICBmdW5jdGlvbiBnZXRGaXJzdE1hdGNoKHJlZ2V4KSB7XG4gICAgICB2YXIgbWF0Y2ggPSB1YS5tYXRjaChyZWdleCk7XG4gICAgICByZXR1cm4gKG1hdGNoICYmIG1hdGNoLmxlbmd0aCA+IDEgJiYgbWF0Y2hbMV0pIHx8ICcnO1xuICAgIH1cblxuICAgIHZhciBpb3NkZXZpY2UgPSBnZXRGaXJzdE1hdGNoKC8oaXBvZHxpcGhvbmV8aXBhZCkvaSkudG9Mb3dlckNhc2UoKVxuICAgICAgLCBsaWtlQW5kcm9pZCA9IC9saWtlIGFuZHJvaWQvaS50ZXN0KHVhKVxuICAgICAgLCBhbmRyb2lkID0gIWxpa2VBbmRyb2lkICYmIC9hbmRyb2lkL2kudGVzdCh1YSlcbiAgICAgICwgdmVyc2lvbklkZW50aWZpZXIgPSBnZXRGaXJzdE1hdGNoKC92ZXJzaW9uXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgLCB0YWJsZXQgPSAvdGFibGV0L2kudGVzdCh1YSlcbiAgICAgICwgbW9iaWxlID0gIXRhYmxldCAmJiAvW14tXW1vYmkvaS50ZXN0KHVhKVxuICAgICAgLCByZXN1bHRcblxuICAgIGlmICgvb3BlcmF8b3ByL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ09wZXJhJ1xuICAgICAgLCBvcGVyYTogdFxuICAgICAgLCB2ZXJzaW9uOiB2ZXJzaW9uSWRlbnRpZmllciB8fCBnZXRGaXJzdE1hdGNoKC8oPzpvcGVyYXxvcHIpW1xcc1xcL10oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC93aW5kb3dzIHBob25lL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1dpbmRvd3MgUGhvbmUnXG4gICAgICAsIHdpbmRvd3NwaG9uZTogdFxuICAgICAgLCBtc2llOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL2llbW9iaWxlXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvbXNpZXx0cmlkZW50L2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ludGVybmV0IEV4cGxvcmVyJ1xuICAgICAgLCBtc2llOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goLyg/Om1zaWUgfHJ2OikoXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9jaHJvbWV8Y3Jpb3N8Y3Jtby9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdDaHJvbWUnXG4gICAgICAsIGNocm9tZTogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzpjaHJvbWV8Y3Jpb3N8Y3JtbylcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGlvc2RldmljZSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lIDogaW9zZGV2aWNlID09ICdpcGhvbmUnID8gJ2lQaG9uZScgOiBpb3NkZXZpY2UgPT0gJ2lwYWQnID8gJ2lQYWQnIDogJ2lQb2QnXG4gICAgICB9XG4gICAgICAvLyBXVEY6IHZlcnNpb24gaXMgbm90IHBhcnQgb2YgdXNlciBhZ2VudCBpbiB3ZWIgYXBwc1xuICAgICAgaWYgKHZlcnNpb25JZGVudGlmaWVyKSB7XG4gICAgICAgIHJlc3VsdC52ZXJzaW9uID0gdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3NhaWxmaXNoL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhaWxmaXNoJ1xuICAgICAgLCBzYWlsZmlzaDogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC9zYWlsZmlzaFxccz9icm93c2VyXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmICgvc2VhbW9ua2V5XFwvL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NlYU1vbmtleSdcbiAgICAgICwgc2VhbW9ua2V5OiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3NlYW1vbmtleVxcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2ZpcmVmb3h8aWNld2Vhc2VsL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0ZpcmVmb3gnXG4gICAgICAsIGZpcmVmb3g6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvKD86ZmlyZWZveHxpY2V3ZWFzZWwpWyBcXC9dKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfVxuICAgICAgaWYgKC9cXCgobW9iaWxlfHRhYmxldCk7W15cXCldKnJ2OltcXGRcXC5dK1xcKS9pLnRlc3QodWEpKSB7XG4gICAgICAgIHJlc3VsdC5maXJlZm94b3MgPSB0XG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC9zaWxrL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9ICB7XG4gICAgICAgIG5hbWU6ICdBbWF6b24gU2lsaydcbiAgICAgICwgc2lsazogdFxuICAgICAgLCB2ZXJzaW9uIDogZ2V0Rmlyc3RNYXRjaCgvc2lsa1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnQW5kcm9pZCdcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXJcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL3BoYW50b20vaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0ID0ge1xuICAgICAgICBuYW1lOiAnUGhhbnRvbUpTJ1xuICAgICAgLCBwaGFudG9tOiB0XG4gICAgICAsIHZlcnNpb246IGdldEZpcnN0TWF0Y2goL3BoYW50b21qc1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAoL2JsYWNrYmVycnl8XFxiYmJcXGQrL2kudGVzdCh1YSkgfHwgL3JpbVxcc3RhYmxldC9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdCbGFja0JlcnJ5J1xuICAgICAgLCBibGFja2JlcnJ5OiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyIHx8IGdldEZpcnN0TWF0Y2goL2JsYWNrYmVycnlbXFxkXStcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKC8od2VifGhwdylvcy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQgPSB7XG4gICAgICAgIG5hbWU6ICdXZWJPUydcbiAgICAgICwgd2Vib3M6IHRcbiAgICAgICwgdmVyc2lvbjogdmVyc2lvbklkZW50aWZpZXIgfHwgZ2V0Rmlyc3RNYXRjaCgvdyg/OmViKT9vc2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpXG4gICAgICB9O1xuICAgICAgL3RvdWNocGFkXFwvL2kudGVzdCh1YSkgJiYgKHJlc3VsdC50b3VjaHBhZCA9IHQpXG4gICAgfVxuICAgIGVsc2UgaWYgKC9iYWRhL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ0JhZGEnXG4gICAgICAsIGJhZGE6IHRcbiAgICAgICwgdmVyc2lvbjogZ2V0Rmlyc3RNYXRjaCgvZG9sZmluXFwvKFxcZCsoXFwuXFxkKyk/KS9pKVxuICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoL3RpemVuL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1RpemVuJ1xuICAgICAgLCB0aXplbjogdFxuICAgICAgLCB2ZXJzaW9uOiBnZXRGaXJzdE1hdGNoKC8oPzp0aXplblxccz8pP2Jyb3dzZXJcXC8oXFxkKyhcXC5cXGQrKT8pL2kpIHx8IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICgvc2FmYXJpL2kudGVzdCh1YSkpIHtcbiAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgbmFtZTogJ1NhZmFyaSdcbiAgICAgICwgc2FmYXJpOiB0XG4gICAgICAsIHZlcnNpb246IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgcmVzdWx0ID0ge31cblxuICAgIC8vIHNldCB3ZWJraXQgb3IgZ2Vja28gZmxhZyBmb3IgYnJvd3NlcnMgYmFzZWQgb24gdGhlc2UgZW5naW5lc1xuICAgIGlmICgvKGFwcGxlKT93ZWJraXQvaS50ZXN0KHVhKSkge1xuICAgICAgcmVzdWx0Lm5hbWUgPSByZXN1bHQubmFtZSB8fCBcIldlYmtpdFwiXG4gICAgICByZXN1bHQud2Via2l0ID0gdFxuICAgICAgaWYgKCFyZXN1bHQudmVyc2lvbiAmJiB2ZXJzaW9uSWRlbnRpZmllcikge1xuICAgICAgICByZXN1bHQudmVyc2lvbiA9IHZlcnNpb25JZGVudGlmaWVyXG4gICAgICB9XG4gICAgfSBlbHNlIGlmICghcmVzdWx0Lm9wZXJhICYmIC9nZWNrb1xcLy9pLnRlc3QodWEpKSB7XG4gICAgICByZXN1bHQubmFtZSA9IHJlc3VsdC5uYW1lIHx8IFwiR2Vja29cIlxuICAgICAgcmVzdWx0LmdlY2tvID0gdFxuICAgICAgcmVzdWx0LnZlcnNpb24gPSByZXN1bHQudmVyc2lvbiB8fCBnZXRGaXJzdE1hdGNoKC9nZWNrb1xcLyhcXGQrKFxcLlxcZCspPykvaSlcbiAgICB9XG5cbiAgICAvLyBzZXQgT1MgZmxhZ3MgZm9yIHBsYXRmb3JtcyB0aGF0IGhhdmUgbXVsdGlwbGUgYnJvd3NlcnNcbiAgICBpZiAoYW5kcm9pZCB8fCByZXN1bHQuc2lsaykge1xuICAgICAgcmVzdWx0LmFuZHJvaWQgPSB0XG4gICAgfSBlbHNlIGlmIChpb3NkZXZpY2UpIHtcbiAgICAgIHJlc3VsdFtpb3NkZXZpY2VdID0gdFxuICAgICAgcmVzdWx0LmlvcyA9IHRcbiAgICB9XG5cbiAgICAvLyBPUyB2ZXJzaW9uIGV4dHJhY3Rpb25cbiAgICB2YXIgb3NWZXJzaW9uID0gJyc7XG4gICAgaWYgKGlvc2RldmljZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvb3MgKFxcZCsoW19cXHNdXFxkKykqKSBsaWtlIG1hYyBvcyB4L2kpO1xuICAgICAgb3NWZXJzaW9uID0gb3NWZXJzaW9uLnJlcGxhY2UoL1tfXFxzXS9nLCAnLicpO1xuICAgIH0gZWxzZSBpZiAoYW5kcm9pZCkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvYW5kcm9pZFsgXFwvLV0oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LndpbmRvd3NwaG9uZSkge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvd2luZG93cyBwaG9uZSAoPzpvcyk/XFxzPyhcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfSBlbHNlIGlmIChyZXN1bHQud2Vib3MpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goLyg/OndlYnxocHcpb3NcXC8oXFxkKyhcXC5cXGQrKSopL2kpO1xuICAgIH0gZWxzZSBpZiAocmVzdWx0LmJsYWNrYmVycnkpIHtcbiAgICAgIG9zVmVyc2lvbiA9IGdldEZpcnN0TWF0Y2goL3JpbVxcc3RhYmxldFxcc29zXFxzKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC5iYWRhKSB7XG4gICAgICBvc1ZlcnNpb24gPSBnZXRGaXJzdE1hdGNoKC9iYWRhXFwvKFxcZCsoXFwuXFxkKykqKS9pKTtcbiAgICB9IGVsc2UgaWYgKHJlc3VsdC50aXplbikge1xuICAgICAgb3NWZXJzaW9uID0gZ2V0Rmlyc3RNYXRjaCgvdGl6ZW5bXFwvXFxzXShcXGQrKFxcLlxcZCspKikvaSk7XG4gICAgfVxuICAgIGlmIChvc1ZlcnNpb24pIHtcbiAgICAgIHJlc3VsdC5vc3ZlcnNpb24gPSBvc1ZlcnNpb247XG4gICAgfVxuXG4gICAgLy8gZGV2aWNlIHR5cGUgZXh0cmFjdGlvblxuICAgIHZhciBvc01ham9yVmVyc2lvbiA9IG9zVmVyc2lvbi5zcGxpdCgnLicpWzBdO1xuICAgIGlmICh0YWJsZXQgfHwgaW9zZGV2aWNlID09ICdpcGFkJyB8fCAoYW5kcm9pZCAmJiAob3NNYWpvclZlcnNpb24gPT0gMyB8fCAob3NNYWpvclZlcnNpb24gPT0gNCAmJiAhbW9iaWxlKSkpIHx8IHJlc3VsdC5zaWxrKSB7XG4gICAgICByZXN1bHQudGFibGV0ID0gdFxuICAgIH0gZWxzZSBpZiAobW9iaWxlIHx8IGlvc2RldmljZSA9PSAnaXBob25lJyB8fCBpb3NkZXZpY2UgPT0gJ2lwb2QnIHx8IGFuZHJvaWQgfHwgcmVzdWx0LmJsYWNrYmVycnkgfHwgcmVzdWx0LndlYm9zIHx8IHJlc3VsdC5iYWRhKSB7XG4gICAgICByZXN1bHQubW9iaWxlID0gdFxuICAgIH1cblxuICAgIC8vIEdyYWRlZCBCcm93c2VyIFN1cHBvcnRcbiAgICAvLyBodHRwOi8vZGV2ZWxvcGVyLnlhaG9vLmNvbS95dWkvYXJ0aWNsZXMvZ2JzXG4gICAgaWYgKChyZXN1bHQubXNpZSAmJiByZXN1bHQudmVyc2lvbiA+PSAxMCkgfHxcbiAgICAgICAgKHJlc3VsdC5jaHJvbWUgJiYgcmVzdWx0LnZlcnNpb24gPj0gMjApIHx8XG4gICAgICAgIChyZXN1bHQuZmlyZWZveCAmJiByZXN1bHQudmVyc2lvbiA+PSAyMC4wKSB8fFxuICAgICAgICAocmVzdWx0LnNhZmFyaSAmJiByZXN1bHQudmVyc2lvbiA+PSA2KSB8fFxuICAgICAgICAocmVzdWx0Lm9wZXJhICYmIHJlc3VsdC52ZXJzaW9uID49IDEwLjApIHx8XG4gICAgICAgIChyZXN1bHQuaW9zICYmIHJlc3VsdC5vc3ZlcnNpb24gJiYgcmVzdWx0Lm9zdmVyc2lvbi5zcGxpdChcIi5cIilbMF0gPj0gNikgfHxcbiAgICAgICAgKHJlc3VsdC5ibGFja2JlcnJ5ICYmIHJlc3VsdC52ZXJzaW9uID49IDEwLjEpXG4gICAgICAgICkge1xuICAgICAgcmVzdWx0LmEgPSB0O1xuICAgIH1cbiAgICBlbHNlIGlmICgocmVzdWx0Lm1zaWUgJiYgcmVzdWx0LnZlcnNpb24gPCAxMCkgfHxcbiAgICAgICAgKHJlc3VsdC5jaHJvbWUgJiYgcmVzdWx0LnZlcnNpb24gPCAyMCkgfHxcbiAgICAgICAgKHJlc3VsdC5maXJlZm94ICYmIHJlc3VsdC52ZXJzaW9uIDwgMjAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5zYWZhcmkgJiYgcmVzdWx0LnZlcnNpb24gPCA2KSB8fFxuICAgICAgICAocmVzdWx0Lm9wZXJhICYmIHJlc3VsdC52ZXJzaW9uIDwgMTAuMCkgfHxcbiAgICAgICAgKHJlc3VsdC5pb3MgJiYgcmVzdWx0Lm9zdmVyc2lvbiAmJiByZXN1bHQub3N2ZXJzaW9uLnNwbGl0KFwiLlwiKVswXSA8IDYpXG4gICAgICAgICkge1xuICAgICAgcmVzdWx0LmMgPSB0XG4gICAgfSBlbHNlIHJlc3VsdC54ID0gdFxuXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG5cbiAgdmFyIGJvd3NlciA9IGRldGVjdCh0eXBlb2YgbmF2aWdhdG9yICE9PSAndW5kZWZpbmVkJyA/IG5hdmlnYXRvci51c2VyQWdlbnQgOiAnJylcblxuXG4gIC8qXG4gICAqIFNldCBvdXIgZGV0ZWN0IG1ldGhvZCB0byB0aGUgbWFpbiBib3dzZXIgb2JqZWN0IHNvIHdlIGNhblxuICAgKiByZXVzZSBpdCB0byB0ZXN0IG90aGVyIHVzZXIgYWdlbnRzLlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBpbXBsZW1lbnQgZnV0dXJlIHRlc3RzLlxuICAgKi9cbiAgYm93c2VyLl9kZXRlY3QgPSBkZXRlY3Q7XG5cbiAgcmV0dXJuIGJvd3NlclxufSk7XG4iLCIvLyBCcm93c2VyIFJlcXVlc3Rcbi8vXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuLy8geW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuLy8gWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4vL1xuLy8gICAgIGh0dHA6Ly93d3cuYXBhY2hlLm9yZy9saWNlbnNlcy9MSUNFTlNFLTIuMFxuLy9cbi8vIFVubGVzcyByZXF1aXJlZCBieSBhcHBsaWNhYmxlIGxhdyBvciBhZ3JlZWQgdG8gaW4gd3JpdGluZywgc29mdHdhcmVcbi8vIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbi8vIFdJVEhPVVQgV0FSUkFOVElFUyBPUiBDT05ESVRJT05TIE9GIEFOWSBLSU5ELCBlaXRoZXIgZXhwcmVzcyBvciBpbXBsaWVkLlxuLy8gU2VlIHRoZSBMaWNlbnNlIGZvciB0aGUgc3BlY2lmaWMgbGFuZ3VhZ2UgZ292ZXJuaW5nIHBlcm1pc3Npb25zIGFuZFxuLy8gbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbi8vIFVNRCBIRUFERVIgU1RBUlQgXG4oZnVuY3Rpb24gKHJvb3QsIGZhY3RvcnkpIHtcbiAgICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIC8vIEFNRC4gUmVnaXN0ZXIgYXMgYW4gYW5vbnltb3VzIG1vZHVsZS5cbiAgICAgICAgZGVmaW5lKFtdLCBmYWN0b3J5KTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBOb2RlLiBEb2VzIG5vdCB3b3JrIHdpdGggc3RyaWN0IENvbW1vbkpTLCBidXRcbiAgICAgICAgLy8gb25seSBDb21tb25KUy1saWtlIGVudmlyb21lbnRzIHRoYXQgc3VwcG9ydCBtb2R1bGUuZXhwb3J0cyxcbiAgICAgICAgLy8gbGlrZSBOb2RlLlxuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyBCcm93c2VyIGdsb2JhbHMgKHJvb3QgaXMgd2luZG93KVxuICAgICAgICByb290LnJldHVybkV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuLy8gVU1EIEhFQURFUiBFTkRcblxudmFyIFhIUiA9IFhNTEh0dHBSZXF1ZXN0XG5pZiAoIVhIUikgdGhyb3cgbmV3IEVycm9yKCdtaXNzaW5nIFhNTEh0dHBSZXF1ZXN0JylcbnJlcXVlc3QubG9nID0ge1xuICAndHJhY2UnOiBub29wLCAnZGVidWcnOiBub29wLCAnaW5mbyc6IG5vb3AsICd3YXJuJzogbm9vcCwgJ2Vycm9yJzogbm9vcFxufVxuXG52YXIgREVGQVVMVF9USU1FT1VUID0gMyAqIDYwICogMTAwMCAvLyAzIG1pbnV0ZXNcblxuLy9cbi8vIHJlcXVlc3Rcbi8vXG5cbmZ1bmN0aW9uIHJlcXVlc3Qob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgLy8gVGhlIGVudHJ5LXBvaW50IHRvIHRoZSBBUEk6IHByZXAgdGhlIG9wdGlvbnMgb2JqZWN0IGFuZCBwYXNzIHRoZSByZWFsIHdvcmsgdG8gcnVuX3hoci5cbiAgaWYodHlwZW9mIGNhbGxiYWNrICE9PSAnZnVuY3Rpb24nKVxuICAgIHRocm93IG5ldyBFcnJvcignQmFkIGNhbGxiYWNrIGdpdmVuOiAnICsgY2FsbGJhY2spXG5cbiAgaWYoIW9wdGlvbnMpXG4gICAgdGhyb3cgbmV3IEVycm9yKCdObyBvcHRpb25zIGdpdmVuJylcblxuICB2YXIgb3B0aW9uc19vblJlc3BvbnNlID0gb3B0aW9ucy5vblJlc3BvbnNlOyAvLyBTYXZlIHRoaXMgZm9yIGxhdGVyLlxuXG4gIGlmKHR5cGVvZiBvcHRpb25zID09PSAnc3RyaW5nJylcbiAgICBvcHRpb25zID0geyd1cmknOm9wdGlvbnN9O1xuICBlbHNlXG4gICAgb3B0aW9ucyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob3B0aW9ucykpOyAvLyBVc2UgYSBkdXBsaWNhdGUgZm9yIG11dGF0aW5nLlxuXG4gIG9wdGlvbnMub25SZXNwb25zZSA9IG9wdGlvbnNfb25SZXNwb25zZSAvLyBBbmQgcHV0IGl0IGJhY2suXG5cbiAgaWYgKG9wdGlvbnMudmVyYm9zZSkgcmVxdWVzdC5sb2cgPSBnZXRMb2dnZXIoKTtcblxuICBpZihvcHRpb25zLnVybCkge1xuICAgIG9wdGlvbnMudXJpID0gb3B0aW9ucy51cmw7XG4gICAgZGVsZXRlIG9wdGlvbnMudXJsO1xuICB9XG5cbiAgaWYoIW9wdGlvbnMudXJpICYmIG9wdGlvbnMudXJpICE9PSBcIlwiKVxuICAgIHRocm93IG5ldyBFcnJvcihcIm9wdGlvbnMudXJpIGlzIGEgcmVxdWlyZWQgYXJndW1lbnRcIik7XG5cbiAgaWYodHlwZW9mIG9wdGlvbnMudXJpICE9IFwic3RyaW5nXCIpXG4gICAgdGhyb3cgbmV3IEVycm9yKFwib3B0aW9ucy51cmkgbXVzdCBiZSBhIHN0cmluZ1wiKTtcblxuICB2YXIgdW5zdXBwb3J0ZWRfb3B0aW9ucyA9IFsncHJveHknLCAnX3JlZGlyZWN0c0ZvbGxvd2VkJywgJ21heFJlZGlyZWN0cycsICdmb2xsb3dSZWRpcmVjdCddXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgdW5zdXBwb3J0ZWRfb3B0aW9ucy5sZW5ndGg7IGkrKylcbiAgICBpZihvcHRpb25zWyB1bnN1cHBvcnRlZF9vcHRpb25zW2ldIF0pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJvcHRpb25zLlwiICsgdW5zdXBwb3J0ZWRfb3B0aW9uc1tpXSArIFwiIGlzIG5vdCBzdXBwb3J0ZWRcIilcblxuICBvcHRpb25zLmNhbGxiYWNrID0gY2FsbGJhY2tcbiAgb3B0aW9ucy5tZXRob2QgPSBvcHRpb25zLm1ldGhvZCB8fCAnR0VUJztcbiAgb3B0aW9ucy5oZWFkZXJzID0gb3B0aW9ucy5oZWFkZXJzIHx8IHt9O1xuICBvcHRpb25zLmJvZHkgICAgPSBvcHRpb25zLmJvZHkgfHwgbnVsbFxuICBvcHRpb25zLnRpbWVvdXQgPSBvcHRpb25zLnRpbWVvdXQgfHwgcmVxdWVzdC5ERUZBVUxUX1RJTUVPVVRcblxuICBpZihvcHRpb25zLmhlYWRlcnMuaG9zdClcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJPcHRpb25zLmhlYWRlcnMuaG9zdCBpcyBub3Qgc3VwcG9ydGVkXCIpO1xuXG4gIGlmKG9wdGlvbnMuanNvbikge1xuICAgIG9wdGlvbnMuaGVhZGVycy5hY2NlcHQgPSBvcHRpb25zLmhlYWRlcnMuYWNjZXB0IHx8ICdhcHBsaWNhdGlvbi9qc29uJ1xuICAgIGlmKG9wdGlvbnMubWV0aG9kICE9PSAnR0VUJylcbiAgICAgIG9wdGlvbnMuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSAnYXBwbGljYXRpb24vanNvbidcblxuICAgIGlmKHR5cGVvZiBvcHRpb25zLmpzb24gIT09ICdib29sZWFuJylcbiAgICAgIG9wdGlvbnMuYm9keSA9IEpTT04uc3RyaW5naWZ5KG9wdGlvbnMuanNvbilcbiAgICBlbHNlIGlmKHR5cGVvZiBvcHRpb25zLmJvZHkgIT09ICdzdHJpbmcnKVxuICAgICAgb3B0aW9ucy5ib2R5ID0gSlNPTi5zdHJpbmdpZnkob3B0aW9ucy5ib2R5KVxuICB9XG4gIFxuICAvL0JFR0lOIFFTIEhhY2tcbiAgdmFyIHNlcmlhbGl6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBzdHIgPSBbXTtcbiAgICBmb3IodmFyIHAgaW4gb2JqKVxuICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgICBzdHIucHVzaChlbmNvZGVVUklDb21wb25lbnQocCkgKyBcIj1cIiArIGVuY29kZVVSSUNvbXBvbmVudChvYmpbcF0pKTtcbiAgICAgIH1cbiAgICByZXR1cm4gc3RyLmpvaW4oXCImXCIpO1xuICB9XG4gIFxuICBpZihvcHRpb25zLnFzKXtcbiAgICB2YXIgcXMgPSAodHlwZW9mIG9wdGlvbnMucXMgPT0gJ3N0cmluZycpPyBvcHRpb25zLnFzIDogc2VyaWFsaXplKG9wdGlvbnMucXMpO1xuICAgIGlmKG9wdGlvbnMudXJpLmluZGV4T2YoJz8nKSAhPT0gLTEpeyAvL25vIGdldCBwYXJhbXNcbiAgICAgICAgb3B0aW9ucy51cmkgPSBvcHRpb25zLnVyaSsnJicrcXM7XG4gICAgfWVsc2V7IC8vZXhpc3RpbmcgZ2V0IHBhcmFtc1xuICAgICAgICBvcHRpb25zLnVyaSA9IG9wdGlvbnMudXJpKyc/JytxcztcbiAgICB9XG4gIH1cbiAgLy9FTkQgUVMgSGFja1xuICBcbiAgLy9CRUdJTiBGT1JNIEhhY2tcbiAgdmFyIG11bHRpcGFydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIC8vdG9kbzogc3VwcG9ydCBmaWxlIHR5cGUgKHVzZWZ1bD8pXG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHJlc3VsdC5ib3VuZHJ5ID0gJy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0nK01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSoxMDAwMDAwMDAwKTtcbiAgICB2YXIgbGluZXMgPSBbXTtcbiAgICBmb3IodmFyIHAgaW4gb2JqKXtcbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShwKSkge1xuICAgICAgICAgICAgbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICAnLS0nK3Jlc3VsdC5ib3VuZHJ5K1wiXFxuXCIrXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtRGlzcG9zaXRpb246IGZvcm0tZGF0YTsgbmFtZT1cIicrcCsnXCInK1wiXFxuXCIrXG4gICAgICAgICAgICAgICAgXCJcXG5cIitcbiAgICAgICAgICAgICAgICBvYmpbcF0rXCJcXG5cIlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBsaW5lcy5wdXNoKCAnLS0nK3Jlc3VsdC5ib3VuZHJ5KyctLScgKTtcbiAgICByZXN1bHQuYm9keSA9IGxpbmVzLmpvaW4oJycpO1xuICAgIHJlc3VsdC5sZW5ndGggPSByZXN1bHQuYm9keS5sZW5ndGg7XG4gICAgcmVzdWx0LnR5cGUgPSAnbXVsdGlwYXJ0L2Zvcm0tZGF0YTsgYm91bmRhcnk9JytyZXN1bHQuYm91bmRyeTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG4gIFxuICBpZihvcHRpb25zLmZvcm0pe1xuICAgIGlmKHR5cGVvZiBvcHRpb25zLmZvcm0gPT0gJ3N0cmluZycpIHRocm93KCdmb3JtIG5hbWUgdW5zdXBwb3J0ZWQnKTtcbiAgICBpZihvcHRpb25zLm1ldGhvZCA9PT0gJ1BPU1QnKXtcbiAgICAgICAgdmFyIGVuY29kaW5nID0gKG9wdGlvbnMuZW5jb2RpbmcgfHwgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCcpLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIG9wdGlvbnMuaGVhZGVyc1snY29udGVudC10eXBlJ10gPSBlbmNvZGluZztcbiAgICAgICAgc3dpdGNoKGVuY29kaW5nKXtcbiAgICAgICAgICAgIGNhc2UgJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCc6XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5ib2R5ID0gc2VyaWFsaXplKG9wdGlvbnMuZm9ybSkucmVwbGFjZSgvJTIwL2csIFwiK1wiKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ211bHRpcGFydC9mb3JtLWRhdGEnOlxuICAgICAgICAgICAgICAgIHZhciBtdWx0aSA9IG11bHRpcGFydChvcHRpb25zLmZvcm0pO1xuICAgICAgICAgICAgICAgIC8vb3B0aW9ucy5oZWFkZXJzWydjb250ZW50LWxlbmd0aCddID0gbXVsdGkubGVuZ3RoO1xuICAgICAgICAgICAgICAgIG9wdGlvbnMuYm9keSA9IG11bHRpLmJvZHk7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5oZWFkZXJzWydjb250ZW50LXR5cGUnXSA9IG11bHRpLnR5cGU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0IDogdGhyb3cgbmV3IEVycm9yKCd1bnN1cHBvcnRlZCBlbmNvZGluZzonK2VuY29kaW5nKTtcbiAgICAgICAgfVxuICAgIH1cbiAgfVxuICAvL0VORCBGT1JNIEhhY2tcblxuICAvLyBJZiBvblJlc3BvbnNlIGlzIGJvb2xlYW4gdHJ1ZSwgY2FsbCBiYWNrIGltbWVkaWF0ZWx5IHdoZW4gdGhlIHJlc3BvbnNlIGlzIGtub3duLFxuICAvLyBub3Qgd2hlbiB0aGUgZnVsbCByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICBvcHRpb25zLm9uUmVzcG9uc2UgPSBvcHRpb25zLm9uUmVzcG9uc2UgfHwgbm9vcFxuICBpZihvcHRpb25zLm9uUmVzcG9uc2UgPT09IHRydWUpIHtcbiAgICBvcHRpb25zLm9uUmVzcG9uc2UgPSBjYWxsYmFja1xuICAgIG9wdGlvbnMuY2FsbGJhY2sgPSBub29wXG4gIH1cblxuICAvLyBYWFggQnJvd3NlcnMgZG8gbm90IGxpa2UgdGhpcy5cbiAgLy9pZihvcHRpb25zLmJvZHkpXG4gIC8vICBvcHRpb25zLmhlYWRlcnNbJ2NvbnRlbnQtbGVuZ3RoJ10gPSBvcHRpb25zLmJvZHkubGVuZ3RoO1xuXG4gIC8vIEhUVFAgYmFzaWMgYXV0aGVudGljYXRpb25cbiAgaWYoIW9wdGlvbnMuaGVhZGVycy5hdXRob3JpemF0aW9uICYmIG9wdGlvbnMuYXV0aClcbiAgICBvcHRpb25zLmhlYWRlcnMuYXV0aG9yaXphdGlvbiA9ICdCYXNpYyAnICsgYjY0X2VuYyhvcHRpb25zLmF1dGgudXNlcm5hbWUgKyAnOicgKyBvcHRpb25zLmF1dGgucGFzc3dvcmQpO1xuXG4gIHJldHVybiBydW5feGhyKG9wdGlvbnMpXG59XG5cbnZhciByZXFfc2VxID0gMFxuZnVuY3Rpb24gcnVuX3hocihvcHRpb25zKSB7XG4gIHZhciB4aHIgPSBuZXcgWEhSXG4gICAgLCB0aW1lZF9vdXQgPSBmYWxzZVxuICAgICwgaXNfY29ycyA9IGlzX2Nyb3NzRG9tYWluKG9wdGlvbnMudXJpKVxuICAgICwgc3VwcG9ydHNfY29ycyA9ICgnd2l0aENyZWRlbnRpYWxzJyBpbiB4aHIpXG5cbiAgcmVxX3NlcSArPSAxXG4gIHhoci5zZXFfaWQgPSByZXFfc2VxXG4gIHhoci5pZCA9IHJlcV9zZXEgKyAnOiAnICsgb3B0aW9ucy5tZXRob2QgKyAnICcgKyBvcHRpb25zLnVyaVxuICB4aHIuX2lkID0geGhyLmlkIC8vIEkga25vdyBJIHdpbGwgdHlwZSBcIl9pZFwiIGZyb20gaGFiaXQgYWxsIHRoZSB0aW1lLlxuXG4gIGlmKGlzX2NvcnMgJiYgIXN1cHBvcnRzX2NvcnMpIHtcbiAgICB2YXIgY29yc19lcnIgPSBuZXcgRXJyb3IoJ0Jyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBjcm9zcy1vcmlnaW4gcmVxdWVzdDogJyArIG9wdGlvbnMudXJpKVxuICAgIGNvcnNfZXJyLmNvcnMgPSAndW5zdXBwb3J0ZWQnXG4gICAgcmV0dXJuIG9wdGlvbnMuY2FsbGJhY2soY29yc19lcnIsIHhocilcbiAgfVxuXG4gIHhoci50aW1lb3V0VGltZXIgPSBzZXRUaW1lb3V0KHRvb19sYXRlLCBvcHRpb25zLnRpbWVvdXQpXG4gIGZ1bmN0aW9uIHRvb19sYXRlKCkge1xuICAgIHRpbWVkX291dCA9IHRydWVcbiAgICB2YXIgZXIgPSBuZXcgRXJyb3IoJ0VUSU1FRE9VVCcpXG4gICAgZXIuY29kZSA9ICdFVElNRURPVVQnXG4gICAgZXIuZHVyYXRpb24gPSBvcHRpb25zLnRpbWVvdXRcblxuICAgIHJlcXVlc3QubG9nLmVycm9yKCdUaW1lb3V0JywgeyAnaWQnOnhoci5faWQsICdtaWxsaXNlY29uZHMnOm9wdGlvbnMudGltZW91dCB9KVxuICAgIHJldHVybiBvcHRpb25zLmNhbGxiYWNrKGVyLCB4aHIpXG4gIH1cblxuICAvLyBTb21lIHN0YXRlcyBjYW4gYmUgc2tpcHBlZCBvdmVyLCBzbyByZW1lbWJlciB3aGF0IGlzIHN0aWxsIGluY29tcGxldGUuXG4gIHZhciBkaWQgPSB7J3Jlc3BvbnNlJzpmYWxzZSwgJ2xvYWRpbmcnOmZhbHNlLCAnZW5kJzpmYWxzZX1cblxuICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gb25fc3RhdGVfY2hhbmdlXG4gIHhoci5vcGVuKG9wdGlvbnMubWV0aG9kLCBvcHRpb25zLnVyaSwgdHJ1ZSkgLy8gYXN5bmNocm9ub3VzXG4gIGlmKGlzX2NvcnMpXG4gICAgeGhyLndpdGhDcmVkZW50aWFscyA9ICEhIG9wdGlvbnMud2l0aENyZWRlbnRpYWxzXG4gIHhoci5zZW5kKG9wdGlvbnMuYm9keSlcbiAgcmV0dXJuIHhoclxuXG4gIGZ1bmN0aW9uIG9uX3N0YXRlX2NoYW5nZShldmVudCkge1xuICAgIGlmKHRpbWVkX291dClcbiAgICAgIHJldHVybiByZXF1ZXN0LmxvZy5kZWJ1ZygnSWdub3JpbmcgdGltZWQgb3V0IHN0YXRlIGNoYW5nZScsIHsnc3RhdGUnOnhoci5yZWFkeVN0YXRlLCAnaWQnOnhoci5pZH0pXG5cbiAgICByZXF1ZXN0LmxvZy5kZWJ1ZygnU3RhdGUgY2hhbmdlJywgeydzdGF0ZSc6eGhyLnJlYWR5U3RhdGUsICdpZCc6eGhyLmlkLCAndGltZWRfb3V0Jzp0aW1lZF9vdXR9KVxuXG4gICAgaWYoeGhyLnJlYWR5U3RhdGUgPT09IFhIUi5PUEVORUQpIHtcbiAgICAgIHJlcXVlc3QubG9nLmRlYnVnKCdSZXF1ZXN0IHN0YXJ0ZWQnLCB7J2lkJzp4aHIuaWR9KVxuICAgICAgZm9yICh2YXIga2V5IGluIG9wdGlvbnMuaGVhZGVycylcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoa2V5LCBvcHRpb25zLmhlYWRlcnNba2V5XSlcbiAgICB9XG5cbiAgICBlbHNlIGlmKHhoci5yZWFkeVN0YXRlID09PSBYSFIuSEVBREVSU19SRUNFSVZFRClcbiAgICAgIG9uX3Jlc3BvbnNlKClcblxuICAgIGVsc2UgaWYoeGhyLnJlYWR5U3RhdGUgPT09IFhIUi5MT0FESU5HKSB7XG4gICAgICBvbl9yZXNwb25zZSgpXG4gICAgICBvbl9sb2FkaW5nKClcbiAgICB9XG5cbiAgICBlbHNlIGlmKHhoci5yZWFkeVN0YXRlID09PSBYSFIuRE9ORSkge1xuICAgICAgb25fcmVzcG9uc2UoKVxuICAgICAgb25fbG9hZGluZygpXG4gICAgICBvbl9lbmQoKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG9uX3Jlc3BvbnNlKCkge1xuICAgIGlmKGRpZC5yZXNwb25zZSlcbiAgICAgIHJldHVyblxuXG4gICAgZGlkLnJlc3BvbnNlID0gdHJ1ZVxuICAgIHJlcXVlc3QubG9nLmRlYnVnKCdHb3QgcmVzcG9uc2UnLCB7J2lkJzp4aHIuaWQsICdzdGF0dXMnOnhoci5zdGF0dXN9KVxuICAgIGNsZWFyVGltZW91dCh4aHIudGltZW91dFRpbWVyKVxuICAgIHhoci5zdGF0dXNDb2RlID0geGhyLnN0YXR1cyAvLyBOb2RlIHJlcXVlc3QgY29tcGF0aWJpbGl0eVxuXG4gICAgLy8gRGV0ZWN0IGZhaWxlZCBDT1JTIHJlcXVlc3RzLlxuICAgIGlmKGlzX2NvcnMgJiYgeGhyLnN0YXR1c0NvZGUgPT0gMCkge1xuICAgICAgdmFyIGNvcnNfZXJyID0gbmV3IEVycm9yKCdDT1JTIHJlcXVlc3QgcmVqZWN0ZWQ6ICcgKyBvcHRpb25zLnVyaSlcbiAgICAgIGNvcnNfZXJyLmNvcnMgPSAncmVqZWN0ZWQnXG5cbiAgICAgIC8vIERvIG5vdCBwcm9jZXNzIHRoaXMgcmVxdWVzdCBmdXJ0aGVyLlxuICAgICAgZGlkLmxvYWRpbmcgPSB0cnVlXG4gICAgICBkaWQuZW5kID0gdHJ1ZVxuXG4gICAgICByZXR1cm4gb3B0aW9ucy5jYWxsYmFjayhjb3JzX2VyciwgeGhyKVxuICAgIH1cblxuICAgIG9wdGlvbnMub25SZXNwb25zZShudWxsLCB4aHIpXG4gIH1cblxuICBmdW5jdGlvbiBvbl9sb2FkaW5nKCkge1xuICAgIGlmKGRpZC5sb2FkaW5nKVxuICAgICAgcmV0dXJuXG5cbiAgICBkaWQubG9hZGluZyA9IHRydWVcbiAgICByZXF1ZXN0LmxvZy5kZWJ1ZygnUmVzcG9uc2UgYm9keSBsb2FkaW5nJywgeydpZCc6eGhyLmlkfSlcbiAgICAvLyBUT0RPOiBNYXliZSBzaW11bGF0ZSBcImRhdGFcIiBldmVudHMgYnkgd2F0Y2hpbmcgeGhyLnJlc3BvbnNlVGV4dFxuICB9XG5cbiAgZnVuY3Rpb24gb25fZW5kKCkge1xuICAgIGlmKGRpZC5lbmQpXG4gICAgICByZXR1cm5cblxuICAgIGRpZC5lbmQgPSB0cnVlXG4gICAgcmVxdWVzdC5sb2cuZGVidWcoJ1JlcXVlc3QgZG9uZScsIHsnaWQnOnhoci5pZH0pXG5cbiAgICB4aHIuYm9keSA9IHhoci5yZXNwb25zZVRleHRcbiAgICBpZihvcHRpb25zLmpzb24pIHtcbiAgICAgIHRyeSAgICAgICAgeyB4aHIuYm9keSA9IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCkgfVxuICAgICAgY2F0Y2ggKGVyKSB7IHJldHVybiBvcHRpb25zLmNhbGxiYWNrKGVyLCB4aHIpICAgICAgICB9XG4gICAgfVxuXG4gICAgb3B0aW9ucy5jYWxsYmFjayhudWxsLCB4aHIsIHhoci5ib2R5KVxuICB9XG5cbn0gLy8gcmVxdWVzdFxuXG5yZXF1ZXN0LndpdGhDcmVkZW50aWFscyA9IGZhbHNlO1xucmVxdWVzdC5ERUZBVUxUX1RJTUVPVVQgPSBERUZBVUxUX1RJTUVPVVQ7XG5cbi8vXG4vLyBkZWZhdWx0c1xuLy9cblxucmVxdWVzdC5kZWZhdWx0cyA9IGZ1bmN0aW9uKG9wdGlvbnMsIHJlcXVlc3Rlcikge1xuICB2YXIgZGVmID0gZnVuY3Rpb24gKG1ldGhvZCkge1xuICAgIHZhciBkID0gZnVuY3Rpb24gKHBhcmFtcywgY2FsbGJhY2spIHtcbiAgICAgIGlmKHR5cGVvZiBwYXJhbXMgPT09ICdzdHJpbmcnKVxuICAgICAgICBwYXJhbXMgPSB7J3VyaSc6IHBhcmFtc307XG4gICAgICBlbHNlIHtcbiAgICAgICAgcGFyYW1zID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShwYXJhbXMpKTtcbiAgICAgIH1cbiAgICAgIGZvciAodmFyIGkgaW4gb3B0aW9ucykge1xuICAgICAgICBpZiAocGFyYW1zW2ldID09PSB1bmRlZmluZWQpIHBhcmFtc1tpXSA9IG9wdGlvbnNbaV1cbiAgICAgIH1cbiAgICAgIHJldHVybiBtZXRob2QocGFyYW1zLCBjYWxsYmFjaylcbiAgICB9XG4gICAgcmV0dXJuIGRcbiAgfVxuICB2YXIgZGUgPSBkZWYocmVxdWVzdClcbiAgZGUuZ2V0ID0gZGVmKHJlcXVlc3QuZ2V0KVxuICBkZS5wb3N0ID0gZGVmKHJlcXVlc3QucG9zdClcbiAgZGUucHV0ID0gZGVmKHJlcXVlc3QucHV0KVxuICBkZS5oZWFkID0gZGVmKHJlcXVlc3QuaGVhZClcbiAgcmV0dXJuIGRlXG59XG5cbi8vXG4vLyBIVFRQIG1ldGhvZCBzaG9ydGN1dHNcbi8vXG5cbnZhciBzaG9ydGN1dHMgPSBbICdnZXQnLCAncHV0JywgJ3Bvc3QnLCAnaGVhZCcgXTtcbnNob3J0Y3V0cy5mb3JFYWNoKGZ1bmN0aW9uKHNob3J0Y3V0KSB7XG4gIHZhciBtZXRob2QgPSBzaG9ydGN1dC50b1VwcGVyQ2FzZSgpO1xuICB2YXIgZnVuYyAgID0gc2hvcnRjdXQudG9Mb3dlckNhc2UoKTtcblxuICByZXF1ZXN0W2Z1bmNdID0gZnVuY3Rpb24ob3B0cykge1xuICAgIGlmKHR5cGVvZiBvcHRzID09PSAnc3RyaW5nJylcbiAgICAgIG9wdHMgPSB7J21ldGhvZCc6bWV0aG9kLCAndXJpJzpvcHRzfTtcbiAgICBlbHNlIHtcbiAgICAgIG9wdHMgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9wdHMpKTtcbiAgICAgIG9wdHMubWV0aG9kID0gbWV0aG9kO1xuICAgIH1cblxuICAgIHZhciBhcmdzID0gW29wdHNdLmNvbmNhdChBcnJheS5wcm90b3R5cGUuc2xpY2UuYXBwbHkoYXJndW1lbnRzLCBbMV0pKTtcbiAgICByZXR1cm4gcmVxdWVzdC5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxufSlcblxuLy9cbi8vIENvdWNoREIgc2hvcnRjdXRcbi8vXG5cbnJlcXVlc3QuY291Y2ggPSBmdW5jdGlvbihvcHRpb25zLCBjYWxsYmFjaykge1xuICBpZih0eXBlb2Ygb3B0aW9ucyA9PT0gJ3N0cmluZycpXG4gICAgb3B0aW9ucyA9IHsndXJpJzpvcHRpb25zfVxuXG4gIC8vIEp1c3QgdXNlIHRoZSByZXF1ZXN0IEFQSSB0byBkbyBKU09OLlxuICBvcHRpb25zLmpzb24gPSB0cnVlXG4gIGlmKG9wdGlvbnMuYm9keSlcbiAgICBvcHRpb25zLmpzb24gPSBvcHRpb25zLmJvZHlcbiAgZGVsZXRlIG9wdGlvbnMuYm9keVxuXG4gIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcFxuXG4gIHZhciB4aHIgPSByZXF1ZXN0KG9wdGlvbnMsIGNvdWNoX2hhbmRsZXIpXG4gIHJldHVybiB4aHJcblxuICBmdW5jdGlvbiBjb3VjaF9oYW5kbGVyKGVyLCByZXNwLCBib2R5KSB7XG4gICAgaWYoZXIpXG4gICAgICByZXR1cm4gY2FsbGJhY2soZXIsIHJlc3AsIGJvZHkpXG5cbiAgICBpZigocmVzcC5zdGF0dXNDb2RlIDwgMjAwIHx8IHJlc3Auc3RhdHVzQ29kZSA+IDI5OSkgJiYgYm9keS5lcnJvcikge1xuICAgICAgLy8gVGhlIGJvZHkgaXMgYSBDb3VjaCBKU09OIG9iamVjdCBpbmRpY2F0aW5nIHRoZSBlcnJvci5cbiAgICAgIGVyID0gbmV3IEVycm9yKCdDb3VjaERCIGVycm9yOiAnICsgKGJvZHkuZXJyb3IucmVhc29uIHx8IGJvZHkuZXJyb3IuZXJyb3IpKVxuICAgICAgZm9yICh2YXIga2V5IGluIGJvZHkpXG4gICAgICAgIGVyW2tleV0gPSBib2R5W2tleV1cbiAgICAgIHJldHVybiBjYWxsYmFjayhlciwgcmVzcCwgYm9keSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNhbGxiYWNrKGVyLCByZXNwLCBib2R5KTtcbiAgfVxufVxuXG4vL1xuLy8gVXRpbGl0eVxuLy9cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbmZ1bmN0aW9uIGdldExvZ2dlcigpIHtcbiAgdmFyIGxvZ2dlciA9IHt9XG4gICAgLCBsZXZlbHMgPSBbJ3RyYWNlJywgJ2RlYnVnJywgJ2luZm8nLCAnd2FybicsICdlcnJvciddXG4gICAgLCBsZXZlbCwgaVxuXG4gIGZvcihpID0gMDsgaSA8IGxldmVscy5sZW5ndGg7IGkrKykge1xuICAgIGxldmVsID0gbGV2ZWxzW2ldXG5cbiAgICBsb2dnZXJbbGV2ZWxdID0gbm9vcFxuICAgIGlmKHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJiBjb25zb2xlICYmIGNvbnNvbGVbbGV2ZWxdKVxuICAgICAgbG9nZ2VyW2xldmVsXSA9IGZvcm1hdHRlZChjb25zb2xlLCBsZXZlbClcbiAgfVxuXG4gIHJldHVybiBsb2dnZXJcbn1cblxuZnVuY3Rpb24gZm9ybWF0dGVkKG9iaiwgbWV0aG9kKSB7XG4gIHJldHVybiBmb3JtYXR0ZWRfbG9nZ2VyXG5cbiAgZnVuY3Rpb24gZm9ybWF0dGVkX2xvZ2dlcihzdHIsIGNvbnRleHQpIHtcbiAgICBpZih0eXBlb2YgY29udGV4dCA9PT0gJ29iamVjdCcpXG4gICAgICBzdHIgKz0gJyAnICsgSlNPTi5zdHJpbmdpZnkoY29udGV4dClcblxuICAgIHJldHVybiBvYmpbbWV0aG9kXS5jYWxsKG9iaiwgc3RyKVxuICB9XG59XG5cbi8vIFJldHVybiB3aGV0aGVyIGEgVVJMIGlzIGEgY3Jvc3MtZG9tYWluIHJlcXVlc3QuXG5mdW5jdGlvbiBpc19jcm9zc0RvbWFpbih1cmwpIHtcbiAgdmFyIHJ1cmwgPSAvXihbXFx3XFwrXFwuXFwtXSs6KSg/OlxcL1xcLyhbXlxcLz8jOl0qKSg/OjooXFxkKykpPyk/L1xuXG4gIC8vIGpRdWVyeSAjODEzOCwgSUUgbWF5IHRocm93IGFuIGV4Y2VwdGlvbiB3aGVuIGFjY2Vzc2luZ1xuICAvLyBhIGZpZWxkIGZyb20gd2luZG93LmxvY2F0aW9uIGlmIGRvY3VtZW50LmRvbWFpbiBoYXMgYmVlbiBzZXRcbiAgdmFyIGFqYXhMb2NhdGlvblxuICB0cnkgeyBhamF4TG9jYXRpb24gPSBsb2NhdGlvbi5ocmVmIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICAvLyBVc2UgdGhlIGhyZWYgYXR0cmlidXRlIG9mIGFuIEEgZWxlbWVudCBzaW5jZSBJRSB3aWxsIG1vZGlmeSBpdCBnaXZlbiBkb2N1bWVudC5sb2NhdGlvblxuICAgIGFqYXhMb2NhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIFwiYVwiICk7XG4gICAgYWpheExvY2F0aW9uLmhyZWYgPSBcIlwiO1xuICAgIGFqYXhMb2NhdGlvbiA9IGFqYXhMb2NhdGlvbi5ocmVmO1xuICB9XG5cbiAgdmFyIGFqYXhMb2NQYXJ0cyA9IHJ1cmwuZXhlYyhhamF4TG9jYXRpb24udG9Mb3dlckNhc2UoKSkgfHwgW11cbiAgICAsIHBhcnRzID0gcnVybC5leGVjKHVybC50b0xvd2VyQ2FzZSgpIClcblxuICB2YXIgcmVzdWx0ID0gISEoXG4gICAgcGFydHMgJiZcbiAgICAoICBwYXJ0c1sxXSAhPSBhamF4TG9jUGFydHNbMV1cbiAgICB8fCBwYXJ0c1syXSAhPSBhamF4TG9jUGFydHNbMl1cbiAgICB8fCAocGFydHNbM10gfHwgKHBhcnRzWzFdID09PSBcImh0dHA6XCIgPyA4MCA6IDQ0MykpICE9IChhamF4TG9jUGFydHNbM10gfHwgKGFqYXhMb2NQYXJ0c1sxXSA9PT0gXCJodHRwOlwiID8gODAgOiA0NDMpKVxuICAgIClcbiAgKVxuXG4gIC8vY29uc29sZS5kZWJ1ZygnaXNfY3Jvc3NEb21haW4oJyt1cmwrJykgLT4gJyArIHJlc3VsdClcbiAgcmV0dXJuIHJlc3VsdFxufVxuXG4vLyBNSVQgTGljZW5zZSBmcm9tIGh0dHA6Ly9waHBqcy5vcmcvZnVuY3Rpb25zL2Jhc2U2NF9lbmNvZGU6MzU4XG5mdW5jdGlvbiBiNjRfZW5jIChkYXRhKSB7XG4gICAgLy8gRW5jb2RlcyBzdHJpbmcgdXNpbmcgTUlNRSBiYXNlNjQgYWxnb3JpdGhtXG4gICAgdmFyIGI2NCA9IFwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLz1cIjtcbiAgICB2YXIgbzEsIG8yLCBvMywgaDEsIGgyLCBoMywgaDQsIGJpdHMsIGkgPSAwLCBhYyA9IDAsIGVuYz1cIlwiLCB0bXBfYXJyID0gW107XG5cbiAgICBpZiAoIWRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgLy8gYXNzdW1lIHV0ZjggZGF0YVxuICAgIC8vIGRhdGEgPSB0aGlzLnV0ZjhfZW5jb2RlKGRhdGErJycpO1xuXG4gICAgZG8geyAvLyBwYWNrIHRocmVlIG9jdGV0cyBpbnRvIGZvdXIgaGV4ZXRzXG4gICAgICAgIG8xID0gZGF0YS5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICAgIG8yID0gZGF0YS5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICAgIG8zID0gZGF0YS5jaGFyQ29kZUF0KGkrKyk7XG5cbiAgICAgICAgYml0cyA9IG8xPDwxNiB8IG8yPDw4IHwgbzM7XG5cbiAgICAgICAgaDEgPSBiaXRzPj4xOCAmIDB4M2Y7XG4gICAgICAgIGgyID0gYml0cz4+MTIgJiAweDNmO1xuICAgICAgICBoMyA9IGJpdHM+PjYgJiAweDNmO1xuICAgICAgICBoNCA9IGJpdHMgJiAweDNmO1xuXG4gICAgICAgIC8vIHVzZSBoZXhldHMgdG8gaW5kZXggaW50byBiNjQsIGFuZCBhcHBlbmQgcmVzdWx0IHRvIGVuY29kZWQgc3RyaW5nXG4gICAgICAgIHRtcF9hcnJbYWMrK10gPSBiNjQuY2hhckF0KGgxKSArIGI2NC5jaGFyQXQoaDIpICsgYjY0LmNoYXJBdChoMykgKyBiNjQuY2hhckF0KGg0KTtcbiAgICB9IHdoaWxlIChpIDwgZGF0YS5sZW5ndGgpO1xuXG4gICAgZW5jID0gdG1wX2Fyci5qb2luKCcnKTtcblxuICAgIHN3aXRjaCAoZGF0YS5sZW5ndGggJSAzKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGVuYyA9IGVuYy5zbGljZSgwLCAtMikgKyAnPT0nO1xuICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgICAgZW5jID0gZW5jLnNsaWNlKDAsIC0xKSArICc9JztcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVuYztcbn1cbiAgICByZXR1cm4gcmVxdWVzdDtcbi8vVU1EIEZPT1RFUiBTVEFSVFxufSkpO1xuLy9VTUQgRk9PVEVSIEVORFxuIiwiLy8gaHR0cDovL3dpa2kuY29tbW9uanMub3JnL3dpa2kvVW5pdF9UZXN0aW5nLzEuMFxuLy9cbi8vIFRISVMgSVMgTk9UIFRFU1RFRCBOT1IgTElLRUxZIFRPIFdPUksgT1VUU0lERSBWOCFcbi8vXG4vLyBPcmlnaW5hbGx5IGZyb20gbmFyd2hhbC5qcyAoaHR0cDovL25hcndoYWxqcy5vcmcpXG4vLyBDb3B5cmlnaHQgKGMpIDIwMDkgVGhvbWFzIFJvYmluc29uIDwyODBub3J0aC5jb20+XG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuLy8gb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgJ1NvZnR3YXJlJyksIHRvXG4vLyBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZVxuLy8gcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yXG4vLyBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuLy8gZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpblxuLy8gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICdBUyBJUycsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1Jcbi8vIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuLy8gRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4vLyBBVVRIT1JTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTlxuLy8gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTlxuLy8gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbi8vIHdoZW4gdXNlZCBpbiBub2RlLCB0aGlzIHdpbGwgYWN0dWFsbHkgbG9hZCB0aGUgdXRpbCBtb2R1bGUgd2UgZGVwZW5kIG9uXG4vLyB2ZXJzdXMgbG9hZGluZyB0aGUgYnVpbHRpbiB1dGlsIG1vZHVsZSBhcyBoYXBwZW5zIG90aGVyd2lzZVxuLy8gdGhpcyBpcyBhIGJ1ZyBpbiBub2RlIG1vZHVsZSBsb2FkaW5nIGFzIGZhciBhcyBJIGFtIGNvbmNlcm5lZFxudmFyIHV0aWwgPSByZXF1aXJlKCd1dGlsLycpO1xuXG52YXIgcFNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG5cbi8vIDEuIFRoZSBhc3NlcnQgbW9kdWxlIHByb3ZpZGVzIGZ1bmN0aW9ucyB0aGF0IHRocm93XG4vLyBBc3NlcnRpb25FcnJvcidzIHdoZW4gcGFydGljdWxhciBjb25kaXRpb25zIGFyZSBub3QgbWV0LiBUaGVcbi8vIGFzc2VydCBtb2R1bGUgbXVzdCBjb25mb3JtIHRvIHRoZSBmb2xsb3dpbmcgaW50ZXJmYWNlLlxuXG52YXIgYXNzZXJ0ID0gbW9kdWxlLmV4cG9ydHMgPSBvaztcblxuLy8gMi4gVGhlIEFzc2VydGlvbkVycm9yIGlzIGRlZmluZWQgaW4gYXNzZXJ0LlxuLy8gbmV3IGFzc2VydC5Bc3NlcnRpb25FcnJvcih7IG1lc3NhZ2U6IG1lc3NhZ2UsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWN0dWFsOiBhY3R1YWwsXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZXhwZWN0ZWQ6IGV4cGVjdGVkIH0pXG5cbmFzc2VydC5Bc3NlcnRpb25FcnJvciA9IGZ1bmN0aW9uIEFzc2VydGlvbkVycm9yKG9wdGlvbnMpIHtcbiAgdGhpcy5uYW1lID0gJ0Fzc2VydGlvbkVycm9yJztcbiAgdGhpcy5hY3R1YWwgPSBvcHRpb25zLmFjdHVhbDtcbiAgdGhpcy5leHBlY3RlZCA9IG9wdGlvbnMuZXhwZWN0ZWQ7XG4gIHRoaXMub3BlcmF0b3IgPSBvcHRpb25zLm9wZXJhdG9yO1xuICBpZiAob3B0aW9ucy5tZXNzYWdlKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gb3B0aW9ucy5tZXNzYWdlO1xuICAgIHRoaXMuZ2VuZXJhdGVkTWVzc2FnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRoaXMubWVzc2FnZSA9IGdldE1lc3NhZ2UodGhpcyk7XG4gICAgdGhpcy5nZW5lcmF0ZWRNZXNzYWdlID0gdHJ1ZTtcbiAgfVxuICB2YXIgc3RhY2tTdGFydEZ1bmN0aW9uID0gb3B0aW9ucy5zdGFja1N0YXJ0RnVuY3Rpb24gfHwgZmFpbDtcblxuICBpZiAoRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UpIHtcbiAgICBFcnJvci5jYXB0dXJlU3RhY2tUcmFjZSh0aGlzLCBzdGFja1N0YXJ0RnVuY3Rpb24pO1xuICB9XG4gIGVsc2Uge1xuICAgIC8vIG5vbiB2OCBicm93c2VycyBzbyB3ZSBjYW4gaGF2ZSBhIHN0YWNrdHJhY2VcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCk7XG4gICAgaWYgKGVyci5zdGFjaykge1xuICAgICAgdmFyIG91dCA9IGVyci5zdGFjaztcblxuICAgICAgLy8gdHJ5IHRvIHN0cmlwIHVzZWxlc3MgZnJhbWVzXG4gICAgICB2YXIgZm5fbmFtZSA9IHN0YWNrU3RhcnRGdW5jdGlvbi5uYW1lO1xuICAgICAgdmFyIGlkeCA9IG91dC5pbmRleE9mKCdcXG4nICsgZm5fbmFtZSk7XG4gICAgICBpZiAoaWR4ID49IDApIHtcbiAgICAgICAgLy8gb25jZSB3ZSBoYXZlIGxvY2F0ZWQgdGhlIGZ1bmN0aW9uIGZyYW1lXG4gICAgICAgIC8vIHdlIG5lZWQgdG8gc3RyaXAgb3V0IGV2ZXJ5dGhpbmcgYmVmb3JlIGl0IChhbmQgaXRzIGxpbmUpXG4gICAgICAgIHZhciBuZXh0X2xpbmUgPSBvdXQuaW5kZXhPZignXFxuJywgaWR4ICsgMSk7XG4gICAgICAgIG91dCA9IG91dC5zdWJzdHJpbmcobmV4dF9saW5lICsgMSk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuc3RhY2sgPSBvdXQ7XG4gICAgfVxuICB9XG59O1xuXG4vLyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3IgaW5zdGFuY2VvZiBFcnJvclxudXRpbC5pbmhlcml0cyhhc3NlcnQuQXNzZXJ0aW9uRXJyb3IsIEVycm9yKTtcblxuZnVuY3Rpb24gcmVwbGFjZXIoa2V5LCB2YWx1ZSkge1xuICBpZiAodXRpbC5pc1VuZGVmaW5lZCh2YWx1ZSkpIHtcbiAgICByZXR1cm4gJycgKyB2YWx1ZTtcbiAgfVxuICBpZiAodXRpbC5pc051bWJlcih2YWx1ZSkgJiYgKGlzTmFOKHZhbHVlKSB8fCAhaXNGaW5pdGUodmFsdWUpKSkge1xuICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICB9XG4gIGlmICh1dGlsLmlzRnVuY3Rpb24odmFsdWUpIHx8IHV0aWwuaXNSZWdFeHAodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gIH1cbiAgcmV0dXJuIHZhbHVlO1xufVxuXG5mdW5jdGlvbiB0cnVuY2F0ZShzLCBuKSB7XG4gIGlmICh1dGlsLmlzU3RyaW5nKHMpKSB7XG4gICAgcmV0dXJuIHMubGVuZ3RoIDwgbiA/IHMgOiBzLnNsaWNlKDAsIG4pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzO1xuICB9XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2Uoc2VsZikge1xuICByZXR1cm4gdHJ1bmNhdGUoSlNPTi5zdHJpbmdpZnkoc2VsZi5hY3R1YWwsIHJlcGxhY2VyKSwgMTI4KSArICcgJyArXG4gICAgICAgICBzZWxmLm9wZXJhdG9yICsgJyAnICtcbiAgICAgICAgIHRydW5jYXRlKEpTT04uc3RyaW5naWZ5KHNlbGYuZXhwZWN0ZWQsIHJlcGxhY2VyKSwgMTI4KTtcbn1cblxuLy8gQXQgcHJlc2VudCBvbmx5IHRoZSB0aHJlZSBrZXlzIG1lbnRpb25lZCBhYm92ZSBhcmUgdXNlZCBhbmRcbi8vIHVuZGVyc3Rvb2QgYnkgdGhlIHNwZWMuIEltcGxlbWVudGF0aW9ucyBvciBzdWIgbW9kdWxlcyBjYW4gcGFzc1xuLy8gb3RoZXIga2V5cyB0byB0aGUgQXNzZXJ0aW9uRXJyb3IncyBjb25zdHJ1Y3RvciAtIHRoZXkgd2lsbCBiZVxuLy8gaWdub3JlZC5cblxuLy8gMy4gQWxsIG9mIHRoZSBmb2xsb3dpbmcgZnVuY3Rpb25zIG11c3QgdGhyb3cgYW4gQXNzZXJ0aW9uRXJyb3Jcbi8vIHdoZW4gYSBjb3JyZXNwb25kaW5nIGNvbmRpdGlvbiBpcyBub3QgbWV0LCB3aXRoIGEgbWVzc2FnZSB0aGF0XG4vLyBtYXkgYmUgdW5kZWZpbmVkIGlmIG5vdCBwcm92aWRlZC4gIEFsbCBhc3NlcnRpb24gbWV0aG9kcyBwcm92aWRlXG4vLyBib3RoIHRoZSBhY3R1YWwgYW5kIGV4cGVjdGVkIHZhbHVlcyB0byB0aGUgYXNzZXJ0aW9uIGVycm9yIGZvclxuLy8gZGlzcGxheSBwdXJwb3Nlcy5cblxuZnVuY3Rpb24gZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCBvcGVyYXRvciwgc3RhY2tTdGFydEZ1bmN0aW9uKSB7XG4gIHRocm93IG5ldyBhc3NlcnQuQXNzZXJ0aW9uRXJyb3Ioe1xuICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXG4gICAgYWN0dWFsOiBhY3R1YWwsXG4gICAgZXhwZWN0ZWQ6IGV4cGVjdGVkLFxuICAgIG9wZXJhdG9yOiBvcGVyYXRvcixcbiAgICBzdGFja1N0YXJ0RnVuY3Rpb246IHN0YWNrU3RhcnRGdW5jdGlvblxuICB9KTtcbn1cblxuLy8gRVhURU5TSU9OISBhbGxvd3MgZm9yIHdlbGwgYmVoYXZlZCBlcnJvcnMgZGVmaW5lZCBlbHNld2hlcmUuXG5hc3NlcnQuZmFpbCA9IGZhaWw7XG5cbi8vIDQuIFB1cmUgYXNzZXJ0aW9uIHRlc3RzIHdoZXRoZXIgYSB2YWx1ZSBpcyB0cnV0aHksIGFzIGRldGVybWluZWRcbi8vIGJ5ICEhZ3VhcmQuXG4vLyBhc3NlcnQub2soZ3VhcmQsIG1lc3NhZ2Vfb3B0KTtcbi8vIFRoaXMgc3RhdGVtZW50IGlzIGVxdWl2YWxlbnQgdG8gYXNzZXJ0LmVxdWFsKHRydWUsICEhZ3VhcmQsXG4vLyBtZXNzYWdlX29wdCk7LiBUbyB0ZXN0IHN0cmljdGx5IGZvciB0aGUgdmFsdWUgdHJ1ZSwgdXNlXG4vLyBhc3NlcnQuc3RyaWN0RXF1YWwodHJ1ZSwgZ3VhcmQsIG1lc3NhZ2Vfb3B0KTsuXG5cbmZ1bmN0aW9uIG9rKHZhbHVlLCBtZXNzYWdlKSB7XG4gIGlmICghdmFsdWUpIGZhaWwodmFsdWUsIHRydWUsIG1lc3NhZ2UsICc9PScsIGFzc2VydC5vayk7XG59XG5hc3NlcnQub2sgPSBvaztcblxuLy8gNS4gVGhlIGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzaGFsbG93LCBjb2VyY2l2ZSBlcXVhbGl0eSB3aXRoXG4vLyA9PS5cbi8vIGFzc2VydC5lcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5lcXVhbCA9IGZ1bmN0aW9uIGVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UpIHtcbiAgaWYgKGFjdHVhbCAhPSBleHBlY3RlZCkgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnPT0nLCBhc3NlcnQuZXF1YWwpO1xufTtcblxuLy8gNi4gVGhlIG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHdoZXRoZXIgdHdvIG9iamVjdHMgYXJlIG5vdCBlcXVhbFxuLy8gd2l0aCAhPSBhc3NlcnQubm90RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90RXF1YWwgPSBmdW5jdGlvbiBub3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT0gZXhwZWN0ZWQpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICchPScsIGFzc2VydC5ub3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDcuIFRoZSBlcXVpdmFsZW5jZSBhc3NlcnRpb24gdGVzdHMgYSBkZWVwIGVxdWFsaXR5IHJlbGF0aW9uLlxuLy8gYXNzZXJ0LmRlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5kZWVwRXF1YWwgPSBmdW5jdGlvbiBkZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoIV9kZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCkpIHtcbiAgICBmYWlsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2UsICdkZWVwRXF1YWwnLCBhc3NlcnQuZGVlcEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSB7XG4gIC8vIDcuMS4gQWxsIGlkZW50aWNhbCB2YWx1ZXMgYXJlIGVxdWl2YWxlbnQsIGFzIGRldGVybWluZWQgYnkgPT09LlxuICBpZiAoYWN0dWFsID09PSBleHBlY3RlZCkge1xuICAgIHJldHVybiB0cnVlO1xuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0J1ZmZlcihhY3R1YWwpICYmIHV0aWwuaXNCdWZmZXIoZXhwZWN0ZWQpKSB7XG4gICAgaWYgKGFjdHVhbC5sZW5ndGggIT0gZXhwZWN0ZWQubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFjdHVhbC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKGFjdHVhbFtpXSAhPT0gZXhwZWN0ZWRbaV0pIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcblxuICAvLyA3LjIuIElmIHRoZSBleHBlY3RlZCB2YWx1ZSBpcyBhIERhdGUgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIERhdGUgb2JqZWN0IHRoYXQgcmVmZXJzIHRvIHRoZSBzYW1lIHRpbWUuXG4gIH0gZWxzZSBpZiAodXRpbC5pc0RhdGUoYWN0dWFsKSAmJiB1dGlsLmlzRGF0ZShleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsLmdldFRpbWUoKSA9PT0gZXhwZWN0ZWQuZ2V0VGltZSgpO1xuXG4gIC8vIDcuMyBJZiB0aGUgZXhwZWN0ZWQgdmFsdWUgaXMgYSBSZWdFeHAgb2JqZWN0LCB0aGUgYWN0dWFsIHZhbHVlIGlzXG4gIC8vIGVxdWl2YWxlbnQgaWYgaXQgaXMgYWxzbyBhIFJlZ0V4cCBvYmplY3Qgd2l0aCB0aGUgc2FtZSBzb3VyY2UgYW5kXG4gIC8vIHByb3BlcnRpZXMgKGBnbG9iYWxgLCBgbXVsdGlsaW5lYCwgYGxhc3RJbmRleGAsIGBpZ25vcmVDYXNlYCkuXG4gIH0gZWxzZSBpZiAodXRpbC5pc1JlZ0V4cChhY3R1YWwpICYmIHV0aWwuaXNSZWdFeHAoZXhwZWN0ZWQpKSB7XG4gICAgcmV0dXJuIGFjdHVhbC5zb3VyY2UgPT09IGV4cGVjdGVkLnNvdXJjZSAmJlxuICAgICAgICAgICBhY3R1YWwuZ2xvYmFsID09PSBleHBlY3RlZC5nbG9iYWwgJiZcbiAgICAgICAgICAgYWN0dWFsLm11bHRpbGluZSA9PT0gZXhwZWN0ZWQubXVsdGlsaW5lICYmXG4gICAgICAgICAgIGFjdHVhbC5sYXN0SW5kZXggPT09IGV4cGVjdGVkLmxhc3RJbmRleCAmJlxuICAgICAgICAgICBhY3R1YWwuaWdub3JlQ2FzZSA9PT0gZXhwZWN0ZWQuaWdub3JlQ2FzZTtcblxuICAvLyA3LjQuIE90aGVyIHBhaXJzIHRoYXQgZG8gbm90IGJvdGggcGFzcyB0eXBlb2YgdmFsdWUgPT0gJ29iamVjdCcsXG4gIC8vIGVxdWl2YWxlbmNlIGlzIGRldGVybWluZWQgYnkgPT0uXG4gIH0gZWxzZSBpZiAoIXV0aWwuaXNPYmplY3QoYWN0dWFsKSAmJiAhdXRpbC5pc09iamVjdChleHBlY3RlZCkpIHtcbiAgICByZXR1cm4gYWN0dWFsID09IGV4cGVjdGVkO1xuXG4gIC8vIDcuNSBGb3IgYWxsIG90aGVyIE9iamVjdCBwYWlycywgaW5jbHVkaW5nIEFycmF5IG9iamVjdHMsIGVxdWl2YWxlbmNlIGlzXG4gIC8vIGRldGVybWluZWQgYnkgaGF2aW5nIHRoZSBzYW1lIG51bWJlciBvZiBvd25lZCBwcm9wZXJ0aWVzIChhcyB2ZXJpZmllZFxuICAvLyB3aXRoIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCksIHRoZSBzYW1lIHNldCBvZiBrZXlzXG4gIC8vIChhbHRob3VnaCBub3QgbmVjZXNzYXJpbHkgdGhlIHNhbWUgb3JkZXIpLCBlcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnlcbiAgLy8gY29ycmVzcG9uZGluZyBrZXksIGFuZCBhbiBpZGVudGljYWwgJ3Byb3RvdHlwZScgcHJvcGVydHkuIE5vdGU6IHRoaXNcbiAgLy8gYWNjb3VudHMgZm9yIGJvdGggbmFtZWQgYW5kIGluZGV4ZWQgcHJvcGVydGllcyBvbiBBcnJheXMuXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG9iakVxdWl2KGFjdHVhbCwgZXhwZWN0ZWQpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGlzQXJndW1lbnRzKG9iamVjdCkge1xuICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iamVjdCkgPT0gJ1tvYmplY3QgQXJndW1lbnRzXSc7XG59XG5cbmZ1bmN0aW9uIG9iakVxdWl2KGEsIGIpIHtcbiAgaWYgKHV0aWwuaXNOdWxsT3JVbmRlZmluZWQoYSkgfHwgdXRpbC5pc051bGxPclVuZGVmaW5lZChiKSlcbiAgICByZXR1cm4gZmFsc2U7XG4gIC8vIGFuIGlkZW50aWNhbCAncHJvdG90eXBlJyBwcm9wZXJ0eS5cbiAgaWYgKGEucHJvdG90eXBlICE9PSBiLnByb3RvdHlwZSkgcmV0dXJuIGZhbHNlO1xuICAvL35+fkkndmUgbWFuYWdlZCB0byBicmVhayBPYmplY3Qua2V5cyB0aHJvdWdoIHNjcmV3eSBhcmd1bWVudHMgcGFzc2luZy5cbiAgLy8gICBDb252ZXJ0aW5nIHRvIGFycmF5IHNvbHZlcyB0aGUgcHJvYmxlbS5cbiAgaWYgKGlzQXJndW1lbnRzKGEpKSB7XG4gICAgaWYgKCFpc0FyZ3VtZW50cyhiKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBhID0gcFNsaWNlLmNhbGwoYSk7XG4gICAgYiA9IHBTbGljZS5jYWxsKGIpO1xuICAgIHJldHVybiBfZGVlcEVxdWFsKGEsIGIpO1xuICB9XG4gIHRyeSB7XG4gICAgdmFyIGthID0gb2JqZWN0S2V5cyhhKSxcbiAgICAgICAga2IgPSBvYmplY3RLZXlzKGIpLFxuICAgICAgICBrZXksIGk7XG4gIH0gY2F0Y2ggKGUpIHsvL2hhcHBlbnMgd2hlbiBvbmUgaXMgYSBzdHJpbmcgbGl0ZXJhbCBhbmQgdGhlIG90aGVyIGlzbid0XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIC8vIGhhdmluZyB0aGUgc2FtZSBudW1iZXIgb2Ygb3duZWQgcHJvcGVydGllcyAoa2V5cyBpbmNvcnBvcmF0ZXNcbiAgLy8gaGFzT3duUHJvcGVydHkpXG4gIGlmIChrYS5sZW5ndGggIT0ga2IubGVuZ3RoKVxuICAgIHJldHVybiBmYWxzZTtcbiAgLy90aGUgc2FtZSBzZXQgb2Yga2V5cyAoYWx0aG91Z2ggbm90IG5lY2Vzc2FyaWx5IHRoZSBzYW1lIG9yZGVyKSxcbiAga2Euc29ydCgpO1xuICBrYi5zb3J0KCk7XG4gIC8vfn5+Y2hlYXAga2V5IHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoa2FbaV0gIT0ga2JbaV0pXG4gICAgICByZXR1cm4gZmFsc2U7XG4gIH1cbiAgLy9lcXVpdmFsZW50IHZhbHVlcyBmb3IgZXZlcnkgY29ycmVzcG9uZGluZyBrZXksIGFuZFxuICAvL35+fnBvc3NpYmx5IGV4cGVuc2l2ZSBkZWVwIHRlc3RcbiAgZm9yIChpID0ga2EubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBrZXkgPSBrYVtpXTtcbiAgICBpZiAoIV9kZWVwRXF1YWwoYVtrZXldLCBiW2tleV0pKSByZXR1cm4gZmFsc2U7XG4gIH1cbiAgcmV0dXJuIHRydWU7XG59XG5cbi8vIDguIFRoZSBub24tZXF1aXZhbGVuY2UgYXNzZXJ0aW9uIHRlc3RzIGZvciBhbnkgZGVlcCBpbmVxdWFsaXR5LlxuLy8gYXNzZXJ0Lm5vdERlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlX29wdCk7XG5cbmFzc2VydC5ub3REZWVwRXF1YWwgPSBmdW5jdGlvbiBub3REZWVwRXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoX2RlZXBFcXVhbChhY3R1YWwsIGV4cGVjdGVkKSkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJ25vdERlZXBFcXVhbCcsIGFzc2VydC5ub3REZWVwRXF1YWwpO1xuICB9XG59O1xuXG4vLyA5LiBUaGUgc3RyaWN0IGVxdWFsaXR5IGFzc2VydGlvbiB0ZXN0cyBzdHJpY3QgZXF1YWxpdHksIGFzIGRldGVybWluZWQgYnkgPT09LlxuLy8gYXNzZXJ0LnN0cmljdEVxdWFsKGFjdHVhbCwgZXhwZWN0ZWQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnN0cmljdEVxdWFsID0gZnVuY3Rpb24gc3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICBpZiAoYWN0dWFsICE9PSBleHBlY3RlZCkge1xuICAgIGZhaWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZSwgJz09PScsIGFzc2VydC5zdHJpY3RFcXVhbCk7XG4gIH1cbn07XG5cbi8vIDEwLiBUaGUgc3RyaWN0IG5vbi1lcXVhbGl0eSBhc3NlcnRpb24gdGVzdHMgZm9yIHN0cmljdCBpbmVxdWFsaXR5LCBhc1xuLy8gZGV0ZXJtaW5lZCBieSAhPT0uICBhc3NlcnQubm90U3RyaWN0RXF1YWwoYWN0dWFsLCBleHBlY3RlZCwgbWVzc2FnZV9vcHQpO1xuXG5hc3NlcnQubm90U3RyaWN0RXF1YWwgPSBmdW5jdGlvbiBub3RTdHJpY3RFcXVhbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlKSB7XG4gIGlmIChhY3R1YWwgPT09IGV4cGVjdGVkKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCBtZXNzYWdlLCAnIT09JywgYXNzZXJ0Lm5vdFN0cmljdEVxdWFsKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkge1xuICBpZiAoIWFjdHVhbCB8fCAhZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGV4cGVjdGVkKSA9PSAnW29iamVjdCBSZWdFeHBdJykge1xuICAgIHJldHVybiBleHBlY3RlZC50ZXN0KGFjdHVhbCk7XG4gIH0gZWxzZSBpZiAoYWN0dWFsIGluc3RhbmNlb2YgZXhwZWN0ZWQpIHtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSBlbHNlIGlmIChleHBlY3RlZC5jYWxsKHt9LCBhY3R1YWwpID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF90aHJvd3Moc2hvdWxkVGhyb3csIGJsb2NrLCBleHBlY3RlZCwgbWVzc2FnZSkge1xuICB2YXIgYWN0dWFsO1xuXG4gIGlmICh1dGlsLmlzU3RyaW5nKGV4cGVjdGVkKSkge1xuICAgIG1lc3NhZ2UgPSBleHBlY3RlZDtcbiAgICBleHBlY3RlZCA9IG51bGw7XG4gIH1cblxuICB0cnkge1xuICAgIGJsb2NrKCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBhY3R1YWwgPSBlO1xuICB9XG5cbiAgbWVzc2FnZSA9IChleHBlY3RlZCAmJiBleHBlY3RlZC5uYW1lID8gJyAoJyArIGV4cGVjdGVkLm5hbWUgKyAnKS4nIDogJy4nKSArXG4gICAgICAgICAgICAobWVzc2FnZSA/ICcgJyArIG1lc3NhZ2UgOiAnLicpO1xuXG4gIGlmIChzaG91bGRUaHJvdyAmJiAhYWN0dWFsKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnTWlzc2luZyBleHBlY3RlZCBleGNlcHRpb24nICsgbWVzc2FnZSk7XG4gIH1cblxuICBpZiAoIXNob3VsZFRocm93ICYmIGV4cGVjdGVkRXhjZXB0aW9uKGFjdHVhbCwgZXhwZWN0ZWQpKSB7XG4gICAgZmFpbChhY3R1YWwsIGV4cGVjdGVkLCAnR290IHVud2FudGVkIGV4Y2VwdGlvbicgKyBtZXNzYWdlKTtcbiAgfVxuXG4gIGlmICgoc2hvdWxkVGhyb3cgJiYgYWN0dWFsICYmIGV4cGVjdGVkICYmXG4gICAgICAhZXhwZWN0ZWRFeGNlcHRpb24oYWN0dWFsLCBleHBlY3RlZCkpIHx8ICghc2hvdWxkVGhyb3cgJiYgYWN0dWFsKSkge1xuICAgIHRocm93IGFjdHVhbDtcbiAgfVxufVxuXG4vLyAxMS4gRXhwZWN0ZWQgdG8gdGhyb3cgYW4gZXJyb3I6XG4vLyBhc3NlcnQudGhyb3dzKGJsb2NrLCBFcnJvcl9vcHQsIG1lc3NhZ2Vfb3B0KTtcblxuYXNzZXJ0LnRocm93cyA9IGZ1bmN0aW9uKGJsb2NrLCAvKm9wdGlvbmFsKi9lcnJvciwgLypvcHRpb25hbCovbWVzc2FnZSkge1xuICBfdGhyb3dzLmFwcGx5KHRoaXMsIFt0cnVlXS5jb25jYXQocFNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xufTtcblxuLy8gRVhURU5TSU9OISBUaGlzIGlzIGFubm95aW5nIHRvIHdyaXRlIG91dHNpZGUgdGhpcyBtb2R1bGUuXG5hc3NlcnQuZG9lc05vdFRocm93ID0gZnVuY3Rpb24oYmxvY2ssIC8qb3B0aW9uYWwqL21lc3NhZ2UpIHtcbiAgX3Rocm93cy5hcHBseSh0aGlzLCBbZmFsc2VdLmNvbmNhdChwU2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG59O1xuXG5hc3NlcnQuaWZFcnJvciA9IGZ1bmN0aW9uKGVycikgeyBpZiAoZXJyKSB7dGhyb3cgZXJyO319O1xuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgIGlmIChoYXNPd24uY2FsbChvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICB9XG4gIHJldHVybiBrZXlzO1xufTtcbiIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTJcblxuLyoqXG4gKiBJZiBgQnVmZmVyLl91c2VUeXBlZEFycmF5c2A6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBVc2UgT2JqZWN0IGltcGxlbWVudGF0aW9uIChjb21wYXRpYmxlIGRvd24gdG8gSUU2KVxuICovXG5CdWZmZXIuX3VzZVR5cGVkQXJyYXlzID0gKGZ1bmN0aW9uICgpIHtcbiAgLy8gRGV0ZWN0IGlmIGJyb3dzZXIgc3VwcG9ydHMgVHlwZWQgQXJyYXlzLiBTdXBwb3J0ZWQgYnJvd3NlcnMgYXJlIElFIDEwKywgRmlyZWZveCA0KyxcbiAgLy8gQ2hyb21lIDcrLCBTYWZhcmkgNS4xKywgT3BlcmEgMTEuNissIGlPUyA0LjIrLiBJZiB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZGluZ1xuICAvLyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YCBpbnN0YW5jZXMsIHRoZW4gdGhhdCdzIHRoZSBzYW1lIGFzIG5vIGBVaW50OEFycmF5YCBzdXBwb3J0XG4gIC8vIGJlY2F1c2Ugd2UgbmVlZCB0byBiZSBhYmxlIHRvIGFkZCBhbGwgdGhlIG5vZGUgQnVmZmVyIEFQSSBtZXRob2RzLiBUaGlzIGlzIGFuIGlzc3VlXG4gIC8vIGluIEZpcmVmb3ggNC0yOS4gTm93IGZpeGVkOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzhcbiAgdHJ5IHtcbiAgICB2YXIgYnVmID0gbmV3IEFycmF5QnVmZmVyKDApXG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KGJ1ZilcbiAgICBhcnIuZm9vID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfVxuICAgIHJldHVybiA0MiA9PT0gYXJyLmZvbygpICYmXG4gICAgICAgIHR5cGVvZiBhcnIuc3ViYXJyYXkgPT09ICdmdW5jdGlvbicgLy8gQ2hyb21lIDktMTAgbGFjayBgc3ViYXJyYXlgXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufSkoKVxuXG4vKipcbiAqIENsYXNzOiBCdWZmZXJcbiAqID09PT09PT09PT09PT1cbiAqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGFyZSBhdWdtZW50ZWRcbiAqIHdpdGggZnVuY3Rpb24gcHJvcGVydGllcyBmb3IgYWxsIHRoZSBub2RlIGBCdWZmZXJgIEFQSSBmdW5jdGlvbnMuIFdlIHVzZVxuICogYFVpbnQ4QXJyYXlgIHNvIHRoYXQgc3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXQgcmV0dXJuc1xuICogYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogQnkgYXVnbWVudGluZyB0aGUgaW5zdGFuY2VzLCB3ZSBjYW4gYXZvaWQgbW9kaWZ5aW5nIHRoZSBgVWludDhBcnJheWBcbiAqIHByb3RvdHlwZS5cbiAqL1xuZnVuY3Rpb24gQnVmZmVyIChzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKSB7XG4gIGlmICghKHRoaXMgaW5zdGFuY2VvZiBCdWZmZXIpKVxuICAgIHJldHVybiBuZXcgQnVmZmVyKHN1YmplY3QsIGVuY29kaW5nLCBub1plcm8pXG5cbiAgdmFyIHR5cGUgPSB0eXBlb2Ygc3ViamVjdFxuXG4gIC8vIFdvcmthcm91bmQ6IG5vZGUncyBiYXNlNjQgaW1wbGVtZW50YXRpb24gYWxsb3dzIGZvciBub24tcGFkZGVkIHN0cmluZ3NcbiAgLy8gd2hpbGUgYmFzZTY0LWpzIGRvZXMgbm90LlxuICBpZiAoZW5jb2RpbmcgPT09ICdiYXNlNjQnICYmIHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgc3ViamVjdCA9IHN0cmluZ3RyaW0oc3ViamVjdClcbiAgICB3aGlsZSAoc3ViamVjdC5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgICBzdWJqZWN0ID0gc3ViamVjdCArICc9J1xuICAgIH1cbiAgfVxuXG4gIC8vIEZpbmQgdGhlIGxlbmd0aFxuICB2YXIgbGVuZ3RoXG4gIGlmICh0eXBlID09PSAnbnVtYmVyJylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdClcbiAgZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpXG4gICAgbGVuZ3RoID0gQnVmZmVyLmJ5dGVMZW5ndGgoc3ViamVjdCwgZW5jb2RpbmcpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdvYmplY3QnKVxuICAgIGxlbmd0aCA9IGNvZXJjZShzdWJqZWN0Lmxlbmd0aCkgLy8gYXNzdW1lIHRoYXQgb2JqZWN0IGlzIGFycmF5LWxpa2VcbiAgZWxzZVxuICAgIHRocm93IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgbmVlZHMgdG8gYmUgYSBudW1iZXIsIGFycmF5IG9yIHN0cmluZy4nKVxuXG4gIHZhciBidWZcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICAvLyBQcmVmZXJyZWQ6IFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlIGZvciBiZXN0IHBlcmZvcm1hbmNlXG4gICAgYnVmID0gQnVmZmVyLl9hdWdtZW50KG5ldyBVaW50OEFycmF5KGxlbmd0aCkpXG4gIH0gZWxzZSB7XG4gICAgLy8gRmFsbGJhY2s6IFJldHVybiBUSElTIGluc3RhbmNlIG9mIEJ1ZmZlciAoY3JlYXRlZCBieSBgbmV3YClcbiAgICBidWYgPSB0aGlzXG4gICAgYnVmLmxlbmd0aCA9IGxlbmd0aFxuICAgIGJ1Zi5faXNCdWZmZXIgPSB0cnVlXG4gIH1cblxuICB2YXIgaVxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiB0eXBlb2Ygc3ViamVjdC5ieXRlTGVuZ3RoID09PSAnbnVtYmVyJykge1xuICAgIC8vIFNwZWVkIG9wdGltaXphdGlvbiAtLSB1c2Ugc2V0IGlmIHdlJ3JlIGNvcHlpbmcgZnJvbSBhIHR5cGVkIGFycmF5XG4gICAgYnVmLl9zZXQoc3ViamVjdClcbiAgfSBlbHNlIGlmIChpc0FycmF5aXNoKHN1YmplY3QpKSB7XG4gICAgLy8gVHJlYXQgYXJyYXktaXNoIG9iamVjdHMgYXMgYSBieXRlIGFycmF5XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpKVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0LnJlYWRVSW50OChpKVxuICAgICAgZWxzZVxuICAgICAgICBidWZbaV0gPSBzdWJqZWN0W2ldXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgYnVmLndyaXRlKHN1YmplY3QsIDAsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09ICdudW1iZXInICYmICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzICYmICFub1plcm8pIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGJ1ZltpXSA9IDBcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbi8vIFNUQVRJQyBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAncmF3JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gKGIpIHtcbiAgcmV0dXJuICEhKGIgIT09IG51bGwgJiYgYiAhPT0gdW5kZWZpbmVkICYmIGIuX2lzQnVmZmVyKVxufVxuXG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGZ1bmN0aW9uIChzdHIsIGVuY29kaW5nKSB7XG4gIHZhciByZXRcbiAgc3RyID0gc3RyICsgJydcbiAgc3dpdGNoIChlbmNvZGluZyB8fCAndXRmOCcpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgICAgcmV0ID0gc3RyLmxlbmd0aCAvIDJcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gdXRmOFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAncmF3JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IGJhc2U2NFRvQnl0ZXMoc3RyKS5sZW5ndGhcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggKiAyXG4gICAgICBicmVha1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gZW5jb2RpbmcnKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIChsaXN0LCB0b3RhbExlbmd0aCkge1xuICBhc3NlcnQoaXNBcnJheShsaXN0KSwgJ1VzYWdlOiBCdWZmZXIuY29uY2F0KGxpc3QsIFt0b3RhbExlbmd0aF0pXFxuJyArXG4gICAgICAnbGlzdCBzaG91bGQgYmUgYW4gQXJyYXkuJylcblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcigwKVxuICB9IGVsc2UgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgcmV0dXJuIGxpc3RbMF1cbiAgfVxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdG90YWxMZW5ndGggIT09ICdudW1iZXInKSB7XG4gICAgdG90YWxMZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRvdGFsTGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZiA9IG5ldyBCdWZmZXIodG90YWxMZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGl0ZW0gPSBsaXN0W2ldXG4gICAgaXRlbS5jb3B5KGJ1ZiwgcG9zKVxuICAgIHBvcyArPSBpdGVtLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZcbn1cblxuLy8gQlVGRkVSIElOU1RBTkNFIE1FVEhPRFNcbi8vID09PT09PT09PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIF9oZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGFzc2VydChzdHJMZW4gJSAyID09PSAwLCAnSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGJ5dGUgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgYXNzZXJ0KCFpc05hTihieXRlKSwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG4gICAgYnVmW29mZnNldCArIGldID0gYnl0ZVxuICB9XG4gIEJ1ZmZlci5fY2hhcnNXcml0dGVuID0gaSAqIDJcbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gX3V0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9hc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIGNoYXJzV3JpdHRlbiA9IEJ1ZmZlci5fY2hhcnNXcml0dGVuID1cbiAgICBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBfYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG4gIHJldHVybiBjaGFyc1dyaXR0ZW5cbn1cblxuZnVuY3Rpb24gX3V0ZjE2bGVXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gU3VwcG9ydCBib3RoIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZylcbiAgLy8gYW5kIHRoZSBsZWdhY3kgKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIGlmICghaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHsgIC8vIGxlZ2FjeVxuICAgIHZhciBzd2FwID0gZW5jb2RpbmdcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIG9mZnNldCA9IGxlbmd0aFxuICAgIGxlbmd0aCA9IHN3YXBcbiAgfVxuXG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG5cbiAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcgfHwgJ3V0ZjgnKS50b0xvd2VyQ2FzZSgpXG4gIHN0YXJ0ID0gTnVtYmVyKHN0YXJ0KSB8fCAwXG4gIGVuZCA9IChlbmQgIT09IHVuZGVmaW5lZClcbiAgICA/IE51bWJlcihlbmQpXG4gICAgOiBlbmQgPSBzZWxmLmxlbmd0aFxuXG4gIC8vIEZhc3RwYXRoIGVtcHR5IHN0cmluZ3NcbiAgaWYgKGVuZCA9PT0gc3RhcnQpXG4gICAgcmV0dXJuICcnXG5cbiAgdmFyIHJldFxuICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IF9oZXhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgICByZXQgPSBfdXRmOFNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIHJldCA9IF9hc2NpaVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICByZXQgPSBfYmluYXJ5U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgIHJldCA9IF9iYXNlNjRTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0ID0gX3V0ZjE2bGVTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRhcmdldF9zdGFydCwgc3RhcnQsIGVuZCkge1xuICB2YXIgc291cmNlID0gdGhpc1xuXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICghdGFyZ2V0X3N0YXJ0KSB0YXJnZXRfc3RhcnQgPSAwXG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgc291cmNlLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnc291cmNlRW5kIDwgc291cmNlU3RhcnQnKVxuICBhc3NlcnQodGFyZ2V0X3N0YXJ0ID49IDAgJiYgdGFyZ2V0X3N0YXJ0IDwgdGFyZ2V0Lmxlbmd0aCxcbiAgICAgICd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCBzb3VyY2UubGVuZ3RoLCAnc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gc291cmNlLmxlbmd0aCwgJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpXG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRfc3RhcnQgPCBlbmQgLSBzdGFydClcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0ICsgc3RhcnRcblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcblxuICBpZiAobGVuIDwgMTAwIHx8ICFCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0X3N0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICB9IGVsc2Uge1xuICAgIHRhcmdldC5fc2V0KHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSwgdGFyZ2V0X3N0YXJ0KVxuICB9XG59XG5cbmZ1bmN0aW9uIF9iYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gX3V0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXMgPSAnJ1xuICB2YXIgdG1wID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgaWYgKGJ1ZltpXSA8PSAweDdGKSB7XG4gICAgICByZXMgKz0gZGVjb2RlVXRmOENoYXIodG1wKSArIFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICAgICAgdG1wID0gJydcbiAgICB9IGVsc2Uge1xuICAgICAgdG1wICs9ICclJyArIGJ1ZltpXS50b1N0cmluZygxNilcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzICsgZGVjb2RlVXRmOENoYXIodG1wKVxufVxuXG5mdW5jdGlvbiBfYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspXG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIF9iaW5hcnlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHJldHVybiBfYXNjaWlTbGljZShidWYsIHN0YXJ0LCBlbmQpXG59XG5cbmZ1bmN0aW9uIF9oZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIGJ5dGVzW2krMV0gKiAyNTYpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gY2xhbXAoc3RhcnQsIGxlbiwgMClcbiAgZW5kID0gY2xhbXAoZW5kLCBsZW4sIGxlbilcblxuICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIHJldHVybiBCdWZmZXIuX2F1Z21lbnQodGhpcy5zdWJhcnJheShzdGFydCwgZW5kKSlcbiAgfSBlbHNlIHtcbiAgICB2YXIgc2xpY2VMZW4gPSBlbmQgLSBzdGFydFxuICAgIHZhciBuZXdCdWYgPSBuZXcgQnVmZmVyKHNsaWNlTGVuLCB1bmRlZmluZWQsIHRydWUpXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzbGljZUxlbjsgaSsrKSB7XG4gICAgICBuZXdCdWZbaV0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gICAgcmV0dXJuIG5ld0J1ZlxuICB9XG59XG5cbi8vIGBnZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uIChvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5nZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLnJlYWRVSW50OChvZmZzZXQpXG59XG5cbi8vIGBzZXRgIHdpbGwgYmUgcmVtb3ZlZCBpbiBOb2RlIDAuMTMrXG5CdWZmZXIucHJvdG90eXBlLnNldCA9IGZ1bmN0aW9uICh2LCBvZmZzZXQpIHtcbiAgY29uc29sZS5sb2coJy5zZXQoKSBpcyBkZXByZWNhdGVkLiBBY2Nlc3MgdXNpbmcgYXJyYXkgaW5kZXhlcyBpbnN0ZWFkLicpXG4gIHJldHVybiB0aGlzLndyaXRlVUludDgodiwgb2Zmc2V0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZFVJbnQxNiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWxcbiAgaWYgKGxpdHRsZUVuZGlhbikge1xuICAgIHZhbCA9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdIDw8IDhcbiAgfSBlbHNlIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDEgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDFdXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MzIgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICBpZiAob2Zmc2V0ICsgMiA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAyXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gICAgdmFsIHw9IGJ1ZltvZmZzZXRdXG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldCArIDNdIDw8IDI0ID4+PiAwKVxuICB9IGVsc2Uge1xuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsID0gYnVmW29mZnNldCArIDFdIDw8IDE2XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDJdIDw8IDhcbiAgICBpZiAob2Zmc2V0ICsgMyA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgM11cbiAgICB2YWwgPSB2YWwgKyAoYnVmW29mZnNldF0gPDwgMjQgPj4+IDApXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZFVJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLFxuICAgICAgICAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgdmFyIG5lZyA9IHRoaXNbb2Zmc2V0XSAmIDB4ODBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xXG4gIGVsc2VcbiAgICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbmZ1bmN0aW9uIF9yZWFkSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsID0gX3JlYWRVSW50MTYoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgdHJ1ZSlcbiAgdmFyIG5lZyA9IHZhbCAmIDB4ODAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDMyKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDAwMDAwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmZmZmZmZmIC0gdmFsICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZEZsb2F0IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRGbG9hdCh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkRG91YmxlIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgKyA3IDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHJldHVybiBpZWVlNzU0LnJlYWQoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRG91YmxlKHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZilcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpIHJldHVyblxuXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmYpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBmb3IgKHZhciBpID0gMCwgaiA9IE1hdGgubWluKGxlbiAtIG9mZnNldCwgMik7IGkgPCBqOyBpKyspIHtcbiAgICBidWZbb2Zmc2V0ICsgaV0gPVxuICAgICAgICAodmFsdWUgJiAoMHhmZiA8PCAoOCAqIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpKSkpID4+PlxuICAgICAgICAgICAgKGxpdHRsZUVuZGlhbiA/IGkgOiAxIC0gaSkgKiA4XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZVVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZVVJbnQzMiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ3RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZ1aW50KHZhbHVlLCAweGZmZmZmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDQpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlID4+PiAobGl0dGxlRW5kaWFuID8gaSA6IDMgLSBpKSAqIDgpICYgMHhmZlxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgPCB0aGlzLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmLCAtMHg4MClcbiAgfVxuXG4gIGlmIChvZmZzZXQgPj0gdGhpcy5sZW5ndGgpXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgdGhpcy53cml0ZVVJbnQ4KHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgdGhpcy53cml0ZVVJbnQ4KDB4ZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDE2IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZiwgLTB4ODAwMClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIF93cml0ZVVJbnQxNihidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG4gIGVsc2VcbiAgICBfd3JpdGVVSW50MTYoYnVmLCAweGZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MzIoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgMHhmZmZmZmZmZiArIHZhbHVlICsgMSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQzMih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZJRUVFNzU0KHZhbHVlLCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsXG4gICAgICAgICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gZmlsbCh2YWx1ZSwgc3RhcnQ9MCwgZW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiAodmFsdWUsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCF2YWx1ZSkgdmFsdWUgPSAwXG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCkgZW5kID0gdGhpcy5sZW5ndGhcblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUuY2hhckNvZGVBdCgwKVxuICB9XG5cbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSwgJ3ZhbHVlIGlzIG5vdCBhIG51bWJlcicpXG4gIGFzc2VydChlbmQgPj0gc3RhcnQsICdlbmQgPCBzdGFydCcpXG5cbiAgLy8gRmlsbCAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm5cbiAgaWYgKHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm5cblxuICBhc3NlcnQoc3RhcnQgPj0gMCAmJiBzdGFydCA8IHRoaXMubGVuZ3RoLCAnc3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChlbmQgPj0gMCAmJiBlbmQgPD0gdGhpcy5sZW5ndGgsICdlbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpKyspIHtcbiAgICB0aGlzW2ldID0gdmFsdWVcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBvdXQgPSBbXVxuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkrKykge1xuICAgIG91dFtpXSA9IHRvSGV4KHRoaXNbaV0pXG4gICAgaWYgKGkgPT09IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMpIHtcbiAgICAgIG91dFtpICsgMV0gPSAnLi4uJ1xuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBvdXQuam9pbignICcpICsgJz4nXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBgQXJyYXlCdWZmZXJgIHdpdGggdGhlICpjb3BpZWQqIG1lbW9yeSBvZiB0aGUgYnVmZmVyIGluc3RhbmNlLlxuICogQWRkZWQgaW4gTm9kZSAwLjEyLiBPbmx5IGF2YWlsYWJsZSBpbiBicm93c2VycyB0aGF0IHN1cHBvcnQgQXJyYXlCdWZmZXIuXG4gKi9cbkJ1ZmZlci5wcm90b3R5cGUudG9BcnJheUJ1ZmZlciA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgICByZXR1cm4gKG5ldyBCdWZmZXIodGhpcykpLmJ1ZmZlclxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkodGhpcy5sZW5ndGgpXG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gYnVmLmxlbmd0aDsgaSA8IGxlbjsgaSArPSAxKVxuICAgICAgICBidWZbaV0gPSB0aGlzW2ldXG4gICAgICByZXR1cm4gYnVmLmJ1ZmZlclxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0J1ZmZlci50b0FycmF5QnVmZmVyIG5vdCBzdXBwb3J0ZWQgaW4gdGhpcyBicm93c2VyJylcbiAgfVxufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbmZ1bmN0aW9uIHN0cmluZ3RyaW0gKHN0cikge1xuICBpZiAoc3RyLnRyaW0pIHJldHVybiBzdHIudHJpbSgpXG4gIHJldHVybiBzdHIucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpXG59XG5cbnZhciBCUCA9IEJ1ZmZlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBdWdtZW50IGEgVWludDhBcnJheSAqaW5zdGFuY2UqIChub3QgdGhlIFVpbnQ4QXJyYXkgY2xhc3MhKSB3aXRoIEJ1ZmZlciBtZXRob2RzXG4gKi9cbkJ1ZmZlci5fYXVnbWVudCA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgYXJyLl9pc0J1ZmZlciA9IHRydWVcblxuICAvLyBzYXZlIHJlZmVyZW5jZSB0byBvcmlnaW5hbCBVaW50OEFycmF5IGdldC9zZXQgbWV0aG9kcyBiZWZvcmUgb3ZlcndyaXRpbmdcbiAgYXJyLl9nZXQgPSBhcnIuZ2V0XG4gIGFyci5fc2V0ID0gYXJyLnNldFxuXG4gIC8vIGRlcHJlY2F0ZWQsIHdpbGwgYmUgcmVtb3ZlZCBpbiBub2RlIDAuMTMrXG4gIGFyci5nZXQgPSBCUC5nZXRcbiAgYXJyLnNldCA9IEJQLnNldFxuXG4gIGFyci53cml0ZSA9IEJQLndyaXRlXG4gIGFyci50b1N0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0xvY2FsZVN0cmluZyA9IEJQLnRvU3RyaW5nXG4gIGFyci50b0pTT04gPSBCUC50b0pTT05cbiAgYXJyLmNvcHkgPSBCUC5jb3B5XG4gIGFyci5zbGljZSA9IEJQLnNsaWNlXG4gIGFyci5yZWFkVUludDggPSBCUC5yZWFkVUludDhcbiAgYXJyLnJlYWRVSW50MTZMRSA9IEJQLnJlYWRVSW50MTZMRVxuICBhcnIucmVhZFVJbnQxNkJFID0gQlAucmVhZFVJbnQxNkJFXG4gIGFyci5yZWFkVUludDMyTEUgPSBCUC5yZWFkVUludDMyTEVcbiAgYXJyLnJlYWRVSW50MzJCRSA9IEJQLnJlYWRVSW50MzJCRVxuICBhcnIucmVhZEludDggPSBCUC5yZWFkSW50OFxuICBhcnIucmVhZEludDE2TEUgPSBCUC5yZWFkSW50MTZMRVxuICBhcnIucmVhZEludDE2QkUgPSBCUC5yZWFkSW50MTZCRVxuICBhcnIucmVhZEludDMyTEUgPSBCUC5yZWFkSW50MzJMRVxuICBhcnIucmVhZEludDMyQkUgPSBCUC5yZWFkSW50MzJCRVxuICBhcnIucmVhZEZsb2F0TEUgPSBCUC5yZWFkRmxvYXRMRVxuICBhcnIucmVhZEZsb2F0QkUgPSBCUC5yZWFkRmxvYXRCRVxuICBhcnIucmVhZERvdWJsZUxFID0gQlAucmVhZERvdWJsZUxFXG4gIGFyci5yZWFkRG91YmxlQkUgPSBCUC5yZWFkRG91YmxlQkVcbiAgYXJyLndyaXRlVUludDggPSBCUC53cml0ZVVJbnQ4XG4gIGFyci53cml0ZVVJbnQxNkxFID0gQlAud3JpdGVVSW50MTZMRVxuICBhcnIud3JpdGVVSW50MTZCRSA9IEJQLndyaXRlVUludDE2QkVcbiAgYXJyLndyaXRlVUludDMyTEUgPSBCUC53cml0ZVVJbnQzMkxFXG4gIGFyci53cml0ZVVJbnQzMkJFID0gQlAud3JpdGVVSW50MzJCRVxuICBhcnIud3JpdGVJbnQ4ID0gQlAud3JpdGVJbnQ4XG4gIGFyci53cml0ZUludDE2TEUgPSBCUC53cml0ZUludDE2TEVcbiAgYXJyLndyaXRlSW50MTZCRSA9IEJQLndyaXRlSW50MTZCRVxuICBhcnIud3JpdGVJbnQzMkxFID0gQlAud3JpdGVJbnQzMkxFXG4gIGFyci53cml0ZUludDMyQkUgPSBCUC53cml0ZUludDMyQkVcbiAgYXJyLndyaXRlRmxvYXRMRSA9IEJQLndyaXRlRmxvYXRMRVxuICBhcnIud3JpdGVGbG9hdEJFID0gQlAud3JpdGVGbG9hdEJFXG4gIGFyci53cml0ZURvdWJsZUxFID0gQlAud3JpdGVEb3VibGVMRVxuICBhcnIud3JpdGVEb3VibGVCRSA9IEJQLndyaXRlRG91YmxlQkVcbiAgYXJyLmZpbGwgPSBCUC5maWxsXG4gIGFyci5pbnNwZWN0ID0gQlAuaW5zcGVjdFxuICBhcnIudG9BcnJheUJ1ZmZlciA9IEJQLnRvQXJyYXlCdWZmZXJcblxuICByZXR1cm4gYXJyXG59XG5cbi8vIHNsaWNlKHN0YXJ0LCBlbmQpXG5mdW5jdGlvbiBjbGFtcCAoaW5kZXgsIGxlbiwgZGVmYXVsdFZhbHVlKSB7XG4gIGlmICh0eXBlb2YgaW5kZXggIT09ICdudW1iZXInKSByZXR1cm4gZGVmYXVsdFZhbHVlXG4gIGluZGV4ID0gfn5pbmRleDsgIC8vIENvZXJjZSB0byBpbnRlZ2VyLlxuICBpZiAoaW5kZXggPj0gbGVuKSByZXR1cm4gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgaW5kZXggKz0gbGVuXG4gIGlmIChpbmRleCA+PSAwKSByZXR1cm4gaW5kZXhcbiAgcmV0dXJuIDBcbn1cblxuZnVuY3Rpb24gY29lcmNlIChsZW5ndGgpIHtcbiAgLy8gQ29lcmNlIGxlbmd0aCB0byBhIG51bWJlciAocG9zc2libHkgTmFOKSwgcm91bmQgdXBcbiAgLy8gaW4gY2FzZSBpdCdzIGZyYWN0aW9uYWwgKGUuZy4gMTIzLjQ1NikgdGhlbiBkbyBhXG4gIC8vIGRvdWJsZSBuZWdhdGUgdG8gY29lcmNlIGEgTmFOIHRvIDAuIEVhc3ksIHJpZ2h0P1xuICBsZW5ndGggPSB+fk1hdGguY2VpbCgrbGVuZ3RoKVxuICByZXR1cm4gbGVuZ3RoIDwgMCA/IDAgOiBsZW5ndGhcbn1cblxuZnVuY3Rpb24gaXNBcnJheSAoc3ViamVjdCkge1xuICByZXR1cm4gKEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKHN1YmplY3QpIHtcbiAgICByZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHN1YmplY3QpID09PSAnW29iamVjdCBBcnJheV0nXG4gIH0pKHN1YmplY3QpXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXlpc2ggKHN1YmplY3QpIHtcbiAgcmV0dXJuIGlzQXJyYXkoc3ViamVjdCkgfHwgQnVmZmVyLmlzQnVmZmVyKHN1YmplY3QpIHx8XG4gICAgICBzdWJqZWN0ICYmIHR5cGVvZiBzdWJqZWN0ID09PSAnb2JqZWN0JyAmJlxuICAgICAgdHlwZW9mIHN1YmplY3QubGVuZ3RoID09PSAnbnVtYmVyJ1xufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGlmIChiIDw9IDB4N0YpXG4gICAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSlcbiAgICBlbHNlIHtcbiAgICAgIHZhciBzdGFydCA9IGlcbiAgICAgIGlmIChiID49IDB4RDgwMCAmJiBiIDw9IDB4REZGRikgaSsrXG4gICAgICB2YXIgaCA9IGVuY29kZVVSSUNvbXBvbmVudChzdHIuc2xpY2Uoc3RhcnQsIGkrMSkpLnN1YnN0cigxKS5zcGxpdCgnJScpXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGgubGVuZ3RoOyBqKyspXG4gICAgICAgIGJ5dGVBcnJheS5wdXNoKHBhcnNlSW50KGhbal0sIDE2KSlcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoc3RyKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgdmFyIHBvc1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKVxuICAgICAgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBkZWNvZGVVdGY4Q2hhciAoc3RyKSB7XG4gIHRyeSB7XG4gICAgcmV0dXJuIGRlY29kZVVSSUNvbXBvbmVudChzdHIpXG4gIH0gY2F0Y2ggKGVycikge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKDB4RkZGRCkgLy8gVVRGIDggaW52YWxpZCBjaGFyXG4gIH1cbn1cblxuLypcbiAqIFdlIGhhdmUgdG8gbWFrZSBzdXJlIHRoYXQgdGhlIHZhbHVlIGlzIGEgdmFsaWQgaW50ZWdlci4gVGhpcyBtZWFucyB0aGF0IGl0XG4gKiBpcyBub24tbmVnYXRpdmUuIEl0IGhhcyBubyBmcmFjdGlvbmFsIGNvbXBvbmVudCBhbmQgdGhhdCBpdCBkb2VzIG5vdFxuICogZXhjZWVkIHRoZSBtYXhpbXVtIGFsbG93ZWQgdmFsdWUuXG4gKi9cbmZ1bmN0aW9uIHZlcmlmdWludCAodmFsdWUsIG1heCkge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPj0gMCwgJ3NwZWNpZmllZCBhIG5lZ2F0aXZlIHZhbHVlIGZvciB3cml0aW5nIGFuIHVuc2lnbmVkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGlzIGxhcmdlciB0aGFuIG1heGltdW0gdmFsdWUgZm9yIHR5cGUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZnNpbnQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxuICBhc3NlcnQoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlLCAndmFsdWUgaGFzIGEgZnJhY3Rpb25hbCBjb21wb25lbnQnKVxufVxuXG5mdW5jdGlvbiB2ZXJpZklFRUU3NTQgKHZhbHVlLCBtYXgsIG1pbikge1xuICBhc3NlcnQodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJywgJ2Nhbm5vdCB3cml0ZSBhIG5vbi1udW1iZXIgYXMgYSBudW1iZXInKVxuICBhc3NlcnQodmFsdWUgPD0gbWF4LCAndmFsdWUgbGFyZ2VyIHRoYW4gbWF4aW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KHZhbHVlID49IG1pbiwgJ3ZhbHVlIHNtYWxsZXIgdGhhbiBtaW5pbXVtIGFsbG93ZWQgdmFsdWUnKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQgKHRlc3QsIG1lc3NhZ2UpIHtcbiAgaWYgKCF0ZXN0KSB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSB8fCAnRmFpbGVkIGFzc2VydGlvbicpXG59XG4iLCJ2YXIgbG9va3VwID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nO1xuXG47KGZ1bmN0aW9uIChleHBvcnRzKSB7XG5cdCd1c2Ugc3RyaWN0JztcblxuICB2YXIgQXJyID0gKHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJylcbiAgICA/IFVpbnQ4QXJyYXlcbiAgICA6IEFycmF5XG5cblx0dmFyIFBMVVMgICA9ICcrJy5jaGFyQ29kZUF0KDApXG5cdHZhciBTTEFTSCAgPSAnLycuY2hhckNvZGVBdCgwKVxuXHR2YXIgTlVNQkVSID0gJzAnLmNoYXJDb2RlQXQoMClcblx0dmFyIExPV0VSICA9ICdhJy5jaGFyQ29kZUF0KDApXG5cdHZhciBVUFBFUiAgPSAnQScuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTKVxuXHRcdFx0cmV0dXJuIDYyIC8vICcrJ1xuXHRcdGlmIChjb2RlID09PSBTTEFTSClcblx0XHRcdHJldHVybiA2MyAvLyAnLydcblx0XHRpZiAoY29kZSA8IE5VTUJFUilcblx0XHRcdHJldHVybiAtMSAvL25vIG1hdGNoXG5cdFx0aWYgKGNvZGUgPCBOVU1CRVIgKyAxMClcblx0XHRcdHJldHVybiBjb2RlIC0gTlVNQkVSICsgMjYgKyAyNlxuXHRcdGlmIChjb2RlIDwgVVBQRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gVVBQRVJcblx0XHRpZiAoY29kZSA8IExPV0VSICsgMjYpXG5cdFx0XHRyZXR1cm4gY29kZSAtIExPV0VSICsgMjZcblx0fVxuXG5cdGZ1bmN0aW9uIGI2NFRvQnl0ZUFycmF5IChiNjQpIHtcblx0XHR2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuXG5cdFx0aWYgKGI2NC5sZW5ndGggJSA0ID4gMCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0Jylcblx0XHR9XG5cblx0XHQvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuXHRcdC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcblx0XHQvLyByZXByZXNlbnQgb25lIGJ5dGVcblx0XHQvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcblx0XHQvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG5cdFx0dmFyIGxlbiA9IGI2NC5sZW5ndGhcblx0XHRwbGFjZUhvbGRlcnMgPSAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMikgPyAyIDogJz0nID09PSBiNjQuY2hhckF0KGxlbiAtIDEpID8gMSA6IDBcblxuXHRcdC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuXHRcdGFyciA9IG5ldyBBcnIoYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuXHRcdGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gYjY0Lmxlbmd0aCAtIDQgOiBiNjQubGVuZ3RoXG5cblx0XHR2YXIgTCA9IDBcblxuXHRcdGZ1bmN0aW9uIHB1c2ggKHYpIHtcblx0XHRcdGFycltMKytdID0gdlxuXHRcdH1cblxuXHRcdGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTgpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgMTIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAyKSkgPDwgNikgfCBkZWNvZGUoYjY0LmNoYXJBdChpICsgMykpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDAwMCkgPj4gMTYpXG5cdFx0XHRwdXNoKCh0bXAgJiAweEZGMDApID4+IDgpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fVxuXG5cdFx0aWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAyKSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMSkpID4+IDQpXG5cdFx0XHRwdXNoKHRtcCAmIDB4RkYpXG5cdFx0fSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcblx0XHRcdHRtcCA9IChkZWNvZGUoYjY0LmNoYXJBdChpKSkgPDwgMTApIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPDwgNCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA+PiAyKVxuXHRcdFx0cHVzaCgodG1wID4+IDgpICYgMHhGRilcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRyZXR1cm4gYXJyXG5cdH1cblxuXHRmdW5jdGlvbiB1aW50OFRvQmFzZTY0ICh1aW50OCkge1xuXHRcdHZhciBpLFxuXHRcdFx0ZXh0cmFCeXRlcyA9IHVpbnQ4Lmxlbmd0aCAlIDMsIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG5cdFx0XHRvdXRwdXQgPSBcIlwiLFxuXHRcdFx0dGVtcCwgbGVuZ3RoXG5cblx0XHRmdW5jdGlvbiBlbmNvZGUgKG51bSkge1xuXHRcdFx0cmV0dXJuIGxvb2t1cC5jaGFyQXQobnVtKVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG5cdFx0XHRyZXR1cm4gZW5jb2RlKG51bSA+PiAxOCAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiAxMiAmIDB4M0YpICsgZW5jb2RlKG51bSA+PiA2ICYgMHgzRikgKyBlbmNvZGUobnVtICYgMHgzRilcblx0XHR9XG5cblx0XHQvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG5cdFx0Zm9yIChpID0gMCwgbGVuZ3RoID0gdWludDgubGVuZ3RoIC0gZXh0cmFCeXRlczsgaSA8IGxlbmd0aDsgaSArPSAzKSB7XG5cdFx0XHR0ZW1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuXHRcdFx0b3V0cHV0ICs9IHRyaXBsZXRUb0Jhc2U2NCh0ZW1wKVxuXHRcdH1cblxuXHRcdC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcblx0XHRzd2l0Y2ggKGV4dHJhQnl0ZXMpIHtcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0dGVtcCA9IHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUodGVtcCA+PiAyKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9PSdcblx0XHRcdFx0YnJlYWtcblx0XHRcdGNhc2UgMjpcblx0XHRcdFx0dGVtcCA9ICh1aW50OFt1aW50OC5sZW5ndGggLSAyXSA8PCA4KSArICh1aW50OFt1aW50OC5sZW5ndGggLSAxXSlcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDEwKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wID4+IDQpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSgodGVtcCA8PCAyKSAmIDB4M0YpXG5cdFx0XHRcdG91dHB1dCArPSAnPSdcblx0XHRcdFx0YnJlYWtcblx0XHR9XG5cblx0XHRyZXR1cm4gb3V0cHV0XG5cdH1cblxuXHRleHBvcnRzLnRvQnl0ZUFycmF5ID0gYjY0VG9CeXRlQXJyYXlcblx0ZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gdWludDhUb0Jhc2U2NFxufSh0eXBlb2YgZXhwb3J0cyA9PT0gJ3VuZGVmaW5lZCcgPyAodGhpcy5iYXNlNjRqcyA9IHt9KSA6IGV4cG9ydHMpKVxuIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24oYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSxcbiAgICAgIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDEsXG4gICAgICBlTWF4ID0gKDEgPDwgZUxlbikgLSAxLFxuICAgICAgZUJpYXMgPSBlTWF4ID4+IDEsXG4gICAgICBuQml0cyA9IC03LFxuICAgICAgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwLFxuICAgICAgZCA9IGlzTEUgPyAtMSA6IDEsXG4gICAgICBzID0gYnVmZmVyW29mZnNldCArIGldO1xuXG4gIGkgKz0gZDtcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKTtcbiAgcyA+Pj0gKC1uQml0cyk7XG4gIG5CaXRzICs9IGVMZW47XG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpO1xuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpO1xuICBlID4+PSAoLW5CaXRzKTtcbiAgbkJpdHMgKz0gbUxlbjtcbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCk7XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzO1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSk7XG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKTtcbiAgICBlID0gZSAtIGVCaWFzO1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pO1xufTtcblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjLFxuICAgICAgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMSxcbiAgICAgIGVNYXggPSAoMSA8PCBlTGVuKSAtIDEsXG4gICAgICBlQmlhcyA9IGVNYXggPj4gMSxcbiAgICAgIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKSxcbiAgICAgIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKSxcbiAgICAgIGQgPSBpc0xFID8gMSA6IC0xLFxuICAgICAgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMDtcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKTtcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMDtcbiAgICBlID0gZU1heDtcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMik7XG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tO1xuICAgICAgYyAqPSAyO1xuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gYztcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpO1xuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrKztcbiAgICAgIGMgLz0gMjtcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwO1xuICAgICAgZSA9IGVNYXg7XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IGUgKyBlQmlhcztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pO1xuICAgICAgZSA9IDA7XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCk7XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbTtcbiAgZUxlbiArPSBtTGVuO1xuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpO1xuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyODtcbn07XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKmdsb2JhbCB3aW5kb3csIGdsb2JhbCovXG52YXIgdXRpbCA9IHJlcXVpcmUoXCJ1dGlsXCIpXG52YXIgYXNzZXJ0ID0gcmVxdWlyZShcImFzc2VydFwiKVxuXG52YXIgc2xpY2UgPSBBcnJheS5wcm90b3R5cGUuc2xpY2VcbnZhciBjb25zb2xlXG52YXIgdGltZXMgPSB7fVxuXG5pZiAodHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiAmJiBnbG9iYWwuY29uc29sZSkge1xuICAgIGNvbnNvbGUgPSBnbG9iYWwuY29uc29sZVxufSBlbHNlIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmIHdpbmRvdy5jb25zb2xlKSB7XG4gICAgY29uc29sZSA9IHdpbmRvdy5jb25zb2xlXG59IGVsc2Uge1xuICAgIGNvbnNvbGUgPSB7fVxufVxuXG52YXIgZnVuY3Rpb25zID0gW1xuICAgIFtsb2csIFwibG9nXCJdXG4gICAgLCBbaW5mbywgXCJpbmZvXCJdXG4gICAgLCBbd2FybiwgXCJ3YXJuXCJdXG4gICAgLCBbZXJyb3IsIFwiZXJyb3JcIl1cbiAgICAsIFt0aW1lLCBcInRpbWVcIl1cbiAgICAsIFt0aW1lRW5kLCBcInRpbWVFbmRcIl1cbiAgICAsIFt0cmFjZSwgXCJ0cmFjZVwiXVxuICAgICwgW2RpciwgXCJkaXJcIl1cbiAgICAsIFthc3NlcnQsIFwiYXNzZXJ0XCJdXG5dXG5cbmZvciAodmFyIGkgPSAwOyBpIDwgZnVuY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHR1cGxlID0gZnVuY3Rpb25zW2ldXG4gICAgdmFyIGYgPSB0dXBsZVswXVxuICAgIHZhciBuYW1lID0gdHVwbGVbMV1cblxuICAgIGlmICghY29uc29sZVtuYW1lXSkge1xuICAgICAgICBjb25zb2xlW25hbWVdID0gZlxuICAgIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb25zb2xlXG5cbmZ1bmN0aW9uIGxvZygpIHt9XG5cbmZ1bmN0aW9uIGluZm8oKSB7XG4gICAgY29uc29sZS5sb2cuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKVxufVxuXG5mdW5jdGlvbiB3YXJuKCkge1xuICAgIGNvbnNvbGUubG9nLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cylcbn1cblxuZnVuY3Rpb24gZXJyb3IoKSB7XG4gICAgY29uc29sZS53YXJuLmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cylcbn1cblxuZnVuY3Rpb24gdGltZShsYWJlbCkge1xuICAgIHRpbWVzW2xhYmVsXSA9IERhdGUubm93KClcbn1cblxuZnVuY3Rpb24gdGltZUVuZChsYWJlbCkge1xuICAgIHZhciB0aW1lID0gdGltZXNbbGFiZWxdXG4gICAgaWYgKCF0aW1lKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIk5vIHN1Y2ggbGFiZWw6IFwiICsgbGFiZWwpXG4gICAgfVxuXG4gICAgdmFyIGR1cmF0aW9uID0gRGF0ZS5ub3coKSAtIHRpbWVcbiAgICBjb25zb2xlLmxvZyhsYWJlbCArIFwiOiBcIiArIGR1cmF0aW9uICsgXCJtc1wiKVxufVxuXG5mdW5jdGlvbiB0cmFjZSgpIHtcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKClcbiAgICBlcnIubmFtZSA9IFwiVHJhY2VcIlxuICAgIGVyci5tZXNzYWdlID0gdXRpbC5mb3JtYXQuYXBwbHkobnVsbCwgYXJndW1lbnRzKVxuICAgIGNvbnNvbGUuZXJyb3IoZXJyLnN0YWNrKVxufVxuXG5mdW5jdGlvbiBkaXIob2JqZWN0KSB7XG4gICAgY29uc29sZS5sb2codXRpbC5pbnNwZWN0KG9iamVjdCkgKyBcIlxcblwiKVxufVxuXG5mdW5jdGlvbiBhc3NlcnQoZXhwcmVzc2lvbikge1xuICAgIGlmICghZXhwcmVzc2lvbikge1xuICAgICAgICB2YXIgYXJyID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpXG4gICAgICAgIGFzc2VydC5vayhmYWxzZSwgdXRpbC5mb3JtYXQuYXBwbHkobnVsbCwgYXJyKSlcbiAgICB9XG59XG5cbn0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pIiwidmFyIEJ1ZmZlciA9IHJlcXVpcmUoJ2J1ZmZlcicpLkJ1ZmZlcjtcbnZhciBpbnRTaXplID0gNDtcbnZhciB6ZXJvQnVmZmVyID0gbmV3IEJ1ZmZlcihpbnRTaXplKTsgemVyb0J1ZmZlci5maWxsKDApO1xudmFyIGNocnN6ID0gODtcblxuZnVuY3Rpb24gdG9BcnJheShidWYsIGJpZ0VuZGlhbikge1xuICBpZiAoKGJ1Zi5sZW5ndGggJSBpbnRTaXplKSAhPT0gMCkge1xuICAgIHZhciBsZW4gPSBidWYubGVuZ3RoICsgKGludFNpemUgLSAoYnVmLmxlbmd0aCAlIGludFNpemUpKTtcbiAgICBidWYgPSBCdWZmZXIuY29uY2F0KFtidWYsIHplcm9CdWZmZXJdLCBsZW4pO1xuICB9XG5cbiAgdmFyIGFyciA9IFtdO1xuICB2YXIgZm4gPSBiaWdFbmRpYW4gPyBidWYucmVhZEludDMyQkUgOiBidWYucmVhZEludDMyTEU7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnVmLmxlbmd0aDsgaSArPSBpbnRTaXplKSB7XG4gICAgYXJyLnB1c2goZm4uY2FsbChidWYsIGkpKTtcbiAgfVxuICByZXR1cm4gYXJyO1xufVxuXG5mdW5jdGlvbiB0b0J1ZmZlcihhcnIsIHNpemUsIGJpZ0VuZGlhbikge1xuICB2YXIgYnVmID0gbmV3IEJ1ZmZlcihzaXplKTtcbiAgdmFyIGZuID0gYmlnRW5kaWFuID8gYnVmLndyaXRlSW50MzJCRSA6IGJ1Zi53cml0ZUludDMyTEU7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgZm4uY2FsbChidWYsIGFycltpXSwgaSAqIDQsIHRydWUpO1xuICB9XG4gIHJldHVybiBidWY7XG59XG5cbmZ1bmN0aW9uIGhhc2goYnVmLCBmbiwgaGFzaFNpemUsIGJpZ0VuZGlhbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSBidWYgPSBuZXcgQnVmZmVyKGJ1Zik7XG4gIHZhciBhcnIgPSBmbih0b0FycmF5KGJ1ZiwgYmlnRW5kaWFuKSwgYnVmLmxlbmd0aCAqIGNocnN6KTtcbiAgcmV0dXJuIHRvQnVmZmVyKGFyciwgaGFzaFNpemUsIGJpZ0VuZGlhbik7XG59XG5cbm1vZHVsZS5leHBvcnRzID0geyBoYXNoOiBoYXNoIH07XG4iLCJ2YXIgQnVmZmVyID0gcmVxdWlyZSgnYnVmZmVyJykuQnVmZmVyXG52YXIgc2hhID0gcmVxdWlyZSgnLi9zaGEnKVxudmFyIHNoYTI1NiA9IHJlcXVpcmUoJy4vc2hhMjU2JylcbnZhciBybmcgPSByZXF1aXJlKCcuL3JuZycpXG52YXIgbWQ1ID0gcmVxdWlyZSgnLi9tZDUnKVxuXG52YXIgYWxnb3JpdGhtcyA9IHtcbiAgc2hhMTogc2hhLFxuICBzaGEyNTY6IHNoYTI1NixcbiAgbWQ1OiBtZDVcbn1cblxudmFyIGJsb2Nrc2l6ZSA9IDY0XG52YXIgemVyb0J1ZmZlciA9IG5ldyBCdWZmZXIoYmxvY2tzaXplKTsgemVyb0J1ZmZlci5maWxsKDApXG5mdW5jdGlvbiBobWFjKGZuLCBrZXksIGRhdGEpIHtcbiAgaWYoIUJ1ZmZlci5pc0J1ZmZlcihrZXkpKSBrZXkgPSBuZXcgQnVmZmVyKGtleSlcbiAgaWYoIUJ1ZmZlci5pc0J1ZmZlcihkYXRhKSkgZGF0YSA9IG5ldyBCdWZmZXIoZGF0YSlcblxuICBpZihrZXkubGVuZ3RoID4gYmxvY2tzaXplKSB7XG4gICAga2V5ID0gZm4oa2V5KVxuICB9IGVsc2UgaWYoa2V5Lmxlbmd0aCA8IGJsb2Nrc2l6ZSkge1xuICAgIGtleSA9IEJ1ZmZlci5jb25jYXQoW2tleSwgemVyb0J1ZmZlcl0sIGJsb2Nrc2l6ZSlcbiAgfVxuXG4gIHZhciBpcGFkID0gbmV3IEJ1ZmZlcihibG9ja3NpemUpLCBvcGFkID0gbmV3IEJ1ZmZlcihibG9ja3NpemUpXG4gIGZvcih2YXIgaSA9IDA7IGkgPCBibG9ja3NpemU7IGkrKykge1xuICAgIGlwYWRbaV0gPSBrZXlbaV0gXiAweDM2XG4gICAgb3BhZFtpXSA9IGtleVtpXSBeIDB4NUNcbiAgfVxuXG4gIHZhciBoYXNoID0gZm4oQnVmZmVyLmNvbmNhdChbaXBhZCwgZGF0YV0pKVxuICByZXR1cm4gZm4oQnVmZmVyLmNvbmNhdChbb3BhZCwgaGFzaF0pKVxufVxuXG5mdW5jdGlvbiBoYXNoKGFsZywga2V5KSB7XG4gIGFsZyA9IGFsZyB8fCAnc2hhMSdcbiAgdmFyIGZuID0gYWxnb3JpdGhtc1thbGddXG4gIHZhciBidWZzID0gW11cbiAgdmFyIGxlbmd0aCA9IDBcbiAgaWYoIWZuKSBlcnJvcignYWxnb3JpdGhtOicsIGFsZywgJ2lzIG5vdCB5ZXQgc3VwcG9ydGVkJylcbiAgcmV0dXJuIHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICBpZighQnVmZmVyLmlzQnVmZmVyKGRhdGEpKSBkYXRhID0gbmV3IEJ1ZmZlcihkYXRhKVxuICAgICAgICBcbiAgICAgIGJ1ZnMucHVzaChkYXRhKVxuICAgICAgbGVuZ3RoICs9IGRhdGEubGVuZ3RoXG4gICAgICByZXR1cm4gdGhpc1xuICAgIH0sXG4gICAgZGlnZXN0OiBmdW5jdGlvbiAoZW5jKSB7XG4gICAgICB2YXIgYnVmID0gQnVmZmVyLmNvbmNhdChidWZzKVxuICAgICAgdmFyIHIgPSBrZXkgPyBobWFjKGZuLCBrZXksIGJ1ZikgOiBmbihidWYpXG4gICAgICBidWZzID0gbnVsbFxuICAgICAgcmV0dXJuIGVuYyA/IHIudG9TdHJpbmcoZW5jKSA6IHJcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gZXJyb3IgKCkge1xuICB2YXIgbSA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKS5qb2luKCcgJylcbiAgdGhyb3cgbmV3IEVycm9yKFtcbiAgICBtLFxuICAgICd3ZSBhY2NlcHQgcHVsbCByZXF1ZXN0cycsXG4gICAgJ2h0dHA6Ly9naXRodWIuY29tL2RvbWluaWN0YXJyL2NyeXB0by1icm93c2VyaWZ5J1xuICAgIF0uam9pbignXFxuJykpXG59XG5cbmV4cG9ydHMuY3JlYXRlSGFzaCA9IGZ1bmN0aW9uIChhbGcpIHsgcmV0dXJuIGhhc2goYWxnKSB9XG5leHBvcnRzLmNyZWF0ZUhtYWMgPSBmdW5jdGlvbiAoYWxnLCBrZXkpIHsgcmV0dXJuIGhhc2goYWxnLCBrZXkpIH1cbmV4cG9ydHMucmFuZG9tQnl0ZXMgPSBmdW5jdGlvbihzaXplLCBjYWxsYmFjaykge1xuICBpZiAoY2FsbGJhY2sgJiYgY2FsbGJhY2suY2FsbCkge1xuICAgIHRyeSB7XG4gICAgICBjYWxsYmFjay5jYWxsKHRoaXMsIHVuZGVmaW5lZCwgbmV3IEJ1ZmZlcihybmcoc2l6ZSkpKVxuICAgIH0gY2F0Y2ggKGVycikgeyBjYWxsYmFjayhlcnIpIH1cbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihybmcoc2l6ZSkpXG4gIH1cbn1cblxuZnVuY3Rpb24gZWFjaChhLCBmKSB7XG4gIGZvcih2YXIgaSBpbiBhKVxuICAgIGYoYVtpXSwgaSlcbn1cblxuLy8gdGhlIGxlYXN0IEkgY2FuIGRvIGlzIG1ha2UgZXJyb3IgbWVzc2FnZXMgZm9yIHRoZSByZXN0IG9mIHRoZSBub2RlLmpzL2NyeXB0byBhcGkuXG5lYWNoKFsnY3JlYXRlQ3JlZGVudGlhbHMnXG4sICdjcmVhdGVDaXBoZXInXG4sICdjcmVhdGVDaXBoZXJpdidcbiwgJ2NyZWF0ZURlY2lwaGVyJ1xuLCAnY3JlYXRlRGVjaXBoZXJpdidcbiwgJ2NyZWF0ZVNpZ24nXG4sICdjcmVhdGVWZXJpZnknXG4sICdjcmVhdGVEaWZmaWVIZWxsbWFuJ1xuLCAncGJrZGYyJ10sIGZ1bmN0aW9uIChuYW1lKSB7XG4gIGV4cG9ydHNbbmFtZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgZXJyb3IoJ3NvcnJ5LCcsIG5hbWUsICdpcyBub3QgaW1wbGVtZW50ZWQgeWV0JylcbiAgfVxufSlcbiIsIi8qXHJcbiAqIEEgSmF2YVNjcmlwdCBpbXBsZW1lbnRhdGlvbiBvZiB0aGUgUlNBIERhdGEgU2VjdXJpdHksIEluYy4gTUQ1IE1lc3NhZ2VcclxuICogRGlnZXN0IEFsZ29yaXRobSwgYXMgZGVmaW5lZCBpbiBSRkMgMTMyMS5cclxuICogVmVyc2lvbiAyLjEgQ29weXJpZ2h0IChDKSBQYXVsIEpvaG5zdG9uIDE5OTkgLSAyMDAyLlxyXG4gKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XHJcbiAqIERpc3RyaWJ1dGVkIHVuZGVyIHRoZSBCU0QgTGljZW5zZVxyXG4gKiBTZWUgaHR0cDovL3BhamhvbWUub3JnLnVrL2NyeXB0L21kNSBmb3IgbW9yZSBpbmZvLlxyXG4gKi9cclxuXHJcbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XHJcblxyXG4vKlxyXG4gKiBQZXJmb3JtIGEgc2ltcGxlIHNlbGYtdGVzdCB0byBzZWUgaWYgdGhlIFZNIGlzIHdvcmtpbmdcclxuICovXHJcbmZ1bmN0aW9uIG1kNV92bV90ZXN0KClcclxue1xyXG4gIHJldHVybiBoZXhfbWQ1KFwiYWJjXCIpID09IFwiOTAwMTUwOTgzY2QyNGZiMGQ2OTYzZjdkMjhlMTdmNzJcIjtcclxufVxyXG5cclxuLypcclxuICogQ2FsY3VsYXRlIHRoZSBNRDUgb2YgYW4gYXJyYXkgb2YgbGl0dGxlLWVuZGlhbiB3b3JkcywgYW5kIGEgYml0IGxlbmd0aFxyXG4gKi9cclxuZnVuY3Rpb24gY29yZV9tZDUoeCwgbGVuKVxyXG57XHJcbiAgLyogYXBwZW5kIHBhZGRpbmcgKi9cclxuICB4W2xlbiA+PiA1XSB8PSAweDgwIDw8ICgobGVuKSAlIDMyKTtcclxuICB4WygoKGxlbiArIDY0KSA+Pj4gOSkgPDwgNCkgKyAxNF0gPSBsZW47XHJcblxyXG4gIHZhciBhID0gIDE3MzI1ODQxOTM7XHJcbiAgdmFyIGIgPSAtMjcxNzMzODc5O1xyXG4gIHZhciBjID0gLTE3MzI1ODQxOTQ7XHJcbiAgdmFyIGQgPSAgMjcxNzMzODc4O1xyXG5cclxuICBmb3IodmFyIGkgPSAwOyBpIDwgeC5sZW5ndGg7IGkgKz0gMTYpXHJcbiAge1xyXG4gICAgdmFyIG9sZGEgPSBhO1xyXG4gICAgdmFyIG9sZGIgPSBiO1xyXG4gICAgdmFyIG9sZGMgPSBjO1xyXG4gICAgdmFyIG9sZGQgPSBkO1xyXG5cclxuICAgIGEgPSBtZDVfZmYoYSwgYiwgYywgZCwgeFtpKyAwXSwgNyAsIC02ODA4NzY5MzYpO1xyXG4gICAgZCA9IG1kNV9mZihkLCBhLCBiLCBjLCB4W2krIDFdLCAxMiwgLTM4OTU2NDU4Nik7XHJcbiAgICBjID0gbWQ1X2ZmKGMsIGQsIGEsIGIsIHhbaSsgMl0sIDE3LCAgNjA2MTA1ODE5KTtcclxuICAgIGIgPSBtZDVfZmYoYiwgYywgZCwgYSwgeFtpKyAzXSwgMjIsIC0xMDQ0NTI1MzMwKTtcclxuICAgIGEgPSBtZDVfZmYoYSwgYiwgYywgZCwgeFtpKyA0XSwgNyAsIC0xNzY0MTg4OTcpO1xyXG4gICAgZCA9IG1kNV9mZihkLCBhLCBiLCBjLCB4W2krIDVdLCAxMiwgIDEyMDAwODA0MjYpO1xyXG4gICAgYyA9IG1kNV9mZihjLCBkLCBhLCBiLCB4W2krIDZdLCAxNywgLTE0NzMyMzEzNDEpO1xyXG4gICAgYiA9IG1kNV9mZihiLCBjLCBkLCBhLCB4W2krIDddLCAyMiwgLTQ1NzA1OTgzKTtcclxuICAgIGEgPSBtZDVfZmYoYSwgYiwgYywgZCwgeFtpKyA4XSwgNyAsICAxNzcwMDM1NDE2KTtcclxuICAgIGQgPSBtZDVfZmYoZCwgYSwgYiwgYywgeFtpKyA5XSwgMTIsIC0xOTU4NDE0NDE3KTtcclxuICAgIGMgPSBtZDVfZmYoYywgZCwgYSwgYiwgeFtpKzEwXSwgMTcsIC00MjA2Myk7XHJcbiAgICBiID0gbWQ1X2ZmKGIsIGMsIGQsIGEsIHhbaSsxMV0sIDIyLCAtMTk5MDQwNDE2Mik7XHJcbiAgICBhID0gbWQ1X2ZmKGEsIGIsIGMsIGQsIHhbaSsxMl0sIDcgLCAgMTgwNDYwMzY4Mik7XHJcbiAgICBkID0gbWQ1X2ZmKGQsIGEsIGIsIGMsIHhbaSsxM10sIDEyLCAtNDAzNDExMDEpO1xyXG4gICAgYyA9IG1kNV9mZihjLCBkLCBhLCBiLCB4W2krMTRdLCAxNywgLTE1MDIwMDIyOTApO1xyXG4gICAgYiA9IG1kNV9mZihiLCBjLCBkLCBhLCB4W2krMTVdLCAyMiwgIDEyMzY1MzUzMjkpO1xyXG5cclxuICAgIGEgPSBtZDVfZ2coYSwgYiwgYywgZCwgeFtpKyAxXSwgNSAsIC0xNjU3OTY1MTApO1xyXG4gICAgZCA9IG1kNV9nZyhkLCBhLCBiLCBjLCB4W2krIDZdLCA5ICwgLTEwNjk1MDE2MzIpO1xyXG4gICAgYyA9IG1kNV9nZyhjLCBkLCBhLCBiLCB4W2krMTFdLCAxNCwgIDY0MzcxNzcxMyk7XHJcbiAgICBiID0gbWQ1X2dnKGIsIGMsIGQsIGEsIHhbaSsgMF0sIDIwLCAtMzczODk3MzAyKTtcclxuICAgIGEgPSBtZDVfZ2coYSwgYiwgYywgZCwgeFtpKyA1XSwgNSAsIC03MDE1NTg2OTEpO1xyXG4gICAgZCA9IG1kNV9nZyhkLCBhLCBiLCBjLCB4W2krMTBdLCA5ICwgIDM4MDE2MDgzKTtcclxuICAgIGMgPSBtZDVfZ2coYywgZCwgYSwgYiwgeFtpKzE1XSwgMTQsIC02NjA0NzgzMzUpO1xyXG4gICAgYiA9IG1kNV9nZyhiLCBjLCBkLCBhLCB4W2krIDRdLCAyMCwgLTQwNTUzNzg0OCk7XHJcbiAgICBhID0gbWQ1X2dnKGEsIGIsIGMsIGQsIHhbaSsgOV0sIDUgLCAgNTY4NDQ2NDM4KTtcclxuICAgIGQgPSBtZDVfZ2coZCwgYSwgYiwgYywgeFtpKzE0XSwgOSAsIC0xMDE5ODAzNjkwKTtcclxuICAgIGMgPSBtZDVfZ2coYywgZCwgYSwgYiwgeFtpKyAzXSwgMTQsIC0xODczNjM5NjEpO1xyXG4gICAgYiA9IG1kNV9nZyhiLCBjLCBkLCBhLCB4W2krIDhdLCAyMCwgIDExNjM1MzE1MDEpO1xyXG4gICAgYSA9IG1kNV9nZyhhLCBiLCBjLCBkLCB4W2krMTNdLCA1ICwgLTE0NDQ2ODE0NjcpO1xyXG4gICAgZCA9IG1kNV9nZyhkLCBhLCBiLCBjLCB4W2krIDJdLCA5ICwgLTUxNDAzNzg0KTtcclxuICAgIGMgPSBtZDVfZ2coYywgZCwgYSwgYiwgeFtpKyA3XSwgMTQsICAxNzM1MzI4NDczKTtcclxuICAgIGIgPSBtZDVfZ2coYiwgYywgZCwgYSwgeFtpKzEyXSwgMjAsIC0xOTI2NjA3NzM0KTtcclxuXHJcbiAgICBhID0gbWQ1X2hoKGEsIGIsIGMsIGQsIHhbaSsgNV0sIDQgLCAtMzc4NTU4KTtcclxuICAgIGQgPSBtZDVfaGgoZCwgYSwgYiwgYywgeFtpKyA4XSwgMTEsIC0yMDIyNTc0NDYzKTtcclxuICAgIGMgPSBtZDVfaGgoYywgZCwgYSwgYiwgeFtpKzExXSwgMTYsICAxODM5MDMwNTYyKTtcclxuICAgIGIgPSBtZDVfaGgoYiwgYywgZCwgYSwgeFtpKzE0XSwgMjMsIC0zNTMwOTU1Nik7XHJcbiAgICBhID0gbWQ1X2hoKGEsIGIsIGMsIGQsIHhbaSsgMV0sIDQgLCAtMTUzMDk5MjA2MCk7XHJcbiAgICBkID0gbWQ1X2hoKGQsIGEsIGIsIGMsIHhbaSsgNF0sIDExLCAgMTI3Mjg5MzM1Myk7XHJcbiAgICBjID0gbWQ1X2hoKGMsIGQsIGEsIGIsIHhbaSsgN10sIDE2LCAtMTU1NDk3NjMyKTtcclxuICAgIGIgPSBtZDVfaGgoYiwgYywgZCwgYSwgeFtpKzEwXSwgMjMsIC0xMDk0NzMwNjQwKTtcclxuICAgIGEgPSBtZDVfaGgoYSwgYiwgYywgZCwgeFtpKzEzXSwgNCAsICA2ODEyNzkxNzQpO1xyXG4gICAgZCA9IG1kNV9oaChkLCBhLCBiLCBjLCB4W2krIDBdLCAxMSwgLTM1ODUzNzIyMik7XHJcbiAgICBjID0gbWQ1X2hoKGMsIGQsIGEsIGIsIHhbaSsgM10sIDE2LCAtNzIyNTIxOTc5KTtcclxuICAgIGIgPSBtZDVfaGgoYiwgYywgZCwgYSwgeFtpKyA2XSwgMjMsICA3NjAyOTE4OSk7XHJcbiAgICBhID0gbWQ1X2hoKGEsIGIsIGMsIGQsIHhbaSsgOV0sIDQgLCAtNjQwMzY0NDg3KTtcclxuICAgIGQgPSBtZDVfaGgoZCwgYSwgYiwgYywgeFtpKzEyXSwgMTEsIC00MjE4MTU4MzUpO1xyXG4gICAgYyA9IG1kNV9oaChjLCBkLCBhLCBiLCB4W2krMTVdLCAxNiwgIDUzMDc0MjUyMCk7XHJcbiAgICBiID0gbWQ1X2hoKGIsIGMsIGQsIGEsIHhbaSsgMl0sIDIzLCAtOTk1MzM4NjUxKTtcclxuXHJcbiAgICBhID0gbWQ1X2lpKGEsIGIsIGMsIGQsIHhbaSsgMF0sIDYgLCAtMTk4NjMwODQ0KTtcclxuICAgIGQgPSBtZDVfaWkoZCwgYSwgYiwgYywgeFtpKyA3XSwgMTAsICAxMTI2ODkxNDE1KTtcclxuICAgIGMgPSBtZDVfaWkoYywgZCwgYSwgYiwgeFtpKzE0XSwgMTUsIC0xNDE2MzU0OTA1KTtcclxuICAgIGIgPSBtZDVfaWkoYiwgYywgZCwgYSwgeFtpKyA1XSwgMjEsIC01NzQzNDA1NSk7XHJcbiAgICBhID0gbWQ1X2lpKGEsIGIsIGMsIGQsIHhbaSsxMl0sIDYgLCAgMTcwMDQ4NTU3MSk7XHJcbiAgICBkID0gbWQ1X2lpKGQsIGEsIGIsIGMsIHhbaSsgM10sIDEwLCAtMTg5NDk4NjYwNik7XHJcbiAgICBjID0gbWQ1X2lpKGMsIGQsIGEsIGIsIHhbaSsxMF0sIDE1LCAtMTA1MTUyMyk7XHJcbiAgICBiID0gbWQ1X2lpKGIsIGMsIGQsIGEsIHhbaSsgMV0sIDIxLCAtMjA1NDkyMjc5OSk7XHJcbiAgICBhID0gbWQ1X2lpKGEsIGIsIGMsIGQsIHhbaSsgOF0sIDYgLCAgMTg3MzMxMzM1OSk7XHJcbiAgICBkID0gbWQ1X2lpKGQsIGEsIGIsIGMsIHhbaSsxNV0sIDEwLCAtMzA2MTE3NDQpO1xyXG4gICAgYyA9IG1kNV9paShjLCBkLCBhLCBiLCB4W2krIDZdLCAxNSwgLTE1NjAxOTgzODApO1xyXG4gICAgYiA9IG1kNV9paShiLCBjLCBkLCBhLCB4W2krMTNdLCAyMSwgIDEzMDkxNTE2NDkpO1xyXG4gICAgYSA9IG1kNV9paShhLCBiLCBjLCBkLCB4W2krIDRdLCA2ICwgLTE0NTUyMzA3MCk7XHJcbiAgICBkID0gbWQ1X2lpKGQsIGEsIGIsIGMsIHhbaSsxMV0sIDEwLCAtMTEyMDIxMDM3OSk7XHJcbiAgICBjID0gbWQ1X2lpKGMsIGQsIGEsIGIsIHhbaSsgMl0sIDE1LCAgNzE4Nzg3MjU5KTtcclxuICAgIGIgPSBtZDVfaWkoYiwgYywgZCwgYSwgeFtpKyA5XSwgMjEsIC0zNDM0ODU1NTEpO1xyXG5cclxuICAgIGEgPSBzYWZlX2FkZChhLCBvbGRhKTtcclxuICAgIGIgPSBzYWZlX2FkZChiLCBvbGRiKTtcclxuICAgIGMgPSBzYWZlX2FkZChjLCBvbGRjKTtcclxuICAgIGQgPSBzYWZlX2FkZChkLCBvbGRkKTtcclxuICB9XHJcbiAgcmV0dXJuIEFycmF5KGEsIGIsIGMsIGQpO1xyXG5cclxufVxyXG5cclxuLypcclxuICogVGhlc2UgZnVuY3Rpb25zIGltcGxlbWVudCB0aGUgZm91ciBiYXNpYyBvcGVyYXRpb25zIHRoZSBhbGdvcml0aG0gdXNlcy5cclxuICovXHJcbmZ1bmN0aW9uIG1kNV9jbW4ocSwgYSwgYiwgeCwgcywgdClcclxue1xyXG4gIHJldHVybiBzYWZlX2FkZChiaXRfcm9sKHNhZmVfYWRkKHNhZmVfYWRkKGEsIHEpLCBzYWZlX2FkZCh4LCB0KSksIHMpLGIpO1xyXG59XHJcbmZ1bmN0aW9uIG1kNV9mZihhLCBiLCBjLCBkLCB4LCBzLCB0KVxyXG57XHJcbiAgcmV0dXJuIG1kNV9jbW4oKGIgJiBjKSB8ICgofmIpICYgZCksIGEsIGIsIHgsIHMsIHQpO1xyXG59XHJcbmZ1bmN0aW9uIG1kNV9nZyhhLCBiLCBjLCBkLCB4LCBzLCB0KVxyXG57XHJcbiAgcmV0dXJuIG1kNV9jbW4oKGIgJiBkKSB8IChjICYgKH5kKSksIGEsIGIsIHgsIHMsIHQpO1xyXG59XHJcbmZ1bmN0aW9uIG1kNV9oaChhLCBiLCBjLCBkLCB4LCBzLCB0KVxyXG57XHJcbiAgcmV0dXJuIG1kNV9jbW4oYiBeIGMgXiBkLCBhLCBiLCB4LCBzLCB0KTtcclxufVxyXG5mdW5jdGlvbiBtZDVfaWkoYSwgYiwgYywgZCwgeCwgcywgdClcclxue1xyXG4gIHJldHVybiBtZDVfY21uKGMgXiAoYiB8ICh+ZCkpLCBhLCBiLCB4LCBzLCB0KTtcclxufVxyXG5cclxuLypcclxuICogQWRkIGludGVnZXJzLCB3cmFwcGluZyBhdCAyXjMyLiBUaGlzIHVzZXMgMTYtYml0IG9wZXJhdGlvbnMgaW50ZXJuYWxseVxyXG4gKiB0byB3b3JrIGFyb3VuZCBidWdzIGluIHNvbWUgSlMgaW50ZXJwcmV0ZXJzLlxyXG4gKi9cclxuZnVuY3Rpb24gc2FmZV9hZGQoeCwgeSlcclxue1xyXG4gIHZhciBsc3cgPSAoeCAmIDB4RkZGRikgKyAoeSAmIDB4RkZGRik7XHJcbiAgdmFyIG1zdyA9ICh4ID4+IDE2KSArICh5ID4+IDE2KSArIChsc3cgPj4gMTYpO1xyXG4gIHJldHVybiAobXN3IDw8IDE2KSB8IChsc3cgJiAweEZGRkYpO1xyXG59XHJcblxyXG4vKlxyXG4gKiBCaXR3aXNlIHJvdGF0ZSBhIDMyLWJpdCBudW1iZXIgdG8gdGhlIGxlZnQuXHJcbiAqL1xyXG5mdW5jdGlvbiBiaXRfcm9sKG51bSwgY250KVxyXG57XHJcbiAgcmV0dXJuIChudW0gPDwgY250KSB8IChudW0gPj4+ICgzMiAtIGNudCkpO1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1kNShidWYpIHtcclxuICByZXR1cm4gaGVscGVycy5oYXNoKGJ1ZiwgY29yZV9tZDUsIDE2KTtcclxufTtcclxuIiwiLy8gT3JpZ2luYWwgY29kZSBhZGFwdGVkIGZyb20gUm9iZXJ0IEtpZWZmZXIuXG4vLyBkZXRhaWxzIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9icm9vZmEvbm9kZS11dWlkXG4oZnVuY3Rpb24oKSB7XG4gIHZhciBfZ2xvYmFsID0gdGhpcztcblxuICB2YXIgbWF0aFJORywgd2hhdHdnUk5HO1xuXG4gIC8vIE5PVEU6IE1hdGgucmFuZG9tKCkgZG9lcyBub3QgZ3VhcmFudGVlIFwiY3J5cHRvZ3JhcGhpYyBxdWFsaXR5XCJcbiAgbWF0aFJORyA9IGZ1bmN0aW9uKHNpemUpIHtcbiAgICB2YXIgYnl0ZXMgPSBuZXcgQXJyYXkoc2l6ZSk7XG4gICAgdmFyIHI7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgcjsgaSA8IHNpemU7IGkrKykge1xuICAgICAgaWYgKChpICYgMHgwMykgPT0gMCkgciA9IE1hdGgucmFuZG9tKCkgKiAweDEwMDAwMDAwMDtcbiAgICAgIGJ5dGVzW2ldID0gciA+Pj4gKChpICYgMHgwMykgPDwgMykgJiAweGZmO1xuICAgIH1cblxuICAgIHJldHVybiBieXRlcztcbiAgfVxuXG4gIGlmIChfZ2xvYmFsLmNyeXB0byAmJiBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgd2hhdHdnUk5HID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoc2l6ZSk7XG4gICAgICBjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKGJ5dGVzKTtcbiAgICAgIHJldHVybiBieXRlcztcbiAgICB9XG4gIH1cblxuICBtb2R1bGUuZXhwb3J0cyA9IHdoYXR3Z1JORyB8fCBtYXRoUk5HO1xuXG59KCkpXG4iLCIvKlxuICogQSBKYXZhU2NyaXB0IGltcGxlbWVudGF0aW9uIG9mIHRoZSBTZWN1cmUgSGFzaCBBbGdvcml0aG0sIFNIQS0xLCBhcyBkZWZpbmVkXG4gKiBpbiBGSVBTIFBVQiAxODAtMVxuICogVmVyc2lvbiAyLjFhIENvcHlyaWdodCBQYXVsIEpvaG5zdG9uIDIwMDAgLSAyMDAyLlxuICogT3RoZXIgY29udHJpYnV0b3JzOiBHcmVnIEhvbHQsIEFuZHJldyBLZXBlcnQsIFlkbmFyLCBMb3N0aW5ldFxuICogRGlzdHJpYnV0ZWQgdW5kZXIgdGhlIEJTRCBMaWNlbnNlXG4gKiBTZWUgaHR0cDovL3BhamhvbWUub3JnLnVrL2NyeXB0L21kNSBmb3IgZGV0YWlscy5cbiAqL1xuXG52YXIgaGVscGVycyA9IHJlcXVpcmUoJy4vaGVscGVycycpO1xuXG4vKlxuICogQ2FsY3VsYXRlIHRoZSBTSEEtMSBvZiBhbiBhcnJheSBvZiBiaWctZW5kaWFuIHdvcmRzLCBhbmQgYSBiaXQgbGVuZ3RoXG4gKi9cbmZ1bmN0aW9uIGNvcmVfc2hhMSh4LCBsZW4pXG57XG4gIC8qIGFwcGVuZCBwYWRkaW5nICovXG4gIHhbbGVuID4+IDVdIHw9IDB4ODAgPDwgKDI0IC0gbGVuICUgMzIpO1xuICB4WygobGVuICsgNjQgPj4gOSkgPDwgNCkgKyAxNV0gPSBsZW47XG5cbiAgdmFyIHcgPSBBcnJheSg4MCk7XG4gIHZhciBhID0gIDE3MzI1ODQxOTM7XG4gIHZhciBiID0gLTI3MTczMzg3OTtcbiAgdmFyIGMgPSAtMTczMjU4NDE5NDtcbiAgdmFyIGQgPSAgMjcxNzMzODc4O1xuICB2YXIgZSA9IC0xMDA5NTg5Nzc2O1xuXG4gIGZvcih2YXIgaSA9IDA7IGkgPCB4Lmxlbmd0aDsgaSArPSAxNilcbiAge1xuICAgIHZhciBvbGRhID0gYTtcbiAgICB2YXIgb2xkYiA9IGI7XG4gICAgdmFyIG9sZGMgPSBjO1xuICAgIHZhciBvbGRkID0gZDtcbiAgICB2YXIgb2xkZSA9IGU7XG5cbiAgICBmb3IodmFyIGogPSAwOyBqIDwgODA7IGorKylcbiAgICB7XG4gICAgICBpZihqIDwgMTYpIHdbal0gPSB4W2kgKyBqXTtcbiAgICAgIGVsc2Ugd1tqXSA9IHJvbCh3W2otM10gXiB3W2otOF0gXiB3W2otMTRdIF4gd1tqLTE2XSwgMSk7XG4gICAgICB2YXIgdCA9IHNhZmVfYWRkKHNhZmVfYWRkKHJvbChhLCA1KSwgc2hhMV9mdChqLCBiLCBjLCBkKSksXG4gICAgICAgICAgICAgICAgICAgICAgIHNhZmVfYWRkKHNhZmVfYWRkKGUsIHdbal0pLCBzaGExX2t0KGopKSk7XG4gICAgICBlID0gZDtcbiAgICAgIGQgPSBjO1xuICAgICAgYyA9IHJvbChiLCAzMCk7XG4gICAgICBiID0gYTtcbiAgICAgIGEgPSB0O1xuICAgIH1cblxuICAgIGEgPSBzYWZlX2FkZChhLCBvbGRhKTtcbiAgICBiID0gc2FmZV9hZGQoYiwgb2xkYik7XG4gICAgYyA9IHNhZmVfYWRkKGMsIG9sZGMpO1xuICAgIGQgPSBzYWZlX2FkZChkLCBvbGRkKTtcbiAgICBlID0gc2FmZV9hZGQoZSwgb2xkZSk7XG4gIH1cbiAgcmV0dXJuIEFycmF5KGEsIGIsIGMsIGQsIGUpO1xuXG59XG5cbi8qXG4gKiBQZXJmb3JtIHRoZSBhcHByb3ByaWF0ZSB0cmlwbGV0IGNvbWJpbmF0aW9uIGZ1bmN0aW9uIGZvciB0aGUgY3VycmVudFxuICogaXRlcmF0aW9uXG4gKi9cbmZ1bmN0aW9uIHNoYTFfZnQodCwgYiwgYywgZClcbntcbiAgaWYodCA8IDIwKSByZXR1cm4gKGIgJiBjKSB8ICgofmIpICYgZCk7XG4gIGlmKHQgPCA0MCkgcmV0dXJuIGIgXiBjIF4gZDtcbiAgaWYodCA8IDYwKSByZXR1cm4gKGIgJiBjKSB8IChiICYgZCkgfCAoYyAmIGQpO1xuICByZXR1cm4gYiBeIGMgXiBkO1xufVxuXG4vKlxuICogRGV0ZXJtaW5lIHRoZSBhcHByb3ByaWF0ZSBhZGRpdGl2ZSBjb25zdGFudCBmb3IgdGhlIGN1cnJlbnQgaXRlcmF0aW9uXG4gKi9cbmZ1bmN0aW9uIHNoYTFfa3QodClcbntcbiAgcmV0dXJuICh0IDwgMjApID8gIDE1MTg1MDAyNDkgOiAodCA8IDQwKSA/ICAxODU5Nzc1MzkzIDpcbiAgICAgICAgICh0IDwgNjApID8gLTE4OTQwMDc1ODggOiAtODk5NDk3NTE0O1xufVxuXG4vKlxuICogQWRkIGludGVnZXJzLCB3cmFwcGluZyBhdCAyXjMyLiBUaGlzIHVzZXMgMTYtYml0IG9wZXJhdGlvbnMgaW50ZXJuYWxseVxuICogdG8gd29yayBhcm91bmQgYnVncyBpbiBzb21lIEpTIGludGVycHJldGVycy5cbiAqL1xuZnVuY3Rpb24gc2FmZV9hZGQoeCwgeSlcbntcbiAgdmFyIGxzdyA9ICh4ICYgMHhGRkZGKSArICh5ICYgMHhGRkZGKTtcbiAgdmFyIG1zdyA9ICh4ID4+IDE2KSArICh5ID4+IDE2KSArIChsc3cgPj4gMTYpO1xuICByZXR1cm4gKG1zdyA8PCAxNikgfCAobHN3ICYgMHhGRkZGKTtcbn1cblxuLypcbiAqIEJpdHdpc2Ugcm90YXRlIGEgMzItYml0IG51bWJlciB0byB0aGUgbGVmdC5cbiAqL1xuZnVuY3Rpb24gcm9sKG51bSwgY250KVxue1xuICByZXR1cm4gKG51bSA8PCBjbnQpIHwgKG51bSA+Pj4gKDMyIC0gY250KSk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2hhMShidWYpIHtcbiAgcmV0dXJuIGhlbHBlcnMuaGFzaChidWYsIGNvcmVfc2hhMSwgMjAsIHRydWUpO1xufTtcbiIsIlxuLyoqXG4gKiBBIEphdmFTY3JpcHQgaW1wbGVtZW50YXRpb24gb2YgdGhlIFNlY3VyZSBIYXNoIEFsZ29yaXRobSwgU0hBLTI1NiwgYXMgZGVmaW5lZFxuICogaW4gRklQUyAxODAtMlxuICogVmVyc2lvbiAyLjItYmV0YSBDb3B5cmlnaHQgQW5nZWwgTWFyaW4sIFBhdWwgSm9obnN0b24gMjAwMCAtIDIwMDkuXG4gKiBPdGhlciBjb250cmlidXRvcnM6IEdyZWcgSG9sdCwgQW5kcmV3IEtlcGVydCwgWWRuYXIsIExvc3RpbmV0XG4gKlxuICovXG5cbnZhciBoZWxwZXJzID0gcmVxdWlyZSgnLi9oZWxwZXJzJyk7XG5cbnZhciBzYWZlX2FkZCA9IGZ1bmN0aW9uKHgsIHkpIHtcbiAgdmFyIGxzdyA9ICh4ICYgMHhGRkZGKSArICh5ICYgMHhGRkZGKTtcbiAgdmFyIG1zdyA9ICh4ID4+IDE2KSArICh5ID4+IDE2KSArIChsc3cgPj4gMTYpO1xuICByZXR1cm4gKG1zdyA8PCAxNikgfCAobHN3ICYgMHhGRkZGKTtcbn07XG5cbnZhciBTID0gZnVuY3Rpb24oWCwgbikge1xuICByZXR1cm4gKFggPj4+IG4pIHwgKFggPDwgKDMyIC0gbikpO1xufTtcblxudmFyIFIgPSBmdW5jdGlvbihYLCBuKSB7XG4gIHJldHVybiAoWCA+Pj4gbik7XG59O1xuXG52YXIgQ2ggPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gIHJldHVybiAoKHggJiB5KSBeICgofngpICYgeikpO1xufTtcblxudmFyIE1haiA9IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgcmV0dXJuICgoeCAmIHkpIF4gKHggJiB6KSBeICh5ICYgeikpO1xufTtcblxudmFyIFNpZ21hMDI1NiA9IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIChTKHgsIDIpIF4gUyh4LCAxMykgXiBTKHgsIDIyKSk7XG59O1xuXG52YXIgU2lnbWExMjU2ID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKFMoeCwgNikgXiBTKHgsIDExKSBeIFMoeCwgMjUpKTtcbn07XG5cbnZhciBHYW1tYTAyNTYgPSBmdW5jdGlvbih4KSB7XG4gIHJldHVybiAoUyh4LCA3KSBeIFMoeCwgMTgpIF4gUih4LCAzKSk7XG59O1xuXG52YXIgR2FtbWExMjU2ID0gZnVuY3Rpb24oeCkge1xuICByZXR1cm4gKFMoeCwgMTcpIF4gUyh4LCAxOSkgXiBSKHgsIDEwKSk7XG59O1xuXG52YXIgY29yZV9zaGEyNTYgPSBmdW5jdGlvbihtLCBsKSB7XG4gIHZhciBLID0gbmV3IEFycmF5KDB4NDI4QTJGOTgsMHg3MTM3NDQ5MSwweEI1QzBGQkNGLDB4RTlCNURCQTUsMHgzOTU2QzI1QiwweDU5RjExMUYxLDB4OTIzRjgyQTQsMHhBQjFDNUVENSwweEQ4MDdBQTk4LDB4MTI4MzVCMDEsMHgyNDMxODVCRSwweDU1MEM3REMzLDB4NzJCRTVENzQsMHg4MERFQjFGRSwweDlCREMwNkE3LDB4QzE5QkYxNzQsMHhFNDlCNjlDMSwweEVGQkU0Nzg2LDB4RkMxOURDNiwweDI0MENBMUNDLDB4MkRFOTJDNkYsMHg0QTc0ODRBQSwweDVDQjBBOURDLDB4NzZGOTg4REEsMHg5ODNFNTE1MiwweEE4MzFDNjZELDB4QjAwMzI3QzgsMHhCRjU5N0ZDNywweEM2RTAwQkYzLDB4RDVBNzkxNDcsMHg2Q0E2MzUxLDB4MTQyOTI5NjcsMHgyN0I3MEE4NSwweDJFMUIyMTM4LDB4NEQyQzZERkMsMHg1MzM4MEQxMywweDY1MEE3MzU0LDB4NzY2QTBBQkIsMHg4MUMyQzkyRSwweDkyNzIyQzg1LDB4QTJCRkU4QTEsMHhBODFBNjY0QiwweEMyNEI4QjcwLDB4Qzc2QzUxQTMsMHhEMTkyRTgxOSwweEQ2OTkwNjI0LDB4RjQwRTM1ODUsMHgxMDZBQTA3MCwweDE5QTRDMTE2LDB4MUUzNzZDMDgsMHgyNzQ4Nzc0QywweDM0QjBCQ0I1LDB4MzkxQzBDQjMsMHg0RUQ4QUE0QSwweDVCOUNDQTRGLDB4NjgyRTZGRjMsMHg3NDhGODJFRSwweDc4QTU2MzZGLDB4ODRDODc4MTQsMHg4Q0M3MDIwOCwweDkwQkVGRkZBLDB4QTQ1MDZDRUIsMHhCRUY5QTNGNywweEM2NzE3OEYyKTtcbiAgdmFyIEhBU0ggPSBuZXcgQXJyYXkoMHg2QTA5RTY2NywgMHhCQjY3QUU4NSwgMHgzQzZFRjM3MiwgMHhBNTRGRjUzQSwgMHg1MTBFNTI3RiwgMHg5QjA1Njg4QywgMHgxRjgzRDlBQiwgMHg1QkUwQ0QxOSk7XG4gICAgdmFyIFcgPSBuZXcgQXJyYXkoNjQpO1xuICAgIHZhciBhLCBiLCBjLCBkLCBlLCBmLCBnLCBoLCBpLCBqO1xuICAgIHZhciBUMSwgVDI7XG4gIC8qIGFwcGVuZCBwYWRkaW5nICovXG4gIG1bbCA+PiA1XSB8PSAweDgwIDw8ICgyNCAtIGwgJSAzMik7XG4gIG1bKChsICsgNjQgPj4gOSkgPDwgNCkgKyAxNV0gPSBsO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG0ubGVuZ3RoOyBpICs9IDE2KSB7XG4gICAgYSA9IEhBU0hbMF07IGIgPSBIQVNIWzFdOyBjID0gSEFTSFsyXTsgZCA9IEhBU0hbM107IGUgPSBIQVNIWzRdOyBmID0gSEFTSFs1XTsgZyA9IEhBU0hbNl07IGggPSBIQVNIWzddO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgNjQ7IGorKykge1xuICAgICAgaWYgKGogPCAxNikge1xuICAgICAgICBXW2pdID0gbVtqICsgaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBXW2pdID0gc2FmZV9hZGQoc2FmZV9hZGQoc2FmZV9hZGQoR2FtbWExMjU2KFdbaiAtIDJdKSwgV1tqIC0gN10pLCBHYW1tYTAyNTYoV1tqIC0gMTVdKSksIFdbaiAtIDE2XSk7XG4gICAgICB9XG4gICAgICBUMSA9IHNhZmVfYWRkKHNhZmVfYWRkKHNhZmVfYWRkKHNhZmVfYWRkKGgsIFNpZ21hMTI1NihlKSksIENoKGUsIGYsIGcpKSwgS1tqXSksIFdbal0pO1xuICAgICAgVDIgPSBzYWZlX2FkZChTaWdtYTAyNTYoYSksIE1haihhLCBiLCBjKSk7XG4gICAgICBoID0gZzsgZyA9IGY7IGYgPSBlOyBlID0gc2FmZV9hZGQoZCwgVDEpOyBkID0gYzsgYyA9IGI7IGIgPSBhOyBhID0gc2FmZV9hZGQoVDEsIFQyKTtcbiAgICB9XG4gICAgSEFTSFswXSA9IHNhZmVfYWRkKGEsIEhBU0hbMF0pOyBIQVNIWzFdID0gc2FmZV9hZGQoYiwgSEFTSFsxXSk7IEhBU0hbMl0gPSBzYWZlX2FkZChjLCBIQVNIWzJdKTsgSEFTSFszXSA9IHNhZmVfYWRkKGQsIEhBU0hbM10pO1xuICAgIEhBU0hbNF0gPSBzYWZlX2FkZChlLCBIQVNIWzRdKTsgSEFTSFs1XSA9IHNhZmVfYWRkKGYsIEhBU0hbNV0pOyBIQVNIWzZdID0gc2FmZV9hZGQoZywgSEFTSFs2XSk7IEhBU0hbN10gPSBzYWZlX2FkZChoLCBIQVNIWzddKTtcbiAgfVxuICByZXR1cm4gSEFTSDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gc2hhMjU2KGJ1Zikge1xuICByZXR1cm4gaGVscGVycy5oYXNoKGJ1ZiwgY29yZV9zaGEyNTYsIDMyLCB0cnVlKTtcbn07XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCJpZiAodHlwZW9mIE9iamVjdC5jcmVhdGUgPT09ICdmdW5jdGlvbicpIHtcbiAgLy8gaW1wbGVtZW50YXRpb24gZnJvbSBzdGFuZGFyZCBub2RlLmpzICd1dGlsJyBtb2R1bGVcbiAgbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBpbmhlcml0cyhjdG9yLCBzdXBlckN0b3IpIHtcbiAgICBjdG9yLnN1cGVyXyA9IHN1cGVyQ3RvclxuICAgIGN0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShzdXBlckN0b3IucHJvdG90eXBlLCB7XG4gICAgICBjb25zdHJ1Y3Rvcjoge1xuICAgICAgICB2YWx1ZTogY3RvcixcbiAgICAgICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgICAgIHdyaXRhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbn0gZWxzZSB7XG4gIC8vIG9sZCBzY2hvb2wgc2hpbSBmb3Igb2xkIGJyb3dzZXJzXG4gIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaW5oZXJpdHMoY3Rvciwgc3VwZXJDdG9yKSB7XG4gICAgY3Rvci5zdXBlcl8gPSBzdXBlckN0b3JcbiAgICB2YXIgVGVtcEN0b3IgPSBmdW5jdGlvbiAoKSB7fVxuICAgIFRlbXBDdG9yLnByb3RvdHlwZSA9IHN1cGVyQ3Rvci5wcm90b3R5cGVcbiAgICBjdG9yLnByb3RvdHlwZSA9IG5ldyBUZW1wQ3RvcigpXG4gICAgY3Rvci5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBjdG9yXG4gIH1cbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gaXNCdWZmZXIoYXJnKSB7XG4gIHJldHVybiBhcmcgJiYgdHlwZW9mIGFyZyA9PT0gJ29iamVjdCdcbiAgICAmJiB0eXBlb2YgYXJnLmNvcHkgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLmZpbGwgPT09ICdmdW5jdGlvbidcbiAgICAmJiB0eXBlb2YgYXJnLnJlYWRVSW50OCA9PT0gJ2Z1bmN0aW9uJztcbn0iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG52YXIgZm9ybWF0UmVnRXhwID0gLyVbc2RqJV0vZztcbmV4cG9ydHMuZm9ybWF0ID0gZnVuY3Rpb24oZikge1xuICBpZiAoIWlzU3RyaW5nKGYpKSB7XG4gICAgdmFyIG9iamVjdHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgb2JqZWN0cy5wdXNoKGluc3BlY3QoYXJndW1lbnRzW2ldKSk7XG4gICAgfVxuICAgIHJldHVybiBvYmplY3RzLmpvaW4oJyAnKTtcbiAgfVxuXG4gIHZhciBpID0gMTtcbiAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gIHZhciBsZW4gPSBhcmdzLmxlbmd0aDtcbiAgdmFyIHN0ciA9IFN0cmluZyhmKS5yZXBsYWNlKGZvcm1hdFJlZ0V4cCwgZnVuY3Rpb24oeCkge1xuICAgIGlmICh4ID09PSAnJSUnKSByZXR1cm4gJyUnO1xuICAgIGlmIChpID49IGxlbikgcmV0dXJuIHg7XG4gICAgc3dpdGNoICh4KSB7XG4gICAgICBjYXNlICclcyc6IHJldHVybiBTdHJpbmcoYXJnc1tpKytdKTtcbiAgICAgIGNhc2UgJyVkJzogcmV0dXJuIE51bWJlcihhcmdzW2krK10pO1xuICAgICAgY2FzZSAnJWonOlxuICAgICAgICB0cnkge1xuICAgICAgICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShhcmdzW2krK10pO1xuICAgICAgICB9IGNhdGNoIChfKSB7XG4gICAgICAgICAgcmV0dXJuICdbQ2lyY3VsYXJdJztcbiAgICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICB9KTtcbiAgZm9yICh2YXIgeCA9IGFyZ3NbaV07IGkgPCBsZW47IHggPSBhcmdzWysraV0pIHtcbiAgICBpZiAoaXNOdWxsKHgpIHx8ICFpc09iamVjdCh4KSkge1xuICAgICAgc3RyICs9ICcgJyArIHg7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciArPSAnICcgKyBpbnNwZWN0KHgpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gc3RyO1xufTtcblxuXG4vLyBNYXJrIHRoYXQgYSBtZXRob2Qgc2hvdWxkIG5vdCBiZSB1c2VkLlxuLy8gUmV0dXJucyBhIG1vZGlmaWVkIGZ1bmN0aW9uIHdoaWNoIHdhcm5zIG9uY2UgYnkgZGVmYXVsdC5cbi8vIElmIC0tbm8tZGVwcmVjYXRpb24gaXMgc2V0LCB0aGVuIGl0IGlzIGEgbm8tb3AuXG5leHBvcnRzLmRlcHJlY2F0ZSA9IGZ1bmN0aW9uKGZuLCBtc2cpIHtcbiAgLy8gQWxsb3cgZm9yIGRlcHJlY2F0aW5nIHRoaW5ncyBpbiB0aGUgcHJvY2VzcyBvZiBzdGFydGluZyB1cC5cbiAgaWYgKGlzVW5kZWZpbmVkKGdsb2JhbC5wcm9jZXNzKSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleHBvcnRzLmRlcHJlY2F0ZShmbiwgbXNnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH1cblxuICBpZiAocHJvY2Vzcy5ub0RlcHJlY2F0aW9uID09PSB0cnVlKSB7XG4gICAgcmV0dXJuIGZuO1xuICB9XG5cbiAgdmFyIHdhcm5lZCA9IGZhbHNlO1xuICBmdW5jdGlvbiBkZXByZWNhdGVkKCkge1xuICAgIGlmICghd2FybmVkKSB7XG4gICAgICBpZiAocHJvY2Vzcy50aHJvd0RlcHJlY2F0aW9uKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihtc2cpO1xuICAgICAgfSBlbHNlIGlmIChwcm9jZXNzLnRyYWNlRGVwcmVjYXRpb24pIHtcbiAgICAgICAgY29uc29sZS50cmFjZShtc2cpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihtc2cpO1xuICAgICAgfVxuICAgICAgd2FybmVkID0gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH1cblxuICByZXR1cm4gZGVwcmVjYXRlZDtcbn07XG5cblxudmFyIGRlYnVncyA9IHt9O1xudmFyIGRlYnVnRW52aXJvbjtcbmV4cG9ydHMuZGVidWdsb2cgPSBmdW5jdGlvbihzZXQpIHtcbiAgaWYgKGlzVW5kZWZpbmVkKGRlYnVnRW52aXJvbikpXG4gICAgZGVidWdFbnZpcm9uID0gcHJvY2Vzcy5lbnYuTk9ERV9ERUJVRyB8fCAnJztcbiAgc2V0ID0gc2V0LnRvVXBwZXJDYXNlKCk7XG4gIGlmICghZGVidWdzW3NldF0pIHtcbiAgICBpZiAobmV3IFJlZ0V4cCgnXFxcXGInICsgc2V0ICsgJ1xcXFxiJywgJ2knKS50ZXN0KGRlYnVnRW52aXJvbikpIHtcbiAgICAgIHZhciBwaWQgPSBwcm9jZXNzLnBpZDtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBtc2cgPSBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpO1xuICAgICAgICBjb25zb2xlLmVycm9yKCclcyAlZDogJXMnLCBzZXQsIHBpZCwgbXNnKTtcbiAgICAgIH07XG4gICAgfSBlbHNlIHtcbiAgICAgIGRlYnVnc1tzZXRdID0gZnVuY3Rpb24oKSB7fTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGRlYnVnc1tzZXRdO1xufTtcblxuXG4vKipcbiAqIEVjaG9zIHRoZSB2YWx1ZSBvZiBhIHZhbHVlLiBUcnlzIHRvIHByaW50IHRoZSB2YWx1ZSBvdXRcbiAqIGluIHRoZSBiZXN0IHdheSBwb3NzaWJsZSBnaXZlbiB0aGUgZGlmZmVyZW50IHR5cGVzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmogVGhlIG9iamVjdCB0byBwcmludCBvdXQuXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cyBPcHRpb25hbCBvcHRpb25zIG9iamVjdCB0aGF0IGFsdGVycyB0aGUgb3V0cHV0LlxuICovXG4vKiBsZWdhY3k6IG9iaiwgc2hvd0hpZGRlbiwgZGVwdGgsIGNvbG9ycyovXG5mdW5jdGlvbiBpbnNwZWN0KG9iaiwgb3B0cykge1xuICAvLyBkZWZhdWx0IG9wdGlvbnNcbiAgdmFyIGN0eCA9IHtcbiAgICBzZWVuOiBbXSxcbiAgICBzdHlsaXplOiBzdHlsaXplTm9Db2xvclxuICB9O1xuICAvLyBsZWdhY3kuLi5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPj0gMykgY3R4LmRlcHRoID0gYXJndW1lbnRzWzJdO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+PSA0KSBjdHguY29sb3JzID0gYXJndW1lbnRzWzNdO1xuICBpZiAoaXNCb29sZWFuKG9wdHMpKSB7XG4gICAgLy8gbGVnYWN5Li4uXG4gICAgY3R4LnNob3dIaWRkZW4gPSBvcHRzO1xuICB9IGVsc2UgaWYgKG9wdHMpIHtcbiAgICAvLyBnb3QgYW4gXCJvcHRpb25zXCIgb2JqZWN0XG4gICAgZXhwb3J0cy5fZXh0ZW5kKGN0eCwgb3B0cyk7XG4gIH1cbiAgLy8gc2V0IGRlZmF1bHQgb3B0aW9uc1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LnNob3dIaWRkZW4pKSBjdHguc2hvd0hpZGRlbiA9IGZhbHNlO1xuICBpZiAoaXNVbmRlZmluZWQoY3R4LmRlcHRoKSkgY3R4LmRlcHRoID0gMjtcbiAgaWYgKGlzVW5kZWZpbmVkKGN0eC5jb2xvcnMpKSBjdHguY29sb3JzID0gZmFsc2U7XG4gIGlmIChpc1VuZGVmaW5lZChjdHguY3VzdG9tSW5zcGVjdCkpIGN0eC5jdXN0b21JbnNwZWN0ID0gdHJ1ZTtcbiAgaWYgKGN0eC5jb2xvcnMpIGN0eC5zdHlsaXplID0gc3R5bGl6ZVdpdGhDb2xvcjtcbiAgcmV0dXJuIGZvcm1hdFZhbHVlKGN0eCwgb2JqLCBjdHguZGVwdGgpO1xufVxuZXhwb3J0cy5pbnNwZWN0ID0gaW5zcGVjdDtcblxuXG4vLyBodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0FOU0lfZXNjYXBlX2NvZGUjZ3JhcGhpY3Ncbmluc3BlY3QuY29sb3JzID0ge1xuICAnYm9sZCcgOiBbMSwgMjJdLFxuICAnaXRhbGljJyA6IFszLCAyM10sXG4gICd1bmRlcmxpbmUnIDogWzQsIDI0XSxcbiAgJ2ludmVyc2UnIDogWzcsIDI3XSxcbiAgJ3doaXRlJyA6IFszNywgMzldLFxuICAnZ3JleScgOiBbOTAsIDM5XSxcbiAgJ2JsYWNrJyA6IFszMCwgMzldLFxuICAnYmx1ZScgOiBbMzQsIDM5XSxcbiAgJ2N5YW4nIDogWzM2LCAzOV0sXG4gICdncmVlbicgOiBbMzIsIDM5XSxcbiAgJ21hZ2VudGEnIDogWzM1LCAzOV0sXG4gICdyZWQnIDogWzMxLCAzOV0sXG4gICd5ZWxsb3cnIDogWzMzLCAzOV1cbn07XG5cbi8vIERvbid0IHVzZSAnYmx1ZScgbm90IHZpc2libGUgb24gY21kLmV4ZVxuaW5zcGVjdC5zdHlsZXMgPSB7XG4gICdzcGVjaWFsJzogJ2N5YW4nLFxuICAnbnVtYmVyJzogJ3llbGxvdycsXG4gICdib29sZWFuJzogJ3llbGxvdycsXG4gICd1bmRlZmluZWQnOiAnZ3JleScsXG4gICdudWxsJzogJ2JvbGQnLFxuICAnc3RyaW5nJzogJ2dyZWVuJyxcbiAgJ2RhdGUnOiAnbWFnZW50YScsXG4gIC8vIFwibmFtZVwiOiBpbnRlbnRpb25hbGx5IG5vdCBzdHlsaW5nXG4gICdyZWdleHAnOiAncmVkJ1xufTtcblxuXG5mdW5jdGlvbiBzdHlsaXplV2l0aENvbG9yKHN0ciwgc3R5bGVUeXBlKSB7XG4gIHZhciBzdHlsZSA9IGluc3BlY3Quc3R5bGVzW3N0eWxlVHlwZV07XG5cbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuICdcXHUwMDFiWycgKyBpbnNwZWN0LmNvbG9yc1tzdHlsZV1bMF0gKyAnbScgKyBzdHIgK1xuICAgICAgICAgICAnXFx1MDAxYlsnICsgaW5zcGVjdC5jb2xvcnNbc3R5bGVdWzFdICsgJ20nO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBzdHI7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiBzdHlsaXplTm9Db2xvcihzdHIsIHN0eWxlVHlwZSkge1xuICByZXR1cm4gc3RyO1xufVxuXG5cbmZ1bmN0aW9uIGFycmF5VG9IYXNoKGFycmF5KSB7XG4gIHZhciBoYXNoID0ge307XG5cbiAgYXJyYXkuZm9yRWFjaChmdW5jdGlvbih2YWwsIGlkeCkge1xuICAgIGhhc2hbdmFsXSA9IHRydWU7XG4gIH0pO1xuXG4gIHJldHVybiBoYXNoO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdFZhbHVlKGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcykge1xuICAvLyBQcm92aWRlIGEgaG9vayBmb3IgdXNlci1zcGVjaWZpZWQgaW5zcGVjdCBmdW5jdGlvbnMuXG4gIC8vIENoZWNrIHRoYXQgdmFsdWUgaXMgYW4gb2JqZWN0IHdpdGggYW4gaW5zcGVjdCBmdW5jdGlvbiBvbiBpdFxuICBpZiAoY3R4LmN1c3RvbUluc3BlY3QgJiZcbiAgICAgIHZhbHVlICYmXG4gICAgICBpc0Z1bmN0aW9uKHZhbHVlLmluc3BlY3QpICYmXG4gICAgICAvLyBGaWx0ZXIgb3V0IHRoZSB1dGlsIG1vZHVsZSwgaXQncyBpbnNwZWN0IGZ1bmN0aW9uIGlzIHNwZWNpYWxcbiAgICAgIHZhbHVlLmluc3BlY3QgIT09IGV4cG9ydHMuaW5zcGVjdCAmJlxuICAgICAgLy8gQWxzbyBmaWx0ZXIgb3V0IGFueSBwcm90b3R5cGUgb2JqZWN0cyB1c2luZyB0aGUgY2lyY3VsYXIgY2hlY2suXG4gICAgICAhKHZhbHVlLmNvbnN0cnVjdG9yICYmIHZhbHVlLmNvbnN0cnVjdG9yLnByb3RvdHlwZSA9PT0gdmFsdWUpKSB7XG4gICAgdmFyIHJldCA9IHZhbHVlLmluc3BlY3QocmVjdXJzZVRpbWVzLCBjdHgpO1xuICAgIGlmICghaXNTdHJpbmcocmV0KSkge1xuICAgICAgcmV0ID0gZm9ybWF0VmFsdWUoY3R4LCByZXQsIHJlY3Vyc2VUaW1lcyk7XG4gICAgfVxuICAgIHJldHVybiByZXQ7XG4gIH1cblxuICAvLyBQcmltaXRpdmUgdHlwZXMgY2Fubm90IGhhdmUgcHJvcGVydGllc1xuICB2YXIgcHJpbWl0aXZlID0gZm9ybWF0UHJpbWl0aXZlKGN0eCwgdmFsdWUpO1xuICBpZiAocHJpbWl0aXZlKSB7XG4gICAgcmV0dXJuIHByaW1pdGl2ZTtcbiAgfVxuXG4gIC8vIExvb2sgdXAgdGhlIGtleXMgb2YgdGhlIG9iamVjdC5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh2YWx1ZSk7XG4gIHZhciB2aXNpYmxlS2V5cyA9IGFycmF5VG9IYXNoKGtleXMpO1xuXG4gIGlmIChjdHguc2hvd0hpZGRlbikge1xuICAgIGtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyh2YWx1ZSk7XG4gIH1cblxuICAvLyBJRSBkb2Vzbid0IG1ha2UgZXJyb3IgZmllbGRzIG5vbi1lbnVtZXJhYmxlXG4gIC8vIGh0dHA6Ly9tc2RuLm1pY3Jvc29mdC5jb20vZW4tdXMvbGlicmFyeS9pZS9kd3c1MnNidCh2PXZzLjk0KS5hc3B4XG4gIGlmIChpc0Vycm9yKHZhbHVlKVxuICAgICAgJiYgKGtleXMuaW5kZXhPZignbWVzc2FnZScpID49IDAgfHwga2V5cy5pbmRleE9mKCdkZXNjcmlwdGlvbicpID49IDApKSB7XG4gICAgcmV0dXJuIGZvcm1hdEVycm9yKHZhbHVlKTtcbiAgfVxuXG4gIC8vIFNvbWUgdHlwZSBvZiBvYmplY3Qgd2l0aG91dCBwcm9wZXJ0aWVzIGNhbiBiZSBzaG9ydGN1dHRlZC5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKSB7XG4gICAgICB2YXIgbmFtZSA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKCdbRnVuY3Rpb24nICsgbmFtZSArICddJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gICAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgICAgcmV0dXJuIGN0eC5zdHlsaXplKFJlZ0V4cC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSksICdyZWdleHAnKTtcbiAgICB9XG4gICAgaWYgKGlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShEYXRlLnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHZhbHVlKSwgJ2RhdGUnKTtcbiAgICB9XG4gICAgaWYgKGlzRXJyb3IodmFsdWUpKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RXJyb3IodmFsdWUpO1xuICAgIH1cbiAgfVxuXG4gIHZhciBiYXNlID0gJycsIGFycmF5ID0gZmFsc2UsIGJyYWNlcyA9IFsneycsICd9J107XG5cbiAgLy8gTWFrZSBBcnJheSBzYXkgdGhhdCB0aGV5IGFyZSBBcnJheVxuICBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICBhcnJheSA9IHRydWU7XG4gICAgYnJhY2VzID0gWydbJywgJ10nXTtcbiAgfVxuXG4gIC8vIE1ha2UgZnVuY3Rpb25zIHNheSB0aGF0IHRoZXkgYXJlIGZ1bmN0aW9uc1xuICBpZiAoaXNGdW5jdGlvbih2YWx1ZSkpIHtcbiAgICB2YXIgbiA9IHZhbHVlLm5hbWUgPyAnOiAnICsgdmFsdWUubmFtZSA6ICcnO1xuICAgIGJhc2UgPSAnIFtGdW5jdGlvbicgKyBuICsgJ10nO1xuICB9XG5cbiAgLy8gTWFrZSBSZWdFeHBzIHNheSB0aGF0IHRoZXkgYXJlIFJlZ0V4cHNcbiAgaWYgKGlzUmVnRXhwKHZhbHVlKSkge1xuICAgIGJhc2UgPSAnICcgKyBSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBkYXRlcyB3aXRoIHByb3BlcnRpZXMgZmlyc3Qgc2F5IHRoZSBkYXRlXG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgYmFzZSA9ICcgJyArIERhdGUucHJvdG90eXBlLnRvVVRDU3RyaW5nLmNhbGwodmFsdWUpO1xuICB9XG5cbiAgLy8gTWFrZSBlcnJvciB3aXRoIG1lc3NhZ2UgZmlyc3Qgc2F5IHRoZSBlcnJvclxuICBpZiAoaXNFcnJvcih2YWx1ZSkpIHtcbiAgICBiYXNlID0gJyAnICsgZm9ybWF0RXJyb3IodmFsdWUpO1xuICB9XG5cbiAgaWYgKGtleXMubGVuZ3RoID09PSAwICYmICghYXJyYXkgfHwgdmFsdWUubGVuZ3RoID09IDApKSB7XG4gICAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyBicmFjZXNbMV07XG4gIH1cblxuICBpZiAocmVjdXJzZVRpbWVzIDwgMCkge1xuICAgIGlmIChpc1JlZ0V4cCh2YWx1ZSkpIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZShSZWdFeHAucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpLCAncmVnZXhwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjdHguc3R5bGl6ZSgnW09iamVjdF0nLCAnc3BlY2lhbCcpO1xuICAgIH1cbiAgfVxuXG4gIGN0eC5zZWVuLnB1c2godmFsdWUpO1xuXG4gIHZhciBvdXRwdXQ7XG4gIGlmIChhcnJheSkge1xuICAgIG91dHB1dCA9IGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpO1xuICB9IGVsc2Uge1xuICAgIG91dHB1dCA9IGtleXMubWFwKGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIGZvcm1hdFByb3BlcnR5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleSwgYXJyYXkpO1xuICAgIH0pO1xuICB9XG5cbiAgY3R4LnNlZW4ucG9wKCk7XG5cbiAgcmV0dXJuIHJlZHVjZVRvU2luZ2xlU3RyaW5nKG91dHB1dCwgYmFzZSwgYnJhY2VzKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRQcmltaXRpdmUoY3R4LCB2YWx1ZSkge1xuICBpZiAoaXNVbmRlZmluZWQodmFsdWUpKVxuICAgIHJldHVybiBjdHguc3R5bGl6ZSgndW5kZWZpbmVkJywgJ3VuZGVmaW5lZCcpO1xuICBpZiAoaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgdmFyIHNpbXBsZSA9ICdcXCcnICsgSlNPTi5zdHJpbmdpZnkodmFsdWUpLnJlcGxhY2UoL15cInxcIiQvZywgJycpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAucmVwbGFjZSgvXFxcXFwiL2csICdcIicpICsgJ1xcJyc7XG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKHNpbXBsZSwgJ3N0cmluZycpO1xuICB9XG4gIGlmIChpc051bWJlcih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdudW1iZXInKTtcbiAgaWYgKGlzQm9vbGVhbih2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCcnICsgdmFsdWUsICdib29sZWFuJyk7XG4gIC8vIEZvciBzb21lIHJlYXNvbiB0eXBlb2YgbnVsbCBpcyBcIm9iamVjdFwiLCBzbyBzcGVjaWFsIGNhc2UgaGVyZS5cbiAgaWYgKGlzTnVsbCh2YWx1ZSkpXG4gICAgcmV0dXJuIGN0eC5zdHlsaXplKCdudWxsJywgJ251bGwnKTtcbn1cblxuXG5mdW5jdGlvbiBmb3JtYXRFcnJvcih2YWx1ZSkge1xuICByZXR1cm4gJ1snICsgRXJyb3IucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodmFsdWUpICsgJ10nO1xufVxuXG5cbmZ1bmN0aW9uIGZvcm1hdEFycmF5KGN0eCwgdmFsdWUsIHJlY3Vyc2VUaW1lcywgdmlzaWJsZUtleXMsIGtleXMpIHtcbiAgdmFyIG91dHB1dCA9IFtdO1xuICBmb3IgKHZhciBpID0gMCwgbCA9IHZhbHVlLmxlbmd0aDsgaSA8IGw7ICsraSkge1xuICAgIGlmIChoYXNPd25Qcm9wZXJ0eSh2YWx1ZSwgU3RyaW5nKGkpKSkge1xuICAgICAgb3V0cHV0LnB1c2goZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cyxcbiAgICAgICAgICBTdHJpbmcoaSksIHRydWUpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb3V0cHV0LnB1c2goJycpO1xuICAgIH1cbiAgfVxuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYgKCFrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICBvdXRwdXQucHVzaChmb3JtYXRQcm9wZXJ0eShjdHgsIHZhbHVlLCByZWN1cnNlVGltZXMsIHZpc2libGVLZXlzLFxuICAgICAgICAgIGtleSwgdHJ1ZSkpO1xuICAgIH1cbiAgfSk7XG4gIHJldHVybiBvdXRwdXQ7XG59XG5cblxuZnVuY3Rpb24gZm9ybWF0UHJvcGVydHkoY3R4LCB2YWx1ZSwgcmVjdXJzZVRpbWVzLCB2aXNpYmxlS2V5cywga2V5LCBhcnJheSkge1xuICB2YXIgbmFtZSwgc3RyLCBkZXNjO1xuICBkZXNjID0gT2JqZWN0LmdldE93blByb3BlcnR5RGVzY3JpcHRvcih2YWx1ZSwga2V5KSB8fCB7IHZhbHVlOiB2YWx1ZVtrZXldIH07XG4gIGlmIChkZXNjLmdldCkge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tHZXR0ZXIvU2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN0ciA9IGN0eC5zdHlsaXplKCdbR2V0dGVyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChkZXNjLnNldCkge1xuICAgICAgc3RyID0gY3R4LnN0eWxpemUoJ1tTZXR0ZXJdJywgJ3NwZWNpYWwnKTtcbiAgICB9XG4gIH1cbiAgaWYgKCFoYXNPd25Qcm9wZXJ0eSh2aXNpYmxlS2V5cywga2V5KSkge1xuICAgIG5hbWUgPSAnWycgKyBrZXkgKyAnXSc7XG4gIH1cbiAgaWYgKCFzdHIpIHtcbiAgICBpZiAoY3R4LnNlZW4uaW5kZXhPZihkZXNjLnZhbHVlKSA8IDApIHtcbiAgICAgIGlmIChpc051bGwocmVjdXJzZVRpbWVzKSkge1xuICAgICAgICBzdHIgPSBmb3JtYXRWYWx1ZShjdHgsIGRlc2MudmFsdWUsIG51bGwpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RyID0gZm9ybWF0VmFsdWUoY3R4LCBkZXNjLnZhbHVlLCByZWN1cnNlVGltZXMgLSAxKTtcbiAgICAgIH1cbiAgICAgIGlmIChzdHIuaW5kZXhPZignXFxuJykgPiAtMSkge1xuICAgICAgICBpZiAoYXJyYXkpIHtcbiAgICAgICAgICBzdHIgPSBzdHIuc3BsaXQoJ1xcbicpLm1hcChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICByZXR1cm4gJyAgJyArIGxpbmU7XG4gICAgICAgICAgfSkuam9pbignXFxuJykuc3Vic3RyKDIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN0ciA9ICdcXG4nICsgc3RyLnNwbGl0KCdcXG4nKS5tYXAoZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgcmV0dXJuICcgICAnICsgbGluZTtcbiAgICAgICAgICB9KS5qb2luKCdcXG4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzdHIgPSBjdHguc3R5bGl6ZSgnW0NpcmN1bGFyXScsICdzcGVjaWFsJyk7XG4gICAgfVxuICB9XG4gIGlmIChpc1VuZGVmaW5lZChuYW1lKSkge1xuICAgIGlmIChhcnJheSAmJiBrZXkubWF0Y2goL15cXGQrJC8pKSB7XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH1cbiAgICBuYW1lID0gSlNPTi5zdHJpbmdpZnkoJycgKyBrZXkpO1xuICAgIGlmIChuYW1lLm1hdGNoKC9eXCIoW2EtekEtWl9dW2EtekEtWl8wLTldKilcIiQvKSkge1xuICAgICAgbmFtZSA9IG5hbWUuc3Vic3RyKDEsIG5hbWUubGVuZ3RoIC0gMik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ25hbWUnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvJy9nLCBcIlxcXFwnXCIpXG4gICAgICAgICAgICAgICAgIC5yZXBsYWNlKC9cXFxcXCIvZywgJ1wiJylcbiAgICAgICAgICAgICAgICAgLnJlcGxhY2UoLyheXCJ8XCIkKS9nLCBcIidcIik7XG4gICAgICBuYW1lID0gY3R4LnN0eWxpemUobmFtZSwgJ3N0cmluZycpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuYW1lICsgJzogJyArIHN0cjtcbn1cblxuXG5mdW5jdGlvbiByZWR1Y2VUb1NpbmdsZVN0cmluZyhvdXRwdXQsIGJhc2UsIGJyYWNlcykge1xuICB2YXIgbnVtTGluZXNFc3QgPSAwO1xuICB2YXIgbGVuZ3RoID0gb3V0cHV0LnJlZHVjZShmdW5jdGlvbihwcmV2LCBjdXIpIHtcbiAgICBudW1MaW5lc0VzdCsrO1xuICAgIGlmIChjdXIuaW5kZXhPZignXFxuJykgPj0gMCkgbnVtTGluZXNFc3QrKztcbiAgICByZXR1cm4gcHJldiArIGN1ci5yZXBsYWNlKC9cXHUwMDFiXFxbXFxkXFxkP20vZywgJycpLmxlbmd0aCArIDE7XG4gIH0sIDApO1xuXG4gIGlmIChsZW5ndGggPiA2MCkge1xuICAgIHJldHVybiBicmFjZXNbMF0gK1xuICAgICAgICAgICAoYmFzZSA9PT0gJycgPyAnJyA6IGJhc2UgKyAnXFxuICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgb3V0cHV0LmpvaW4oJyxcXG4gICcpICtcbiAgICAgICAgICAgJyAnICtcbiAgICAgICAgICAgYnJhY2VzWzFdO1xuICB9XG5cbiAgcmV0dXJuIGJyYWNlc1swXSArIGJhc2UgKyAnICcgKyBvdXRwdXQuam9pbignLCAnKSArICcgJyArIGJyYWNlc1sxXTtcbn1cblxuXG4vLyBOT1RFOiBUaGVzZSB0eXBlIGNoZWNraW5nIGZ1bmN0aW9ucyBpbnRlbnRpb25hbGx5IGRvbid0IHVzZSBgaW5zdGFuY2VvZmBcbi8vIGJlY2F1c2UgaXQgaXMgZnJhZ2lsZSBhbmQgY2FuIGJlIGVhc2lseSBmYWtlZCB3aXRoIGBPYmplY3QuY3JlYXRlKClgLlxuZnVuY3Rpb24gaXNBcnJheShhcikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShhcik7XG59XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG5mdW5jdGlvbiBpc0Jvb2xlYW4oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnYm9vbGVhbic7XG59XG5leHBvcnRzLmlzQm9vbGVhbiA9IGlzQm9vbGVhbjtcblxuZnVuY3Rpb24gaXNOdWxsKGFyZykge1xuICByZXR1cm4gYXJnID09PSBudWxsO1xufVxuZXhwb3J0cy5pc051bGwgPSBpc051bGw7XG5cbmZ1bmN0aW9uIGlzTnVsbE9yVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09IG51bGw7XG59XG5leHBvcnRzLmlzTnVsbE9yVW5kZWZpbmVkID0gaXNOdWxsT3JVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5leHBvcnRzLmlzTnVtYmVyID0gaXNOdW1iZXI7XG5cbmZ1bmN0aW9uIGlzU3RyaW5nKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N0cmluZyc7XG59XG5leHBvcnRzLmlzU3RyaW5nID0gaXNTdHJpbmc7XG5cbmZ1bmN0aW9uIGlzU3ltYm9sKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ3N5bWJvbCc7XG59XG5leHBvcnRzLmlzU3ltYm9sID0gaXNTeW1ib2w7XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG5leHBvcnRzLmlzVW5kZWZpbmVkID0gaXNVbmRlZmluZWQ7XG5cbmZ1bmN0aW9uIGlzUmVnRXhwKHJlKSB7XG4gIHJldHVybiBpc09iamVjdChyZSkgJiYgb2JqZWN0VG9TdHJpbmcocmUpID09PSAnW29iamVjdCBSZWdFeHBdJztcbn1cbmV4cG9ydHMuaXNSZWdFeHAgPSBpc1JlZ0V4cDtcblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5leHBvcnRzLmlzT2JqZWN0ID0gaXNPYmplY3Q7XG5cbmZ1bmN0aW9uIGlzRGF0ZShkKSB7XG4gIHJldHVybiBpc09iamVjdChkKSAmJiBvYmplY3RUb1N0cmluZyhkKSA9PT0gJ1tvYmplY3QgRGF0ZV0nO1xufVxuZXhwb3J0cy5pc0RhdGUgPSBpc0RhdGU7XG5cbmZ1bmN0aW9uIGlzRXJyb3IoZSkge1xuICByZXR1cm4gaXNPYmplY3QoZSkgJiZcbiAgICAgIChvYmplY3RUb1N0cmluZyhlKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB8fCBlIGluc3RhbmNlb2YgRXJyb3IpO1xufVxuZXhwb3J0cy5pc0Vycm9yID0gaXNFcnJvcjtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5leHBvcnRzLmlzRnVuY3Rpb24gPSBpc0Z1bmN0aW9uO1xuXG5mdW5jdGlvbiBpc1ByaW1pdGl2ZShhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gbnVsbCB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ2Jvb2xlYW4nIHx8XG4gICAgICAgICB0eXBlb2YgYXJnID09PSAnbnVtYmVyJyB8fFxuICAgICAgICAgdHlwZW9mIGFyZyA9PT0gJ3N0cmluZycgfHxcbiAgICAgICAgIHR5cGVvZiBhcmcgPT09ICdzeW1ib2wnIHx8ICAvLyBFUzYgc3ltYm9sXG4gICAgICAgICB0eXBlb2YgYXJnID09PSAndW5kZWZpbmVkJztcbn1cbmV4cG9ydHMuaXNQcmltaXRpdmUgPSBpc1ByaW1pdGl2ZTtcblxuZXhwb3J0cy5pc0J1ZmZlciA9IHJlcXVpcmUoJy4vc3VwcG9ydC9pc0J1ZmZlcicpO1xuXG5mdW5jdGlvbiBvYmplY3RUb1N0cmluZyhvKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobyk7XG59XG5cblxuZnVuY3Rpb24gcGFkKG4pIHtcbiAgcmV0dXJuIG4gPCAxMCA/ICcwJyArIG4udG9TdHJpbmcoMTApIDogbi50b1N0cmluZygxMCk7XG59XG5cblxudmFyIG1vbnRocyA9IFsnSmFuJywgJ0ZlYicsICdNYXInLCAnQXByJywgJ01heScsICdKdW4nLCAnSnVsJywgJ0F1ZycsICdTZXAnLFxuICAgICAgICAgICAgICAnT2N0JywgJ05vdicsICdEZWMnXTtcblxuLy8gMjYgRmViIDE2OjE5OjM0XG5mdW5jdGlvbiB0aW1lc3RhbXAoKSB7XG4gIHZhciBkID0gbmV3IERhdGUoKTtcbiAgdmFyIHRpbWUgPSBbcGFkKGQuZ2V0SG91cnMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldE1pbnV0ZXMoKSksXG4gICAgICAgICAgICAgIHBhZChkLmdldFNlY29uZHMoKSldLmpvaW4oJzonKTtcbiAgcmV0dXJuIFtkLmdldERhdGUoKSwgbW9udGhzW2QuZ2V0TW9udGgoKV0sIHRpbWVdLmpvaW4oJyAnKTtcbn1cblxuXG4vLyBsb2cgaXMganVzdCBhIHRoaW4gd3JhcHBlciB0byBjb25zb2xlLmxvZyB0aGF0IHByZXBlbmRzIGEgdGltZXN0YW1wXG5leHBvcnRzLmxvZyA9IGZ1bmN0aW9uKCkge1xuICBjb25zb2xlLmxvZygnJXMgLSAlcycsIHRpbWVzdGFtcCgpLCBleHBvcnRzLmZvcm1hdC5hcHBseShleHBvcnRzLCBhcmd1bWVudHMpKTtcbn07XG5cblxuLyoqXG4gKiBJbmhlcml0IHRoZSBwcm90b3R5cGUgbWV0aG9kcyBmcm9tIG9uZSBjb25zdHJ1Y3RvciBpbnRvIGFub3RoZXIuXG4gKlxuICogVGhlIEZ1bmN0aW9uLnByb3RvdHlwZS5pbmhlcml0cyBmcm9tIGxhbmcuanMgcmV3cml0dGVuIGFzIGEgc3RhbmRhbG9uZVxuICogZnVuY3Rpb24gKG5vdCBvbiBGdW5jdGlvbi5wcm90b3R5cGUpLiBOT1RFOiBJZiB0aGlzIGZpbGUgaXMgdG8gYmUgbG9hZGVkXG4gKiBkdXJpbmcgYm9vdHN0cmFwcGluZyB0aGlzIGZ1bmN0aW9uIG5lZWRzIHRvIGJlIHJld3JpdHRlbiB1c2luZyBzb21lIG5hdGl2ZVxuICogZnVuY3Rpb25zIGFzIHByb3RvdHlwZSBzZXR1cCB1c2luZyBub3JtYWwgSmF2YVNjcmlwdCBkb2VzIG5vdCB3b3JrIGFzXG4gKiBleHBlY3RlZCBkdXJpbmcgYm9vdHN0cmFwcGluZyAoc2VlIG1pcnJvci5qcyBpbiByMTE0OTAzKS5cbiAqXG4gKiBAcGFyYW0ge2Z1bmN0aW9ufSBjdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHdoaWNoIG5lZWRzIHRvIGluaGVyaXQgdGhlXG4gKiAgICAgcHJvdG90eXBlLlxuICogQHBhcmFtIHtmdW5jdGlvbn0gc3VwZXJDdG9yIENvbnN0cnVjdG9yIGZ1bmN0aW9uIHRvIGluaGVyaXQgcHJvdG90eXBlIGZyb20uXG4gKi9cbmV4cG9ydHMuaW5oZXJpdHMgPSByZXF1aXJlKCdpbmhlcml0cycpO1xuXG5leHBvcnRzLl9leHRlbmQgPSBmdW5jdGlvbihvcmlnaW4sIGFkZCkge1xuICAvLyBEb24ndCBkbyBhbnl0aGluZyBpZiBhZGQgaXNuJ3QgYW4gb2JqZWN0XG4gIGlmICghYWRkIHx8ICFpc09iamVjdChhZGQpKSByZXR1cm4gb3JpZ2luO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aDtcbiAgd2hpbGUgKGktLSkge1xuICAgIG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcbiAgfVxuICByZXR1cm4gb3JpZ2luO1xufTtcblxuZnVuY3Rpb24gaGFzT3duUHJvcGVydHkob2JqLCBwcm9wKSB7XG4gIHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKTtcbn1cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCIvaG9tZS9kZWFuL29zYy13b3Jrc3BhY2VzL3dzLWJ3YWxsZXQtd2ViL2J3YWxsZXQuanMvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2luc2VydC1tb2R1bGUtZ2xvYmFscy9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSkiLCJ2YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG52YXIgdW5kZWZpbmVkO1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRpZiAoIW9iaiB8fCB0b1N0cmluZy5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nIHx8IG9iai5ub2RlVHlwZSB8fCBvYmouc2V0SW50ZXJ2YWwpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzX293bl9jb25zdHJ1Y3RvciA9IGhhc093bi5jYWxsKG9iaiwgJ2NvbnN0cnVjdG9yJyk7XG5cdHZhciBoYXNfaXNfcHJvcGVydHlfb2ZfbWV0aG9kID0gb2JqLmNvbnN0cnVjdG9yICYmIG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUgJiYgaGFzT3duLmNhbGwob2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSwgJ2lzUHJvdG90eXBlT2YnKTtcblx0Ly8gTm90IG93biBjb25zdHJ1Y3RvciBwcm9wZXJ0eSBtdXN0IGJlIE9iamVjdFxuXHRpZiAob2JqLmNvbnN0cnVjdG9yICYmICFoYXNfb3duX2NvbnN0cnVjdG9yICYmICFoYXNfaXNfcHJvcGVydHlfb2ZfbWV0aG9kKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHt9XG5cblx0cmV0dXJuIGtleSA9PT0gdW5kZWZpbmVkIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0dmFyIG9wdGlvbnMsIG5hbWUsIHNyYywgY29weSwgY29weUlzQXJyYXksIGNsb25lLFxuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1swXSxcblx0XHRpID0gMSxcblx0XHRsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLFxuXHRcdGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSBcImJvb2xlYW5cIikge1xuXHRcdGRlZXAgPSB0YXJnZXQ7XG5cdFx0dGFyZ2V0ID0gYXJndW1lbnRzWzFdIHx8IHt9O1xuXHRcdC8vIHNraXAgdGhlIGJvb2xlYW4gYW5kIHRoZSB0YXJnZXRcblx0XHRpID0gMjtcblx0fSBlbHNlIGlmICh0eXBlb2YgdGFyZ2V0ICE9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB0YXJnZXQgIT09IFwiZnVuY3Rpb25cIiB8fCB0YXJnZXQgPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHQvLyBPbmx5IGRlYWwgd2l0aCBub24tbnVsbC91bmRlZmluZWQgdmFsdWVzXG5cdFx0aWYgKChvcHRpb25zID0gYXJndW1lbnRzW2ldKSAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCA9PT0gY29weSkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gQXJyYXkuaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0aWYgKGNvcHlJc0FycmF5KSB7XG5cdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgQXJyYXkuaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vIE5ldmVyIG1vdmUgb3JpZ2luYWwgb2JqZWN0cywgY2xvbmUgdGhlbVxuXHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNvcHkgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvLyBSZXR1cm4gdGhlIG1vZGlmaWVkIG9iamVjdFxuXHRyZXR1cm4gdGFyZ2V0O1xufTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgYXNhcCA9IHJlcXVpcmUoJ2FzYXAnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IFByb21pc2VcbmZ1bmN0aW9uIFByb21pc2UoZm4pIHtcbiAgaWYgKHR5cGVvZiB0aGlzICE9PSAnb2JqZWN0JykgdGhyb3cgbmV3IFR5cGVFcnJvcignUHJvbWlzZXMgbXVzdCBiZSBjb25zdHJ1Y3RlZCB2aWEgbmV3JylcbiAgaWYgKHR5cGVvZiBmbiAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgZnVuY3Rpb24nKVxuICB2YXIgc3RhdGUgPSBudWxsXG4gIHZhciB2YWx1ZSA9IG51bGxcbiAgdmFyIGRlZmVycmVkcyA9IFtdXG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIHRoaXMudGhlbiA9IGZ1bmN0aW9uKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgaGFuZGxlKG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCByZXNvbHZlLCByZWplY3QpKVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGUoZGVmZXJyZWQpIHtcbiAgICBpZiAoc3RhdGUgPT09IG51bGwpIHtcbiAgICAgIGRlZmVycmVkcy5wdXNoKGRlZmVycmVkKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGFzYXAoZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgY2IgPSBzdGF0ZSA/IGRlZmVycmVkLm9uRnVsZmlsbGVkIDogZGVmZXJyZWQub25SZWplY3RlZFxuICAgICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAgIChzdGF0ZSA/IGRlZmVycmVkLnJlc29sdmUgOiBkZWZlcnJlZC5yZWplY3QpKHZhbHVlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIHZhciByZXRcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldCA9IGNiKHZhbHVlKVxuICAgICAgfVxuICAgICAgY2F0Y2ggKGUpIHtcbiAgICAgICAgZGVmZXJyZWQucmVqZWN0KGUpXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZXQpXG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlc29sdmUobmV3VmFsdWUpIHtcbiAgICB0cnkgeyAvL1Byb21pc2UgUmVzb2x1dGlvbiBQcm9jZWR1cmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy1zcGVjI3RoZS1wcm9taXNlLXJlc29sdXRpb24tcHJvY2VkdXJlXG4gICAgICBpZiAobmV3VmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJylcbiAgICAgIGlmIChuZXdWYWx1ZSAmJiAodHlwZW9mIG5ld1ZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgbmV3VmFsdWUgPT09ICdmdW5jdGlvbicpKSB7XG4gICAgICAgIHZhciB0aGVuID0gbmV3VmFsdWUudGhlblxuICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICBkb1Jlc29sdmUodGhlbi5iaW5kKG5ld1ZhbHVlKSwgcmVzb2x2ZSwgcmVqZWN0KVxuICAgICAgICAgIHJldHVyblxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzdGF0ZSA9IHRydWVcbiAgICAgIHZhbHVlID0gbmV3VmFsdWVcbiAgICAgIGZpbmFsZSgpXG4gICAgfSBjYXRjaCAoZSkgeyByZWplY3QoZSkgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVqZWN0KG5ld1ZhbHVlKSB7XG4gICAgc3RhdGUgPSBmYWxzZVxuICAgIHZhbHVlID0gbmV3VmFsdWVcbiAgICBmaW5hbGUoKVxuICB9XG5cbiAgZnVuY3Rpb24gZmluYWxlKCkge1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBkZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspXG4gICAgICBoYW5kbGUoZGVmZXJyZWRzW2ldKVxuICAgIGRlZmVycmVkcyA9IG51bGxcbiAgfVxuXG4gIGRvUmVzb2x2ZShmbiwgcmVzb2x2ZSwgcmVqZWN0KVxufVxuXG5cbmZ1bmN0aW9uIEhhbmRsZXIob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQsIHJlc29sdmUsIHJlamVjdCl7XG4gIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGxcbiAgdGhpcy5vblJlamVjdGVkID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicgPyBvblJlamVjdGVkIDogbnVsbFxuICB0aGlzLnJlc29sdmUgPSByZXNvbHZlXG4gIHRoaXMucmVqZWN0ID0gcmVqZWN0XG59XG5cbi8qKlxuICogVGFrZSBhIHBvdGVudGlhbGx5IG1pc2JlaGF2aW5nIHJlc29sdmVyIGZ1bmN0aW9uIGFuZCBtYWtlIHN1cmVcbiAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICpcbiAqIE1ha2VzIG5vIGd1YXJhbnRlZXMgYWJvdXQgYXN5bmNocm9ueS5cbiAqL1xuZnVuY3Rpb24gZG9SZXNvbHZlKGZuLCBvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCkge1xuICB2YXIgZG9uZSA9IGZhbHNlO1xuICB0cnkge1xuICAgIGZuKGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgaWYgKGRvbmUpIHJldHVyblxuICAgICAgZG9uZSA9IHRydWVcbiAgICAgIG9uRnVsZmlsbGVkKHZhbHVlKVxuICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgIGlmIChkb25lKSByZXR1cm5cbiAgICAgIGRvbmUgPSB0cnVlXG4gICAgICBvblJlamVjdGVkKHJlYXNvbilcbiAgICB9KVxuICB9IGNhdGNoIChleCkge1xuICAgIGlmIChkb25lKSByZXR1cm5cbiAgICBkb25lID0gdHJ1ZVxuICAgIG9uUmVqZWN0ZWQoZXgpXG4gIH1cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuLy9UaGlzIGZpbGUgY29udGFpbnMgdGhlbi9wcm9taXNlIHNwZWNpZmljIGV4dGVuc2lvbnMgdG8gdGhlIGNvcmUgcHJvbWlzZSBBUElcblxudmFyIFByb21pc2UgPSByZXF1aXJlKCcuL2NvcmUuanMnKVxudmFyIGFzYXAgPSByZXF1aXJlKCdhc2FwJylcblxubW9kdWxlLmV4cG9ydHMgPSBQcm9taXNlXG5cbi8qIFN0YXRpYyBGdW5jdGlvbnMgKi9cblxuZnVuY3Rpb24gVmFsdWVQcm9taXNlKHZhbHVlKSB7XG4gIHRoaXMudGhlbiA9IGZ1bmN0aW9uIChvbkZ1bGZpbGxlZCkge1xuICAgIGlmICh0eXBlb2Ygb25GdWxmaWxsZWQgIT09ICdmdW5jdGlvbicpIHJldHVybiB0aGlzXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGFzYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc29sdmUob25GdWxmaWxsZWQodmFsdWUpKVxuICAgICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICAgIHJlamVjdChleCk7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxufVxuVmFsdWVQcm9taXNlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUHJvbWlzZS5wcm90b3R5cGUpXG5cbnZhciBUUlVFID0gbmV3IFZhbHVlUHJvbWlzZSh0cnVlKVxudmFyIEZBTFNFID0gbmV3IFZhbHVlUHJvbWlzZShmYWxzZSlcbnZhciBOVUxMID0gbmV3IFZhbHVlUHJvbWlzZShudWxsKVxudmFyIFVOREVGSU5FRCA9IG5ldyBWYWx1ZVByb21pc2UodW5kZWZpbmVkKVxudmFyIFpFUk8gPSBuZXcgVmFsdWVQcm9taXNlKDApXG52YXIgRU1QVFlTVFJJTkcgPSBuZXcgVmFsdWVQcm9taXNlKCcnKVxuXG5Qcm9taXNlLnJlc29sdmUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgUHJvbWlzZSkgcmV0dXJuIHZhbHVlXG5cbiAgaWYgKHZhbHVlID09PSBudWxsKSByZXR1cm4gTlVMTFxuICBpZiAodmFsdWUgPT09IHVuZGVmaW5lZCkgcmV0dXJuIFVOREVGSU5FRFxuICBpZiAodmFsdWUgPT09IHRydWUpIHJldHVybiBUUlVFXG4gIGlmICh2YWx1ZSA9PT0gZmFsc2UpIHJldHVybiBGQUxTRVxuICBpZiAodmFsdWUgPT09IDApIHJldHVybiBaRVJPXG4gIGlmICh2YWx1ZSA9PT0gJycpIHJldHVybiBFTVBUWVNUUklOR1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHRyeSB7XG4gICAgICB2YXIgdGhlbiA9IHZhbHVlLnRoZW5cbiAgICAgIGlmICh0eXBlb2YgdGhlbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UodGhlbi5iaW5kKHZhbHVlKSlcbiAgICAgIH1cbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgcmVqZWN0KGV4KVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFZhbHVlUHJvbWlzZSh2YWx1ZSlcbn1cblxuUHJvbWlzZS5mcm9tID0gUHJvbWlzZS5jYXN0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1Byb21pc2UuZnJvbSBhbmQgUHJvbWlzZS5jYXN0IGFyZSBkZXByZWNhdGVkLCB1c2UgUHJvbWlzZS5yZXNvbHZlIGluc3RlYWQnKVxuICBlcnIubmFtZSA9ICdXYXJuaW5nJ1xuICBjb25zb2xlLndhcm4oZXJyLnN0YWNrKVxuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHZhbHVlKVxufVxuXG5Qcm9taXNlLmRlbm9kZWlmeSA9IGZ1bmN0aW9uIChmbiwgYXJndW1lbnRDb3VudCkge1xuICBhcmd1bWVudENvdW50ID0gYXJndW1lbnRDb3VudCB8fCBJbmZpbml0eVxuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICB3aGlsZSAoYXJncy5sZW5ndGggJiYgYXJncy5sZW5ndGggPiBhcmd1bWVudENvdW50KSB7XG4gICAgICAgIGFyZ3MucG9wKClcbiAgICAgIH1cbiAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgaWYgKGVycikgcmVqZWN0KGVycilcbiAgICAgICAgZWxzZSByZXNvbHZlKHJlcylcbiAgICAgIH0pXG4gICAgICBmbi5hcHBseShzZWxmLCBhcmdzKVxuICAgIH0pXG4gIH1cbn1cblByb21pc2Uubm9kZWlmeSA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKVxuICAgIHZhciBjYWxsYmFjayA9IHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0gPT09ICdmdW5jdGlvbicgPyBhcmdzLnBvcCgpIDogbnVsbFxuICAgIHRyeSB7XG4gICAgICByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKS5ub2RlaWZ5KGNhbGxiYWNrKVxuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICBpZiAoY2FsbGJhY2sgPT09IG51bGwgfHwgdHlwZW9mIGNhbGxiYWNrID09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7IHJlamVjdChleCkgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFzYXAoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbGxiYWNrKGV4KVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5Qcm9taXNlLmFsbCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGNhbGxlZFdpdGhBcnJheSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDEgJiYgQXJyYXkuaXNBcnJheShhcmd1bWVudHNbMF0pXG4gIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoY2FsbGVkV2l0aEFycmF5ID8gYXJndW1lbnRzWzBdIDogYXJndW1lbnRzKVxuXG4gIGlmICghY2FsbGVkV2l0aEFycmF5KSB7XG4gICAgdmFyIGVyciA9IG5ldyBFcnJvcignUHJvbWlzZS5hbGwgc2hvdWxkIGJlIGNhbGxlZCB3aXRoIGEgc2luZ2xlIGFycmF5LCBjYWxsaW5nIGl0IHdpdGggbXVsdGlwbGUgYXJndW1lbnRzIGlzIGRlcHJlY2F0ZWQnKVxuICAgIGVyci5uYW1lID0gJ1dhcm5pbmcnXG4gICAgY29uc29sZS53YXJuKGVyci5zdGFjaylcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSByZXR1cm4gcmVzb2x2ZShbXSlcbiAgICB2YXIgcmVtYWluaW5nID0gYXJncy5sZW5ndGhcbiAgICBmdW5jdGlvbiByZXMoaSwgdmFsKSB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAodmFsICYmICh0eXBlb2YgdmFsID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICAgIHZhciB0aGVuID0gdmFsLnRoZW5cbiAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRoZW4uY2FsbCh2YWwsIGZ1bmN0aW9uICh2YWwpIHsgcmVzKGksIHZhbCkgfSwgcmVqZWN0KVxuICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGFyZ3NbaV0gPSB2YWxcbiAgICAgICAgaWYgKC0tcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgcmVzb2x2ZShhcmdzKTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgcmVqZWN0KGV4KVxuICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlcyhpLCBhcmdzW2ldKVxuICAgIH1cbiAgfSlcbn1cblxuUHJvbWlzZS5yZWplY3QgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgXG4gICAgcmVqZWN0KHZhbHVlKTtcbiAgfSk7XG59XG5cblByb21pc2UucmFjZSA9IGZ1bmN0aW9uICh2YWx1ZXMpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgXG4gICAgdmFsdWVzLmZvckVhY2goZnVuY3Rpb24odmFsdWUpe1xuICAgICAgUHJvbWlzZS5yZXNvbHZlKHZhbHVlKS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgfSlcbiAgfSk7XG59XG5cbi8qIFByb3RvdHlwZSBNZXRob2RzICovXG5cblByb21pc2UucHJvdG90eXBlLmRvbmUgPSBmdW5jdGlvbiAob25GdWxmaWxsZWQsIG9uUmVqZWN0ZWQpIHtcbiAgdmFyIHNlbGYgPSBhcmd1bWVudHMubGVuZ3RoID8gdGhpcy50aGVuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiB0aGlzXG4gIHNlbGYudGhlbihudWxsLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICB0aHJvdyBlcnJcbiAgICB9KVxuICB9KVxufVxuXG5Qcm9taXNlLnByb3RvdHlwZS5ub2RlaWZ5ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykgcmV0dXJuIHRoaXNcblxuICB0aGlzLnRoZW4oZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSlcbiAgICB9KVxuICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgYXNhcChmdW5jdGlvbiAoKSB7XG4gICAgICBjYWxsYmFjayhlcnIpXG4gICAgfSlcbiAgfSlcbn1cblxuUHJvbWlzZS5wcm90b3R5cGVbJ2NhdGNoJ10gPSBmdW5jdGlvbiAob25SZWplY3RlZCkge1xuICByZXR1cm4gdGhpcy50aGVuKG51bGwsIG9uUmVqZWN0ZWQpO1xufVxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzKXtcblxuLy8gVXNlIHRoZSBmYXN0ZXN0IHBvc3NpYmxlIG1lYW5zIHRvIGV4ZWN1dGUgYSB0YXNrIGluIGEgZnV0dXJlIHR1cm5cbi8vIG9mIHRoZSBldmVudCBsb29wLlxuXG4vLyBsaW5rZWQgbGlzdCBvZiB0YXNrcyAoc2luZ2xlLCB3aXRoIGhlYWQgbm9kZSlcbnZhciBoZWFkID0ge3Rhc2s6IHZvaWQgMCwgbmV4dDogbnVsbH07XG52YXIgdGFpbCA9IGhlYWQ7XG52YXIgZmx1c2hpbmcgPSBmYWxzZTtcbnZhciByZXF1ZXN0Rmx1c2ggPSB2b2lkIDA7XG52YXIgaXNOb2RlSlMgPSBmYWxzZTtcblxuZnVuY3Rpb24gZmx1c2goKSB7XG4gICAgLyoganNoaW50IGxvb3BmdW5jOiB0cnVlICovXG5cbiAgICB3aGlsZSAoaGVhZC5uZXh0KSB7XG4gICAgICAgIGhlYWQgPSBoZWFkLm5leHQ7XG4gICAgICAgIHZhciB0YXNrID0gaGVhZC50YXNrO1xuICAgICAgICBoZWFkLnRhc2sgPSB2b2lkIDA7XG4gICAgICAgIHZhciBkb21haW4gPSBoZWFkLmRvbWFpbjtcblxuICAgICAgICBpZiAoZG9tYWluKSB7XG4gICAgICAgICAgICBoZWFkLmRvbWFpbiA9IHZvaWQgMDtcbiAgICAgICAgICAgIGRvbWFpbi5lbnRlcigpO1xuICAgICAgICB9XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRhc2soKTtcblxuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoaXNOb2RlSlMpIHtcbiAgICAgICAgICAgICAgICAvLyBJbiBub2RlLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBjb25zaWRlcmVkIGZhdGFsIGVycm9ycy5cbiAgICAgICAgICAgICAgICAvLyBSZS10aHJvdyB0aGVtIHN5bmNocm9ub3VzbHkgdG8gaW50ZXJydXB0IGZsdXNoaW5nIVxuXG4gICAgICAgICAgICAgICAgLy8gRW5zdXJlIGNvbnRpbnVhdGlvbiBpZiB0aGUgdW5jYXVnaHQgZXhjZXB0aW9uIGlzIHN1cHByZXNzZWRcbiAgICAgICAgICAgICAgICAvLyBsaXN0ZW5pbmcgXCJ1bmNhdWdodEV4Y2VwdGlvblwiIGV2ZW50cyAoYXMgZG9tYWlucyBkb2VzKS5cbiAgICAgICAgICAgICAgICAvLyBDb250aW51ZSBpbiBuZXh0IGV2ZW50IHRvIGF2b2lkIHRpY2sgcmVjdXJzaW9uLlxuICAgICAgICAgICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgICAgICAgICAgZG9tYWluLmV4aXQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dChmbHVzaCwgMCk7XG4gICAgICAgICAgICAgICAgaWYgKGRvbWFpbikge1xuICAgICAgICAgICAgICAgICAgICBkb21haW4uZW50ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aHJvdyBlO1xuXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEluIGJyb3dzZXJzLCB1bmNhdWdodCBleGNlcHRpb25zIGFyZSBub3QgZmF0YWwuXG4gICAgICAgICAgICAgICAgLy8gUmUtdGhyb3cgdGhlbSBhc3luY2hyb25vdXNseSB0byBhdm9pZCBzbG93LWRvd25zLlxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb21haW4pIHtcbiAgICAgICAgICAgIGRvbWFpbi5leGl0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmbHVzaGluZyA9IGZhbHNlO1xufVxuXG5pZiAodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2Vzcy5uZXh0VGljaykge1xuICAgIC8vIE5vZGUuanMgYmVmb3JlIDAuOS4gTm90ZSB0aGF0IHNvbWUgZmFrZS1Ob2RlIGVudmlyb25tZW50cywgbGlrZSB0aGVcbiAgICAvLyBNb2NoYSB0ZXN0IHJ1bm5lciwgaW50cm9kdWNlIGEgYHByb2Nlc3NgIGdsb2JhbCB3aXRob3V0IGEgYG5leHRUaWNrYC5cbiAgICBpc05vZGVKUyA9IHRydWU7XG5cbiAgICByZXF1ZXN0Rmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHByb2Nlc3MubmV4dFRpY2soZmx1c2gpO1xuICAgIH07XG5cbn0gZWxzZSBpZiAodHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgLy8gSW4gSUUxMCwgTm9kZS5qcyAwLjkrLCBvciBodHRwczovL2dpdGh1Yi5jb20vTm9ibGVKUy9zZXRJbW1lZGlhdGVcbiAgICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgICAgICByZXF1ZXN0Rmx1c2ggPSBzZXRJbW1lZGlhdGUuYmluZCh3aW5kb3csIGZsdXNoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXF1ZXN0Rmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZXRJbW1lZGlhdGUoZmx1c2gpO1xuICAgICAgICB9O1xuICAgIH1cblxufSBlbHNlIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgICAvLyBtb2Rlcm4gYnJvd3NlcnNcbiAgICAvLyBodHRwOi8vd3d3Lm5vbmJsb2NraW5nLmlvLzIwMTEvMDYvd2luZG93bmV4dHRpY2suaHRtbFxuICAgIHZhciBjaGFubmVsID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7XG4gICAgY2hhbm5lbC5wb3J0MS5vbm1lc3NhZ2UgPSBmbHVzaDtcbiAgICByZXF1ZXN0Rmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNoYW5uZWwucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgfTtcblxufSBlbHNlIHtcbiAgICAvLyBvbGQgYnJvd3NlcnNcbiAgICByZXF1ZXN0Rmx1c2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZmx1c2gsIDApO1xuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFzYXAodGFzaykge1xuICAgIHRhaWwgPSB0YWlsLm5leHQgPSB7XG4gICAgICAgIHRhc2s6IHRhc2ssXG4gICAgICAgIGRvbWFpbjogaXNOb2RlSlMgJiYgcHJvY2Vzcy5kb21haW4sXG4gICAgICAgIG5leHQ6IG51bGxcbiAgICB9O1xuXG4gICAgaWYgKCFmbHVzaGluZykge1xuICAgICAgICBmbHVzaGluZyA9IHRydWU7XG4gICAgICAgIHJlcXVlc3RGbHVzaCgpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gYXNhcDtcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcIi9ob21lL2RlYW4vb3NjLXdvcmtzcGFjZXMvd3MtYndhbGxldC13ZWIvYndhbGxldC5qcy9ub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvaW5zZXJ0LW1vZHVsZS1nbG9iYWxzL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIikpIiwidmFyIHRyYXZlcnNlID0gbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgcmV0dXJuIG5ldyBUcmF2ZXJzZShvYmopO1xufTtcblxuZnVuY3Rpb24gVHJhdmVyc2UgKG9iaikge1xuICAgIHRoaXMudmFsdWUgPSBvYmo7XG59XG5cblRyYXZlcnNlLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAocHMpIHtcbiAgICB2YXIgbm9kZSA9IHRoaXMudmFsdWU7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcy5sZW5ndGg7IGkgKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHBzW2ldO1xuICAgICAgICBpZiAoIW5vZGUgfHwgIWhhc093blByb3BlcnR5LmNhbGwobm9kZSwga2V5KSkge1xuICAgICAgICAgICAgbm9kZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlW2tleV07XG4gICAgfVxuICAgIHJldHVybiBub2RlO1xufTtcblxuVHJhdmVyc2UucHJvdG90eXBlLmhhcyA9IGZ1bmN0aW9uIChwcykge1xuICAgIHZhciBub2RlID0gdGhpcy52YWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBzLmxlbmd0aDsgaSArKykge1xuICAgICAgICB2YXIga2V5ID0gcHNbaV07XG4gICAgICAgIGlmICghbm9kZSB8fCAhaGFzT3duUHJvcGVydHkuY2FsbChub2RlLCBrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgbm9kZSA9IG5vZGVba2V5XTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5UcmF2ZXJzZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKHBzLCB2YWx1ZSkge1xuICAgIHZhciBub2RlID0gdGhpcy52YWx1ZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBzLmxlbmd0aCAtIDE7IGkgKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHBzW2ldO1xuICAgICAgICBpZiAoIWhhc093blByb3BlcnR5LmNhbGwobm9kZSwga2V5KSkgbm9kZVtrZXldID0ge307XG4gICAgICAgIG5vZGUgPSBub2RlW2tleV07XG4gICAgfVxuICAgIG5vZGVbcHNbaV1dID0gdmFsdWU7XG4gICAgcmV0dXJuIHZhbHVlO1xufTtcblxuVHJhdmVyc2UucHJvdG90eXBlLm1hcCA9IGZ1bmN0aW9uIChjYikge1xuICAgIHJldHVybiB3YWxrKHRoaXMudmFsdWUsIGNiLCB0cnVlKTtcbn07XG5cblRyYXZlcnNlLnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24gKGNiKSB7XG4gICAgdGhpcy52YWx1ZSA9IHdhbGsodGhpcy52YWx1ZSwgY2IsIGZhbHNlKTtcbiAgICByZXR1cm4gdGhpcy52YWx1ZTtcbn07XG5cblRyYXZlcnNlLnByb3RvdHlwZS5yZWR1Y2UgPSBmdW5jdGlvbiAoY2IsIGluaXQpIHtcbiAgICB2YXIgc2tpcCA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDE7XG4gICAgdmFyIGFjYyA9IHNraXAgPyB0aGlzLnZhbHVlIDogaW5pdDtcbiAgICB0aGlzLmZvckVhY2goZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzUm9vdCB8fCAhc2tpcCkge1xuICAgICAgICAgICAgYWNjID0gY2IuY2FsbCh0aGlzLCBhY2MsIHgpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGFjYztcbn07XG5cblRyYXZlcnNlLnByb3RvdHlwZS5wYXRocyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgYWNjID0gW107XG4gICAgdGhpcy5mb3JFYWNoKGZ1bmN0aW9uICh4KSB7XG4gICAgICAgIGFjYy5wdXNoKHRoaXMucGF0aCk7IFxuICAgIH0pO1xuICAgIHJldHVybiBhY2M7XG59O1xuXG5UcmF2ZXJzZS5wcm90b3R5cGUubm9kZXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGFjYyA9IFtdO1xuICAgIHRoaXMuZm9yRWFjaChmdW5jdGlvbiAoeCkge1xuICAgICAgICBhY2MucHVzaCh0aGlzLm5vZGUpO1xuICAgIH0pO1xuICAgIHJldHVybiBhY2M7XG59O1xuXG5UcmF2ZXJzZS5wcm90b3R5cGUuY2xvbmUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHBhcmVudHMgPSBbXSwgbm9kZXMgPSBbXTtcbiAgICBcbiAgICByZXR1cm4gKGZ1bmN0aW9uIGNsb25lIChzcmMpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocGFyZW50c1tpXSA9PT0gc3JjKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5vZGVzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodHlwZW9mIHNyYyA9PT0gJ29iamVjdCcgJiYgc3JjICE9PSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgZHN0ID0gY29weShzcmMpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJlbnRzLnB1c2goc3JjKTtcbiAgICAgICAgICAgIG5vZGVzLnB1c2goZHN0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yRWFjaChvYmplY3RLZXlzKHNyYyksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgICAgICBkc3Rba2V5XSA9IGNsb25lKHNyY1trZXldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBwYXJlbnRzLnBvcCgpO1xuICAgICAgICAgICAgbm9kZXMucG9wKCk7XG4gICAgICAgICAgICByZXR1cm4gZHN0O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNyYztcbiAgICAgICAgfVxuICAgIH0pKHRoaXMudmFsdWUpO1xufTtcblxuZnVuY3Rpb24gd2FsayAocm9vdCwgY2IsIGltbXV0YWJsZSkge1xuICAgIHZhciBwYXRoID0gW107XG4gICAgdmFyIHBhcmVudHMgPSBbXTtcbiAgICB2YXIgYWxpdmUgPSB0cnVlO1xuICAgIFxuICAgIHJldHVybiAoZnVuY3Rpb24gd2Fsa2VyIChub2RlXykge1xuICAgICAgICB2YXIgbm9kZSA9IGltbXV0YWJsZSA/IGNvcHkobm9kZV8pIDogbm9kZV87XG4gICAgICAgIHZhciBtb2RpZmllcnMgPSB7fTtcbiAgICAgICAgXG4gICAgICAgIHZhciBrZWVwR29pbmcgPSB0cnVlO1xuICAgICAgICBcbiAgICAgICAgdmFyIHN0YXRlID0ge1xuICAgICAgICAgICAgbm9kZSA6IG5vZGUsXG4gICAgICAgICAgICBub2RlXyA6IG5vZGVfLFxuICAgICAgICAgICAgcGF0aCA6IFtdLmNvbmNhdChwYXRoKSxcbiAgICAgICAgICAgIHBhcmVudCA6IHBhcmVudHNbcGFyZW50cy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgIHBhcmVudHMgOiBwYXJlbnRzLFxuICAgICAgICAgICAga2V5IDogcGF0aC5zbGljZSgtMSlbMF0sXG4gICAgICAgICAgICBpc1Jvb3QgOiBwYXRoLmxlbmd0aCA9PT0gMCxcbiAgICAgICAgICAgIGxldmVsIDogcGF0aC5sZW5ndGgsXG4gICAgICAgICAgICBjaXJjdWxhciA6IG51bGwsXG4gICAgICAgICAgICB1cGRhdGUgOiBmdW5jdGlvbiAoeCwgc3RvcEhlcmUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXN0YXRlLmlzUm9vdCkge1xuICAgICAgICAgICAgICAgICAgICBzdGF0ZS5wYXJlbnQubm9kZVtzdGF0ZS5rZXldID0geDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc3RhdGUubm9kZSA9IHg7XG4gICAgICAgICAgICAgICAgaWYgKHN0b3BIZXJlKSBrZWVwR29pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnZGVsZXRlJyA6IGZ1bmN0aW9uIChzdG9wSGVyZSkge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBzdGF0ZS5wYXJlbnQubm9kZVtzdGF0ZS5rZXldO1xuICAgICAgICAgICAgICAgIGlmIChzdG9wSGVyZSkga2VlcEdvaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlIDogZnVuY3Rpb24gKHN0b3BIZXJlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzQXJyYXkoc3RhdGUucGFyZW50Lm5vZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLnBhcmVudC5ub2RlLnNwbGljZShzdGF0ZS5rZXksIDEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHN0YXRlLnBhcmVudC5ub2RlW3N0YXRlLmtleV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChzdG9wSGVyZSkga2VlcEdvaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2V5cyA6IG51bGwsXG4gICAgICAgICAgICBiZWZvcmUgOiBmdW5jdGlvbiAoZikgeyBtb2RpZmllcnMuYmVmb3JlID0gZiB9LFxuICAgICAgICAgICAgYWZ0ZXIgOiBmdW5jdGlvbiAoZikgeyBtb2RpZmllcnMuYWZ0ZXIgPSBmIH0sXG4gICAgICAgICAgICBwcmUgOiBmdW5jdGlvbiAoZikgeyBtb2RpZmllcnMucHJlID0gZiB9LFxuICAgICAgICAgICAgcG9zdCA6IGZ1bmN0aW9uIChmKSB7IG1vZGlmaWVycy5wb3N0ID0gZiB9LFxuICAgICAgICAgICAgc3RvcCA6IGZ1bmN0aW9uICgpIHsgYWxpdmUgPSBmYWxzZSB9LFxuICAgICAgICAgICAgYmxvY2sgOiBmdW5jdGlvbiAoKSB7IGtlZXBHb2luZyA9IGZhbHNlIH1cbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGlmICghYWxpdmUpIHJldHVybiBzdGF0ZTtcbiAgICAgICAgXG4gICAgICAgIGZ1bmN0aW9uIHVwZGF0ZVN0YXRlKCkge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzdGF0ZS5ub2RlID09PSAnb2JqZWN0JyAmJiBzdGF0ZS5ub2RlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzdGF0ZS5rZXlzIHx8IHN0YXRlLm5vZGVfICE9PSBzdGF0ZS5ub2RlKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLmtleXMgPSBvYmplY3RLZXlzKHN0YXRlLm5vZGUpXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHN0YXRlLmlzTGVhZiA9IHN0YXRlLmtleXMubGVuZ3RoID09IDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRzW2ldLm5vZGVfID09PSBub2RlXykge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGUuY2lyY3VsYXIgPSBwYXJlbnRzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzdGF0ZS5pc0xlYWYgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHN0YXRlLmtleXMgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdGF0ZS5ub3RMZWFmID0gIXN0YXRlLmlzTGVhZjtcbiAgICAgICAgICAgIHN0YXRlLm5vdFJvb3QgPSAhc3RhdGUuaXNSb290O1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB1cGRhdGVTdGF0ZSgpO1xuICAgICAgICBcbiAgICAgICAgLy8gdXNlIHJldHVybiB2YWx1ZXMgdG8gdXBkYXRlIGlmIGRlZmluZWRcbiAgICAgICAgdmFyIHJldCA9IGNiLmNhbGwoc3RhdGUsIHN0YXRlLm5vZGUpO1xuICAgICAgICBpZiAocmV0ICE9PSB1bmRlZmluZWQgJiYgc3RhdGUudXBkYXRlKSBzdGF0ZS51cGRhdGUocmV0KTtcbiAgICAgICAgXG4gICAgICAgIGlmIChtb2RpZmllcnMuYmVmb3JlKSBtb2RpZmllcnMuYmVmb3JlLmNhbGwoc3RhdGUsIHN0YXRlLm5vZGUpO1xuICAgICAgICBcbiAgICAgICAgaWYgKCFrZWVwR29pbmcpIHJldHVybiBzdGF0ZTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0eXBlb2Ygc3RhdGUubm9kZSA9PSAnb2JqZWN0J1xuICAgICAgICAmJiBzdGF0ZS5ub2RlICE9PSBudWxsICYmICFzdGF0ZS5jaXJjdWxhcikge1xuICAgICAgICAgICAgcGFyZW50cy5wdXNoKHN0YXRlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgdXBkYXRlU3RhdGUoKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgZm9yRWFjaChzdGF0ZS5rZXlzLCBmdW5jdGlvbiAoa2V5LCBpKSB7XG4gICAgICAgICAgICAgICAgcGF0aC5wdXNoKGtleSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKG1vZGlmaWVycy5wcmUpIG1vZGlmaWVycy5wcmUuY2FsbChzdGF0ZSwgc3RhdGUubm9kZVtrZXldLCBrZXkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciBjaGlsZCA9IHdhbGtlcihzdGF0ZS5ub2RlW2tleV0pO1xuICAgICAgICAgICAgICAgIGlmIChpbW11dGFibGUgJiYgaGFzT3duUHJvcGVydHkuY2FsbChzdGF0ZS5ub2RlLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXRlLm5vZGVba2V5XSA9IGNoaWxkLm5vZGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNoaWxkLmlzTGFzdCA9IGkgPT0gc3RhdGUua2V5cy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgICAgIGNoaWxkLmlzRmlyc3QgPSBpID09IDA7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKG1vZGlmaWVycy5wb3N0KSBtb2RpZmllcnMucG9zdC5jYWxsKHN0YXRlLCBjaGlsZCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgcGF0aC5wb3AoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcGFyZW50cy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYgKG1vZGlmaWVycy5hZnRlcikgbW9kaWZpZXJzLmFmdGVyLmNhbGwoc3RhdGUsIHN0YXRlLm5vZGUpO1xuICAgICAgICBcbiAgICAgICAgcmV0dXJuIHN0YXRlO1xuICAgIH0pKHJvb3QpLm5vZGU7XG59XG5cbmZ1bmN0aW9uIGNvcHkgKHNyYykge1xuICAgIGlmICh0eXBlb2Ygc3JjID09PSAnb2JqZWN0JyAmJiBzcmMgIT09IG51bGwpIHtcbiAgICAgICAgdmFyIGRzdDtcbiAgICAgICAgXG4gICAgICAgIGlmIChpc0FycmF5KHNyYykpIHtcbiAgICAgICAgICAgIGRzdCA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzRGF0ZShzcmMpKSB7XG4gICAgICAgICAgICBkc3QgPSBuZXcgRGF0ZShzcmMuZ2V0VGltZSA/IHNyYy5nZXRUaW1lKCkgOiBzcmMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGlzUmVnRXhwKHNyYykpIHtcbiAgICAgICAgICAgIGRzdCA9IG5ldyBSZWdFeHAoc3JjKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc0Vycm9yKHNyYykpIHtcbiAgICAgICAgICAgIGRzdCA9IHsgbWVzc2FnZTogc3JjLm1lc3NhZ2UgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc0Jvb2xlYW4oc3JjKSkge1xuICAgICAgICAgICAgZHN0ID0gbmV3IEJvb2xlYW4oc3JjKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChpc051bWJlcihzcmMpKSB7XG4gICAgICAgICAgICBkc3QgPSBuZXcgTnVtYmVyKHNyYyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoaXNTdHJpbmcoc3JjKSkge1xuICAgICAgICAgICAgZHN0ID0gbmV3IFN0cmluZyhzcmMpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKE9iamVjdC5jcmVhdGUgJiYgT2JqZWN0LmdldFByb3RvdHlwZU9mKSB7XG4gICAgICAgICAgICBkc3QgPSBPYmplY3QuY3JlYXRlKE9iamVjdC5nZXRQcm90b3R5cGVPZihzcmMpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChzcmMuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuICAgICAgICAgICAgZHN0ID0ge307XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXIgcHJvdG8gPVxuICAgICAgICAgICAgICAgIChzcmMuY29uc3RydWN0b3IgJiYgc3JjLmNvbnN0cnVjdG9yLnByb3RvdHlwZSlcbiAgICAgICAgICAgICAgICB8fCBzcmMuX19wcm90b19fXG4gICAgICAgICAgICAgICAgfHwge31cbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIHZhciBUID0gZnVuY3Rpb24gKCkge307XG4gICAgICAgICAgICBULnByb3RvdHlwZSA9IHByb3RvO1xuICAgICAgICAgICAgZHN0ID0gbmV3IFQ7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGZvckVhY2gob2JqZWN0S2V5cyhzcmMpLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgICAgICAgICBkc3Rba2V5XSA9IHNyY1trZXldO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRzdDtcbiAgICB9XG4gICAgZWxzZSByZXR1cm4gc3JjO1xufVxuXG52YXIgb2JqZWN0S2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIGtleXMgKG9iaikge1xuICAgIHZhciByZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSByZXMucHVzaChrZXkpXG4gICAgcmV0dXJuIHJlcztcbn07XG5cbmZ1bmN0aW9uIHRvUyAob2JqKSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqKSB9XG5mdW5jdGlvbiBpc0RhdGUgKG9iaikgeyByZXR1cm4gdG9TKG9iaikgPT09ICdbb2JqZWN0IERhdGVdJyB9XG5mdW5jdGlvbiBpc1JlZ0V4cCAob2JqKSB7IHJldHVybiB0b1Mob2JqKSA9PT0gJ1tvYmplY3QgUmVnRXhwXScgfVxuZnVuY3Rpb24gaXNFcnJvciAob2JqKSB7IHJldHVybiB0b1Mob2JqKSA9PT0gJ1tvYmplY3QgRXJyb3JdJyB9XG5mdW5jdGlvbiBpc0Jvb2xlYW4gKG9iaikgeyByZXR1cm4gdG9TKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJyB9XG5mdW5jdGlvbiBpc051bWJlciAob2JqKSB7IHJldHVybiB0b1Mob2JqKSA9PT0gJ1tvYmplY3QgTnVtYmVyXScgfVxuZnVuY3Rpb24gaXNTdHJpbmcgKG9iaikgeyByZXR1cm4gdG9TKG9iaikgPT09ICdbb2JqZWN0IFN0cmluZ10nIH1cblxudmFyIGlzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIGlzQXJyYXkgKHhzKSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh4cykgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgZm9yRWFjaCA9IGZ1bmN0aW9uICh4cywgZm4pIHtcbiAgICBpZiAoeHMuZm9yRWFjaCkgcmV0dXJuIHhzLmZvckVhY2goZm4pXG4gICAgZWxzZSBmb3IgKHZhciBpID0gMDsgaSA8IHhzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZuKHhzW2ldLCBpLCB4cyk7XG4gICAgfVxufTtcblxuZm9yRWFjaChvYmplY3RLZXlzKFRyYXZlcnNlLnByb3RvdHlwZSksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICB0cmF2ZXJzZVtrZXldID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgICB2YXIgYXJncyA9IFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgdmFyIHQgPSBuZXcgVHJhdmVyc2Uob2JqKTtcbiAgICAgICAgcmV0dXJuIHRba2V5XS5hcHBseSh0LCBhcmdzKTtcbiAgICB9O1xufSk7XG5cbnZhciBoYXNPd25Qcm9wZXJ0eSA9IE9iamVjdC5oYXNPd25Qcm9wZXJ0eSB8fCBmdW5jdGlvbiAob2JqLCBrZXkpIHtcbiAgICByZXR1cm4ga2V5IGluIG9iajtcbn07XG4iLCIoZnVuY3Rpb24gKHJvb3QpIHtcbiAgIFwidXNlIHN0cmljdFwiO1xuXG4vKioqKiogdW5vcm0uanMgKioqKiovXG5cbi8qXG4gKiBVbmljb2RlTm9ybWFsaXplciAxLjAuMFxuICogQ29weXJpZ2h0IChjKSAyMDA4IE1hdHN1emFcbiAqIER1YWwgbGljZW5zZWQgdW5kZXIgdGhlIE1JVCAoTUlULUxJQ0VOU0UudHh0KSBhbmQgR1BMIChHUEwtTElDRU5TRS50eHQpIGxpY2Vuc2VzLlxuICogJERhdGU6IDIwMDgtMDYtMDUgMTY6NDQ6MTcgKzAyMDAgKFRodSwgMDUgSnVuIDIwMDgpICRcbiAqICRSZXY6IDEzMzA5ICRcbiAqL1xuXG4gICB2YXIgREVGQVVMVF9GRUFUVVJFID0gW251bGwsIDAsIHt9XTtcbiAgIHZhciBDQUNIRV9USFJFU0hPTEQgPSAxMDtcbiAgIHZhciBTQmFzZSA9IDB4QUMwMCwgTEJhc2UgPSAweDExMDAsIFZCYXNlID0gMHgxMTYxLCBUQmFzZSA9IDB4MTFBNywgTENvdW50ID0gMTksIFZDb3VudCA9IDIxLCBUQ291bnQgPSAyODtcbiAgIHZhciBOQ291bnQgPSBWQ291bnQgKiBUQ291bnQ7IC8vIDU4OFxuICAgdmFyIFNDb3VudCA9IExDb3VudCAqIE5Db3VudDsgLy8gMTExNzJcblxuICAgdmFyIFVDaGFyID0gZnVuY3Rpb24oY3AsIGZlYXR1cmUpe1xuICAgICAgdGhpcy5jb2RlcG9pbnQgPSBjcDtcbiAgICAgIHRoaXMuZmVhdHVyZSA9IGZlYXR1cmU7XG4gICB9O1xuXG4gICAvLyBTdHJhdGVnaWVzXG4gICB2YXIgY2FjaGUgPSB7fTtcbiAgIHZhciBjYWNoZUNvdW50ZXIgPSBbXTtcbiAgIGZvciAodmFyIGkgPSAwOyBpIDw9IDB4RkY7ICsraSl7XG4gICAgICBjYWNoZUNvdW50ZXJbaV0gPSAwO1xuICAgfVxuXG4gICBmdW5jdGlvbiBmcm9tQ2FjaGUobmV4dCwgY3AsIG5lZWRGZWF0dXJlKXtcbiAgICAgIHZhciByZXQgPSBjYWNoZVtjcF07XG4gICAgICBpZighcmV0KXtcbiAgICAgICAgIHJldCA9IG5leHQoY3AsIG5lZWRGZWF0dXJlKTtcbiAgICAgICAgIGlmKCEhcmV0LmZlYXR1cmUgJiYgKytjYWNoZUNvdW50ZXJbKGNwID4+IDgpICYgMHhGRl0gPiBDQUNIRV9USFJFU0hPTEQpe1xuICAgICAgICAgICAgY2FjaGVbY3BdID0gcmV0O1xuICAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgIH1cblxuICAgZnVuY3Rpb24gZnJvbURhdGEobmV4dCwgY3AsIG5lZWRGZWF0dXJlKXtcbiAgICAgIHZhciBoYXNoID0gY3AgJiAweEZGMDA7XG4gICAgICB2YXIgZHVuaXQgPSBVQ2hhci51ZGF0YVtoYXNoXSB8fCB7fTtcbiAgICAgIHZhciBmID0gZHVuaXRbY3BdO1xuICAgICAgcmV0dXJuIGYgPyBuZXcgVUNoYXIoY3AsIGYpIDogbmV3IFVDaGFyKGNwLCBERUZBVUxUX0ZFQVRVUkUpO1xuICAgfVxuICAgZnVuY3Rpb24gZnJvbUNwT25seShuZXh0LCBjcCwgbmVlZEZlYXR1cmUpe1xuICAgICAgcmV0dXJuICEhbmVlZEZlYXR1cmUgPyBuZXh0KGNwLCBuZWVkRmVhdHVyZSkgOiBuZXcgVUNoYXIoY3AsIG51bGwpO1xuICAgfVxuICAgZnVuY3Rpb24gZnJvbVJ1bGVCYXNlZEphbW8obmV4dCwgY3AsIG5lZWRGZWF0dXJlKXtcbiAgICAgIHZhciBqO1xuICAgICAgaWYoY3AgPCBMQmFzZSB8fCAoTEJhc2UgKyBMQ291bnQgPD0gY3AgJiYgY3AgPCBTQmFzZSkgfHwgKFNCYXNlICsgU0NvdW50IDwgY3ApKXtcbiAgICAgICAgIHJldHVybiBuZXh0KGNwLCBuZWVkRmVhdHVyZSk7XG4gICAgICB9XG4gICAgICBpZihMQmFzZSA8PSBjcCAmJiBjcCA8IExCYXNlICsgTENvdW50KXtcbiAgICAgICAgIHZhciBjID0ge307XG4gICAgICAgICB2YXIgYmFzZSA9IChjcCAtIExCYXNlKSAqIFZDb3VudDtcbiAgICAgICAgIGZvciAoaiA9IDA7IGogPCBWQ291bnQ7ICsrail7XG4gICAgICAgICAgICBjW1ZCYXNlICsgal0gPSBTQmFzZSArIFRDb3VudCAqIChqICsgYmFzZSk7XG4gICAgICAgICB9XG4gICAgICAgICByZXR1cm4gbmV3IFVDaGFyKGNwLCBbLCxjXSk7XG4gICAgICB9XG5cbiAgICAgIHZhciBTSW5kZXggPSBjcCAtIFNCYXNlO1xuICAgICAgdmFyIFRJbmRleCA9IFNJbmRleCAlIFRDb3VudDtcbiAgICAgIHZhciBmZWF0dXJlID0gW107XG4gICAgICBpZihUSW5kZXggIT09IDApe1xuICAgICAgICAgZmVhdHVyZVswXSA9IFtTQmFzZSArIFNJbmRleCAtIFRJbmRleCwgVEJhc2UgKyBUSW5kZXhdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgIGZlYXR1cmVbMF0gPSBbTEJhc2UgKyBNYXRoLmZsb29yKFNJbmRleCAvIE5Db3VudCksIFZCYXNlICsgTWF0aC5mbG9vcigoU0luZGV4ICUgTkNvdW50KSAvIFRDb3VudCldO1xuICAgICAgICAgZmVhdHVyZVsyXSA9IHt9O1xuICAgICAgICAgZm9yIChqID0gMTsgaiA8IFRDb3VudDsgKytqKXtcbiAgICAgICAgICAgIGZlYXR1cmVbMl1bVEJhc2UgKyBqXSA9IGNwICsgajtcbiAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgVUNoYXIoY3AsIGZlYXR1cmUpO1xuICAgfVxuICAgZnVuY3Rpb24gZnJvbUNwRmlsdGVyKG5leHQsIGNwLCBuZWVkRmVhdHVyZSl7XG4gICAgICByZXR1cm4gY3AgPCA2MCB8fCAxMzMxMSA8IGNwICYmIGNwIDwgNDI2MDcgPyBuZXcgVUNoYXIoY3AsIERFRkFVTFRfRkVBVFVSRSkgOiBuZXh0KGNwLCBuZWVkRmVhdHVyZSk7XG4gICB9XG5cbiAgIHZhciBzdHJhdGVnaWVzID0gW2Zyb21DcEZpbHRlciwgZnJvbUNhY2hlLCBmcm9tQ3BPbmx5LCBmcm9tUnVsZUJhc2VkSmFtbywgZnJvbURhdGFdO1xuXG4gICBVQ2hhci5mcm9tQ2hhckNvZGUgPSBzdHJhdGVnaWVzLnJlZHVjZVJpZ2h0KGZ1bmN0aW9uIChuZXh0LCBzdHJhdGVneSkge1xuICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjcCwgbmVlZEZlYXR1cmUpIHtcbiAgICAgICAgIHJldHVybiBzdHJhdGVneShuZXh0LCBjcCwgbmVlZEZlYXR1cmUpO1xuICAgICAgfTtcbiAgIH0sIG51bGwpO1xuXG4gICBVQ2hhci5pc0hpZ2hTdXJyb2dhdGUgPSBmdW5jdGlvbihjcCl7XG4gICAgICByZXR1cm4gY3AgPj0gMHhEODAwICYmIGNwIDw9IDB4REJGRjtcbiAgIH07XG4gICBVQ2hhci5pc0xvd1N1cnJvZ2F0ZSA9IGZ1bmN0aW9uKGNwKXtcbiAgICAgIHJldHVybiBjcCA+PSAweERDMDAgJiYgY3AgPD0gMHhERkZGO1xuICAgfTtcblxuICAgVUNoYXIucHJvdG90eXBlLnByZXBGZWF0dXJlID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKCF0aGlzLmZlYXR1cmUpe1xuICAgICAgICAgdGhpcy5mZWF0dXJlID0gVUNoYXIuZnJvbUNoYXJDb2RlKHRoaXMuY29kZXBvaW50LCB0cnVlKS5mZWF0dXJlO1xuICAgICAgfVxuICAgfTtcblxuICAgVUNoYXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKXtcbiAgICAgIGlmKHRoaXMuY29kZXBvaW50IDwgMHgxMDAwMCl7XG4gICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzLmNvZGVwb2ludCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAgdmFyIHggPSB0aGlzLmNvZGVwb2ludCAtIDB4MTAwMDA7XG4gICAgICAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZShNYXRoLmZsb29yKHggLyAweDQwMCkgKyAweEQ4MDAsIHggJSAweDQwMCArIDB4REMwMCk7XG4gICAgICB9XG4gICB9O1xuXG4gICBVQ2hhci5wcm90b3R5cGUuZ2V0RGVjb21wID0gZnVuY3Rpb24oKXtcbiAgICAgIHRoaXMucHJlcEZlYXR1cmUoKTtcbiAgICAgIHJldHVybiB0aGlzLmZlYXR1cmVbMF0gfHwgbnVsbDtcbiAgIH07XG5cbiAgIFVDaGFyLnByb3RvdHlwZS5pc0NvbXBhdGliaWxpdHkgPSBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5wcmVwRmVhdHVyZSgpO1xuICAgICAgcmV0dXJuICEhdGhpcy5mZWF0dXJlWzFdICYmICh0aGlzLmZlYXR1cmVbMV0gJiAoMSA8PCA4KSk7XG4gICB9O1xuICAgVUNoYXIucHJvdG90eXBlLmlzRXhjbHVkZSA9IGZ1bmN0aW9uKCl7XG4gICAgICB0aGlzLnByZXBGZWF0dXJlKCk7XG4gICAgICByZXR1cm4gISF0aGlzLmZlYXR1cmVbMV0gJiYgKHRoaXMuZmVhdHVyZVsxXSAmICgxIDw8IDkpKTtcbiAgIH07XG4gICBVQ2hhci5wcm90b3R5cGUuZ2V0Q2Fub25pY2FsQ2xhc3MgPSBmdW5jdGlvbigpe1xuICAgICAgdGhpcy5wcmVwRmVhdHVyZSgpO1xuICAgICAgcmV0dXJuICEhdGhpcy5mZWF0dXJlWzFdID8gKHRoaXMuZmVhdHVyZVsxXSAmIDB4ZmYpIDogMDtcbiAgIH07XG4gICBVQ2hhci5wcm90b3R5cGUuZ2V0Q29tcG9zaXRlID0gZnVuY3Rpb24oZm9sbG93aW5nKXtcbiAgICAgIHRoaXMucHJlcEZlYXR1cmUoKTtcbiAgICAgIGlmKCF0aGlzLmZlYXR1cmVbMl0pe1xuICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgICB2YXIgY3AgPSB0aGlzLmZlYXR1cmVbMl1bZm9sbG93aW5nLmNvZGVwb2ludF07XG4gICAgICByZXR1cm4gY3AgPyBVQ2hhci5mcm9tQ2hhckNvZGUoY3ApIDogbnVsbDtcbiAgIH07XG5cbiAgIHZhciBVQ2hhckl0ZXJhdG9yID0gZnVuY3Rpb24oc3RyKXtcbiAgICAgIHRoaXMuc3RyID0gc3RyO1xuICAgICAgdGhpcy5jdXJzb3IgPSAwO1xuICAgfTtcbiAgIFVDaGFySXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpe1xuICAgICAgaWYoISF0aGlzLnN0ciAmJiB0aGlzLmN1cnNvciA8IHRoaXMuc3RyLmxlbmd0aCl7XG4gICAgICAgICB2YXIgY3AgPSB0aGlzLnN0ci5jaGFyQ29kZUF0KHRoaXMuY3Vyc29yKyspO1xuICAgICAgICAgdmFyIGQ7XG4gICAgICAgICBpZihVQ2hhci5pc0hpZ2hTdXJyb2dhdGUoY3ApICYmIHRoaXMuY3Vyc29yIDwgdGhpcy5zdHIubGVuZ3RoICYmIFVDaGFyLmlzTG93U3Vycm9nYXRlKChkID0gdGhpcy5zdHIuY2hhckNvZGVBdCh0aGlzLmN1cnNvcikpKSl7XG4gICAgICAgICAgICBjcCA9IChjcCAtIDB4RDgwMCkgKiAweDQwMCArIChkIC0weERDMDApICsgMHgxMDAwMDtcbiAgICAgICAgICAgICsrdGhpcy5jdXJzb3I7XG4gICAgICAgICB9XG4gICAgICAgICByZXR1cm4gVUNoYXIuZnJvbUNoYXJDb2RlKGNwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICB0aGlzLnN0ciA9IG51bGw7XG4gICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgIH07XG5cbiAgIHZhciBSZWN1cnNEZWNvbXBJdGVyYXRvciA9IGZ1bmN0aW9uKGl0LCBjYW5vKXtcbiAgICAgIHRoaXMuaXQgPSBpdDtcbiAgICAgIHRoaXMuY2Fub25pY2FsID0gY2FubztcbiAgICAgIHRoaXMucmVzQnVmID0gW107XG4gICB9O1xuXG4gICBSZWN1cnNEZWNvbXBJdGVyYXRvci5wcm90b3R5cGUubmV4dCA9IGZ1bmN0aW9uKCl7XG4gICAgICBmdW5jdGlvbiByZWN1cnNpdmVEZWNvbXAoY2FubywgdWNoYXIpe1xuICAgICAgICAgdmFyIGRlY29tcCA9IHVjaGFyLmdldERlY29tcCgpO1xuICAgICAgICAgaWYoISFkZWNvbXAgJiYgIShjYW5vICYmIHVjaGFyLmlzQ29tcGF0aWJpbGl0eSgpKSl7XG4gICAgICAgICAgICB2YXIgcmV0ID0gW107XG4gICAgICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgZGVjb21wLmxlbmd0aDsgKytpKXtcbiAgICAgICAgICAgICAgIHZhciBhID0gcmVjdXJzaXZlRGVjb21wKGNhbm8sIFVDaGFyLmZyb21DaGFyQ29kZShkZWNvbXBbaV0pKTtcbiAgICAgICAgICAgICAgIC8vcmV0LmNvbmNhdChhKTsgLy88LXdoeSBkb2VzIG5vdCB0aGlzIHdvcms/XG4gICAgICAgICAgICAgICAvL2ZvbGxvd2luZyBibG9jayBpcyBhIHdvcmthcm91bmQuXG4gICAgICAgICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgYS5sZW5ndGg7ICsrail7XG4gICAgICAgICAgICAgICAgICByZXQucHVzaChhW2pdKTtcbiAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFt1Y2hhcl07XG4gICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZih0aGlzLnJlc0J1Zi5sZW5ndGggPT09IDApe1xuICAgICAgICAgdmFyIHVjaGFyID0gdGhpcy5pdC5uZXh0KCk7XG4gICAgICAgICBpZighdWNoYXIpe1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICB9XG4gICAgICAgICB0aGlzLnJlc0J1ZiA9IHJlY3Vyc2l2ZURlY29tcCh0aGlzLmNhbm9uaWNhbCwgdWNoYXIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVzQnVmLnNoaWZ0KCk7XG4gICB9O1xuXG4gICB2YXIgRGVjb21wSXRlcmF0b3IgPSBmdW5jdGlvbihpdCl7XG4gICAgICB0aGlzLml0ID0gaXQ7XG4gICAgICB0aGlzLnJlc0J1ZiA9IFtdO1xuICAgfTtcblxuICAgRGVjb21wSXRlcmF0b3IucHJvdG90eXBlLm5leHQgPSBmdW5jdGlvbigpe1xuICAgICAgdmFyIGNjO1xuICAgICAgaWYodGhpcy5yZXNCdWYubGVuZ3RoID09PSAwKXtcbiAgICAgICAgIGRve1xuICAgICAgICAgICAgdmFyIHVjaGFyID0gdGhpcy5pdC5uZXh0KCk7XG4gICAgICAgICAgICBpZighdWNoYXIpe1xuICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYyA9IHVjaGFyLmdldENhbm9uaWNhbENsYXNzKCk7XG4gICAgICAgICAgICB2YXIgaW5zcHQgPSB0aGlzLnJlc0J1Zi5sZW5ndGg7XG4gICAgICAgICAgICBpZihjYyAhPT0gMCl7XG4gICAgICAgICAgICAgICBmb3IoOyBpbnNwdCA+IDA7IC0taW5zcHQpe1xuICAgICAgICAgICAgICAgICAgdmFyIHVjaGFyMiA9IHRoaXMucmVzQnVmW2luc3B0IC0gMV07XG4gICAgICAgICAgICAgICAgICB2YXIgY2MyID0gdWNoYXIyLmdldENhbm9uaWNhbENsYXNzKCk7XG4gICAgICAgICAgICAgICAgICBpZihjYzIgPD0gY2Mpe1xuICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlc0J1Zi5zcGxpY2UoaW5zcHQsIDAsIHVjaGFyKTtcbiAgICAgICAgIH0gd2hpbGUoY2MgIT09IDApO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHRoaXMucmVzQnVmLnNoaWZ0KCk7XG4gICB9O1xuXG4gICB2YXIgQ29tcEl0ZXJhdG9yID0gZnVuY3Rpb24oaXQpe1xuICAgICAgdGhpcy5pdCA9IGl0O1xuICAgICAgdGhpcy5wcm9jQnVmID0gW107XG4gICAgICB0aGlzLnJlc0J1ZiA9IFtdO1xuICAgICAgdGhpcy5sYXN0Q2xhc3MgPSBudWxsO1xuICAgfTtcblxuICAgQ29tcEl0ZXJhdG9yLnByb3RvdHlwZS5uZXh0ID0gZnVuY3Rpb24oKXtcbiAgICAgIHdoaWxlKHRoaXMucmVzQnVmLmxlbmd0aCA9PT0gMCl7XG4gICAgICAgICB2YXIgdWNoYXIgPSB0aGlzLml0Lm5leHQoKTtcbiAgICAgICAgIGlmKCF1Y2hhcil7XG4gICAgICAgICAgICB0aGlzLnJlc0J1ZiA9IHRoaXMucHJvY0J1ZjtcbiAgICAgICAgICAgIHRoaXMucHJvY0J1ZiA9IFtdO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICB9XG4gICAgICAgICBpZih0aGlzLnByb2NCdWYubGVuZ3RoID09PSAwKXtcbiAgICAgICAgICAgIHRoaXMubGFzdENsYXNzID0gdWNoYXIuZ2V0Q2Fub25pY2FsQ2xhc3MoKTtcbiAgICAgICAgICAgIHRoaXMucHJvY0J1Zi5wdXNoKHVjaGFyKTtcbiAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgc3RhcnRlciA9IHRoaXMucHJvY0J1ZlswXTtcbiAgICAgICAgICAgIHZhciBjb21wb3NpdGUgPSBzdGFydGVyLmdldENvbXBvc2l0ZSh1Y2hhcik7XG4gICAgICAgICAgICB2YXIgY2MgPSB1Y2hhci5nZXRDYW5vbmljYWxDbGFzcygpO1xuICAgICAgICAgICAgaWYoISFjb21wb3NpdGUgJiYgKHRoaXMubGFzdENsYXNzIDwgY2MgfHwgdGhpcy5sYXN0Q2xhc3MgPT09IDApKXtcbiAgICAgICAgICAgICAgIHRoaXMucHJvY0J1ZlswXSA9IGNvbXBvc2l0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICBpZihjYyA9PT0gMCl7XG4gICAgICAgICAgICAgICAgICB0aGlzLnJlc0J1ZiA9IHRoaXMucHJvY0J1ZjtcbiAgICAgICAgICAgICAgICAgIHRoaXMucHJvY0J1ZiA9IFtdO1xuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgdGhpcy5sYXN0Q2xhc3MgPSBjYztcbiAgICAgICAgICAgICAgIHRoaXMucHJvY0J1Zi5wdXNoKHVjaGFyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiB0aGlzLnJlc0J1Zi5zaGlmdCgpO1xuICAgfTtcblxuICAgdmFyIGNyZWF0ZUl0ZXJhdG9yID0gZnVuY3Rpb24obW9kZSwgc3RyKXtcbiAgICAgIHN3aXRjaChtb2RlKXtcbiAgICAgICAgIGNhc2UgXCJORkRcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgRGVjb21wSXRlcmF0b3IobmV3IFJlY3Vyc0RlY29tcEl0ZXJhdG9yKG5ldyBVQ2hhckl0ZXJhdG9yKHN0ciksIHRydWUpKTtcbiAgICAgICAgIGNhc2UgXCJORktEXCI6XG4gICAgICAgICAgICByZXR1cm4gbmV3IERlY29tcEl0ZXJhdG9yKG5ldyBSZWN1cnNEZWNvbXBJdGVyYXRvcihuZXcgVUNoYXJJdGVyYXRvcihzdHIpLCBmYWxzZSkpO1xuICAgICAgICAgY2FzZSBcIk5GQ1wiOlxuICAgICAgICAgICAgcmV0dXJuIG5ldyBDb21wSXRlcmF0b3IobmV3IERlY29tcEl0ZXJhdG9yKG5ldyBSZWN1cnNEZWNvbXBJdGVyYXRvcihuZXcgVUNoYXJJdGVyYXRvcihzdHIpLCB0cnVlKSkpO1xuICAgICAgICAgY2FzZSBcIk5GS0NcIjpcbiAgICAgICAgICAgIHJldHVybiBuZXcgQ29tcEl0ZXJhdG9yKG5ldyBEZWNvbXBJdGVyYXRvcihuZXcgUmVjdXJzRGVjb21wSXRlcmF0b3IobmV3IFVDaGFySXRlcmF0b3Ioc3RyKSwgZmFsc2UpKSk7XG4gICAgICB9XG4gICAgICB0aHJvdyBtb2RlICsgXCIgaXMgaW52YWxpZFwiO1xuICAgfTtcbiAgIHZhciBub3JtYWxpemUgPSBmdW5jdGlvbihtb2RlLCBzdHIpe1xuICAgICAgdmFyIGl0ID0gY3JlYXRlSXRlcmF0b3IobW9kZSwgc3RyKTtcbiAgICAgIHZhciByZXQgPSBcIlwiO1xuICAgICAgdmFyIHVjaGFyO1xuICAgICAgd2hpbGUoISEodWNoYXIgPSBpdC5uZXh0KCkpKXtcbiAgICAgICAgIHJldCArPSB1Y2hhci50b1N0cmluZygpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJldDtcbiAgIH07XG5cbiAgIC8qIEFQSSBmdW5jdGlvbnMgKi9cbiAgIGZ1bmN0aW9uIG5mZChzdHIpe1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShcIk5GRFwiLCBzdHIpO1xuICAgfVxuXG4gICBmdW5jdGlvbiBuZmtkKHN0cil7XG4gICAgICByZXR1cm4gbm9ybWFsaXplKFwiTkZLRFwiLCBzdHIpO1xuICAgfVxuXG4gICBmdW5jdGlvbiBuZmMoc3RyKXtcbiAgICAgIHJldHVybiBub3JtYWxpemUoXCJORkNcIiwgc3RyKTtcbiAgIH1cblxuICAgZnVuY3Rpb24gbmZrYyhzdHIpe1xuICAgICAgcmV0dXJuIG5vcm1hbGl6ZShcIk5GS0NcIiwgc3RyKTtcbiAgIH1cblxuLyogVW5pY29kZSBkYXRhICovXG5VQ2hhci51ZGF0YT17XG4wOns2MDpbLCx7ODI0Ojg4MTR9XSw2MTpbLCx7ODI0Ojg4MDB9XSw2MjpbLCx7ODI0Ojg4MTV9XSw2NTpbLCx7NzY4OjE5Miw3Njk6MTkzLDc3MDoxOTQsNzcxOjE5NSw3NzI6MjU2LDc3NDoyNTgsNzc1OjU1MCw3NzY6MTk2LDc3Nzo3ODQyLDc3ODoxOTcsNzgwOjQ2MSw3ODM6NTEyLDc4NTo1MTQsODAzOjc4NDAsODA1Ojc2ODAsODA4OjI2MH1dLDY2OlssLHs3NzU6NzY4Miw4MDM6NzY4NCw4MTc6NzY4Nn1dLDY3OlssLHs3Njk6MjYyLDc3MDoyNjQsNzc1OjI2Niw3ODA6MjY4LDgwNzoxOTl9XSw2ODpbLCx7Nzc1Ojc2OTAsNzgwOjI3MCw4MDM6NzY5Miw4MDc6NzY5Niw4MTM6NzY5OCw4MTc6NzY5NH1dLDY5OlssLHs3Njg6MjAwLDc2OToyMDEsNzcwOjIwMiw3NzE6Nzg2OCw3NzI6Mjc0LDc3NDoyNzYsNzc1OjI3OCw3NzY6MjAzLDc3Nzo3ODY2LDc4MDoyODIsNzgzOjUxNiw3ODU6NTE4LDgwMzo3ODY0LDgwNzo1NTIsODA4OjI4MCw4MTM6NzcwNCw4MTY6NzcwNn1dLDcwOlssLHs3NzU6NzcxMH1dLDcxOlssLHs3Njk6NTAwLDc3MDoyODQsNzcyOjc3MTIsNzc0OjI4Niw3NzU6Mjg4LDc4MDo0ODYsODA3OjI5MH1dLDcyOlssLHs3NzA6MjkyLDc3NTo3NzE0LDc3Njo3NzE4LDc4MDo1NDIsODAzOjc3MTYsODA3Ojc3MjAsODE0Ojc3MjJ9XSw3MzpbLCx7NzY4OjIwNCw3Njk6MjA1LDc3MDoyMDYsNzcxOjI5Niw3NzI6Mjk4LDc3NDozMDAsNzc1OjMwNCw3NzY6MjA3LDc3Nzo3ODgwLDc4MDo0NjMsNzgzOjUyMCw3ODU6NTIyLDgwMzo3ODgyLDgwODozMDIsODE2Ojc3MjR9XSw3NDpbLCx7NzcwOjMwOH1dLDc1OlssLHs3Njk6NzcyOCw3ODA6NDg4LDgwMzo3NzMwLDgwNzozMTAsODE3Ojc3MzJ9XSw3NjpbLCx7NzY5OjMxMyw3ODA6MzE3LDgwMzo3NzM0LDgwNzozMTUsODEzOjc3NDAsODE3Ojc3Mzh9XSw3NzpbLCx7NzY5Ojc3NDIsNzc1Ojc3NDQsODAzOjc3NDZ9XSw3ODpbLCx7NzY4OjUwNCw3Njk6MzIzLDc3MToyMDksNzc1Ojc3NDgsNzgwOjMyNyw4MDM6Nzc1MCw4MDc6MzI1LDgxMzo3NzU0LDgxNzo3NzUyfV0sNzk6Wywsezc2ODoyMTAsNzY5OjIxMSw3NzA6MjEyLDc3MToyMTMsNzcyOjMzMiw3NzQ6MzM0LDc3NTo1NTgsNzc2OjIxNCw3Nzc6Nzg4Niw3Nzk6MzM2LDc4MDo0NjUsNzgzOjUyNCw3ODU6NTI2LDc5NTo0MTYsODAzOjc4ODQsODA4OjQ5MH1dLDgwOlssLHs3Njk6Nzc2NCw3NzU6Nzc2Nn1dLDgyOlssLHs3Njk6MzQwLDc3NTo3NzY4LDc4MDozNDQsNzgzOjUyOCw3ODU6NTMwLDgwMzo3NzcwLDgwNzozNDIsODE3Ojc3NzR9XSw4MzpbLCx7NzY5OjM0Niw3NzA6MzQ4LDc3NTo3Nzc2LDc4MDozNTIsODAzOjc3NzgsODA2OjUzNiw4MDc6MzUwfV0sODQ6Wywsezc3NTo3Nzg2LDc4MDozNTYsODAzOjc3ODgsODA2OjUzOCw4MDc6MzU0LDgxMzo3NzkyLDgxNzo3NzkwfV0sODU6Wywsezc2ODoyMTcsNzY5OjIxOCw3NzA6MjE5LDc3MTozNjAsNzcyOjM2Miw3NzQ6MzY0LDc3NjoyMjAsNzc3Ojc5MTAsNzc4OjM2Niw3Nzk6MzY4LDc4MDo0NjcsNzgzOjUzMiw3ODU6NTM0LDc5NTo0MzEsODAzOjc5MDgsODA0Ojc3OTQsODA4OjM3MCw4MTM6Nzc5OCw4MTY6Nzc5Nn1dLDg2OlssLHs3NzE6NzgwNCw4MDM6NzgwNn1dLDg3OlssLHs3Njg6NzgwOCw3Njk6NzgxMCw3NzA6MzcyLDc3NTo3ODE0LDc3Njo3ODEyLDgwMzo3ODE2fV0sODg6Wywsezc3NTo3ODE4LDc3Njo3ODIwfV0sODk6Wywsezc2ODo3OTIyLDc2OToyMjEsNzcwOjM3NCw3NzE6NzkyOCw3NzI6NTYyLDc3NTo3ODIyLDc3NjozNzYsNzc3Ojc5MjYsODAzOjc5MjR9XSw5MDpbLCx7NzY5OjM3Nyw3NzA6NzgyNCw3NzU6Mzc5LDc4MDozODEsODAzOjc4MjYsODE3Ojc4Mjh9XSw5NzpbLCx7NzY4OjIyNCw3Njk6MjI1LDc3MDoyMjYsNzcxOjIyNyw3NzI6MjU3LDc3NDoyNTksNzc1OjU1MSw3NzY6MjI4LDc3Nzo3ODQzLDc3ODoyMjksNzgwOjQ2Miw3ODM6NTEzLDc4NTo1MTUsODAzOjc4NDEsODA1Ojc2ODEsODA4OjI2MX1dLDk4OlssLHs3NzU6NzY4Myw4MDM6NzY4NSw4MTc6NzY4N31dLDk5OlssLHs3Njk6MjYzLDc3MDoyNjUsNzc1OjI2Nyw3ODA6MjY5LDgwNzoyMzF9XSwxMDA6Wywsezc3NTo3NjkxLDc4MDoyNzEsODAzOjc2OTMsODA3Ojc2OTcsODEzOjc2OTksODE3Ojc2OTV9XSwxMDE6Wywsezc2ODoyMzIsNzY5OjIzMyw3NzA6MjM0LDc3MTo3ODY5LDc3MjoyNzUsNzc0OjI3Nyw3NzU6Mjc5LDc3NjoyMzUsNzc3Ojc4NjcsNzgwOjI4Myw3ODM6NTE3LDc4NTo1MTksODAzOjc4NjUsODA3OjU1Myw4MDg6MjgxLDgxMzo3NzA1LDgxNjo3NzA3fV0sMTAyOlssLHs3NzU6NzcxMX1dLDEwMzpbLCx7NzY5OjUwMSw3NzA6Mjg1LDc3Mjo3NzEzLDc3NDoyODcsNzc1OjI4OSw3ODA6NDg3LDgwNzoyOTF9XSwxMDQ6Wywsezc3MDoyOTMsNzc1Ojc3MTUsNzc2Ojc3MTksNzgwOjU0Myw4MDM6NzcxNyw4MDc6NzcyMSw4MTQ6NzcyMyw4MTc6NzgzMH1dLDEwNTpbLCx7NzY4OjIzNiw3Njk6MjM3LDc3MDoyMzgsNzcxOjI5Nyw3NzI6Mjk5LDc3NDozMDEsNzc2OjIzOSw3Nzc6Nzg4MSw3ODA6NDY0LDc4Mzo1MjEsNzg1OjUyMyw4MDM6Nzg4Myw4MDg6MzAzLDgxNjo3NzI1fV0sMTA2OlssLHs3NzA6MzA5LDc4MDo0OTZ9XSwxMDc6Wywsezc2OTo3NzI5LDc4MDo0ODksODAzOjc3MzEsODA3OjMxMSw4MTc6NzczM31dLDEwODpbLCx7NzY5OjMxNCw3ODA6MzE4LDgwMzo3NzM1LDgwNzozMTYsODEzOjc3NDEsODE3Ojc3Mzl9XSwxMDk6Wywsezc2OTo3NzQzLDc3NTo3NzQ1LDgwMzo3NzQ3fV0sMTEwOlssLHs3Njg6NTA1LDc2OTozMjQsNzcxOjI0MSw3NzU6Nzc0OSw3ODA6MzI4LDgwMzo3NzUxLDgwNzozMjYsODEzOjc3NTUsODE3Ojc3NTN9XSwxMTE6Wywsezc2ODoyNDIsNzY5OjI0Myw3NzA6MjQ0LDc3MToyNDUsNzcyOjMzMyw3NzQ6MzM1LDc3NTo1NTksNzc2OjI0Niw3Nzc6Nzg4Nyw3Nzk6MzM3LDc4MDo0NjYsNzgzOjUyNSw3ODU6NTI3LDc5NTo0MTcsODAzOjc4ODUsODA4OjQ5MX1dLDExMjpbLCx7NzY5Ojc3NjUsNzc1Ojc3Njd9XSwxMTQ6Wywsezc2OTozNDEsNzc1Ojc3NjksNzgwOjM0NSw3ODM6NTI5LDc4NTo1MzEsODAzOjc3NzEsODA3OjM0Myw4MTc6Nzc3NX1dLDExNTpbLCx7NzY5OjM0Nyw3NzA6MzQ5LDc3NTo3Nzc3LDc4MDozNTMsODAzOjc3NzksODA2OjUzNyw4MDc6MzUxfV0sMTE2OlssLHs3NzU6Nzc4Nyw3NzY6NzgzMSw3ODA6MzU3LDgwMzo3Nzg5LDgwNjo1MzksODA3OjM1NSw4MTM6Nzc5Myw4MTc6Nzc5MX1dLDExNzpbLCx7NzY4OjI0OSw3Njk6MjUwLDc3MDoyNTEsNzcxOjM2MSw3NzI6MzYzLDc3NDozNjUsNzc2OjI1Miw3Nzc6NzkxMSw3Nzg6MzY3LDc3OTozNjksNzgwOjQ2OCw3ODM6NTMzLDc4NTo1MzUsNzk1OjQzMiw4MDM6NzkwOSw4MDQ6Nzc5NSw4MDg6MzcxLDgxMzo3Nzk5LDgxNjo3Nzk3fV0sMTE4OlssLHs3NzE6NzgwNSw4MDM6NzgwN31dLDExOTpbLCx7NzY4Ojc4MDksNzY5Ojc4MTEsNzcwOjM3Myw3NzU6NzgxNSw3NzY6NzgxMyw3Nzg6NzgzMiw4MDM6NzgxN31dLDEyMDpbLCx7Nzc1Ojc4MTksNzc2Ojc4MjF9XSwxMjE6Wywsezc2ODo3OTIzLDc2OToyNTMsNzcwOjM3NSw3NzE6NzkyOSw3NzI6NTYzLDc3NTo3ODIzLDc3NjoyNTUsNzc3Ojc5MjcsNzc4Ojc4MzMsODAzOjc5MjV9XSwxMjI6Wywsezc2OTozNzgsNzcwOjc4MjUsNzc1OjM4MCw3ODA6MzgyLDgwMzo3ODI3LDgxNzo3ODI5fV0sMTYwOltbMzJdLDI1Nl0sMTY4OltbMzIsNzc2XSwyNTYsezc2ODo4MTczLDc2OTo5MDEsODM0OjgxMjl9XSwxNzA6W1s5N10sMjU2XSwxNzU6W1szMiw3NzJdLDI1Nl0sMTc4OltbNTBdLDI1Nl0sMTc5OltbNTFdLDI1Nl0sMTgwOltbMzIsNzY5XSwyNTZdLDE4MTpbWzk1Nl0sMjU2XSwxODQ6W1szMiw4MDddLDI1Nl0sMTg1OltbNDldLDI1Nl0sMTg2OltbMTExXSwyNTZdLDE4ODpbWzQ5LDgyNjAsNTJdLDI1Nl0sMTg5OltbNDksODI2MCw1MF0sMjU2XSwxOTA6W1s1MSw4MjYwLDUyXSwyNTZdLDE5MjpbWzY1LDc2OF1dLDE5MzpbWzY1LDc2OV1dLDE5NDpbWzY1LDc3MF0sLHs3Njg6Nzg0Niw3Njk6Nzg0NCw3NzE6Nzg1MCw3Nzc6Nzg0OH1dLDE5NTpbWzY1LDc3MV1dLDE5NjpbWzY1LDc3Nl0sLHs3NzI6NDc4fV0sMTk3OltbNjUsNzc4XSwsezc2OTo1MDZ9XSwxOTg6Wywsezc2OTo1MDgsNzcyOjQ4Mn1dLDE5OTpbWzY3LDgwN10sLHs3Njk6NzY4OH1dLDIwMDpbWzY5LDc2OF1dLDIwMTpbWzY5LDc2OV1dLDIwMjpbWzY5LDc3MF0sLHs3Njg6Nzg3Miw3Njk6Nzg3MCw3NzE6Nzg3Niw3Nzc6Nzg3NH1dLDIwMzpbWzY5LDc3Nl1dLDIwNDpbWzczLDc2OF1dLDIwNTpbWzczLDc2OV1dLDIwNjpbWzczLDc3MF1dLDIwNzpbWzczLDc3Nl0sLHs3Njk6NzcyNn1dLDIwOTpbWzc4LDc3MV1dLDIxMDpbWzc5LDc2OF1dLDIxMTpbWzc5LDc2OV1dLDIxMjpbWzc5LDc3MF0sLHs3Njg6Nzg5MCw3Njk6Nzg4OCw3NzE6Nzg5NCw3Nzc6Nzg5Mn1dLDIxMzpbWzc5LDc3MV0sLHs3Njk6Nzc1Niw3NzI6NTU2LDc3Njo3NzU4fV0sMjE0OltbNzksNzc2XSwsezc3Mjo1NTR9XSwyMTY6Wywsezc2OTo1MTB9XSwyMTc6W1s4NSw3NjhdXSwyMTg6W1s4NSw3NjldXSwyMTk6W1s4NSw3NzBdXSwyMjA6W1s4NSw3NzZdLCx7NzY4OjQ3NSw3Njk6NDcxLDc3Mjo0NjksNzgwOjQ3M31dLDIyMTpbWzg5LDc2OV1dLDIyNDpbWzk3LDc2OF1dLDIyNTpbWzk3LDc2OV1dLDIyNjpbWzk3LDc3MF0sLHs3Njg6Nzg0Nyw3Njk6Nzg0NSw3NzE6Nzg1MSw3Nzc6Nzg0OX1dLDIyNzpbWzk3LDc3MV1dLDIyODpbWzk3LDc3Nl0sLHs3NzI6NDc5fV0sMjI5OltbOTcsNzc4XSwsezc2OTo1MDd9XSwyMzA6Wywsezc2OTo1MDksNzcyOjQ4M31dLDIzMTpbWzk5LDgwN10sLHs3Njk6NzY4OX1dLDIzMjpbWzEwMSw3NjhdXSwyMzM6W1sxMDEsNzY5XV0sMjM0OltbMTAxLDc3MF0sLHs3Njg6Nzg3Myw3Njk6Nzg3MSw3NzE6Nzg3Nyw3Nzc6Nzg3NX1dLDIzNTpbWzEwMSw3NzZdXSwyMzY6W1sxMDUsNzY4XV0sMjM3OltbMTA1LDc2OV1dLDIzODpbWzEwNSw3NzBdXSwyMzk6W1sxMDUsNzc2XSwsezc2OTo3NzI3fV0sMjQxOltbMTEwLDc3MV1dLDI0MjpbWzExMSw3NjhdXSwyNDM6W1sxMTEsNzY5XV0sMjQ0OltbMTExLDc3MF0sLHs3Njg6Nzg5MSw3Njk6Nzg4OSw3NzE6Nzg5NSw3Nzc6Nzg5M31dLDI0NTpbWzExMSw3NzFdLCx7NzY5Ojc3NTcsNzcyOjU1Nyw3NzY6Nzc1OX1dLDI0NjpbWzExMSw3NzZdLCx7NzcyOjU1NX1dLDI0ODpbLCx7NzY5OjUxMX1dLDI0OTpbWzExNyw3NjhdXSwyNTA6W1sxMTcsNzY5XV0sMjUxOltbMTE3LDc3MF1dLDI1MjpbWzExNyw3NzZdLCx7NzY4OjQ3Niw3Njk6NDcyLDc3Mjo0NzAsNzgwOjQ3NH1dLDI1MzpbWzEyMSw3NjldXSwyNTU6W1sxMjEsNzc2XV19LFxuMjU2OnsyNTY6W1s2NSw3NzJdXSwyNTc6W1s5Nyw3NzJdXSwyNTg6W1s2NSw3NzRdLCx7NzY4Ojc4NTYsNzY5Ojc4NTQsNzcxOjc4NjAsNzc3Ojc4NTh9XSwyNTk6W1s5Nyw3NzRdLCx7NzY4Ojc4NTcsNzY5Ojc4NTUsNzcxOjc4NjEsNzc3Ojc4NTl9XSwyNjA6W1s2NSw4MDhdXSwyNjE6W1s5Nyw4MDhdXSwyNjI6W1s2Nyw3NjldXSwyNjM6W1s5OSw3NjldXSwyNjQ6W1s2Nyw3NzBdXSwyNjU6W1s5OSw3NzBdXSwyNjY6W1s2Nyw3NzVdXSwyNjc6W1s5OSw3NzVdXSwyNjg6W1s2Nyw3ODBdXSwyNjk6W1s5OSw3ODBdXSwyNzA6W1s2OCw3ODBdXSwyNzE6W1sxMDAsNzgwXV0sMjc0OltbNjksNzcyXSwsezc2ODo3NzAwLDc2OTo3NzAyfV0sMjc1OltbMTAxLDc3Ml0sLHs3Njg6NzcwMSw3Njk6NzcwM31dLDI3NjpbWzY5LDc3NF1dLDI3NzpbWzEwMSw3NzRdXSwyNzg6W1s2OSw3NzVdXSwyNzk6W1sxMDEsNzc1XV0sMjgwOltbNjksODA4XV0sMjgxOltbMTAxLDgwOF1dLDI4MjpbWzY5LDc4MF1dLDI4MzpbWzEwMSw3ODBdXSwyODQ6W1s3MSw3NzBdXSwyODU6W1sxMDMsNzcwXV0sMjg2OltbNzEsNzc0XV0sMjg3OltbMTAzLDc3NF1dLDI4ODpbWzcxLDc3NV1dLDI4OTpbWzEwMyw3NzVdXSwyOTA6W1s3MSw4MDddXSwyOTE6W1sxMDMsODA3XV0sMjkyOltbNzIsNzcwXV0sMjkzOltbMTA0LDc3MF1dLDI5NjpbWzczLDc3MV1dLDI5NzpbWzEwNSw3NzFdXSwyOTg6W1s3Myw3NzJdXSwyOTk6W1sxMDUsNzcyXV0sMzAwOltbNzMsNzc0XV0sMzAxOltbMTA1LDc3NF1dLDMwMjpbWzczLDgwOF1dLDMwMzpbWzEwNSw4MDhdXSwzMDQ6W1s3Myw3NzVdXSwzMDY6W1s3Myw3NF0sMjU2XSwzMDc6W1sxMDUsMTA2XSwyNTZdLDMwODpbWzc0LDc3MF1dLDMwOTpbWzEwNiw3NzBdXSwzMTA6W1s3NSw4MDddXSwzMTE6W1sxMDcsODA3XV0sMzEzOltbNzYsNzY5XV0sMzE0OltbMTA4LDc2OV1dLDMxNTpbWzc2LDgwN11dLDMxNjpbWzEwOCw4MDddXSwzMTc6W1s3Niw3ODBdXSwzMTg6W1sxMDgsNzgwXV0sMzE5OltbNzYsMTgzXSwyNTZdLDMyMDpbWzEwOCwxODNdLDI1Nl0sMzIzOltbNzgsNzY5XV0sMzI0OltbMTEwLDc2OV1dLDMyNTpbWzc4LDgwN11dLDMyNjpbWzExMCw4MDddXSwzMjc6W1s3OCw3ODBdXSwzMjg6W1sxMTAsNzgwXV0sMzI5OltbNzAwLDExMF0sMjU2XSwzMzI6W1s3OSw3NzJdLCx7NzY4Ojc3NjAsNzY5Ojc3NjJ9XSwzMzM6W1sxMTEsNzcyXSwsezc2ODo3NzYxLDc2OTo3NzYzfV0sMzM0OltbNzksNzc0XV0sMzM1OltbMTExLDc3NF1dLDMzNjpbWzc5LDc3OV1dLDMzNzpbWzExMSw3NzldXSwzNDA6W1s4Miw3NjldXSwzNDE6W1sxMTQsNzY5XV0sMzQyOltbODIsODA3XV0sMzQzOltbMTE0LDgwN11dLDM0NDpbWzgyLDc4MF1dLDM0NTpbWzExNCw3ODBdXSwzNDY6W1s4Myw3NjldLCx7Nzc1Ojc3ODB9XSwzNDc6W1sxMTUsNzY5XSwsezc3NTo3NzgxfV0sMzQ4OltbODMsNzcwXV0sMzQ5OltbMTE1LDc3MF1dLDM1MDpbWzgzLDgwN11dLDM1MTpbWzExNSw4MDddXSwzNTI6W1s4Myw3ODBdLCx7Nzc1Ojc3ODJ9XSwzNTM6W1sxMTUsNzgwXSwsezc3NTo3NzgzfV0sMzU0OltbODQsODA3XV0sMzU1OltbMTE2LDgwN11dLDM1NjpbWzg0LDc4MF1dLDM1NzpbWzExNiw3ODBdXSwzNjA6W1s4NSw3NzFdLCx7NzY5Ojc4MDB9XSwzNjE6W1sxMTcsNzcxXSwsezc2OTo3ODAxfV0sMzYyOltbODUsNzcyXSwsezc3Njo3ODAyfV0sMzYzOltbMTE3LDc3Ml0sLHs3NzY6NzgwM31dLDM2NDpbWzg1LDc3NF1dLDM2NTpbWzExNyw3NzRdXSwzNjY6W1s4NSw3NzhdXSwzNjc6W1sxMTcsNzc4XV0sMzY4OltbODUsNzc5XV0sMzY5OltbMTE3LDc3OV1dLDM3MDpbWzg1LDgwOF1dLDM3MTpbWzExNyw4MDhdXSwzNzI6W1s4Nyw3NzBdXSwzNzM6W1sxMTksNzcwXV0sMzc0OltbODksNzcwXV0sMzc1OltbMTIxLDc3MF1dLDM3NjpbWzg5LDc3Nl1dLDM3NzpbWzkwLDc2OV1dLDM3ODpbWzEyMiw3NjldXSwzNzk6W1s5MCw3NzVdXSwzODA6W1sxMjIsNzc1XV0sMzgxOltbOTAsNzgwXV0sMzgyOltbMTIyLDc4MF1dLDM4MzpbWzExNV0sMjU2LHs3NzU6NzgzNX1dLDQxNjpbWzc5LDc5NV0sLHs3Njg6NzkwMCw3Njk6Nzg5OCw3NzE6NzkwNCw3Nzc6NzkwMiw4MDM6NzkwNn1dLDQxNzpbWzExMSw3OTVdLCx7NzY4Ojc5MDEsNzY5Ojc4OTksNzcxOjc5MDUsNzc3Ojc5MDMsODAzOjc5MDd9XSw0MzE6W1s4NSw3OTVdLCx7NzY4Ojc5MTQsNzY5Ojc5MTIsNzcxOjc5MTgsNzc3Ojc5MTYsODAzOjc5MjB9XSw0MzI6W1sxMTcsNzk1XSwsezc2ODo3OTE1LDc2OTo3OTEzLDc3MTo3OTE5LDc3Nzo3OTE3LDgwMzo3OTIxfV0sNDM5OlssLHs3ODA6NDk0fV0sNDUyOltbNjgsMzgxXSwyNTZdLDQ1MzpbWzY4LDM4Ml0sMjU2XSw0NTQ6W1sxMDAsMzgyXSwyNTZdLDQ1NTpbWzc2LDc0XSwyNTZdLDQ1NjpbWzc2LDEwNl0sMjU2XSw0NTc6W1sxMDgsMTA2XSwyNTZdLDQ1ODpbWzc4LDc0XSwyNTZdLDQ1OTpbWzc4LDEwNl0sMjU2XSw0NjA6W1sxMTAsMTA2XSwyNTZdLDQ2MTpbWzY1LDc4MF1dLDQ2MjpbWzk3LDc4MF1dLDQ2MzpbWzczLDc4MF1dLDQ2NDpbWzEwNSw3ODBdXSw0NjU6W1s3OSw3ODBdXSw0NjY6W1sxMTEsNzgwXV0sNDY3OltbODUsNzgwXV0sNDY4OltbMTE3LDc4MF1dLDQ2OTpbWzIyMCw3NzJdXSw0NzA6W1syNTIsNzcyXV0sNDcxOltbMjIwLDc2OV1dLDQ3MjpbWzI1Miw3NjldXSw0NzM6W1syMjAsNzgwXV0sNDc0OltbMjUyLDc4MF1dLDQ3NTpbWzIyMCw3NjhdXSw0NzY6W1syNTIsNzY4XV0sNDc4OltbMTk2LDc3Ml1dLDQ3OTpbWzIyOCw3NzJdXSw0ODA6W1s1NTAsNzcyXV0sNDgxOltbNTUxLDc3Ml1dLDQ4MjpbWzE5OCw3NzJdXSw0ODM6W1syMzAsNzcyXV0sNDg2OltbNzEsNzgwXV0sNDg3OltbMTAzLDc4MF1dLDQ4ODpbWzc1LDc4MF1dLDQ4OTpbWzEwNyw3ODBdXSw0OTA6W1s3OSw4MDhdLCx7NzcyOjQ5Mn1dLDQ5MTpbWzExMSw4MDhdLCx7NzcyOjQ5M31dLDQ5MjpbWzQ5MCw3NzJdXSw0OTM6W1s0OTEsNzcyXV0sNDk0OltbNDM5LDc4MF1dLDQ5NTpbWzY1OCw3ODBdXSw0OTY6W1sxMDYsNzgwXV0sNDk3OltbNjgsOTBdLDI1Nl0sNDk4OltbNjgsMTIyXSwyNTZdLDQ5OTpbWzEwMCwxMjJdLDI1Nl0sNTAwOltbNzEsNzY5XV0sNTAxOltbMTAzLDc2OV1dLDUwNDpbWzc4LDc2OF1dLDUwNTpbWzExMCw3NjhdXSw1MDY6W1sxOTcsNzY5XV0sNTA3OltbMjI5LDc2OV1dLDUwODpbWzE5OCw3NjldXSw1MDk6W1syMzAsNzY5XV0sNTEwOltbMjE2LDc2OV1dLDUxMTpbWzI0OCw3NjldXSw2NjA0NTpbLDIyMF19LFxuNTEyOns1MTI6W1s2NSw3ODNdXSw1MTM6W1s5Nyw3ODNdXSw1MTQ6W1s2NSw3ODVdXSw1MTU6W1s5Nyw3ODVdXSw1MTY6W1s2OSw3ODNdXSw1MTc6W1sxMDEsNzgzXV0sNTE4OltbNjksNzg1XV0sNTE5OltbMTAxLDc4NV1dLDUyMDpbWzczLDc4M11dLDUyMTpbWzEwNSw3ODNdXSw1MjI6W1s3Myw3ODVdXSw1MjM6W1sxMDUsNzg1XV0sNTI0OltbNzksNzgzXV0sNTI1OltbMTExLDc4M11dLDUyNjpbWzc5LDc4NV1dLDUyNzpbWzExMSw3ODVdXSw1Mjg6W1s4Miw3ODNdXSw1Mjk6W1sxMTQsNzgzXV0sNTMwOltbODIsNzg1XV0sNTMxOltbMTE0LDc4NV1dLDUzMjpbWzg1LDc4M11dLDUzMzpbWzExNyw3ODNdXSw1MzQ6W1s4NSw3ODVdXSw1MzU6W1sxMTcsNzg1XV0sNTM2OltbODMsODA2XV0sNTM3OltbMTE1LDgwNl1dLDUzODpbWzg0LDgwNl1dLDUzOTpbWzExNiw4MDZdXSw1NDI6W1s3Miw3ODBdXSw1NDM6W1sxMDQsNzgwXV0sNTUwOltbNjUsNzc1XSwsezc3Mjo0ODB9XSw1NTE6W1s5Nyw3NzVdLCx7NzcyOjQ4MX1dLDU1MjpbWzY5LDgwN10sLHs3NzQ6NzcwOH1dLDU1MzpbWzEwMSw4MDddLCx7Nzc0Ojc3MDl9XSw1NTQ6W1syMTQsNzcyXV0sNTU1OltbMjQ2LDc3Ml1dLDU1NjpbWzIxMyw3NzJdXSw1NTc6W1syNDUsNzcyXV0sNTU4OltbNzksNzc1XSwsezc3Mjo1NjB9XSw1NTk6W1sxMTEsNzc1XSwsezc3Mjo1NjF9XSw1NjA6W1s1NTgsNzcyXV0sNTYxOltbNTU5LDc3Ml1dLDU2MjpbWzg5LDc3Ml1dLDU2MzpbWzEyMSw3NzJdXSw2NTg6Wywsezc4MDo0OTV9XSw2ODg6W1sxMDRdLDI1Nl0sNjg5OltbNjE0XSwyNTZdLDY5MDpbWzEwNl0sMjU2XSw2OTE6W1sxMTRdLDI1Nl0sNjkyOltbNjMzXSwyNTZdLDY5MzpbWzYzNV0sMjU2XSw2OTQ6W1s2NDFdLDI1Nl0sNjk1OltbMTE5XSwyNTZdLDY5NjpbWzEyMV0sMjU2XSw3Mjg6W1szMiw3NzRdLDI1Nl0sNzI5OltbMzIsNzc1XSwyNTZdLDczMDpbWzMyLDc3OF0sMjU2XSw3MzE6W1szMiw4MDhdLDI1Nl0sNzMyOltbMzIsNzcxXSwyNTZdLDczMzpbWzMyLDc3OV0sMjU2XSw3MzY6W1s2MTFdLDI1Nl0sNzM3OltbMTA4XSwyNTZdLDczODpbWzExNV0sMjU2XSw3Mzk6W1sxMjBdLDI1Nl0sNzQwOltbNjYxXSwyNTZdfSxcbjc2ODp7NzY4OlssMjMwXSw3Njk6WywyMzBdLDc3MDpbLDIzMF0sNzcxOlssMjMwXSw3NzI6WywyMzBdLDc3MzpbLDIzMF0sNzc0OlssMjMwXSw3NzU6WywyMzBdLDc3NjpbLDIzMCx7NzY5OjgzNn1dLDc3NzpbLDIzMF0sNzc4OlssMjMwXSw3Nzk6WywyMzBdLDc4MDpbLDIzMF0sNzgxOlssMjMwXSw3ODI6WywyMzBdLDc4MzpbLDIzMF0sNzg0OlssMjMwXSw3ODU6WywyMzBdLDc4NjpbLDIzMF0sNzg3OlssMjMwXSw3ODg6WywyMzBdLDc4OTpbLDIzMl0sNzkwOlssMjIwXSw3OTE6WywyMjBdLDc5MjpbLDIyMF0sNzkzOlssMjIwXSw3OTQ6WywyMzJdLDc5NTpbLDIxNl0sNzk2OlssMjIwXSw3OTc6WywyMjBdLDc5ODpbLDIyMF0sNzk5OlssMjIwXSw4MDA6WywyMjBdLDgwMTpbLDIwMl0sODAyOlssMjAyXSw4MDM6WywyMjBdLDgwNDpbLDIyMF0sODA1OlssMjIwXSw4MDY6WywyMjBdLDgwNzpbLDIwMl0sODA4OlssMjAyXSw4MDk6WywyMjBdLDgxMDpbLDIyMF0sODExOlssMjIwXSw4MTI6WywyMjBdLDgxMzpbLDIyMF0sODE0OlssMjIwXSw4MTU6WywyMjBdLDgxNjpbLDIyMF0sODE3OlssMjIwXSw4MTg6WywyMjBdLDgxOTpbLDIyMF0sODIwOlssMV0sODIxOlssMV0sODIyOlssMV0sODIzOlssMV0sODI0OlssMV0sODI1OlssMjIwXSw4MjY6WywyMjBdLDgyNzpbLDIyMF0sODI4OlssMjIwXSw4Mjk6WywyMzBdLDgzMDpbLDIzMF0sODMxOlssMjMwXSw4MzI6W1s3NjhdLDIzMF0sODMzOltbNzY5XSwyMzBdLDgzNDpbLDIzMF0sODM1OltbNzg3XSwyMzBdLDgzNjpbWzc3Niw3NjldLDIzMF0sODM3OlssMjQwXSw4Mzg6WywyMzBdLDgzOTpbLDIyMF0sODQwOlssMjIwXSw4NDE6WywyMjBdLDg0MjpbLDIzMF0sODQzOlssMjMwXSw4NDQ6WywyMzBdLDg0NTpbLDIyMF0sODQ2OlssMjIwXSw4NDg6WywyMzBdLDg0OTpbLDIzMF0sODUwOlssMjMwXSw4NTE6WywyMjBdLDg1MjpbLDIyMF0sODUzOlssMjIwXSw4NTQ6WywyMjBdLDg1NTpbLDIzMF0sODU2OlssMjMyXSw4NTc6WywyMjBdLDg1ODpbLDIyMF0sODU5OlssMjMwXSw4NjA6WywyMzNdLDg2MTpbLDIzNF0sODYyOlssMjM0XSw4NjM6WywyMzNdLDg2NDpbLDIzNF0sODY1OlssMjM0XSw4NjY6WywyMzNdLDg2NzpbLDIzMF0sODY4OlssMjMwXSw4Njk6WywyMzBdLDg3MDpbLDIzMF0sODcxOlssMjMwXSw4NzI6WywyMzBdLDg3MzpbLDIzMF0sODc0OlssMjMwXSw4NzU6WywyMzBdLDg3NjpbLDIzMF0sODc3OlssMjMwXSw4Nzg6WywyMzBdLDg3OTpbLDIzMF0sODg0OltbNjk3XV0sODkwOltbMzIsODM3XSwyNTZdLDg5NDpbWzU5XV0sOTAwOltbMzIsNzY5XSwyNTZdLDkwMTpbWzE2OCw3NjldXSw5MDI6W1s5MTMsNzY5XV0sOTAzOltbMTgzXV0sOTA0OltbOTE3LDc2OV1dLDkwNTpbWzkxOSw3NjldXSw5MDY6W1s5MjEsNzY5XV0sOTA4OltbOTI3LDc2OV1dLDkxMDpbWzkzMyw3NjldXSw5MTE6W1s5MzcsNzY5XV0sOTEyOltbOTcwLDc2OV1dLDkxMzpbLCx7NzY4OjgxMjIsNzY5OjkwMiw3NzI6ODEyMSw3NzQ6ODEyMCw3ODc6Nzk0NCw3ODg6Nzk0NSw4Mzc6ODEyNH1dLDkxNzpbLCx7NzY4OjgxMzYsNzY5OjkwNCw3ODc6Nzk2MCw3ODg6Nzk2MX1dLDkxOTpbLCx7NzY4OjgxMzgsNzY5OjkwNSw3ODc6Nzk3Niw3ODg6Nzk3Nyw4Mzc6ODE0MH1dLDkyMTpbLCx7NzY4OjgxNTQsNzY5OjkwNiw3NzI6ODE1Myw3NzQ6ODE1Miw3NzY6OTM4LDc4Nzo3OTkyLDc4ODo3OTkzfV0sOTI3OlssLHs3Njg6ODE4NCw3Njk6OTA4LDc4Nzo4MDA4LDc4ODo4MDA5fV0sOTI5OlssLHs3ODg6ODE3Mn1dLDkzMzpbLCx7NzY4OjgxNzAsNzY5OjkxMCw3NzI6ODE2OSw3NzQ6ODE2OCw3NzY6OTM5LDc4ODo4MDI1fV0sOTM3OlssLHs3Njg6ODE4Niw3Njk6OTExLDc4Nzo4MDQwLDc4ODo4MDQxLDgzNzo4MTg4fV0sOTM4OltbOTIxLDc3Nl1dLDkzOTpbWzkzMyw3NzZdXSw5NDA6W1s5NDUsNzY5XSwsezgzNzo4MTE2fV0sOTQxOltbOTQ5LDc2OV1dLDk0MjpbWzk1MSw3NjldLCx7ODM3OjgxMzJ9XSw5NDM6W1s5NTMsNzY5XV0sOTQ0OltbOTcxLDc2OV1dLDk0NTpbLCx7NzY4OjgwNDgsNzY5Ojk0MCw3NzI6ODExMyw3NzQ6ODExMiw3ODc6NzkzNiw3ODg6NzkzNyw4MzQ6ODExOCw4Mzc6ODExNX1dLDk0OTpbLCx7NzY4OjgwNTAsNzY5Ojk0MSw3ODc6Nzk1Miw3ODg6Nzk1M31dLDk1MTpbLCx7NzY4OjgwNTIsNzY5Ojk0Miw3ODc6Nzk2OCw3ODg6Nzk2OSw4MzQ6ODEzNCw4Mzc6ODEzMX1dLDk1MzpbLCx7NzY4OjgwNTQsNzY5Ojk0Myw3NzI6ODE0NSw3NzQ6ODE0NCw3NzY6OTcwLDc4Nzo3OTg0LDc4ODo3OTg1LDgzNDo4MTUwfV0sOTU5OlssLHs3Njg6ODA1Niw3Njk6OTcyLDc4Nzo4MDAwLDc4ODo4MDAxfV0sOTYxOlssLHs3ODc6ODE2NCw3ODg6ODE2NX1dLDk2NTpbLCx7NzY4OjgwNTgsNzY5Ojk3Myw3NzI6ODE2MSw3NzQ6ODE2MCw3NzY6OTcxLDc4Nzo4MDE2LDc4ODo4MDE3LDgzNDo4MTY2fV0sOTY5OlssLHs3Njg6ODA2MCw3Njk6OTc0LDc4Nzo4MDMyLDc4ODo4MDMzLDgzNDo4MTgyLDgzNzo4MTc5fV0sOTcwOltbOTUzLDc3Nl0sLHs3Njg6ODE0Niw3Njk6OTEyLDgzNDo4MTUxfV0sOTcxOltbOTY1LDc3Nl0sLHs3Njg6ODE2Miw3Njk6OTQ0LDgzNDo4MTY3fV0sOTcyOltbOTU5LDc2OV1dLDk3MzpbWzk2NSw3NjldXSw5NzQ6W1s5NjksNzY5XSwsezgzNzo4MTgwfV0sOTc2OltbOTQ2XSwyNTZdLDk3NzpbWzk1Ml0sMjU2XSw5Nzg6W1s5MzNdLDI1Nix7NzY5Ojk3OSw3NzY6OTgwfV0sOTc5OltbOTc4LDc2OV1dLDk4MDpbWzk3OCw3NzZdXSw5ODE6W1s5NjZdLDI1Nl0sOTgyOltbOTYwXSwyNTZdLDEwMDg6W1s5NTRdLDI1Nl0sMTAwOTpbWzk2MV0sMjU2XSwxMDEwOltbOTYyXSwyNTZdLDEwMTI6W1s5MjBdLDI1Nl0sMTAxMzpbWzk0OV0sMjU2XSwxMDE3OltbOTMxXSwyNTZdfSxcbjEwMjQ6ezEwMjQ6W1sxMDQ1LDc2OF1dLDEwMjU6W1sxMDQ1LDc3Nl1dLDEwMjc6W1sxMDQzLDc2OV1dLDEwMzA6Wywsezc3NjoxMDMxfV0sMTAzMTpbWzEwMzAsNzc2XV0sMTAzNjpbWzEwNTAsNzY5XV0sMTAzNzpbWzEwNDgsNzY4XV0sMTAzODpbWzEwNTksNzc0XV0sMTA0MDpbLCx7Nzc0OjEyMzIsNzc2OjEyMzR9XSwxMDQzOlssLHs3Njk6MTAyN31dLDEwNDU6Wywsezc2ODoxMDI0LDc3NDoxMjM4LDc3NjoxMDI1fV0sMTA0NjpbLCx7Nzc0OjEyMTcsNzc2OjEyNDR9XSwxMDQ3OlssLHs3NzY6MTI0Nn1dLDEwNDg6Wywsezc2ODoxMDM3LDc3MjoxMjUwLDc3NDoxMDQ5LDc3NjoxMjUyfV0sMTA0OTpbWzEwNDgsNzc0XV0sMTA1MDpbLCx7NzY5OjEwMzZ9XSwxMDU0OlssLHs3NzY6MTI1NH1dLDEwNTk6Wywsezc3MjoxMjYyLDc3NDoxMDM4LDc3NjoxMjY0LDc3OToxMjY2fV0sMTA2MzpbLCx7Nzc2OjEyNjh9XSwxMDY3OlssLHs3NzY6MTI3Mn1dLDEwNjk6Wywsezc3NjoxMjYwfV0sMTA3MjpbLCx7Nzc0OjEyMzMsNzc2OjEyMzV9XSwxMDc1OlssLHs3Njk6MTEwN31dLDEwNzc6Wywsezc2ODoxMTA0LDc3NDoxMjM5LDc3NjoxMTA1fV0sMTA3ODpbLCx7Nzc0OjEyMTgsNzc2OjEyNDV9XSwxMDc5OlssLHs3NzY6MTI0N31dLDEwODA6Wywsezc2ODoxMTE3LDc3MjoxMjUxLDc3NDoxMDgxLDc3NjoxMjUzfV0sMTA4MTpbWzEwODAsNzc0XV0sMTA4MjpbLCx7NzY5OjExMTZ9XSwxMDg2OlssLHs3NzY6MTI1NX1dLDEwOTE6Wywsezc3MjoxMjYzLDc3NDoxMTE4LDc3NjoxMjY1LDc3OToxMjY3fV0sMTA5NTpbLCx7Nzc2OjEyNjl9XSwxMDk5OlssLHs3NzY6MTI3M31dLDExMDE6Wywsezc3NjoxMjYxfV0sMTEwNDpbWzEwNzcsNzY4XV0sMTEwNTpbWzEwNzcsNzc2XV0sMTEwNzpbWzEwNzUsNzY5XV0sMTExMDpbLCx7Nzc2OjExMTF9XSwxMTExOltbMTExMCw3NzZdXSwxMTE2OltbMTA4Miw3NjldXSwxMTE3OltbMTA4MCw3NjhdXSwxMTE4OltbMTA5MSw3NzRdXSwxMTQwOlssLHs3ODM6MTE0Mn1dLDExNDE6Wywsezc4MzoxMTQzfV0sMTE0MjpbWzExNDAsNzgzXV0sMTE0MzpbWzExNDEsNzgzXV0sMTE1NTpbLDIzMF0sMTE1NjpbLDIzMF0sMTE1NzpbLDIzMF0sMTE1ODpbLDIzMF0sMTE1OTpbLDIzMF0sMTIxNzpbWzEwNDYsNzc0XV0sMTIxODpbWzEwNzgsNzc0XV0sMTIzMjpbWzEwNDAsNzc0XV0sMTIzMzpbWzEwNzIsNzc0XV0sMTIzNDpbWzEwNDAsNzc2XV0sMTIzNTpbWzEwNzIsNzc2XV0sMTIzODpbWzEwNDUsNzc0XV0sMTIzOTpbWzEwNzcsNzc0XV0sMTI0MDpbLCx7Nzc2OjEyNDJ9XSwxMjQxOlssLHs3NzY6MTI0M31dLDEyNDI6W1sxMjQwLDc3Nl1dLDEyNDM6W1sxMjQxLDc3Nl1dLDEyNDQ6W1sxMDQ2LDc3Nl1dLDEyNDU6W1sxMDc4LDc3Nl1dLDEyNDY6W1sxMDQ3LDc3Nl1dLDEyNDc6W1sxMDc5LDc3Nl1dLDEyNTA6W1sxMDQ4LDc3Ml1dLDEyNTE6W1sxMDgwLDc3Ml1dLDEyNTI6W1sxMDQ4LDc3Nl1dLDEyNTM6W1sxMDgwLDc3Nl1dLDEyNTQ6W1sxMDU0LDc3Nl1dLDEyNTU6W1sxMDg2LDc3Nl1dLDEyNTY6Wywsezc3NjoxMjU4fV0sMTI1NzpbLCx7Nzc2OjEyNTl9XSwxMjU4OltbMTI1Niw3NzZdXSwxMjU5OltbMTI1Nyw3NzZdXSwxMjYwOltbMTA2OSw3NzZdXSwxMjYxOltbMTEwMSw3NzZdXSwxMjYyOltbMTA1OSw3NzJdXSwxMjYzOltbMTA5MSw3NzJdXSwxMjY0OltbMTA1OSw3NzZdXSwxMjY1OltbMTA5MSw3NzZdXSwxMjY2OltbMTA1OSw3NzldXSwxMjY3OltbMTA5MSw3NzldXSwxMjY4OltbMTA2Myw3NzZdXSwxMjY5OltbMTA5NSw3NzZdXSwxMjcyOltbMTA2Nyw3NzZdXSwxMjczOltbMTA5OSw3NzZdXX0sXG4xMjgwOnsxNDE1OltbMTM4MSwxNDEwXSwyNTZdLDE0MjU6WywyMjBdLDE0MjY6WywyMzBdLDE0Mjc6WywyMzBdLDE0Mjg6WywyMzBdLDE0Mjk6WywyMzBdLDE0MzA6WywyMjBdLDE0MzE6WywyMzBdLDE0MzI6WywyMzBdLDE0MzM6WywyMzBdLDE0MzQ6WywyMjJdLDE0MzU6WywyMjBdLDE0MzY6WywyMzBdLDE0Mzc6WywyMzBdLDE0Mzg6WywyMzBdLDE0Mzk6WywyMzBdLDE0NDA6WywyMzBdLDE0NDE6WywyMzBdLDE0NDI6WywyMjBdLDE0NDM6WywyMjBdLDE0NDQ6WywyMjBdLDE0NDU6WywyMjBdLDE0NDY6WywyMjBdLDE0NDc6WywyMjBdLDE0NDg6WywyMzBdLDE0NDk6WywyMzBdLDE0NTA6WywyMjBdLDE0NTE6WywyMzBdLDE0NTI6WywyMzBdLDE0NTM6WywyMjJdLDE0NTQ6WywyMjhdLDE0NTU6WywyMzBdLDE0NTY6WywxMF0sMTQ1NzpbLDExXSwxNDU4OlssMTJdLDE0NTk6WywxM10sMTQ2MDpbLDE0XSwxNDYxOlssMTVdLDE0NjI6WywxNl0sMTQ2MzpbLDE3XSwxNDY0OlssMThdLDE0NjU6WywxOV0sMTQ2NjpbLDE5XSwxNDY3OlssMjBdLDE0Njg6WywyMV0sMTQ2OTpbLDIyXSwxNDcxOlssMjNdLDE0NzM6WywyNF0sMTQ3NDpbLDI1XSwxNDc2OlssMjMwXSwxNDc3OlssMjIwXSwxNDc5OlssMThdfSxcbjE1MzY6ezE1NTI6WywyMzBdLDE1NTM6WywyMzBdLDE1NTQ6WywyMzBdLDE1NTU6WywyMzBdLDE1NTY6WywyMzBdLDE1NTc6WywyMzBdLDE1NTg6WywyMzBdLDE1NTk6WywyMzBdLDE1NjA6WywzMF0sMTU2MTpbLDMxXSwxNTYyOlssMzJdLDE1NzA6W1sxNTc1LDE2MTldXSwxNTcxOltbMTU3NSwxNjIwXV0sMTU3MjpbWzE2MDgsMTYyMF1dLDE1NzM6W1sxNTc1LDE2MjFdXSwxNTc0OltbMTYxMCwxNjIwXV0sMTU3NTpbLCx7MTYxOToxNTcwLDE2MjA6MTU3MSwxNjIxOjE1NzN9XSwxNjA4OlssLHsxNjIwOjE1NzJ9XSwxNjEwOlssLHsxNjIwOjE1NzR9XSwxNjExOlssMjddLDE2MTI6WywyOF0sMTYxMzpbLDI5XSwxNjE0OlssMzBdLDE2MTU6WywzMV0sMTYxNjpbLDMyXSwxNjE3OlssMzNdLDE2MTg6WywzNF0sMTYxOTpbLDIzMF0sMTYyMDpbLDIzMF0sMTYyMTpbLDIyMF0sMTYyMjpbLDIyMF0sMTYyMzpbLDIzMF0sMTYyNDpbLDIzMF0sMTYyNTpbLDIzMF0sMTYyNjpbLDIzMF0sMTYyNzpbLDIzMF0sMTYyODpbLDIyMF0sMTYyOTpbLDIzMF0sMTYzMDpbLDIzMF0sMTYzMTpbLDIyMF0sMTY0ODpbLDM1XSwxNjUzOltbMTU3NSwxNjUyXSwyNTZdLDE2NTQ6W1sxNjA4LDE2NTJdLDI1Nl0sMTY1NTpbWzE3MzUsMTY1Ml0sMjU2XSwxNjU2OltbMTYxMCwxNjUyXSwyNTZdLDE3Mjg6W1sxNzQ5LDE2MjBdXSwxNzI5OlssLHsxNjIwOjE3MzB9XSwxNzMwOltbMTcyOSwxNjIwXV0sMTc0NjpbLCx7MTYyMDoxNzQ3fV0sMTc0NzpbWzE3NDYsMTYyMF1dLDE3NDk6WywsezE2MjA6MTcyOH1dLDE3NTA6WywyMzBdLDE3NTE6WywyMzBdLDE3NTI6WywyMzBdLDE3NTM6WywyMzBdLDE3NTQ6WywyMzBdLDE3NTU6WywyMzBdLDE3NTY6WywyMzBdLDE3NTk6WywyMzBdLDE3NjA6WywyMzBdLDE3NjE6WywyMzBdLDE3NjI6WywyMzBdLDE3NjM6WywyMjBdLDE3NjQ6WywyMzBdLDE3Njc6WywyMzBdLDE3Njg6WywyMzBdLDE3NzA6WywyMjBdLDE3NzE6WywyMzBdLDE3NzI6WywyMzBdLDE3NzM6WywyMjBdfSxcbjE3OTI6ezE4MDk6WywzNl0sMTg0MDpbLDIzMF0sMTg0MTpbLDIyMF0sMTg0MjpbLDIzMF0sMTg0MzpbLDIzMF0sMTg0NDpbLDIyMF0sMTg0NTpbLDIzMF0sMTg0NjpbLDIzMF0sMTg0NzpbLDIyMF0sMTg0ODpbLDIyMF0sMTg0OTpbLDIyMF0sMTg1MDpbLDIzMF0sMTg1MTpbLDIyMF0sMTg1MjpbLDIyMF0sMTg1MzpbLDIzMF0sMTg1NDpbLDIyMF0sMTg1NTpbLDIzMF0sMTg1NjpbLDIzMF0sMTg1NzpbLDIzMF0sMTg1ODpbLDIyMF0sMTg1OTpbLDIzMF0sMTg2MDpbLDIyMF0sMTg2MTpbLDIzMF0sMTg2MjpbLDIyMF0sMTg2MzpbLDIzMF0sMTg2NDpbLDIyMF0sMTg2NTpbLDIzMF0sMTg2NjpbLDIzMF0sMjAyNzpbLDIzMF0sMjAyODpbLDIzMF0sMjAyOTpbLDIzMF0sMjAzMDpbLDIzMF0sMjAzMTpbLDIzMF0sMjAzMjpbLDIzMF0sMjAzMzpbLDIzMF0sMjAzNDpbLDIyMF0sMjAzNTpbLDIzMF19LFxuMjA0ODp7MjA3MDpbLDIzMF0sMjA3MTpbLDIzMF0sMjA3MjpbLDIzMF0sMjA3MzpbLDIzMF0sMjA3NTpbLDIzMF0sMjA3NjpbLDIzMF0sMjA3NzpbLDIzMF0sMjA3ODpbLDIzMF0sMjA3OTpbLDIzMF0sMjA4MDpbLDIzMF0sMjA4MTpbLDIzMF0sMjA4MjpbLDIzMF0sMjA4MzpbLDIzMF0sMjA4NTpbLDIzMF0sMjA4NjpbLDIzMF0sMjA4NzpbLDIzMF0sMjA4OTpbLDIzMF0sMjA5MDpbLDIzMF0sMjA5MTpbLDIzMF0sMjA5MjpbLDIzMF0sMjA5MzpbLDIzMF0sMjEzNzpbLDIyMF0sMjEzODpbLDIyMF0sMjEzOTpbLDIyMF0sMjI3NjpbLDIzMF0sMjI3NzpbLDIzMF0sMjI3ODpbLDIyMF0sMjI3OTpbLDIzMF0sMjI4MDpbLDIzMF0sMjI4MTpbLDIyMF0sMjI4MjpbLDIzMF0sMjI4MzpbLDIzMF0sMjI4NDpbLDIzMF0sMjI4NTpbLDIyMF0sMjI4NjpbLDIyMF0sMjI4NzpbLDIyMF0sMjI4ODpbLDI3XSwyMjg5OlssMjhdLDIyOTA6WywyOV0sMjI5MTpbLDIzMF0sMjI5MjpbLDIzMF0sMjI5MzpbLDIzMF0sMjI5NDpbLDIyMF0sMjI5NTpbLDIzMF0sMjI5NjpbLDIzMF0sMjI5NzpbLDIyMF0sMjI5ODpbLDIyMF0sMjI5OTpbLDIzMF0sMjMwMDpbLDIzMF0sMjMwMTpbLDIzMF0sMjMwMjpbLDIzMF19LFxuMjMwNDp7MjM0NDpbLCx7MjM2NDoyMzQ1fV0sMjM0NTpbWzIzNDQsMjM2NF1dLDIzNTI6WywsezIzNjQ6MjM1M31dLDIzNTM6W1syMzUyLDIzNjRdXSwyMzU1OlssLHsyMzY0OjIzNTZ9XSwyMzU2OltbMjM1NSwyMzY0XV0sMjM2NDpbLDddLDIzODE6Wyw5XSwyMzg1OlssMjMwXSwyMzg2OlssMjIwXSwyMzg3OlssMjMwXSwyMzg4OlssMjMwXSwyMzkyOltbMjMyNSwyMzY0XSw1MTJdLDIzOTM6W1syMzI2LDIzNjRdLDUxMl0sMjM5NDpbWzIzMjcsMjM2NF0sNTEyXSwyMzk1OltbMjMzMiwyMzY0XSw1MTJdLDIzOTY6W1syMzM3LDIzNjRdLDUxMl0sMjM5NzpbWzIzMzgsMjM2NF0sNTEyXSwyMzk4OltbMjM0NywyMzY0XSw1MTJdLDIzOTk6W1syMzUxLDIzNjRdLDUxMl0sMjQ5MjpbLDddLDI1MDM6WywsezI0OTQ6MjUwNywyNTE5OjI1MDh9XSwyNTA3OltbMjUwMywyNDk0XV0sMjUwODpbWzI1MDMsMjUxOV1dLDI1MDk6Wyw5XSwyNTI0OltbMjQ2NSwyNDkyXSw1MTJdLDI1MjU6W1syNDY2LDI0OTJdLDUxMl0sMjUyNzpbWzI0NzksMjQ5Ml0sNTEyXX0sXG4yNTYwOnsyNjExOltbMjYxMCwyNjIwXSw1MTJdLDI2MTQ6W1syNjE2LDI2MjBdLDUxMl0sMjYyMDpbLDddLDI2Mzc6Wyw5XSwyNjQ5OltbMjU4MiwyNjIwXSw1MTJdLDI2NTA6W1syNTgzLDI2MjBdLDUxMl0sMjY1MTpbWzI1ODgsMjYyMF0sNTEyXSwyNjU0OltbMjYwMywyNjIwXSw1MTJdLDI3NDg6Wyw3XSwyNzY1OlssOV0sNjgxMDk6WywyMjBdLDY4MTExOlssMjMwXSw2ODE1MjpbLDIzMF0sNjgxNTM6WywxXSw2ODE1NDpbLDIyMF0sNjgxNTk6Wyw5XX0sXG4yODE2OnsyODc2OlssN10sMjg4NzpbLCx7Mjg3ODoyODkxLDI5MDI6Mjg4OCwyOTAzOjI4OTJ9XSwyODg4OltbMjg4NywyOTAyXV0sMjg5MTpbWzI4ODcsMjg3OF1dLDI4OTI6W1syODg3LDI5MDNdXSwyODkzOlssOV0sMjkwODpbWzI4NDksMjg3Nl0sNTEyXSwyOTA5OltbMjg1MCwyODc2XSw1MTJdLDI5NjI6WywsezMwMzE6Mjk2NH1dLDI5NjQ6W1syOTYyLDMwMzFdXSwzMDE0OlssLHszMDA2OjMwMTgsMzAzMTozMDIwfV0sMzAxNTpbLCx7MzAwNjozMDE5fV0sMzAxODpbWzMwMTQsMzAwNl1dLDMwMTk6W1szMDE1LDMwMDZdXSwzMDIwOltbMzAxNCwzMDMxXV0sMzAyMTpbLDldfSxcbjMwNzI6ezMxNDI6WywsezMxNTg6MzE0NH1dLDMxNDQ6W1szMTQyLDMxNThdXSwzMTQ5OlssOV0sMzE1NzpbLDg0XSwzMTU4OlssOTFdLDMyNjA6Wyw3XSwzMjYzOlssLHszMjg1OjMyNjR9XSwzMjY0OltbMzI2MywzMjg1XV0sMzI3MDpbLCx7MzI2NjozMjc0LDMyODU6MzI3MSwzMjg2OjMyNzJ9XSwzMjcxOltbMzI3MCwzMjg1XV0sMzI3MjpbWzMyNzAsMzI4Nl1dLDMyNzQ6W1szMjcwLDMyNjZdLCx7MzI4NTozMjc1fV0sMzI3NTpbWzMyNzQsMzI4NV1dLDMyNzc6Wyw5XX0sXG4zMzI4OnszMzk4OlssLHszMzkwOjM0MDIsMzQxNTozNDA0fV0sMzM5OTpbLCx7MzM5MDozNDAzfV0sMzQwMjpbWzMzOTgsMzM5MF1dLDM0MDM6W1szMzk5LDMzOTBdXSwzNDA0OltbMzM5OCwzNDE1XV0sMzQwNTpbLDldLDM1MzA6Wyw5XSwzNTQ1OlssLHszNTMwOjM1NDYsMzUzNTozNTQ4LDM1NTE6MzU1MH1dLDM1NDY6W1szNTQ1LDM1MzBdXSwzNTQ4OltbMzU0NSwzNTM1XSwsezM1MzA6MzU0OX1dLDM1NDk6W1szNTQ4LDM1MzBdXSwzNTUwOltbMzU0NSwzNTUxXV19LFxuMzU4NDp7MzYzNTpbWzM2NjEsMzYzNF0sMjU2XSwzNjQwOlssMTAzXSwzNjQxOlssMTAzXSwzNjQyOlssOV0sMzY1NjpbLDEwN10sMzY1NzpbLDEwN10sMzY1ODpbLDEwN10sMzY1OTpbLDEwN10sMzc2MzpbWzM3ODksMzc2Ml0sMjU2XSwzNzY4OlssMTE4XSwzNzY5OlssMTE4XSwzNzg0OlssMTIyXSwzNzg1OlssMTIyXSwzNzg2OlssMTIyXSwzNzg3OlssMTIyXSwzODA0OltbMzc1NSwzNzM3XSwyNTZdLDM4MDU6W1szNzU1LDM3NDVdLDI1Nl19LFxuMzg0MDp7Mzg1MjpbWzM4NTFdLDI1Nl0sMzg2NDpbLDIyMF0sMzg2NTpbLDIyMF0sMzg5MzpbLDIyMF0sMzg5NTpbLDIyMF0sMzg5NzpbLDIxNl0sMzkwNzpbWzM5MDYsNDAyM10sNTEyXSwzOTE3OltbMzkxNiw0MDIzXSw1MTJdLDM5MjI6W1szOTIxLDQwMjNdLDUxMl0sMzkyNzpbWzM5MjYsNDAyM10sNTEyXSwzOTMyOltbMzkzMSw0MDIzXSw1MTJdLDM5NDU6W1szOTA0LDQwMjFdLDUxMl0sMzk1MzpbLDEyOV0sMzk1NDpbLDEzMF0sMzk1NTpbWzM5NTMsMzk1NF0sNTEyXSwzOTU2OlssMTMyXSwzOTU3OltbMzk1MywzOTU2XSw1MTJdLDM5NTg6W1s0MDE4LDM5NjhdLDUxMl0sMzk1OTpbWzQwMTgsMzk2OV0sMjU2XSwzOTYwOltbNDAxOSwzOTY4XSw1MTJdLDM5NjE6W1s0MDE5LDM5NjldLDI1Nl0sMzk2MjpbLDEzMF0sMzk2MzpbLDEzMF0sMzk2NDpbLDEzMF0sMzk2NTpbLDEzMF0sMzk2ODpbLDEzMF0sMzk2OTpbWzM5NTMsMzk2OF0sNTEyXSwzOTcwOlssMjMwXSwzOTcxOlssMjMwXSwzOTcyOlssOV0sMzk3NDpbLDIzMF0sMzk3NTpbLDIzMF0sMzk4NzpbWzM5ODYsNDAyM10sNTEyXSwzOTk3OltbMzk5Niw0MDIzXSw1MTJdLDQwMDI6W1s0MDAxLDQwMjNdLDUxMl0sNDAwNzpbWzQwMDYsNDAyM10sNTEyXSw0MDEyOltbNDAxMSw0MDIzXSw1MTJdLDQwMjU6W1szOTg0LDQwMjFdLDUxMl0sNDAzODpbLDIyMF19LFxuNDA5Njp7NDEzMzpbLCx7NDE0Mjo0MTM0fV0sNDEzNDpbWzQxMzMsNDE0Ml1dLDQxNTE6Wyw3XSw0MTUzOlssOV0sNDE1NDpbLDldLDQyMzc6WywyMjBdLDQzNDg6W1s0MzE2XSwyNTZdLDY5NzAyOlssOV0sNjk3ODU6WywsezY5ODE4OjY5Nzg2fV0sNjk3ODY6W1s2OTc4NSw2OTgxOF1dLDY5Nzg3OlssLHs2OTgxODo2OTc4OH1dLDY5Nzg4OltbNjk3ODcsNjk4MThdXSw2OTc5NzpbLCx7Njk4MTg6Njk4MDN9XSw2OTgwMzpbWzY5Nzk3LDY5ODE4XV0sNjk4MTc6Wyw5XSw2OTgxODpbLDddfSxcbjQzNTI6ezY5ODg4OlssMjMwXSw2OTg4OTpbLDIzMF0sNjk4OTA6WywyMzBdLDY5OTM0OltbNjk5MzcsNjk5MjddXSw2OTkzNTpbWzY5OTM4LDY5OTI3XV0sNjk5Mzc6WywsezY5OTI3OjY5OTM0fV0sNjk5Mzg6WywsezY5OTI3OjY5OTM1fV0sNjk5Mzk6Wyw5XSw2OTk0MDpbLDldLDcwMDgwOlssOV19LFxuNDg2NDp7NDk1NzpbLDIzMF0sNDk1ODpbLDIzMF0sNDk1OTpbLDIzMF19LFxuNTYzMjp7NzEzNTA6Wyw5XSw3MTM1MTpbLDddfSxcbjU4ODg6ezU5MDg6Wyw5XSw1OTQwOlssOV0sNjA5ODpbLDldLDYxMDk6WywyMzBdfSxcbjYxNDQ6ezYzMTM6WywyMjhdfSxcbjY0MDA6ezY0NTc6WywyMjJdLDY0NTg6WywyMzBdLDY0NTk6WywyMjBdfSxcbjY2NTY6ezY2Nzk6WywyMzBdLDY2ODA6WywyMjBdLDY3NTI6Wyw5XSw2NzczOlssMjMwXSw2Nzc0OlssMjMwXSw2Nzc1OlssMjMwXSw2Nzc2OlssMjMwXSw2Nzc3OlssMjMwXSw2Nzc4OlssMjMwXSw2Nzc5OlssMjMwXSw2NzgwOlssMjMwXSw2NzgzOlssMjIwXX0sXG42OTEyOns2OTE3OlssLHs2OTY1OjY5MTh9XSw2OTE4OltbNjkxNyw2OTY1XV0sNjkxOTpbLCx7Njk2NTo2OTIwfV0sNjkyMDpbWzY5MTksNjk2NV1dLDY5MjE6WywsezY5NjU6NjkyMn1dLDY5MjI6W1s2OTIxLDY5NjVdXSw2OTIzOlssLHs2OTY1OjY5MjR9XSw2OTI0OltbNjkyMyw2OTY1XV0sNjkyNTpbLCx7Njk2NTo2OTI2fV0sNjkyNjpbWzY5MjUsNjk2NV1dLDY5Mjk6WywsezY5NjU6NjkzMH1dLDY5MzA6W1s2OTI5LDY5NjVdXSw2OTY0OlssN10sNjk3MDpbLCx7Njk2NTo2OTcxfV0sNjk3MTpbWzY5NzAsNjk2NV1dLDY5NzI6WywsezY5NjU6Njk3M31dLDY5NzM6W1s2OTcyLDY5NjVdXSw2OTc0OlssLHs2OTY1OjY5NzZ9XSw2OTc1OlssLHs2OTY1OjY5Nzd9XSw2OTc2OltbNjk3NCw2OTY1XV0sNjk3NzpbWzY5NzUsNjk2NV1dLDY5Nzg6WywsezY5NjU6Njk3OX1dLDY5Nzk6W1s2OTc4LDY5NjVdXSw2OTgwOlssOV0sNzAxOTpbLDIzMF0sNzAyMDpbLDIyMF0sNzAyMTpbLDIzMF0sNzAyMjpbLDIzMF0sNzAyMzpbLDIzMF0sNzAyNDpbLDIzMF0sNzAyNTpbLDIzMF0sNzAyNjpbLDIzMF0sNzAyNzpbLDIzMF0sNzA4MjpbLDldLDcwODM6Wyw5XSw3MTQyOlssN10sNzE1NDpbLDldLDcxNTU6Wyw5XX0sXG43MTY4Ons3MjIzOlssN10sNzM3NjpbLDIzMF0sNzM3NzpbLDIzMF0sNzM3ODpbLDIzMF0sNzM4MDpbLDFdLDczODE6WywyMjBdLDczODI6WywyMjBdLDczODM6WywyMjBdLDczODQ6WywyMjBdLDczODU6WywyMjBdLDczODY6WywyMzBdLDczODc6WywyMzBdLDczODg6WywyMjBdLDczODk6WywyMjBdLDczOTA6WywyMjBdLDczOTE6WywyMjBdLDczOTI6WywyMzBdLDczOTQ6WywxXSw3Mzk1OlssMV0sNzM5NjpbLDFdLDczOTc6WywxXSw3Mzk4OlssMV0sNzM5OTpbLDFdLDc0MDA6WywxXSw3NDA1OlssMjIwXSw3NDEyOlssMjMwXX0sXG43NDI0Ons3NDY4OltbNjVdLDI1Nl0sNzQ2OTpbWzE5OF0sMjU2XSw3NDcwOltbNjZdLDI1Nl0sNzQ3MjpbWzY4XSwyNTZdLDc0NzM6W1s2OV0sMjU2XSw3NDc0OltbMzk4XSwyNTZdLDc0NzU6W1s3MV0sMjU2XSw3NDc2OltbNzJdLDI1Nl0sNzQ3NzpbWzczXSwyNTZdLDc0Nzg6W1s3NF0sMjU2XSw3NDc5OltbNzVdLDI1Nl0sNzQ4MDpbWzc2XSwyNTZdLDc0ODE6W1s3N10sMjU2XSw3NDgyOltbNzhdLDI1Nl0sNzQ4NDpbWzc5XSwyNTZdLDc0ODU6W1s1NDZdLDI1Nl0sNzQ4NjpbWzgwXSwyNTZdLDc0ODc6W1s4Ml0sMjU2XSw3NDg4OltbODRdLDI1Nl0sNzQ4OTpbWzg1XSwyNTZdLDc0OTA6W1s4N10sMjU2XSw3NDkxOltbOTddLDI1Nl0sNzQ5MjpbWzU5Ml0sMjU2XSw3NDkzOltbNTkzXSwyNTZdLDc0OTQ6W1s3NDI2XSwyNTZdLDc0OTU6W1s5OF0sMjU2XSw3NDk2OltbMTAwXSwyNTZdLDc0OTc6W1sxMDFdLDI1Nl0sNzQ5ODpbWzYwMV0sMjU2XSw3NDk5OltbNjAzXSwyNTZdLDc1MDA6W1s2MDRdLDI1Nl0sNzUwMTpbWzEwM10sMjU2XSw3NTAzOltbMTA3XSwyNTZdLDc1MDQ6W1sxMDldLDI1Nl0sNzUwNTpbWzMzMV0sMjU2XSw3NTA2OltbMTExXSwyNTZdLDc1MDc6W1s1OTZdLDI1Nl0sNzUwODpbWzc0NDZdLDI1Nl0sNzUwOTpbWzc0NDddLDI1Nl0sNzUxMDpbWzExMl0sMjU2XSw3NTExOltbMTE2XSwyNTZdLDc1MTI6W1sxMTddLDI1Nl0sNzUxMzpbWzc0NTNdLDI1Nl0sNzUxNDpbWzYyM10sMjU2XSw3NTE1OltbMTE4XSwyNTZdLDc1MTY6W1s3NDYxXSwyNTZdLDc1MTc6W1s5NDZdLDI1Nl0sNzUxODpbWzk0N10sMjU2XSw3NTE5OltbOTQ4XSwyNTZdLDc1MjA6W1s5NjZdLDI1Nl0sNzUyMTpbWzk2N10sMjU2XSw3NTIyOltbMTA1XSwyNTZdLDc1MjM6W1sxMTRdLDI1Nl0sNzUyNDpbWzExN10sMjU2XSw3NTI1OltbMTE4XSwyNTZdLDc1MjY6W1s5NDZdLDI1Nl0sNzUyNzpbWzk0N10sMjU2XSw3NTI4OltbOTYxXSwyNTZdLDc1Mjk6W1s5NjZdLDI1Nl0sNzUzMDpbWzk2N10sMjU2XSw3NTQ0OltbMTA4NV0sMjU2XSw3NTc5OltbNTk0XSwyNTZdLDc1ODA6W1s5OV0sMjU2XSw3NTgxOltbNTk3XSwyNTZdLDc1ODI6W1syNDBdLDI1Nl0sNzU4MzpbWzYwNF0sMjU2XSw3NTg0OltbMTAyXSwyNTZdLDc1ODU6W1s2MDddLDI1Nl0sNzU4NjpbWzYwOV0sMjU2XSw3NTg3OltbNjEzXSwyNTZdLDc1ODg6W1s2MTZdLDI1Nl0sNzU4OTpbWzYxN10sMjU2XSw3NTkwOltbNjE4XSwyNTZdLDc1OTE6W1s3NTQ3XSwyNTZdLDc1OTI6W1s2NjldLDI1Nl0sNzU5MzpbWzYyMV0sMjU2XSw3NTk0OltbNzU1N10sMjU2XSw3NTk1OltbNjcxXSwyNTZdLDc1OTY6W1s2MjVdLDI1Nl0sNzU5NzpbWzYyNF0sMjU2XSw3NTk4OltbNjI2XSwyNTZdLDc1OTk6W1s2MjddLDI1Nl0sNzYwMDpbWzYyOF0sMjU2XSw3NjAxOltbNjI5XSwyNTZdLDc2MDI6W1s2MzJdLDI1Nl0sNzYwMzpbWzY0Ml0sMjU2XSw3NjA0OltbNjQzXSwyNTZdLDc2MDU6W1s0MjddLDI1Nl0sNzYwNjpbWzY0OV0sMjU2XSw3NjA3OltbNjUwXSwyNTZdLDc2MDg6W1s3NDUyXSwyNTZdLDc2MDk6W1s2NTFdLDI1Nl0sNzYxMDpbWzY1Ml0sMjU2XSw3NjExOltbMTIyXSwyNTZdLDc2MTI6W1s2NTZdLDI1Nl0sNzYxMzpbWzY1N10sMjU2XSw3NjE0OltbNjU4XSwyNTZdLDc2MTU6W1s5NTJdLDI1Nl0sNzYxNjpbLDIzMF0sNzYxNzpbLDIzMF0sNzYxODpbLDIyMF0sNzYxOTpbLDIzMF0sNzYyMDpbLDIzMF0sNzYyMTpbLDIzMF0sNzYyMjpbLDIzMF0sNzYyMzpbLDIzMF0sNzYyNDpbLDIzMF0sNzYyNTpbLDIzMF0sNzYyNjpbLDIyMF0sNzYyNzpbLDIzMF0sNzYyODpbLDIzMF0sNzYyOTpbLDIzNF0sNzYzMDpbLDIxNF0sNzYzMTpbLDIyMF0sNzYzMjpbLDIwMl0sNzYzMzpbLDIzMF0sNzYzNDpbLDIzMF0sNzYzNTpbLDIzMF0sNzYzNjpbLDIzMF0sNzYzNzpbLDIzMF0sNzYzODpbLDIzMF0sNzYzOTpbLDIzMF0sNzY0MDpbLDIzMF0sNzY0MTpbLDIzMF0sNzY0MjpbLDIzMF0sNzY0MzpbLDIzMF0sNzY0NDpbLDIzMF0sNzY0NTpbLDIzMF0sNzY0NjpbLDIzMF0sNzY0NzpbLDIzMF0sNzY0ODpbLDIzMF0sNzY0OTpbLDIzMF0sNzY1MDpbLDIzMF0sNzY1MTpbLDIzMF0sNzY1MjpbLDIzMF0sNzY1MzpbLDIzMF0sNzY1NDpbLDIzMF0sNzY3NjpbLDIzM10sNzY3NzpbLDIyMF0sNzY3ODpbLDIzMF0sNzY3OTpbLDIyMF19LFxuNzY4MDp7NzY4MDpbWzY1LDgwNV1dLDc2ODE6W1s5Nyw4MDVdXSw3NjgyOltbNjYsNzc1XV0sNzY4MzpbWzk4LDc3NV1dLDc2ODQ6W1s2Niw4MDNdXSw3Njg1OltbOTgsODAzXV0sNzY4NjpbWzY2LDgxN11dLDc2ODc6W1s5OCw4MTddXSw3Njg4OltbMTk5LDc2OV1dLDc2ODk6W1syMzEsNzY5XV0sNzY5MDpbWzY4LDc3NV1dLDc2OTE6W1sxMDAsNzc1XV0sNzY5MjpbWzY4LDgwM11dLDc2OTM6W1sxMDAsODAzXV0sNzY5NDpbWzY4LDgxN11dLDc2OTU6W1sxMDAsODE3XV0sNzY5NjpbWzY4LDgwN11dLDc2OTc6W1sxMDAsODA3XV0sNzY5ODpbWzY4LDgxM11dLDc2OTk6W1sxMDAsODEzXV0sNzcwMDpbWzI3NCw3NjhdXSw3NzAxOltbMjc1LDc2OF1dLDc3MDI6W1syNzQsNzY5XV0sNzcwMzpbWzI3NSw3NjldXSw3NzA0OltbNjksODEzXV0sNzcwNTpbWzEwMSw4MTNdXSw3NzA2OltbNjksODE2XV0sNzcwNzpbWzEwMSw4MTZdXSw3NzA4OltbNTUyLDc3NF1dLDc3MDk6W1s1NTMsNzc0XV0sNzcxMDpbWzcwLDc3NV1dLDc3MTE6W1sxMDIsNzc1XV0sNzcxMjpbWzcxLDc3Ml1dLDc3MTM6W1sxMDMsNzcyXV0sNzcxNDpbWzcyLDc3NV1dLDc3MTU6W1sxMDQsNzc1XV0sNzcxNjpbWzcyLDgwM11dLDc3MTc6W1sxMDQsODAzXV0sNzcxODpbWzcyLDc3Nl1dLDc3MTk6W1sxMDQsNzc2XV0sNzcyMDpbWzcyLDgwN11dLDc3MjE6W1sxMDQsODA3XV0sNzcyMjpbWzcyLDgxNF1dLDc3MjM6W1sxMDQsODE0XV0sNzcyNDpbWzczLDgxNl1dLDc3MjU6W1sxMDUsODE2XV0sNzcyNjpbWzIwNyw3NjldXSw3NzI3OltbMjM5LDc2OV1dLDc3Mjg6W1s3NSw3NjldXSw3NzI5OltbMTA3LDc2OV1dLDc3MzA6W1s3NSw4MDNdXSw3NzMxOltbMTA3LDgwM11dLDc3MzI6W1s3NSw4MTddXSw3NzMzOltbMTA3LDgxN11dLDc3MzQ6W1s3Niw4MDNdLCx7NzcyOjc3MzZ9XSw3NzM1OltbMTA4LDgwM10sLHs3NzI6NzczN31dLDc3MzY6W1s3NzM0LDc3Ml1dLDc3Mzc6W1s3NzM1LDc3Ml1dLDc3Mzg6W1s3Niw4MTddXSw3NzM5OltbMTA4LDgxN11dLDc3NDA6W1s3Niw4MTNdXSw3NzQxOltbMTA4LDgxM11dLDc3NDI6W1s3Nyw3NjldXSw3NzQzOltbMTA5LDc2OV1dLDc3NDQ6W1s3Nyw3NzVdXSw3NzQ1OltbMTA5LDc3NV1dLDc3NDY6W1s3Nyw4MDNdXSw3NzQ3OltbMTA5LDgwM11dLDc3NDg6W1s3OCw3NzVdXSw3NzQ5OltbMTEwLDc3NV1dLDc3NTA6W1s3OCw4MDNdXSw3NzUxOltbMTEwLDgwM11dLDc3NTI6W1s3OCw4MTddXSw3NzUzOltbMTEwLDgxN11dLDc3NTQ6W1s3OCw4MTNdXSw3NzU1OltbMTEwLDgxM11dLDc3NTY6W1syMTMsNzY5XV0sNzc1NzpbWzI0NSw3NjldXSw3NzU4OltbMjEzLDc3Nl1dLDc3NTk6W1syNDUsNzc2XV0sNzc2MDpbWzMzMiw3NjhdXSw3NzYxOltbMzMzLDc2OF1dLDc3NjI6W1szMzIsNzY5XV0sNzc2MzpbWzMzMyw3NjldXSw3NzY0OltbODAsNzY5XV0sNzc2NTpbWzExMiw3NjldXSw3NzY2OltbODAsNzc1XV0sNzc2NzpbWzExMiw3NzVdXSw3NzY4OltbODIsNzc1XV0sNzc2OTpbWzExNCw3NzVdXSw3NzcwOltbODIsODAzXSwsezc3Mjo3NzcyfV0sNzc3MTpbWzExNCw4MDNdLCx7NzcyOjc3NzN9XSw3NzcyOltbNzc3MCw3NzJdXSw3NzczOltbNzc3MSw3NzJdXSw3Nzc0OltbODIsODE3XV0sNzc3NTpbWzExNCw4MTddXSw3Nzc2OltbODMsNzc1XV0sNzc3NzpbWzExNSw3NzVdXSw3Nzc4OltbODMsODAzXSwsezc3NTo3Nzg0fV0sNzc3OTpbWzExNSw4MDNdLCx7Nzc1Ojc3ODV9XSw3NzgwOltbMzQ2LDc3NV1dLDc3ODE6W1szNDcsNzc1XV0sNzc4MjpbWzM1Miw3NzVdXSw3NzgzOltbMzUzLDc3NV1dLDc3ODQ6W1s3Nzc4LDc3NV1dLDc3ODU6W1s3Nzc5LDc3NV1dLDc3ODY6W1s4NCw3NzVdXSw3Nzg3OltbMTE2LDc3NV1dLDc3ODg6W1s4NCw4MDNdXSw3Nzg5OltbMTE2LDgwM11dLDc3OTA6W1s4NCw4MTddXSw3NzkxOltbMTE2LDgxN11dLDc3OTI6W1s4NCw4MTNdXSw3NzkzOltbMTE2LDgxM11dLDc3OTQ6W1s4NSw4MDRdXSw3Nzk1OltbMTE3LDgwNF1dLDc3OTY6W1s4NSw4MTZdXSw3Nzk3OltbMTE3LDgxNl1dLDc3OTg6W1s4NSw4MTNdXSw3Nzk5OltbMTE3LDgxM11dLDc4MDA6W1szNjAsNzY5XV0sNzgwMTpbWzM2MSw3NjldXSw3ODAyOltbMzYyLDc3Nl1dLDc4MDM6W1szNjMsNzc2XV0sNzgwNDpbWzg2LDc3MV1dLDc4MDU6W1sxMTgsNzcxXV0sNzgwNjpbWzg2LDgwM11dLDc4MDc6W1sxMTgsODAzXV0sNzgwODpbWzg3LDc2OF1dLDc4MDk6W1sxMTksNzY4XV0sNzgxMDpbWzg3LDc2OV1dLDc4MTE6W1sxMTksNzY5XV0sNzgxMjpbWzg3LDc3Nl1dLDc4MTM6W1sxMTksNzc2XV0sNzgxNDpbWzg3LDc3NV1dLDc4MTU6W1sxMTksNzc1XV0sNzgxNjpbWzg3LDgwM11dLDc4MTc6W1sxMTksODAzXV0sNzgxODpbWzg4LDc3NV1dLDc4MTk6W1sxMjAsNzc1XV0sNzgyMDpbWzg4LDc3Nl1dLDc4MjE6W1sxMjAsNzc2XV0sNzgyMjpbWzg5LDc3NV1dLDc4MjM6W1sxMjEsNzc1XV0sNzgyNDpbWzkwLDc3MF1dLDc4MjU6W1sxMjIsNzcwXV0sNzgyNjpbWzkwLDgwM11dLDc4Mjc6W1sxMjIsODAzXV0sNzgyODpbWzkwLDgxN11dLDc4Mjk6W1sxMjIsODE3XV0sNzgzMDpbWzEwNCw4MTddXSw3ODMxOltbMTE2LDc3Nl1dLDc4MzI6W1sxMTksNzc4XV0sNzgzMzpbWzEyMSw3NzhdXSw3ODM0OltbOTcsNzAyXSwyNTZdLDc4MzU6W1szODMsNzc1XV0sNzg0MDpbWzY1LDgwM10sLHs3NzA6Nzg1Miw3NzQ6Nzg2Mn1dLDc4NDE6W1s5Nyw4MDNdLCx7NzcwOjc4NTMsNzc0Ojc4NjN9XSw3ODQyOltbNjUsNzc3XV0sNzg0MzpbWzk3LDc3N11dLDc4NDQ6W1sxOTQsNzY5XV0sNzg0NTpbWzIyNiw3NjldXSw3ODQ2OltbMTk0LDc2OF1dLDc4NDc6W1syMjYsNzY4XV0sNzg0ODpbWzE5NCw3NzddXSw3ODQ5OltbMjI2LDc3N11dLDc4NTA6W1sxOTQsNzcxXV0sNzg1MTpbWzIyNiw3NzFdXSw3ODUyOltbNzg0MCw3NzBdXSw3ODUzOltbNzg0MSw3NzBdXSw3ODU0OltbMjU4LDc2OV1dLDc4NTU6W1syNTksNzY5XV0sNzg1NjpbWzI1OCw3NjhdXSw3ODU3OltbMjU5LDc2OF1dLDc4NTg6W1syNTgsNzc3XV0sNzg1OTpbWzI1OSw3NzddXSw3ODYwOltbMjU4LDc3MV1dLDc4NjE6W1syNTksNzcxXV0sNzg2MjpbWzc4NDAsNzc0XV0sNzg2MzpbWzc4NDEsNzc0XV0sNzg2NDpbWzY5LDgwM10sLHs3NzA6Nzg3OH1dLDc4NjU6W1sxMDEsODAzXSwsezc3MDo3ODc5fV0sNzg2NjpbWzY5LDc3N11dLDc4Njc6W1sxMDEsNzc3XV0sNzg2ODpbWzY5LDc3MV1dLDc4Njk6W1sxMDEsNzcxXV0sNzg3MDpbWzIwMiw3NjldXSw3ODcxOltbMjM0LDc2OV1dLDc4NzI6W1syMDIsNzY4XV0sNzg3MzpbWzIzNCw3NjhdXSw3ODc0OltbMjAyLDc3N11dLDc4NzU6W1syMzQsNzc3XV0sNzg3NjpbWzIwMiw3NzFdXSw3ODc3OltbMjM0LDc3MV1dLDc4Nzg6W1s3ODY0LDc3MF1dLDc4Nzk6W1s3ODY1LDc3MF1dLDc4ODA6W1s3Myw3NzddXSw3ODgxOltbMTA1LDc3N11dLDc4ODI6W1s3Myw4MDNdXSw3ODgzOltbMTA1LDgwM11dLDc4ODQ6W1s3OSw4MDNdLCx7NzcwOjc4OTZ9XSw3ODg1OltbMTExLDgwM10sLHs3NzA6Nzg5N31dLDc4ODY6W1s3OSw3NzddXSw3ODg3OltbMTExLDc3N11dLDc4ODg6W1syMTIsNzY5XV0sNzg4OTpbWzI0NCw3NjldXSw3ODkwOltbMjEyLDc2OF1dLDc4OTE6W1syNDQsNzY4XV0sNzg5MjpbWzIxMiw3NzddXSw3ODkzOltbMjQ0LDc3N11dLDc4OTQ6W1syMTIsNzcxXV0sNzg5NTpbWzI0NCw3NzFdXSw3ODk2OltbNzg4NCw3NzBdXSw3ODk3OltbNzg4NSw3NzBdXSw3ODk4OltbNDE2LDc2OV1dLDc4OTk6W1s0MTcsNzY5XV0sNzkwMDpbWzQxNiw3NjhdXSw3OTAxOltbNDE3LDc2OF1dLDc5MDI6W1s0MTYsNzc3XV0sNzkwMzpbWzQxNyw3NzddXSw3OTA0OltbNDE2LDc3MV1dLDc5MDU6W1s0MTcsNzcxXV0sNzkwNjpbWzQxNiw4MDNdXSw3OTA3OltbNDE3LDgwM11dLDc5MDg6W1s4NSw4MDNdXSw3OTA5OltbMTE3LDgwM11dLDc5MTA6W1s4NSw3NzddXSw3OTExOltbMTE3LDc3N11dLDc5MTI6W1s0MzEsNzY5XV0sNzkxMzpbWzQzMiw3NjldXSw3OTE0OltbNDMxLDc2OF1dLDc5MTU6W1s0MzIsNzY4XV0sNzkxNjpbWzQzMSw3NzddXSw3OTE3OltbNDMyLDc3N11dLDc5MTg6W1s0MzEsNzcxXV0sNzkxOTpbWzQzMiw3NzFdXSw3OTIwOltbNDMxLDgwM11dLDc5MjE6W1s0MzIsODAzXV0sNzkyMjpbWzg5LDc2OF1dLDc5MjM6W1sxMjEsNzY4XV0sNzkyNDpbWzg5LDgwM11dLDc5MjU6W1sxMjEsODAzXV0sNzkyNjpbWzg5LDc3N11dLDc5Mjc6W1sxMjEsNzc3XV0sNzkyODpbWzg5LDc3MV1dLDc5Mjk6W1sxMjEsNzcxXV19LFxuNzkzNjp7NzkzNjpbWzk0NSw3ODddLCx7NzY4Ojc5MzgsNzY5Ojc5NDAsODM0Ojc5NDIsODM3OjgwNjR9XSw3OTM3OltbOTQ1LDc4OF0sLHs3Njg6NzkzOSw3Njk6Nzk0MSw4MzQ6Nzk0Myw4Mzc6ODA2NX1dLDc5Mzg6W1s3OTM2LDc2OF0sLHs4Mzc6ODA2Nn1dLDc5Mzk6W1s3OTM3LDc2OF0sLHs4Mzc6ODA2N31dLDc5NDA6W1s3OTM2LDc2OV0sLHs4Mzc6ODA2OH1dLDc5NDE6W1s3OTM3LDc2OV0sLHs4Mzc6ODA2OX1dLDc5NDI6W1s3OTM2LDgzNF0sLHs4Mzc6ODA3MH1dLDc5NDM6W1s3OTM3LDgzNF0sLHs4Mzc6ODA3MX1dLDc5NDQ6W1s5MTMsNzg3XSwsezc2ODo3OTQ2LDc2OTo3OTQ4LDgzNDo3OTUwLDgzNzo4MDcyfV0sNzk0NTpbWzkxMyw3ODhdLCx7NzY4Ojc5NDcsNzY5Ojc5NDksODM0Ojc5NTEsODM3OjgwNzN9XSw3OTQ2OltbNzk0NCw3NjhdLCx7ODM3OjgwNzR9XSw3OTQ3OltbNzk0NSw3NjhdLCx7ODM3OjgwNzV9XSw3OTQ4OltbNzk0NCw3NjldLCx7ODM3OjgwNzZ9XSw3OTQ5OltbNzk0NSw3NjldLCx7ODM3OjgwNzd9XSw3OTUwOltbNzk0NCw4MzRdLCx7ODM3OjgwNzh9XSw3OTUxOltbNzk0NSw4MzRdLCx7ODM3OjgwNzl9XSw3OTUyOltbOTQ5LDc4N10sLHs3Njg6Nzk1NCw3Njk6Nzk1Nn1dLDc5NTM6W1s5NDksNzg4XSwsezc2ODo3OTU1LDc2OTo3OTU3fV0sNzk1NDpbWzc5NTIsNzY4XV0sNzk1NTpbWzc5NTMsNzY4XV0sNzk1NjpbWzc5NTIsNzY5XV0sNzk1NzpbWzc5NTMsNzY5XV0sNzk2MDpbWzkxNyw3ODddLCx7NzY4Ojc5NjIsNzY5Ojc5NjR9XSw3OTYxOltbOTE3LDc4OF0sLHs3Njg6Nzk2Myw3Njk6Nzk2NX1dLDc5NjI6W1s3OTYwLDc2OF1dLDc5NjM6W1s3OTYxLDc2OF1dLDc5NjQ6W1s3OTYwLDc2OV1dLDc5NjU6W1s3OTYxLDc2OV1dLDc5Njg6W1s5NTEsNzg3XSwsezc2ODo3OTcwLDc2OTo3OTcyLDgzNDo3OTc0LDgzNzo4MDgwfV0sNzk2OTpbWzk1MSw3ODhdLCx7NzY4Ojc5NzEsNzY5Ojc5NzMsODM0Ojc5NzUsODM3OjgwODF9XSw3OTcwOltbNzk2OCw3NjhdLCx7ODM3OjgwODJ9XSw3OTcxOltbNzk2OSw3NjhdLCx7ODM3OjgwODN9XSw3OTcyOltbNzk2OCw3NjldLCx7ODM3OjgwODR9XSw3OTczOltbNzk2OSw3NjldLCx7ODM3OjgwODV9XSw3OTc0OltbNzk2OCw4MzRdLCx7ODM3OjgwODZ9XSw3OTc1OltbNzk2OSw4MzRdLCx7ODM3OjgwODd9XSw3OTc2OltbOTE5LDc4N10sLHs3Njg6Nzk3OCw3Njk6Nzk4MCw4MzQ6Nzk4Miw4Mzc6ODA4OH1dLDc5Nzc6W1s5MTksNzg4XSwsezc2ODo3OTc5LDc2OTo3OTgxLDgzNDo3OTgzLDgzNzo4MDg5fV0sNzk3ODpbWzc5NzYsNzY4XSwsezgzNzo4MDkwfV0sNzk3OTpbWzc5NzcsNzY4XSwsezgzNzo4MDkxfV0sNzk4MDpbWzc5NzYsNzY5XSwsezgzNzo4MDkyfV0sNzk4MTpbWzc5NzcsNzY5XSwsezgzNzo4MDkzfV0sNzk4MjpbWzc5NzYsODM0XSwsezgzNzo4MDk0fV0sNzk4MzpbWzc5NzcsODM0XSwsezgzNzo4MDk1fV0sNzk4NDpbWzk1Myw3ODddLCx7NzY4Ojc5ODYsNzY5Ojc5ODgsODM0Ojc5OTB9XSw3OTg1OltbOTUzLDc4OF0sLHs3Njg6Nzk4Nyw3Njk6Nzk4OSw4MzQ6Nzk5MX1dLDc5ODY6W1s3OTg0LDc2OF1dLDc5ODc6W1s3OTg1LDc2OF1dLDc5ODg6W1s3OTg0LDc2OV1dLDc5ODk6W1s3OTg1LDc2OV1dLDc5OTA6W1s3OTg0LDgzNF1dLDc5OTE6W1s3OTg1LDgzNF1dLDc5OTI6W1s5MjEsNzg3XSwsezc2ODo3OTk0LDc2OTo3OTk2LDgzNDo3OTk4fV0sNzk5MzpbWzkyMSw3ODhdLCx7NzY4Ojc5OTUsNzY5Ojc5OTcsODM0Ojc5OTl9XSw3OTk0OltbNzk5Miw3NjhdXSw3OTk1OltbNzk5Myw3NjhdXSw3OTk2OltbNzk5Miw3NjldXSw3OTk3OltbNzk5Myw3NjldXSw3OTk4OltbNzk5Miw4MzRdXSw3OTk5OltbNzk5Myw4MzRdXSw4MDAwOltbOTU5LDc4N10sLHs3Njg6ODAwMiw3Njk6ODAwNH1dLDgwMDE6W1s5NTksNzg4XSwsezc2ODo4MDAzLDc2OTo4MDA1fV0sODAwMjpbWzgwMDAsNzY4XV0sODAwMzpbWzgwMDEsNzY4XV0sODAwNDpbWzgwMDAsNzY5XV0sODAwNTpbWzgwMDEsNzY5XV0sODAwODpbWzkyNyw3ODddLCx7NzY4OjgwMTAsNzY5OjgwMTJ9XSw4MDA5OltbOTI3LDc4OF0sLHs3Njg6ODAxMSw3Njk6ODAxM31dLDgwMTA6W1s4MDA4LDc2OF1dLDgwMTE6W1s4MDA5LDc2OF1dLDgwMTI6W1s4MDA4LDc2OV1dLDgwMTM6W1s4MDA5LDc2OV1dLDgwMTY6W1s5NjUsNzg3XSwsezc2ODo4MDE4LDc2OTo4MDIwLDgzNDo4MDIyfV0sODAxNzpbWzk2NSw3ODhdLCx7NzY4OjgwMTksNzY5OjgwMjEsODM0OjgwMjN9XSw4MDE4OltbODAxNiw3NjhdXSw4MDE5OltbODAxNyw3NjhdXSw4MDIwOltbODAxNiw3NjldXSw4MDIxOltbODAxNyw3NjldXSw4MDIyOltbODAxNiw4MzRdXSw4MDIzOltbODAxNyw4MzRdXSw4MDI1OltbOTMzLDc4OF0sLHs3Njg6ODAyNyw3Njk6ODAyOSw4MzQ6ODAzMX1dLDgwMjc6W1s4MDI1LDc2OF1dLDgwMjk6W1s4MDI1LDc2OV1dLDgwMzE6W1s4MDI1LDgzNF1dLDgwMzI6W1s5NjksNzg3XSwsezc2ODo4MDM0LDc2OTo4MDM2LDgzNDo4MDM4LDgzNzo4MDk2fV0sODAzMzpbWzk2OSw3ODhdLCx7NzY4OjgwMzUsNzY5OjgwMzcsODM0OjgwMzksODM3OjgwOTd9XSw4MDM0OltbODAzMiw3NjhdLCx7ODM3OjgwOTh9XSw4MDM1OltbODAzMyw3NjhdLCx7ODM3OjgwOTl9XSw4MDM2OltbODAzMiw3NjldLCx7ODM3OjgxMDB9XSw4MDM3OltbODAzMyw3NjldLCx7ODM3OjgxMDF9XSw4MDM4OltbODAzMiw4MzRdLCx7ODM3OjgxMDJ9XSw4MDM5OltbODAzMyw4MzRdLCx7ODM3OjgxMDN9XSw4MDQwOltbOTM3LDc4N10sLHs3Njg6ODA0Miw3Njk6ODA0NCw4MzQ6ODA0Niw4Mzc6ODEwNH1dLDgwNDE6W1s5MzcsNzg4XSwsezc2ODo4MDQzLDc2OTo4MDQ1LDgzNDo4MDQ3LDgzNzo4MTA1fV0sODA0MjpbWzgwNDAsNzY4XSwsezgzNzo4MTA2fV0sODA0MzpbWzgwNDEsNzY4XSwsezgzNzo4MTA3fV0sODA0NDpbWzgwNDAsNzY5XSwsezgzNzo4MTA4fV0sODA0NTpbWzgwNDEsNzY5XSwsezgzNzo4MTA5fV0sODA0NjpbWzgwNDAsODM0XSwsezgzNzo4MTEwfV0sODA0NzpbWzgwNDEsODM0XSwsezgzNzo4MTExfV0sODA0ODpbWzk0NSw3NjhdLCx7ODM3OjgxMTR9XSw4MDQ5OltbOTQwXV0sODA1MDpbWzk0OSw3NjhdXSw4MDUxOltbOTQxXV0sODA1MjpbWzk1MSw3NjhdLCx7ODM3OjgxMzB9XSw4MDUzOltbOTQyXV0sODA1NDpbWzk1Myw3NjhdXSw4MDU1OltbOTQzXV0sODA1NjpbWzk1OSw3NjhdXSw4MDU3OltbOTcyXV0sODA1ODpbWzk2NSw3NjhdXSw4MDU5OltbOTczXV0sODA2MDpbWzk2OSw3NjhdLCx7ODM3OjgxNzh9XSw4MDYxOltbOTc0XV0sODA2NDpbWzc5MzYsODM3XV0sODA2NTpbWzc5MzcsODM3XV0sODA2NjpbWzc5MzgsODM3XV0sODA2NzpbWzc5MzksODM3XV0sODA2ODpbWzc5NDAsODM3XV0sODA2OTpbWzc5NDEsODM3XV0sODA3MDpbWzc5NDIsODM3XV0sODA3MTpbWzc5NDMsODM3XV0sODA3MjpbWzc5NDQsODM3XV0sODA3MzpbWzc5NDUsODM3XV0sODA3NDpbWzc5NDYsODM3XV0sODA3NTpbWzc5NDcsODM3XV0sODA3NjpbWzc5NDgsODM3XV0sODA3NzpbWzc5NDksODM3XV0sODA3ODpbWzc5NTAsODM3XV0sODA3OTpbWzc5NTEsODM3XV0sODA4MDpbWzc5NjgsODM3XV0sODA4MTpbWzc5NjksODM3XV0sODA4MjpbWzc5NzAsODM3XV0sODA4MzpbWzc5NzEsODM3XV0sODA4NDpbWzc5NzIsODM3XV0sODA4NTpbWzc5NzMsODM3XV0sODA4NjpbWzc5NzQsODM3XV0sODA4NzpbWzc5NzUsODM3XV0sODA4ODpbWzc5NzYsODM3XV0sODA4OTpbWzc5NzcsODM3XV0sODA5MDpbWzc5NzgsODM3XV0sODA5MTpbWzc5NzksODM3XV0sODA5MjpbWzc5ODAsODM3XV0sODA5MzpbWzc5ODEsODM3XV0sODA5NDpbWzc5ODIsODM3XV0sODA5NTpbWzc5ODMsODM3XV0sODA5NjpbWzgwMzIsODM3XV0sODA5NzpbWzgwMzMsODM3XV0sODA5ODpbWzgwMzQsODM3XV0sODA5OTpbWzgwMzUsODM3XV0sODEwMDpbWzgwMzYsODM3XV0sODEwMTpbWzgwMzcsODM3XV0sODEwMjpbWzgwMzgsODM3XV0sODEwMzpbWzgwMzksODM3XV0sODEwNDpbWzgwNDAsODM3XV0sODEwNTpbWzgwNDEsODM3XV0sODEwNjpbWzgwNDIsODM3XV0sODEwNzpbWzgwNDMsODM3XV0sODEwODpbWzgwNDQsODM3XV0sODEwOTpbWzgwNDUsODM3XV0sODExMDpbWzgwNDYsODM3XV0sODExMTpbWzgwNDcsODM3XV0sODExMjpbWzk0NSw3NzRdXSw4MTEzOltbOTQ1LDc3Ml1dLDgxMTQ6W1s4MDQ4LDgzN11dLDgxMTU6W1s5NDUsODM3XV0sODExNjpbWzk0MCw4MzddXSw4MTE4OltbOTQ1LDgzNF0sLHs4Mzc6ODExOX1dLDgxMTk6W1s4MTE4LDgzN11dLDgxMjA6W1s5MTMsNzc0XV0sODEyMTpbWzkxMyw3NzJdXSw4MTIyOltbOTEzLDc2OF1dLDgxMjM6W1s5MDJdXSw4MTI0OltbOTEzLDgzN11dLDgxMjU6W1szMiw3ODddLDI1Nl0sODEyNjpbWzk1M11dLDgxMjc6W1szMiw3ODddLDI1Nix7NzY4OjgxNDEsNzY5OjgxNDIsODM0OjgxNDN9XSw4MTI4OltbMzIsODM0XSwyNTZdLDgxMjk6W1sxNjgsODM0XV0sODEzMDpbWzgwNTIsODM3XV0sODEzMTpbWzk1MSw4MzddXSw4MTMyOltbOTQyLDgzN11dLDgxMzQ6W1s5NTEsODM0XSwsezgzNzo4MTM1fV0sODEzNTpbWzgxMzQsODM3XV0sODEzNjpbWzkxNyw3NjhdXSw4MTM3OltbOTA0XV0sODEzODpbWzkxOSw3NjhdXSw4MTM5OltbOTA1XV0sODE0MDpbWzkxOSw4MzddXSw4MTQxOltbODEyNyw3NjhdXSw4MTQyOltbODEyNyw3NjldXSw4MTQzOltbODEyNyw4MzRdXSw4MTQ0OltbOTUzLDc3NF1dLDgxNDU6W1s5NTMsNzcyXV0sODE0NjpbWzk3MCw3NjhdXSw4MTQ3OltbOTEyXV0sODE1MDpbWzk1Myw4MzRdXSw4MTUxOltbOTcwLDgzNF1dLDgxNTI6W1s5MjEsNzc0XV0sODE1MzpbWzkyMSw3NzJdXSw4MTU0OltbOTIxLDc2OF1dLDgxNTU6W1s5MDZdXSw4MTU3OltbODE5MCw3NjhdXSw4MTU4OltbODE5MCw3NjldXSw4MTU5OltbODE5MCw4MzRdXSw4MTYwOltbOTY1LDc3NF1dLDgxNjE6W1s5NjUsNzcyXV0sODE2MjpbWzk3MSw3NjhdXSw4MTYzOltbOTQ0XV0sODE2NDpbWzk2MSw3ODddXSw4MTY1OltbOTYxLDc4OF1dLDgxNjY6W1s5NjUsODM0XV0sODE2NzpbWzk3MSw4MzRdXSw4MTY4OltbOTMzLDc3NF1dLDgxNjk6W1s5MzMsNzcyXV0sODE3MDpbWzkzMyw3NjhdXSw4MTcxOltbOTEwXV0sODE3MjpbWzkyOSw3ODhdXSw4MTczOltbMTY4LDc2OF1dLDgxNzQ6W1s5MDFdXSw4MTc1OltbOTZdXSw4MTc4OltbODA2MCw4MzddXSw4MTc5OltbOTY5LDgzN11dLDgxODA6W1s5NzQsODM3XV0sODE4MjpbWzk2OSw4MzRdLCx7ODM3OjgxODN9XSw4MTgzOltbODE4Miw4MzddXSw4MTg0OltbOTI3LDc2OF1dLDgxODU6W1s5MDhdXSw4MTg2OltbOTM3LDc2OF1dLDgxODc6W1s5MTFdXSw4MTg4OltbOTM3LDgzN11dLDgxODk6W1sxODBdXSw4MTkwOltbMzIsNzg4XSwyNTYsezc2ODo4MTU3LDc2OTo4MTU4LDgzNDo4MTU5fV19LFxuODE5Mjp7ODE5MjpbWzgxOTRdXSw4MTkzOltbODE5NV1dLDgxOTQ6W1szMl0sMjU2XSw4MTk1OltbMzJdLDI1Nl0sODE5NjpbWzMyXSwyNTZdLDgxOTc6W1szMl0sMjU2XSw4MTk4OltbMzJdLDI1Nl0sODE5OTpbWzMyXSwyNTZdLDgyMDA6W1szMl0sMjU2XSw4MjAxOltbMzJdLDI1Nl0sODIwMjpbWzMyXSwyNTZdLDgyMDk6W1s4MjA4XSwyNTZdLDgyMTU6W1szMiw4MTldLDI1Nl0sODIyODpbWzQ2XSwyNTZdLDgyMjk6W1s0Niw0Nl0sMjU2XSw4MjMwOltbNDYsNDYsNDZdLDI1Nl0sODIzOTpbWzMyXSwyNTZdLDgyNDM6W1s4MjQyLDgyNDJdLDI1Nl0sODI0NDpbWzgyNDIsODI0Miw4MjQyXSwyNTZdLDgyNDY6W1s4MjQ1LDgyNDVdLDI1Nl0sODI0NzpbWzgyNDUsODI0NSw4MjQ1XSwyNTZdLDgyNTI6W1szMywzM10sMjU2XSw4MjU0OltbMzIsNzczXSwyNTZdLDgyNjM6W1s2Myw2M10sMjU2XSw4MjY0OltbNjMsMzNdLDI1Nl0sODI2NTpbWzMzLDYzXSwyNTZdLDgyNzk6W1s4MjQyLDgyNDIsODI0Miw4MjQyXSwyNTZdLDgyODc6W1szMl0sMjU2XSw4MzA0OltbNDhdLDI1Nl0sODMwNTpbWzEwNV0sMjU2XSw4MzA4OltbNTJdLDI1Nl0sODMwOTpbWzUzXSwyNTZdLDgzMTA6W1s1NF0sMjU2XSw4MzExOltbNTVdLDI1Nl0sODMxMjpbWzU2XSwyNTZdLDgzMTM6W1s1N10sMjU2XSw4MzE0OltbNDNdLDI1Nl0sODMxNTpbWzg3MjJdLDI1Nl0sODMxNjpbWzYxXSwyNTZdLDgzMTc6W1s0MF0sMjU2XSw4MzE4OltbNDFdLDI1Nl0sODMxOTpbWzExMF0sMjU2XSw4MzIwOltbNDhdLDI1Nl0sODMyMTpbWzQ5XSwyNTZdLDgzMjI6W1s1MF0sMjU2XSw4MzIzOltbNTFdLDI1Nl0sODMyNDpbWzUyXSwyNTZdLDgzMjU6W1s1M10sMjU2XSw4MzI2OltbNTRdLDI1Nl0sODMyNzpbWzU1XSwyNTZdLDgzMjg6W1s1Nl0sMjU2XSw4MzI5OltbNTddLDI1Nl0sODMzMDpbWzQzXSwyNTZdLDgzMzE6W1s4NzIyXSwyNTZdLDgzMzI6W1s2MV0sMjU2XSw4MzMzOltbNDBdLDI1Nl0sODMzNDpbWzQxXSwyNTZdLDgzMzY6W1s5N10sMjU2XSw4MzM3OltbMTAxXSwyNTZdLDgzMzg6W1sxMTFdLDI1Nl0sODMzOTpbWzEyMF0sMjU2XSw4MzQwOltbNjAxXSwyNTZdLDgzNDE6W1sxMDRdLDI1Nl0sODM0MjpbWzEwN10sMjU2XSw4MzQzOltbMTA4XSwyNTZdLDgzNDQ6W1sxMDldLDI1Nl0sODM0NTpbWzExMF0sMjU2XSw4MzQ2OltbMTEyXSwyNTZdLDgzNDc6W1sxMTVdLDI1Nl0sODM0ODpbWzExNl0sMjU2XSw4MzYwOltbODIsMTE1XSwyNTZdLDg0MDA6WywyMzBdLDg0MDE6WywyMzBdLDg0MDI6WywxXSw4NDAzOlssMV0sODQwNDpbLDIzMF0sODQwNTpbLDIzMF0sODQwNjpbLDIzMF0sODQwNzpbLDIzMF0sODQwODpbLDFdLDg0MDk6WywxXSw4NDEwOlssMV0sODQxMTpbLDIzMF0sODQxMjpbLDIzMF0sODQxNzpbLDIzMF0sODQyMTpbLDFdLDg0MjI6WywxXSw4NDIzOlssMjMwXSw4NDI0OlssMjIwXSw4NDI1OlssMjMwXSw4NDI2OlssMV0sODQyNzpbLDFdLDg0Mjg6WywyMjBdLDg0Mjk6WywyMjBdLDg0MzA6WywyMjBdLDg0MzE6WywyMjBdLDg0MzI6WywyMzBdfSxcbjg0NDg6ezg0NDg6W1s5Nyw0Nyw5OV0sMjU2XSw4NDQ5OltbOTcsNDcsMTE1XSwyNTZdLDg0NTA6W1s2N10sMjU2XSw4NDUxOltbMTc2LDY3XSwyNTZdLDg0NTM6W1s5OSw0NywxMTFdLDI1Nl0sODQ1NDpbWzk5LDQ3LDExN10sMjU2XSw4NDU1OltbNDAwXSwyNTZdLDg0NTc6W1sxNzYsNzBdLDI1Nl0sODQ1ODpbWzEwM10sMjU2XSw4NDU5OltbNzJdLDI1Nl0sODQ2MDpbWzcyXSwyNTZdLDg0NjE6W1s3Ml0sMjU2XSw4NDYyOltbMTA0XSwyNTZdLDg0NjM6W1syOTVdLDI1Nl0sODQ2NDpbWzczXSwyNTZdLDg0NjU6W1s3M10sMjU2XSw4NDY2OltbNzZdLDI1Nl0sODQ2NzpbWzEwOF0sMjU2XSw4NDY5OltbNzhdLDI1Nl0sODQ3MDpbWzc4LDExMV0sMjU2XSw4NDczOltbODBdLDI1Nl0sODQ3NDpbWzgxXSwyNTZdLDg0NzU6W1s4Ml0sMjU2XSw4NDc2OltbODJdLDI1Nl0sODQ3NzpbWzgyXSwyNTZdLDg0ODA6W1s4Myw3N10sMjU2XSw4NDgxOltbODQsNjksNzZdLDI1Nl0sODQ4MjpbWzg0LDc3XSwyNTZdLDg0ODQ6W1s5MF0sMjU2XSw4NDg2OltbOTM3XV0sODQ4ODpbWzkwXSwyNTZdLDg0OTA6W1s3NV1dLDg0OTE6W1sxOTddXSw4NDkyOltbNjZdLDI1Nl0sODQ5MzpbWzY3XSwyNTZdLDg0OTU6W1sxMDFdLDI1Nl0sODQ5NjpbWzY5XSwyNTZdLDg0OTc6W1s3MF0sMjU2XSw4NDk5OltbNzddLDI1Nl0sODUwMDpbWzExMV0sMjU2XSw4NTAxOltbMTQ4OF0sMjU2XSw4NTAyOltbMTQ4OV0sMjU2XSw4NTAzOltbMTQ5MF0sMjU2XSw4NTA0OltbMTQ5MV0sMjU2XSw4NTA1OltbMTA1XSwyNTZdLDg1MDc6W1s3MCw2NSw4OF0sMjU2XSw4NTA4OltbOTYwXSwyNTZdLDg1MDk6W1s5NDddLDI1Nl0sODUxMDpbWzkxNV0sMjU2XSw4NTExOltbOTI4XSwyNTZdLDg1MTI6W1s4NzIxXSwyNTZdLDg1MTc6W1s2OF0sMjU2XSw4NTE4OltbMTAwXSwyNTZdLDg1MTk6W1sxMDFdLDI1Nl0sODUyMDpbWzEwNV0sMjU2XSw4NTIxOltbMTA2XSwyNTZdLDg1Mjg6W1s0OSw4MjYwLDU1XSwyNTZdLDg1Mjk6W1s0OSw4MjYwLDU3XSwyNTZdLDg1MzA6W1s0OSw4MjYwLDQ5LDQ4XSwyNTZdLDg1MzE6W1s0OSw4MjYwLDUxXSwyNTZdLDg1MzI6W1s1MCw4MjYwLDUxXSwyNTZdLDg1MzM6W1s0OSw4MjYwLDUzXSwyNTZdLDg1MzQ6W1s1MCw4MjYwLDUzXSwyNTZdLDg1MzU6W1s1MSw4MjYwLDUzXSwyNTZdLDg1MzY6W1s1Miw4MjYwLDUzXSwyNTZdLDg1Mzc6W1s0OSw4MjYwLDU0XSwyNTZdLDg1Mzg6W1s1Myw4MjYwLDU0XSwyNTZdLDg1Mzk6W1s0OSw4MjYwLDU2XSwyNTZdLDg1NDA6W1s1MSw4MjYwLDU2XSwyNTZdLDg1NDE6W1s1Myw4MjYwLDU2XSwyNTZdLDg1NDI6W1s1NSw4MjYwLDU2XSwyNTZdLDg1NDM6W1s0OSw4MjYwXSwyNTZdLDg1NDQ6W1s3M10sMjU2XSw4NTQ1OltbNzMsNzNdLDI1Nl0sODU0NjpbWzczLDczLDczXSwyNTZdLDg1NDc6W1s3Myw4Nl0sMjU2XSw4NTQ4OltbODZdLDI1Nl0sODU0OTpbWzg2LDczXSwyNTZdLDg1NTA6W1s4Niw3Myw3M10sMjU2XSw4NTUxOltbODYsNzMsNzMsNzNdLDI1Nl0sODU1MjpbWzczLDg4XSwyNTZdLDg1NTM6W1s4OF0sMjU2XSw4NTU0OltbODgsNzNdLDI1Nl0sODU1NTpbWzg4LDczLDczXSwyNTZdLDg1NTY6W1s3Nl0sMjU2XSw4NTU3OltbNjddLDI1Nl0sODU1ODpbWzY4XSwyNTZdLDg1NTk6W1s3N10sMjU2XSw4NTYwOltbMTA1XSwyNTZdLDg1NjE6W1sxMDUsMTA1XSwyNTZdLDg1NjI6W1sxMDUsMTA1LDEwNV0sMjU2XSw4NTYzOltbMTA1LDExOF0sMjU2XSw4NTY0OltbMTE4XSwyNTZdLDg1NjU6W1sxMTgsMTA1XSwyNTZdLDg1NjY6W1sxMTgsMTA1LDEwNV0sMjU2XSw4NTY3OltbMTE4LDEwNSwxMDUsMTA1XSwyNTZdLDg1Njg6W1sxMDUsMTIwXSwyNTZdLDg1Njk6W1sxMjBdLDI1Nl0sODU3MDpbWzEyMCwxMDVdLDI1Nl0sODU3MTpbWzEyMCwxMDUsMTA1XSwyNTZdLDg1NzI6W1sxMDhdLDI1Nl0sODU3MzpbWzk5XSwyNTZdLDg1NzQ6W1sxMDBdLDI1Nl0sODU3NTpbWzEwOV0sMjU2XSw4NTg1OltbNDgsODI2MCw1MV0sMjU2XSw4NTkyOlssLHs4MjQ6ODYwMn1dLDg1OTQ6WywsezgyNDo4NjAzfV0sODU5NjpbLCx7ODI0Ojg2MjJ9XSw4NjAyOltbODU5Miw4MjRdXSw4NjAzOltbODU5NCw4MjRdXSw4NjIyOltbODU5Niw4MjRdXSw4NjUzOltbODY1Niw4MjRdXSw4NjU0OltbODY2MCw4MjRdXSw4NjU1OltbODY1OCw4MjRdXSw4NjU2OlssLHs4MjQ6ODY1M31dLDg2NTg6WywsezgyNDo4NjU1fV0sODY2MDpbLCx7ODI0Ojg2NTR9XX0sXG44NzA0Ons4NzA3OlssLHs4MjQ6ODcwOH1dLDg3MDg6W1s4NzA3LDgyNF1dLDg3MTI6WywsezgyNDo4NzEzfV0sODcxMzpbWzg3MTIsODI0XV0sODcxNTpbLCx7ODI0Ojg3MTZ9XSw4NzE2OltbODcxNSw4MjRdXSw4NzM5OlssLHs4MjQ6ODc0MH1dLDg3NDA6W1s4NzM5LDgyNF1dLDg3NDE6WywsezgyNDo4NzQyfV0sODc0MjpbWzg3NDEsODI0XV0sODc0ODpbWzg3NDcsODc0N10sMjU2XSw4NzQ5OltbODc0Nyw4NzQ3LDg3NDddLDI1Nl0sODc1MTpbWzg3NTAsODc1MF0sMjU2XSw4NzUyOltbODc1MCw4NzUwLDg3NTBdLDI1Nl0sODc2NDpbLCx7ODI0Ojg3Njl9XSw4NzY5OltbODc2NCw4MjRdXSw4NzcxOlssLHs4MjQ6ODc3Mn1dLDg3NzI6W1s4NzcxLDgyNF1dLDg3NzM6WywsezgyNDo4Nzc1fV0sODc3NTpbWzg3NzMsODI0XV0sODc3NjpbLCx7ODI0Ojg3Nzd9XSw4Nzc3OltbODc3Niw4MjRdXSw4NzgxOlssLHs4MjQ6ODgxM31dLDg4MDA6W1s2MSw4MjRdXSw4ODAxOlssLHs4MjQ6ODgwMn1dLDg4MDI6W1s4ODAxLDgyNF1dLDg4MDQ6WywsezgyNDo4ODE2fV0sODgwNTpbLCx7ODI0Ojg4MTd9XSw4ODEzOltbODc4MSw4MjRdXSw4ODE0OltbNjAsODI0XV0sODgxNTpbWzYyLDgyNF1dLDg4MTY6W1s4ODA0LDgyNF1dLDg4MTc6W1s4ODA1LDgyNF1dLDg4MTg6WywsezgyNDo4ODIwfV0sODgxOTpbLCx7ODI0Ojg4MjF9XSw4ODIwOltbODgxOCw4MjRdXSw4ODIxOltbODgxOSw4MjRdXSw4ODIyOlssLHs4MjQ6ODgyNH1dLDg4MjM6WywsezgyNDo4ODI1fV0sODgyNDpbWzg4MjIsODI0XV0sODgyNTpbWzg4MjMsODI0XV0sODgyNjpbLCx7ODI0Ojg4MzJ9XSw4ODI3OlssLHs4MjQ6ODgzM31dLDg4Mjg6WywsezgyNDo4OTI4fV0sODgyOTpbLCx7ODI0Ojg5Mjl9XSw4ODMyOltbODgyNiw4MjRdXSw4ODMzOltbODgyNyw4MjRdXSw4ODM0OlssLHs4MjQ6ODgzNn1dLDg4MzU6WywsezgyNDo4ODM3fV0sODgzNjpbWzg4MzQsODI0XV0sODgzNzpbWzg4MzUsODI0XV0sODgzODpbLCx7ODI0Ojg4NDB9XSw4ODM5OlssLHs4MjQ6ODg0MX1dLDg4NDA6W1s4ODM4LDgyNF1dLDg4NDE6W1s4ODM5LDgyNF1dLDg4NDk6WywsezgyNDo4OTMwfV0sODg1MDpbLCx7ODI0Ojg5MzF9XSw4ODY2OlssLHs4MjQ6ODg3Nn1dLDg4NzI6WywsezgyNDo4ODc3fV0sODg3MzpbLCx7ODI0Ojg4Nzh9XSw4ODc1OlssLHs4MjQ6ODg3OX1dLDg4NzY6W1s4ODY2LDgyNF1dLDg4Nzc6W1s4ODcyLDgyNF1dLDg4Nzg6W1s4ODczLDgyNF1dLDg4Nzk6W1s4ODc1LDgyNF1dLDg4ODI6WywsezgyNDo4OTM4fV0sODg4MzpbLCx7ODI0Ojg5Mzl9XSw4ODg0OlssLHs4MjQ6ODk0MH1dLDg4ODU6WywsezgyNDo4OTQxfV0sODkyODpbWzg4MjgsODI0XV0sODkyOTpbWzg4MjksODI0XV0sODkzMDpbWzg4NDksODI0XV0sODkzMTpbWzg4NTAsODI0XV0sODkzODpbWzg4ODIsODI0XV0sODkzOTpbWzg4ODMsODI0XV0sODk0MDpbWzg4ODQsODI0XV0sODk0MTpbWzg4ODUsODI0XV19LFxuODk2MDp7OTAwMTpbWzEyMjk2XV0sOTAwMjpbWzEyMjk3XV19LFxuOTIxNjp7OTMxMjpbWzQ5XSwyNTZdLDkzMTM6W1s1MF0sMjU2XSw5MzE0OltbNTFdLDI1Nl0sOTMxNTpbWzUyXSwyNTZdLDkzMTY6W1s1M10sMjU2XSw5MzE3OltbNTRdLDI1Nl0sOTMxODpbWzU1XSwyNTZdLDkzMTk6W1s1Nl0sMjU2XSw5MzIwOltbNTddLDI1Nl0sOTMyMTpbWzQ5LDQ4XSwyNTZdLDkzMjI6W1s0OSw0OV0sMjU2XSw5MzIzOltbNDksNTBdLDI1Nl0sOTMyNDpbWzQ5LDUxXSwyNTZdLDkzMjU6W1s0OSw1Ml0sMjU2XSw5MzI2OltbNDksNTNdLDI1Nl0sOTMyNzpbWzQ5LDU0XSwyNTZdLDkzMjg6W1s0OSw1NV0sMjU2XSw5MzI5OltbNDksNTZdLDI1Nl0sOTMzMDpbWzQ5LDU3XSwyNTZdLDkzMzE6W1s1MCw0OF0sMjU2XSw5MzMyOltbNDAsNDksNDFdLDI1Nl0sOTMzMzpbWzQwLDUwLDQxXSwyNTZdLDkzMzQ6W1s0MCw1MSw0MV0sMjU2XSw5MzM1OltbNDAsNTIsNDFdLDI1Nl0sOTMzNjpbWzQwLDUzLDQxXSwyNTZdLDkzMzc6W1s0MCw1NCw0MV0sMjU2XSw5MzM4OltbNDAsNTUsNDFdLDI1Nl0sOTMzOTpbWzQwLDU2LDQxXSwyNTZdLDkzNDA6W1s0MCw1Nyw0MV0sMjU2XSw5MzQxOltbNDAsNDksNDgsNDFdLDI1Nl0sOTM0MjpbWzQwLDQ5LDQ5LDQxXSwyNTZdLDkzNDM6W1s0MCw0OSw1MCw0MV0sMjU2XSw5MzQ0OltbNDAsNDksNTEsNDFdLDI1Nl0sOTM0NTpbWzQwLDQ5LDUyLDQxXSwyNTZdLDkzNDY6W1s0MCw0OSw1Myw0MV0sMjU2XSw5MzQ3OltbNDAsNDksNTQsNDFdLDI1Nl0sOTM0ODpbWzQwLDQ5LDU1LDQxXSwyNTZdLDkzNDk6W1s0MCw0OSw1Niw0MV0sMjU2XSw5MzUwOltbNDAsNDksNTcsNDFdLDI1Nl0sOTM1MTpbWzQwLDUwLDQ4LDQxXSwyNTZdLDkzNTI6W1s0OSw0Nl0sMjU2XSw5MzUzOltbNTAsNDZdLDI1Nl0sOTM1NDpbWzUxLDQ2XSwyNTZdLDkzNTU6W1s1Miw0Nl0sMjU2XSw5MzU2OltbNTMsNDZdLDI1Nl0sOTM1NzpbWzU0LDQ2XSwyNTZdLDkzNTg6W1s1NSw0Nl0sMjU2XSw5MzU5OltbNTYsNDZdLDI1Nl0sOTM2MDpbWzU3LDQ2XSwyNTZdLDkzNjE6W1s0OSw0OCw0Nl0sMjU2XSw5MzYyOltbNDksNDksNDZdLDI1Nl0sOTM2MzpbWzQ5LDUwLDQ2XSwyNTZdLDkzNjQ6W1s0OSw1MSw0Nl0sMjU2XSw5MzY1OltbNDksNTIsNDZdLDI1Nl0sOTM2NjpbWzQ5LDUzLDQ2XSwyNTZdLDkzNjc6W1s0OSw1NCw0Nl0sMjU2XSw5MzY4OltbNDksNTUsNDZdLDI1Nl0sOTM2OTpbWzQ5LDU2LDQ2XSwyNTZdLDkzNzA6W1s0OSw1Nyw0Nl0sMjU2XSw5MzcxOltbNTAsNDgsNDZdLDI1Nl0sOTM3MjpbWzQwLDk3LDQxXSwyNTZdLDkzNzM6W1s0MCw5OCw0MV0sMjU2XSw5Mzc0OltbNDAsOTksNDFdLDI1Nl0sOTM3NTpbWzQwLDEwMCw0MV0sMjU2XSw5Mzc2OltbNDAsMTAxLDQxXSwyNTZdLDkzNzc6W1s0MCwxMDIsNDFdLDI1Nl0sOTM3ODpbWzQwLDEwMyw0MV0sMjU2XSw5Mzc5OltbNDAsMTA0LDQxXSwyNTZdLDkzODA6W1s0MCwxMDUsNDFdLDI1Nl0sOTM4MTpbWzQwLDEwNiw0MV0sMjU2XSw5MzgyOltbNDAsMTA3LDQxXSwyNTZdLDkzODM6W1s0MCwxMDgsNDFdLDI1Nl0sOTM4NDpbWzQwLDEwOSw0MV0sMjU2XSw5Mzg1OltbNDAsMTEwLDQxXSwyNTZdLDkzODY6W1s0MCwxMTEsNDFdLDI1Nl0sOTM4NzpbWzQwLDExMiw0MV0sMjU2XSw5Mzg4OltbNDAsMTEzLDQxXSwyNTZdLDkzODk6W1s0MCwxMTQsNDFdLDI1Nl0sOTM5MDpbWzQwLDExNSw0MV0sMjU2XSw5MzkxOltbNDAsMTE2LDQxXSwyNTZdLDkzOTI6W1s0MCwxMTcsNDFdLDI1Nl0sOTM5MzpbWzQwLDExOCw0MV0sMjU2XSw5Mzk0OltbNDAsMTE5LDQxXSwyNTZdLDkzOTU6W1s0MCwxMjAsNDFdLDI1Nl0sOTM5NjpbWzQwLDEyMSw0MV0sMjU2XSw5Mzk3OltbNDAsMTIyLDQxXSwyNTZdLDkzOTg6W1s2NV0sMjU2XSw5Mzk5OltbNjZdLDI1Nl0sOTQwMDpbWzY3XSwyNTZdLDk0MDE6W1s2OF0sMjU2XSw5NDAyOltbNjldLDI1Nl0sOTQwMzpbWzcwXSwyNTZdLDk0MDQ6W1s3MV0sMjU2XSw5NDA1OltbNzJdLDI1Nl0sOTQwNjpbWzczXSwyNTZdLDk0MDc6W1s3NF0sMjU2XSw5NDA4OltbNzVdLDI1Nl0sOTQwOTpbWzc2XSwyNTZdLDk0MTA6W1s3N10sMjU2XSw5NDExOltbNzhdLDI1Nl0sOTQxMjpbWzc5XSwyNTZdLDk0MTM6W1s4MF0sMjU2XSw5NDE0OltbODFdLDI1Nl0sOTQxNTpbWzgyXSwyNTZdLDk0MTY6W1s4M10sMjU2XSw5NDE3OltbODRdLDI1Nl0sOTQxODpbWzg1XSwyNTZdLDk0MTk6W1s4Nl0sMjU2XSw5NDIwOltbODddLDI1Nl0sOTQyMTpbWzg4XSwyNTZdLDk0MjI6W1s4OV0sMjU2XSw5NDIzOltbOTBdLDI1Nl0sOTQyNDpbWzk3XSwyNTZdLDk0MjU6W1s5OF0sMjU2XSw5NDI2OltbOTldLDI1Nl0sOTQyNzpbWzEwMF0sMjU2XSw5NDI4OltbMTAxXSwyNTZdLDk0Mjk6W1sxMDJdLDI1Nl0sOTQzMDpbWzEwM10sMjU2XSw5NDMxOltbMTA0XSwyNTZdLDk0MzI6W1sxMDVdLDI1Nl0sOTQzMzpbWzEwNl0sMjU2XSw5NDM0OltbMTA3XSwyNTZdLDk0MzU6W1sxMDhdLDI1Nl0sOTQzNjpbWzEwOV0sMjU2XSw5NDM3OltbMTEwXSwyNTZdLDk0Mzg6W1sxMTFdLDI1Nl0sOTQzOTpbWzExMl0sMjU2XSw5NDQwOltbMTEzXSwyNTZdLDk0NDE6W1sxMTRdLDI1Nl0sOTQ0MjpbWzExNV0sMjU2XSw5NDQzOltbMTE2XSwyNTZdLDk0NDQ6W1sxMTddLDI1Nl0sOTQ0NTpbWzExOF0sMjU2XSw5NDQ2OltbMTE5XSwyNTZdLDk0NDc6W1sxMjBdLDI1Nl0sOTQ0ODpbWzEyMV0sMjU2XSw5NDQ5OltbMTIyXSwyNTZdLDk0NTA6W1s0OF0sMjU2XX0sXG4xMDc1Mjp7MTA3NjQ6W1s4NzQ3LDg3NDcsODc0Nyw4NzQ3XSwyNTZdLDEwODY4OltbNTgsNTgsNjFdLDI1Nl0sMTA4Njk6W1s2MSw2MV0sMjU2XSwxMDg3MDpbWzYxLDYxLDYxXSwyNTZdLDEwOTcyOltbMTA5NzMsODI0XSw1MTJdfSxcbjExMjY0OnsxMTM4ODpbWzEwNl0sMjU2XSwxMTM4OTpbWzg2XSwyNTZdLDExNTAzOlssMjMwXSwxMTUwNDpbLDIzMF0sMTE1MDU6WywyMzBdfSxcbjExNTIwOnsxMTYzMTpbWzExNjE3XSwyNTZdLDExNjQ3OlssOV0sMTE3NDQ6WywyMzBdLDExNzQ1OlssMjMwXSwxMTc0NjpbLDIzMF0sMTE3NDc6WywyMzBdLDExNzQ4OlssMjMwXSwxMTc0OTpbLDIzMF0sMTE3NTA6WywyMzBdLDExNzUxOlssMjMwXSwxMTc1MjpbLDIzMF0sMTE3NTM6WywyMzBdLDExNzU0OlssMjMwXSwxMTc1NTpbLDIzMF0sMTE3NTY6WywyMzBdLDExNzU3OlssMjMwXSwxMTc1ODpbLDIzMF0sMTE3NTk6WywyMzBdLDExNzYwOlssMjMwXSwxMTc2MTpbLDIzMF0sMTE3NjI6WywyMzBdLDExNzYzOlssMjMwXSwxMTc2NDpbLDIzMF0sMTE3NjU6WywyMzBdLDExNzY2OlssMjMwXSwxMTc2NzpbLDIzMF0sMTE3Njg6WywyMzBdLDExNzY5OlssMjMwXSwxMTc3MDpbLDIzMF0sMTE3NzE6WywyMzBdLDExNzcyOlssMjMwXSwxMTc3MzpbLDIzMF0sMTE3NzQ6WywyMzBdLDExNzc1OlssMjMwXX0sXG4xMTc3Njp7MTE5MzU6W1syNzU5N10sMjU2XSwxMjAxOTpbWzQwODYzXSwyNTZdfSxcbjEyMDMyOnsxMjAzMjpbWzE5OTY4XSwyNTZdLDEyMDMzOltbMjAwMDhdLDI1Nl0sMTIwMzQ6W1syMDAyMl0sMjU2XSwxMjAzNTpbWzIwMDMxXSwyNTZdLDEyMDM2OltbMjAwNTddLDI1Nl0sMTIwMzc6W1syMDEwMV0sMjU2XSwxMjAzODpbWzIwMTA4XSwyNTZdLDEyMDM5OltbMjAxMjhdLDI1Nl0sMTIwNDA6W1syMDE1NF0sMjU2XSwxMjA0MTpbWzIwNzk5XSwyNTZdLDEyMDQyOltbMjA4MzddLDI1Nl0sMTIwNDM6W1syMDg0M10sMjU2XSwxMjA0NDpbWzIwODY2XSwyNTZdLDEyMDQ1OltbMjA4ODZdLDI1Nl0sMTIwNDY6W1syMDkwN10sMjU2XSwxMjA0NzpbWzIwOTYwXSwyNTZdLDEyMDQ4OltbMjA5ODFdLDI1Nl0sMTIwNDk6W1syMDk5Ml0sMjU2XSwxMjA1MDpbWzIxMTQ3XSwyNTZdLDEyMDUxOltbMjEyNDFdLDI1Nl0sMTIwNTI6W1syMTI2OV0sMjU2XSwxMjA1MzpbWzIxMjc0XSwyNTZdLDEyMDU0OltbMjEzMDRdLDI1Nl0sMTIwNTU6W1syMTMxM10sMjU2XSwxMjA1NjpbWzIxMzQwXSwyNTZdLDEyMDU3OltbMjEzNTNdLDI1Nl0sMTIwNTg6W1syMTM3OF0sMjU2XSwxMjA1OTpbWzIxNDMwXSwyNTZdLDEyMDYwOltbMjE0NDhdLDI1Nl0sMTIwNjE6W1syMTQ3NV0sMjU2XSwxMjA2MjpbWzIyMjMxXSwyNTZdLDEyMDYzOltbMjIzMDNdLDI1Nl0sMTIwNjQ6W1syMjc2M10sMjU2XSwxMjA2NTpbWzIyNzg2XSwyNTZdLDEyMDY2OltbMjI3OTRdLDI1Nl0sMTIwNjc6W1syMjgwNV0sMjU2XSwxMjA2ODpbWzIyODIzXSwyNTZdLDEyMDY5OltbMjI4OTldLDI1Nl0sMTIwNzA6W1syMzM3Nl0sMjU2XSwxMjA3MTpbWzIzNDI0XSwyNTZdLDEyMDcyOltbMjM1NDRdLDI1Nl0sMTIwNzM6W1syMzU2N10sMjU2XSwxMjA3NDpbWzIzNTg2XSwyNTZdLDEyMDc1OltbMjM2MDhdLDI1Nl0sMTIwNzY6W1syMzY2Ml0sMjU2XSwxMjA3NzpbWzIzNjY1XSwyNTZdLDEyMDc4OltbMjQwMjddLDI1Nl0sMTIwNzk6W1syNDAzN10sMjU2XSwxMjA4MDpbWzI0MDQ5XSwyNTZdLDEyMDgxOltbMjQwNjJdLDI1Nl0sMTIwODI6W1syNDE3OF0sMjU2XSwxMjA4MzpbWzI0MTg2XSwyNTZdLDEyMDg0OltbMjQxOTFdLDI1Nl0sMTIwODU6W1syNDMwOF0sMjU2XSwxMjA4NjpbWzI0MzE4XSwyNTZdLDEyMDg3OltbMjQzMzFdLDI1Nl0sMTIwODg6W1syNDMzOV0sMjU2XSwxMjA4OTpbWzI0NDAwXSwyNTZdLDEyMDkwOltbMjQ0MTddLDI1Nl0sMTIwOTE6W1syNDQzNV0sMjU2XSwxMjA5MjpbWzI0NTE1XSwyNTZdLDEyMDkzOltbMjUwOTZdLDI1Nl0sMTIwOTQ6W1syNTE0Ml0sMjU2XSwxMjA5NTpbWzI1MTYzXSwyNTZdLDEyMDk2OltbMjU5MDNdLDI1Nl0sMTIwOTc6W1syNTkwOF0sMjU2XSwxMjA5ODpbWzI1OTkxXSwyNTZdLDEyMDk5OltbMjYwMDddLDI1Nl0sMTIxMDA6W1syNjAyMF0sMjU2XSwxMjEwMTpbWzI2MDQxXSwyNTZdLDEyMTAyOltbMjYwODBdLDI1Nl0sMTIxMDM6W1syNjA4NV0sMjU2XSwxMjEwNDpbWzI2MzUyXSwyNTZdLDEyMTA1OltbMjYzNzZdLDI1Nl0sMTIxMDY6W1syNjQwOF0sMjU2XSwxMjEwNzpbWzI3NDI0XSwyNTZdLDEyMTA4OltbMjc0OTBdLDI1Nl0sMTIxMDk6W1syNzUxM10sMjU2XSwxMjExMDpbWzI3NTcxXSwyNTZdLDEyMTExOltbMjc1OTVdLDI1Nl0sMTIxMTI6W1syNzYwNF0sMjU2XSwxMjExMzpbWzI3NjExXSwyNTZdLDEyMTE0OltbMjc2NjNdLDI1Nl0sMTIxMTU6W1syNzY2OF0sMjU2XSwxMjExNjpbWzI3NzAwXSwyNTZdLDEyMTE3OltbMjg3NzldLDI1Nl0sMTIxMTg6W1syOTIyNl0sMjU2XSwxMjExOTpbWzI5MjM4XSwyNTZdLDEyMTIwOltbMjkyNDNdLDI1Nl0sMTIxMjE6W1syOTI0N10sMjU2XSwxMjEyMjpbWzI5MjU1XSwyNTZdLDEyMTIzOltbMjkyNzNdLDI1Nl0sMTIxMjQ6W1syOTI3NV0sMjU2XSwxMjEyNTpbWzI5MzU2XSwyNTZdLDEyMTI2OltbMjk1NzJdLDI1Nl0sMTIxMjc6W1syOTU3N10sMjU2XSwxMjEyODpbWzI5OTE2XSwyNTZdLDEyMTI5OltbMjk5MjZdLDI1Nl0sMTIxMzA6W1syOTk3Nl0sMjU2XSwxMjEzMTpbWzI5OTgzXSwyNTZdLDEyMTMyOltbMjk5OTJdLDI1Nl0sMTIxMzM6W1szMDAwMF0sMjU2XSwxMjEzNDpbWzMwMDkxXSwyNTZdLDEyMTM1OltbMzAwOThdLDI1Nl0sMTIxMzY6W1szMDMyNl0sMjU2XSwxMjEzNzpbWzMwMzMzXSwyNTZdLDEyMTM4OltbMzAzODJdLDI1Nl0sMTIxMzk6W1szMDM5OV0sMjU2XSwxMjE0MDpbWzMwNDQ2XSwyNTZdLDEyMTQxOltbMzA2ODNdLDI1Nl0sMTIxNDI6W1szMDY5MF0sMjU2XSwxMjE0MzpbWzMwNzA3XSwyNTZdLDEyMTQ0OltbMzEwMzRdLDI1Nl0sMTIxNDU6W1szMTE2MF0sMjU2XSwxMjE0NjpbWzMxMTY2XSwyNTZdLDEyMTQ3OltbMzEzNDhdLDI1Nl0sMTIxNDg6W1szMTQzNV0sMjU2XSwxMjE0OTpbWzMxNDgxXSwyNTZdLDEyMTUwOltbMzE4NTldLDI1Nl0sMTIxNTE6W1szMTk5Ml0sMjU2XSwxMjE1MjpbWzMyNTY2XSwyNTZdLDEyMTUzOltbMzI1OTNdLDI1Nl0sMTIxNTQ6W1szMjY1MF0sMjU2XSwxMjE1NTpbWzMyNzAxXSwyNTZdLDEyMTU2OltbMzI3NjldLDI1Nl0sMTIxNTc6W1szMjc4MF0sMjU2XSwxMjE1ODpbWzMyNzg2XSwyNTZdLDEyMTU5OltbMzI4MTldLDI1Nl0sMTIxNjA6W1szMjg5NV0sMjU2XSwxMjE2MTpbWzMyOTA1XSwyNTZdLDEyMTYyOltbMzMyNTFdLDI1Nl0sMTIxNjM6W1szMzI1OF0sMjU2XSwxMjE2NDpbWzMzMjY3XSwyNTZdLDEyMTY1OltbMzMyNzZdLDI1Nl0sMTIxNjY6W1szMzI5Ml0sMjU2XSwxMjE2NzpbWzMzMzA3XSwyNTZdLDEyMTY4OltbMzMzMTFdLDI1Nl0sMTIxNjk6W1szMzM5MF0sMjU2XSwxMjE3MDpbWzMzMzk0XSwyNTZdLDEyMTcxOltbMzM0MDBdLDI1Nl0sMTIxNzI6W1szNDM4MV0sMjU2XSwxMjE3MzpbWzM0NDExXSwyNTZdLDEyMTc0OltbMzQ4ODBdLDI1Nl0sMTIxNzU6W1szNDg5Ml0sMjU2XSwxMjE3NjpbWzM0OTE1XSwyNTZdLDEyMTc3OltbMzUxOThdLDI1Nl0sMTIxNzg6W1szNTIxMV0sMjU2XSwxMjE3OTpbWzM1MjgyXSwyNTZdLDEyMTgwOltbMzUzMjhdLDI1Nl0sMTIxODE6W1szNTg5NV0sMjU2XSwxMjE4MjpbWzM1OTEwXSwyNTZdLDEyMTgzOltbMzU5MjVdLDI1Nl0sMTIxODQ6W1szNTk2MF0sMjU2XSwxMjE4NTpbWzM1OTk3XSwyNTZdLDEyMTg2OltbMzYxOTZdLDI1Nl0sMTIxODc6W1szNjIwOF0sMjU2XSwxMjE4ODpbWzM2Mjc1XSwyNTZdLDEyMTg5OltbMzY1MjNdLDI1Nl0sMTIxOTA6W1szNjU1NF0sMjU2XSwxMjE5MTpbWzM2NzYzXSwyNTZdLDEyMTkyOltbMzY3ODRdLDI1Nl0sMTIxOTM6W1szNjc4OV0sMjU2XSwxMjE5NDpbWzM3MDA5XSwyNTZdLDEyMTk1OltbMzcxOTNdLDI1Nl0sMTIxOTY6W1szNzMxOF0sMjU2XSwxMjE5NzpbWzM3MzI0XSwyNTZdLDEyMTk4OltbMzczMjldLDI1Nl0sMTIxOTk6W1szODI2M10sMjU2XSwxMjIwMDpbWzM4MjcyXSwyNTZdLDEyMjAxOltbMzg0MjhdLDI1Nl0sMTIyMDI6W1szODU4Ml0sMjU2XSwxMjIwMzpbWzM4NTg1XSwyNTZdLDEyMjA0OltbMzg2MzJdLDI1Nl0sMTIyMDU6W1szODczN10sMjU2XSwxMjIwNjpbWzM4NzUwXSwyNTZdLDEyMjA3OltbMzg3NTRdLDI1Nl0sMTIyMDg6W1szODc2MV0sMjU2XSwxMjIwOTpbWzM4ODU5XSwyNTZdLDEyMjEwOltbMzg4OTNdLDI1Nl0sMTIyMTE6W1szODg5OV0sMjU2XSwxMjIxMjpbWzM4OTEzXSwyNTZdLDEyMjEzOltbMzkwODBdLDI1Nl0sMTIyMTQ6W1szOTEzMV0sMjU2XSwxMjIxNTpbWzM5MTM1XSwyNTZdLDEyMjE2OltbMzkzMThdLDI1Nl0sMTIyMTc6W1szOTMyMV0sMjU2XSwxMjIxODpbWzM5MzQwXSwyNTZdLDEyMjE5OltbMzk1OTJdLDI1Nl0sMTIyMjA6W1szOTY0MF0sMjU2XSwxMjIyMTpbWzM5NjQ3XSwyNTZdLDEyMjIyOltbMzk3MTddLDI1Nl0sMTIyMjM6W1szOTcyN10sMjU2XSwxMjIyNDpbWzM5NzMwXSwyNTZdLDEyMjI1OltbMzk3NDBdLDI1Nl0sMTIyMjY6W1szOTc3MF0sMjU2XSwxMjIyNzpbWzQwMTY1XSwyNTZdLDEyMjI4OltbNDA1NjVdLDI1Nl0sMTIyMjk6W1s0MDU3NV0sMjU2XSwxMjIzMDpbWzQwNjEzXSwyNTZdLDEyMjMxOltbNDA2MzVdLDI1Nl0sMTIyMzI6W1s0MDY0M10sMjU2XSwxMjIzMzpbWzQwNjUzXSwyNTZdLDEyMjM0OltbNDA2NTddLDI1Nl0sMTIyMzU6W1s0MDY5N10sMjU2XSwxMjIzNjpbWzQwNzAxXSwyNTZdLDEyMjM3OltbNDA3MThdLDI1Nl0sMTIyMzg6W1s0MDcyM10sMjU2XSwxMjIzOTpbWzQwNzM2XSwyNTZdLDEyMjQwOltbNDA3NjNdLDI1Nl0sMTIyNDE6W1s0MDc3OF0sMjU2XSwxMjI0MjpbWzQwNzg2XSwyNTZdLDEyMjQzOltbNDA4NDVdLDI1Nl0sMTIyNDQ6W1s0MDg2MF0sMjU2XSwxMjI0NTpbWzQwODY0XSwyNTZdfSxcbjEyMjg4OnsxMjI4ODpbWzMyXSwyNTZdLDEyMzMwOlssMjE4XSwxMjMzMTpbLDIyOF0sMTIzMzI6WywyMzJdLDEyMzMzOlssMjIyXSwxMjMzNDpbLDIyNF0sMTIzMzU6WywyMjRdLDEyMzQyOltbMTIzMDZdLDI1Nl0sMTIzNDQ6W1syMTMxM10sMjU2XSwxMjM0NTpbWzIxMzE2XSwyNTZdLDEyMzQ2OltbMjEzMTddLDI1Nl0sMTIzNTg6WywsezEyNDQxOjEyNDM2fV0sMTIzNjM6WywsezEyNDQxOjEyMzY0fV0sMTIzNjQ6W1sxMjM2MywxMjQ0MV1dLDEyMzY1OlssLHsxMjQ0MToxMjM2Nn1dLDEyMzY2OltbMTIzNjUsMTI0NDFdXSwxMjM2NzpbLCx7MTI0NDE6MTIzNjh9XSwxMjM2ODpbWzEyMzY3LDEyNDQxXV0sMTIzNjk6WywsezEyNDQxOjEyMzcwfV0sMTIzNzA6W1sxMjM2OSwxMjQ0MV1dLDEyMzcxOlssLHsxMjQ0MToxMjM3Mn1dLDEyMzcyOltbMTIzNzEsMTI0NDFdXSwxMjM3MzpbLCx7MTI0NDE6MTIzNzR9XSwxMjM3NDpbWzEyMzczLDEyNDQxXV0sMTIzNzU6WywsezEyNDQxOjEyMzc2fV0sMTIzNzY6W1sxMjM3NSwxMjQ0MV1dLDEyMzc3OlssLHsxMjQ0MToxMjM3OH1dLDEyMzc4OltbMTIzNzcsMTI0NDFdXSwxMjM3OTpbLCx7MTI0NDE6MTIzODB9XSwxMjM4MDpbWzEyMzc5LDEyNDQxXV0sMTIzODE6WywsezEyNDQxOjEyMzgyfV0sMTIzODI6W1sxMjM4MSwxMjQ0MV1dLDEyMzgzOlssLHsxMjQ0MToxMjM4NH1dLDEyMzg0OltbMTIzODMsMTI0NDFdXSwxMjM4NTpbLCx7MTI0NDE6MTIzODZ9XSwxMjM4NjpbWzEyMzg1LDEyNDQxXV0sMTIzODg6WywsezEyNDQxOjEyMzg5fV0sMTIzODk6W1sxMjM4OCwxMjQ0MV1dLDEyMzkwOlssLHsxMjQ0MToxMjM5MX1dLDEyMzkxOltbMTIzOTAsMTI0NDFdXSwxMjM5MjpbLCx7MTI0NDE6MTIzOTN9XSwxMjM5MzpbWzEyMzkyLDEyNDQxXV0sMTIzOTk6WywsezEyNDQxOjEyNDAwLDEyNDQyOjEyNDAxfV0sMTI0MDA6W1sxMjM5OSwxMjQ0MV1dLDEyNDAxOltbMTIzOTksMTI0NDJdXSwxMjQwMjpbLCx7MTI0NDE6MTI0MDMsMTI0NDI6MTI0MDR9XSwxMjQwMzpbWzEyNDAyLDEyNDQxXV0sMTI0MDQ6W1sxMjQwMiwxMjQ0Ml1dLDEyNDA1OlssLHsxMjQ0MToxMjQwNiwxMjQ0MjoxMjQwN31dLDEyNDA2OltbMTI0MDUsMTI0NDFdXSwxMjQwNzpbWzEyNDA1LDEyNDQyXV0sMTI0MDg6WywsezEyNDQxOjEyNDA5LDEyNDQyOjEyNDEwfV0sMTI0MDk6W1sxMjQwOCwxMjQ0MV1dLDEyNDEwOltbMTI0MDgsMTI0NDJdXSwxMjQxMTpbLCx7MTI0NDE6MTI0MTIsMTI0NDI6MTI0MTN9XSwxMjQxMjpbWzEyNDExLDEyNDQxXV0sMTI0MTM6W1sxMjQxMSwxMjQ0Ml1dLDEyNDM2OltbMTIzNTgsMTI0NDFdXSwxMjQ0MTpbLDhdLDEyNDQyOlssOF0sMTI0NDM6W1szMiwxMjQ0MV0sMjU2XSwxMjQ0NDpbWzMyLDEyNDQyXSwyNTZdLDEyNDQ1OlssLHsxMjQ0MToxMjQ0Nn1dLDEyNDQ2OltbMTI0NDUsMTI0NDFdXSwxMjQ0NzpbWzEyNDI0LDEyNDI2XSwyNTZdLDEyNDU0OlssLHsxMjQ0MToxMjUzMn1dLDEyNDU5OlssLHsxMjQ0MToxMjQ2MH1dLDEyNDYwOltbMTI0NTksMTI0NDFdXSwxMjQ2MTpbLCx7MTI0NDE6MTI0NjJ9XSwxMjQ2MjpbWzEyNDYxLDEyNDQxXV0sMTI0NjM6WywsezEyNDQxOjEyNDY0fV0sMTI0NjQ6W1sxMjQ2MywxMjQ0MV1dLDEyNDY1OlssLHsxMjQ0MToxMjQ2Nn1dLDEyNDY2OltbMTI0NjUsMTI0NDFdXSwxMjQ2NzpbLCx7MTI0NDE6MTI0Njh9XSwxMjQ2ODpbWzEyNDY3LDEyNDQxXV0sMTI0Njk6WywsezEyNDQxOjEyNDcwfV0sMTI0NzA6W1sxMjQ2OSwxMjQ0MV1dLDEyNDcxOlssLHsxMjQ0MToxMjQ3Mn1dLDEyNDcyOltbMTI0NzEsMTI0NDFdXSwxMjQ3MzpbLCx7MTI0NDE6MTI0NzR9XSwxMjQ3NDpbWzEyNDczLDEyNDQxXV0sMTI0NzU6WywsezEyNDQxOjEyNDc2fV0sMTI0NzY6W1sxMjQ3NSwxMjQ0MV1dLDEyNDc3OlssLHsxMjQ0MToxMjQ3OH1dLDEyNDc4OltbMTI0NzcsMTI0NDFdXSwxMjQ3OTpbLCx7MTI0NDE6MTI0ODB9XSwxMjQ4MDpbWzEyNDc5LDEyNDQxXV0sMTI0ODE6WywsezEyNDQxOjEyNDgyfV0sMTI0ODI6W1sxMjQ4MSwxMjQ0MV1dLDEyNDg0OlssLHsxMjQ0MToxMjQ4NX1dLDEyNDg1OltbMTI0ODQsMTI0NDFdXSwxMjQ4NjpbLCx7MTI0NDE6MTI0ODd9XSwxMjQ4NzpbWzEyNDg2LDEyNDQxXV0sMTI0ODg6WywsezEyNDQxOjEyNDg5fV0sMTI0ODk6W1sxMjQ4OCwxMjQ0MV1dLDEyNDk1OlssLHsxMjQ0MToxMjQ5NiwxMjQ0MjoxMjQ5N31dLDEyNDk2OltbMTI0OTUsMTI0NDFdXSwxMjQ5NzpbWzEyNDk1LDEyNDQyXV0sMTI0OTg6WywsezEyNDQxOjEyNDk5LDEyNDQyOjEyNTAwfV0sMTI0OTk6W1sxMjQ5OCwxMjQ0MV1dLDEyNTAwOltbMTI0OTgsMTI0NDJdXSwxMjUwMTpbLCx7MTI0NDE6MTI1MDIsMTI0NDI6MTI1MDN9XSwxMjUwMjpbWzEyNTAxLDEyNDQxXV0sMTI1MDM6W1sxMjUwMSwxMjQ0Ml1dLDEyNTA0OlssLHsxMjQ0MToxMjUwNSwxMjQ0MjoxMjUwNn1dLDEyNTA1OltbMTI1MDQsMTI0NDFdXSwxMjUwNjpbWzEyNTA0LDEyNDQyXV0sMTI1MDc6WywsezEyNDQxOjEyNTA4LDEyNDQyOjEyNTA5fV0sMTI1MDg6W1sxMjUwNywxMjQ0MV1dLDEyNTA5OltbMTI1MDcsMTI0NDJdXSwxMjUyNzpbLCx7MTI0NDE6MTI1MzV9XSwxMjUyODpbLCx7MTI0NDE6MTI1MzZ9XSwxMjUyOTpbLCx7MTI0NDE6MTI1Mzd9XSwxMjUzMDpbLCx7MTI0NDE6MTI1Mzh9XSwxMjUzMjpbWzEyNDU0LDEyNDQxXV0sMTI1MzU6W1sxMjUyNywxMjQ0MV1dLDEyNTM2OltbMTI1MjgsMTI0NDFdXSwxMjUzNzpbWzEyNTI5LDEyNDQxXV0sMTI1Mzg6W1sxMjUzMCwxMjQ0MV1dLDEyNTQxOlssLHsxMjQ0MToxMjU0Mn1dLDEyNTQyOltbMTI1NDEsMTI0NDFdXSwxMjU0MzpbWzEyNDY3LDEyNDg4XSwyNTZdfSxcbjEyNTQ0OnsxMjU5MzpbWzQzNTJdLDI1Nl0sMTI1OTQ6W1s0MzUzXSwyNTZdLDEyNTk1OltbNDUyMl0sMjU2XSwxMjU5NjpbWzQzNTRdLDI1Nl0sMTI1OTc6W1s0NTI0XSwyNTZdLDEyNTk4OltbNDUyNV0sMjU2XSwxMjU5OTpbWzQzNTVdLDI1Nl0sMTI2MDA6W1s0MzU2XSwyNTZdLDEyNjAxOltbNDM1N10sMjU2XSwxMjYwMjpbWzQ1MjhdLDI1Nl0sMTI2MDM6W1s0NTI5XSwyNTZdLDEyNjA0OltbNDUzMF0sMjU2XSwxMjYwNTpbWzQ1MzFdLDI1Nl0sMTI2MDY6W1s0NTMyXSwyNTZdLDEyNjA3OltbNDUzM10sMjU2XSwxMjYwODpbWzQzNzhdLDI1Nl0sMTI2MDk6W1s0MzU4XSwyNTZdLDEyNjEwOltbNDM1OV0sMjU2XSwxMjYxMTpbWzQzNjBdLDI1Nl0sMTI2MTI6W1s0Mzg1XSwyNTZdLDEyNjEzOltbNDM2MV0sMjU2XSwxMjYxNDpbWzQzNjJdLDI1Nl0sMTI2MTU6W1s0MzYzXSwyNTZdLDEyNjE2OltbNDM2NF0sMjU2XSwxMjYxNzpbWzQzNjVdLDI1Nl0sMTI2MTg6W1s0MzY2XSwyNTZdLDEyNjE5OltbNDM2N10sMjU2XSwxMjYyMDpbWzQzNjhdLDI1Nl0sMTI2MjE6W1s0MzY5XSwyNTZdLDEyNjIyOltbNDM3MF0sMjU2XSwxMjYyMzpbWzQ0NDldLDI1Nl0sMTI2MjQ6W1s0NDUwXSwyNTZdLDEyNjI1OltbNDQ1MV0sMjU2XSwxMjYyNjpbWzQ0NTJdLDI1Nl0sMTI2Mjc6W1s0NDUzXSwyNTZdLDEyNjI4OltbNDQ1NF0sMjU2XSwxMjYyOTpbWzQ0NTVdLDI1Nl0sMTI2MzA6W1s0NDU2XSwyNTZdLDEyNjMxOltbNDQ1N10sMjU2XSwxMjYzMjpbWzQ0NThdLDI1Nl0sMTI2MzM6W1s0NDU5XSwyNTZdLDEyNjM0OltbNDQ2MF0sMjU2XSwxMjYzNTpbWzQ0NjFdLDI1Nl0sMTI2MzY6W1s0NDYyXSwyNTZdLDEyNjM3OltbNDQ2M10sMjU2XSwxMjYzODpbWzQ0NjRdLDI1Nl0sMTI2Mzk6W1s0NDY1XSwyNTZdLDEyNjQwOltbNDQ2Nl0sMjU2XSwxMjY0MTpbWzQ0NjddLDI1Nl0sMTI2NDI6W1s0NDY4XSwyNTZdLDEyNjQzOltbNDQ2OV0sMjU2XSwxMjY0NDpbWzQ0NDhdLDI1Nl0sMTI2NDU6W1s0MzcyXSwyNTZdLDEyNjQ2OltbNDM3M10sMjU2XSwxMjY0NzpbWzQ1NTFdLDI1Nl0sMTI2NDg6W1s0NTUyXSwyNTZdLDEyNjQ5OltbNDU1Nl0sMjU2XSwxMjY1MDpbWzQ1NThdLDI1Nl0sMTI2NTE6W1s0NTYzXSwyNTZdLDEyNjUyOltbNDU2N10sMjU2XSwxMjY1MzpbWzQ1NjldLDI1Nl0sMTI2NTQ6W1s0MzgwXSwyNTZdLDEyNjU1OltbNDU3M10sMjU2XSwxMjY1NjpbWzQ1NzVdLDI1Nl0sMTI2NTc6W1s0MzgxXSwyNTZdLDEyNjU4OltbNDM4Ml0sMjU2XSwxMjY1OTpbWzQzODRdLDI1Nl0sMTI2NjA6W1s0Mzg2XSwyNTZdLDEyNjYxOltbNDM4N10sMjU2XSwxMjY2MjpbWzQzOTFdLDI1Nl0sMTI2NjM6W1s0MzkzXSwyNTZdLDEyNjY0OltbNDM5NV0sMjU2XSwxMjY2NTpbWzQzOTZdLDI1Nl0sMTI2NjY6W1s0Mzk3XSwyNTZdLDEyNjY3OltbNDM5OF0sMjU2XSwxMjY2ODpbWzQzOTldLDI1Nl0sMTI2Njk6W1s0NDAyXSwyNTZdLDEyNjcwOltbNDQwNl0sMjU2XSwxMjY3MTpbWzQ0MTZdLDI1Nl0sMTI2NzI6W1s0NDIzXSwyNTZdLDEyNjczOltbNDQyOF0sMjU2XSwxMjY3NDpbWzQ1OTNdLDI1Nl0sMTI2NzU6W1s0NTk0XSwyNTZdLDEyNjc2OltbNDQzOV0sMjU2XSwxMjY3NzpbWzQ0NDBdLDI1Nl0sMTI2Nzg6W1s0NDQxXSwyNTZdLDEyNjc5OltbNDQ4NF0sMjU2XSwxMjY4MDpbWzQ0ODVdLDI1Nl0sMTI2ODE6W1s0NDg4XSwyNTZdLDEyNjgyOltbNDQ5N10sMjU2XSwxMjY4MzpbWzQ0OThdLDI1Nl0sMTI2ODQ6W1s0NTAwXSwyNTZdLDEyNjg1OltbNDUxMF0sMjU2XSwxMjY4NjpbWzQ1MTNdLDI1Nl0sMTI2OTA6W1sxOTk2OF0sMjU2XSwxMjY5MTpbWzIwMTA4XSwyNTZdLDEyNjkyOltbMTk5NzddLDI1Nl0sMTI2OTM6W1syMjIzNV0sMjU2XSwxMjY5NDpbWzE5OTc4XSwyNTZdLDEyNjk1OltbMjAwMTNdLDI1Nl0sMTI2OTY6W1sxOTk3OV0sMjU2XSwxMjY5NzpbWzMwMDAyXSwyNTZdLDEyNjk4OltbMjAwNTddLDI1Nl0sMTI2OTk6W1sxOTk5M10sMjU2XSwxMjcwMDpbWzE5OTY5XSwyNTZdLDEyNzAxOltbMjI4MjVdLDI1Nl0sMTI3MDI6W1syMjMyMF0sMjU2XSwxMjcwMzpbWzIwMTU0XSwyNTZdfSxcbjEyODAwOnsxMjgwMDpbWzQwLDQzNTIsNDFdLDI1Nl0sMTI4MDE6W1s0MCw0MzU0LDQxXSwyNTZdLDEyODAyOltbNDAsNDM1NSw0MV0sMjU2XSwxMjgwMzpbWzQwLDQzNTcsNDFdLDI1Nl0sMTI4MDQ6W1s0MCw0MzU4LDQxXSwyNTZdLDEyODA1OltbNDAsNDM1OSw0MV0sMjU2XSwxMjgwNjpbWzQwLDQzNjEsNDFdLDI1Nl0sMTI4MDc6W1s0MCw0MzYzLDQxXSwyNTZdLDEyODA4OltbNDAsNDM2NCw0MV0sMjU2XSwxMjgwOTpbWzQwLDQzNjYsNDFdLDI1Nl0sMTI4MTA6W1s0MCw0MzY3LDQxXSwyNTZdLDEyODExOltbNDAsNDM2OCw0MV0sMjU2XSwxMjgxMjpbWzQwLDQzNjksNDFdLDI1Nl0sMTI4MTM6W1s0MCw0MzcwLDQxXSwyNTZdLDEyODE0OltbNDAsNDM1Miw0NDQ5LDQxXSwyNTZdLDEyODE1OltbNDAsNDM1NCw0NDQ5LDQxXSwyNTZdLDEyODE2OltbNDAsNDM1NSw0NDQ5LDQxXSwyNTZdLDEyODE3OltbNDAsNDM1Nyw0NDQ5LDQxXSwyNTZdLDEyODE4OltbNDAsNDM1OCw0NDQ5LDQxXSwyNTZdLDEyODE5OltbNDAsNDM1OSw0NDQ5LDQxXSwyNTZdLDEyODIwOltbNDAsNDM2MSw0NDQ5LDQxXSwyNTZdLDEyODIxOltbNDAsNDM2Myw0NDQ5LDQxXSwyNTZdLDEyODIyOltbNDAsNDM2NCw0NDQ5LDQxXSwyNTZdLDEyODIzOltbNDAsNDM2Niw0NDQ5LDQxXSwyNTZdLDEyODI0OltbNDAsNDM2Nyw0NDQ5LDQxXSwyNTZdLDEyODI1OltbNDAsNDM2OCw0NDQ5LDQxXSwyNTZdLDEyODI2OltbNDAsNDM2OSw0NDQ5LDQxXSwyNTZdLDEyODI3OltbNDAsNDM3MCw0NDQ5LDQxXSwyNTZdLDEyODI4OltbNDAsNDM2NCw0NDYyLDQxXSwyNTZdLDEyODI5OltbNDAsNDM2Myw0NDU3LDQzNjQsNDQ1Myw0NTIzLDQxXSwyNTZdLDEyODMwOltbNDAsNDM2Myw0NDU3LDQzNzAsNDQ2Miw0MV0sMjU2XSwxMjgzMjpbWzQwLDE5OTY4LDQxXSwyNTZdLDEyODMzOltbNDAsMjAxMDgsNDFdLDI1Nl0sMTI4MzQ6W1s0MCwxOTk3Nyw0MV0sMjU2XSwxMjgzNTpbWzQwLDIyMjM1LDQxXSwyNTZdLDEyODM2OltbNDAsMjAxMTYsNDFdLDI1Nl0sMTI4Mzc6W1s0MCwyMDg0NSw0MV0sMjU2XSwxMjgzODpbWzQwLDE5OTcxLDQxXSwyNTZdLDEyODM5OltbNDAsMjA4NDMsNDFdLDI1Nl0sMTI4NDA6W1s0MCwyMDA2MSw0MV0sMjU2XSwxMjg0MTpbWzQwLDIxMzEzLDQxXSwyNTZdLDEyODQyOltbNDAsMjYzNzYsNDFdLDI1Nl0sMTI4NDM6W1s0MCwyODc3OSw0MV0sMjU2XSwxMjg0NDpbWzQwLDI3NzAwLDQxXSwyNTZdLDEyODQ1OltbNDAsMjY0MDgsNDFdLDI1Nl0sMTI4NDY6W1s0MCwzNzMyOSw0MV0sMjU2XSwxMjg0NzpbWzQwLDIyMzAzLDQxXSwyNTZdLDEyODQ4OltbNDAsMjYwODUsNDFdLDI1Nl0sMTI4NDk6W1s0MCwyNjY2Niw0MV0sMjU2XSwxMjg1MDpbWzQwLDI2Mzc3LDQxXSwyNTZdLDEyODUxOltbNDAsMzEwMzgsNDFdLDI1Nl0sMTI4NTI6W1s0MCwyMTUxNyw0MV0sMjU2XSwxMjg1MzpbWzQwLDI5MzA1LDQxXSwyNTZdLDEyODU0OltbNDAsMzYwMDEsNDFdLDI1Nl0sMTI4NTU6W1s0MCwzMTA2OSw0MV0sMjU2XSwxMjg1NjpbWzQwLDIxMTcyLDQxXSwyNTZdLDEyODU3OltbNDAsMjAxOTUsNDFdLDI1Nl0sMTI4NTg6W1s0MCwyMTYyOCw0MV0sMjU2XSwxMjg1OTpbWzQwLDIzMzk4LDQxXSwyNTZdLDEyODYwOltbNDAsMzA0MzUsNDFdLDI1Nl0sMTI4NjE6W1s0MCwyMDIyNSw0MV0sMjU2XSwxMjg2MjpbWzQwLDM2MDM5LDQxXSwyNTZdLDEyODYzOltbNDAsMjEzMzIsNDFdLDI1Nl0sMTI4NjQ6W1s0MCwzMTA4NSw0MV0sMjU2XSwxMjg2NTpbWzQwLDIwMjQxLDQxXSwyNTZdLDEyODY2OltbNDAsMzMyNTgsNDFdLDI1Nl0sMTI4Njc6W1s0MCwzMzI2Nyw0MV0sMjU2XSwxMjg2ODpbWzIxODM5XSwyNTZdLDEyODY5OltbMjQxODhdLDI1Nl0sMTI4NzA6W1syNTk5MV0sMjU2XSwxMjg3MTpbWzMxNjMxXSwyNTZdLDEyODgwOltbODAsODQsNjldLDI1Nl0sMTI4ODE6W1s1MCw0OV0sMjU2XSwxMjg4MjpbWzUwLDUwXSwyNTZdLDEyODgzOltbNTAsNTFdLDI1Nl0sMTI4ODQ6W1s1MCw1Ml0sMjU2XSwxMjg4NTpbWzUwLDUzXSwyNTZdLDEyODg2OltbNTAsNTRdLDI1Nl0sMTI4ODc6W1s1MCw1NV0sMjU2XSwxMjg4ODpbWzUwLDU2XSwyNTZdLDEyODg5OltbNTAsNTddLDI1Nl0sMTI4OTA6W1s1MSw0OF0sMjU2XSwxMjg5MTpbWzUxLDQ5XSwyNTZdLDEyODkyOltbNTEsNTBdLDI1Nl0sMTI4OTM6W1s1MSw1MV0sMjU2XSwxMjg5NDpbWzUxLDUyXSwyNTZdLDEyODk1OltbNTEsNTNdLDI1Nl0sMTI4OTY6W1s0MzUyXSwyNTZdLDEyODk3OltbNDM1NF0sMjU2XSwxMjg5ODpbWzQzNTVdLDI1Nl0sMTI4OTk6W1s0MzU3XSwyNTZdLDEyOTAwOltbNDM1OF0sMjU2XSwxMjkwMTpbWzQzNTldLDI1Nl0sMTI5MDI6W1s0MzYxXSwyNTZdLDEyOTAzOltbNDM2M10sMjU2XSwxMjkwNDpbWzQzNjRdLDI1Nl0sMTI5MDU6W1s0MzY2XSwyNTZdLDEyOTA2OltbNDM2N10sMjU2XSwxMjkwNzpbWzQzNjhdLDI1Nl0sMTI5MDg6W1s0MzY5XSwyNTZdLDEyOTA5OltbNDM3MF0sMjU2XSwxMjkxMDpbWzQzNTIsNDQ0OV0sMjU2XSwxMjkxMTpbWzQzNTQsNDQ0OV0sMjU2XSwxMjkxMjpbWzQzNTUsNDQ0OV0sMjU2XSwxMjkxMzpbWzQzNTcsNDQ0OV0sMjU2XSwxMjkxNDpbWzQzNTgsNDQ0OV0sMjU2XSwxMjkxNTpbWzQzNTksNDQ0OV0sMjU2XSwxMjkxNjpbWzQzNjEsNDQ0OV0sMjU2XSwxMjkxNzpbWzQzNjMsNDQ0OV0sMjU2XSwxMjkxODpbWzQzNjQsNDQ0OV0sMjU2XSwxMjkxOTpbWzQzNjYsNDQ0OV0sMjU2XSwxMjkyMDpbWzQzNjcsNDQ0OV0sMjU2XSwxMjkyMTpbWzQzNjgsNDQ0OV0sMjU2XSwxMjkyMjpbWzQzNjksNDQ0OV0sMjU2XSwxMjkyMzpbWzQzNzAsNDQ0OV0sMjU2XSwxMjkyNDpbWzQzNjYsNDQ0OSw0NTM1LDQzNTIsNDQ1N10sMjU2XSwxMjkyNTpbWzQzNjQsNDQ2Miw0MzYzLDQ0NjhdLDI1Nl0sMTI5MjY6W1s0MzYzLDQ0NjJdLDI1Nl0sMTI5Mjg6W1sxOTk2OF0sMjU2XSwxMjkyOTpbWzIwMTA4XSwyNTZdLDEyOTMwOltbMTk5NzddLDI1Nl0sMTI5MzE6W1syMjIzNV0sMjU2XSwxMjkzMjpbWzIwMTE2XSwyNTZdLDEyOTMzOltbMjA4NDVdLDI1Nl0sMTI5MzQ6W1sxOTk3MV0sMjU2XSwxMjkzNTpbWzIwODQzXSwyNTZdLDEyOTM2OltbMjAwNjFdLDI1Nl0sMTI5Mzc6W1syMTMxM10sMjU2XSwxMjkzODpbWzI2Mzc2XSwyNTZdLDEyOTM5OltbMjg3NzldLDI1Nl0sMTI5NDA6W1syNzcwMF0sMjU2XSwxMjk0MTpbWzI2NDA4XSwyNTZdLDEyOTQyOltbMzczMjldLDI1Nl0sMTI5NDM6W1syMjMwM10sMjU2XSwxMjk0NDpbWzI2MDg1XSwyNTZdLDEyOTQ1OltbMjY2NjZdLDI1Nl0sMTI5NDY6W1syNjM3N10sMjU2XSwxMjk0NzpbWzMxMDM4XSwyNTZdLDEyOTQ4OltbMjE1MTddLDI1Nl0sMTI5NDk6W1syOTMwNV0sMjU2XSwxMjk1MDpbWzM2MDAxXSwyNTZdLDEyOTUxOltbMzEwNjldLDI1Nl0sMTI5NTI6W1syMTE3Ml0sMjU2XSwxMjk1MzpbWzMxMTkyXSwyNTZdLDEyOTU0OltbMzAwMDddLDI1Nl0sMTI5NTU6W1syMjg5OV0sMjU2XSwxMjk1NjpbWzM2OTY5XSwyNTZdLDEyOTU3OltbMjA3NzhdLDI1Nl0sMTI5NTg6W1syMTM2MF0sMjU2XSwxMjk1OTpbWzI3ODgwXSwyNTZdLDEyOTYwOltbMzg5MTddLDI1Nl0sMTI5NjE6W1syMDI0MV0sMjU2XSwxMjk2MjpbWzIwODg5XSwyNTZdLDEyOTYzOltbMjc0OTFdLDI1Nl0sMTI5NjQ6W1sxOTk3OF0sMjU2XSwxMjk2NTpbWzIwMDEzXSwyNTZdLDEyOTY2OltbMTk5NzldLDI1Nl0sMTI5Njc6W1syNDAzOF0sMjU2XSwxMjk2ODpbWzIxNDkxXSwyNTZdLDEyOTY5OltbMjEzMDddLDI1Nl0sMTI5NzA6W1syMzQ0N10sMjU2XSwxMjk3MTpbWzIzMzk4XSwyNTZdLDEyOTcyOltbMzA0MzVdLDI1Nl0sMTI5NzM6W1syMDIyNV0sMjU2XSwxMjk3NDpbWzM2MDM5XSwyNTZdLDEyOTc1OltbMjEzMzJdLDI1Nl0sMTI5NzY6W1syMjgxMl0sMjU2XSwxMjk3NzpbWzUxLDU0XSwyNTZdLDEyOTc4OltbNTEsNTVdLDI1Nl0sMTI5Nzk6W1s1MSw1Nl0sMjU2XSwxMjk4MDpbWzUxLDU3XSwyNTZdLDEyOTgxOltbNTIsNDhdLDI1Nl0sMTI5ODI6W1s1Miw0OV0sMjU2XSwxMjk4MzpbWzUyLDUwXSwyNTZdLDEyOTg0OltbNTIsNTFdLDI1Nl0sMTI5ODU6W1s1Miw1Ml0sMjU2XSwxMjk4NjpbWzUyLDUzXSwyNTZdLDEyOTg3OltbNTIsNTRdLDI1Nl0sMTI5ODg6W1s1Miw1NV0sMjU2XSwxMjk4OTpbWzUyLDU2XSwyNTZdLDEyOTkwOltbNTIsNTddLDI1Nl0sMTI5OTE6W1s1Myw0OF0sMjU2XSwxMjk5MjpbWzQ5LDI2Mzc2XSwyNTZdLDEyOTkzOltbNTAsMjYzNzZdLDI1Nl0sMTI5OTQ6W1s1MSwyNjM3Nl0sMjU2XSwxMjk5NTpbWzUyLDI2Mzc2XSwyNTZdLDEyOTk2OltbNTMsMjYzNzZdLDI1Nl0sMTI5OTc6W1s1NCwyNjM3Nl0sMjU2XSwxMjk5ODpbWzU1LDI2Mzc2XSwyNTZdLDEyOTk5OltbNTYsMjYzNzZdLDI1Nl0sMTMwMDA6W1s1NywyNjM3Nl0sMjU2XSwxMzAwMTpbWzQ5LDQ4LDI2Mzc2XSwyNTZdLDEzMDAyOltbNDksNDksMjYzNzZdLDI1Nl0sMTMwMDM6W1s0OSw1MCwyNjM3Nl0sMjU2XSwxMzAwNDpbWzcyLDEwM10sMjU2XSwxMzAwNTpbWzEwMSwxMTQsMTAzXSwyNTZdLDEzMDA2OltbMTAxLDg2XSwyNTZdLDEzMDA3OltbNzYsODQsNjhdLDI1Nl0sMTMwMDg6W1sxMjQ1MF0sMjU2XSwxMzAwOTpbWzEyNDUyXSwyNTZdLDEzMDEwOltbMTI0NTRdLDI1Nl0sMTMwMTE6W1sxMjQ1Nl0sMjU2XSwxMzAxMjpbWzEyNDU4XSwyNTZdLDEzMDEzOltbMTI0NTldLDI1Nl0sMTMwMTQ6W1sxMjQ2MV0sMjU2XSwxMzAxNTpbWzEyNDYzXSwyNTZdLDEzMDE2OltbMTI0NjVdLDI1Nl0sMTMwMTc6W1sxMjQ2N10sMjU2XSwxMzAxODpbWzEyNDY5XSwyNTZdLDEzMDE5OltbMTI0NzFdLDI1Nl0sMTMwMjA6W1sxMjQ3M10sMjU2XSwxMzAyMTpbWzEyNDc1XSwyNTZdLDEzMDIyOltbMTI0NzddLDI1Nl0sMTMwMjM6W1sxMjQ3OV0sMjU2XSwxMzAyNDpbWzEyNDgxXSwyNTZdLDEzMDI1OltbMTI0ODRdLDI1Nl0sMTMwMjY6W1sxMjQ4Nl0sMjU2XSwxMzAyNzpbWzEyNDg4XSwyNTZdLDEzMDI4OltbMTI0OTBdLDI1Nl0sMTMwMjk6W1sxMjQ5MV0sMjU2XSwxMzAzMDpbWzEyNDkyXSwyNTZdLDEzMDMxOltbMTI0OTNdLDI1Nl0sMTMwMzI6W1sxMjQ5NF0sMjU2XSwxMzAzMzpbWzEyNDk1XSwyNTZdLDEzMDM0OltbMTI0OThdLDI1Nl0sMTMwMzU6W1sxMjUwMV0sMjU2XSwxMzAzNjpbWzEyNTA0XSwyNTZdLDEzMDM3OltbMTI1MDddLDI1Nl0sMTMwMzg6W1sxMjUxMF0sMjU2XSwxMzAzOTpbWzEyNTExXSwyNTZdLDEzMDQwOltbMTI1MTJdLDI1Nl0sMTMwNDE6W1sxMjUxM10sMjU2XSwxMzA0MjpbWzEyNTE0XSwyNTZdLDEzMDQzOltbMTI1MTZdLDI1Nl0sMTMwNDQ6W1sxMjUxOF0sMjU2XSwxMzA0NTpbWzEyNTIwXSwyNTZdLDEzMDQ2OltbMTI1MjFdLDI1Nl0sMTMwNDc6W1sxMjUyMl0sMjU2XSwxMzA0ODpbWzEyNTIzXSwyNTZdLDEzMDQ5OltbMTI1MjRdLDI1Nl0sMTMwNTA6W1sxMjUyNV0sMjU2XSwxMzA1MTpbWzEyNTI3XSwyNTZdLDEzMDUyOltbMTI1MjhdLDI1Nl0sMTMwNTM6W1sxMjUyOV0sMjU2XSwxMzA1NDpbWzEyNTMwXSwyNTZdfSxcbjEzMDU2OnsxMzA1NjpbWzEyNDUwLDEyNDk3LDEyNTQwLDEyNDg4XSwyNTZdLDEzMDU3OltbMTI0NTAsMTI1MjMsMTI1MDEsMTI0NDldLDI1Nl0sMTMwNTg6W1sxMjQ1MCwxMjUzMSwxMjUwNiwxMjQ1MF0sMjU2XSwxMzA1OTpbWzEyNDUwLDEyNTQwLDEyNTIzXSwyNTZdLDEzMDYwOltbMTI0NTIsMTI0OTEsMTI1MzEsMTI0NjRdLDI1Nl0sMTMwNjE6W1sxMjQ1MiwxMjUzMSwxMjQ4MV0sMjU2XSwxMzA2MjpbWzEyNDU0LDEyNDU3LDEyNTMxXSwyNTZdLDEzMDYzOltbMTI0NTYsMTI0NzMsMTI0NjMsMTI1NDAsMTI0ODldLDI1Nl0sMTMwNjQ6W1sxMjQ1NiwxMjU0MCwxMjQ1OSwxMjU0MF0sMjU2XSwxMzA2NTpbWzEyNDU4LDEyNTMxLDEyNDczXSwyNTZdLDEzMDY2OltbMTI0NTgsMTI1NDAsMTI1MTJdLDI1Nl0sMTMwNjc6W1sxMjQ1OSwxMjQ1MiwxMjUyMl0sMjU2XSwxMzA2ODpbWzEyNDU5LDEyNTIxLDEyNDgzLDEyNDg4XSwyNTZdLDEzMDY5OltbMTI0NTksMTI1MjUsMTI1MjIsMTI1NDBdLDI1Nl0sMTMwNzA6W1sxMjQ2MCwxMjUyNSwxMjUzMV0sMjU2XSwxMzA3MTpbWzEyNDYwLDEyNTMxLDEyNTEwXSwyNTZdLDEzMDcyOltbMTI0NjIsMTI0NjBdLDI1Nl0sMTMwNzM6W1sxMjQ2MiwxMjQ5MSwxMjU0MF0sMjU2XSwxMzA3NDpbWzEyNDYxLDEyNTE3LDEyNTIyLDEyNTQwXSwyNTZdLDEzMDc1OltbMTI0NjIsMTI1MjMsMTI0ODAsMTI1NDBdLDI1Nl0sMTMwNzY6W1sxMjQ2MSwxMjUyNV0sMjU2XSwxMzA3NzpbWzEyNDYxLDEyNTI1LDEyNDY0LDEyNTIxLDEyNTEyXSwyNTZdLDEzMDc4OltbMTI0NjEsMTI1MjUsMTI1MTMsMTI1NDAsMTI0ODgsMTI1MjNdLDI1Nl0sMTMwNzk6W1sxMjQ2MSwxMjUyNSwxMjUyNywxMjQ4MywxMjQ4OF0sMjU2XSwxMzA4MDpbWzEyNDY0LDEyNTIxLDEyNTEyXSwyNTZdLDEzMDgxOltbMTI0NjQsMTI1MjEsMTI1MTIsMTI0ODgsMTI1MzFdLDI1Nl0sMTMwODI6W1sxMjQ2MywxMjUyMywxMjQ3NiwxMjQ1MiwxMjUyNV0sMjU2XSwxMzA4MzpbWzEyNDYzLDEyNTI1LDEyNTQwLDEyNDkzXSwyNTZdLDEzMDg0OltbMTI0NjUsMTI1NDAsMTI0NzNdLDI1Nl0sMTMwODU6W1sxMjQ2NywxMjUyMywxMjQ5MF0sMjU2XSwxMzA4NjpbWzEyNDY3LDEyNTQwLDEyNTA5XSwyNTZdLDEzMDg3OltbMTI0NjksMTI0NTIsMTI0NjMsMTI1MjNdLDI1Nl0sMTMwODg6W1sxMjQ2OSwxMjUzMSwxMjQ4MSwxMjU0MCwxMjUxMl0sMjU2XSwxMzA4OTpbWzEyNDcxLDEyNTIyLDEyNTMxLDEyNDY0XSwyNTZdLDEzMDkwOltbMTI0NzUsMTI1MzEsMTI0ODFdLDI1Nl0sMTMwOTE6W1sxMjQ3NSwxMjUzMSwxMjQ4OF0sMjU2XSwxMzA5MjpbWzEyNDgwLDEyNTQwLDEyNDczXSwyNTZdLDEzMDkzOltbMTI0ODcsMTI0NzFdLDI1Nl0sMTMwOTQ6W1sxMjQ4OSwxMjUyM10sMjU2XSwxMzA5NTpbWzEyNDg4LDEyNTMxXSwyNTZdLDEzMDk2OltbMTI0OTAsMTI0OTRdLDI1Nl0sMTMwOTc6W1sxMjQ5NCwxMjQ4MywxMjQ4OF0sMjU2XSwxMzA5ODpbWzEyNDk1LDEyNDUyLDEyNDg0XSwyNTZdLDEzMDk5OltbMTI0OTcsMTI1NDAsMTI0NzUsMTI1MzEsMTI0ODhdLDI1Nl0sMTMxMDA6W1sxMjQ5NywxMjU0MCwxMjQ4NF0sMjU2XSwxMzEwMTpbWzEyNDk2LDEyNTQwLDEyNTI0LDEyNTIzXSwyNTZdLDEzMTAyOltbMTI1MDAsMTI0NTAsMTI0NzMsMTI0ODgsMTI1MjNdLDI1Nl0sMTMxMDM6W1sxMjUwMCwxMjQ2MywxMjUyM10sMjU2XSwxMzEwNDpbWzEyNTAwLDEyNDY3XSwyNTZdLDEzMTA1OltbMTI0OTksMTI1MjNdLDI1Nl0sMTMxMDY6W1sxMjUwMSwxMjQ0OSwxMjUyMSwxMjQ4MywxMjQ4OV0sMjU2XSwxMzEwNzpbWzEyNTAxLDEyNDUxLDEyNTQwLDEyNDg4XSwyNTZdLDEzMTA4OltbMTI1MDIsMTI0ODMsMTI0NzEsMTI0NTUsMTI1MjNdLDI1Nl0sMTMxMDk6W1sxMjUwMSwxMjUyMSwxMjUzMV0sMjU2XSwxMzExMDpbWzEyNTA0LDEyNDYzLDEyNDc5LDEyNTQwLDEyNTIzXSwyNTZdLDEzMTExOltbMTI1MDYsMTI0NzddLDI1Nl0sMTMxMTI6W1sxMjUwNiwxMjQ5MSwxMjQ5OF0sMjU2XSwxMzExMzpbWzEyNTA0LDEyNTIzLDEyNDg0XSwyNTZdLDEzMTE0OltbMTI1MDYsMTI1MzEsMTI0NzNdLDI1Nl0sMTMxMTU6W1sxMjUwNiwxMjU0MCwxMjQ3Ml0sMjU2XSwxMzExNjpbWzEyNTA1LDEyNTQwLDEyNDc5XSwyNTZdLDEzMTE3OltbMTI1MDksMTI0NTIsMTI1MzEsMTI0ODhdLDI1Nl0sMTMxMTg6W1sxMjUwOCwxMjUyMywxMjQ4OF0sMjU2XSwxMzExOTpbWzEyNTA3LDEyNTMxXSwyNTZdLDEzMTIwOltbMTI1MDksMTI1MzEsMTI0ODldLDI1Nl0sMTMxMjE6W1sxMjUwNywxMjU0MCwxMjUyM10sMjU2XSwxMzEyMjpbWzEyNTA3LDEyNTQwLDEyNTMxXSwyNTZdLDEzMTIzOltbMTI1MTAsMTI0NTIsMTI0NjMsMTI1MjVdLDI1Nl0sMTMxMjQ6W1sxMjUxMCwxMjQ1MiwxMjUyM10sMjU2XSwxMzEyNTpbWzEyNTEwLDEyNDgzLDEyNDk1XSwyNTZdLDEzMTI2OltbMTI1MTAsMTI1MjMsMTI0NjNdLDI1Nl0sMTMxMjc6W1sxMjUxMCwxMjUzMSwxMjQ3MSwxMjUxOSwxMjUzMV0sMjU2XSwxMzEyODpbWzEyNTExLDEyNDYzLDEyNTI1LDEyNTMxXSwyNTZdLDEzMTI5OltbMTI1MTEsMTI1MjJdLDI1Nl0sMTMxMzA6W1sxMjUxMSwxMjUyMiwxMjQ5NiwxMjU0MCwxMjUyM10sMjU2XSwxMzEzMTpbWzEyNTEzLDEyNDYwXSwyNTZdLDEzMTMyOltbMTI1MTMsMTI0NjAsMTI0ODgsMTI1MzFdLDI1Nl0sMTMxMzM6W1sxMjUxMywxMjU0MCwxMjQ4OCwxMjUyM10sMjU2XSwxMzEzNDpbWzEyNTE2LDEyNTQwLDEyNDg5XSwyNTZdLDEzMTM1OltbMTI1MTYsMTI1NDAsMTI1MjNdLDI1Nl0sMTMxMzY6W1sxMjUxOCwxMjQ1MCwxMjUzMV0sMjU2XSwxMzEzNzpbWzEyNTIyLDEyNDgzLDEyNDg4LDEyNTIzXSwyNTZdLDEzMTM4OltbMTI1MjIsMTI1MjFdLDI1Nl0sMTMxMzk6W1sxMjUyMywxMjUwMCwxMjU0MF0sMjU2XSwxMzE0MDpbWzEyNTIzLDEyNTQwLDEyNTAyLDEyNTIzXSwyNTZdLDEzMTQxOltbMTI1MjQsMTI1MTJdLDI1Nl0sMTMxNDI6W1sxMjUyNCwxMjUzMSwxMjQ4OCwxMjQ2NiwxMjUzMV0sMjU2XSwxMzE0MzpbWzEyNTI3LDEyNDgzLDEyNDg4XSwyNTZdLDEzMTQ0OltbNDgsMjg4NTddLDI1Nl0sMTMxNDU6W1s0OSwyODg1N10sMjU2XSwxMzE0NjpbWzUwLDI4ODU3XSwyNTZdLDEzMTQ3OltbNTEsMjg4NTddLDI1Nl0sMTMxNDg6W1s1MiwyODg1N10sMjU2XSwxMzE0OTpbWzUzLDI4ODU3XSwyNTZdLDEzMTUwOltbNTQsMjg4NTddLDI1Nl0sMTMxNTE6W1s1NSwyODg1N10sMjU2XSwxMzE1MjpbWzU2LDI4ODU3XSwyNTZdLDEzMTUzOltbNTcsMjg4NTddLDI1Nl0sMTMxNTQ6W1s0OSw0OCwyODg1N10sMjU2XSwxMzE1NTpbWzQ5LDQ5LDI4ODU3XSwyNTZdLDEzMTU2OltbNDksNTAsMjg4NTddLDI1Nl0sMTMxNTc6W1s0OSw1MSwyODg1N10sMjU2XSwxMzE1ODpbWzQ5LDUyLDI4ODU3XSwyNTZdLDEzMTU5OltbNDksNTMsMjg4NTddLDI1Nl0sMTMxNjA6W1s0OSw1NCwyODg1N10sMjU2XSwxMzE2MTpbWzQ5LDU1LDI4ODU3XSwyNTZdLDEzMTYyOltbNDksNTYsMjg4NTddLDI1Nl0sMTMxNjM6W1s0OSw1NywyODg1N10sMjU2XSwxMzE2NDpbWzUwLDQ4LDI4ODU3XSwyNTZdLDEzMTY1OltbNTAsNDksMjg4NTddLDI1Nl0sMTMxNjY6W1s1MCw1MCwyODg1N10sMjU2XSwxMzE2NzpbWzUwLDUxLDI4ODU3XSwyNTZdLDEzMTY4OltbNTAsNTIsMjg4NTddLDI1Nl0sMTMxNjk6W1sxMDQsODAsOTddLDI1Nl0sMTMxNzA6W1sxMDAsOTddLDI1Nl0sMTMxNzE6W1s2NSw4NV0sMjU2XSwxMzE3MjpbWzk4LDk3LDExNF0sMjU2XSwxMzE3MzpbWzExMSw4Nl0sMjU2XSwxMzE3NDpbWzExMiw5OV0sMjU2XSwxMzE3NTpbWzEwMCwxMDldLDI1Nl0sMTMxNzY6W1sxMDAsMTA5LDE3OF0sMjU2XSwxMzE3NzpbWzEwMCwxMDksMTc5XSwyNTZdLDEzMTc4OltbNzMsODVdLDI1Nl0sMTMxNzk6W1syNDE3OSwyNTEwNF0sMjU2XSwxMzE4MDpbWzI2MTU3LDIxNjQ0XSwyNTZdLDEzMTgxOltbMjI4MjMsMjc0OTFdLDI1Nl0sMTMxODI6W1syNjEyNiwyNzgzNV0sMjU2XSwxMzE4MzpbWzI2NjY2LDI0MzM1LDIwMjUwLDMxMDM4XSwyNTZdLDEzMTg0OltbMTEyLDY1XSwyNTZdLDEzMTg1OltbMTEwLDY1XSwyNTZdLDEzMTg2OltbOTU2LDY1XSwyNTZdLDEzMTg3OltbMTA5LDY1XSwyNTZdLDEzMTg4OltbMTA3LDY1XSwyNTZdLDEzMTg5OltbNzUsNjZdLDI1Nl0sMTMxOTA6W1s3Nyw2Nl0sMjU2XSwxMzE5MTpbWzcxLDY2XSwyNTZdLDEzMTkyOltbOTksOTcsMTA4XSwyNTZdLDEzMTkzOltbMTA3LDk5LDk3LDEwOF0sMjU2XSwxMzE5NDpbWzExMiw3MF0sMjU2XSwxMzE5NTpbWzExMCw3MF0sMjU2XSwxMzE5NjpbWzk1Niw3MF0sMjU2XSwxMzE5NzpbWzk1NiwxMDNdLDI1Nl0sMTMxOTg6W1sxMDksMTAzXSwyNTZdLDEzMTk5OltbMTA3LDEwM10sMjU2XSwxMzIwMDpbWzcyLDEyMl0sMjU2XSwxMzIwMTpbWzEwNyw3MiwxMjJdLDI1Nl0sMTMyMDI6W1s3Nyw3MiwxMjJdLDI1Nl0sMTMyMDM6W1s3MSw3MiwxMjJdLDI1Nl0sMTMyMDQ6W1s4NCw3MiwxMjJdLDI1Nl0sMTMyMDU6W1s5NTYsODQ2N10sMjU2XSwxMzIwNjpbWzEwOSw4NDY3XSwyNTZdLDEzMjA3OltbMTAwLDg0NjddLDI1Nl0sMTMyMDg6W1sxMDcsODQ2N10sMjU2XSwxMzIwOTpbWzEwMiwxMDldLDI1Nl0sMTMyMTA6W1sxMTAsMTA5XSwyNTZdLDEzMjExOltbOTU2LDEwOV0sMjU2XSwxMzIxMjpbWzEwOSwxMDldLDI1Nl0sMTMyMTM6W1s5OSwxMDldLDI1Nl0sMTMyMTQ6W1sxMDcsMTA5XSwyNTZdLDEzMjE1OltbMTA5LDEwOSwxNzhdLDI1Nl0sMTMyMTY6W1s5OSwxMDksMTc4XSwyNTZdLDEzMjE3OltbMTA5LDE3OF0sMjU2XSwxMzIxODpbWzEwNywxMDksMTc4XSwyNTZdLDEzMjE5OltbMTA5LDEwOSwxNzldLDI1Nl0sMTMyMjA6W1s5OSwxMDksMTc5XSwyNTZdLDEzMjIxOltbMTA5LDE3OV0sMjU2XSwxMzIyMjpbWzEwNywxMDksMTc5XSwyNTZdLDEzMjIzOltbMTA5LDg3MjUsMTE1XSwyNTZdLDEzMjI0OltbMTA5LDg3MjUsMTE1LDE3OF0sMjU2XSwxMzIyNTpbWzgwLDk3XSwyNTZdLDEzMjI2OltbMTA3LDgwLDk3XSwyNTZdLDEzMjI3OltbNzcsODAsOTddLDI1Nl0sMTMyMjg6W1s3MSw4MCw5N10sMjU2XSwxMzIyOTpbWzExNCw5NywxMDBdLDI1Nl0sMTMyMzA6W1sxMTQsOTcsMTAwLDg3MjUsMTE1XSwyNTZdLDEzMjMxOltbMTE0LDk3LDEwMCw4NzI1LDExNSwxNzhdLDI1Nl0sMTMyMzI6W1sxMTIsMTE1XSwyNTZdLDEzMjMzOltbMTEwLDExNV0sMjU2XSwxMzIzNDpbWzk1NiwxMTVdLDI1Nl0sMTMyMzU6W1sxMDksMTE1XSwyNTZdLDEzMjM2OltbMTEyLDg2XSwyNTZdLDEzMjM3OltbMTEwLDg2XSwyNTZdLDEzMjM4OltbOTU2LDg2XSwyNTZdLDEzMjM5OltbMTA5LDg2XSwyNTZdLDEzMjQwOltbMTA3LDg2XSwyNTZdLDEzMjQxOltbNzcsODZdLDI1Nl0sMTMyNDI6W1sxMTIsODddLDI1Nl0sMTMyNDM6W1sxMTAsODddLDI1Nl0sMTMyNDQ6W1s5NTYsODddLDI1Nl0sMTMyNDU6W1sxMDksODddLDI1Nl0sMTMyNDY6W1sxMDcsODddLDI1Nl0sMTMyNDc6W1s3Nyw4N10sMjU2XSwxMzI0ODpbWzEwNyw5MzddLDI1Nl0sMTMyNDk6W1s3Nyw5MzddLDI1Nl0sMTMyNTA6W1s5Nyw0NiwxMDksNDZdLDI1Nl0sMTMyNTE6W1s2NiwxMTNdLDI1Nl0sMTMyNTI6W1s5OSw5OV0sMjU2XSwxMzI1MzpbWzk5LDEwMF0sMjU2XSwxMzI1NDpbWzY3LDg3MjUsMTA3LDEwM10sMjU2XSwxMzI1NTpbWzY3LDExMSw0Nl0sMjU2XSwxMzI1NjpbWzEwMCw2Nl0sMjU2XSwxMzI1NzpbWzcxLDEyMV0sMjU2XSwxMzI1ODpbWzEwNCw5N10sMjU2XSwxMzI1OTpbWzcyLDgwXSwyNTZdLDEzMjYwOltbMTA1LDExMF0sMjU2XSwxMzI2MTpbWzc1LDc1XSwyNTZdLDEzMjYyOltbNzUsNzddLDI1Nl0sMTMyNjM6W1sxMDcsMTE2XSwyNTZdLDEzMjY0OltbMTA4LDEwOV0sMjU2XSwxMzI2NTpbWzEwOCwxMTBdLDI1Nl0sMTMyNjY6W1sxMDgsMTExLDEwM10sMjU2XSwxMzI2NzpbWzEwOCwxMjBdLDI1Nl0sMTMyNjg6W1sxMDksOThdLDI1Nl0sMTMyNjk6W1sxMDksMTA1LDEwOF0sMjU2XSwxMzI3MDpbWzEwOSwxMTEsMTA4XSwyNTZdLDEzMjcxOltbODAsNzJdLDI1Nl0sMTMyNzI6W1sxMTIsNDYsMTA5LDQ2XSwyNTZdLDEzMjczOltbODAsODAsNzddLDI1Nl0sMTMyNzQ6W1s4MCw4Ml0sMjU2XSwxMzI3NTpbWzExNSwxMTRdLDI1Nl0sMTMyNzY6W1s4MywxMThdLDI1Nl0sMTMyNzc6W1s4Nyw5OF0sMjU2XSwxMzI3ODpbWzg2LDg3MjUsMTA5XSwyNTZdLDEzMjc5OltbNjUsODcyNSwxMDldLDI1Nl0sMTMyODA6W1s0OSwyNjA4NV0sMjU2XSwxMzI4MTpbWzUwLDI2MDg1XSwyNTZdLDEzMjgyOltbNTEsMjYwODVdLDI1Nl0sMTMyODM6W1s1MiwyNjA4NV0sMjU2XSwxMzI4NDpbWzUzLDI2MDg1XSwyNTZdLDEzMjg1OltbNTQsMjYwODVdLDI1Nl0sMTMyODY6W1s1NSwyNjA4NV0sMjU2XSwxMzI4NzpbWzU2LDI2MDg1XSwyNTZdLDEzMjg4OltbNTcsMjYwODVdLDI1Nl0sMTMyODk6W1s0OSw0OCwyNjA4NV0sMjU2XSwxMzI5MDpbWzQ5LDQ5LDI2MDg1XSwyNTZdLDEzMjkxOltbNDksNTAsMjYwODVdLDI1Nl0sMTMyOTI6W1s0OSw1MSwyNjA4NV0sMjU2XSwxMzI5MzpbWzQ5LDUyLDI2MDg1XSwyNTZdLDEzMjk0OltbNDksNTMsMjYwODVdLDI1Nl0sMTMyOTU6W1s0OSw1NCwyNjA4NV0sMjU2XSwxMzI5NjpbWzQ5LDU1LDI2MDg1XSwyNTZdLDEzMjk3OltbNDksNTYsMjYwODVdLDI1Nl0sMTMyOTg6W1s0OSw1NywyNjA4NV0sMjU2XSwxMzI5OTpbWzUwLDQ4LDI2MDg1XSwyNTZdLDEzMzAwOltbNTAsNDksMjYwODVdLDI1Nl0sMTMzMDE6W1s1MCw1MCwyNjA4NV0sMjU2XSwxMzMwMjpbWzUwLDUxLDI2MDg1XSwyNTZdLDEzMzAzOltbNTAsNTIsMjYwODVdLDI1Nl0sMTMzMDQ6W1s1MCw1MywyNjA4NV0sMjU2XSwxMzMwNTpbWzUwLDU0LDI2MDg1XSwyNTZdLDEzMzA2OltbNTAsNTUsMjYwODVdLDI1Nl0sMTMzMDc6W1s1MCw1NiwyNjA4NV0sMjU2XSwxMzMwODpbWzUwLDU3LDI2MDg1XSwyNTZdLDEzMzA5OltbNTEsNDgsMjYwODVdLDI1Nl0sMTMzMTA6W1s1MSw0OSwyNjA4NV0sMjU2XSwxMzMxMTpbWzEwMyw5NywxMDhdLDI1Nl19LFxuNDI0OTY6ezQyNjA3OlssMjMwXSw0MjYxMjpbLDIzMF0sNDI2MTM6WywyMzBdLDQyNjE0OlssMjMwXSw0MjYxNTpbLDIzMF0sNDI2MTY6WywyMzBdLDQyNjE3OlssMjMwXSw0MjYxODpbLDIzMF0sNDI2MTk6WywyMzBdLDQyNjIwOlssMjMwXSw0MjYyMTpbLDIzMF0sNDI2NTU6WywyMzBdLDQyNzM2OlssMjMwXSw0MjczNzpbLDIzMF19LFxuNDI3NTI6ezQyODY0OltbNDI4NjNdLDI1Nl0sNDMwMDA6W1syOTRdLDI1Nl0sNDMwMDE6W1szMzldLDI1Nl19LFxuNDMwMDg6ezQzMDE0OlssOV0sNDMyMDQ6Wyw5XSw0MzIzMjpbLDIzMF0sNDMyMzM6WywyMzBdLDQzMjM0OlssMjMwXSw0MzIzNTpbLDIzMF0sNDMyMzY6WywyMzBdLDQzMjM3OlssMjMwXSw0MzIzODpbLDIzMF0sNDMyMzk6WywyMzBdLDQzMjQwOlssMjMwXSw0MzI0MTpbLDIzMF0sNDMyNDI6WywyMzBdLDQzMjQzOlssMjMwXSw0MzI0NDpbLDIzMF0sNDMyNDU6WywyMzBdLDQzMjQ2OlssMjMwXSw0MzI0NzpbLDIzMF0sNDMyNDg6WywyMzBdLDQzMjQ5OlssMjMwXX0sXG40MzI2NDp7NDMzMDc6WywyMjBdLDQzMzA4OlssMjIwXSw0MzMwOTpbLDIyMF0sNDMzNDc6Wyw5XSw0MzQ0MzpbLDddLDQzNDU2OlssOV19LFxuNDM1MjA6ezQzNjk2OlssMjMwXSw0MzY5ODpbLDIzMF0sNDM2OTk6WywyMzBdLDQzNzAwOlssMjIwXSw0MzcwMzpbLDIzMF0sNDM3MDQ6WywyMzBdLDQzNzEwOlssMjMwXSw0MzcxMTpbLDIzMF0sNDM3MTM6WywyMzBdLDQzNzY2OlssOV19LFxuNDM3NzY6ezQ0MDEzOlssOV19LFxuNTM1MDQ6ezExOTEzNDpbWzExOTEyNywxMTkxNDFdLDUxMl0sMTE5MTM1OltbMTE5MTI4LDExOTE0MV0sNTEyXSwxMTkxMzY6W1sxMTkxMzUsMTE5MTUwXSw1MTJdLDExOTEzNzpbWzExOTEzNSwxMTkxNTFdLDUxMl0sMTE5MTM4OltbMTE5MTM1LDExOTE1Ml0sNTEyXSwxMTkxMzk6W1sxMTkxMzUsMTE5MTUzXSw1MTJdLDExOTE0MDpbWzExOTEzNSwxMTkxNTRdLDUxMl0sMTE5MTQxOlssMjE2XSwxMTkxNDI6WywyMTZdLDExOTE0MzpbLDFdLDExOTE0NDpbLDFdLDExOTE0NTpbLDFdLDExOTE0OTpbLDIyNl0sMTE5MTUwOlssMjE2XSwxMTkxNTE6WywyMTZdLDExOTE1MjpbLDIxNl0sMTE5MTUzOlssMjE2XSwxMTkxNTQ6WywyMTZdLDExOTE2MzpbLDIyMF0sMTE5MTY0OlssMjIwXSwxMTkxNjU6WywyMjBdLDExOTE2NjpbLDIyMF0sMTE5MTY3OlssMjIwXSwxMTkxNjg6WywyMjBdLDExOTE2OTpbLDIyMF0sMTE5MTcwOlssMjIwXSwxMTkxNzM6WywyMzBdLDExOTE3NDpbLDIzMF0sMTE5MTc1OlssMjMwXSwxMTkxNzY6WywyMzBdLDExOTE3NzpbLDIzMF0sMTE5MTc4OlssMjIwXSwxMTkxNzk6WywyMjBdLDExOTIxMDpbLDIzMF0sMTE5MjExOlssMjMwXSwxMTkyMTI6WywyMzBdLDExOTIxMzpbLDIzMF0sMTE5MjI3OltbMTE5MjI1LDExOTE0MV0sNTEyXSwxMTkyMjg6W1sxMTkyMjYsMTE5MTQxXSw1MTJdLDExOTIyOTpbWzExOTIyNywxMTkxNTBdLDUxMl0sMTE5MjMwOltbMTE5MjI4LDExOTE1MF0sNTEyXSwxMTkyMzE6W1sxMTkyMjcsMTE5MTUxXSw1MTJdLDExOTIzMjpbWzExOTIyOCwxMTkxNTFdLDUxMl19LFxuNTM3NjA6ezExOTM2MjpbLDIzMF0sMTE5MzYzOlssMjMwXSwxMTkzNjQ6WywyMzBdfSxcbjU0MjcyOnsxMTk4MDg6W1s2NV0sMjU2XSwxMTk4MDk6W1s2Nl0sMjU2XSwxMTk4MTA6W1s2N10sMjU2XSwxMTk4MTE6W1s2OF0sMjU2XSwxMTk4MTI6W1s2OV0sMjU2XSwxMTk4MTM6W1s3MF0sMjU2XSwxMTk4MTQ6W1s3MV0sMjU2XSwxMTk4MTU6W1s3Ml0sMjU2XSwxMTk4MTY6W1s3M10sMjU2XSwxMTk4MTc6W1s3NF0sMjU2XSwxMTk4MTg6W1s3NV0sMjU2XSwxMTk4MTk6W1s3Nl0sMjU2XSwxMTk4MjA6W1s3N10sMjU2XSwxMTk4MjE6W1s3OF0sMjU2XSwxMTk4MjI6W1s3OV0sMjU2XSwxMTk4MjM6W1s4MF0sMjU2XSwxMTk4MjQ6W1s4MV0sMjU2XSwxMTk4MjU6W1s4Ml0sMjU2XSwxMTk4MjY6W1s4M10sMjU2XSwxMTk4Mjc6W1s4NF0sMjU2XSwxMTk4Mjg6W1s4NV0sMjU2XSwxMTk4Mjk6W1s4Nl0sMjU2XSwxMTk4MzA6W1s4N10sMjU2XSwxMTk4MzE6W1s4OF0sMjU2XSwxMTk4MzI6W1s4OV0sMjU2XSwxMTk4MzM6W1s5MF0sMjU2XSwxMTk4MzQ6W1s5N10sMjU2XSwxMTk4MzU6W1s5OF0sMjU2XSwxMTk4MzY6W1s5OV0sMjU2XSwxMTk4Mzc6W1sxMDBdLDI1Nl0sMTE5ODM4OltbMTAxXSwyNTZdLDExOTgzOTpbWzEwMl0sMjU2XSwxMTk4NDA6W1sxMDNdLDI1Nl0sMTE5ODQxOltbMTA0XSwyNTZdLDExOTg0MjpbWzEwNV0sMjU2XSwxMTk4NDM6W1sxMDZdLDI1Nl0sMTE5ODQ0OltbMTA3XSwyNTZdLDExOTg0NTpbWzEwOF0sMjU2XSwxMTk4NDY6W1sxMDldLDI1Nl0sMTE5ODQ3OltbMTEwXSwyNTZdLDExOTg0ODpbWzExMV0sMjU2XSwxMTk4NDk6W1sxMTJdLDI1Nl0sMTE5ODUwOltbMTEzXSwyNTZdLDExOTg1MTpbWzExNF0sMjU2XSwxMTk4NTI6W1sxMTVdLDI1Nl0sMTE5ODUzOltbMTE2XSwyNTZdLDExOTg1NDpbWzExN10sMjU2XSwxMTk4NTU6W1sxMThdLDI1Nl0sMTE5ODU2OltbMTE5XSwyNTZdLDExOTg1NzpbWzEyMF0sMjU2XSwxMTk4NTg6W1sxMjFdLDI1Nl0sMTE5ODU5OltbMTIyXSwyNTZdLDExOTg2MDpbWzY1XSwyNTZdLDExOTg2MTpbWzY2XSwyNTZdLDExOTg2MjpbWzY3XSwyNTZdLDExOTg2MzpbWzY4XSwyNTZdLDExOTg2NDpbWzY5XSwyNTZdLDExOTg2NTpbWzcwXSwyNTZdLDExOTg2NjpbWzcxXSwyNTZdLDExOTg2NzpbWzcyXSwyNTZdLDExOTg2ODpbWzczXSwyNTZdLDExOTg2OTpbWzc0XSwyNTZdLDExOTg3MDpbWzc1XSwyNTZdLDExOTg3MTpbWzc2XSwyNTZdLDExOTg3MjpbWzc3XSwyNTZdLDExOTg3MzpbWzc4XSwyNTZdLDExOTg3NDpbWzc5XSwyNTZdLDExOTg3NTpbWzgwXSwyNTZdLDExOTg3NjpbWzgxXSwyNTZdLDExOTg3NzpbWzgyXSwyNTZdLDExOTg3ODpbWzgzXSwyNTZdLDExOTg3OTpbWzg0XSwyNTZdLDExOTg4MDpbWzg1XSwyNTZdLDExOTg4MTpbWzg2XSwyNTZdLDExOTg4MjpbWzg3XSwyNTZdLDExOTg4MzpbWzg4XSwyNTZdLDExOTg4NDpbWzg5XSwyNTZdLDExOTg4NTpbWzkwXSwyNTZdLDExOTg4NjpbWzk3XSwyNTZdLDExOTg4NzpbWzk4XSwyNTZdLDExOTg4ODpbWzk5XSwyNTZdLDExOTg4OTpbWzEwMF0sMjU2XSwxMTk4OTA6W1sxMDFdLDI1Nl0sMTE5ODkxOltbMTAyXSwyNTZdLDExOTg5MjpbWzEwM10sMjU2XSwxMTk4OTQ6W1sxMDVdLDI1Nl0sMTE5ODk1OltbMTA2XSwyNTZdLDExOTg5NjpbWzEwN10sMjU2XSwxMTk4OTc6W1sxMDhdLDI1Nl0sMTE5ODk4OltbMTA5XSwyNTZdLDExOTg5OTpbWzExMF0sMjU2XSwxMTk5MDA6W1sxMTFdLDI1Nl0sMTE5OTAxOltbMTEyXSwyNTZdLDExOTkwMjpbWzExM10sMjU2XSwxMTk5MDM6W1sxMTRdLDI1Nl0sMTE5OTA0OltbMTE1XSwyNTZdLDExOTkwNTpbWzExNl0sMjU2XSwxMTk5MDY6W1sxMTddLDI1Nl0sMTE5OTA3OltbMTE4XSwyNTZdLDExOTkwODpbWzExOV0sMjU2XSwxMTk5MDk6W1sxMjBdLDI1Nl0sMTE5OTEwOltbMTIxXSwyNTZdLDExOTkxMTpbWzEyMl0sMjU2XSwxMTk5MTI6W1s2NV0sMjU2XSwxMTk5MTM6W1s2Nl0sMjU2XSwxMTk5MTQ6W1s2N10sMjU2XSwxMTk5MTU6W1s2OF0sMjU2XSwxMTk5MTY6W1s2OV0sMjU2XSwxMTk5MTc6W1s3MF0sMjU2XSwxMTk5MTg6W1s3MV0sMjU2XSwxMTk5MTk6W1s3Ml0sMjU2XSwxMTk5MjA6W1s3M10sMjU2XSwxMTk5MjE6W1s3NF0sMjU2XSwxMTk5MjI6W1s3NV0sMjU2XSwxMTk5MjM6W1s3Nl0sMjU2XSwxMTk5MjQ6W1s3N10sMjU2XSwxMTk5MjU6W1s3OF0sMjU2XSwxMTk5MjY6W1s3OV0sMjU2XSwxMTk5Mjc6W1s4MF0sMjU2XSwxMTk5Mjg6W1s4MV0sMjU2XSwxMTk5Mjk6W1s4Ml0sMjU2XSwxMTk5MzA6W1s4M10sMjU2XSwxMTk5MzE6W1s4NF0sMjU2XSwxMTk5MzI6W1s4NV0sMjU2XSwxMTk5MzM6W1s4Nl0sMjU2XSwxMTk5MzQ6W1s4N10sMjU2XSwxMTk5MzU6W1s4OF0sMjU2XSwxMTk5MzY6W1s4OV0sMjU2XSwxMTk5Mzc6W1s5MF0sMjU2XSwxMTk5Mzg6W1s5N10sMjU2XSwxMTk5Mzk6W1s5OF0sMjU2XSwxMTk5NDA6W1s5OV0sMjU2XSwxMTk5NDE6W1sxMDBdLDI1Nl0sMTE5OTQyOltbMTAxXSwyNTZdLDExOTk0MzpbWzEwMl0sMjU2XSwxMTk5NDQ6W1sxMDNdLDI1Nl0sMTE5OTQ1OltbMTA0XSwyNTZdLDExOTk0NjpbWzEwNV0sMjU2XSwxMTk5NDc6W1sxMDZdLDI1Nl0sMTE5OTQ4OltbMTA3XSwyNTZdLDExOTk0OTpbWzEwOF0sMjU2XSwxMTk5NTA6W1sxMDldLDI1Nl0sMTE5OTUxOltbMTEwXSwyNTZdLDExOTk1MjpbWzExMV0sMjU2XSwxMTk5NTM6W1sxMTJdLDI1Nl0sMTE5OTU0OltbMTEzXSwyNTZdLDExOTk1NTpbWzExNF0sMjU2XSwxMTk5NTY6W1sxMTVdLDI1Nl0sMTE5OTU3OltbMTE2XSwyNTZdLDExOTk1ODpbWzExN10sMjU2XSwxMTk5NTk6W1sxMThdLDI1Nl0sMTE5OTYwOltbMTE5XSwyNTZdLDExOTk2MTpbWzEyMF0sMjU2XSwxMTk5NjI6W1sxMjFdLDI1Nl0sMTE5OTYzOltbMTIyXSwyNTZdLDExOTk2NDpbWzY1XSwyNTZdLDExOTk2NjpbWzY3XSwyNTZdLDExOTk2NzpbWzY4XSwyNTZdLDExOTk3MDpbWzcxXSwyNTZdLDExOTk3MzpbWzc0XSwyNTZdLDExOTk3NDpbWzc1XSwyNTZdLDExOTk3NzpbWzc4XSwyNTZdLDExOTk3ODpbWzc5XSwyNTZdLDExOTk3OTpbWzgwXSwyNTZdLDExOTk4MDpbWzgxXSwyNTZdLDExOTk4MjpbWzgzXSwyNTZdLDExOTk4MzpbWzg0XSwyNTZdLDExOTk4NDpbWzg1XSwyNTZdLDExOTk4NTpbWzg2XSwyNTZdLDExOTk4NjpbWzg3XSwyNTZdLDExOTk4NzpbWzg4XSwyNTZdLDExOTk4ODpbWzg5XSwyNTZdLDExOTk4OTpbWzkwXSwyNTZdLDExOTk5MDpbWzk3XSwyNTZdLDExOTk5MTpbWzk4XSwyNTZdLDExOTk5MjpbWzk5XSwyNTZdLDExOTk5MzpbWzEwMF0sMjU2XSwxMTk5OTU6W1sxMDJdLDI1Nl0sMTE5OTk3OltbMTA0XSwyNTZdLDExOTk5ODpbWzEwNV0sMjU2XSwxMTk5OTk6W1sxMDZdLDI1Nl0sMTIwMDAwOltbMTA3XSwyNTZdLDEyMDAwMTpbWzEwOF0sMjU2XSwxMjAwMDI6W1sxMDldLDI1Nl0sMTIwMDAzOltbMTEwXSwyNTZdLDEyMDAwNTpbWzExMl0sMjU2XSwxMjAwMDY6W1sxMTNdLDI1Nl0sMTIwMDA3OltbMTE0XSwyNTZdLDEyMDAwODpbWzExNV0sMjU2XSwxMjAwMDk6W1sxMTZdLDI1Nl0sMTIwMDEwOltbMTE3XSwyNTZdLDEyMDAxMTpbWzExOF0sMjU2XSwxMjAwMTI6W1sxMTldLDI1Nl0sMTIwMDEzOltbMTIwXSwyNTZdLDEyMDAxNDpbWzEyMV0sMjU2XSwxMjAwMTU6W1sxMjJdLDI1Nl0sMTIwMDE2OltbNjVdLDI1Nl0sMTIwMDE3OltbNjZdLDI1Nl0sMTIwMDE4OltbNjddLDI1Nl0sMTIwMDE5OltbNjhdLDI1Nl0sMTIwMDIwOltbNjldLDI1Nl0sMTIwMDIxOltbNzBdLDI1Nl0sMTIwMDIyOltbNzFdLDI1Nl0sMTIwMDIzOltbNzJdLDI1Nl0sMTIwMDI0OltbNzNdLDI1Nl0sMTIwMDI1OltbNzRdLDI1Nl0sMTIwMDI2OltbNzVdLDI1Nl0sMTIwMDI3OltbNzZdLDI1Nl0sMTIwMDI4OltbNzddLDI1Nl0sMTIwMDI5OltbNzhdLDI1Nl0sMTIwMDMwOltbNzldLDI1Nl0sMTIwMDMxOltbODBdLDI1Nl0sMTIwMDMyOltbODFdLDI1Nl0sMTIwMDMzOltbODJdLDI1Nl0sMTIwMDM0OltbODNdLDI1Nl0sMTIwMDM1OltbODRdLDI1Nl0sMTIwMDM2OltbODVdLDI1Nl0sMTIwMDM3OltbODZdLDI1Nl0sMTIwMDM4OltbODddLDI1Nl0sMTIwMDM5OltbODhdLDI1Nl0sMTIwMDQwOltbODldLDI1Nl0sMTIwMDQxOltbOTBdLDI1Nl0sMTIwMDQyOltbOTddLDI1Nl0sMTIwMDQzOltbOThdLDI1Nl0sMTIwMDQ0OltbOTldLDI1Nl0sMTIwMDQ1OltbMTAwXSwyNTZdLDEyMDA0NjpbWzEwMV0sMjU2XSwxMjAwNDc6W1sxMDJdLDI1Nl0sMTIwMDQ4OltbMTAzXSwyNTZdLDEyMDA0OTpbWzEwNF0sMjU2XSwxMjAwNTA6W1sxMDVdLDI1Nl0sMTIwMDUxOltbMTA2XSwyNTZdLDEyMDA1MjpbWzEwN10sMjU2XSwxMjAwNTM6W1sxMDhdLDI1Nl0sMTIwMDU0OltbMTA5XSwyNTZdLDEyMDA1NTpbWzExMF0sMjU2XSwxMjAwNTY6W1sxMTFdLDI1Nl0sMTIwMDU3OltbMTEyXSwyNTZdLDEyMDA1ODpbWzExM10sMjU2XSwxMjAwNTk6W1sxMTRdLDI1Nl0sMTIwMDYwOltbMTE1XSwyNTZdLDEyMDA2MTpbWzExNl0sMjU2XSwxMjAwNjI6W1sxMTddLDI1Nl0sMTIwMDYzOltbMTE4XSwyNTZdfSxcbjU0NTI4OnsxMjAwNjQ6W1sxMTldLDI1Nl0sMTIwMDY1OltbMTIwXSwyNTZdLDEyMDA2NjpbWzEyMV0sMjU2XSwxMjAwNjc6W1sxMjJdLDI1Nl0sMTIwMDY4OltbNjVdLDI1Nl0sMTIwMDY5OltbNjZdLDI1Nl0sMTIwMDcxOltbNjhdLDI1Nl0sMTIwMDcyOltbNjldLDI1Nl0sMTIwMDczOltbNzBdLDI1Nl0sMTIwMDc0OltbNzFdLDI1Nl0sMTIwMDc3OltbNzRdLDI1Nl0sMTIwMDc4OltbNzVdLDI1Nl0sMTIwMDc5OltbNzZdLDI1Nl0sMTIwMDgwOltbNzddLDI1Nl0sMTIwMDgxOltbNzhdLDI1Nl0sMTIwMDgyOltbNzldLDI1Nl0sMTIwMDgzOltbODBdLDI1Nl0sMTIwMDg0OltbODFdLDI1Nl0sMTIwMDg2OltbODNdLDI1Nl0sMTIwMDg3OltbODRdLDI1Nl0sMTIwMDg4OltbODVdLDI1Nl0sMTIwMDg5OltbODZdLDI1Nl0sMTIwMDkwOltbODddLDI1Nl0sMTIwMDkxOltbODhdLDI1Nl0sMTIwMDkyOltbODldLDI1Nl0sMTIwMDk0OltbOTddLDI1Nl0sMTIwMDk1OltbOThdLDI1Nl0sMTIwMDk2OltbOTldLDI1Nl0sMTIwMDk3OltbMTAwXSwyNTZdLDEyMDA5ODpbWzEwMV0sMjU2XSwxMjAwOTk6W1sxMDJdLDI1Nl0sMTIwMTAwOltbMTAzXSwyNTZdLDEyMDEwMTpbWzEwNF0sMjU2XSwxMjAxMDI6W1sxMDVdLDI1Nl0sMTIwMTAzOltbMTA2XSwyNTZdLDEyMDEwNDpbWzEwN10sMjU2XSwxMjAxMDU6W1sxMDhdLDI1Nl0sMTIwMTA2OltbMTA5XSwyNTZdLDEyMDEwNzpbWzExMF0sMjU2XSwxMjAxMDg6W1sxMTFdLDI1Nl0sMTIwMTA5OltbMTEyXSwyNTZdLDEyMDExMDpbWzExM10sMjU2XSwxMjAxMTE6W1sxMTRdLDI1Nl0sMTIwMTEyOltbMTE1XSwyNTZdLDEyMDExMzpbWzExNl0sMjU2XSwxMjAxMTQ6W1sxMTddLDI1Nl0sMTIwMTE1OltbMTE4XSwyNTZdLDEyMDExNjpbWzExOV0sMjU2XSwxMjAxMTc6W1sxMjBdLDI1Nl0sMTIwMTE4OltbMTIxXSwyNTZdLDEyMDExOTpbWzEyMl0sMjU2XSwxMjAxMjA6W1s2NV0sMjU2XSwxMjAxMjE6W1s2Nl0sMjU2XSwxMjAxMjM6W1s2OF0sMjU2XSwxMjAxMjQ6W1s2OV0sMjU2XSwxMjAxMjU6W1s3MF0sMjU2XSwxMjAxMjY6W1s3MV0sMjU2XSwxMjAxMjg6W1s3M10sMjU2XSwxMjAxMjk6W1s3NF0sMjU2XSwxMjAxMzA6W1s3NV0sMjU2XSwxMjAxMzE6W1s3Nl0sMjU2XSwxMjAxMzI6W1s3N10sMjU2XSwxMjAxMzQ6W1s3OV0sMjU2XSwxMjAxMzg6W1s4M10sMjU2XSwxMjAxMzk6W1s4NF0sMjU2XSwxMjAxNDA6W1s4NV0sMjU2XSwxMjAxNDE6W1s4Nl0sMjU2XSwxMjAxNDI6W1s4N10sMjU2XSwxMjAxNDM6W1s4OF0sMjU2XSwxMjAxNDQ6W1s4OV0sMjU2XSwxMjAxNDY6W1s5N10sMjU2XSwxMjAxNDc6W1s5OF0sMjU2XSwxMjAxNDg6W1s5OV0sMjU2XSwxMjAxNDk6W1sxMDBdLDI1Nl0sMTIwMTUwOltbMTAxXSwyNTZdLDEyMDE1MTpbWzEwMl0sMjU2XSwxMjAxNTI6W1sxMDNdLDI1Nl0sMTIwMTUzOltbMTA0XSwyNTZdLDEyMDE1NDpbWzEwNV0sMjU2XSwxMjAxNTU6W1sxMDZdLDI1Nl0sMTIwMTU2OltbMTA3XSwyNTZdLDEyMDE1NzpbWzEwOF0sMjU2XSwxMjAxNTg6W1sxMDldLDI1Nl0sMTIwMTU5OltbMTEwXSwyNTZdLDEyMDE2MDpbWzExMV0sMjU2XSwxMjAxNjE6W1sxMTJdLDI1Nl0sMTIwMTYyOltbMTEzXSwyNTZdLDEyMDE2MzpbWzExNF0sMjU2XSwxMjAxNjQ6W1sxMTVdLDI1Nl0sMTIwMTY1OltbMTE2XSwyNTZdLDEyMDE2NjpbWzExN10sMjU2XSwxMjAxNjc6W1sxMThdLDI1Nl0sMTIwMTY4OltbMTE5XSwyNTZdLDEyMDE2OTpbWzEyMF0sMjU2XSwxMjAxNzA6W1sxMjFdLDI1Nl0sMTIwMTcxOltbMTIyXSwyNTZdLDEyMDE3MjpbWzY1XSwyNTZdLDEyMDE3MzpbWzY2XSwyNTZdLDEyMDE3NDpbWzY3XSwyNTZdLDEyMDE3NTpbWzY4XSwyNTZdLDEyMDE3NjpbWzY5XSwyNTZdLDEyMDE3NzpbWzcwXSwyNTZdLDEyMDE3ODpbWzcxXSwyNTZdLDEyMDE3OTpbWzcyXSwyNTZdLDEyMDE4MDpbWzczXSwyNTZdLDEyMDE4MTpbWzc0XSwyNTZdLDEyMDE4MjpbWzc1XSwyNTZdLDEyMDE4MzpbWzc2XSwyNTZdLDEyMDE4NDpbWzc3XSwyNTZdLDEyMDE4NTpbWzc4XSwyNTZdLDEyMDE4NjpbWzc5XSwyNTZdLDEyMDE4NzpbWzgwXSwyNTZdLDEyMDE4ODpbWzgxXSwyNTZdLDEyMDE4OTpbWzgyXSwyNTZdLDEyMDE5MDpbWzgzXSwyNTZdLDEyMDE5MTpbWzg0XSwyNTZdLDEyMDE5MjpbWzg1XSwyNTZdLDEyMDE5MzpbWzg2XSwyNTZdLDEyMDE5NDpbWzg3XSwyNTZdLDEyMDE5NTpbWzg4XSwyNTZdLDEyMDE5NjpbWzg5XSwyNTZdLDEyMDE5NzpbWzkwXSwyNTZdLDEyMDE5ODpbWzk3XSwyNTZdLDEyMDE5OTpbWzk4XSwyNTZdLDEyMDIwMDpbWzk5XSwyNTZdLDEyMDIwMTpbWzEwMF0sMjU2XSwxMjAyMDI6W1sxMDFdLDI1Nl0sMTIwMjAzOltbMTAyXSwyNTZdLDEyMDIwNDpbWzEwM10sMjU2XSwxMjAyMDU6W1sxMDRdLDI1Nl0sMTIwMjA2OltbMTA1XSwyNTZdLDEyMDIwNzpbWzEwNl0sMjU2XSwxMjAyMDg6W1sxMDddLDI1Nl0sMTIwMjA5OltbMTA4XSwyNTZdLDEyMDIxMDpbWzEwOV0sMjU2XSwxMjAyMTE6W1sxMTBdLDI1Nl0sMTIwMjEyOltbMTExXSwyNTZdLDEyMDIxMzpbWzExMl0sMjU2XSwxMjAyMTQ6W1sxMTNdLDI1Nl0sMTIwMjE1OltbMTE0XSwyNTZdLDEyMDIxNjpbWzExNV0sMjU2XSwxMjAyMTc6W1sxMTZdLDI1Nl0sMTIwMjE4OltbMTE3XSwyNTZdLDEyMDIxOTpbWzExOF0sMjU2XSwxMjAyMjA6W1sxMTldLDI1Nl0sMTIwMjIxOltbMTIwXSwyNTZdLDEyMDIyMjpbWzEyMV0sMjU2XSwxMjAyMjM6W1sxMjJdLDI1Nl0sMTIwMjI0OltbNjVdLDI1Nl0sMTIwMjI1OltbNjZdLDI1Nl0sMTIwMjI2OltbNjddLDI1Nl0sMTIwMjI3OltbNjhdLDI1Nl0sMTIwMjI4OltbNjldLDI1Nl0sMTIwMjI5OltbNzBdLDI1Nl0sMTIwMjMwOltbNzFdLDI1Nl0sMTIwMjMxOltbNzJdLDI1Nl0sMTIwMjMyOltbNzNdLDI1Nl0sMTIwMjMzOltbNzRdLDI1Nl0sMTIwMjM0OltbNzVdLDI1Nl0sMTIwMjM1OltbNzZdLDI1Nl0sMTIwMjM2OltbNzddLDI1Nl0sMTIwMjM3OltbNzhdLDI1Nl0sMTIwMjM4OltbNzldLDI1Nl0sMTIwMjM5OltbODBdLDI1Nl0sMTIwMjQwOltbODFdLDI1Nl0sMTIwMjQxOltbODJdLDI1Nl0sMTIwMjQyOltbODNdLDI1Nl0sMTIwMjQzOltbODRdLDI1Nl0sMTIwMjQ0OltbODVdLDI1Nl0sMTIwMjQ1OltbODZdLDI1Nl0sMTIwMjQ2OltbODddLDI1Nl0sMTIwMjQ3OltbODhdLDI1Nl0sMTIwMjQ4OltbODldLDI1Nl0sMTIwMjQ5OltbOTBdLDI1Nl0sMTIwMjUwOltbOTddLDI1Nl0sMTIwMjUxOltbOThdLDI1Nl0sMTIwMjUyOltbOTldLDI1Nl0sMTIwMjUzOltbMTAwXSwyNTZdLDEyMDI1NDpbWzEwMV0sMjU2XSwxMjAyNTU6W1sxMDJdLDI1Nl0sMTIwMjU2OltbMTAzXSwyNTZdLDEyMDI1NzpbWzEwNF0sMjU2XSwxMjAyNTg6W1sxMDVdLDI1Nl0sMTIwMjU5OltbMTA2XSwyNTZdLDEyMDI2MDpbWzEwN10sMjU2XSwxMjAyNjE6W1sxMDhdLDI1Nl0sMTIwMjYyOltbMTA5XSwyNTZdLDEyMDI2MzpbWzExMF0sMjU2XSwxMjAyNjQ6W1sxMTFdLDI1Nl0sMTIwMjY1OltbMTEyXSwyNTZdLDEyMDI2NjpbWzExM10sMjU2XSwxMjAyNjc6W1sxMTRdLDI1Nl0sMTIwMjY4OltbMTE1XSwyNTZdLDEyMDI2OTpbWzExNl0sMjU2XSwxMjAyNzA6W1sxMTddLDI1Nl0sMTIwMjcxOltbMTE4XSwyNTZdLDEyMDI3MjpbWzExOV0sMjU2XSwxMjAyNzM6W1sxMjBdLDI1Nl0sMTIwMjc0OltbMTIxXSwyNTZdLDEyMDI3NTpbWzEyMl0sMjU2XSwxMjAyNzY6W1s2NV0sMjU2XSwxMjAyNzc6W1s2Nl0sMjU2XSwxMjAyNzg6W1s2N10sMjU2XSwxMjAyNzk6W1s2OF0sMjU2XSwxMjAyODA6W1s2OV0sMjU2XSwxMjAyODE6W1s3MF0sMjU2XSwxMjAyODI6W1s3MV0sMjU2XSwxMjAyODM6W1s3Ml0sMjU2XSwxMjAyODQ6W1s3M10sMjU2XSwxMjAyODU6W1s3NF0sMjU2XSwxMjAyODY6W1s3NV0sMjU2XSwxMjAyODc6W1s3Nl0sMjU2XSwxMjAyODg6W1s3N10sMjU2XSwxMjAyODk6W1s3OF0sMjU2XSwxMjAyOTA6W1s3OV0sMjU2XSwxMjAyOTE6W1s4MF0sMjU2XSwxMjAyOTI6W1s4MV0sMjU2XSwxMjAyOTM6W1s4Ml0sMjU2XSwxMjAyOTQ6W1s4M10sMjU2XSwxMjAyOTU6W1s4NF0sMjU2XSwxMjAyOTY6W1s4NV0sMjU2XSwxMjAyOTc6W1s4Nl0sMjU2XSwxMjAyOTg6W1s4N10sMjU2XSwxMjAyOTk6W1s4OF0sMjU2XSwxMjAzMDA6W1s4OV0sMjU2XSwxMjAzMDE6W1s5MF0sMjU2XSwxMjAzMDI6W1s5N10sMjU2XSwxMjAzMDM6W1s5OF0sMjU2XSwxMjAzMDQ6W1s5OV0sMjU2XSwxMjAzMDU6W1sxMDBdLDI1Nl0sMTIwMzA2OltbMTAxXSwyNTZdLDEyMDMwNzpbWzEwMl0sMjU2XSwxMjAzMDg6W1sxMDNdLDI1Nl0sMTIwMzA5OltbMTA0XSwyNTZdLDEyMDMxMDpbWzEwNV0sMjU2XSwxMjAzMTE6W1sxMDZdLDI1Nl0sMTIwMzEyOltbMTA3XSwyNTZdLDEyMDMxMzpbWzEwOF0sMjU2XSwxMjAzMTQ6W1sxMDldLDI1Nl0sMTIwMzE1OltbMTEwXSwyNTZdLDEyMDMxNjpbWzExMV0sMjU2XSwxMjAzMTc6W1sxMTJdLDI1Nl0sMTIwMzE4OltbMTEzXSwyNTZdLDEyMDMxOTpbWzExNF0sMjU2XX0sXG41NDc4NDp7MTIwMzIwOltbMTE1XSwyNTZdLDEyMDMyMTpbWzExNl0sMjU2XSwxMjAzMjI6W1sxMTddLDI1Nl0sMTIwMzIzOltbMTE4XSwyNTZdLDEyMDMyNDpbWzExOV0sMjU2XSwxMjAzMjU6W1sxMjBdLDI1Nl0sMTIwMzI2OltbMTIxXSwyNTZdLDEyMDMyNzpbWzEyMl0sMjU2XSwxMjAzMjg6W1s2NV0sMjU2XSwxMjAzMjk6W1s2Nl0sMjU2XSwxMjAzMzA6W1s2N10sMjU2XSwxMjAzMzE6W1s2OF0sMjU2XSwxMjAzMzI6W1s2OV0sMjU2XSwxMjAzMzM6W1s3MF0sMjU2XSwxMjAzMzQ6W1s3MV0sMjU2XSwxMjAzMzU6W1s3Ml0sMjU2XSwxMjAzMzY6W1s3M10sMjU2XSwxMjAzMzc6W1s3NF0sMjU2XSwxMjAzMzg6W1s3NV0sMjU2XSwxMjAzMzk6W1s3Nl0sMjU2XSwxMjAzNDA6W1s3N10sMjU2XSwxMjAzNDE6W1s3OF0sMjU2XSwxMjAzNDI6W1s3OV0sMjU2XSwxMjAzNDM6W1s4MF0sMjU2XSwxMjAzNDQ6W1s4MV0sMjU2XSwxMjAzNDU6W1s4Ml0sMjU2XSwxMjAzNDY6W1s4M10sMjU2XSwxMjAzNDc6W1s4NF0sMjU2XSwxMjAzNDg6W1s4NV0sMjU2XSwxMjAzNDk6W1s4Nl0sMjU2XSwxMjAzNTA6W1s4N10sMjU2XSwxMjAzNTE6W1s4OF0sMjU2XSwxMjAzNTI6W1s4OV0sMjU2XSwxMjAzNTM6W1s5MF0sMjU2XSwxMjAzNTQ6W1s5N10sMjU2XSwxMjAzNTU6W1s5OF0sMjU2XSwxMjAzNTY6W1s5OV0sMjU2XSwxMjAzNTc6W1sxMDBdLDI1Nl0sMTIwMzU4OltbMTAxXSwyNTZdLDEyMDM1OTpbWzEwMl0sMjU2XSwxMjAzNjA6W1sxMDNdLDI1Nl0sMTIwMzYxOltbMTA0XSwyNTZdLDEyMDM2MjpbWzEwNV0sMjU2XSwxMjAzNjM6W1sxMDZdLDI1Nl0sMTIwMzY0OltbMTA3XSwyNTZdLDEyMDM2NTpbWzEwOF0sMjU2XSwxMjAzNjY6W1sxMDldLDI1Nl0sMTIwMzY3OltbMTEwXSwyNTZdLDEyMDM2ODpbWzExMV0sMjU2XSwxMjAzNjk6W1sxMTJdLDI1Nl0sMTIwMzcwOltbMTEzXSwyNTZdLDEyMDM3MTpbWzExNF0sMjU2XSwxMjAzNzI6W1sxMTVdLDI1Nl0sMTIwMzczOltbMTE2XSwyNTZdLDEyMDM3NDpbWzExN10sMjU2XSwxMjAzNzU6W1sxMThdLDI1Nl0sMTIwMzc2OltbMTE5XSwyNTZdLDEyMDM3NzpbWzEyMF0sMjU2XSwxMjAzNzg6W1sxMjFdLDI1Nl0sMTIwMzc5OltbMTIyXSwyNTZdLDEyMDM4MDpbWzY1XSwyNTZdLDEyMDM4MTpbWzY2XSwyNTZdLDEyMDM4MjpbWzY3XSwyNTZdLDEyMDM4MzpbWzY4XSwyNTZdLDEyMDM4NDpbWzY5XSwyNTZdLDEyMDM4NTpbWzcwXSwyNTZdLDEyMDM4NjpbWzcxXSwyNTZdLDEyMDM4NzpbWzcyXSwyNTZdLDEyMDM4ODpbWzczXSwyNTZdLDEyMDM4OTpbWzc0XSwyNTZdLDEyMDM5MDpbWzc1XSwyNTZdLDEyMDM5MTpbWzc2XSwyNTZdLDEyMDM5MjpbWzc3XSwyNTZdLDEyMDM5MzpbWzc4XSwyNTZdLDEyMDM5NDpbWzc5XSwyNTZdLDEyMDM5NTpbWzgwXSwyNTZdLDEyMDM5NjpbWzgxXSwyNTZdLDEyMDM5NzpbWzgyXSwyNTZdLDEyMDM5ODpbWzgzXSwyNTZdLDEyMDM5OTpbWzg0XSwyNTZdLDEyMDQwMDpbWzg1XSwyNTZdLDEyMDQwMTpbWzg2XSwyNTZdLDEyMDQwMjpbWzg3XSwyNTZdLDEyMDQwMzpbWzg4XSwyNTZdLDEyMDQwNDpbWzg5XSwyNTZdLDEyMDQwNTpbWzkwXSwyNTZdLDEyMDQwNjpbWzk3XSwyNTZdLDEyMDQwNzpbWzk4XSwyNTZdLDEyMDQwODpbWzk5XSwyNTZdLDEyMDQwOTpbWzEwMF0sMjU2XSwxMjA0MTA6W1sxMDFdLDI1Nl0sMTIwNDExOltbMTAyXSwyNTZdLDEyMDQxMjpbWzEwM10sMjU2XSwxMjA0MTM6W1sxMDRdLDI1Nl0sMTIwNDE0OltbMTA1XSwyNTZdLDEyMDQxNTpbWzEwNl0sMjU2XSwxMjA0MTY6W1sxMDddLDI1Nl0sMTIwNDE3OltbMTA4XSwyNTZdLDEyMDQxODpbWzEwOV0sMjU2XSwxMjA0MTk6W1sxMTBdLDI1Nl0sMTIwNDIwOltbMTExXSwyNTZdLDEyMDQyMTpbWzExMl0sMjU2XSwxMjA0MjI6W1sxMTNdLDI1Nl0sMTIwNDIzOltbMTE0XSwyNTZdLDEyMDQyNDpbWzExNV0sMjU2XSwxMjA0MjU6W1sxMTZdLDI1Nl0sMTIwNDI2OltbMTE3XSwyNTZdLDEyMDQyNzpbWzExOF0sMjU2XSwxMjA0Mjg6W1sxMTldLDI1Nl0sMTIwNDI5OltbMTIwXSwyNTZdLDEyMDQzMDpbWzEyMV0sMjU2XSwxMjA0MzE6W1sxMjJdLDI1Nl0sMTIwNDMyOltbNjVdLDI1Nl0sMTIwNDMzOltbNjZdLDI1Nl0sMTIwNDM0OltbNjddLDI1Nl0sMTIwNDM1OltbNjhdLDI1Nl0sMTIwNDM2OltbNjldLDI1Nl0sMTIwNDM3OltbNzBdLDI1Nl0sMTIwNDM4OltbNzFdLDI1Nl0sMTIwNDM5OltbNzJdLDI1Nl0sMTIwNDQwOltbNzNdLDI1Nl0sMTIwNDQxOltbNzRdLDI1Nl0sMTIwNDQyOltbNzVdLDI1Nl0sMTIwNDQzOltbNzZdLDI1Nl0sMTIwNDQ0OltbNzddLDI1Nl0sMTIwNDQ1OltbNzhdLDI1Nl0sMTIwNDQ2OltbNzldLDI1Nl0sMTIwNDQ3OltbODBdLDI1Nl0sMTIwNDQ4OltbODFdLDI1Nl0sMTIwNDQ5OltbODJdLDI1Nl0sMTIwNDUwOltbODNdLDI1Nl0sMTIwNDUxOltbODRdLDI1Nl0sMTIwNDUyOltbODVdLDI1Nl0sMTIwNDUzOltbODZdLDI1Nl0sMTIwNDU0OltbODddLDI1Nl0sMTIwNDU1OltbODhdLDI1Nl0sMTIwNDU2OltbODldLDI1Nl0sMTIwNDU3OltbOTBdLDI1Nl0sMTIwNDU4OltbOTddLDI1Nl0sMTIwNDU5OltbOThdLDI1Nl0sMTIwNDYwOltbOTldLDI1Nl0sMTIwNDYxOltbMTAwXSwyNTZdLDEyMDQ2MjpbWzEwMV0sMjU2XSwxMjA0NjM6W1sxMDJdLDI1Nl0sMTIwNDY0OltbMTAzXSwyNTZdLDEyMDQ2NTpbWzEwNF0sMjU2XSwxMjA0NjY6W1sxMDVdLDI1Nl0sMTIwNDY3OltbMTA2XSwyNTZdLDEyMDQ2ODpbWzEwN10sMjU2XSwxMjA0Njk6W1sxMDhdLDI1Nl0sMTIwNDcwOltbMTA5XSwyNTZdLDEyMDQ3MTpbWzExMF0sMjU2XSwxMjA0NzI6W1sxMTFdLDI1Nl0sMTIwNDczOltbMTEyXSwyNTZdLDEyMDQ3NDpbWzExM10sMjU2XSwxMjA0NzU6W1sxMTRdLDI1Nl0sMTIwNDc2OltbMTE1XSwyNTZdLDEyMDQ3NzpbWzExNl0sMjU2XSwxMjA0Nzg6W1sxMTddLDI1Nl0sMTIwNDc5OltbMTE4XSwyNTZdLDEyMDQ4MDpbWzExOV0sMjU2XSwxMjA0ODE6W1sxMjBdLDI1Nl0sMTIwNDgyOltbMTIxXSwyNTZdLDEyMDQ4MzpbWzEyMl0sMjU2XSwxMjA0ODQ6W1szMDVdLDI1Nl0sMTIwNDg1OltbNTY3XSwyNTZdLDEyMDQ4ODpbWzkxM10sMjU2XSwxMjA0ODk6W1s5MTRdLDI1Nl0sMTIwNDkwOltbOTE1XSwyNTZdLDEyMDQ5MTpbWzkxNl0sMjU2XSwxMjA0OTI6W1s5MTddLDI1Nl0sMTIwNDkzOltbOTE4XSwyNTZdLDEyMDQ5NDpbWzkxOV0sMjU2XSwxMjA0OTU6W1s5MjBdLDI1Nl0sMTIwNDk2OltbOTIxXSwyNTZdLDEyMDQ5NzpbWzkyMl0sMjU2XSwxMjA0OTg6W1s5MjNdLDI1Nl0sMTIwNDk5OltbOTI0XSwyNTZdLDEyMDUwMDpbWzkyNV0sMjU2XSwxMjA1MDE6W1s5MjZdLDI1Nl0sMTIwNTAyOltbOTI3XSwyNTZdLDEyMDUwMzpbWzkyOF0sMjU2XSwxMjA1MDQ6W1s5MjldLDI1Nl0sMTIwNTA1OltbMTAxMl0sMjU2XSwxMjA1MDY6W1s5MzFdLDI1Nl0sMTIwNTA3OltbOTMyXSwyNTZdLDEyMDUwODpbWzkzM10sMjU2XSwxMjA1MDk6W1s5MzRdLDI1Nl0sMTIwNTEwOltbOTM1XSwyNTZdLDEyMDUxMTpbWzkzNl0sMjU2XSwxMjA1MTI6W1s5MzddLDI1Nl0sMTIwNTEzOltbODcxMV0sMjU2XSwxMjA1MTQ6W1s5NDVdLDI1Nl0sMTIwNTE1OltbOTQ2XSwyNTZdLDEyMDUxNjpbWzk0N10sMjU2XSwxMjA1MTc6W1s5NDhdLDI1Nl0sMTIwNTE4OltbOTQ5XSwyNTZdLDEyMDUxOTpbWzk1MF0sMjU2XSwxMjA1MjA6W1s5NTFdLDI1Nl0sMTIwNTIxOltbOTUyXSwyNTZdLDEyMDUyMjpbWzk1M10sMjU2XSwxMjA1MjM6W1s5NTRdLDI1Nl0sMTIwNTI0OltbOTU1XSwyNTZdLDEyMDUyNTpbWzk1Nl0sMjU2XSwxMjA1MjY6W1s5NTddLDI1Nl0sMTIwNTI3OltbOTU4XSwyNTZdLDEyMDUyODpbWzk1OV0sMjU2XSwxMjA1Mjk6W1s5NjBdLDI1Nl0sMTIwNTMwOltbOTYxXSwyNTZdLDEyMDUzMTpbWzk2Ml0sMjU2XSwxMjA1MzI6W1s5NjNdLDI1Nl0sMTIwNTMzOltbOTY0XSwyNTZdLDEyMDUzNDpbWzk2NV0sMjU2XSwxMjA1MzU6W1s5NjZdLDI1Nl0sMTIwNTM2OltbOTY3XSwyNTZdLDEyMDUzNzpbWzk2OF0sMjU2XSwxMjA1Mzg6W1s5NjldLDI1Nl0sMTIwNTM5OltbODcwNl0sMjU2XSwxMjA1NDA6W1sxMDEzXSwyNTZdLDEyMDU0MTpbWzk3N10sMjU2XSwxMjA1NDI6W1sxMDA4XSwyNTZdLDEyMDU0MzpbWzk4MV0sMjU2XSwxMjA1NDQ6W1sxMDA5XSwyNTZdLDEyMDU0NTpbWzk4Ml0sMjU2XSwxMjA1NDY6W1s5MTNdLDI1Nl0sMTIwNTQ3OltbOTE0XSwyNTZdLDEyMDU0ODpbWzkxNV0sMjU2XSwxMjA1NDk6W1s5MTZdLDI1Nl0sMTIwNTUwOltbOTE3XSwyNTZdLDEyMDU1MTpbWzkxOF0sMjU2XSwxMjA1NTI6W1s5MTldLDI1Nl0sMTIwNTUzOltbOTIwXSwyNTZdLDEyMDU1NDpbWzkyMV0sMjU2XSwxMjA1NTU6W1s5MjJdLDI1Nl0sMTIwNTU2OltbOTIzXSwyNTZdLDEyMDU1NzpbWzkyNF0sMjU2XSwxMjA1NTg6W1s5MjVdLDI1Nl0sMTIwNTU5OltbOTI2XSwyNTZdLDEyMDU2MDpbWzkyN10sMjU2XSwxMjA1NjE6W1s5MjhdLDI1Nl0sMTIwNTYyOltbOTI5XSwyNTZdLDEyMDU2MzpbWzEwMTJdLDI1Nl0sMTIwNTY0OltbOTMxXSwyNTZdLDEyMDU2NTpbWzkzMl0sMjU2XSwxMjA1NjY6W1s5MzNdLDI1Nl0sMTIwNTY3OltbOTM0XSwyNTZdLDEyMDU2ODpbWzkzNV0sMjU2XSwxMjA1Njk6W1s5MzZdLDI1Nl0sMTIwNTcwOltbOTM3XSwyNTZdLDEyMDU3MTpbWzg3MTFdLDI1Nl0sMTIwNTcyOltbOTQ1XSwyNTZdLDEyMDU3MzpbWzk0Nl0sMjU2XSwxMjA1NzQ6W1s5NDddLDI1Nl0sMTIwNTc1OltbOTQ4XSwyNTZdfSxcbjU1MDQwOnsxMjA1NzY6W1s5NDldLDI1Nl0sMTIwNTc3OltbOTUwXSwyNTZdLDEyMDU3ODpbWzk1MV0sMjU2XSwxMjA1Nzk6W1s5NTJdLDI1Nl0sMTIwNTgwOltbOTUzXSwyNTZdLDEyMDU4MTpbWzk1NF0sMjU2XSwxMjA1ODI6W1s5NTVdLDI1Nl0sMTIwNTgzOltbOTU2XSwyNTZdLDEyMDU4NDpbWzk1N10sMjU2XSwxMjA1ODU6W1s5NThdLDI1Nl0sMTIwNTg2OltbOTU5XSwyNTZdLDEyMDU4NzpbWzk2MF0sMjU2XSwxMjA1ODg6W1s5NjFdLDI1Nl0sMTIwNTg5OltbOTYyXSwyNTZdLDEyMDU5MDpbWzk2M10sMjU2XSwxMjA1OTE6W1s5NjRdLDI1Nl0sMTIwNTkyOltbOTY1XSwyNTZdLDEyMDU5MzpbWzk2Nl0sMjU2XSwxMjA1OTQ6W1s5NjddLDI1Nl0sMTIwNTk1OltbOTY4XSwyNTZdLDEyMDU5NjpbWzk2OV0sMjU2XSwxMjA1OTc6W1s4NzA2XSwyNTZdLDEyMDU5ODpbWzEwMTNdLDI1Nl0sMTIwNTk5OltbOTc3XSwyNTZdLDEyMDYwMDpbWzEwMDhdLDI1Nl0sMTIwNjAxOltbOTgxXSwyNTZdLDEyMDYwMjpbWzEwMDldLDI1Nl0sMTIwNjAzOltbOTgyXSwyNTZdLDEyMDYwNDpbWzkxM10sMjU2XSwxMjA2MDU6W1s5MTRdLDI1Nl0sMTIwNjA2OltbOTE1XSwyNTZdLDEyMDYwNzpbWzkxNl0sMjU2XSwxMjA2MDg6W1s5MTddLDI1Nl0sMTIwNjA5OltbOTE4XSwyNTZdLDEyMDYxMDpbWzkxOV0sMjU2XSwxMjA2MTE6W1s5MjBdLDI1Nl0sMTIwNjEyOltbOTIxXSwyNTZdLDEyMDYxMzpbWzkyMl0sMjU2XSwxMjA2MTQ6W1s5MjNdLDI1Nl0sMTIwNjE1OltbOTI0XSwyNTZdLDEyMDYxNjpbWzkyNV0sMjU2XSwxMjA2MTc6W1s5MjZdLDI1Nl0sMTIwNjE4OltbOTI3XSwyNTZdLDEyMDYxOTpbWzkyOF0sMjU2XSwxMjA2MjA6W1s5MjldLDI1Nl0sMTIwNjIxOltbMTAxMl0sMjU2XSwxMjA2MjI6W1s5MzFdLDI1Nl0sMTIwNjIzOltbOTMyXSwyNTZdLDEyMDYyNDpbWzkzM10sMjU2XSwxMjA2MjU6W1s5MzRdLDI1Nl0sMTIwNjI2OltbOTM1XSwyNTZdLDEyMDYyNzpbWzkzNl0sMjU2XSwxMjA2Mjg6W1s5MzddLDI1Nl0sMTIwNjI5OltbODcxMV0sMjU2XSwxMjA2MzA6W1s5NDVdLDI1Nl0sMTIwNjMxOltbOTQ2XSwyNTZdLDEyMDYzMjpbWzk0N10sMjU2XSwxMjA2MzM6W1s5NDhdLDI1Nl0sMTIwNjM0OltbOTQ5XSwyNTZdLDEyMDYzNTpbWzk1MF0sMjU2XSwxMjA2MzY6W1s5NTFdLDI1Nl0sMTIwNjM3OltbOTUyXSwyNTZdLDEyMDYzODpbWzk1M10sMjU2XSwxMjA2Mzk6W1s5NTRdLDI1Nl0sMTIwNjQwOltbOTU1XSwyNTZdLDEyMDY0MTpbWzk1Nl0sMjU2XSwxMjA2NDI6W1s5NTddLDI1Nl0sMTIwNjQzOltbOTU4XSwyNTZdLDEyMDY0NDpbWzk1OV0sMjU2XSwxMjA2NDU6W1s5NjBdLDI1Nl0sMTIwNjQ2OltbOTYxXSwyNTZdLDEyMDY0NzpbWzk2Ml0sMjU2XSwxMjA2NDg6W1s5NjNdLDI1Nl0sMTIwNjQ5OltbOTY0XSwyNTZdLDEyMDY1MDpbWzk2NV0sMjU2XSwxMjA2NTE6W1s5NjZdLDI1Nl0sMTIwNjUyOltbOTY3XSwyNTZdLDEyMDY1MzpbWzk2OF0sMjU2XSwxMjA2NTQ6W1s5NjldLDI1Nl0sMTIwNjU1OltbODcwNl0sMjU2XSwxMjA2NTY6W1sxMDEzXSwyNTZdLDEyMDY1NzpbWzk3N10sMjU2XSwxMjA2NTg6W1sxMDA4XSwyNTZdLDEyMDY1OTpbWzk4MV0sMjU2XSwxMjA2NjA6W1sxMDA5XSwyNTZdLDEyMDY2MTpbWzk4Ml0sMjU2XSwxMjA2NjI6W1s5MTNdLDI1Nl0sMTIwNjYzOltbOTE0XSwyNTZdLDEyMDY2NDpbWzkxNV0sMjU2XSwxMjA2NjU6W1s5MTZdLDI1Nl0sMTIwNjY2OltbOTE3XSwyNTZdLDEyMDY2NzpbWzkxOF0sMjU2XSwxMjA2Njg6W1s5MTldLDI1Nl0sMTIwNjY5OltbOTIwXSwyNTZdLDEyMDY3MDpbWzkyMV0sMjU2XSwxMjA2NzE6W1s5MjJdLDI1Nl0sMTIwNjcyOltbOTIzXSwyNTZdLDEyMDY3MzpbWzkyNF0sMjU2XSwxMjA2NzQ6W1s5MjVdLDI1Nl0sMTIwNjc1OltbOTI2XSwyNTZdLDEyMDY3NjpbWzkyN10sMjU2XSwxMjA2Nzc6W1s5MjhdLDI1Nl0sMTIwNjc4OltbOTI5XSwyNTZdLDEyMDY3OTpbWzEwMTJdLDI1Nl0sMTIwNjgwOltbOTMxXSwyNTZdLDEyMDY4MTpbWzkzMl0sMjU2XSwxMjA2ODI6W1s5MzNdLDI1Nl0sMTIwNjgzOltbOTM0XSwyNTZdLDEyMDY4NDpbWzkzNV0sMjU2XSwxMjA2ODU6W1s5MzZdLDI1Nl0sMTIwNjg2OltbOTM3XSwyNTZdLDEyMDY4NzpbWzg3MTFdLDI1Nl0sMTIwNjg4OltbOTQ1XSwyNTZdLDEyMDY4OTpbWzk0Nl0sMjU2XSwxMjA2OTA6W1s5NDddLDI1Nl0sMTIwNjkxOltbOTQ4XSwyNTZdLDEyMDY5MjpbWzk0OV0sMjU2XSwxMjA2OTM6W1s5NTBdLDI1Nl0sMTIwNjk0OltbOTUxXSwyNTZdLDEyMDY5NTpbWzk1Ml0sMjU2XSwxMjA2OTY6W1s5NTNdLDI1Nl0sMTIwNjk3OltbOTU0XSwyNTZdLDEyMDY5ODpbWzk1NV0sMjU2XSwxMjA2OTk6W1s5NTZdLDI1Nl0sMTIwNzAwOltbOTU3XSwyNTZdLDEyMDcwMTpbWzk1OF0sMjU2XSwxMjA3MDI6W1s5NTldLDI1Nl0sMTIwNzAzOltbOTYwXSwyNTZdLDEyMDcwNDpbWzk2MV0sMjU2XSwxMjA3MDU6W1s5NjJdLDI1Nl0sMTIwNzA2OltbOTYzXSwyNTZdLDEyMDcwNzpbWzk2NF0sMjU2XSwxMjA3MDg6W1s5NjVdLDI1Nl0sMTIwNzA5OltbOTY2XSwyNTZdLDEyMDcxMDpbWzk2N10sMjU2XSwxMjA3MTE6W1s5NjhdLDI1Nl0sMTIwNzEyOltbOTY5XSwyNTZdLDEyMDcxMzpbWzg3MDZdLDI1Nl0sMTIwNzE0OltbMTAxM10sMjU2XSwxMjA3MTU6W1s5NzddLDI1Nl0sMTIwNzE2OltbMTAwOF0sMjU2XSwxMjA3MTc6W1s5ODFdLDI1Nl0sMTIwNzE4OltbMTAwOV0sMjU2XSwxMjA3MTk6W1s5ODJdLDI1Nl0sMTIwNzIwOltbOTEzXSwyNTZdLDEyMDcyMTpbWzkxNF0sMjU2XSwxMjA3MjI6W1s5MTVdLDI1Nl0sMTIwNzIzOltbOTE2XSwyNTZdLDEyMDcyNDpbWzkxN10sMjU2XSwxMjA3MjU6W1s5MThdLDI1Nl0sMTIwNzI2OltbOTE5XSwyNTZdLDEyMDcyNzpbWzkyMF0sMjU2XSwxMjA3Mjg6W1s5MjFdLDI1Nl0sMTIwNzI5OltbOTIyXSwyNTZdLDEyMDczMDpbWzkyM10sMjU2XSwxMjA3MzE6W1s5MjRdLDI1Nl0sMTIwNzMyOltbOTI1XSwyNTZdLDEyMDczMzpbWzkyNl0sMjU2XSwxMjA3MzQ6W1s5MjddLDI1Nl0sMTIwNzM1OltbOTI4XSwyNTZdLDEyMDczNjpbWzkyOV0sMjU2XSwxMjA3Mzc6W1sxMDEyXSwyNTZdLDEyMDczODpbWzkzMV0sMjU2XSwxMjA3Mzk6W1s5MzJdLDI1Nl0sMTIwNzQwOltbOTMzXSwyNTZdLDEyMDc0MTpbWzkzNF0sMjU2XSwxMjA3NDI6W1s5MzVdLDI1Nl0sMTIwNzQzOltbOTM2XSwyNTZdLDEyMDc0NDpbWzkzN10sMjU2XSwxMjA3NDU6W1s4NzExXSwyNTZdLDEyMDc0NjpbWzk0NV0sMjU2XSwxMjA3NDc6W1s5NDZdLDI1Nl0sMTIwNzQ4OltbOTQ3XSwyNTZdLDEyMDc0OTpbWzk0OF0sMjU2XSwxMjA3NTA6W1s5NDldLDI1Nl0sMTIwNzUxOltbOTUwXSwyNTZdLDEyMDc1MjpbWzk1MV0sMjU2XSwxMjA3NTM6W1s5NTJdLDI1Nl0sMTIwNzU0OltbOTUzXSwyNTZdLDEyMDc1NTpbWzk1NF0sMjU2XSwxMjA3NTY6W1s5NTVdLDI1Nl0sMTIwNzU3OltbOTU2XSwyNTZdLDEyMDc1ODpbWzk1N10sMjU2XSwxMjA3NTk6W1s5NThdLDI1Nl0sMTIwNzYwOltbOTU5XSwyNTZdLDEyMDc2MTpbWzk2MF0sMjU2XSwxMjA3NjI6W1s5NjFdLDI1Nl0sMTIwNzYzOltbOTYyXSwyNTZdLDEyMDc2NDpbWzk2M10sMjU2XSwxMjA3NjU6W1s5NjRdLDI1Nl0sMTIwNzY2OltbOTY1XSwyNTZdLDEyMDc2NzpbWzk2Nl0sMjU2XSwxMjA3Njg6W1s5NjddLDI1Nl0sMTIwNzY5OltbOTY4XSwyNTZdLDEyMDc3MDpbWzk2OV0sMjU2XSwxMjA3NzE6W1s4NzA2XSwyNTZdLDEyMDc3MjpbWzEwMTNdLDI1Nl0sMTIwNzczOltbOTc3XSwyNTZdLDEyMDc3NDpbWzEwMDhdLDI1Nl0sMTIwNzc1OltbOTgxXSwyNTZdLDEyMDc3NjpbWzEwMDldLDI1Nl0sMTIwNzc3OltbOTgyXSwyNTZdLDEyMDc3ODpbWzk4OF0sMjU2XSwxMjA3Nzk6W1s5ODldLDI1Nl0sMTIwNzgyOltbNDhdLDI1Nl0sMTIwNzgzOltbNDldLDI1Nl0sMTIwNzg0OltbNTBdLDI1Nl0sMTIwNzg1OltbNTFdLDI1Nl0sMTIwNzg2OltbNTJdLDI1Nl0sMTIwNzg3OltbNTNdLDI1Nl0sMTIwNzg4OltbNTRdLDI1Nl0sMTIwNzg5OltbNTVdLDI1Nl0sMTIwNzkwOltbNTZdLDI1Nl0sMTIwNzkxOltbNTddLDI1Nl0sMTIwNzkyOltbNDhdLDI1Nl0sMTIwNzkzOltbNDldLDI1Nl0sMTIwNzk0OltbNTBdLDI1Nl0sMTIwNzk1OltbNTFdLDI1Nl0sMTIwNzk2OltbNTJdLDI1Nl0sMTIwNzk3OltbNTNdLDI1Nl0sMTIwNzk4OltbNTRdLDI1Nl0sMTIwNzk5OltbNTVdLDI1Nl0sMTIwODAwOltbNTZdLDI1Nl0sMTIwODAxOltbNTddLDI1Nl0sMTIwODAyOltbNDhdLDI1Nl0sMTIwODAzOltbNDldLDI1Nl0sMTIwODA0OltbNTBdLDI1Nl0sMTIwODA1OltbNTFdLDI1Nl0sMTIwODA2OltbNTJdLDI1Nl0sMTIwODA3OltbNTNdLDI1Nl0sMTIwODA4OltbNTRdLDI1Nl0sMTIwODA5OltbNTVdLDI1Nl0sMTIwODEwOltbNTZdLDI1Nl0sMTIwODExOltbNTddLDI1Nl0sMTIwODEyOltbNDhdLDI1Nl0sMTIwODEzOltbNDldLDI1Nl0sMTIwODE0OltbNTBdLDI1Nl0sMTIwODE1OltbNTFdLDI1Nl0sMTIwODE2OltbNTJdLDI1Nl0sMTIwODE3OltbNTNdLDI1Nl0sMTIwODE4OltbNTRdLDI1Nl0sMTIwODE5OltbNTVdLDI1Nl0sMTIwODIwOltbNTZdLDI1Nl0sMTIwODIxOltbNTddLDI1Nl0sMTIwODIyOltbNDhdLDI1Nl0sMTIwODIzOltbNDldLDI1Nl0sMTIwODI0OltbNTBdLDI1Nl0sMTIwODI1OltbNTFdLDI1Nl0sMTIwODI2OltbNTJdLDI1Nl0sMTIwODI3OltbNTNdLDI1Nl0sMTIwODI4OltbNTRdLDI1Nl0sMTIwODI5OltbNTVdLDI1Nl0sMTIwODMwOltbNTZdLDI1Nl0sMTIwODMxOltbNTddLDI1Nl19LFxuNjA5Mjg6ezEyNjQ2NDpbWzE1NzVdLDI1Nl0sMTI2NDY1OltbMTU3Nl0sMjU2XSwxMjY0NjY6W1sxNTgwXSwyNTZdLDEyNjQ2NzpbWzE1ODNdLDI1Nl0sMTI2NDY5OltbMTYwOF0sMjU2XSwxMjY0NzA6W1sxNTg2XSwyNTZdLDEyNjQ3MTpbWzE1ODFdLDI1Nl0sMTI2NDcyOltbMTU5MV0sMjU2XSwxMjY0NzM6W1sxNjEwXSwyNTZdLDEyNjQ3NDpbWzE2MDNdLDI1Nl0sMTI2NDc1OltbMTYwNF0sMjU2XSwxMjY0NzY6W1sxNjA1XSwyNTZdLDEyNjQ3NzpbWzE2MDZdLDI1Nl0sMTI2NDc4OltbMTU4N10sMjU2XSwxMjY0Nzk6W1sxNTkzXSwyNTZdLDEyNjQ4MDpbWzE2MDFdLDI1Nl0sMTI2NDgxOltbMTU4OV0sMjU2XSwxMjY0ODI6W1sxNjAyXSwyNTZdLDEyNjQ4MzpbWzE1ODVdLDI1Nl0sMTI2NDg0OltbMTU4OF0sMjU2XSwxMjY0ODU6W1sxNTc4XSwyNTZdLDEyNjQ4NjpbWzE1NzldLDI1Nl0sMTI2NDg3OltbMTU4Ml0sMjU2XSwxMjY0ODg6W1sxNTg0XSwyNTZdLDEyNjQ4OTpbWzE1OTBdLDI1Nl0sMTI2NDkwOltbMTU5Ml0sMjU2XSwxMjY0OTE6W1sxNTk0XSwyNTZdLDEyNjQ5MjpbWzE2NDZdLDI1Nl0sMTI2NDkzOltbMTcyMl0sMjU2XSwxMjY0OTQ6W1sxNjk3XSwyNTZdLDEyNjQ5NTpbWzE2NDddLDI1Nl0sMTI2NDk3OltbMTU3Nl0sMjU2XSwxMjY0OTg6W1sxNTgwXSwyNTZdLDEyNjUwMDpbWzE2MDddLDI1Nl0sMTI2NTAzOltbMTU4MV0sMjU2XSwxMjY1MDU6W1sxNjEwXSwyNTZdLDEyNjUwNjpbWzE2MDNdLDI1Nl0sMTI2NTA3OltbMTYwNF0sMjU2XSwxMjY1MDg6W1sxNjA1XSwyNTZdLDEyNjUwOTpbWzE2MDZdLDI1Nl0sMTI2NTEwOltbMTU4N10sMjU2XSwxMjY1MTE6W1sxNTkzXSwyNTZdLDEyNjUxMjpbWzE2MDFdLDI1Nl0sMTI2NTEzOltbMTU4OV0sMjU2XSwxMjY1MTQ6W1sxNjAyXSwyNTZdLDEyNjUxNjpbWzE1ODhdLDI1Nl0sMTI2NTE3OltbMTU3OF0sMjU2XSwxMjY1MTg6W1sxNTc5XSwyNTZdLDEyNjUxOTpbWzE1ODJdLDI1Nl0sMTI2NTIxOltbMTU5MF0sMjU2XSwxMjY1MjM6W1sxNTk0XSwyNTZdLDEyNjUzMDpbWzE1ODBdLDI1Nl0sMTI2NTM1OltbMTU4MV0sMjU2XSwxMjY1Mzc6W1sxNjEwXSwyNTZdLDEyNjUzOTpbWzE2MDRdLDI1Nl0sMTI2NTQxOltbMTYwNl0sMjU2XSwxMjY1NDI6W1sxNTg3XSwyNTZdLDEyNjU0MzpbWzE1OTNdLDI1Nl0sMTI2NTQ1OltbMTU4OV0sMjU2XSwxMjY1NDY6W1sxNjAyXSwyNTZdLDEyNjU0ODpbWzE1ODhdLDI1Nl0sMTI2NTUxOltbMTU4Ml0sMjU2XSwxMjY1NTM6W1sxNTkwXSwyNTZdLDEyNjU1NTpbWzE1OTRdLDI1Nl0sMTI2NTU3OltbMTcyMl0sMjU2XSwxMjY1NTk6W1sxNjQ3XSwyNTZdLDEyNjU2MTpbWzE1NzZdLDI1Nl0sMTI2NTYyOltbMTU4MF0sMjU2XSwxMjY1NjQ6W1sxNjA3XSwyNTZdLDEyNjU2NzpbWzE1ODFdLDI1Nl0sMTI2NTY4OltbMTU5MV0sMjU2XSwxMjY1Njk6W1sxNjEwXSwyNTZdLDEyNjU3MDpbWzE2MDNdLDI1Nl0sMTI2NTcyOltbMTYwNV0sMjU2XSwxMjY1NzM6W1sxNjA2XSwyNTZdLDEyNjU3NDpbWzE1ODddLDI1Nl0sMTI2NTc1OltbMTU5M10sMjU2XSwxMjY1NzY6W1sxNjAxXSwyNTZdLDEyNjU3NzpbWzE1ODldLDI1Nl0sMTI2NTc4OltbMTYwMl0sMjU2XSwxMjY1ODA6W1sxNTg4XSwyNTZdLDEyNjU4MTpbWzE1NzhdLDI1Nl0sMTI2NTgyOltbMTU3OV0sMjU2XSwxMjY1ODM6W1sxNTgyXSwyNTZdLDEyNjU4NTpbWzE1OTBdLDI1Nl0sMTI2NTg2OltbMTU5Ml0sMjU2XSwxMjY1ODc6W1sxNTk0XSwyNTZdLDEyNjU4ODpbWzE2NDZdLDI1Nl0sMTI2NTkwOltbMTY5N10sMjU2XSwxMjY1OTI6W1sxNTc1XSwyNTZdLDEyNjU5MzpbWzE1NzZdLDI1Nl0sMTI2NTk0OltbMTU4MF0sMjU2XSwxMjY1OTU6W1sxNTgzXSwyNTZdLDEyNjU5NjpbWzE2MDddLDI1Nl0sMTI2NTk3OltbMTYwOF0sMjU2XSwxMjY1OTg6W1sxNTg2XSwyNTZdLDEyNjU5OTpbWzE1ODFdLDI1Nl0sMTI2NjAwOltbMTU5MV0sMjU2XSwxMjY2MDE6W1sxNjEwXSwyNTZdLDEyNjYwMzpbWzE2MDRdLDI1Nl0sMTI2NjA0OltbMTYwNV0sMjU2XSwxMjY2MDU6W1sxNjA2XSwyNTZdLDEyNjYwNjpbWzE1ODddLDI1Nl0sMTI2NjA3OltbMTU5M10sMjU2XSwxMjY2MDg6W1sxNjAxXSwyNTZdLDEyNjYwOTpbWzE1ODldLDI1Nl0sMTI2NjEwOltbMTYwMl0sMjU2XSwxMjY2MTE6W1sxNTg1XSwyNTZdLDEyNjYxMjpbWzE1ODhdLDI1Nl0sMTI2NjEzOltbMTU3OF0sMjU2XSwxMjY2MTQ6W1sxNTc5XSwyNTZdLDEyNjYxNTpbWzE1ODJdLDI1Nl0sMTI2NjE2OltbMTU4NF0sMjU2XSwxMjY2MTc6W1sxNTkwXSwyNTZdLDEyNjYxODpbWzE1OTJdLDI1Nl0sMTI2NjE5OltbMTU5NF0sMjU2XSwxMjY2MjU6W1sxNTc2XSwyNTZdLDEyNjYyNjpbWzE1ODBdLDI1Nl0sMTI2NjI3OltbMTU4M10sMjU2XSwxMjY2Mjk6W1sxNjA4XSwyNTZdLDEyNjYzMDpbWzE1ODZdLDI1Nl0sMTI2NjMxOltbMTU4MV0sMjU2XSwxMjY2MzI6W1sxNTkxXSwyNTZdLDEyNjYzMzpbWzE2MTBdLDI1Nl0sMTI2NjM1OltbMTYwNF0sMjU2XSwxMjY2MzY6W1sxNjA1XSwyNTZdLDEyNjYzNzpbWzE2MDZdLDI1Nl0sMTI2NjM4OltbMTU4N10sMjU2XSwxMjY2Mzk6W1sxNTkzXSwyNTZdLDEyNjY0MDpbWzE2MDFdLDI1Nl0sMTI2NjQxOltbMTU4OV0sMjU2XSwxMjY2NDI6W1sxNjAyXSwyNTZdLDEyNjY0MzpbWzE1ODVdLDI1Nl0sMTI2NjQ0OltbMTU4OF0sMjU2XSwxMjY2NDU6W1sxNTc4XSwyNTZdLDEyNjY0NjpbWzE1NzldLDI1Nl0sMTI2NjQ3OltbMTU4Ml0sMjU2XSwxMjY2NDg6W1sxNTg0XSwyNTZdLDEyNjY0OTpbWzE1OTBdLDI1Nl0sMTI2NjUwOltbMTU5Ml0sMjU2XSwxMjY2NTE6W1sxNTk0XSwyNTZdfSxcbjYxNjk2OnsxMjcyMzI6W1s0OCw0Nl0sMjU2XSwxMjcyMzM6W1s0OCw0NF0sMjU2XSwxMjcyMzQ6W1s0OSw0NF0sMjU2XSwxMjcyMzU6W1s1MCw0NF0sMjU2XSwxMjcyMzY6W1s1MSw0NF0sMjU2XSwxMjcyMzc6W1s1Miw0NF0sMjU2XSwxMjcyMzg6W1s1Myw0NF0sMjU2XSwxMjcyMzk6W1s1NCw0NF0sMjU2XSwxMjcyNDA6W1s1NSw0NF0sMjU2XSwxMjcyNDE6W1s1Niw0NF0sMjU2XSwxMjcyNDI6W1s1Nyw0NF0sMjU2XSwxMjcyNDg6W1s0MCw2NSw0MV0sMjU2XSwxMjcyNDk6W1s0MCw2Niw0MV0sMjU2XSwxMjcyNTA6W1s0MCw2Nyw0MV0sMjU2XSwxMjcyNTE6W1s0MCw2OCw0MV0sMjU2XSwxMjcyNTI6W1s0MCw2OSw0MV0sMjU2XSwxMjcyNTM6W1s0MCw3MCw0MV0sMjU2XSwxMjcyNTQ6W1s0MCw3MSw0MV0sMjU2XSwxMjcyNTU6W1s0MCw3Miw0MV0sMjU2XSwxMjcyNTY6W1s0MCw3Myw0MV0sMjU2XSwxMjcyNTc6W1s0MCw3NCw0MV0sMjU2XSwxMjcyNTg6W1s0MCw3NSw0MV0sMjU2XSwxMjcyNTk6W1s0MCw3Niw0MV0sMjU2XSwxMjcyNjA6W1s0MCw3Nyw0MV0sMjU2XSwxMjcyNjE6W1s0MCw3OCw0MV0sMjU2XSwxMjcyNjI6W1s0MCw3OSw0MV0sMjU2XSwxMjcyNjM6W1s0MCw4MCw0MV0sMjU2XSwxMjcyNjQ6W1s0MCw4MSw0MV0sMjU2XSwxMjcyNjU6W1s0MCw4Miw0MV0sMjU2XSwxMjcyNjY6W1s0MCw4Myw0MV0sMjU2XSwxMjcyNjc6W1s0MCw4NCw0MV0sMjU2XSwxMjcyNjg6W1s0MCw4NSw0MV0sMjU2XSwxMjcyNjk6W1s0MCw4Niw0MV0sMjU2XSwxMjcyNzA6W1s0MCw4Nyw0MV0sMjU2XSwxMjcyNzE6W1s0MCw4OCw0MV0sMjU2XSwxMjcyNzI6W1s0MCw4OSw0MV0sMjU2XSwxMjcyNzM6W1s0MCw5MCw0MV0sMjU2XSwxMjcyNzQ6W1sxMjMwOCw4MywxMjMwOV0sMjU2XSwxMjcyNzU6W1s2N10sMjU2XSwxMjcyNzY6W1s4Ml0sMjU2XSwxMjcyNzc6W1s2Nyw2OF0sMjU2XSwxMjcyNzg6W1s4Nyw5MF0sMjU2XSwxMjcyODA6W1s2NV0sMjU2XSwxMjcyODE6W1s2Nl0sMjU2XSwxMjcyODI6W1s2N10sMjU2XSwxMjcyODM6W1s2OF0sMjU2XSwxMjcyODQ6W1s2OV0sMjU2XSwxMjcyODU6W1s3MF0sMjU2XSwxMjcyODY6W1s3MV0sMjU2XSwxMjcyODc6W1s3Ml0sMjU2XSwxMjcyODg6W1s3M10sMjU2XSwxMjcyODk6W1s3NF0sMjU2XSwxMjcyOTA6W1s3NV0sMjU2XSwxMjcyOTE6W1s3Nl0sMjU2XSwxMjcyOTI6W1s3N10sMjU2XSwxMjcyOTM6W1s3OF0sMjU2XSwxMjcyOTQ6W1s3OV0sMjU2XSwxMjcyOTU6W1s4MF0sMjU2XSwxMjcyOTY6W1s4MV0sMjU2XSwxMjcyOTc6W1s4Ml0sMjU2XSwxMjcyOTg6W1s4M10sMjU2XSwxMjcyOTk6W1s4NF0sMjU2XSwxMjczMDA6W1s4NV0sMjU2XSwxMjczMDE6W1s4Nl0sMjU2XSwxMjczMDI6W1s4N10sMjU2XSwxMjczMDM6W1s4OF0sMjU2XSwxMjczMDQ6W1s4OV0sMjU2XSwxMjczMDU6W1s5MF0sMjU2XSwxMjczMDY6W1s3Miw4Nl0sMjU2XSwxMjczMDc6W1s3Nyw4Nl0sMjU2XSwxMjczMDg6W1s4Myw2OF0sMjU2XSwxMjczMDk6W1s4Myw4M10sMjU2XSwxMjczMTA6W1s4MCw4MCw4Nl0sMjU2XSwxMjczMTE6W1s4Nyw2N10sMjU2XSwxMjczMzg6W1s3Nyw2N10sMjU2XSwxMjczMzk6W1s3Nyw2OF0sMjU2XSwxMjczNzY6W1s2OCw3NF0sMjU2XX0sXG42MTk1Mjp7MTI3NDg4OltbMTI0MTEsMTIzNjNdLDI1Nl0sMTI3NDg5OltbMTI0NjcsMTI0NjddLDI1Nl0sMTI3NDkwOltbMTI0NjldLDI1Nl0sMTI3NTA0OltbMjUxNjNdLDI1Nl0sMTI3NTA1OltbMjMzODNdLDI1Nl0sMTI3NTA2OltbMjE0NTJdLDI1Nl0sMTI3NTA3OltbMTI0ODddLDI1Nl0sMTI3NTA4OltbMjAxMDhdLDI1Nl0sMTI3NTA5OltbMjI4MTBdLDI1Nl0sMTI3NTEwOltbMzUyOTldLDI1Nl0sMTI3NTExOltbMjI4MjVdLDI1Nl0sMTI3NTEyOltbMjAxMzJdLDI1Nl0sMTI3NTEzOltbMjYxNDRdLDI1Nl0sMTI3NTE0OltbMjg5NjFdLDI1Nl0sMTI3NTE1OltbMjYwMDldLDI1Nl0sMTI3NTE2OltbMjEwNjldLDI1Nl0sMTI3NTE3OltbMjQ0NjBdLDI1Nl0sMTI3NTE4OltbMjA4NzddLDI1Nl0sMTI3NTE5OltbMjYwMzJdLDI1Nl0sMTI3NTIwOltbMjEwMjFdLDI1Nl0sMTI3NTIxOltbMzIwNjZdLDI1Nl0sMTI3NTIyOltbMjk5ODNdLDI1Nl0sMTI3NTIzOltbMzYwMDldLDI1Nl0sMTI3NTI0OltbMjI3NjhdLDI1Nl0sMTI3NTI1OltbMjE1NjFdLDI1Nl0sMTI3NTI2OltbMjg0MzZdLDI1Nl0sMTI3NTI3OltbMjUyMzddLDI1Nl0sMTI3NTI4OltbMjU0MjldLDI1Nl0sMTI3NTI5OltbMTk5NjhdLDI1Nl0sMTI3NTMwOltbMTk5NzddLDI1Nl0sMTI3NTMxOltbMzY5MzhdLDI1Nl0sMTI3NTMyOltbMjQwMzhdLDI1Nl0sMTI3NTMzOltbMjAwMTNdLDI1Nl0sMTI3NTM0OltbMjE0OTFdLDI1Nl0sMTI3NTM1OltbMjUzNTFdLDI1Nl0sMTI3NTM2OltbMzYyMDhdLDI1Nl0sMTI3NTM3OltbMjUxNzFdLDI1Nl0sMTI3NTM4OltbMzExMDVdLDI1Nl0sMTI3NTM5OltbMzEzNTRdLDI1Nl0sMTI3NTQwOltbMjE1MTJdLDI1Nl0sMTI3NTQxOltbMjgyODhdLDI1Nl0sMTI3NTQyOltbMjYzNzddLDI1Nl0sMTI3NTQzOltbMjYzNzZdLDI1Nl0sMTI3NTQ0OltbMzAwMDNdLDI1Nl0sMTI3NTQ1OltbMjExMDZdLDI1Nl0sMTI3NTQ2OltbMjE5NDJdLDI1Nl0sMTI3NTUyOltbMTIzMDgsMjY0MTIsMTIzMDldLDI1Nl0sMTI3NTUzOltbMTIzMDgsMTk5NzcsMTIzMDldLDI1Nl0sMTI3NTU0OltbMTIzMDgsMjAxMDgsMTIzMDldLDI1Nl0sMTI3NTU1OltbMTIzMDgsMjM0MzMsMTIzMDldLDI1Nl0sMTI3NTU2OltbMTIzMDgsMjg4NTcsMTIzMDldLDI1Nl0sMTI3NTU3OltbMTIzMDgsMjUxNzEsMTIzMDldLDI1Nl0sMTI3NTU4OltbMTIzMDgsMzA0MjMsMTIzMDldLDI1Nl0sMTI3NTU5OltbMTIzMDgsMjEyMTMsMTIzMDldLDI1Nl0sMTI3NTYwOltbMTIzMDgsMjU5NDMsMTIzMDldLDI1Nl0sMTI3NTY4OltbMjQ0NzFdLDI1Nl0sMTI3NTY5OltbMjE0ODddLDI1Nl19LFxuNjM0ODg6ezE5NDU2MDpbWzIwMDI5XV0sMTk0NTYxOltbMjAwMjRdXSwxOTQ1NjI6W1syMDAzM11dLDE5NDU2MzpbWzEzMTM2Ml1dLDE5NDU2NDpbWzIwMzIwXV0sMTk0NTY1OltbMjAzOThdXSwxOTQ1NjY6W1syMDQxMV1dLDE5NDU2NzpbWzIwNDgyXV0sMTk0NTY4OltbMjA2MDJdXSwxOTQ1Njk6W1syMDYzM11dLDE5NDU3MDpbWzIwNzExXV0sMTk0NTcxOltbMjA2ODddXSwxOTQ1NzI6W1sxMzQ3MF1dLDE5NDU3MzpbWzEzMjY2Nl1dLDE5NDU3NDpbWzIwODEzXV0sMTk0NTc1OltbMjA4MjBdXSwxOTQ1NzY6W1syMDgzNl1dLDE5NDU3NzpbWzIwODU1XV0sMTk0NTc4OltbMTMyMzgwXV0sMTk0NTc5OltbMTM0OTddXSwxOTQ1ODA6W1syMDgzOV1dLDE5NDU4MTpbWzIwODc3XV0sMTk0NTgyOltbMTMyNDI3XV0sMTk0NTgzOltbMjA4ODddXSwxOTQ1ODQ6W1syMDkwMF1dLDE5NDU4NTpbWzIwMTcyXV0sMTk0NTg2OltbMjA5MDhdXSwxOTQ1ODc6W1syMDkxN11dLDE5NDU4ODpbWzE2ODQxNV1dLDE5NDU4OTpbWzIwOTgxXV0sMTk0NTkwOltbMjA5OTVdXSwxOTQ1OTE6W1sxMzUzNV1dLDE5NDU5MjpbWzIxMDUxXV0sMTk0NTkzOltbMjEwNjJdXSwxOTQ1OTQ6W1syMTEwNl1dLDE5NDU5NTpbWzIxMTExXV0sMTk0NTk2OltbMTM1ODldXSwxOTQ1OTc6W1syMTE5MV1dLDE5NDU5ODpbWzIxMTkzXV0sMTk0NTk5OltbMjEyMjBdXSwxOTQ2MDA6W1syMTI0Ml1dLDE5NDYwMTpbWzIxMjUzXV0sMTk0NjAyOltbMjEyNTRdXSwxOTQ2MDM6W1syMTI3MV1dLDE5NDYwNDpbWzIxMzIxXV0sMTk0NjA1OltbMjEzMjldXSwxOTQ2MDY6W1syMTMzOF1dLDE5NDYwNzpbWzIxMzYzXV0sMTk0NjA4OltbMjEzNzNdXSwxOTQ2MDk6W1syMTM3NV1dLDE5NDYxMDpbWzIxMzc1XV0sMTk0NjExOltbMjEzNzVdXSwxOTQ2MTI6W1sxMzM2NzZdXSwxOTQ2MTM6W1syODc4NF1dLDE5NDYxNDpbWzIxNDUwXV0sMTk0NjE1OltbMjE0NzFdXSwxOTQ2MTY6W1sxMzM5ODddXSwxOTQ2MTc6W1syMTQ4M11dLDE5NDYxODpbWzIxNDg5XV0sMTk0NjE5OltbMjE1MTBdXSwxOTQ2MjA6W1syMTY2Ml1dLDE5NDYyMTpbWzIxNTYwXV0sMTk0NjIyOltbMjE1NzZdXSwxOTQ2MjM6W1syMTYwOF1dLDE5NDYyNDpbWzIxNjY2XV0sMTk0NjI1OltbMjE3NTBdXSwxOTQ2MjY6W1syMTc3Nl1dLDE5NDYyNzpbWzIxODQzXV0sMTk0NjI4OltbMjE4NTldXSwxOTQ2Mjk6W1syMTg5Ml1dLDE5NDYzMDpbWzIxODkyXV0sMTk0NjMxOltbMjE5MTNdXSwxOTQ2MzI6W1syMTkzMV1dLDE5NDYzMzpbWzIxOTM5XV0sMTk0NjM0OltbMjE5NTRdXSwxOTQ2MzU6W1syMjI5NF1dLDE5NDYzNjpbWzIyMDIyXV0sMTk0NjM3OltbMjIyOTVdXSwxOTQ2Mzg6W1syMjA5N11dLDE5NDYzOTpbWzIyMTMyXV0sMTk0NjQwOltbMjA5OTldXSwxOTQ2NDE6W1syMjc2Nl1dLDE5NDY0MjpbWzIyNDc4XV0sMTk0NjQzOltbMjI1MTZdXSwxOTQ2NDQ6W1syMjU0MV1dLDE5NDY0NTpbWzIyNDExXV0sMTk0NjQ2OltbMjI1NzhdXSwxOTQ2NDc6W1syMjU3N11dLDE5NDY0ODpbWzIyNzAwXV0sMTk0NjQ5OltbMTM2NDIwXV0sMTk0NjUwOltbMjI3NzBdXSwxOTQ2NTE6W1syMjc3NV1dLDE5NDY1MjpbWzIyNzkwXV0sMTk0NjUzOltbMjI4MTBdXSwxOTQ2NTQ6W1syMjgxOF1dLDE5NDY1NTpbWzIyODgyXV0sMTk0NjU2OltbMTM2ODcyXV0sMTk0NjU3OltbMTM2OTM4XV0sMTk0NjU4OltbMjMwMjBdXSwxOTQ2NTk6W1syMzA2N11dLDE5NDY2MDpbWzIzMDc5XV0sMTk0NjYxOltbMjMwMDBdXSwxOTQ2NjI6W1syMzE0Ml1dLDE5NDY2MzpbWzE0MDYyXV0sMTk0NjY0OltbMTQwNzZdXSwxOTQ2NjU6W1syMzMwNF1dLDE5NDY2NjpbWzIzMzU4XV0sMTk0NjY3OltbMjMzNThdXSwxOTQ2Njg6W1sxMzc2NzJdXSwxOTQ2Njk6W1syMzQ5MV1dLDE5NDY3MDpbWzIzNTEyXV0sMTk0NjcxOltbMjM1MjddXSwxOTQ2NzI6W1syMzUzOV1dLDE5NDY3MzpbWzEzODAwOF1dLDE5NDY3NDpbWzIzNTUxXV0sMTk0Njc1OltbMjM1NThdXSwxOTQ2NzY6W1syNDQwM11dLDE5NDY3NzpbWzIzNTg2XV0sMTk0Njc4OltbMTQyMDldXSwxOTQ2Nzk6W1syMzY0OF1dLDE5NDY4MDpbWzIzNjYyXV0sMTk0NjgxOltbMjM3NDRdXSwxOTQ2ODI6W1syMzY5M11dLDE5NDY4MzpbWzEzODcyNF1dLDE5NDY4NDpbWzIzODc1XV0sMTk0Njg1OltbMTM4NzI2XV0sMTk0Njg2OltbMjM5MThdXSwxOTQ2ODc6W1syMzkxNV1dLDE5NDY4ODpbWzIzOTMyXV0sMTk0Njg5OltbMjQwMzNdXSwxOTQ2OTA6W1syNDAzNF1dLDE5NDY5MTpbWzE0MzgzXV0sMTk0NjkyOltbMjQwNjFdXSwxOTQ2OTM6W1syNDEwNF1dLDE5NDY5NDpbWzI0MTI1XV0sMTk0Njk1OltbMjQxNjldXSwxOTQ2OTY6W1sxNDQzNF1dLDE5NDY5NzpbWzEzOTY1MV1dLDE5NDY5ODpbWzE0NDYwXV0sMTk0Njk5OltbMjQyNDBdXSwxOTQ3MDA6W1syNDI0M11dLDE5NDcwMTpbWzI0MjQ2XV0sMTk0NzAyOltbMjQyNjZdXSwxOTQ3MDM6W1sxNzI5NDZdXSwxOTQ3MDQ6W1syNDMxOF1dLDE5NDcwNTpbWzE0MDA4MV1dLDE5NDcwNjpbWzE0MDA4MV1dLDE5NDcwNzpbWzMzMjgxXV0sMTk0NzA4OltbMjQzNTRdXSwxOTQ3MDk6W1syNDM1NF1dLDE5NDcxMDpbWzE0NTM1XV0sMTk0NzExOltbMTQ0MDU2XV0sMTk0NzEyOltbMTU2MTIyXV0sMTk0NzEzOltbMjQ0MThdXSwxOTQ3MTQ6W1syNDQyN11dLDE5NDcxNTpbWzE0NTYzXV0sMTk0NzE2OltbMjQ0NzRdXSwxOTQ3MTc6W1syNDUyNV1dLDE5NDcxODpbWzI0NTM1XV0sMTk0NzE5OltbMjQ1NjldXSwxOTQ3MjA6W1syNDcwNV1dLDE5NDcyMTpbWzE0NjUwXV0sMTk0NzIyOltbMTQ2MjBdXSwxOTQ3MjM6W1syNDcyNF1dLDE5NDcyNDpbWzE0MTAxMl1dLDE5NDcyNTpbWzI0Nzc1XV0sMTk0NzI2OltbMjQ5MDRdXSwxOTQ3Mjc6W1syNDkwOF1dLDE5NDcyODpbWzI0OTEwXV0sMTk0NzI5OltbMjQ5MDhdXSwxOTQ3MzA6W1syNDk1NF1dLDE5NDczMTpbWzI0OTc0XV0sMTk0NzMyOltbMjUwMTBdXSwxOTQ3MzM6W1syNDk5Nl1dLDE5NDczNDpbWzI1MDA3XV0sMTk0NzM1OltbMjUwNTRdXSwxOTQ3MzY6W1syNTA3NF1dLDE5NDczNzpbWzI1MDc4XV0sMTk0NzM4OltbMjUxMDRdXSwxOTQ3Mzk6W1syNTExNV1dLDE5NDc0MDpbWzI1MTgxXV0sMTk0NzQxOltbMjUyNjVdXSwxOTQ3NDI6W1syNTMwMF1dLDE5NDc0MzpbWzI1NDI0XV0sMTk0NzQ0OltbMTQyMDkyXV0sMTk0NzQ1OltbMjU0MDVdXSwxOTQ3NDY6W1syNTM0MF1dLDE5NDc0NzpbWzI1NDQ4XV0sMTk0NzQ4OltbMjU0NzVdXSwxOTQ3NDk6W1syNTU3Ml1dLDE5NDc1MDpbWzE0MjMyMV1dLDE5NDc1MTpbWzI1NjM0XV0sMTk0NzUyOltbMjU1NDFdXSwxOTQ3NTM6W1syNTUxM11dLDE5NDc1NDpbWzE0ODk0XV0sMTk0NzU1OltbMjU3MDVdXSwxOTQ3NTY6W1syNTcyNl1dLDE5NDc1NzpbWzI1NzU3XV0sMTk0NzU4OltbMjU3MTldXSwxOTQ3NTk6W1sxNDk1Nl1dLDE5NDc2MDpbWzI1OTM1XV0sMTk0NzYxOltbMjU5NjRdXSwxOTQ3NjI6W1sxNDMzNzBdXSwxOTQ3NjM6W1syNjA4M11dLDE5NDc2NDpbWzI2MzYwXV0sMTk0NzY1OltbMjYxODVdXSwxOTQ3NjY6W1sxNTEyOV1dLDE5NDc2NzpbWzI2MjU3XV0sMTk0NzY4OltbMTUxMTJdXSwxOTQ3Njk6W1sxNTA3Nl1dLDE5NDc3MDpbWzIwODgyXV0sMTk0NzcxOltbMjA4ODVdXSwxOTQ3NzI6W1syNjM2OF1dLDE5NDc3MzpbWzI2MjY4XV0sMTk0Nzc0OltbMzI5NDFdXSwxOTQ3NzU6W1sxNzM2OV1dLDE5NDc3NjpbWzI2MzkxXV0sMTk0Nzc3OltbMjYzOTVdXSwxOTQ3Nzg6W1syNjQwMV1dLDE5NDc3OTpbWzI2NDYyXV0sMTk0NzgwOltbMjY0NTFdXSwxOTQ3ODE6W1sxNDQzMjNdXSwxOTQ3ODI6W1sxNTE3N11dLDE5NDc4MzpbWzI2NjE4XV0sMTk0Nzg0OltbMjY1MDFdXSwxOTQ3ODU6W1syNjcwNl1dLDE5NDc4NjpbWzI2NzU3XV0sMTk0Nzg3OltbMTQ0NDkzXV0sMTk0Nzg4OltbMjY3NjZdXSwxOTQ3ODk6W1syNjY1NV1dLDE5NDc5MDpbWzI2OTAwXV0sMTk0NzkxOltbMTUyNjFdXSwxOTQ3OTI6W1syNjk0Nl1dLDE5NDc5MzpbWzI3MDQzXV0sMTk0Nzk0OltbMjcxMTRdXSwxOTQ3OTU6W1syNzMwNF1dLDE5NDc5NjpbWzE0NTA1OV1dLDE5NDc5NzpbWzI3MzU1XV0sMTk0Nzk4OltbMTUzODRdXSwxOTQ3OTk6W1syNzQyNV1dLDE5NDgwMDpbWzE0NTU3NV1dLDE5NDgwMTpbWzI3NDc2XV0sMTk0ODAyOltbMTU0MzhdXSwxOTQ4MDM6W1syNzUwNl1dLDE5NDgwNDpbWzI3NTUxXV0sMTk0ODA1OltbMjc1NzhdXSwxOTQ4MDY6W1syNzU3OV1dLDE5NDgwNzpbWzE0NjA2MV1dLDE5NDgwODpbWzEzODUwN11dLDE5NDgwOTpbWzE0NjE3MF1dLDE5NDgxMDpbWzI3NzI2XV0sMTk0ODExOltbMTQ2NjIwXV0sMTk0ODEyOltbMjc4MzldXSwxOTQ4MTM6W1syNzg1M11dLDE5NDgxNDpbWzI3NzUxXV0sMTk0ODE1OltbMjc5MjZdXX0sXG42Mzc0NDp7NjM3NDQ6W1szNTkxMl1dLDYzNzQ1OltbMjYzNTZdXSw2Mzc0NjpbWzM2NTU0XV0sNjM3NDc6W1szNjA0MF1dLDYzNzQ4OltbMjgzNjldXSw2Mzc0OTpbWzIwMDE4XV0sNjM3NTA6W1syMTQ3N11dLDYzNzUxOltbNDA4NjBdXSw2Mzc1MjpbWzQwODYwXV0sNjM3NTM6W1syMjg2NV1dLDYzNzU0OltbMzczMjldXSw2Mzc1NTpbWzIxODk1XV0sNjM3NTY6W1syMjg1Nl1dLDYzNzU3OltbMjUwNzhdXSw2Mzc1ODpbWzMwMzEzXV0sNjM3NTk6W1szMjY0NV1dLDYzNzYwOltbMzQzNjddXSw2Mzc2MTpbWzM0NzQ2XV0sNjM3NjI6W1szNTA2NF1dLDYzNzYzOltbMzcwMDddXSw2Mzc2NDpbWzI3MTM4XV0sNjM3NjU6W1syNzkzMV1dLDYzNzY2OltbMjg4ODldXSw2Mzc2NzpbWzI5NjYyXV0sNjM3Njg6W1szMzg1M11dLDYzNzY5OltbMzcyMjZdXSw2Mzc3MDpbWzM5NDA5XV0sNjM3NzE6W1syMDA5OF1dLDYzNzcyOltbMjEzNjVdXSw2Mzc3MzpbWzI3Mzk2XV0sNjM3NzQ6W1syOTIxMV1dLDYzNzc1OltbMzQzNDldXSw2Mzc3NjpbWzQwNDc4XV0sNjM3Nzc6W1syMzg4OF1dLDYzNzc4OltbMjg2NTFdXSw2Mzc3OTpbWzM0MjUzXV0sNjM3ODA6W1szNTE3Ml1dLDYzNzgxOltbMjUyODldXSw2Mzc4MjpbWzMzMjQwXV0sNjM3ODM6W1szNDg0N11dLDYzNzg0OltbMjQyNjZdXSw2Mzc4NTpbWzI2MzkxXV0sNjM3ODY6W1syODAxMF1dLDYzNzg3OltbMjk0MzZdXSw2Mzc4ODpbWzM3MDcwXV0sNjM3ODk6W1syMDM1OF1dLDYzNzkwOltbMjA5MTldXSw2Mzc5MTpbWzIxMjE0XV0sNjM3OTI6W1syNTc5Nl1dLDYzNzkzOltbMjczNDddXSw2Mzc5NDpbWzI5MjAwXV0sNjM3OTU6W1szMDQzOV1dLDYzNzk2OltbMzI3NjldXSw2Mzc5NzpbWzM0MzEwXV0sNjM3OTg6W1szNDM5Nl1dLDYzNzk5OltbMzYzMzVdXSw2MzgwMDpbWzM4NzA2XV0sNjM4MDE6W1szOTc5MV1dLDYzODAyOltbNDA0NDJdXSw2MzgwMzpbWzMwODYwXV0sNjM4MDQ6W1szMTEwM11dLDYzODA1OltbMzIxNjBdXSw2MzgwNjpbWzMzNzM3XV0sNjM4MDc6W1szNzYzNl1dLDYzODA4OltbNDA1NzVdXSw2MzgwOTpbWzM1NTQyXV0sNjM4MTA6W1syMjc1MV1dLDYzODExOltbMjQzMjRdXSw2MzgxMjpbWzMxODQwXV0sNjM4MTM6W1szMjg5NF1dLDYzODE0OltbMjkyODJdXSw2MzgxNTpbWzMwOTIyXV0sNjM4MTY6W1szNjAzNF1dLDYzODE3OltbMzg2NDddXSw2MzgxODpbWzIyNzQ0XV0sNjM4MTk6W1syMzY1MF1dLDYzODIwOltbMjcxNTVdXSw2MzgyMTpbWzI4MTIyXV0sNjM4MjI6W1syODQzMV1dLDYzODIzOltbMzIwNDddXSw2MzgyNDpbWzMyMzExXV0sNjM4MjU6W1szODQ3NV1dLDYzODI2OltbMjEyMDJdXSw2MzgyNzpbWzMyOTA3XV0sNjM4Mjg6W1syMDk1Nl1dLDYzODI5OltbMjA5NDBdXSw2MzgzMDpbWzMxMjYwXV0sNjM4MzE6W1szMjE5MF1dLDYzODMyOltbMzM3NzddXSw2MzgzMzpbWzM4NTE3XV0sNjM4MzQ6W1szNTcxMl1dLDYzODM1OltbMjUyOTVdXSw2MzgzNjpbWzI3MTM4XV0sNjM4Mzc6W1szNTU4Ml1dLDYzODM4OltbMjAwMjVdXSw2MzgzOTpbWzIzNTI3XV0sNjM4NDA6W1syNDU5NF1dLDYzODQxOltbMjk1NzVdXSw2Mzg0MjpbWzMwMDY0XV0sNjM4NDM6W1syMTI3MV1dLDYzODQ0OltbMzA5NzFdXSw2Mzg0NTpbWzIwNDE1XV0sNjM4NDY6W1syNDQ4OV1dLDYzODQ3OltbMTk5ODFdXSw2Mzg0ODpbWzI3ODUyXV0sNjM4NDk6W1syNTk3Nl1dLDYzODUwOltbMzIwMzRdXSw2Mzg1MTpbWzIxNDQzXV0sNjM4NTI6W1syMjYyMl1dLDYzODUzOltbMzA0NjVdXSw2Mzg1NDpbWzMzODY1XV0sNjM4NTU6W1szNTQ5OF1dLDYzODU2OltbMjc1NzhdXSw2Mzg1NzpbWzM2Nzg0XV0sNjM4NTg6W1syNzc4NF1dLDYzODU5OltbMjUzNDJdXSw2Mzg2MDpbWzMzNTA5XV0sNjM4NjE6W1syNTUwNF1dLDYzODYyOltbMzAwNTNdXSw2Mzg2MzpbWzIwMTQyXV0sNjM4NjQ6W1syMDg0MV1dLDYzODY1OltbMjA5MzddXSw2Mzg2NjpbWzI2NzUzXV0sNjM4Njc6W1szMTk3NV1dLDYzODY4OltbMzMzOTFdXSw2Mzg2OTpbWzM1NTM4XV0sNjM4NzA6W1szNzMyN11dLDYzODcxOltbMjEyMzddXSw2Mzg3MjpbWzIxNTcwXV0sNjM4NzM6W1syMjg5OV1dLDYzODc0OltbMjQzMDBdXSw2Mzg3NTpbWzI2MDUzXV0sNjM4NzY6W1syODY3MF1dLDYzODc3OltbMzEwMThdXSw2Mzg3ODpbWzM4MzE3XV0sNjM4Nzk6W1szOTUzMF1dLDYzODgwOltbNDA1OTldXSw2Mzg4MTpbWzQwNjU0XV0sNjM4ODI6W1syMTE0N11dLDYzODgzOltbMjYzMTBdXSw2Mzg4NDpbWzI3NTExXV0sNjM4ODU6W1szNjcwNl1dLDYzODg2OltbMjQxODBdXSw2Mzg4NzpbWzI0OTc2XV0sNjM4ODg6W1syNTA4OF1dLDYzODg5OltbMjU3NTRdXSw2Mzg5MDpbWzI4NDUxXV0sNjM4OTE6W1syOTAwMV1dLDYzODkyOltbMjk4MzNdXSw2Mzg5MzpbWzMxMTc4XV0sNjM4OTQ6W1szMjI0NF1dLDYzODk1OltbMzI4NzldXSw2Mzg5NjpbWzM2NjQ2XV0sNjM4OTc6W1szNDAzMF1dLDYzODk4OltbMzY4OTldXSw2Mzg5OTpbWzM3NzA2XV0sNjM5MDA6W1syMTAxNV1dLDYzOTAxOltbMjExNTVdXSw2MzkwMjpbWzIxNjkzXV0sNjM5MDM6W1syODg3Ml1dLDYzOTA0OltbMzUwMTBdXSw2MzkwNTpbWzM1NDk4XV0sNjM5MDY6W1syNDI2NV1dLDYzOTA3OltbMjQ1NjVdXSw2MzkwODpbWzI1NDY3XV0sNjM5MDk6W1syNzU2Nl1dLDYzOTEwOltbMzE4MDZdXSw2MzkxMTpbWzI5NTU3XV0sNjM5MTI6W1syMDE5Nl1dLDYzOTEzOltbMjIyNjVdXSw2MzkxNDpbWzIzNTI3XV0sNjM5MTU6W1syMzk5NF1dLDYzOTE2OltbMjQ2MDRdXSw2MzkxNzpbWzI5NjE4XV0sNjM5MTg6W1syOTgwMV1dLDYzOTE5OltbMzI2NjZdXSw2MzkyMDpbWzMyODM4XV0sNjM5MjE6W1szNzQyOF1dLDYzOTIyOltbMzg2NDZdXSw2MzkyMzpbWzM4NzI4XV0sNjM5MjQ6W1szODkzNl1dLDYzOTI1OltbMjAzNjNdXSw2MzkyNjpbWzMxMTUwXV0sNjM5Mjc6W1szNzMwMF1dLDYzOTI4OltbMzg1ODRdXSw2MzkyOTpbWzI0ODAxXV0sNjM5MzA6W1syMDEwMl1dLDYzOTMxOltbMjA2OThdXSw2MzkzMjpbWzIzNTM0XV0sNjM5MzM6W1syMzYxNV1dLDYzOTM0OltbMjYwMDldXSw2MzkzNTpbWzI3MTM4XV0sNjM5MzY6W1syOTEzNF1dLDYzOTM3OltbMzAyNzRdXSw2MzkzODpbWzM0MDQ0XV0sNjM5Mzk6W1szNjk4OF1dLDYzOTQwOltbNDA4NDVdXSw2Mzk0MTpbWzI2MjQ4XV0sNjM5NDI6W1szODQ0Nl1dLDYzOTQzOltbMjExMjldXSw2Mzk0NDpbWzI2NDkxXV0sNjM5NDU6W1syNjYxMV1dLDYzOTQ2OltbMjc5NjldXSw2Mzk0NzpbWzI4MzE2XV0sNjM5NDg6W1syOTcwNV1dLDYzOTQ5OltbMzAwNDFdXSw2Mzk1MDpbWzMwODI3XV0sNjM5NTE6W1szMjAxNl1dLDYzOTUyOltbMzkwMDZdXSw2Mzk1MzpbWzIwODQ1XV0sNjM5NTQ6W1syNTEzNF1dLDYzOTU1OltbMzg1MjBdXSw2Mzk1NjpbWzIwNTIzXV0sNjM5NTc6W1syMzgzM11dLDYzOTU4OltbMjgxMzhdXSw2Mzk1OTpbWzM2NjUwXV0sNjM5NjA6W1syNDQ1OV1dLDYzOTYxOltbMjQ5MDBdXSw2Mzk2MjpbWzI2NjQ3XV0sNjM5NjM6W1syOTU3NV1dLDYzOTY0OltbMzg1MzRdXSw2Mzk2NTpbWzIxMDMzXV0sNjM5NjY6W1syMTUxOV1dLDYzOTY3OltbMjM2NTNdXSw2Mzk2ODpbWzI2MTMxXV0sNjM5Njk6W1syNjQ0Nl1dLDYzOTcwOltbMjY3OTJdXSw2Mzk3MTpbWzI3ODc3XV0sNjM5NzI6W1syOTcwMl1dLDYzOTczOltbMzAxNzhdXSw2Mzk3NDpbWzMyNjMzXV0sNjM5NzU6W1szNTAyM11dLDYzOTc2OltbMzUwNDFdXSw2Mzk3NzpbWzM3MzI0XV0sNjM5Nzg6W1szODYyNl1dLDYzOTc5OltbMjEzMTFdXSw2Mzk4MDpbWzI4MzQ2XV0sNjM5ODE6W1syMTUzM11dLDYzOTgyOltbMjkxMzZdXSw2Mzk4MzpbWzI5ODQ4XV0sNjM5ODQ6W1szNDI5OF1dLDYzOTg1OltbMzg1NjNdXSw2Mzk4NjpbWzQwMDIzXV0sNjM5ODc6W1s0MDYwN11dLDYzOTg4OltbMjY1MTldXSw2Mzk4OTpbWzI4MTA3XV0sNjM5OTA6W1szMzI1Nl1dLDYzOTkxOltbMzE0MzVdXSw2Mzk5MjpbWzMxNTIwXV0sNjM5OTM6W1szMTg5MF1dLDYzOTk0OltbMjkzNzZdXSw2Mzk5NTpbWzI4ODI1XV0sNjM5OTY6W1szNTY3Ml1dLDYzOTk3OltbMjAxNjBdXSw2Mzk5ODpbWzMzNTkwXV0sNjM5OTk6W1syMTA1MF1dLDE5NDgxNjpbWzI3OTY2XV0sMTk0ODE3OltbMjgwMjNdXSwxOTQ4MTg6W1syNzk2OV1dLDE5NDgxOTpbWzI4MDA5XV0sMTk0ODIwOltbMjgwMjRdXSwxOTQ4MjE6W1syODAzN11dLDE5NDgyMjpbWzE0NjcxOF1dLDE5NDgyMzpbWzI3OTU2XV0sMTk0ODI0OltbMjgyMDddXSwxOTQ4MjU6W1syODI3MF1dLDE5NDgyNjpbWzE1NjY3XV0sMTk0ODI3OltbMjgzNjNdXSwxOTQ4Mjg6W1syODM1OV1dLDE5NDgyOTpbWzE0NzE1M11dLDE5NDgzMDpbWzI4MTUzXV0sMTk0ODMxOltbMjg1MjZdXSwxOTQ4MzI6W1sxNDcyOTRdXSwxOTQ4MzM6W1sxNDczNDJdXSwxOTQ4MzQ6W1syODYxNF1dLDE5NDgzNTpbWzI4NzI5XV0sMTk0ODM2OltbMjg3MDJdXSwxOTQ4Mzc6W1syODY5OV1dLDE5NDgzODpbWzE1NzY2XV0sMTk0ODM5OltbMjg3NDZdXSwxOTQ4NDA6W1syODc5N11dLDE5NDg0MTpbWzI4NzkxXV0sMTk0ODQyOltbMjg4NDVdXSwxOTQ4NDM6W1sxMzIzODldXSwxOTQ4NDQ6W1syODk5N11dLDE5NDg0NTpbWzE0ODA2N11dLDE5NDg0NjpbWzI5MDg0XV0sMTk0ODQ3OltbMTQ4Mzk1XV0sMTk0ODQ4OltbMjkyMjRdXSwxOTQ4NDk6W1syOTIzN11dLDE5NDg1MDpbWzI5MjY0XV0sMTk0ODUxOltbMTQ5MDAwXV0sMTk0ODUyOltbMjkzMTJdXSwxOTQ4NTM6W1syOTMzM11dLDE5NDg1NDpbWzE0OTMwMV1dLDE5NDg1NTpbWzE0OTUyNF1dLDE5NDg1NjpbWzI5NTYyXV0sMTk0ODU3OltbMjk1NzldXSwxOTQ4NTg6W1sxNjA0NF1dLDE5NDg1OTpbWzI5NjA1XV0sMTk0ODYwOltbMTYwNTZdXSwxOTQ4NjE6W1sxNjA1Nl1dLDE5NDg2MjpbWzI5NzY3XV0sMTk0ODYzOltbMjk3ODhdXSwxOTQ4NjQ6W1syOTgwOV1dLDE5NDg2NTpbWzI5ODI5XV0sMTk0ODY2OltbMjk4OThdXSwxOTQ4Njc6W1sxNjE1NV1dLDE5NDg2ODpbWzI5OTg4XV0sMTk0ODY5OltbMTUwNTgyXV0sMTk0ODcwOltbMzAwMTRdXSwxOTQ4NzE6W1sxNTA2NzRdXSwxOTQ4NzI6W1szMDA2NF1dLDE5NDg3MzpbWzEzOTY3OV1dLDE5NDg3NDpbWzMwMjI0XV0sMTk0ODc1OltbMTUxNDU3XV0sMTk0ODc2OltbMTUxNDgwXV0sMTk0ODc3OltbMTUxNjIwXV0sMTk0ODc4OltbMTYzODBdXSwxOTQ4Nzk6W1sxNjM5Ml1dLDE5NDg4MDpbWzMwNDUyXV0sMTk0ODgxOltbMTUxNzk1XV0sMTk0ODgyOltbMTUxNzk0XV0sMTk0ODgzOltbMTUxODMzXV0sMTk0ODg0OltbMTUxODU5XV0sMTk0ODg1OltbMzA0OTRdXSwxOTQ4ODY6W1szMDQ5NV1dLDE5NDg4NzpbWzMwNDk1XV0sMTk0ODg4OltbMzA1MzhdXSwxOTQ4ODk6W1sxNjQ0MV1dLDE5NDg5MDpbWzMwNjAzXV0sMTk0ODkxOltbMTY0NTRdXSwxOTQ4OTI6W1sxNjUzNF1dLDE5NDg5MzpbWzE1MjYwNV1dLDE5NDg5NDpbWzMwNzk4XV0sMTk0ODk1OltbMzA4NjBdXSwxOTQ4OTY6W1szMDkyNF1dLDE5NDg5NzpbWzE2NjExXV0sMTk0ODk4OltbMTUzMTI2XV0sMTk0ODk5OltbMzEwNjJdXSwxOTQ5MDA6W1sxNTMyNDJdXSwxOTQ5MDE6W1sxNTMyODVdXSwxOTQ5MDI6W1szMTExOV1dLDE5NDkwMzpbWzMxMjExXV0sMTk0OTA0OltbMTY2ODddXSwxOTQ5MDU6W1szMTI5Nl1dLDE5NDkwNjpbWzMxMzA2XV0sMTk0OTA3OltbMzEzMTFdXSwxOTQ5MDg6W1sxNTM5ODBdXSwxOTQ5MDk6W1sxNTQyNzldXSwxOTQ5MTA6W1sxNTQyNzldXSwxOTQ5MTE6W1szMTQ3MF1dLDE5NDkxMjpbWzE2ODk4XV0sMTk0OTEzOltbMTU0NTM5XV0sMTk0OTE0OltbMzE2ODZdXSwxOTQ5MTU6W1szMTY4OV1dLDE5NDkxNjpbWzE2OTM1XV0sMTk0OTE3OltbMTU0NzUyXV0sMTk0OTE4OltbMzE5NTRdXSwxOTQ5MTk6W1sxNzA1Nl1dLDE5NDkyMDpbWzMxOTc2XV0sMTk0OTIxOltbMzE5NzFdXSwxOTQ5MjI6W1szMjAwMF1dLDE5NDkyMzpbWzE1NTUyNl1dLDE5NDkyNDpbWzMyMDk5XV0sMTk0OTI1OltbMTcxNTNdXSwxOTQ5MjY6W1szMjE5OV1dLDE5NDkyNzpbWzMyMjU4XV0sMTk0OTI4OltbMzIzMjVdXSwxOTQ5Mjk6W1sxNzIwNF1dLDE5NDkzMDpbWzE1NjIwMF1dLDE5NDkzMTpbWzE1NjIzMV1dLDE5NDkzMjpbWzE3MjQxXV0sMTk0OTMzOltbMTU2Mzc3XV0sMTk0OTM0OltbMzI2MzRdXSwxOTQ5MzU6W1sxNTY0NzhdXSwxOTQ5MzY6W1szMjY2MV1dLDE5NDkzNzpbWzMyNzYyXV0sMTk0OTM4OltbMzI3NzNdXSwxOTQ5Mzk6W1sxNTY4OTBdXSwxOTQ5NDA6W1sxNTY5NjNdXSwxOTQ5NDE6W1szMjg2NF1dLDE5NDk0MjpbWzE1NzA5Nl1dLDE5NDk0MzpbWzMyODgwXV0sMTk0OTQ0OltbMTQ0MjIzXV0sMTk0OTQ1OltbMTczNjVdXSwxOTQ5NDY6W1szMjk0Nl1dLDE5NDk0NzpbWzMzMDI3XV0sMTk0OTQ4OltbMTc0MTldXSwxOTQ5NDk6W1szMzA4Nl1dLDE5NDk1MDpbWzIzMjIxXV0sMTk0OTUxOltbMTU3NjA3XV0sMTk0OTUyOltbMTU3NjIxXV0sMTk0OTUzOltbMTQ0Mjc1XV0sMTk0OTU0OltbMTQ0Mjg0XV0sMTk0OTU1OltbMzMyODFdXSwxOTQ5NTY6W1szMzI4NF1dLDE5NDk1NzpbWzM2NzY2XV0sMTk0OTU4OltbMTc1MTVdXSwxOTQ5NTk6W1szMzQyNV1dLDE5NDk2MDpbWzMzNDE5XV0sMTk0OTYxOltbMzM0MzddXSwxOTQ5NjI6W1syMTE3MV1dLDE5NDk2MzpbWzMzNDU3XV0sMTk0OTY0OltbMzM0NTldXSwxOTQ5NjU6W1szMzQ2OV1dLDE5NDk2NjpbWzMzNTEwXV0sMTk0OTY3OltbMTU4NTI0XV0sMTk0OTY4OltbMzM1MDldXSwxOTQ5Njk6W1szMzU2NV1dLDE5NDk3MDpbWzMzNjM1XV0sMTk0OTcxOltbMzM3MDldXSwxOTQ5NzI6W1szMzU3MV1dLDE5NDk3MzpbWzMzNzI1XV0sMTk0OTc0OltbMzM3NjddXSwxOTQ5NzU6W1szMzg3OV1dLDE5NDk3NjpbWzMzNjE5XV0sMTk0OTc3OltbMzM3MzhdXSwxOTQ5Nzg6W1szMzc0MF1dLDE5NDk3OTpbWzMzNzU2XV0sMTk0OTgwOltbMTU4Nzc0XV0sMTk0OTgxOltbMTU5MDgzXV0sMTk0OTgyOltbMTU4OTMzXV0sMTk0OTgzOltbMTc3MDddXSwxOTQ5ODQ6W1szNDAzM11dLDE5NDk4NTpbWzM0MDM1XV0sMTk0OTg2OltbMzQwNzBdXSwxOTQ5ODc6W1sxNjA3MTRdXSwxOTQ5ODg6W1szNDE0OF1dLDE5NDk4OTpbWzE1OTUzMl1dLDE5NDk5MDpbWzE3NzU3XV0sMTk0OTkxOltbMTc3NjFdXSwxOTQ5OTI6W1sxNTk2NjVdXSwxOTQ5OTM6W1sxNTk5NTRdXSwxOTQ5OTQ6W1sxNzc3MV1dLDE5NDk5NTpbWzM0Mzg0XV0sMTk0OTk2OltbMzQzOTZdXSwxOTQ5OTc6W1szNDQwN11dLDE5NDk5ODpbWzM0NDA5XV0sMTk0OTk5OltbMzQ0NzNdXSwxOTUwMDA6W1szNDQ0MF1dLDE5NTAwMTpbWzM0NTc0XV0sMTk1MDAyOltbMzQ1MzBdXSwxOTUwMDM6W1szNDY4MV1dLDE5NTAwNDpbWzM0NjAwXV0sMTk1MDA1OltbMzQ2NjddXSwxOTUwMDY6W1szNDY5NF1dLDE5NTAwNzpbWzE3ODc5XV0sMTk1MDA4OltbMzQ3ODVdXSwxOTUwMDk6W1szNDgxN11dLDE5NTAxMDpbWzE3OTEzXV0sMTk1MDExOltbMzQ5MTJdXSwxOTUwMTI6W1szNDkxNV1dLDE5NTAxMzpbWzE2MTM4M11dLDE5NTAxNDpbWzM1MDMxXV0sMTk1MDE1OltbMzUwMzhdXSwxOTUwMTY6W1sxNzk3M11dLDE5NTAxNzpbWzM1MDY2XV0sMTk1MDE4OltbMTM0OTldXSwxOTUwMTk6W1sxNjE5NjZdXSwxOTUwMjA6W1sxNjIxNTBdXSwxOTUwMjE6W1sxODExMF1dLDE5NTAyMjpbWzE4MTE5XV0sMTk1MDIzOltbMzU0ODhdXSwxOTUwMjQ6W1szNTU2NV1dLDE5NTAyNTpbWzM1NzIyXV0sMTk1MDI2OltbMzU5MjVdXSwxOTUwMjc6W1sxNjI5ODRdXSwxOTUwMjg6W1szNjAxMV1dLDE5NTAyOTpbWzM2MDMzXV0sMTk1MDMwOltbMzYxMjNdXSwxOTUwMzE6W1szNjIxNV1dLDE5NTAzMjpbWzE2MzYzMV1dLDE5NTAzMzpbWzEzMzEyNF1dLDE5NTAzNDpbWzM2Mjk5XV0sMTk1MDM1OltbMzYyODRdXSwxOTUwMzY6W1szNjMzNl1dLDE5NTAzNzpbWzEzMzM0Ml1dLDE5NTAzODpbWzM2NTY0XV0sMTk1MDM5OltbMzY2NjRdXSwxOTUwNDA6W1sxNjUzMzBdXSwxOTUwNDE6W1sxNjUzNTddXSwxOTUwNDI6W1szNzAxMl1dLDE5NTA0MzpbWzM3MTA1XV0sMTk1MDQ0OltbMzcxMzddXSwxOTUwNDU6W1sxNjU2NzhdXSwxOTUwNDY6W1szNzE0N11dLDE5NTA0NzpbWzM3NDMyXV0sMTk1MDQ4OltbMzc1OTFdXSwxOTUwNDk6W1szNzU5Ml1dLDE5NTA1MDpbWzM3NTAwXV0sMTk1MDUxOltbMzc4ODFdXSwxOTUwNTI6W1szNzkwOV1dLDE5NTA1MzpbWzE2NjkwNl1dLDE5NTA1NDpbWzM4MjgzXV0sMTk1MDU1OltbMTg4MzddXSwxOTUwNTY6W1szODMyN11dLDE5NTA1NzpbWzE2NzI4N11dLDE5NTA1ODpbWzE4OTE4XV0sMTk1MDU5OltbMzg1OTVdXSwxOTUwNjA6W1syMzk4Nl1dLDE5NTA2MTpbWzM4NjkxXV0sMTk1MDYyOltbMTY4MjYxXV0sMTk1MDYzOltbMTY4NDc0XV0sMTk1MDY0OltbMTkwNTRdXSwxOTUwNjU6W1sxOTA2Ml1dLDE5NTA2NjpbWzM4ODgwXV0sMTk1MDY3OltbMTY4OTcwXV0sMTk1MDY4OltbMTkxMjJdXSwxOTUwNjk6W1sxNjkxMTBdXSwxOTUwNzA6W1szODkyM11dLDE5NTA3MTpbWzM4OTIzXV19LFxuNjQwMDA6ezY0MDAwOltbMjA5OTldXSw2NDAwMTpbWzI0MjMwXV0sNjQwMDI6W1syNTI5OV1dLDY0MDAzOltbMzE5NThdXSw2NDAwNDpbWzIzNDI5XV0sNjQwMDU6W1syNzkzNF1dLDY0MDA2OltbMjYyOTJdXSw2NDAwNzpbWzM2NjY3XV0sNjQwMDg6W1szNDg5Ml1dLDY0MDA5OltbMzg0NzddXSw2NDAxMDpbWzM1MjExXV0sNjQwMTE6W1syNDI3NV1dLDY0MDEyOltbMjA4MDBdXSw2NDAxMzpbWzIxOTUyXV0sNjQwMTY6W1syMjYxOF1dLDY0MDE4OltbMjYyMjhdXSw2NDAyMTpbWzIwOTU4XV0sNjQwMjI6W1syOTQ4Ml1dLDY0MDIzOltbMzA0MTBdXSw2NDAyNDpbWzMxMDM2XV0sNjQwMjU6W1szMTA3MF1dLDY0MDI2OltbMzEwNzddXSw2NDAyNzpbWzMxMTE5XV0sNjQwMjg6W1szODc0Ml1dLDY0MDI5OltbMzE5MzRdXSw2NDAzMDpbWzMyNzAxXV0sNjQwMzI6W1szNDMyMl1dLDY0MDM0OltbMzU1NzZdXSw2NDAzNzpbWzM2OTIwXV0sNjQwMzg6W1szNzExN11dLDY0MDQyOltbMzkxNTFdXSw2NDA0MzpbWzM5MTY0XV0sNjQwNDQ6W1szOTIwOF1dLDY0MDQ1OltbNDAzNzJdXSw2NDA0NjpbWzM3MDg2XV0sNjQwNDc6W1szODU4M11dLDY0MDQ4OltbMjAzOThdXSw2NDA0OTpbWzIwNzExXV0sNjQwNTA6W1syMDgxM11dLDY0MDUxOltbMjExOTNdXSw2NDA1MjpbWzIxMjIwXV0sNjQwNTM6W1syMTMyOV1dLDY0MDU0OltbMjE5MTddXSw2NDA1NTpbWzIyMDIyXV0sNjQwNTY6W1syMjEyMF1dLDY0MDU3OltbMjI1OTJdXSw2NDA1ODpbWzIyNjk2XV0sNjQwNTk6W1syMzY1Ml1dLDY0MDYwOltbMjM2NjJdXSw2NDA2MTpbWzI0NzI0XV0sNjQwNjI6W1syNDkzNl1dLDY0MDYzOltbMjQ5NzRdXSw2NDA2NDpbWzI1MDc0XV0sNjQwNjU6W1syNTkzNV1dLDY0MDY2OltbMjYwODJdXSw2NDA2NzpbWzI2MjU3XV0sNjQwNjg6W1syNjc1N11dLDY0MDY5OltbMjgwMjNdXSw2NDA3MDpbWzI4MTg2XV0sNjQwNzE6W1syODQ1MF1dLDY0MDcyOltbMjkwMzhdXSw2NDA3MzpbWzI5MjI3XV0sNjQwNzQ6W1syOTczMF1dLDY0MDc1OltbMzA4NjVdXSw2NDA3NjpbWzMxMDM4XV0sNjQwNzc6W1szMTA0OV1dLDY0MDc4OltbMzEwNDhdXSw2NDA3OTpbWzMxMDU2XV0sNjQwODA6W1szMTA2Ml1dLDY0MDgxOltbMzEwNjldXSw2NDA4MjpbWzMxMTE3XV0sNjQwODM6W1szMTExOF1dLDY0MDg0OltbMzEyOTZdXSw2NDA4NTpbWzMxMzYxXV0sNjQwODY6W1szMTY4MF1dLDY0MDg3OltbMzIyNDRdXSw2NDA4ODpbWzMyMjY1XV0sNjQwODk6W1szMjMyMV1dLDY0MDkwOltbMzI2MjZdXSw2NDA5MTpbWzMyNzczXV0sNjQwOTI6W1szMzI2MV1dLDY0MDkzOltbMzM0MDFdXSw2NDA5NDpbWzMzNDAxXV0sNjQwOTU6W1szMzg3OV1dLDY0MDk2OltbMzUwODhdXSw2NDA5NzpbWzM1MjIyXV0sNjQwOTg6W1szNTU4NV1dLDY0MDk5OltbMzU2NDFdXSw2NDEwMDpbWzM2MDUxXV0sNjQxMDE6W1szNjEwNF1dLDY0MTAyOltbMzY3OTBdXSw2NDEwMzpbWzM2OTIwXV0sNjQxMDQ6W1szODYyN11dLDY0MTA1OltbMzg5MTFdXSw2NDEwNjpbWzM4OTcxXV0sNjQxMDc6W1syNDY5M11dLDY0MTA4OltbMTQ4MjA2XV0sNjQxMDk6W1szMzMwNF1dLDY0MTEyOltbMjAwMDZdXSw2NDExMzpbWzIwOTE3XV0sNjQxMTQ6W1syMDg0MF1dLDY0MTE1OltbMjAzNTJdXSw2NDExNjpbWzIwODA1XV0sNjQxMTc6W1syMDg2NF1dLDY0MTE4OltbMjExOTFdXSw2NDExOTpbWzIxMjQyXV0sNjQxMjA6W1syMTkxN11dLDY0MTIxOltbMjE4NDVdXSw2NDEyMjpbWzIxOTEzXV0sNjQxMjM6W1syMTk4Nl1dLDY0MTI0OltbMjI2MThdXSw2NDEyNTpbWzIyNzA3XV0sNjQxMjY6W1syMjg1Ml1dLDY0MTI3OltbMjI4NjhdXSw2NDEyODpbWzIzMTM4XV0sNjQxMjk6W1syMzMzNl1dLDY0MTMwOltbMjQyNzRdXSw2NDEzMTpbWzI0MjgxXV0sNjQxMzI6W1syNDQyNV1dLDY0MTMzOltbMjQ0OTNdXSw2NDEzNDpbWzI0NzkyXV0sNjQxMzU6W1syNDkxMF1dLDY0MTM2OltbMjQ4NDBdXSw2NDEzNzpbWzI0OTc0XV0sNjQxMzg6W1syNDkyOF1dLDY0MTM5OltbMjUwNzRdXSw2NDE0MDpbWzI1MTQwXV0sNjQxNDE6W1syNTU0MF1dLDY0MTQyOltbMjU2MjhdXSw2NDE0MzpbWzI1NjgyXV0sNjQxNDQ6W1syNTk0Ml1dLDY0MTQ1OltbMjYyMjhdXSw2NDE0NjpbWzI2MzkxXV0sNjQxNDc6W1syNjM5NV1dLDY0MTQ4OltbMjY0NTRdXSw2NDE0OTpbWzI3NTEzXV0sNjQxNTA6W1syNzU3OF1dLDY0MTUxOltbMjc5NjldXSw2NDE1MjpbWzI4Mzc5XV0sNjQxNTM6W1syODM2M11dLDY0MTU0OltbMjg0NTBdXSw2NDE1NTpbWzI4NzAyXV0sNjQxNTY6W1syOTAzOF1dLDY0MTU3OltbMzA2MzFdXSw2NDE1ODpbWzI5MjM3XV0sNjQxNTk6W1syOTM1OV1dLDY0MTYwOltbMjk0ODJdXSw2NDE2MTpbWzI5ODA5XV0sNjQxNjI6W1syOTk1OF1dLDY0MTYzOltbMzAwMTFdXSw2NDE2NDpbWzMwMjM3XV0sNjQxNjU6W1szMDIzOV1dLDY0MTY2OltbMzA0MTBdXSw2NDE2NzpbWzMwNDI3XV0sNjQxNjg6W1szMDQ1Ml1dLDY0MTY5OltbMzA1MzhdXSw2NDE3MDpbWzMwNTI4XV0sNjQxNzE6W1szMDkyNF1dLDY0MTcyOltbMzE0MDldXSw2NDE3MzpbWzMxNjgwXV0sNjQxNzQ6W1szMTg2N11dLDY0MTc1OltbMzIwOTFdXSw2NDE3NjpbWzMyMjQ0XV0sNjQxNzc6W1szMjU3NF1dLDY0MTc4OltbMzI3NzNdXSw2NDE3OTpbWzMzNjE4XV0sNjQxODA6W1szMzc3NV1dLDY0MTgxOltbMzQ2ODFdXSw2NDE4MjpbWzM1MTM3XV0sNjQxODM6W1szNTIwNl1dLDY0MTg0OltbMzUyMjJdXSw2NDE4NTpbWzM1NTE5XV0sNjQxODY6W1szNTU3Nl1dLDY0MTg3OltbMzU1MzFdXSw2NDE4ODpbWzM1NTg1XV0sNjQxODk6W1szNTU4Ml1dLDY0MTkwOltbMzU1NjVdXSw2NDE5MTpbWzM1NjQxXV0sNjQxOTI6W1szNTcyMl1dLDY0MTkzOltbMzYxMDRdXSw2NDE5NDpbWzM2NjY0XV0sNjQxOTU6W1szNjk3OF1dLDY0MTk2OltbMzcyNzNdXSw2NDE5NzpbWzM3NDk0XV0sNjQxOTg6W1szODUyNF1dLDY0MTk5OltbMzg2MjddXSw2NDIwMDpbWzM4NzQyXV0sNjQyMDE6W1szODg3NV1dLDY0MjAyOltbMzg5MTFdXSw2NDIwMzpbWzM4OTIzXV0sNjQyMDQ6W1szODk3MV1dLDY0MjA1OltbMzk2OThdXSw2NDIwNjpbWzQwODYwXV0sNjQyMDc6W1sxNDEzODZdXSw2NDIwODpbWzE0MTM4MF1dLDY0MjA5OltbMTQ0MzQxXV0sNjQyMTA6W1sxNTI2MV1dLDY0MjExOltbMTY0MDhdXSw2NDIxMjpbWzE2NDQxXV0sNjQyMTM6W1sxNTIxMzddXSw2NDIxNDpbWzE1NDgzMl1dLDY0MjE1OltbMTYzNTM5XV0sNjQyMTY6W1s0MDc3MV1dLDY0MjE3OltbNDA4NDZdXSwxOTUwNzI6W1szODk1M11dLDE5NTA3MzpbWzE2OTM5OF1dLDE5NTA3NDpbWzM5MTM4XV0sMTk1MDc1OltbMTkyNTFdXSwxOTUwNzY6W1szOTIwOV1dLDE5NTA3NzpbWzM5MzM1XV0sMTk1MDc4OltbMzkzNjJdXSwxOTUwNzk6W1szOTQyMl1dLDE5NTA4MDpbWzE5NDA2XV0sMTk1MDgxOltbMTcwODAwXV0sMTk1MDgyOltbMzk2OThdXSwxOTUwODM6W1s0MDAwMF1dLDE5NTA4NDpbWzQwMTg5XV0sMTk1MDg1OltbMTk2NjJdXSwxOTUwODY6W1sxOTY5M11dLDE5NTA4NzpbWzQwMjk1XV0sMTk1MDg4OltbMTcyMjM4XV0sMTk1MDg5OltbMTk3MDRdXSwxOTUwOTA6W1sxNzIyOTNdXSwxOTUwOTE6W1sxNzI1NThdXSwxOTUwOTI6W1sxNzI2ODldXSwxOTUwOTM6W1s0MDYzNV1dLDE5NTA5NDpbWzE5Nzk4XV0sMTk1MDk1OltbNDA2OTddXSwxOTUwOTY6W1s0MDcwMl1dLDE5NTA5NzpbWzQwNzA5XV0sMTk1MDk4OltbNDA3MTldXSwxOTUwOTk6W1s0MDcyNl1dLDE5NTEwMDpbWzQwNzYzXV0sMTk1MTAxOltbMTczNTY4XV19LFxuNjQyNTY6ezY0MjU2OltbMTAyLDEwMl0sMjU2XSw2NDI1NzpbWzEwMiwxMDVdLDI1Nl0sNjQyNTg6W1sxMDIsMTA4XSwyNTZdLDY0MjU5OltbMTAyLDEwMiwxMDVdLDI1Nl0sNjQyNjA6W1sxMDIsMTAyLDEwOF0sMjU2XSw2NDI2MTpbWzM4MywxMTZdLDI1Nl0sNjQyNjI6W1sxMTUsMTE2XSwyNTZdLDY0Mjc1OltbMTM5NiwxMzk4XSwyNTZdLDY0Mjc2OltbMTM5NiwxMzgxXSwyNTZdLDY0Mjc3OltbMTM5NiwxMzg3XSwyNTZdLDY0Mjc4OltbMTQwNiwxMzk4XSwyNTZdLDY0Mjc5OltbMTM5NiwxMzg5XSwyNTZdLDY0Mjg1OltbMTQ5NywxNDYwXSw1MTJdLDY0Mjg2OlssMjZdLDY0Mjg3OltbMTUyMiwxNDYzXSw1MTJdLDY0Mjg4OltbMTUwNl0sMjU2XSw2NDI4OTpbWzE0ODhdLDI1Nl0sNjQyOTA6W1sxNDkxXSwyNTZdLDY0MjkxOltbMTQ5Ml0sMjU2XSw2NDI5MjpbWzE0OTldLDI1Nl0sNjQyOTM6W1sxNTAwXSwyNTZdLDY0Mjk0OltbMTUwMV0sMjU2XSw2NDI5NTpbWzE1MTJdLDI1Nl0sNjQyOTY6W1sxNTE0XSwyNTZdLDY0Mjk3OltbNDNdLDI1Nl0sNjQyOTg6W1sxNTEzLDE0NzNdLDUxMl0sNjQyOTk6W1sxNTEzLDE0NzRdLDUxMl0sNjQzMDA6W1s2NDMyOSwxNDczXSw1MTJdLDY0MzAxOltbNjQzMjksMTQ3NF0sNTEyXSw2NDMwMjpbWzE0ODgsMTQ2M10sNTEyXSw2NDMwMzpbWzE0ODgsMTQ2NF0sNTEyXSw2NDMwNDpbWzE0ODgsMTQ2OF0sNTEyXSw2NDMwNTpbWzE0ODksMTQ2OF0sNTEyXSw2NDMwNjpbWzE0OTAsMTQ2OF0sNTEyXSw2NDMwNzpbWzE0OTEsMTQ2OF0sNTEyXSw2NDMwODpbWzE0OTIsMTQ2OF0sNTEyXSw2NDMwOTpbWzE0OTMsMTQ2OF0sNTEyXSw2NDMxMDpbWzE0OTQsMTQ2OF0sNTEyXSw2NDMxMjpbWzE0OTYsMTQ2OF0sNTEyXSw2NDMxMzpbWzE0OTcsMTQ2OF0sNTEyXSw2NDMxNDpbWzE0OTgsMTQ2OF0sNTEyXSw2NDMxNTpbWzE0OTksMTQ2OF0sNTEyXSw2NDMxNjpbWzE1MDAsMTQ2OF0sNTEyXSw2NDMxODpbWzE1MDIsMTQ2OF0sNTEyXSw2NDMyMDpbWzE1MDQsMTQ2OF0sNTEyXSw2NDMyMTpbWzE1MDUsMTQ2OF0sNTEyXSw2NDMyMzpbWzE1MDcsMTQ2OF0sNTEyXSw2NDMyNDpbWzE1MDgsMTQ2OF0sNTEyXSw2NDMyNjpbWzE1MTAsMTQ2OF0sNTEyXSw2NDMyNzpbWzE1MTEsMTQ2OF0sNTEyXSw2NDMyODpbWzE1MTIsMTQ2OF0sNTEyXSw2NDMyOTpbWzE1MTMsMTQ2OF0sNTEyXSw2NDMzMDpbWzE1MTQsMTQ2OF0sNTEyXSw2NDMzMTpbWzE0OTMsMTQ2NV0sNTEyXSw2NDMzMjpbWzE0ODksMTQ3MV0sNTEyXSw2NDMzMzpbWzE0OTksMTQ3MV0sNTEyXSw2NDMzNDpbWzE1MDgsMTQ3MV0sNTEyXSw2NDMzNTpbWzE0ODgsMTUwMF0sMjU2XSw2NDMzNjpbWzE2NDldLDI1Nl0sNjQzMzc6W1sxNjQ5XSwyNTZdLDY0MzM4OltbMTY1OV0sMjU2XSw2NDMzOTpbWzE2NTldLDI1Nl0sNjQzNDA6W1sxNjU5XSwyNTZdLDY0MzQxOltbMTY1OV0sMjU2XSw2NDM0MjpbWzE2NjJdLDI1Nl0sNjQzNDM6W1sxNjYyXSwyNTZdLDY0MzQ0OltbMTY2Ml0sMjU2XSw2NDM0NTpbWzE2NjJdLDI1Nl0sNjQzNDY6W1sxNjY0XSwyNTZdLDY0MzQ3OltbMTY2NF0sMjU2XSw2NDM0ODpbWzE2NjRdLDI1Nl0sNjQzNDk6W1sxNjY0XSwyNTZdLDY0MzUwOltbMTY1OF0sMjU2XSw2NDM1MTpbWzE2NThdLDI1Nl0sNjQzNTI6W1sxNjU4XSwyNTZdLDY0MzUzOltbMTY1OF0sMjU2XSw2NDM1NDpbWzE2NjNdLDI1Nl0sNjQzNTU6W1sxNjYzXSwyNTZdLDY0MzU2OltbMTY2M10sMjU2XSw2NDM1NzpbWzE2NjNdLDI1Nl0sNjQzNTg6W1sxNjU3XSwyNTZdLDY0MzU5OltbMTY1N10sMjU2XSw2NDM2MDpbWzE2NTddLDI1Nl0sNjQzNjE6W1sxNjU3XSwyNTZdLDY0MzYyOltbMTcwMF0sMjU2XSw2NDM2MzpbWzE3MDBdLDI1Nl0sNjQzNjQ6W1sxNzAwXSwyNTZdLDY0MzY1OltbMTcwMF0sMjU2XSw2NDM2NjpbWzE3MDJdLDI1Nl0sNjQzNjc6W1sxNzAyXSwyNTZdLDY0MzY4OltbMTcwMl0sMjU2XSw2NDM2OTpbWzE3MDJdLDI1Nl0sNjQzNzA6W1sxNjY4XSwyNTZdLDY0MzcxOltbMTY2OF0sMjU2XSw2NDM3MjpbWzE2NjhdLDI1Nl0sNjQzNzM6W1sxNjY4XSwyNTZdLDY0Mzc0OltbMTY2N10sMjU2XSw2NDM3NTpbWzE2NjddLDI1Nl0sNjQzNzY6W1sxNjY3XSwyNTZdLDY0Mzc3OltbMTY2N10sMjU2XSw2NDM3ODpbWzE2NzBdLDI1Nl0sNjQzNzk6W1sxNjcwXSwyNTZdLDY0MzgwOltbMTY3MF0sMjU2XSw2NDM4MTpbWzE2NzBdLDI1Nl0sNjQzODI6W1sxNjcxXSwyNTZdLDY0MzgzOltbMTY3MV0sMjU2XSw2NDM4NDpbWzE2NzFdLDI1Nl0sNjQzODU6W1sxNjcxXSwyNTZdLDY0Mzg2OltbMTY3N10sMjU2XSw2NDM4NzpbWzE2NzddLDI1Nl0sNjQzODg6W1sxNjc2XSwyNTZdLDY0Mzg5OltbMTY3Nl0sMjU2XSw2NDM5MDpbWzE2NzhdLDI1Nl0sNjQzOTE6W1sxNjc4XSwyNTZdLDY0MzkyOltbMTY3Ml0sMjU2XSw2NDM5MzpbWzE2NzJdLDI1Nl0sNjQzOTQ6W1sxNjg4XSwyNTZdLDY0Mzk1OltbMTY4OF0sMjU2XSw2NDM5NjpbWzE2ODFdLDI1Nl0sNjQzOTc6W1sxNjgxXSwyNTZdLDY0Mzk4OltbMTcwNV0sMjU2XSw2NDM5OTpbWzE3MDVdLDI1Nl0sNjQ0MDA6W1sxNzA1XSwyNTZdLDY0NDAxOltbMTcwNV0sMjU2XSw2NDQwMjpbWzE3MTFdLDI1Nl0sNjQ0MDM6W1sxNzExXSwyNTZdLDY0NDA0OltbMTcxMV0sMjU2XSw2NDQwNTpbWzE3MTFdLDI1Nl0sNjQ0MDY6W1sxNzE1XSwyNTZdLDY0NDA3OltbMTcxNV0sMjU2XSw2NDQwODpbWzE3MTVdLDI1Nl0sNjQ0MDk6W1sxNzE1XSwyNTZdLDY0NDEwOltbMTcxM10sMjU2XSw2NDQxMTpbWzE3MTNdLDI1Nl0sNjQ0MTI6W1sxNzEzXSwyNTZdLDY0NDEzOltbMTcxM10sMjU2XSw2NDQxNDpbWzE3MjJdLDI1Nl0sNjQ0MTU6W1sxNzIyXSwyNTZdLDY0NDE2OltbMTcyM10sMjU2XSw2NDQxNzpbWzE3MjNdLDI1Nl0sNjQ0MTg6W1sxNzIzXSwyNTZdLDY0NDE5OltbMTcyM10sMjU2XSw2NDQyMDpbWzE3MjhdLDI1Nl0sNjQ0MjE6W1sxNzI4XSwyNTZdLDY0NDIyOltbMTcyOV0sMjU2XSw2NDQyMzpbWzE3MjldLDI1Nl0sNjQ0MjQ6W1sxNzI5XSwyNTZdLDY0NDI1OltbMTcyOV0sMjU2XSw2NDQyNjpbWzE3MjZdLDI1Nl0sNjQ0Mjc6W1sxNzI2XSwyNTZdLDY0NDI4OltbMTcyNl0sMjU2XSw2NDQyOTpbWzE3MjZdLDI1Nl0sNjQ0MzA6W1sxNzQ2XSwyNTZdLDY0NDMxOltbMTc0Nl0sMjU2XSw2NDQzMjpbWzE3NDddLDI1Nl0sNjQ0MzM6W1sxNzQ3XSwyNTZdLDY0NDY3OltbMTcwOV0sMjU2XSw2NDQ2ODpbWzE3MDldLDI1Nl0sNjQ0Njk6W1sxNzA5XSwyNTZdLDY0NDcwOltbMTcwOV0sMjU2XSw2NDQ3MTpbWzE3MzVdLDI1Nl0sNjQ0NzI6W1sxNzM1XSwyNTZdLDY0NDczOltbMTczNF0sMjU2XSw2NDQ3NDpbWzE3MzRdLDI1Nl0sNjQ0NzU6W1sxNzM2XSwyNTZdLDY0NDc2OltbMTczNl0sMjU2XSw2NDQ3NzpbWzE2NTVdLDI1Nl0sNjQ0Nzg6W1sxNzM5XSwyNTZdLDY0NDc5OltbMTczOV0sMjU2XSw2NDQ4MDpbWzE3MzNdLDI1Nl0sNjQ0ODE6W1sxNzMzXSwyNTZdLDY0NDgyOltbMTczN10sMjU2XSw2NDQ4MzpbWzE3MzddLDI1Nl0sNjQ0ODQ6W1sxNzQ0XSwyNTZdLDY0NDg1OltbMTc0NF0sMjU2XSw2NDQ4NjpbWzE3NDRdLDI1Nl0sNjQ0ODc6W1sxNzQ0XSwyNTZdLDY0NDg4OltbMTYwOV0sMjU2XSw2NDQ4OTpbWzE2MDldLDI1Nl0sNjQ0OTA6W1sxNTc0LDE1NzVdLDI1Nl0sNjQ0OTE6W1sxNTc0LDE1NzVdLDI1Nl0sNjQ0OTI6W1sxNTc0LDE3NDldLDI1Nl0sNjQ0OTM6W1sxNTc0LDE3NDldLDI1Nl0sNjQ0OTQ6W1sxNTc0LDE2MDhdLDI1Nl0sNjQ0OTU6W1sxNTc0LDE2MDhdLDI1Nl0sNjQ0OTY6W1sxNTc0LDE3MzVdLDI1Nl0sNjQ0OTc6W1sxNTc0LDE3MzVdLDI1Nl0sNjQ0OTg6W1sxNTc0LDE3MzRdLDI1Nl0sNjQ0OTk6W1sxNTc0LDE3MzRdLDI1Nl0sNjQ1MDA6W1sxNTc0LDE3MzZdLDI1Nl0sNjQ1MDE6W1sxNTc0LDE3MzZdLDI1Nl0sNjQ1MDI6W1sxNTc0LDE3NDRdLDI1Nl0sNjQ1MDM6W1sxNTc0LDE3NDRdLDI1Nl0sNjQ1MDQ6W1sxNTc0LDE3NDRdLDI1Nl0sNjQ1MDU6W1sxNTc0LDE2MDldLDI1Nl0sNjQ1MDY6W1sxNTc0LDE2MDldLDI1Nl0sNjQ1MDc6W1sxNTc0LDE2MDldLDI1Nl0sNjQ1MDg6W1sxNzQwXSwyNTZdLDY0NTA5OltbMTc0MF0sMjU2XSw2NDUxMDpbWzE3NDBdLDI1Nl0sNjQ1MTE6W1sxNzQwXSwyNTZdfSxcbjY0NTEyOns2NDUxMjpbWzE1NzQsMTU4MF0sMjU2XSw2NDUxMzpbWzE1NzQsMTU4MV0sMjU2XSw2NDUxNDpbWzE1NzQsMTYwNV0sMjU2XSw2NDUxNTpbWzE1NzQsMTYwOV0sMjU2XSw2NDUxNjpbWzE1NzQsMTYxMF0sMjU2XSw2NDUxNzpbWzE1NzYsMTU4MF0sMjU2XSw2NDUxODpbWzE1NzYsMTU4MV0sMjU2XSw2NDUxOTpbWzE1NzYsMTU4Ml0sMjU2XSw2NDUyMDpbWzE1NzYsMTYwNV0sMjU2XSw2NDUyMTpbWzE1NzYsMTYwOV0sMjU2XSw2NDUyMjpbWzE1NzYsMTYxMF0sMjU2XSw2NDUyMzpbWzE1NzgsMTU4MF0sMjU2XSw2NDUyNDpbWzE1NzgsMTU4MV0sMjU2XSw2NDUyNTpbWzE1NzgsMTU4Ml0sMjU2XSw2NDUyNjpbWzE1NzgsMTYwNV0sMjU2XSw2NDUyNzpbWzE1NzgsMTYwOV0sMjU2XSw2NDUyODpbWzE1NzgsMTYxMF0sMjU2XSw2NDUyOTpbWzE1NzksMTU4MF0sMjU2XSw2NDUzMDpbWzE1NzksMTYwNV0sMjU2XSw2NDUzMTpbWzE1NzksMTYwOV0sMjU2XSw2NDUzMjpbWzE1NzksMTYxMF0sMjU2XSw2NDUzMzpbWzE1ODAsMTU4MV0sMjU2XSw2NDUzNDpbWzE1ODAsMTYwNV0sMjU2XSw2NDUzNTpbWzE1ODEsMTU4MF0sMjU2XSw2NDUzNjpbWzE1ODEsMTYwNV0sMjU2XSw2NDUzNzpbWzE1ODIsMTU4MF0sMjU2XSw2NDUzODpbWzE1ODIsMTU4MV0sMjU2XSw2NDUzOTpbWzE1ODIsMTYwNV0sMjU2XSw2NDU0MDpbWzE1ODcsMTU4MF0sMjU2XSw2NDU0MTpbWzE1ODcsMTU4MV0sMjU2XSw2NDU0MjpbWzE1ODcsMTU4Ml0sMjU2XSw2NDU0MzpbWzE1ODcsMTYwNV0sMjU2XSw2NDU0NDpbWzE1ODksMTU4MV0sMjU2XSw2NDU0NTpbWzE1ODksMTYwNV0sMjU2XSw2NDU0NjpbWzE1OTAsMTU4MF0sMjU2XSw2NDU0NzpbWzE1OTAsMTU4MV0sMjU2XSw2NDU0ODpbWzE1OTAsMTU4Ml0sMjU2XSw2NDU0OTpbWzE1OTAsMTYwNV0sMjU2XSw2NDU1MDpbWzE1OTEsMTU4MV0sMjU2XSw2NDU1MTpbWzE1OTEsMTYwNV0sMjU2XSw2NDU1MjpbWzE1OTIsMTYwNV0sMjU2XSw2NDU1MzpbWzE1OTMsMTU4MF0sMjU2XSw2NDU1NDpbWzE1OTMsMTYwNV0sMjU2XSw2NDU1NTpbWzE1OTQsMTU4MF0sMjU2XSw2NDU1NjpbWzE1OTQsMTYwNV0sMjU2XSw2NDU1NzpbWzE2MDEsMTU4MF0sMjU2XSw2NDU1ODpbWzE2MDEsMTU4MV0sMjU2XSw2NDU1OTpbWzE2MDEsMTU4Ml0sMjU2XSw2NDU2MDpbWzE2MDEsMTYwNV0sMjU2XSw2NDU2MTpbWzE2MDEsMTYwOV0sMjU2XSw2NDU2MjpbWzE2MDEsMTYxMF0sMjU2XSw2NDU2MzpbWzE2MDIsMTU4MV0sMjU2XSw2NDU2NDpbWzE2MDIsMTYwNV0sMjU2XSw2NDU2NTpbWzE2MDIsMTYwOV0sMjU2XSw2NDU2NjpbWzE2MDIsMTYxMF0sMjU2XSw2NDU2NzpbWzE2MDMsMTU3NV0sMjU2XSw2NDU2ODpbWzE2MDMsMTU4MF0sMjU2XSw2NDU2OTpbWzE2MDMsMTU4MV0sMjU2XSw2NDU3MDpbWzE2MDMsMTU4Ml0sMjU2XSw2NDU3MTpbWzE2MDMsMTYwNF0sMjU2XSw2NDU3MjpbWzE2MDMsMTYwNV0sMjU2XSw2NDU3MzpbWzE2MDMsMTYwOV0sMjU2XSw2NDU3NDpbWzE2MDMsMTYxMF0sMjU2XSw2NDU3NTpbWzE2MDQsMTU4MF0sMjU2XSw2NDU3NjpbWzE2MDQsMTU4MV0sMjU2XSw2NDU3NzpbWzE2MDQsMTU4Ml0sMjU2XSw2NDU3ODpbWzE2MDQsMTYwNV0sMjU2XSw2NDU3OTpbWzE2MDQsMTYwOV0sMjU2XSw2NDU4MDpbWzE2MDQsMTYxMF0sMjU2XSw2NDU4MTpbWzE2MDUsMTU4MF0sMjU2XSw2NDU4MjpbWzE2MDUsMTU4MV0sMjU2XSw2NDU4MzpbWzE2MDUsMTU4Ml0sMjU2XSw2NDU4NDpbWzE2MDUsMTYwNV0sMjU2XSw2NDU4NTpbWzE2MDUsMTYwOV0sMjU2XSw2NDU4NjpbWzE2MDUsMTYxMF0sMjU2XSw2NDU4NzpbWzE2MDYsMTU4MF0sMjU2XSw2NDU4ODpbWzE2MDYsMTU4MV0sMjU2XSw2NDU4OTpbWzE2MDYsMTU4Ml0sMjU2XSw2NDU5MDpbWzE2MDYsMTYwNV0sMjU2XSw2NDU5MTpbWzE2MDYsMTYwOV0sMjU2XSw2NDU5MjpbWzE2MDYsMTYxMF0sMjU2XSw2NDU5MzpbWzE2MDcsMTU4MF0sMjU2XSw2NDU5NDpbWzE2MDcsMTYwNV0sMjU2XSw2NDU5NTpbWzE2MDcsMTYwOV0sMjU2XSw2NDU5NjpbWzE2MDcsMTYxMF0sMjU2XSw2NDU5NzpbWzE2MTAsMTU4MF0sMjU2XSw2NDU5ODpbWzE2MTAsMTU4MV0sMjU2XSw2NDU5OTpbWzE2MTAsMTU4Ml0sMjU2XSw2NDYwMDpbWzE2MTAsMTYwNV0sMjU2XSw2NDYwMTpbWzE2MTAsMTYwOV0sMjU2XSw2NDYwMjpbWzE2MTAsMTYxMF0sMjU2XSw2NDYwMzpbWzE1ODQsMTY0OF0sMjU2XSw2NDYwNDpbWzE1ODUsMTY0OF0sMjU2XSw2NDYwNTpbWzE2MDksMTY0OF0sMjU2XSw2NDYwNjpbWzMyLDE2MTIsMTYxN10sMjU2XSw2NDYwNzpbWzMyLDE2MTMsMTYxN10sMjU2XSw2NDYwODpbWzMyLDE2MTQsMTYxN10sMjU2XSw2NDYwOTpbWzMyLDE2MTUsMTYxN10sMjU2XSw2NDYxMDpbWzMyLDE2MTYsMTYxN10sMjU2XSw2NDYxMTpbWzMyLDE2MTcsMTY0OF0sMjU2XSw2NDYxMjpbWzE1NzQsMTU4NV0sMjU2XSw2NDYxMzpbWzE1NzQsMTU4Nl0sMjU2XSw2NDYxNDpbWzE1NzQsMTYwNV0sMjU2XSw2NDYxNTpbWzE1NzQsMTYwNl0sMjU2XSw2NDYxNjpbWzE1NzQsMTYwOV0sMjU2XSw2NDYxNzpbWzE1NzQsMTYxMF0sMjU2XSw2NDYxODpbWzE1NzYsMTU4NV0sMjU2XSw2NDYxOTpbWzE1NzYsMTU4Nl0sMjU2XSw2NDYyMDpbWzE1NzYsMTYwNV0sMjU2XSw2NDYyMTpbWzE1NzYsMTYwNl0sMjU2XSw2NDYyMjpbWzE1NzYsMTYwOV0sMjU2XSw2NDYyMzpbWzE1NzYsMTYxMF0sMjU2XSw2NDYyNDpbWzE1NzgsMTU4NV0sMjU2XSw2NDYyNTpbWzE1NzgsMTU4Nl0sMjU2XSw2NDYyNjpbWzE1NzgsMTYwNV0sMjU2XSw2NDYyNzpbWzE1NzgsMTYwNl0sMjU2XSw2NDYyODpbWzE1NzgsMTYwOV0sMjU2XSw2NDYyOTpbWzE1NzgsMTYxMF0sMjU2XSw2NDYzMDpbWzE1NzksMTU4NV0sMjU2XSw2NDYzMTpbWzE1NzksMTU4Nl0sMjU2XSw2NDYzMjpbWzE1NzksMTYwNV0sMjU2XSw2NDYzMzpbWzE1NzksMTYwNl0sMjU2XSw2NDYzNDpbWzE1NzksMTYwOV0sMjU2XSw2NDYzNTpbWzE1NzksMTYxMF0sMjU2XSw2NDYzNjpbWzE2MDEsMTYwOV0sMjU2XSw2NDYzNzpbWzE2MDEsMTYxMF0sMjU2XSw2NDYzODpbWzE2MDIsMTYwOV0sMjU2XSw2NDYzOTpbWzE2MDIsMTYxMF0sMjU2XSw2NDY0MDpbWzE2MDMsMTU3NV0sMjU2XSw2NDY0MTpbWzE2MDMsMTYwNF0sMjU2XSw2NDY0MjpbWzE2MDMsMTYwNV0sMjU2XSw2NDY0MzpbWzE2MDMsMTYwOV0sMjU2XSw2NDY0NDpbWzE2MDMsMTYxMF0sMjU2XSw2NDY0NTpbWzE2MDQsMTYwNV0sMjU2XSw2NDY0NjpbWzE2MDQsMTYwOV0sMjU2XSw2NDY0NzpbWzE2MDQsMTYxMF0sMjU2XSw2NDY0ODpbWzE2MDUsMTU3NV0sMjU2XSw2NDY0OTpbWzE2MDUsMTYwNV0sMjU2XSw2NDY1MDpbWzE2MDYsMTU4NV0sMjU2XSw2NDY1MTpbWzE2MDYsMTU4Nl0sMjU2XSw2NDY1MjpbWzE2MDYsMTYwNV0sMjU2XSw2NDY1MzpbWzE2MDYsMTYwNl0sMjU2XSw2NDY1NDpbWzE2MDYsMTYwOV0sMjU2XSw2NDY1NTpbWzE2MDYsMTYxMF0sMjU2XSw2NDY1NjpbWzE2MDksMTY0OF0sMjU2XSw2NDY1NzpbWzE2MTAsMTU4NV0sMjU2XSw2NDY1ODpbWzE2MTAsMTU4Nl0sMjU2XSw2NDY1OTpbWzE2MTAsMTYwNV0sMjU2XSw2NDY2MDpbWzE2MTAsMTYwNl0sMjU2XSw2NDY2MTpbWzE2MTAsMTYwOV0sMjU2XSw2NDY2MjpbWzE2MTAsMTYxMF0sMjU2XSw2NDY2MzpbWzE1NzQsMTU4MF0sMjU2XSw2NDY2NDpbWzE1NzQsMTU4MV0sMjU2XSw2NDY2NTpbWzE1NzQsMTU4Ml0sMjU2XSw2NDY2NjpbWzE1NzQsMTYwNV0sMjU2XSw2NDY2NzpbWzE1NzQsMTYwN10sMjU2XSw2NDY2ODpbWzE1NzYsMTU4MF0sMjU2XSw2NDY2OTpbWzE1NzYsMTU4MV0sMjU2XSw2NDY3MDpbWzE1NzYsMTU4Ml0sMjU2XSw2NDY3MTpbWzE1NzYsMTYwNV0sMjU2XSw2NDY3MjpbWzE1NzYsMTYwN10sMjU2XSw2NDY3MzpbWzE1NzgsMTU4MF0sMjU2XSw2NDY3NDpbWzE1NzgsMTU4MV0sMjU2XSw2NDY3NTpbWzE1NzgsMTU4Ml0sMjU2XSw2NDY3NjpbWzE1NzgsMTYwNV0sMjU2XSw2NDY3NzpbWzE1NzgsMTYwN10sMjU2XSw2NDY3ODpbWzE1NzksMTYwNV0sMjU2XSw2NDY3OTpbWzE1ODAsMTU4MV0sMjU2XSw2NDY4MDpbWzE1ODAsMTYwNV0sMjU2XSw2NDY4MTpbWzE1ODEsMTU4MF0sMjU2XSw2NDY4MjpbWzE1ODEsMTYwNV0sMjU2XSw2NDY4MzpbWzE1ODIsMTU4MF0sMjU2XSw2NDY4NDpbWzE1ODIsMTYwNV0sMjU2XSw2NDY4NTpbWzE1ODcsMTU4MF0sMjU2XSw2NDY4NjpbWzE1ODcsMTU4MV0sMjU2XSw2NDY4NzpbWzE1ODcsMTU4Ml0sMjU2XSw2NDY4ODpbWzE1ODcsMTYwNV0sMjU2XSw2NDY4OTpbWzE1ODksMTU4MV0sMjU2XSw2NDY5MDpbWzE1ODksMTU4Ml0sMjU2XSw2NDY5MTpbWzE1ODksMTYwNV0sMjU2XSw2NDY5MjpbWzE1OTAsMTU4MF0sMjU2XSw2NDY5MzpbWzE1OTAsMTU4MV0sMjU2XSw2NDY5NDpbWzE1OTAsMTU4Ml0sMjU2XSw2NDY5NTpbWzE1OTAsMTYwNV0sMjU2XSw2NDY5NjpbWzE1OTEsMTU4MV0sMjU2XSw2NDY5NzpbWzE1OTIsMTYwNV0sMjU2XSw2NDY5ODpbWzE1OTMsMTU4MF0sMjU2XSw2NDY5OTpbWzE1OTMsMTYwNV0sMjU2XSw2NDcwMDpbWzE1OTQsMTU4MF0sMjU2XSw2NDcwMTpbWzE1OTQsMTYwNV0sMjU2XSw2NDcwMjpbWzE2MDEsMTU4MF0sMjU2XSw2NDcwMzpbWzE2MDEsMTU4MV0sMjU2XSw2NDcwNDpbWzE2MDEsMTU4Ml0sMjU2XSw2NDcwNTpbWzE2MDEsMTYwNV0sMjU2XSw2NDcwNjpbWzE2MDIsMTU4MV0sMjU2XSw2NDcwNzpbWzE2MDIsMTYwNV0sMjU2XSw2NDcwODpbWzE2MDMsMTU4MF0sMjU2XSw2NDcwOTpbWzE2MDMsMTU4MV0sMjU2XSw2NDcxMDpbWzE2MDMsMTU4Ml0sMjU2XSw2NDcxMTpbWzE2MDMsMTYwNF0sMjU2XSw2NDcxMjpbWzE2MDMsMTYwNV0sMjU2XSw2NDcxMzpbWzE2MDQsMTU4MF0sMjU2XSw2NDcxNDpbWzE2MDQsMTU4MV0sMjU2XSw2NDcxNTpbWzE2MDQsMTU4Ml0sMjU2XSw2NDcxNjpbWzE2MDQsMTYwNV0sMjU2XSw2NDcxNzpbWzE2MDQsMTYwN10sMjU2XSw2NDcxODpbWzE2MDUsMTU4MF0sMjU2XSw2NDcxOTpbWzE2MDUsMTU4MV0sMjU2XSw2NDcyMDpbWzE2MDUsMTU4Ml0sMjU2XSw2NDcyMTpbWzE2MDUsMTYwNV0sMjU2XSw2NDcyMjpbWzE2MDYsMTU4MF0sMjU2XSw2NDcyMzpbWzE2MDYsMTU4MV0sMjU2XSw2NDcyNDpbWzE2MDYsMTU4Ml0sMjU2XSw2NDcyNTpbWzE2MDYsMTYwNV0sMjU2XSw2NDcyNjpbWzE2MDYsMTYwN10sMjU2XSw2NDcyNzpbWzE2MDcsMTU4MF0sMjU2XSw2NDcyODpbWzE2MDcsMTYwNV0sMjU2XSw2NDcyOTpbWzE2MDcsMTY0OF0sMjU2XSw2NDczMDpbWzE2MTAsMTU4MF0sMjU2XSw2NDczMTpbWzE2MTAsMTU4MV0sMjU2XSw2NDczMjpbWzE2MTAsMTU4Ml0sMjU2XSw2NDczMzpbWzE2MTAsMTYwNV0sMjU2XSw2NDczNDpbWzE2MTAsMTYwN10sMjU2XSw2NDczNTpbWzE1NzQsMTYwNV0sMjU2XSw2NDczNjpbWzE1NzQsMTYwN10sMjU2XSw2NDczNzpbWzE1NzYsMTYwNV0sMjU2XSw2NDczODpbWzE1NzYsMTYwN10sMjU2XSw2NDczOTpbWzE1NzgsMTYwNV0sMjU2XSw2NDc0MDpbWzE1NzgsMTYwN10sMjU2XSw2NDc0MTpbWzE1NzksMTYwNV0sMjU2XSw2NDc0MjpbWzE1NzksMTYwN10sMjU2XSw2NDc0MzpbWzE1ODcsMTYwNV0sMjU2XSw2NDc0NDpbWzE1ODcsMTYwN10sMjU2XSw2NDc0NTpbWzE1ODgsMTYwNV0sMjU2XSw2NDc0NjpbWzE1ODgsMTYwN10sMjU2XSw2NDc0NzpbWzE2MDMsMTYwNF0sMjU2XSw2NDc0ODpbWzE2MDMsMTYwNV0sMjU2XSw2NDc0OTpbWzE2MDQsMTYwNV0sMjU2XSw2NDc1MDpbWzE2MDYsMTYwNV0sMjU2XSw2NDc1MTpbWzE2MDYsMTYwN10sMjU2XSw2NDc1MjpbWzE2MTAsMTYwNV0sMjU2XSw2NDc1MzpbWzE2MTAsMTYwN10sMjU2XSw2NDc1NDpbWzE2MDAsMTYxNCwxNjE3XSwyNTZdLDY0NzU1OltbMTYwMCwxNjE1LDE2MTddLDI1Nl0sNjQ3NTY6W1sxNjAwLDE2MTYsMTYxN10sMjU2XSw2NDc1NzpbWzE1OTEsMTYwOV0sMjU2XSw2NDc1ODpbWzE1OTEsMTYxMF0sMjU2XSw2NDc1OTpbWzE1OTMsMTYwOV0sMjU2XSw2NDc2MDpbWzE1OTMsMTYxMF0sMjU2XSw2NDc2MTpbWzE1OTQsMTYwOV0sMjU2XSw2NDc2MjpbWzE1OTQsMTYxMF0sMjU2XSw2NDc2MzpbWzE1ODcsMTYwOV0sMjU2XSw2NDc2NDpbWzE1ODcsMTYxMF0sMjU2XSw2NDc2NTpbWzE1ODgsMTYwOV0sMjU2XSw2NDc2NjpbWzE1ODgsMTYxMF0sMjU2XSw2NDc2NzpbWzE1ODEsMTYwOV0sMjU2XX0sXG42NDc2ODp7NjQ3Njg6W1sxNTgxLDE2MTBdLDI1Nl0sNjQ3Njk6W1sxNTgwLDE2MDldLDI1Nl0sNjQ3NzA6W1sxNTgwLDE2MTBdLDI1Nl0sNjQ3NzE6W1sxNTgyLDE2MDldLDI1Nl0sNjQ3NzI6W1sxNTgyLDE2MTBdLDI1Nl0sNjQ3NzM6W1sxNTg5LDE2MDldLDI1Nl0sNjQ3NzQ6W1sxNTg5LDE2MTBdLDI1Nl0sNjQ3NzU6W1sxNTkwLDE2MDldLDI1Nl0sNjQ3NzY6W1sxNTkwLDE2MTBdLDI1Nl0sNjQ3Nzc6W1sxNTg4LDE1ODBdLDI1Nl0sNjQ3Nzg6W1sxNTg4LDE1ODFdLDI1Nl0sNjQ3Nzk6W1sxNTg4LDE1ODJdLDI1Nl0sNjQ3ODA6W1sxNTg4LDE2MDVdLDI1Nl0sNjQ3ODE6W1sxNTg4LDE1ODVdLDI1Nl0sNjQ3ODI6W1sxNTg3LDE1ODVdLDI1Nl0sNjQ3ODM6W1sxNTg5LDE1ODVdLDI1Nl0sNjQ3ODQ6W1sxNTkwLDE1ODVdLDI1Nl0sNjQ3ODU6W1sxNTkxLDE2MDldLDI1Nl0sNjQ3ODY6W1sxNTkxLDE2MTBdLDI1Nl0sNjQ3ODc6W1sxNTkzLDE2MDldLDI1Nl0sNjQ3ODg6W1sxNTkzLDE2MTBdLDI1Nl0sNjQ3ODk6W1sxNTk0LDE2MDldLDI1Nl0sNjQ3OTA6W1sxNTk0LDE2MTBdLDI1Nl0sNjQ3OTE6W1sxNTg3LDE2MDldLDI1Nl0sNjQ3OTI6W1sxNTg3LDE2MTBdLDI1Nl0sNjQ3OTM6W1sxNTg4LDE2MDldLDI1Nl0sNjQ3OTQ6W1sxNTg4LDE2MTBdLDI1Nl0sNjQ3OTU6W1sxNTgxLDE2MDldLDI1Nl0sNjQ3OTY6W1sxNTgxLDE2MTBdLDI1Nl0sNjQ3OTc6W1sxNTgwLDE2MDldLDI1Nl0sNjQ3OTg6W1sxNTgwLDE2MTBdLDI1Nl0sNjQ3OTk6W1sxNTgyLDE2MDldLDI1Nl0sNjQ4MDA6W1sxNTgyLDE2MTBdLDI1Nl0sNjQ4MDE6W1sxNTg5LDE2MDldLDI1Nl0sNjQ4MDI6W1sxNTg5LDE2MTBdLDI1Nl0sNjQ4MDM6W1sxNTkwLDE2MDldLDI1Nl0sNjQ4MDQ6W1sxNTkwLDE2MTBdLDI1Nl0sNjQ4MDU6W1sxNTg4LDE1ODBdLDI1Nl0sNjQ4MDY6W1sxNTg4LDE1ODFdLDI1Nl0sNjQ4MDc6W1sxNTg4LDE1ODJdLDI1Nl0sNjQ4MDg6W1sxNTg4LDE2MDVdLDI1Nl0sNjQ4MDk6W1sxNTg4LDE1ODVdLDI1Nl0sNjQ4MTA6W1sxNTg3LDE1ODVdLDI1Nl0sNjQ4MTE6W1sxNTg5LDE1ODVdLDI1Nl0sNjQ4MTI6W1sxNTkwLDE1ODVdLDI1Nl0sNjQ4MTM6W1sxNTg4LDE1ODBdLDI1Nl0sNjQ4MTQ6W1sxNTg4LDE1ODFdLDI1Nl0sNjQ4MTU6W1sxNTg4LDE1ODJdLDI1Nl0sNjQ4MTY6W1sxNTg4LDE2MDVdLDI1Nl0sNjQ4MTc6W1sxNTg3LDE2MDddLDI1Nl0sNjQ4MTg6W1sxNTg4LDE2MDddLDI1Nl0sNjQ4MTk6W1sxNTkxLDE2MDVdLDI1Nl0sNjQ4MjA6W1sxNTg3LDE1ODBdLDI1Nl0sNjQ4MjE6W1sxNTg3LDE1ODFdLDI1Nl0sNjQ4MjI6W1sxNTg3LDE1ODJdLDI1Nl0sNjQ4MjM6W1sxNTg4LDE1ODBdLDI1Nl0sNjQ4MjQ6W1sxNTg4LDE1ODFdLDI1Nl0sNjQ4MjU6W1sxNTg4LDE1ODJdLDI1Nl0sNjQ4MjY6W1sxNTkxLDE2MDVdLDI1Nl0sNjQ4Mjc6W1sxNTkyLDE2MDVdLDI1Nl0sNjQ4Mjg6W1sxNTc1LDE2MTFdLDI1Nl0sNjQ4Mjk6W1sxNTc1LDE2MTFdLDI1Nl0sNjQ4NDg6W1sxNTc4LDE1ODAsMTYwNV0sMjU2XSw2NDg0OTpbWzE1NzgsMTU4MSwxNTgwXSwyNTZdLDY0ODUwOltbMTU3OCwxNTgxLDE1ODBdLDI1Nl0sNjQ4NTE6W1sxNTc4LDE1ODEsMTYwNV0sMjU2XSw2NDg1MjpbWzE1NzgsMTU4MiwxNjA1XSwyNTZdLDY0ODUzOltbMTU3OCwxNjA1LDE1ODBdLDI1Nl0sNjQ4NTQ6W1sxNTc4LDE2MDUsMTU4MV0sMjU2XSw2NDg1NTpbWzE1NzgsMTYwNSwxNTgyXSwyNTZdLDY0ODU2OltbMTU4MCwxNjA1LDE1ODFdLDI1Nl0sNjQ4NTc6W1sxNTgwLDE2MDUsMTU4MV0sMjU2XSw2NDg1ODpbWzE1ODEsMTYwNSwxNjEwXSwyNTZdLDY0ODU5OltbMTU4MSwxNjA1LDE2MDldLDI1Nl0sNjQ4NjA6W1sxNTg3LDE1ODEsMTU4MF0sMjU2XSw2NDg2MTpbWzE1ODcsMTU4MCwxNTgxXSwyNTZdLDY0ODYyOltbMTU4NywxNTgwLDE2MDldLDI1Nl0sNjQ4NjM6W1sxNTg3LDE2MDUsMTU4MV0sMjU2XSw2NDg2NDpbWzE1ODcsMTYwNSwxNTgxXSwyNTZdLDY0ODY1OltbMTU4NywxNjA1LDE1ODBdLDI1Nl0sNjQ4NjY6W1sxNTg3LDE2MDUsMTYwNV0sMjU2XSw2NDg2NzpbWzE1ODcsMTYwNSwxNjA1XSwyNTZdLDY0ODY4OltbMTU4OSwxNTgxLDE1ODFdLDI1Nl0sNjQ4Njk6W1sxNTg5LDE1ODEsMTU4MV0sMjU2XSw2NDg3MDpbWzE1ODksMTYwNSwxNjA1XSwyNTZdLDY0ODcxOltbMTU4OCwxNTgxLDE2MDVdLDI1Nl0sNjQ4NzI6W1sxNTg4LDE1ODEsMTYwNV0sMjU2XSw2NDg3MzpbWzE1ODgsMTU4MCwxNjEwXSwyNTZdLDY0ODc0OltbMTU4OCwxNjA1LDE1ODJdLDI1Nl0sNjQ4NzU6W1sxNTg4LDE2MDUsMTU4Ml0sMjU2XSw2NDg3NjpbWzE1ODgsMTYwNSwxNjA1XSwyNTZdLDY0ODc3OltbMTU4OCwxNjA1LDE2MDVdLDI1Nl0sNjQ4Nzg6W1sxNTkwLDE1ODEsMTYwOV0sMjU2XSw2NDg3OTpbWzE1OTAsMTU4MiwxNjA1XSwyNTZdLDY0ODgwOltbMTU5MCwxNTgyLDE2MDVdLDI1Nl0sNjQ4ODE6W1sxNTkxLDE2MDUsMTU4MV0sMjU2XSw2NDg4MjpbWzE1OTEsMTYwNSwxNTgxXSwyNTZdLDY0ODgzOltbMTU5MSwxNjA1LDE2MDVdLDI1Nl0sNjQ4ODQ6W1sxNTkxLDE2MDUsMTYxMF0sMjU2XSw2NDg4NTpbWzE1OTMsMTU4MCwxNjA1XSwyNTZdLDY0ODg2OltbMTU5MywxNjA1LDE2MDVdLDI1Nl0sNjQ4ODc6W1sxNTkzLDE2MDUsMTYwNV0sMjU2XSw2NDg4ODpbWzE1OTMsMTYwNSwxNjA5XSwyNTZdLDY0ODg5OltbMTU5NCwxNjA1LDE2MDVdLDI1Nl0sNjQ4OTA6W1sxNTk0LDE2MDUsMTYxMF0sMjU2XSw2NDg5MTpbWzE1OTQsMTYwNSwxNjA5XSwyNTZdLDY0ODkyOltbMTYwMSwxNTgyLDE2MDVdLDI1Nl0sNjQ4OTM6W1sxNjAxLDE1ODIsMTYwNV0sMjU2XSw2NDg5NDpbWzE2MDIsMTYwNSwxNTgxXSwyNTZdLDY0ODk1OltbMTYwMiwxNjA1LDE2MDVdLDI1Nl0sNjQ4OTY6W1sxNjA0LDE1ODEsMTYwNV0sMjU2XSw2NDg5NzpbWzE2MDQsMTU4MSwxNjEwXSwyNTZdLDY0ODk4OltbMTYwNCwxNTgxLDE2MDldLDI1Nl0sNjQ4OTk6W1sxNjA0LDE1ODAsMTU4MF0sMjU2XSw2NDkwMDpbWzE2MDQsMTU4MCwxNTgwXSwyNTZdLDY0OTAxOltbMTYwNCwxNTgyLDE2MDVdLDI1Nl0sNjQ5MDI6W1sxNjA0LDE1ODIsMTYwNV0sMjU2XSw2NDkwMzpbWzE2MDQsMTYwNSwxNTgxXSwyNTZdLDY0OTA0OltbMTYwNCwxNjA1LDE1ODFdLDI1Nl0sNjQ5MDU6W1sxNjA1LDE1ODEsMTU4MF0sMjU2XSw2NDkwNjpbWzE2MDUsMTU4MSwxNjA1XSwyNTZdLDY0OTA3OltbMTYwNSwxNTgxLDE2MTBdLDI1Nl0sNjQ5MDg6W1sxNjA1LDE1ODAsMTU4MV0sMjU2XSw2NDkwOTpbWzE2MDUsMTU4MCwxNjA1XSwyNTZdLDY0OTEwOltbMTYwNSwxNTgyLDE1ODBdLDI1Nl0sNjQ5MTE6W1sxNjA1LDE1ODIsMTYwNV0sMjU2XSw2NDkxNDpbWzE2MDUsMTU4MCwxNTgyXSwyNTZdLDY0OTE1OltbMTYwNywxNjA1LDE1ODBdLDI1Nl0sNjQ5MTY6W1sxNjA3LDE2MDUsMTYwNV0sMjU2XSw2NDkxNzpbWzE2MDYsMTU4MSwxNjA1XSwyNTZdLDY0OTE4OltbMTYwNiwxNTgxLDE2MDldLDI1Nl0sNjQ5MTk6W1sxNjA2LDE1ODAsMTYwNV0sMjU2XSw2NDkyMDpbWzE2MDYsMTU4MCwxNjA1XSwyNTZdLDY0OTIxOltbMTYwNiwxNTgwLDE2MDldLDI1Nl0sNjQ5MjI6W1sxNjA2LDE2MDUsMTYxMF0sMjU2XSw2NDkyMzpbWzE2MDYsMTYwNSwxNjA5XSwyNTZdLDY0OTI0OltbMTYxMCwxNjA1LDE2MDVdLDI1Nl0sNjQ5MjU6W1sxNjEwLDE2MDUsMTYwNV0sMjU2XSw2NDkyNjpbWzE1NzYsMTU4MiwxNjEwXSwyNTZdLDY0OTI3OltbMTU3OCwxNTgwLDE2MTBdLDI1Nl0sNjQ5Mjg6W1sxNTc4LDE1ODAsMTYwOV0sMjU2XSw2NDkyOTpbWzE1NzgsMTU4MiwxNjEwXSwyNTZdLDY0OTMwOltbMTU3OCwxNTgyLDE2MDldLDI1Nl0sNjQ5MzE6W1sxNTc4LDE2MDUsMTYxMF0sMjU2XSw2NDkzMjpbWzE1NzgsMTYwNSwxNjA5XSwyNTZdLDY0OTMzOltbMTU4MCwxNjA1LDE2MTBdLDI1Nl0sNjQ5MzQ6W1sxNTgwLDE1ODEsMTYwOV0sMjU2XSw2NDkzNTpbWzE1ODAsMTYwNSwxNjA5XSwyNTZdLDY0OTM2OltbMTU4NywxNTgyLDE2MDldLDI1Nl0sNjQ5Mzc6W1sxNTg5LDE1ODEsMTYxMF0sMjU2XSw2NDkzODpbWzE1ODgsMTU4MSwxNjEwXSwyNTZdLDY0OTM5OltbMTU5MCwxNTgxLDE2MTBdLDI1Nl0sNjQ5NDA6W1sxNjA0LDE1ODAsMTYxMF0sMjU2XSw2NDk0MTpbWzE2MDQsMTYwNSwxNjEwXSwyNTZdLDY0OTQyOltbMTYxMCwxNTgxLDE2MTBdLDI1Nl0sNjQ5NDM6W1sxNjEwLDE1ODAsMTYxMF0sMjU2XSw2NDk0NDpbWzE2MTAsMTYwNSwxNjEwXSwyNTZdLDY0OTQ1OltbMTYwNSwxNjA1LDE2MTBdLDI1Nl0sNjQ5NDY6W1sxNjAyLDE2MDUsMTYxMF0sMjU2XSw2NDk0NzpbWzE2MDYsMTU4MSwxNjEwXSwyNTZdLDY0OTQ4OltbMTYwMiwxNjA1LDE1ODFdLDI1Nl0sNjQ5NDk6W1sxNjA0LDE1ODEsMTYwNV0sMjU2XSw2NDk1MDpbWzE1OTMsMTYwNSwxNjEwXSwyNTZdLDY0OTUxOltbMTYwMywxNjA1LDE2MTBdLDI1Nl0sNjQ5NTI6W1sxNjA2LDE1ODAsMTU4MV0sMjU2XSw2NDk1MzpbWzE2MDUsMTU4MiwxNjEwXSwyNTZdLDY0OTU0OltbMTYwNCwxNTgwLDE2MDVdLDI1Nl0sNjQ5NTU6W1sxNjAzLDE2MDUsMTYwNV0sMjU2XSw2NDk1NjpbWzE2MDQsMTU4MCwxNjA1XSwyNTZdLDY0OTU3OltbMTYwNiwxNTgwLDE1ODFdLDI1Nl0sNjQ5NTg6W1sxNTgwLDE1ODEsMTYxMF0sMjU2XSw2NDk1OTpbWzE1ODEsMTU4MCwxNjEwXSwyNTZdLDY0OTYwOltbMTYwNSwxNTgwLDE2MTBdLDI1Nl0sNjQ5NjE6W1sxNjAxLDE2MDUsMTYxMF0sMjU2XSw2NDk2MjpbWzE1NzYsMTU4MSwxNjEwXSwyNTZdLDY0OTYzOltbMTYwMywxNjA1LDE2MDVdLDI1Nl0sNjQ5NjQ6W1sxNTkzLDE1ODAsMTYwNV0sMjU2XSw2NDk2NTpbWzE1ODksMTYwNSwxNjA1XSwyNTZdLDY0OTY2OltbMTU4NywxNTgyLDE2MTBdLDI1Nl0sNjQ5Njc6W1sxNjA2LDE1ODAsMTYxMF0sMjU2XSw2NTAwODpbWzE1ODksMTYwNCwxNzQ2XSwyNTZdLDY1MDA5OltbMTYwMiwxNjA0LDE3NDZdLDI1Nl0sNjUwMTA6W1sxNTc1LDE2MDQsMTYwNCwxNjA3XSwyNTZdLDY1MDExOltbMTU3NSwxNjAzLDE1NzYsMTU4NV0sMjU2XSw2NTAxMjpbWzE2MDUsMTU4MSwxNjA1LDE1ODNdLDI1Nl0sNjUwMTM6W1sxNTg5LDE2MDQsMTU5MywxNjA1XSwyNTZdLDY1MDE0OltbMTU4NSwxNTg3LDE2MDgsMTYwNF0sMjU2XSw2NTAxNTpbWzE1OTMsMTYwNCwxNjEwLDE2MDddLDI1Nl0sNjUwMTY6W1sxNjA4LDE1ODcsMTYwNCwxNjA1XSwyNTZdLDY1MDE3OltbMTU4OSwxNjA0LDE2MDldLDI1Nl0sNjUwMTg6W1sxNTg5LDE2MDQsMTYwOSwzMiwxNTc1LDE2MDQsMTYwNCwxNjA3LDMyLDE1OTMsMTYwNCwxNjEwLDE2MDcsMzIsMTYwOCwxNTg3LDE2MDQsMTYwNV0sMjU2XSw2NTAxOTpbWzE1ODAsMTYwNCwzMiwxNTgwLDE2MDQsMTU3NSwxNjA0LDE2MDddLDI1Nl0sNjUwMjA6W1sxNTg1LDE3NDAsMTU3NSwxNjA0XSwyNTZdfSxcbjY1MDI0Ons2NTA0MDpbWzQ0XSwyNTZdLDY1MDQxOltbMTIyODldLDI1Nl0sNjUwNDI6W1sxMjI5MF0sMjU2XSw2NTA0MzpbWzU4XSwyNTZdLDY1MDQ0OltbNTldLDI1Nl0sNjUwNDU6W1szM10sMjU2XSw2NTA0NjpbWzYzXSwyNTZdLDY1MDQ3OltbMTIzMTBdLDI1Nl0sNjUwNDg6W1sxMjMxMV0sMjU2XSw2NTA0OTpbWzgyMzBdLDI1Nl0sNjUwNTY6WywyMzBdLDY1MDU3OlssMjMwXSw2NTA1ODpbLDIzMF0sNjUwNTk6WywyMzBdLDY1MDYwOlssMjMwXSw2NTA2MTpbLDIzMF0sNjUwNjI6WywyMzBdLDY1MDcyOltbODIyOV0sMjU2XSw2NTA3MzpbWzgyMTJdLDI1Nl0sNjUwNzQ6W1s4MjExXSwyNTZdLDY1MDc1OltbOTVdLDI1Nl0sNjUwNzY6W1s5NV0sMjU2XSw2NTA3NzpbWzQwXSwyNTZdLDY1MDc4OltbNDFdLDI1Nl0sNjUwNzk6W1sxMjNdLDI1Nl0sNjUwODA6W1sxMjVdLDI1Nl0sNjUwODE6W1sxMjMwOF0sMjU2XSw2NTA4MjpbWzEyMzA5XSwyNTZdLDY1MDgzOltbMTIzMDRdLDI1Nl0sNjUwODQ6W1sxMjMwNV0sMjU2XSw2NTA4NTpbWzEyMjk4XSwyNTZdLDY1MDg2OltbMTIyOTldLDI1Nl0sNjUwODc6W1sxMjI5Nl0sMjU2XSw2NTA4ODpbWzEyMjk3XSwyNTZdLDY1MDg5OltbMTIzMDBdLDI1Nl0sNjUwOTA6W1sxMjMwMV0sMjU2XSw2NTA5MTpbWzEyMzAyXSwyNTZdLDY1MDkyOltbMTIzMDNdLDI1Nl0sNjUwOTU6W1s5MV0sMjU2XSw2NTA5NjpbWzkzXSwyNTZdLDY1MDk3OltbODI1NF0sMjU2XSw2NTA5ODpbWzgyNTRdLDI1Nl0sNjUwOTk6W1s4MjU0XSwyNTZdLDY1MTAwOltbODI1NF0sMjU2XSw2NTEwMTpbWzk1XSwyNTZdLDY1MTAyOltbOTVdLDI1Nl0sNjUxMDM6W1s5NV0sMjU2XSw2NTEwNDpbWzQ0XSwyNTZdLDY1MTA1OltbMTIyODldLDI1Nl0sNjUxMDY6W1s0Nl0sMjU2XSw2NTEwODpbWzU5XSwyNTZdLDY1MTA5OltbNThdLDI1Nl0sNjUxMTA6W1s2M10sMjU2XSw2NTExMTpbWzMzXSwyNTZdLDY1MTEyOltbODIxMl0sMjU2XSw2NTExMzpbWzQwXSwyNTZdLDY1MTE0OltbNDFdLDI1Nl0sNjUxMTU6W1sxMjNdLDI1Nl0sNjUxMTY6W1sxMjVdLDI1Nl0sNjUxMTc6W1sxMjMwOF0sMjU2XSw2NTExODpbWzEyMzA5XSwyNTZdLDY1MTE5OltbMzVdLDI1Nl0sNjUxMjA6W1szOF0sMjU2XSw2NTEyMTpbWzQyXSwyNTZdLDY1MTIyOltbNDNdLDI1Nl0sNjUxMjM6W1s0NV0sMjU2XSw2NTEyNDpbWzYwXSwyNTZdLDY1MTI1OltbNjJdLDI1Nl0sNjUxMjY6W1s2MV0sMjU2XSw2NTEyODpbWzkyXSwyNTZdLDY1MTI5OltbMzZdLDI1Nl0sNjUxMzA6W1szN10sMjU2XSw2NTEzMTpbWzY0XSwyNTZdLDY1MTM2OltbMzIsMTYxMV0sMjU2XSw2NTEzNzpbWzE2MDAsMTYxMV0sMjU2XSw2NTEzODpbWzMyLDE2MTJdLDI1Nl0sNjUxNDA6W1szMiwxNjEzXSwyNTZdLDY1MTQyOltbMzIsMTYxNF0sMjU2XSw2NTE0MzpbWzE2MDAsMTYxNF0sMjU2XSw2NTE0NDpbWzMyLDE2MTVdLDI1Nl0sNjUxNDU6W1sxNjAwLDE2MTVdLDI1Nl0sNjUxNDY6W1szMiwxNjE2XSwyNTZdLDY1MTQ3OltbMTYwMCwxNjE2XSwyNTZdLDY1MTQ4OltbMzIsMTYxN10sMjU2XSw2NTE0OTpbWzE2MDAsMTYxN10sMjU2XSw2NTE1MDpbWzMyLDE2MThdLDI1Nl0sNjUxNTE6W1sxNjAwLDE2MThdLDI1Nl0sNjUxNTI6W1sxNTY5XSwyNTZdLDY1MTUzOltbMTU3MF0sMjU2XSw2NTE1NDpbWzE1NzBdLDI1Nl0sNjUxNTU6W1sxNTcxXSwyNTZdLDY1MTU2OltbMTU3MV0sMjU2XSw2NTE1NzpbWzE1NzJdLDI1Nl0sNjUxNTg6W1sxNTcyXSwyNTZdLDY1MTU5OltbMTU3M10sMjU2XSw2NTE2MDpbWzE1NzNdLDI1Nl0sNjUxNjE6W1sxNTc0XSwyNTZdLDY1MTYyOltbMTU3NF0sMjU2XSw2NTE2MzpbWzE1NzRdLDI1Nl0sNjUxNjQ6W1sxNTc0XSwyNTZdLDY1MTY1OltbMTU3NV0sMjU2XSw2NTE2NjpbWzE1NzVdLDI1Nl0sNjUxNjc6W1sxNTc2XSwyNTZdLDY1MTY4OltbMTU3Nl0sMjU2XSw2NTE2OTpbWzE1NzZdLDI1Nl0sNjUxNzA6W1sxNTc2XSwyNTZdLDY1MTcxOltbMTU3N10sMjU2XSw2NTE3MjpbWzE1NzddLDI1Nl0sNjUxNzM6W1sxNTc4XSwyNTZdLDY1MTc0OltbMTU3OF0sMjU2XSw2NTE3NTpbWzE1NzhdLDI1Nl0sNjUxNzY6W1sxNTc4XSwyNTZdLDY1MTc3OltbMTU3OV0sMjU2XSw2NTE3ODpbWzE1NzldLDI1Nl0sNjUxNzk6W1sxNTc5XSwyNTZdLDY1MTgwOltbMTU3OV0sMjU2XSw2NTE4MTpbWzE1ODBdLDI1Nl0sNjUxODI6W1sxNTgwXSwyNTZdLDY1MTgzOltbMTU4MF0sMjU2XSw2NTE4NDpbWzE1ODBdLDI1Nl0sNjUxODU6W1sxNTgxXSwyNTZdLDY1MTg2OltbMTU4MV0sMjU2XSw2NTE4NzpbWzE1ODFdLDI1Nl0sNjUxODg6W1sxNTgxXSwyNTZdLDY1MTg5OltbMTU4Ml0sMjU2XSw2NTE5MDpbWzE1ODJdLDI1Nl0sNjUxOTE6W1sxNTgyXSwyNTZdLDY1MTkyOltbMTU4Ml0sMjU2XSw2NTE5MzpbWzE1ODNdLDI1Nl0sNjUxOTQ6W1sxNTgzXSwyNTZdLDY1MTk1OltbMTU4NF0sMjU2XSw2NTE5NjpbWzE1ODRdLDI1Nl0sNjUxOTc6W1sxNTg1XSwyNTZdLDY1MTk4OltbMTU4NV0sMjU2XSw2NTE5OTpbWzE1ODZdLDI1Nl0sNjUyMDA6W1sxNTg2XSwyNTZdLDY1MjAxOltbMTU4N10sMjU2XSw2NTIwMjpbWzE1ODddLDI1Nl0sNjUyMDM6W1sxNTg3XSwyNTZdLDY1MjA0OltbMTU4N10sMjU2XSw2NTIwNTpbWzE1ODhdLDI1Nl0sNjUyMDY6W1sxNTg4XSwyNTZdLDY1MjA3OltbMTU4OF0sMjU2XSw2NTIwODpbWzE1ODhdLDI1Nl0sNjUyMDk6W1sxNTg5XSwyNTZdLDY1MjEwOltbMTU4OV0sMjU2XSw2NTIxMTpbWzE1ODldLDI1Nl0sNjUyMTI6W1sxNTg5XSwyNTZdLDY1MjEzOltbMTU5MF0sMjU2XSw2NTIxNDpbWzE1OTBdLDI1Nl0sNjUyMTU6W1sxNTkwXSwyNTZdLDY1MjE2OltbMTU5MF0sMjU2XSw2NTIxNzpbWzE1OTFdLDI1Nl0sNjUyMTg6W1sxNTkxXSwyNTZdLDY1MjE5OltbMTU5MV0sMjU2XSw2NTIyMDpbWzE1OTFdLDI1Nl0sNjUyMjE6W1sxNTkyXSwyNTZdLDY1MjIyOltbMTU5Ml0sMjU2XSw2NTIyMzpbWzE1OTJdLDI1Nl0sNjUyMjQ6W1sxNTkyXSwyNTZdLDY1MjI1OltbMTU5M10sMjU2XSw2NTIyNjpbWzE1OTNdLDI1Nl0sNjUyMjc6W1sxNTkzXSwyNTZdLDY1MjI4OltbMTU5M10sMjU2XSw2NTIyOTpbWzE1OTRdLDI1Nl0sNjUyMzA6W1sxNTk0XSwyNTZdLDY1MjMxOltbMTU5NF0sMjU2XSw2NTIzMjpbWzE1OTRdLDI1Nl0sNjUyMzM6W1sxNjAxXSwyNTZdLDY1MjM0OltbMTYwMV0sMjU2XSw2NTIzNTpbWzE2MDFdLDI1Nl0sNjUyMzY6W1sxNjAxXSwyNTZdLDY1MjM3OltbMTYwMl0sMjU2XSw2NTIzODpbWzE2MDJdLDI1Nl0sNjUyMzk6W1sxNjAyXSwyNTZdLDY1MjQwOltbMTYwMl0sMjU2XSw2NTI0MTpbWzE2MDNdLDI1Nl0sNjUyNDI6W1sxNjAzXSwyNTZdLDY1MjQzOltbMTYwM10sMjU2XSw2NTI0NDpbWzE2MDNdLDI1Nl0sNjUyNDU6W1sxNjA0XSwyNTZdLDY1MjQ2OltbMTYwNF0sMjU2XSw2NTI0NzpbWzE2MDRdLDI1Nl0sNjUyNDg6W1sxNjA0XSwyNTZdLDY1MjQ5OltbMTYwNV0sMjU2XSw2NTI1MDpbWzE2MDVdLDI1Nl0sNjUyNTE6W1sxNjA1XSwyNTZdLDY1MjUyOltbMTYwNV0sMjU2XSw2NTI1MzpbWzE2MDZdLDI1Nl0sNjUyNTQ6W1sxNjA2XSwyNTZdLDY1MjU1OltbMTYwNl0sMjU2XSw2NTI1NjpbWzE2MDZdLDI1Nl0sNjUyNTc6W1sxNjA3XSwyNTZdLDY1MjU4OltbMTYwN10sMjU2XSw2NTI1OTpbWzE2MDddLDI1Nl0sNjUyNjA6W1sxNjA3XSwyNTZdLDY1MjYxOltbMTYwOF0sMjU2XSw2NTI2MjpbWzE2MDhdLDI1Nl0sNjUyNjM6W1sxNjA5XSwyNTZdLDY1MjY0OltbMTYwOV0sMjU2XSw2NTI2NTpbWzE2MTBdLDI1Nl0sNjUyNjY6W1sxNjEwXSwyNTZdLDY1MjY3OltbMTYxMF0sMjU2XSw2NTI2ODpbWzE2MTBdLDI1Nl0sNjUyNjk6W1sxNjA0LDE1NzBdLDI1Nl0sNjUyNzA6W1sxNjA0LDE1NzBdLDI1Nl0sNjUyNzE6W1sxNjA0LDE1NzFdLDI1Nl0sNjUyNzI6W1sxNjA0LDE1NzFdLDI1Nl0sNjUyNzM6W1sxNjA0LDE1NzNdLDI1Nl0sNjUyNzQ6W1sxNjA0LDE1NzNdLDI1Nl0sNjUyNzU6W1sxNjA0LDE1NzVdLDI1Nl0sNjUyNzY6W1sxNjA0LDE1NzVdLDI1Nl19LFxuNjUyODA6ezY1MjgxOltbMzNdLDI1Nl0sNjUyODI6W1szNF0sMjU2XSw2NTI4MzpbWzM1XSwyNTZdLDY1Mjg0OltbMzZdLDI1Nl0sNjUyODU6W1szN10sMjU2XSw2NTI4NjpbWzM4XSwyNTZdLDY1Mjg3OltbMzldLDI1Nl0sNjUyODg6W1s0MF0sMjU2XSw2NTI4OTpbWzQxXSwyNTZdLDY1MjkwOltbNDJdLDI1Nl0sNjUyOTE6W1s0M10sMjU2XSw2NTI5MjpbWzQ0XSwyNTZdLDY1MjkzOltbNDVdLDI1Nl0sNjUyOTQ6W1s0Nl0sMjU2XSw2NTI5NTpbWzQ3XSwyNTZdLDY1Mjk2OltbNDhdLDI1Nl0sNjUyOTc6W1s0OV0sMjU2XSw2NTI5ODpbWzUwXSwyNTZdLDY1Mjk5OltbNTFdLDI1Nl0sNjUzMDA6W1s1Ml0sMjU2XSw2NTMwMTpbWzUzXSwyNTZdLDY1MzAyOltbNTRdLDI1Nl0sNjUzMDM6W1s1NV0sMjU2XSw2NTMwNDpbWzU2XSwyNTZdLDY1MzA1OltbNTddLDI1Nl0sNjUzMDY6W1s1OF0sMjU2XSw2NTMwNzpbWzU5XSwyNTZdLDY1MzA4OltbNjBdLDI1Nl0sNjUzMDk6W1s2MV0sMjU2XSw2NTMxMDpbWzYyXSwyNTZdLDY1MzExOltbNjNdLDI1Nl0sNjUzMTI6W1s2NF0sMjU2XSw2NTMxMzpbWzY1XSwyNTZdLDY1MzE0OltbNjZdLDI1Nl0sNjUzMTU6W1s2N10sMjU2XSw2NTMxNjpbWzY4XSwyNTZdLDY1MzE3OltbNjldLDI1Nl0sNjUzMTg6W1s3MF0sMjU2XSw2NTMxOTpbWzcxXSwyNTZdLDY1MzIwOltbNzJdLDI1Nl0sNjUzMjE6W1s3M10sMjU2XSw2NTMyMjpbWzc0XSwyNTZdLDY1MzIzOltbNzVdLDI1Nl0sNjUzMjQ6W1s3Nl0sMjU2XSw2NTMyNTpbWzc3XSwyNTZdLDY1MzI2OltbNzhdLDI1Nl0sNjUzMjc6W1s3OV0sMjU2XSw2NTMyODpbWzgwXSwyNTZdLDY1MzI5OltbODFdLDI1Nl0sNjUzMzA6W1s4Ml0sMjU2XSw2NTMzMTpbWzgzXSwyNTZdLDY1MzMyOltbODRdLDI1Nl0sNjUzMzM6W1s4NV0sMjU2XSw2NTMzNDpbWzg2XSwyNTZdLDY1MzM1OltbODddLDI1Nl0sNjUzMzY6W1s4OF0sMjU2XSw2NTMzNzpbWzg5XSwyNTZdLDY1MzM4OltbOTBdLDI1Nl0sNjUzMzk6W1s5MV0sMjU2XSw2NTM0MDpbWzkyXSwyNTZdLDY1MzQxOltbOTNdLDI1Nl0sNjUzNDI6W1s5NF0sMjU2XSw2NTM0MzpbWzk1XSwyNTZdLDY1MzQ0OltbOTZdLDI1Nl0sNjUzNDU6W1s5N10sMjU2XSw2NTM0NjpbWzk4XSwyNTZdLDY1MzQ3OltbOTldLDI1Nl0sNjUzNDg6W1sxMDBdLDI1Nl0sNjUzNDk6W1sxMDFdLDI1Nl0sNjUzNTA6W1sxMDJdLDI1Nl0sNjUzNTE6W1sxMDNdLDI1Nl0sNjUzNTI6W1sxMDRdLDI1Nl0sNjUzNTM6W1sxMDVdLDI1Nl0sNjUzNTQ6W1sxMDZdLDI1Nl0sNjUzNTU6W1sxMDddLDI1Nl0sNjUzNTY6W1sxMDhdLDI1Nl0sNjUzNTc6W1sxMDldLDI1Nl0sNjUzNTg6W1sxMTBdLDI1Nl0sNjUzNTk6W1sxMTFdLDI1Nl0sNjUzNjA6W1sxMTJdLDI1Nl0sNjUzNjE6W1sxMTNdLDI1Nl0sNjUzNjI6W1sxMTRdLDI1Nl0sNjUzNjM6W1sxMTVdLDI1Nl0sNjUzNjQ6W1sxMTZdLDI1Nl0sNjUzNjU6W1sxMTddLDI1Nl0sNjUzNjY6W1sxMThdLDI1Nl0sNjUzNjc6W1sxMTldLDI1Nl0sNjUzNjg6W1sxMjBdLDI1Nl0sNjUzNjk6W1sxMjFdLDI1Nl0sNjUzNzA6W1sxMjJdLDI1Nl0sNjUzNzE6W1sxMjNdLDI1Nl0sNjUzNzI6W1sxMjRdLDI1Nl0sNjUzNzM6W1sxMjVdLDI1Nl0sNjUzNzQ6W1sxMjZdLDI1Nl0sNjUzNzU6W1sxMDYyOV0sMjU2XSw2NTM3NjpbWzEwNjMwXSwyNTZdLDY1Mzc3OltbMTIyOTBdLDI1Nl0sNjUzNzg6W1sxMjMwMF0sMjU2XSw2NTM3OTpbWzEyMzAxXSwyNTZdLDY1MzgwOltbMTIyODldLDI1Nl0sNjUzODE6W1sxMjUzOV0sMjU2XSw2NTM4MjpbWzEyNTMwXSwyNTZdLDY1MzgzOltbMTI0NDldLDI1Nl0sNjUzODQ6W1sxMjQ1MV0sMjU2XSw2NTM4NTpbWzEyNDUzXSwyNTZdLDY1Mzg2OltbMTI0NTVdLDI1Nl0sNjUzODc6W1sxMjQ1N10sMjU2XSw2NTM4ODpbWzEyNTE1XSwyNTZdLDY1Mzg5OltbMTI1MTddLDI1Nl0sNjUzOTA6W1sxMjUxOV0sMjU2XSw2NTM5MTpbWzEyNDgzXSwyNTZdLDY1MzkyOltbMTI1NDBdLDI1Nl0sNjUzOTM6W1sxMjQ1MF0sMjU2XSw2NTM5NDpbWzEyNDUyXSwyNTZdLDY1Mzk1OltbMTI0NTRdLDI1Nl0sNjUzOTY6W1sxMjQ1Nl0sMjU2XSw2NTM5NzpbWzEyNDU4XSwyNTZdLDY1Mzk4OltbMTI0NTldLDI1Nl0sNjUzOTk6W1sxMjQ2MV0sMjU2XSw2NTQwMDpbWzEyNDYzXSwyNTZdLDY1NDAxOltbMTI0NjVdLDI1Nl0sNjU0MDI6W1sxMjQ2N10sMjU2XSw2NTQwMzpbWzEyNDY5XSwyNTZdLDY1NDA0OltbMTI0NzFdLDI1Nl0sNjU0MDU6W1sxMjQ3M10sMjU2XSw2NTQwNjpbWzEyNDc1XSwyNTZdLDY1NDA3OltbMTI0NzddLDI1Nl0sNjU0MDg6W1sxMjQ3OV0sMjU2XSw2NTQwOTpbWzEyNDgxXSwyNTZdLDY1NDEwOltbMTI0ODRdLDI1Nl0sNjU0MTE6W1sxMjQ4Nl0sMjU2XSw2NTQxMjpbWzEyNDg4XSwyNTZdLDY1NDEzOltbMTI0OTBdLDI1Nl0sNjU0MTQ6W1sxMjQ5MV0sMjU2XSw2NTQxNTpbWzEyNDkyXSwyNTZdLDY1NDE2OltbMTI0OTNdLDI1Nl0sNjU0MTc6W1sxMjQ5NF0sMjU2XSw2NTQxODpbWzEyNDk1XSwyNTZdLDY1NDE5OltbMTI0OThdLDI1Nl0sNjU0MjA6W1sxMjUwMV0sMjU2XSw2NTQyMTpbWzEyNTA0XSwyNTZdLDY1NDIyOltbMTI1MDddLDI1Nl0sNjU0MjM6W1sxMjUxMF0sMjU2XSw2NTQyNDpbWzEyNTExXSwyNTZdLDY1NDI1OltbMTI1MTJdLDI1Nl0sNjU0MjY6W1sxMjUxM10sMjU2XSw2NTQyNzpbWzEyNTE0XSwyNTZdLDY1NDI4OltbMTI1MTZdLDI1Nl0sNjU0Mjk6W1sxMjUxOF0sMjU2XSw2NTQzMDpbWzEyNTIwXSwyNTZdLDY1NDMxOltbMTI1MjFdLDI1Nl0sNjU0MzI6W1sxMjUyMl0sMjU2XSw2NTQzMzpbWzEyNTIzXSwyNTZdLDY1NDM0OltbMTI1MjRdLDI1Nl0sNjU0MzU6W1sxMjUyNV0sMjU2XSw2NTQzNjpbWzEyNTI3XSwyNTZdLDY1NDM3OltbMTI1MzFdLDI1Nl0sNjU0Mzg6W1sxMjQ0MV0sMjU2XSw2NTQzOTpbWzEyNDQyXSwyNTZdLDY1NDQwOltbMTI2NDRdLDI1Nl0sNjU0NDE6W1sxMjU5M10sMjU2XSw2NTQ0MjpbWzEyNTk0XSwyNTZdLDY1NDQzOltbMTI1OTVdLDI1Nl0sNjU0NDQ6W1sxMjU5Nl0sMjU2XSw2NTQ0NTpbWzEyNTk3XSwyNTZdLDY1NDQ2OltbMTI1OThdLDI1Nl0sNjU0NDc6W1sxMjU5OV0sMjU2XSw2NTQ0ODpbWzEyNjAwXSwyNTZdLDY1NDQ5OltbMTI2MDFdLDI1Nl0sNjU0NTA6W1sxMjYwMl0sMjU2XSw2NTQ1MTpbWzEyNjAzXSwyNTZdLDY1NDUyOltbMTI2MDRdLDI1Nl0sNjU0NTM6W1sxMjYwNV0sMjU2XSw2NTQ1NDpbWzEyNjA2XSwyNTZdLDY1NDU1OltbMTI2MDddLDI1Nl0sNjU0NTY6W1sxMjYwOF0sMjU2XSw2NTQ1NzpbWzEyNjA5XSwyNTZdLDY1NDU4OltbMTI2MTBdLDI1Nl0sNjU0NTk6W1sxMjYxMV0sMjU2XSw2NTQ2MDpbWzEyNjEyXSwyNTZdLDY1NDYxOltbMTI2MTNdLDI1Nl0sNjU0NjI6W1sxMjYxNF0sMjU2XSw2NTQ2MzpbWzEyNjE1XSwyNTZdLDY1NDY0OltbMTI2MTZdLDI1Nl0sNjU0NjU6W1sxMjYxN10sMjU2XSw2NTQ2NjpbWzEyNjE4XSwyNTZdLDY1NDY3OltbMTI2MTldLDI1Nl0sNjU0Njg6W1sxMjYyMF0sMjU2XSw2NTQ2OTpbWzEyNjIxXSwyNTZdLDY1NDcwOltbMTI2MjJdLDI1Nl0sNjU0NzQ6W1sxMjYyM10sMjU2XSw2NTQ3NTpbWzEyNjI0XSwyNTZdLDY1NDc2OltbMTI2MjVdLDI1Nl0sNjU0Nzc6W1sxMjYyNl0sMjU2XSw2NTQ3ODpbWzEyNjI3XSwyNTZdLDY1NDc5OltbMTI2MjhdLDI1Nl0sNjU0ODI6W1sxMjYyOV0sMjU2XSw2NTQ4MzpbWzEyNjMwXSwyNTZdLDY1NDg0OltbMTI2MzFdLDI1Nl0sNjU0ODU6W1sxMjYzMl0sMjU2XSw2NTQ4NjpbWzEyNjMzXSwyNTZdLDY1NDg3OltbMTI2MzRdLDI1Nl0sNjU0OTA6W1sxMjYzNV0sMjU2XSw2NTQ5MTpbWzEyNjM2XSwyNTZdLDY1NDkyOltbMTI2MzddLDI1Nl0sNjU0OTM6W1sxMjYzOF0sMjU2XSw2NTQ5NDpbWzEyNjM5XSwyNTZdLDY1NDk1OltbMTI2NDBdLDI1Nl0sNjU0OTg6W1sxMjY0MV0sMjU2XSw2NTQ5OTpbWzEyNjQyXSwyNTZdLDY1NTAwOltbMTI2NDNdLDI1Nl0sNjU1MDQ6W1sxNjJdLDI1Nl0sNjU1MDU6W1sxNjNdLDI1Nl0sNjU1MDY6W1sxNzJdLDI1Nl0sNjU1MDc6W1sxNzVdLDI1Nl0sNjU1MDg6W1sxNjZdLDI1Nl0sNjU1MDk6W1sxNjVdLDI1Nl0sNjU1MTA6W1s4MzYxXSwyNTZdLDY1NTEyOltbOTQ3NF0sMjU2XSw2NTUxMzpbWzg1OTJdLDI1Nl0sNjU1MTQ6W1s4NTkzXSwyNTZdLDY1NTE1OltbODU5NF0sMjU2XSw2NTUxNjpbWzg1OTVdLDI1Nl0sNjU1MTc6W1s5NjMyXSwyNTZdLDY1NTE4OltbOTY3NV0sMjU2XX1cblxufTtcblxuICAgLyoqKioqIE1vZHVsZSB0byBleHBvcnQgKi9cbiAgIHZhciB1bm9ybSA9IHtcbiAgICAgIG5mYzogbmZjLFxuICAgICAgbmZkOiBuZmQsXG4gICAgICBuZmtjOiBuZmtjLFxuICAgICAgbmZrZDogbmZrZCxcbiAgIH07XG5cbiAgIC8qZ2xvYmFscyBtb2R1bGU6dHJ1ZSxkZWZpbmU6dHJ1ZSovXG5cbiAgIC8vIENvbW1vbkpTXG4gICBpZiAodHlwZW9mIG1vZHVsZSA9PT0gXCJvYmplY3RcIikge1xuICAgICAgbW9kdWxlLmV4cG9ydHMgPSB1bm9ybTtcblxuICAgLy8gQU1EXG4gICB9IGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICBkZWZpbmUoXCJ1bm9ybVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICByZXR1cm4gdW5vcm07XG4gICAgICB9KTtcblxuICAgLy8gR2xvYmFsXG4gICB9IGVsc2Uge1xuICAgICAgcm9vdC51bm9ybSA9IHVub3JtO1xuICAgfVxuXG4gICAvKioqKiogRXhwb3J0IGFzIHNoaW0gZm9yIFN0cmluZzo6bm9ybWFsaXplIG1ldGhvZCAqKioqKi9cbiAgIC8qXG4gICAgICBodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OnNwZWNpZmljYXRpb25fZHJhZnRzI25vdmVtYmVyXzhfMjAxM19kcmFmdF9yZXZfMjFcblxuICAgICAgMjEuMS4zLjEyIFN0cmluZy5wcm90b3R5cGUubm9ybWFsaXplKGZvcm09XCJORkNcIilcbiAgICAgIFdoZW4gdGhlIG5vcm1hbGl6ZSBtZXRob2QgaXMgY2FsbGVkIHdpdGggb25lIGFyZ3VtZW50IGZvcm0sIHRoZSBmb2xsb3dpbmcgc3RlcHMgYXJlIHRha2VuOlxuXG4gICAgICAxLiBMZXQgTyBiZSBDaGVja09iamVjdENvZXJjaWJsZSh0aGlzIHZhbHVlKS5cbiAgICAgIDIuIExldCBTIGJlIFRvU3RyaW5nKE8pLlxuICAgICAgMy4gUmV0dXJuSWZBYnJ1cHQoUykuXG4gICAgICA0LiBJZiBmb3JtIGlzIG5vdCBwcm92aWRlZCBvciB1bmRlZmluZWQgbGV0IGZvcm0gYmUgXCJORkNcIi5cbiAgICAgIDUuIExldCBmIGJlIFRvU3RyaW5nKGZvcm0pLlxuICAgICAgNi4gUmV0dXJuSWZBYnJ1cHQoZikuXG4gICAgICA3LiBJZiBmIGlzIG5vdCBvbmUgb2YgXCJORkNcIiwgXCJORkRcIiwgXCJORktDXCIsIG9yIFwiTkZLRFwiLCB0aGVuIHRocm93IGEgUmFuZ2VFcnJvciBFeGNlcHRpb24uXG4gICAgICA4LiBMZXQgbnMgYmUgdGhlIFN0cmluZyB2YWx1ZSBpcyB0aGUgcmVzdWx0IG9mIG5vcm1hbGl6aW5nIFMgaW50byB0aGUgbm9ybWFsaXphdGlvbiBmb3JtIG5hbWVkIGJ5IGYgYXMgc3BlY2lmaWVkIGluIFVuaWNvZGUgU3RhbmRhcmQgQW5uZXggIzE1LCBVbmljb2RlTm9ybWFsaXphdG9pbiBGb3Jtcy5cbiAgICAgIDkuIFJldHVybiBucy5cblxuICAgICAgVGhlIGxlbmd0aCBwcm9wZXJ0eSBvZiB0aGUgbm9ybWFsaXplIG1ldGhvZCBpcyAwLlxuXG4gICAgICAqTk9URSogVGhlIG5vcm1hbGl6ZSBmdW5jdGlvbiBpcyBpbnRlbnRpb25hbGx5IGdlbmVyaWM7IGl0IGRvZXMgbm90IHJlcXVpcmUgdGhhdCBpdHMgdGhpcyB2YWx1ZSBiZSBhIFN0cmluZyBvYmplY3QuIFRoZXJlZm9yZSBpdCBjYW4gYmUgdHJhbnNmZXJyZWQgdG8gb3RoZXIga2luZHMgb2Ygb2JqZWN0cyBmb3IgdXNlIGFzIGEgbWV0aG9kLlxuICAgKi9cbiAgIGlmICghU3RyaW5nLnByb3RvdHlwZS5ub3JtYWxpemUpIHtcbiAgICAgIFN0cmluZy5wcm90b3R5cGUubm9ybWFsaXplID0gZnVuY3Rpb24oZm9ybSkge1xuICAgICAgICAgdmFyIHN0ciA9IFwiXCIgKyB0aGlzO1xuICAgICAgICAgZm9ybSA9ICBmb3JtID09PSB1bmRlZmluZWQgPyBcIk5GQ1wiIDogZm9ybTtcblxuICAgICAgICAgaWYgKGZvcm0gPT09IFwiTkZDXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bm9ybS5uZmMoc3RyKTtcbiAgICAgICAgIH0gZWxzZSBpZiAoZm9ybSA9PT0gXCJORkRcIikge1xuICAgICAgICAgICAgcmV0dXJuIHVub3JtLm5mZChzdHIpO1xuICAgICAgICAgfSBlbHNlIGlmIChmb3JtID09PSBcIk5GS0NcIikge1xuICAgICAgICAgICAgcmV0dXJuIHVub3JtLm5ma2Moc3RyKTtcbiAgICAgICAgIH0gZWxzZSBpZiAoZm9ybSA9PT0gXCJORktEXCIpIHtcbiAgICAgICAgICAgIHJldHVybiB1bm9ybS5uZmtkKHN0cik7XG4gICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCJJbnZhbGlkIG5vcm1hbGl6YXRpb24gZm9ybTogXCIgKyBmb3JtKTtcbiAgICAgICAgIH1cbiAgICAgIH07XG4gICB9XG59KHRoaXMpKTtcbiJdfQ==
(4)
});
