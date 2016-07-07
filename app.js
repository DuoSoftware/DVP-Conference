/**
 * Created by Pawan on 6/10/2015.
 */
var restify = require('restify');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var config = require('config');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var uuid = require('node-uuid');
var cors = require('cors');
var httpReq = require('request');
var Room=require('./ConferenceManagement.js');
var User=require('./ConferenceUserManagement.js');
var jwt = require('restify-jwt');
var secret = require('dvp-common/Authentication/Secret.js');
var authorization = require('dvp-common/Authentication/Authorization.js');
var token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJkaW51c2hhZGNrIiwianRpIjoiMjViZjZmZTItZjZjNC00ZWJhLWFmODgtNmMxNjIxOTU4OGRiIiwic3ViIjoiNTZhOWU3NTlmYjA3MTkwN2EwMDAwMDAxMjVkOWU4MGI1YzdjNGY5ODQ2NmY5MjExNzk2ZWJmNDMiLCJleHAiOjE4OTI0NDE2NzIsInRlbmFudCI6MSwiY29tcGFueSI6Mywic2NvcGUiOlt7InJlc291cmNlIjoiYWxsIiwiYWN0aW9ucyI6ImFsbCJ9XSwiaWF0IjoxNDYwNDM4MDcyfQ.aPoVPiTtoGFgnKmhdLBTzwTrQRTGWWliYujHP5NONqU";
var util = require('util');

var port = config.Host.port || 3000;
var version=config.Host.version;


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

    console.log(req.body.Extension);


    try {

        if(!req.user.company || !req.user.tenant)
        {
            throw new Error("Invalid company or tenant");
        }
        var Company=req.user.company;
        var Tenant=req.user.tenant;

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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
        }



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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRooms/Page/:rowCount/:pageNo',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        Room.GetConferenceRoomsOfCompanyWithPaging(Company,Tenant,req.params.rowCount,req.params.pageNo,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
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

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ConferenceRooms/PageCount',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        Room.GetCountOfConferenceRooms(Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
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

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ActiveConferenceRooms',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        Room.GetActiveConferenceRooms(Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
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

