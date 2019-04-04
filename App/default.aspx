<%@ Page Language="C#" AutoEventWireup="true" CodeFile="default.aspx.cs" Inherits="Odg._default" %>

<%@ Import Namespace="System.Web.Configuration" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <title>Oil Diversity</title>

    <meta charset="utf-8"/>

    <meta name="apple-mobile-web-app-capable" content="yes"/>
    <meta name="apple-mobile-web-app-status-bar-style" content="black"/>
    <meta name="format-detection" content="telephone=no"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>

    <meta http-equiv="X-UA-Compatible" content="IE=edge, chrome=1"/>

    <meta property="og:image" content="https://oildiversitycdn.blob.core.windows.net/app/images/logo/logo-solo.png"/>
    <meta property="og:title" content="Oil Diversity Global® HR Portal."/>
    <meta property="og:description" content="Welcome to Oil Diversity®"/>

    <link rel="stylesheet" href="bower_components/bootstrap/dist/css/bootstrap.css"/>
    <link rel="stylesheet" href="bower_components/font-awesome/css/font-awesome.css"/>
    <link rel="stylesheet" href="bower_components/durandal/css/durandal.css"/>
    <link rel="stylesheet" href="bower_components/animate.css/animate.css"/>
    <link rel="stylesheet" href="bower_components/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css"/>
    <link rel="stylesheet" href="bower_components/bootstrap-social/bootstrap-social.css"/>
    <link rel="stylesheet" href="bower_components/toastr/toastr.min.css"/>
    <link rel="stylesheet" href="bower_components/bootstrap-datepicker/dist/css/bootstrap-datepicker3.min.css"/>
    <link rel="stylesheet" href="bower_components/bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css"/>

    <link rel="stylesheet" href="dist/skins/lightgray/skin.min.css"/>
    <link rel="stylesheet" href="dist/skins/lightgray/content.min.css"/>

    <link rel="stylesheet" href="styles/ie10mobile.css"/>
    <link rel="stylesheet" href="styles/bootstrap.theme.min.css"/>
    <link rel="stylesheet" href="dist/styles.css"/>
    <link rel="stylesheet" href="styles/knockout.autocomplete.css" />

    <script src="bower_components/knockout/dist/knockout.js"></script>

    <script src="bower_components/tinymce/tinymce.min.js"></script>
    <script src="bower_components/tinymce/themes/modern/theme.min.js"></script>
    <script src="bower_components/tinymce/plugins/paste/plugin.min.js"></script>
    <script src="bower_components/tinymce/plugins/link/plugin.min.js"></script>

    <script src="scripts/autosize.min.js"></script>

    <script>
        var languageCode = 'en';
        var baseUrl = "<% Response.Write(WebConfigurationManager.AppSettings["apiBaseUrl"]); %>";
        var systemType = "<% Response.Write(WebConfigurationManager.AppSettings["systemType"]); %>";
        var instrumentationKey = "<% Response.Write(WebConfigurationManager.AppSettings["applicationInsightsKey"]); %>";
        var facebookAppId = "<% Response.Write(WebConfigurationManager.AppSettings["facebookAppId"]); %>";
    </script>

    <script type="text/javascript">
        if (navigator.userAgent.match(/IEMobile\/10\.0/)) {
            var msViewportStyle = document.createElement("style");
            var mq = "@@-ms-viewport{width:auto!important}";
            msViewportStyle.appendChild(document.createTextNode(mq));
            document.getElementsByTagName("head")[0].appendChild(msViewportStyle);
        }
    </script>

    <script type="text/javascript">
         var appInsights = window.appInsights || function (config) {

                    function r(config) {
                        t[config] = function () {
                            var i = arguments;
                            t.queue.push(function () {
                                t[config].apply(t, i)
                            })
                        }
                    }

                    var t = {config: config}, u = document, e = window, o = "script", s = u.createElement(o), i, f;
                    for (s.src = config.url || "//az416426.vo.msecnd.net/scripts/a/ai.0.js", u.getElementsByTagName(o)[0].parentNode.appendChild(s), t.cookie = u.cookie, t.queue = [], i = ["Event", "Exception", "Metric", "PageView", "Trace"]; i.length;)r("track" + i.pop());
                    return r("setAuthenticatedUserContext"), r("clearAuthenticatedUserContext"), config.disableExceptionTracking || (i = "onerror", r("_" + i), f = e[i], e[i] = function (config, r, u, e, o) {
                        var s = f && f(config, r, u, e, o);
                        return s !== !0 && t["_" + i](config, r, u, e, o), s
                    }), t
                }({instrumentationKey: instrumentationKey });
        window.appInsights = appInsights;
    </script>


</head>

<body>
<div id="fb-root"></div>

<script>
    window.fbAsyncInit = function () {
        FB.init({
            appId: facebookAppId,
            status: true,
            xfbml: true
        });
        FB.Event.subscribe('edge.create',
                function (response) {
                    //alert('You liked the URL: ' + response);
                    var app = require('durandal/app');
                    app.trigger('faceBookLiked');
                });
        FB.Event.subscribe('edge.remove',
                function (response) {
                    var app = require('durandal/app');
                    app.trigger('faceBookUnLiked');
                }
        );
    };

    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
            return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/all.js";
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));

</script>

<div id="applicationHost">
    <div class="splash">
        <div class="loader-spinner">

        </div>
    </div>
</div>

<script src="dist/main.js"></script>

</body>
</html>
