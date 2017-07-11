﻿/**
 * Created by big on 2017/7/6.
 */

define([
    'app',
    'helper/util',
    'pingpp',
    'text!html/pay.html',
], function (app, util, pingpp, htmlContent) {
    app.registerController("payController", ['$scope', 'Account', 'modal', '$rootScope', function ($scope, Account, modal, $rootScope) {
        
        var queryArgs = util.getQueryObject();

        $scope.price  = 1;
        $scope.qr_url = "";

        if (Account.ensureAuthenticated()) {
            Account.getUser(function (userinfo) {
                $scope.userinfo = userinfo;
                //console.log($scope.user);
            });
        }

        $scope.alipay = function () {
            if ($scope.isMobile) {
                $scope.alipayClient();
            } else {
                $scope.alipayQR();
            }
        }

        $scope.wechat = function () {
            if ($scope.isMobile) {
                $scope.wechatClient();
            } else {
                $scope.wechatQR();
            }
        }

        $scope.alipayClient = function () {
            var params = {
                "amount" : $scope.price,
                "channel": "alipay_pc_direct",
                "subject": "支付测试",
                "body"   : "支付测试",
            };

            createCharge(params, function (charge) {
                startPay(charge);
            });
        }

        $scope.wechatClient = function () {
            var params = {
                "amount": $scope.price,
                "channel": "wx_pub",
                "subject": "支付测试",
                "body": "支付测试",
            };

            createCharge(params);
        }

        $scope.alipayQR = function () {
            var params = {
                "amount": $scope.price,
                "channel": "alipay_qr",
                "subject": "支付测试",
                "body": "支付测试",
            };

            createCharge(params, function (charge) {
                //console.log(charge);
                $scope.qr_url = charge.credential.alipay_qr;

                $(".pay-qrcode").css("display", "block");
            })
        }

        $scope.wechatQR = function () {
            var params = {
                "amount": $scope.price,
                "channel": "wx_pub_qr",
                "subject": "支付测试",
                "body": "支付测试",
            };

            createCharge(params, function (charge) {
                //console.log(charge);
                $scope.qr_url = charge.credential.wx_pub_qr;

                $(".pay-qrcode").css("display", "block");
            })
        }

        $scope.isMobile = function () {
            var u = navigator.userAgent;
            var isMobile = false;

            console.log(u);

            if (u.match(/ipad/i) && u.match(/ipad/i).toString().toLocaleLowerCase() == "ipad") {
                isMobile = true;
            }

            if (u.match(/iphone/i) && u.match(/iphone/i).toString().toLocaleLowerCase() == "iphone") {
                isMobile = true;
            }

            if (u.match(/android/i) && u.match(/android/i).toString().toLocaleLowerCase() == "android") {
                isMobile = true;
            }

            return isMobile;
        }();

        function createCharge(params, callback) {
            util.http("POST", config.apiUrlPrefix + "pay/createCharge", params, function (response) {
                var charge = response.data;
                if (typeof (callback) == "function") {
                    callback(charge);
                }
            });
        }

        function startPay(charge) {
            pingpp.createPayment(charge, function (result, err) {
                console.log(result);
                console.log(err.msg);
                console.log(err.extra);
                if (result == "success") {
                    // 只有微信公众账号 wx_pub 支付成功的结果会在这里返回，其他的支付结果都会跳转到 extra 中对应的 URL。
                } else if (result == "fail") {
                    // charge 不正确或者微信公众账号支付失败时会在此处返回
                } else if (result == "cancel") {
                    // 微信公众账号支付取消支付
                }
            });
        }
    }]);

    return htmlContent;
});