RestServer.get('/DVP/API/'+version+'/ConferenceConfiguration/ActiveConferenceRooms/PageCount',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        Room.GetActiveConferenceRoomCount(Company,Tenant,reqId,function(err,resz)
        {

            if(err)
            {


                var jsonString = messageFormatter.FormatMessage(err, "ERROR/EXCEPTION", false, undefined);
                //logger.debug('[DVP-LimitHandler.NewAppointment] - [%s] - Request response : %s ',reqId,jsonString);
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
            throw new Error("Invalid company or tenant");
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

            throw new Error("Invalid company or tenant");
        }


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



RestServer.post('/DVP/API/'+version+'/ConferenceOperations/:ConferenceName/ConferenceUser/:User/Mute',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;
        var conference=req.params.ConferenceName;


        /*User.GetUserConference(req.params.User,Company,Tenant,reqId,function(errConf,resConf)
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
                        else
                        {
                            var jsonString = messageFormatter.FormatMessage(new Error("Error in operation"), "ERROR/EXCEPTION", false, resz);
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
        });*/


        User.MuteUser(conference,req.params.User,reqId,function(err,resz)
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
            else
            {
                var jsonString = messageFormatter.FormatMessage(new Error("Error in operation"), "ERROR/EXCEPTION", false, resz);
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

RestServer.post('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/UnMute',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
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

RestServer.post('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/Deaf',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
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

RestServer.post('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/UnDeaf',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
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

RestServer.post('/DVP/API/'+version+'/ConferenceOperations/ConferenceUser/:User/Kick',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.mapUserWithRoom(req.params.confName,req.body,Company,Tenant,reqId,function(err,resz,confRoom,sipData)
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

                if(req.body.SipUACEndpointId && sipData.SipUsername)
                {


                    console.log("Sip data ", JSON.stringify(req.body));

                    /* var MessageData={

                     "Conference Name":req.params.confName,
                     "Stating Time":confRoom.StartTime,
                     "Ending Time":confRoom.EndTime,
                     }*/

                    var MessageDetails = "You have invited to a Conference named "+req.params.confName+" on "+confRoom.StartTime;

                    var msgObject =
                    {
                        "To":sipData.GuRefId,
                        "CallbackURL":"",
                        "Direction":"STATELESS",
                        "Message":MessageDetails,
                        "Ref":"fgdy34",
                        "From":"conference manager",
                        "MessageType":"basic"
                    }



                    var httpUrl = util.format('http://127.0.0.1:8089/DVP/API/%s/NotificationService/Notification/initiate', version);
                    console.log("URL "+httpUrl);
                    var options = {
                        url : httpUrl,
                        method : 'POST',
                        json : msgObject,
                        headers:{
                            'eventName':'conference_user_assigned',
                            'eventUuid':'gsdbshmx45y28',
                            'authorization':"bearer "+token

                        }

                    };


                    httpReq(options, function (error, response, body)
                    {
                        if (!error && response.statusCode == 200)
                        {
                            console.log("no errrs");
                            //console.log(JSON.stringify(response));
                        }
                        else
                        {
                            console.log("errrs  "+error);

                        }
                    });
                }




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
            throw new Error("Invalid company or tenant");
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;

        User.usersOfConference(req.params.confName,Company,Tenant,reqId,function(err,resz)
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





////////////////////////////////// Conference Template API's //////////////////////////////////////


RestServer.get('/DVP/API/:version/ConferenceConfiguration/Templates/Group/:groupId', authorization({resource:"conference", action:"read"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var grpId = req.params.groupId;

        logger.debug('[DVP-Conference.GetTemplatesByGroup] - [%s] - HTTP Request Received - Params : GroupId : %s', reqId, grpId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }


        if(grpId)
        {
            Room.GetTemplatesByGroup(reqId, grpId, function(err, templates)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Get templates by group failed", false, false);
                    logger.debug('[DVP-Conference.GetTemplatesByGroup] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(null, "Get templates by group success", true, templates);
                    logger.debug('[DVP-Conference.GetTemplatesByGroup] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }

            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error('Group Id not supplied'), "Group Id not supplied", false, false);
            logger.debug('[DVP-Conference.GetTemplatesByGroup] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }


    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "Exception occurred", false, false);
        logger.debug('[DVP-Conference.GetTemplatesByGroup] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);

    }
    return next();

});

RestServer.get('/DVP/API/:version/ConferenceConfiguration/Templates', authorization({resource:"conference", action:"read"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-Conference.GetTemplates] - [%s] - HTTP Request Received', reqId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        Room.GetTemplates(reqId, function(err, templates)
        {
            if(err)
            {
                var jsonString = messageFormatter.FormatMessage(err, "Get templates failed", false, false);
                logger.debug('[DVP-Conference.GetTemplatesByGroup] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(null, "Get templates success", true, templates);
                logger.debug('[DVP-Conference.GetTemplatesByGroup] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }

        })

    }
    catch(ex)
    {
        var jsonString = messageFormatter.FormatMessage(ex, "Exception occurred", false, false);
        logger.debug('[DVP-Conference.GetTemplatesByGroup] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);

    }
    return next();

});

RestServer.post('/DVP/API/:version/ConferenceConfiguration/Conference/:confName/ActiveTemplate/:templateName', authorization({resource:"conference", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        var confName = req.params.confName;
        var template = req.params.templateName;

        logger.debug('[DVP-Conference.SetActiveTemplate] - [%s] - HTTP Request Received - Params : ConfName : %s, ActiveTemplate : %s', reqId, confName, template);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }


        if(confName && template)
        {
            Room.AssignTemplateToConferenceDB(reqId, confName, template, companyId, tenantId, function(err, assignResult)
            {
                if(err)
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Assign Template To Conference Failed", false, false);
                    logger.debug('[DVP-Conference.SetActiveTemplate] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }
                else
                {
                    var jsonString = messageFormatter.FormatMessage(err, "Assign Template To Conference Success", true, assignResult);
                    logger.debug('[DVP-Conference.SetActiveTemplate] - [%s] - API RESPONSE : %s', reqId, jsonString);
                    res.end(jsonString);
                }

            })
        }
        else
        {
            var jsonString = messageFormatter.FormatMessage(new Error('Conference room name or template id not supplied'), "Conference room name or template id not supplied", false, false);
            logger.debug('[DVP-Conference.SetActiveTemplate] - [%s] - API RESPONSE : %s', reqId, jsonString);
            res.end(jsonString);
        }


    }
    catch(ex)
    {
        logger.error('[DVP-Conference.SetActiveTemplate] - [%s] - Exception Occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "Exception occurred", false, false);
        logger.debug('[DVP-Conference.SetActiveTemplate] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);

    }
    return next();

});


RestServer.get('/DVP/API/:version/ConferenceConfiguration/Conference/AvailableExtensions', authorization({resource:"conference", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-Conference.AvailableExtensionsOfConference] - [%s] - HTTP Request Received - Params :Extension', reqId);

        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        Room.PickValidExtensions(null,companyId,tenantId, function (errValidExt,resVaildExt) {

            if(errValidExt)
            {
                logger.error('[DVP-Conference.AvailableExtensionsOfConference] - [%s] - Exception Occurred', reqId, errValidExt);
                var jsonString = messageFormatter.FormatMessage(errValidExt, "Exception occurred", false, false);
                logger.debug('[DVP-Conference.AvailableExtensionsOfConference] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resVaildExt);
                logger.debug('[DVP-Conference.AvailableExtensionsOfConference] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        logger.error('[DVP-Conference.AvailableExtensionsOfConference] - [%s] - Exception Occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "Exception occurred", false, false);
        logger.debug('[DVP-Conference.AvailableExtensionsOfConference] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);

    }
    return next();

});

RestServer.get('/DVP/API/:version/ConferenceConfiguration/Conference/:ConferenceName/AvailableExtensions', authorization({resource:"conference", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-Conference.AvailableExtensions] - [%s] - HTTP Request Received', reqId);

        var conferenceName=req.params.ConferenceName;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        Room.PickValidExtensions(conferenceName,companyId,tenantId, function (errValidExt,resVaildExt) {

            if(errValidExt)
            {
                logger.error('[DVP-Conference.AvailableExtensions] - [%s] - Exception Occurred', reqId, errValidExt);
                var jsonString = messageFormatter.FormatMessage(errValidExt, "Exception occurred", false, false);
                logger.debug('[DVP-Conference.AvailableExtensions] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
            else
            {
                var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, resVaildExt);
                logger.debug('[DVP-Conference.AvailableExtensions] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        logger.error('[DVP-Conference.CheckExtensionAvailability] - [%s] - Exception Occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "Exception occurred", false, false);
        logger.debug('[DVP-Conference.CheckExtensionAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);

    }
    return next();

});


RestServer.post('/DVP/API/'+version+'/ConferenceOperations/:ConferenceName/ConferenceUser/:User/Action/:Operation',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;
        var conference=req.params.ConferenceName;
        var confUser=req.params.User;
        var operation=req.params.Operation;


        /*User.GetUserConference(req.params.User,Company,Tenant,reqId,function(errConf,resConf)
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
         else
         {
         var jsonString = messageFormatter.FormatMessage(new Error("Error in operation"), "ERROR/EXCEPTION", false, resz);
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
         });*/


        User.manageConfUserStatus(conference,confUser,operation,reqId,function(err,resz)
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
            else
            {
                var jsonString = messageFormatter.FormatMessage(new Error("Error in operation"), "ERROR/EXCEPTION", false, resz);
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


RestServer.post('/DVP/API/'+version+'/ConferenceOperations/:ConferenceName/ConferenceUsers/:Operation',authorization({resource:"conference", action:"read"}),function(req,res,next)
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
            throw new Error("Invalid company or tenant");
        }

        var Company = req.user.company;
        var Tenant = req.user.tenant;
        var conference=req.params.ConferenceName;
        var confUser=req.params.User;
        var operation=req.params.Operation;


        /*User.GetUserConference(req.params.User,Company,Tenant,reqId,function(errConf,resConf)
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
         else
         {
         var jsonString = messageFormatter.FormatMessage(new Error("Error in operation"), "ERROR/EXCEPTION", false, resz);
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
         });*/


        User.manageAllConfUserStatus(conference,operation,reqId,function(err,resz)
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
            else
            {
                var jsonString = messageFormatter.FormatMessage(new Error("Error in operation"), "ERROR/EXCEPTION", false, resz);
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

RestServer.get('/DVP/API/:version/ConferenceConfiguration/Extension/:Extension/Availability', authorization({resource:"conference", action:"write"}), function(req, res, next)
{
    var reqId = uuid.v1();
    try
    {
        logger.debug('[DVP-Conference.ExtensionAvailability] - [%s] - HTTP Request Received - Params :Extension', reqId);

        var Extension=req.params.Extension;
        var companyId = req.user.company;
        var tenantId = req.user.tenant;

        if (!companyId || !tenantId)
        {
            throw new Error("Invalid company or tenant");
        }

        Room.PickValidExtensions(null,companyId,tenantId, function (errValidExt,resVaildExt) {

            if(errValidExt)
            {
                logger.error('[DVP-Conference.AvailableExtensions] - [%s] - Exception Occurred', reqId, errValidExt);
                var jsonString = messageFormatter.FormatMessage(errValidExt, "Exception occurred", false, false);
                logger.debug('[DVP-Conference.AvailableExtensions] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }
            else
            {
                var availability=CheckExtensionAvailability(Extension,resVaildExt)

                var jsonString = messageFormatter.FormatMessage(undefined, "Success", true, availability);
                logger.debug('[DVP-Conference.AvailableExtensions] - [%s] - API RESPONSE : %s', reqId, jsonString);
                res.end(jsonString);
            }

        });

    }
    catch(ex)
    {
        logger.error('[DVP-Conference.CheckExtensionAvailability] - [%s] - Exception Occurred', reqId, ex);
        var jsonString = messageFormatter.FormatMessage(ex, "Exception occurred", false, false);
        logger.debug('[DVP-Conference.CheckExtensionAvailability] - [%s] - API RESPONSE : %s', reqId, jsonString);
        res.end(jsonString);

    }
    return next();

});

function CheckExtensionAvailability(extension,extList)
{
    for(var i=0;i<extList.length;i++)
    {
        if(extList[i].Extension==extension)
        {
            return false;
        }

        if(i==extList.length-1)
        {
            return true;
        }

    }
}

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