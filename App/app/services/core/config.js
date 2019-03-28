(function () {
    'use strict';

    define(['knockout', 'durandal/system'],
        function (ko, system) {
            // jshint unused:false
            // jshint undef:false
            var config = {

                /* jshint ignore:start */
                root: baseUrl,
                systemType: systemType,
                instrumentationKey: instrumentationKey,
                /* jshint ignore:end */

                languageCode: ko.observable('en'),
                lengthCode: ko.observable('cm'),
                widthCode: ko.observable('gram'),
                dateFormat: 'DD MMM YYYY',
                dateTimeFormat: 'DD MMM YYYY HH:mm',
                dateFormatSelect: 'YYYY-MM-DD',
                timeFormatSelect: 'HH:mm',

                 // mail
                sendEmailTo: 'bev@oildiversity.com',
                keyMandrill: 'h5rNASp31Pq52ly495bLjw',
            };

            /* jshint ignore:start*/
        
            //config.imageCdn = systemType === 'Production' ? 'https://odgcocommon.azureedge.net/app/images/' : 'https://odgcocommon.azureedge.net/app/images/';
            //config.sponsorshipPackageUrl = systemType === 'Production' ? '//www.oildiversity.com/#!/show/?key=sign-up' : '//test.oildiversity.com/#!/show/?key=sign-up';
            //config.homePageUrl = systemType === 'Production' ? '//www.oildiversity.com/' : '//test.oildiversity.com/';

            config.imageCdn = systemType === 'Production' ? 'https://cdn.oildiversity.com/app/images/' : 'https://cdn.oildiversity.com/app/images/';
            config.sponsorshipPackageUrl = systemType === 'Production' ? 'http://dev.oildiversity.com/#!/show/?key=sign-up' : 'http://dev.oildiversity.com/#!/show/?key=sign-up';
            config.homePageUrl = systemType === 'Production' ? 'https://www.oildiversity.com' : 'https://dev.oildiversity.com';

            if (languageCode.value) {
                config.languageCode(languageCode.value);
            }
            /* jshint ignore:end*/

            return config;
        });
})();
