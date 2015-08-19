/**
 * Created by Pawan on 6/10/2015.
 */
var httpReq = require('request');
var util = require('util');
var DbConn = require('DVP-DBModels');
var redis=require('redis');
var config=require('config');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var moment=require('moment');

var port = config.Redis.port || 3000;
var ip = config.Redis.ip;


var client = redis.createClient(port,ip);
client.on("error", function (err) {
    console.log("Error " + err);
});


function AddConferenceUser(obj,Company,Tenant,reqId,callback)
{


    if(obj.ObjCategory=='INTERNAL')
    {
        try
        {
            DbConn.SipUACEndpoint.find({where:[{SipUserUuid:obj.SipUserUuid},{CompanyId:Company},{TenantId:Tenant}]}).complete(function(errSip,resSip)
            {
                if(errSip)
                {
                    callback(errSip,undefined);
                }
                else
                {
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
                                Destination :obj.Destination,
                                JoinType :obj.JoinType

                                // AddTime: new Date(2009, 10, 11),
                                //  UpdateTime: new Date(2009, 10, 12),
                                // CSDBCloudEndUserId: jobj.CSDBCloudEndUserId


                            }
                        );
                        CUserObj.save().complete(function (errSave) {

                            if(errSave)
                            {
                                callback(errSave,undefined);
                            }
                            else
                            {
                                CUserObj.setSipUACEndpoint(resSip).complete(function(errMap,ResMap)
                                {
                                    callback(errMap,ResMap);
                                });
                            }

                        });
                    }
                    else
                    {
                        callback(new Error("No sip Record"),undefined);
                    }
                }
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
        CUserObj.save().complete(function (errSave,resSave) {


            callback(errSave,resSave);


        });
    }
}

function MapWithRoom(usrId,rmName,reqId,callback)
{
    try
    {
        DbConn.Conference.find({where:[{ConferenceName:rmName}]}).complete(function(errRoom,resRoom)
        {
            if(errRoom)
            {
                callback(errRoom,resRoom);
            }
            else
            {
                if(resRoom)
                {
                    try
                    {
                        DbConn.ConferenceUser.find({id:usrId}).complete(function(errUser,resUser)
                        {
                            if(errUser)
                            {
                                callback(errUser,undefined);
                            }
                            else
                            {
                                if(resUser)
                                {
                                    resRoom.addConferenceUser(resUser).complete(function (errMap,resMap)
                                    {
                                        callback(errMap,resMap);
                                    });
                                }
                                else
                                {
                                    callback(new Error("No conference User"),undefined);
                                }
                            }
                        })
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
            }
        })
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function DeleteUser(usrId,reqId,callback)
{
    try
    {



        DbConn.ConferenceUser.find({where:[{id:usrId}],include:[{model:DbConn.Conference,as : "Conference"}]}).complete(function (errConf,resConf) {
            if(errConf)
            {
                callback(errConf,undefined)
            }
            else
            {
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
            }
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
        DbConn.ConferenceUser.find({where:[{id:usrId}]}).complete(function(errUsr,resUsr)
        {
            if(errUsr)
            {
                callback(errUsr,undefined);
            }
            else
            {
                if(resUsr!=null)
                {
                    callback(undefined,resUsr);
                }else
                {
                    callback(new Error("No user"),undefined);
                }
            }
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

function GetConferenceID(confName,reqId,callback)
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

function GetUserConference(User,reqId,callback)
{
    DbConn.ConferenceUser.find({include:[{model:DbConn.SipUACEndpoint,as : "SipUACEndpoint" ,where:[{SipUsername:User}]}]}).then(function(resUser)
    {
        callback(undefined,resUser.ConferenceId);
    }).catch(function(errUser)
    {
        callback(errUser,undefined);
    });
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



