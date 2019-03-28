(function () {
    'use strict';

    define([
            'durandal/app',
            'services/core/localization',
            'services/data/datacontext',
            'viewmodels/behaviors/editor'
        ],
        function (app, localization, datacontext, editor) {

            var Model = function () {
                this.activate = activate;
                this.title = 'Templates';

                this.getTemplateType = getTemplateType;
                this.getLanguage = getLanguage;

                this.templates = datacontext.templates.items;
                this.templateTypeSet = localization.getLocalizedCodeSet('templateType');
                this.languageSet = localization.getLocalizedCodeSet('language');
            };

            var vm = new Model();

            editor.extend(vm, datacontext.templates);

            return vm;

            function activate() {

                ko.bindingHandlers.wysiwyg.defaults = {
                    'plugins': [ 'link' ],
                    'toolbar': 'undo redo | bold italic | bullist numlist | link',
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


                vm.canDelete(false);

                vm.selectedItem(undefined);
                return true;
            }

            function getTemplateType(typeCode) {
                return vm.templateTypeSet.getById(typeCode).name;
            }

            function getLanguage(languageCode) {
                return vm.languageSet.getById(languageCode).name;
            }
        });
}());
