(function () {
    'use strict';

    define([
        'durandal/app',
        'services/core/logger',
        'services/core/config',
        'services/data/dataservice',
        'services/data/datacontext',
        'services/core/state',
        'services/core/security'
    ], function (app, logger, config, dataservice, datacontext, state, security) {

        var vm = {
            activate: activate,
            canActivate: canActivate,
            title: 'Administration',
            loc: datacontext.translations.item,
            selectedView: ko.observable(),
            views: ko.observableArray([])
        };

        vm.setSelectedView = function (view) {
            vm.selectedView(view);
        };

        return vm;

        function canActivate() {
            if (!state.isAuthenticated()) {
                return {redirect: '#/signin/home'};
            }

            return true;
        }

        function activate() {

            var views = getFilteredViews();

            var dataViews = views.filter(function(dataView){
                return dataView.getData;
            });

            vm.views(views);
            vm.selectedView(views[0]);

            return $.when(dataViews.map(function(dataView){
                return dataView.getData();
            }));
        }

        function getFilteredViews() {
            return [
                {
                    name: 'Companies',
                    id: 'viewmodels/adminCompanies',
                    icon: 'fa fa-building',
                    description: 'Add a new company or edit the settings of an existing one',
                    items: datacontext.companies.items,
                    objectTypeCode: 'organization'
                },
                {
                    name: 'User Groups',
                    id: 'viewmodels/adminUserGroups',
                    description: 'User groups provide ways to group users with similar rights to simplify access control',
                    icon: 'fa fa-group',
                    getData: datacontext.userGroups.getData,
                    items: datacontext.userGroups.items,
                    objectTypeCode: 'userGroup'
                },
                {
                    name: 'Security Rights',
                    id: 'viewmodels/adminAccessLists',
                    description: 'Associates user groups with rights to perform operations at various organizations',
                    icon: 'fa fa-user-secret',
                    getData: datacontext.principalAccessLists.getData,
                    items: datacontext.principalAccessLists.items,
                    objectTypeCode: 'accessList'
                },
                {
                    name: 'Templates',
                    id: 'viewmodels/adminTemplates',
                    description: 'Manages predefined text snippets in multiple languages',
                    icon: 'fa fa-pencil-square',
                    getData: datacontext.templates.getData,
                    items: datacontext.templates.items,
                    objectTypeCode: 'template'
                },
                {
                    name: 'Update Subscribers',
                    id: 'viewmodels/adminUpdateSubscribersList',
                    description: 'Check the list of users those who want to be update with us.',
                    icon: 'fa fa-th-list',
                    getData: datacontext.updateSubscribers.getData,
                    items: datacontext.updateSubscribers.items,
                    objectTypeCode: 'updateSubscriberUser'
                },
                {
                    name: 'Contents',
                    id: 'viewmodels/adminContents',
                    description: 'Manage all text/html contents of system.',
                    icon: 'fa fa-file-text',
                    getData: datacontext.contents.getData,
                    items: datacontext.contents.items,
                    objectTypeCode: 'content'
                },
                {
                    name: 'Quarterly Magazine',
                    id: 'viewmodels/adminQuarterlyMagazines',
                    description: 'Publish or manage Quarterly Magazines.',
                    icon: 'fa fa-list-alt',
                    getData: datacontext.quarterlyMagazines.getData,
                    items: datacontext.quarterlyMagazines.items,
                    objectTypeCode: 'quarterlyMagazine'
                },
                //{
                //    name: 'Documents Library',
                //    id: 'viewmodels/adminDocumentLibrary',
                //    description: 'Publish or manage Documents.',
                //    icon: 'fa fa-book',
                //    getData: datacontext.documentLibraries.getData,
                //    items: datacontext.documentLibraries.items,
                //    objectTypeCode: 'documentLibrary'
                //}
            ].filter(function(view){
                    return security.checkAccess({ objectTypeCode: view.objectTypeCode });
                });
            }
    });
})();
