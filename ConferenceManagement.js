/**
 * Created by Pawan on 6/10/2015.
 */
var DbConn = require('dvp-dbmodels');
var messageFormatter = require('dvp-common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('dvp-common/LogHandler/CommonLogHandler.js').logger;
var moment=require('moment');
var underscore=require('underscore');


function AddConferenceRoom(obj,Company,Tenant,reqId,callback){

    try
    {
        if(obj.Extension)
        {
            DbConn.Extension.find({where:[{Extension:obj.Extension} ,{CompanyId:Company},{TenantId:Tenant}]}).then(function (resExt) {

                if(resExt)
                {
                    //logger.debug('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Found Extension %s',reqId,JSON.stringify(resExt));

                    if(resExt.ObjCategory=="CONFERENCE")
                    {
                        DbConn.Conference.find({where:[{CompanyId:Company},{TenantId:Tenant},{ExtensionId:resExt.id}]}).then(function (resConfExt) {
                            if(resConfExt)
                            {
                                logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Extension is already in use',reqId);
                                callback(new Error("Extension is already in use"),undefined);
                            }
                            else
                            {
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
                                        ActiveTemplate:obj.ActiveTemplate,
                                        CloudEndUserId:obj.CloudEndUserId




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

                        }).catch(function (errConfExt) {
                            logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Error in searching Conference Extension data : Extension : %s',reqId,obj.Extension);
                            callback(errConfExt,undefined);
                        })
                    }
                    else
                    {
                        logger.error('[DVP-Conference.NewConference] - [%s] - [PGSQL] - Invalid Extension received : Extension : %s',reqId,obj.Extension);
                        callback(new Error("Invalid Extension received : Extension : ",obj.Extension),undefined);
                    }



                }
                else
                {

                    callback(new Error("Empty returns for Extension"),undefined);
                }

            }).catch(function (errExt) {
                callback(errExt,undefined);
            });
        }
        else
        {
            callback(new Error("No extension record found"),undefined);
        }


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
                var updateObject=
                {
                    Pin:obj.Pin,
                    AllowAnonymousUser:obj.AllowAnonymousUser,
                    Domain:obj.Domain,
                    IsLocked:obj.IsLocked,
                    MaxUser:obj.MaxUser,
                    StartTime: obj.StartTime,
                    EndTime: obj.EndTime,
                    ActiveTemplate:obj.ActiveTemplate,
                    CloudEndUserId:obj.CloudEndUserId

                }


                var validExtensionID=validateExtension(CName,obj.Extension,Company,Tenant);

                if(validExtensionID)
                {
                    updateObject.ExtensionId=validExtensionID;
                }


                DbConn.Conference.find({where:[{CompanyId :  Company},{TenantId: Tenant},{ConferenceName:CName}]}).then(function (resConf) {

                    if(resConf)
                    {
                        resConf.updateAttributes(updateObject).then(function(resCUpdate)
                        {
                            callback(undefined,resCUpdate);

                        }).catch(function(errCUpdate)
                        {
                            callback(errCUpdate,undefined);
                        });
                    }
                    else
                    {
                        callback(new Error("Error in searching conference"),undefined);
                    }

                }).catch(function (errConf) {
                    callback(errConf,undefined);
                })


            }
            else
            {
                callback(new Error("Invalid or Running Conference, Cannot update"),undefined);
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

function DeleteConference(CName,Company,Tenant,reqId,callback)
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
            ConferenceName:CName,
            CompanyId:Company,
            TenantId:Tenant

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
        DbConn.Conference.findAll({where:[{CompanyId:Company},{TenantId:Tenant}]}).then(function(resConf)
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

function GetConferenceRoomsOfCompanyWithPaging(Company,Tenant,rowCount,pageNo,reqId,callback)
{
    try
    {
        DbConn.Conference.findAll({where:[{CompanyId:Company},{TenantId:Tenant}], offset:((pageNo - 1) * rowCount),
            limit: rowCount}).then(function(resConf)
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

function GetCountOfConferenceRooms(Company,Tenant,reqId,callback)
{
    try
    {
        DbConn.Conference.count({where:[{CompanyId:Company},{TenantId:Tenant}]}).then(function(resConf)
        {
            if(resConf)
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

function GetActiveConferenceRooms(Company,Tenant,reqId,callback)
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
            CompanyId :  Company,
            TenantId: Tenant
        };


        DbConn.Conference.findAll(conditionalData).then(function(resConf)
        {
            if(resConf)
            {
                callback(undefined,resConf);
            }
            else
            {
                callback(new Error("No conference Active room found"),undefined);
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

function GetActiveConferenceRoomCount(Company,Tenant,reqId,callback)
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
            CompanyId :  Company,
            TenantId: Tenant
        };


        DbConn.Conference.count(conditionalData).then(function(resConf)
        {
            if(resConf)
            {
                callback(undefined,resConf);
            }
            else
            {
                callback(new Error("No conference Active room found"),undefined);
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


var validateExtension = function (conference,extension,company,tenant) {

    DbConn.Extension.find({where:[{Extension:extension} ,{CompanyId:company},{TenantId:tenant}]}).then(function (resExt) {

        if(resExt.ObjCategory=="CONFERENCE")
        {
            DbConn.Conference.find({where:[{CompanyId:company},{TenantId:tenant},{ExtensionId:resExt.id}]}).then(function (resConf) {

                if(!resConf)
                {
                    return resExt.id;
                }
                else if(resConf.ConferenceName==conference)
                {
                    return resExt.id;
                }
                else
                {
                    return false;
                }

            }).catch(function (errConf) {
                return false;
            });
        }

    }).catch(function (errExt) {
        return false;
    });

}


var PickValidExtensions = function (conference,company,tenant,callback) {

    var AllExtensions=[];
    var usedExtensions=[];
    var EligibleList = [];

    DbConn.Extension.findAll({where:[{CompanyId: company}, {TenantId: tenant}, {ObjCategory: "CONFERENCE"}]}).then(function (resExtensions) {

        AllExtensions=resExtensions;

        DbConn.Conference.findAll({where:[{CompanyId:company},{TenantId:tenant}],include : [{model: DbConn.Extension, as: 'Extension'}]}).then(function (resConfExt) {

            for(var i=0;i<resConfExt.length;i++)
            {
                usedExtensions.push(resConfExt[i].Extension);

                if(i==resConfExt.length-1)
                {
                    EligibleList=getValidExtensionList(AllExtensions,usedExtensions);
                    //callback(undefined,EligibleList);
                    if(conference)
                    {
                        DbConn.Conference.find({where:[{CompanyId:company},{TenantId:tenant},{ConferenceName:conference}],include : [{model: DbConn.Extension, as: 'Extension'}]}).then(function (resCurrentConf) {

                            if(resCurrentConf)
                            {
                                EligibleList.push(resCurrentConf.Extension);
                                callback(undefined,EligibleList);
                            }
                            else
                            {
                                callback(undefined,EligibleList);
                            }
                        }).catch(function (errCurrentConf) {
                            callback(errCurrentConf,undefined);
                        });

                    }
                    else
                    {
                        callback(undefined,EligibleList);
                    }


                }
            }



        }).catch(function (errConfExt) {
            callback(errConfExt,undefined);
        });

    }).catch(function (errExtensions) {
        callback(errExtensions,undefined);
    });

};


var getValidExtensionList = function (allList,selectedList) {

    var eligibleList =[];
    var len = allList.length;
    var j = 0;
    for(var i=0;i<len;i++)
    {
        var even = underscore.find(selectedList, function(ext)
        {
            return ext.Extension === allList[j].Extension;
        });

        if(even)
        {
            allList.splice(j, 1);

        }
        else
        {
            j++;
        }
    }

    return allList;

}

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
module.exports.GetConferenceRoomsOfCompanyWithPaging = GetConferenceRoomsOfCompanyWithPaging;
module.exports.GetCountOfConferenceRooms = GetCountOfConferenceRooms;
module.exports.GetActiveConferenceRooms = GetActiveConferenceRooms;
module.exports.GetActiveConferenceRoomCount = GetActiveConferenceRoomCount;
module.exports.validateExtension = validateExtension;
module.exports.getValidExtensionList = getValidExtensionList;
module.exports.PickValidExtensions = PickValidExtensions;

