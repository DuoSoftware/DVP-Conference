/**
 * Created by Pawan on 6/10/2015.
 */

var DbConn = require('DVP-DBModels');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var moment=require('moment');


function AddConferenceUser(obj,reqId,callback)
{
    if(obj.ObjCategory=='Internal')
    {
        try
        {
            DbConn.SipUACEndpoint.find({where:[{SipUserUuid:obj.SipUserUuid},{CompanyId:obj.CompanyId},{TenantId:obj.TenantId}]}).complete(function(errSip,resSip)
            {
                if(errSip)
                {
                    callback(errSip,undefined);
                }
                else
                {
                    if(resSip!=null)
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
                if(resRoom!=null)
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
                                if(resUser!=null)
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
            }).error(function(errUsrUpdate)
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

module.exports.AddConferenceUser = AddConferenceUser;
module.exports.MapWithRoom = MapWithRoom;
module.exports.DeleteUser = DeleteUser;
module.exports.SetUserFlags = SetUserFlags;
module.exports.GetUserDetails = GetUserDetails;