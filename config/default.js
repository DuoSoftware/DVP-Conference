module.exports = {
  "DB": {
    "Type":"postgres",
    "User":"duo",
    "Password":"DuoS123",
    "Port":5432,
    "Host":"104.236.231.11",
    "Database":"duo"
  },
  "Redis":
  {
    "mode":"sentinel",//instance, cluster, sentinel
    "ip": "45.55.142.207",
    "port": 6389,
    "user": "duo",
    "password": "DuoS123",
    "sentinels":{
      "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
      "port":16389,
      "name":"redis-cluster"
    }

  },


  "Security":
  {

    "ip" : "45.55.142.207",
    "port": 6389,
    "user": "duo",
    "password": "DuoS123",
    "mode":"sentinel",//instance, cluster, sentinel
    "sentinels":{
      "hosts": "138.197.90.92,45.55.205.92,138.197.90.92",
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