/**
 * Created by Pawan on 6/10/2015.
 */
var DbConn = require('DVP-DBModels');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var moment=require('moment');


function AddConferenceRoom(obj,reqId,callback){

    try
    {
        DbConn.Extension.find({where:[{Extension:obj.Extension} ,{CompanyId:obj.CompanyId},{TenantId:obj.TenantId}]}).complete(function(err,resExt)
        {
            if(err)
            {
                logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Error in searching Extension %s',reqId,JSON.stringify(obj),ex);
                callback(err,undefined);
            }
            else
            {
                if(resExt!=null)
                {
                    logger.debug('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Found Extension %s',reqId,JSON.stringify(resExt));

                    var ConfObj = DbConn.Conference
                        .build(
                        {
                            ConferenceName : obj.ConferenceName,
                            Description : obj.Description,
                            CompanyId :  obj.CompanyId,
                            TenantId: obj.TenantId,
                            ObjClass : "ConfClz",
                            ObjType :"ConfTyp",
                            ObjCategory:"ConfCat",
                            Pin: obj.Pin,
                            AllowAnonymousUser: obj.AllowAnonymousUser,
                            StartTime :obj.StartTime,
                            EndTime :obj.EndTime,
                            Domain :obj.Domain,
                            IsLocked :obj.IsLocked,
                            MaxUser: obj.MaxUser

                            // AddTime: new Date(2009, 10, 11),
                            //  UpdateTime: new Date(2009, 10, 12),
                            // CSDBCloudEndUserId: jobj.CSDBCloudEndUserId


                        }
                    );
                    ConfObj.save().complete(function (errSave) {

                        if(errSave)
                        {
                            callback(errSave,undefined);
                        }
                        else
                        {
                            ConfObj.setExtension(resExt).complete(function(errMap,ResMap)
                            {
                                callback(errMap,ResMap);
                            });
                        }

                    });


                }
                else
                {
                    logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Empty returns in searching Extension %s',reqId,JSON.stringify(obj),ex);
                    callback(new Error("Empty returns for Extension"),undefined);
                }
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Invalid object received at the start : SaveUACRec %s',reqId,JSON.stringify(obj),ex);
        callback(ex,undefined);
    }
}

function UpdateConference(CName,obj,reqId,callback)
{
    try
    {
        DbConn.Conference.find({where:[{ConferenceName:CName}]}).complete(function (errConf,resConf) {

            if(errConf)
            {
                callback(errConf,undefined);
            }
            else
            {
                if(resConf!=null)
                {
                    var x = moment(moment()).isBetween(resConf.StartTime, resConf.EndTime);
                    if(x)
                    {
                        callback(new Error("Conference is running"),undefined);
                    }
                    else
                    {
                        /*
                        UpdateConf(CName,obj,reqId,function(errUp,resup)
                        {
                           if(errUp)
                           {
                               callback(errUp,undefined);
                           }
                            else
                           {
                               callback(undefined,resup);
                           }
                        });
                        */

                    }
                }
                else
                {
                    callback(new Error("No record found"),undefined);
                }
            }
        });

        if(CheckValidity(CName,reqId))
        {
            DbConn.Conference.update(
                {
                    Pin:obj.Pin,
                    AllowAnonymousUser:obj.AllowAnonymousUser,
                    StartTime:obj.StartTime,
                    EndTime:obj.EndTime,
                    Domain:obj.Domain,
                    IsLocked:obj.IsLocked,
                    MaxUser:obj.MaxUser

                },
                {
                    where:[{ConferenceName:CName}]
                }

            ).then(function(resCUpdate){
                    callback(undefined,resCUpdate);
                }).error(function(errCUpdate)
                {
                    callback(errCUpdate,undefined);
                });
        }
        else
        {
            callback(new Error("Updation Error"),undefined);
        }
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function DeleteConference(CName,reqId,callback)
{
    try
    {
        if(CheckValidity(CName,reqId))
        {
            callback(new Error("Deletion Failed"),undefined);
        }
        else
        {
            DbConn.Conference.destroy({ConferenceName:CName}).then(function(result)
            {
                callback(undefined,result);
            }).error(function(err)
            {
                callback(err,undefined);
            })
        }
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function UpdateStartEndTimes(CName,obj,reqId,callback)
{
    try
    {
       if(CheckValidity(CName,reqId))
       {
           callback(new Error("Updation Error"),undefined);
       }
        else
       {
           DbConn.Conference.update(
               {
                   StartTime:obj.StartTime,
                   EndTime:obj.EndTime


               },
               {
                   where:[{ConferenceName:CName}]
               }

           ).then(function(resCUpdate){
                   callback(undefined,resCUpdate);
               }).error(function(errCUpdate)
               {
                   callback(errCUpdate,undefined);
               });
       }
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function GetConferenceRoomsOfCompany(CID,reqId,callback)
{
    try
    {
        DbConn.Conference.findAll({CompanyId:CID}).complete(function(errConf,resConf)
        {
            callback(errConf,resConf);

        });
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function GetRoomDetails(CID,reqId,callback)
{
    try
    {
        DbConn.Conference.findAll({where:[{ConferenceName:CID}],include:[{model:DbConn.ConferenceUsers,as : "ConferenceUsers"}]}).complete(function(err,res)
        {
            callback(err,res);
        })
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function CheckValidity(CName,reqId)
{
    DbConn.Conference.find({where:[{ConferenceName:CName}]}).complete(function (errConf,resConf) {

        if(errConf)
        {
            return false;
        }
        else
        {
            if(resConf!=null)
            {
                var x = moment(moment()).isBetween(resConf.StartTime, resConf.EndTime);
                return x
            }
            else
            {
                return false;
            }
        }
    });
}


module.exports.AddConferenceRoom = AddConferenceRoom;
module.exports.UpdateConference = UpdateConference;
module.exports.DeleteConference = DeleteConference;
module.exports.UpdateStartEndTimes = UpdateStartEndTimes;
module.exports.GetConferenceRoomsOfCompany = GetConferenceRoomsOfCompany;
module.exports.GetRoomDetails = GetRoomDetails;