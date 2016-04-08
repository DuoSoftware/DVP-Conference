/**
 * Created by Pawan on 6/10/2015.
 */
var httpReq = require('request');
var util = require('util');
var DbConn = require('dvp-dbmodels');
var redis=require('redis');
var config=require('config');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var moment=require('moment');

var port = config.Redis.port || 3000;
var ip = config.Redis.ip;
var password = config.Redis.password;



var client = redis.createClient(port,ip);

client.auth(password, function (error) {
    console.log("Redis Auth Error : "+error);
});
client.on("error", function (err) {
    console.log("Error " + err);


});
/*client.on("error", function (err) {

});*/


function AddConferenceUser(obj,Company,Tenant,reqId,callback)
{


    if(obj.ObjCategory=='INTERNAL')
    {
        try
        {
            DbConn.SipUACEndpoint.find({where:[{SipUserUuid:obj.SipUserUuid},{CompanyId:Company},{TenantId:Tenant}],include:[{model:DbConn.Extension,as : "Extension"}]}).then(function (resSip) {

                if(resSip)
                {
                    var CUserObj = DbConn.ConferenceUser
                        .build(
                        {
                            ActiveTalker : obj.ActiveTalker,
                            Def : obj.Def,
                            Mute :  obj.Mute,
                            Mod: obj.Mod,
                            ObjClass : "ConfClz",
                            ObjType :"TYP",
                            ObjCategory:obj.ObjCategory,
                            CurrentDef: obj.CurrentDef,
                            CurrentMute: obj.CurrentMute,
                            CurrentMod :obj.CurrentMod,
                            Destination :resSip.Extension.Extension,
                            JoinType :obj.JoinType

                            // AddTime: new Date(2009, 10, 11),
                            //  UpdateTime: new Date(2009, 10, 12),
                            // CSDBCloudEndUserId: jobj.CSDBCloudEndUserId


                        }
                    );
                    CUserObj.save().then(function (resSave) {

                        CUserObj.setSipUACEndpoint(resSip).then(function (resMap) {
                            callback(undefined,resMap);
                        }).catch(function (errMap) {
                            callback(errMap,undefined);
                        });







                    }).catch(function (errSave) {
                        callback(errSave,undefined);
                    });

                }
                else
                {
                    callback(new Error("No sip Record"),undefined);
                }

            }).catch(function (errSip) {
                callback(errSip,undefined);
            });


        }
        catch(ex)
        {
            callback(ex,undefined);
        }
    }
    else
    {
        var CUserObj = DbConn.ConferenceUser
            .build(
            {
                ActiveTalker : obj.ActiveTalker,
                Def : obj.Def,
                Mute :  obj.Mute,
                Mod: obj.Mod,
                ObjClass : "ConfClz",
                ObjType :obj.ObjType,
                ObjCategory:obj.ObjCategory,
                CurrentDef: obj.CurrentDef,
                CurrentMute: obj.CurrentMute,
                CurrentMod :obj.CurrentMod,
                Destination :obj.Destination,
                JoinType :obj.JoinType,
                IsLocked :obj.IsLocked,
                MaxUser: obj.MaxUser

                // AddTime: new Date(2009, 10, 11),
                //  UpdateTime: new Date(2009, 10, 12),
                // CSDBCloudEndUserId: jobj.CSDBCloudEndUserId


            }
        );
        CUserObj.save().then(function (resSave) {

            callback(undefined,resSave);

        }).catch(function (errSave) {

            callback(errSave,undefined);
        });

    }
}


