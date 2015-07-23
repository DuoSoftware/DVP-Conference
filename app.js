/**
 * Created by Pawan on 6/10/2015.
 */
var restify = require('restify');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var config = require('config');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var uuid = require('node-uuid');
var cors = require('cors');
var Room=require('./ConferenceManagement.js');
var User=require('./ConferenceUserManagement.js');
var DbConn = require('DVP-DBModels');
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
RestServer.use(cors());
//Server listen
RestServer.listen(port, function () {
    console.log('%s listening at %s', RestServer.name, RestServer.url);

});
//Enable request body parsing(access)
RestServer.use(restify.bodyParser());
RestServer.use(restify.acceptParser(RestServer.acceptable));
RestServer.use(restify.queryParser());

RestServer.post('/DVP/API/'+version+'/ConferenceApi/ConferenceRoom',function(req,res,next)
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

RestServer.post('/DVP/API/'+version+'/ConferenceApi/ConferenceRoom/:ConfName',function(req,res,next)
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

RestServer.post('/DVP/API/'+version+'/ConferenceApi/ConferenceRoom/:ConfName/Time',function(req,res,next)
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

RestServer.post('/DVP/API/'+version+'/ConferenceApi/Conference/:CfName/AssignCloudEndUser/:CloudUserId',function(req,res,next)
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

RestServer.del('/DVP/API/'+version+'/ConferenceApi/ConferenceRoom/:ConfName',function(req,res,next)
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

RestServer.post('/DVP/API/'+version+'/ConferenceApi/ConferenceUser',function(req,res,next)
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

RestServer.post('/DVP/API/'+version+'/ConferenceApi/ConferenceUser/:UserId/AssignToRoom/:RoomName',function(req,res,next)
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

RestServer.post('/DVP/API/'+version+'/ConferenceApi/ConferenceUser/:UserId/Mode',function(req,res,next)
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

RestServer.del('/DVP/API/'+version+'/ConferenceApi/ConferenceUser/:UserId',function(req,res,next)
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




RestServer.get('/DVP/API/'+version+'/ConferenceApi/ConferenceRooms',function(req,res,next)
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

RestServer.get('/DVP/API/'+version+'/ConferenceApi/ConferenceRoom/:ConfName',function(req,res,next)
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
        Room.GetRoomDetails(req.params.ConfName,reqId,function(err,resz)
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

RestServer.get('/DVP/API/'+version+'/ConferenceApi/ConferenceUser/:UserId',function(req,res,next)
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
        User.GetUserDetails(parseInt(req.params.UserId),reqId,function(err,resz)
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


RestServer.get('/test',function(err,res,next)
{

    var s=moment.utc(new Date()).format("YYYY-MM-DD HH:mm:ss");
    console.log(s);
//var x=new Date();
    var dt=new Date();
    var xx=new Date(dt.valueOf() + dt.getTimezoneOffset() * 60000);
    console.log(xx);
    var conditionalData = {
        StartTime: {
            lt: [xx]
        },
        EndTime:
        {
            gt:[xx]
        }
    };
    DbConn.Conference.find({where:conditionalData}).complete(function(e,r)
    {

        res.end(JSON.stringify(r));
    });
});