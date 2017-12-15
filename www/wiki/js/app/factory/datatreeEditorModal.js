/**
 * Created by Rango Yuan on 2017/12/13.
 * 
 * //How to use?
 * config.services.datatreeEditorModal(
 *      {
 *          title: 'Editor Title',
 *          showLocation: false,
 *          datatree: [
 *              {
 *                  id: '1',
 *                  name: 'name1',
 *                  children: [...sub datatree]
 *              }
 *          ],
 *          keys: [
 *              {
 *                  key: 'url',
 *                  name: '链接',
 *                  type: 'url',
 *                  placeholder: '请输入链接'
 *              }
 *          ]
 *      },
 *      res => console.log(res), 
 *      err => console.log(err)
 * );
 * 
 */

// Example:
//
// config.services.datatreeEditorModal({
//     title: "编辑器", 
//     keys: [
//         {key:'url', name: '链接', placeholder:"请输入链接"},
//         {key:'note', name: '备注', placeholder:"请输入备注"},
//     ], 
//     showLocation: true, 
//     datatree: [
//         {id: 0, name:'nihao', children: [{id:2, name: 'nibuhao'}]}
//     ]
// }, res => console.log(res));

define([
    'app',
    'helper/util',
    'helper/datatree',
    'bluebird',
    'text!html/partial/datatreeEditorModal.html',
], function (app, util, datatree, Promise, htmlContent) {
    app.registerController("datatreeEditorModalController", ['$scope', 'options', function ($scope, options) {
        var options = options || {};
        options.title = options.title || 'Datatree Editor';
        options.showLocation = typeof options.showLocation === 'boolean' ? options.showLocation : true;
        options.datatree = options.datatree || [{id: datatree.uuid()}];
        options.keys = options.keys || [];

        $scope.title = options.title;
        $scope.showLocation = options.showLocation;
        $scope.datatree = options.datatree;
        $scope.keys = options.keys;

        $scope.flattenedData = datatree.flattenTreeByChildren($scope.datatree);
        console.log('flattenedData', $scope.flattenedData);

        $scope.getPathOfItem = function(item) {
            return datatree.getPathOfItemInflattenedData(item, $scope.flattenedData);
        }
        $scope.addSiblingBefore = function(item) {
            datatree.addSiblingInflattenedDataBeforeItem(item, $scope.flattenedData);
        }
        $scope.addSiblingAfter = function(item) {
            datatree.addSiblingInflattenedDataAfterItem(item, $scope.flattenedData);
        }
        $scope.addChild = function(item) {
            datatree.addChildOfItemInflattenedData(item, $scope.flattenedData);
        }
        $scope.removeItem = function(item) {
            datatree.removeItemItemInflattenedData(item, $scope.flattenedData);
        }
        $scope.submit = function() {
            var result = datatree.makeTreeWithParentId($scope.flattenedData);
            $scope.$close(result);
        }
        $scope.cancel = function() {
            $scope.$dismiss('Canceled')
        }
    }]);

    app.factory('datatreeEditorModal', ['$uibModal', function ($uibModal) {
        function datatreeEditorModal(options, successCallback, errorCallback) {
            return new Promise(function(resolve, reject) {
                $uibModal.open({
                    template: htmlContent,
                    controller: 'datatreeEditorModalController',
                    size: 'lg',
                    windowClass: 'datatree-editor-popup',
                    resolve: {
                        options: options
                    }
                }).result.then(function(res) {
                    successCallback && successCallback();
                    resolve(res);
                }, function(error) {
                    errorCallback && errorCallback(error);
                    reject(error);
                });
            });
        }
        return datatreeEditorModal;
    }]);
});