function MapWithRoom(usrId,rmName,Company,Tenant,reqId,callback)
{
    try
    {
        DbConn.Conference.find({where:[{ConferenceName:rmName},{CompanyId:Company},{TenantId:Tenant}]}).then(function (resRoom) {

            if(resRoom)
            {
                try
                {
                    DbConn.ConferenceUser.find({id:usrId}).then(function (resUser) {

                        if(resUser)
                        {
                            resRoom.addConferenceUser(resUser).then(function (resMap) {

                                callback(undefined,resMap);
                            }).catch(function (errMap) {

                                callback(errMap,undefined);
                            });


                        }
                        else
                        {
                            callback(new Error("No conference User"),undefined);
                        }
                    }).catch(function (errUser) {
                        callback(errUser,undefined);
                    });


                }
                catch(ex)
                {
                    callback(ex,undefined);
                }
            }
            else
            {
                callback(new Error("No conference Room"),undefined);
            }

        }).catch(function (errRoom) {
            callback(errRoom,undefined);
        });



    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function DeleteUser(usrId,Company,Tenant,reqId,callback)
{
    try
    {



        DbConn.ConferenceUser.find({where:[{id:usrId}],include:[{model:DbConn.Conference,as : "Conference"}]}).then(function (resConf) {

            if(resConf!=null)
            {
                var x=CkeckTimeValidity(resConf.Conference.StartTime,resConf.Conference.EndTime,reqId);
                if(x)
                {
                    callback(new Error("Cannot delete.room is running"),undefined);
                }
                else
                {
                    DbConn.ConferenceUser.destroy({where:[{id:usrId}]}).then(function(result)
                    {
                        callback(undefined,result);
                    }).error(function(err)
                    {
                        callback(err,undefined);
                    })
                }
            }
            else
            {
                callback(new Error("No User record"),undefined);
            }

        }).catch(function (errConf) {
            callback(errConf,undefined)
        });


    }
    catch(ex)
    {
        callback(ex,undefined);
    }

}

function SetUserFlags(usrId,obj,reqId,callback)
{
    try
    {
        DbConn.ConferenceUser.update(
            {
                Def:obj.Def,
                Mute:obj.Mute,
                Mod:obj.Mod


            },
            {
                where:[{id:usrId}]
            }

        ).then(function(resUsrUpdate){
                callback(undefined,resUsrUpdate);
            }).catch(function(errUsrUpdate)
            {
                callback(errUsrUpdate,undefined);

            });
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function GetUserDetails(usrId,reqId,callback)
{
    try
    {
        DbConn.ConferenceUser.find({where:[{id:usrId}]}).then(function (resUsr) {

            if(resUsr!=null)
            {
                callback(undefined,resUsr);
            }else
            {
                callback(new Error("No user"),undefined);
            }

        }).catch(function (errUsr) {
            callback(errUsr,undefined);
        });

    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function CkeckTimeValidity(StTm,EdTm,reqId)
{
    var x = moment(moment()).isBetween(StTm, EdTm);
    return x;
}

//Sprint 4
function MuteUser(confName,User,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,callback);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" mute ?"+User;
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}

function UnMuteUser(confName,User,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,callback);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" unmute ?"+User;
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}

function MuteAllUsers(confName,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,callback);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" mute ?all";
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}

function UnMuteAllUsers(confName,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,callback);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" unmute ?all";
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}

function DeafUser(confName,User,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,callback);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" deaf ?"+User;
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}

function UnDeafUser(confName,User,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,undefined);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" undeaf ?"+User;
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}


function DeafAllUsers(confName,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,undefined);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" deaf ?all";
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}

function UnDeafAllUsers(confName,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,undefined);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" undeaf ?all";
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}


function KickUser(confName,User,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,undefined);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" kick ?"+User;
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })



}

function LockRoom(confName,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,undefined);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" lock";
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })
}

function UnLockRoom(confName,reqId,callback)
{
    GetConferenceID(confName,reqId,function(errConf,resConf)
    {
        if(errConf)
        {
            callback(errConf,undefined);
        }
        else
        {
            GetCallServerID(resConf,reqId,function(errCS,resCS)
            {
                if(errCS)
                {
                    callback(errCS,undefined);
                }
                else
                {
                    GetCallserverIP(resCS,reqId,function(errIP,resIP)
                    {
                        if(errIP)
                        {
                            callback(errIP,undefined);
                        }
                        else
                        {
                            var httpUrl=resIP+':8080/api/conference?'+confName+" unlock";
                            var options = {
                                url: httpUrl
                            };

                            httpReq(options, function (error, response, body)
                            {
                                if (!error && response.statusCode == 200)
                                {
                                    var apiResp = JSON.parse(body);

                                    //logger.debug('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api returned : %s', reqId, body);

                                    callback(apiResp.Exception, apiResp.Result);
                                }
                                else
                                {
                                    //logger.error('[DVP-PBXService.RemoteGetSipUserDetailsForExtension] - [%s] - Sip UAC Api call failed', reqId, error);
                                    callback(error, undefined);
                                }
                            });
                        }
                    });
                }
            })
        }
    })
}


