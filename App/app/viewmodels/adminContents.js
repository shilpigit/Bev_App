(function () {
    'use strict';

    define([
            'durandal/app',
            'services/core/localization',
            'services/data/datacontext',
            'viewmodels/behaviors/editor',
            'services/core/instrumentation',
            'services/core/logger'
        ],
        function (app, localization, datacontext, editor, instrumentationSrv) {
        
            var Model = function () {
                this.activate = activate;
                this.title = 'Contents';
                this.getContentCategory = getContentCategory;
                this.getLanguage = getLanguage;
                this.contents = datacontext.contents.items;
                this.contentCategorySet = localization.getLocalizedCodeSet('contentCategory');
                this.languageSet = localization.getLocalizedCodeSet('language');
                this.isInEditMode = ko.observable(false);
                this.selectedContentCategory = ko.observable();
                this.filteredCompanies = ko.observableArray();
                this.selectedContentCategory.subscribe(selectedContentCategoryChanged, this);
            };
         
            var vm = new Model();

            vm.isInEditMode = ko.pureComputed({
                read: function () {
                    return vm.selectedItem().id();
                }
            });

            vm.contentKeys = ko.pureComputed({
                read: function () {
                   
                    var keys = localization.getLocalizedCodeSet(vm.selectedItem().categoryCodeValue() + 'Key');
                    return keys;
                }
            });

            vm.messageDetail = {
                message: ko.observable(),
                type: ko.observable()
            };

            // Extend with entity set editing
            editor.extend(vm, datacontext.contents);

            return vm;

            function activate() {

                ko.bindingHandlers.wysiwyg.defaults = {
                    'plugins': ['link','code'],
                    'toolbar': 'undo redo | bold italic | bullist numlist | link | code',
                    'menubar': false,
                    'statusbar': false,
                    'setup': function (ed) {
                        ed.on('keydown', function (event) {
                            if (event.keyCode === 9) { // tab pressed
                                if (event.shiftKey) {
                                    ed.execCommand('Outdent');
                                }
                                else {
                                    ed.execCommand('Indent');
                                }

                                event.preventDefault();
                                return false;
                            }
                        });
                    }
                };

                vm.selectedItem(undefined);

                return true;
            }

            function getContentCategory(typeCode, keyCode) {

                var keys = localization.getLocalizedCodeSet(typeCode + 'Key');
                return vm.contentCategorySet.getById(typeCode).name() + ' - ' + keys.getById(keyCode).name();

            }

            function getLanguage(languageCode) {
                return vm.languageSet.getById(languageCode).name;
            }

            function selectedContentCategoryChanged() {

                instrumentationSrv.trackEvent('Contents', {'Command': 'ListContent'});

                vm.filteredCompanies.removeAll();

                ko.utils.arrayFilter(datacontext.contents.items(), function (el) {
                    if (el.categoryCodeValue() === vm.selectedContentCategory()) {
                        vm.filteredCompanies.push(el);
                    }
                });
            }

        });
}());
