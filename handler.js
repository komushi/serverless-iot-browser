'use strict';

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();
const iot = new AWS.Iot({apiVersion: '2015-05-28'});

const envId = process.env.ENV_ID;
let iotData;

const countTable = `IotBrowserCount${envId}`;
const outputTable = `IotBrowserOutput${envId}`;
const countAttibute = 'count';
const countTypes = ['browser', 'os', 'device'];
const typeAttribute = 'type';

const taskInitialize = (event, context) => {
  return new Promise((resolve, reject) => {
    const browser = {};
    const os = {};
    const device = {};
    const clientInfo = {
      browser: browser,
      os: os,
      device: device
    };

    event.Records.forEach((record) => {
      if (record.eventName == 'MODIFY') {
        if (record.dynamodb.OldImage && record.dynamodb.NewImage) {
          if (record.dynamodb.OldImage.payload && record.dynamodb.NewImage.payload) {
            if (record.dynamodb.OldImage.payload.M.eventType && record.dynamodb.NewImage.payload.M.eventType) {
              if (record.dynamodb.OldImage.payload.M.eventType.S == 'connected' 
                && record.dynamodb.NewImage.payload.M.eventType.S == 'disconnected') {
                console.log(`browser ${record.dynamodb.OldImage.payload.M.browser.S} minus 1`);
                console.log(`device ${record.dynamodb.OldImage.payload.M.device.S} minus 1`);
                console.log(`os ${record.dynamodb.OldImage.payload.M.os.S} minus 1`);

                const browserKey = record.dynamodb.OldImage.payload.M.browser.S;
                if (browser[browserKey]) {
                  browser[browserKey] -= 1;
                } else {
                  browser[browserKey] = -1;
                }

                const osKey = record.dynamodb.OldImage.payload.M.os.S;
                if (os[osKey]) {
                  os[osKey] -= 1;
                } else {
                  os[osKey] = -1;
                }

                const deviceKey = record.dynamodb.OldImage.payload.M.device.S;
                if (device[deviceKey]) {
                  device[deviceKey] -= 1;
                } else {
                  device[deviceKey] = -1;
                }
              }
            }
          } else {
            if (record.dynamodb.OldImage.eventType && record.dynamodb.NewImage.eventType) {
              if (record.dynamodb.OldImage.eventType.S == 'connected' 
                && record.dynamodb.NewImage.eventType.S == 'disconnected') {
                console.log(`browser ${record.dynamodb.OldImage.browser.S} minus 1`);
                console.log(`device ${record.dynamodb.OldImage.device.S} minus 1`);
                console.log(`os ${record.dynamodb.OldImage.os.S} minus 1`);

                const browserKey = record.dynamodb.OldImage.browser.S;
                if (browser[browserKey]) {
                  browser[browserKey] -= 1;
                } else {
                  browser[browserKey] = -1;
                }

                const osKey = record.dynamodb.OldImage.os.S;
                if (os[osKey]) {
                  os[osKey] -= 1;
                } else {
                  os[osKey] = -1;
                }

                const deviceKey = record.dynamodb.OldImage.device.S;
                if (device[deviceKey]) {
                  device[deviceKey] -= 1;
                } else {
                  device[deviceKey] = -1;
                }
              }
            }
          }
        }
      } else if (record.eventName == 'INSERT') {
        if (!record.dynamodb.OldImage && record.dynamodb.NewImage) {
          if (record.dynamodb.NewImage.payload) {
            if (record.dynamodb.NewImage.payload.M.eventType) {
              if (record.dynamodb.NewImage.payload.M.eventType.S == 'connected') {
                console.log(`browser ${record.dynamodb.NewImage.payload.M.browser.S} plus 1`);
                console.log(`device ${record.dynamodb.NewImage.payload.M.device.S} plus 1`);
                console.log(`os ${record.dynamodb.NewImage.payload.M.os.S} plus 1`);

                const browserKey = record.dynamodb.NewImage.payload.M.browser.S;
                if (browser[browserKey]) {
                  browser[browserKey] += 1;
                } else {
                  browser[browserKey] = 1;
                }

                const osKey = record.dynamodb.NewImage.payload.M.os.S;
                if (os[osKey]) {
                  os[osKey] += 1;
                } else {
                  os[osKey] = 1;
                }

                const deviceKey = record.dynamodb.NewImage.payload.M.device.S;
                if (device[deviceKey]) {
                  device[deviceKey] += 1;
                } else {
                  device[deviceKey] = 1;
                }
              }          
            }
          } else {
            if (record.dynamodb.NewImage.eventType) {
              if (record.dynamodb.NewImage.eventType.S == 'connected') {
                console.log(`browser ${record.dynamodb.NewImage.browser.S} plus 1`);
                console.log(`device ${record.dynamodb.NewImage.device.S} plus 1`);
                console.log(`os ${record.dynamodb.NewImage.os.S} plus 1`);

                const browserKey = record.dynamodb.NewImage.browser.S;
                if (browser[browserKey]) {
                  browser[browserKey] += 1;
                } else {
                  browser[browserKey] = 1;
                }

                const osKey = record.dynamodb.NewImage.os.S;
                if (os[osKey]) {
                  os[osKey] += 1;
                } else {
                  os[osKey] = 1;
                }

                const deviceKey = record.dynamodb.NewImage.device.S;
                if (device[deviceKey]) {
                  device[deviceKey] += 1;
                } else {
                  device[deviceKey] = 1;
                }
              }          
            }
          }
        }
      }
    });

    console.log(`clientInfo:::::::::::: ${JSON.stringify(clientInfo, null, 2)}`);

    const paramsList = [];

    Object.keys(clientInfo).forEach((infoKey) => {
      Object.keys(clientInfo[infoKey]).forEach((key) => {
        if (clientInfo[infoKey][key] != 0) {
          let params = {
            TableName: countTable,
            Key:{
                "type": infoKey,
                "key": key
            },
            UpdateExpression: "ADD #c :val",
            ExpressionAttributeValues: {
              ":val": clientInfo[infoKey][key]
            },
            ExpressionAttributeNames: {
              "#c": countAttibute
            },
            ReturnValues: "UPDATED_NEW"
          };
          
          paramsList.push(params);
        }
      });
    });

    console.log(`paramsList:::::::::::: ${JSON.stringify(paramsList, null, 2)}`);      
    resolve(paramsList);
  });
};


