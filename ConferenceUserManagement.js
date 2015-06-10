/**
 * Created by Pawan on 6/10/2015.
 */

var DbConn = require('DVP-DBModels');
var messageFormatter = require('DVP-Common/CommonMessageGenerator/ClientMessageJsonFormatter.js');
var logger = require('DVP-Common/LogHandler/CommonLogHandler.js').logger;


function AddConferenceUser(obj,reqId,callback)
{
    if(obj.ObjCategory=='Internal')
    {
        try
        {
          DbConn.SipUACEndpoint.find({where:[{SipUserUuid:obj.SipUserUuid},{CompanyId:obj.CompanyId},{TenantId:obj.TenantId}]}).complete(errSip,resSip)
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
                                ObjType :"ConfTyp",
                                ObjCategory:"ConfCat",
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
            }
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
                ObjType :"ConfTyp",
                ObjCategory:"ConfCat",
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