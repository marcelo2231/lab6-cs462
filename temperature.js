angular.module('timing', [])
.controller('MainCtrl', [
  '$scope','$http',
  function($scope,$http){
	$scope.currentTemperature = {temperature: "-", timestamp: "-"};
	$scope.profile = {location: "-", name: "-", threshold: "-", number: "-"};
    $scope.temperatures = [];
	$scope.threadsholds = [];
    $scope.eci = "JJivQPLaFjDXQuM4rntxH8";
    $scope.data = [];
    
    $scope.testManager = function() {
      var bURL = 'http://localhost:8080/sky/event/'+$scope.eci+'/create_child/sensor/new_sensor';
      var pURL = bURL + "?name=" + "Testando";
      $http.post(pURL).then(function(data){
        console.log(data.data.directives[1].options.pico.eci);
        $scope.data = data.data.directives[1].options.pico.eci;
      });
      pURL = bURL + "?name=" + "Testando" + "&section_id=122";
      $http.get(pURL).then(function(data){
      });
      pURL = bURL + "?name=" + "Testando1" + "&section%5Fid=123";
      $http.get(pURL).then(function(data){
      });
    };
    
	$scope.testManagerTwo = function() {
      var bURL = 'http://localhost:8080/sky/event/'+$scope.eci+'/deleting_child/sensor/unneeded_sensor';
      var pURL = bURL + "?name=" + "Testando1";
      $http.post(pURL).then(function(data){
      });
    };
	
	$scope.testManagerThree = function() {
      var bURL = 'http://localhost:8080/sky/event/'+$scope.data +'/5/wovyn/new_temperature_reading';
      pURL = bURL + "?temperature=30&timestamp=1";
      $http.post(pURL).then(function(data){
      });
      
      var gURL = 'http://localhost:8080/sky/cloud/'+$scope.data+'/io.picolabs.temperature_store/temperatures';
      $http.get(gURL).then(function(data){
          console.log(data)
        angular.copy(data.data, $scope.temperatures);
      });
    };
    
    
	$scope.getProfile = function() {
      var bURL = 'http://localhost:8080/sky/event/'+$scope.eci+'/5/sensor/profile_updated';
      var pURL = bURL + "?location=SLC&name=marcelo&threshold=70&number=8018089633";
      return $http.post(pURL).then(function(data){
        angular.copy(data.data.directives[0].options, $scope.profile);
        $scope.location='';
        $scope.name='';
        $scope.threshold='';
        $scope.number='';
      });
	};
  }
]);