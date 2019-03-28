(function () {
    'use strict';

    define([
            'durandal/app',
            'services/core/localization',
            'services/data/datacontext',
            'viewmodels/behaviors/editor',
            'services/core/logger',
            'Clipboard'
        ],
        function (app, localization, datacontext, editor, logger, Clipboard) {

            var Model = function () {
                this.title = 'Update Subscribers List';
                this.loc = datacontext.translations.item;
                this.activate = activate;
                this.compositionComplete = compositionComplete;
                this.users = datacontext.updateSubscribers.items;

            };

            var vm = new Model();

            editor.extend(vm, datacontext.updateSubscribers);

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            vm.csvValue = ko.pureComputed({
                read: function () {
                    var csv = '';
                    for (var i = 0; i < vm.users().length; i++) {
                        csv += vm.users()[i].user.person.names.fullName() + ',' + vm.users()[i].user.emailAddress() + '\r\n';
                    }
                    return csv;
                }
            });

            return vm;

            function activate() {

                var clipboard = new Clipboard('.copy-csv');

                clipboard.on('success', function () {
                    logger.logInfo(vm.loc.stringUsersInformationCopied());
                });

                return true;
            }

            function compositionComplete() {
                return true;
            }
        });
}());
