/**
 * Created by dinusha on 6/9/2016.
 */

var httpReq = require('request');
var config = require('config');
var util = require('util');
var validator = require('validator');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;

//Notification Server

var SendNotificationByKey = function(reqId, eventname, eventuuid, chanId, message, refId)
{
    try
    {
        var nsIp = config.NS.ip;
        var nsPort = config.ND.port;
        var nsVersion = config.NS.version;

        var token = config.Token;

        var httpUrl = util.format('http://%s/DVP/API/%s/NotificationService/Notification/Publish', nsIp, nsVersion);

        if(validator.isIP(nsIp))
        {
            httpUrl = util.format('http://%s:%d/DVP/API/%s/NotificationService/Notification/Publish', nsIp, nsPort, nsVersion);
        }

        var nsObj = {
            Ref: refId,
            Message: message
        };

        var jsonStr = JSON.stringify(nsObj);

        var options = {
            url: httpUrl,
            method: 'POST',
            headers: {
                'authorization': token,
                'content-type': 'application/json',
                'eventname': eventname,
                'eventuuid': eventuuid,
                'querykey': chanId
            },
            body: jsonStr
        };

        logger.debug('[DVP-Conference.SendNotificationByKey] - [%s] - Creating Api Url : %s', reqId, httpUrl);


        httpReq.post(options, function (error, response, body)
        {
            if (!error && response.statusCode >= 200 && response.statusCode <= 299)
            {
                logger.debug('[DVP-Conference.SendNotificationByKey] - [%s] - Send Notification Success : %s', reqId, body);
            }
            else
            {
                logger.error('[DVP-Conference.SendNotificationByKey] - [%s] - Send Notification Fail', reqId, error);
            }
        })

    }
    catch(ex)
    {
        logger.error('[DVP-Conference.SendNotificationByKey] - [%s] - ERROR Occurred', reqId, ex);

    }
};

module.exports.SendNotificationByKey = SendNotificationByKey;
