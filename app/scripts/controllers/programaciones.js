'use strict';

/**
 * @ngdoc function
 * @name pagoServiciosFrontendApp.controller:ProgramacionesCtrl
 * @description
 * # ProgramacionesCtrl
 * Controller of the pagoServiciosFrontendApp
 */
angular.module('pagoServiciosFrontendApp')
.controller('ProgramacionesCtrl', function ($scope, serviciosservice, programacionesservice,
    $uibModal, tiposservice) {
    
    $scope.search = {};
    $scope.search.text = '';
    $scope.servicio = {};
    $scope.servicio.id = '';
    $scope.tipo = {};
    $scope.tipo.id = '';
    $scope.search.estado_id = '';
    $scope.page = 1;
    $scope.loading_servicios = 'Seleccione un servicio';
    
    $scope.init = function() {
        $scope.loading_tipos = 'Cargando...';
        tiposservice.get(function(data) {
            $scope.loading_tipos = 'Selecciona un Tipo';
            $scope.tipos = data.tipos;
            $scope.getProgramaciones();
        });
    };
    
    $scope.pageChanged = function() {
        $scope.getProgramaciones();
    };
    
    $scope.getProgramaciones = function() {
        $scope.programaciones = [];
        $scope.loading = true;
        if ($scope.servicio === null) {
            $scope.servicio = {};
            $scope.servicio.id = '';
        }
        if ($scope.tipo === null) {
            $scope.tipo = {};
            $scope.tipo.id = '';
        }
        programacionesservice.get({
            tipo_id: $scope.tipo.id,
            servicio_id: $scope.servicio.id,
            search: $scope.search.text,
            page: $scope.page,
            estado_id: $scope.search.estado_id,
            text: $scope.search.text
        }, function(data) {
            $scope.programaciones = data.programaciones;
            $scope.loading = false;
            $scope.pagination = data.pagination;
        });
    };
    
    $scope.$watch('search.estado_id', function(oldValue, newValue) {
        $scope.page = 1;
        $scope.getProgramaciones();
    });
    
    $scope.$watch('search.text', function(oldValue, newValue) {
        $scope.page = 1;
        $scope.getProgramaciones();
    });
    
    $scope.onChangeTipo = function(tipo_id) {
        $scope.servicios = [];
        $scope.loading_servicios = 'Cargando...';
        if (tipo_id === undefined) {
            $scope.loading_servicios = 'Seleccione un servicio';
            $scope.getProgramaciones();
        } else {
            serviciosservice.getByTipo({tipo_id: tipo_id}, function(data) {
                $scope.loading_servicios = 'Seleccione un servicio';
                $scope.servicios = data.servicios;
                $scope.getProgramaciones();
            });
        }
    };
    
    $scope.onChangeServicio = function(servicio_id) {
        $scope.loading = true;
        $scope.getProgramaciones();
    };
    
    $scope.showProgramacionesAdd = function(servicio, tipo) {
        var modalInstanceAdd = $uibModal.open({
            templateUrl: 'views/programaciones-add.html',
            controller: 'ProgramacionesAddCtrl',
            backdrop: false,
            resolve: {
                servicio: function() {
                    return servicio;
                },
                tipo: function() {
                    return tipo;
                }
            }
        });

        modalInstanceAdd.result.then(function (data) {
            $scope.message = data;
            $scope.programaciones.push(data.programacion);
        });
    };
    
    $scope.showProgramacionesCancelar = function(programacion) {
        if (confirm('¿Está seguro de cancelar el pago?')) {
            programacion.estado_id = 4;
            programacion.fecha_pago = null;
            programacion.nro_documento = null;
            programacionesservice.cancelarPago(programacion, function(data) {
                $scope.message = data;
            }, function(error) {
                programacion.estado_id = 3;
            });
        }
    };
    
    $scope.showProgramacionesDelete = function(programacion) {
        if (confirm('¿Está seguro de eliminar la programación?')) {
            programacion.estado_id = 2;
            programacionesservice.save(programacion, function(data) {
                $scope.message = data;
            }, function(error) {
                programacion.estado_id = 3;
            });
        }
    };
    
    $scope.showProgramacionesActivate = function(programacion) {
        if (confirm('¿Está seguro de activar la programación?')) {
            programacion.estado_id = 4;
            programacionesservice.save(programacion, function(data) {
                $scope.message = data;
            }, function(error) {
                programacion.estado_id = 3;
            });
        }
    };
    
    $scope.showProgramacionesEdit = function(programacion, servicio, tipo) {
        var modalInstanceAdd = $uibModal.open({
            templateUrl: 'views/programaciones-edit.html',
            controller: 'ProgramacionesEditCtrl',
            backdrop: false,
            resolve: {
                programacion: function() {
                    return programacion;
                },
                servicio: function() {
                    return servicio;
                },
                tipo: function() {
                    return tipo;
                }
            }
        });

        modalInstanceAdd.result.then(function (data) {
            $scope.message = data;
            $scope.onChangeServicio($scope.servicio.id);
        });
    };
    
    $scope.showProgramacionesPagar = function(programacion, servicio, tipo) {
        var modalInstancePagar = $uibModal.open({
            templateUrl: 'views/programaciones-pagar.html',
            controller: 'ProgramacionesPagarCtrl',
            backdrop: false,
            resolve: {
                programacion: function() {
                    return programacion;
                },
                servicio: function() {
                    return servicio;
                },
                tipo: function() {
                    return tipo;
                }
            }
        });

        modalInstancePagar.result.then(function (data) {
            $scope.message = data;
            $scope.getProgramacionesByServicio(servicio.id);
        });
    };
    
    $scope.init();
});