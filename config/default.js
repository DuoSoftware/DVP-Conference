module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"",
    "Password":"",
    "Port":5432,
    "Host":"",
    "Database":""
  },
  "Redis":
  {
    "mode":"sentinel",//instance, cluster, sentinel
    "ip": "",
    "port": 6389,
    "user": "",
    "password": "",
    "sentinels":{
      "hosts": "",
      "port":16389,
      "name":"redis-cluster"
    }

  },


  "Security":
  {

    "ip" : "",
    "port": 6389,
    "user": "",
    "password": "",
    "mode":"sentinel",//instance, cluster, sentinel
    "sentinels":{
      "hosts": "",
      "port":16389,
      "name":"redis-cluster"
    }
  },

  "Host":
  {
    "domain": "localhost",
    "port": 8085,
    "version":"1.0.0.0"
  },

  NS: {
    ip: '127.0.0.1',
    port: 8765,
    version: '1.0.0.0'
  },

  Token: "123"
};
