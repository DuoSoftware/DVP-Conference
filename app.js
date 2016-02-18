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
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');


var port = config.Host.port || 3000;
var version=config.Host.version;
var hpath=config.Host.hostpath;


var RestServer = restify.createServer({
    name: "myapp",
    version: '1.0.0'
},function(req,res)
{

});
RestServer.pre(restify.pre.userAgentConnection());
restify.CORS.ALLOW_HEADERS.push('authorization');
RestServer.use(restify.CORS());
RestServer.use(restify.fullResponse());
RestServer.use(jwt({secret: secret.Secret}));
//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);

});
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());


RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom',authorization({resource:"conference", action:"read"}),function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    if(!req.user.company || !req.user.tenant)
    {
        var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"),"ERROR/EXCEPTION", false, undefined);
        res.end(jsonString);
    }
    var Company=req.user.company;
    var Tenant=req.user.tenant;


    try {

        Room.AddConferenceRoom(req.body,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else
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

RestServer.put('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:ConfName',authorization({resource:"conference", action:"write"}),function(req,res,next)
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

        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;
        Room.UpdateConference(req.params.ConfName,req.body,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else
            {
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

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:ConfName/Time',authorization({resource:"conference", action:"write"}),function(req,res,next)
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
        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        Room.UpdateStartEndTimes(req.params.ConfName,req.body,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:CfName/AssignCloudEndUser/:CloudUserId',authorization({resource:"conference", action:"write"}),function(req,res,next)
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
        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        Room.MapWithCloudEndUser(req.params.CfName,parseInt(req.params.CloudUserId),Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.del('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:ConfName',authorization({resource:"conference", action:"write"}),function(req,res,next)
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

        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        Room.DeleteConference(req.params.ConfName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser',authorization({resource:"conference", action:"write"}),function(req,res,next)
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
        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;


        User.AddConferenceUser(req.body,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId/AssignToRoom/:RoomName',authorization({resource:"conference", action:"write"}),function(req,res,next)
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

        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.MapWithRoom(req.params.UserId,req.params.RoomName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId/AddToRoom/:RoomName',authorization({resource:"conference", action:"write"}),function(req,res,next)
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

        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.addUserToRoom(req.params.UserId,req.params.RoomName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.post('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId/Mode',authorization({resource:"conference", action:"write"}),function(req,res,next)
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
        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;



        User.SetUserFlags(req.params.UserId,req.body,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.del('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId',authorization({resource:"conference", action:"write"}),function(req,res,next)
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
        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.DeleteUser(parseInt(req.params.UserId),Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRooms',authorization({resource:"conference", action:"read"}),function(req,res,next)
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

        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        Room.GetConferenceRoomsOfCompany(Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRoom/:ConfName',authorization({resource:"conference", action:"read"}),function(req,res,next)
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


        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);

            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;


        Room.GetRoomDetails(req.params.ConfName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);

                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceUser/:UserId',authorization({resource:"conference", action:"read"}),function(req,res,next)
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

        if(!req.user.company || !req.user.tenant)
        {

            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.GetUserDetails(parseInt(req.params.UserId),reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);

                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/Mute',authorization({resource:"conference", action:"read"}),function(req,res,next)
{
    var reqId='';

    try
    {
        reqId = uuid.v1();
    }
    catch(ex)
    {

    }

    try
    {
        if(!req.user.company || !req.user.tenant)
        {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);

            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;


        User.GetUserConference(req.params.User,Company,Tenant,reqId,function(errConf,resConf)
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

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }


    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/UnMute',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);

            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;


        User.GetUserConference(req.params.User, Company, Tenant, reqId, function (errConf, resConf) {
            if (errConf) {
                var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);

                res.end(jsonString);
            }
            else {
                try {

                    User.UnMuteUser(resConf, req.params.User, reqId, function (err, resz) {

                        if (err) {

                            var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);

                            res.end(jsonString);
                        }
                        else if (resz) {

                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);

                            res.end(jsonString);
                        }

                    });

                }
                catch (ex) {

                    var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);

                    res.end(jsonString);
                }
            }
        });
    }
    catch (e)
    {
        var jsonString = messageFormatter.FormatMessage(e, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }




    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/Deaf',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.GetUserConference(req.params.User, Company, Tenant, reqId, function (errConf, resConf) {
            if (errConf) {
                var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else {
                try {
                    User.DeafUser(resConf, req.params.User, reqId, function (err, resz) {

                        if (err) {

                            var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                            res.end(jsonString);
                        }
                        else if (resz) {
                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                            res.end(jsonString);
                        }

                    });

                }
                catch (ex) {
                    var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }
            }
        });
    }
    catch (ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }


    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/UnDeaf',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.GetUserConference(req.params.User, Company, Tenant, reqId, function (errConf, resConf) {
            if (errConf) {
                var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else {
                try {
                    User.UnDeafUser(resConf, req.params.User, reqId, function (err, resz) {

                        if (err) {

                            var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                            res.end(jsonString);
                        }
                        else if (resz) {
                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                            res.end(jsonString);
                        }

                    });

                }
                catch (ex) {
                    var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }
            }
        });
    } catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }

    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/Kick',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.GetUserConference(req.params.User,Company,Tenant, reqId, function (errConf, resConf) {
            if (errConf) {
                var jsonString = messageFormatter.FormatMessage(errConf, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else {
                try {
                    User.KickUser(resConf, req.params.User, reqId, function (err, resz) {

                        if (err) {

                            var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                            res.end(jsonString);
                        }
                        else if (resz) {
                            var jsonString = messageFormatter.FormatMessage(undefined, "SUCCESS", true, resz);
                            res.end(jsonString);
                        }

                    });

                }
                catch (ex) {
                    var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
                    res.end(jsonString);
                }
            }
        });
    } catch (ex) {
        var jsonString = messageFormatter.FormatMessage(ex, "EXCEPTION", false, undefined);
        res.end(jsonString);
    }

    next();
});

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Users/Mute',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.MuteAllUsers(req.params.ConfName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Users/UnMute',authorization({resource:"conference", action:"read"}),function(req,res,next)
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

        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.UnMuteAllUsers(req.params.ConfName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Users/Deaf',authorization({resource:"conference", action:"read"}),function(req,res,next)
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

        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;


        User.DeafAllUsers(req.params.ConfName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Users/UnDeaf',authorization({resource:"conference", action:"read"}),function(req,res,next)
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

        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.UnDeafAllUsers(req.params.ConfName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Lock',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.LockRoom(req.params.ConfName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else
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

RestServer.get('/DVP/API/'+version+'/ConferenceOperations/Conference/:ConfName/Unlock',authorization({resource:"conference", action:"read"}),function(req,res,next)
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

        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.UnLockRoom(req.params.ConfName,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                res.end(jsonString);
            }
            else
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


RestServer.post('/DVP/API/'+version+'/Conference/:confName/user',authorization({resource:"conference", action:"write"}),function(req,res,next)
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

        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.mapUserWithRoom(req.params.confName,req.body,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

RestServer.put('/DVP/API/'+version+'/ConferenceUser/:UserId',authorization({resource:"conference", action:"write"}),function(req,res,next)
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
        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        User.updateUser(req.params.UserId,req.body,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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


RestServer.get('/DVP/API/'+version+'/Conference/:confName/users',authorization({resource:"conference", action:"read"}),function(req,res,next)
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

        if (!req.user.company || !req.user.tenant) {
            var jsonString = messageFormatter.FormatMessage(new Error("Invalid authorization details found"), "ERROR/EXCEPTION", false, undefined);
            res.end(jsonString);
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.usersOfConference(req.params.confName,req.body,Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {
                //log.error("Error in AddAppointment : "+err);

                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
                res.end(jsonString);
            }
            else
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

function Crossdomain(req,res,next){


    var xml='<?xml version=""1.0""?><!DOCTYPE cross-domain-policy SYSTEM ""http://www.macromedia.com/xml/dtds/cross-domain-policy.dtd""> <cross-domain-policy>    <allow-access-from domain=""*"" />        </cross-domain-policy>';

    /*var xml='<?xml version="1.0"?>\n';

     xml+= '<!DOCTYPE cross-domain-policy SYSTEM "/xml/dtds/cross-domain-policy.dtd">\n';
     xml+='';
     xml+=' \n';
     xml+='\n';
     xml+='';*/
    req.setEncoding('utf8');
    res.end(xml);

}

function Clientaccesspolicy(req,res,next){


    var xml='<?xml version="1.0" encoding="utf-8" ?>       <access-policy>        <cross-domain-access>        <policy>        <allow-from http-request-headers="*">        <domain uri="*"/>        </allow-from>        <grant-to>        <resource include-subpaths="true" path="/"/>        </grant-to>        </policy>        </cross-domain-access>        </access-policy>';
    req.setEncoding('utf8');
    res.end(xml);

}

RestServer.get("/crossdomain.xml",Crossdomain);
RestServer.get("/clientaccesspolicy.xml",Clientaccesspolicy);