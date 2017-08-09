const fs = require('fs');

const handler = (data) => {
  console.log('Received Stack Output', data);
  const obj = JSON.parse(fs.readFileSync('./client/dist/config/config.json', 'utf8'));
  obj.envId = data.EnvironmentID;
  obj.identityPoolId = data.IdentityPoolId;
  obj.region = data.Region;
  const json = JSON.stringify(obj);
  fs.writeFileSync('./client/dist/config/config.json', json, 'utf8');
};

module.exports = { 
	handler 
};