function GetCallServerID(CSName,reqId,callback)
{

        client.HGET(CSName,'SwitchName',function(err,res)
        {
            callback(err,res);
        });
   

}

function GetConferenceID(confName,reqId,undefined)
{

    client.get(confName,function(errCID,resCID)
    {
        callback(errCID,resCID);
    })

}

function GetCallserverIP(CSID,reqId,callback)
{
    DbConn.CallServer.find({where:[{id:CSID}]}).then(function(resIP)
    {
        callback(undefined,resIP);

    }).catch(function(errIP)
    {
        callback(errIP,undefined);
    });
}

function GetUserConference(User,Company,Tenant,reqId,callback)
{
    DbConn.ConferenceUser.find({include:[{model:DbConn.SipUACEndpoint,as : "SipUACEndpoint" ,where:[{SipUsername:User},{CompanyId:Company},{TenantId:Tenant}]}]}).then(function(resUser)
    {
        if(resUser)
        {
            callback(undefined,resUser.ConferenceId);
        }
        else
        {
            DbConn.ConferenceUser.find({where:[{Destination:User}]}).then(function (resExternalUser) {

                callback(undefined,resExternalUser.ConferenceId);

            }).catch(function (errExternalUser) {

                callback(errExternalUser,undefined);
            });
        }
        console.log(JSON.stringify(resUser));

    }).catch(function(errUser)
    {
        callback(errUser,undefined);
    });
}

/////////////////////////////////////////////////

