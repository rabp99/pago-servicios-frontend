'use strict';

/**
 * @ngdoc function
 * @name pagoServiciosFrontendApp.controller:ServiciosCtrl
 * @description
 * # ServiciosCtrl
 * Controller of the pagoServiciosFrontendApp
 */
angular.module('pagoServiciosFrontendApp')
.controller('ServiciosCtrl', function ($scope, serviciosservice, $uibModal, tiposservice) {

    $scope.search = {};
    $scope.search.text = '';
    $scope.search.estado_id = '1';
    $scope.page = 1;
    $scope.loading_servicios = 'Seleccione un servicio';

    $scope.init = function() {
        $scope.loading = true;
        $scope.loading_tipos = 'Cargando...';
        tiposservice.get(function(data) {
            $scope.loading_tipos = 'Selecciona un Tipo';
            $scope.tipos = data.tipos;
            $scope.getServicios();
        });
    };
    
    $scope.getServicios = function() {
        $scope.loading = true;
        serviciosservice.get({
            search: $scope.search.text,
            tipo_id: $scope.tipo_id,
            page: $scope.page,
            estado_id: $scope.search.estado_id,
            text: $scope.search.text
        }, function(data) {
            $scope.servicios = data.servicios;
            $scope.pagination = data.pagination;
            $scope.loading = false;
        });
    };
    
    $scope.$watch('search.estado_id', function(oldValue, newValue) {
        $scope.page = 1;
        $scope.getServicios();
    });
    
    $scope.$watch('search.text', function(oldValue, newValue) {
        $scope.page = 1;
        $scope.getServicios();
    });
    
    $scope.pageChanged = function() {
        $scope.getServicios();
    };
    
    $scope.onChangeTipo = function() {
        $scope.getServicios();
    };
    
    $scope.showServiciosAdd = function() {
        var modalInstanceAdd = $uibModal.open({
            templateUrl: 'views/servicios-add.html',
            controller: 'ServiciosAddCtrl',
            backdrop: false
        });

        modalInstanceAdd.result.then(function (data) {
            $scope.message = data;
            $scope.servicios.push(data.servicio);
        });
    };
    
    $scope.showServiciosEdit = function(servicio) {
        var modalInstanceEdit = $uibModal.open({
            templateUrl: 'views/servicios-edit.html',
            controller: 'ServiciosEditCtrl',
            backdrop: false,
            resolve: {
                servicio_id: function() {
                    return servicio.id;
                } 
            }
        });

        modalInstanceEdit.result.then(function (data) {
            $scope.message = data;
            $scope.init();
        });
    };
    
    $scope.showServiciosDelete = function(servicio) {
        if (confirm('¿Está seguro de deshabilitar el servicio?')) {
            servicio.estado_id = 2;
            serviciosservice.save(servicio, function(data) {
                $scope.message = data;
            }, function(error) {
                servicio.estado_id = 1;
            });
        }
    };
    
    $scope.showServiciosActivate = function(servicio) {
        if (confirm('¿Está seguro de activar el servicio?')) {
            servicio.estado_id = 1;
            serviciosservice.save(servicio, function(data) {
                $scope.message = data;
            }, function(error) {
                servicio.estado_id = 2;
            });
        }
    };
    
    $scope.init();
});