const taskSaveCount = (paramsList) => {
  return new Promise((resolve, reject) => {

    if (paramsList.length > 0) {
      const subSaveCount = (params) => {
        return new Promise((resolve, reject) => {
          docClient.update(params, function(err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      };

      Promise.all(paramsList.map(subSaveCount))
        .then(values => { 
          console.log("Save to count table succeeded:::::", JSON.stringify(values, null, 2));
          resolve(values.length);
        }).catch(reason => { 
          console.error("Unable to save to count table. Error JSON:", JSON.stringify(reason, null, 2));
          reject(reason);
        });
      } else {
        resolve(0);
      }

  });
};

const taskQueryCount = (savedLength) => {
  return new Promise((resolve, reject) => {

    if (savedLength == 0) {
      resolve();
    } else {
      const subQueryCount = (type) => {
        return new Promise((resolve, reject) => {

          const params = {
            TableName: countTable,
            KeyConditionExpression: '#hkey = :hkey',
            // FilterExpression: '#c > :val',
            ExpressionAttributeValues: {
              // ":val": 0,
              ':hkey': type
            },
            ExpressionAttributeNames: {
              // '#c': countAttibute,
              '#hkey': typeAttribute
            }
          };

          // console.log('params!!!!!', params);

          docClient.query(params, function(err, data) {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
      };

      Promise.all(countTypes.map(subQueryCount))
        .then(values => { 
          console.log("QueryItem succeeded:::::", JSON.stringify(values, null, 2));
          resolve(values);
        }).catch(reason => { 
          console.error("Unable to query count. Error JSON:", JSON.stringify(reason, null, 2));
          reject(reason);
        });    
    }
  });
};


const taskParamsOutput = (countResults) => {
  return new Promise((resolve, reject) => {

    if (countResults) {
      let outputParamsList = {
        TableName: outputTable,
        Key:{
            'id': '1'
        },
        UpdateExpression: 'SET',
        ExpressionAttributeValues: {},
        ExpressionAttributeNames: {},
        ReturnValues: "UPDATED_NEW"
      };

      const subOutputParams = (countResult, index) => {
        return new Promise((resolve, reject) => {

          if (countResult.Items.length > 0) {
            console.log(`****countResult.Items.length - 1****: ${countResult.Items.length - 1}` );
            console.log(`****index****: ${index}` );
            if (index < countResults.length - 1) {
              outputParamsList.UpdateExpression += ` #attr${index} = :val${index},`;
            } else {
              outputParamsList.UpdateExpression += ` #attr${index} = :val${index}`;
            }

            outputParamsList['ExpressionAttributeValues'][`:val${index}`] = countResult.Items;
            outputParamsList['ExpressionAttributeNames'][`#attr${index}`] = countResult.Items[0].type;
          }

          resolve();
        });
      };

      Promise.all(countResults.map(subOutputParams))
        .then(() => { 
          console.log("outputParamsList::::::::::::", JSON.stringify(outputParamsList, null, 2));
          resolve(outputParamsList);
        }).catch(reason => { 
          console.error("Unable to prepare outputTable parameters. Error JSON:", JSON.stringify(reason, null, 2));
          reject(reason);
        });
    }


  });
};

const taskUpdateOutput = (params) => {
  return new Promise((resolve, reject) => {

    if (Object.keys(params.ExpressionAttributeNames).length > 0) {
      docClient.update(params, function(err, data) {
        if (err) {
          console.error("Unable to save to output table. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          console.log("Save to output table succeeded:", JSON.stringify(data, null, 2));
          resolve(data);
        }
      });
    } else {
      resolve();
    }

  });
};

const taskGetEndpoint = (outputResult) => {
  return new Promise((resolve, reject) => {

    if (outputResult) {
      iot.describeEndpoint({}, function(err, data) {
        if (err) {
          console.error("Unable to get endpoint. Error JSON:", JSON.stringify(err, null, 2));
          reject(err);
        } else {
          console.log("Get endpoint succeeded:", JSON.stringify(data, null, 2));
          iotData = new AWS.IotData({endpoint: data.endpointAddress});
          resolve(outputResult.Attributes);
        }
      });      
    } else {
      resolve();
    }

  });
};

const taskParamsPublish = (publishPayload) => {
  return new Promise((resolve, reject) => {
    if (publishPayload) {
      const removeZeroPayloadDetail = (payloadDetail) => {
        return payloadDetail.count > 0;
      };

      const subParamsPublish = (key) => {
        return new Promise((resolve, reject) => {
          

          let params = {
            topic: `iotBrowser${envId}/outbound/${key}`,
            payload: JSON.stringify(publishPayload[key].filter(removeZeroPayloadDetail)),
            qos: 1
          };

          resolve(params);
        });
      };

      Promise.all(Object.keys(publishPayload).map(subParamsPublish))
        .then((publishParamsList) => { 
          console.log("publishParamsList::::::::::::", JSON.stringify(publishParamsList, null, 2));
          resolve(publishParamsList);
        }).catch(reason => { 
          console.error("Unable to prepare publish params list. Error JSON:", JSON.stringify(reason, null, 2));
          reject(reason);
        });

    } else {
      resolve();
    }

  });
};

const taskPublish = (paramsList) => {
  return new Promise((resolve, reject) => {

    if (paramsList) {
      const subPublish = (params) => {
        return new Promise((resolve, reject) => {
          iotData.publish(params, function(err, data) {
            if (err) {
              // console.error("Sub Unable to publish. Error JSON:", JSON.stringify(err, null, 2));
              reject(err);
            } else {
              // console.log("Sub Publish succeeded:", JSON.stringify(data, null, 2));
              resolve(data);
            }
          });
        });
      };

      Promise.all(paramsList.map(subPublish))
        .then(values => { 
          console.log("Publish succeeded:", JSON.stringify(values, null, 2));
          resolve(values.length);
        }).catch(reason => { 
          console.error("Unable to publish. Error JSON:", JSON.stringify(reason, null, 2));
          reject(reason);
        });
      } else {
        resolve(0);
      }

  });
};


module.exports.count = (event, context, callback) => {

  console.log(`Received ${event.Records.length} records`);
  console.log('Received event:', JSON.stringify(event.Records, null, 2));

  taskInitialize(event, context)
    .then(taskSaveCount)
    .then(taskQueryCount)
    .then(taskParamsOutput)
    .then(taskUpdateOutput)
    .then(taskGetEndpoint)
    .then(taskParamsPublish)
    .then(taskPublish)
    .then(callback.bind(null, null))
    .catch(callback);
};