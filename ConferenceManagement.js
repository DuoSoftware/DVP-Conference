/**
 * Created by Pawan on 6/10/2015.
 */
var DbConn = require('DVP-DBModels');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;
var moment=require('moment');


function AddConferenceRoom(obj,Company,Tenant,reqId,callback){

    try
    {
        DbConn.Extension.find({where:[{Extension:obj.Extension} ,{CompanyId:Company},{TenantId:Tenant}]}).complete(function(err,resExt)
        {
            if(err)
            {
                //logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Error in searching Extension %s',reqId,JSON.stringify(obj),err);
                callback(err,undefined);
            }
            else
            {
                if(resExt)
                {
                    //logger.debug('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Found Extension %s',reqId,JSON.stringify(resExt));

                    var ConfObj = DbConn.Conference
                        .build(
                        {
                            ConferenceName : obj.ConferenceName,
                            Description : obj.Description,
                            CompanyId :  Company,
                            TenantId: Tenant,
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
                    //logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Empty returns in searching Extension %s',reqId,JSON.stringify(obj),ex);
                    callback(new Error("Empty returns for Extension"),undefined);
                }
            }
        });
    }
    catch(ex)
    {
        logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Invalid object received at the start : SaveUser %s',reqId,JSON.stringify(obj),ex);
        callback(ex,undefined);
    }
}

function UpdateConference(CName,obj,reqId,callback)
{
    try
    {
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
            },
            ConferenceName:CName
        };
        DbConn.Conference.findAll({where:conditionalData}).complete(function(errCnf,resCnf)
        {
            if(errCnf)
            {
                callback(errCnf,undefined);
            }
            else
            {
                if(resCnf.length==0)
                {
                    DbConn.Conference.update(
                        {
                            Pin:obj.Pin,
                            AllowAnonymousUser:obj.AllowAnonymousUser,
                            Domain:obj.Domain,
                            IsLocked:obj.IsLocked,
                            MaxUser:obj.MaxUser

                        },
                        {
                            where:[{ConferenceName:CName}]
                        }

                    ).then(function(resCUpdate){
                            callback(undefined,resCUpdate);
                        }).catch(function(errCUpdate)
                        {
                            callback(errCUpdate,undefined);
                        });
                }
                else
                {
                    callback(new Error("Running Conference"),undefined);
                }
            }
        });

        /* CheckTimeValidity(CName,reqId,function(status)
         {
         if(status)
         {
         DbConn.Conference.destroy({where:[{ConferenceName:CName}]}).then(function(result)
         {
         callback(undefined,result);
         }).error(function(err)
         {
         callback(err,undefined);
         });
         }
         else
         {
         callback(new Error("Deletion Failed"),undefined);
         }
         });
         */

    }
    catch(ex)
    {
        callback(ex,undefined);
    }

/*
    try
    {
        CheckTimeValidity(CName,reqId,function(status)
        {
            if(status)
            {
                DbConn.Conference.update(
                    {
                        Pin:obj.Pin,
                        AllowAnonymousUser:obj.AllowAnonymousUser,
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
        });

    }
    catch(ex)
    {
        callback(ex,undefined);
    }
    */
}

function DeleteConference(CName,reqId,callback)
{
    try
    {
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
            },
            ConferenceName:CName
        };
        DbConn.Conference.findAll({where:conditionalData}).complete(function(errCnf,resCnf)
        {
            if(errCnf)
            {
                callback(errCnf,undefined);
            }
            else
            {
                if(resCnf.length==0)
                {
                    DbConn.Conference.destroy({where:[{ConferenceName:CName}]}).complete(function(errDel,resDel)
                    {
                       callback(errDel,resDel);
                    });
                }
                else
                {
                    callback(new Error("Running Conference"),undefined);
                }
            }
        });

       /* CheckTimeValidity(CName,reqId,function(status)
        {
            if(status)
            {
                DbConn.Conference.destroy({where:[{ConferenceName:CName}]}).then(function(result)
                {
                    callback(undefined,result);
                }).error(function(err)
                {
                    callback(err,undefined);
                });
            }
            else
            {
                callback(new Error("Deletion Failed"),undefined);
            }
        });
        */

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
            },
            ConferenceName:CName
        };
        DbConn.Conference.findAll({where:conditionalData}).complete(function(errCnf,resCnf)
        {
            if(errCnf)
            {
                callback(errCnf,undefined);
            }
            else
            {
                if(resCnf.length==0)
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
                        }).catch(function(errCUpdate)
                        {
                            callback(errCUpdate,undefined);
                        });
                }
                else
                {
                    callback(new Error("Running Conference"),undefined);
                }
            }
        });

        /* CheckTimeValidity(CName,reqId,function(status)
         {
         if(status)
         {
         DbConn.Conference.destroy({where:[{ConferenceName:CName}]}).then(function(result)
         {
         callback(undefined,result);
         }).error(function(err)
         {
         callback(err,undefined);
         });
         }
         else
         {
         callback(new Error("Deletion Failed"),undefined);
         }
         });
         */

    }
    catch(ex)
    {
        callback(ex,undefined);
    }


   /*
    try
    {
        CheckTimeValidity(CName,reqId,function(status)
        {
            if(status)
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
            else
            {
                callback(new Error("Updation Error"),undefined);
            }
        });


    }
    catch(ex)
    {
        callback(ex,undefined);
    }
    */
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
        DbConn.Conference.findAll({where:[{ConferenceName:CID}],include:[{model:DbConn.ConferenceUser,as : "ConferenceUser"}]}).complete(function(err,res)
        {
            callback(err,res);
        });
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function MapWithCloudEndUser(CfName,CldId,reqId,callback)
{
    try {
        DbConn.Conference.find({where: [{ConferenceName: CfName},{CompanyId:'1'},{TenantId:'1'}]}).complete(function (errCf, resCf) {
            if (errCf) {
                callback(errCf,undefined);
            }
            else {
                if (resCf != null) {
                    DbConn.CloudEndUser.find({where:[{id:CldId},{CompanyId:'1'},{TenantId:'1'}]}).complete(function (errCld,resCld) {
                        if(errCld)
                        {
                            callback(errCld,undefined);
                        }
                        else
                        {
                            if(resCld!=null)
                            {
                                resCld.addConference(resCf).complete(function (errMap,resMap)
                                {
                                    callback(errMap,resMap);
                                });
                            }
                            else
                            {
                                callback(new Error("No cloud end user"),undefined);
                            }
                        }

                    });
                }
                else {
                    callback(new Error("No conference"),undefined);
                }
            }
        });
    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}



function CheckTimeValidity(CName,reqId,callback)
{
    DbConn.Conference.find({where:[{ConferenceName:CName}]}).complete(function (errConf,resConf) {

        if(errConf)
        {
            console.log(errConf);
            callback(false);
        }
        else
        {
            if(resConf!=null)
            {
                var x = moment(moment()).isBetween(resConf.StartTime, resConf.EndTime);
                if(x)
                {
                    console.log(x);
                    callback(false);
                }
                else
                {
                    callback(true);
                }
            }
            else
            {
                console.log("Empty");
                callback(false);
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
module.exports.MapWithCloudEndUser = MapWithCloudEndUser;