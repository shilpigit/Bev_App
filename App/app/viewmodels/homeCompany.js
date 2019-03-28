(function () {
    'use strict';

    define([
            'durandal/app',
            'plugins/router',
            'services/core/logger',
            'services/core/config',
            'services/data/dataservice',
            'services/data/datacontext',
            'services/core/instrumentation',
            'services/core/localization',
            'services/core/security'
        ],
        function (app, router, logger, config, dataservice, datacontext, instrumentationSrv) {
            var vm = {
                title: 'Companies Panel',
                activate: activate,
                config: config,
                loc: datacontext.translations.item,
                selectedView: ko.observable('dashboard'),
                currentUser: datacontext.user.item.user,
                setSelectedView: setSelectedView
            };

            vm.activeView = ko.computed(function () {
                if (vm.selectedView() === 'dashboard') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'Dashboard'});
                    return 'viewmodels/homeCompanyDashboard';
                }
                else if (vm.selectedView() === 'company') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'Companies'});
                    return 'viewmodels/adminCompanies';
                }
                else if (vm.selectedView() === 'vacancies') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'Vacancies'});
                    return 'viewmodels/homeCompanyVacancies';
                }
                else if (vm.selectedView() === 'applications') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'Applications'});
                    return 'viewmodels/homeCompanyApplications';
                }
                else if (vm.selectedView() === 'candidateProfileSearch') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'CandidateProfileSearch'});
                    return 'viewmodels/homeCompanyCandidateProfileSearch';
                }
                else if (vm.selectedView() === 'communityNetworkSearch') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'CommunityNetworkSearch'});
                    return 'viewmodels/homeCompanyCommunityNetworkSearch';
                }
                else if (vm.selectedView() === 'industryAward') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'IndustryAward'});
                    return 'viewmodels/homeCompanyIndustryAward';
                }
                else if (vm.selectedView() === 'graduateShareScheme') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'GraduateShareScheme'});
                    return 'viewmodels/adminCompanyGraduateShareScheme';
                }
                else if (vm.selectedView() === 'redundancyPortal') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'RedundancyPortal'});
                    return 'viewmodels/adminCompanyRedundantProfile';
                }
                else if (vm.selectedView() === 'businessCoOperation') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'BusinessCoOperation'});
                    return 'viewmodels/adminCompanyBusinessCoOperation';
                }
                else if (vm.selectedView() === 'graduateRecruitment') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'GraduateRecruitment'});
                    return 'viewmodels/adminCompanyGraduateRecruitment';
                }
                else if (vm.selectedView() === 'equipment') {
                    instrumentationSrv.trackEvent('CompanyDashboard', {'View': 'Equipment'});
                    return 'viewmodels/adminCompanyEquipment';
                }
                //else if (vm.selectedView() === 'documentLibrary') {
                //    instrumentationSrv.trackEvent('DocumentLibrary', {'View': 'DocumentLibrary'});
                //    return 'viewmodels/homeCompanyDocumentLibrary';
                //}
                else if (vm.selectedView() === 'mentoringPortal') {
                    instrumentationSrv.trackEvent('MentoringPortal', { 'View': 'MentoringPortal' });
                    return 'viewmodels/homeCompanyMentoringPortal';
                }
                else if (vm.selectedView() === 'technologyShowcasePortal') {
                    instrumentationSrv.trackEvent('TechnologyShowcasePortal', { 'View': 'stringTechnologyShowcasePortal' });
                    return 'viewmodels/homeCompanyTechnologyShowcase';
                }
                else if (vm.selectedView() === 'innovationPortal') {
                    instrumentationSrv.trackEvent('InnovationPortal', { 'View': 'InnovationPortal' });
                    return 'viewmodels/adminCompanyInnovativePortal';
                }
                else if (vm.selectedView() === 'userAssistance') {
                    instrumentationSrv.trackEvent('UserAssistance', { 'View': 'UserAssistance' });
                    return 'viewmodels/homeCompanyUserAssistance';
                }
                else{
                    return;
                }
                return;
            });

            function setSelectedView(view) {
                vm.selectedView(view);
            }

            return vm;


            function activate(id) {

                if (id) {
                    return true;
                }
            }

        });
}());
