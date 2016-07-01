/**
 * Created by Pawan on 6/10/2015.
 */
var DbConn = require('dvp-dbmodels');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var moment=require('moment');


function AddConferenceRoom(obj,Company,Tenant,reqId,callback){

    try
    {
        DbConn.Extension.find({where:[{Extension:obj.Extension} ,{CompanyId:Company},{TenantId:Tenant}]}).then(function (resExt) {

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
                        MaxUser: obj.MaxUser,
                        ActiveTemplate:obj.ActiveTemplate




                    }
                );
                ConfObj.save().then(function (resSave) {


                    ConfObj.setExtension(resExt).then(function (resMap) {

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

                callback(new Error("Empty returns for Extension"),undefined);
            }

        }).catch(function (errExt) {
            callback(errExt,undefined);
        });

    }
    catch(ex)
    {
        logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Invalid object received at the start : SaveUser %s',reqId,JSON.stringify(obj),ex);
        callback(ex,undefined);
    }
}

function UpdateConference(CName,obj,Company,Tenant,reqId,callback)
{
    try
    {
        var dt=new Date();
        var xx=new Date(dt.valueOf() + dt.getTimezoneOffset() * 60000);
        console.log(xx);
        var conditionalData = {
            StartTime: {
                lt: xx
            },
            EndTime:
            {
                gt: xx
            },
            ConferenceName:CName,
            CompanyId :  Company,
            TenantId: Tenant


        };
        DbConn.Conference.find({where:conditionalData}).then(function(resCnf)
        {
            if(!resCnf)
            {
                DbConn.Conference.update(
                    {
                        Pin:obj.Pin,
                        AllowAnonymousUser:obj.AllowAnonymousUser,
                        Domain:obj.Domain,
                        IsLocked:obj.IsLocked,
                        MaxUser:obj.MaxUser,
                        StartTime: obj.StartTime,
                        EndTime: obj.EndTime

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

        }).catch(function(errCnf)
        {
            callback(errCnf,undefined);
        });


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
        var dt=new Date();
        var xx=new Date(dt.valueOf() + dt.getTimezoneOffset() * 60000);
        console.log(xx);
        var conditionalData = {
            StartTime: {
                lt: xx
            },
            EndTime:
            {
                gt:xx
            },
            ConferenceName:CName
        };
        DbConn.Conference.findAll({where:conditionalData}).then(function (resCnf) {

            if(resCnf.length==0)
            {
                DbConn.Conference.destroy({where:[{ConferenceName:CName}]}).then(function (resDel) {

                    callback(undefined,resDel);

                }).catch(function (errDel) {
                    callback(errDel,undefined);
                });


            }
            else
            {
                callback(new Error("Running Conference"),undefined);
            }

        }).catch(function (errCnf) {
            callback(errCnf,undefined);
        });







    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function UpdateStartEndTimes(CName,obj,Company,Tenant,reqId,callback)
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
            ConferenceName:CName,
            CompanyId :  Company,
            TenantId: Tenant
        };
        DbConn.Conference.find({where:conditionalData}).then(function (resCnf) {

            if(!resCnf)
            {
                DbConn.Conference.updateAttributes(
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
                callback(new Error("Conference is already running"),undefined);
            }

        }).catch(function (errCnf) {
            callback(errCnf,undefined);
        });


    }
    catch(ex)
    {
        callback(ex,undefined);
    }



}

function GetConferenceRoomsOfCompany(Company,Tenant,reqId,callback)
{
    try
    {
        DbConn.Conference.findAll([{CompanyId:Company},{TenantId:Tenant}]).then(function(resConf)
        {
            if(resConf.length>0)
            {
                callback(undefined,resConf);
            }
            else
            {
                callback(new Error("No conference room found"),undefined);
            }


        }).catch(function(errConf)
        {
            callback(errConf,undefined);
        });


    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function GetRoomDetails(CID,Company,Tenant,reqId,callback)
{

    try
    {
        DbConn.Conference.find({where:[{ConferenceName:CID},{CompanyId:Company},{TenantId:Tenant}],include:[{model:DbConn.ConferenceUser,as : "ConferenceUser"}]}).then(function (res) {

            if(res)
            {
                callback(undefined,res);
            } else
            {
                callback(new Error("No Conference room found"),undefined);
            }


        }).catch(function (err) {
            callback(err,undefined);
        });


    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function MapWithCloudEndUser(CfName,CldId,Company,Tenant,reqId,callback)
{
    try {
        DbConn.Conference.find({where: [{ConferenceName: CfName},{CompanyId:Company},{TenantId:Tenant}]}).then(function(resCf)
        {
            if (resCf != null) {
                DbConn.CloudEndUser.find({where:[{id:CldId},{CompanyId:Company},{TenantId:Tenant}]}).then(function (resCld) {

                    if(resCld!=null)
                    {
                        resCld.addConference(resCf).then(function (resMap) {

                            callback(undefined,resMap);
                        }).catch(function (errMap) {

                            callback(errMap,undefined);
                        });


                    }
                    else
                    {
                        callback(new Error("No cloud end user"),undefined);
                    }

                }).catch(function (errCld) {
                    callback(errCld,undefined);
                });



            }
            else {
                callback(new Error("No conference"),undefined);
            }
        }).catch(function(errCf)
        {
            callback(errCf,undefined);
        });




    }
    catch(ex)
    {
        callback(ex,undefined);
    }
}

function CheckTimeValidity(CName,reqId,callback)
{
    DbConn.Conference.find({where:[{ConferenceName:CName}]}).then(function (resConf) {

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

    }).catch(function (errConf) {
        callback(false);
    });

}

var AssignTemplateToConferenceDB = function(reqId, conferenceName, templateName, companyId, tenantId, callback)
{
    try
    {
        DbConn.Conference.find({where: [{ConferenceName: conferenceName},{CompanyId: companyId},{TenantId: tenantId}]})
            .then(function (conf)
            {
                if(conf)
                {

                    DbConn.ConferenceTemplate.find({where: [{TemplateName: templateName}]})
                        .then(function (template)
                        {
                            if(template)
                            {

                                conf.setConferenceTemplate(template).then(function (result)
                                {
                                    logger.debug('[DVP-Conference.AssignTemplateToConferenceDB] - [%s] - Template Added to Conference', reqId);
                                    callback(undefined, true);

                                }).catch(function(err)
                                {
                                    callback(err, false);
                                });
                            }
                            else
                            {
                                callback(new Error('Template not found'), false);
                            }
                        }).catch(function(err)
                        {
                            callback(err, false);
                        });
                }
                else
                {
                    callback(new Error('Conference not found'), false);
                }
            }).catch(function(err)
            {
                callback(err, false);
            });
    }
    catch(ex)
    {
        callback(ex, false);
    }
};

var GetTemplatesByGroup = function(reqId, groupId, callback)
{
    var emptyArr = [];
    try
    {
        DbConn.ConferenceTemplate.findAll({where: [{TemplateGroup: groupId}]})
            .then(function (templates)
            {
                callback(undefined, templates);

            }).catch(function(err)
            {
                callback(err, emptyArr);
            });
    }
    catch(ex)
    {
        callback(ex, emptyArr);
    }

};

var GetTemplates = function(reqId, callback)
{
    var emptyArr = [];
    try
    {
        DbConn.ConferenceTemplate.findAll()
            .then(function (templates)
            {
                callback(undefined, templates);

            }).catch(function(err)
            {
                callback(err, emptyArr);
            });
    }
    catch(ex)
    {
        callback(ex, emptyArr);
    }

};


module.exports.AddConferenceRoom = AddConferenceRoom;
module.exports.UpdateConference = UpdateConference;
module.exports.DeleteConference = DeleteConference;
module.exports.UpdateStartEndTimes = UpdateStartEndTimes;
module.exports.GetConferenceRoomsOfCompany = GetConferenceRoomsOfCompany;
module.exports.GetRoomDetails = GetRoomDetails;
module.exports.MapWithCloudEndUser = MapWithCloudEndUser;
module.exports.AssignTemplateToConferenceDB = AssignTemplateToConferenceDB;
module.exports.GetTemplatesByGroup = GetTemplatesByGroup;
module.exports.GetTemplates = GetTemplates;
