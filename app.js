/**
 * Created by Pawan on 6/10/2015.
 */
var restify = require('restify');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var config = require('config');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var uuid = require('node-uuid');
var cors = require('cors');
var Room=require('./ConferenceManagement.js');
var User=require('./ConferenceUserManagement.js');
var DbConn = require('dvp-dbmodels');
var moment=require('moment');


var port = config.Host.port || 3000;
var version=config.Host.version;
var hpath=config.Host.hostpath;


var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
},function(req,res)
{

});
restify.CORS.ALLOW_HEADERS.push('authorization');
RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);

});
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
var Company=1;
    var Tenant=1;

    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        Room.AddConferenceRoom(req.body,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
     next();
});

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:ConfName',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        Room.UpdateConference(req.params.ConfName,req.body,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:ConfName/Time',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        Room.UpdateStartEndTimes(req.params.ConfName,req.body,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:CfName/AssignCloudEndUser/:CloudUserId',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        Room.MapWithCloudEndUser(req.params.CfName,parseInt(req.params.CloudUserId),reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});

RestServer.del('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:ConfName',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        Room.DeleteConference(req.params.ConfName,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});


RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
var Company= 1;
    var Tenant=1;

    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        User.AddConferenceUser(req.body,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});


RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId/AssignToRoom/:RoomName',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        User.MapWithRoom(req.params.UserId,req.params.RoomName,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});



RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId/AddToRoom/:RoomName',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        User.addUserToRoom(req.params.UserId,req.params.RoomName,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});


RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId/Mode',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        User.SetUserFlags(req.params.UserId,req.body,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});

RestServer.del('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        User.DeleteUser(parseInt(req.params.UserId),reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRooms',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }
var Company=1;
    var Tenant=1;

    //log.info("\n.............................................Add appointment Starts....................................................\n");
    try {
        //log.info("Inputs : "+req.body);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Request received -  Data - %s ',reqId,JSON.stringify(req.body));
        Room.GetConferenceRoomsOfCompany(Company,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else if(resz)
            {
                //log.info("Appointment saving Succeeded : "+resz);
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        //log.fatal("Exception found in AddAppointment : "+ex);
        //logger.error('[DVP-LimitHandler.NewAppointment] - [%s] - [HTTP]  - Exception occurred when service started : NewAppointment -  Data - %s ',reqId,JSON.stringify(req.body),ex);
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
        res.end(jsonString);
    }
    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:ConfName',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }



    try {

        Room.GetRoomDetails(req.params.ConfName,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);

                res.end(jsonString);
            }
            else if(resz)
            {

                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);

                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {

        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);

        res.end(jsonString);
    }
    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }



    try {

        User.GetUserDetails(parseInt(req.params.UserId),reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);

                res.end(jsonString);
            }
            else if(resz)
            {

                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);

                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {

        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);

        res.end(jsonString);
    }
    next();
});


RestServer.get('/test',function(err,res,next)
{

    User.GetUsersConference('+94721389808',1,function(e,r)
    {
        console.log("E "+e);
        console.log("R "+r);
    });
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/Mute',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    User.GetUserConference(req.params.User,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);

            res.end(jsonString);
        }
        else
        {
            try {

                User.MuteUser(resConf,req.params.User,reqId,function(err,resz)
                {

                    if(err)
                    {


                        var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);

                        res.end(jsonString);
                    }
                    else if(resz)
                    {

                        var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);

                        res.end(jsonString);
                    }

                });

            }
            catch(ex)
            {

                var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);

                res.end(jsonString);
            }
        }
    });





    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/UnMute',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    User.GetUserConference(req.params.User,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);

            res.end(jsonString);
        }
        else
        {
            try {

                User.UnMuteUser(resConf,req.params.User,reqId,function(err,resz)
                {

                    if(err)
                    {

                        var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);

                        res.end(jsonString);
                    }
                    else if(resz)
                    {

                        var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);

                        res.end(jsonString);
                    }

                });

            }
            catch(ex)
            {

                var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);

                res.end(jsonString);
            }
        }
    });




    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/Deaf',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    User.GetUserConference(req.params.User,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else
        {
            try {
                User.DeafUser(resConf,req.params.User,reqId,function(err,resz)
                {

                    if(err)
                    {

                        var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                        res.end(jsonString);
                    }
                    else if(resz)
                    {
                        var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                        res.end(jsonString);
                    }

                });

            }
            catch(ex)
            {
                var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                res.end(jsonString);
            }
        }
    });


    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/UnDeaf',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    User.GetUserConference(req.params.User,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else
        {
            try {
                User.UnDeafUser(resConf,req.params.User,reqId,function(err,resz)
                {

                    if(err)
                    {

                        var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                        res.end(jsonString);
                    }
                    else if(resz)
                    {
                        var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                        res.end(jsonString);
                    }

                });

            }
            catch(ex)
            {
                var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                res.end(jsonString);
            }
        }
    });

    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/Kick',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    User.GetUserConference(req.params.User,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }
        else
        {
            try {
                User.KickUser(resConf,req.params.User,reqId,function(err,resz)
                {

                    if(err)
                    {

                        var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                        res.end(jsonString);
                    }
                    else if(resz)
                    {
                        var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                        res.end(jsonString);
                    }

                });

            }
            catch(ex)
            {
                var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                res.end(jsonString);
            }
        }
    });

    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Users/Mute',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


            try {
                User.MuteAllUsers(req.params.ConfName,reqId,function(err,resz)
                {

                    if(err)
                    {
                        var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                        res.end(jsonString);
                    }
                    else if(resz)
                    {
                        var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                        res.end(jsonString);
                    }

                });

            }
            catch(ex)
            {
                var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                res.end(jsonString);
            }


    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Users/UnMute',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    try {
        User.UnMuteAllUsers(req.params.ConfName,reqId,function(err,resz)
        {

            if(err)
            {

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else if(resz)
            {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }





    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Users/Deaf',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    try {
        User.DeafAllUsers(req.params.ConfName,reqId,function(err,resz)
        {

            if(err)
            {

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else if(resz)
            {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }


    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Users/UnDeaf',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    try {

        User.UnDeafAllUsers(req.params.ConfName,reqId,function(err,resz)
        {

            if(err)
            {

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else if(resz)
            {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {

        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }


    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Lock',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    try {

        User.LockRoom(req.params.ConfName,reqId,function(err,resz)
        {

            if(err)
            {

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else if(resz)
            {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {

        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }


    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Unlock',function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }


    try {

        User.UnLockRoom(req.params.ConfName,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else if(resz)
            {
                var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }


    next();
});
