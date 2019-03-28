(function () {
    'use strict';

    define(['services/core/logger', 'services/core/config'],
        function (logger, config) {

            var service = {
                getParameterValues: getParameterValues,
                getAllParametersWithValues: getAllParametersWithValues,
                validateEmail: validateEmail,
                scrollToAnchor: scrollToAnchor,
                scrollToElement: scrollToElement,
                trim: trim,
                trimByWord: trimByWord,
                resolveFileUrl: resolveFileUrl
            };

            return service;

            function getParameterValues(param) {

                var url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
                for (var i = 0; i < url.length; i++) {
                    var urlparam = url[i].split('=');
                    if (urlparam[0] === param) {
                        return urlparam[1];
                    }
                }
            }

            function getAllParametersWithValues() {
                if (window.location.href.indexOf('?') > -1) {
                    return window.location.href.slice(window.location.href.indexOf('?') + 1);
                }
                return '';
            }

            function validateEmail(email) {
                var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
                return re.test(email);
            }

            function scrollToAnchor(anchorId) {
                var aTag = $('a[name="' + anchorId + '"]');
                var navbar = $('.navbar');
                $('html,body').animate({scrollTop: (aTag.offset().top - navbar.height())}, 'slow');
            }

            function scrollToElement(el) {
                var navbar = $('.navbar');
                $('html,body').animate({scrollTop: (el.offset().top - (navbar.height() * 2))}, 'slow');
            }

            function trim(sentence, maxLength) {
                var trimmedString = sentence.substr(0, maxLength);
                return trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(' ')));
            }

            function trimByWord(sentence, wordsCount) {

                if (sentence) {
                    var splittedString = sentence.split(' ');

                    if (splittedString.length > 1 && splittedString.length >= wordsCount) {

                        if (splittedString) {
                            return splittedString.slice(0, wordsCount).join(' ') + '...';
                        }
                    } else {
                        return sentence;
                    }

                } else {
                    return sentence;
                }
            }

            function resolveFileUrl(fileId){

                if (fileId) {
                    return config.root + 'api/storage/redirect?id=' + fileId;
                }

                return config.imageCdn + 'logo/logo-solo.png';
            }
        });
})();