function addUserToRoom(usrId,rmName,Company,Tenant,reqId,callback)
{
    try
    {
        DbConn.Conference.find({where:[{ConferenceName:rmName},{CompanyId:Company},{TenantId:Tenant}]}).then(function (resRoom) {

            if(resRoom)
            {
                try
                {
                    DbConn.ConferenceUser.find({SipUACEndpointId:usrId}).then(function (resUser) {

                        if(resUser)
                        {
                            resRoom.addConferenceUser(resUser).then(function (resMap) {

                                callback(undefined,resMap);
                            }).catch(function (errMap) {

                                callback(errMap,undefined);
                            });


                        }
                        else
                        {
                            //callback(new Error("No conference User"),undefined);

                            DbConn.SipUACEndpoint.find({id:usrId}).then(function (resSip) {

                                var CUserObj = DbConn.ConferenceUser
                                    .build(
                                    {
                                        ActiveTalker : false,
                                        Def : false,
                                        Mute :  false,
                                        Mod: false,
                                        ObjClass : "ConfClz",
                                        ObjType :"TYP",
                                        ObjCategory:"INTERNAL",
                                        CurrentDef: false,
                                        CurrentMute: false,
                                        CurrentMod :false,
                                        Destination :"",
                                        JoinType :""



                                    }
                                );
                                CUserObj.save().then(function (resSave) {

                                    CUserObj.setSipUACEndpoint(resSip).then(function (resMap) {
                                        //callback(undefined,resMap);
                                        resRoom.addConferenceUser(resMap).then(function (resCuser) {
                                            callback(undefined,resCuser);
                                        }).catch(function (errRuser) {
                                            callback(errRuser,undefined);
                                        })
                                    }).catch(function (errMap) {
                                        callback(errMap,undefined);
                                    });


                                }).catch(function (errSave) {
                                    callback(errSave,undefined);
                                });

                            }).catch(function (errSip) {

                            });

                        }
                    }).catch(function (errUser) {
                        callback(errUser,undefined);
                    });


                }
                catch(ex)
                {
                    callback(ex,undefined);
                }
            }
            else
            {
                callback(new Error("No conference Room"),undefined);
            }

        }).catch(function (errRoom) {
            callback(errRoom,undefined);
        });



    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function mapUserWithRoom(confName,confObj,Company,Tenant,reqId,callback)
{
    try
    {
        DbConn.Conference.find({where:[{ConferenceName:confName},{CompanyId:Company},{TenantId:Tenant}]}).then(function (resRoom) {

            if(resRoom)
            {
                try
                {


                    var CUserObj = DbConn.ConferenceUser
                        .build(
                        {
                            ActiveTalker : confObj.ActiveTalker,
                            Def : confObj.Def,
                            Mute :  confObj.Mute,
                            Mod: confObj.Mod,
                            ObjClass : confObj.ObjClass,
                            ObjType :confObj.ObjType,
                            ObjCategory:confObj.ObjCategory,
                            CurrentDef: confObj.CurrentDef,
                            CurrentMute: confObj.CurrentMute,
                            CurrentMod :confObj.CurrentMod,
                            Destination :confObj.Destination,
                            JoinType :confObj.JoinType,
                            UserStatus:confObj.UserStatus



                        }
                    );
                    CUserObj.save().then(function (resSave) {

                        if(confObj.SipUACEndpointId)
                        {
                            DbConn.SipUACEndpoint.find({where:[{id:confObj.SipUACEndpoint}]}).then(function (resSip) {

                                CUserObj.setSipUACEndpoint(resSip).then(function (resMap) {
                                    //callback(undefined,resMap);
                                    resRoom.addConferenceUser(resMap).then(function (resCuser) {
                                        callback(undefined,resCuser);
                                    }).catch(function (errCuser) {
                                        callback(errCuser,undefined);
                                    })
                                }).catch(function (errMap) {
                                    callback(errMap,undefined);
                                });

                            }).catch(function (errSip) {

                            });
                        }
                        else
                        {
                            resRoom.addConferenceUser(CUserObj).then(function (resExtUser) {

                                callback(undefined,resExtUser);
                            }).catch(function (errExtUser) {
                                callback(errExtUser,undefined);
                            });
                        }



                    }).catch(function (errSave) {
                        callback(errSave,undefined);
                    });


                }
                catch(ex)
                {
                    callback(ex,undefined);
                }
            }
            else
            {
                callback(new Error("No conference Room"),undefined);
            }

        }).catch(function (errRoom) {
            callback(errRoom,undefined);
        });



    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function updateUser(usrId,confObj,reqId,callback)
{
    try
    {
        DbConn.ConferenceUser.updateAttributes(
            {
                ActiveTalker : confObj.ActiveTalker,
                Def : confObj.Def,
                Mute :  confObj.Mute,
                Mod: confObj.Mod,
                ObjClass : confObj.ObjClass,
                ObjType :confObj.ObjType,
                ObjCategory:confObj.ObjCategory,
                CurrentDef: confObj.CurrentDef,
                CurrentMute: confObj.CurrentMute,
                CurrentMod :confObj.CurrentMod,
                Destination :confObj.Destination,
                JoinType :confObj.JoinType,
                UserStatus:confObj.UserStatus


            },
            {
                where:[{id:usrId}]
            }

        ).then(function(resUsrUpdate){
                callback(undefined,resUsrUpdate);
            }).catch(function(errUsrUpdate)
            {
                callback(errUsrUpdate,undefined);

            });
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function usersOfConference(confName,Company,Tenant,reqId,callback)
{
    try
    {
        DbConn.ConferenceUser.find({include:[{model: DbConn.Conference,  as: "Conference", where:[{ConferenceName:confName},{CompanyId:Company},{TenantId:Tenant}]}]})

            .then(function (resConfID) {

                callback(undefined,resConfID);

            }).catch(function (errConfID) {

                callback(errConfID,undefined);
            });
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}



module.exports.AddConferenceUser = AddConferenceUser;
module.exports.MapWithRoom = MapWithRoom;
module.exports.DeleteUser = DeleteUser;
module.exports.SetUserFlags = SetUserFlags;
module.exports.GetUserDetails = GetUserDetails;


module.exports.MuteUser = MuteUser;
module.exports.UnMuteUser = UnMuteUser;
module.exports.MuteAllUsers = MuteAllUsers;
module.exports.UnMuteAllUsers = UnMuteAllUsers;
module.exports.DeafUser = DeafUser;
module.exports.UnDeafUser = UnDeafUser;
module.exports.DeafAllUsers = DeafAllUsers;
module.exports.UnDeafAllUsers = UnDeafAllUsers;
module.exports.KickUser = KickUser;
module.exports.LockRoom = LockRoom;
module.exports.UnLockRoom = UnLockRoom;
module.exports.GetUserConference = GetUserConference;



module.exports.addUserToRoom = addUserToRoom;
module.exports.mapUserWithRoom = mapUserWithRoom;
module.exports.updateUser = updateUser;
module.exports.usersOfConference = usersOfConference;





